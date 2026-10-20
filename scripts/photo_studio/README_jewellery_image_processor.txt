JEWELLERY IMAGE PROCESSOR

Purpose
A reusable Python workflow for a jewellery photo app. It removes the background with rembg,
places the foreground on pure white, and exports marketplace and storefront formats.

Files
- jewellery_image_processor.py: main program

Install (Python 3.10+ recommended)
    python -m pip install Pillow rembg

Run
    python jewellery_image_processor.py "DSC_9992.JPG" --outdir exports --name DSC_9992

Outputs
- DSC_9992-marketplace-square.jpg (2000 x 2000, JPEG)
- DSC_9992-storefront-4x5.webp (1080 x 1350, WebP)

Use from another Python module
    from pathlib import Path
    from jewellery_image_processor import process_image

    generated_files = process_image(
        Path("uploads/necklace.jpg"),
        Path("exports"),
        name="necklace-001",
    )

App integration notes
- For a FastAPI service, call process_image from a worker thread/background task because
  segmentation is CPU-intensive. Keep uploads size-limited and validate file types.
- rembg downloads its model on first use. Pre-warm the model at app startup for production.
- For high-volume processing, create one rembg session and reuse it rather than creating
  a new session for every image. Refactor remove_background() to accept an injected session.
- Keep a human review step before publishing. A white display bust against a pale background
  can be segmented imperfectly, and no automated mask can guarantee pixel-perfect edges.
- This script is not the exact source for the previous generated edit. That output was created
  by an image-generation model. This script provides a repeatable, non-generative alternative.
