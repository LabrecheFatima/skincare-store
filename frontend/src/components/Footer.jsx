export default function Footer() {
  return (
    <footer className="bg-[#2c1e17] text-[#eee3d0] pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        <div>
          <h4 className="font-serif text-xl text-white tracking-widest uppercase mb-4">Soins d'Hiver</h4>
          <p className="text-sm text-[#eee3d0]/80 leading-relaxed">
            Formulations naturelles pensées pour protéger et régénérer votre peau face aux rigueurs de la saison froide.
          </p>
        </div>

        <div>
          <h5 className="text-sm uppercase tracking-wider text-white font-medium mb-4">Informations</h5>
          <ul className="space-y-2 text-sm text-[#eee3d0]/80">
            <li>Livraison rapide dans 58 Wilayas</li>
            <li>Paiement à la livraison (COD)</li>
            <li>Service Client disponible 7j/7</li>
          </ul>
        </div>

        <div>
          <h5 className="text-sm uppercase tracking-wider text-white font-medium mb-4">Contact</h5>
          <p className="text-sm text-[#eee3d0]/80 mb-2">Algérie</p>
          <p className="text-sm text-[#eee3d0]/80">Email: contact@soinshiver.dz</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-[#eee3d0]/20 text-center text-xs text-[#eee3d0]/60">
        © {new Date().getFullYear()} Soins d'Hiver — Conçu par FabWeb Agency. Tous droits réservés.
      </div>
    </footer>
  );
}