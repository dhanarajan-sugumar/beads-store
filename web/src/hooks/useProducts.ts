import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/database';

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase client is not configured. Check your environment variables.');
      }

      const { data, error: queryError } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (queryError) {
        throw new Error(queryError.message);
      }

      setProducts(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load catalogue products.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}
