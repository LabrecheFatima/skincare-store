import React from 'react';
import { motion } from 'framer-motion';

// Imports des images (ajuste les chemins selon l'arborescence de ton projet)
import greenMaskImg from '../assets/green-mask.png';   // Photo de gauche
import mainFaceImg from '../assets/main-face.png';     // Photo centrale
import spaCareImg from '../assets/spa-care.png';       // Photo de droite

export default function GlowSection() {
  return (
    <section className="py-16 md:py-28 px-3 sm:px-6 bg-[#F8F5EE] text-neutral-900 overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
        
        {/* En-tête de la section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-14 max-w-2xl px-2"
        >
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif tracking-tight text-neutral-900 leading-[1.18]">
            Révélez Votre Éclat <br />
            Dès Aujourd'hui
          </h2>
          <p className="mt-4 text-sm sm:text-lg text-neutral-600 font-light leading-relaxed">
            Des solutions de soins d'exception conçues pour sublimer votre beauté naturelle au quotidien grâce à une attention constante.
          </p>
        </motion.div>

        {/* Galerie des 3 cartes superposées */}
        <div className="relative w-full max-w-4xl flex items-center justify-center pt-2 md:pt-4">
          
          {/* Carte Gauche */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="w-[28%] md:w-1/4 max-w-[200px] aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden shadow-md -mr-4 sm:-mr-8 md:-mr-12 scale-90 opacity-80 md:opacity-70 z-0 shrink-0"
          >
            <img
              src={greenMaskImg}
              alt="Soin au masque naturel"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Carte Centrale */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="w-[66%] sm:w-[50%] md:w-full max-w-[340px] md:max-w-[400px] aspect-[4/5] rounded-[1.8rem] md:rounded-[2.5rem] overflow-hidden shadow-xl md:shadow-2xl z-10 border-2 md:border-4 border-white/80 shrink-0"
          >
            <img
              src={mainFaceImg}
              alt="Massage et soin du visage"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Carte Droite */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="w-[28%] md:w-1/4 max-w-[200px] aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden shadow-md -ml-4 sm:-ml-8 md:-ml-12 scale-90 opacity-80 md:opacity-70 z-0 shrink-0"
          >
            <img
              src={spaCareImg}
              alt="Application de soin visage"
              className="w-full h-full object-cover"
            />
          </motion.div>

        </div>

        {/* Bouton CTA "Voir nos produits" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 md:mt-14"
        >
          <a
            href="/products" // Modifie le lien selon la route de ta boutique
            className="inline-flex items-center gap-3 bg-neutral-900 text-white hover:bg-neutral-800 text-sm sm:text-base font-medium px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Voir nos produits</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </motion.div>

      </div>
    </section>
  );
}