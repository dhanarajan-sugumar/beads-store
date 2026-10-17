import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import { env } from '@/config/env';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const instagramUrl = env.instagramUrl;

  return (
    <footer className="bg-dark text-ivory mt-auto border-t border-gold/30">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
          {/* Left: Copyright */}
          <p className="text-[11px] text-ivory/50 order-2 sm:order-1">
            © {currentYear} {env.shopName}. All rights reserved.
          </p>

          {/* Center: Brand Note or Social (Instagram) */}
          <div className="flex items-center gap-6 text-[11px] tracking-wider uppercase order-1 sm:order-2 text-stone-400">
            {instagramUrl ? (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-300 hover:text-gold transition-colors flex items-center gap-1.5 min-h-[44px] focus:outline-none focus-visible:ring-1 focus-visible:ring-gold"
              >
                <Instagram className="w-3.5 h-3.5 text-gold stroke-[1.5]" />
                <span>Instagram</span>
              </a>
            ) : (
              <span className="font-serif italic text-stone-300 normal-case text-xs">
                Handcrafted with care & quality beads
              </span>
            )}
          </div>

          {/* Right: Quick Links */}
          <div className="flex items-center gap-3 text-[11px] text-ivory/50 order-3">
            <Link to="/" className="hover:text-gold transition-colors py-1">
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
