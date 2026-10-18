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
          className={`inline-flex items-center px-1.5 py-0.5 rounded-[3px] bg-[#FDF6E2] text-[#8C6D37] border border-[#ECD9A8] text-[10px] font-sans font-semibold tracking-wider uppercase select-none ${className}`}
        >
          Made to Order
        </span>
      );
    case 'out_of_stock':
      return (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded-[3px] bg-[#FBEAEB] text-[#9E2A2B] border border-[#F3C4C6] text-[10px] font-sans font-semibold tracking-wider uppercase select-none ${className}`}
        >
          Sold Out
        </span>
      );
    case 'in_stock':
    default:
      return (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded-[3px] bg-[#EAF5EA] text-[#2D6A4F] border border-[#C2E0C6] text-[10px] font-sans font-semibold tracking-wider uppercase select-none ${className}`}
        >
          In Stock
        </span>
      );
  }
};
