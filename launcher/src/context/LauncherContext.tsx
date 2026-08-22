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
}

const LauncherContext = createContext<LauncherContextType | undefined>(undefined);

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
        setModels(enriched);
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

  // Fetch Library for authenticated user
  const fetchLibrary = useCallback(async () => {
    if (!user) {
      // Load local guest library if any
      try {
        const guestLib = localStorage.getItem('agora_guest_library');
        if (guestLib) {
          const parsed = JSON.parse(guestLib);
          setLibraryItems(parsed);
        } else {
          setLibraryItems([]);
        }
      } catch {
        setLibraryItems([]);
      }
      setLibraryLoading(false);
      return;
    }

    setLibraryLoading(true);
    try {
      const { data, error } = await supabase
        .from('library')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (!error && data) {
        const joinedItems: LibraryItem[] = data.map((item: any) => {
          const foundModel = models.find((m) => m.id === item.model_id) ||
            fallbackModels.find((m) => m.id === item.model_id);
          return {
            id: item.id,
            user_id: item.user_id,
            model_id: item.model_id,
            added_at: item.added_at || item.created_at || new Date().toISOString(),
            installed: Boolean(item.installed),
            installed_version: item.installed_version || null,
            deployment_status: item.deployment_status || 'not_deployed',
            model: foundModel,
          };
        });
        setLibraryItems(joinedItems);
      } else {
        setLibraryItems([]);
      }
    } catch (err) {
      console.warn('Error fetching library from Supabase:', err);
      setLibraryItems([]);
    } finally {
      setLibraryLoading(false);
    }
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
          const foundModel = models.find((m) => m.id === d.model_id) ||
            fallbackModels.find((m) => m.id === d.model_id);
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

  const isInLibrary = useCallback(
    (modelId: string) => {
      return libraryItems.some((item) => item.model_id === modelId);
    },
    [libraryItems]
  );

  const addToLibrary = async (modelId: string): Promise<boolean> => {
    const targetModel = models.find((m) => m.id === modelId) || fallbackModels.find((m) => m.id === modelId);
    if (!targetModel) {
      showToast('Model not found', 'error');
      return false;
    }

    if (isInLibrary(modelId)) {
      showToast(`${targetModel.name} is already in your library`, 'info');
      return true;
    }

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
          const newItem: LibraryItem = {
            id: data.id,
            user_id: user.id,
            model_id: modelId,
            added_at: data.added_at || new Date().toISOString(),
            installed: false,
            deployment_status: 'not_deployed',
            model: targetModel,
          };
          setLibraryItems((prev) => [newItem, ...prev]);
          showToast(`Added ${targetModel.name} to your library!`, 'success');
          return true;
        } else {
          showToast(`Failed to add to library: ${error?.message || 'Database error'}`, 'error');
          return false;
        }
      } catch (err: any) {
        showToast(`Failed to add to library: ${err.message}`, 'error');
        return false;
      }
    } else {
      // Guest local storage
      const newItem: LibraryItem = {
        id: `guest_${Date.now()}`,
        user_id: 'guest',
        model_id: modelId,
        added_at: new Date().toISOString(),
        installed: false,
        deployment_status: 'not_deployed',
        model: targetModel,
      };
      const updated = [newItem, ...libraryItems];
      setLibraryItems(updated);
      try {
        localStorage.setItem('agora_guest_library', JSON.stringify(updated));
      } catch {}
      showToast(`Added ${targetModel.name} to local library`, 'success');
      return true;
    }
  };

  const removeFromLibrary = async (modelId: string): Promise<boolean> => {
    const target = libraryItems.find((item) => item.model_id === modelId);
    if (!target) return false;

    if (user) {
      try {
        const { error } = await supabase
          .from('library')
          .delete()
          .eq('user_id', user.id)
          .eq('model_id', modelId);

        if (!error) {
          setLibraryItems((prev) => prev.filter((item) => item.model_id !== modelId));
          showToast('Removed from library', 'info');
          return true;
        } else {
          showToast(`Failed to remove: ${error.message}`, 'error');
          return false;
        }
      } catch (err: any) {
        showToast(`Failed to remove: ${err.message}`, 'error');
        return false;
      }
    } else {
      const updated = libraryItems.filter((item) => item.model_id !== modelId);
      setLibraryItems(updated);
      try {
        localStorage.setItem('agora_guest_library', JSON.stringify(updated));
      } catch {}
      showToast('Removed from local library', 'info');
      return true;
    }
  };

  const openModelDetail = (modelId: string) => {
    setSelectedModelId(modelId);
    setIsDetailOpen(true);
  };

  const closeModelDetail = () => {
    setIsDetailOpen(false);
  };

  const selectedModel =
    models.find((m) => m.id === selectedModelId) ||
    fallbackModels.find((m) => m.id === selectedModelId) ||
    null;

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
