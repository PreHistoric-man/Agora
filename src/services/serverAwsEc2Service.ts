import { STSClient, AssumeRoleCommand, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import {
  EC2Client,
  DescribeSubnetsCommand,
  DescribeSecurityGroupsCommand,
  DescribeImagesCommand,
  RunInstancesCommand,
  DescribeInstancesCommand,
  StopInstancesCommand,
  TerminateInstancesCommand
} from '@aws-sdk/client-ec2';

export interface AwsProvisionRequest {
  deploymentId: string;
  modelId: string;
  userId: string;
  provider: 'aws' | 'local';
  region: string;
  instanceType: string;
  gpuType?: string;
  roleArn?: string;
  configuration?: Record<string, any>;
}

export interface AwsProvisionResponse {
  success: boolean;
  status: 'deploying' | 'running' | 'failed' | 'stopped' | 'terminated';
  instanceId?: string;
  publicIp?: string | null;
  privateIp?: string | null;
  availabilityZone?: string | null;
  region?: string;
  instanceType?: string;
  error?: string;
  message?: string;
  errorCode?: string;
  errorName?: string;
  httpStatusCode?: number;
  requestId?: string;
  diagnostics?: {
    deploymentId: string;
    modelId: string;
    region: string;
    instanceType: string;
    amiId?: string;
    subnetId?: string;
    securityGroupId?: string;
    assumedRoleArn?: string;
    assumedAccountId?: string;
  };
}

export interface AwsInstanceActionRequest {
  instanceId: string;
  deploymentId?: string;
  userId: string;
  roleArn?: string;
  region?: string;
}

export interface AwsInstanceActionResponse {
  success: boolean;
  status: 'stopped' | 'terminated' | 'failed';
  instanceId: string;
  error?: string;
  message?: string;
  errorCode?: string;
}

const DEFAULT_DEPLOYMENT_ROLE_ARN = 'arn:aws:iam::625552167334:role/ModalHubDeploymentRole';
const EXPECTED_ACCOUNT_ID = '625552167334';
const DEFAULT_REGION = 'us-east-1';
const SUPPORTED_INSTANCE_TYPE = 'g4dn.xlarge';

/**
 * Assumes the ModalHubDeploymentRole via AWS STS in us-east-1 and verifies identity via GetCallerIdentity.
 */
async function getAssumedCredentials(roleArn: string, region: string) {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.AWS_SESSION_TOKEN;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials (AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY) are missing in server environment.');
  }

  const sts = new STSClient({
    region,
    credentials: {
      accessKeyId: accessKeyId.trim(),
      secretAccessKey: secretAccessKey.trim(),
      sessionToken: sessionToken ? sessionToken.trim() : undefined
    }
  });

  const assumeCmd = new AssumeRoleCommand({
    RoleArn: roleArn.trim(),
    RoleSessionName: `ModalHub-EC2-Session-${Date.now()}`,
    DurationSeconds: 1800
  });

  const assumeRes = await sts.send(assumeCmd);

  if (
    !assumeRes.Credentials?.AccessKeyId ||
    !assumeRes.Credentials?.SecretAccessKey ||
    !assumeRes.Credentials?.SessionToken
  ) {
    throw new Error('AWS STS AssumeRole succeeded but did not return complete session credentials.');
  }

  const assumedCreds = {
    accessKeyId: assumeRes.Credentials.AccessKeyId,
    secretAccessKey: assumeRes.Credentials.SecretAccessKey,
    sessionToken: assumeRes.Credentials.SessionToken
  };

  // Verify Assumed Role caller identity using STS GetCallerIdentity
  const verifiedSts = new STSClient({
    region,
    credentials: assumedCreds
  });

  const identity = await verifiedSts.send(new GetCallerIdentityCommand({}));
  console.log('[AWS STS] Assumed Identity Verified:', {
    Account: identity.Account,
    Arn: identity.Arn,
    UserId: identity.UserId
  });

  if (identity.Account !== EXPECTED_ACCOUNT_ID) {
    console.warn(`[AWS STS] Warning: Assumed account ${identity.Account} does not match expected ${EXPECTED_ACCOUNT_ID}`);
  }

  return {
    credentials: assumedCreds,
    callerIdentity: {
      account: identity.Account,
      arn: identity.Arn,
      userId: identity.UserId
    }
  };
}

