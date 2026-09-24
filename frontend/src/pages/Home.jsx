import React, { useRef } from 'react';
import { motion } from 'framer-motion';

import imageProduct1 from '../assets/image-product1.png';
import imageProduct2 from '../assets/image-product2.png';
import imageProduct3 from '../assets/image-product3.png';
import imageProduct4 from '../assets/image-product4.png';
import heroBg from '../assets/image-hero.png';

import CategoriesSection from '../components/CategoriesSection';
import AboutVideoSection from '../components/AboutVideoSection.';
import GlowSection from '../components/GlowSection';

export default function HomeHero() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const offset = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollLeft + offset, behavior: 'smooth' });
    }
  };

  const products = [
    { id: 1, badge: 'Nouveauté', name: 'Gouttes Réparatrices Barrière', price: '52,00 €', image: imageProduct1 },
    { id: 2, badge: 'Nouveauté', name: 'Crème Visage Intensive', price: '60,00 €', image: imageProduct2 },
    { id: 3, badge: 'Nouveauté', name: 'Sérum Visage Éclat', price: '48,00 €', image: imageProduct3 },
    { id: 4, badge: 'Nouveauté', name: 'Baume Nettoyant Doux', price: '45,00 €', image: imageProduct4 },
  ];

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

  return (
    <div className="w-full bg-apoteca-cream font-sans overflow-hidden">
      {/* SECTION HERO FIXÉE */}
      <section className="relative w-full min-h-[100dvh] flex flex-col justify-end bg-black text-white overflow-hidden">
        {/* Conteneur d'image de fond qui couvre 100% de la hauteur */}
        <motion.div 
          initial={{ scale: 1.15, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          {/* Overlay sombre couvrant tout l'écran */}
          <div className="absolute inset-0 bg-black/30 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
        </motion.div>

        {/* Contenu textuel */}
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
              className="inline-block px-8 py-3 border border-white/80 text-xs sm:text-sm tracking-widest uppercase text-white hover:bg-white hover:text-apoteca-charcoal transition-all duration-300 backdrop-blur-sm"
            >
              Découvrir
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION BEST SELLERS */}
      <section id="shop" className="py-16 md:py-24 px-6 md:px-16 bg-apoteca-cream text-apoteca-charcoal relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-end mb-10 md:mb-14"
          >
            <h2 className="text-3xl md:text-5xl font-serif tracking-tight text-apoteca-charcoal">
              Nos Meilleures Ventes
            </h2>
            
            <div className="hidden md:flex gap-3">
              <button 
                onClick={() => scroll('left')}
                className="w-12 h-12 border border-apoteca-grey/40 flex items-center justify-center hover:border-apoteca-charcoal transition-colors"
                aria-label="Précédent"
              >
                <svg className="w-5 h-5 text-apoteca-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={() => scroll('right')}
                className="w-12 h-12 bg-apoteca-pink text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                aria-label="Suivant"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </motion.div>

          <div className="relative group">
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
                  className="min-w-[280px] sm:min-w-[320px] md:min-w-0 snap-start bg-apoteca-beige/30 border border-apoteca-grey/20 flex flex-col justify-between group/card relative rounded-lg overflow-hidden"
                >
                  <div className="p-4 flex justify-between items-start z-10">
                    <span className="bg-white/80 backdrop-blur-sm px-3 py-1 text-[11px] tracking-wider uppercase text-apoteca-charcoal shadow-sm border border-apoteca-grey/20">
                      {product.badge}
                    </span>
                    <button className="w-8 h-8 bg-apoteca-pink text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  <div className="w-full h-64 sm:h-72 flex items-center justify-center p-6 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="max-h-full max-w-full object-contain group-hover/card:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-5 bg-white border-t border-apoteca-grey/10 flex justify-between items-end">
                    <div>
                      <h3 className="text-sm font-medium text-apoteca-charcoal mb-1 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-apoteca-grey">Soin de la peau</p>
                    </div>
                    <span className="text-sm font-semibold text-apoteca-charcoal">
                      {product.price}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <CategoriesSection /> 

      <AboutVideoSection />

      <GlowSection />

    </div>
  );
}