import React from 'react';
import { AppContextProvider, useApp } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { StoreHome } from './components/StoreHome';
import { Discover } from './components/Discover';
import { Compare } from './components/Compare';
import { Cart } from './components/Cart';
import { CheckoutSuccess } from './components/CheckoutSuccess';
import { Library } from './components/Library';
import { MyApis } from './components/MyApis';
import { ModelDetail } from './components/ModelDetail';
import { TryModel } from './components/TryModel';
import { Wishlist } from './components/Wishlist';
import { Workshop } from './components/Workshop';
import { Community } from './components/Community';
import { CreatorProfile } from './components/CreatorProfile';
import { ToastStack, ModalsManager } from './components/ModalsAndToasts';
import { AuthModal } from './components/AuthModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LauncherDownloadPage } from './components/LauncherDownloadPage';

const AppInner: React.FC = () => {
  const { currentView } = useApp();

  const renderActiveView = () => {
    switch (currentView) {
      case 'launcher':
        return <LauncherDownloadPage />;
      case 'discover':
        return <Discover />;
      case 'compare':
        return <Compare />;
      case 'cart':
        return <Cart />;
      case 'checkout-success':
        return <CheckoutSuccess />;
      case 'library':
        return (
          <ProtectedRoute
            title="My AI Model Library"
            description="View and manage your owned foundation models, downloaded local weights, and deployed cloud endpoints."
            targetViewName="library"
          >
            <Library />
          </ProtectedRoute>
        );
      case 'my-apis':
        return (
          <ProtectedRoute
            title="My APIs Dashboard"
            description="Manage your active AI model API subscriptions, rotate sandbox keys, and inspect SDK code."
            targetViewName="my-apis"
          >
            <MyApis />
          </ProtectedRoute>
        );
      case 'model-detail':
        return <ModelDetail />;
      case 'try':
        return <TryModel />;
      case 'wishlist':
        return <Wishlist />;
      case 'workshop':
        return <Workshop />;
      case 'community':
        return <Community />;
      case 'creator':
        return <CreatorProfile />;
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

      {/* Render Top Navigation */}
      <Navbar />

      {/* Main viewport */}
      <main className="flex-grow z-10">
        {renderActiveView()}
      </main>

      {/* Toast logs, modal overlay manager, and auth modal */}
      <ToastStack />
      <ModalsManager />
      <AuthModal />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContextProvider>
        <AppInner />
      </AppContextProvider>
    </AuthProvider>
  );
}

export default App;
