import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { CartProvider } from '@/context/CartContext';
import { useCart } from '@/hooks/useCart';
import { CartDrawer } from '@/components/cart/CartDrawer';

const AppContent: React.FC = () => {
  const { itemCount, openCart, addItem } = useCart();

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <Layout
                cartItemCount={itemCount}
                onOpenCart={openCart}
              />
            }
          >
            <Route path="/" element={<HomePage onAddToCart={addItem} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <CartDrawer />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
};

export default App;
