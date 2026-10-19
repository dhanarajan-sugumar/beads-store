# Jewellery Image Workflow for Madhi's Handcrafts

This folder contains the deterministic export script and recommended Gemini AI background-editing workflow for **Madhi's Handcrafts**.

## Files
- `jewellery_marketplace_export.py`: Resizes an already background-edited image into the two required formats using high-quality Lanczos resampling and subtle UnsharpMask sharpening.
- `gemini_background_edit_prompt.txt`: The strict preservation prompt to use with Gemini to replace only the background with `#FFFFFF` pure white without altering fine beads or display busts.

## Recommended Workflow
1. **Preserve Original**: Keep a copy of the untouched original photo.
2. **Gemini Edit**: Upload the original photo to Gemini (or Google AI Studio) and paste the prompt from `gemini_background_edit_prompt.txt`.
3. **Quality Check**: Inspect the result at 100% zoom. Check bead count, pendant details, necklace shape, and display-bust edges.
4. **Save**: Save the approved background-edited image locally.
5. **Run Exporter**:
   ```bash
   python3 scripts/photo_studio/jewellery_marketplace_export.py "path/to/edited-image.jpg" --outdir exports --name DSC_9999
   ```
6. **Output**:
   - `exports/DSC_9999-marketplace-square.jpg` (2000 × 2000, 1:1 Square, JPEG, Pure White)
   - `exports/DSC_9999-storefront-4x5.webp` (1080 × 1350, 4:5 Portrait, WebP)

## Why This Workflow?
Automatic client-side segmentation (like generic ISNet/u2net models) can accidentally damage intricate bead threads, fine gold chains, dangling drops, or white display busts against pale walls. Gemini's multimodal reasoning understands jewellery structure and keeps every bead intact while transforming only the backdrop. The Python script then ensures 100% deterministic, mathematically accurate sizing and Amazon/Flipkart compliance.
