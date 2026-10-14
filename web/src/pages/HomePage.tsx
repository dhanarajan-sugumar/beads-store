import React, { useState, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { env } from '@/config/env';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/catalogue/ProductGrid';
import { CategoryFilter, FilterCategory } from '@/components/catalogue/CategoryFilter';
import type { Product } from '@/types/database';

interface HomePageProps {
  onAddToCart?: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onAddToCart }) => {
  const isEnvConfigured = Boolean(env.supabaseUrl && env.supabasePublishableKey);
  const { products, loading, error, refetch } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');

  // Compute item counts for each category pill
  const counts = useMemo(() => {
    return {
      all: products.length,
      necklace: products.filter((p) => p.category === 'necklace').length,
      bracelet: products.filter((p) => p.category === 'bracelet').length,
      other: products.filter((p) => p.category !== 'necklace' && p.category !== 'bracelet').length,
    };
  }, [products]);

  // Filter products by selected pill
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    if (selectedCategory === 'other') {
      return products.filter((p) => p.category !== 'necklace' && p.category !== 'bracelet');
    }
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Configuration check notice if env is missing */}
      {!isEnvConfigured && (
        <div
          role="alert"
          className="rounded-xs border border-amber-300 bg-amber-50/80 p-4 text-amber-900 flex items-start gap-3"
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

      {/* Quiet-Luxury Intro */}
      <section className="text-center py-4 sm:py-6">
        <p className="text-[10px] sm:text-[11px] font-sans font-medium tracking-[0.2em] uppercase text-gold mb-1.5 select-none">
          HANDMADE BEAD JEWELLERY
        </p>
        <h1 className="font-serif italic font-normal text-2xl sm:text-3xl md:text-4xl text-ink leading-tight">
          Each piece, made by hand.
        </h1>
      </section>

      {/* Catalogue Grid Section */}
      <section aria-label="Product collection">
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
        />
      </section>
    </div>
  );
};
