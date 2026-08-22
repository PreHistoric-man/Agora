import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { TauriService } from '../services/TauriService';
import { demoRuntimeManager } from '../services/DemoRuntimeManager';
import type {
  RuntimeStatus,
  LocalModelInfo,
  LocalRunningModel,
  ModelLocalState,
  PullProgressUpdate,
} from '../types/runtime';
import { resolveModelRuntime } from '../utils/modelRuntimeResolver';
import type { Model } from '../data/mockData';

export interface ComputedModelRuntimeInfo {
  supported: boolean;
  runtime: 'ollama' | 'demo' | 'none';
  ollamaTag: string;
  recommendedTag: string;
  availableTags: string[];
  reason?: string;
  state: ModelLocalState;
  installed: boolean;
  running: boolean;
  sizeBytes?: number;
  sizeFormatted?: string;
  digest?: string;
  progress?: PullProgressUpdate;
  isLoading: boolean;
}

interface RuntimeContextType {
  runtimeStatus: RuntimeStatus | null;
  isDetecting: boolean;
  installedModels: LocalModelInfo[];
  runningModels: LocalRunningModel[];
  installingProgress: Record<string, PullProgressUpdate>;
  actionLoading: Record<string, boolean>;
  refreshRuntime: (endpoint?: string) => Promise<RuntimeStatus>;
  installModel: (model: Model, customTag?: string) => Promise<{ success: boolean; message: string }>;
  cancelInstall: (modelTag: string) => boolean;
  startModel: (model: Model, customTag?: string) => Promise<{ success: boolean; message: string }>;
  stopModel: (model: Model, customTag?: string) => Promise<{ success: boolean; message: string }>;
  removeModel: (model: Model, customTag?: string) => Promise<{ success: boolean; message: string }>;
  resetDemo: () => void;
  getModelRuntimeInfo: (model?: Model | null) => ComputedModelRuntimeInfo;
}

const RuntimeContext = createContext<RuntimeContextType | undefined>(undefined);

