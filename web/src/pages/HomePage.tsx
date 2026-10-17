import React, { useState, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { env } from '@/config/env';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/catalogue/ProductGrid';
import { CategoryFilter, FilterCategory } from '@/components/catalogue/CategoryFilter';
import { SearchSortBar } from '@/components/catalogue/SearchSortBar';
import { filterProducts, sortProducts, SortOption } from '@/utils/searchSort';
import type { Product } from '@/types/database';

interface HomePageProps {
  onAddToCart?: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onAddToCart }) => {
  const isEnvConfigured = Boolean(env.supabaseUrl && env.supabasePublishableKey);
  const { products, loading, error, refetch } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // Compute item counts for each category pill
  const counts = useMemo(() => {
    return {
      all: products.length,
      necklace: products.filter((p) => p.category === 'necklace').length,
      bracelet: products.filter((p) => p.category === 'bracelet').length,
      other: products.filter((p) => p.category !== 'necklace' && p.category !== 'bracelet').length,
    };
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = filterProducts(products, searchQuery, selectedCategory);
    return sortProducts(filtered, sortBy);
  }, [products, searchQuery, selectedCategory, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  return (
    <div>
      {/* Configuration check notice if env is missing */}
      {!isEnvConfigured && (
        <div
          role="alert"
          className="rounded-xs border border-amber-300 bg-amber-50/80 p-4 text-amber-900 flex items-start gap-3 mb-4"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm font-sans">
            <p className="font-semibold">Supabase Environment Variables Missing</p>
            <p className="mt-1">
              Please copy <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">.env.example</code> to{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">.env.local</code> in the{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">web/</code> directory and set your Supabase URL and Publishable Key.
            </p>
          </div>
        </div>
      )}

      {/* Catalogue Grid Section */}
      <section aria-label="Product collection" className="pt-2 sm:pt-3">
        {/* Search & Sort Controls */}
        {!loading && !error && products.length > 0 && (
          <SearchSortBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            resultCount={filteredProducts.length}
            totalCount={products.length}
          />
        )}

        {/* Category Tabs Filter - Sticky under header */}
        {!loading && !error && products.length > 0 && (
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            counts={counts}
          />
        )}

        <ProductGrid
          products={filteredProducts}
          loading={loading}
          error={error}
          onRetry={refetch}
          onAddToCart={onAddToCart}
          emptyTitle={searchQuery.trim() ? 'No matching jewellery found' : 'No pieces found'}
          emptyDescription={
            searchQuery.trim()
              ? `We could not find any piece matching "${searchQuery.trim()}". Try searching for a different keyword or view our full collection.`
              : 'Our artisans are crafting new designs. Please check back soon.'
          }
          emptyActionLabel={searchQuery.trim() || selectedCategory !== 'all' ? 'Reset Filters' : undefined}
          onEmptyAction={handleResetFilters}
        />
      </section>
    </div>
  );
};
