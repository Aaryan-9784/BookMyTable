import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import './index.css';

/**
 * Root: Router + Auth + Notifications + global toast host.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <NotificationProvider>
          <App />
          <Toaster
            position="top-right"
            gutter={10}
            containerStyle={{ top: 24, right: 24 }}
            toastOptions={{
              duration: 2200,
              style: {
                background: 'rgba(18, 18, 20, 0.96)',
                color: '#ffffff',
                border: '1px solid rgba(212, 175, 55, 0.28)',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.75), 0 0 20px rgba(212, 175, 55, 0.12)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '16px',
                padding: '12px 18px',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                maxWidth: '400px',
              },
              success: {
                iconTheme: {
                  primary: '#d4af37',
                  secondary: '#0b0b0c',
                },
                style: {
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                },
              },
              error: {
                duration: 2500,
                iconTheme: {
                  primary: '#f87171',
                  secondary: '#0b0b0c',
                },
                style: {
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                },
              },
            }}
          />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);


