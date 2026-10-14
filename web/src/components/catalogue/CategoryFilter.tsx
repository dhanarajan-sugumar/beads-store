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
    <nav aria-label="Product categories" className="w-full mb-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              aria-pressed={isSelected}
              className={`min-h-[44px] px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  isSelected
                    ? 'bg-primary-700/80 text-white'
                    : 'bg-gray-100 text-gray-600'
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
