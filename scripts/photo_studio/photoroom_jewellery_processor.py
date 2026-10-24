#!/usr/bin/env python3
"""
PhotoRoom Jewellery Image Processor for Madhi's Handcrafts.

Integrates PhotoRoom's Remove Background API (https://sdk.photoroom.com/v1/segment)
with deterministic marketplace and storefront export pipelines.

Features:
- Sandbox Mode (--sandbox): Test for free without consuming your 10 production credits.
- Production Mode: Uses your credits for pristine, watermark-free jewellery photos.
- Automatic Exports:
    1) [name]-marketplace-square.jpg (2000 x 2000 px, 1:1, JPEG, Pure White #FFFFFF, 300 DPI)
    2) [name]-storefront-4x5.webp    (1080 x 1350 px, 4:5, WebP, quality 92)
    3) [name]-transparent-cutout.png (Original transparent cutout for archival/design)
"""

from __future__ import annotations

import argparse
import io
import os
import sys
from pathlib import Path
from typing import Tuple

import requests
from PIL import Image, ImageFilter, ImageOps

PHOTOROOM_API_URL = "https://sdk.photoroom.com/v1/segment"
WHITE = (255, 255, 255)


def get_api_key(cli_key: str | None, sandbox: bool) -> str:
    """Resolve API key from CLI argument, env var, or .env file."""
    key = cli_key or os.getenv("PHOTOROOM_API_KEY")

    if not key:
        # Check project .env or home ~/.env
        for env_path in [Path(".env"), Path("../.env"), Path.home() / ".env"]:
            if env_path.is_file():
                for line in env_path.read_text(encoding="utf-8").splitlines():
                    line = line.strip()
                    if line.startswith("PHOTOROOM_API_KEY="):
                        key = line.split("=", 1)[1].strip().strip('"\'')
                        break
            if key:
                break

    if not key:
        print("\n❌ Error: PhotoRoom API key not found.", file=sys.stderr)
        print("Please provide it via one of the following methods:", file=sys.stderr)
        print("  1. Argument: --api-key YOUR_KEY", file=sys.stderr)
        print("  2. Environment: export PHOTOROOM_API_KEY=YOUR_KEY", file=sys.stderr)
        print("  3. File: Add PHOTOROOM_API_KEY=YOUR_KEY to your .env file\n", file=sys.stderr)
        sys.exit(1)

    # In sandbox mode, PhotoRoom requires the key to start with 'sandbox_'
    if sandbox and not key.startswith("sandbox_"):
        key = f"sandbox_{key}"
    elif not sandbox and key.startswith("sandbox_"):
        # Strip sandbox_ if production mode explicitly requested
        key = key[len("sandbox_"):]

    return key


def remove_background_photoroom(
    image_path: Path,
    api_key: str,
    timeout: int = 45,
) -> Image.Image:
    """Calls PhotoRoom API to segment image and returns transparent RGBA Image."""
    headers = {
        "x-api-key": api_key,
    }

    files = {
        "image_file": (image_path.name, open(image_path, "rb"), "image/jpeg"),
    }

    data = {
        "format": "png",      # Returns transparent PNG
        "channels": "rgba",
        "size": "full",       # Full resolution up to 4096x4096
        "crop": "false",      # Retain original framing; our script fits and centers
    }

    print(f"⏳ Sending {image_path.name} to PhotoRoom API...")
    try:
        response = requests.post(
            PHOTOROOM_API_URL,
            headers=headers,
            files=files,
            data=data,
            timeout=timeout,
        )
    finally:
        files["image_file"][1].close()

    if response.status_code != 200:
        error_msg = f"PhotoRoom API returned error {response.status_code}: {response.text}"
        if response.status_code == 401:
            error_msg += "\n-> Check your API key. (If using sandbox, key must be sandbox_YOUR_KEY)."
        elif response.status_code == 402:
            error_msg += "\n-> Out of credits. Check your PhotoRoom dashboard."
        raise RuntimeError(error_msg)

    print("✓ Background removal completed by PhotoRoom!")
    return Image.open(io.BytesIO(response.content)).convert("RGBA")


