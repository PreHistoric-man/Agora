import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { fallbackModels } from '../data/fallbackModels';
import type { Model, LibraryItem, Deployment, LauncherView } from '../types';

interface ToastInfo {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface LauncherContextType {
  activeView: LauncherView;
  setActiveView: (view: LauncherView) => void;
  models: Model[];
  modelsLoading: boolean;
  libraryItems: LibraryItem[];
  libraryLoading: boolean;
  deployments: Deployment[];
  deploymentsLoading: boolean;
  selectedModelId: string | null;
  selectedModel: Model | null;
  isDetailOpen: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
  openModelDetail: (modelId: string) => void;
  closeModelDetail: () => void;
  addToLibrary: (modelId: string) => Promise<boolean>;
  removeFromLibrary: (modelId: string) => Promise<boolean>;
  isInLibrary: (modelId: string) => boolean;
  refreshAll: () => Promise<void>;
  syncLibrary: () => Promise<void>;
}

const LauncherContext = createContext<LauncherContextType | undefined>(undefined);

// Helper to resolve or construct a model from any identifier
export function resolveModelFromPool(modelId: string, modelPool: Model[] = []): Model {
  // 1. Direct ID match
  let found = modelPool.find((m) => m.id === modelId);
  if (found) return found;

  // 2. Search fallback models
  found = fallbackModels.find((m) => m.id === modelId);
  if (found) return found;

  // 3. Match by endpoint ID or runtime model ID
  found = modelPool.find(
    (m) =>
      m.modelEndpointId === modelId ||
      m.runtime_model_id === modelId ||
      m.runtimeModelId === modelId ||
      m.name.toLowerCase() === modelId.toLowerCase()
  );
  if (found) return found;

  found = fallbackModels.find(
    (m) =>
      m.modelEndpointId === modelId ||
      m.runtime_model_id === modelId ||
      m.runtimeModelId === modelId ||
      m.name.toLowerCase() === modelId.toLowerCase()
  );
  if (found) return found;

  // 4. Construct a graceful fallback Model object so nothing is ever dropped
  const cleanName = modelId
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    id: modelId,
    name: cleanName,
    provider: 'Agora Community',
    providerLogo: '⚡',
    description: `Custom registered model (${modelId}) in your Agora library.`,
    category: 'Reasoning',
    tags: ['Library Model', 'Custom', 'AI'],
    overallScore: 92,
    speedTokensPerSec: 80,
    latencyMs: 150,
    contextWindow: '128K tokens',
    parameters: 'Weights',
    inputPricePerMillion: 0.10,
    outputPricePerMillion: 0.40,
    isOpenSource: true,
    license: 'Community License',
    accessMethods: ['Local Ollama', 'REST API', 'Playground'],
    runtime: modelId.includes(':') || modelId.includes('llama') || modelId.includes('qwen') || modelId.includes('gemma') || modelId.includes('deepseek') ? 'ollama' : 'modal',
    runtime_model_id: modelId,
    runtimeModelId: modelId,
    modelEndpointId: modelId,
    rating: 4.8,
    reviewsCount: 12,
  };
}

