import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ollamaService, DEFAULT_OLLAMA_ENDPOINT } from '../lib/ollamaService';
import { demoRuntimeService } from '../lib/demoRuntimeService';
import type {
  RuntimeStatus,
  LocalModelInfo,
  LocalRunningModel,
  PullProgressUpdate,
  RuntimeType,
} from '../types/runtime';

export type ActiveRuntimeMode = 'ollama' | 'demo';

interface RuntimeContextType {
  endpoint: string;
  setEndpoint: (endpoint: string) => void;
  runtimeMode: ActiveRuntimeMode;
  setRuntimeMode: (mode: ActiveRuntimeMode) => void;
  runtimeStatus: RuntimeStatus;
  isChecking: boolean;
  installedModels: LocalModelInfo[];
  runningModels: LocalRunningModel[];
  pullProgress: Record<string, PullProgressUpdate>;
  isPulling: (modelTag: string) => boolean;
  isModelInstalled: (modelTag: string) => boolean;
  isModelRunning: (modelTag: string) => boolean;
  activeModelTag: string | null;
  setActiveModelTag: (tag: string | null) => void;
  installModel: (modelTag: string) => Promise<boolean>;
  cancelInstall: (modelTag: string) => void;
  startModel: (modelTag: string) => Promise<boolean>;
  stopModel: (modelTag: string) => Promise<boolean>;
  deleteModel: (modelTag: string) => Promise<boolean>;
  refreshRuntime: () => Promise<void>;
  resetDemo: () => void;
  startingTags: Set<string>;
  stoppingTags: Set<string>;
}

const RuntimeContext = createContext<RuntimeContextType | undefined>(undefined);

const STORAGE_ENDPOINT_KEY = 'agora_launcher_ollama_endpoint';
const STORAGE_RUNTIME_MODE_KEY = 'agora_launcher_runtime_mode';

