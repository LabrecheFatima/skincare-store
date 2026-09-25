import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { API_URL } from '../config';

export default function Shop() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ÉTAT DU TIROIR DE FILTRES EN MOBILE
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // FILTRES
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState(20000);
  const [maxProductPrice, setMaxProductPrice] = useState(20000);
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/api/products`),
          axios.get(`${API_URL}/api/categories`).catch(() => ({ data: [] }))
        ]);
        
        const prods = productsRes.data.data || productsRes.data || [];
        setProducts(prods);

        if (prods.length > 0) {
          const maxP = Math.max(...prods.map(p => Number(p.has_promo ? p.final_price : (p.original_price || p.price || 0))));
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

  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        const matchName = product.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
        const matchCategory = selectedCategory === 'all' || 
          product.category_id === Number(selectedCategory) || 
          product.category_slug === selectedCategory;

        const currentPrice = Number(product.has_promo ? product.final_price : (product.original_price || product.price));
        const matchPrice = currentPrice <= priceRange;

        return matchName && matchCategory && matchPrice;
      })
      .sort((a, b) => {
        const priceA = Number(a.has_promo ? a.final_price : (a.original_price || a.price));
        const priceB = Number(b.has_promo ? b.final_price : (b.original_price || b.price));

        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        return 0;
      });
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange(maxProductPrice);
    setSortBy('default');
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_URL}/uploads/${imageUrl}`;
  };

  // COMPOSANT CONTENU DES FILTRES (RÉUTILISÉ DANS DESKTOP ET MOBILE)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Recherche & Tri */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8 relative">
          <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1.5 font-medium">Recherche</span>
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un soin (Sérum, Crème, Masque)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FBF9F5] border border-stone-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
            />
            <svg className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="md:col-span-4">
          <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1.5 font-medium">Trier par</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-[#FBF9F5] border border-stone-200 rounded-2xl px-4 py-3 text-xs text-stone-700 focus:outline-none focus:border-stone-900 cursor-pointer"
          >
            <option value="default">Sélection & Pertinence</option>
            <option value="price-asc">Prix : Croissant</option>
            <option value="price-desc">Prix : Décroissant</option>
            <option value="name-asc">Nom : A à Z</option>
            <option value="name-desc">Nom : Z à A</option>
          </select>
        </div>
      </div>

      <div className="border-t border-stone-100 my-2" />

      {/* Budget Max & Reset */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">
              Budget max : <strong className="text-stone-900 font-normal">{priceRange} DA</strong>
            </span>
            <span className="text-[10px] text-stone-400">Plafond : {maxProductPrice} DA</span>
          </div>
          <input
            type="range"
            min="0"
            max={maxProductPrice}
            step="200"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full accent-stone-900 cursor-pointer h-1.5 bg-stone-100 rounded-lg"
          />
        </div>

        <div className="md:col-span-4 flex justify-start md:justify-end">
          <button
            onClick={handleResetFilters}
            className="text-xs text-stone-400 hover:text-stone-900 underline underline-offset-4 tracking-wide transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      {/* Catégories */}
      <div>
        <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-2.5 font-medium">Catégories</span>
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-full text-xs transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-[#FBF9F5] text-stone-600 hover:bg-stone-200/60 border border-stone-200/60'
            }`}
          >
            Toutes ({products.length})
          </button>
          {categories.map((cat) => {
            const catId = cat.id || cat.slug;
            return (
              <button
                key={catId}
                onClick={() => setSelectedCategory(catId)}
                className={`px-5 py-2.5 rounded-full text-xs transition-all whitespace-nowrap ${
                  selectedCategory === catId
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-[#FBF9F5] text-stone-600 hover:bg-stone-200/60 border border-stone-200/60'
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
    <div className="w-full min-h-screen bg-[#FBF9F5] pt-24 md:pt-28 pb-24 font-sans text-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        
        {/* En-tête */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
          <span className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.2em] text-stone-400 block mb-2 md:mb-3">
            Exploration
          </span>
          <h1 className="text-3xl md:text-5xl font-serif tracking-tight text-stone-900 mb-3 md:mb-4 font-normal">
            Boutique & Soins
          </h1>
          <p className="text-stone-500 font-light text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
            Des formulations d'exception conçues pour révéler la beauté naturelle de votre peau.
          </p>
        </div>

        {/* --- BARRE COMPACTE EN MOBILE --- */}
        <div className="md:hidden mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-full pl-9 pr-4 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-stone-900"
            />
            <svg className="w-4 h-4 text-stone-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="bg-stone-900 text-white text-xs px-4 py-2.5 rounded-full flex items-center gap-2 font-medium shrink-0 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtres
          </button>
        </div>

        {/* --- FILTRES SUR DESKTOP (caché sur mobile) --- */}
        <div className="hidden md:block bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-stone-200/60 shadow-xs mb-12">
          <FilterContent />
        </div>

        {/* --- MODAL / DRAWER DE FILTRES POUR MOBILE --- */}
        <AnimatePresence>
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex justify-end">
              {/* Backdrop flouté */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileFilterOpen(false)}
                className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs"
              />

              {/* Panel glissant vers le haut / côté */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full bg-white rounded-t-3xl mt-auto p-6 max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-6 pb-3 border-b border-stone-100">
                    <h3 className="font-serif text-lg font-normal text-stone-900">Filtres de recherche</h3>
                    <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="p-2 rounded-full hover:bg-stone-100 text-stone-500"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <FilterContent />
                </div>

                <div className="pt-6 mt-6 border-t border-stone-100 flex gap-3">
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-full bg-stone-900 text-white py-3 rounded-full text-xs font-medium uppercase tracking-widest"
                  >
                    Voir les ({filteredProducts.length}) résultats
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Compteur */}
        <div className="mb-6 px-1 flex items-center justify-between">
          <p className="text-xs text-stone-400 tracking-wide">
            <span className="font-medium text-stone-800">{filteredProducts.length}</span> produit(s) disponible(s)
          </p>
        </div>

        {/* GRILLE PRODUITS */}
        {loading ? (
          <div className="text-center py-24 text-stone-400 font-light text-xs tracking-widest uppercase">
            Chargement de la collection...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/60 p-8">
            <p className="text-stone-500 font-light text-sm mb-6">Aucun soin ne correspond à ces critères de recherche.</p>
            <button
              onClick={handleResetFilters}
              className="bg-stone-900 text-white px-6 py-3 rounded-full text-xs uppercase tracking-widest hover:bg-stone-800 transition-all inline-flex items-center gap-2"
            >
              Effacer les filtres
            </button>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={product.id}
                  className="bg-white rounded-3xl border border-stone-200/60 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="relative">
                    {product.has_promo ? (
                      <span className="absolute top-4 left-4 z-10 bg-stone-900 text-white text-[9px] font-medium tracking-widest uppercase px-3 py-1 rounded-full">
                        Promo
                      </span>
                    ) : (
                      <span className="absolute top-4 left-4 z-10 bg-stone-100/90 text-stone-700 text-[9px] font-medium tracking-widest uppercase px-3 py-1 rounded-full backdrop-blur-xs">
                        Soin
                      </span>
                    )}

                    <Link to={`/product/${product.slug || product.id}`} className="block h-64 md:h-72 p-6 md:p-8 bg-[#FDFBF7] flex items-center justify-center overflow-hidden">
                      <img
                        src={getImageUrl(product.image_url)}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    </Link>
                  </div>

                  <div className="p-5 md:p-6 flex flex-col justify-between flex-1 bg-white">
                    <div className="mb-4">
                      <h3 className="font-serif text-base md:text-lg text-stone-900 mb-1.5 line-clamp-1 font-normal">
                        <Link to={`/product/${product.slug || product.id}`} className="hover:text-stone-600 transition-colors">
                          {product.name}
                        </Link>
                      </h3>
                      <p className="text-xs text-stone-400 font-light leading-relaxed line-clamp-2">
                        {product.description || 'Formule concentrée pour régénérer et apaiser la peau en profondeur.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-stone-100 mt-auto">
                      <div>
                        {product.has_promo ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm md:text-base font-medium text-stone-900">{product.final_price} DA</span>
                            <span className="line-through text-xs text-stone-400">{product.original_price} DA</span>
                          </div>
                        ) : (
                          <span className="text-sm md:text-base font-medium text-stone-900">
                            {product.original_price || product.price} DA
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(product, 1)}
                        className="bg-stone-900 text-white rounded-full p-2.5 md:p-3 hover:bg-stone-800 transition-colors group-hover:scale-105 flex items-center justify-center"
                        title="Ajouter au panier"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

      </div>
    </div>
  );
}