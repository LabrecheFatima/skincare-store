import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { API_URL } from '../config';

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  // ÉTAT DU FORMULAIRE DE COMMANDE
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    wilaya: '',
    commune: '',
    address: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_URL}/uploads/${imageUrl}`;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Structure de la commande à envoyer à l'API Backend
      const orderPayload = {
        customer: formData,
        items: cart,
        totalAmount: getCartTotal(),
        createdAt: new Date().toISOString()
      };

      // Remplacer par votre appel axios réel :
      // await axios.post(`${API_URL}/api/orders`, orderPayload);

      console.log("Commande envoyée :", orderPayload);
      setOrderPlaced(true);
      clearCart();
    } catch (error) {
      console.error("Erreur lors de la validation de la commande :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. ÉCRAN SI LE PANIER EST VIDE
  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="w-full min-h-screen bg-[#FBF9F5] pt-28 pb-24 font-sans text-stone-800 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 text-center">
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-stone-200/60 shadow-xs">
            <div className="w-16 h-16 bg-[#FBF9F5] text-stone-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 block mb-2 font-medium">
              Votre Panier
            </span>
            <h2 className="text-2xl font-serif text-stone-900 font-normal mb-3">
              Votre panier est vide
            </h2>
            <p className="text-stone-500 font-light text-xs leading-relaxed mb-8">
              Découvrez nos soins dermatologiques et ajoutez des articles pour finaliser votre commande.
            </p>

            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 w-full bg-stone-900 text-white py-3.5 px-6 rounded-full text-xs font-medium uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xs"
            >
               Explorer la Boutique
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. ÉCRAN DE CONFIRMATION DE COMMANDE
  if (orderPlaced) {
    return (
      <div className="w-full min-h-screen bg-[#FBF9F5] pt-28 pb-24 font-sans text-stone-800 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 md:p-10 rounded-3xl border border-stone-200/60 shadow-xs"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-800 block mb-2 font-medium">
              Merci pour votre confiance
            </span>
            <h2 className="text-2xl font-serif text-stone-900 font-normal mb-3">
              Commande Confirmée
            </h2>
            <p className="text-stone-500 font-light text-xs leading-relaxed mb-8">
              Nous avons bien reçu votre commande. Notre équipe vous contactera par téléphone pour confirmer la livraison.
            </p>

            <button
              onClick={() => navigate('/shop')}
              className="w-full bg-stone-900 text-white py-3.5 px-6 rounded-full text-xs font-medium uppercase tracking-widest hover:bg-stone-800 transition-all"
            >
              Retour à la Boutique
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // 3. PAGE CHECKOUT PRINCIPALE (Formulaire + Récapitulatif)
  return (
    <div className="w-full min-h-screen bg-[#FBF9F5] pt-24 md:pt-28 pb-24 font-sans text-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        
        {/* En-tête */}
        <div className="text-center max-w-xl mx-auto mb-10 md:mb-14">
          <span className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.2em] text-stone-400 block mb-2">
            Finalisation
          </span>
          <h1 className="text-3xl md:text-4xl font-serif text-stone-900 font-normal tracking-tight">
            Valider la Commande
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* FORMULAIRE D'EXPÉDITION (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-stone-200/60 shadow-xs">
            <h2 className="font-serif text-xl text-stone-900 font-normal mb-6 pb-4 border-b border-stone-100">
              Informations de Livraison
            </h2>

            <form onSubmit={handleSubmitOrder} className="space-y-5">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1.5 font-medium">
                  Nom & Prénom *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Ex: Amina Benali"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-[#FBF9F5] border border-stone-200 rounded-2xl px-4 py-3 text-xs text-stone-800 focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1.5 font-medium">
                    Numéro de Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="06XX XX XX XX"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-[#FBF9F5] border border-stone-200 rounded-2xl px-4 py-3 text-xs text-stone-800 focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1.5 font-medium">
                    Wilaya *
                  </label>
                  <input
                    type="text"
                    name="wilaya"
                    required
                    placeholder="Ex: Alger"
                    value={formData.wilaya}
                    onChange={handleInputChange}
                    className="w-full bg-[#FBF9F5] border border-stone-200 rounded-2xl px-4 py-3 text-xs text-stone-800 focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1.5 font-medium">
                  Adresse exacte de livraison *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="Rue, Bâtiment, Quartier..."
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-[#FBF9F5] border border-stone-200 rounded-2xl px-4 py-3 text-xs text-stone-800 focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1.5 font-medium">
                  Note ou instruction spéciale (Optionnel)
                </label>
                <textarea
                  name="notes"
                  rows="3"
                  placeholder="Ex: Appeler avant la livraison..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full bg-[#FBF9F5] border border-stone-200 rounded-2xl px-4 py-3 text-xs text-stone-800 focus:outline-none focus:border-stone-900 transition-colors resize-none"
                />
              </div>

              {/* Mode de paiement fixe (Paiement à la livraison) */}
              <div className="pt-2">
                <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-2 font-medium">
                  Mode de Paiement
                </span>
                <div className="bg-[#FBF9F5] border border-stone-200/80 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-stone-900 rounded-full" />
                    <span className="text-xs font-medium text-stone-900">Paiement en espèces à la livraison</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-stone-400">Main à main</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-stone-900 text-white py-4 rounded-full text-xs font-medium uppercase tracking-widest hover:bg-stone-800 transition-all mt-6 shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Traitement en cours...' : 'Confirmer la Commande'}
              </button>
            </form>
          </div>

          {/* RÉCAPITULATIF DU PANIER (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-3xl border border-stone-200/60 shadow-xs space-y-6">
            <h2 className="font-serif text-xl text-stone-900 font-normal pb-4 border-b border-stone-100 flex items-center justify-between">
              <span>Récapitulatif</span>
              <span className="text-xs font-sans text-stone-400 font-light">({cart.length} article{cart.length > 1 ? 's' : ''})</span>
            </h2>

            {/* Liste des articles */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1 scrollbar-none">
              {cart.map((item) => {
                const itemPrice = Number(item.has_promo ? item.final_price : (item.original_price || item.price || 0));
                return (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-stone-100 last:border-0 last:pb-0">
                    <div className="w-16 h-16 bg-[#FDFBF7] rounded-2xl border border-stone-100 flex items-center justify-center p-2 shrink-0">
                      <img
                        src={getImageUrl(item.image_url)}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm text-stone-900 truncate font-normal">{item.name}</h4>
                      <p className="text-xs text-stone-400 font-light">Qté : {item.quantity}</p>
                    </div>
                    <span className="text-xs font-medium text-stone-900 shrink-0">
                      {itemPrice * item.quantity} DA
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-stone-100 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-stone-500 font-light">
                <span>Sous-total</span>
                <span>{getCartTotal()} DA</span>
              </div>
              <div className="flex justify-between text-xs text-stone-500 font-light">
                <span>Frais de livraison</span>
                <span className="text-stone-400 italic">Calculés à la confirmation</span>
              </div>
              <div className="flex justify-between text-base font-medium text-stone-900 pt-3 border-t border-stone-100">
                <span>Total</span>
                <span>{getCartTotal()} DA</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}