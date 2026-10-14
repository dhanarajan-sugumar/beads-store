import { describe, it, expect } from 'vitest';
import {
  calculateLineTotal,
  calculateCartGrandTotal,
  calculateTotalItemCount,
  clampQuantity,
} from '../cartMath';

describe('cartMath', () => {
  describe('calculateLineTotal', () => {
    it('calculates correct total for positive price and quantity', () => {
      expect(calculateLineTotal(499, 2)).toBe(998);
      expect(calculateLineTotal(1299, 1)).toBe(1299);
    });

    it('returns 0 when quantity or price is 0 or negative', () => {
      expect(calculateLineTotal(499, 0)).toBe(0);
      expect(calculateLineTotal(-499, 2)).toBe(0);
      expect(calculateLineTotal(499, -1)).toBe(0);
    });
  });

  describe('calculateCartGrandTotal', () => {
    it('calculates total for multiple items', () => {
      const items = [
        { price_inr: 499, quantity: 2 },  // 998
        { price_inr: 1299, quantity: 1 }, // 1299
        { price_inr: 349, quantity: 3 },  // 1047
      ];
      expect(calculateCartGrandTotal(items)).toBe(3344);
    });

    it('returns 0 for empty cart', () => {
      expect(calculateCartGrandTotal([])).toBe(0);
    });
  });

  describe('calculateTotalItemCount', () => {
    it('sums all quantities correctly', () => {
      const items = [
        { price_inr: 499, quantity: 2 },
        { price_inr: 1299, quantity: 1 },
        { price_inr: 349, quantity: 4 },
      ];
      expect(calculateTotalItemCount(items)).toBe(7);
    });

    it('returns 0 for empty cart', () => {
      expect(calculateTotalItemCount([])).toBe(0);
    });
  });

  describe('clampQuantity', () => {
    it('clamps numbers below min to min', () => {
      expect(clampQuantity(0)).toBe(1);
      expect(clampQuantity(-5)).toBe(1);
    });

    it('clamps numbers above max to max', () => {
      expect(clampQuantity(150, 1, 99)).toBe(99);
    });

    it('returns integer for valid range', () => {
      expect(clampQuantity(5)).toBe(5);
      expect(clampQuantity(5.7)).toBe(5);
    });
  });
});
