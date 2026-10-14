import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import type { Product } from '@/types/database';

export const App: React.FC = () => {
  const [cartItemCount, setCartItemCount] = useState<number>(0);

  const handleOpenCart = () => {
    // Will open Cart drawer in feature/cart
  };

  const handleAddToCart = (_product: Product) => {
    // Scaffold counter increment; full cart storage is in feature/cart
    setCartItemCount((prev) => prev + 1);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <Layout
              cartItemCount={cartItemCount}
              onOpenCart={handleOpenCart}
            />
          }
        >
          <Route path="/" element={<HomePage onAddToCart={handleAddToCart} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
