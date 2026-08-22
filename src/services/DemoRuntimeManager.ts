import type {
  IRuntimeManager,
  RuntimeType,
  RuntimeStatus,
  LocalModelInfo,
  LocalRunningModel,
  PullProgressUpdate,
  RuntimeActionResult
} from '../types/runtime';
import { getDemoResponseForPrompt } from './DemoResponseEngine';

const STORAGE_INSTALLED_KEY = 'agora_demo_installed_models';
const STORAGE_RUNNING_KEY = 'agora_demo_running_models';

export class DemoRuntimeManager implements IRuntimeManager {
  readonly type: RuntimeType = 'custom';
  private activeAbortControllers = new Map<string, AbortController>();

  private getInstalledTags(): Set<string> {
    try {
      const raw = localStorage.getItem(STORAGE_INSTALLED_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        return new Set(Array.isArray(arr) ? arr : []);
      }
    } catch {}
    return new Set();
  }

  private saveInstalledTags(tags: Set<string>): void {
    try {
      localStorage.setItem(STORAGE_INSTALLED_KEY, JSON.stringify(Array.from(tags)));
    } catch {}
  }

  private getRunningTags(): Set<string> {
    try {
      const raw = localStorage.getItem(STORAGE_RUNNING_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        return new Set(Array.isArray(arr) ? arr : []);
      }
    } catch {}
    return new Set();
  }

  private saveRunningTags(tags: Set<string>): void {
    try {
      localStorage.setItem(STORAGE_RUNNING_KEY, JSON.stringify(Array.from(tags)));
    } catch {}
  }

  isModelInstalled(modelTag: string): boolean {
    const clean = (modelTag || '').toLowerCase().trim();
    const installed = this.getInstalledTags();
    return installed.has(clean) || installed.has('qwen3-demo');
  }

  isModelRunning(modelTag: string): boolean {
    const clean = (modelTag || '').toLowerCase().trim();
    const running = this.getRunningTags();
    return running.has(clean) || running.has('qwen3-demo');
  }

  async detectRuntime(): Promise<RuntimeStatus> {
    const installed = this.getInstalledTags();
    const running = this.getRunningTags();

    return {
      runtime: 'custom',
      available: true,
      version: 'Demo Engine v1.0',
      endpoint: 'local://demo-runtime',
      models_count: installed.size,
      running_count: running.size,
      lastChecked: Date.now()
    };
  }

  async listInstalledModels(): Promise<LocalModelInfo[]> {
    const installed = this.getInstalledTags();
    return Array.from(installed).map((tag) => ({
      name: tag === 'qwen3-demo' ? 'Qwen3 Demo' : tag,
      model: tag,
      size: 420000000,
      sizeFormatted: '420 MB',
      digest: 'sha256:demo-qwen3-simulated-weights',
      modifiedAt: new Date().toISOString(),
      details: {
        family: 'qwen3',
        parameter_size: '0.6B',
        quantization_level: 'Q4_K_M'
      }
    }));
  }

  async getRunningModels(): Promise<LocalRunningModel[]> {
    const running = this.getRunningTags();
    return Array.from(running).map((tag) => ({
      name: tag === 'qwen3-demo' ? 'Qwen3 Demo' : tag,
      model: tag,
      size: 420000000,
      digest: 'sha256:demo-qwen3-simulated-weights',
      sizeVram: 450000000,
      sizeVramFormatted: '450 MB VRAM',
      details: {
        family: 'qwen3',
        parameter_size: '0.6B'
      }
    }));
  }

  async getModelStatus(modelTag: string) {
    const installed = this.isModelInstalled(modelTag);
    const running = this.isModelRunning(modelTag);

    return {
      modelId: modelTag,
      modelName: modelTag === 'qwen3-demo' ? 'Qwen3 Demo' : modelTag,
      runtime: 'custom' as const,
      supported: true,
      ollamaTag: modelTag,
      state: running ? 'running' : installed ? 'installed' : 'not_installed',
      installed,
      running,
      sizeFormatted: '420 MB',
      lastUpdated: Date.now()
    };
  }

