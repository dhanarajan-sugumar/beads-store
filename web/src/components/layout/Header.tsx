import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MessageCircle, Shield } from 'lucide-react';
import { env } from '@/config/env';

interface HeaderProps {
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount = 0,
  onOpenCart,
}) => {
  const whatsappNumber = env.whatsappNumber;
  const cleanNumber = whatsappNumber ? whatsappNumber.replace(/[^0-9]/g, '') : '';
  const whatsappUrl = cleanNumber
    ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
        `Hello ${env.shopName}! I would like to enquire about your jewellery collection.`
      )}`
    : `https://wa.me/?text=${encodeURIComponent(`Hello ${env.shopName}!`)}`;

  return (
    <header className="sticky top-0 z-30 bg-[#F7F0E7] border-b border-[#E8DFD3] shadow-2xs">
      {/* Top Announcement & Utility Bar in Deep Wine (#42232D) */}
      <div className="bg-[#42232D] text-[#E5D3DA] text-xs py-1.5 px-3 sm:px-6 lg:px-8 border-b border-[#552E3A]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Store Announcement */}
          <div className="flex items-center gap-1.5 truncate text-stone-200 min-w-0">
            <span className="text-[11px] sm:text-xs font-sans tracking-wide truncate">
              <span className="xs:hidden">Custom orders via WhatsApp</span>
              <span className="hidden xs:inline">Bespoke orders & custom designs available via WhatsApp</span>
            </span>
          </div>

          {/* Right: Quick Navigation to Catalogue / Admin */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-wider text-[#E5D3DA]">
            <Link
              to="/"
              className="hover:text-white transition-colors py-0.5"
            >
              Catalogue
            </Link>
            <span className="text-[#7E4D5E]" aria-hidden="true">•</span>
            <Link
              to="/admin"
              className="hover:text-white transition-colors py-0.5 flex items-center gap-1 sm:gap-1.5 text-[#E5D3DA]"
            >
              <Shield className="w-3 h-3 text-[#D5B0BC]" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[72px] sm:min-h-[86px] md:min-h-[94px] py-2 sm:py-3 gap-2 sm:gap-4">
          {/* Brand Logo & Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 sm:gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood rounded-lg py-0.5 transition-opacity hover:opacity-95 min-w-0"
            aria-label={`${env.shopName} home page`}
          >
            <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] shrink-0 flex items-center justify-center">
              <img
                src="/logo.png?v=2"
                alt={`${env.shopName} Crest`}
                className="w-full h-full object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-serif font-semibold text-[20px] xs:text-[23px] sm:text-[30px] md:text-[36px] lg:text-[38px] tracking-tight text-[#2C1820] leading-none whitespace-nowrap">
                {env.shopName}
              </span>
              <span className="font-serif italic font-normal text-[11px] xs:text-[12px] sm:text-[14px] md:text-[15px] text-[#9B8469] tracking-wide leading-tight mt-1 truncate max-w-[190px] xs:max-w-[270px] sm:max-w-none">
                <span className="whitespace-nowrap">Each piece, made by hand.</span>
                <span className="hidden sm:inline mx-1 text-[#9B8469]/70">•</span>
                <span className="hidden sm:inline whitespace-nowrap">Handmade bead jewellery</span>
              </span>
            </div>
          </Link>

          {/* Right Actions: WhatsApp + Cart Bag */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* WhatsApp Contact Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-[#E0D7CC] bg-white hover:bg-[#F2EDE4] text-[#2C1820] text-xs font-sans font-medium shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood shrink-0"
              aria-label="Chat with us on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 stroke-[#2C1820] stroke-[1.75]" aria-hidden="true" />
              <span className="hidden xs:inline sm:inline font-sans text-xs font-semibold">WhatsApp</span>
            </a>

            {/* Cart Icon with Oxblood Count Badge */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-[#F2EDE4] text-[#2C1820] border border-[#E0D7CC] focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood transition-colors flex items-center justify-center shadow-2xs shrink-0"
              aria-label={`Shopping bag with ${cartItemCount} items`}
            >
              <ShoppingBag className="w-4 h-4 stroke-[#2C1820] stroke-[1.75]" aria-hidden="true" />
              {cartItemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-[#68273D] text-white text-[10px] font-sans font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-2xs animate-in zoom-in-50 duration-150"
                  aria-hidden="true"
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
