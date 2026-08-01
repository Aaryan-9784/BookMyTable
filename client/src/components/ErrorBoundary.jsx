/**
 * React Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the entire app.
 * 
 * Usage:
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Send error to monitoring service (if configured)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService(error, errorInfo) {
    // In production, send to error tracking service like Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      console.log('Error logged to monitoring service:', {
        error: error.toString(),
        componentStack: errorInfo.componentStack,
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided by parent
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorCount={this.state.errorCount}
          onReset={this.handleReset}
          resetKeys={this.props.resetKeys}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback UI
 */
function DefaultErrorFallback({ error, errorInfo, errorCount, onReset }) {
  const navigate = useNavigate();
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleGoHome = () => {
    onReset();
    navigate('/');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mt-1">
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>
          </div>
        </div>

        {/* Error count warning */}
        {errorCount > 3 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ This error has occurred {errorCount} times. You may need to clear your browser cache or contact support.
            </p>
          </div>
        )}

        {/* Error details (development only) */}
        {isDevelopment && error && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Error Details (Development Mode)</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Error:</span>
                <pre className="text-xs text-red-600 mt-1 overflow-x-auto">
                  {error.toString()}
                </pre>
              </div>
              {errorInfo && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Component Stack:</span>
                  <pre className="text-xs text-gray-600 mt-1 overflow-x-auto max-h-40">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </button>
          <button
            onClick={handleReload}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>
        </div>

        {/* Support information */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            If this problem persists, please{' '}
            <a href="mailto:support@bookmytable.com" className="text-blue-600 hover:underline">
              contact support
            </a>{' '}
            with details about what you were doing when the error occurred.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact Error Boundary for smaller components
 */
export function CompactErrorBoundary({ children, fallbackMessage = 'An error occurred' }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">{fallbackMessage}</span>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
