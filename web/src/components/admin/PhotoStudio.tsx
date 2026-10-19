import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Download,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Sparkles,
  ShoppingBag,
  Info,
  AlertTriangle,
  Layers,
  Image as ImageIcon,
  Copy,
  Check,
  ExternalLink,
  Wand2,
} from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';
import {
  calculateFittedDimensions,
  getSanitizedBaseFilename,
  EXPORT_PRESETS,
  STUDIO_BACKGROUNDS,
} from '@/utils/photoStudio';

const GEMINI_PROMPT_TEXT = `GEMINI IMAGE-EDITING PROMPT

I am uploading an original jewellery product photograph. Edit this exact photograph for an online jewellery store.

TASK
Change ONLY the background to pure white (#FFFFFF). Keep the original product photograph intact.

STRICT PRESERVATION RULES
- Do not regenerate, redraw, replace, beautify, or reinterpret the necklace.
- Preserve every original bead, its colour, shape, position, spacing, shine, and count.
- Preserve the pendant, deity details, gold-tone parts, stones, chains, and dangling beads exactly.
- Preserve the white display bust exactly, including its shape, edges, texture, lighting, and position.
- Do not change the camera angle, product proportions, sharpness, or framing.
- Do not add props, text, logos, shadows, reflections, or decorative elements.
- Do not crop off any part of the necklace or display bust.
- Do not turn the white display bust transparent or erase its edges.
- Replace the lavender/grey background and tabletop with clean, uniform pure white (#FFFFFF).
- Keep natural, subtle contact shadows only if needed to make the bust look realistic, but the background itself must be white.
- Make the edge around the white bust clean and natural, with no halos, purple fringe, jagged edges, or visible cut-out artefacts.

OUTPUT
Return one edited image at the original aspect ratio and resolution if possible. Do not create a new interpretation of the product.

QUALITY CHECK BEFORE FINISHING
Compare the edited image with the uploaded original. If any jewellery detail or the bust has changed, undo that change and correct only the background. Product accuracy is more important than creative enhancement.

After the background edit, I will use a separate exporter to produce:
1. Marketplace: 2000 x 2000 px, 1:1 square, JPEG, pure white canvas.
2. Madhi's Handcrafts storefront: 1080 x 1350 px, 4:5 portrait, optimized WebP.`;

