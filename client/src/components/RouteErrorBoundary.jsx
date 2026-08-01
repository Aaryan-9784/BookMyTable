/**
 * Route-level Error Boundary
 * 
 * Specialized error boundary for route-level errors
 * Displays route-specific error messages and recovery options
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Route Error:', error, errorInfo);
    this.setState({ error });

    // Log to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo, 'route');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <RouteErrorFallback 
          error={this.state.error}
          routeName={this.props.routeName}
        />
      );
    }

    return this.props.children;
  }
}

function RouteErrorFallback({ error, routeName }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Page Error
        </h2>
        
        <p className="text-gray-600 mb-6">
          {routeName ? (
            <>The <span className="font-semibold">{routeName}</span> page encountered an error and couldn't load properly.</>
          ) : (
            <>This page encountered an error and couldn't load properly.</>
          )}
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-left">
            <p className="text-sm font-medium text-gray-700 mb-2">Error Details:</p>
            <pre className="text-xs text-red-600 overflow-x-auto">
              {error.toString()}
            </pre>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default RouteErrorBoundary;
