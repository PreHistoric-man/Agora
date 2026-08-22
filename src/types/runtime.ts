export type RuntimeType = 'ollama' | 'demo' | 'vllm' | 'docker' | 'custom';

export interface RuntimeStatus {
  runtime: RuntimeType;
  available: boolean;
  version?: string;
  endpoint: string;
  error?: string;
  models_count: number;
  running_count: number;
  lastChecked: number;
}

export interface LocalModelDetails {
  parent_model?: string;
  format?: string;
  family?: string;
  families?: string[];
  parameter_size?: string;
  quantization_level?: string;
}

export interface LocalModelInfo {
  name: string;
  model: string;
  size: number;
  sizeFormatted: string;
  digest: string;
  modifiedAt?: string;
  details?: LocalModelDetails;
}

export interface LocalRunningModel {
  name: string;
  model: string;
  size: number;
  digest: string;
  sizeVram?: number;
  sizeVramFormatted?: string;
  expiresAt?: string;
  details?: LocalModelDetails;
}

export type ModelLocalState =
  | 'not_installed'
  | 'installing'
  | 'installed'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'failed';

export interface ModelRuntimeStatus {
  modelId: string;
  modelName: string;
  runtime: RuntimeType | 'none';
  supported: boolean;
  unsupportedReason?: string;
  ollamaTag: string;
  state: ModelLocalState;
  installed: boolean;
  running: boolean;
  sizeBytes?: number;
  sizeFormatted?: string;
  digest?: string;
  parameterSize?: string;
  quantizationLevel?: string;
  endpoint?: string;
  progressPercent?: number;
  progressStatus?: string;
  errorMessage?: string;
  lastUpdated: number;
}

export interface PullProgressUpdate {
  status: string;
  completed?: number;
  total?: number;
  percent?: number;
  error?: string;
}

export interface RuntimeActionResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Clean runtime manager interface abstraction for local inference engines.
 */
export interface IRuntimeManager {
  readonly type: RuntimeType;
  detectRuntime(endpoint?: string): Promise<RuntimeStatus>;
  listInstalledModels(endpoint?: string): Promise<LocalModelInfo[]>;
  getRunningModels(endpoint?: string): Promise<LocalRunningModel[]>;
  getModelStatus(modelTag: string, endpoint?: string): Promise<Partial<ModelRuntimeStatus>>;
  installModel(
    modelTag: string,
    endpoint?: string,
    onProgress?: (progress: PullProgressUpdate) => void
  ): Promise<RuntimeActionResult>;
  startModel(modelTag: string, endpoint?: string): Promise<RuntimeActionResult>;
  stopModel(modelTag: string, endpoint?: string): Promise<RuntimeActionResult>;
  removeModel(modelTag: string, endpoint?: string): Promise<RuntimeActionResult>;
}
