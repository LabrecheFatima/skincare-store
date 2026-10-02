import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

// Assets & Composants annexes
import bannerImg from '../assets/image-banner.png';
import CategoriesSection from '../components/CategoriesSection';
import AboutVideoSection from '../components/AboutVideoSection';
import GlowSection from '../components/GlowSection';
import PacksCarousel from '../components/PackCarousel';
import { API_URL } from '../config';

// Motif végétal
const Leaf = () => (
  <svg viewBox="0 0 60 200" className="hb-orn" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M30 200V20" />
    {[40, 75, 110, 145].map((y) => (
      <g key={y}>
        <path d={`M30 ${y + 25}C10 ${y + 20} 8 ${y} 12 ${y - 8}C26 ${y - 4} 32 ${y + 10} 30 ${y + 25}Z`} />
        <path d={`M30 ${y + 10}C50 ${y + 5} 52 ${y - 15} 48 ${y - 23}C34 ${y - 19} 28 ${y - 5} 30 ${y + 10}Z`} />
      </g>
    ))}
  </svg>
);

// Icônes du menu de catégories
const icons = {
  lotus: <path d="M24 38c-8-2-14-8-14-16 6 0 11 3 14 8 3-5 8-8 14-8 0 8-6 14-14 16zm0 0c-4-6-4-14 0-22 4 8 4 16 0 22zM8 40h32" />,
  lamp: <path d="M17 12h14l6 16H11zM24 28v10M16 40h16M24 8v4" />,
  sprout: <path d="M24 40V22M24 24c-8 0-12-5-12-11 8 0 12 4 12 11zm0 4c6 0 10-4 10-10-7 0-10 4-10 10zM14 40h20" />,
  linen: <path d="M10 18l14-6 14 6-14 6zM10 26l14 6 14-6M10 33l14 6 14-6" />,
  candle: <path d="M24 8c4 6 6 9 6 13a6 6 0 0 1-12 0c0-4 2-7 6-13zM24 30v10M18 40h12" />,
};

// Textes multilingues
const heroContent = {
  fr: {
    title: "Handcrafted with care",
    description: "Savons artisanaux, naturellement parfumés, emballés à la main dans des tons chauds et naturels.",
    cta: "Découvrir",
    addToCart: "AJOUTER AU PANIER",
    dir: 'ltr',
    categories: [
      { icon: "lotus", label: "Soins & Beauté" },
      { icon: "lamp", label: "Senteur & Bien-etre" },
      { icon: "sprout", label: "Maison & Déco" },
      { icon: "linen", label: "Art de la Table" },
      { icon: "candle", label: "Produit de beauté" },
    ],
  },
  en: {
    title: "Handcrafted with care",
    description: "Artisanal soaps, naturally scented, wrapped by hand in warm and earthy tones.",
    cta: "Discover",
    addToCart: "ADD TO CART",
    dir: 'ltr',
    categories: [
      { icon: "lotus", label: "Care & Beauty" },
      { icon: "lamp", label: "Scent & Wellness" },
      { icon: "sprout", label: "Home & Decor" },
      { icon: "linen", label: "Tableware" },
      { icon: "candle", label: "Beauty Products" },
    ],
  },
  ar: {
    title: "صُنع يدويًا بعناية",
    description: "صابون حرفي بعطور طبيعية، يُغلَّف يدويًا بألوان دافئة وترابية.",
    cta: "اكتشف",
    addToCart: "أضف إلى السلة",
    dir: 'rtl',
    categories: [
      { icon: "lotus", label: "العناية والجمال" },
      { icon: "lamp", label: "العطور والرفاهية" },
      { icon: "sprout", label: "المنزل والديكور" },
      { icon: "linen", label: "فن المائدة" },
      { icon: "candle", label: "منتجات التجميل" },
    ],
  },
};

const detectLang = () => {
  if (typeof navigator === 'undefined') return 'fr';
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const l of prefs) {
    const code = (l || '').slice(0, 2).toLowerCase();
    if (heroContent[code]) return code;
  }
  return 'fr';
};

