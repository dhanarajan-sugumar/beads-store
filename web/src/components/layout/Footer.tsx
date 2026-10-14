import React from 'react';
import { Link } from 'react-router-dom';
import { env } from '@/config/env';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-serif font-semibold text-gray-900 text-lg">
              {env.shopName}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Handcrafted beads jewellery made with love in India.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <Link
              to="/"
              className="min-h-[44px] flex items-center hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded px-1 transition-colors"
            >
              Catalogue
            </Link>
            <Link
              to="/admin"
              className="min-h-[44px] flex items-center hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded px-1 transition-colors"
            >
              Admin Portal
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <p>© {currentYear} {env.shopName}. All rights reserved.</p>
          <p>Orders shared via WhatsApp.</p>
        </div>
      </div>
    </footer>
  );
};
