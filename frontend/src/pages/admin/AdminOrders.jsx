import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Filter, RefreshCw, ChevronDown, ChevronUp, 
  Trash2, Edit, Check, X, Phone, MapPin, User, ArrowUpDown, Clock
} from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  // Récupération des headers d'authentification
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/orders', {
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
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement commandes :", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Corrected: PUT method according to admin.routes.js
      const response = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error("Erreur mise à jour statut:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) return;
    try {
      const response = await fetch(`/api/admin/orders/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setOrders(orders.filter(o => o.id !== id));
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
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
      // Corrected: PUT method according to admin.routes.js
      const response = await fetch(`/api/admin/orders/${id}/details`, {
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
  };

  // Filtering and Sorting
  const filteredOrders = orders
    .filter(order => {
      const fullName = `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.toLowerCase();
      const phone = order.customer_phone || '';
      const wilaya = order.wilaya || '';
      const idStr = order.id ? order.id.toString() : '';

      const matchesSearch = 
        fullName.includes(searchTerm.toLowerCase()) ||
        phone.includes(searchTerm) ||
        idStr.includes(searchTerm) ||
        wilaya.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors shadow-sm self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Recherche et Filtre */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, ID, wilaya..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-stone-500 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 bg-white"
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
        {loading ? (
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
                  <th className="py-3.5 px-6">Produits commandés</th>
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
                          <div className="space-y-1 max-w-xs">
                            {order.items.map((item, idx) => (
                              <div key={item.id || idx} className="text-xs flex items-center justify-between gap-2 border-b border-stone-100 pb-1 last:border-none">
                                <span className="font-medium text-stone-800 truncate" title={item.product_name}>
                                  {item.product_name}
                                </span>
                                <span className="text-stone-500 shrink-0 font-mono">
                                  x{item.quantity} ({item.unit_price} DA)
                                </span>
                              </div>
                            ))}
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
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Enregistrer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 text-stone-400 hover:bg-stone-100 rounded-lg transition-colors"
                              title="Annuler"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(order)}
                              className="p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 rounded-lg transition-colors"
                              title="Éditer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors"
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
      </div>
    </div>
  );
};

export default AdminOrders;