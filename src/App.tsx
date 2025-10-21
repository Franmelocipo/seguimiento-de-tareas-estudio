import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { NotificationContainer } from './components/ui/NotificationContainer';
import { LoginForm } from './components/auth/LoginForm';
import { Dashboard } from './components/Dashboard';
import { autoInitializeIfNeeded } from './lib/firebase/initializeData';
import { isDemoMode } from './lib/firebase/config';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Auto-initialize in demo mode
    autoInitializeIfNeeded();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
          {isDemoMode && (
            <p className="mt-2 text-sm text-blue-600">🎭 Modo DEMO</p>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
        <NotificationContainer />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
