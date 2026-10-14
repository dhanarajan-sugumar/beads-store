import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-red-100 shadow-sm max-w-lg mx-auto"
    >
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-600">
        <AlertCircle className="w-8 h-8" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-serif font-bold text-gray-900">Unable to load catalogue</h3>
      <p className="text-sm text-gray-600 mt-2 max-w-md">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
