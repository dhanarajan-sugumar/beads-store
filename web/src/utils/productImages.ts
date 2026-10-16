import type { Product } from '@/types/database';

/**
 * Returns a normalized array of image URLs for a product.
 * Prefers the `images` array column, falling back to legacy single `image_url`.
 */
export function getProductImages(product: Partial<Product> | null | undefined): string[] {
  if (!product) return [];
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images.filter((url): url is string => Boolean(url && url.trim()));
  }
  if (product.image_url && product.image_url.trim()) {
    return [product.image_url.trim()];
  }
  return [];
}

/**
 * Returns the primary (cover) image URL for a product, or null if none.
 */
export function getPrimaryImage(product: Partial<Product> | null | undefined): string | null {
  const images = getProductImages(product);
  return images.length > 0 ? images[0] : null;
}

/**
 * Returns the secondary image URL for hover preview (if available).
 */
export function getSecondaryImage(product: Partial<Product> | null | undefined): string | null {
  const images = getProductImages(product);
  return images.length > 1 ? images[1] : null;
}

/**
 * Moves an image to index 0 so it becomes the primary cover image.
 */
export function setCoverImage(images: string[], index: number): string[] {
  if (index <= 0 || index >= images.length) return [...images];
  const cover = images[index];
  const rest = images.filter((_, idx) => idx !== index);
  return [cover, ...rest];
}

/**
 * Swaps an image with its adjacent neighbour (left or right).
 */
export function moveImage(images: string[], index: number, direction: 'left' | 'right'): string[] {
  const targetIndex = direction === 'left' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= images.length) return [...images];
  const result = [...images];
  const temp = result[index];
  result[index] = result[targetIndex];
  result[targetIndex] = temp;
  return result;
}
