import React from 'react';
import { AppointmentProvider } from './providers/AppointmentProvider';
import { AuthProvider } from './contexts/AuthContext';
import HistoryDashboardView from './views/HistoryDashboardView';

const App: React.FC = () => {
  return (
      <AppointmentProvider>
        <HistoryDashboardView />
      </AppointmentProvider>
  );
};

export default App;
