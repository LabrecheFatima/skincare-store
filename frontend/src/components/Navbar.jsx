import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo.png'; // Importation du logo pour assurer la bonne résolution du chemin

// Textes selon la langue du navigateur (fr par défaut)
const labels = {
  fr: { banner: 'Boutique en ligne de produits artisanaux', home: 'Accueil', shop: 'Boutique', cart: 'Voir le panier', menu: 'Menu', dir: 'ltr' },
  en: { banner: 'Online handcrafted products shop', home: 'Home', shop: 'Shop', cart: 'View cart', menu: 'Menu', dir: 'ltr' },
  ar: { banner: 'متجر إلكتروني للمنتجات الحرفية', home: 'الرئيسية', shop: 'المتجر', cart: 'عرض السلة', menu: 'القائمة', dir: 'rtl' },
};

const detectLang = () => {
  if (typeof navigator === 'undefined') return 'fr';
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const l of prefs) {
    const code = (l || '').slice(0, 2).toLowerCase();
    if (labels[code]) return code;
  }
  return 'fr';
};

export default function Navbar({ cartCount: propCartCount = 0 }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [lang] = useState(detectLang);
  const t = labels[lang];

  // Récupération dynamique du nombre d'articles du panier
  const cartState = useCart();
  const totalItems = cartState?.totalItems ?? propCartCount;

  return (
    // 'sticky top-0 z-50' sur l'ensemble du conteneur garantit qu'il reste visible au défilement
    <div dir={t.dir} className="sticky top-0 z-50 w-full shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      {/* Bandeau d'annonce */}
      <div className="w-full bg-[#2b2527] text-[#f1ebe2] text-center py-3 px-4">
        <p className={`text-[11px] sm:text-sm font-light uppercase ${lang === 'ar' ? 'tracking-normal' : 'tracking-[0.2em] sm:tracking-[0.25em]'}`}>
          {t.banner}
        </p>
      </div>

      {/* Barre de navigation */}
      <header className="w-full bg-[#f3efe8] text-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-12 py-2 sm:py-3">

          {/* Logo / Nom du Site */}
          <Link to="/" className="flex items-center shrink-0" aria-label="Apoteca-dz">
            {logoError ? (
              <span className="text-xl md:text-2xl tracking-wider font-serif font-medium text-stone-900">Apoteca-dz</span>
            ) : (
              <img
                src={logo}
                alt="Apoteca-dz"
                onError={() => setLogoError(true)}
                className="h-12 sm:h-14 w-auto object-contain"
              />
            )}
          </Link>

          <div className="flex items-center gap-2 sm:gap-6">
            {/* Navigation (Desktop) */}
            <nav className="hidden md:flex items-center gap-8 text-sm tracking-wide text-stone-700">
              <Link to="/" className="hover:text-stone-900 transition-colors">{t.home}</Link>
              <Link to="/shop" className="hover:text-stone-900 transition-colors">{t.shop}</Link>
            </nav>

            {/* Icône du Panier */}
            <Link
              to="/checkout"
              className="relative p-2 text-stone-800 hover:text-stone-900 transition-colors flex items-center justify-center"
              aria-label={t.cart}
            >
              <svg className="w-7 h-7 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.3">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.993z"
                />
              </svg>

              {/* Badge du nombre d'articles */}
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -end-0.5 bg-apoteca-pink text-stone-900 font-semibold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-150">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Bouton Menu Burger (Mobile) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-stone-800 focus:outline-none p-2"
              aria-label={t.menu}
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Déroulant (Mobile) */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#f3efe8] border-t border-stone-200 px-8 py-5 flex flex-col space-y-3 text-stone-700 text-sm">
            <Link to="/" className="hover:text-stone-900 transition-colors py-1" onClick={() => setIsMobileMenuOpen(false)}>
              {t.home}
            </Link>
            <Link to="/shop" className="hover:text-stone-900 transition-colors py-1" onClick={() => setIsMobileMenuOpen(false)}>
              {t.shop}
            </Link>
          </div>
        )}
      </header>
    </div>
  );
}