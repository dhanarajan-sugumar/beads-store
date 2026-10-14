import React, { useEffect, useRef } from 'react';
import { X, Plus, ImageOff } from 'lucide-react';
import type { Product } from '@/types/database';
import { formatInrPrice } from '@/utils/formatters';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [imageError, setImageError] = React.useState(false);

  useEffect(() => {
    setImageError(false);
  }, [product]);

  // Handle ESC key to close modal & focus management
  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Focus the close button when opened
    closeButtonRef.current?.focus();

    // Prevent body scrolling while modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button with >= 44px touch target */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-3 right-3 z-10 min-w-[44px] min-h-[44px] p-2 rounded-full bg-white/90 text-gray-700 hover:text-gray-900 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 shadow-sm flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Modal scrollable body */}
        <div className="overflow-y-auto flex-1">
          {/* Image - full view with object-contain so jewellery is never cropped */}
          <div className="relative w-full max-h-[58vh] min-h-[260px] bg-stone-50 flex items-center justify-center p-3 sm:p-4 border-b border-gray-100">
            {product.image_url && !imageError ? (
              <img
                src={product.image_url}
                alt={product.name}
                onError={() => setImageError(true)}
                className="max-h-[54vh] w-auto max-w-full object-contain mx-auto rounded-lg drop-shadow-xs"
              />
            ) : (
              <div className="w-full h-48 flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-6">
                <ImageOff className="w-12 h-12 mb-2" aria-hidden="true" />
                <span className="text-sm">No image available</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {product.sku && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-800 border border-primary-200">
                  SKU: {product.sku}
                </span>
              )}
              {product.category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                  {product.category}
                </span>
              )}
            </div>

            <div className="flex items-start justify-between gap-4">
              <h2
                id="product-modal-title"
                className="text-xl sm:text-2xl font-serif font-bold text-gray-900 leading-snug"
              >
                {product.name}
              </h2>
            </div>

            <div className="text-2xl font-serif font-bold text-primary-700">
              {formatInrPrice(product.price_inr)}
            </div>

            {product.description && (
              <div className="prose prose-sm text-gray-600 border-t border-gray-100 pt-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Description
                </h3>
                <p className="whitespace-pre-line leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal footer actions */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 transition-colors"
          >
            Close
          </button>
          {onAddToCart && (
            <button
              type="button"
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 shadow-sm flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
