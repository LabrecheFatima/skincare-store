import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop'; // <-- 1. IMPORT DU COMPOSANT SCROLLTOTOP
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/CheckoutTemp';
import PackDetail from './pages/PackDetail';

// Imports Admin
import Login from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import AdminShipping from './pages/admin/AdminShipping';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPacks from './pages/admin/AdminPacks';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop /> {/* <-- 2. PLACEMENT DE SCROLLTOTOP ICI */}
        <Routes>
          {/* ==================== 1. ROUTES PUBLIQUES CLIENT ==================== */}
          <Route
            path="/*"
            element={
              <div className="min-h-screen flex flex-col justify-between">
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/pack/:id" element={<PackDetail />} />
                  <Route path="/checkout" element={<Checkout />} />
                </Routes>
                <Footer />
              </div>
            }
          />

          {/* ==================== 2. ROUTE LOGIN ADMIN ==================== */}
          <Route path="/admin/login" element={<Login />} />

          {/* ==================== 3. ROUTES ADMIN PROTÉGÉES ==================== */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="packs" element={<AdminPacks />} />
              <Route path="categories" element={<AdminCategories />} /> 
              <Route path="shipping" element={<AdminShipping />} />
            </Route>
          </Route>

          {/* Redirection si route introuvable */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}