import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { App } from '@app/App';
import { queryClient } from '@app/providers/query-client';
import { ResponsiveProvider } from '@app/providers/responsive';
import '@app/styles/index.css';
import '@features/theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ResponsiveProvider>
        <App />
      </ResponsiveProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
