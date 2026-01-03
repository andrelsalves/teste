import React from 'react';
import { AppointmentProvider } from './providers/AppointmentProvider';
import { AuthProvider } from './contexts/AuthContext';
import HistoryDashboardView from './views/HistoryDashboardView';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppointmentProvider>
        <HistoryDashboardView />
      </AppointmentProvider>
    </AuthProvider>
  );
};

export default App;
