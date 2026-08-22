import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ollamaService, DEFAULT_OLLAMA_ENDPOINT } from '../lib/ollamaService';
import type {
  RuntimeStatus,
  LocalModelInfo,
  LocalRunningModel,
  PullProgressUpdate,
} from '../types/runtime';

interface RuntimeContextType {
  endpoint: string;
  setEndpoint: (endpoint: string) => void;
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
  startingTags: Set<string>;
  stoppingTags: Set<string>;
}

const RuntimeContext = createContext<RuntimeContextType | undefined>(undefined);

const STORAGE_ENDPOINT_KEY = 'agora_launcher_ollama_endpoint';

export const RuntimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const activeAbortControllers = useRef<Map<string, AbortController>>(new Map());

  const setEndpoint = (newEp: string) => {
    const clean = (newEp || DEFAULT_OLLAMA_ENDPOINT).trim().replace(/\/$/, '');
    setEndpointState(clean);
    try {
      localStorage.setItem(STORAGE_ENDPOINT_KEY, clean);
    } catch {}
  };

  // Check server health and populate installed & running models
  const refreshRuntime = useCallback(async () => {
    setIsChecking(true);
    try {
      const status = await ollamaService.checkServer(endpoint);
      setRuntimeStatus(status);

      if (status.available) {
        const [installed, running] = await Promise.all([
          ollamaService.listInstalledModels(endpoint),
          ollamaService.getRunningModels(endpoint),
        ]);
        setInstalledModels(installed);
        setRunningModels(running);

        // If there is a running model and no activeModelTag selected, select the first running model
        if (running.length > 0) {
          setActiveModelTag((prev) => prev || running[0].model || running[0].name);
        } else if (installed.length > 0) {
          setActiveModelTag((prev) => prev || installed[0].model || installed[0].name);
        }
      } else {
        setInstalledModels([]);
        setRunningModels([]);
      }
    } catch (err: any) {
      setRuntimeStatus({
        runtime: 'ollama',
        available: false,
        state: 'unavailable',
        endpoint,
        error: err.message || 'Failed to communicate with Ollama',
        models_count: 0,
        running_count: 0,
        lastChecked: Date.now(),
      });
      setInstalledModels([]);
      setRunningModels([]);
    } finally {
      setIsChecking(false);
    }
  }, [endpoint]);

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
    [installedModels]
  );

  const isModelRunning = useCallback(
    (modelTag: string) => {
      if (!modelTag) return false;
      const clean = modelTag.trim().toLowerCase();
      const withLatest = clean.includes(':') ? clean : `${clean}:latest`;
      const baseTag = clean.split(':')[0];

      return runningModels.some((r) => {
        const rn = (r.name || '').toLowerCase();
        const rm = (r.model || '').toLowerCase();
        return (
          rn === clean ||
          rn === withLatest ||
          rm === clean ||
          rm === withLatest ||
          rn.startsWith(baseTag + ':') ||
          rm.startsWith(baseTag + ':')
        );
      });
    },
    [runningModels]
  );

  const installModel = async (modelTag: string): Promise<boolean> => {
    const cleanTag = modelTag.trim();
    const key = cleanTag.toLowerCase();

    const controller = new AbortController();
    activeAbortControllers.current.set(key, controller);

    setPullProgress((prev) => ({
      ...prev,
      [key]: { status: 'Initiating download...', percent: 0 },
    }));

    try {
      const res = await ollamaService.pullModel(
        cleanTag,
        endpoint,
        (progress) => {
          setPullProgress((prev) => ({
            ...prev,
            [key]: progress,
          }));
        },
        controller.signal
      );

      activeAbortControllers.current.delete(key);

      if (res.success) {
        setPullProgress((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        await refreshRuntime();
        return true;
      } else {
        setPullProgress((prev) => ({
          ...prev,
          [key]: {
            status: res.message || 'Installation failed',
            error: res.error || 'Failed',
            percent: undefined,
          },
        }));
        return false;
      }
    } catch (err: any) {
      activeAbortControllers.current.delete(key);
      setPullProgress((prev) => ({
        ...prev,
        [key]: {
          status: 'Installation failed',
          error: err.message,
          percent: undefined,
        },
      }));
      return false;
    }
  };

  const cancelInstall = (modelTag: string) => {
    const key = modelTag.trim().toLowerCase();
    const controller = activeAbortControllers.current.get(key);
    if (controller) {
      controller.abort();
      activeAbortControllers.current.delete(key);
    }
    setPullProgress((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const startModel = async (modelTag: string): Promise<boolean> => {
    const cleanTag = modelTag.trim();
    setStartingTags((prev) => new Set(prev).add(cleanTag));

    try {
      const res = await ollamaService.loadModel(cleanTag, endpoint);
      if (res.success) {
        setActiveModelTag(cleanTag);
        await refreshRuntime();
        return true;
      }
      return false;
    } finally {
      setStartingTags((prev) => {
        const next = new Set(prev);
        next.delete(cleanTag);
        return next;
      });
    }
  };

  const stopModel = async (modelTag: string): Promise<boolean> => {
    const cleanTag = modelTag.trim();
    setStoppingTags((prev) => new Set(prev).add(cleanTag));

    try {
      const res = await ollamaService.unloadModel(cleanTag, endpoint);
      if (res.success) {
        await refreshRuntime();
        return true;
      }
      return false;
    } finally {
      setStoppingTags((prev) => {
        const next = new Set(prev);
        next.delete(cleanTag);
        return next;
      });
    }
  };

  const deleteModel = async (modelTag: string): Promise<boolean> => {
    const cleanTag = modelTag.trim();
    const res = await ollamaService.deleteModel(cleanTag, endpoint);
    if (res.success) {
      await refreshRuntime();
      return true;
    }
    return false;
  };

  return (
    <RuntimeContext.Provider
      value={{
        endpoint,
        setEndpoint,
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
        startingTags,
        stoppingTags,
      }}
    >
      {children}
    </RuntimeContext.Provider>
  );
};

export const useRuntime = () => {
  const context = useContext(RuntimeContext);
  if (!context) {
    throw new Error('useRuntime must be used within a RuntimeProvider');
  }
  return context;
};
