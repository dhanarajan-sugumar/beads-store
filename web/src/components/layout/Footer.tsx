import React from 'react';
import { env } from '@/config/env';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-stone-400 mt-auto border-t border-slate-800 py-6">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs text-stone-400 font-sans tracking-wide">
          © {currentYear} {env.shopName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
