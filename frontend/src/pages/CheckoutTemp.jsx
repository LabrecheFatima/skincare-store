import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Checkout() {
  const { cart, removeFromCart, clearCart, totalAmount } = useCart();
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    wilaya: 'Alger',
    commune: '',
    address: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Envoi simulé avant la connexion au backend Express
    setSubmitted(true);
    clearCart();
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <CheckCircle className="w-16 h-16 text-green-700 mx-auto mb-6" />
        <h1 className="font-serif text-3xl text-[#2c1e17] mb-4">Commande Confirmée !</h1>
        <p className="text-[#4a382c] leading-relaxed mb-8">
          Merci <span className="font-semibold">{formData.firstName}</span>. Votre commande a bien été enregistrée. Notre service client vous contactera par téléphone au <span className="font-semibold">{formData.phone}</span> pour confirmer l'expédition vers <span className="font-semibold">{formData.wilaya}</span>.
        </p>
        <Link 
          to="/shop" 
          onClick={() => setSubmitted(false)}
          className="inline-block bg-[#2c1e17] text-white px-8 py-4 text-xs uppercase tracking-widest hover:bg-[#8c6d53] transition-colors"
        >
          Retourner à la boutique
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-[#8c6d53] mx-auto mb-6" />
        <h1 className="font-serif text-3xl text-[#2c1e17] mb-4">Votre panier est vide</h1>
        <p className="text-[#4a382c] mb-8">Découvrez nos soins d'hiver et ajoutez vos produits préférés.</p>
        <Link 
          to="/shop" 
          className="inline-block bg-[#2c1e17] text-white px-8 py-4 text-xs uppercase tracking-widest hover:bg-[#8c6d53] transition-colors"
        >
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl text-[#2c1e17] mb-8 text-center sm:text-left">Finaliser ma commande</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Formulaire Client (7 colonnes) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 border border-[#eee3d0] rounded-sm">
          <h2 className="font-serif text-xl text-[#2c1e17] mb-6 border-b border-[#eee3d0] pb-3">
            Informations de Livraison
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8c6d53] font-semibold mb-1">Prénom *</label>
                <input 
                  type="text" 
                  name="firstName" 
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border border-[#eee3d0] p-3 text-sm focus:outline-none focus:border-[#8c6d53] bg-[#fdfbf7]" 
                  placeholder="Ex: Amel"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8c6d53] font-semibold mb-1">Nom *</label>
                <input 
                  type="text" 
                  name="lastName" 
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border border-[#eee3d0] p-3 text-sm focus:outline-none focus:border-[#8c6d53] bg-[#fdfbf7]" 
                  placeholder="Ex: Benali"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#8c6d53] font-semibold mb-1">Numéro de Téléphone *</label>
              <input 
                type="tel" 
                name="phone" 
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-[#eee3d0] p-3 text-sm focus:outline-none focus:border-[#8c6d53] bg-[#fdfbf7]" 
                placeholder="06 XX XX XX XX"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8c6d53] font-semibold mb-1">Wilaya *</label>
                <select 
                  name="wilaya" 
                  value={formData.wilaya}
                  onChange={handleChange}
                  className="w-full border border-[#eee3d0] p-3 text-sm focus:outline-none focus:border-[#8c6d53] bg-[#fdfbf7]"
                >
                  {['Alger', 'Oran', 'Constantine', 'Blida', 'Sétif', 'Annaba', 'Tlemcen', 'Autre Wilaya'].map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8c6d53] font-semibold mb-1">Commune *</label>
                <input 
                  type="text" 
                  name="commune" 
                  required
                  value={formData.commune}
                  onChange={handleChange}
                  className="w-full border border-[#eee3d0] p-3 text-sm focus:outline-none focus:border-[#8c6d53] bg-[#fdfbf7]" 
                  placeholder="Ex: Hydra"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#8c6d53] font-semibold mb-1">Adresse exacte *</label>
              <textarea 
                name="address" 
                rows="2" 
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full border border-[#eee3d0] p-3 text-sm focus:outline-none focus:border-[#8c6d53] bg-[#fdfbf7]" 
                placeholder="Rue, N° de maison / bâtiment"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-[#eee3d0]">
              <div className="bg-[#f7f2e9] p-4 text-xs text-[#4a382c] rounded-sm mb-6">
                <strong>Mode de paiement :</strong> Paiement en espèces à la livraison (COD).
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#2c1e17] text-white py-4 uppercase tracking-widest text-xs font-semibold hover:bg-[#8c6d53] transition-colors"
              >
                Confirmer la commande ({totalAmount} DA)
              </button>
            </div>
          </form>
        </div>

        {/* Récapitulatif de Commande (5 colonnes) */}
        <div className="lg:col-span-5 bg-[#f7f2e9] p-6 sm:p-8 border border-[#eee3d0] rounded-sm h-fit">
          <h2 className="font-serif text-xl text-[#2c1e17] mb-6 border-b border-[#eee3d0] pb-3">
            Votre Panier ({cart.reduce((sum, i) => sum + i.qty, 0)})
          </h2>

          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
            {cart.map(item => {
              const price = item.promo_price ?? item.original_price;
              return (
                <div key={item.id} className="flex items-center justify-between border-b border-[#eee3d0] pb-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-14 h-14 object-cover border border-[#eee3d0]" 
                    />
                    <div>
                      <h4 className="font-serif text-sm text-[#2c1e17] line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-[#8c6d53]">Qté: {item.qty} × {price} DA</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-sm text-[#2c1e17]">{price * item.qty} DA</span>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#eee3d0] pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-[#4a382c]">
              <span>Sous-total</span>
              <span>{totalAmount} DA</span>
            </div>
            <div className="flex justify-between text-[#4a382c]">
              <span>Frais de livraison</span>
              <span className="text-xs italic">Calculés lors de la confirmation</span>
            </div>
            <div className="flex justify-between font-serif text-lg font-semibold text-[#2c1e17] pt-3 border-t border-[#eee3d0]">
              <span>Total</span>
              <span>{totalAmount} DA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}