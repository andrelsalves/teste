import React from 'react';
import { AppointmentProvider } from './providers/AppointmentProvider';
import HistoryDashboardView from './views/HistoryDashboardView';

const App: React.FC = () => {
  return (
      <AppointmentProvider>
        <HistoryDashboardView />
      </AppointmentProvider>
  );
};

export default App;
