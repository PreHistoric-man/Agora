import React from 'react';
import { AppContextProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { StoreHome } from './components/StoreHome';
import { Discover } from './components/Discover';
import { Library } from './components/Library';
import { Workshop } from './components/Workshop';
import { Community } from './components/Community';
import { ModelDetail } from './components/ModelDetail';
import { CreatorProfile } from './components/CreatorProfile';
import { Wishlist } from './components/Wishlist';
import { TryModel } from './components/TryModel';
import { ModelLauncher } from './components/ModelLauncher';
import { DeploymentWizard } from './components/DeploymentWizard';
import { Deployments } from './components/Deployments';
import { DeploymentDetail } from './components/DeploymentDetail';
import { ToastStack, ModalsManager } from './components/ModalsAndToasts';

const AppInner: React.FC = () => {
  const { currentView } = useApp();

  const renderActiveView = () => {
    switch (currentView) {
      case 'discover':
        return <Discover />;
      case 'library':
        return <Library />;
      case 'workshop':
        return <Workshop />;
      case 'community':
        return <Community />;
      case 'model-detail':
        return <ModelDetail />;
      case 'creator':
        return <CreatorProfile />;
      case 'wishlist':
        return <Wishlist />;
      case 'try':
        return <TryModel />;
      case 'launch':
        return <ModelLauncher />;
      case 'deployment-wizard':
        return <DeploymentWizard />;
      case 'deployments':
        return <Deployments />;
      case 'deployment-detail':
        return <DeploymentDetail />;
      case 'store':
      default:
        return <StoreHome />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c10] text-slate-100 font-sans antialiased select-none">
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full bg-violet-500/5 blur-3xl pointer-events-none z-0"></div>

      {/* Render Navigation unless Launcher view is active */}
      {currentView !== 'launch' && <Navbar />}

      {/* Main viewport */}
      <main className="flex-grow z-10">
        {renderActiveView()}
      </main>

      {/* Toast logs and modal overlay manager */}
      <ToastStack />
      <ModalsManager />
    </div>
  );
};

function App() {
  return (
    <AppContextProvider>
      <AppInner />
    </AppContextProvider>
  );
}

export default App;
