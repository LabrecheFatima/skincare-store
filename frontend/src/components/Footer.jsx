import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/vite.png'; // Assurez-vous que le chemin vers votre logo est correct

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');

      setTimeout(() => {
        setSubscribed(false);
      }, 4000);
    }
  };

  const columns = [
    {
      title: 'Boutique',
      links: [
        ['Sérums & Huiles', '/shop'],
        ['Crèmes Visage', '/shop'],
        ['Nettoyants', '/shop'],
        ['Nouveautés', '/shop'],
      ],
    },
    {
      title: 'À propos',
      links: [
        ['Notre Histoire', '/about'],
        ['Engagements & Ingrédients', '/about'],
        ['Avis Clients', '/about'],
        ['Contact', '/contact'],
      ],
    },
    {
      title: 'Aide & FAQ',
      links: [
        ['Livraison & Retours', '/shipping'],
        ['Politique de Confidentialité', '/privacy'],
        ['Conditions Générales', '/terms'],
        ['FAQ', '/faq'],
      ],
    },
  ];

  return (
    <footer dir="ltr" className="w-full bg-[#2e2a2b] text-[#d6cdc3]">
      <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16 pt-14 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] gap-x-8 gap-y-12">

          {/* Marque + newsletter */}
          <div className="col-span-2 lg:col-span-1">
            
            {/* Conteneur avec la couleur exacte du fond du logo (#f1ede7) */}
            <div className="inline-flex items-center justify-center bg-[#f1ede7] px-4 py-2 rounded-2xl shadow-xs">
              <img
                src={logo}
                alt="Apoteca Algérie Logo"
                className="h-12 w-auto object-contain"
              />
            </div>

            <p className="mt-5 text-sm leading-relaxed text-[#f1ebe2]/90 max-w-xs font-light">
              Rejoignez notre communauté pour recevoir nos conseils beauté, des offres exclusives et l'actualité de nos formules naturelles.
            </p>

            <form onSubmit={handleSubscribe} className="mt-6 flex flex-col gap-3 max-w-md">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                className="w-full bg-[#454142] border border-[#f1ebe2]/20 px-4 py-3.5 text-sm text-[#f1ebe2] placeholder:text-[#f1ebe2]/45 focus:outline-none focus:border-[#e8a5a5] transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-[#e8a5a5] text-white text-xs font-bold tracking-widest uppercase py-3.5 hover:bg-[#df9292] transition-colors cursor-pointer"
              >
                S'abonner
              </button>

              {subscribed && (
                <p className="text-xs text-[#e8a5a5] font-medium mt-1">
                  Merci ! Votre inscription a bien été prise en compte.
                </p>
              )}
            </form>
          </div>

          {/* Colonnes de liens */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-serif uppercase text-lg tracking-wider text-[#f1ebe2]">
                {col.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-[#d6cdc3] hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Séparateur + copyright */}
        <div className="mt-14 pt-8 border-t border-[#f1ebe2]/15 text-center text-xs text-[#f1ebe2]/70">
          © {new Date().getFullYear()} Apoteca Algérie. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}