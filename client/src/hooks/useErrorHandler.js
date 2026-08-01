/**
 * Custom React Hook for Error Handling
 * 
 * Provides a centralized way to handle errors in async operations
 * Can be used with API calls, form submissions, etc.
 * 
 * Usage:
 * const { error, handleError, clearError } = useErrorHandler();
 * 
 * try {
 *   await someAsyncOperation();
 * } catch (err) {
 *   handleError(err);
 * }
 */

import { useState, useCallback } from 'react';

export function useErrorHandler() {
  const [error, setError] = useState(null);

  const handleError = useCallback((err, context = {}) => {
    // Extract error message
    const message = err?.response?.data?.message || err?.message || 'An unexpected error occurred';
    
    // Log error for debugging
    console.error('Error caught by useErrorHandler:', {
      error: err,
      message,
      context,
      stack: err?.stack,
    });

    // Set error state
    setError({
      message,
      originalError: err,
      context,
      timestamp: new Date().toISOString(),
    });

    // Optionally send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToErrorTracking(err, context);
    }

    return message;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetError = clearError; // Alias for consistency

  return {
    error,
    handleError,
    clearError,
    resetError,
    hasError: error !== null,
  };
}

/**
 * Error display component for useErrorHandler
 */
export function ErrorDisplay({ error, onDismiss }) {
  if (!error) return null;

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h4 className="text-red-800 font-medium mb-1">Error</h4>
          <p className="text-red-700 text-sm">{error.message}</p>
          {process.env.NODE_ENV === 'development' && error.context && (
            <pre className="mt-2 text-xs text-red-600 overflow-x-auto">
              {JSON.stringify(error.context, null, 2)}
            </pre>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800 font-medium text-sm"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default useErrorHandler;
