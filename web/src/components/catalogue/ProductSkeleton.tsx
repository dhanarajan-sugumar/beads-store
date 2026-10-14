import React from 'react';

interface ProductSkeletonProps {
  count?: number;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 6 }) => {
  return (
    <div
      aria-label="Loading products"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col animate-pulse"
        >
          {/* 4:5 Portrait Image skeleton */}
          <div className="w-full aspect-[4/5] bg-stone-200/50 rounded-[2px]" />
          {/* Content skeleton */}
          <div className="pt-3.5 pb-1 space-y-2 flex-1 flex flex-col justify-between">
            <div>
              <div className="h-2.5 bg-stone-200/40 rounded-xs w-14 mb-1.5" />
              <div className="h-4 bg-stone-200/60 rounded-xs w-4/5 mb-1" />
              <div className="h-3.5 bg-stone-200/50 rounded-xs w-20 mt-2" />
            </div>
            <div className="mt-2.5">
              <div className="h-[44px] bg-stone-200/40 rounded-[2px] w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