/**
 * Returns an EC2Client and caller identity authenticated via STS AssumeRole in us-east-1.
 */
async function getEc2Client(roleArn: string = DEFAULT_DEPLOYMENT_ROLE_ARN, region: string = DEFAULT_REGION) {
  const { credentials, callerIdentity } = await getAssumedCredentials(roleArn, region);
  const ec2 = new EC2Client({
    region,
    credentials
  });

  return { ec2, callerIdentity };
}

/**
 * Discovers an available subnet and extracts its VPC without requiring ec2:DescribeVpcs permission.
 */
async function discoverSubnetAndVpc(ec2: EC2Client): Promise<{ vpcId: string; subnetId: string }> {
  const subnetsRes = await ec2.send(new DescribeSubnetsCommand({}));

  if (!subnetsRes.Subnets || subnetsRes.Subnets.length === 0) {
    throw new Error('No available subnets found in region us-east-1.');
  }

  // Find available subnet (prefer default for AZ, or available state)
  const availableSubnets = subnetsRes.Subnets.filter((s) => s.State === 'available');
  if (availableSubnets.length === 0) {
    throw new Error('All subnets in us-east-1 are unavailable.');
  }

  const selectedSubnet = availableSubnets.find((s) => s.DefaultForAz === true) || availableSubnets[0];

  if (!selectedSubnet.SubnetId || !selectedSubnet.VpcId) {
    throw new Error('Subnet discovery did not return a valid SubnetId or VpcId.');
  }

  return {
    vpcId: selectedSubnet.VpcId,
    subnetId: selectedSubnet.SubnetId
  };
}

/**
 * Discovers an existing Security Group in the target VPC without requiring ec2:CreateSecurityGroup permission.
 */
async function discoverSecurityGroup(ec2: EC2Client, vpcId: string): Promise<string> {
  const sgsRes = await ec2.send(
    new DescribeSecurityGroupsCommand({
      Filters: [{ Name: 'vpc-id', Values: [vpcId] }]
    })
  );

  if (!sgsRes.SecurityGroups || sgsRes.SecurityGroups.length === 0) {
    throw new Error(`No security groups found for VPC ${vpcId}.`);
  }

  // Find named group or default group
  const matchedSg =
    sgsRes.SecurityGroups.find((sg) => sg.GroupName === 'ModalHub-Deployment-SG') ||
    sgsRes.SecurityGroups.find((sg) => sg.GroupName === 'default') ||
    sgsRes.SecurityGroups[0];

  if (!matchedSg?.GroupId) {
    throw new Error(`Unable to resolve a valid Security Group ID for VPC ${vpcId}.`);
  }

  return matchedSg.GroupId;
}

/**
 * Resolves and verifies a real GPU AMI in us-east-1 using DescribeImages.
 */
async function resolveAndVerifyGpuAmi(ec2: EC2Client): Promise<string> {
  // Query official AWS Deep Learning AMI with PyTorch and NVIDIA Drivers in us-east-1
  try {
    const imagesRes = await ec2.send(
      new DescribeImagesCommand({
        Owners: ['amazon'],
        Filters: [
          {
            Name: 'name',
            Values: [
              'Deep Learning OSS Nvidia Driver AMI GPU PyTorch * (Ubuntu 22.04)*',
              'Deep Learning Base AMI GPU (Ubuntu 22.04)*'
            ]
          },
          { Name: 'state', Values: ['available'] },
          { Name: 'architecture', Values: ['x86_64'] }
        ]
      })
    );

    if (imagesRes.Images && imagesRes.Images.length > 0) {
      const sorted = imagesRes.Images.sort((a, b) => {
        const dateA = a.CreationDate ? new Date(a.CreationDate).getTime() : 0;
        const dateB = b.CreationDate ? new Date(b.CreationDate).getTime() : 0;
        return dateB - dateA;
      });

      if (sorted[0]?.ImageId) {
        console.log(`[AWS EC2] Verified GPU AMI: ${sorted[0].ImageId} (${sorted[0].Name})`);
        return sorted[0].ImageId;
      }
    }
  } catch (err: any) {
    console.warn('[AWS EC2] Deep Learning AMI query error:', err?.message || err);
  }

  // Verified Deep Learning PyTorch 2.4 AMI in us-east-1
  const fallbackAmi = 'ami-00741c0e09cbb191f';
  const verifyFallback = await ec2.send(new DescribeImagesCommand({ ImageIds: [fallbackAmi] }));
  if (verifyFallback.Images && verifyFallback.Images.length > 0) {
    return fallbackAmi;
  }

  throw new Error(`No compatible GPU AMI could be verified in region us-east-1.`);
}

