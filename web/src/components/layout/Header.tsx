import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles } from 'lucide-react';
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gold-200/60 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Shop Title */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md p-1"
            aria-label={`${env.shopName} home page`}
          >
            <div className="w-8 h-8 rounded-full bg-gold-50 border border-gold-300 flex items-center justify-center text-gold-600 shadow-2xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-gold-600" />
            </div>
            <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-stone-900 group-hover:text-primary-700 transition-colors">
              {env.shopName}
            </span>
          </Link>

          {/* Action buttons (Cart, Admin Link) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCart}
              className="relative min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-full text-stone-700 hover:text-primary-700 hover:bg-gold-50/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors"
              aria-label={`Shopping bag with ${cartItemCount} items`}
            >
              <ShoppingBag className="w-6 h-6" aria-hidden="true" />
              {cartItemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-xs animate-in zoom-in-50 duration-150"
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
