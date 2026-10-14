import { describe, it, expect } from 'vitest';
import { calculateScaledDimensions } from '../imageCompressor';

describe('imageCompressor', () => {
  describe('calculateScaledDimensions', () => {
    it('returns original dimensions if image is already smaller than maxDimension', () => {
      const result = calculateScaledDimensions(800, 600, 1200);
      expect(result).toEqual({ width: 800, height: 600 });
    });

    it('scales wide landscape images so width equals maxDimension', () => {
      const result = calculateScaledDimensions(2400, 1200, 1200);
      expect(result).toEqual({ width: 1200, height: 600 });
    });

    it('scales tall portrait images so height equals maxDimension', () => {
      const result = calculateScaledDimensions(1200, 2400, 1200);
      expect(result).toEqual({ width: 600, height: 1200 });
    });

    it('scales square images proportionally', () => {
      const result = calculateScaledDimensions(3000, 3000, 1200);
      expect(result).toEqual({ width: 1200, height: 1200 });
    });
  });
});