export const LauncherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<LauncherView>('home');
  const [models, setModels] = useState<Model[]>(fallbackModels);
  const [modelsLoading, setModelsLoading] = useState<boolean>(true);

  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState<boolean>(false);

  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [deploymentsLoading, setDeploymentsLoading] = useState<boolean>(false);

  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch models from Supabase
  const fetchModels = useCallback(async () => {
    setModelsLoading(true);
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .order('name');

      if (!error && data && data.length > 0) {
        // Merge with fallback data to ensure rich attributes
        const enriched: Model[] = data.map((item: any) => {
          const fallback = fallbackModels.find((f) => f.id === item.id);
          return {
            id: item.id,
            name: item.name || fallback?.name || item.id,
            provider: item.provider || fallback?.provider || 'AI Provider',
            providerLogo: item.provider_logo || item.providerLogo || fallback?.providerLogo || '🤖',
            creatorId: item.creator_id || item.creatorId || fallback?.creatorId,
            description: item.description || fallback?.description || 'Advanced AI foundation model.',
            longDescription: item.long_description || fallback?.longDescription,
            category: item.category || fallback?.category || 'Reasoning',
            tags: Array.isArray(item.tags) ? item.tags : fallback?.tags || ['AI'],
            overallScore: item.overall_score || item.overallScore || fallback?.overallScore || 90,
            codingScore: item.coding_score || fallback?.codingScore,
            reasoningScore: item.reasoning_score || fallback?.reasoningScore,
            mathScore: item.math_score || fallback?.mathScore,
            visionScore: item.vision_score || fallback?.visionScore,
            speedTokensPerSec: item.speed_tokens_per_sec || fallback?.speedTokensPerSec || 60,
            latencyMs: item.latency_ms || fallback?.latencyMs || 400,
            contextWindow: item.context_window || item.contextWindow || fallback?.contextWindow || '128K tokens',
            contextWindowTokens: item.context_window_tokens || fallback?.contextWindowTokens || 128000,
            parameters: item.parameters || fallback?.parameters || 'Weights',
            inputPricePerMillion: Number(item.input_price_per_million ?? fallback?.inputPricePerMillion ?? 0.2),
            outputPricePerMillion: Number(item.output_price_per_million ?? fallback?.outputPricePerMillion ?? 0.8),
            isOpenSource: Boolean(item.is_open_source ?? item.isOpenSource ?? fallback?.isOpenSource ?? true),
            license: item.license || fallback?.license || 'Open Weights',
            accessMethods: Array.isArray(item.access_methods) ? item.access_methods : fallback?.accessMethods || ['REST API'],
            endpoint: item.endpoint || fallback?.endpoint,
            modelEndpointId: item.model_endpoint_id || item.modelEndpointId || fallback?.modelEndpointId || item.id,
            runtime: item.runtime || fallback?.runtime || (item.runtime_model_id || fallback?.runtime_model_id ? 'ollama' : undefined),
            runtime_model_id: item.runtime_model_id || item.runtimeModelId || fallback?.runtime_model_id || fallback?.runtimeModelId,
            runtimeModelId: item.runtime_model_id || item.runtimeModelId || fallback?.runtime_model_id || fallback?.runtimeModelId,
            rating: Number(item.rating ?? fallback?.rating ?? 4.8),
            reviewsCount: Number(item.reviews_count ?? fallback?.reviewsCount ?? 45),
            created_at: item.created_at,
          };
        });
        // Merge mapped models with fallback models to ensure all core models exist
        const allIds = new Set(enriched.map((m) => m.id));
        const combined = [...enriched];
        fallbackModels.forEach((f) => {
          if (!allIds.has(f.id)) combined.push(f);
        });
        setModels(combined);
      } else {
        setModels(fallbackModels);
      }
    } catch (err) {
      console.warn('Error fetching models from Supabase:', err);
      setModels(fallbackModels);
    } finally {
      setModelsLoading(false);
    }
  }, []);

  // Fetch and Unify Library across Supabase and all local storage keys
  const fetchLibrary = useCallback(async () => {
    setLibraryLoading(true);
    const collectedItems: LibraryItem[] = [];
    const seenModelIds = new Set<string>();

    // 1. Fetch from Supabase if user is logged in
    if (user) {
      try {
        const { data, error } = await supabase
          .from('library')
          .select('*')
          .eq('user_id', user.id)
          .order('added_at', { ascending: false });

        if (!error && data) {
          data.forEach((item: any) => {
            const foundModel = resolveModelFromPool(item.model_id, models);
            seenModelIds.add(item.model_id);
            collectedItems.push({
              id: item.id,
              user_id: item.user_id,
              model_id: item.model_id,
              added_at: item.added_at || item.created_at || new Date().toISOString(),
              installed: Boolean(item.installed),
              installed_version: item.installed_version || null,
              deployment_status: item.deployment_status || 'not_deployed',
              model: foundModel,
            });
          });
        }
      } catch (err) {
        console.warn('Notice querying Supabase library in desktop launcher:', err);
      }
    }

    // 2. Check all local storage keys from web app and launcher
    const storageKeys = [
      user ? `modalhub_user_library_items_${user.id}` : null,
      'modalhub_user_library_items_guest',
      'modalhub_user_library_items_c1',
      'modalhub_user_library_items_null',
      'modalhub_user_library_items_undefined',
      'agora_guest_library',
    ].filter(Boolean) as string[];

    storageKeys.forEach((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: any) => {
              const modelId = item.model_id || item.id;
              if (modelId && !seenModelIds.has(modelId)) {
                seenModelIds.add(modelId);
                const foundModel = item.model || resolveModelFromPool(modelId, models);
                collectedItems.push({
                  id: item.id || `local_${Date.now()}_${modelId}`,
                  user_id: item.user_id || user?.id || 'local',
                  model_id: modelId,
                  added_at: item.added_at || item.created_at || new Date().toISOString(),
                  installed: Boolean(item.installed),
                  installed_version: item.installed_version || null,
                  deployment_status: item.deployment_status || 'not_deployed',
                  model: foundModel,
                });
              }
            });
          }
        }
      } catch (e) {
        console.warn(`Error parsing local storage key ${key}:`, e);
      }
    });

    // Save unified cache to local guest library for instant offline access
    try {
      localStorage.setItem('agora_guest_library', JSON.stringify(collectedItems));
      if (user) {
        localStorage.setItem(`modalhub_user_library_items_${user.id}`, JSON.stringify(collectedItems));
      }
    } catch {}

    setLibraryItems(collectedItems);
    setLibraryLoading(false);
  }, [user, models]);

  // Fetch Deployments for authenticated user
  const fetchDeployments = useCallback(async () => {
    if (!user) {
      setDeployments([]);
      setDeploymentsLoading(false);
      return;
    }

    setDeploymentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('deployments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped: Deployment[] = data.map((d: any) => {
          const foundModel = resolveModelFromPool(d.model_id, models);
          return {
            id: d.id,
            user_id: d.user_id,
            model_id: d.model_id,
            provider: d.provider || 'AWS',
            status: d.status || 'running',
            instance_type: d.instance_type,
            gpu_type: d.gpu_type,
            region: d.region,
            endpoint_url: d.endpoint_url,
            created_at: d.created_at || new Date().toISOString(),
            updated_at: d.updated_at,
            model: foundModel,
          };
        });
        setDeployments(mapped);
      } else {
        setDeployments([]);
      }
    } catch (err) {
      console.warn('Error fetching deployments from Supabase:', err);
      setDeployments([]);
    } finally {
      setDeploymentsLoading(false);
    }
  }, [user, models]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  useEffect(() => {
    fetchLibrary();
    fetchDeployments();
  }, [fetchLibrary, fetchDeployments]);

  // Listen for storage events (e.g. if user adds model in web view or another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.includes('library') || e.key.includes('modalhub'))) {
        fetchLibrary();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchLibrary]);

  const isInLibrary = useCallback(
    (modelId: string) => {
      return libraryItems.some((item) => item.model_id === modelId);
    },
    [libraryItems]
  );

  const addToLibrary = async (modelId: string): Promise<boolean> => {
    const targetModel = resolveModelFromPool(modelId, models);
    if (!targetModel) {
      showToast('Model not found', 'error');
      return false;
    }

    if (isInLibrary(modelId)) {
      showToast(`${targetModel.name} is already in your library`, 'info');
      return true;
    }

    const newItem: LibraryItem = {
      id: `lib_${Date.now()}_${modelId}`,
      user_id: user?.id || 'guest',
      model_id: modelId,
      added_at: new Date().toISOString(),
      installed: false,
      deployment_status: 'not_deployed',
      model: targetModel,
    };

    // Optimistically update state
    const updatedItems = [newItem, ...libraryItems];
    setLibraryItems(updatedItems);

    // Save to local storage for both web & launcher keys
    try {
      localStorage.setItem('agora_guest_library', JSON.stringify(updatedItems));
      localStorage.setItem('modalhub_user_library_items_guest', JSON.stringify(updatedItems));
      if (user) {
        localStorage.setItem(`modalhub_user_library_items_${user.id}`, JSON.stringify(updatedItems));
      }
      window.dispatchEvent(new Event('storage'));
    } catch {}

    if (user) {
      try {
        const { data, error } = await supabase
          .from('library')
          .insert({
            user_id: user.id,
            model_id: modelId,
            installed: false,
            deployment_status: 'not_deployed',
          })
          .select()
          .single();

        if (!error && data) {
          showToast(`Added ${targetModel.name} to your library!`, 'success');
          return true;
        }
      } catch (err: any) {
        console.warn('Supabase add library notice:', err.message);
      }
    }

    showToast(`Added ${targetModel.name} to your library!`, 'success');
    return true;
  };

  const removeFromLibrary = async (modelId: string): Promise<boolean> => {
    const updated = libraryItems.filter((item) => item.model_id !== modelId);
    setLibraryItems(updated);

    try {
      localStorage.setItem('agora_guest_library', JSON.stringify(updated));
      localStorage.setItem('modalhub_user_library_items_guest', JSON.stringify(updated));
      if (user) {
        localStorage.setItem(`modalhub_user_library_items_${user.id}`, JSON.stringify(updated));
      }
      window.dispatchEvent(new Event('storage'));
    } catch {}

    if (user) {
      try {
        await supabase
          .from('library')
          .delete()
          .eq('user_id', user.id)
          .eq('model_id', modelId);
      } catch (err: any) {
        console.warn('Supabase delete library notice:', err.message);
      }
    }

    showToast('Removed from library', 'info');
    return true;
  };

  const syncLibrary = async () => {
    showToast('Synchronizing model library...', 'info');
    await Promise.all([fetchModels(), fetchLibrary(), fetchDeployments()]);
    showToast('Library synchronized successfully!', 'success');
  };

  const openModelDetail = (modelId: string) => {
    setSelectedModelId(modelId);
    setIsDetailOpen(true);
  };

  const closeModelDetail = () => {
    setIsDetailOpen(false);
  };

  const selectedModel = selectedModelId
    ? resolveModelFromPool(selectedModelId, models)
    : null;

  const refreshAll = async () => {
    await Promise.all([fetchModels(), fetchLibrary(), fetchDeployments()]);
  };

  return (
    <LauncherContext.Provider
      value={{
        activeView,
        setActiveView,
        models,
        modelsLoading,
        libraryItems,
        libraryLoading,
        deployments,
        deploymentsLoading,
        selectedModelId,
        selectedModel,
        isDetailOpen,
        searchQuery,
        setSearchQuery,
        toasts,
        showToast,
        dismissToast,
        openModelDetail,
        closeModelDetail,
        addToLibrary,
        removeFromLibrary,
        isInLibrary,
        refreshAll,
        syncLibrary,
      }}
    >
      {children}
    </LauncherContext.Provider>
  );
};

export const useLauncher = () => {
  const context = useContext(LauncherContext);
  if (!context) {
    throw new Error('useLauncher must be used within a LauncherProvider');
  }
  return context;
};
