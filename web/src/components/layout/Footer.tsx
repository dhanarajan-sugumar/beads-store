import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Instagram } from 'lucide-react';
import { env } from '@/config/env';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const whatsappNumber = env.whatsappNumber;
  const instagramUrl = env.instagramUrl;
  const cleanNumber = whatsappNumber ? whatsappNumber.replace(/[^0-9]/g, '') : '';

  return (
    <footer className="bg-dark text-ivory mt-auto border-t border-gold/30">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Wordmark in Cormorant */}
          <p className="font-serif font-light text-2xl sm:text-3xl text-ivory tracking-[0.03em]">
            {env.shopName}
          </p>

          {/* Italic tagline */}
          <p className="font-serif italic text-sm sm:text-base text-ivory/80 max-w-md">
            Handmade, each piece unique. Custom orders welcome.
          </p>

          {/* Social and WhatsApp Links */}
          {(whatsappNumber || instagramUrl) && (
            <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs tracking-wider uppercase font-sans">
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${cleanNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ivory/80 hover:text-gold transition-colors flex items-center gap-1.5 min-h-[44px] focus:outline-none focus-visible:ring-1 focus-visible:ring-gold"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-gold stroke-[1.5]" />
                  <span>WhatsApp {whatsappNumber}</span>
                </a>
              )}

              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ivory/80 hover:text-gold transition-colors flex items-center gap-1.5 min-h-[44px] focus:outline-none focus-visible:ring-1 focus-visible:ring-gold"
                >
                  <Instagram className="w-3.5 h-3.5 text-gold stroke-[1.5]" />
                  <span>Instagram</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Thin Gold Divider */}
        <div className="border-t border-gold/30 my-8 sm:my-10" />

        {/* Bottom copyright and Admin link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-sans text-ivory/50">
          <p>© {currentYear} {env.shopName}. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="hover:text-gold transition-colors py-1"
            >
              Catalogue
            </Link>
            <span>•</span>
            <Link
              to="/admin"
              className="hover:text-gold transition-colors py-1 text-ivory/40 hover:text-ivory/70"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
