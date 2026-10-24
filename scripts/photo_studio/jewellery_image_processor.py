#!/usr/bin/env python3
"""
Jewellery image processor for an app or command line.

What it does:
1. Uses rembg to segment the product/display bust from the background.
2. Composites the foreground onto pure white (#FFFFFF).
3. Exports:
   - marketplace JPEG: 2000 x 2000
   - storefront WebP: 1080 x 1350

Important:
- The approved image in the previous conversation was generated with an image model,
  so its exact edit cannot be reproduced by a deterministic Python script.
- This script implements a reusable, non-generative background-removal workflow.
- Always visually review the mask before publishing. White jewellery busts on pale
  backgrounds can be difficult to segment perfectly.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Tuple

from PIL import Image, ImageFilter, ImageOps

WHITE = (255, 255, 255)


def remove_background(image: Image.Image) -> Image.Image:
    """Return RGBA image with background removed using rembg."""
    try:
        from rembg import remove, new_session
    except ImportError as exc:
        raise RuntimeError(
            "Missing dependency. Install with: python -m pip install rembg"
        ) from exc

    # The model/session is cached by rembg after first download.
    session = new_session("u2net")
    image = ImageOps.exif_transpose(image).convert("RGBA")
    result = remove(image, session=session)
    if not isinstance(result, Image.Image):
        from io import BytesIO
        result = Image.open(BytesIO(result))
    return result.convert("RGBA")


def crop_to_foreground(
    rgba: Image.Image,
    padding_fraction: float = 0.04,
) -> Image.Image:
    """Crop transparent margins while preserving a small margin around the product."""
    alpha = rgba.getchannel("A")
    bbox = alpha.point(lambda p: 255 if p > 12 else 0).getbbox()
    if not bbox:
        raise ValueError("No foreground was detected. Try a clearer input image.")
    left, top, right, bottom = bbox
    pad = round(max(right - left, bottom - top) * padding_fraction)
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(rgba.width, right + pad)
    bottom = min(rgba.height, bottom + pad)
    return rgba.crop((left, top, right, bottom))


def composite_white(rgba: Image.Image) -> Image.Image:
    """Composite RGBA foreground over pure white."""
    background = Image.new("RGBA", rgba.size, (*WHITE, 255))
    return Image.alpha_composite(background, rgba).convert("RGB")


def fit_on_canvas(
    image: Image.Image,
    size: Tuple[int, int],
    margin_fraction: float = 0.04,
) -> Image.Image:
    """Fit the whole product into a white canvas without cropping it."""
    image = image.convert("RGB")
    target_w, target_h = size
    max_w = round(target_w * (1 - 2 * margin_fraction))
    max_h = round(target_h * (1 - 2 * margin_fraction))
    scale = min(max_w / image.width, max_h / image.height)
    resized = image.resize(
        (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGB", size, WHITE)
    x = (target_w - resized.width) // 2
    y = (target_h - resized.height) // 2
    canvas.paste(resized, (x, y))
    return canvas.filter(ImageFilter.UnsharpMask(radius=0.8, percent=70, threshold=3))


def process_image(input_path: Path, output_dir: Path, name: str | None = None) -> list[Path]:
    """Create marketplace and storefront exports. Returns generated file paths."""
    if not input_path.is_file():
        raise FileNotFoundError(f"Input image not found: {input_path}")

    output_dir.mkdir(parents=True, exist_ok=True)
    stem = name or input_path.stem

    with Image.open(input_path) as source:
        rgba = remove_background(source)
    foreground = crop_to_foreground(rgba)
    white_product = composite_white(foreground)

    marketplace = fit_on_canvas(white_product, (2000, 2000), margin_fraction=0.045)
    marketplace_path = output_dir / f"{stem}-marketplace-square.jpg"
    marketplace.save(
        marketplace_path,
        "JPEG",
        quality=95,
        optimize=True,
        subsampling=0,
        dpi=(300, 300),
    )

    storefront = fit_on_canvas(white_product, (1080, 1350), margin_fraction=0.045)
    storefront_path = output_dir / f"{stem}-storefront-4x5.webp"
    storefront.save(storefront_path, "WEBP", quality=92, method=6)

    return [marketplace_path, storefront_path]


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare jewellery photos for marketplaces and storefronts.")
    parser.add_argument("input_image", help="Path to original jewellery photo")
    parser.add_argument("--outdir", default="exports", help="Output folder (default: exports)")
    parser.add_argument("--name", default=None, help="Filename base (defaults to input filename)")
    args = parser.parse_args()

    paths = process_image(Path(args.input_image), Path(args.outdir), args.name)
    for path in paths:
        with Image.open(path) as im:
            print(f"{path} | {im.format} | {im.width}x{im.height} | {path.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
