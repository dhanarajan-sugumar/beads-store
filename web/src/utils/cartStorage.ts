/**
 * Safe localStorage wrapper for cart persistence.
 * Guarantees no crashes even when localStorage is unavailable, disabled, or throws (e.g. Safari Private Mode / quota exceeded).
 */

export interface CartItem {
  id: string;
  name: string;
  price_inr: number;
  image_url: string | null;
  sku?: string | null;
  quantity: number;
}

export const CART_STORAGE_KEY = 'madhis_handcrafts_cart_v1';

export function loadCartFromStorage(): CartItem[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is CartItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.price_inr === 'number' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
    );
  } catch (error) {
    console.warn('[CartStorage] Failed to read from localStorage:', error);
    return [];
  }
}

export function saveCartToStorage(items: CartItem[]): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('[CartStorage] Failed to write to localStorage:', error);
  }
}

export function clearCartStorage(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.warn('[CartStorage] Failed to clear localStorage:', error);
  }
}
