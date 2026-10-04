import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { API_URL } from '../config';

const PACKS_CATEGORY = '__packs__';
const PAGE_STEP = 24; // nombre d'articles affichés à la fois

const fmt = (n) => `${Number(n || 0).toLocaleString('fr-FR')} DA`;

// Utility pour supprimer les accents et mettre en minuscules
const normalizeText = (text = '') =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

// Prix courant d'un article : produit (has_promo/final_price) ou pack (promo_price/original_price)
const getItemPrice = (item) => {
  if (item.isPack) {
    return Number(item.promo_price) > 0 ? Number(item.promo_price) : Number(item.original_price || item.price || 0);
  }
  return Number(item.has_promo ? item.final_price : (item.original_price || item.price || 0));
};

export default function Shop() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [packs, setPacks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // État de saisie directe et état de recherche (avec debounce)
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState(20000);
  const [maxProductPrice, setMaxProductPrice] = useState(20000);
  const [sortBy, setSortBy] = useState('default');
  const [visibleCount, setVisibleCount] = useState(PAGE_STEP);

  // Remonter tout en haut de la page au chargement du composant
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Déduction de la base d'URL du serveur pour servir les images (/uploads)
  const serverBaseUrl = API_URL.replace(/\/api\/?$/, '');

  // Debounce sur la barre de recherche pour une frappe ultra-fluide
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes, packsRes] = await Promise.all([
          axios.get(`${API_URL}/products?limit=1000`),
          axios.get(`${API_URL}/categories`).catch(() => ({ data: [] })),
          axios.get(`${API_URL}/packs`).catch(() => ({ data: [] }))
        ]);
        
        const prods = productsRes.data.data || productsRes.data || [];
        setProducts(prods);

        const packList = packsRes.data.data || packsRes.data || [];
        setPacks(Array.isArray(packList) ? packList : []);

        const allForMax = [
          ...prods.map(p => getItemPrice(p)),
          ...(Array.isArray(packList) ? packList : []).map(p => getItemPrice({ ...p, isPack: true })),
        ];

        if (allForMax.length > 0) {
          const maxP = Math.max(...allForMax);
          const roundedMax = Math.ceil(maxP / 1000) * 1000 || 20000;
          setMaxProductPrice(roundedMax);
          setPriceRange(roundedMax);
        }

        const cats = categoriesRes.data.data || categoriesRes.data || [];
        setCategories(cats);
      } catch (error) {
        console.error("Erreur de chargement du catalogue :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder.png';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;

    // On extrait uniquement le nom du fichier (ex: "1790449229445.webp")
    const filename = imageUrl.split('/').pop();

    // On retire à la fois /api ET /uploads s'ils sont présents à la fin de API_URL
    const cleanBaseUrl = API_URL.replace(/\/(api|uploads)\/?$/, '');

    return `${cleanBaseUrl}/uploads/${filename}`;
  };

  // Liste unifiée : produits + packs (chaque article a une clé unique, un prix et un lien)
  const allItems = useMemo(() => {
    const productItems = products.map(p => ({
      ...p,
      isPack: false,
      key: `product-${p.id}`,
      link: `/product/${p.slug || p.id}`,
      currentPrice: getItemPrice(p),
      onPromo: Boolean(p.has_promo),
    }));
    const packItems = packs.map(p => {
      const item = { ...p, isPack: true };
      return {
        ...item,
        key: `pack-${p.id}`,
        link: `/pack/${p.slug || p.id}`,
        currentPrice: getItemPrice(item),
        onPromo: Number(p.promo_price) > 0,
      };
    });
    return [...productItems, ...packItems];
  }, [products, packs]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);

    return allItems
      .filter(item => {
        // Recherche insensible aux accents et à la casse
        const matchName = normalizeText(item.name).includes(normalizedQuery);

        let matchCategory;
        if (selectedCategory === 'all') {
          matchCategory = true;
        } else if (selectedCategory === PACKS_CATEGORY) {
          matchCategory = item.isPack;
        } else {
          // Produits ET packs : même catégorie (par id ou par slug)
          matchCategory =
            (item.category_id != null && Number(item.category_id) === Number(selectedCategory)) ||
            (item.category_slug != null && item.category_slug === selectedCategory);
        }

        const matchPrice = item.currentPrice <= priceRange;

        return matchName && matchCategory && matchPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.currentPrice - b.currentPrice;
        if (sortBy === 'price-desc') return b.currentPrice - a.currentPrice;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        return 0;
      });
  }, [allItems, searchQuery, selectedCategory, priceRange, sortBy]);

  // Quand les filtres changent, on revient aux premiers articles
  useEffect(() => {
    setVisibleCount(PAGE_STEP);
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  const visibleItems = filteredProducts.slice(0, visibleCount);

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange(maxProductPrice);
    setSortBy('default');
  };

  // Élément JSX (et non un composant interne) : le champ de recherche n'est plus recréé à chaque frappe
  const filterContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8 relative">
          <span className="text-[10px] uppercase tracking-widest text-stone-500 block mb-1.5 font-medium">Recherche</span>
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un soin (Sérum, Crème, Masque)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-white border border-[#e3dcd3] px-4 py-3 text-xs text-[#2b2626] placeholder-stone-400 focus:outline-none focus:border-[#2e2a2b] transition-colors"
            />
            <svg className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="md:col-span-4">
          <span className="text-[10px] uppercase tracking-widest text-stone-500 block mb-1.5 font-medium">Trier par</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-white border border-[#e3dcd3] px-4 py-3 text-xs text-[#2b2626] focus:outline-none focus:border-[#2e2a2b] cursor-pointer"
          >
            <option value="default">Sélection & Pertinence</option>
            <option value="price-asc">Prix : Croissant</option>
            <option value="price-desc">Prix : Décroissant</option>
            <option value="name-asc">Nom : A à Z</option>
            <option value="name-desc">Nom : Z à A</option>
          </select>
        </div>
      </div>

      <div className="border-t border-[#e3dcd3] my-2" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">
              Budget max : <strong className="text-[#2b2626] font-semibold">{fmt(priceRange)}</strong>
            </span>
            <span className="text-[10px] text-stone-400">Plafond : {fmt(maxProductPrice)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={maxProductPrice}
            step="200"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full accent-[#e9a3a0] cursor-pointer h-1.5 bg-[#e3dcd3]"
          />
        </div>

        <div className="md:col-span-4 flex justify-start md:justify-end">
          <button
            onClick={handleResetFilters}
            className="text-xs text-stone-500 hover:text-[#2b2626] underline underline-offset-4 tracking-wide transition-colors cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      <div>
        <span className="text-[10px] uppercase tracking-widest text-stone-500 block mb-2.5 font-medium">Catégories</span>
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 text-xs transition-all whitespace-nowrap uppercase tracking-wider cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#2e2a2b] text-[#e6ddd3]'
                : 'bg-white text-stone-600 hover:bg-[#f1ede7] border border-[#e3dcd3]'
            }`}
          >
            Toutes ({allItems.length})
          </button>
          {packs.length > 0 && (
            <button
              onClick={() => setSelectedCategory(PACKS_CATEGORY)}
              className={`px-5 py-2.5 text-xs transition-all whitespace-nowrap uppercase tracking-wider cursor-pointer ${
                selectedCategory === PACKS_CATEGORY
                  ? 'bg-[#2e2a2b] text-[#e6ddd3]'
                  : 'bg-white text-stone-600 hover:bg-[#f1ede7] border border-[#e3dcd3]'
              }`}
            >
              Packs ({packs.length})
            </button>
          )}
          {categories.map((cat) => {
            const catId = cat.id || cat.slug;
            return (
              <button
                key={catId}
                onClick={() => setSelectedCategory(catId)}
                className={`px-5 py-2.5 text-xs transition-all whitespace-nowrap uppercase tracking-wider cursor-pointer ${
                  selectedCategory === catId
                    ? 'bg-[#2e2a2b] text-[#e6ddd3]'
                    : 'bg-white text-stone-600 hover:bg-[#f1ede7] border border-[#e3dcd3]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#f8f5f1] pt-24 md:pt-28 pb-24 font-sans text-[#2b2626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
          <span className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.2em] text-stone-400 block mb-2 md:mb-3">
            Exploration
          </span>
          <h1 className="text-3xl md:text-5xl font-serif tracking-tight text-[#2e2a2b] mb-3 md:mb-4 font-normal uppercase">
            Boutique & Soins
          </h1>
          <p className="text-stone-600 font-light text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
            Des formulations d'exception conçues pour révéler la beauté naturelle de votre peau.
          </p>
        </div>

        {/* Barre de recherche et bouton de filtre mobile */}
        <div className="md:hidden mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-white border border-[#e3dcd3] px-4 py-2.5 text-xs text-[#2b2626] focus:outline-none focus:border-[#2e2a2b]"
            />
            <svg className="w-4 h-4 text-stone-400 absolute right-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="bg-[#2e2a2b] text-[#e6ddd3] text-xs px-4 py-2.5 flex items-center gap-2 font-medium uppercase tracking-wider shrink-0 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtres
          </button>
        </div>

        {/* Bloc filtre bureau */}
        <div className="hidden md:block bg-[#f1ede7] p-6 border border-[#e3dcd3] mb-12">
          {filterContent}
        </div>

        {/* Offcanvas Filtre Mobile */}
        <AnimatePresence>
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileFilterOpen(false)}
                className="absolute inset-0 bg-[#2e2a2b]/60 backdrop-blur-xs"
              />

              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full bg-[#f8f5f1] mt-auto p-6 max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col justify-between border-t border-[#e3dcd3]"
              >
                <div>
                  <div className="flex justify-between items-center mb-6 pb-3 border-b border-[#e3dcd3]">
                    <h3 className="font-serif text-lg font-normal uppercase text-[#2e2a2b]">Filtres de recherche</h3>
                    <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="p-2 text-stone-500 hover:text-[#2e2a2b] cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {filterContent}
                </div>

                <div className="pt-6 mt-6 border-t border-[#e3dcd3] flex gap-3">
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-full bg-[#e9a3a0] text-white py-3 text-xs font-semibold uppercase tracking-[0.08em] cursor-pointer"
                  >
                    Voir les ({filteredProducts.length}) résultats
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="mb-6 px-1 flex items-center justify-between">
          <p className="text-xs text-stone-500 tracking-wide">
            <span className="font-semibold text-[#2b2626]">{filteredProducts.length}</span> article(s) disponible(s)
          </p>
        </div>

        {loading ? (
          <div className="text-center py-24 text-stone-400 font-light text-xs tracking-widest uppercase">
            Chargement de la collection...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-[#f1ede7] border border-[#e3dcd3] p-8 max-w-md mx-auto">
            <p className="text-stone-600 font-light text-xs mb-6">Aucun article ne correspond à ces critères de recherche.</p>
            <button
              onClick={handleResetFilters}
              className="bg-[#e9a3a0] text-white px-6 py-3 text-xs uppercase tracking-[0.08em] font-semibold hover:brightness-105 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              Effacer les filtres
            </button>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <AnimatePresence>
              {visibleItems.map((product) => (
                <motion.div
                  key={product.key}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-[#e3dcd3] overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all duration-300"
                >
                  <div className="relative">
                    {product.onPromo ? (
                      <span className="absolute top-4 left-4 z-10 bg-[#e9a3a0] text-[#2b2626] text-[9px] font-bold tracking-widest uppercase px-3 py-1">
                        {product.isPack ? 'Pack Promo' : 'Promo'}
                      </span>
                    ) : (
                      <span className="absolute top-4 left-4 z-10 bg-[#2e2a2b]/80 text-[#e6ddd3] text-[9px] font-medium tracking-widest uppercase px-3 py-1">
                        {product.isPack ? 'Pack' : 'Soin'}
                      </span>
                    )}

                    <Link to={product.link} className="block h-64 md:h-72 p-6 bg-white border-b border-[#e3dcd3] flex items-center justify-center overflow-hidden">
                      <img
                        src={getImageUrl(product.image_url)}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out p-2"
                      />
                    </Link>
                  </div>

                  <div className="p-5 md:p-6 flex flex-col justify-between flex-1 bg-[#f1ede7]/50">
                    <div className="mb-4">
                      <h3 className="font-serif text-base md:text-lg text-[#2e2a2b] mb-1.5 line-clamp-1 font-normal uppercase">
                        <Link to={product.link} className="hover:text-[#e9a3a0] transition-colors">
                          {product.name}
                        </Link>
                      </h3>
                      <p className="text-xs text-stone-500 font-light leading-relaxed line-clamp-2">
                        {product.description || (product.isPack
                          ? 'Une routine soin complète à prix préférentiel.'
                          : 'Formule concentrée pour régénérer et apaiser la peau en profondeur.')}
                      </p>
                      {product.isPack && Array.isArray(product.products) && product.products.length > 0 && (
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-2">
                          {product.products.length} produit(s) inclus
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#e3dcd3] mt-auto">
                      <div>
                        {product.onPromo ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm md:text-base font-bold text-[#2b2626]">{fmt(product.currentPrice)}</span>
                            <span className="line-through text-xs text-stone-400">{fmt(product.original_price)}</span>
                          </div>
                        ) : (
                          <span className="text-sm md:text-base font-bold text-[#2b2626]">
                            {fmt(product.currentPrice)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(product, 1)}
                        className="bg-[#e9a3a0] text-white p-2.5 md:p-3 hover:brightness-105 transition-all group-hover:scale-105 flex items-center justify-center cursor-pointer"
                        title="Ajouter au panier"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {visibleCount < filteredProducts.length && (
            <div className="text-center mt-10">
              <button
                onClick={() => setVisibleCount(count => count + PAGE_STEP)}
                className="bg-[#2e2a2b] text-[#e6ddd3] px-8 py-3.5 text-xs uppercase tracking-[0.08em] font-medium hover:bg-[#3a3536] transition-colors cursor-pointer"
              >
                Voir plus ({filteredProducts.length - visibleCount} restants)
              </button>
            </div>
          )}
          </>
        )}

      </div>
    </div>
  );
}