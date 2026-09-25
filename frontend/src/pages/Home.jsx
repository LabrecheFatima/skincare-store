import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

import heroBg from '../assets/image-hero.png';
import CategoriesSection from '../components/CategoriesSection';
import AboutVideoSection from '../components/AboutVideoSection';
import GlowSection from '../components/GlowSection';
import { API_URL } from '../config';

export default function HomeHero() {
  const scrollRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Récupération dynamique des produits depuis le backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/products`);
        // On prend les 4 premiers produits pour la section Best Sellers de l'accueil
        const data = response.data.data || response.data;
        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error("Erreur lors du chargement des produits :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const offset = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollLeft + offset, behavior: 'smooth' });
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const cardAnim = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Helper pour afficher l'image du produit (locale ou distante)
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_URL}/uploads/${imageUrl}`;
  };

  return (
    <div className="w-full bg-apoteca-cream font-sans overflow-hidden">
      {/* SECTION HERO FIXÉE */}
      <section className="relative w-full min-h-[100dvh] flex flex-col justify-end bg-black text-white overflow-hidden">
        <motion.div 
          initial={{ scale: 1.15, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-black/30 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
        </motion.div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 w-full flex flex-col justify-end px-6 md:px-16 pt-28 pb-12 sm:pb-16 md:pb-20 max-w-3xl"
        >
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif tracking-tight text-white leading-[1.1] mb-4"
          >
            Révélez Votre <br className="hidden sm:inline" />
            Éclat Naturel
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-sm sm:text-base text-stone-200 font-light leading-relaxed max-w-md mb-8"
          >
            Des soins nourrissants conçus pour sublimer la beauté naturelle de votre peau avec des formules pures, douces et approuvées par les dermatologues.
          </motion.p>

          <motion.div variants={fadeInUp}>
            <a
              href="#shop"
              className="inline-block px-8 py-3 border border-white/80 text-xs sm:text-sm tracking-widest uppercase text-white hover:bg-white hover:text-stone-900 transition-all duration-300 backdrop-blur-sm"
            >
              Découvrir
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION BEST SELLERS */}
      <section id="shop" className="py-16 md:py-24 px-6 md:px-16 bg-stone-50 text-stone-900 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-end mb-10 md:mb-14"
          >
            <h2 className="text-3xl md:text-5xl font-serif tracking-tight text-stone-900">
              Nos Meilleures Ventes
            </h2>
            
            <div className="hidden md:flex gap-3">
              <button 
                onClick={() => scroll('left')}
                className="w-12 h-12 border border-stone-300 flex items-center justify-center hover:border-stone-900 transition-colors"
                aria-label="Précédent"
              >
                <svg className="w-5 h-5 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={() => scroll('right')}
                className="w-12 h-12 bg-stone-900 text-white flex items-center justify-center hover:bg-stone-800 transition-opacity"
                aria-label="Suivant"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </motion.div>

          <div className="relative group">
            {loading ? (
              <div className="text-center py-12 text-stone-500">Chargement des produits...</div>
            ) : (
              <motion.div 
                ref={scrollRef}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={staggerContainer}
                className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {products.map((product) => (
                  <motion.div 
                    key={product.id}
                    variants={cardAnim}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="min-w-[280px] sm:min-w-[320px] md:min-w-0 snap-start bg-white border border-stone-200 flex flex-col justify-between group/card relative rounded-lg overflow-hidden shadow-xs"
                  >
                    <div className="p-4 flex justify-between items-start z-10">
                      <span className="bg-stone-100 px-3 py-1 text-[11px] tracking-wider uppercase text-stone-800 border border-stone-200 font-medium">
                        {product.has_promo ? 'PROMO' : 'Nouveauté'}
                      </span>
                      <button className="w-8 h-8 bg-stone-900 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    <div className="w-full h-64 sm:h-72 flex items-center justify-center p-6 overflow-hidden">
                      <img 
                        src={getImageUrl(product.image_url)} 
                        alt={product.name} 
                        className="max-h-full max-w-full object-contain group-hover/card:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-5 bg-white border-t border-stone-100 flex justify-between items-end">
                      <div>
                        <h3 className="text-sm font-medium text-stone-900 mb-1 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-stone-500">Soins de la peau</p>
                      </div>
                      <div className="text-right">
                        {product.has_promo ? (
                          <div className="flex flex-col items-end">
                            <span className="line-through text-xs text-stone-400">{product.original_price} DA</span>
                            <span className="text-sm font-semibold text-red-600">{product.final_price} DA</span>
                          </div>
                        ) : (
                          <span className="text-sm font-semibold text-stone-900">
                            {product.original_price || product.price} DA
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <CategoriesSection /> 
      <AboutVideoSection />
      <GlowSection />
    </div>
  );
}