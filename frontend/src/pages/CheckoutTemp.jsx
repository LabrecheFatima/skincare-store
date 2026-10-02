import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { API_URL } from '../config';

export default function Checkout() {
  const { cart, clearCart, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Configuration dynamique de la livraison reçue du backend
  const [shippingEnabled, setShippingEnabled] = useState(false);
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedShippingCost, setSelectedShippingCost] = useState(0);

  // Formulaire client
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

  // 1. Charger la configuration et les wilayas actives depuis le backend
  useEffect(() => {
    axios.get(`${API_URL}/shipping-rates`)
      .then(res => {
        const data = res.data || {};
        setShippingEnabled(Boolean(data.shipping_enabled));
        setShippingRates(data.rates || []);
      })
      .catch(err => {
        console.error("Erreur chargement frais de livraison:", err);
      });
  }, []);

  // 2. Mise à jour du formulaire & calcul auto du tarif au changement de wilaya
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'wilaya' && shippingEnabled) {
      const match = shippingRates.find(r => r.wilaya_name === value);
      setSelectedShippingCost(match ? Number(match.price) : 0);
    }
  };

  const getImageUrl = (item) => {
    if (!item) return '/placeholder.png';

    let rawImg = item.image_url;
    if (!rawImg && item.images && item.images.length > 0) {
      rawImg = typeof item.images[0] === 'string' ? item.images[0] : (item.images[0].url || item.images[0].path);
    }

    if (!rawImg) return '/placeholder.png';
    if (rawImg.startsWith('http://') || rawImg.startsWith('https://')) return rawImg;

    const fileName = rawImg.split('/').pop();
    const cleanBaseUrl = API_URL.replace(/\/(api|uploads)\/?$/, '');
    return `${cleanBaseUrl}/uploads/${fileName}`;
  };

  // Calcul dynamique du sous-total basé uniquement sur le contenu actuel du panier
  const subtotal = cart.reduce((sum, item) => {
    const p = Number(item.has_promo ? item.final_price : (item.promo_price ?? item.price ?? item.original_price ?? 0));
    const q = item.qty || item.quantity || 1;
    return sum + (p * q);
  }, 0);

  const grandTotal = subtotal + (shippingEnabled ? selectedShippingCost : 0);

  // Soumission de la commande
  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Votre panier est vide.");
      return;
    }

    if (shippingEnabled && !formData.wilaya) {
      alert("Veuillez sélectionner une wilaya de livraison.");
      return;
    }

    setIsSubmitting(true);

    try {
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const orderPayload = {
        customer_first_name: firstName,
        customer_last_name: lastName,
        customer_phone: formData.phone,
        wilaya: shippingEnabled ? formData.wilaya : 'N/A',
        commune: formData.commune || 'Centre',
        delivery_address: formData.address,
        notes: formData.notes,
        shipping_fee: shippingEnabled ? selectedShippingCost : 0,
        total_price: grandTotal,
        // Envoie uniquement les articles présents dans l'état React à l'instant T
        items: cart.map(item => ({
          id: item.id || item.product_id,
          qty: item.qty || item.quantity || 1,
          price: Number(item.has_promo ? item.final_price : (item.promo_price ?? item.price ?? item.original_price ?? 0))
        }))
      };

      await axios.post(`${API_URL}/orders`, orderPayload);

      setOrderPlaced(true);
      if (clearCart) clearCart();
    } catch (error) {
      console.error("Erreur lors de la validation de la commande :", error);
      alert("Une erreur est survenue lors de l'enregistrement de votre commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="w-full min-h-screen bg-[#FBF9F5] pt-28 pb-24 font-sans text-stone-800 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 text-center">
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-stone-200/60 shadow-xs">
            <h2 className="text-2xl font-serif text-stone-900 font-normal mb-3">Votre panier est vide</h2>
            <Link to="/shop" className="inline-flex items-center justify-center gap-2 w-full bg-stone-900 text-white py-3.5 px-6 rounded-full text-xs font-medium uppercase tracking-widest mt-4">
              Explorer la Boutique
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="w-full min-h-screen bg-[#FBF9F5] pt-28 pb-24 font-sans text-stone-800 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-3xl border border-stone-200/60 shadow-xs">
            <h2 className="text-2xl font-serif text-stone-900 mb-3">Commande Confirmée !</h2>
            <p className="text-stone-500 font-light text-xs mb-8">Nous vous contacterons très prochainement par téléphone pour valider l'expédition.</p>
            <button onClick={() => navigate('/shop')} className="w-full bg-stone-900 text-white py-3.5 px-6 rounded-full text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors">
              Retourner à la Boutique
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FBF9F5] pt-24 md:pt-28 pb-24 font-sans text-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* FORMULAIRE DE LIVRAISON */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-stone-200/60 shadow-xs">
            <h2 className="font-serif text-xl text-stone-900 mb-6 pb-4 border-b border-stone-100">Informations de Livraison</h2>

            <form onSubmit={handleSubmitOrder} className="space-y-5">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1.5 font-medium">Nom & Prénom *</label>
                <input 
                  type="text" 
                  name="fullName" 
                  required 
                  placeholder="Ex: Amina Benali" 
                  value={formData.fullName} 
                  onChange={handleInputChange} 
                  className="w-full bg-[#FBF9F5] border border-stone-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-stone-400 transition-colors" 
                />
              </div>

              {/* TÉLÉPHONE & WILAYA DYNAMIQUE */}
              <div className={`grid grid-cols-1 ${shippingEnabled ? 'sm:grid-cols-2' : ''} gap-4`}>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1.5 font-medium">Téléphone *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    required 
                    placeholder="06XX XX XX XX" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="w-full bg-[#FBF9F5] border border-stone-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-stone-400 transition-colors" 
                  />
                </div>

                {/* MENU DÉROULANT DES WILAYAS */}
                {shippingEnabled && (
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1.5 font-medium">Wilaya de Livraison *</label>
                    <select
                      name="wilaya"
                      required={shippingEnabled}
                      value={formData.wilaya}
                      onChange={handleInputChange}
                      className="w-full bg-[#FBF9F5] border border-stone-200 rounded-2xl px-4 py-3 text-xs text-stone-800 focus:outline-none focus:border-stone-400 transition-colors cursor-pointer"
                    >
                      <option value="">-- Sélectionner la Wilaya --</option>
                      {shippingRates.map(rate => (
                        <option key={rate.id || rate.wilaya_name} value={rate.wilaya_name}>
                          {rate.wilaya_name} ({Number(rate.price).toLocaleString()} DA)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1.5 font-medium">Adresse exacte de livraison *</label>
                <input 
                  type="text" 
                  name="address" 
                  required 
                  placeholder="Rue, Bâtiment, Quartier..." 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  className="w-full bg-[#FBF9F5] border border-stone-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-stone-400 transition-colors" 
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1.5 font-medium">Remarques (Optionnel)</label>
                <textarea 
                  name="notes" 
                  rows="2"
                  placeholder="Instructions particulières..." 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  className="w-full bg-[#FBF9F5] border border-stone-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-stone-400 transition-colors" 
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-stone-900 text-white py-4 rounded-full text-xs font-medium uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xs cursor-pointer disabled:opacity-50">
                {isSubmitting ? 'Validation...' : 'Confirmer la Commande'}
              </button>
            </form>
          </div>

          {/* RÉCAPITULATIF PANIER */}
          <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-3xl border border-stone-200/60 shadow-xs space-y-6">
            <h2 className="font-serif text-xl text-stone-900 pb-4 border-b border-stone-100">Récapitulatif</h2>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {cart.map((item, index) => {
                const itemPrice = Number(item.has_promo ? item.final_price : (item.promo_price ?? item.price ?? item.original_price ?? 0));
                const itemQty = item.qty || item.quantity || 1;
                const itemId = item.id || item.product_id;

                return (
                  <div key={itemId || index} className="flex items-center gap-4 pb-4 border-b border-stone-100 relative group">
                    <div className="w-16 h-16 bg-[#FBF9F5] rounded-xl border border-stone-200/60 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img 
                        src={getImageUrl(item)} 
                        alt={item.name || 'Produit'} 
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder.png';
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-serif text-sm truncate text-stone-900">{item.name}</h4>
                      <p className="text-xs text-stone-400">Qté : {itemQty}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs font-medium text-stone-900">{(itemPrice * itemQty).toLocaleString()} DA</span>
                      
                      {/* BTON DE SUPPRESSION AVEC TRANSMISSION RÉCURSIVE DE L'ID */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(itemId)}
                        className="p-1 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Supprimer cet article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-stone-100 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-stone-500 font-light">
                <span>Sous-total</span>
                <span className="font-medium text-stone-800">{subtotal.toLocaleString()} DA</span>
              </div>
              
              <div className="flex justify-between text-xs text-stone-500 font-light">
                <span>Frais de livraison</span>
                {shippingEnabled ? (
                  <span className="font-medium text-stone-800">
                    {selectedShippingCost > 0 ? `${selectedShippingCost.toLocaleString()} DA` : 'Sélectionnez une wilaya'}
                  </span>
                ) : (
                  <span className="font-medium text-stone-800">0 DA</span>
                )}
              </div>

              <div className="flex justify-between text-base font-medium text-stone-900 pt-3 border-t border-stone-100">
                <span>Total</span>
                <span className="font-semibold text-lg">{grandTotal.toLocaleString()} DA</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}