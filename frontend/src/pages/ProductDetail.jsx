import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockProducts } from '../mock/products';
import { useCart } from '../context/CartContext';
import { Truck, ShieldCheck, ArrowLeft, Plus, Minus, Check } from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Recherche du produit par slug
  const product = mockProducts.find(p => p.slug === slug) || mockProducts[0];

  const hasPromo = product.promo_price !== null && product.promo_price !== undefined;
  const finalPrice = hasPromo ? product.promo_price : product.original_price;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Bouton Retour */}
      <button 
        onClick={() => navigate(-1)} 
        className="inline-flex items-center text-xs uppercase tracking-wider text-[#8c6d53] hover:underline mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la boutique
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Galerie Image */}
        <div className="bg-[#f7f2e9] border border-[#eee3d0] rounded-sm overflow-hidden aspect-square relative">
          {hasPromo && (
            <span className="absolute top-4 left-4 bg-[#8c6d53] text-white text-xs font-semibold tracking-wider uppercase px-3 py-1 z-10">
              PROMO
            </span>
          )}
          <img 
            src={product.image_url} 
            alt={product.name}
            crossOrigin="anonymous"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/600x600/f7f2e9/2c1e17?text=Soins+d%27Hiver";
            }}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Informations Produit */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#8c6d53] font-semibold block mb-2">
              {product.category}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#2c1e17] mb-4">
              {product.name}
            </h1>

            {/* Prix */}
            <div className="flex items-baseline space-x-3 mb-6">
              <span className={`text-2xl font-semibold ${hasPromo ? 'text-red-700' : 'text-[#2c1e17]'}`}>
                {finalPrice} DA
              </span>
              {hasPromo && (
                <span className="line-through text-base text-gray-400">
                  {product.original_price} DA
                </span>
              )}
            </div>

            <p className="text-[#4a382c] leading-relaxed text-sm sm:text-base mb-8 border-y border-[#eee3d0] py-6">
              {product.description}
            </p>

            {/* Selecteur de Quantité */}
            <div className="flex items-center space-x-6 mb-8">
              <span className="text-xs uppercase tracking-wider text-[#8c6d53] font-semibold">Quantité :</span>
              <div className="flex items-center border border-[#eee3d0] bg-white">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-[#2c1e17] hover:bg-[#f7f2e9] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-semibold text-[#2c1e17]">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-[#2c1e17] hover:bg-[#f7f2e9] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Boutons d'Action */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button 
                onClick={handleAddToCart}
                className={`flex-1 py-4 px-6 text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  added ? 'bg-green-800 text-white' : 'bg-[#2c1e17] text-white hover:bg-[#8c6d53]'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Ajouté au panier</span>
                  </>
                ) : (
                  <span>Ajouter au panier</span>
                )}
              </button>

              <Link 
                to="/checkout" 
                onClick={handleAddToCart}
                className="py-4 px-6 text-center border border-[#2c1e17] text-[#2c1e17] hover:bg-[#2c1e17] hover:text-white transition-colors text-xs uppercase tracking-widest font-semibold"
              >
                Commander directement
              </Link>
            </div>
          </div>

          {/* Réassurance Rapide */}
          <div className="bg-[#f7f2e9] p-4 rounded-sm space-y-3">
            <div className="flex items-center text-xs text-[#4a382c]">
              <Truck className="w-4 h-4 text-[#8c6d53] mr-3" />
              <span>Livraison à domicile ou en bureau à travers les 58 Wilayas</span>
            </div>
            <div className="flex items-center text-xs text-[#4a382c]">
              <ShieldCheck className="w-4 h-4 text-[#8c6d53] mr-3" />
              <span>Paiement en espèces à la livraison (COD)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}