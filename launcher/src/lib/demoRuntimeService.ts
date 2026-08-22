import type {
  RuntimeStatus,
  LocalModelInfo,
  LocalRunningModel,
  PullProgressUpdate,
} from '../types/runtime';
import { getDemoResponseForPrompt } from './demoResponseEngine';

const STORAGE_INSTALLED_KEY = 'agora_demo_installed_models';
const STORAGE_RUNNING_KEY = 'agora_demo_running_models';

export class DemoRuntimeService {
  private activeAbortControllers = new Map<string, AbortController>();

  getInstalledTags(): Set<string> {
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

  getRunningTags(): Set<string> {
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
    return installed.has(clean) || (clean.includes('qwen3-demo') && installed.has('qwen3-demo'));
  }

  isModelRunning(modelTag: string): boolean {
    const clean = (modelTag || '').toLowerCase().trim();
    const running = this.getRunningTags();
    return running.has(clean) || (clean.includes('qwen3-demo') && running.has('qwen3-demo'));
  }

  async checkStatus(): Promise<RuntimeStatus> {
    const installed = this.getInstalledTags();
    const running = this.getRunningTags();

    return {
      runtime: 'demo',
      available: true,
      state: 'online',
      version: 'Demo Engine v1.0',
      endpoint: 'local://demo-runtime',
      models_count: installed.size,
      running_count: running.size,
      lastChecked: Date.now(),
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
        quantization_level: 'Q4_K_M',
      },
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
        parameter_size: '0.6B',
      },
    }));
  }

  async installModel(
    modelTag: string,
    onProgress?: (progress: PullProgressUpdate) => void
  ): Promise<boolean> {
    const cleanTag = (modelTag || 'qwen3-demo').toLowerCase().trim();
    const abortCtrl = new AbortController();
    this.activeAbortControllers.set(cleanTag, abortCtrl);

    try {
      const steps = [
        { percent: 10, status: 'Preparing runtime...' },
        { percent: 25, status: 'Downloading model...' },
        { percent: 55, status: 'Downloading model...' },
        { percent: 85, status: 'Loading model...' },
        { percent: 100, status: 'Finalizing...' },
      ];

      for (const step of steps) {
        if (abortCtrl.signal.aborted) {
          throw new Error('Installation cancelled by user');
        }

        onProgress?.({
          status: step.status,
          percent: step.percent,
          completed: Math.round((step.percent / 100) * 420000000),
          total: 420000000,
        });

        await new Promise((res) => setTimeout(res, 400));
      }

      const installed = this.getInstalledTags();
      installed.add(cleanTag);
      this.saveInstalledTags(installed);

      onProgress?.({
        status: 'Installed',
        percent: 100,
        completed: 420000000,
        total: 420000000,
      });

      return true;
    } catch {
      return false;
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

  async startModel(modelTag: string): Promise<boolean> {
    const cleanTag = (modelTag || 'qwen3-demo').toLowerCase().trim();
    await new Promise((res) => setTimeout(res, 500));

    const running = this.getRunningTags();
    running.add(cleanTag);
    this.saveRunningTags(running);
    return true;
  }

  async stopModel(modelTag: string): Promise<boolean> {
    const cleanTag = (modelTag || 'qwen3-demo').toLowerCase().trim();
    await new Promise((res) => setTimeout(res, 300));

    const running = this.getRunningTags();
    running.delete(cleanTag);
    this.saveRunningTags(running);
    return true;
  }

  async deleteModel(modelTag: string): Promise<boolean> {
    const cleanTag = (modelTag || 'qwen3-demo').toLowerCase().trim();
    const installed = this.getInstalledTags();
    installed.delete(cleanTag);
    this.saveInstalledTags(installed);

    const running = this.getRunningTags();
    running.delete(cleanTag);
    this.saveRunningTags(running);
    return true;
  }

  resetDemo(): void {
    try {
      localStorage.removeItem(STORAGE_INSTALLED_KEY);
      localStorage.removeItem(STORAGE_RUNNING_KEY);
    } catch {}
  }

  async streamChat(
    modelTag: string,
    prompt: string,
    onChunk: (chunk: { content: string; done: boolean; tokens?: number }) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const fullText = getDemoResponseForPrompt(prompt, modelTag === 'qwen3-demo' ? 'Qwen3 Demo' : modelTag);
    const words = fullText.split(' ');
    let tokenCount = 0;

    for (let i = 0; i < words.length; i++) {
      if (signal?.aborted) break;

      const word = words[i] + (i < words.length - 1 ? ' ' : '');
      tokenCount += Math.max(1, Math.round(word.length / 4));

      onChunk({
        content: word,
        done: i === words.length - 1,
        tokens: tokenCount,
      });

      await new Promise((res) => setTimeout(res, 22));
    }
  }
}

export const demoRuntimeService = new DemoRuntimeService();
