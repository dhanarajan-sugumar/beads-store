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
      className="fixed inset-0 z-50 overflow-hidden bg-ink/60 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart"
      onClick={closeCart}
    >
      <div
        className="relative w-full max-w-md bg-ivory h-full shadow-2xl border-l border-gold/40 flex flex-col transform transition-transform duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-gold/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-oxblood stroke-[1.5]" aria-hidden="true" />
            <h2 className="font-serif font-normal text-xl sm:text-2xl text-ink">
              Shopping Bag
            </h2>
            <span className="text-xs font-sans text-muted">
              ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </span>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeCart}
            aria-label="Close shopping bag"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-ink hover:text-oxblood focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood transition-colors"
          >
            <X className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Content / Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-muted">
              <div className="w-14 h-14 rounded-full border border-gold/40 flex items-center justify-center text-gold">
                <ShoppingBag className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
              </div>
              <div>
                <p className="font-serif text-lg text-ink font-normal">Your bag is empty</p>
                <p className="text-xs font-sans text-muted mt-1 max-w-xs">
                  Explore our handcrafted bead jewellery and add your favourite pieces.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="min-h-[44px] px-6 py-2.5 rounded-[2px] border border-oxblood text-oxblood hover:bg-oxblood hover:text-ivory text-xs font-sans font-medium tracking-[0.15em] uppercase transition-colors"
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
                  className="flex items-start gap-3 p-3 rounded-[2px] border border-gold/25 bg-white/50"
                >
                  {/* Thumbnail in 4:5 crop */}
                  <div className="w-16 h-20 rounded-[2px] overflow-hidden bg-stone-100/60 border border-gold/20 shrink-0 flex items-center justify-center">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted text-[10px] font-sans uppercase">
                        No img
                      </div>
                    )}
                  </div>

                  {/* Info and controls */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {item.sku && (
                            <span className="text-[10px] font-sans tracking-wider text-muted block uppercase">
                              {item.sku}
                            </span>
                          )}
                          <h3 className="font-sans font-bold text-ink text-sm sm:text-base line-clamp-1">
                            {item.name}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name} from bag`}
                          className="min-w-[40px] min-h-[40px] -mt-1 -mr-1 flex items-center justify-center text-muted hover:text-oxblood focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood transition-colors"
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.5]" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="text-xs font-sans text-muted">
                        {formatInrPrice(item.price_inr)} each
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gold/15">
                      {/* Quantity Controls */}
                      <div className="inline-flex items-center rounded-[2px] border border-gold/40 bg-ivory">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center text-ink hover:text-oxblood transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood"
                        >
                          <Minus className="w-3 h-3 stroke-[1.5]" aria-hidden="true" />
                        </button>
                        <span className="w-7 text-center text-xs font-sans font-medium text-ink">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center text-ink hover:text-oxblood transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood"
                        >
                          <Plus className="w-3 h-3 stroke-[1.5]" aria-hidden="true" />
                        </button>
                      </div>

                      {/* Line Total */}
                      <span className="font-sans font-medium text-ink text-sm sm:text-base">
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
          <div className="p-4 sm:p-5 border-t border-gold/30 bg-ivory space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans uppercase tracking-wider text-muted">Subtotal</span>
              <span className="font-sans font-medium text-oxblood text-xl">
                {formatInrPrice(grandTotal)}
              </span>
            </div>

            <p className="text-[11px] font-sans text-muted">
              Orders are generated as a PDF and shared directly on WhatsApp.
            </p>

            <button
              type="button"
              onClick={onOpenPdfShare}
              className="w-full min-h-[44px] py-3 px-4 rounded-[2px] bg-oxblood text-ivory hover:bg-oxblood-hover text-xs font-sans font-medium tracking-[0.15em] uppercase transition-colors shadow-xs flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood"
            >
              <span>Create PDF</span>
              <ArrowRight className="w-4 h-4 stroke-[1.5]" aria-hidden="true" />
            </button>

            <div className="flex items-center justify-center pt-1">
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] font-sans tracking-wider uppercase text-muted hover:text-oxblood transition-colors py-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood"
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
