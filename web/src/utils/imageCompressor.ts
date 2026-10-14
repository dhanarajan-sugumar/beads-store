/**
 * Browser-side image compression utility.
 * Resizes image to max 1200px on the longest side and compresses to WebP (~200KB max).
 */

export interface CompressionOptions {
  maxDimension?: number;
  maxSizeBytes?: number;
  initialQuality?: number;
}

export function calculateScaledDimensions(
  width: number,
  height: number,
  maxDimension = 1200
): { width: number; height: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  if (width > height) {
    const scale = maxDimension / width;
    return {
      width: maxDimension,
      height: Math.round(height * scale),
    };
  } else {
    const scale = maxDimension / height;
    return {
      width: Math.round(width * scale),
      height: maxDimension,
    };
  }
}

export async function compressImageToWebP(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxDimension = 1200,
    maxSizeBytes = 200 * 1024, // 200 KB
    initialQuality = 0.85,
  } = options;

  // Read file into image element
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };
    img.src = url;
  });

  const { width, height } = calculateScaledDimensions(image.width, image.height, maxDimension);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }

  // Draw scaled image
  ctx.drawImage(image, 0, 0, width, height);

  // Compress to WebP iteratively to hit target size if possible
  let quality = initialQuality;
  let compressedBlob: Blob | null = null;

  while (quality >= 0.4) {
    compressedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/webp', quality);
    });

    if (compressedBlob && (compressedBlob.size <= maxSizeBytes || quality <= 0.45)) {
      break;
    }
    quality -= 0.15;
  }

  if (!compressedBlob) {
    throw new Error('Canvas to WebP conversion failed');
  }

  // Generate safe filename with .webp extension
  const originalBaseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
  const webpFileName = `${originalBaseName}-${Date.now()}.webp`;

  return new File([compressedBlob], webpFileName, {
    type: 'image/webp',
    lastModified: Date.now(),
  });
}
