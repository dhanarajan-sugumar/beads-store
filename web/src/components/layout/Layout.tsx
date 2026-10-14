import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingWhatsAppButton } from '../common/FloatingWhatsAppButton';

interface LayoutProps {
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  cartItemCount = 0,
  onOpenCart,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-ivory text-ink">
      <Header cartItemCount={cartItemCount} onOpenCart={onOpenCart} />
      <main id="main-content" className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-12 sm:pt-4 sm:pb-16 lg:pt-6 lg:pb-20">
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsAppButton />
    </div>
  );
};
