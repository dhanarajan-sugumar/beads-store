#!/usr/bin/env python3
"""
Jewellery product image exporter
Creates:
  1) marketplace square JPEG: 2000 x 2000, white canvas
  2) storefront portrait WebP: 1080 x 1350, white canvas

Important:
- This script does NOT remove the background or invent product details.
- First use an image editor (for example, Gemini image editing) to make the
  background pure white while preserving the original jewellery and display bust.
- The script then crops/resizes the edited image to the requested output sizes.
- It fits the complete image into each canvas, so it does not crop the necklace.
"""

from pathlib import Path
import argparse
from PIL import Image, ImageFilter, ImageOps

def fit_on_canvas(image: Image.Image, size: tuple[int, int], background=(255, 255, 255)) -> Image.Image:
    image = ImageOps.exif_transpose(image).convert("RGB")
    canvas = Image.new("RGB", size, background)
    scale = min(size[0] / image.width, size[1] / image.height)
    new_size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    resized = image.resize(new_size, Image.Resampling.LANCZOS)
    x = (size[0] - resized.width) // 2
    y = (size[1] - resized.height) // 2
    canvas.paste(resized, (x, y))
    return canvas

def main():
    parser = argparse.ArgumentParser(description="Export jewellery photos for marketplaces and storefront.")
    parser.add_argument("input_image", help="Path to the background-edited source image")
    parser.add_argument("--outdir", default="exports", help="Output folder (default: exports)")
    parser.add_argument("--name", default=None, help="Output filename base, without extension")
    args = parser.parse_args()

    source = Path(args.input_image)
    if not source.is_file():
        raise SystemExit(f"Input image not found: {source}")

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    base = args.name or source.stem

    with Image.open(source) as im:
        # Marketplace image, 1:1 square JPEG
        square = fit_on_canvas(im, (2000, 2000))
        square = square.filter(ImageFilter.UnsharpMask(radius=1.0, percent=90, threshold=3))
        square_path = outdir / f"{base}-marketplace-square.jpg"
        square.save(square_path, "JPEG", quality=95, optimize=True, subsampling=0, dpi=(300, 300))

        # Storefront image, 4:5 portrait WebP
        portrait = fit_on_canvas(im, (1080, 1350))
        portrait = portrait.filter(ImageFilter.UnsharpMask(radius=0.8, percent=80, threshold=3))
        portrait_path = outdir / f"{base}-storefront-4x5.webp"
        portrait.save(portrait_path, "WEBP", quality=92, method=6)

    print("Export complete:")
    print(f"  Marketplace: {square_path.resolve()} (2000 x 2000 JPEG)")
    print(f"  Storefront:  {portrait_path.resolve()} (1080 x 1350 WebP)")

if __name__ == "__main__":
    main()