def fit_on_canvas(
    image: Image.Image,
    size: Tuple[int, int],
    margin_fraction: float = 0.05,
    background: Tuple[int, int, int] = WHITE,
) -> Image.Image:
    """Centers and scales the jewellery piece onto the target canvas with clean padding."""
    image = ImageOps.exif_transpose(image)
    target_w, target_h = size
    max_w = round(target_w * (1 - 2 * margin_fraction))
    max_h = round(target_h * (1 - 2 * margin_fraction))

    scale = min(max_w / image.width, max_h / image.height)
    new_w = max(1, round(image.width * scale))
    new_h = max(1, round(image.height * scale))

    resized = image.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Composite onto solid background
    canvas = Image.new("RGBA", size, (*background, 255))
    x = (target_w - new_w) // 2
    y = (target_h - new_h) // 2
    canvas.paste(resized, (x, y), mask=resized.getchannel("A") if "A" in resized.getbands() else None)

    rgb_canvas = canvas.convert("RGB")
    return rgb_canvas.filter(ImageFilter.UnsharpMask(radius=0.8, percent=75, threshold=3))


def process_image(
    input_path: Path,
    output_dir: Path,
    api_key: str,
    name: str | None = None,
    save_cutout: bool = True,
) -> list[Path]:
    """Runs PhotoRoom background removal and exports marketplace & storefront images."""
    if not input_path.is_file():
        raise FileNotFoundError(f"Input image not found: {input_path}")

    output_dir.mkdir(parents=True, exist_ok=True)
    stem = name or input_path.stem

    # 1. Background removal via PhotoRoom API
    transparent_rgba = remove_background_photoroom(input_path, api_key)

    created_paths = []

    # 2. Save raw transparent cutout if requested
    if save_cutout:
        cutout_path = output_dir / f"{stem}-transparent-cutout.png"
        transparent_rgba.save(cutout_path, "PNG", optimize=True)
        created_paths.append(cutout_path)

    # 3. Amazon / Flipkart / Meesho: 2000 x 2000 1:1 Square JPEG
    marketplace = fit_on_canvas(transparent_rgba, (2000, 2000), margin_fraction=0.05)
    marketplace_path = output_dir / f"{stem}-marketplace-square.jpg"
    marketplace.save(
        marketplace_path,
        "JPEG",
        quality=95,
        optimize=True,
        subsampling=0,
        dpi=(300, 300),
    )
    created_paths.append(marketplace_path)

    # 4. Madhi's Handcrafts Storefront: 1080 x 1350 4:5 Portrait WebP
    storefront = fit_on_canvas(transparent_rgba, (1080, 1350), margin_fraction=0.05)
    storefront_path = output_dir / f"{stem}-storefront-4x5.webp"
    storefront.save(storefront_path, "WEBP", quality=92, method=6)
    created_paths.append(storefront_path)

    return created_paths


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Process jewellery photos using PhotoRoom API with marketplace & storefront exports."
    )
    parser.add_argument("input_image", help="Path to raw jewellery photograph")
    parser.add_argument(
        "--api-key",
        default=None,
        help="PhotoRoom API key (or set PHOTOROOM_API_KEY environment variable)",
    )
    parser.add_argument(
        "--sandbox",
        action="store_true",
        help="Use Sandbox Mode (FREE testing with watermark, does NOT consume your 10 credits)",
    )
    parser.add_argument(
        "--outdir",
        default="exports",
        help="Output folder (default: exports)",
    )
    parser.add_argument(
        "--name",
        default=None,
        help="Base name for exported files (default: original filename)",
    )

    args = parser.parse_args()

    # Resolve API Key
    key = get_api_key(args.api_key, sandbox=args.sandbox)

    mode_label = "SANDBOX (Free test with watermark)" if args.sandbox or key.startswith("sandbox_") else "PRODUCTION (Uses 1 credit)"
    print(f"\n✨ Running PhotoRoom Processor in [{mode_label}] mode")

    output_dir = Path(args.outdir)
    created = process_image(Path(args.input_image), output_dir, key, name=args.name)

    print("\n🎉 Export Complete:")
    for path in created:
        with Image.open(path) as im:
            print(f"  • {path.name:32} | {im.format:4} | {im.width}x{im.height:4} | {path.stat().st_size:,} bytes")
    print(f"\nFiles saved in: {output_dir.resolve()}\n")


if __name__ == "__main__":
    main()