/**
 * Wait for EC2 instance to reach 'running' state with polling.
 */
async function waitForInstanceRunning(
  ec2: EC2Client,
  instanceId: string,
  maxWaitSeconds: number = 180
): Promise<{
  state: string;
  publicIp: string | null;
  privateIp: string | null;
  availabilityZone: string | null;
}> {
  const pollIntervalMs = 5000;
  const maxAttempts = Math.ceil((maxWaitSeconds * 1000) / pollIntervalMs);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

    const describeRes = await ec2.send(
      new DescribeInstancesCommand({
        InstanceIds: [instanceId]
      })
    );

    const inst = describeRes.Reservations?.[0]?.Instances?.[0];
    if (!inst) {
      continue;
    }

    const stateName = inst.State?.Name;
    console.log(`[AWS EC2] Instance ${instanceId} state (${attempt}/${maxAttempts}): ${stateName}`);

    if (stateName === 'running') {
      return {
        state: 'running',
        publicIp: inst.PublicIpAddress || null,
        privateIp: inst.PrivateIpAddress || null,
        availabilityZone: inst.Placement?.AvailabilityZone || null
      };
    }

    if (stateName === 'terminated' || stateName === 'shutting-down') {
      throw new Error(`Instance entered ${stateName} state unexpectedly.`);
    }
  }

  throw new Error(`Instance ${instanceId} did not reach running state within ${maxWaitSeconds} seconds.`);
}

/**
 * Main Phase 2B Service: Provision an actual AWS EC2 GPU instance for ModalHub with detailed error capture.
 */
