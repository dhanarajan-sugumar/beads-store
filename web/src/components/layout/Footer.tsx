import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Instagram, Heart, Sparkles } from 'lucide-react';
import { env } from '@/config/env';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const whatsappNumber = env.whatsappNumber;
  const instagramUrl = env.instagramUrl;
  const cleanNumber = whatsappNumber ? whatsappNumber.replace(/[^0-9]/g, '') : '';

  return (
    <footer className="bg-white border-t border-gold-200/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
          {/* Brand Info */}
          <div className="space-y-2 max-w-md">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <p className="font-serif font-bold text-stone-900 text-xl tracking-tight">
                {env.shopName}
              </p>
            </div>
            <p className="text-sm font-medium text-primary-700 italic">
              Handmade, each piece unique. Custom orders welcome.
            </p>
            <p className="text-xs text-stone-500 leading-relaxed">
              Traditional and contemporary beaded jewellery handcrafted with premium glass, crystals, and gemstones in India.
            </p>
          </div>

          {/* Contact & Socials */}
          <div className="flex flex-col items-center md:items-end gap-3 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Connect With Us
            </span>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${cleanNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-3 py-1.5 rounded-lg border border-gold-200 bg-gold-50/50 hover:bg-gold-100 text-stone-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>{whatsappNumber}</span>
                </a>
              )}

              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-3 py-1.5 rounded-lg border border-gold-200 bg-gold-50/50 hover:bg-gold-100 text-stone-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-[#E1306C]" />
                  <span>Instagram</span>
                </a>
              )}
            </div>

            {/* Navigation links */}
            <div className="flex items-center gap-5 pt-2 text-xs text-stone-600">
              <Link
                to="/"
                className="hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded py-1 transition-colors"
              >
                Catalogue
              </Link>
              <span>•</span>
              <Link
                to="/admin"
                className="hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded py-1 transition-colors"
              >
                Admin Portal
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="mt-8 pt-6 border-t border-gold-100 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
          <p>© {currentYear} {env.shopName}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-primary-600 fill-primary-600" aria-label="love" />
            <span>• Orders shared directly via WhatsApp</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