export const RuntimeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus | null>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(true);
  const [installedModels, setInstalledModels] = useState<LocalModelInfo[]>([]);
  const [runningModels, setRunningModels] = useState<LocalRunningModel[]>([]);
  const [installingProgress, setInstallingProgress] = useState<Record<string, PullProgressUpdate>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const refreshRuntime = useCallback(async (endpoint?: string): Promise<RuntimeStatus> => {
    setIsDetecting(true);
    try {
      // 1. Fetch Demo models (always accessible)
      const [demoInstalled, demoRunning] = await Promise.all([
        demoRuntimeManager.listInstalledModels(),
        demoRuntimeManager.getRunningModels(),
      ]);

      // 2. Fetch Ollama models
      const status = await TauriService.checkOllama(endpoint);
      setRuntimeStatus(status);

      if (status.available) {
        const [ollamaInstalled, ollamaRunning] = await Promise.all([
          TauriService.listOllamaModels(endpoint),
          TauriService.getOllamaRunningModels(endpoint),
        ]);

        const mergedInstalled = [...ollamaInstalled];
        for (const dm of demoInstalled) {
          if (!mergedInstalled.some((m) => m.model === dm.model || m.name === dm.name)) {
            mergedInstalled.push(dm);
          }
        }

        const mergedRunning = [...ollamaRunning];
        for (const dr of demoRunning) {
          if (!mergedRunning.some((r) => r.model === dr.model || r.name === dr.name)) {
            mergedRunning.push(dr);
          }
        }

        setInstalledModels(mergedInstalled);
        setRunningModels(mergedRunning);
      } else {
        setInstalledModels(demoInstalled);
        setRunningModels(demoRunning);
      }
      return status;
    } catch (err: any) {
      const demoInstalled = await demoRuntimeManager.listInstalledModels();
      const demoRunning = await demoRuntimeManager.getRunningModels();

      const fallback: RuntimeStatus = {
        runtime: 'ollama',
        available: false,
        endpoint: endpoint || 'http://127.0.0.1:11434',
        error: err.message || 'Connection failed',
        models_count: demoInstalled.length,
        running_count: demoRunning.length,
        lastChecked: Date.now(),
      };
      setRuntimeStatus(fallback);
      setInstalledModels(demoInstalled);
      setRunningModels(demoRunning);
      return fallback;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  // Initial detection & periodic background health check
  useEffect(() => {
    refreshRuntime();
    const interval = setInterval(() => {
      refreshRuntime();
    }, 15000);

    return () => clearInterval(interval);
  }, [refreshRuntime]);

  const getModelRuntimeInfo = useCallback(
    (model?: Model | null): ComputedModelRuntimeInfo => {
      const comp = resolveModelRuntime(model);
      if (!comp.supported) {
        return {
          supported: false,
          runtime: 'none',
          ollamaTag: '',
          recommendedTag: '',
          availableTags: [],
          reason: comp.reason,
          state: 'not_installed',
          installed: false,
          running: false,
          isLoading: false,
        };
      }

      const isDemo = comp.runtime === 'demo' || model?.id === 'qwen3-demo';
      const tag = comp.ollamaTag.toLowerCase();
      const tagWithLatest = tag.includes(':') ? tag : `${tag}:latest`;
      const baseTag = tag.split(':')[0];

      // Check if installed
      const foundInst = installedModels.find((m) => {
        const mn = (m.name || '').toLowerCase();
        const mm = (m.model || '').toLowerCase();
        return (
          mn === tag ||
          mn === tagWithLatest ||
          mm === tag ||
          mm === tagWithLatest ||
          mn.startsWith(`${baseTag}:`) ||
          mm.startsWith(`${baseTag}:`)
        );
      });

      // Check if running
      const foundRunning = runningModels.find((r) => {
        const rn = (r.name || '').toLowerCase();
        const rm = (r.model || '').toLowerCase();
        return (
          rn === tag ||
          rn === tagWithLatest ||
          rm === tag ||
          rm === tagWithLatest ||
          rn.startsWith(`${baseTag}:`) ||
          rm.startsWith(`${baseTag}:`)
        );
      });

      const isInstalled = Boolean(foundInst);
      const isRunning = Boolean(foundRunning);

      const progress = installingProgress[comp.ollamaTag] || installingProgress[foundInst?.name || ''];
      const isLoading = Boolean(actionLoading[comp.ollamaTag] || actionLoading[foundInst?.name || '']);

      let state: ModelLocalState = 'not_installed';
      if (progress && progress.percent !== 100) {
        state = 'installing';
      } else if (isRunning) {
        state = 'running';
      } else if (isInstalled) {
        state = 'installed';
      }

      return {
        supported: true,
        runtime: isDemo ? 'demo' : 'ollama',
        ollamaTag: comp.ollamaTag,
        recommendedTag: comp.recommendedTag,
        availableTags: comp.availableTags,
        reason: comp.reason,
        state,
        installed: isInstalled,
        running: isRunning,
        sizeBytes: foundInst?.size,
        sizeFormatted: foundInst?.sizeFormatted,
        digest: foundInst?.digest,
        progress,
        isLoading,
      };
    },
    [installedModels, runningModels, installingProgress, actionLoading]
  );

  const installModel = useCallback(
    async (model: Model, customTag?: string) => {
      const comp = resolveModelRuntime(model);
      const tagToUse = customTag || comp.ollamaTag;

      if (!tagToUse) {
        return { success: false, message: 'No valid runtime tag found for this model' };
      }

      setInstallingProgress((prev) => ({
        ...prev,
        [tagToUse]: { status: 'Preparing download...', percent: 0 },
      }));

      // Demo flow
      if (comp.runtime === 'demo' || model.id === 'qwen3-demo' || tagToUse.includes('demo')) {
        try {
          const success = await demoRuntimeManager.installModel(tagToUse, (prog) => {
            setInstallingProgress((prev) => ({
              ...prev,
              [tagToUse]: prog,
            }));
          });
          await refreshRuntime();
          setInstallingProgress((prev) => {
            const next = { ...prev };
            delete next[tagToUse];
            return next;
          });
          return { success, message: success ? 'Demo model installed' : 'Demo installation failed' };
        } catch (err: any) {
          setInstallingProgress((prev) => {
            const next = { ...prev };
            delete next[tagToUse];
            return next;
          });
          return { success: false, message: err.message || 'Demo install error' };
        }
      }

      // Ollama flow
      try {
        const result = await TauriService.pullOllamaModel(tagToUse, (progress) => {
          setInstallingProgress((prev) => ({
            ...prev,
            [tagToUse]: progress,
          }));
        });

        await refreshRuntime();

        setInstallingProgress((prev) => {
          const next = { ...prev };
          delete next[tagToUse];
          return next;
        });

        return result;
      } catch (err: any) {
        setInstallingProgress((prev) => {
          const next = { ...prev };
          delete next[tagToUse];
          return next;
        });
        return { success: false, message: err.message || 'Installation error' };
      }
    },
    [refreshRuntime]
  );

  const cancelInstall = useCallback((modelTag: string): boolean => {
    if (modelTag.includes('demo')) {
      demoRuntimeManager.cancelInstall(modelTag);
      setInstallingProgress((prev) => {
        const next = { ...prev };
        delete next[modelTag];
        return next;
      });
      return true;
    }

    const cancelled = TauriService.cancelModelInstall(modelTag);
    if (cancelled) {
      setInstallingProgress((prev) => {
        const next = { ...prev };
        delete next[modelTag];
        return next;
      });
    }
    return cancelled;
  }, []);

  const startModel = useCallback(
    async (model: Model, customTag?: string) => {
      const comp = resolveModelRuntime(model);
      const tagToUse = customTag || comp.ollamaTag;

      setActionLoading((prev) => ({ ...prev, [tagToUse]: true }));
      try {
        if (comp.runtime === 'demo' || model.id === 'qwen3-demo' || tagToUse.includes('demo')) {
          const success = await demoRuntimeManager.startModel(tagToUse);
          await refreshRuntime();
          return { success, message: success ? 'Demo model started' : 'Failed to start demo model' };
        }

        const result = await TauriService.runOllamaModel(tagToUse);
        await refreshRuntime();
        return result;
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to start model' };
      } finally {
        setActionLoading((prev) => {
          const next = { ...prev };
          delete next[tagToUse];
          return next;
        });
      }
    },
    [refreshRuntime]
  );

  const stopModel = useCallback(
    async (model: Model, customTag?: string) => {
      const comp = resolveModelRuntime(model);
      const tagToUse = customTag || comp.ollamaTag;

      setActionLoading((prev) => ({ ...prev, [tagToUse]: true }));
      try {
        if (comp.runtime === 'demo' || model.id === 'qwen3-demo' || tagToUse.includes('demo')) {
          const success = await demoRuntimeManager.stopModel(tagToUse);
          await refreshRuntime();
          return { success, message: success ? 'Demo model stopped' : 'Failed to stop demo model' };
        }

        const result = await TauriService.stopOllamaModel(tagToUse);
        await refreshRuntime();
        return result;
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to stop model' };
      } finally {
        setActionLoading((prev) => {
          const next = { ...prev };
          delete next[tagToUse];
          return next;
        });
      }
    },
    [refreshRuntime]
  );

  const removeModel = useCallback(
    async (model: Model, customTag?: string) => {
      const comp = resolveModelRuntime(model);
      const tagToUse = customTag || comp.ollamaTag;

      setActionLoading((prev) => ({ ...prev, [tagToUse]: true }));
      try {
        if (comp.runtime === 'demo' || model.id === 'qwen3-demo' || tagToUse.includes('demo')) {
          const success = await demoRuntimeManager.deleteModel(tagToUse);
          await refreshRuntime();
          return { success, message: success ? 'Demo model deleted' : 'Failed to delete demo model' };
        }

        const result = await TauriService.removeOllamaModel(tagToUse);
        await refreshRuntime();
        return result;
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to remove model' };
      } finally {
        setActionLoading((prev) => {
          const next = { ...prev };
          delete next[tagToUse];
          return next;
        });
      }
    },
    [refreshRuntime]
  );

  const resetDemo = useCallback(() => {
    demoRuntimeManager.resetDemo();
    refreshRuntime();
  }, [refreshRuntime]);

  return (
    <RuntimeContext.Provider
      value={{
        runtimeStatus,
        isDetecting,
        installedModels,
        runningModels,
        installingProgress,
        actionLoading,
        refreshRuntime,
        installModel,
        cancelInstall,
        startModel,
        stopModel,
        removeModel,
        resetDemo,
        getModelRuntimeInfo,
      }}
    >
      {children}
    </RuntimeContext.Provider>
  );
};

export const useRuntime = (): RuntimeContextType => {
  const context = useContext(RuntimeContext);
  if (!context) {
    throw new Error('useRuntime must be used within a RuntimeProvider');
  }
  return context;
};