export async function provisionAwsEc2Instance(req: AwsProvisionRequest): Promise<AwsProvisionResponse> {
  const targetRegion = DEFAULT_REGION;
  const targetInstanceType = req.instanceType?.trim() || SUPPORTED_INSTANCE_TYPE;
  const roleArn = req.roleArn?.trim() || DEFAULT_DEPLOYMENT_ROLE_ARN;

  if (req.region && req.region !== DEFAULT_REGION) {
    return {
      success: false,
      status: 'failed',
      errorCode: 'UNSUPPORTED_REGION',
      errorName: 'UnsupportedRegionError',
      error: `Region ${req.region} is not available in the MVP. Only us-east-1 is supported.`,
      message: `Region ${req.region} is not available in the MVP. Only us-east-1 is supported.`,
      diagnostics: {
        deploymentId: req.deploymentId,
        modelId: req.modelId,
        region: req.region,
        instanceType: targetInstanceType
      }
    };
  }

  console.log(`[AWS EC2 Provisioning] Starting deployment ${req.deploymentId} for model ${req.modelId}...`);
  console.log(`[AWS EC2 Provisioning] Region: ${targetRegion}, InstanceType: ${targetInstanceType}, Role: ${roleArn}`);

  let ec2: EC2Client;
  let callerIdentity: { account?: string; arn?: string; userId?: string } | undefined;

  try {
    const clientResult = await getEc2Client(roleArn, targetRegion);
    ec2 = clientResult.ec2;
    callerIdentity = clientResult.callerIdentity;
  } catch (assumeErr: any) {
    const errorDetails = {
      errorName: assumeErr?.name || 'AssumeRoleError',
      errorCode: assumeErr?.Code || assumeErr?.name || 'AssumeRoleFailed',
      httpStatusCode: assumeErr?.$metadata?.httpStatusCode || 403,
      errorMessage: assumeErr?.message || 'Failed to authenticate deployment role via STS AssumeRole.',
      requestId: assumeErr?.$metadata?.requestId,
      deploymentId: req.deploymentId,
      modelId: req.modelId,
      region: targetRegion,
      instanceType: targetInstanceType
    };
    console.error('[AWS EC2 Provisioning] STS AssumeRole Diagnostic Failure:', errorDetails);

    return {
      success: false,
      status: 'failed',
      errorCode: errorDetails.errorCode,
      errorName: errorDetails.errorName,
      httpStatusCode: errorDetails.httpStatusCode,
      requestId: errorDetails.requestId,
      error: errorDetails.errorMessage,
      message: `AWS STS Authentication Failed: ${errorDetails.errorMessage}`,
      diagnostics: {
        deploymentId: req.deploymentId,
        modelId: req.modelId,
        region: targetRegion,
        instanceType: targetInstanceType,
        assumedRoleArn: roleArn
      }
    };
  }

  let subnetId: string | undefined;
  let securityGroupId: string | undefined;
  let amiId: string | undefined;
  let instanceId: string | undefined;

  try {
    // 1. Discover Subnet & VPC
    const net = await discoverSubnetAndVpc(ec2);
    subnetId = net.subnetId;
    console.log(`[AWS EC2 Provisioning] Subnet: ${subnetId} in VPC: ${net.vpcId}`);

    // 2. Discover Security Group in VPC
    securityGroupId = await discoverSecurityGroup(ec2, net.vpcId);
    console.log(`[AWS EC2 Provisioning] Security Group: ${securityGroupId}`);

    // 3. Resolve and Verify GPU AMI
    amiId = await resolveAndVerifyGpuAmi(ec2);
    console.log(`[AWS EC2 Provisioning] AMI ID: ${amiId}`);

    // 4. Call RunInstances (Clean minimal parameters without unpermitted TagSpecifications or Instance Profiles)
    console.log(`[AWS EC2 Provisioning] Calling RunInstancesCommand for ${targetInstanceType}...`);
    const runRes = await ec2.send(
      new RunInstancesCommand({
        ImageId: amiId,
        InstanceType: targetInstanceType as any,
        MinCount: 1,
        MaxCount: 1,
        SubnetId: subnetId,
        SecurityGroupIds: [securityGroupId]
      })
    );

    const createdInstance = runRes.Instances?.[0];
    if (!createdInstance?.InstanceId) {
      throw new Error('AWS EC2 RunInstances succeeded but returned no InstanceId.');
    }

    instanceId = createdInstance.InstanceId;
    console.log(`[AWS EC2 Provisioning] Instance ${instanceId} created. Waiting for running state...`);

    // 5. Wait for instance to reach running
    const finalInfo = await waitForInstanceRunning(ec2, instanceId, 180);

    console.log(`[AWS EC2 Provisioning] SUCCESS! Instance ${instanceId} is RUNNING.`);

    return {
      success: true,
      status: 'running',
      instanceId,
      publicIp: finalInfo.publicIp,
      privateIp: finalInfo.privateIp,
      availabilityZone: finalInfo.availabilityZone,
      region: targetRegion,
      instanceType: targetInstanceType
    };
  } catch (err: any) {
    const errorName = err?.name || 'EC2ProvisioningError';
    const errorCode = err?.Code || err?.name || 'RunInstancesFailed';
    const httpStatusCode = err?.$metadata?.httpStatusCode || 400;
    const errorMessage = err?.message || 'EC2 instance launch failed.';
    const requestId = err?.$metadata?.requestId;

    // SAFE DIAGNOSTIC LOGGING (never logs keys or tokens)
    console.error('[AWS EC2 Provisioning FAILED] Safe Diagnostic Report:', {
      errorName,
      errorCode,
      httpStatusCode,
      errorMessage,
      requestId,
      deploymentId: req.deploymentId,
      modelId: req.modelId,
      region: targetRegion,
      instanceType: targetInstanceType,
      amiId,
      subnetId,
      securityGroupId,
      assumedRoleArn: roleArn,
      assumedAccountId: callerIdentity?.account
    });

    let userFacingMessage = errorMessage;
    if (errorCode === 'InvalidParameterCombination' && errorMessage.includes('Free Tier')) {
      userFacingMessage = `AWS Account Quota Restriction: The specified GPU instance type (${targetInstanceType}) is not eligible for the AWS Free Tier restriction on account ${callerIdentity?.account || '625552167334'}. AWS requires a standard paid compute quota or payment method activation to launch GPU instances.`;
    } else if (errorCode === 'VcpuLimitExceeded' || errorCode === 'InstanceLimitExceeded') {
      userFacingMessage = `AWS vCPU Quota Exceeded: The AWS account does not currently have enough vCPU quota for ${targetInstanceType} instances in ${targetRegion}.`;
    } else if (errorCode === 'InsufficientInstanceCapacity') {
      userFacingMessage = `AWS Capacity Unavailable: AWS currently has insufficient ${targetInstanceType} capacity in ${targetRegion}.`;
    }

    return {
      success: false,
      status: 'failed',
      instanceId,
      errorCode,
      errorName,
      httpStatusCode,
      requestId,
      error: userFacingMessage,
      message: userFacingMessage,
      diagnostics: {
        deploymentId: req.deploymentId,
        modelId: req.modelId,
        region: targetRegion,
        instanceType: targetInstanceType,
        amiId,
        subnetId,
        securityGroupId,
        assumedRoleArn: roleArn,
        assumedAccountId: callerIdentity?.account
      }
    };
  }
}

