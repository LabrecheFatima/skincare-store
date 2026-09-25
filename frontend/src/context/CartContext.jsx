// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      const parsed = saved ? JSON.parse(saved) : [];
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

  const safeCart = Array.isArray(cart) ? cart : [];
  
  // Calcul du montant total sécurisé
  const totalAmount = safeCart.reduce((acc, item) => {
    const price = item.promo_price ?? item.original_price;
    return acc + price * item.qty;
  }, 0);

  // Nombre total d'articles dans le panier
  const totalItems = safeCart.reduce((acc, item) => acc + (item.qty || 1), 0);

  return (
    <CartContext.Provider value={{ cart: safeCart, addToCart, removeFromCart, clearCart, totalAmount, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);