  async installModel(
    modelTag: string,
    _endpoint?: string,
    onProgress?: (progress: PullProgressUpdate) => void
  ): Promise<RuntimeActionResult> {
    const cleanTag = (modelTag || 'qwen3-demo').toLowerCase().trim();
    const abortCtrl = new AbortController();
    this.activeAbortControllers.set(cleanTag, abortCtrl);

    try {
      const steps = [
        { percent: 10, status: 'Preparing runtime...' },
        { percent: 25, status: 'Downloading model...' },
        { percent: 55, status: 'Downloading model...' },
        { percent: 85, status: 'Loading model...' },
        { percent: 100, status: 'Finalizing...' }
      ];

      for (const step of steps) {
        if (abortCtrl.signal.aborted) {
          throw new Error('Installation cancelled by user');
        }

        onProgress?.({
          status: step.status,
          percent: step.percent,
          completed: Math.round((step.percent / 100) * 420000000),
          total: 420000000
        });

        // Delay ~350-450ms per step for realistic presentation speed
        await new Promise((res) => setTimeout(res, 400));
      }

      // Persist installed state locally
      const installed = this.getInstalledTags();
      installed.add(cleanTag);
      this.saveInstalledTags(installed);

      onProgress?.({
        status: 'Installed',
        percent: 100,
        completed: 420000000,
        total: 420000000
      });

      return {
        success: true,
        message: 'Successfully installed Qwen3 Demo in Demo Runtime.'
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Demo installation failed',
        error: err.message
      };
    } finally {
      this.activeAbortControllers.delete(cleanTag);
    }
  }

  cancelInstall(modelTag: string): boolean {
    const cleanTag = (modelTag || 'qwen3-demo').toLowerCase().trim();
    const ctrl = this.activeAbortControllers.get(cleanTag);
    if (ctrl) {
      ctrl.abort();
      this.activeAbortControllers.delete(cleanTag);
      return true;
    }
    return false;
  }

  async startModel(modelTag: string): Promise<RuntimeActionResult> {
    const cleanTag = (modelTag || 'qwen3-demo').toLowerCase().trim();
    // Simulate brief spin-up
    await new Promise((res) => setTimeout(res, 500));

    const running = this.getRunningTags();
    running.add(cleanTag);
    this.saveRunningTags(running);

    return {
      success: true,
      message: 'Started Qwen3 Demo on Demo Runtime.'
    };
  }

  async stopModel(modelTag: string): Promise<RuntimeActionResult> {
    const cleanTag = (modelTag || 'qwen3-demo').toLowerCase().trim();
    await new Promise((res) => setTimeout(res, 300));

    const running = this.getRunningTags();
    running.delete(cleanTag);
    this.saveRunningTags(running);

    return {
      success: true,
      message: 'Stopped Qwen3 Demo.'
    };
  }

  async removeModel(modelTag: string): Promise<RuntimeActionResult> {
    const cleanTag = (modelTag || 'qwen3-demo').toLowerCase().trim();
    const installed = this.getInstalledTags();
    installed.delete(cleanTag);
    this.saveInstalledTags(installed);

    const running = this.getRunningTags();
    running.delete(cleanTag);
    this.saveRunningTags(running);

    return {
      success: true,
      message: 'Removed Qwen3 Demo.'
    };
  }

  /**
   * Resets demo installation and runtime state so full demo can be repeated anytime.
   */
  resetDemo(): void {
    try {
      localStorage.removeItem(STORAGE_INSTALLED_KEY);
      localStorage.removeItem(STORAGE_RUNNING_KEY);
    } catch {}
  }

  /**
   * Streams progressive AI responses word-by-word.
   */
  async streamChat(
    modelTag: string,
    prompt: string,
    onChunk: (chunk: { content: string; done: boolean; tokens?: number }) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const fullText = getDemoResponseForPrompt(prompt, modelTag === 'qwen3-demo' ? 'Qwen3 Demo' : modelTag);
    const words = fullText.split(' ');
    let accumulated = '';
    let tokenCount = 0;

    for (let i = 0; i < words.length; i++) {
      if (signal?.aborted) break;

      const word = words[i] + (i < words.length - 1 ? ' ' : '');
      accumulated += word;
      tokenCount += Math.max(1, Math.round(word.length / 4));

      onChunk({
        content: word,
        done: i === words.length - 1,
        tokens: tokenCount
      });

      // 20-30ms per word chunk creates smooth reading cadence (~3 sec total)
      await new Promise((res) => setTimeout(res, 22));
    }
  }
}

export const demoRuntimeManager = new DemoRuntimeManager();
