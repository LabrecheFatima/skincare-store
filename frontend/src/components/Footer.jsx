import React from 'react';
import { motion } from 'framer-motion';

export default function Footer() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <footer className="bg-black text-white border-t border-white/10 pt-16 pb-8 px-6 md:px-16 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Section principale : Newsletter + Colonnes de Navigation */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-white/10"
        >
          {/* Colonne Gauche : Brand & Newsletter */}
          <motion.div variants={fadeInUp} className="md:col-span-5 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-serif tracking-tight text-white uppercase mb-4">
                Apoteca
              </h2>
              <p className="text-sm text-stone-300 font-light leading-relaxed max-w-sm mb-6">
                Rejoignez notre communauté pour recevoir nos conseils beauté, des offres exclusives et l'actualité de nos formules naturelles.
              </p>

              {/* Formulaire Newsletter */}
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-sm text-white placeholder-stone-400 focus:outline-none focus:border-white transition-colors rounded-none"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-black font-medium text-xs uppercase tracking-widest hover:bg-stone-200 transition-colors whitespace-nowrap"
                >
                  S'abonner
                </button>
              </form>
            </div>
          </motion.div>

          {/* Colonnes Droite : Liens de Navigation */}
          <motion.div variants={fadeInUp} className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Colonne 1 : Boutique */}
            <div>
              <h3 className="text-xs font-semibold tracking-wider uppercase text-white mb-4">
                Boutique
              </h3>
              <ul className="space-y-2.5 text-xs text-stone-400 font-light">
                <li>
                  <a href="#shop" className="hover:text-white transition-colors">Sérums & Huiles</a>
                </li>
                <li>
                  <a href="#shop" className="hover:text-white transition-colors">Crèmes Visage</a>
                </li>
                <li>
                  <a href="#shop" className="hover:text-white transition-colors">Nettoyants</a>
                </li>
                <li>
                  <a href="#shop" className="hover:text-white transition-colors">Nouveautés</a>
                </li>
              </ul>
            </div>

            {/* Colonne 2 : À propos */}
            <div>
              <h3 className="text-xs font-semibold tracking-wider uppercase text-white mb-4">
                À propos
              </h3>
              <ul className="space-y-2.5 text-xs text-stone-400 font-light">
                <li>
                  <a href="#" className="hover:text-white transition-colors">Notre Histoire</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Engagements & Ingrédients</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Avis Clients</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Contact</a>
                </li>
              </ul>
            </div>

            {/* Colonne 3 : Aide & FAQ */}
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-white mb-4">
                Aide & FAQ
              </h3>
              <ul className="space-y-2.5 text-xs text-stone-400 font-light">
                <li>
                  <a href="#" className="hover:text-white transition-colors">Livraison & Retours</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Politique de Confidentialité</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Conditions Générales</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">FAQ</a>
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Bar : Copyright & Réseaux Sociaux */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400 font-light">
          <p>© {new Date().getFullYear()} Apoteca. Tous droits réservés.</p>

          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
              Instagram
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">
              Facebook
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="Pinterest">
              Pinterest
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}