export default function Home() {
  const scrollRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang] = useState(detectLang);
  const hero = heroContent[lang];

  const { addToCart } = useCart();
  const serverBaseUrl = API_URL.replace(/\/api\/?$/, '');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products?limit=10`);
        const data = response.data.data || response.data || [];
        setProducts(data.slice(0, 10));
      } catch (error) {
        console.error("Erreur lors du chargement des produits :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const offset = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollLeft + offset, behavior: 'smooth' });
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${serverBaseUrl}${cleanPath}`;
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    e.preventDefault();
    if (addToCart) {
      addToCart(product, 1);
    }
  };

  return (
    <section className="hb" dir={hero.dir}>
      <style>{css}</style>

      {/* BANNIÈRE HERO */}
      <div className="hb-hero">
        <div className="hb-copy">
          <Leaf />
          <div className="hb-copy-inner">
            <h1>{hero.title}</h1>
            <p>{hero.description}</p>
            <Link to="/shop">
              <button type="button">{hero.cta}</button>
            </Link>
          </div>
        </div>

        <div className="hb-photo">
          <img src={bannerImg} alt={hero.title} />
        </div>

        <div className="hb-edge">
          <Leaf />
        </div>
      </div>

      {/* CATÉGORIES EN CERCLES CHEVAUCHANTS */}
      <ul className="hb-cats">
        {hero.categories.map(({ icon, label }) => (
          <li key={label}>
            <Link to="/shop" className="hb-cat">
              <span className="hb-circle">
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {icons[icon]}
                </svg>
              </span>
              <span className="hb-label">{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* SECTION MEILLEURES VENTES */}
      <section id="shop" className="py-12 md:py-20 px-4 sm:px-8 md:px-12 bg-[#f6f3ee] text-stone-900 relative mt-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif tracking-tight text-stone-900">
              Nos Meilleures Ventes
            </h2>

            {/* BOUTONS DE DÉFILEMENT DU CARROUSEL */}
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 border border-stone-300 flex items-center justify-center hover:border-stone-900 transition-colors cursor-pointer"
                aria-label="Précédent"
              >
                <svg className="w-4 h-4 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 bg-stone-900 text-white flex items-center justify-center hover:bg-stone-800 transition-opacity cursor-pointer"
                aria-label="Suivant"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* LISTE DES PRODUITS */}
          {loading ? (
            <div className="text-center py-12 text-stone-500 font-sans">Chargement des produits...</div>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {products.map((product) => {
                const productSlug = product.slug || product.id || product._id;

                return (
                  <div
                    key={product.id || product._id}
                    className="min-w-[240px] sm:min-w-[280px] md:min-w-[300px] flex-1 snap-start"
                  >
                    <Link
                      to={`/product/${productSlug}`}
                      className="group flex flex-col items-center text-center h-full"
                    >
                      {/* CONTENEUR DE L'IMAGE - AJUSTÉ POUR DES IMAGES LUMINEUSES ET SANS DÉCALAGE */}
                      <div className="relative w-full aspect-square bg-[#ded3c5] flex items-center justify-center overflow-hidden">
                        <img
                          src={getImageUrl(product.image_url)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* NOM DU PRODUIT */}
                      <h3 className="mt-4 px-2 text-xs sm:text-sm font-bold font-sans tracking-wider uppercase text-stone-900 line-clamp-1">
                        {product.name}
                      </h3>

                      {/* PRIX (Conserve la logique promo backend) */}
                      <div className="mt-1 font-sans text-xs sm:text-sm text-stone-400 font-semibold">
                        {product.has_promo ? (
                          <span className="inline-flex items-baseline gap-2">
                            <span className="line-through text-xs font-normal opacity-70">{product.original_price} DA</span>
                            <span className="text-[#e9a3a0]">{product.final_price} DA</span>
                          </span>
                        ) : (
                          <span>{product.original_price || product.price} DA</span>
                        )}
                      </div>

                      {/* BOUTON D'AJOUT AU PANIER */}
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="mt-4 w-full max-w-[180px] sm:max-w-[200px] py-2.5 bg-[#e9a3a0] text-white text-[10px] sm:text-xs font-bold font-sans tracking-widest uppercase hover:brightness-105 active:scale-98 transition-all cursor-pointer border-0 shadow-none"
                      >
                        {hero.addToCart}
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* AUTRES COMPOSANTS */}
      <PacksCarousel />
  
      
    </section>
  );
}

// FEUILLE DE STYLE DU COMPOSANT
const css = `
.hb{--dark:#2e2a2b;--cream:#f1ede7;--pink:#e9a3a0;--ink:#3a3536;--sand:#e6ddd3;
  font-family:'Cormorant Garamond','Playfair Display',Georgia,serif;width:100%;background:var(--cream);overflow:hidden}
.hb *{box-sizing:border-box}
.hb-hero{display:grid;grid-template-columns:1fr 1.05fr 5%;min-height:340px;background:var(--dark)}
.hb-copy{position:relative;display:flex;align-items:center;padding:clamp(28px,5vw,64px);color:var(--sand)}
.hb-copy .hb-orn{position:absolute;left:0;top:0;height:100%;width:auto;opacity:.12;color:#fff}
.hb-copy-inner{position:relative;max-width:420px}
.hb h1{margin:0 0 18px;font-weight:400;text-transform:uppercase;letter-spacing:.04em;line-height:1.12;font-size:clamp(30px,4.2vw,56px);color:#e9e1d8}
.hb p{margin:0 0 22px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:clamp(13px,1.3vw,15px);line-height:1.55;color:#d8cfc6;max-width:34ch}
.hb button{background:var(--pink);color:#fff;border:0;padding:9px 20px;font:600 12px 'Helvetica Neue',Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:filter .2s}
.hb button:hover{filter:brightness(1.07)}
.hb button:focus-visible,.hb-cat:focus-visible{outline:2px solid var(--pink);outline-offset:3px}
.hb-photo{position:relative;min-height:240px}
.hb-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.hb-edge{position:relative;background:var(--dark);color:#fff}
.hb-edge .hb-orn{position:absolute;inset:0;margin:auto;height:100%;width:100%;opacity:.12}
.hb-cats{list-style:none;margin:0;padding:0 clamp(12px,4vw,60px);display:flex;justify-content:center;gap:clamp(16px,6vw,90px);position:relative;top:-38px;margin-bottom:-38px;z-index:1}
.hb-cats li{flex:0 1 150px}
.hb-cat{display:flex;flex-direction:column;align-items:center;gap:10px;text-decoration:none;color:var(--ink)}
.hb-circle{display:grid;place-items:center;width:76px;height:76px;border-radius:50%;background:var(--cream);border:6px solid #e3dcd3;box-shadow:0 2px 8px rgba(0,0,0,.12);color:#6b6463;transition:transform .2s}
.hb-circle svg{width:34px;height:34px}
.hb-cat:hover .hb-circle{transform:translateY(-3px)}
.hb-label{font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;text-align:center;line-height:1.25}
.hb-cats+*{margin:0}
.hb{padding-bottom:22px}

@media (max-width:760px){
  .hb-hero{grid-template-columns:1.1fr 1fr 4%;min-height:250px}
  .hb-copy{padding:22px 12px 40px 16px}
  .hb h1{font-size:clamp(20px,6.4vw,32px);margin-bottom:10px}
  .hb p{font-size:11px;line-height:1.45;margin-bottom:14px}
  .hb button{padding:7px 12px;font-size:10px}
  .hb-photo{min-height:0}
  .hb-photo img{object-position:50% 55%}
  .hb-cats{gap:2px;padding:0 4px;top:-26px;margin-bottom:-26px;justify-style:space-between}
  .hb-cats li{flex:1 1 0;min-width:0}
  .hb-cat{gap:6px}
  .hb-circle{width:50px;height:50px;border-width:4px}
  .hb-circle svg{width:22px;height:22px}
  .hb-label{font-size:9.5px;overflow-wrap:anywhere}
}
@media (prefers-reduced-motion:reduce){.hb *{transition:none!important}}
`;