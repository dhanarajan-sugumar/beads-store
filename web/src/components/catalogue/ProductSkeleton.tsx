import React from 'react';

interface ProductSkeletonProps {
  count?: number;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 6 }) => {
  return (
    <div
      aria-label="Loading products"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm animate-pulse flex flex-col"
        >
          {/* Image skeleton */}
          <div className="w-full aspect-square bg-gray-200" />
          {/* Content skeleton */}
          <div className="p-3 sm:p-4 space-y-2.5 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
            <div className="pt-2 flex items-center justify-between">
              <div className="h-5 bg-gray-200 rounded w-16" />
              <div className="h-9 w-20 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
