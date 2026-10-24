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
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  Flame,
} from 'lucide-react';
import {
  calculateFittedDimensions,
  getSanitizedBaseFilename,
  EXPORT_PRESETS,
  STUDIO_BACKGROUNDS,
} from '@/utils/photoStudio';

const LOCAL_STORAGE_KEY_NAME = 'photoroom_api_key';

export const PhotoStudio: React.FC = () => {
  // PhotoRoom API configuration state
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY_NAME) || '';
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSandbox, setIsSandbox] = useState(true); // Default to Sandbox to protect the 10 credits!

  // Image and File states
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [cutoutImgElement, setCutoutImgElement] = useState<HTMLImageElement | null>(null);
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [exportSuccessNotice, setExportSuccessNotice] = useState<string | null>(null);

  // Compositor Controls
  const [fillRatioPercent, setFillRatioPercent] = useState<number>(85); // 85% Amazon standard
  const [selectedBgId, setSelectedBgId] = useState<string>('white');
  const [previewAspect, setPreviewAspect] = useState<'square' | 'portrait'>('square');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Preview canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Save API key to local storage when changed
  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    if (val.trim()) {
      localStorage.setItem(LOCAL_STORAGE_KEY_NAME, val.trim());
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_NAME);
    }
  };

  // Clean up Object URLs on unmount
  useEffect(() => {
    return () => {
      if (originalImageUrl) {
        URL.revokeObjectURL(originalImageUrl);
      }
    };
  }, [originalImageUrl]);

  /**
   * Handles raw photo selection
   */
  const handleSelectFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    setRawFile(file);
    setErrorMessage(null);
    setExportSuccessNotice(null);
    setCutoutImgElement(null);
    setCutoutBlob(null);

    if (originalImageUrl) {
      URL.revokeObjectURL(originalImageUrl);
    }

    const objUrl = URL.createObjectURL(file);
    setOriginalImageUrl(objUrl);
  }, [originalImageUrl]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  }, [handleSelectFile]);

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
      handleSelectFile(e.target.files[0]);
    }
  };

  /**
   * Calls the PhotoRoom backend proxy (/api/photoroom)
   */
  const handleRunPhotoRoom = async () => {
    if (!rawFile) return;

    if (!apiKey.trim()) {
      setErrorMessage('Please enter your PhotoRoom API key above before running.');
      return;
    }

    setIsProcessing(true);
    setProcessingStage(
      isSandbox
        ? 'Sending to PhotoRoom API (Sandbox Mode — Free test)...'
        : 'Sending to PhotoRoom API (Production Mode — Consuming 1 credit)...'
    );
    setErrorMessage(null);
    setExportSuccessNotice(null);

    try {
      const formData = new FormData();
      formData.append('image_file', rawFile);
      formData.append('sandbox', isSandbox ? 'true' : 'false');
      formData.append('apiKey', apiKey.trim());

      const res = await fetch('/api/photoroom', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey.trim(),
        },
        body: formData,
      });

      if (!res.ok) {
        let errMessage = 'Failed to process image with PhotoRoom.';
        try {
          const errJson = await res.json();
          if (errJson.error) {
            errMessage = errJson.error;
          }
        } catch {
          const errText = await res.text();
          if (errText) errMessage = errText;
        }
        throw new Error(errMessage);
      }

      const blob = await res.blob();
      setCutoutBlob(blob);

      const cutoutUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setCutoutImgElement(img);
        setIsProcessing(false);
      };
      img.onerror = () => {
        setIsProcessing(false);
        setErrorMessage('Failed to decode the image returned from PhotoRoom.');
      };
      img.src = cutoutUrl;
    } catch (err) {
      setIsProcessing(false);
      const msg = err instanceof Error ? err.message : 'PhotoRoom processing failed.';
      setErrorMessage(msg);
    }
  };

  /**
   * Redraw the live preview canvas
   */
  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !cutoutImgElement) return;

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
      cutoutImgElement.naturalWidth,
      cutoutImgElement.naturalHeight,
      targetWidth,
      targetHeight,
      fillRatio
    );

    // 3. Draw image with high quality smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      cutoutImgElement,
      0,
      0,
      cutoutImgElement.naturalWidth,
      cutoutImgElement.naturalHeight,
      placement.renderX,
      placement.renderY,
      placement.renderWidth,
      placement.renderHeight
    );
  }, [cutoutImgElement, fillRatioPercent, selectedBgId, previewAspect]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  /**
   * Export high-resolution files (2000x2000 JPEG or 1080x1350 WebP)
   */
  const exportPresetImage = async (presetType: 'marketplace' | 'storefront') => {
    if (!cutoutImgElement) return;

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
        cutoutImgElement.naturalWidth,
        cutoutImgElement.naturalHeight,
        preset.width,
        preset.height,
        fillRatio
      );

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        cutoutImgElement,
        0,
        0,
        cutoutImgElement.naturalWidth,
        cutoutImgElement.naturalHeight,
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

  /**
   * 1-Click Download of raw transparent cutout PNG
   */
  const downloadTransparentCutout = () => {
    if (!cutoutBlob) return;
    const baseName = getSanitizedBaseFilename(rawFile?.name || 'jewellery-piece');
    const filename = `${baseName}-photoroom-cutout.png`;
    const url = URL.createObjectURL(cutoutBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportSuccessNotice(`Downloaded ${filename} (Transparent PNG)!`);
  };

  const handleReset = () => {
    if (originalImageUrl) {
      URL.revokeObjectURL(originalImageUrl);
    }
    setRawFile(null);
    setOriginalImageUrl(null);
    setCutoutImgElement(null);
    setCutoutBlob(null);
    setErrorMessage(null);
    setExportSuccessNotice(null);
    setFillRatioPercent(85);
    setSelectedBgId('white');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-900 border border-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              PhotoRoom API Cloud Studio
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Commercial E-Commerce Quality
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 mt-1">
            Jewellery Background Isolator & Marketplace Exporter
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 max-w-2xl">
            Cleanly isolates necklaces, bracelets, and display busts via PhotoRoom API, then formats them for Amazon, Flipkart, Meesho, and Madhis Handcrafts.
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

      {/* PHOTOROOM API KEY & SANDBOX CONTROLS */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-600" />
            <h3 className="font-semibold text-sm text-gray-900">
              PhotoRoom API Configuration
            </h3>
          </div>

          {/* Sandbox Toggle */}
          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
            <input
              type="checkbox"
              checked={isSandbox}
              onChange={(e) => setIsSandbox(e.target.checked)}
              className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
            />
            <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
              <span>Sandbox Mode (Free Testing • Watermarked)</span>
              {isSandbox ? (
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  0 Credits Consumed
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-600" />
                  Consumes 1 Credit
                </span>
              )}
            </span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="Paste your PhotoRoom API key (e.g. 5a1b...)"
              className="w-full min-h-[42px] pl-3.5 pr-10 py-2 rounded-xl border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-xs font-mono outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <a
            href="https://app.photoroom.com/api-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold text-center transition-colors shrink-0"
          >
            Get Key from PhotoRoom Dashboard ↗
          </a>
        </div>

        <p className="text-[11px] text-stone-500">
          🔒 Your API key is stored safely in your browser session and sent directly to PhotoRoom over encrypted SSL. Keep <strong>Sandbox Mode</strong> checked while testing to protect your 10 production credits!
        </p>
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
            <p className="font-semibold text-xs uppercase tracking-wide">Export Complete</p>
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
              ? 'border-purple-600 bg-purple-50/40 ring-4 ring-purple-100'
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
                Drag and drop your necklace or bracelet photo, or click below. Supports JPG, PNG, WebP up to 30MB.
              </p>
            </div>

            <div>
              <label
                htmlFor="studio-file-upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#42232D] text-white hover:bg-[#5A303E] text-xs font-semibold cursor-pointer shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Select Jewellery Photo</span>
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
                <p className="text-[10px] font-bold uppercase text-stone-500">PhotoRoom Cloud AI</p>
                <p className="text-xs text-stone-700 mt-0.5">High-fidelity edge detection for jewellery.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                <p className="text-[10px] font-bold uppercase text-stone-500">Free Sandbox Mode</p>
                <p className="text-xs text-stone-700 mt-0.5">Test 1000s of images free with watermark.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                <p className="text-[10px] font-bold uppercase text-stone-500">Marketplace Ready</p>
                <p className="text-xs text-stone-700 mt-0.5">2000×2000 Amazon JPEG + 1080×1350 Madhis WebP.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Raw Photo Preview & Trigger PhotoRoom Button (if uploaded but not yet segmented) */}
      {rawFile && !cutoutImgElement && !isProcessing && (
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-48 h-48 rounded-xl overflow-hidden border border-stone-200 bg-stone-50 shrink-0 flex items-center justify-center shadow-xs">
              {originalImageUrl && (
                <img
                  src={originalImageUrl}
                  alt="Raw uploaded jewellery"
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div>
                <h3 className="font-serif font-bold text-lg text-gray-900">{rawFile.name}</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {(rawFile.size / 1024).toFixed(1)} KB • Ready for PhotoRoom background removal
                </p>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 space-y-1">
                <p className="font-semibold text-stone-800">
                  Mode:{' '}
                  {isSandbox ? (
                    <span className="text-emerald-700 font-bold">
                      Sandbox (FREE test • Will contain PhotoRoom watermark • 0 credits consumed)
                    </span>
                  ) : (
                    <span className="text-amber-800 font-bold">
                      Production (Watermark-free • Consumes 1 of your 10 credits)
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-stone-500">
                  You can change this anytime using the Sandbox checkbox in the configuration panel above.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunPhotoRoom}
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Process with PhotoRoom API Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Processing Spinner */}
      {isProcessing && (
        <div className="bg-white p-12 rounded-2xl shadow-xs border border-gray-200 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
          <h3 className="font-serif font-bold text-lg text-gray-900">
            PhotoRoom Cloud AI is isolating your jewellery...
          </h3>
          <p className="text-xs text-gray-600 max-w-md mx-auto">{processingStage}</p>
        </div>
      )}

      {/* STEP 4: Live Canvas Compositor & 1-Click Exports */}
      {!isProcessing && cutoutImgElement && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Canvas Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-stone-500" />
                  Live Output Preview
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
                    1:1 Square (Marketplaces)
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

              {/* Photo details */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-600 border-t border-gray-100">
                <div>
                  <p className="font-semibold text-stone-800">{rawFile?.name}</p>
                  <p className="text-[11px] text-stone-500">
                    Isolated Cutout: {cutoutImgElement.naturalWidth} × {cutoutImgElement.naturalHeight}px
                    {isSandbox ? ' • Sandbox (Watermarked)' : ' • Production (Watermark-free)'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={downloadTransparentCutout}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Transparent PNG</span>
                </button>
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
                  <span className="text-xs font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
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
                  className="w-full accent-purple-600 cursor-pointer"
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
                  Scales and centers the jewellery on the canvas with zero cropping, complying with Amazon & Flipkart's 80–85% frame rule.
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
                            ? 'border-purple-600 ring-2 ring-purple-500/20 bg-purple-50/20'
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
