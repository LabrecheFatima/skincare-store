import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const fmt = (n) => `${Number(n).toLocaleString("fr-FR")} DA`;

const Leaf = () => (
  <svg viewBox="0 0 60 200" className="pc-orn" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M30 200V20" />
    {[40, 75, 110, 145].map((y) => (
      <g key={y}>
        <path d={`M30 ${y + 25}C10 ${y + 20} 8 ${y} 12 ${y - 8}C26 ${y - 4} 32 ${y + 10} 30 ${y + 25}Z`} />
        <path d={`M30 ${y + 10}C50 ${y + 5} 52 ${y - 15} 48 ${y - 23}C34 ${y - 19} 28 ${y - 5} 30 ${y + 10}Z`} />
      </g>
    ))}
  </svg>
);

export default function PacksCarousel() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const serverBaseUrl = API_URL.replace(/\/api\/?$/, '');

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const response = await axios.get(`${API_URL}/packs`);
        const data = response.data || [];
        setPacks(data);
      } catch (error) {
        console.error("Erreur lors du chargement des packs :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPacks();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 340; // Distance de défilement par clic
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${serverBaseUrl}${cleanPath}`;
  };

  if (loading || packs.length === 0) return null;

  // Dédoublement des packs pour assurer la boucle infinie de l'animation CSS
  const track = [...packs, ...packs];

  return (
    <section className="pc">
      <style>{css}</style>
      <Leaf />

      <header className="pc-head flex justify-between items-end gap-4">
        <div>
          <h2>Nos packs exclusifs</h2>
          <p>Nos combinaisons de soins à prix réduits</p>
        </div>

        {/* Boutons de contrôle manuels */}
        <div className="flex items-center gap-2 shrink-0 z-10 mb-1">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="w-10 h-10 sm:w-11 sm:h-11 bg-[#373233] border border-stone-600 rounded-none flex items-center justify-center hover:bg-stone-700 transition-all cursor-pointer active:scale-95 text-stone-200"
            aria-label="Précédent"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="w-10 h-10 sm:w-11 sm:h-11 bg-[#373233] border border-stone-600 rounded-none flex items-center justify-center hover:bg-stone-700 transition-all cursor-pointer active:scale-95 text-stone-200"
            aria-label="Suivant"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </header>

      {/* Conteneur combinant défilement manuel et animation CSS */}
      <div ref={scrollRef} className="pc-viewport overflow-x-auto scrollbar-none">
        <ul className="pc-track">
          {track.map((pack, i) => {
            const hasPromo = pack.promo_price && Number(pack.promo_price) > 0 && Number(pack.promo_price) < Number(pack.original_price);
            const isClone = i >= packs.length;
            const mainImage = pack.image_url || (pack.images && pack.images[0]);

            return (
              <li key={`${pack.id || pack._id}-${i}`} className="pc-item" aria-hidden={isClone || undefined}>
                <Link to={`/pack/${pack.slug || pack.id || pack._id}`} className="pc-card" tabIndex={isClone ? -1 : undefined}>
                  <div className="pc-img">
                    <img src={getImageUrl(mainImage)} alt={isClone ? "" : pack.name} loading="lazy" />
                    
                    {/* Overlay texte et prix */}
                    <div className="pc-overlay flex flex-col items-center text-center">
                      <h3 className="pc-title-on-img">{pack.name}</h3>
                      <div className="pc-prices-on-img">
                        {hasPromo ? (
                          <>
                            <s className="pc-old-price">{fmt(pack.original_price)}</s>
                            <strong className="pc-promo-price">{fmt(pack.promo_price)}</strong>
                          </>
                        ) : (
                          <strong className="pc-promo-price">{fmt(pack.original_price)}</strong>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pc-body">
                    <span className="pc-btn">Voir le pack</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

const css = `
.pc{--dark:#2e2a2b;--panel:#373233;--pink:#e9a3a0;--sand:#e6ddd3;
  position:relative;background:var(--dark);color:var(--sand);overflow:hidden;
  padding:clamp(36px,6vw,72px) 0 clamp(40px,6vw,72px);font-family:'Helvetica Neue',Arial,sans-serif}
.pc *{box-sizing:border-box}
.pc-orn{position:absolute;left:0;top:0;height:100%;width:auto;opacity:.08;color:#fff;pointer-events:none}
.pc-head{position:relative;padding:0 clamp(16px,5vw,64px);margin-bottom:clamp(22px,4vw,40px);max-width:1200px;margin-inline:auto}
.pc-head h2{margin:0 0 8px;font:400 clamp(28px,4.2vw,52px)/1.1 'Cormorant Garamond','Playfair Display',Georgia,serif;text-transform:uppercase;letter-spacing:.04em;color:#e9e1d8}
.pc-head p{margin:0;font-size:clamp(12px,1.3vw,15px);color:#d8cfc6}

/* Permet à la fois le scroll manuel et l'animation */
.pc-viewport{
  position:relative;
  overflow-x:auto;
  scrollbar-width:none;
  -ms-overflow-style:none;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);
  mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);
}
.pc-viewport::-webkit-scrollbar { display: none; }

/* Animation infinie en CSS */
.pc-track{
  list-style:none;
  margin:0;
  padding:0;
  display:flex;
  width:max-content;
  animation:pc-scroll 32s linear infinite;
}

/* Pause de l'animation lors du survol ou du touch */
.pc-viewport:hover .pc-track,
.pc-viewport:focus-within .pc-track,
.pc-viewport:active .pc-track {
  animation-play-state:paused;
}

.pc-item{flex:none;width:clamp(280px,32vw,380px);margin-right:clamp(16px,2.5vw,30px)}
.pc-card{display:block;text-decoration:none;color:inherit;background:var(--panel);height:100%}
.pc-card:focus-visible{outline:2px solid var(--pink);outline-offset:3px}

.pc-img{position:relative;aspect-ratio:3/4;overflow:hidden;background:#4a4344}
.pc-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
.pc-card:hover .pc-img img{transform:scale(1.04)}

/* Overlay texte/prix sur l'image */
.pc-overlay{
  position:absolute;
  inset:0;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-start;
  padding-top:28px;
  padding-left:16px;
  padding-right:16px;
  background:linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%);
  text-align:center;
}

.pc-title-on-img{
  margin:0 0 10px;
  font:400 clamp(20px,2.4vw,28px)/1.2 'Cormorant Garamond','Playfair Display',Georgia,serif;
  color:#ffffff;
  text-shadow:0 2px 6px rgba(0,0,0,0.6);
}

.pc-prices-on-img{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:2px;
}

.pc-old-price{
  color:rgba(255,255,255,0.8);
  font-size:14px;
  text-decoration:line-through;
  text-shadow:0 1px 4px rgba(0,0,0,0.7);
  font-family:'Cormorant Garamond','Playfair Display',Georgia,serif;
}

.pc-promo-price{
  color:#ffffff;
  font-size:clamp(22px,2.8vw,32px);
  font-weight:700;
  text-shadow:0 2px 8px rgba(0,0,0,0.8);
  font-family:'Cormorant Garamond','Playfair Display',Georgia,serif;
}

.pc-body{padding:16px;text-align:center}
.pc-btn{display:inline-block;background:var(--pink);color:#fff;padding:10px 24px;font:600 11px 'Helvetica Neue',Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;transition:filter .2s}
.pc-card:hover .pc-btn{filter:brightness(1.07)}

@keyframes pc-scroll{to{transform:translateX(-50%)}}

@media (max-width:560px){
  .pc-item{width:clamp(240px,75vw,290px)}
  .pc-track{animation-duration:26s}
}

@media (prefers-reduced-motion:reduce){
  .pc-track{animation:none}
  .pc-img img,.pc-btn{transition:none}
}
`;