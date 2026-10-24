# Madhi's Handcrafts — Jewellery Image Processing Suite

This directory contains image processing tools and workflows tailored for Madhi's Handcrafts jewellery photography.

---

## 🌟 Program 1: `photoroom_jewellery_processor.py` (PhotoRoom Cloud AI)

Integrates **PhotoRoom's Industry-Leading Background Removal API** with automated marketplace and storefront formatting.

### 🧪 Important: Sandbox Mode (Save your 10 Paid Credits!)
PhotoRoom offers **free unlimited sandbox testing** (with a watermark). Always test your setup with `--sandbox` first so you don't use up your 10 production credits!

### Setup:
1. Copy your API key from [PhotoRoom API Dashboard](https://app.photoroom.com/api-dashboard).
2. Add it to your `.env` file (or pass `--api-key`):
   ```bash
   PHOTOROOM_API_KEY=your_actual_api_key_here
   ```

### Running with Sandbox Mode (FREE testing with watermark):
```bash
python3 scripts/photo_studio/photoroom_jewellery_processor.py "path/to/raw-photo.jpg" --sandbox --outdir exports --name necklace-01
```

### Running in Production Mode (Uses 1 of your 10 credits, NO watermark):
```bash
python3 scripts/photo_studio/photoroom_jewellery_processor.py "path/to/raw-photo.jpg" --outdir exports --name necklace-01
```

### Outputs Generated:
1. `exports/necklace-01-marketplace-square.jpg` (2000 × 2000 px, 1:1 Square, JPEG, pure white `#FFFFFF`, 300 DPI)
2. `exports/necklace-01-storefront-4x5.webp` (1080 × 1350 px, 4:5 Portrait, WebP, quality 92)
3. `exports/necklace-01-transparent-cutout.png` (High-res transparent PNG cutout)

---

## 🛠️ Program 2: `jewellery_marketplace_export.py` (Gemini Preservation Workflow)
For delicate white display busts or intricate deity pendants:
1. Copy the strict prompt from `gemini_background_edit_prompt.txt` into [gemini.google.com](https://gemini.google.com).
2. Save the pure white background-edited photo from Gemini.
3. Run:
```bash
python3 scripts/photo_studio/jewellery_marketplace_export.py "path/to/gemini-edited.jpg" --outdir exports --name necklace-01
```

---

## ⚡ Program 3: `jewellery_image_processor.py` (Local Free `rembg` U²-Net)
Runs 100% locally on your Mac using `rembg` (no API key or internet required):
```bash
python3 scripts/photo_studio/jewellery_image_processor.py "path/to/raw-photo.jpg" --outdir exports --name necklace-01
```

---

## 🌐 In-Browser Admin Studio (`/admin`)
Also available in the **Photo Studio** tab of your protected Admin Portal with live canvas preview, interactive framing slider (80%–85% Amazon rule), and 1-click downloads.
