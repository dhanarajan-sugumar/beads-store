import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { env } from '@/config/env';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/catalogue/ProductGrid';
import type { Product } from '@/types/database';

interface HomePageProps {
  onAddToCart?: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onAddToCart }) => {
  const isEnvConfigured = Boolean(env.supabaseUrl && env.supabasePublishableKey);
  const { products, loading, error, refetch } = useProducts();

  return (
    <div className="space-y-8">
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

      {/* Hero Banner */}
      <section className="text-center py-10 px-4 sm:py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Handmade with Love & Care
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 tracking-tight">
          Welcome to {env.shopName}
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-gray-600">
          Discover traditional and contemporary handmade bead jewellery, crafted with passion. Explore our collection, build your order, and share directly via WhatsApp.
        </p>
      </section>

      {/* Catalogue Grid Section */}
      <section aria-labelledby="catalogue-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200 pb-4">
          <div>
            <h2 id="catalogue-heading" className="text-2xl font-serif font-bold text-gray-900">
              Our Collection
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Unique pieces handmade with premium beads and materials
            </p>
          </div>

          {!loading && !error && products.length > 0 && (
            <span className="text-sm text-gray-500 font-medium self-start sm:self-auto">
              {products.length} {products.length === 1 ? 'piece' : 'pieces'} available
            </span>
          )}
        </div>

        <ProductGrid
          products={products}
          loading={loading}
          error={error}
          onRetry={refetch}
          onAddToCart={onAddToCart}
        />
      </section>
    </div>
  );
};
