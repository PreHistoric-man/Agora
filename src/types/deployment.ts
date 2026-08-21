import type { Model } from '../data/mockData';

export type DeploymentProvider = 'local' | 'aws' | 'modalhub';
export type DeploymentType = 'local' | 'cloud';
export type DeploymentStatus = 'pending' | 'deploying' | 'running' | 'stopped' | 'failed' | 'terminated';

export interface DeploymentConfig {
  port?: number;
  memory?: string;
  vram?: number;
  quantization?: string;
  contextLength?: number;
  threads?: number;
  envVars?: Record<string, string>;
  scaling?: 'fixed' | 'auto';
  minInstances?: number;
  maxInstances?: number;
  storageGb?: number;
  customArgs?: string;
  [key: string]: any;
}

export interface Deployment {
  id: string;
  user_id: string;
  model_id: string;
  provider: DeploymentProvider;
  deployment_type: DeploymentType;
  status: DeploymentStatus;
  region: string | null;
  instance_type: string | null;
  gpu_type: string | null;
  endpoint: string | null;
  api_key: string | null;
  configuration: DeploymentConfig;
  created_at: string;
  updated_at: string;
  model?: Model;
  instance_id?: string | null;
  public_ip?: string | null;
  private_ip?: string | null;
  availability_zone?: string | null;
}

export interface DeploymentDraft {
  model_id: string;
  provider: 'local' | 'aws';
  deployment_type: 'local' | 'cloud';
  region?: string;
  instance_type?: string;
  gpu_type?: string;
  configuration?: DeploymentConfig;
}

export interface InstanceOption {
  id: string;
  name: string;
  vCpu: number;
  ramGb: number;
  gpu: string;
  vramGb: number;
  hourlyCostEst: string;
  description: string;
}

export const AWS_INSTANCE_OPTIONS: InstanceOption[] = [
  {
    id: 'g4dn.xlarge',
    name: 'g4dn.xlarge',
    vCpu: 4,
    ramGb: 16,
    gpu: 'NVIDIA T4',
    vramGb: 16,
    hourlyCostEst: '$0.526/hr',
    description: 'Cost-effective inference for 7B-14B parameter models'
  },
  {
    id: 'g5.xlarge',
    name: 'g5.xlarge',
    vCpu: 4,
    ramGb: 24,
    gpu: 'NVIDIA A10G',
    vramGb: 24,
    hourlyCostEst: '$1.006/hr',
    description: 'High-speed FP16 inference for 14B-32B parameter models'
  },
  {
    id: 'g5.12xlarge',
    name: 'g5.12xlarge',
    vCpu: 48,
    ramGb: 192,
    gpu: '4x NVIDIA A10G',
    vramGb: 96,
    hourlyCostEst: '$5.672/hr',
    description: 'Multi-GPU acceleration for 70B+ dense models'
  },
  {
    id: 'p4d.24xlarge',
    name: 'p4d.24xlarge',
    vCpu: 96,
    ramGb: 1152,
    gpu: '8x NVIDIA A100 (40GB)',
    vramGb: 320,
    hourlyCostEst: '$32.77/hr',
    description: 'Enterprise ultra-scale batch throughput'
  }
];

export const AWS_REGIONS = [
  { id: 'us-east-1', name: 'US East (N. Virginia)', latency: '~25ms' },
  { id: 'us-west-2', name: 'US West (Oregon)', latency: '~45ms' },
  { id: 'eu-west-1', name: 'Europe (Ireland)', latency: '~90ms' },
  { id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)', latency: '~140ms' },
  { id: 'ap-south-1', name: 'Asia Pacific (Mumbai)', latency: '~160ms' }
];

export const LOCAL_RUNTIME_CONFIGS = {
  defaultPort: 8080,
  defaultThreads: 8,
  defaultContextLength: 8192,
  quantizationOptions: ['Q4_K_M (Recommended)', 'Q5_K_M (Balanced)', 'Q8_0 (High Precision)', 'FP16 (Native)'],
  engines: ['llama.cpp / GGUF', 'Ollama Backend', 'vLLM Local Server', 'ExLlamaV2']
};
