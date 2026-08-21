import { invoke } from '@tauri-apps/api/core';
import { ollamaRuntimeManager } from './OllamaRuntimeManager';
import type {
  RuntimeStatus,
  LocalModelInfo,
  LocalRunningModel,
  ModelRuntimeStatus,
  PullProgressUpdate,
  RuntimeActionResult
} from '../types/runtime';

export interface TauriAppInfo {
  name: string;
  product: string;
  version: string;
  identifier: string;
  status: string;
  platform: string;
  runtime_engine_ready: boolean;
  default_model_path: string;
  supported_runtimes: string[];
  isNativeTauri: boolean;
}

export interface LocalRuntimeConfig {
  engineType: 'ollama' | 'vllm' | 'docker' | 'custom';
  endpoint: string;
  port: number;
  autoStartOnBoot: boolean;
  gpuAcceleration: boolean;
  maxMemoryAllocGb: number;
  modelsDirectory: string;
}

export const DEFAULT_LOCAL_RUNTIME_CONFIG: LocalRuntimeConfig = {
  engineType: 'ollama',
  endpoint: 'http://127.0.0.1:11434',
  port: 11434,
  autoStartOnBoot: false,
  gpuAcceleration: true,
  maxMemoryAllocGb: 16,
  modelsDirectory: '~/.agora/models'
};

const RUNTIME_CONFIG_STORAGE_KEY = 'agora_launcher_runtime_config';

/**
 * Checks whether the current frontend is running inside a Tauri desktop webview.
 */
export function isTauriEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).__TAURI_INTERNALS__ ||
    (window as any).__TAURI__ ||
    (window as any).__TAURI_METADATA__
  );
}

export const TauriService = {
  /**
   * Invokes the Tauri 2 Rust command `get_app_info`.
   */
  async getAppInfo(): Promise<TauriAppInfo> {
    const isNative = isTauriEnvironment();

    if (isNative) {
      try {
        const rawInfo = await invoke<any>('get_app_info');
        return {
          name: rawInfo?.name || 'Agora',
          product: rawInfo?.product || 'Agora Launcher',
          version: rawInfo?.version || '0.2.0',
          identifier: rawInfo?.identifier || 'com.agora.launcher',
          status: 'connected',
          platform: rawInfo?.platform || (navigator.platform.includes('Mac') ? 'macos' : navigator.platform.includes('Win') ? 'windows' : 'linux'),
          runtime_engine_ready: Boolean(rawInfo?.runtime_engine_ready ?? true),
          default_model_path: rawInfo?.default_model_path || '~/.agora/models',
          supported_runtimes: rawInfo?.supported_runtimes || ['ollama'],
          isNativeTauri: true
        };
      } catch (err) {
        console.warn('Tauri IPC get_app_info notice:', err);
      }
    }

    const platform = typeof navigator !== 'undefined'
      ? (navigator.platform.includes('Mac') ? 'macos' : navigator.platform.includes('Win') ? 'windows' : 'linux')
      : 'linux';

    return {
      name: 'Agora',
      product: 'Agora Launcher',
      version: '0.2.0',
      identifier: 'com.agora.launcher',
      status: 'ready (web preview)',
      platform,
      runtime_engine_ready: true,
      default_model_path: '~/.agora/models',
      supported_runtimes: ['ollama'],
      isNativeTauri: false
    };
  },

  /**
   * Checks Ollama local runtime availability and version.
   */
  async checkOllama(endpoint?: string): Promise<RuntimeStatus> {
    const config = this.getLocalRuntimeConfig();
    return ollamaRuntimeManager.detectRuntime(endpoint || config.endpoint);
  },

  /**
   * Lists all installed models in Ollama storage.
   */
  async listOllamaModels(endpoint?: string): Promise<LocalModelInfo[]> {
    const config = this.getLocalRuntimeConfig();
    return ollamaRuntimeManager.listInstalledModels(endpoint || config.endpoint);
  },

  /**
   * Gets models actively running in Ollama memory.
   */
  async getOllamaRunningModels(endpoint?: string): Promise<LocalRunningModel[]> {
    const config = this.getLocalRuntimeConfig();
    return ollamaRuntimeManager.getRunningModels(endpoint || config.endpoint);
  },

  /**
   * Retrieves live status for a specific model tag.
   */
  async getOllamaModelStatus(modelTag: string, endpoint?: string): Promise<Partial<ModelRuntimeStatus>> {
    const config = this.getLocalRuntimeConfig();
    return ollamaRuntimeManager.getModelStatus(modelTag, endpoint || config.endpoint);
  },

  /**
   * Pulls/installs a model with progress tracking.
   */
  async pullOllamaModel(
    modelTag: string,
    onProgress?: (progress: PullProgressUpdate) => void,
    endpoint?: string
  ): Promise<RuntimeActionResult> {
    const config = this.getLocalRuntimeConfig();
    return ollamaRuntimeManager.installModel(modelTag, endpoint || config.endpoint, onProgress);
  },

  /**
   * Starts / loads a model into Ollama memory.
   */
  async runOllamaModel(modelTag: string, endpoint?: string): Promise<RuntimeActionResult> {
    const config = this.getLocalRuntimeConfig();
    return ollamaRuntimeManager.startModel(modelTag, endpoint || config.endpoint);
  },

  /**
   * Stops / unloads a model from Ollama memory.
   */
  async stopOllamaModel(modelTag: string, endpoint?: string): Promise<RuntimeActionResult> {
    const config = this.getLocalRuntimeConfig();
    return ollamaRuntimeManager.stopModel(modelTag, endpoint || config.endpoint);
  },

  /**
   * Removes / uninstalls a model from Ollama disk.
   */
  async removeOllamaModel(modelTag: string, endpoint?: string): Promise<RuntimeActionResult> {
    const config = this.getLocalRuntimeConfig();
    return ollamaRuntimeManager.removeModel(modelTag, endpoint || config.endpoint);
  },

  /**
   * Cancels an in-progress model installation.
   */
  cancelModelInstall(modelTag: string): boolean {
    return ollamaRuntimeManager.cancelInstall(modelTag);
  },

  /**
   * Retrieves saved local runtime settings.
   */
  getLocalRuntimeConfig(): LocalRuntimeConfig {
    try {
      const saved = localStorage.getItem(RUNTIME_CONFIG_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_LOCAL_RUNTIME_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Error reading local runtime config:', e);
    }
    return DEFAULT_LOCAL_RUNTIME_CONFIG;
  },

  /**
   * Saves local runtime settings.
   */
  saveLocalRuntimeConfig(config: Partial<LocalRuntimeConfig>): LocalRuntimeConfig {
    try {
      const current = this.getLocalRuntimeConfig();
      const updated = { ...current, ...config };
      localStorage.setItem(RUNTIME_CONFIG_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Error saving local runtime config:', e);
      return DEFAULT_LOCAL_RUNTIME_CONFIG;
    }
  }
};
