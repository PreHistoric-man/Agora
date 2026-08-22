import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { LauncherProvider, useLauncher } from './context/LauncherContext';
import { RuntimeProvider } from './context/RuntimeContext';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { LibraryView } from './components/LibraryView';
import { PlaygroundView } from './components/PlaygroundView';
import { StoreView } from './components/StoreView';
import { DeploymentsView } from './components/DeploymentsView';
import { SettingsView } from './components/SettingsView';
import { ModelDetailModal } from './components/ModelDetailModal';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';

const MainContent: React.FC = () => {
  const { activeView } = useLauncher();

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'library':
        return <LibraryView />;
      case 'playground':
        return <PlaygroundView />;
      case 'store':
        return <StoreView />;
      case 'deployments':
        return <DeploymentsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex-1 overflow-hidden bg-slate-950/60 flex flex-col">
      {renderView()}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LauncherProvider>
        <RuntimeProvider>
          <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
            {/* Custom Window TitleBar */}
            <TitleBar />

            {/* Desktop Shell: Sidebar + Content */}
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <MainContent />
            </div>

            {/* Overlays & Dialogs */}
            <ModelDetailModal />
            <AuthModal />
            <Toast />
          </div>
        </RuntimeProvider>
      </LauncherProvider>
    </AuthProvider>
  );
};

export default App;
