import React from 'react';
import { MessageCircle } from 'lucide-react';
import { env } from '@/config/env';

export const FloatingWhatsAppButton: React.FC = () => {
  const whatsappNumber = env.whatsappNumber;
  const cleanNumber = whatsappNumber ? whatsappNumber.replace(/[^0-9]/g, '') : '';
  const message = encodeURIComponent(`Hello ${env.shopName}! I have an enquiry about your handmade jewellery.`);
  
  const href = cleanNumber
    ? `https://wa.me/${cleanNumber}?text=${message}`
    : `https://wa.me/?text=${message}`;

  return (
    <aside aria-label="Customer support" className="fixed bottom-5 right-5 z-40">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="group min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-[#2E7D32]/90 hover:bg-[#2E7D32] text-ivory shadow-xs hover:shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center focus:outline-none focus-visible:ring-1 focus-visible:ring-gold"
      >
        <MessageCircle className="w-5 h-5 fill-current stroke-none" aria-hidden="true" />
      </a>
    </aside>
  );
};

