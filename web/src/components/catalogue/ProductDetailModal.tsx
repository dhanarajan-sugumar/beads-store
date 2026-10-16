import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Minus, ImageOff, Maximize2, ShoppingBag, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import type { Product } from '@/types/database';
import { formatInrPrice } from '@/utils/formatters';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { getProductImages } from '@/utils/productImages';

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
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Mouse-Over Zoom state
  const [isZooming, setIsZooming] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });

  const { items, addItem, updateQuantity, removeItem, openCart } = useCart();
  const { showToast } = useToast();

  const cartItem = items.find((item) => item.id === product?.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const allImages = getProductImages(product);
  const currentImage = allImages[activeImageIndex] || null;

  useEffect(() => {
    setImageError(false);
    setIsFullscreen(false);
    setActiveImageIndex(0);
    setIsZooming(false);
    setZoomCoords({ x: 50, y: 50 });
  }, [product]);

  // Handle keyboard events (ESC to close, Arrow keys to cycle photos)
  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft' && allImages.length > 1) {
        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
      } else if (e.key === 'ArrowRight' && allImages.length > 1) {
        setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
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
  }, [product, onClose, isFullscreen, allImages.length]);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomCoords({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
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
            {/* Left: Interactive Multi-Image Gallery with Mouse-Over Zoom */}
            <div className="relative w-full bg-stone-100/50 flex flex-col items-center justify-between p-4 sm:p-6 border-b md:border-b-0 md:border-r border-gold/30 min-h-[320px] md:min-h-[440px]">
              {/* Main Image Container with Mouse-Over Zoom */}
              <div
                className="relative w-full flex-1 flex items-center justify-center overflow-hidden rounded-[2px] select-none cursor-zoom-in group"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => {
                  setIsZooming(false);
                  setZoomCoords({ x: 50, y: 50 });
                }}
                onClick={() => setIsFullscreen(true)}
              >
                {currentImage && !imageError ? (
                  <>
                    <img
                      src={currentImage}
                      alt={`${product.name} (view ${activeImageIndex + 1})`}
                      onError={() => setImageError(true)}
                      style={{
                        transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                        transform: isZooming ? 'scale(2.4)' : 'scale(1)',
                      }}
                      className={`max-h-[40vh] md:max-h-[54vh] w-auto max-w-full object-contain mx-auto rounded-[2px] will-change-transform ${
                        isZooming ? 'duration-75 cursor-crosshair' : 'duration-300'
                      }`}
                    />

                    {/* Hint badge: Hover to zoom */}
                    <div className="absolute top-2 left-2 pointer-events-none hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-ivory/90 text-ink/80 text-[10px] font-sans tracking-wider uppercase border border-gold/30 shadow-xs backdrop-blur-xs transition-opacity opacity-80 group-hover:opacity-100">
                      <ZoomIn className="w-3 h-3 text-gold" />
                      <span>{isZooming ? '2.4× Zoom' : 'Hover to Zoom'}</span>
                    </div>

                    {/* Fullscreen button overlay */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFullscreen(true);
                      }}
                      aria-label="View photo in full screen"
                      className="absolute bottom-2 right-2 min-h-[32px] px-2.5 py-1 rounded-[2px] bg-ivory/90 hover:bg-ivory text-ink text-[10px] font-sans tracking-wider uppercase border border-gold/40 shadow-xs flex items-center gap-1.5 backdrop-blur-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood"
                    >
                      <Maximize2 className="w-3 h-3 text-ink stroke-[1.5]" aria-hidden="true" />
                      <span>Fullscreen</span>
                    </button>

                    {/* Previous / Next Arrow buttons on main image if > 1 photo */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                          }}
                          aria-label="Previous photo"
                          className="absolute left-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-ivory/90 hover:bg-ivory text-ink hover:text-oxblood shadow-xs border border-gold/40 transition-opacity opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center focus:opacity-100"
                        >
                          <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                          }}
                          aria-label="Next photo"
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-ivory/90 hover:bg-ivory text-ink hover:text-oxblood shadow-xs border border-gold/40 transition-opacity opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center focus:opacity-100"
                        >
                          <ChevronRight className="w-4 h-4 stroke-[1.5]" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-48 flex flex-col items-center justify-center text-muted p-6">
                    <ImageOff className="w-10 h-10 mb-2 stroke-[1.5]" aria-hidden="true" />
                    <span className="text-xs uppercase tracking-wider font-sans">No image available</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip (shown when product has multiple photos) */}
              {allImages.length > 1 && (
                <div className="w-full pt-3 mt-2 border-t border-gold/20 flex items-center justify-center gap-2 overflow-x-auto scrollbar-none py-1">
                  {allImages.map((imgUrl, idx) => {
                    const isSelected = idx === activeImageIndex;
                    return (
                      <button
                        key={`${imgUrl}-${idx}`}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        aria-label={`Switch to photo ${idx + 1}`}
                        className={`relative shrink-0 w-12 h-14 sm:w-14 sm:h-16 rounded-[2px] overflow-hidden border transition-all ${
                          isSelected
                            ? 'border-oxblood ring-1 ring-oxblood opacity-100 scale-105'
                            : 'border-gold/30 opacity-70 hover:opacity-100 hover:border-gold'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt=""
                          className="w-full h-full object-cover object-center"
                        />
                      </button>
                    );
                  })}
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
      {isFullscreen && currentImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full screen image view"
          onClick={() => setIsFullscreen(false)}
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 cursor-zoom-out animate-in fade-in duration-150 select-none"
        >
          {/* Lightbox Header / Close Button */}
          <div className="w-full flex items-center justify-between max-w-6xl px-2 pt-2 z-[10000]">
            <div className="text-white/80 text-xs font-sans tracking-wider uppercase">
              {allImages.length > 1 && (
                <span>Photo {activeImageIndex + 1} of {allImages.length}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              aria-label="Close full screen view"
              className="min-w-[44px] min-h-[44px] p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-lg"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          {/* Full Screen High-Res Image with Next/Prev navigation */}
          <div className="relative max-w-5xl max-h-[75vh] w-full flex-1 flex items-center justify-center p-2 my-auto">
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                }}
                aria-label="Previous photo"
                className="absolute left-2 z-10 p-3 rounded-full bg-black/50 hover:bg-black/75 text-white/90 hover:text-white border border-white/20 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6 stroke-[1.5]" />
              </button>
            )}

            <img
              src={currentImage}
              alt={`${product.name} - view ${activeImageIndex + 1}`}
              className="max-h-[75vh] max-w-[92vw] w-auto h-auto object-contain rounded-lg shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            />

            {allImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                }}
                aria-label="Next photo"
                className="absolute right-2 z-10 p-3 rounded-full bg-black/50 hover:bg-black/75 text-white/90 hover:text-white border border-white/20 transition-all cursor-pointer"
              >
                <ChevronRight className="w-6 h-6 stroke-[1.5]" />
              </button>
            )}
          </div>

          {/* Lightbox Footer: Thumbnails and Caption */}
          <div
            className="w-full max-w-xl text-center space-y-2 select-none pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            {allImages.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={`lb-${imgUrl}-${idx}`}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-10 h-12 rounded overflow-hidden border transition-all ${
                      idx === activeImageIndex
                        ? 'border-white ring-2 ring-white/50 scale-105'
                        : 'border-white/30 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="text-white/90 text-sm font-medium space-y-0.5">
              <p>
                {product.name} {product.sku && <span className="text-white/60 font-mono">({product.sku})</span>}
              </p>
              <p className="text-xs text-white/50">Click background or press ESC to exit • Arrow keys to navigate</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
