export type DeploymentStatus = 'deploying' | 'online' | 'offline' | 'error';
export type DeploymentProvider = 'modelverse';
export type ScalingMode = 'fixed' | 'auto';
export type DeploymentEnvironment = 'development' | 'staging' | 'production';

export interface Deployment {
  id: string;
  modelId: string;
  modelVersion: string;
  name: string;
  status: DeploymentStatus;
  provider: DeploymentProvider;
  region: string;
  compute: {
    type: string;
    vram: number;
    hourlyRate: number;
  };
  scaling: {
    mode: ScalingMode;
    minInstances: number;
    maxInstances: number;
  };
  environment: DeploymentEnvironment;
  api: {
    enabled: boolean;
    endpoint: string;
    apiKey: string;
  };
  metrics: {
    requests: number;
    successRate: number;
    latency: number;
    estimatedCost: number;
    gpuUsage: number;
  };
  createdAt: string;
}

export interface DeploymentDraft {
  modelId: string;
  name: string;
  region: string;
  compute: {
    type: string;
    vram: number;
    hourlyRate: number;
  };
  scaling: ScalingMode;
  environment: DeploymentEnvironment;
  apiEnabled: boolean;
}

export const mockDeployments: Deployment[] = [];

export const computeOptions = [
  { type: 'Standard GPU', vram: 8, hourlyRate: 0.04 },
  { type: 'Performance GPU', vram: 24, hourlyRate: 0.12 },
  { type: 'Enterprise GPU', vram: 48, hourlyRate: 0.3 }
];

export const deploymentRegions = ['India - Mumbai', 'Singapore', 'US East', 'US West', 'Europe'];

export const createDeploymentRecord = (
  draft: DeploymentDraft,
  modelVersion: string,
  id = `deployment-${Date.now()}`
): Deployment => ({
  id,
  modelId: draft.modelId,
  modelVersion,
  name: draft.name,
  status: 'deploying',
  provider: 'modelverse',
  region: draft.region,
  compute: draft.compute,
  scaling: {
    mode: draft.scaling,
    minInstances: draft.scaling === 'auto' ? 1 : 1,
    maxInstances: draft.scaling === 'auto' ? 3 : 1
  },
  environment: draft.environment,
  api: {
    enabled: draft.apiEnabled,
    endpoint: `https://api.modelverse.dev/v1/${draft.name}`,
    apiKey: 'mv_test_xxxxxxxxxxxxx'
  },
  metrics: {
    requests: 0,
    successRate: 100,
    latency: 0,
    estimatedCost: 0,
    gpuUsage: 0
  },
  createdAt: new Date().toISOString()
});
