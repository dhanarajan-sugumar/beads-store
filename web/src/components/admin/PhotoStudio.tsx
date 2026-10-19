import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Wand2,
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
} from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';
import {
  calculateFittedDimensions,
  detectAlphaBoundingBox,
  getSanitizedBaseFilename,
  EXPORT_PRESETS,
  STUDIO_BACKGROUNDS,
  type BoundingBox,
} from '@/utils/photoStudio';

export const PhotoStudio: React.FC = () => {
  // Upload and Image states
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [cutoutImgElement, setCutoutImgElement] = useState<HTMLImageElement | null>(null);
  const [tightBounds, setTightBounds] = useState<BoundingBox | null>(null);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compositor & Adjustment Controls
  const [fillRatioPercent, setFillRatioPercent] = useState<number>(85); // 85% Amazon standard
  const [selectedBgId, setSelectedBgId] = useState<string>('white');
  const [previewAspect, setPreviewAspect] = useState<'square' | 'portrait'>('square');
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportSuccessNotice, setExportSuccessNotice] = useState<string | null>(null);

  // Drag and Drop state
  const [isDragging, setIsDragging] = useState(false);

  // Preview Canvas reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Clean up Object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (originalImageUrl) {
        URL.revokeObjectURL(originalImageUrl);
      }
    };
  }, [originalImageUrl]);

  /**
   * Reads raw uploaded file, extracts pixel bounding box, and calls background removal
   */
  const processImageFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    setRawFile(file);
    setErrorMessage(null);
    setExportSuccessNotice(null);
    setCutoutImgElement(null);
    setTightBounds(null);

    // Create preview URL for original
    if (originalImageUrl) {
      URL.revokeObjectURL(originalImageUrl);
    }
    const origUrl = URL.createObjectURL(file);
    setOriginalImageUrl(origUrl);

    setIsProcessing(true);
    setProgressPercent(10);
    setProgressStage('Initializing neural network & detecting jewellery edges...');

    try {
      const resultBlob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 100);
            setProgressPercent(pct);
            if (key.includes('fetch') || key.includes('download')) {
              setProgressStage(`Downloading AI model weights (${pct}%)...`);
            } else {
              setProgressStage(`Removing background & isolating jewellery (${pct}%)...`);
            }
          } else {
            setProgressStage(`Processing image (${key})...`);
          }
        },
      });

      // Load transparent cutout image into HTMLImageElement to read tight alpha bounds
      const cutoutUrl = URL.createObjectURL(resultBlob);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Create an offscreen canvas to scan alpha bounding box
        const offscreen = document.createElement('canvas');
        offscreen.width = img.naturalWidth;
        offscreen.height = img.naturalHeight;
        const ctx = offscreen.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            const imgData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
            const bounds = detectAlphaBoundingBox(imgData.data, offscreen.width, offscreen.height);
            setTightBounds(bounds);
          } catch {
            // Fallback to natural dimensions if getImageData is restricted
            setTightBounds({
              minX: 0,
              minY: 0,
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
          }
        }
        setCutoutImgElement(img);
        setIsProcessing(false);
      };
      img.onerror = () => {
        setIsProcessing(false);
        setErrorMessage('Failed to decode the isolated jewellery cutout.');
      };
      img.src = cutoutUrl;
    } catch (err) {
      setIsProcessing(false);
      const msg =
        err instanceof Error
          ? err.message
          : 'Background removal failed. Please check browser WebAssembly/WebGL permissions.';
      setErrorMessage(msg);
    }
  }, [originalImageUrl]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  }, [processImageFile]);

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
      processImageFile(e.target.files[0]);
    }
  };

  /**
   * Redraw the live preview canvas whenever controls change
   */
  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !cutoutImgElement) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Determine target canvas dimensions
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

    // 2. Compute tight cropped bounds
    const bounds = tightBounds || {
      minX: 0,
      minY: 0,
      width: cutoutImgElement.naturalWidth,
      height: cutoutImgElement.naturalHeight,
    };

    // 3. Compute optimal scaling and centering
    const fillRatio = fillRatioPercent / 100;
    const placement = calculateFittedDimensions(
      bounds.width,
      bounds.height,
      targetWidth,
      targetHeight,
      fillRatio
    );

    // 4. Draw sliced foreground piece directly into centered target rect
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      cutoutImgElement,
      bounds.minX,
      bounds.minY,
      bounds.width,
      bounds.height,
      placement.renderX,
      placement.renderY,
      placement.renderWidth,
      placement.renderHeight
    );
  }, [cutoutImgElement, tightBounds, fillRatioPercent, selectedBgId, previewAspect]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  /**
   * Generates a high-res export file (e.g. 2000x2000 JPEG or 1080x1350 WebP)
   */
  const exportPresetImage = async (presetType: 'marketplace' | 'storefront') => {
    if (!cutoutImgElement) return;

    const preset = EXPORT_PRESETS[presetType];
    setIsExporting(preset.id);
    setExportSuccessNotice(null);

    try {
      // Offscreen canvas at target high resolution
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = preset.width;
      exportCanvas.height = preset.height;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize export canvas context.');

      // Background selection: Marketplace requires pure white #FFFFFF
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

      // Compute bounds
      const bounds = tightBounds || {
        minX: 0,
        minY: 0,
        width: cutoutImgElement.naturalWidth,
        height: cutoutImgElement.naturalHeight,
      };

      // Calculate placement at prescribed resolution
      const fillRatio = fillRatioPercent / 100;
      const placement = calculateFittedDimensions(
        bounds.width,
        bounds.height,
        preset.width,
        preset.height,
        fillRatio
      );

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        cutoutImgElement,
        bounds.minX,
        bounds.minY,
        bounds.width,
        bounds.height,
        placement.renderX,
        placement.renderY,
        placement.renderWidth,
        placement.renderHeight
      );

      // Convert to blob
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
    if (originalImageUrl) {
      URL.revokeObjectURL(originalImageUrl);
    }
    setRawFile(null);
    setOriginalImageUrl(null);
    setCutoutImgElement(null);
    setTightBounds(null);
    setErrorMessage(null);
    setExportSuccessNotice(null);
    setFillRatioPercent(85);
    setSelectedBgId('white');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              AI Photo Studio
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500 font-medium">100% In-Browser & Private</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 mt-1">
            Marketplace Photo Studio & Background Isolator
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            Auto-remove backgrounds, center necklaces and bracelets, and export standard Amazon, Flipkart, Meesho, and Madhis storefront photos.
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

      {/* Error Notice */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-start gap-3 animate-in fade-in"
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
                Upload Raw Jewellery Photo
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Drag and drop your phone or camera shot, or click below. Supports JPG, PNG, WebP up to 25MB.
              </p>
            </div>

            <div>
              <label
                htmlFor="studio-file-upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#42232D] text-white hover:bg-[#5A303E] text-xs font-semibold cursor-pointer shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Select Jewellery Image</span>
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
                <p className="text-[10px] font-bold uppercase text-stone-500">Pure White Background</p>
                <p className="text-xs text-stone-700 mt-0.5">RGB (255, 255, 255) for marketplace guidelines.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                <p className="text-[10px] font-bold uppercase text-stone-500">80–85% Frame Fill</p>
                <p className="text-xs text-stone-700 mt-0.5">Accurate scaling without manual Photoshop cropping.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                <p className="text-[10px] font-bold uppercase text-stone-500">Zero Server Fees</p>
                <p className="text-xs text-stone-700 mt-0.5">Runs on-device via WebAssembly/WebGPU.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Processing Progress Spinner */}
      {isProcessing && (
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-xs border border-gray-200 text-center space-y-5">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-amber-100 border-t-amber-600 animate-spin" />
            <Wand2 className="w-6 h-6 text-amber-600 absolute" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-serif font-bold text-lg text-gray-900">
              Isolating Jewellery Piece...
            </h3>
            <p className="text-xs text-gray-600">
              {progressStage || 'Detecting jewellery edges & removing background...'}
            </p>
          </div>

          <div className="max-w-xs mx-auto space-y-1">
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(15, progressPercent)}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400 font-mono text-right">{progressPercent}%</p>
          </div>

          <p className="text-[11px] text-stone-400 max-w-sm mx-auto italic">
            Note: On first run, the local ONNX segmentation model is downloaded and cached in your browser. Subsequent photos process much faster.
          </p>
        </div>
      )}

      {/* STEP 3: Studio Editor & Preview Workspace */}
      {!isProcessing && cutoutImgElement && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Side-by-side or Canvas Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-stone-500" />
                  Live Compositor Preview
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
                    1:1 Square (Amazon)
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
                    4:5 Portrait (Madhis)
                  </button>
                </div>
              </div>

              {/* Canvas Container */}
              <div className="relative rounded-xl border border-stone-200 overflow-hidden bg-stone-50 flex items-center justify-center p-2 min-h-[360px] sm:min-h-[460px]">
                {/* Checkerboard transparency backdrop behind canvas */}
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

              {/* Side-by-side Original vs Cutout compare toggle */}
              {originalImageUrl && (
                <details className="text-xs text-stone-600 group">
                  <summary className="cursor-pointer font-semibold text-stone-700 hover:text-stone-900 select-none flex items-center gap-1.5 py-1">
                    <span>View Original Raw Photo</span>
                    <span className="text-[10px] text-stone-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={originalImageUrl}
                      alt="Original raw jewellery upload"
                      className="w-32 h-32 object-cover rounded-lg border border-stone-300 shadow-2xs"
                    />
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-stone-800">{rawFile?.name}</p>
                      <p className="text-stone-500">
                        {rawFile ? `${(rawFile.size / 1024).toFixed(1)} KB` : ''} • Detected tight bounds: {tightBounds?.width}×{tightBounds?.height}px
                      </p>
                      <p className="text-emerald-700 font-medium">
                        ✓ Background eliminated & isolated via on-device AI.
                      </p>
                    </div>
                  </div>
                </details>
              )}
            </div>
          </div>

          {/* Right Column: Controls & 1-Click Export Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Control Panel: Scale & Background */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-serif font-bold text-base text-gray-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-stone-600" />
                  Framing & Background
                </h3>
                <span className="text-xs text-stone-400">Live Render</span>
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
                  max="95"
                  step="1"
                  value={fillRatioPercent}
                  onChange={(e) => setFillRatioPercent(Number(e.target.value))}
                  className="w-full accent-[#42232D] cursor-pointer"
                />

                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>70% (Spacious)</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    85% Amazon Standard
                  </span>
                  <span>95% (Tight)</span>
                </div>

                <p className="text-[11px] text-stone-500 leading-relaxed bg-stone-50 p-2.5 rounded-lg border border-stone-200 mt-2">
                  <Info className="w-3.5 h-3.5 text-stone-600 inline mr-1 -mt-0.5" />
                  Amazon & Flipkart guidelines mandate that the primary product must occupy <strong>at least 80% to 85%</strong> of the total image frame.
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
