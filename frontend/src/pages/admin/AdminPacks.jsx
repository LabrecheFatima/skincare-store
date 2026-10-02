import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Package, Plus, Trash2, Edit3, Upload, X, Check, AlertCircle } from 'lucide-react';

export default function AdminPacks() {
  const [packs, setPacks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState(null);
  const [priceError, setPriceError] = useState('');

  // Formulaire Pack
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    original_price: '',
    promo_price: '',
    stock_quantity: '10',
    is_active: 1,
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resPacks = await api.get('/admin/packs');
      setPacks(resPacks.data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des packs :', err);
    }
  };

  const handleOpenAddModal = () => {
    setEditingPack(null);
    setImageFiles([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setPriceError('');
    setFormData({ 
      name: '', 
      slug: '', 
      description: '', 
      original_price: '', 
      promo_price: '', 
      stock_quantity: '10', 
      is_active: 1 
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pack) => {
    setEditingPack(pack);
    setImageFiles([]);
    setImagesToDelete([]);
    setPriceError('');

    const imgs = pack.images 
      ? pack.images 
      : pack.image_url 
        ? [pack.image_url] 
        : [];
    setExistingImages(imgs);

    setFormData({
      name: pack.name || '',
      slug: pack.slug || '',
      description: pack.description || '',
      original_price: pack.original_price || '',
      promo_price: pack.promo_price ?? '',
      stock_quantity: pack.stock_quantity ?? '10',
      is_active: pack.is_active ?? 1,
    });

    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPriceError('');

    const origPrice = parseFloat(formData.original_price);
    const promoPrice = parseFloat(formData.promo_price);

    // Validation côte client du prix promo vs prix de base
    if (formData.promo_price !== '' && !isNaN(promoPrice) && !isNaN(origPrice) && promoPrice >= origPrice) {
      setPriceError('Le prix promotionnel doit être strictement inférieur au prix de base.');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('slug', formData.slug);
    data.append('description', formData.description);
    data.append('original_price', formData.original_price);
    data.append('promo_price', formData.promo_price || '');
    data.append('stock_quantity', formData.stock_quantity);
    data.append('is_active', formData.is_active);
    data.append('products', JSON.stringify([]));

    imageFiles.forEach(file => data.append('images', file));
    if (imagesToDelete.length > 0) {
      data.append('delete_images', JSON.stringify(imagesToDelete));
    }

    try {
      if (editingPack) {
        await api.put(`/admin/packs/${editingPack.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/admin/packs', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la sauvegarde du pack');
    }
  };

  const handleDeletePack = async (packId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce pack ?')) return;
    try {
      await api.delete(`/admin/packs/${packId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la suppression du pack');
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-2xl font-serif text-stone-900">Gestion des Packs</h2>
          <p className="text-xs text-stone-500">Créez des offres groupées promotionnelles</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-medium flex items-center gap-2 cursor-pointer hover:bg-stone-800 transition-colors"
        >
          <Plus size={16} /> Créer un Pack
        </button>
      </div>

      {/* Liste des Packs */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Pack</th>
                <th className="py-3.5 px-6">Prix de Base</th>
                <th className="py-3.5 px-6">Prix Promo</th>
                <th className="py-3.5 px-6">Stock</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {packs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-stone-400">
                    Aucun pack trouvé
                  </td>
                </tr>
              ) : (
                packs.map(pack => {
                  const mainImage = pack.image_url || (pack.images && pack.images[0]);
                  return (
                    <tr key={pack.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {mainImage ? (
                              <img
                                src={`${api.defaults.baseURL.replace('/api', '')}${mainImage}`}
                                alt={pack.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package size={20} className="text-stone-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">{pack.name}</p>
                            <p className="text-xs text-stone-400 font-mono">{pack.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-stone-900">{pack.original_price} DA</td>
                      <td className="py-4 px-6 font-semibold text-emerald-700">
                        {pack.promo_price ? `${pack.promo_price} DA` : '-'}
                      </td>
                      <td className="py-4 px-6 text-stone-600">{pack.stock_quantity}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(pack)}
                            className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePack(pack.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulaire Pack */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-xl border border-stone-200">
            <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-3">
              <h3 className="font-serif text-lg text-stone-900">{editingPack ? 'Modifier le Pack' : 'Nouveau Pack'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Panneau d'erreur de prix */}
            {priceError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs font-medium">
                <AlertCircle size={18} className="shrink-0 text-rose-600" />
                <span>{priceError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Nom & Slug */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1 text-stone-700">Nom du Pack *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full p-2 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-stone-700">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg font-mono focus:outline-none focus:border-stone-900"
                    required
                  />
                </div>
              </div>

              {/* Tarification & Promotion */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1 text-stone-700">Prix de base (DA) *</label>
                  <input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => {
                      setPriceError('');
                      setFormData({ ...formData, original_price: e.target.value });
                    }}
                    className="w-full p-2 border border-stone-200 rounded-lg font-semibold text-stone-800 focus:outline-none focus:border-stone-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-emerald-700 font-semibold">Prix Promo Pack (DA)</label>
                  <input
                    type="number"
                    value={formData.promo_price}
                    onChange={(e) => {
                      setPriceError('');
                      setFormData({ ...formData, promo_price: e.target.value });
                    }}
                    placeholder="Ex: 4500"
                    className="w-full p-2 border border-emerald-300 rounded-lg bg-emerald-50/30 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Galerie Multi-images */}
              <div>
                <label className="block font-medium mb-1 text-stone-700">Images du Pack (Multiples)</label>
                
                {/* Images existantes */}
                {existingImages.length > 0 && (
                  <div className="flex gap-2 mb-2">
                    {existingImages.map((img, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded border overflow-hidden">
                        <img src={`${api.defaults.baseURL.replace('/api', '')}${img}`} alt="pack" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setExistingImages(existingImages.filter(i => i !== img));
                            setImagesToDelete([...imagesToDelete, img]);
                          }}
                          className="absolute top-0 right-0 bg-rose-600 text-white p-0.5 rounded-bl"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImageFiles([...imageFiles, ...Array.from(e.target.files)])}
                  className="w-full p-2 border border-stone-200 rounded-lg"
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} /> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}