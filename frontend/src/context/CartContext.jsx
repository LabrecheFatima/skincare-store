// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      const parsed = saved ? JSON.parse(saved) : [];
      // Vérification stricte : s'assurer que parsed est bien un Array
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Erreur de lecture du panier dans localStorage", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const currentCart = Array.isArray(prev) ? prev : [];
      const existing = currentCart.find(i => i.id === product.id);
      if (existing) {
        return currentCart.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      }
      return [...currentCart, { ...product, qty }];
    });
  };

  const removeFromCart = (id) => setCart(prev => (Array.isArray(prev) ? prev.filter(i => i.id !== id) : []));
  const clearCart = () => setCart([]);

  // Calcul du montant total sécurisé
  const safeCart = Array.isArray(cart) ? cart : [];
  const totalAmount = safeCart.reduce((acc, item) => {
    const price = item.promo_price ?? item.original_price;
    return acc + price * item.qty;
  }, 0);

  return (
    <CartContext.Provider value={{ cart: safeCart, addToCart, removeFromCart, clearCart, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);