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
              Share or Download Order
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
            <p className="font-medium text-gray-900 text-sm">Preparing your order summary & PDF...</p>
            <p className="text-xs text-gray-500">Compiling items, photos, and prices.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-gray-600">
              Choose how you would like to proceed with your order for <span className="font-semibold text-gray-900">{env.shopName}</span>:
            </p>

            {/* Choice 1: WhatsApp (Recommended) */}
            <div className="p-4 rounded-xl border-2 border-green-500 bg-green-50/50 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-green-800 bg-green-100 px-2 py-0.5 rounded">
                  Option 1 (Recommended)
                </span>
                <span className="text-xs text-green-700 font-medium">Fastest</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Send Order directly on WhatsApp
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Opens WhatsApp with all your items, prices, and reference number pre-filled.
                </p>
              </div>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                <span>Open WhatsApp & Send Order</span>
                <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </a>
            </div>

            {/* Visual Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="shrink-0 mx-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                OR
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Choice 2: Download PDF */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600 bg-gray-200 px-2 py-0.5 rounded">
                  Option 2
                </span>
                {downloaded && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Downloaded
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Download Order PDF Receipt
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Save a printable A4 order document with product photos, descriptions, and grand total.
                </p>
              </div>
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
          </div>
        )}
      </div>
    </div>
  );
};
