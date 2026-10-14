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
      className="sticky top-16 z-20 bg-ivory/95 backdrop-blur-md py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-gold-200/50 mb-4 transition-all"
    >
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar sm:flex-wrap">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              aria-pressed={isSelected}
              className={`min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 whitespace-nowrap flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-gold-200/70 hover:bg-gold-50/50 hover:border-gold-300'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isSelected
                    ? 'bg-primary-700/90 text-white'
                    : 'bg-gold-100 text-gold-800'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
