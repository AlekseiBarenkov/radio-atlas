import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { App } from '@app/App';
import { queryClient } from '@app/providers/query-client';
import { ResponsiveProvider } from '@app/providers/responsive';
import '@app/styles/index.css';
import '@app/bootstrap/register-app-effects';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ResponsiveProvider>
        <App />
      </ResponsiveProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker is optional for playback; installability should fail silently.
    });
  });
}
