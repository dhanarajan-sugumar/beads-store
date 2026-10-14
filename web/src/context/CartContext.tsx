import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '@/types/database';
import {
  loadCartFromStorage,
  saveCartToStorage,
  type CartItem,
} from '@/utils/cartStorage';
import {
  calculateCartGrandTotal,
  calculateTotalItemCount,
  clampQuantity,
} from '@/utils/cartMath';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  grandTotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Sync to localStorage whenever cart items change
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const nextItems = [...prevItems];
        const existing = nextItems[existingIndex];
        const newQty = clampQuantity(existing.quantity + quantity);
        nextItems[existingIndex] = { ...existing, quantity: newQty };
        return nextItems;
      }

      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price_inr: product.price_inr,
        image_url: product.image_url,
        sku: product.sku,
        quantity: clampQuantity(quantity),
      };
      return [...prevItems, newItem];
    });
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter((item) => item.id !== productId);
      }
      return prevItems.map((item) => {
        if (item.id === productId) {
          return { ...item, quantity: clampQuantity(quantity) };
        }
        return item;
      });
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = calculateTotalItemCount(items);
  const grandTotal = calculateCartGrandTotal(items);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        grandTotal,
        isCartOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContext };
export type { CartContextType };
