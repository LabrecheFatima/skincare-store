import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, Search, Filter, RefreshCw, ChevronDown, ChevronUp, 
  Trash2, Edit, Check, X, Phone, MapPin, User, ArrowUpDown, Clock,
  AlertTriangle
} from 'lucide-react';

// URL de l'API : VITE_API_URL (ex: https://mondomaine.com/api) ou proxy local '/api'
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ---------- Pagination ----------
const PAGE_SIZES = [10, 20, 50];

const getPageList = (page, totalPages) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const set = new Set([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach(p => set.add(p));
  if (page >= totalPages - 2) [totalPages - 1, totalPages - 2, totalPages - 3].forEach(p => set.add(p));
  const sorted = [...set].filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('…');
    result.push(p);
  });
  return result;
};

function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  if (!total) return null;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-stone-100 bg-stone-50/50 text-xs text-stone-500">
      <div className="flex items-center gap-3">
        <span>{from}–{to} sur {total}</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1 border border-stone-200 rounded-lg bg-white text-xs focus:outline-none cursor-pointer"
        >
          {PAGE_SIZES.map(size => (
            <option key={size} value={size}>{size} / page</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Précédent
        </button>

        {getPageList(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`dots-${i}`} className="px-2 text-stone-400">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-8 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                p === page
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white border-stone-200 hover:bg-stone-100'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  // Pagination (côté serveur)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const latestRequest = useRef(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  // État pour la modal de confirmation de suppression
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    orderId: null,
    customerName: ''
  });

  // Récupération des headers d'authentification
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  // Recherche : on attend 350 ms après la dernière frappe avant d'interroger le serveur
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Rechargement à chaque changement de page, de taille, de recherche, de statut ou de tri
  useEffect(() => {
    fetchOrders();
  }, [page, pageSize, debouncedSearch, statusFilter, sortConfig]);

  const fetchOrders = async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
        sort: sortConfig.key,
        dir: sortConfig.direction
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const response = await fetch(`${API_BASE}/admin/orders?${params.toString()}`, {
        headers: getAuthHeaders()
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Réponse non-JSON reçue :", text);
        throw new Error("Le serveur a renvoyé du HTML. Vérifiez votre connexion ou l'URL backend.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des commandes');
      }

      const data = await response.json();
      if (requestId !== latestRequest.current) return; // réponse périmée (une requête plus récente est en cours)

      const list = Array.isArray(data) ? data : (data.data || []);
      const totalCount = Array.isArray(data) ? data.length : (data.pagination?.total ?? list.length);
      const totalPages = Array.isArray(data) ? 1 : (data.pagination?.totalPages ?? 1);

      setOrders(list);
      setTotal(totalCount);

      // Si la page demandée n'existe plus (ex : dernière commande de la page supprimée), on recule
      if (list.length === 0 && totalCount > 0 && page > totalPages) setPage(totalPages);
    } catch (err) {
      console.error("Erreur chargement commandes :", err);
    } finally {
      if (requestId === latestRequest.current) {
        setLoading(false);
        setHasLoaded(true);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        // Si un filtre de statut est actif, la commande doit disparaître de la liste filtrée
        if (statusFilter !== 'ALL') fetchOrders();
      }
    } catch (err) {
      console.error("Erreur mise à jour statut:", err);
    }
  };

  // Ouvre la modal de suppression
  const openDeleteModal = (order) => {
    const fullName = `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim();
    setDeleteModal({
      isOpen: true,
      orderId: order.id,
      customerName: fullName ? `${fullName} (#${order.id})` : `#${order.id}`
    });
  };

  // Exécute la suppression définitive
  const confirmDelete = async () => {
    if (!deleteModal.orderId) return;

    try {
      const response = await fetch(`${API_BASE}/admin/orders/${deleteModal.orderId}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
    } finally {
      setDeleteModal({ isOpen: false, orderId: null, customerName: '' });
    }
  };

  const handleStartEdit = (order) => {
    setEditingId(order.id);
    setEditFormData({
      customer_first_name: order.customer_first_name || '',
      customer_last_name: order.customer_last_name || '',
      customer_phone: order.customer_phone || '',
      wilaya: order.wilaya || '',
      commune: order.commune || '',
      delivery_address: order.delivery_address || '',
      notes: order.notes || ''
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/admin/orders/${id}/details`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editFormData),
      });
      if (response.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, ...editFormData } : o));
        setEditingId(null);
      }
    } catch (err) {
      console.error("Erreur modification:", err);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setPage(1);
  };

  // Recherche, filtre de statut, tri et pagination sont gérés côté serveur
  const filteredOrders = orders;

  const getStatusBadge = (status) => {
    const styles = {
      en_attente: 'bg-amber-50 text-amber-700 border-amber-200',
      confirmee: 'bg-blue-50 text-blue-700 border-blue-200',
      expediee: 'bg-purple-50 text-purple-700 border-purple-200',
      livree: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      annulee: 'bg-rose-50 text-rose-700 border-rose-200'
    };
    const labels = {
      en_attente: 'En attente',
      confirmee: 'Confirmée',
      expediee: 'Expédiée',
      livree: 'Livrée',
      annulee: 'Annulée'
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status] || 'bg-stone-100 text-stone-600'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-stone-700" /> : <ChevronDown className="w-3.5 h-3.5 text-stone-700" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-stone-800" />
            Gestion des Commandes
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Consultez, gérez et suivez l'état des commandes enregistrées.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors shadow-sm self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Recherche et Filtre */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          {loading && hasLoaded && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
          )}
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, ID, wilaya..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setDebouncedSearch(searchTerm.trim()); setPage(1); } }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-stone-500 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full md:w-auto px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 bg-white cursor-pointer"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="confirmee">Confirmée</option>
            <option value="expediee">Expédiée</option>
            <option value="livree">Livrée</option>
            <option value="annulee">Annulée</option>
          </select>
        </div>
      </div>

      {/* Tableau des Commandes */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {loading && !hasLoaded ? (
          <div className="p-12 text-center text-stone-500 flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-stone-400" />
            <span>Chargement des commandes...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            Aucune commande trouvée.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  <th onClick={() => handleSort('id')} className="py-3.5 px-6 cursor-pointer select-none group hover:bg-stone-100/60 transition-colors">
                    <div className="flex items-center gap-1.5">
                      <span>N° / Date</span>
                      {renderSortIcon('id')}
                    </div>
                  </th>
                  <th className="py-3.5 px-6">Client & Contact</th>
                  <th className="py-3.5 px-6">Adresse & Wilaya</th>
                  <th className="py-3.5 px-6">Articles commandés</th>
                  <th onClick={() => handleSort('total_amount')} className="py-3.5 px-6 cursor-pointer select-none group hover:bg-stone-100/60 transition-colors">
                    <div className="flex items-center gap-1.5">
                      <span>Montant</span>
                      {renderSortIcon('total_amount')}
                    </div>
                  </th>
                  <th className="py-3.5 px-6">Statut</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {filteredOrders.map((order) => {
                  const isEditing = editingId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                      {/* ID & Date */}
                      <td className="py-4 px-6 font-mono text-xs text-stone-600 align-top">
                        <div className="font-semibold text-stone-900">#{order.id}</div>
                        <div className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
                          }) : '-'}
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-4 px-6 align-top">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Prénom"
                              value={editFormData.customer_first_name}
                              onChange={(e) => setEditFormData({ ...editFormData, customer_first_name: e.target.value })}
                              className="w-full px-2 py-1 text-xs border border-stone-300 rounded"
                            />
                            <input
                              type="text"
                              placeholder="Nom"
                              value={editFormData.customer_last_name}
                              onChange={(e) => setEditFormData({ ...editFormData, customer_last_name: e.target.value })}
                              className="w-full px-2 py-1 text-xs border border-stone-300 rounded"
                            />
                            <input
                              type="text"
                              placeholder="Téléphone"
                              value={editFormData.customer_phone}
                              onChange={(e) => setEditFormData({ ...editFormData, customer_phone: e.target.value })}
                              className="w-full px-2 py-1 text-xs border border-stone-300 rounded"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-stone-900 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-stone-400" />
                              {order.customer_first_name} {order.customer_last_name}
                            </div>
                            <div className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-stone-400" />
                              {order.customer_phone}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Adresse */}
                      <td className="py-4 px-6 align-top">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Wilaya"
                              value={editFormData.wilaya}
                              onChange={(e) => setEditFormData({ ...editFormData, wilaya: e.target.value })}
                              className="w-full px-2 py-1 text-xs border border-stone-300 rounded"
                            />
                            <input
                              type="text"
                              placeholder="Commune"
                              value={editFormData.commune}
                              onChange={(e) => setEditFormData({ ...editFormData, commune: e.target.value })}
                              className="w-full px-2 py-1 text-xs border border-stone-300 rounded"
                            />
                            <textarea
                              placeholder="Adresse de livraison"
                              value={editFormData.delivery_address}
                              onChange={(e) => setEditFormData({ ...editFormData, delivery_address: e.target.value })}
                              className="w-full px-2 py-1 text-xs border border-stone-300 rounded"
                              rows={2}
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-stone-800 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-stone-400" />
                              {order.wilaya} {order.commune ? `(${order.commune})` : ''}
                            </div>
                            <div className="text-xs text-stone-500 mt-0.5 line-clamp-2">
                              {order.delivery_address}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Produits commandés */}
                      <td className="py-4 px-6 align-top">
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-1.5 max-w-xs">
                            {order.items.map((item, idx) => {
                              const isPack = item.item_type === 'pack';
                              return (
                                <div key={item.id || idx} className="text-xs border-b border-stone-100 pb-1.5 last:border-none">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-medium text-stone-800 flex items-center gap-1.5 min-w-0" title={item.product_name}>
                                      {isPack && (
                                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 text-[9px] font-bold uppercase tracking-wider">
                                          Pack
                                        </span>
                                      )}
                                      <span className="truncate">{item.product_name}</span>
                                    </span>
                                    <span className="text-stone-500 shrink-0 font-mono">
                                      x{item.quantity} ({item.unit_price} DA)
                                    </span>
                                  </div>

                                  {/* Contenu du pack */}
                                  {isPack && item.pack_products && item.pack_products.length > 0 && (
                                    <ul className="mt-1 ml-1 pl-2 border-l border-stone-200 text-[11px] text-stone-400 space-y-0.5">
                                      {item.pack_products.map((p, i) => (
                                        <li key={i}>{p.quantity}× {p.name}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400 italic">Aucun détail</span>
                        )}
                      </td>

                      {/* Montant */}
                      <td className="py-4 px-6 align-top font-semibold text-stone-900 font-mono">
                        {order.total_amount} DA
                      </td>

                      {/* Statut */}
                      <td className="py-4 px-6 align-top">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-xs border border-stone-200 rounded-md p-1 bg-stone-50 font-medium focus:outline-none focus:ring-1 focus:ring-stone-900 cursor-pointer"
                        >
                          <option value="en_attente">En attente</option>
                          <option value="confirmee">Confirmée</option>
                          <option value="expediee">Expédiée</option>
                          <option value="livree">Livrée</option>
                          <option value="annulee">Annulée</option>
                        </select>
                        <div className="mt-1.5">{getStatusBadge(order.status)}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 align-top text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleSaveEdit(order.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Enregistrer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 text-stone-400 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                              title="Annuler"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(order)}
                              className="p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 rounded-lg transition-colors cursor-pointer"
                              title="Éditer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(order)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        />
      </div>

      {/* MODAL DE CONFIRMATION DE SUPPRESSION (Style de l'image 2) */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 text-center shadow-xl border border-stone-100 flex flex-col items-center">
            
            {/* Icône d'avertissement arrondie */}
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>

            {/* Titre */}
            <h3 className="font-serif text-xl font-semibold text-stone-900 mb-2">
              Supprimer cette commande ?
            </h3>

            {/* Description */}
            <p className="text-sm text-stone-500 leading-relaxed mb-6 max-w-xs">
              Êtes-vous sûr de vouloir supprimer définitivement la commande{' '}
              <span className="font-semibold text-stone-800">"{deleteModal.customerName}"</span> ?{' '}
              Cette action est irréversible.
            </p>

            {/* Boutons d'action */}
            <div className="flex items-center justify-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, orderId: null, customerName: '' })}
                className="px-5 py-2.5 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#e11d48] hover:bg-[#be123c] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Supprimer
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;