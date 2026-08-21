import {
  STSClient,
  AssumeRoleCommand,
  GetCallerIdentityCommand
} from '@aws-sdk/client-sts';
import type { VerifyAwsRoleRequest, VerifyAwsRoleResponse } from '../types/aws';

/**
 * Server-side AWS Role Verification Service.
 *
 * Implements complete STS verification chain:
 * AgonaUser (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY)
 *    ↓
 * STS AssumeRole (arn:aws:iam::625552167334:role/ModalHubDeploymentRole)
 *    ↓
 * Temporary Credentials
 *    ↓
 * STS GetCallerIdentity
 *    ↓
 * Verify Assumed Identity == ModalHubDeploymentRole
 *    ↓
 * Return safe metadata ONLY (No credentials / secrets)
 */

const ROLE_ARN_REGEX = /^arn:aws:iam::([0-9]{12}):role\/([A-Za-z0-9+=,.@_/-]+)$/;

export async function verifyAwsRoleServer(
  req: VerifyAwsRoleRequest
): Promise<VerifyAwsRoleResponse> {
  const {
    roleArn = 'arn:aws:iam::625552167334:role/ModalHubDeploymentRole',
    region = process.env.AWS_REGION || 'us-east-1',
    externalId,
    accountId
  } = req;

  // 1. Check for Server-side AWS credentials
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey || !accessKeyId.trim() || !secretAccessKey.trim()) {
    console.error('[AWS STS Verification Error]: AWS credentials are not configured in process.env');
    return {
      success: false,
      status: 'failed',
      connected: false,
      errorCode: 'MissingCredentials',
      error: 'AWS credentials are not configured on the server.',
      message: 'AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY is missing from environment variables.'
    };
  }

  // 2. Validate Role ARN presence and format
  if (!roleArn || typeof roleArn !== 'string') {
    return {
      success: false,
      status: 'failed',
      connected: false,
      errorCode: 'InvalidParameter',
      error: 'IAM Role ARN is required and must be a valid string.',
      message: 'Role ARN parameter is missing.'
    };
  }

  const trimmedArn = roleArn.trim();
  const match = trimmedArn.match(ROLE_ARN_REGEX);

  if (!match) {
    return {
      success: false,
      status: 'failed',
      connected: false,
      errorCode: 'InvalidArnFormat',
      error: 'Invalid IAM Role ARN format. Expected format: arn:aws:iam::<12-digit-account-id>:role/<role-name>',
      message: 'The provided Role ARN does not match standard AWS ARN format.'
    };
  }

  const extractedAccountId = match[1];
  const roleName = match[2];

  if (accountId && accountId.trim() && accountId.trim() !== extractedAccountId) {
    return {
      success: false,
      status: 'failed',
      connected: false,
      errorCode: 'AccountIdMismatch',
      error: `Account ID mismatch: Provided '${accountId}' does not match ARN Account ID '${extractedAccountId}'.`,
      message: 'Provided Account ID does not match Role ARN account.'
    };
  }

  // 3. Validate region
  const validRegion = region.trim() || process.env.AWS_REGION || 'us-east-1';

  // =========================================================================
  // STEP 1: VERIFY BASE AWS CREDENTIALS (AgonaUser)
  // =========================================================================
  const baseSts = new STSClient({
    region: validRegion,
    credentials: {
      accessKeyId: accessKeyId.trim(),
      secretAccessKey: secretAccessKey.trim(),
      sessionToken: process.env.AWS_SESSION_TOKEN ? process.env.AWS_SESSION_TOKEN.trim() : undefined
    }
  });

  let baseCallerAccount: string | undefined;
  let baseCallerArn: string | undefined;
  let baseCallerUserId: string | undefined;

  try {
    const baseIdentity = await baseSts.send(new GetCallerIdentityCommand({}));
    baseCallerAccount = baseIdentity.Account;
    baseCallerArn = baseIdentity.Arn;
    baseCallerUserId = baseIdentity.UserId;

    console.log(`[AWS STS Step 1 SUCCESS]: Authenticated as base identity: Account=${baseCallerAccount}, ARN=${baseCallerArn}, UserId=${baseCallerUserId}`);
  } catch (baseErr: any) {
    const errCode = baseErr?.name || baseErr?.Code || 'InvalidCredentials';
    const errMsg = baseErr?.message || 'Failed to authenticate base credentials with AWS STS.';
    const httpStatus = baseErr?.$metadata?.httpStatusCode;

    console.error(`[AWS STS Step 1 FAILED]: Base GetCallerIdentity failed. ErrorCode=${errCode}, HTTPStatus=${httpStatus}, Message=${errMsg}`);

    return {
      success: false,
      status: 'failed',
      connected: false,
      errorCode: errCode,
      error: `AWS Base Credential Authentication Failed (${errCode}): ${errMsg}`,
      message: `The server's AWS credentials could not be authenticated by AWS STS (${errCode}).`
    };
  }

  // Check if base identity is root account
  if (baseCallerArn && baseCallerArn.endsWith(':root')) {
    console.error(`[AWS STS Root Identity Detected]: Base identity is root (${baseCallerArn}). AWS prohibits root accounts from assuming IAM roles.`);
  }

  // =========================================================================
  // STEP 2: VERIFY ASSUMEROLE (ModalHubDeploymentRole)
  // =========================================================================
  const sessionName = 'ModalHubDeploymentSession';
  let assumeResult;

  try {
    const assumeCommand = new AssumeRoleCommand({
      RoleArn: trimmedArn,
      RoleSessionName: sessionName,
      ExternalId: externalId && externalId.trim() ? externalId.trim() : undefined,
      DurationSeconds: 900 // Minimal 15-minute verification duration
    });
    assumeResult = await baseSts.send(assumeCommand);
  } catch (assumeErr: any) {
    // If externalId was provided and resulted in AccessDenied, retry without ExternalId
    if (externalId && (assumeErr?.name === 'AccessDenied' || assumeErr?.message?.includes('AccessDenied') || assumeErr?.message?.includes('not authorized'))) {
      try {
        console.log('[AWS STS Step 2]: Retrying AssumeRole without ExternalId...');
        const retryCommand = new AssumeRoleCommand({
          RoleArn: trimmedArn,
          RoleSessionName: sessionName,
          DurationSeconds: 900
        });
        assumeResult = await baseSts.send(retryCommand);
      } catch (retryErr: any) {
        const errCode = retryErr?.name || retryErr?.Code || 'AccessDenied';
        const errMsg = retryErr?.message || 'Access Denied when assuming role.';
        const httpStatus = retryErr?.$metadata?.httpStatusCode;

        console.error(`[AWS STS Step 2 FAILED]: AssumeRole failed for RoleArn=${trimmedArn}. ErrorCode=${errCode}, HTTPStatus=${httpStatus}, Message=${errMsg}`);

        const diagnosticMessage =
          errMsg.includes('root accounts') || (baseCallerArn && baseCallerArn.endsWith(':root'))
            ? 'AWS root account credentials cannot assume IAM roles. Please configure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY for IAM user AgonaUser (arn:aws:iam::625552167334:user/AgonaUser).'
            : errMsg || 'The configured AWS identity cannot assume the deployment role.';

        return {
          success: false,
          status: 'failed',
          connected: false,
          errorCode: errCode,
          error: `AWS STS AssumeRole Failed (${errCode}): ${errMsg}`,
          message: diagnosticMessage,
          baseCallerIdentity: {
            account: baseCallerAccount,
            arn: baseCallerArn,
            userId: baseCallerUserId
          }
        };
      }
    } else {
      const errCode = assumeErr?.name || assumeErr?.Code || 'AccessDenied';
      const errMsg = assumeErr?.message || 'Access Denied when assuming role.';
      const httpStatus = assumeErr?.$metadata?.httpStatusCode;

      console.error(`[AWS STS Step 2 FAILED]: AssumeRole failed for RoleArn=${trimmedArn}. ErrorCode=${errCode}, HTTPStatus=${httpStatus}, Message=${errMsg}`);

      const diagnosticMessage =
        errMsg.includes('root accounts') || (baseCallerArn && baseCallerArn.endsWith(':root'))
          ? 'AWS root account credentials cannot assume IAM roles. Please configure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY for IAM user AgonaUser (arn:aws:iam::625552167334:user/AgonaUser).'
          : errMsg || 'The configured AWS identity cannot assume the deployment role.';

      return {
        success: false,
        status: 'failed',
        connected: false,
        errorCode: errCode,
        error: `AWS STS AssumeRole Failed (${errCode}): ${errMsg}`,
        message: diagnosticMessage,
        baseCallerIdentity: {
          account: baseCallerAccount,
          arn: baseCallerArn,
          userId: baseCallerUserId
        }
      };
    }
  }

  if (
    !assumeResult.Credentials ||
    !assumeResult.Credentials.AccessKeyId ||
    !assumeResult.Credentials.SecretAccessKey ||
    !assumeResult.Credentials.SessionToken
  ) {
    console.error('[AWS STS Step 2 FAILED]: AssumeRole succeeded but returned incomplete temporary credentials.');
    return {
      success: false,
      status: 'failed',
      connected: false,
      errorCode: 'IncompleteCredentials',
      error: 'AWS STS did not return valid temporary credentials.',
      message: 'The deployment role returned incomplete temporary session credentials.'
    };
  }

  // =========================================================================
  // STEP 3: VERIFY ASSUMED ROLE IDENTITY (GetCallerIdentity on assumed credentials)
  // =========================================================================
  try {
    const verifiedSts = new STSClient({
      region: validRegion,
      credentials: {
        accessKeyId: assumeResult.Credentials.AccessKeyId,
        secretAccessKey: assumeResult.Credentials.SecretAccessKey,
        sessionToken: assumeResult.Credentials.SessionToken
      }
    });

    const assumedIdentity = await verifiedSts.send(new GetCallerIdentityCommand({}));
    const assumedCallerArn = assumedIdentity.Arn || '';
    const assumedCallerAccount = assumedIdentity.Account || '';
    const assumedCallerUserId = assumedIdentity.UserId || '';

    console.log(`[AWS STS Step 3 SUCCESS]: Assumed Role Verified! ARN=${assumedCallerArn}, Account=${assumedCallerAccount}, UserId=${assumedCallerUserId}`);

    // Verify identity string
    const isAssumedRoleVerified =
      assumedCallerArn.includes(`:assumed-role/${roleName}/`) ||
      assumedCallerArn.includes(roleName);

    if (!isAssumedRoleVerified) {
      console.error(`[AWS STS Step 3 FAILED]: Assumed ARN '${assumedCallerArn}' does not match expected role '${roleName}'.`);
      return {
        success: false,
        status: 'failed',
        connected: false,
        errorCode: 'AssumedIdentityMismatch',
        error: `Assumed identity (${assumedCallerArn}) does not match role name (${roleName}).`,
        message: 'The assumed session identity did not match the requested deployment role.'
      };
    }

    // =========================================================================
    // STEP 6: RETURN ONLY SAFE METADATA
    // =========================================================================
    return {
      success: true,
      status: 'connected',
      connected: true,
      accountId: assumedCallerAccount || extractedAccountId || '625552167334',
      role: roleName,
      roleArn: trimmedArn,
      region: validRegion,
      verifiedAt: new Date().toISOString(),
      assumedRoleId: assumeResult.AssumedRoleUser?.AssumedRoleId,
      baseCallerIdentity: {
        account: baseCallerAccount,
        arn: baseCallerArn,
        userId: baseCallerUserId
      },
      assumedCallerIdentity: {
        account: assumedCallerAccount,
        arn: assumedCallerArn,
        userId: assumedCallerUserId
      }
    };
  } catch (step3Err: any) {
    const errCode = step3Err?.name || step3Err?.Code || 'AssumedIdentityFailed';
    const errMsg = step3Err?.message || 'Failed to verify assumed role identity.';
    console.error(`[AWS STS Step 3 FAILED]: GetCallerIdentity with temporary credentials failed. ErrorCode=${errCode}, Message=${errMsg}`);

    return {
      success: false,
      status: 'failed',
      connected: false,
      errorCode: errCode,
      error: `Assumed role verification failed (${errCode}): ${errMsg}`,
      message: 'Failed to verify the assumed role session identity.'
    };
  }
}
