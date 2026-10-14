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
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      onClick={onClose}
    >
      <div
        className="relative bg-ivory rounded-[2px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gold/40 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gold/30 pb-4">
          <div>
            <h2 id="share-modal-title" className="font-serif font-normal text-2xl sm:text-3xl text-ink">
              Share or Download Order
            </h2>
            <p className="text-xs font-sans text-muted mt-1">
              Order Reference: <span className="font-mono text-oxblood font-medium">{orderRef}</span>
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="min-w-[44px] min-h-[44px] -mt-1 -mr-1 rounded-full flex items-center justify-center text-ink hover:text-oxblood focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood transition-colors"
          >
            <X className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
          </button>
        </div>

        {generating ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
            <Loader2 className="w-8 h-8 text-oxblood animate-spin stroke-[1.5]" />
            <p className="font-serif text-lg text-ink font-normal">Preparing your order summary...</p>
            <p className="text-xs font-sans text-muted">Compiling pieces and creating your PDF document.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs sm:text-sm font-sans text-muted">
              Choose how you would like to proceed with your order for <span className="font-medium text-ink">{env.shopName}</span>:
            </p>

            {/* Choice 1: WhatsApp (Recommended) */}
            <div className="p-4 rounded-[2px] border border-gold/50 bg-white/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans font-medium uppercase tracking-[0.15em] text-gold">
                  Option 1 (Direct)
                </span>
                <span className="text-xs font-sans text-muted font-normal">Instant</span>
              </div>
              <div>
                <p className="text-sm font-sans font-medium text-ink">
                  Send Order directly on WhatsApp
                </p>
                <p className="text-xs font-sans text-muted mt-0.5">
                  Opens WhatsApp with all your items, prices, and reference number pre-filled.
                </p>
              </div>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-[2px] bg-[#2E7D32] hover:bg-[#256629] text-ivory text-xs font-sans font-medium tracking-[0.12em] uppercase focus:outline-none focus-visible:ring-1 focus-visible:ring-gold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageCircle className="w-4 h-4 stroke-[1.5]" aria-hidden="true" />
                <span>Open WhatsApp & Send Order</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" aria-hidden="true" />
              </a>
            </div>

            {/* Visual Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gold/30"></div>
              <span className="shrink-0 mx-3 text-[10px] font-sans text-muted uppercase tracking-[0.2em]">
                OR
              </span>
              <div className="flex-grow border-t border-gold/30"></div>
            </div>

            {/* Choice 2: Download PDF */}
            <div className="p-4 rounded-[2px] border border-gold/30 bg-white/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans uppercase tracking-[0.15em] text-muted font-medium">
                  Option 2
                </span>
                {downloaded && (
                  <span className="inline-flex items-center gap-1 text-xs font-sans text-oxblood">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Downloaded
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-sans font-medium text-ink">
                  Download Order PDF & Send to us on WhatsApp
                </p>
                <p className="text-xs font-sans text-muted mt-0.5">
                  Save a printable A4 order document with product photos, descriptions, and grand total, and send it to our WhatsApp to place your order.
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
                <span>{downloaded ? 'PDF Downloaded (Click to download again)' : 'Download Order PDF'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
