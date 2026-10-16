import React, { useState } from 'react';
import { ImageOff, Eye, Plus, Minus } from 'lucide-react';
import type { Product } from '@/types/database';
import { formatInrPrice } from '@/utils/formatters';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { getProductImages, getPrimaryImage, getSecondaryImage } from '@/utils/productImages';

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
      className="group flex flex-col cursor-pointer focus-within:ring-1 focus-within:ring-oxblood animate-fade-up"
    >
      {/* 4:5 Portrait Image Crop with slow hover zoom (scale 1.04, 600ms) */}
      <div className="relative w-full aspect-[4/5] bg-stone-100/60 overflow-hidden rounded-[2px]">
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

                {/* Multi-photo indicator pill */}
                {imagesList.length > 1 && (
                  <span className="absolute bottom-2 left-2 z-10 px-1.5 py-0.5 rounded-[2px] bg-ivory/90 text-ink text-[9px] font-sans tracking-widest uppercase shadow-xs border border-gold/30">
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
        <div className="absolute inset-0 bg-ink/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-ivory/95 text-ink text-[11px] font-sans tracking-[0.1em] uppercase shadow-xs">
            <Eye className="w-3 h-3 stroke-[1.5]" aria-hidden="true" />
            View
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="pt-3.5 pb-1 flex-1 flex flex-col justify-between">
        <div>
          {/* Tiny muted SKU with no pill/background */}
          {product.sku && (
            <span className="text-[11px] font-sans tracking-[0.12em] text-muted block mb-1 uppercase">
              {product.sku}
            </span>
          )}

          {/* Product Name in Jost Bold */}
          <h3
            className="font-sans font-bold text-ink text-[16px] sm:text-[18px] tracking-tight leading-snug line-clamp-2 group-hover:text-oxblood transition-colors duration-200"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Price in Jost 15px oxblood */}
          <div className="mt-1.5">
            <span className="font-sans font-medium text-oxblood text-[15px]">
              {formatInrPrice(product.price_inr)}
            </span>
          </div>
        </div>

        {/* Action Button: Add to order or Stepper */}
        <div className="mt-2.5">
          {quantityInCart === 0 ? (
            <button
              type="button"
              onClick={handleAddClick}
              aria-label={`Add ${product.name} to order`}
              className="w-full min-h-[44px] px-3 py-2 rounded-[2px] border border-oxblood text-oxblood hover:bg-oxblood hover:text-ivory text-[12px] font-sans font-medium tracking-[0.15em] uppercase transition-colors duration-300 flex items-center justify-center focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood"
            >
              Add to order
            </button>
          ) : (
            <div
              className="w-full min-h-[44px] rounded-[2px] border border-oxblood/80 flex items-center justify-between px-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleDecrement}
                aria-label={`Decrease quantity of ${product.name}`}
                className="min-w-[40px] min-h-[44px] flex items-center justify-center text-oxblood hover:text-ink transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood"
              >
                <Minus className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <span
                className="font-sans font-medium text-xs sm:text-sm text-ink px-2 min-w-[24px] text-center"
                aria-label={`Current quantity: ${quantityInCart}`}
              >
                {quantityInCart}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                aria-label={`Increase quantity of ${product.name}`}
                className="min-w-[40px] min-h-[44px] flex items-center justify-center text-oxblood hover:text-ink transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood"
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
