import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Minus, ImageOff, Maximize2, ShoppingBag } from 'lucide-react';
import type { Product } from '@/types/database';
import { formatInrPrice } from '@/utils/formatters';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';

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
  const { items, addItem, updateQuantity, removeItem, openCart } = useCart();
  const { showToast } = useToast();

  const cartItem = items.find((item) => item.id === product?.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

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

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addItem(product);
    }
    showToast(`${product.name} added to your bag`, {
      label: 'View Bag',
      onClick: openCart,
    });
  };

  return (
    <>
      {/* Product Detail Modal */}
      <div
        className={`fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 ${
          isFullscreen ? 'invisible pointer-events-none' : ''
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        onClick={onClose}
      >
        <div
          className="relative bg-white rounded-2xl max-w-lg sm:max-w-xl w-full overflow-hidden shadow-2xl border border-gold-200/70 flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button with >= 44px touch target */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="absolute top-3 right-3 z-10 min-w-[44px] min-h-[44px] p-2 rounded-full bg-white/90 text-stone-700 hover:text-stone-900 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 shadow-sm flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Modal scrollable body */}
          <div className="overflow-y-auto flex-1">
            {/* Image - full uncropped view with object-contain */}
            <div className="relative w-full max-h-[58vh] min-h-[260px] bg-stone-50 flex items-center justify-center p-3 sm:p-4 border-b border-gold-100 group">
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
                    className="absolute bottom-3 right-3 min-h-[36px] px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-stone-800 text-xs font-semibold shadow-md flex items-center gap-1.5 backdrop-blur-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-stone-700" aria-hidden="true" />
                    <span>Fullscreen</span>
                  </button>
                </>
              ) : (
                <div className="w-full h-48 flex flex-col items-center justify-center bg-stone-50 text-stone-400 p-6">
                  <ImageOff className="w-12 h-12 mb-2" aria-hidden="true" />
                  <span className="text-sm">No image available</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {product.sku && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium text-stone-600 bg-stone-100 border border-stone-200">
                    SKU: {product.sku}
                  </span>
                )}
                {product.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold-50 text-gold-800 border border-gold-200/70 capitalize">
                    {product.category}
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-4">
                <h2
                  id="product-modal-title"
                  className="text-xl sm:text-2xl font-serif font-bold text-stone-900 leading-snug"
                >
                  {product.name}
                </h2>
              </div>

              <div className="text-2xl font-serif font-bold text-primary-700">
                {formatInrPrice(product.price_inr)}
              </div>

              {product.description && (
                <div className="prose prose-sm text-stone-600 border-t border-gold-100 pt-3">
                  <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
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
          <div className="p-3.5 sm:p-4 border-t border-gold-100 bg-stone-50/80 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 transition-colors"
            >
              Close
            </button>

            {quantityInCart === 0 ? (
              <button
                type="button"
                onClick={handleAddToCart}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 shadow-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Add to Bag
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center rounded-xl border border-primary-300 bg-primary-50/80 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (quantityInCart <= 1) {
                        removeItem(product.id);
                      } else {
                        updateQuantity(product.id, quantityInCart - 1);
                      }
                    }}
                    aria-label={`Decrease quantity of ${product.name}`}
                    className="min-w-[40px] min-h-[44px] flex items-center justify-center text-primary-800 hover:bg-primary-200/50 rounded-l-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                  >
                    <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <span className="px-2.5 font-serif font-bold text-xs sm:text-sm text-primary-900 min-w-[24px] text-center">
                    {quantityInCart} in bag
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, quantityInCart + 1)}
                    aria-label={`Increase quantity of ${product.name}`}
                    className="min-w-[40px] min-h-[44px] flex items-center justify-center text-primary-800 hover:bg-primary-200/50 rounded-r-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openCart();
                  }}
                  className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-primary-600 text-white text-xs sm:text-sm font-semibold hover:bg-primary-700 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="hidden xs:inline">View Bag</span>
                </button>
              </div>
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
