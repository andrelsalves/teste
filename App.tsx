import React from 'react';
import { AppointmentProvider } from './providers/AppointmentProvider';
import HistoryDashboardView from './views/HistoryDashboardView';
import LoginView from './views/LoginView';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <p className="text-white animate-pulse">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <AppointmentProvider>
      <HistoryDashboardView />
    </AppointmentProvider>
  );
};

export default App;
