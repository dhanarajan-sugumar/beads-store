import React, { useState } from 'react';
import type { Product } from '@/types/database';
import { ProductCard } from './ProductCard';
import { ProductSkeleton } from './ProductSkeleton';
import { ProductDetailModal } from './ProductDetailModal';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onAddToCart?: (product: Product) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  error,
  onRetry,
  onAddToCart,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (loading) {
    return <ProductSkeleton count={6} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <>
      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
        role="region"
        aria-label="Product catalogue"
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelectProduct={setSelectedProduct}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={onAddToCart}
      />
    </>
  );
};
