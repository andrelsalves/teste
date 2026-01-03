import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { UIDensityProvider } from './contexts/UIDensityContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <UIDensityProvider>
        <App />
      </UIDensityProvider>
    </AuthProvider>
  </React.StrictMode>
);
