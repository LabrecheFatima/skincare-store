import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo.png';

export default function Navbar({ cartCount: propCartCount = 0 }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Récupération dynamique du nombre d'articles du panier
  const cartState = useCart();
  const totalItems = cartState?.totalItems ?? propCartCount;

  return (
    <div className="sticky top-0 z-50 w-full shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      {/* Bandeau d'annonce */}
      <div className="w-full bg-[#2b2527] text-[#f1ebe2] text-center py-2.5 px-4">
        <p className="text-[10px] sm:text-xs md:text-sm font-light uppercase tracking-[0.18em] sm:tracking-[0.25em] leading-tight">
          Boutique en ligne de produits artisanaux
        </p>
      </div>

      {/* Barre de navigation */}
      <header className="w-full bg-[#f3efe8] text-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-12 py-2.5 sm:py-3">

          {/* 1. GAUCHE : Menu Mobile (Burger) / Liens Desktop */}
          <div className="flex items-center justify-start flex-1">
            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center gap-8 text-sm tracking-wide text-stone-700">
              <Link to="/" className="hover:text-stone-900 transition-colors font-medium uppercase text-xs tracking-widest">
                Accueil
              </Link>
              <Link to="/shop" className="hover:text-stone-900 transition-colors font-medium uppercase text-xs tracking-widest">
                Boutique
              </Link>
            </nav>

            {/* Bouton Menu Burger (Mobile uniquement) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-stone-800 focus:outline-none p-1.5 -ml-1.5 hover:opacity-75 transition-opacity"
              aria-label="Menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* 2. CENTRE : Logo parfaitement centré */}
          <div className="flex items-center justify-center shrink-0">
            <Link to="/" className="flex items-center justify-center" aria-label="Apoteca-dz">
              {logoError ? (
                <span className="text-lg sm:text-xl md:text-2xl tracking-wider font-serif font-medium text-stone-900">
                  Apoteca-dz
                </span>
              ) : (
                <img
                  src={logo}
                  alt="Apoteca-dz"
                  onError={() => setLogoError(true)}
                  className="h-10 sm:h-12 md:h-14 w-auto object-contain"
                />
              )}
            </Link>
          </div>

          {/* 3. DROITE : Panier */}
          <div className="flex items-center justify-end flex-1">
            <Link
              to="/checkout"
              className="relative p-1.5 text-stone-800 hover:text-stone-900 transition-colors flex items-center justify-center"
              aria-label="Voir le panier"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.3">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.993z"
                />
              </svg>

              {/* Badge avec le nombre d'articles */}
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#e9a3a0] text-stone-900 font-semibold text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

        </div>

        {/* Menu Déroulant (Mobile) */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#f3efe8] border-t border-stone-200/60 px-6 py-4 flex flex-col space-y-3 text-stone-700 text-sm">
            <Link
              to="/"
              className="hover:text-stone-900 transition-colors py-1 uppercase text-xs tracking-widest font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              to="/shop"
              className="hover:text-stone-900 transition-colors py-1 uppercase text-xs tracking-widest font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Boutique
            </Link>
          </div>
        )}
      </header>
    </div>
  );
}