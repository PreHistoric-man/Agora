import { invoke } from '@tauri-apps/api/core';
import type {
  IRuntimeManager,
  RuntimeType,
  RuntimeStatus,
  LocalModelInfo,
  LocalRunningModel,
  ModelRuntimeStatus,
  PullProgressUpdate,
  RuntimeActionResult
} from '../types/runtime';
import { isTauriEnvironment } from './TauriService';
import { formatBytes } from '../utils/modelRuntimeResolver';

const DEFAULT_ENDPOINT = 'http://127.0.0.1:11434';

export class OllamaRuntimeManager implements IRuntimeManager {
  readonly type: RuntimeType = 'ollama';
  private cachedStatus: RuntimeStatus | null = null;
  private isChecking: boolean = false;
  private activePullAbortControllers = new Map<string, AbortController>();

  /**
   * Probes Ollama service to verify connectivity and retrieve system status.
   */
  async detectRuntime(endpoint: string = DEFAULT_ENDPOINT): Promise<RuntimeStatus> {
    const cleanEndpoint = (endpoint || DEFAULT_ENDPOINT).trim().replace(/\/$/, '');
    const isNative = isTauriEnvironment();

    if (isNative) {
      try {
        const rawStatus = await invoke<any>('check_ollama', { endpoint: cleanEndpoint });
        const result: RuntimeStatus = {
          runtime: 'ollama',
          available: Boolean(rawStatus?.available),
          version: rawStatus?.version || undefined,
          endpoint: cleanEndpoint,
          error: rawStatus?.error || undefined,
          models_count: Number(rawStatus?.models_count || 0),
          running_count: Number(rawStatus?.running_count || 0),
          lastChecked: Date.now()
        };
        this.cachedStatus = result;
        return result;
      } catch (err) {
        console.warn('Native Tauri check_ollama error:', err);
      }
    }

    // Direct HTTP check (works for browser environment or Tauri fallback)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${cleanEndpoint}/api/version`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        
        // Fetch model count and running count in parallel
        let modelsCount = 0;
        let runningCount = 0;
        try {
          const tagsRes = await fetch(`${cleanEndpoint}/api/tags`);
          if (tagsRes.ok) {
            const tagsData = await tagsRes.json();
            modelsCount = tagsData?.models?.length || 0;
          }
        } catch {
          // ignore sub-failure
        }

        try {
          const psRes = await fetch(`${cleanEndpoint}/api/ps`);
          if (psRes.ok) {
            const psData = await psRes.json();
            runningCount = psData?.models?.length || 0;
          }
        } catch {
          // ignore sub-failure
        }

        const status: RuntimeStatus = {
          runtime: 'ollama',
          available: true,
          version: data?.version || '0.5.x',
          endpoint: cleanEndpoint,
          models_count: modelsCount,
          running_count: runningCount,
          lastChecked: Date.now()
        };
        this.cachedStatus = status;
        return status;
      } else {
        const status: RuntimeStatus = {
          runtime: 'ollama',
          available: false,
          endpoint: cleanEndpoint,
          error: `Ollama returned HTTP ${response.status}`,
          models_count: 0,
          running_count: 0,
          lastChecked: Date.now()
        };
        this.cachedStatus = status;
        return status;
      }
    } catch (err: any) {
      const status: RuntimeStatus = {
        runtime: 'ollama',
        available: false,
        endpoint: cleanEndpoint,
        error: err.name === 'AbortError' ? 'Connection timed out' : 'Ollama service is not running or unreachable',
        models_count: 0,
        running_count: 0,
        lastChecked: Date.now()
      };
      this.cachedStatus = status;
      return status;
    }
  }

  /**
   * Retrieves list of all locally installed models in Ollama storage.
   */
  async listInstalledModels(endpoint: string = DEFAULT_ENDPOINT): Promise<LocalModelInfo[]> {
    const cleanEndpoint = (endpoint || DEFAULT_ENDPOINT).trim().replace(/\/$/, '');
    const isNative = isTauriEnvironment();

    if (isNative) {
      try {
        const rawModels = await invoke<any[]>('list_ollama_models', { endpoint: cleanEndpoint });
        if (Array.isArray(rawModels)) {
          return rawModels.map((m) => ({
            name: m.name,
            model: m.model,
            size: Number(m.size || 0),
            sizeFormatted: formatBytes(Number(m.size || 0)),
            digest: m.digest || '',
            modifiedAt: m.modified_at,
            details: m.details
          }));
        }
      } catch (err) {
        console.warn('Native Tauri list_ollama_models error:', err);
      }
    }

    // Direct HTTP fetch
    try {
      const response = await fetch(`${cleanEndpoint}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        const models = data?.models || [];
        return models.map((m: any) => ({
          name: m.name,
          model: m.model,
          size: Number(m.size || 0),
          sizeFormatted: formatBytes(Number(m.size || 0)),
          digest: m.digest || '',
          modifiedAt: m.modified_at,
          details: m.details
        }));
      }
    } catch (err) {
      console.warn('Error fetching Ollama installed models:', err);
    }
    return [];
  }

  /**
   * Retrieves list of models currently loaded into memory/VRAM.
   */
  async getRunningModels(endpoint: string = DEFAULT_ENDPOINT): Promise<LocalRunningModel[]> {
    const cleanEndpoint = (endpoint || DEFAULT_ENDPOINT).trim().replace(/\/$/, '');
    const isNative = isTauriEnvironment();

    if (isNative) {
      try {
        const rawRunning = await invoke<any[]>('get_ollama_running_models', { endpoint: cleanEndpoint });
        if (Array.isArray(rawRunning)) {
          return rawRunning.map((r) => ({
            name: r.name,
            model: r.model,
            size: Number(r.size || 0),
            digest: r.digest || '',
            sizeVram: r.size_vram ? Number(r.size_vram) : undefined,
            sizeVramFormatted: r.size_vram ? formatBytes(Number(r.size_vram)) : undefined,
            expiresAt: r.expires_at,
            details: r.details
          }));
        }
      } catch (err) {
        console.warn('Native Tauri get_ollama_running_models error:', err);
      }
    }

    // Direct HTTP fetch
    try {
      const response = await fetch(`${cleanEndpoint}/api/ps`);
      if (response.ok) {
        const data = await response.json();
        const models = data?.models || [];
        return models.map((r: any) => ({
          name: r.name,
          model: r.model,
          size: Number(r.size || 0),
          digest: r.digest || '',
          sizeVram: r.size_vram ? Number(r.size_vram) : undefined,
          sizeVramFormatted: r.size_vram ? formatBytes(Number(r.size_vram)) : undefined,
          expiresAt: r.expires_at,
          details: r.details
        }));
      }
    } catch (err) {
      console.warn('Error fetching Ollama running models:', err);
    }
    return [];
  }

  /**
   * Obtains comprehensive status for a specific model tag.
   */
  async getModelStatus(modelTag: string, endpoint: string = DEFAULT_ENDPOINT): Promise<Partial<ModelRuntimeStatus>> {
    const cleanEndpoint = (endpoint || DEFAULT_ENDPOINT).trim().replace(/\/$/, '');
    const isNative = isTauriEnvironment();

    if (isNative) {
      try {
        const status = await invoke<any>('get_ollama_model_status', {
          modelTag,
          endpoint: cleanEndpoint
        });
        if (status) {
          return {
            installed: Boolean(status.installed),
            running: Boolean(status.running),
            state: status.running ? 'running' : status.installed ? 'installed' : 'not_installed',
            sizeBytes: status.size ? Number(status.size) : undefined,
            sizeFormatted: status.size ? formatBytes(Number(status.size)) : undefined,
            digest: status.digest,
            parameterSize: status.parameter_size,
            quantizationLevel: status.quantization_level,
            endpoint: cleanEndpoint,
            lastUpdated: Date.now()
          };
        }
      } catch (err) {
        console.warn('Native Tauri get_ollama_model_status error:', err);
      }
    }

    // Direct HTTP matching
    const [installed, running] = await Promise.all([
      this.listInstalledModels(cleanEndpoint),
      this.getRunningModels(cleanEndpoint)
    ]);

    const cleanTag = modelTag.trim().toLowerCase();
    const tagWithLatest = cleanTag.includes(':') ? cleanTag : `${cleanTag}:latest`;

    const foundInst = installed.find((m) => {
      const mn = m.name.toLowerCase();
      const mm = m.model.toLowerCase();
      return mn === cleanTag || mn === tagWithLatest || mm === cleanTag || mm === tagWithLatest;
    });

    const foundRunning = running.find((r) => {
      const rn = r.name.toLowerCase();
      const rm = r.model.toLowerCase();
      return rn === cleanTag || rn === tagWithLatest || rm === cleanTag || rm === tagWithLatest;
    });

    const isInstalled = Boolean(foundInst);
    const isRunning = Boolean(foundRunning);

    return {
      installed: isInstalled,
      running: isRunning,
      state: isRunning ? 'running' : isInstalled ? 'installed' : 'not_installed',
      sizeBytes: foundInst?.size,
      sizeFormatted: foundInst?.sizeFormatted,
      digest: foundInst?.digest,
      parameterSize: foundInst?.details?.parameter_size,
      quantizationLevel: foundInst?.details?.quantization_level,
      endpoint: cleanEndpoint,
      lastUpdated: Date.now()
    };
  }

  /**
   * Installs (pulls) an AI model via Ollama API with real streaming progress.
   */
  async installModel(
    modelTag: string,
    endpoint: string = DEFAULT_ENDPOINT,
    onProgress?: (progress: PullProgressUpdate) => void
  ): Promise<RuntimeActionResult> {
    const cleanEndpoint = (endpoint || DEFAULT_ENDPOINT).trim().replace(/\/$/, '');
    const cleanTag = modelTag.trim();

    onProgress?.({ status: 'Connecting to Ollama...', percent: 5 });

    const abortController = new AbortController();
    this.activePullAbortControllers.set(cleanTag, abortController);

    try {
      const response = await fetch(`${cleanEndpoint}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanTag, stream: true }),
        signal: abortController.signal
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        this.activePullAbortControllers.delete(cleanTag);
        return {
          success: false,
          message: `Ollama installation failed (HTTP ${response.status})`,
          error: errText || `HTTP ${response.status}`
        };
      }

      if (!response.body) {
        this.activePullAbortControllers.delete(cleanTag);
        return { success: true, message: `Installed ${cleanTag}` };
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            const statusStr = parsed.status || 'Downloading...';
            let percent: number | undefined;

            if (parsed.total && parsed.completed) {
              percent = Math.min(100, Math.round((parsed.completed / parsed.total) * 100));
            } else if (statusStr.includes('manifest')) {
              percent = 10;
            } else if (statusStr.includes('verifying')) {
              percent = 95;
            } else if (statusStr.includes('success')) {
              percent = 100;
            }

            onProgress?.({
              status: statusStr,
              completed: parsed.completed,
              total: parsed.total,
              percent
            });
          } catch {
            // line parse error
          }
        }
      }

      this.activePullAbortControllers.delete(cleanTag);
      onProgress?.({ status: 'Installation completed', percent: 100 });
      return {
        success: true,
        message: `Successfully installed model '${cleanTag}' into Ollama`
      };
    } catch (err: any) {
      this.activePullAbortControllers.delete(cleanTag);
      if (err.name === 'AbortError') {
        return {
          success: false,
          message: 'Installation cancelled by user',
          error: 'Aborted'
        };
      }
      return {
        success: false,
        message: `Failed to install model '${cleanTag}'`,
        error: err.message || String(err)
      };
    }
  }

  /**
   * Starts / loads a model into memory.
   */
  async startModel(modelTag: string, endpoint: string = DEFAULT_ENDPOINT): Promise<RuntimeActionResult> {
    const cleanEndpoint = (endpoint || DEFAULT_ENDPOINT).trim().replace(/\/$/, '');
    const isNative = isTauriEnvironment();

    if (isNative) {
      try {
        const res = await invoke<any>('run_ollama_model', {
          modelTag,
          endpoint: cleanEndpoint
        });
        if (res?.success) {
          return { success: true, message: res.message || `Started ${modelTag}` };
        }
      } catch (err) {
        console.warn('Native Tauri run_ollama_model error:', err);
      }
    }

    // Direct HTTP
    try {
      const response = await fetch(`${cleanEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelTag,
          prompt: '',
          keep_alive: '1h'
        })
      });

      if (response.ok) {
        return {
          success: true,
          message: `Model '${modelTag}' successfully loaded into Ollama runtime`
        };
      } else {
        const errText = await response.text().catch(() => '');
        return {
          success: false,
          message: `Failed to launch model '${modelTag}'`,
          error: errText || `HTTP ${response.status}`
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to start model '${modelTag}'`,
        error: err.message || String(err)
      };
    }
  }

  /**
   * Stops / unloads a model from memory (keep_alive: 0).
   */
  async stopModel(modelTag: string, endpoint: string = DEFAULT_ENDPOINT): Promise<RuntimeActionResult> {
    const cleanEndpoint = (endpoint || DEFAULT_ENDPOINT).trim().replace(/\/$/, '');
    const isNative = isTauriEnvironment();

    if (isNative) {
      try {
        const res = await invoke<any>('stop_ollama_model', {
          modelTag,
          endpoint: cleanEndpoint
        });
        if (res?.success) {
          return { success: true, message: res.message || `Stopped ${modelTag}` };
        }
      } catch (err) {
        console.warn('Native Tauri stop_ollama_model error:', err);
      }
    }

    // Direct HTTP
    try {
      const response = await fetch(`${cleanEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelTag,
          keep_alive: 0
        })
      });

      if (response.ok) {
        return {
          success: true,
          message: `Model '${modelTag}' unloaded from Ollama memory`
        };
      } else {
        const errText = await response.text().catch(() => '');
        return {
          success: false,
          message: `Failed to stop model '${modelTag}'`,
          error: errText || `HTTP ${response.status}`
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to stop model '${modelTag}'`,
        error: err.message || String(err)
      };
    }
  }

  /**
   * Removes / deletes a model from local disk storage.
   */
  async removeModel(modelTag: string, endpoint: string = DEFAULT_ENDPOINT): Promise<RuntimeActionResult> {
    const cleanEndpoint = (endpoint || DEFAULT_ENDPOINT).trim().replace(/\/$/, '');
    const isNative = isTauriEnvironment();

    if (isNative) {
      try {
        const res = await invoke<any>('remove_ollama_model', {
          modelTag,
          endpoint: cleanEndpoint
        });
        if (res?.success) {
          return { success: true, message: res.message || `Deleted ${modelTag}` };
        }
      } catch (err) {
        console.warn('Native Tauri remove_ollama_model error:', err);
      }
    }

    // Direct HTTP
    try {
      const response = await fetch(`${cleanEndpoint}/api/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelTag })
      });

      if (response.ok) {
        return {
          success: true,
          message: `Model '${modelTag}' deleted from Ollama local storage`
        };
      } else {
        const errText = await response.text().catch(() => '');
        return {
          success: false,
          message: `Failed to delete model '${modelTag}'`,
          error: errText || `HTTP ${response.status}`
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to remove model '${modelTag}'`,
        error: err.message || String(err)
      };
    }
  }

  /**
   * Cancels an ongoing pull operation if active.
   */
  cancelInstall(modelTag: string): boolean {
    const controller = this.activePullAbortControllers.get(modelTag.trim());
    if (controller) {
      controller.abort();
      this.activePullAbortControllers.delete(modelTag.trim());
      return true;
    }
    return false;
  }
}

export const ollamaRuntimeManager = new OllamaRuntimeManager();
