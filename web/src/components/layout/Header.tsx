import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { env } from '@/config/env';

interface HeaderProps {
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount = 0,
  onOpenCart,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-ivory/95 backdrop-blur-md border-b border-gold/40">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left spacer to perfectly balance the right cart button */}
          <div className="w-11 shrink-0" aria-hidden="true" />

          {/* Centred Wordmark with Official Logo */}
          <Link
            to="/"
            className="flex items-center justify-center gap-2 sm:gap-3 group focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood rounded-xs py-1 transition-opacity hover:opacity-90"
            aria-label={`${env.shopName} home page`}
          >
            <img
              src="/logo.png"
              alt="Madhis Handcrafts Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-contain shrink-0 shadow-xs"
            />
            <span className="font-serif font-light text-[21px] sm:text-[28px] md:text-[32px] tracking-[0.02em] text-ink transition-colors whitespace-nowrap">
              {env.shopName}
            </span>
          </Link>

          {/* Cart Icon with Oxblood Count Badge */}
          <div className="w-11 shrink-0 flex items-center justify-end">
            <button
              type="button"
              onClick={onOpenCart}
              className="relative min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-ink hover:text-oxblood focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood transition-colors"
              aria-label={`Shopping bag with ${cartItemCount} items`}
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
              {cartItemCount > 0 && (
                <span
                  className="absolute top-1 right-1 bg-oxblood text-ivory text-[10px] font-sans font-medium rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow-xs animate-in zoom-in-50 duration-150"
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

