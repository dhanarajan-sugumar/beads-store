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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-2xs">
      {/* Top Announcement & Utility Bar */}
      <div className="bg-slate-900 text-stone-200 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
          {/* Left/Center: Store Announcement */}
          <div className="flex items-center gap-2 truncate">
            <span className="text-gold text-[12px] select-none">✨</span>
            <span className="text-stone-300 text-xs font-sans tracking-wide truncate">
              Bespoke orders & custom designs available via WhatsApp
            </span>
          </div>

          {/* Right: Quick Navigation to Catalogue / Admin */}
          <div className="flex items-center gap-3 shrink-0 text-[11px] font-sans font-medium uppercase tracking-wider text-stone-300">
            <Link
              to="/"
              className="hover:text-gold transition-colors py-0.5"
            >
              Catalogue
            </Link>
            <span className="text-stone-600" aria-hidden="true">•</span>
            <Link
              to="/admin"
              className="hover:text-gold transition-colors py-0.5 flex items-center gap-1 text-stone-300 hover:text-white"
            >
              <Shield className="w-3 h-3 text-gold" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Brand Logo & Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 sm:gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood rounded-lg py-1 transition-opacity hover:opacity-95"
            aria-label={`${env.shopName} home page`}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 border border-gold/30 shadow-2xs bg-stone-50 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Madhis Handcrafts Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-medium text-[20px] sm:text-[25px] md:text-[27px] tracking-[0.01em] text-slate-900 leading-tight">
                {env.shopName}
              </span>
              <span className="font-serif italic font-medium text-[11px] sm:text-[13px] md:text-[14px] text-amber-900/90 tracking-wide leading-tight mt-0.5">
                Each piece, made by hand. <span className="mx-0.5 text-amber-700/60">•</span> Handmade bead jewellery
              </span>
            </div>
          </Link>

          {/* Right Actions: WhatsApp + Cart Bag */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* WhatsApp Contact Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full border border-emerald-500/30 bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-800 text-xs font-semibold shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              aria-label="Chat with us on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600 stroke-none" aria-hidden="true" />
              <span className="hidden sm:inline font-sans text-xs font-semibold">WhatsApp</span>
            </a>

            {/* Cart Icon with Oxblood Count Badge */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative min-w-[42px] min-h-[42px] p-2 rounded-full text-slate-800 hover:text-oxblood hover:bg-stone-50 border border-stone-200/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood transition-colors flex items-center justify-center shadow-2xs"
              aria-label={`Shopping bag with ${cartItemCount} items`}
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
              {cartItemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-oxblood text-white text-[10px] font-sans font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-2xs animate-in zoom-in-50 duration-150"
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

