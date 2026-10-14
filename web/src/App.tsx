import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { AdminPage } from '@/pages/AdminPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { CartProvider } from '@/context/CartContext';
import { useCart } from '@/hooks/useCart';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { OrderShareModal } from '@/components/cart/OrderShareModal';

const AppContent: React.FC = () => {
  const { itemCount, openCart, closeCart, addItem } = useCart();
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

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
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <CartDrawer
        onOpenPdfShare={() => {
          closeCart();
          setIsShareModalOpen(true);
        }}
      />
      <OrderShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
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
