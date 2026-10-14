import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, ImageOff, Maximize2 } from 'lucide-react';
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
  const [imageError, setImageError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setImageError(false);
    setIsFullscreen(false);
  }, [product]);

  // Handle ESC key to close fullscreen or modal & focus management
  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    if (!isFullscreen) {
      closeButtonRef.current?.focus();
    }

    // Prevent body scrolling while modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [product, onClose, isFullscreen]);

  if (!product) return null;

  return (
    <>
      {/* Product Detail Modal */}
      <div
        className={`fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 ${
          isFullscreen ? 'invisible pointer-events-none' : ''
        }`}
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
            {/* Image - full uncropped view with object-contain */}
            <div className="relative w-full max-h-[58vh] min-h-[260px] bg-stone-50 flex items-center justify-center p-3 sm:p-4 border-b border-gray-100 group">
              {product.image_url && !imageError ? (
                <>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    onClick={() => setIsFullscreen(true)}
                    onError={() => setImageError(true)}
                    title="Click to view full screen"
                    className="max-h-[54vh] w-auto max-w-full object-contain mx-auto rounded-lg drop-shadow-xs cursor-zoom-in transition-transform group-hover:scale-[1.01]"
                  />

                  {/* Fullscreen button overlay */}
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(true)}
                    aria-label="View photo in full screen"
                    className="absolute bottom-3 right-3 min-h-[36px] px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-gray-800 text-xs font-semibold shadow-md flex items-center gap-1.5 backdrop-blur-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-gray-700" aria-hidden="true" />
                    <span>Fullscreen</span>
                  </button>
                </>
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
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-800 border border-primary-200 font-mono">
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

      {/* Fullscreen Lightbox Modal - elevated to z-[9999] so it is in front of everything */}
      {isFullscreen && product.image_url && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full screen image view"
          onClick={() => setIsFullscreen(false)}
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-150"
        >
          {/* Lightbox Close Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            aria-label="Close full screen view"
            className="absolute top-4 right-4 z-[10000] min-w-[44px] min-h-[44px] p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-lg"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>

          {/* Full Screen High-Res Image */}
          <div className="max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center p-2">
            <img
              src={product.image_url}
              alt={product.name}
              className="max-h-[85vh] max-w-[95vw] w-auto h-auto object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Caption */}
          <div
            className="mt-3 text-center text-white/90 text-sm font-medium space-y-0.5 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <p>
              {product.name} {product.sku && <span className="text-white/60 font-mono">({product.sku})</span>}
            </p>
            <p className="text-xs text-white/50">Click anywhere or press ESC to close</p>
          </div>
        </div>
      )}
    </>
  );
};
