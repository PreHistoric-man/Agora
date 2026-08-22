import { formatBytes } from './modelCompatibility';
import type {
  RuntimeStatus,
  LocalModelInfo,
  LocalRunningModel,
  PullProgressUpdate,
  RuntimeActionResult,
  ChatMessage,
  ChatOptions
} from '../types/runtime';

export const DEFAULT_OLLAMA_ENDPOINT = 'http://127.0.0.1:11434';

export class OllamaService {
  /**
   * Probes Ollama HTTP API to determine whether the server is running and get its version.
   */
  async checkServer(endpoint: string = DEFAULT_OLLAMA_ENDPOINT): Promise<RuntimeStatus> {
    const cleanEndpoint = (endpoint || DEFAULT_OLLAMA_ENDPOINT).trim().replace(/\/$/, '');
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${cleanEndpoint}/api/version`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        
        // Fetch count of installed and running models
        let modelsCount = 0;
        let runningCount = 0;

        try {
          const [tagsRes, psRes] = await Promise.all([
            fetch(`${cleanEndpoint}/api/tags`, { signal: AbortSignal.timeout(2000) }),
            fetch(`${cleanEndpoint}/api/ps`, { signal: AbortSignal.timeout(2000) })
          ]);

          if (tagsRes.ok) {
            const tagsData = await tagsRes.json();
            modelsCount = tagsData?.models?.length || 0;
          }
          if (psRes.ok) {
            const psData = await psRes.json();
            runningCount = psData?.models?.length || 0;
          }
        } catch {
          // secondary check non-critical
        }

        return {
          runtime: 'ollama',
          available: true,
          state: 'online',
          version: data?.version || '0.5.x',
          endpoint: cleanEndpoint,
          models_count: modelsCount,
          running_count: runningCount,
          lastChecked: startTime,
        };
      } else {
        return {
          runtime: 'ollama',
          available: false,
          state: 'unavailable',
          endpoint: cleanEndpoint,
          error: `Ollama service returned HTTP ${res.status}`,
          models_count: 0,
          running_count: 0,
          lastChecked: startTime,
        };
      }
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError' || err.name === 'TimeoutError';
      return {
        runtime: 'ollama',
        available: false,
        state: isTimeout ? 'unavailable' : 'stopped',
        endpoint: cleanEndpoint,
        error: isTimeout
          ? 'Connection timed out. Ollama server may be busy or unreachable.'
          : 'Ollama is not running. Start Ollama and try again.',
        models_count: 0,
        running_count: 0,
        lastChecked: startTime,
      };
    }
  }

  /**
   * Lists all locally installed models on the Ollama host.
   */
  async listInstalledModels(endpoint: string = DEFAULT_OLLAMA_ENDPOINT): Promise<LocalModelInfo[]> {
    const cleanEndpoint = (endpoint || DEFAULT_OLLAMA_ENDPOINT).trim().replace(/\/$/, '');
    try {
      const res = await fetch(`${cleanEndpoint}/api/tags`, {
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const data = await res.json();
        const models = data?.models || [];
        return models.map((m: any) => ({
          name: m.name || m.model,
          model: m.model || m.name,
          size: Number(m.size || 0),
          sizeFormatted: formatBytes(Number(m.size || 0)),
          digest: m.digest || '',
          modifiedAt: m.modified_at,
          details: m.details
        }));
      }
    } catch (err) {
      console.warn('Ollama listInstalledModels fetch error:', err);
    }
    return [];
  }

  /**
   * Retrieves list of models currently loaded into memory/VRAM.
   */
  async getRunningModels(endpoint: string = DEFAULT_OLLAMA_ENDPOINT): Promise<LocalRunningModel[]> {
    const cleanEndpoint = (endpoint || DEFAULT_OLLAMA_ENDPOINT).trim().replace(/\/$/, '');
    try {
      const res = await fetch(`${cleanEndpoint}/api/ps`, {
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const data = await res.json();
        const models = data?.models || [];
        return models.map((r: any) => ({
          name: r.name || r.model,
          model: r.model || r.name,
          size: Number(r.size || 0),
          digest: r.digest || '',
          sizeVram: r.size_vram ? Number(r.size_vram) : undefined,
          sizeVramFormatted: r.size_vram ? formatBytes(Number(r.size_vram)) : undefined,
          expiresAt: r.expires_at,
          details: r.details
        }));
      }
    } catch (err) {
      console.warn('Ollama getRunningModels fetch error:', err);
    }
    return [];
  }

  /**
   * Pulls (downloads/installs) an AI model with real streaming progress.
   */
  async pullModel(
    modelTag: string,
    endpoint: string = DEFAULT_OLLAMA_ENDPOINT,
    onProgress?: (progress: PullProgressUpdate) => void,
    signal?: AbortSignal
  ): Promise<RuntimeActionResult> {
    const cleanEndpoint = (endpoint || DEFAULT_OLLAMA_ENDPOINT).trim().replace(/\/$/, '');
    const cleanTag = modelTag.trim();

    onProgress?.({ status: 'Connecting to Ollama...', percent: 5 });

    try {
      const res = await fetch(`${cleanEndpoint}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanTag, stream: true }),
        signal
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        return {
          success: false,
          message: `Ollama model pull failed (HTTP ${res.status})`,
          error: errText || `HTTP ${res.status}`
        };
      }

      if (!res.body) {
        return { success: true, message: `Installed ${cleanTag}` };
      }

      const reader = res.body.getReader();
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
            } else if (statusStr.includes('manifest') || statusStr.includes('pulling manifest')) {
              percent = 10;
            } else if (statusStr.includes('verifying') || statusStr.includes('writing')) {
              percent = 95;
            } else if (statusStr.includes('success')) {
              percent = 100;
            }

            onProgress?.({
              status: statusStr,
              completed: parsed.completed,
              total: parsed.total,
              percent,
              digest: parsed.digest
            });
          } catch {
            // non-json line ignore
          }
        }
      }

      onProgress?.({ status: 'Model installation complete', percent: 100 });
      return {
        success: true,
        message: `Successfully installed model '${cleanTag}' into Ollama`
      };
    } catch (err: any) {
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
   * Loads a model into memory so it is ready for real-time inference.
   */
  async loadModel(modelTag: string, endpoint: string = DEFAULT_OLLAMA_ENDPOINT): Promise<RuntimeActionResult> {
    const cleanEndpoint = (endpoint || DEFAULT_OLLAMA_ENDPOINT).trim().replace(/\/$/, '');
    const cleanTag = modelTag.trim();

    try {
      const res = await fetch(`${cleanEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: cleanTag,
          prompt: '',
          keep_alive: '1h'
        })
      });

      if (res.ok) {
        return {
          success: true,
          message: `Model '${cleanTag}' loaded into memory.`
        };
      } else {
        const errText = await res.text().catch(() => '');
        return {
          success: false,
          message: `Failed to launch model '${cleanTag}'`,
          error: errText || `HTTP ${res.status}`
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to start model '${cleanTag}'`,
        error: err.message || 'Ollama connection failed'
      };
    }
  }

  /**
   * Unloads a model from memory (releases VRAM / RAM).
   */
  async unloadModel(modelTag: string, endpoint: string = DEFAULT_OLLAMA_ENDPOINT): Promise<RuntimeActionResult> {
    const cleanEndpoint = (endpoint || DEFAULT_OLLAMA_ENDPOINT).trim().replace(/\/$/, '');
    const cleanTag = modelTag.trim();

    try {
      const res = await fetch(`${cleanEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: cleanTag,
          keep_alive: 0
        })
      });

      if (res.ok) {
        return {
          success: true,
          message: `Model '${cleanTag}' unloaded from memory.`
        };
      } else {
        const errText = await res.text().catch(() => '');
        return {
          success: false,
          message: `Failed to stop model '${cleanTag}'`,
          error: errText || `HTTP ${res.status}`
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to stop model '${cleanTag}'`,
        error: err.message || 'Ollama connection failed'
      };
    }
  }

  /**
   * Deletes an installed model from disk.
   */
  async deleteModel(modelTag: string, endpoint: string = DEFAULT_OLLAMA_ENDPOINT): Promise<RuntimeActionResult> {
    const cleanEndpoint = (endpoint || DEFAULT_OLLAMA_ENDPOINT).trim().replace(/\/$/, '');
    const cleanTag = modelTag.trim();

    try {
      const res = await fetch(`${cleanEndpoint}/api/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanTag })
      });

      if (res.ok) {
        return {
          success: true,
          message: `Model '${cleanTag}' deleted from local storage.`
        };
      } else {
        const errText = await res.text().catch(() => '');
        return {
          success: false,
          message: `Failed to delete model '${cleanTag}'`,
          error: errText || `HTTP ${res.status}`
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to delete model '${cleanTag}'`,
        error: err.message || 'Ollama connection failed'
      };
    }
  }

  /**
   * Sends a streaming chat completion request to the local Ollama API.
   */
  async streamChat(
    modelTag: string,
    messages: { role: string; content: string }[],
    options: ChatOptions = {},
    endpoint: string = DEFAULT_OLLAMA_ENDPOINT,
    onChunk: (chunk: { content: string; done: boolean; tokens?: number; tokensPerSec?: number; durationMs?: number }) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const cleanEndpoint = (endpoint || DEFAULT_OLLAMA_ENDPOINT).trim().replace(/\/$/, '');
    const cleanTag = modelTag.trim();

    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content
    }));

    if (options.system_prompt && !formattedMessages.some((m) => m.role === 'system')) {
      formattedMessages.unshift({
        role: 'system',
        content: options.system_prompt
      });
    }

    const bodyPayload: any = {
      model: cleanTag,
      messages: formattedMessages,
      stream: true,
      options: {
        temperature: options.temperature ?? 0.7,
        top_p: options.top_p ?? 0.9,
        num_ctx: options.num_ctx ?? 4096
      }
    };

    const res = await fetch(`${cleanEndpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
      signal
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Ollama Chat Error (HTTP ${res.status}): ${errText || res.statusText}`);
    }

    if (!res.body) {
      throw new Error('No response stream received from Ollama');
    }

    const reader = res.body.getReader();
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
          const chunkContent = parsed.message?.content || '';
          const isDone = Boolean(parsed.done);

          let tokens = parsed.eval_count;
          let tokensPerSec: number | undefined;
          let durationMs: number | undefined;

          if (parsed.eval_duration && parsed.eval_count) {
            // eval_duration is in nanoseconds
            const seconds = parsed.eval_duration / 1e9;
            tokensPerSec = Number((parsed.eval_count / seconds).toFixed(1));
          }
          if (parsed.total_duration) {
            durationMs = Math.round(parsed.total_duration / 1e6);
          }

          onChunk({
            content: chunkContent,
            done: isDone,
            tokens,
            tokensPerSec,
            durationMs
          });
        } catch {
          // JSON parse skip
        }
      }
    }
  }
}

export const ollamaService = new OllamaService();
