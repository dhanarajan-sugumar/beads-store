import React, { useEffect, useState, useRef } from 'react';
import { X, FileDown, MessageCircle, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
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
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Generate a stable reference number for this order session (e.g. MH-582910)
  const orderRef = useRef<string>(`MH-${Math.floor(100000 + Math.random() * 900000)}`).current;

  // Generate PDF when modal opens
  useEffect(() => {
    let isMounted = true;

    if (isOpen && items.length > 0) {
      setGenerating(true);
      setDownloaded(false);

      generateOrderPdf(env.shopName, items, grandTotal, orderRef)
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
  }, [isOpen, items, grandTotal, orderRef]);

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
    a.download = pdfFileName || `Order-${env.shopName}-${orderRef}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  const whatsAppText = buildWhatsAppOrderMessage(env.shopName, items, grandTotal, orderRef);
  const whatsAppUrl = getWhatsAppShareUrl(whatsAppText);

  const handleWhatsAppClick = () => {
    // If user hasn't downloaded yet, trigger download automatically so they have the file ready
    if (!downloaded) {
      downloadPdfFile();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 id="share-modal-title" className="font-serif font-bold text-2xl text-gray-900">
              Share Order on WhatsApp
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Order Reference: <span className="font-mono font-semibold text-primary-700">{orderRef}</span>
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="min-w-[44px] min-h-[44px] -mt-1 -mr-1 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {generating ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
            <Loader2 className="w-9 h-9 text-primary-600 animate-spin" />
            <p className="font-medium text-gray-900 text-sm">Generating your order PDF...</p>
            <p className="text-xs text-gray-500">Compiling items, photos, and prices.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Order status card */}
            <div className="p-4 rounded-xl bg-primary-50/70 border border-primary-100 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-gray-700 space-y-1">
                <p className="font-semibold text-gray-900">Order document prepared for {env.shopName}</p>
                <p className="text-gray-600">
                  Follow these 2 quick steps to place your order directly via WhatsApp:
                </p>
              </div>
            </div>

            {/* Step 1: Download PDF */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Step 1
                </span>
                {downloaded && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Downloaded
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900">
                Download your order PDF with product photos & item list
              </p>
              <button
                type="button"
                onClick={downloadPdfFile}
                className={`w-full min-h-[44px] px-4 py-2.5 rounded-lg border text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors flex items-center justify-center gap-2 ${
                  downloaded
                    ? 'border-green-300 bg-green-50 text-green-800 hover:bg-green-100'
                    : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-100 shadow-sm'
                }`}
              >
                <FileDown className="w-4 h-4" aria-hidden="true" />
                <span>{downloaded ? 'Download PDF Again' : 'Download Order PDF'}</span>
              </button>
            </div>

            {/* Step 2: Open WhatsApp */}
            <div className="p-4 rounded-xl border border-green-200 bg-green-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-green-700">
                  Step 2
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                Send your order breakdown directly to Madhis Handcrafts on WhatsApp
              </p>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                <span>Open WhatsApp & Send Order</span>
                <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </a>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
              💡 <span className="font-semibold text-gray-700">How order sharing works:</span> Clicking the button above opens WhatsApp with your complete order breakdown and Order Reference pre-filled. You can also download the PDF document above as your official receipt or share it in the chat if desired!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
