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
      className="sticky top-16 sm:top-20 z-20 bg-white/95 backdrop-blur-md -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-stone-200 mb-4 sm:mb-6 transition-all"
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
              className={`min-h-[44px] py-3 px-1 relative text-[11px] sm:text-xs font-sans tracking-[0.16em] uppercase transition-colors whitespace-nowrap flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood ${
                isSelected
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] sm:text-[11px] tracking-normal font-sans ${isSelected ? 'text-oxblood font-semibold' : 'text-slate-400'}`}>
                ({cat.count})
              </span>

              {/* Bold active underline */}
              {isSelected && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-oxblood"
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

