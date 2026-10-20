# Madhi's Handcrafts — Jewellery Image Processing Suite

This directory contains Python tools and workflows designed specifically for Madhi's Handcrafts jewellery photography.

---

## 🛠️ The Two Available Programs

### Program 1: `jewellery_image_processor.py` (Automated Background Removal)
Automates the full pipeline using `rembg` (U²-Net neural network) locally on your machine:
1. Segments the jewellery from its background.
2. Trims excess transparent margins while preserving padding.
3. Composites the product onto pure white (`#FFFFFF`).
4. Generates:
   - `[name]-marketplace-square.jpg` (2000 × 2000, 1:1 Square, JPEG, 300 DPI, UnsharpMask)
   - `[name]-storefront-4x5.webp` (1080 × 1350, 4:5 Portrait, WebP, quality 92)

**How to run:**
```bash
# 1. Install dependencies (Pillow, rembg, onnxruntime are already installed on your Mac)
pip install Pillow rembg onnxruntime

# 2. Run on any raw photo:
python3 scripts/photo_studio/jewellery_image_processor.py "path/to/DSC_9992.JPG" --outdir exports --name DSC_9992
```

---

### Program 2: `jewellery_marketplace_export.py` (Gemini High-Fidelity Workflow)
For delicate items (e.g., white mannequin display busts on pale walls, intricate deity pendants, or micro-beads) where automated segmentation might erase edges:
1. Open [gemini.google.com](https://gemini.google.com) or Google AI Studio.
2. Upload the raw photo with the prompt from `gemini_background_edit_prompt.txt`.
3. Save the pure white background-edited photo.
4. Run the deterministic exporter:
```bash
python3 scripts/photo_studio/jewellery_marketplace_export.py "path/to/gemini-edited.jpg" --outdir exports --name DSC_9992
```

---

## 🌐 Web In-Browser Photo Studio (`/admin`)
Both workflows are also built right into the **Photo Studio** tab of your store's protected `/admin` portal:
- Live 1:1 Square and 4:5 Portrait canvas preview.
- Frame fill slider (80%–85% Amazon compliance).
- 1-click downloads for Amazon/Flipkart and Madhis Handcrafts.
- 1-click "Copy Gemini Prompt" assistant.