/**
 * Stop an existing running ModalHub EC2 instance.
 */
export async function stopAwsEc2Instance(req: AwsInstanceActionRequest): Promise<AwsInstanceActionResponse> {
  const roleArn = req.roleArn?.trim() || DEFAULT_DEPLOYMENT_ROLE_ARN;
  const region = req.region?.trim() || DEFAULT_REGION;

  if (!req.instanceId || !req.instanceId.startsWith('i-')) {
    return {
      success: false,
      status: 'failed',
      instanceId: req.instanceId,
      error: 'Invalid EC2 Instance ID provided.'
    };
  }

  try {
    const { ec2 } = await getEc2Client(roleArn, region);
    console.log(`[AWS EC2 Stop] Stopping instance ${req.instanceId}...`);

    await ec2.send(
      new StopInstancesCommand({
        InstanceIds: [req.instanceId]
      })
    );

    console.log(`[AWS EC2 Stop] Instance ${req.instanceId} stop command sent successfully.`);
    return {
      success: true,
      status: 'stopped',
      instanceId: req.instanceId
    };
  } catch (err: any) {
    const errorDetails = {
      errorName: err?.name,
      errorCode: err?.Code || err?.name,
      httpStatusCode: err?.$metadata?.httpStatusCode,
      errorMessage: err?.message,
      requestId: err?.$metadata?.requestId,
      instanceId: req.instanceId
    };
    console.error(`[AWS EC2 Stop FAILED]:`, errorDetails);
    return {
      success: false,
      status: 'failed',
      instanceId: req.instanceId,
      errorCode: errorDetails.errorCode,
      error: err?.message || 'Failed to stop AWS EC2 instance.',
      message: err?.message || 'Failed to stop AWS EC2 instance.'
    };
  }
}

/**
 * Terminate an existing ModalHub EC2 instance.
 */
export async function terminateAwsEc2Instance(req: AwsInstanceActionRequest): Promise<AwsInstanceActionResponse> {
  const roleArn = req.roleArn?.trim() || DEFAULT_DEPLOYMENT_ROLE_ARN;
  const region = req.region?.trim() || DEFAULT_REGION;

  if (!req.instanceId || !req.instanceId.startsWith('i-')) {
    return {
      success: false,
      status: 'failed',
      instanceId: req.instanceId,
      error: 'Invalid EC2 Instance ID provided.'
    };
  }

  try {
    const { ec2 } = await getEc2Client(roleArn, region);
    console.log(`[AWS EC2 Terminate] Terminating instance ${req.instanceId}...`);

    await ec2.send(
      new TerminateInstancesCommand({
        InstanceIds: [req.instanceId]
      })
    );

    console.log(`[AWS EC2 Terminate] Instance ${req.instanceId} terminate command sent successfully.`);
    return {
      success: true,
      status: 'terminated',
      instanceId: req.instanceId
    };
  } catch (err: any) {
    const errorDetails = {
      errorName: err?.name,
      errorCode: err?.Code || err?.name,
      httpStatusCode: err?.$metadata?.httpStatusCode,
      errorMessage: err?.message,
      requestId: err?.$metadata?.requestId,
      instanceId: req.instanceId
    };
    console.error(`[AWS EC2 Terminate FAILED]:`, errorDetails);
    return {
      success: false,
      status: 'failed',
      instanceId: req.instanceId,
      errorCode: errorDetails.errorCode,
      error: err?.message || 'Failed to terminate AWS EC2 instance.',
      message: err?.message || 'Failed to terminate AWS EC2 instance.'
    };
  }
}

