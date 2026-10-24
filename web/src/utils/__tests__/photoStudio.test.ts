import { describe, it, expect } from 'vitest';
import {
  getSanitizedBaseFilename,
  calculateFittedDimensions,
  detectAlphaBoundingBox,
  EXPORT_PRESETS,
  STUDIO_BACKGROUNDS,
} from '../photoStudio';

describe('photoStudio utilities', () => {
  describe('getSanitizedBaseFilename', () => {
    it('strips extensions from standard image filenames', () => {
      expect(getSanitizedBaseFilename('ruby-necklace.jpg')).toBe('ruby-necklace');
      expect(getSanitizedBaseFilename('emerald-bead-bracelet.PNG')).toBe('emerald-bead-bracelet');
      expect(getSanitizedBaseFilename('pearl_choker.webp')).toBe('pearl_choker');
    });

    it('strips path components correctly', () => {
      expect(getSanitizedBaseFilename('/uploads/raw/purple-beads.jpeg')).toBe('purple-beads');
      expect(getSanitizedBaseFilename('C:\\Users\\Photos\\necklace.png')).toBe('necklace');
    });

    it('replaces spaces and special characters with hyphens', () => {
      expect(getSanitizedBaseFilename('Handmade Crystal Necklace #2 (2026).jpg')).toBe(
        'handmade-crystal-necklace-2-2026'
      );
    });

    it('falls back to default name when input is empty or invalid', () => {
      expect(getSanitizedBaseFilename('')).toBe('jewellery-piece');
      expect(getSanitizedBaseFilename('...')).toBe('jewellery-piece');
    });
  });

  describe('calculateFittedDimensions', () => {
    it('centers a 1:1 square subject in a 2000x2000 frame at 85% fill', () => {
      const result = calculateFittedDimensions(1000, 1000, 2000, 2000, 0.85);
      expect(result.renderWidth).toBe(1700);
      expect(result.renderHeight).toBe(1700);
      expect(result.renderX).toBe(150); // (2000 - 1700) / 2
      expect(result.renderY).toBe(150);
    });

    it('scales and centers a landscape subject into a 2000x2000 frame at 80% fill', () => {
      const result = calculateFittedDimensions(2000, 1000, 2000, 2000, 0.80);
      // Max allowed width is 1600 (80%), height scales proportionally to 800
      expect(result.renderWidth).toBe(1600);
      expect(result.renderHeight).toBe(800);
      expect(result.renderX).toBe(200); // (2000 - 1600) / 2
      expect(result.renderY).toBe(600); // (2000 - 800) / 2
    });

    it('scales and centers a tall portrait subject (e.g. long necklace) into a 2000x2000 frame at 90% fill', () => {
      const result = calculateFittedDimensions(500, 1500, 2000, 2000, 0.90);
      // Max allowed height is 1800 (90%), width scales to 500 * (1800 / 1500) = 600
      expect(result.renderHeight).toBe(1800);
      expect(result.renderWidth).toBe(600);
      expect(result.renderX).toBe(700); // (2000 - 600) / 2
      expect(result.renderY).toBe(100); // (2000 - 1800) / 2
    });

    it('fits correctly into a 4:5 portrait frame (1080x1350) for Madhis storefront', () => {
      const result = calculateFittedDimensions(1000, 1000, 1080, 1350, 0.85);
      // Max allowed width: 1080 * 0.85 = 918. Max allowed height: 1350 * 0.85 = 1147.5
      // Square subject is constrained by width -> 918x918
      expect(result.renderWidth).toBe(918);
      expect(result.renderHeight).toBe(918);
      expect(result.renderX).toBe(81); // (1080 - 918) / 2
      expect(result.renderY).toBe(216); // (1350 - 918) / 2
    });

    it('handles edge cases gracefully without dividing by zero', () => {
      const result = calculateFittedDimensions(0, 0, 2000, 2000, 0.85);
      expect(result.renderWidth).toBe(2000);
      expect(result.renderHeight).toBe(2000);
      expect(result.renderX).toBe(0);
      expect(result.renderY).toBe(0);
    });
  });

  describe('detectAlphaBoundingBox', () => {
    it('detects tight non-transparent bounding box in pixel buffer', () => {
      const width = 10;
      const height = 10;
      const buffer = new Uint8ClampedArray(width * height * 4); // all 0 (transparent)

      // Set a 4x4 non-transparent block at x=[2..5], y=[3..6]
      for (let y = 3; y <= 6; y++) {
        for (let x = 2; x <= 5; x++) {
          const idx = (y * width + x) * 4;
          buffer[idx] = 255;     // R
          buffer[idx + 1] = 200; // G
          buffer[idx + 2] = 100; // B
          buffer[idx + 3] = 255; // Alpha
        }
      }

      const box = detectAlphaBoundingBox(buffer, width, height, 20);
      expect(box.minX).toBe(2);
      expect(box.minY).toBe(3);
      expect(box.width).toBe(4); // 5 - 2 + 1
      expect(box.height).toBe(4); // 6 - 3 + 1
    });

    it('returns full bounds when buffer is completely transparent', () => {
      const width = 20;
      const height = 30;
      const buffer = new Uint8ClampedArray(width * height * 4); // all zeros

      const box = detectAlphaBoundingBox(buffer, width, height, 20);
      expect(box.minX).toBe(0);
      expect(box.minY).toBe(0);
      expect(box.width).toBe(width);
      expect(box.height).toBe(height);
    });
  });

  describe('presets & configuration', () => {
    it('provides standard Amazon marketplace square preset (2000x2000)', () => {
      const preset = EXPORT_PRESETS.marketplace;
      expect(preset.width).toBe(2000);
      expect(preset.height).toBe(2000);
      expect(preset.format).toBe('image/jpeg');
      expect(preset.extension).toBe('jpg');
    });

    it('provides Madhis storefront 4:5 portrait preset (1080x1350)', () => {
      const preset = EXPORT_PRESETS.storefront;
      expect(preset.width).toBe(1080);
      expect(preset.height).toBe(1350);
      expect(preset.format).toBe('image/webp');
      expect(preset.extension).toBe('webp');
    });

    it('includes pure white and soft warm linen background options', () => {
      const white = STUDIO_BACKGROUNDS.find((b) => b.id === 'white');
      const linen = STUDIO_BACKGROUNDS.find((b) => b.id === 'warm-linen');
      expect(white?.hex).toBe('#FFFFFF');
      expect(linen?.hex).toBe('#FAF5EC');
    });
  });
});
