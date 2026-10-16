import { describe, it, expect } from 'vitest';
import {
  getProductImages,
  getPrimaryImage,
  getSecondaryImage,
  setCoverImage,
  moveImage,
} from '../productImages';

describe('productImages utility', () => {
  describe('getProductImages', () => {
    it('returns empty array when product is null or undefined', () => {
      expect(getProductImages(null)).toEqual([]);
      expect(getProductImages(undefined)).toEqual([]);
    });

    it('falls back to single image_url when images array is missing or empty', () => {
      expect(getProductImages({ image_url: 'https://example.com/single.jpg' })).toEqual([
        'https://example.com/single.jpg',
      ]);
      expect(getProductImages({ image_url: 'https://example.com/single.jpg', images: [] })).toEqual([
        'https://example.com/single.jpg',
      ]);
    });

    it('prioritizes images array when present', () => {
      const product = {
        image_url: 'https://example.com/legacy.jpg',
        images: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
      };
      expect(getProductImages(product)).toEqual([
        'https://example.com/1.jpg',
        'https://example.com/2.jpg',
      ]);
    });

    it('filters out empty or whitespace-only URLs', () => {
      const product = {
        images: ['https://example.com/1.jpg', '', '   ', 'https://example.com/2.jpg'],
      };
      expect(getProductImages(product)).toEqual([
        'https://example.com/1.jpg',
        'https://example.com/2.jpg',
      ]);
    });
  });

  describe('getPrimaryImage & getSecondaryImage', () => {
    it('returns primary image and secondary image correctly', () => {
      const product = {
        images: ['https://example.com/1.jpg', 'https://example.com/2.jpg', 'https://example.com/3.jpg'],
      };
      expect(getPrimaryImage(product)).toBe('https://example.com/1.jpg');
      expect(getSecondaryImage(product)).toBe('https://example.com/2.jpg');
    });

    it('returns null for secondary image when only one image exists', () => {
      const product = {
        image_url: 'https://example.com/1.jpg',
      };
      expect(getPrimaryImage(product)).toBe('https://example.com/1.jpg');
      expect(getSecondaryImage(product)).toBeNull();
    });
  });

  describe('setCoverImage', () => {
    it('moves selected index to position 0', () => {
      const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
      const updated = setCoverImage(images, 2);
      expect(updated).toEqual(['img3.jpg', 'img1.jpg', 'img2.jpg']);
    });

    it('returns original array if index is 0 or out of bounds', () => {
      const images = ['img1.jpg', 'img2.jpg'];
      expect(setCoverImage(images, 0)).toEqual(['img1.jpg', 'img2.jpg']);
      expect(setCoverImage(images, 5)).toEqual(['img1.jpg', 'img2.jpg']);
    });
  });

  describe('moveImage', () => {
    it('swaps image with left neighbour', () => {
      const images = ['a.jpg', 'b.jpg', 'c.jpg'];
      expect(moveImage(images, 1, 'left')).toEqual(['b.jpg', 'a.jpg', 'c.jpg']);
    });

    it('swaps image with right neighbour', () => {
      const images = ['a.jpg', 'b.jpg', 'c.jpg'];
      expect(moveImage(images, 1, 'right')).toEqual(['a.jpg', 'c.jpg', 'b.jpg']);
    });

    it('does not swap if already at boundary', () => {
      const images = ['a.jpg', 'b.jpg'];
      expect(moveImage(images, 0, 'left')).toEqual(['a.jpg', 'b.jpg']);
      expect(moveImage(images, 1, 'right')).toEqual(['a.jpg', 'b.jpg']);
    });
  });
});