export const RuntimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [runtimeMode, setRuntimeModeState] = useState<ActiveRuntimeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RUNTIME_MODE_KEY);
      if (saved === 'demo' || saved === 'ollama') return saved;
      return 'ollama';
    } catch {
      return 'ollama';
    }
  });

  const [endpoint, setEndpointState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_ENDPOINT_KEY) || DEFAULT_OLLAMA_ENDPOINT;
    } catch {
      return DEFAULT_OLLAMA_ENDPOINT;
    }
  });

  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus>({
    runtime: 'ollama',
    available: false,
    state: 'checking',
    endpoint: DEFAULT_OLLAMA_ENDPOINT,
    models_count: 0,
    running_count: 0,
    lastChecked: Date.now(),
  });

  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [installedModels, setInstalledModels] = useState<LocalModelInfo[]>([]);
  const [runningModels, setRunningModels] = useState<LocalRunningModel[]>([]);
  const [pullProgress, setPullProgress] = useState<Record<string, PullProgressUpdate>>({});
  const [activeModelTag, setActiveModelTag] = useState<string | null>(null);

  const [startingTags, setStartingTags] = useState<Set<string>>(new Set());
  const [stoppingTags, setStoppingTags] = useState<Set<string>>(new Set());

  const setRuntimeMode = (mode: ActiveRuntimeMode) => {
    setRuntimeModeState(mode);
    try {
      localStorage.setItem(STORAGE_RUNTIME_MODE_KEY, mode);
    } catch {}
  };

  const setEndpoint = (newEp: string) => {
    const clean = (newEp || DEFAULT_OLLAMA_ENDPOINT).trim().replace(/\/$/, '');
    setEndpointState(clean);
    try {
      localStorage.setItem(STORAGE_ENDPOINT_KEY, clean);
    } catch {}
  };

  // Helper to determine if a specific model tag targets the demo runtime
  const isDemoTarget = useCallback(
    (modelTag?: string | null) => {
      if (!modelTag) return runtimeMode === 'demo';
      const clean = modelTag.toLowerCase().trim();
      return runtimeMode === 'demo' || clean === 'qwen3-demo' || clean.includes('demo');
    },
    [runtimeMode]
  );

  // Check server health and populate installed & running models
  const refreshRuntime = useCallback(async () => {
    setIsChecking(true);
    try {
      // 1. Fetch Demo models (always available locally for demo flow)
      const [demoInstalled, demoRunning] = await Promise.all([
        demoRuntimeService.listInstalledModels(),
        demoRuntimeService.getRunningModels(),
      ]);

      if (runtimeMode === 'demo') {
        const status = await demoRuntimeService.checkStatus();
        setRuntimeStatus(status);
        setInstalledModels(demoInstalled);
        setRunningModels(demoRunning);

        if (demoRunning.length > 0 && !activeModelTag) {
          setActiveModelTag(demoRunning[0].model || demoRunning[0].name);
        } else if (demoInstalled.length > 0 && !activeModelTag) {
          setActiveModelTag(demoInstalled[0].model || demoInstalled[0].name);
        }
        return;
      }

      // 2. Real Ollama Mode
      const status = await ollamaService.checkServer(endpoint);
      setRuntimeStatus(status);

      if (status.available) {
        const [ollamaInstalled, ollamaRunning] = await Promise.all([
          ollamaService.listInstalledModels(endpoint),
          ollamaService.getRunningModels(endpoint),
        ]);

        // Merge Ollama models + any installed demo models so demo model remains accessible
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

        if (mergedRunning.length > 0 && !activeModelTag) {
          setActiveModelTag(mergedRunning[0].model || mergedRunning[0].name);
        } else if (mergedInstalled.length > 0 && !activeModelTag) {
          setActiveModelTag(mergedInstalled[0].model || mergedInstalled[0].name);
        }
      } else {
        // If Ollama is unavailable, still include any locally installed demo models
        setInstalledModels(demoInstalled);
        setRunningModels(demoRunning);
      }
    } catch (err: any) {
      const demoInstalled = await demoRuntimeService.listInstalledModels();
      const demoRunning = await demoRuntimeService.getRunningModels();

      setRuntimeStatus({
        runtime: 'ollama',
        available: false,
        state: 'unavailable',
        endpoint,
        error: err.message || 'Failed to communicate with Ollama',
        models_count: demoInstalled.length,
        running_count: demoRunning.length,
        lastChecked: Date.now(),
      });
      setInstalledModels(demoInstalled);
      setRunningModels(demoRunning);
    } finally {
      setIsChecking(false);
    }
  }, [endpoint, runtimeMode, activeModelTag]);

  // Initial check & interval polling
  useEffect(() => {
    refreshRuntime();
    const interval = setInterval(() => {
      refreshRuntime();
    }, 6000);
    return () => clearInterval(interval);
  }, [refreshRuntime]);

  const isPulling = (modelTag: string) => {
    const p = pullProgress[modelTag.trim().toLowerCase()];
    return Boolean(p && (p.percent === undefined || p.percent < 100) && !p.error);
  };

  const isModelInstalled = useCallback(
    (modelTag: string) => {
      if (!modelTag) return false;
      const clean = modelTag.trim().toLowerCase();

      // Check Demo Runtime first if applicable
      if (clean === 'qwen3-demo' || clean.includes('demo')) {
        return demoRuntimeService.isModelInstalled(clean);
      }

      if (runtimeMode === 'demo') {
        return demoRuntimeService.isModelInstalled(clean);
      }

      const withLatest = clean.includes(':') ? clean : `${clean}:latest`;
      const baseTag = clean.split(':')[0];

      return installedModels.some((m) => {
        const mn = (m.name || '').toLowerCase();
        const mm = (m.model || '').toLowerCase();
        return (
          mn === clean ||
          mn === withLatest ||
          mm === clean ||
          mm === withLatest ||
          mn.startsWith(baseTag + ':') ||
          mm.startsWith(baseTag + ':')
        );
      });
    },
    [installedModels, runtimeMode]
  );

  const isModelRunning = useCallback(
    (modelTag: string) => {
      if (!modelTag) return false;
      const clean = modelTag.trim().toLowerCase();

      if (clean === 'qwen3-demo' || clean.includes('demo')) {
        return demoRuntimeService.isModelRunning(clean);
      }

      if (runtimeMode === 'demo') {
        return demoRuntimeService.isModelRunning(clean);
      }

      const withLatest = clean.includes(':') ? clean : `${clean}:latest`;
      const baseTag = clean.split(':')[0];

      return runningModels.some((m) => {
        const mn = (m.name || '').toLowerCase();
        const mm = (m.model || '').toLowerCase();
        return (
          mn === clean ||
          mn === withLatest ||
          mm === clean ||
          mm === withLatest ||
          mn.startsWith(baseTag + ':') ||
          mm.startsWith(baseTag + ':')
        );
      });
    },
    [runningModels, runtimeMode]
  );

  const installModel = useCallback(
    async (modelTag: string): Promise<boolean> => {
      const cleanTag = modelTag.trim().toLowerCase();

      // Set initial progress
      setPullProgress((prev) => ({
        ...prev,
        [cleanTag]: { status: 'Preparing download...', percent: 0 },
      }));

      // Route to Demo Runtime if demo model or demo mode
      if (isDemoTarget(cleanTag)) {
        try {
          const success = await demoRuntimeService.installModel(cleanTag, (progress) => {
            setPullProgress((prev) => ({
              ...prev,
              [cleanTag]: progress,
            }));
          });
          await refreshRuntime();
          setPullProgress((prev) => {
            const next = { ...prev };
            delete next[cleanTag];
            return next;
          });
          return success;
        } catch {
          setPullProgress((prev) => {
            const next = { ...prev };
            delete next[cleanTag];
            return next;
          });
          return false;
        }
      }

      // Real Ollama flow
      try {
        const success = await ollamaService.pullModel(
          cleanTag,
          (progress) => {
            setPullProgress((prev) => ({
              ...prev,
              [cleanTag]: progress,
            }));
          },
          endpoint
        );

        await refreshRuntime();

        setPullProgress((prev) => {
          const next = { ...prev };
          delete next[cleanTag];
          return next;
        });

        return success;
      } catch {
        setPullProgress((prev) => {
          const next = { ...prev };
          delete next[cleanTag];
          return next;
        });
        return false;
      }
    },
    [endpoint, isDemoTarget, refreshRuntime]
  );

  const cancelInstall = useCallback(
    (modelTag: string) => {
      const cleanTag = modelTag.trim().toLowerCase();
      if (isDemoTarget(cleanTag)) {
        demoRuntimeService.cancelInstall(cleanTag);
      } else {
        ollamaService.cancelPull(cleanTag);
      }
      setPullProgress((prev) => {
        const next = { ...prev };
        delete next[cleanTag];
        return next;
      });
    },
    [isDemoTarget]
  );

  const startModel = useCallback(
    async (modelTag: string): Promise<boolean> => {
      const cleanTag = modelTag.trim().toLowerCase();
      setStartingTags((prev) => new Set([...prev, cleanTag]));

      try {
        if (isDemoTarget(cleanTag)) {
          const success = await demoRuntimeService.startModel(cleanTag);
          await refreshRuntime();
          return success;
        }

        const success = await ollamaService.startModel(cleanTag, endpoint);
        await refreshRuntime();
        return success;
      } finally {
        setStartingTags((prev) => {
          const next = new Set(prev);
          next.delete(cleanTag);
          return next;
        });
      }
    },
    [endpoint, isDemoTarget, refreshRuntime]
  );

  const stopModel = useCallback(
    async (modelTag: string): Promise<boolean> => {
      const cleanTag = modelTag.trim().toLowerCase();
      setStoppingTags((prev) => new Set([...prev, cleanTag]));

      try {
        if (isDemoTarget(cleanTag)) {
          const success = await demoRuntimeService.stopModel(cleanTag);
          await refreshRuntime();
          return success;
        }

        const success = await ollamaService.stopModel(cleanTag, endpoint);
        await refreshRuntime();
        return success;
      } finally {
        setStoppingTags((prev) => {
          const next = new Set(prev);
          next.delete(cleanTag);
          return next;
        });
      }
    },
    [endpoint, isDemoTarget, refreshRuntime]
  );

  const deleteModel = useCallback(
    async (modelTag: string): Promise<boolean> => {
      const cleanTag = modelTag.trim().toLowerCase();

      if (isDemoTarget(cleanTag)) {
        const success = await demoRuntimeService.deleteModel(cleanTag);
        await refreshRuntime();
        return success;
      }

      const success = await ollamaService.deleteModel(cleanTag, endpoint);
      await refreshRuntime();
      return success;
    },
    [endpoint, isDemoTarget, refreshRuntime]
  );

  const resetDemo = useCallback(() => {
    demoRuntimeService.resetDemo();
    refreshRuntime();
  }, [refreshRuntime]);

  return (
    <RuntimeContext.Provider
      value={{
        endpoint,
        setEndpoint,
        runtimeMode,
        setRuntimeMode,
        runtimeStatus,
        isChecking,
        installedModels,
        runningModels,
        pullProgress,
        isPulling,
        isModelInstalled,
        isModelRunning,
        activeModelTag,
        setActiveModelTag,
        installModel,
        cancelInstall,
        startModel,
        stopModel,
        deleteModel,
        refreshRuntime,
        resetDemo,
        startingTags,
        stoppingTags,
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
