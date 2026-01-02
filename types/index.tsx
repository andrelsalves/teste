import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { UIDensityProvider } from './contexts/UIDensityContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Could not find root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <UIDensityProvider>
      <App />
    </UIDensityProvider>
  </React.StrictMode>
);
