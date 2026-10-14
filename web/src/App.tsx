import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const App: React.FC = () => {
  const [cartItemCount] = useState<number>(0);

  const handleOpenCart = () => {
    // Will open Cart drawer in feature/cart
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
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
