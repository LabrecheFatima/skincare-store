import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function AboutVideoSection() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // Chemin direct vers la vidéo dans le dossier public
  const promoVideo = '/videos/promo.MP4';

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const stats = [
    { value: '100%', label: 'Formules Professionnelles' },
    { value: '95%', label: 'Satisfaction Client' },
    { value: '15+', label: 'Années d’Expertise' },
    { value: '200+', label: 'Soins Essentiels' },
  ];

  return (
    <section id="about" className="py-16 md:py-24 px-6 md:px-16 bg-[#FDFBF7] text-neutral-900">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
        
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          {/* Badge Style Fil d'Ariane */}
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
            <span className="h-[1px] w-8 bg-neutral-300"></span>
            <span className="text-xs uppercase tracking-widest text-neutral-500 font-medium">
              À Propos
            </span>
            <span className="h-[1px] w-8 bg-neutral-300"></span>
            <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight text-neutral-900 max-w-2xl leading-tight">
            L'Excellence Professionnelle au Service de Votre Peau
          </h2>
          <p className="mt-4 text-sm md:text-base text-neutral-600 font-light max-w-xl mx-auto leading-relaxed">
            Développés par des experts dermatologues, nos soins allient rigueur scientifique et ingrédients d'exception pour vous offrir une routine de qualité professionnelle à domicile.
          </p>
        </motion.div>

        {/* Carte Vidéo avec Statistiques en Overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative w-full max-w-3xl h-[480px] sm:h-[550px] rounded-3xl overflow-hidden shadow-xl border border-white/60 bg-neutral-900 group cursor-pointer"
          onClick={togglePlay}
        >
          {/* Élément Vidéo */}
          <video
            ref={videoRef}
            src={promoVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-85 transition-opacity duration-300 group-hover:opacity-75"
          />

          {/* Calque Sombre de Dégradé */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Bouton Play/Pause : affiché UNIQUEMENT si la vidéo est en pause, ou au survol */}
          {!isPlaying && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/40 shadow-lg z-20">
              <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}

          {/* Grille de Statistiques Posée en Bas */}
          <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 z-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-white text-center sm:text-left backdrop-blur-xs bg-black/10 pointer-events-none">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col">
                <span className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-white mb-1">
                  {stat.value}
                </span>
                <span className="text-xs text-neutral-300 font-light leading-snug">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}