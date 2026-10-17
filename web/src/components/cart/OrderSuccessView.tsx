import React from 'react';
import { CheckCircle2, MessageCircle, ArrowRight } from 'lucide-react';

interface OrderSuccessViewProps {
  orderRef: string;
  customerName: string;
  whatsappUrl: string;
  onClose: () => void;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({
  orderRef,
  customerName,
  whatsappUrl,
  onClose,
}) => {
  return (
    <div className="h-full flex flex-col justify-between p-6 sm:p-8 animate-fade-in text-center">
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-xs">
          <CheckCircle2 className="w-8 h-8 stroke-[1.5]" aria-hidden="true" />
        </div>

        {/* Title */}
        <div>
          <span className="text-[10px] font-sans font-medium tracking-[0.2em] uppercase text-gold block mb-1">
            THANK YOU
          </span>
          <h2 className="font-serif font-normal text-2xl sm:text-3xl text-ink leading-tight">
            Order Received!
          </h2>
        </div>

        {/* Order Reference Pill */}
        <div className="px-3.5 py-1.5 rounded-[2px] bg-stone-100 border border-gold/30">
          <p className="text-[11px] font-sans tracking-wider text-muted uppercase">
            Order Reference
          </p>
          <p className="font-mono font-bold text-base text-oxblood tracking-wide">
            {orderRef}
          </p>
        </div>

        {/* Message */}
        <p className="font-sans text-xs sm:text-sm text-ink/80 leading-relaxed max-w-xs">
          Thank you, <strong className="text-ink font-semibold">{customerName}</strong>. Your order has been securely saved in our store system.
        </p>

        <p className="font-sans text-xs text-muted leading-relaxed max-w-xs">
          We have opened WhatsApp with your pre-filled order details. If WhatsApp did not open automatically, tap the button below:
        </p>

        {/* Backup WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-xs min-h-[44px] px-5 py-2.5 rounded-[2px] bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-sans font-medium tracking-[0.15em] uppercase transition-colors shadow-xs flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-700"
        >
          <MessageCircle className="w-4 h-4 stroke-[1.5]" aria-hidden="true" />
          <span>Open WhatsApp Message</span>
        </a>
      </div>

      {/* Footer Close Button */}
      <div className="pt-4 border-t border-gold/20">
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-[2px] border border-stone-300 text-ink hover:border-oxblood hover:text-oxblood text-xs font-sans font-medium tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
        </button>
      </div>
    </div>
  );
};
