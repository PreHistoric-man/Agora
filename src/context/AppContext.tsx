import React, { createContext, useContext, useState, useEffect } from 'react';
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
import { MockDeploymentService } from '../services/MockDeploymentService';
import type { Deployment, DeploymentDraft } from '../data/deploymentData';

export type ViewType =
  | 'store'
  | 'discover'
  | 'library'
  | 'workshop'
  | 'community'
  | 'model-detail'
  | 'creator'
  | 'wishlist'
  | 'try'
  | 'launch'
  | 'deployment-wizard'
  | 'deployments'
  | 'deployment-detail';

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

interface AppContextType {
  models: Model[];
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
  activeLaunchModelId: string | null;
  downloadingModelId: string | null;
  downloadProgress: number;
  downloadStep: string;
  showGetModelModal: boolean;
  getModelModalId: string | null;
  deployments: Deployment[];
  selectedDeploymentId: string | null;
  isModelOwned: (modelId: string) => boolean;
  startDeployment: (modelId: string) => void;
  deployModel: (draft: DeploymentDraft) => Promise<Deployment | undefined>;
  updateDeployment: (id: string, updates: Partial<Deployment>) => Promise<void>;
  regenerateApiKey: (id: string) => Promise<void>;
  deleteDeployment: (id: string) => Promise<void>;
  setSelectedDeploymentId: (id: string | null) => void;

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
  startInstall: (modelId: string) => void;
  uninstallModel: (modelId: string) => void;
  launchModel: (modelId: string) => void;
  closeLauncher: () => void;
  openGetModelModal: (modelId: string) => void;
  closeGetModelModal: () => void;
  addCommunityPost: (modelId: string, modelName: string, category: CommunityPost['category'], title: string, content: string) => void;
  markNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [models, setModels] = useState<Model[]>(mockModels);
  const [creators, setCreators] = useState<Creator[]>(mockCreators);
  const [posts, setPosts] = useState<CommunityPost[]>(mockCommunityPosts);
  const [workshopItems, setWorkshopItems] = useState<WorkshopItem[]>(mockWorkshopItems);
  const [currentView, setViewInternal] = useState<ViewType>('store');
  const [selectedModelId, setSelectedModelId] = useState<string>('pixelforge-xl');
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('c1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [followedCreatorIds, setFollowedCreatorIds] = useState<string[]>(['c2', 'c3']); // pre-followed
  const [activeLaunchModelId, setActiveLaunchModelId] = useState<string | null>(null);

  // Install system states
  const [downloadingModelId, setDownloadingModelId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadStep, setDownloadStep] = useState<string>('');
  const [showGetModelModal, setShowGetModelModal] = useState<boolean>(false);
  const [getModelModalId, setGetModelModalId] = useState<string | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>(null);

  // Mock Notification Feed
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'PixelForge XL is 30% off!',
      content: 'Grab PixelForge XL cloud hosting at just ₹0.05 per generation for a limited time.',
      time: '3 hours ago',
      read: false,
      type: 'discount'
    },
    {
      id: 'n2',
      title: 'NeuralVision 4 released update v4.1.2',
      content: 'Check the new benchmarks. OCR performance improved by 14% on RTX 3060.',
      time: '1 day ago',
      read: false,
      type: 'update'
    },
    {
      id: 'n3',
      title: 'Workshop Alert: Cinematic Product LoRA updated',
      content: 'Creator NeuralForge updated the parameters to support wide aspect ratios.',
      time: '2 days ago',
      read: true,
      type: 'update'
    }
  ]);

  const setView = (view: ViewType) => {
    setViewInternal(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleWishlist = (modelId: string) => {
    setModels((prev) =>
      prev.map((m) => {
        if (m.id === modelId) {
          const newState = !m.wishlisted;
          addToast(
            newState ? `Added ${m.name} to Wishlist` : `Removed ${m.name} from Wishlist`,
            newState ? 'success' : 'info'
          );
          return { ...m, wishlisted: newState };
        }
        return m;
      })
    );
  };

  const toggleFollowCreator = (creatorId: string) => {
    setFollowedCreatorIds((prev) => {
      const isFollowing = prev.includes(creatorId);
      const creatorName = creators.find((c) => c.id === creatorId)?.name || 'Creator';
      
      // Update creator stats
      setCreators((cList) =>
        cList.map((c) => {
          if (c.id === creatorId) {
            return { ...c, followers: c.followers + (isFollowing ? -1 : 1) };
          }
          return c;
        })
      );

      if (isFollowing) {
        addToast(`Unfollowed ${creatorName}`, 'info');
        return prev.filter((id) => id !== creatorId);
      } else {
        addToast(`Successfully followed ${creatorName}`, 'success');
        return [...prev, creatorId];
      }
    });
  };

  const toggleSubscribeWorkshop = (itemId: string) => {
    setWorkshopItems((prev) =>
      prev.map((w) => {
        if (w.id === itemId) {
          const newState = !w.subscribed;
          addToast(
            newState ? `Subscribed to ${w.title}` : `Unsubscribed from ${w.title}`,
            newState ? 'success' : 'info'
          );
          return {
            ...w,
            subscribed: newState,
            subscribers: w.subscribers + (newState ? 1 : -1)
          };
        }
        return w;
      })
    );
  };

  const startInstall = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    if (!model) return;

    setShowGetModelModal(false); // Close get model helper modal if open
    setModels((prev) => prev.map((item) => item.id === modelId ? { ...item, owned: true } : item));
    setDownloadingModelId(modelId);
    setDownloadProgress(0);
    setDownloadStep('Initializing peer connections...');

    addToast(`Starting installation of ${model.name}...`, 'info');
  };

  // Simulated download progress loop
  useEffect(() => {
    if (!downloadingModelId) return;

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 4;
        if (next >= 100) {
          clearInterval(interval);
          setModels((prevModels) =>
            prevModels.map((m) => {
              if (m.id === downloadingModelId) {
                return { ...m, installed: true, hardwareStatus: 'Ready' };
              }
              return m;
            })
          );
          setTimeout(() => {
            const mName = models.find((m) => m.id === downloadingModelId)?.name || 'Model';
            addToast(`Successfully installed ${mName}! Ready to launch.`, 'success');
            setDownloadingModelId(null);
            setDownloadProgress(0);
            setDownloadStep('');
          }, 500);
          return 100;
        }

        // Update step titles based on progress percentages
        if (next < 25) {
          setDownloadStep(`Resolving tensor dependencies... (${next}%)`);
        } else if (next < 55) {
          setDownloadStep(`Downloading weights... ${models.find(m => m.id === downloadingModelId)?.sizeOnDisk} (${next}%)`);
        } else if (next < 85) {
          setDownloadStep(`Compiling GPU shaders and allocating VRAM buffers... (${next}%)`);
        } else {
          setDownloadStep(`Running local security and weight verification scan... (${next}%)`);
        }

        return next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [downloadingModelId, models]);

  const uninstallModel = (modelId: string) => {
    setModels((prev) =>
      prev.map((m) => {
        if (m.id === modelId) {
          addToast(`Uninstalled ${m.name} from local storage.`, 'info');
          return { ...m, installed: false, hardwareStatus: undefined };
        }
        return m;
      })
    );
    if (activeLaunchModelId === modelId) {
      setActiveLaunchModelId(null);
    }
  };

  const launchModel = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    if (!model) return;

    if (!model.installed) {
      addToast(`Please install ${model.name} first before launching.`, 'warning');
      return;
    }

    setActiveLaunchModelId(modelId);
    setView('launch');
    addToast(`Launched ${model.name} locally. Ready for inference.`, 'success');
  };

  const closeLauncher = () => {
    setActiveLaunchModelId(null);
    setView('library');
  };

  const openGetModelModal = (modelId: string) => {
    setGetModelModalId(modelId);
    setShowGetModelModal(true);
  };

  const closeGetModelModal = () => {
    setGetModelModalId(null);
    setShowGetModelModal(false);
  };

  const isModelOwned = (modelId: string) => {
    const model = models.find((item) => item.id === modelId);
    return Boolean(model?.owned || model?.installed);
  };

  const startDeployment = (modelId: string) => {
    if (!isModelOwned(modelId)) {
      addToast('Get this model first to unlock deployment.', 'warning');
      openGetModelModal(modelId);
      return;
    }
    setSelectedModelId(modelId);
    setView('deployment-wizard');
  };

  const deployModel = async (draft: DeploymentDraft) => {
    const model = models.find((item) => item.id === draft.modelId);
    if (!model || !isModelOwned(model.id)) return undefined;
    const deployment = await MockDeploymentService.deployModel(draft, model.version);
    setDeployments((prev) => [deployment, ...prev]);
    setSelectedDeploymentId(deployment.id);
    addToast('Deployment started', 'info');
    return deployment;
  };

  const updateDeployment = async (id: string, updates: Partial<Deployment>) => {
    const updated = await MockDeploymentService.updateDeployment(id, updates);
    if (updated) setDeployments((prev) => prev.map((item) => item.id === id ? updated : item));
  };

  const regenerateApiKey = async (id: string) => {
    const updated = await MockDeploymentService.regenerateApiKey(id);
    if (updated) {
      setDeployments((prev) => prev.map((item) => item.id === id ? updated : item));
      addToast('New mock API key generated.', 'success');
    }
  };

  const deleteDeployment = async (id: string) => {
    await MockDeploymentService.deleteDeployment(id);
    setDeployments((prev) => prev.filter((item) => item.id !== id));
    setSelectedDeploymentId(null);
    setView('deployments');
    addToast('Deployment stopped', 'info');
  };

  const addCommunityPost = (
    modelId: string,
    modelName: string,
    category: CommunityPost['category'],
    title: string,
    content: string
  ) => {
    const newPost: CommunityPost = {
      id: `post-user-${Date.now()}`,
      modelId,
      modelName,
      title,
      content,
      author: 'You (ModelVerse Explorer)',
      authorAvatar: '🛸',
      replies: 0,
      likes: 0,
      timeAgo: 'Just now',
      category
    };

    setPosts((prev) => [newPost, ...prev]);
    addToast('Post submitted successfully to community!', 'success');
  };

  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        models,
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
        activeLaunchModelId,
        downloadingModelId,
        downloadProgress,
        downloadStep,
        showGetModelModal,
        getModelModalId,
        deployments,
        selectedDeploymentId,
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
        startInstall,
        uninstallModel,
        launchModel,
        closeLauncher,
        openGetModelModal,
        closeGetModelModal,
        isModelOwned,
        startDeployment,
        deployModel,
        updateDeployment,
        regenerateApiKey,
        deleteDeployment,
        setSelectedDeploymentId,
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
