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
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted/70">
            <Search className="w-4 h-4 stroke-[1.5]" aria-hidden="true" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, SKU, gemstone, material..."
            aria-label="Search catalogue"
            className="w-full min-h-[44px] pl-10 pr-10 py-2 bg-stone-50/60 hover:bg-stone-50 focus:bg-white border border-stone-200 hover:border-stone-300 focus:border-oxblood focus:ring-2 focus:ring-oxblood/10 rounded-xl text-xs font-sans text-slate-900 placeholder:text-slate-400 transition-all outline-none shadow-2xs"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-900 transition-colors min-w-[40px] justify-center"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Sort Selector Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label
            htmlFor="catalogue-sort"
            className="text-[11px] font-sans uppercase tracking-[0.15em] text-slate-500 hidden md:inline-flex items-center gap-1 select-none font-semibold"
          >
            <ArrowUpDown className="w-3 h-3 text-oxblood" aria-hidden="true" />
            <span>Sort By:</span>
          </label>
          <div className="relative min-w-[170px] sm:min-w-[190px]">
            <select
              id="catalogue-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              aria-label="Sort products by"
              className="w-full min-h-[44px] px-3.5 py-2 bg-stone-50/60 hover:bg-stone-50 focus:bg-white border border-stone-200 hover:border-stone-300 focus:border-oxblood focus:ring-2 focus:ring-oxblood/10 rounded-xl text-xs font-sans tracking-wider uppercase text-slate-800 transition-all outline-none cursor-pointer appearance-none pr-8 shadow-2xs font-medium"
            >
              <option value="featured">Featured Collection</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted">
              <span className="text-[10px]">▼</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Search & Result Count Bar */}
      {isFiltered && (
        <div className="flex items-center justify-between text-[11px] font-sans text-muted px-0.5 pt-0.5">
          <p>
            Showing <span className="font-semibold text-ink">{resultCount}</span> of {totalCount} pieces for &ldquo;<span className="text-oxblood font-medium">{searchQuery.trim()}</span>&rdquo;
          </p>
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="text-oxblood hover:text-ink underline underline-offset-2 transition-colors ml-2 font-medium"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};
