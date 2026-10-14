/**
 * Pure functions for cart calculations.
 */

export interface CartItemMath {
  price_inr: number;
  quantity: number;
}

/**
 * Calculates line total for a single item.
 */
export function calculateLineTotal(priceInr: number, quantity: number): number {
  if (priceInr < 0 || quantity < 0) return 0;
  return Math.round(priceInr * quantity);
}

/**
 * Calculates grand total for an array of cart items.
 */
export function calculateCartGrandTotal(items: CartItemMath[]): number {
  return items.reduce((total, item) => {
    return total + calculateLineTotal(item.price_inr, item.quantity);
  }, 0);
}

/**
 * Calculates total item count in cart.
 */
export function calculateTotalItemCount(items: CartItemMath[]): number {
  return items.reduce((count, item) => count + Math.max(0, item.quantity), 0);
}

/**
 * Clamps quantity to a valid range [1, maxQuantity].
 */
export function clampQuantity(quantity: number, min = 1, max = 99): number {
  if (isNaN(quantity) || quantity < min) return min;
  if (quantity > max) return max;
  return Math.floor(quantity);
}
