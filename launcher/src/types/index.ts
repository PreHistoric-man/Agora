export interface Model {
  id: string;
  name: string;
  provider: string;
  providerLogo?: string;
  creatorId?: string;
  description: string;
  longDescription?: string;
  category: 'Reasoning' | 'Coding' | 'Image' | 'Video' | 'Audio' | 'Vision' | 'Writing' | 'Agents' | 'Speech' | 'Science' | string;
  tags: string[];
  overallScore: number;
  codingScore?: number;
  reasoningScore?: number;
  mathScore?: number;
  visionScore?: number;
  speedTokensPerSec?: number;
  latencyMs?: number;
  contextWindow: string;
  contextWindowTokens?: number;
  parameters?: string;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  isOpenSource: boolean;
  license: string;
  accessMethods: string[];
  endpoint?: string;
  modelEndpointId?: string;
  bestFor?: string;
  capabilities?: string[];
  sampleCurl?: string;
  samplePython?: string;
  sampleNode?: string;
  rating: number;
  reviewsCount: number;
  created_at?: string;
}

export interface LibraryItem {
  id: string;
  user_id: string;
  model_id: string;
  added_at: string;
  installed?: boolean;
  installed_version?: string | null;
  deployment_status?: 'not_deployed' | 'deploying' | 'running' | 'stopped' | 'failed';
  model?: Model;
}

export interface Deployment {
  id: string;
  user_id: string;
  model_id: string;
  provider: 'AWS' | 'Local' | 'GCP' | 'Azure' | 'Modal';
  status: 'running' | 'deploying' | 'stopped' | 'failed';
  instance_type?: string;
  gpu_type?: string;
  region?: string;
  endpoint_url?: string;
  created_at: string;
  updated_at?: string;
  model?: Model;
}

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  role?: string;
  created_at?: string;
}

export type LauncherView = 'home' | 'library' | 'playground' | 'deployments' | 'store' | 'settings';

export * from './runtime';