export const PhotoStudio: React.FC = () => {
  // Image and File states
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [currentImgElement, setCurrentImgElement] = useState<HTMLImageElement | null>(null);
  const [isAiCutout, setIsAiCutout] = useState(false);

  // Background removal state (optional on-demand)
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgProgressStage, setBgProgressStage] = useState('');
  const [bgProgressPercent, setBgProgressPercent] = useState(0);

  // Compositor Controls
  const [fillRatioPercent, setFillRatioPercent] = useState<number>(85); // 85% Amazon standard
  const [selectedBgId, setSelectedBgId] = useState<string>('white');
  const [previewAspect, setPreviewAspect] = useState<'square' | 'portrait'>('square');
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportSuccessNotice, setExportSuccessNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Gemini prompt copy state
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showPromptDetails, setShowPromptDetails] = useState(false);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Preview canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Clean up Object URLs on unmount
  useEffect(() => {
    return () => {
      if (currentImageUrl) {
        URL.revokeObjectURL(currentImageUrl);
      }
    };
  }, [currentImageUrl]);

  const copyGeminiPrompt = async () => {
    try {
      await navigator.clipboard.writeText(GEMINI_PROMPT_TEXT);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 3000);
    } catch {
      // Fallback
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 3000);
    }
  };

  /**
   * Loads an uploaded image directly without automatic destructive segmentation.
   * Perfect for Gemini-edited photos, white-background shots, or raw product photos.
   */
  const handleLoadImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    setRawFile(file);
    setErrorMessage(null);
    setExportSuccessNotice(null);
    setIsAiCutout(false);

    if (currentImageUrl) {
      URL.revokeObjectURL(currentImageUrl);
    }

    const objUrl = URL.createObjectURL(file);
    setCurrentImageUrl(objUrl);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setCurrentImgElement(img);
    };
    img.onerror = () => {
      setErrorMessage('Failed to decode the selected image file.');
    };
    img.src = objUrl;
  }, [currentImageUrl]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLoadImage(e.dataTransfer.files[0]);
    }
  }, [handleLoadImage]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleLoadImage(e.target.files[0]);
    }
  };

  /**
   * Optional On-Demand Auto Background Eraser
   */
  const handleAutoBackgroundRemoval = async () => {
    if (!rawFile) return;

    setIsRemovingBg(true);
    setBgProgressPercent(10);
    setBgProgressStage('Detecting jewellery edges...');
    setErrorMessage(null);

    try {
      const resultBlob = await removeBackground(rawFile, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 100);
            setBgProgressPercent(pct);
            setBgProgressStage(`Isolating jewellery (${pct}%)...`);
          } else {
            setBgProgressStage(`Processing (${key})...`);
          }
        },
      });

      const cutoutUrl = URL.createObjectURL(resultBlob);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setCurrentImgElement(img);
        setCurrentImageUrl(cutoutUrl);
        setIsAiCutout(true);
        setIsRemovingBg(false);
      };
      img.src = cutoutUrl;
    } catch (err) {
      setIsRemovingBg(false);
      const msg = err instanceof Error ? err.message : 'Background removal failed.';
      setErrorMessage(msg);
    }
  };

  /**
   * Redraw the live preview canvas
   */
  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImgElement) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isSquare = previewAspect === 'square';
    const targetWidth = isSquare ? 1000 : 800;
    const targetHeight = isSquare ? 1000 : 1000;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // 1. Draw Background
    const bgConfig = STUDIO_BACKGROUNDS.find((b) => b.id === selectedBgId);
    if (bgConfig && bgConfig.hex !== 'transparent') {
      ctx.fillStyle = bgConfig.hex;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    } else {
      ctx.clearRect(0, 0, targetWidth, targetHeight);
    }

    // 2. Compute placement to fit complete image on canvas without cropping
    const fillRatio = fillRatioPercent / 100;
    const placement = calculateFittedDimensions(
      currentImgElement.naturalWidth,
      currentImgElement.naturalHeight,
      targetWidth,
      targetHeight,
      fillRatio
    );

    // 3. Draw image with high quality smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      currentImgElement,
      0,
      0,
      currentImgElement.naturalWidth,
      currentImgElement.naturalHeight,
      placement.renderX,
      placement.renderY,
      placement.renderWidth,
      placement.renderHeight
    );
  }, [currentImgElement, fillRatioPercent, selectedBgId, previewAspect]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  /**
   * Export high-resolution files (2000x2000 JPEG or 1080x1350 WebP)
   */
  const exportPresetImage = async (presetType: 'marketplace' | 'storefront') => {
    if (!currentImgElement) return;

    const preset = EXPORT_PRESETS[presetType];
    setIsExporting(preset.id);
    setExportSuccessNotice(null);

    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = preset.width;
      exportCanvas.height = preset.height;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize canvas context.');

      // Background selection
      const bgHex =
        presetType === 'marketplace'
          ? '#FFFFFF'
          : STUDIO_BACKGROUNDS.find((b) => b.id === selectedBgId)?.hex || '#FAF5EC';

      if (bgHex !== 'transparent') {
        ctx.fillStyle = bgHex;
        ctx.fillRect(0, 0, preset.width, preset.height);
      } else {
        ctx.clearRect(0, 0, preset.width, preset.height);
      }

      // Compute placement
      const fillRatio = fillRatioPercent / 100;
      const placement = calculateFittedDimensions(
        currentImgElement.naturalWidth,
        currentImgElement.naturalHeight,
        preset.width,
        preset.height,
        fillRatio
      );

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        currentImgElement,
        0,
        0,
        currentImgElement.naturalWidth,
        currentImgElement.naturalHeight,
        placement.renderX,
        placement.renderY,
        placement.renderWidth,
        placement.renderHeight
      );

      exportCanvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsExporting(null);
            setErrorMessage('Export failed: Canvas toBlob returned null.');
            return;
          }

          const baseName = getSanitizedBaseFilename(rawFile?.name || 'jewellery-piece');
          const filename = `${baseName}-${preset.suffix}.${preset.extension}`;

          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);

          setIsExporting(null);
          setExportSuccessNotice(`Successfully exported ${filename} (${preset.width}×${preset.height}px)!`);
        },
        preset.format,
        preset.defaultQuality
      );
    } catch (err) {
      setIsExporting(null);
      const msg = err instanceof Error ? err.message : 'Export failed.';
      setErrorMessage(msg);
    }
  };

  const handleReset = () => {
    if (currentImageUrl) {
      URL.revokeObjectURL(currentImageUrl);
    }
    setRawFile(null);
    setCurrentImageUrl(null);
    setCurrentImgElement(null);
    setIsAiCutout(false);
    setErrorMessage(null);
    setExportSuccessNotice(null);
    setFillRatioPercent(85);
    setSelectedBgId('white');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Workflow Overview */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Jewellery Photo Workflow
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Zero Quality Loss
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 mt-1">
            Marketplace Photo Studio & Resizer
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 max-w-2xl">
            Export 1:1 Amazon/Flipkart (2000×2000 JPEG) and 4:5 Madhis Storefront (1080×1350 WebP) photos with pure white canvas and guaranteed 80–85% frame fill.
          </p>
        </div>

        {rawFile && (
          <button
            type="button"
            onClick={handleReset}
            className="self-start md:self-auto min-h-[40px] px-3.5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Process Another Photo</span>
          </button>
        )}
      </div>

      {/* GEMINI BACKGROUND WORKFLOW ASSISTANT CARD */}
      <div className="bg-gradient-to-br from-[#FAF5EC] to-[#F5ECE0] border border-[#E0D7CC] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#42232D] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2C1820]">
                Recommended 2-Step Jewellery Workflow
              </h3>
              <p className="text-xs text-[#7A6248]">
                Preserve every delicate bead, deity pendant, and white display bust without automated AI cut-out artifacts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyGeminiPrompt}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-[#E0D7CC] text-[#2C1820] text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
            >
              {copiedPrompt ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied Prompt!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#7A6248]" />
                  <span>Copy Gemini Prompt</span>
                </>
              )}
            </button>

            <a
              href="https://gemini.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#42232D] hover:bg-[#5A303E] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
            >
              <span>Open Gemini</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 3 Step Visual Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-[#E0D7CC]/80">
            <span className="font-bold text-[#42232D] block mb-1">1. Paste Prompt into Gemini</span>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              Upload your raw camera photo to Gemini with the copied prompt. Gemini edits ONLY the background to #FFFFFF without touching beads or bust.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-[#E0D7CC]/80">
            <span className="font-bold text-[#42232D] block mb-1">2. Drop Edited Photo Here</span>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              Upload the saved pure-white photo below. The studio preserves 100% of the image resolution and color accuracy.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-[#E0D7CC]/80">
            <span className="font-bold text-[#42232D] block mb-1">3. 1-Click Multi-Channel Export</span>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              Instantly download 2000×2000 JPEG for Amazon/Flipkart/Meesho and 1080×1350 WebP for Madhis Handcrafts.
            </p>
          </div>
        </div>

        {/* Collapsible Prompt Preview */}
        <div>
          <button
            type="button"
            onClick={() => setShowPromptDetails(!showPromptDetails)}
            className="text-[11px] font-semibold text-[#68273D] hover:underline flex items-center gap-1"
          >
            <span>{showPromptDetails ? 'Hide prompt text' : 'View strict preservation prompt text'}</span>
            <span className="text-[9px]">▼</span>
          </button>

          {showPromptDetails && (
            <div className="mt-2 p-3 bg-white rounded-xl border border-stone-200 text-[11px] font-mono text-stone-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {GEMINI_PROMPT_TEXT}
            </div>
          )}
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-xs uppercase tracking-wide">Processing Alert</p>
            <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs font-bold text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success Notice */}
      {exportSuccessNotice && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-3 animate-in fade-in"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-xs uppercase tracking-wide">Ready for Upload</p>
            <p className="text-xs text-emerald-700 mt-0.5">{exportSuccessNotice}</p>
          </div>
          <button
            type="button"
            onClick={() => setExportSuccessNotice(null)}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* STEP 1: Upload Zone (Visible if no file selected) */}
      {!rawFile && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-14 text-center transition-all bg-white shadow-xs ${
            isDragging
              ? 'border-primary-600 bg-primary-50/40 ring-4 ring-primary-100'
              : 'border-stone-300 hover:border-stone-400'
          }`}
        >
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-600 flex items-center justify-center mx-auto shadow-2xs">
              <UploadCloud className="w-8 h-8 stroke-[1.75]" />
            </div>

            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Upload Photo for Marketplace Sizing & Export
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Drag and drop your Gemini-edited photo or original jewellery picture. Supports JPG, PNG, WebP up to 30MB.
              </p>
            </div>

            <div>
              <label
                htmlFor="studio-file-upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#42232D] text-white hover:bg-[#5A303E] text-xs font-semibold cursor-pointer shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Select Photo</span>
              </label>
              <input
                id="studio-file-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInputChange}
                className="sr-only"
              />
            </div>

            {/* Quick Specs Callout */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                <p className="text-[10px] font-bold uppercase text-stone-500">2000 × 2000 px</p>
                <p className="text-xs text-stone-700 mt-0.5">Amazon, Flipkart & Meesho 1:1 Square standard.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                <p className="text-[10px] font-bold uppercase text-stone-500">1080 × 1350 px</p>
                <p className="text-xs text-stone-700 mt-0.5">Madhis Handcrafts 4:5 luxury portrait storefront.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                <p className="text-[10px] font-bold uppercase text-stone-500">Python CLI Included</p>
                <p className="text-xs text-stone-700 mt-0.5">Also available via scripts/photo_studio CLI.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Background Removal Spinner (if optional cutout requested) */}
      {isRemovingBg && (
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-xs border border-gray-200 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin" />
          <h3 className="font-serif font-bold text-lg text-gray-900">
            Running In-Browser Cutout...
          </h3>
          <p className="text-xs text-gray-600">{bgProgressStage}</p>
          <div className="w-48 bg-stone-100 rounded-full h-1.5 mx-auto overflow-hidden">
            <div className="bg-amber-600 h-full transition-all" style={{ width: `${bgProgressPercent}%` }} />
          </div>
        </div>
      )}

      {/* STEP 2: Studio Workspace & Canvas Preview */}
      {!isRemovingBg && currentImgElement && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Canvas Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-stone-500" />
                  Output Canvas Preview
                </span>

                {/* Aspect ratio preview switch */}
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewAspect('square')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      previewAspect === 'square'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    1:1 Square (Marketplace)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewAspect('portrait')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      previewAspect === 'portrait'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    4:5 Portrait (Storefront)
                  </button>
                </div>
              </div>

              {/* Canvas Container */}
              <div className="relative rounded-xl border border-stone-200 overflow-hidden bg-stone-50 flex items-center justify-center p-3 min-h-[360px] sm:min-h-[460px]">
                <div
                  className="w-full max-w-[420px] aspect-square rounded-lg shadow-sm border border-stone-200 overflow-hidden flex items-center justify-center"
                  style={{
                    backgroundColor: selectedBgId === 'transparent' ? '#F4F4F5' : '#FFFFFF',
                    backgroundImage:
                      selectedBgId === 'transparent'
                        ? 'linear-gradient(45deg, #E4E4E7 25%, transparent 25%), linear-gradient(-45deg, #E4E4E7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #E4E4E7 75%), linear-gradient(-45deg, transparent 75%, #E4E4E7 75%)'
                        : undefined,
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full object-contain"
                    aria-label="Jewellery preview canvas"
                  />
                </div>

                {/* Fill Badge overlay */}
                <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1 rounded-md shadow-sm">
                  Frame Fill: {fillRatioPercent}%
                </div>
              </div>

              {/* Photo details & optional Auto-Cutout button */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-600 border-t border-gray-100">
                <div>
                  <p className="font-semibold text-stone-800">{rawFile?.name}</p>
                  <p className="text-[11px] text-stone-500">
                    Source: {currentImgElement.naturalWidth} × {currentImgElement.naturalHeight}px
                    {isAiCutout ? ' • AI Cutout Applied' : ' • 100% Original Preservation'}
                  </p>
                </div>

                {!isAiCutout && (
                  <button
                    type="button"
                    onClick={handleAutoBackgroundRemoval}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Auto-Remove Background (Experimental)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Controls & 1-Click Export Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Control Panel: Scale & Background */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-serif font-bold text-base text-gray-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-stone-600" />
                  Framing & Canvas Sizing
                </h3>
                <span className="text-xs text-stone-400">Live Fit</span>
              </div>

              {/* 1. Scale / Padding Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="fill-slider" className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Subject Scale (Frame Fill)
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {fillRatioPercent}%
                  </span>
                </div>

                <input
                  id="fill-slider"
                  type="range"
                  min="70"
                  max="98"
                  step="1"
                  value={fillRatioPercent}
                  onChange={(e) => setFillRatioPercent(Number(e.target.value))}
                  className="w-full accent-[#42232D] cursor-pointer"
                />

                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>70% (Spacious)</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    85% Marketplace Fit
                  </span>
                  <span>98% (Edge-to-Edge)</span>
                </div>

                <p className="text-[11px] text-stone-500 leading-relaxed bg-stone-50 p-2.5 rounded-lg border border-stone-200 mt-2">
                  <Info className="w-3.5 h-3.5 text-stone-600 inline mr-1 -mt-0.5" />
                  Fits the complete image onto the canvas using Lanczos high-res interpolation with zero cropping.
                </p>
              </div>

              {/* 2. Background Selector */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Canvas Background
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {STUDIO_BACKGROUNDS.map((bg) => {
                    const isSelected = selectedBgId === bg.id;
                    return (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setSelectedBgId(bg.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[64px] ${
                          isSelected
                            ? 'border-amber-600 ring-2 ring-amber-500/20 bg-amber-50/20'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-stone-300 shrink-0 shadow-2xs"
                            style={{
                              backgroundColor: bg.hex === 'transparent' ? '#FFFFFF' : bg.hex,
                              backgroundImage:
                                bg.hex === 'transparent'
                                  ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                                  : undefined,
                              backgroundSize: '6px 6px',
                            }}
                          />
                          <span className="text-xs font-semibold text-stone-900 truncate">
                            {bg.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-500 truncate mt-1">
                          {bg.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 1-Click Export Actions */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 space-y-3">
              <h3 className="font-serif font-bold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Download className="w-4 h-4 text-emerald-600" />
                1-Click Marketplace Exports
              </h3>

              {/* Action 1: Amazon / Flipkart / Meesho */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  disabled={isExporting !== null}
                  onClick={() => exportPresetImage('marketplace')}
                  className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-sans font-semibold text-xs flex items-center justify-between gap-3 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <ShoppingBag className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-bold">Download for Amazon / Flipkart / Meesho</p>
                      <p className="text-[11px] text-amber-100 font-normal">
                        1:1 Square (2000 × 2000 px) • Pure White #FFFFFF JPEG
                      </p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 shrink-0" />
                </button>
                <p className="text-[11px] text-stone-500 px-1">
                  Guaranteed 80–85% frame fill on pure white background complying with marketplace ingestion bots.
                </p>
              </div>

              {/* Action 2: Madhis Handcrafts Storefront */}
              <div className="space-y-1.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isExporting !== null}
                  onClick={() => exportPresetImage('storefront')}
                  className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#42232D] hover:bg-[#5A303E] text-white font-sans font-semibold text-xs flex items-center justify-between gap-3 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <Sparkles className="w-5 h-5 shrink-0 text-amber-300" />
                    <div>
                      <p className="font-bold">Download for Madhis Handcrafts</p>
                      <p className="text-[11px] text-[#E5D3DA] font-normal">
                        4:5 Portrait (1080 × 1350 px) • High-Res WebP
                      </p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 shrink-0" />
                </button>
                <p className="text-[11px] text-stone-500 px-1">
                  Optimized for luxury boutique aesthetic on Instagram, Pinterest, and website catalogue cards.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
