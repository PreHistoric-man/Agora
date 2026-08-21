import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  mockModels,
  mockCreators,
  mockCommunityPosts,
  mockWorkshopItems
} from '../data/mockData';
import type {
  Model,
  Creator,
  CommunityPost,
  WorkshopItem
} from '../data/mockData';
import { ModelService } from '../services/ModelService';
import { LibraryService } from '../services/LibraryService';
import type { LibraryItem, DeploymentStatus } from '../types/library';

export type ViewType =
  | 'store'
  | 'discover'
  | 'compare'
  | 'cart'
  | 'checkout-success'
  | 'library'
  | 'my-apis'
  | 'model-detail'
  | 'try'
  | 'workshop'
  | 'community'
  | 'creator'
  | 'wishlist';

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  time: string;
  read: boolean;
  type: 'discount' | 'update' | 'system';
}

export interface CartItem {
  modelId: string;
  accessTier: 'pay-as-you-go' | 'provisioned-throughput' | 'enterprise-sla';
  monthlyTokenBudget: number; // e.g. 5,000,000 tokens
  region: string; // e.g. 'us-east-1 (N. Virginia)'
  estimatedMonthlyCost: number;
  rateLimitRpm: number;
  addedAt: string;
}

export interface ActiveApi {
  id: string;
  modelId: string;
  apiKey: string; // Demo / Placeholder API Key
  status: 'active' | 'sandboxed';
  accessType: 'Pay-as-you-go' | 'Provisioned';
  endpoint: string;
  totalRequests: number;
  tokensUsed: number;
  spendUsd: number;
  quotaUsd: number;
  region: string;
  rateLimitRpm: number;
  rateLimitTpm: number;
  activatedAt: string;
}

export interface CheckoutResult {
  provisionedApis: ActiveApi[];
  models: Model[];
  totalEstimatedMonthlyCost: number;
  organizationName: string;
  rateTier: string;
  orderNumber: string;
}

interface AppContextType {
  models: Model[];
  modelsLoading: boolean;
  modelsError: string | null;
  isFromDatabase: boolean;
  categories: string[];
  refreshModels: () => Promise<void>;
  creators: Creator[];
  posts: CommunityPost[];
  workshopItems: WorkshopItem[];
  currentView: ViewType;
  selectedModelId: string;
  selectedCreatorId: string;
  searchQuery: string;
  selectedCategory: string;
  toasts: Toast[];
  notifications: NotificationItem[];
  followedCreatorIds: string[];
  
