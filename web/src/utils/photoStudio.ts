/**
 * Utilities for the Admin Marketplace Photo Studio.
 * Handles bounding box calculations, auto-centering, frame fill ratios,
 * and filename formatting for marketplace exports.
 */

export interface BoundingBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

export interface FittedPlacement {
  renderX: number;
  renderY: number;
  renderWidth: number;
  renderHeight: number;
  scale: number;
}

export interface StudioExportPreset {
  id: 'marketplace-square' | 'storefront-portrait';
  label: string;
  sublabel: string;
  width: number;
  height: number;
  format: 'image/jpeg' | 'image/webp';
  extension: 'jpg' | 'webp';
  defaultQuality: number;
  suffix: string;
  description: string;
}

export const EXPORT_PRESETS: Record<'marketplace' | 'storefront', StudioExportPreset> = {
  marketplace: {
    id: 'marketplace-square',
    label: 'Download for Amazon / Flipkart / Meesho',
    sublabel: '1:1 Square (2000 × 2000 px) • Pure White #FFFFFF JPEG',
    width: 2000,
    height: 2000,
    format: 'image/jpeg',
    extension: 'jpg',
    defaultQuality: 0.95,
    suffix: 'marketplace-square',
    description: 'Complies with Amazon & Flipkart 80–85% frame fill and pure white #FFFFFF requirement.',
  },
  storefront: {
    id: 'storefront-portrait',
    label: 'Download for Madhis Handcrafts',
    sublabel: '4:5 Portrait (1080 × 1350 px) • High-Res WebP',
    width: 1080,
    height: 1350,
    format: 'image/webp',
    extension: 'webp',
    defaultQuality: 0.92,
    suffix: 'storefront-4x5',
    description: 'Tailored for luxury boutique Instagram feeds, Pinterest, and Madhis product cards.',
  },
};

export interface BackgroundColorOption {
  id: string;
  label: string;
  hex: string;
  textClass: string;
  borderClass: string;
  badge: string;
}

export const STUDIO_BACKGROUNDS: BackgroundColorOption[] = [
  {
    id: 'white',
    label: 'Pure White',
    hex: '#FFFFFF',
    textClass: 'text-stone-900',
    borderClass: 'border-stone-300',
    badge: 'Amazon / Flipkart Required',
  },
  {
    id: 'warm-linen',
    label: 'Soft Warm Linen',
    hex: '#FAF5EC',
    textClass: 'text-stone-900',
    borderClass: 'border-[#E0D7CC]',
    badge: 'Madhis Brand Aesthetic',
  },
  {
    id: 'champagne',
    label: 'Champagne Header',
    hex: '#F7F0E7',
    textClass: 'text-stone-900',
    borderClass: 'border-[#E8DFD3]',
    badge: 'Storefront Tone',
  },
  {
    id: 'transparent',
    label: 'Transparent (PNG)',
    hex: 'transparent',
    textClass: 'text-stone-900',
    borderClass: 'border-stone-300',
    badge: 'Cutout Only',
  },
];

/**
 * Strips directory paths and file extensions to produce a clean base name.
 */
export function getSanitizedBaseFilename(rawName: string, fallback = 'jewellery-piece'): string {
  if (!rawName || typeof rawName !== 'string') return fallback;
  // Remove path
  const nameOnly = rawName.split(/[/\\]/).pop() || fallback;
  // Remove extension
  const withoutExt = nameOnly.replace(/\.[^/.]+$/, '').trim();
  // Sanitize non-alphanumeric characters to safe hyphens
  const sanitized = withoutExt
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return sanitized || fallback;
}

/**
 * Calculates optimal render position and dimensions to center a subject
 * inside a target frame with a prescribed fill ratio (e.g. 0.85 = 85%).
 */
export function calculateFittedDimensions(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  fillRatio = 0.85
): FittedPlacement {
  if (sourceWidth <= 0 || sourceHeight <= 0 || targetWidth <= 0 || targetHeight <= 0) {
    return {
      renderX: 0,
      renderY: 0,
      renderWidth: targetWidth,
      renderHeight: targetHeight,
      scale: 1,
    };
  }

  // Clamped fill ratio between 0.50 (50%) and 0.98 (98%)
  const clampedFill = Math.max(0.5, Math.min(0.98, fillRatio));

  const maxAllowedWidth = targetWidth * clampedFill;
  const maxAllowedHeight = targetHeight * clampedFill;

  const scale = Math.min(maxAllowedWidth / sourceWidth, maxAllowedHeight / sourceHeight);

  const renderWidth = Math.round(sourceWidth * scale);
  const renderHeight = Math.round(sourceHeight * scale);

  const renderX = Math.round((targetWidth - renderWidth) / 2);
  const renderY = Math.round((targetHeight - renderHeight) / 2);

  return {
    renderX,
    renderY,
    renderWidth,
    renderHeight,
    scale,
  };
}

/**
 * Scans an RGBA image data buffer to detect the tight non-transparent bounding box
 * of the foreground subject. Allows auto-trimming unnecessary empty margins so that
 * the necklace or bracelet fills the marketplace canvas accurately.
 */
export function detectAlphaBoundingBox(
  pixelData: Uint8ClampedArray,
  width: number,
  height: number,
  alphaThreshold = 18
): BoundingBox {
  if (width <= 0 || height <= 0 || pixelData.length < width * height * 4) {
    return { minX: 0, minY: 0, width: Math.max(1, width), height: Math.max(1, height) };
  }

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width * 4;
    for (let x = 0; x < width; x++) {
      const alpha = pixelData[rowOffset + x * 4 + 3];
      if (alpha > alphaThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // If no non-transparent pixels found, return full bounds
  if (maxX < minX || maxY < minY) {
    return { minX: 0, minY: 0, width, height };
  }

  return {
    minX,
    minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}
