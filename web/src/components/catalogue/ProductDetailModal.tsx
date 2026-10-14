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
        className={`fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 ${
          isFullscreen ? 'invisible pointer-events-none' : ''
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        onClick={onClose}
      >
        <div
          className="relative bg-ivory rounded-[2px] max-w-4xl w-full overflow-hidden shadow-2xl border border-gold/40 flex flex-col max-h-[90vh] my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button with >= 44px touch target */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="absolute top-3 right-3 z-20 min-w-[44px] min-h-[44px] p-2.5 rounded-full bg-ivory/90 hover:bg-ivory text-ink hover:text-oxblood border border-gold/40 shadow-xs flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood"
          >
            <X className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
          </button>

          {/* Modal scrollable body - 2 Column on Desktop */}
          <div className="overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2">
            {/* Left: Large Image with object-contain */}
            <div className="relative w-full bg-stone-100/50 flex items-center justify-center p-4 sm:p-8 border-b md:border-b-0 md:border-r border-gold/30 min-h-[260px] md:min-h-[420px] group">
              {product.image_url && !imageError ? (
                <>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    onClick={() => setIsFullscreen(true)}
                    onError={() => setImageError(true)}
                    title="Click to view full screen"
                    className="max-h-[44vh] md:max-h-[64vh] w-auto max-w-full object-contain mx-auto rounded-[2px] cursor-zoom-in transition-transform group-hover:scale-[1.02] duration-300"
                  />

                  {/* Fullscreen button overlay */}
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(true)}
                    aria-label="View photo in full screen"
                    className="absolute bottom-3 right-3 min-h-[36px] px-3 py-1.5 rounded-[2px] bg-ivory/90 hover:bg-ivory text-ink text-[11px] font-sans tracking-wider uppercase border border-gold/40 shadow-xs flex items-center gap-1.5 backdrop-blur-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-ink stroke-[1.5]" aria-hidden="true" />
                    <span>Fullscreen</span>
                  </button>
                </>
              ) : (
                <div className="w-full h-48 flex flex-col items-center justify-center text-muted p-6">
                  <ImageOff className="w-10 h-10 mb-2 stroke-[1.5]" aria-hidden="true" />
                  <span className="text-xs uppercase tracking-wider font-sans">No image available</span>
                </div>
              )}
            </div>

            {/* Right: Details & Action */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Category & SKU */}
                <div className="flex items-center gap-2 text-[11px] font-sans tracking-[0.15em] uppercase text-muted">
                  {product.category && <span>{product.category}</span>}
                  {product.category && product.sku && <span>•</span>}
                  {product.sku && <span>{product.sku}</span>}
                </div>

                {/* Name in Jost Bold */}
                <h2
                  id="product-modal-title"
                  className="font-sans font-bold text-2xl sm:text-3xl text-ink leading-tight"
                >
                  {product.name}
                </h2>

                {/* Price in Jost oxblood */}
                <div className="font-sans font-medium text-lg sm:text-xl text-oxblood">
                  {formatInrPrice(product.price_inr)}
                </div>

                {/* Thin gold divider */}
                <div className="border-t border-gold/30 pt-3" />

                {/* Description */}
                {product.description && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-muted font-medium">
                      Description
                    </p>
                    <p className="font-sans text-xs sm:text-sm text-ink/80 leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 mt-6 border-t border-gold/30">
                {quantityInCart === 0 ? (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full min-h-[44px] px-6 py-2.5 rounded-[2px] bg-oxblood text-ivory hover:bg-oxblood-hover text-xs font-sans font-medium tracking-[0.15em] uppercase transition-colors shadow-xs flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood"
                  >
                    <Plus className="w-4 h-4 stroke-[1.5]" aria-hidden="true" />
                    <span>Add to order</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-h-[44px] rounded-[2px] border border-oxblood/80 flex items-center justify-between px-2">
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
                        className="min-w-[40px] min-h-[44px] flex items-center justify-center text-oxblood hover:text-ink transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood"
                      >
                        <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <span className="font-sans font-medium text-xs sm:text-sm text-ink px-2 text-center">
                        {quantityInCart} in bag
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantityInCart + 1)}
                        aria-label={`Increase quantity of ${product.name}`}
                        className="min-w-[40px] min-h-[44px] flex items-center justify-center text-oxblood hover:text-ink transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood"
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
                      className="min-h-[44px] px-4 py-2.5 rounded-[2px] bg-oxblood text-ivory text-xs font-sans font-medium tracking-[0.1em] uppercase hover:bg-oxblood-hover transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>View Bag</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
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
