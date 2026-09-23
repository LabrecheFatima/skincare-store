import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const hasPromo = product.promo_price !== null && product.promo_price !== undefined;
  const finalPrice = hasPromo ? product.promo_price : product.original_price;

  return (
    <div className="group relative bg-white border border-[#eee3d0] rounded-sm overflow-hidden flex flex-col justify-between transition-all hover:shadow-lg">
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden aspect-square bg-[#f7f2e9]">
        {hasPromo && (
          <span className="absolute top-3 left-3 bg-[#8c6d53] text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 z-10">
            PROMO
          </span>
        )}
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8c6d53] font-medium block mb-1">
            {product.category}
          </span>
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-serif text-lg text-[#2c1e17] group-hover:text-[#8c6d53] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-4 pt-3 border-t border-[#f7f2e9] flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            {hasPromo && (
              <span className="line-through text-xs text-gray-400">
                {product.original_price} DA
              </span>
            )}
            <span className={`font-semibold ${hasPromo ? 'text-red-700' : 'text-[#2c1e17]'}`}>
              {finalPrice} DA
            </span>
          </div>

          <button 
            onClick={() => addToCart(product)}
            className="text-xs uppercase tracking-wider bg-[#2c1e17] text-white px-3 py-2 hover:bg-[#8c6d53] transition-colors"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}