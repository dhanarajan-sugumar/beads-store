import React from 'react';
import { env } from '@/config/env';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#42232B] text-[#E5D3DA] mt-auto border-t border-[#552E3A] py-6">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs text-[#E5D3DA]/90 font-sans tracking-wide">
          © {currentYear} {env.shopName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
