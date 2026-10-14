import React from 'react';
import { ShoppingBag, FileText, MessageCircle } from 'lucide-react';

export const HowToOrderStrip: React.FC = () => {
  return (
    <div
      aria-label="How to order guide"
      className="bg-white rounded-xl border border-gold-200/70 p-3 sm:p-4 shadow-2xs"
    >
      <div className="grid grid-cols-3 gap-2 sm:gap-4 divide-x divide-gold-200/60 text-center">
        {/* Step 1: Pick */}
        <div className="flex flex-col items-center px-1 sm:px-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gold-50 text-gold-700 flex items-center justify-center mb-1 shadow-2xs">
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-600" aria-hidden="true" />
          </div>
          <p className="text-xs sm:text-sm font-serif font-bold text-stone-900">1. Pick</p>
          <p className="text-[10px] sm:text-xs text-stone-500 line-clamp-1 sm:line-clamp-none">
            Choose your pieces
          </p>
        </div>

        {/* Step 2: Create PDF */}
        <div className="flex flex-col items-center px-1 sm:px-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gold-50 text-gold-700 flex items-center justify-center mb-1 shadow-2xs">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-600" aria-hidden="true" />
          </div>
          <p className="text-xs sm:text-sm font-serif font-bold text-stone-900">2. Create PDF</p>
          <p className="text-[10px] sm:text-xs text-stone-500 line-clamp-1 sm:line-clamp-none">
            Save order receipt
          </p>
        </div>

        {/* Step 3: Send on WhatsApp */}
        <div className="flex flex-col items-center px-1 sm:px-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-50 text-green-700 flex items-center justify-center mb-1 shadow-2xs">
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#25D366]" aria-hidden="true" />
          </div>
          <p className="text-xs sm:text-sm font-serif font-bold text-stone-900">3. WhatsApp</p>
          <p className="text-[10px] sm:text-xs text-stone-500 line-clamp-1 sm:line-clamp-none">
            Confirm & pay
          </p>
        </div>
      </div>
    </div>
  );
};
