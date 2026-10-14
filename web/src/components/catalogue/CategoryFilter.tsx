import React from 'react';
import type { ProductCategory } from '@/types/database';

export type FilterCategory = 'all' | ProductCategory;

interface CategoryFilterProps {
  selectedCategory: FilterCategory;
  onSelectCategory: (category: FilterCategory) => void;
  counts: {
    all: number;
    necklace: number;
    bracelet: number;
    other: number;
  };
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  counts,
}) => {
  const categories: Array<{ id: FilterCategory; label: string; count: number }> = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'necklace', label: 'Necklaces', count: counts.necklace },
    { id: 'bracelet', label: 'Bracelets', count: counts.bracelet },
    { id: 'other', label: 'Other', count: counts.other },
  ];

  return (
    <nav
      aria-label="Product categories"
      className="sticky top-16 sm:top-20 z-20 bg-ivory/95 backdrop-blur-md -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-gold/25 mb-6 sm:mb-8 transition-all"
    >
      <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto pb-px no-scrollbar sm:justify-center">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              aria-pressed={isSelected}
              className={`min-h-[44px] py-3 px-1 relative text-[11px] sm:text-xs font-sans tracking-[0.18em] uppercase transition-colors whitespace-nowrap flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood ${
                isSelected
                  ? 'text-ink font-medium'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[10px] sm:text-[11px] tracking-normal font-sans text-muted">
                ({cat.count})
              </span>

              {/* 1px gold underline for active tab */}
              {isSelected && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gold"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