  // User Library (Steam-Style Supabase Persistence)
  libraryItems: LibraryItem[];
  libraryModelIds: Set<string>;
  libraryLoading: boolean;
  isModelInLibrary: (modelId: string) => boolean;
  addToLibrary: (modelId: string) => Promise<{ success: boolean; error?: string; alreadyInLibrary?: boolean }>;
  removeFromLibrary: (modelId: string) => Promise<{ success: boolean; error?: string }>;
  updateLibraryItemStatus: (
    modelId: string,
    updates: {
      installed?: boolean;
      installed_version?: string | null;
      deployment_status?: DeploymentStatus;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  refreshLibrary: () => Promise<void>;

  // API Access Cart
  cart: CartItem[];
  addToCart: (modelId: string, accessTier?: CartItem['accessTier'], monthlyTokens?: number) => void;
  removeFromCart: (modelId: string) => void;
  updateCartItem: (modelId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  isInCart: (modelId: string) => boolean;
  
  // Model Comparison
  comparisonModelIds: string[];
  addToCompare: (modelId: string) => void;
  removeFromCompare: (modelId: string) => void;
  toggleCompare: (modelId: string) => void;
  isInCompare: (modelId: string) => boolean;
  clearCompare: () => void;
  
  // Active API Access (My APIs)
  activeApis: ActiveApi[];
  lastCheckoutResult: CheckoutResult | null;
  confirmApiAccessCheckout: (params: { orgName: string; rateTier: string; region: string }) => CheckoutResult;
  hasActiveApi: (modelId: string) => boolean;
  revokeApiAccess: (apiId: string) => void;
  regenerateApiKey: (apiId: string) => void;
  
  // Navigation & Core Actions
  setView: (view: ViewType) => void;
  setSelectedModelId: (id: string) => void;
  setSelectedCreatorId: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  toggleWishlist: (modelId: string) => void;
  toggleFollowCreator: (creatorId: string) => void;
  toggleSubscribeWorkshop: (itemId: string) => void;
  addCommunityPost: (modelId: string, modelName: string, category: CommunityPost['category'], title: string, content: string) => void;
  markNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial pre-configured active APIs for demo exploration
const initialActiveApis: ActiveApi[] = [
  {
    id: 'api-init-1',
    modelId: 'deepseek-r1',
    apiKey: 'mh_live_demo_sk_94a8f219b48e426cb78912aa',
    status: 'active',
    accessType: 'Pay-as-you-go',
    endpoint: 'https://api.modalhub.ai/v1/chat/completions',
    totalRequests: 1842,
    tokensUsed: 4280000,
    spendUsd: 1.84,
    quotaUsd: 50.00,
    region: 'us-east-1 (N. Virginia)',
    rateLimitRpm: 500,
    rateLimitTpm: 100000,
    activatedAt: '2026-02-14'
  },
  {
    id: 'api-init-2',
    modelId: 'qwen-2-5-coder-32b',
    apiKey: 'mh_live_demo_sk_7811ef9321c8901af0032b4e',
    status: 'active',
    accessType: 'Pay-as-you-go',
    endpoint: 'https://api.modalhub.ai/v1/chat/completions',
    totalRequests: 4910,
    tokensUsed: 8900000,
    spendUsd: 3.78,
    quotaUsd: 50.00,
    region: 'us-east-1 (N. Virginia)',
    rateLimitRpm: 500,
    rateLimitTpm: 100000,
    activatedAt: '2026-02-18'
  }
];

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [models, setModels] = useState<Model[]>(mockModels);
  const [modelsLoading, setModelsLoading] = useState<boolean>(true);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [isFromDatabase, setIsFromDatabase] = useState<boolean>(false);
  const [creators] = useState<Creator[]>(mockCreators);
  const [posts, setPosts] = useState<CommunityPost[]>(mockCommunityPosts);
  const [workshopItems, setWorkshopItems] = useState<WorkshopItem[]>(mockWorkshopItems);
  const [currentView, setViewInternal] = useState<ViewType>('store');
  const [selectedModelId, setSelectedModelId] = useState<string>('deepseek-r1');
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('c3');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [followedCreatorIds, setFollowedCreatorIds] = useState<string[]>(['c2', 'c3']);

  // Fetch real AI models from Supabase `models` table
  const refreshModels = useCallback(async () => {
    setModelsLoading(true);
    setModelsError(null);
    try {
      const result = await ModelService.getAllModels();
      if (result.data && result.data.length > 0) {
        setModels(result.data);
        setIsFromDatabase(result.fromDatabase);
        // Ensure selectedModelId exists in loaded models
        if (!result.data.some((m) => m.id === selectedModelId)) {
          setSelectedModelId(result.data[0].id);
        }
      }
      if (result.error) {
        setModelsError(result.error);
      }
    } catch (err: any) {
      console.warn('Error in refreshModels:', err);
      setModelsError(err?.message || 'Failed to fetch models');
    } finally {
      setModelsLoading(false);
    }
  }, [selectedModelId]);

  useEffect(() => {
    refreshModels();
  }, [refreshModels]);

  // Dynamically derive categories from all loaded models
  const categories = useMemo(() => {
    const cats = new Set<string>();
    models.forEach((m) => {
      if (m.category) cats.add(m.category);
    });
    return ['All', ...Array.from(cats)];
  }, [models]);

  // Cart State (Pre-seeded with 1 item for immediate rich demo)
  const [cart, setCart] = useState<CartItem[]>([
    {
      modelId: 'claude-3-5-sonnet',
      accessTier: 'pay-as-you-go',
      monthlyTokenBudget: 5000000,
      region: 'us-east-1 (N. Virginia)',
      estimatedMonthlyCost: 45.00,
      rateLimitRpm: 500,
      addedAt: new Date().toISOString()
    }
  ]);

  // Comparison State (Pre-seeded with 2 models for instant comparison demo)
  const [comparisonModelIds, setComparisonModelIds] = useState<string[]>([
    'deepseek-r1',
    'claude-3-5-sonnet'
  ]);

  // Toast dispatch helper
  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Safe navigation setter
  const setView = useCallback((view: ViewType) => {
    setViewInternal(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // User Library State (Steam-Style Supabase Persistence)
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState<boolean>(false);

  const refreshLibrary = useCallback(async () => {
    if (!user) {
      setLibraryItems([]);
      return;
    }
    setLibraryLoading(true);
    try {
      const items = await LibraryService.getUserLibrary(user.id, models);
      setLibraryItems(items);
    } catch (e) {
      console.warn('Error refreshing user library:', e);
    } finally {
      setLibraryLoading(false);
    }
  }, [user, models]);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  const libraryModelIds = useMemo(() => {
    return new Set(libraryItems.map((item) => item.model_id));
  }, [libraryItems]);

  const isModelInLibrary = useCallback(
    (modelId: string) => libraryModelIds.has(modelId),
    [libraryModelIds]
  );

  const addToLibrary = useCallback(
    async (modelId: string): Promise<{ success: boolean; error?: string; alreadyInLibrary?: boolean }> => {
      if (!user) {
        return { success: false, error: 'auth_required' };
      }

      const model = models.find((m) => m.id === modelId) || mockModels.find((m) => m.id === modelId);
      const modelName = model?.name || modelId;

      try {
        const result = await LibraryService.addToLibrary(user.id, modelId, models);
        if (result.success) {
          if (result.alreadyInLibrary) {
            addToast(`${modelName} is already in your Library.`, 'info');
            return { success: true, alreadyInLibrary: true };
          }
          if (result.item) {
            setLibraryItems((prev) => {
              if (prev.some((i) => i.model_id === modelId)) return prev;
              return [result.item!, ...prev];
            });
          }
          addToast(`Added ${modelName} to your Library!`, 'success');
          return { success: true };
        } else {
          addToast('Could not add model to your library. Please try again.', 'error');
          return { success: false, error: result.error };
        }
      } catch (err: any) {
        console.error('Failed to add to library:', err);
        addToast('Could not add model to your library. Please try again.', 'error');
        return { success: false, error: err?.message };
      }
    },
    [user, models, addToast]
  );

  const removeFromLibrary = useCallback(
    async (modelId: string): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: 'auth_required' };

      const model = models.find((m) => m.id === modelId) || mockModels.find((m) => m.id === modelId);
      const modelName = model?.name || modelId;

      try {
        setLibraryItems((prev) => prev.filter((i) => i.model_id !== modelId));
        await LibraryService.removeFromLibrary(user.id, modelId);
        addToast(`Removed ${modelName} from your Library.`, 'info');
        return { success: true };
      } catch (err: any) {
        console.error('Failed to remove from library:', err);
        addToast('Could not remove model from your library. Please try again.', 'error');
        refreshLibrary();
        return { success: false, error: err?.message };
      }
    },
    [user, models, addToast, refreshLibrary]
  );

  const updateLibraryItemStatus = useCallback(
    async (
      modelId: string,
      updates: {
        installed?: boolean;
        installed_version?: string | null;
        deployment_status?: DeploymentStatus;
      }
    ): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: 'auth_required' };

      try {
        setLibraryItems((prev) =>
          prev.map((i) => (i.model_id === modelId ? { ...i, ...updates } : i))
        );
        await LibraryService.updateLibraryItemStatus(user.id, modelId, updates);
        return { success: true };
      } catch (err: any) {
        console.error('Failed to update library item status:', err);
        return { success: false, error: err?.message };
      }
    },
    [user]
  );

  // Active APIs (My APIs)
  const [activeApis, setActiveApis] = useState<ActiveApi[]>(() => {
    const saved = localStorage.getItem('agora_active_apis');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialActiveApis;
      }
    }
    return initialActiveApis;
  });

