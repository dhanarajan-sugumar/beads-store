import React from 'react';
import type { StockStatus } from '@/types/database';

interface StockBadgeProps {
  status?: StockStatus;
  className?: string;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ status = 'in_stock', className = '' }) => {
  switch (status) {
    case 'made_to_order':
      return (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded-[2px] bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-sans font-medium tracking-wider uppercase select-none ${className}`}
        >
          Made to Order
        </span>
      );
    case 'out_of_stock':
      return (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded-[2px] bg-rose-50 text-rose-700 border border-rose-200/80 text-[10px] font-sans font-medium tracking-wider uppercase select-none ${className}`}
        >
          Sold Out
        </span>
      );
    case 'in_stock':
    default:
      return (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded-[2px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-sans font-medium tracking-wider uppercase select-none ${className}`}
        >
          In Stock
        </span>
      );
  }
};
