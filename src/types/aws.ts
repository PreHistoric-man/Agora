export type AwsConnectionStatus = 'pending' | 'connected' | 'failed' | 'disconnected';

export interface AwsConnection {
  id: string;
  user_id: string;
  account_id: string;
  role_arn: string;
  region: string;
  status: AwsConnectionStatus;
  external_id?: string | null;
  error_message?: string | null;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerifyAwsRoleRequest {
  roleArn: string;
  accountId?: string;
  region?: string;
  externalId?: string;
  userId?: string;
}

export interface VerifyAwsRoleResponse {
  success: boolean;
  status: AwsConnectionStatus;
  connected?: boolean;
  accountId?: string;
  role?: string;
  roleArn?: string;
  region?: string;
  connectionId?: string;
  verifiedAt?: string;
  error?: string;
  errorCode?: string;
  message?: string;
  assumedRoleId?: string;
  baseCallerIdentity?: {
    account?: string;
    arn?: string;
    userId?: string;
  };
  assumedCallerIdentity?: {
    account?: string;
    arn?: string;
    userId?: string;
  };
}

export interface ModalHubTrustPolicyConfig {
  trustedPrincipalArn: string;
  externalId: string;
  recommendedRoleName: string;
  defaultAccountId: string;
}

export const MODALHUB_TRUST_CONFIG: ModalHubTrustPolicyConfig = {
  trustedPrincipalArn: 'arn:aws:iam::625552167334:user/AgonaUser',
  externalId: 'modalhub-deployment-verification',
  recommendedRoleName: 'ModalHubDeploymentRole',
  defaultAccountId: '625552167334'
};

export function generateTrustPolicyJson(externalId: string = MODALHUB_TRUST_CONFIG.externalId): string {
  return JSON.stringify(
    {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'ModalHubCrossAccountAssumeRole',
          Effect: 'Allow',
          Principal: {
            AWS: MODALHUB_TRUST_CONFIG.trustedPrincipalArn
          },
          Action: 'sts:AssumeRole',
          Condition: {
            StringEquals: {
              'sts:ExternalId': externalId
            }
          }
        }
      ]
    },
    null,
    2
  );
}

export function generateDeploymentPermissionsPolicyJson(): string {
  return JSON.stringify(
    {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'ModalHubEC2DeploymentPermissions',
          Effect: 'Allow',
          Action: [
            'ec2:DescribeInstances',
            'ec2:DescribeInstanceStatus',
            'ec2:DescribeSecurityGroups',
            'ec2:DescribeSubnets',
            'ec2:DescribeVpcs',
            'ec2:DescribeImages',
            'ec2:DescribeKeyPairs',
            'ec2:RunInstances',
            'ec2:StartInstances',
            'ec2:StopInstances',
            'ec2:TerminateInstances',
            'ec2:CreateTags'
          ],
          Resource: '*'
        }
      ]
    },
    null,
    2
  );
}
