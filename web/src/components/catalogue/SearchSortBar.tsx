import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import type { SortOption } from '@/utils/searchSort';

interface SearchSortBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultCount: number;
  totalCount: number;
}

export const SearchSortBar: React.FC<SearchSortBarProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  resultCount,
  totalCount,
}) => {
  const isFiltered = Boolean(searchQuery.trim());

  return (
    <div className="w-full pb-3 mb-2 space-y-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A6E65]">
            <Search className="w-4 h-4 stroke-[1.5]" aria-hidden="true" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, SKU, gemstone, material..."
            aria-label="Search catalogue"
            className="w-full min-h-[42px] pl-10 pr-10 py-2 bg-white hover:border-[#CFC4B5] focus:border-[#68273D] border border-[#E0D7CC] rounded-lg text-xs font-sans text-[#2C1820] placeholder:text-[#9B8F84] transition-all outline-none shadow-2xs"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7A6E65] hover:text-[#2C1820] transition-colors min-w-[40px] justify-center"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Sort Selector Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label
            htmlFor="catalogue-sort"
            className="text-[11px] font-sans uppercase tracking-[0.14em] text-[#7A6E65] inline-flex items-center gap-1 select-none font-semibold"
          >
            <ArrowUpDown className="w-3 h-3 text-[#68273D]" aria-hidden="true" />
            <span>Sort By:</span>
          </label>
          <div className="relative min-w-[170px] sm:min-w-[190px]">
            <select
              id="catalogue-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              aria-label="Sort products by"
              className="w-full min-h-[42px] px-3.5 py-2 bg-white hover:border-[#CFC4B5] focus:border-[#68273D] border border-[#E0D7CC] rounded-lg text-xs font-sans tracking-wider uppercase text-[#2C1820] transition-all outline-none cursor-pointer appearance-none pr-8 shadow-2xs font-medium"
            >
              <option value="featured">Featured Collection</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#7A6E65]">
              <span className="text-[10px]">▼</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Search & Result Count Bar */}
      {isFiltered && (
        <div className="flex items-center justify-between text-[11px] font-sans text-[#7A6E65] px-0.5 pt-0.5">
          <p>
            Showing <span className="font-semibold text-[#2C1820]">{resultCount}</span> of {totalCount} pieces for &ldquo;<span className="text-[#68273D] font-medium">{searchQuery.trim()}</span>&rdquo;
          </p>
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="text-[#68273D] hover:text-[#2C1820] underline underline-offset-2 transition-colors ml-2 font-medium"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};
