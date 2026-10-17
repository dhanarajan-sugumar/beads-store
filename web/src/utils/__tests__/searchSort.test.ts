import { describe, it, expect } from 'vitest';
import { filterProducts, sortProducts } from '../searchSort';
import type { Product } from '@/types/database';

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Royal Ruby Choker Necklace',
    description: 'Handcrafted with natural red garnet beads and gold accents.',
    price_inr: 1800,
    image_url: 'https://example.com/ruby.jpg',
    images: ['https://example.com/ruby.jpg'],
    active: true,
    stock_status: 'in_stock',
    sort_order: 10,
    category: 'necklace',
    sku: 'NL-101',
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Emerald Crystal Bracelet',
    description: 'Delicate green aventurine beads with magnetic clasp.',
    price_inr: 650,
    image_url: 'https://example.com/bracelet.jpg',
    images: ['https://example.com/bracelet.jpg'],
    active: true,
    stock_status: 'made_to_order',
    sort_order: 5,
    category: 'bracelet',
    sku: 'BR-202',
    created_at: '2026-02-15T12:00:00Z',
    updated_at: '2026-02-15T12:00:00Z',
  },
  {
    id: 'prod-3',
    name: 'Freshwater Pearl Pendant Necklace',
    description: 'Lustrous baroque pearl on 14k gold-plated chain.',
    price_inr: 2400,
    image_url: null,
    images: [],
    active: true,
    stock_status: 'out_of_stock',
    sort_order: 20,
    category: 'necklace',
    sku: 'NL-103',
    created_at: '2026-03-01T14:00:00Z',
    updated_at: '2026-03-01T14:00:00Z',
  },
  {
    id: 'prod-4',
    name: 'Boho Beaded Anklet',
    description: 'Summer beach anklet with turquoise seed beads.',
    price_inr: 450,
    image_url: 'https://example.com/anklet.jpg',
    images: ['https://example.com/anklet.jpg'],
    active: true,
    stock_status: 'in_stock',
    sort_order: 5,
    category: 'other',
    sku: 'OT-909',
    created_at: '2026-03-10T16:00:00Z',
    updated_at: '2026-03-10T16:00:00Z',
  },
];

describe('searchSort - filterProducts', () => {
  it('returns all products when search query is empty and category is all', () => {
    const result = filterProducts(mockProducts, '', 'all');
    expect(result).toHaveLength(4);
  });

  it('filters by category accurately', () => {
    const necklaces = filterProducts(mockProducts, '', 'necklace');
    expect(necklaces).toHaveLength(2);
    expect(necklaces.map((p) => p.id)).toEqual(['prod-1', 'prod-3']);

    const bracelets = filterProducts(mockProducts, '', 'bracelet');
    expect(bracelets).toHaveLength(1);
    expect(bracelets[0].id).toBe('prod-2');

    const others = filterProducts(mockProducts, '', 'other');
    expect(others).toHaveLength(1);
    expect(others[0].id).toBe('prod-4');
  });

  it('searches by product name case-insensitively', () => {
    const result = filterProducts(mockProducts, 'ruby', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Royal Ruby Choker Necklace');
  });

  it('searches by SKU case-insensitively', () => {
    const result = filterProducts(mockProducts, 'br-202', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].sku).toBe('BR-202');
  });

  it('searches by description content (e.g. bead material)', () => {
    const result = filterProducts(mockProducts, 'aventurine', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('prod-2');
  });

  it('combines category filter and search query correctly', () => {
    // Both necklace and bracelet have beads, but filtering for necklace only returns necklace
    const result = filterProducts(mockProducts, 'beads', 'necklace');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('prod-1');
  });

  it('returns empty array when query does not match any product', () => {
    const result = filterProducts(mockProducts, 'diamond platinum ring', 'all');
    expect(result).toHaveLength(0);
  });

  it('trims leading/trailing whitespace in search query', () => {
    const result = filterProducts(mockProducts, '   pearl   ', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('prod-3');
  });
});

describe('searchSort - sortProducts', () => {
  it('sorts by price-asc (lowest price first)', () => {
    const sorted = sortProducts(mockProducts, 'price-asc');
    expect(sorted.map((p) => p.price_inr)).toEqual([450, 650, 1800, 2400]);
  });

  it('sorts by price-desc (highest price first)', () => {
    const sorted = sortProducts(mockProducts, 'price-desc');
    expect(sorted.map((p) => p.price_inr)).toEqual([2400, 1800, 650, 450]);
  });

  it('sorts by newest (created_at desc)', () => {
    const sorted = sortProducts(mockProducts, 'newest');
    expect(sorted.map((p) => p.id)).toEqual(['prod-4', 'prod-3', 'prod-2', 'prod-1']);
  });

  it('sorts by featured (sort_order asc, then newest first for ties)', () => {
    const sorted = sortProducts(mockProducts, 'featured');
    // prod-2 has sort_order 5 (created Feb 15)
    // prod-4 has sort_order 5 (created Mar 10) -> tie broken by created_at desc, so prod-4 comes before prod-2
    // prod-1 has sort_order 10
    // prod-3 has sort_order 20
    expect(sorted.map((p) => p.id)).toEqual(['prod-4', 'prod-2', 'prod-1', 'prod-3']);
  });

  it('does not mutate the original array', () => {
    const originalOrder = mockProducts.map((p) => p.id);
    sortProducts(mockProducts, 'price-asc');
    expect(mockProducts.map((p) => p.id)).toEqual(originalOrder);
  });
});
