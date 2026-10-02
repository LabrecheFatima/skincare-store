import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { read, utils } from 'xlsx';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  Upload, 
  AlertCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  FileSpreadsheet,
  HelpCircle,
  CheckCircle2,
  FileCode,
  Info
} from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // État pour la notification / Toast stylé
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // État pour la modal du guide CSV/Excel
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // États pour la modal de création / édition
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Gestion de plusieurs images
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // État pour la modal de confirmation de suppression
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    description: '',
    composition: '',         
    conseil_utilisation: '',
    original_price: '',
    promo_price: '',
    stock_quantity: '',
    is_active: 1
  });

  // Utilitaire pour afficher les notifications toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4500);
  };

  // Charger les produits et les catégories
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resProducts, resCategories] = await Promise.all([
        api.get('/products?limit=1000'),
        api.get('/categories').catch(() => ({ data: [] }))
      ]);

      setProducts(resProducts.data.data || resProducts.data || []);
      setCategories(resCategories.data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des données :', err);
      setError('Impossible de charger la liste des produits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Génération automatique du slug
  const handleNameChange = (e) => {
    const name = e.target.value;
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData(prev => ({
      ...prev,
      name,
      slug: editingProduct ? prev.slug : generatedSlug
    }));
  };

  // Ouvrir modal pour ajout
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setImageFiles([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setFormData({
      name: '',
      slug: '',
      category_id: '',
      description: '',
      composition: '',         
      conseil_utilisation: '',
      original_price: '',
      promo_price: '',
      stock_quantity: '10',
      is_active: 1
    });
    setIsModalOpen(true);
  };

  // Ouvrir modal pour édition
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setImageFiles([]);
    setImagesToDelete([]);

    const imgs = product.images 
      ? product.images 
      : product.image_url 
        ? [product.image_url] 
        : [];
    setExistingImages(imgs);

    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      category_id: product.category_id || '',
      description: product.description || '',
      composition: product.composition || '',                  
      conseil_utilisation: product.conseil_utilisation || '',
      original_price: product.original_price || '',
      promo_price: product.promo_price ?? '',
      stock_quantity: product.stock_quantity ?? 0,
      is_active: product.is_active ?? 1
    });
    setIsModalOpen(true);
  };

  // Sélection de plusieurs nouvelles images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
    }
  };

  // Retirer un nouveau fichier sélectionné
  const handleRemoveNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Retirer une image existante du serveur
  const handleRemoveExistingImage = (imageUrl) => {
    setExistingImages(prev => prev.filter(img => img !== imageUrl));
    setImagesToDelete(prev => [...prev, imageUrl]);
  };

  // Enregistrement (Création ou Modification)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('slug', formData.slug);
    data.append('category_id', formData.category_id);
    data.append('description', formData.description);
    data.append('composition', formData.composition);
    data.append('conseil_utilisation', formData.conseil_utilisation);
    data.append('original_price', formData.original_price);
    data.append('promo_price', formData.promo_price ? formData.promo_price : '');
    data.append('stock_quantity', formData.stock_quantity);
    data.append('is_active', formData.is_active);

    imageFiles.forEach((file) => {
      data.append('images', file);
    });

    if (imagesToDelete.length > 0) {
      data.append('delete_images', JSON.stringify(imagesToDelete));
    }

    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Produit mis à jour avec succès !', 'success');
      } else {
        await api.post('/admin/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Nouveau produit ajouté au catalogue !', 'success');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur lors de l’enregistrement du produit.', 'error');
    }
  };

  // Confirmer la suppression
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/admin/products/${deletingProduct.id}`);
      setProducts(prev => prev.filter(p => p.id !== deletingProduct.id));
      showToast(`Le produit "${deletingProduct.name}" a été supprimé.`, 'success');
      setDeletingProduct(null);
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur lors de la suppression.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Importation CSV / Excel avec gestion des erreurs et toast
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const jsonProducts = utils.sheet_to_json(worksheet);

      if (jsonProducts.length === 0) {
        showToast("Le fichier importé est vide ou contient une syntaxe invalide.", "error");
        setIsImporting(false);
        return;
      }

      const response = await api.post('/admin/products/import', { products: jsonProducts });
      showToast(response.data.message || 'Importation terminée avec succès !', 'success');
      
      fetchData();
    } catch (err) {
      console.error("Erreur d'importation :", err);
      const errorMsg = err.response?.data?.error || "Erreur de traitement. Vérifiez la structure de votre fichier CSV/Excel.";
      showToast(errorMsg, "error");
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  // Condition d'erreur sur le prix promotionnel
  const isPromoInvalid = formData.promo_price !== '' && 
    formData.original_price !== '' && 
    Number(formData.promo_price) > Number(formData.original_price);

  return (
    <div className="space-y-6 relative">
      
      {/* 🟢 Toast Stylé de Notification (Success / Error) */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`flex items-center gap-3.5 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all max-w-md ${
            toast.type === 'success' 
              ? 'bg-stone-900/95 text-stone-100 border-stone-800' 
              : 'bg-rose-950/95 text-rose-100 border-rose-900'
          }`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            </div>

            <div className="flex-1 pr-2">
              <p className="text-[11px] font-semibold tracking-wider uppercase text-stone-400">
                {toast.type === 'success' ? 'Confirmation' : 'Erreur d\'Importation'}
              </p>
              <p className="text-xs font-medium text-stone-200 mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>

            <button 
              onClick={() => setToast({ ...toast, show: false })}
              className="p-1 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-2xl font-serif text-stone-900">Gestion du Catalogue</h2>
          <p className="text-xs text-stone-500 mt-1">Ajoutez, modifiez et gérez les produits de votre boutique</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          {/* Bouton Guide d'Importation */}
          <button
            onClick={() => setIsGuideOpen(true)}
            className="p-2.5 text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Guide de syntaxe CSV/Excel"
          >
            <HelpCircle size={17} />
            <span className="hidden md:inline">Syntaxe CSV/Excel</span>
          </button>

          {/* Bouton d'importation Excel / CSV */}
          <label className={`px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}>
            <FileSpreadsheet size={16} />
            {isImporting ? 'Importation...' : 'Importer CSV/Excel'}
            <input 
              type="file" 
              accept=".csv, .xlsx, .xls" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>

          {/* Bouton Nouveau Produit */}
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            Nouveau Produit
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher un produit par nom ou slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 transition-colors"
        />
      </div>

      {/* Tableau des Produits */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-stone-900 border-t-transparent"></div>
          <p className="text-sm text-stone-500 mt-3">Chargement des produits...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center gap-3 text-sm">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <Package className="mx-auto text-stone-300 mb-3" size={40} />
          <p className="text-stone-700 font-medium text-base">Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Produit</th>
                  <th className="py-3.5 px-6">Prix</th>
                  <th className="py-3.5 px-6">Stock</th>
                  <th className="py-3.5 px-6">Visibilité</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {filteredProducts.map((product) => {
                  const mainImage = product.image_url || (product.images && product.images[0]);
                  return (
                    <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {mainImage ? (
                              <img
                                  src={
                                    !mainImage 
                                      ? '' 
                                      : mainImage.startsWith('http') 
                                      ? mainImage 
                                      : `${api.defaults.baseURL.replace('/api', '')}${mainImage.startsWith('/') ? '' : '/'}${mainImage}`
                                  }
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                            ) : (
                              <Package size={20} className="text-stone-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">{product.name}</p>
                            <p className="text-xs text-stone-400 font-mono">{product.slug}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {product.promo_price ? (
                          <div>
                            <span className="font-semibold text-emerald-700">{product.promo_price} DA</span>
                            <span className="text-xs text-stone-400 line-through ml-2">{product.original_price} DA</span>
                          </div>
                        ) : (
                          <span className="font-semibold text-stone-900">{product.original_price} DA</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                          product.stock_quantity > 5 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : product.stock_quantity > 0 
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {product.stock_quantity}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        {product.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                            <Eye size={14} /> Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-400">
                            <EyeOff size={14} /> Masqué
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(product)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 📘 Modal Guide Syntaxe CSV / Excel */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-stone-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <FileCode size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-medium text-stone-900">Guide Importation CSV / Excel</h3>
                  <p className="text-xs text-stone-500">Règles de structure et bonnes pratiques</p>
                </div>
              </div>
              <button 
                onClick={() => setIsGuideOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto text-xs text-stone-700 leading-relaxed">
              
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
                <Info size={18} className="shrink-0 mt-0.5" />
                <p>
                  Les entêtes de votre tableau Excel ou CSV doivent <strong>strictement correspondre</strong> aux noms ci-dessous (en minuscules).
                </p>
              </div>

              {/* Tableau des colonnes */}
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-stone-100 text-[11px] uppercase font-semibold text-stone-600">
                    <tr>
                      <th className="p-2.5 border-b">Nom Colonne</th>
                      <th className="p-2.5 border-b">Requis</th>
                      <th className="p-2.5 border-b">Exemple / Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-mono text-[11px]">
                    <tr>
                      <td className="p-2.5 font-bold text-emerald-800">name</td>
                      <td className="p-2.5 text-rose-600 font-sans">Oui</td>
                      <td className="p-2.5 font-sans">Sérum Visage Hydratant</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-emerald-800">original_price</td>
                      <td className="p-2.5 text-rose-600 font-sans">Oui</td>
                      <td className="p-2.5 font-sans">Nombre entier ex: 4500</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-stone-800">category_id</td>
                      <td className="p-2.5 text-stone-400 font-sans">Non</td>
                      <td className="p-2.5 font-sans">ID numérique de la catégorie (ex: 1)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-stone-800">promo_price</td>
                      <td className="p-2.5 text-stone-400 font-sans">Non</td>
                      <td className="p-2.5 font-sans">Prix promo (laisser vide si aucun)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-stone-800">stock_quantity</td>
                      <td className="p-2.5 text-stone-400 font-sans">Non</td>
                      <td className="p-2.5 font-sans">Nombre d'articles (défaut: 0)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-stone-800">slug</td>
                      <td className="p-2.5 text-stone-400 font-sans">Non</td>
                      <td className="p-2.5 font-sans">Ex: serum-visage. Généré si vide.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-stone-800">is_active</td>
                      <td className="p-2.5 text-stone-400 font-sans">Non</td>
                      <td className="p-2.5 font-sans">1 (Visible) ou 0 (Masqué)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Erreurs fréquentes */}
              <div>
                <h4 className="font-semibold text-stone-900 mb-2">⚠️ Résolution des Erreurs Fréquentes :</h4>
                <ul className="list-disc pl-5 space-y-1 text-stone-600">
                  <li><strong>L'importation échoue à 100% :</strong> Vérifiez si <code className="bg-stone-100 px-1 py-0.5 rounded">name</code> ou <code className="bg-stone-100 px-1 py-0.5 rounded">original_price</code> contiennent des valeurs manquées.</li>
                  <li><strong>Contrainte de catégorie :</strong> Si vous entrez une <code className="bg-stone-100 px-1 py-0.5 rounded">category_id</code> qui n'existe pas en base, elle sera enregistrée comme vide (sans catégorie).</li>
                  <li><strong>Formats de prix :</strong> Évitez les symboles comme <code className="bg-stone-100 px-1 py-0.5 rounded">DA</code> ou les virgules dans les chiffres (utilisez <code className="bg-stone-100 px-1 py-0.5 rounded">4500</code> et non <code className="bg-stone-100 px-1 py-0.5 rounded">4 500 DA</code>).</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setIsGuideOpen(false)}
                className="px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-medium hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmation de Suppression */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} />
              </div>
              
              <h3 className="text-lg font-serif font-medium text-stone-900 mb-2">
                Supprimer ce produit ?
              </h3>
              
              <p className="text-xs text-stone-500 leading-relaxed mb-6">
                Êtes-vous sûr de vouloir supprimer définitivement <strong className="text-stone-800 font-semibold">"{deletingProduct.name}"</strong> ? Cette action est irréversible.
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingProduct(null)}
                  disabled={isDeleting}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Formulaire (Ajout / Édition) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs overflow-y-auto p-4 flex justify-center items-start sm:items-center">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-stone-200 my-8 flex flex-col max-h-[90vh]">
            
            {/* En-tête Modal */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-white rounded-t-2xl shrink-0">
              <h3 className="text-lg font-serif text-stone-900">
                {editingProduct ? 'Modifier le Produit' : 'Ajouter un Produit'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulaire défilable */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Nom & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Nom du produit *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Slug (URL) *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm font-mono focus:outline-none focus:border-stone-900"
                    required
                  />
                </div>
              </div>

              {/* Catégorie & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Catégorie</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-900"
                  >
                    <option value="">Aucune catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Quantité en Stock *</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-900"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Prix de base & Prix Promo */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Prix de base (DA) *</label>
                    <input
                      type="number"
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-colors ${
                        isPromoInvalid 
                          ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500' 
                          : 'border-stone-200 focus:border-stone-900'
                      }`}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Prix Promotionnel (DA)</label>
                    <input
                      type="number"
                      value={formData.promo_price}
                      onChange={(e) => setFormData({ ...formData, promo_price: e.target.value })}
                      placeholder="Facultatif"
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-colors ${
                        isPromoInvalid 
                          ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500' 
                          : 'border-stone-200 focus:border-stone-900'
                      }`}
                      min="0"
                    />
                  </div>
                </div>

                {/* 🔴 Panneau d'alerte identique à la page Pack */}
                {isPromoInvalid && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center gap-3 text-xs animate-in fade-in duration-200">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>
                      Le prix promotionnel (<strong>{formData.promo_price} DA</strong>) ne peut pas être supérieur au prix de base (<strong>{formData.original_price} DA</strong>).
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Composition */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Composition / Ingrédients</label>
                <textarea
                  value={formData.composition}
                  onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                  rows={2}
                  placeholder="Ex: Aqua, Glycerin, Huile d'Argan..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Conseils d'utilisation */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Conseils d'utilisation</label>
                <textarea
                  value={formData.conseil_utilisation}
                  onChange={(e) => setFormData({ ...formData, conseil_utilisation: e.target.value })}
                  rows={2}
                  placeholder="Ex: Appliquer quotidiennement matin et soir sur une peau propre."
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Section Multi-Images */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Images du Produit (Galerie)
                </label>
                
                {/* Zone de prévisualisation des images */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-3">
                  {/* Images déjà enregistrées sur le serveur */}
                  {existingImages.map((imgUrl, idx) => (
                    <div key={`existing-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-stone-200 bg-stone-50">
                      <img
                        src={`${api.defaults.baseURL.replace('/api', '')}${imgUrl}`}
                        alt={`Existante ${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(imgUrl)}
                        className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                        title="Supprimer"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  {/* Nouvelles images ajoutées */}
                  {imageFiles.map((file, idx) => (
                    <div key={`new-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-emerald-300 bg-emerald-50">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Nouvelle ${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
                        className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                        title="Supprimer"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Bouton d'upload multiple */}
                <label className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-stone-300 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors text-xs text-stone-600 font-medium">
                  <Upload size={16} />
                  <span>Ajouter une ou plusieurs images (WebP / PNG / JPG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Statut Visibilité */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={Boolean(formData.is_active)}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 rounded-md text-stone-900 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="is_active" className="text-xs font-medium text-stone-700 cursor-pointer">
                  Produit visible dans la boutique
                </label>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100 bg-white sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-stone-900 text-white hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  {editingProduct ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}