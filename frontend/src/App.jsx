import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/CheckoutTemp';

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen flex flex-col justify-between">
          <div>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}