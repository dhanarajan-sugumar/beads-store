import React, { useState } from 'react';
import { ImageOff, Eye, Plus, Minus } from 'lucide-react';
import type { Product } from '@/types/database';
import { formatInrPrice } from '@/utils/formatters';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { getProductImages, getPrimaryImage, getSecondaryImage } from '@/utils/productImages';
import { StockBadge } from '@/components/common/StockBadge';

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
      className="group flex flex-col cursor-pointer focus-within:ring-2 focus-within:ring-oxblood rounded-2xl animate-fade-up"
    >
      {/* 4:5 Portrait Image Crop with slow hover zoom (scale 1.04, 600ms) */}
      <div className="relative w-full aspect-[4/5] bg-stone-100/40 overflow-hidden rounded-xl border border-stone-200/70 shadow-2xs group-hover:shadow-sm transition-all duration-300">
        {(() => {
          const primaryImage = getPrimaryImage(product);
          const secondaryImage = getSecondaryImage(product);
          const imagesList = getProductImages(product);

          if (primaryImage && !imageError) {
            return (
              <>
                <img
                  src={primaryImage}
                  alt={product.name}
                  loading="lazy"
                  onError={() => setImageError(true)}
                  className={`w-full h-full object-cover object-center transition-all duration-[600ms] ease-out ${
                    secondaryImage
                      ? 'group-hover:opacity-0'
                      : 'group-hover:scale-[1.04]'
                  }`}
                />

                {/* Secondary image fades in on hover for multi-photo products */}
                {secondaryImage && (
                  <img
                    src={secondaryImage}
                    alt=""
                    loading="lazy"
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out group-hover:scale-[1.03]"
                  />
                )}

                {/* Sold Out Image Overlay Badge */}
                {product.stock_status === 'out_of_stock' && (
                  <span className="absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-white text-[10px] font-sans font-bold tracking-wider uppercase shadow-xs backdrop-blur-xs">
                    Sold Out
                  </span>
                )}

                {/* Multi-photo indicator pill */}
                {imagesList.length > 1 && (
                  <span className="absolute bottom-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full bg-white/90 text-slate-800 text-[10px] font-sans font-semibold tracking-wider uppercase shadow-xs border border-stone-200 backdrop-blur-xs">
                    {imagesList.length} Photos
                  </span>
                )}
              </>
            );
          }

          return (
            <div
              className="w-full h-full flex flex-col items-center justify-center bg-stone-100/40 text-muted p-4 text-center"
              aria-label="No image available"
            >
              <ImageOff className="w-6 h-6 mb-1 text-muted/60 stroke-[1.5]" aria-hidden="true" />
              <span className="text-[11px] font-sans tracking-wider uppercase text-muted">No image</span>
            </div>
          );
        })()}

        {/* Subtle quick view label on desktop hover */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 text-slate-900 text-[11px] font-sans font-semibold tracking-[0.08em] uppercase rounded-full shadow-sm">
            <Eye className="w-3.5 h-3.5 stroke-[2]" aria-hidden="true" />
            Quick View
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="pt-3 pb-1 flex-1 flex flex-col justify-between">
        <div>
          {/* SKU & Stock Status Badge */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {product.sku && (
              <span className="text-[11px] font-sans font-semibold tracking-wider text-slate-400 uppercase">
                {product.sku}
              </span>
            )}
            <StockBadge status={product.stock_status} />
          </div>

          {/* Product Name in Cormorant Garamond Serif */}
          <h3
            className="font-serif font-medium text-slate-900 text-[18px] sm:text-[19px] tracking-normal leading-snug line-clamp-2 min-h-[46px] flex items-start group-hover:text-oxblood transition-colors duration-200"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-1">
            <span className="font-sans font-bold text-oxblood text-[16px] tabular-nums">
              {formatInrPrice(product.price_inr)}
            </span>
          </div>
        </div>

        {/* Action Button: Add to order, Stepper, or Sold Out */}
        <div className="mt-3">
          {product.stock_status === 'out_of_stock' ? (
            <button
              type="button"
              disabled
              aria-label={`${product.name} is sold out`}
              onClick={(e) => e.stopPropagation()}
              className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-200 bg-stone-100 text-stone-400 text-[11px] font-sans font-semibold tracking-[0.12em] uppercase cursor-not-allowed select-none flex items-center justify-center"
            >
              Sold Out
            </button>
          ) : quantityInCart === 0 ? (
            <button
              type="button"
              onClick={handleAddClick}
              aria-label={`Add ${product.name} to order`}
              className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-oxblood hover:bg-oxblood-hover text-white text-[12px] font-sans font-semibold tracking-[0.12em] uppercase shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2]" aria-hidden="true" />
              <span>Add to order</span>
            </button>
          ) : (
            <div
              className="w-full min-h-[42px] rounded-xl border border-oxblood/30 bg-oxblood/5 flex items-center justify-between px-1.5 shadow-2xs"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleDecrement}
                aria-label={`Decrease quantity of ${product.name}`}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-oxblood hover:bg-oxblood/10 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood"
              >
                <Minus className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <span
                className="font-sans font-bold text-xs sm:text-sm text-slate-900 px-2 min-w-[24px] text-center"
                aria-label={`Current quantity: ${quantityInCart}`}
              >
                {quantityInCart} in bag
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                aria-label={`Increase quantity of ${product.name}`}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-oxblood hover:bg-oxblood/10 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood"
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
