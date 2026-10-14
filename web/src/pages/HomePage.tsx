import React, { useState, useMemo } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { env } from '@/config/env';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/catalogue/ProductGrid';
import { CategoryFilter, FilterCategory } from '@/components/catalogue/CategoryFilter';
import { HowToOrderStrip } from '@/components/common/HowToOrderStrip';
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
    <div className="space-y-3 sm:space-y-5">
      {/* Configuration check notice if env is missing */}
      {!isEnvConfigured && (
        <div
          role="alert"
          className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Supabase Environment Variables Missing</p>
            <p className="mt-1">
              Please copy <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">.env.example</code> to{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">.env.local</code> in the{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">web/</code> directory and set your Supabase URL and Publishable Key.
            </p>
          </div>
        </div>
      )}

      {/* Slim Hero Banner */}
      <section className="bg-white rounded-xl border border-gold-200/80 px-3.5 py-2.5 sm:px-5 sm:py-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0" />
              <span className="truncate">{env.shopName}</span>
              <span className="text-gold-400">•</span>
              <span className="text-stone-500 font-medium normal-case">Handmade Bead Jewellery</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Unique handcrafted pieces made with love in India. Order directly on WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* How to Order Strip */}
      <HowToOrderStrip />

      {/* Catalogue Grid Section */}
      <section aria-labelledby="catalogue-heading" className="space-y-2 sm:space-y-4">
        {/* Category Pills Filter - Sticky under header */}
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
