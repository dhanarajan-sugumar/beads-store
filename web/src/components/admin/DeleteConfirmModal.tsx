import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { Product } from '@/types/database';

interface DeleteConfirmModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    cancelBtnRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, loading]);

  if (!isOpen || !product) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            <h2 id="delete-modal-title" className="font-sans font-bold text-lg text-gray-900">
              Confirm Deletion
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Cancel deletion"
            className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <p className="text-sm text-gray-600">
          Are you sure you want to permanently delete{' '}
          <span className="font-semibold text-gray-900">"{product.name}"</span>? This action cannot be undone.
        </p>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-h-[44px] px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="min-h-[44px] px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 transition-colors text-sm flex items-center gap-2"
          >
            {loading ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>
      </div>
    </div>
  );
};
