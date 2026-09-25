import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { API_URL } from '../config';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/products/${id}`);
        const data = res.data.data || res.data;
        setProduct(data);
      } catch (error) {
        console.error("Erreur de chargement du produit :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const getImagesList = () => {
    if (!product) return [];
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images.map(img => typeof img === 'string' ? img : img.url);
    }
    if (product.image_url) {
      return [product.image_url];
    }
    return [];
  };

  const imagesList = getImagesList();

  const getImageUrl = (imgSrc) => {
    if (!imgSrc) return '/placeholder.png';
    if (imgSrc.startsWith('http')) return imgSrc;
    return `${API_URL}/uploads/${imgSrc}`;
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#FBF9F5] pt-32 pb-24 flex items-center justify-center font-sans text-stone-400 text-xs uppercase tracking-widest">
        Chargement du soin...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full min-h-screen bg-[#FBF9F5] pt-32 pb-24 font-sans text-stone-800 flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-3xl border border-stone-200/60 max-w-md mx-auto">
          <h2 className="font-serif text-2xl font-normal text-stone-900 mb-3">Soin introuvable</h2>
          <p className="text-xs text-stone-500 font-light mb-6">Le produit recherché n'existe pas ou a été retiré.</p>
          <Link
            to="/shop"
            className="inline-block bg-stone-900 text-white text-xs px-6 py-3 rounded-full uppercase tracking-widest hover:bg-stone-800 transition-colors"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  // Récupération dynamique du nom de catégorie s'il existe
  const categoryName = product.category_name || product.category?.name || product.category;
  const currentPrice = Number(product.has_promo ? product.final_price : (product.original_price || product.price || 0));

  return (
    <div className="w-full min-h-screen bg-[#FBF9F5] pt-24 md:pt-28 pb-24 font-sans text-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        
        {/* Fil d'Ariane */}
        <div className="mb-8 flex items-center gap-2 text-xs font-light text-stone-400">
          <Link to="/" className="hover:text-stone-800 transition-colors">Accueil</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-stone-800 transition-colors">Boutique</Link>
          {categoryName && (
            <>
              <span>/</span>
              <span className="text-stone-400">{categoryName}</span>
            </>
          )}
          <span>/</span>
          <span className="text-stone-800 truncate font-normal">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* GALERIE PHOTOS */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative bg-white rounded-3xl border border-stone-200/60 h-80 sm:h-96 md:h-[450px] p-8 flex items-center justify-center overflow-hidden shadow-xs">
              {product.has_promo && (
                <span className="absolute top-4 left-4 z-10 bg-stone-900 text-white text-[9px] font-medium tracking-widest uppercase px-3.5 py-1 rounded-full">
                  Promo
                </span>
              )}

              {imagesList.length > 0 ? (
                <motion.img
                  key={selectedImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={getImageUrl(imagesList[selectedImageIndex])}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-stone-300">
                  <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[10px] uppercase tracking-widest">Aucune image disponible</span>
                </div>
              )}
            </div>

            {imagesList.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {imagesList.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-20 h-20 bg-white rounded-2xl border p-2 shrink-0 transition-all ${
                      selectedImageIndex === index
                        ? 'border-stone-900 ring-1 ring-stone-900'
                        : 'border-stone-200/60 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFORMATIONS DU PRODUIT */}
          <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-3xl border border-stone-200/60 shadow-xs space-y-6">
            <div>
              {/* CATEGORIE DU PRODUIT (SI DETERMINÉE) */}
              {categoryName && (
                <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium block mb-2">
                  Catégorie : {categoryName}
                </span>
              )}
              
              <h1 className="text-2xl md:text-3xl font-serif text-stone-900 font-normal tracking-tight mb-3">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3">
                {product.has_promo ? (
                  <>
                    <span className="text-xl md:text-2xl font-medium text-stone-900">{product.final_price} DA</span>
                    <span className="line-through text-sm text-stone-400">{product.original_price} DA</span>
                  </>
                ) : (
                  <span className="text-xl md:text-2xl font-medium text-stone-900">
                    {product.original_price || product.price} DA
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-stone-100 pt-5">
              <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-2 font-medium">
                Description & Bienfaits
              </span>
              <p className="text-xs text-stone-600 font-light leading-relaxed whitespace-pre-line">
                {product.description || 'Formule d\'exception élaborée pour prendre soin de votre peau au quotidien.'}
              </p>
            </div>

            {/* CONSEILS D'UTILISATION (OPTIONNELS) */}
            {(product.usage_instructions || product.how_to_use) && (
              <div className="border-t border-stone-100 pt-5">
                <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-2 font-medium flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Conseils d'utilisation
                </span>
                <p className="text-xs text-stone-600 font-light leading-relaxed bg-[#FBF9F5] p-4 rounded-2xl border border-stone-100 whitespace-pre-line">
                  {product.usage_instructions || product.how_to_use}
                </p>
              </div>
            )}

            {/* QUANTITÉ & BOUTON PANIER */}
            <div className="border-t border-stone-100 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">Quantité</span>
                <div className="flex items-center border border-stone-200 rounded-full bg-[#FBF9F5] px-3 py-1">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-6 h-6 flex items-center justify-center text-stone-500 hover:text-stone-900 text-sm font-medium"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-medium text-stone-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-6 h-6 flex items-center justify-center text-stone-500 hover:text-stone-900 text-sm font-medium"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-stone-900 text-white py-4 rounded-full text-xs font-medium uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>Ajouter au panier</span>
                <span>•</span>
                <span>{currentPrice * quantity} DA</span>
              </button>

              {addedNotice && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] text-emerald-700 text-center font-medium"
                >
                  ✓ Produit ajouté au panier avec succès !
                </motion.p>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}