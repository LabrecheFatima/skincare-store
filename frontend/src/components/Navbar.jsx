import React, { useState } from 'react';

export default function Navbar({ cartCount = 0 }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-stone-900/20 backdrop-blur-md border-b border-white/10 text-white transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 py-4 text-sm tracking-wide">
        
        {/* Liens Nav Gauche (Desktop) */}
        <nav className="hidden md:flex items-center space-x-8 font-light text-stone-200">
          <a href="#home" className="hover:text-white transition-colors border-b border-white pb-0.5">Home</a>
          <a href="#shop" className="hover:text-white transition-colors">Shop</a>
          <a href="#about" className="hover:text-white transition-colors">About Us</a>
        </nav>

        {/* Bouton Hamburger Mobile */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-white focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Logo Centré */}
        <div className="text-xl md:text-2xl tracking-wider font-serif font-medium text-white">
          BloomBeauty
        </div>

        {/* Actions Droite */}
        <div className="flex items-center space-x-6 md:space-x-8 font-light text-stone-200">
          <button className="hidden sm:inline-block hover:text-white transition-colors">Search</button>
          <button className="hidden sm:inline-block hover:text-white transition-colors">Account</button>
          <a href="#cart" className="hover:text-white transition-colors">
            My Cart ({cartCount})
          </a>
        </div>
      </div>

      {/* Menu Mobile Déroulant */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-stone-900/90 backdrop-blur-lg border-b border-white/10 px-8 py-6 flex flex-col space-y-4 text-stone-200">
          <a href="#home" className="hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
          <a href="#shop" className="hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Shop</a>
          <a href="#about" className="hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>About Us</a>
          <div className="pt-4 border-t border-white/10 flex justify-between text-xs text-stone-300">
            <button>Search</button>
            <button>Account</button>
          </div>
        </div>
      )}
    </header>
  );
}