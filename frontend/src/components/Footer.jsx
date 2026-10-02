import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/vite.png'; // Assurez-vous que le chemin vers votre logo est correct

// Textes selon la langue du navigateur (fr par défaut)
const content = {
  fr: {
    dir: 'ltr',
    desc: "Rejoignez notre communauté pour recevoir nos conseils beauté, des offres exclusives et l'actualité de nos formules naturelles.",
    placeholder: 'Votre adresse email',
    subscribe: "S'abonner",
    rights: 'Tous droits réservés.',
    columns: [
      { title: 'Boutique', links: [['Sérums & Huiles', '/shop'], ['Crèmes Visage', '/shop'], ['Nettoyants', '/shop'], ['Nouveautés', '/shop']] },
      { title: 'À propos', links: [['Notre Histoire', '/about'], ['Engagements & Ingrédients', '/about'], ['Avis Clients', '/about'], ['Contact', '/contact']] },
      { title: 'Aide & FAQ', links: [['Livraison & Retours', '/shipping'], ['Politique de Confidentialité', '/privacy'], ['Conditions Générales', '/terms'], ['FAQ', '/faq']] },
    ],
  },
  en: {
    dir: 'ltr',
    desc: 'Join our community to receive beauty tips, exclusive offers and news about our natural formulas.',
    placeholder: 'Your email address',
    subscribe: 'Subscribe',
    rights: 'All rights reserved.',
    columns: [
      { title: 'Shop', links: [['Serums & Oils', '/shop'], ['Face Creams', '/shop'], ['Cleansers', '/shop'], ['New Arrivals', '/shop']] },
      { title: 'About', links: [['Our Story', '/about'], ['Commitments & Ingredients', '/about'], ['Customer Reviews', '/about'], ['Contact', '/contact']] },
      { title: 'Help & FAQ', links: [['Shipping & Returns', '/shipping'], ['Privacy Policy', '/privacy'], ['Terms & Conditions', '/terms'], ['FAQ', '/faq']] },
    ],
  },
  ar: {
    dir: 'rtl',
    desc: 'انضمي إلى مجتمعنا لتصلك نصائح الجمال والعروض الحصرية وأخبار تركيباتنا الطبيعية.',
    placeholder: 'بريدك الإلكتروني',
    subscribe: 'اشتراك',
    rights: 'جميع الحقوق محفوظة.',
    columns: [
      { title: 'المتجر', links: [['سيروم وزيوت', '/shop'], ['كريمات الوجه', '/shop'], ['منظفات', '/shop'], ['جديدنا', '/shop']] },
      { title: 'من نحن', links: [['قصتنا', '/about'], ['التزاماتنا ومكوناتنا', '/about'], ['آراء الزبائن', '/about'], ['اتصل بنا', '/contact']] },
      { title: 'المساعدة', links: [['التوصيل والإرجاع', '/shipping'], ['سياسة الخصوصية', '/privacy'], ['الشروط العامة', '/terms'], ['الأسئلة الشائعة', '/faq']] },
    ],
  },
};

const detectLang = () => {
  if (typeof navigator === 'undefined') return 'fr';
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const l of prefs) {
    const code = (l || '').slice(0, 2).toLowerCase();
    if (content[code]) return code;
  }
  return 'fr';
};

export default function Footer() {
  const [lang] = useState(detectLang);
  const [email, setEmail] = useState('');
  const t = content[lang];

  const handleSubscribe = (e) => {
    e.preventDefault();
    // TODO : brancher sur votre API d'abonnement à la newsletter
  };

  return (
    <footer dir={t.dir} className="w-full bg-[#2e2a2b] text-[#d6cdc3]">
      <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16 pt-14 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] gap-x-8 gap-y-12">

          {/* Marque + newsletter */}
          <div className="col-span-2 lg:col-span-1">
            <img
              src={logo}
              alt="Apoteca Logo"
              className="h-12 w-auto object-contain"
            />
            <p className="mt-7 text-sm leading-relaxed text-[#f1ebe2]/90 max-w-xs">
              {t.desc}
            </p>

            <form onSubmit={handleSubscribe} className="mt-7 flex flex-col gap-3 max-w-md">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.placeholder}
                className="w-full bg-[#454142] border border-[#f1ebe2]/20 px-4 py-4 text-base text-[#f1ebe2] placeholder:text-[#f1ebe2]/45 focus:outline-none focus:border-[#e8a5a5] transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-[#e8a5a5] text-white text-xs font-bold tracking-widest uppercase py-3 hover:bg-[#df9292] transition-colors cursor-pointer"
              >
                {t.subscribe}
              </button>
            </form>
          </div>

          {/* Colonnes de liens */}
          {t.columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-serif uppercase text-xl tracking-wide text-[#f1ebe2]">
                {col.title}
              </h4>
              <ul className="mt-6 space-y-4">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-base text-[#d6cdc3] hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Séparateur + copyright */}
        <div className="mt-14 pt-8 border-t border-[#f1ebe2]/15 text-center text-sm text-[#f1ebe2]/90">
          © {new Date().getFullYear()} Apoteca. {t.rights}
        </div>
      </div>
    </footer>
  );
}