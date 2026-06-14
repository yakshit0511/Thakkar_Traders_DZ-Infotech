import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import ErrorBoundary from './components/shared/ErrorBoundary';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A2035',
              color: '#F5F0E8',
              border: '1px solid #2A3147',
              borderRadius: 0,
            },
            success: {
              iconTheme: {
                primary: '#4CAF7D',
                secondary: '#F5F0E8',
              },
            },
            error: {
              iconTheme: {
                primary: '#C9A84C',
                secondary: '#F5F0E8',
              },
            },
          }}
        />
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