  const [lastCheckoutResult, setLastCheckoutResult] = useState<CheckoutResult | null>(null);

  // Sync active APIs to localStorage
  useEffect(() => {
    localStorage.setItem('agora_active_apis', JSON.stringify(activeApis));
  }, [activeApis]);

  // Mock Notification Feed
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'New API Endpoints Live: DeepSeek-R1 & Qwen 2.5 Coder',
      content: 'Access ultra-low token pricing with OpenAI-compatible SSE streaming endpoints and 128K context.',
      time: '1 hour ago',
      read: false,
      type: 'update'
    },
    {
      id: 'n2',
      title: 'Prompt Caching Enabled on Claude 3.5 Sonnet',
      content: 'Enjoy a 90% discount on cached input tokens for recurring multi-turn agent contexts.',
      time: '1 day ago',
      read: false,
      type: 'update'
    },
    {
      id: 'n3',
      title: 'Free $50 Demo Credits Activated',
      content: 'Your sandbox account includes $50 demo credits to test any foundation model API.',
      time: '2 days ago',
      read: true,
      type: 'system'
    }
  ]);

  // Helper to calculate monthly estimate
  const calculateEstimatedCost = (model: Model, tokens: number): number => {
    // Standard assume 40% input tokens, 60% output tokens
    const inputTokens = tokens * 0.4;
    const outputTokens = tokens * 0.6;
    const inCost = (inputTokens / 1000000) * model.inputPricePerMillion;
    const outCost = (outputTokens / 1000000) * model.outputPricePerMillion;
    return Math.max(0.50, Number((inCost + outCost).toFixed(2)));
  };

  // 1. Cart Management
  const addToCart = (
    modelId: string,
    accessTier: CartItem['accessTier'] = 'pay-as-you-go',
    monthlyTokens = 5000000
  ) => {
    const model = models.find((m) => m.id === modelId);
    if (!model) return;

    if (cart.some((item) => item.modelId === modelId)) {
      addToast(`${model.name} API access is already in your cart.`, 'info');
      return;
    }

    const estimatedMonthlyCost = calculateEstimatedCost(model, monthlyTokens);
    const newItem: CartItem = {
      modelId,
      accessTier,
      monthlyTokenBudget: monthlyTokens,
      region: 'us-east-1 (N. Virginia)',
      estimatedMonthlyCost,
      rateLimitRpm: 500,
      addedAt: new Date().toISOString()
    };

    setCart((prev) => [...prev, newItem]);
    addToast(`Added ${model.name} API access to your cart.`, 'success');
  };

  const removeFromCart = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    setCart((prev) => prev.filter((item) => item.modelId !== modelId));
    addToast(`Removed ${model?.name || 'model'} API access from cart.`, 'info');
  };

  const updateCartItem = (modelId: string, updates: Partial<CartItem>) => {
    const model = models.find((m) => m.id === modelId);
    setCart((prev) =>
      prev.map((item) => {
        if (item.modelId === modelId) {
          const updated = { ...item, ...updates };
          if (updates.monthlyTokenBudget && model) {
            updated.estimatedMonthlyCost = calculateEstimatedCost(model, updates.monthlyTokenBudget);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const isInCart = (modelId: string): boolean => {
    return cart.some((item) => item.modelId === modelId);
  };

  // 2. Comparison Management
  const addToCompare = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    if (!model) return;

    if (comparisonModelIds.includes(modelId)) {
      addToast(`${model.name} is already in the comparison table.`, 'info');
      return;
    }

    if (comparisonModelIds.length >= 4) {
      addToast('You can compare up to 4 AI models side-by-side. Please remove one first.', 'warning');
      return;
    }

    setComparisonModelIds((prev) => [...prev, modelId]);
    addToast(`Added ${model.name} to comparison table.`, 'success');
  };

  const removeFromCompare = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    setComparisonModelIds((prev) => prev.filter((id) => id !== modelId));
    addToast(`Removed ${model?.name || 'model'} from comparison.`, 'info');
  };

  const toggleCompare = (modelId: string) => {
    if (comparisonModelIds.includes(modelId)) {
      removeFromCompare(modelId);
    } else {
      addToCompare(modelId);
    }
  };

  const isInCompare = (modelId: string): boolean => {
    return comparisonModelIds.includes(modelId);
  };

  const clearCompare = () => {
    setComparisonModelIds([]);
    addToast('Cleared comparison list.', 'info');
  };

  // 3. Demo Checkout & API Provisioning
  const confirmApiAccessCheckout = (params: {
    orgName: string;
    rateTier: string;
    region: string;
  }): CheckoutResult => {
    const selectedCartModels = cart
      .map((item) => models.find((m) => m.id === item.modelId))
      .filter(Boolean) as Model[];

    const newActiveApis: ActiveApi[] = cart.map((cartItem) => {
      const model = models.find((m) => m.id === cartItem.modelId);
      const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      const isEnterprise = params.rateTier.toLowerCase().includes('enterprise');

      return {
        id: `api-${Date.now()}-${cartItem.modelId}`,
        modelId: cartItem.modelId,
        apiKey: `mh_live_demo_sk_${randomHex}`,
        status: 'active',
        accessType: cartItem.accessTier === 'provisioned-throughput' ? 'Provisioned' : 'Pay-as-you-go',
        endpoint: model?.endpoint || 'https://api.modalhub.ai/v1/chat/completions',
        totalRequests: 0,
        tokensUsed: 0,
        spendUsd: 0.00,
        quotaUsd: 50.00,
        region: params.region || cartItem.region,
        rateLimitRpm: isEnterprise ? 2000 : 500,
        rateLimitTpm: isEnterprise ? 500000 : 100000,
        activatedAt: new Date().toISOString().split('T')[0]
      };
    });

    const totalEstimatedMonthlyCost = cart.reduce((sum, item) => sum + item.estimatedMonthlyCost, 0);

    // Merge with existing active APIs, replacing older entries for same model
    setActiveApis((prev) => {
      const existingFiltered = prev.filter(
        (existing) => !newActiveApis.some((newItem) => newItem.modelId === existing.modelId)
      );
      return [...existingFiltered, ...newActiveApis];
    });

    // Automatically add all checked-out models to the user's Library
    const targetUserId = user?.id || 'demo_user';
    cart.forEach(async (cartItem) => {
      try {
        await LibraryService.addToLibrary(targetUserId, cartItem.modelId, models);
      } catch (err) {
        console.warn('Could not auto-add to library during checkout:', err);
      }
    });

    // Immediately update local library items state
    setLibraryItems((prev) => {
      const existingModelIds = new Set(prev.map((i) => i.model_id));
      const newlyAdded: LibraryItem[] = cart
        .filter((item) => !existingModelIds.has(item.modelId))
        .map((item) => ({
          id: `lib-${Date.now()}-${item.modelId}`,
          user_id: targetUserId,
          model_id: item.modelId,
          added_at: new Date().toISOString(),
          installed: false,
          installed_version: null,
          deployment_status: 'not_deployed',
          model: models.find((m) => m.id === item.modelId)
        }));
      return [...newlyAdded, ...prev];
    });

    const result: CheckoutResult = {
      provisionedApis: newActiveApis,
      models: selectedCartModels,
      totalEstimatedMonthlyCost,
      organizationName: params.orgName || 'Developer Sandbox Org',
      rateTier: params.rateTier,
      orderNumber: `MH-API-${Math.floor(100000 + Math.random() * 900000)}`
    };

    setLastCheckoutResult(result);
    clearCart();
    setView('checkout-success');
    addToast('Checkout complete! Models added to your Library and active APIs provisioned.', 'success');

    return result;
  };

  const hasActiveApi = (modelId: string): boolean => {
    return activeApis.some((api) => api.modelId === modelId);
  };

  const revokeApiAccess = (apiId: string) => {
    const api = activeApis.find((a) => a.id === apiId);
    const model = models.find((m) => m.id === api?.modelId);
    setActiveApis((prev) => prev.filter((a) => a.id !== apiId));
    addToast(`Revoked API access credentials for ${model?.name || 'model'}.`, 'info');
  };

  const regenerateApiKey = (apiId: string) => {
    const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    setActiveApis((prev) =>
      prev.map((api) => {
        if (api.id === apiId) {
          return {
            ...api,
            apiKey: `mh_live_demo_sk_${randomHex}`
          };
        }
        return api;
      })
    );
    addToast('Regenerated new Demo API Key.', 'success');
  };

  // 4. Wishlist & Socials
  const toggleWishlist = (modelId: string) => {
    setModels((prev) =>
      prev.map((m) => {
        if (m.id === modelId) {
          const nextState = !m.wishlisted;
          addToast(
            nextState ? `Saved ${m.name} to your Wishlist` : `Removed ${m.name} from Wishlist`,
            nextState ? 'success' : 'info'
          );
          return { ...m, wishlisted: nextState };
        }
        return m;
      })
    );
  };

  const toggleFollowCreator = (creatorId: string) => {
    const creator = creators.find((c) => c.id === creatorId);
    setFollowedCreatorIds((prev) => {
      const isFollowed = prev.includes(creatorId);
      addToast(
        isFollowed ? `Unfollowed ${creator?.name}` : `Followed ${creator?.name}`,
        'info'
      );
      return isFollowed ? prev.filter((id) => id !== creatorId) : [...prev, creatorId];
    });
  };

  const toggleSubscribeWorkshop = (itemId: string) => {
    setWorkshopItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const next = !item.subscribed;
          addToast(
            next ? `Subscribed to ${item.title}` : `Unsubscribed from ${item.title}`,
            next ? 'success' : 'info'
          );
          return {
            ...item,
            subscribed: next,
            subscribers: next ? item.subscribers + 1 : Math.max(0, item.subscribers - 1)
          };
        }
        return item;
      })
    );
  };

  const addCommunityPost = (
    modelId: string,
    modelName: string,
    category: CommunityPost['category'],
    title: string,
    content: string
  ) => {
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      modelId,
      modelName,
      title,
      content,
      author: user?.email?.split('@')[0] || 'AI Geek',
      authorAvatar: '🛸',
      replies: 0,
      likes: 1,
      timeAgo: 'Just now',
      category
    };
    setPosts((prev) => [newPost, ...prev]);
    addToast('Post published to Agora developer community!', 'success');
  };

  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        models,
        modelsLoading,
        modelsError,
        isFromDatabase,
        categories,
        refreshModels,
        creators,
        posts,
        workshopItems,
        currentView,
        selectedModelId,
        selectedCreatorId,
        searchQuery,
        selectedCategory,
        toasts,
        notifications,
        followedCreatorIds,

        // User Library (Steam-Style Supabase Persistence)
        libraryItems,
        libraryModelIds,
        libraryLoading,
        isModelInLibrary,
        addToLibrary,
        removeFromLibrary,
        updateLibraryItemStatus,
        refreshLibrary,

        // Cart
        cart,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        isInCart,

        // Compare
        comparisonModelIds,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        isInCompare,
        clearCompare,

        // My APIs
        activeApis,
        lastCheckoutResult,
        confirmApiAccessCheckout,
        hasActiveApi,
        revokeApiAccess,
        regenerateApiKey,

        // Navigation & Core
        setView,
        setSelectedModelId,
        setSelectedCreatorId,
        setSearchQuery,
        setSelectedCategory,
        addToast,
        removeToast,
        toggleWishlist,
        toggleFollowCreator,
        toggleSubscribeWorkshop,
        addCommunityPost,
        markNotificationsRead
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppContextProvider');
  }
  return context;
};
