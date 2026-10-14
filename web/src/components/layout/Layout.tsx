import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  cartItemCount = 0,
  onOpenCart,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      <Header cartItemCount={cartItemCount} onOpenCart={onOpenCart} />
      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
