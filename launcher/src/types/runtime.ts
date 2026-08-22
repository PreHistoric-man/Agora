export type RuntimeType = 'ollama' | 'demo' | 'none';

export type OllamaServerState = 'online' | 'stopped' | 'unavailable' | 'checking';

export interface RuntimeStatus {
  runtime: RuntimeType;
  available: boolean;
  state: OllamaServerState;
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
  runtime: RuntimeType;
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
  digest?: string;
  error?: string;
}

export interface RuntimeActionResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  tokens?: number;
  tokensPerSec?: number;
  durationMs?: number;
  isStreaming?: boolean;
  error?: boolean;
}

export interface ChatOptions {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  num_ctx?: number;
  system_prompt?: string;
}
