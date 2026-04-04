import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

/**
 * Root: Router + Auth + global toast host.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            className: '!bg-luxury-surface !text-white !border !border-luxury-border',
            duration: 4000,
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
