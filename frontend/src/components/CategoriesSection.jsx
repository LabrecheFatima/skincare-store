import React from 'react';
import { motion } from 'framer-motion';

// Imports explicites depuis src/assets
import imageProduct1 from '../assets/product-category3.png';
import imageProduct2 from '../assets/product-category2.png';
import imageProduct3 from '../assets/product-category1.png';
import imageProduct4 from '../assets/product-category4.png';

export default function CategoriesSection() {
  const categories = [
    {
      id: 1,
      badge: 'Bestseller',
      title: 'Sérums & Ampoules',
      description: 'Formules concentrées pour régénérer et apaiser la peau en profondeur.',
      image: imageProduct3,
    },
    {
      id: 2,
      badge: 'Incontournable',
      title: 'Crèmes & Hydratants',
      description: 'Nourrit intensément et renforce la barrière cutanée au quotidien.',
      image: imageProduct2,
    },
    {
      id: 3,
      badge: 'Purifiant',
      title: 'Nettoyants & Masques',
      description: 'Masques à l’argile et soins nettoyants pour éliminer les impuretés.',
      image: imageProduct1,
    },
    {
      id: 4,
      badge: 'Protection UV',
      title: 'Soins Solaire & UV',
      description: 'Protection quotidienne fluide contre les rayons UV et le vieillissement.',
      image: imageProduct4,
    },
  ];

  const containerAnim = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const cardAnim = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <section className="py-16 md:py-24 px-6 md:px-16 bg-[#FDFBF7] text-neutral-900">
      <div className="max-w-7xl mx-auto">
        {/* Titre de section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-neutral-500 mb-2 block">
            Exploration
          </span>
          <h2 className="text-3xl md:text-5xl font-serif tracking-tight text-neutral-900">
            Nos Catégories
          </h2>
        </motion.div>

        {/* Grille des 4 catégories */}
        <motion.div 
          variants={containerAnim}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              variants={cardAnim}
              whileHover={{ y: -6 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 flex flex-col justify-between group cursor-pointer transition-all duration-300 hover:shadow-md"
            >
              {/* En-tête de la carte */}
              <div>
                <div className="flex justify-start items-center mb-4">
                  <span className="bg-[#F5F2EC] px-3 py-1 rounded-md text-xs font-medium text-neutral-700">
                    {cat.badge}
                  </span>
                </div>

                <h3 className="text-xl font-serif text-neutral-900 mb-2 group-hover:text-[#8A9A86] transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-neutral-500 font-light leading-relaxed mb-6 line-clamp-2">
                  {cat.description}
                </p>
              </div>

              {/* Conteneur de l'image */}
              <div className="w-full h-60 rounded-xl overflow-hidden bg-[#F8F6F0] relative">
                <img 
                  src={cat.image} 
                  alt={cat.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}