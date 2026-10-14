import React, { useState } from 'react';
import { ImageOff, Eye, Plus } from 'lucide-react';
import type { Product } from '@/types/database';
import { formatInrPrice } from '@/utils/formatters';

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

  const handleCardClick = () => {
    onSelectProduct(product);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer focus-within:ring-2 focus-within:ring-primary-600"
    >
      {/* Image container - object-contain so necklace / jewellery pieces are completely visible */}
      <div className="relative w-full aspect-square bg-stone-50 overflow-hidden flex items-center justify-center p-2">
        {product.image_url && !imageError ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300 drop-shadow-2xs"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-4 text-center"
            aria-label="No image available"
          >
            <ImageOff className="w-8 h-8 mb-1" aria-hidden="true" />
            <span className="text-xs">No image</span>
          </div>
        )}

        {/* Quick view overlay hint on desktop */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-gray-900 text-xs font-medium shadow">
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            View Details
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {product.sku && (
            <span className="inline-block text-[11px] font-semibold tracking-wider text-primary-700 bg-primary-50 px-2 py-0.5 rounded mb-1">
              {product.sku}
            </span>
          )}
          <h3
            className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2 group-hover:text-primary-700 transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-gray-500 line-clamp-1 mt-1">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between gap-2">
          <span className="font-serif font-bold text-gray-900 text-base sm:text-lg">
            {formatInrPrice(product.price_inr)}
          </span>

          {onAddToCart && (
            <button
              type="button"
              onClick={handleAddToCartClick}
              aria-label={`Add ${product.name} to cart`}
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors flex items-center justify-center gap-1 text-xs font-semibold"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span className="hidden xs:inline sm:inline">Add</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
