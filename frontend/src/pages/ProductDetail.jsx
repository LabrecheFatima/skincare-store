import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { API_URL } from '../config';

const fmt = (n) => `${Number(n || 0).toLocaleString('fr-FR')} DA`;

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // État local pour les avis clients
  const [reviews, setReviews] = useState([
    { id: 1, author: 'Amel B.', rating: 5, date: '14 Septembre 2026', comment: 'Résultats visibles dès les premières applications. Ma peau est nettement plus douce et hydratée.' },
    { id: 2, author: 'Sarra M.', rating: 4, date: '02 Septembre 2026', comment: 'Très bonne texture, pénètre rapidement sans laisser de film gras. Je recommande !' }
  ]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newAuthor, setNewAuthor] = useState('');

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        setLoading(true);
        setSelectedImageIndex(0);

        // 1. Récupération du produit
        const res = await axios.get(`${API_URL}/products/${id}`);
        const data = res.data.data || res.data;
        setProduct(data);

        // 2. Récupération des produits suggérés
        const allRes = await axios.get(`${API_URL}/products`);
        const allProds = allRes.data.data || allRes.data || [];
        const related = allProds.filter(p => p.id !== data.id && (p.category_id === data.category_id || p.category === data.category));
        setRelatedProducts(related.slice(0, 4));

      } catch (error) {
        console.error("Erreur de chargement du produit :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRelated();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Extraction de la liste complète d'images
  const getImagesList = () => {
    if (!product) return [];
    
    let list = [];
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      list = product.images.map(img => typeof img === 'string' ? img : (img.url || img.path));
    } else if (product.image_url) {
      list = [product.image_url];
    }

    if (product.gallery && Array.isArray(product.gallery)) {
      list = [...list, ...product.gallery];
    }

    return list.filter(Boolean);
  };

  const imagesList = getImagesList();

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder.png';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;

    const filename = imageUrl.split('/').pop();
    const cleanBaseUrl = API_URL.replace(/\/(api|uploads)\/?$/, '');
    return `${cleanBaseUrl}/uploads/${filename}`;
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2500);
    }
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !newAuthor.trim()) return;

    const reviewObj = {
      id: Date.now(),
      author: newAuthor,
      rating: Number(newRating),
      date: 'Aujourd\'hui',
      comment: newComment
    };

    setReviews([reviewObj, ...reviews]);
    setNewComment('');
    setNewAuthor('');
    setNewRating(5);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#f8f5f1] pt-32 pb-24 flex items-center justify-center font-sans text-stone-500 text-xs uppercase tracking-widest">
        Chargement de l'expérience soin...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full min-h-screen bg-[#f8f5f1] pt-32 pb-24 font-sans text-[#2b2626] flex items-center justify-center">
        <div className="text-center bg-[#f1ede7] p-10 border border-[#e3dcd3] max-w-md mx-auto">
          <h2 className="font-serif text-2xl font-normal text-[#2e2a2b] uppercase mb-3">Soin introuvable</h2>
          <p className="text-xs text-stone-600 font-light mb-6">Le produit recherché n'existe pas ou a été retiré.</p>
          <Link
            to="/shop"
            className="inline-block bg-[#e9a3a0] text-white text-xs px-6 py-3 uppercase tracking-[0.08em] font-semibold hover:brightness-105 transition-all"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = product.category_name || product.category?.name || product.category;
  const currentPrice = Number(product.has_promo ? product.final_price : (product.original_price || product.price || 0));

  return (
    <div className="w-full min-h-screen bg-[#f8f5f1] pb-20 font-sans text-[#2b2626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-6 md:pt-8">
        
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

        {/* SECTION PRINCIPALE PRODUIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start mb-16">
          
          {/* GALERIE PHOTOS MULTIPLES */}
          <div className="lg:col-span-7 space-y-4">
            {/* Conteneur avec fond blanc bg-white */}
            <div className="relative bg-white border border-[#e3dcd3] h-96 md:h-[500px] w-full flex items-center justify-center overflow-hidden group p-2">
              {product.has_promo && (
                <span className="absolute top-4 left-4 z-10 bg-[#e9a3a0] text-[#2b2626] text-[10px] font-bold tracking-wider uppercase px-3 py-1">
                  Promo
                </span>
              )}

              {imagesList.length > 0 ? (
                <motion.img
                  key={selectedImageIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={getImageUrl(imagesList[selectedImageIndex])}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-stone-400">
                  <span className="text-[10px] uppercase tracking-widest">Aucune image disponible</span>
                </div>
              )}

              {imagesList.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#2e2a2b]/85 text-[#e9e1d8] flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity z-10"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#2e2a2b]/85 text-[#e9e1d8] flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity z-10"
                  >
                    →
                  </button>
                </>
              )}
            </div>

            {imagesList.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {imagesList.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-20 h-20 bg-white border shrink-0 overflow-hidden transition-all ${
                      selectedImageIndex === index
                        ? 'border-[#e9a3a0] ring-1 ring-[#e9a3a0]'
                        : 'border-[#e3dcd3] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFORMATIONS & ACHAT */}
          <div className="lg:col-span-5 bg-[#2e2a2b] text-[#e6ddd3] p-6 md:p-8 space-y-6">
            <div>
              {categoryName && (
                <span className="text-[11px] text-[#a89f97] block mb-2">
                  Catégorie : {categoryName}
                </span>
              )}
              
              <h1 className="text-2xl md:text-4xl font-serif font-normal uppercase tracking-[0.04em] leading-tight text-[#e9e1d8] mb-3">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-[#e9a3a0] text-xs">
                  {'★'.repeat(5)}
                </div>
                <span className="text-[11px] text-[#a89f97]">({reviews.length} avis clients)</span>
              </div>

              <div className="flex items-baseline gap-3">
                {product.has_promo ? (
                  <>
                    <span className="text-xl md:text-2xl font-bold text-white">{fmt(product.final_price)}</span>
                    <span className="line-through text-sm text-[#a89f97]">{fmt(product.original_price)}</span>
                  </>
                ) : (
                  <span className="text-xl md:text-2xl font-bold text-white">
                    {fmt(product.original_price || product.price)}
                  </span>
                )}
              </div>
            </div>

            <p className="text-[13px] text-[#d8cfc6] leading-relaxed border-t border-white/10 pt-4">
              {product.description || 'Formule concentrée élaborée à partir d\'ingrédients rigoureusement sélectionnés pour apporter équilibre et vitalité.'}
            </p>

            {/* AVANTAGES LIVRAISON & QUALITÉ */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/10 text-[11px] text-[#c9bfb5]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e9a3a0] shrink-0" />
                <span>Livraison 58 Wilayas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e9a3a0] shrink-0" />
                <span>Ingrédients 100% testés</span>
              </div>
            </div>

            {/* BOUTON D'AJOUT AU PANIER */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#a89f97] font-medium">Quantité</span>
                <div className="flex items-center border border-white/25 px-3 py-1">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-6 h-6 flex items-center justify-center text-[#c9bfb5] hover:text-white text-sm font-medium"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-medium text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-6 h-6 flex items-center justify-center text-[#c9bfb5] hover:text-white text-sm font-medium"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-[#e9a3a0] text-white py-4 text-xs font-semibold uppercase tracking-[0.08em] hover:brightness-105 transition-all flex items-center justify-center gap-2"
              >
                <span>Ajouter au panier</span>
                <span>•</span>
                <span>{fmt(currentPrice * quantity)}</span>
              </button>

              {addedNotice && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] text-[#e9a3a0] text-center font-medium"
                >
                  ✓ Produit ajouté au panier avec succès !
                </motion.p>
              )}
            </div>

          </div>

        </div>

        {/* SECTION ONGLETS : CONSEILS D'UTILISATION ET COMPOSITION */}
        <div className="bg-[#f1ede7] border border-[#e3dcd3] p-6 md:p-10 mb-16">
          <div className="flex items-center gap-8 border-b border-[#ddd3c8] pb-4 mb-6">
            <button
              onClick={() => setActiveTab('description')}
              className={`text-xs uppercase tracking-[0.08em] font-semibold transition-colors pb-1 ${
                activeTab === 'description' ? 'text-[#2e2a2b] border-b-2 border-[#e9a3a0]' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              Conseils d'utilisation
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`text-xs uppercase tracking-[0.08em] font-semibold transition-colors pb-1 ${
                activeTab === 'ingredients' ? 'text-[#2e2a2b] border-b-2 border-[#e9a3a0]' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              Composition
            </button>
          </div>

          {activeTab === 'description' ? (
            <p className="text-[13px] text-stone-600 leading-relaxed">
              {product.conseil_utilisation || product.usage_instructions || product.how_to_use || 'Appliquer quotidiennement sur une peau propre et sèche. Masser délicatement par mouvements circulaires jusqu’à absorption complète.'}
            </p>
          ) : (
            <p className="text-[13px] text-stone-600 leading-relaxed">
              {product.composition || product.ingredients || 'Aqua, Glycerin, Botanical Extracts, Natural Oils, Tocopherol (Vitamin E).'}
            </p>
          )}
        </div>

        {/* SECTION AVIS CLIENTS */}
        <div className="bg-[#f1ede7] border border-[#e3dcd3] p-6 md:p-10 mb-16">
          <h3 className="font-serif text-2xl font-normal uppercase tracking-[0.04em] text-[#2e2a2b] mb-6">Avis & Expériences</h3>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form onSubmit={handleAddReview} className="lg:col-span-5 bg-white p-6 border border-[#e3dcd3] space-y-4">
              <span className="text-[11px] text-stone-500 font-medium block">
                Partagez votre avis
              </span>

              <input
                type="text"
                placeholder="Votre nom"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                className="w-full bg-white border border-[#ddd3c8] px-4 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#2e2a2b]"
                required
              />

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Note :</span>
                <select
                  value={newRating}
                  onChange={(e) => setNewRating(e.target.value)}
                  className="bg-white border border-[#ddd3c8] px-3 py-1.5 text-xs text-stone-800 focus:outline-none"
                >
                  <option value={5}>★★★★★ (5/5)</option>
                  <option value={4}>★★★★☆ (4/5)</option>
                  <option value={3}>★★★☆☆ (3/5)</option>
                </select>
              </div>

              <textarea
                placeholder="Votre commentaire sur l'efficacité, la texture..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full bg-white border border-[#ddd3c8] p-3 text-xs text-stone-800 focus:outline-none focus:border-[#2e2a2b]"
                required
              />

              <button
                type="submit"
                className="w-full bg-[#e9a3a0] text-white py-3 text-xs uppercase tracking-[0.08em] font-semibold hover:brightness-105 transition"
              >
                Publier mon avis
              </button>
            </form>

            <div className="lg:col-span-7 space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="border-b border-[#e3dcd3] pb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-[#2b2626]">{rev.author}</span>
                    <span className="text-[10px] text-stone-400">{rev.date}</span>
                  </div>
                  <div className="text-[#d9788d] text-xs mb-1">
                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                  </div>
                  <p className="text-[13px] text-stone-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION PRODUITS SIMILAIRES */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-[11px] text-stone-500 block mb-2">
                Complétez votre rituel
              </span>
              <h3 className="font-serif text-2xl font-normal uppercase tracking-[0.04em] text-[#2e2a2b]">Produits suggérés</h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/product/${rel.slug || rel.id}`}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="w-full aspect-[24/25] bg-white border border-[#e3dcd3] mb-3 overflow-hidden p-2">
                    <img
                      src={getImageUrl(rel.image_url || (rel.images && rel.images[0]))}
                      alt={rel.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-[#2b2626] mb-1 line-clamp-1">{rel.name}</h4>
                    <p className="text-xs font-bold text-[#2b2626]">
                      {fmt(rel.has_promo ? rel.final_price : (rel.original_price || rel.price))}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}