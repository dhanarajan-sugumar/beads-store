import React, { useEffect, useRef } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatInrPrice } from '@/utils/formatters';
import { calculateLineTotal } from '@/utils/cartMath';

interface CartDrawerProps {
  onOpenPdfShare?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenPdfShare }) => {
  const {
    items,
    itemCount,
    grandTotal,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Keyboard navigation & body scroll locking
  useEffect(() => {
    if (!isCartOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart"
      onClick={closeCart}
    >
      <div
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-700" aria-hidden="true" />
            <h2 className="font-serif font-bold text-lg sm:text-xl text-gray-900">
              Shopping Bag
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeCart}
            aria-label="Close shopping bag"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Content / Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-gray-500">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <ShoppingBag className="w-8 h-8" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Your bag is empty</p>
                <p className="text-sm mt-1">Explore our handmade beads jewellery and add your favourite pieces.</p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="min-h-[44px] px-6 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors text-sm"
              >
                Browse Catalogue
              </button>
            </div>
          ) : (
            items.map((item) => {
              const lineTotal = calculateLineTotal(item.price_inr, item.quantity);
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No img
                      </div>
                    )}
                  </div>

                  {/* Info and controls */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {item.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name} from bag`}
                          className="min-w-[44px] min-h-[44px] -mt-2 -mr-2 flex items-center justify-center text-gray-400 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatInrPrice(item.price_inr)} each
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-l-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                        >
                          <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <span className="w-8 text-center text-xs sm:text-sm font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-r-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>

                      {/* Line Total */}
                      <span className="font-serif font-semibold text-gray-900 text-sm sm:text-base">
                        {formatInrPrice(lineTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/80 space-y-3">
            <div className="flex items-center justify-between text-base sm:text-lg">
              <span className="font-medium text-gray-700">Subtotal</span>
              <span className="font-serif font-bold text-gray-900 text-xl">
                {formatInrPrice(grandTotal)}
              </span>
            </div>

            <p className="text-xs text-gray-500">
              Orders are confirmed and shared directly via WhatsApp.
            </p>

            <button
              type="button"
              onClick={onOpenPdfShare}
              className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Create PDF & Share on WhatsApp</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <div className="flex items-center justify-center pt-1">
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-gray-500 hover:text-red-600 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded p-1 transition-colors"
              >
                Clear shopping bag
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
