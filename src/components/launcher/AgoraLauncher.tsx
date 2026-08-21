import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RuntimeProvider } from '../../context/RuntimeContext';
import { TauriService, isTauriEnvironment } from '../../services/TauriService';
import type { LauncherViewType } from '../../types/launcher';
import { LauncherTitleBar } from './LauncherTitleBar';
import { LauncherSidebar } from './LauncherSidebar';
import { LauncherHome } from './LauncherHome';
import { LauncherLibrary } from './LauncherLibrary';
import { LauncherDeployments } from './LauncherDeployments';
import { LauncherStore } from './LauncherStore';
import { LauncherSettings } from './LauncherSettings';
import { LauncherModelDetailModal } from './LauncherModelDetail';

interface AgoraLauncherProps {
  onToggleWebMode: () => void;
}

const AgoraLauncherInner: React.FC<AgoraLauncherProps> = ({ onToggleWebMode }) => {
  const [activeView, setActiveView] = useState<LauncherViewType>('home');
  const [detailModalModelId, setDetailModalModelId] = useState<string | null>(null);
  const [isNativeTauri, setIsNativeTauri] = useState<boolean>(false);

  const {
    libraryItems,
    deployments,
    openDeploymentWizard,
    openDeploymentDetails,
    setSelectedModelId,
    setView: setAppWebView
  } = useApp();

  useEffect(() => {
    setIsNativeTauri(isTauriEnvironment());
    TauriService.getAppInfo().catch(() => {});
  }, []);

  const runningDeploymentsCount = deployments.filter((d) => d.status === 'running').length;

  const handleOpenDeployWizardForModel = (modelId?: string) => {
    if (modelId) {
      openDeploymentWizard(modelId);
    } else {
      openDeploymentWizard(libraryItems[0]?.model_id || 'deepseek-r1');
    }
  };

  const handleOpenPlayground = (modelId: string) => {
    setSelectedModelId(modelId);
    setAppWebView('try');
    onToggleWebMode();
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'library':
        return (
          <LauncherLibrary
            onOpenDeployWizard={handleOpenDeployWizardForModel}
            onOpenPlayground={handleOpenPlayground}
            onBrowseStore={() => setActiveView('store')}
          />
        );
      case 'deployments':
        return (
          <LauncherDeployments
            onOpenDeployWizard={handleOpenDeployWizardForModel}
            onOpenDetails={(depId) => openDeploymentDetails(depId)}
            onBrowseModels={() => setActiveView('store')}
          />
        );
      case 'store':
        return (
          <LauncherStore
            onSelectModel={(modelId) => setDetailModalModelId(modelId)}
            onGoToLibrary={() => setActiveView('library')}
          />
        );
      case 'settings':
        return <LauncherSettings />;
      case 'home':
      default:
        return (
          <LauncherHome
            onSelectView={(view) => setActiveView(view)}
            onSelectModel={(modelId) => setDetailModalModelId(modelId)}
            onOpenDeployWizard={handleOpenDeployWizardForModel}
          />
        );
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0c10] text-slate-100 font-sans antialiased select-none overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-3xl pointer-events-none z-0" />

      {/* Desktop Window Title Bar */}
      <LauncherTitleBar
        activeView={activeView}
        onSelectView={(v) => setActiveView(v)}
        onToggleWebMode={onToggleWebMode}
        isNativeTauri={isNativeTauri}
      />

      {/* Main Desktop Body (Sidebar + Content Stage) */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        <LauncherSidebar
          activeView={activeView}
          onSelectView={(v) => setActiveView(v)}
          libraryCount={libraryItems.length}
          deploymentsCount={deployments.length}
          runningCount={runningDeploymentsCount}
          isNativeTauri={isNativeTauri}
        />

        {/* View Stage */}
        <main className="flex-1 overflow-hidden flex flex-col bg-[#0a0c10]">
          {renderActiveView()}
        </main>
      </div>

      {/* Model Detail Modal for Store & Home clicks */}
      {detailModalModelId && (
        <LauncherModelDetailModal
          modelId={detailModalModelId}
          onClose={() => setDetailModalModelId(null)}
          onOpenDeployWizard={handleOpenDeployWizardForModel}
          onOpenPlayground={handleOpenPlayground}
          onGoToLibrary={() => {
            setDetailModalModelId(null);
            setActiveView('library');
          }}
        />
      )}
    </div>
  );
};

export const AgoraLauncher: React.FC<AgoraLauncherProps> = (props) => {
  return (
    <RuntimeProvider>
      <AgoraLauncherInner {...props} />
    </RuntimeProvider>
  );
};
