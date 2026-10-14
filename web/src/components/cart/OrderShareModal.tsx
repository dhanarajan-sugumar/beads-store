import React, { useEffect, useState, useRef } from 'react';
import { X, FileDown, MessageCircle, CheckCircle, Loader2, Share2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { env } from '@/config/env';
import { generateOrderPdf } from '@/utils/pdfGenerator';
import { buildWhatsAppOrderMessage, getWhatsAppShareUrl } from '@/utils/whatsappMessage';

interface OrderShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderShareModal: React.FC<OrderShareModalProps> = ({ isOpen, onClose }) => {
  const { items, grandTotal } = useCart();
  const [generating, setGenerating] = useState<boolean>(true);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [supportsWebShare, setSupportsWebShare] = useState<boolean>(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Check if browser supports Web Share API with files
  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        const testFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
        if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [testFile] })) {
          setSupportsWebShare(true);
        }
      } catch {
        setSupportsWebShare(false);
      }
    }
  }, []);

  // Generate PDF when modal opens
  useEffect(() => {
    let isMounted = true;

    if (isOpen && items.length > 0) {
      setGenerating(true);
      setDownloaded(false);

      generateOrderPdf(env.shopName, items, grandTotal)
        .then(({ blob, fileName }) => {
          if (isMounted) {
            setPdfBlob(blob);
            setPdfFileName(fileName);
            setGenerating(false);
          }
        })
        .catch((err) => {
          console.error('[PDF Generation Error]', err);
          if (isMounted) setGenerating(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, items, grandTotal]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    closeBtnRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const downloadPdfFile = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = pdfFileName || 'madhis-handcrafts-order.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  const handleWebShare = async () => {
    if (!pdfBlob) return;
    try {
      const file = new File([pdfBlob], pdfFileName, { type: 'application/pdf' });
      await navigator.share({
        title: `Order - ${env.shopName}`,
        text: buildWhatsAppOrderMessage(env.shopName, items, grandTotal),
        files: [file],
      });
    } catch (error) {
      // User cancelled share or share failed; fallback to download
      if ((error as Error)?.name !== 'AbortError') {
        downloadPdfFile();
      }
    }
  };

  const whatsAppText = buildWhatsAppOrderMessage(env.shopName, items, grandTotal);
  const whatsAppUrl = getWhatsAppShareUrl(whatsAppText);

  return (
    <div
      className="fixed inset-0 z-60 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <h2 id="share-modal-title" className="font-serif font-bold text-xl text-gray-900">
              Share Order
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {generating ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            <p className="font-medium text-gray-900 text-sm">Preparing your order PDF...</p>
            <p className="text-xs text-gray-500">Formatting item details and images for sharing.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-primary-50/60 border border-primary-100 flex items-start gap-3 text-sm text-primary-950">
              <CheckCircle className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Your order PDF is ready!</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Send it directly to {env.shopName} on WhatsApp to confirm your pieces.
                </p>
              </div>
            </div>

            {/* Direct Web Share API button if supported (mobile browsers) */}
            {supportsWebShare && (
              <button
                type="button"
                onClick={handleWebShare}
                className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Share2 className="w-5 h-5" aria-hidden="true" />
                <span>Share PDF via WhatsApp / Apps</span>
              </button>
            )}

            {/* Download PDF button */}
            <button
              type="button"
              onClick={downloadPdfFile}
              className={`w-full min-h-[44px] px-4 py-3 rounded-xl border ${
                downloaded
                  ? 'border-green-300 bg-green-50 text-green-800'
                  : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
              } font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors flex items-center justify-center gap-2`}
            >
              <FileDown className="w-5 h-5" aria-hidden="true" />
              <span>{downloaded ? 'PDF Downloaded (Click to download again)' : 'Download Order PDF'}</span>
            </button>

            {/* Direct WhatsApp Share Link */}
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (!downloaded) {
                  downloadPdfFile();
                }
              }}
              className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              <span>Share on WhatsApp</span>
            </a>

            <p className="text-center text-xs text-gray-500 pt-1">
              Clicking "Share on WhatsApp" will download the PDF and open WhatsApp with your order details pre-filled.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
