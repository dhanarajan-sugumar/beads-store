import React, { useState } from 'react';
import { ImageOff, Eye, Plus, Minus } from 'lucide-react';
import type { Product } from '@/types/database';
import { formatInrPrice } from '@/utils/formatters';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
}) => {
  const [imageError, setImageError] = useState(false);
  const { items, addItem, updateQuantity, removeItem, openCart } = useCart();
  const { showToast } = useToast();

  const cartItem = items.find((item) => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleCardClick = () => {
    onSelectProduct(product);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, quantityInCart + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantityInCart <= 1) {
      removeItem(product.id);
    } else {
      updateQuantity(product.id, quantityInCart - 1);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className="group bg-white rounded-2xl overflow-hidden border border-gold-200/70 shadow-2xs hover:shadow-md hover:border-gold-300 transition-all duration-200 flex flex-col cursor-pointer focus-within:ring-2 focus-within:ring-primary-600"
    >
      {/* 1:1 Square Image Crop with subtle hover zoom */}
      <div className="relative w-full aspect-square bg-stone-100 overflow-hidden">
        {product.image_url && !imageError ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center bg-stone-50 text-stone-400 p-4 text-center"
            aria-label="No image available"
          >
            <ImageOff className="w-8 h-8 mb-1" aria-hidden="true" />
            <span className="text-xs">No image</span>
          </div>
        )}

        {/* Quick view overlay hint on desktop */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-stone-900 text-xs font-semibold shadow-md backdrop-blur-xs">
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            View Details
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Muted SKU Chip */}
          {product.sku && (
            <span className="inline-block text-[10px] font-mono font-medium tracking-wider text-stone-500 bg-stone-100 border border-stone-200/60 px-2 py-0.5 rounded-full mb-1.5">
              {product.sku}
            </span>
          )}

          {/* Larger Product Name */}
          <h3
            className="font-serif font-bold text-stone-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs text-stone-500 line-clamp-1 mt-1">
              {product.description}
            </p>
          )}
        </div>

        {/* Bottom Bar: Bold Crimson Price & Add / Stepper Controls */}
        <div className="mt-3 pt-2.5 border-t border-gold-100 flex items-center justify-between gap-2">
          <span className="font-serif font-bold text-primary-700 text-base sm:text-lg">
            {formatInrPrice(product.price_inr)}
          </span>

          {quantityInCart === 0 ? (
            /* Add button (>= 44px touch target) */
            <button
              type="button"
              onClick={handleAddClick}
              aria-label={`Add ${product.name} to bag`}
              className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white border border-primary-200/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors flex items-center justify-center gap-1 text-xs font-bold"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add</span>
            </button>
          ) : (
            /* Quantity Stepper (>= 44px touch target for each button) */
            <div
              className="inline-flex items-center rounded-xl border border-primary-300 bg-primary-50/80 shadow-2xs"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleDecrement}
                aria-label={`Decrease quantity of ${product.name}`}
                className="min-w-[40px] min-h-[44px] flex items-center justify-center text-primary-800 hover:bg-primary-200/50 rounded-l-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                <Minus className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <span
                className="px-2 font-serif font-bold text-xs sm:text-sm text-primary-900 min-w-[24px] text-center"
                aria-label={`Current quantity: ${quantityInCart}`}
              >
                {quantityInCart}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                aria-label={`Increase quantity of ${product.name}`}
                className="min-w-[40px] min-h-[44px] flex items-center justify-center text-primary-800 hover:bg-primary-200/50 rounded-r-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
