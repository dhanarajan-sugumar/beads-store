/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useCallback, useRef } from 'react';
import { Check, ShoppingBag, X } from 'lucide-react';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastMessage {
  id: number;
  text: string;
  action?: ToastAction;
}

export interface ToastContextType {
  showToast: (text: string, action?: ToastAction) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((text: string, action?: ToastAction) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setToast({ id: Date.now(), text, action });

    timerRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast notification */}
      {toast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90vw] animate-in slide-in-from-bottom-5 fade-in duration-200 pointer-events-auto"
        >
          <div className="bg-stone-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700/60 flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <p className="font-medium text-stone-100 truncate">{toast.text}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick();
                    hideToast();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{toast.action.label}</span>
                </button>
              )}
              <button
                type="button"
                onClick={hideToast}
                aria-label="Dismiss notification"
                className="p-1 rounded-md text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      )}
    </ToastContext.Provider>
  );
};
