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
        className="group min-w-[50px] min-h-[50px] p-3 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
      >
        <MessageCircle className="w-6 h-6 fill-current" aria-hidden="true" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-semibold pl-0 group-hover:pl-2">
          Chat on WhatsApp
        </span>
      </a>
    </aside>
  );
};
