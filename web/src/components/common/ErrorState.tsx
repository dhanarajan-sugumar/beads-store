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
      className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto"
    >
      <div className="w-12 h-12 rounded-full border border-red-300 flex items-center justify-center mb-4 text-red-600">
        <AlertCircle className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
      </div>
      <h3 className="font-serif font-normal text-2xl text-ink">Unable to load catalogue</h3>
      <p className="font-sans text-xs sm:text-sm text-muted mt-2 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-[2px] border border-oxblood text-oxblood hover:bg-oxblood hover:text-ivory text-xs font-sans font-medium tracking-[0.15em] uppercase transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood"
        >
          <RefreshCw className="w-3.5 h-3.5 stroke-[1.5]" aria-hidden="true" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
