import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { API_URL } from '../config';

const fmt = (n) => `${Number(n || 0).toLocaleString('fr-FR')} DA`;

export default function PackDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Remonter en haut de la page au chargement
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Récupération des données du pack
  useEffect(() => {
    const fetchPack = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_URL}/packs/${id}`);
        setPack(res.data);
      } catch (err) {
        console.error('Erreur de chargement du pack :', err);
        setError('Impossible de charger ce pack promo.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPack();
  }, [id]);

  // Utilitaire d'image identique à Shop.jsx
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder.png';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    const filename = imageUrl.split('/').pop();
    const cleanBaseUrl = API_URL.replace(/\/(api|uploads)\/?$/, '');
    return `${cleanBaseUrl}/uploads/${filename}`;
  };

  const handleAddToCart = () => {
    if (!pack) return;
    const packItem = {
      ...pack,
      isPack: true,
      currentPrice: Number(pack.promo_price) > 0 ? Number(pack.promo_price) : Number(pack.original_price || 0)
    };
    addToCart(packItem, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#f8f5f1] pt-32 pb-24 flex items-center justify-center">
        <p className="text-stone-400 font-light text-xs tracking-widest uppercase animate-pulse">
          Chargement du pack d'exception...
        </p>
      </div>
    );
  }

  if (error || !pack) {
    return (
      <div className="w-full min-h-screen bg-[#f8f5f1] pt-32 pb-24 flex flex-col items-center justify-center px-4">
        <h2 className="font-serif text-2xl text-[#2e2a2b] mb-4 uppercase">Pack introuvable</h2>
        <p className="text-stone-500 text-xs mb-8 font-light text-center">{error || "Ce pack n'est plus disponible."}</p>
        <Link
          to="/shop"
          className="bg-[#2e2a2b] text-[#e6ddd3] px-8 py-3.5 text-xs uppercase tracking-[0.08em] font-medium hover:bg-[#3a3536] transition-colors"
        >
          Retourner à la boutique
        </Link>
      </div>
    );
  }

  const images = pack.images && pack.images.length > 0 ? pack.images : [pack.image_url];
  const hasPromo = Number(pack.promo_price) > 0;
  const currentPrice = hasPromo ? Number(pack.promo_price) : Number(pack.original_price || 0);

  return (
    <div className="w-full min-h-screen bg-[#f8f5f1] pt-24 md:pt-32 pb-24 font-sans text-[#2b2626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Navigation Fil d'Ariane */}
        <nav className="text-[10px] uppercase tracking-widest text-stone-400 mb-8 flex items-center gap-2">
          <Link to="/" className="hover:text-[#2b2626] transition-colors">Accueil</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#2b2626] transition-colors">Boutique</Link>
          <span>/</span>
          <span className="text-[#2b2626] font-medium truncate">{pack.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          {/* Galerie Images (Gauche) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[500px] scrollbar-none shrink-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 md:w-20 md:h-20 bg-white border p-2 transition-all cursor-pointer shrink-0 ${
                      selectedImage === idx ? 'border-[#2e2a2b]' : 'border-[#e3dcd3] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 bg-white border border-[#e3dcd3] p-8 relative flex items-center justify-center min-h-[380px] md:min-h-[500px]">
              <span className="absolute top-4 left-4 z-10 bg-[#e9a3a0] text-[#2b2626] text-[9px] font-bold tracking-widest uppercase px-3 py-1">
                Pack Offre Spéciale
              </span>
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={getImageUrl(images[selectedImage])}
                alt={pack.name}
                className="max-h-[420px] max-w-full object-contain"
              />
            </div>
          </div>

          {/* Informations Pack & Achat (Droite) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.2em] text-stone-400 block mb-2">
                Routine complète & Avantage Prix
              </span>
              <h1 className="text-2xl md:text-4xl font-serif tracking-tight text-[#2e2a2b] mb-4 font-normal uppercase">
                {pack.name}
              </h1>

              {/* Prix */}
              <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-[#e3dcd3]">
                <span className="text-2xl md:text-3xl font-bold text-[#2b2626]">
                  {fmt(currentPrice)}
                </span>
                {hasPromo && (
                  <span className="line-through text-sm md:text-base text-stone-400">
                    {fmt(pack.original_price)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-stone-600 font-light text-xs md:text-sm leading-relaxed mb-8">
                {pack.description || "Profitez de cette combinaison de soins sélectionnée pour offrir une synergie parfaite à votre peau à un tarif préférentiel."}
              </p>

              {/* Quantité & Bouton Ajouter */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">Quantité</span>
                  <div className="flex items-center border border-[#e3dcd3] bg-white">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3 py-2 text-stone-500 hover:text-[#2b2626] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-xs font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="px-3 py-2 text-stone-500 hover:text-[#2b2626] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-[#e9a3a0] text-white py-4 text-xs font-semibold uppercase tracking-[0.1em] hover:brightness-105 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  {added ? (
                    <>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Ajouté au panier !
                    </>
                  ) : (
                    'Ajouter le pack au panier'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section Produit(s) Inclus dans le Pack */}
        {Array.isArray(pack.products) && pack.products.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#e3dcd3]">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1">Composition</span>
              <h2 className="text-2xl font-serif text-[#2e2a2b] uppercase font-normal">
                Produits inclus dans ce coffret
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pack.products.map((prod) => (
                <div
                  key={prod.product_id || prod.id}
                  className="bg-white border border-[#e3dcd3] p-5 flex items-center gap-4"
                >
                  <div className="w-20 h-20 bg-[#f8f5f1] border border-[#e3dcd3] shrink-0 p-2 flex items-center justify-center">
                    <img
                      src={getImageUrl(prod.image_url)}
                      alt={prod.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm text-[#2e2a2b] font-normal uppercase mb-1 line-clamp-1">
                      {prod.name}
                    </h3>
                    <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">
                      Quantité : <strong className="text-[#2b2626] font-semibold">{prod.quantity || 1}</strong>
                    </p>
                    <span className="text-xs text-stone-500 line-through">
                      {fmt(prod.original_price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}