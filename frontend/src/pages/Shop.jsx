import { useState, useMemo } from 'react';
import { mockProducts } from '../mock/products';
import ProductCard from '../components/ProductCard';
import { Filter } from 'lucide-react';

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState(5000);

  // Filtrage dynamique côté client
  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      const price = product.promo_price ?? product.original_price;
      const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchPrice = price <= maxPrice;
      return matchCategory && matchPrice;
    });
  }, [selectedCategory, maxPrice]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* En-tête de la Boutique */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs uppercase tracking-widest text-[#8c6d53] font-semibold block mb-2">
          Collection complète
        </span>
        <h1 className="font-serif text-4xl text-[#2c1e17] mb-4">La Boutique Soins d'Hiver</h1>
        <p className="text-[#4a382c] text-sm leading-relaxed">
          Découvrez nos formulations naturelles conçues pour nourrir, réparer et protéger votre peau contre le froid.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Barre Latérale de Filtres */}
        <aside className="w-full lg:w-64 bg-[#f7f2e9] p-6 rounded-sm h-fit">
          <div className="flex items-center space-x-2 border-b border-[#eee3d0] pb-4 mb-6">
            <Filter className="w-5 h-5 text-[#8c6d53]" />
            <h2 className="font-serif text-lg text-[#2c1e17]">Filtres</h2>
          </div>

          {/* Filtre par Catégorie */}
          <div className="mb-8">
            <h3 className="text-xs uppercase tracking-wider text-[#8c6d53] font-semibold mb-3">Catégories</h3>
            <div className="space-y-2">
              {[
                { id: 'all', label: 'Tous les soins' },
                { id: 'baumes', label: 'Baumes' },
                { id: 'huiles', label: 'Huiles & Sérums' },
                { id: 'cremes', label: 'Crèmes Hydratantes' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`block w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                    selectedCategory === cat.id 
                      ? 'bg-[#2c1e17] text-white font-medium' 
                      : 'text-[#4a382c] hover:bg-[#eee3d0]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtre par Prix Max */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs uppercase tracking-wider text-[#8c6d53] font-semibold">Prix Max</h3>
              <span className="text-xs font-semibold text-[#2c1e17]">{maxPrice} DA</span>
            </div>
            <input 
              type="range" 
              min="1000" 
              max="5000" 
              step="100" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#8c6d53] cursor-pointer"
            />
          </div>
        </aside>

        {/* Grille des Produits */}
        <main className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-[#eee3d0]">
              <p className="text-[#4a382c] font-serif text-lg">Aucun soin ne correspond à ces critères.</p>
              <button 
                onClick={() => { setSelectedCategory('all'); setMaxPrice(5000); }}
                className="mt-4 text-xs uppercase tracking-wider text-[#8c6d53] underline font-medium"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}