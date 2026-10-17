import type { Product } from '@/types/database';
import type { FilterCategory } from '@/components/catalogue/CategoryFilter';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

/**
 * Filters products by category and a search query.
 * Matches against name, SKU, description, and category case-insensitively.
 */
export function filterProducts(
  products: Product[],
  searchQuery: string,
  category: FilterCategory = 'all'
): Product[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return products.filter((product) => {
    // 1. Category check
    if (category === 'necklace' && product.category !== 'necklace') return false;
    if (category === 'bracelet' && product.category !== 'bracelet') return false;
    if (category === 'other' && (product.category === 'necklace' || product.category === 'bracelet')) {
      return false;
    }

    // 2. Search query check
    if (!normalizedQuery) return true;

    const nameMatch = product.name?.toLowerCase().includes(normalizedQuery);
    const skuMatch = product.sku?.toLowerCase().includes(normalizedQuery);
    const descMatch = product.description?.toLowerCase().includes(normalizedQuery);
    const catMatch = product.category?.toLowerCase().includes(normalizedQuery);

    return Boolean(nameMatch || skuMatch || descMatch || catMatch);
  });
}

/**
 * Sorts products based on chosen SortOption:
 * - 'featured': sort_order ascending (lower numbers first), then created_at descending (newest first)
 * - 'price-asc': price_inr ascending (lowest first)
 * - 'price-desc': price_inr descending (highest first)
 * - 'newest': created_at descending (latest first)
 */
export function sortProducts(products: Product[], sortBy: SortOption = 'featured'): Product[] {
  const cloned = [...products];

  switch (sortBy) {
    case 'price-asc':
      return cloned.sort((a, b) => a.price_inr - b.price_inr);

    case 'price-desc':
      return cloned.sort((a, b) => b.price_inr - a.price_inr);

    case 'newest':
      return cloned.sort((a, b) => {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return timeB - timeA;
      });

    case 'featured':
    default:
      return cloned.sort((a, b) => {
        // primary: sort_order asc
        const orderA = a.sort_order ?? 0;
        const orderB = b.sort_order ?? 0;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        // secondary: created_at desc
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return timeB - timeA;
      });
  }
}
