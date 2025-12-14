import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShoppingBag, Search, Filter, Eye, CheckCircle, XCircle, 
  Truck, Package, Clock, MoreVertical, Trash2, MapPin, Phone
} from 'lucide-react';
import AdminLayout from './AdminLayout'; 

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // --- CHARGEMENT ---
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // On ajoute le token ici aussi par sécurité, même si le GET est souvent public
      const response = await axios.get('http://https://daara-app.onrender.com/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
      });
      
      // On ne garde que les commandes produits (pas les tickets seuls)
      const shopOnlyOrders = response.data.filter(order => 
          order.items.some(item => item.type !== 'ticket')
      );

      setOrders(shopOnlyOrders);
      setFilteredOrders(shopOnlyOrders);
    } catch (error) {
      console.error("Erreur chargement commandes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // --- FILTRES ---
  useEffect(() => {
    let result = orders;
    if (statusFilter !== 'All') {
      result = result.filter(o => o.status === statusFilter);
    }
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(o => 
        o._id.toLowerCase().includes(lowerTerm) ||
        (o.user?.fullName || '').toLowerCase().includes(lowerTerm) ||
        (o.customerPhone || '').includes(lowerTerm)
      );
    }
    setFilteredOrders(result);
  }, [searchTerm, statusFilter, orders]);

  // --- ACTIONS CORRIGÉES ---

  // 1. MISE À JOUR STATUT (DÉCOMMENTÉ ET SÉCURISÉ)
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
        const token = localStorage.getItem('token');
        
        // C'EST CETTE LIGNE QUI FAIT LE TRAVAIL SUR LE SERVEUR
        await axios.put(`http://https://daara-app.onrender.com/api/orders/${orderId}`, 
            { status: newStatus },
            { headers: { Authorization: `Bearer ${token}` } } // On montre le badge
        );
        
        // Mise à jour visuelle immédiate
        const updatedOrders = orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o);
        setOrders(updatedOrders);
        
        if (selectedOrder?._id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        
        // alert(`Statut mis à jour : ${newStatus}`); // Feedback optionnel
    } catch (err) {
        console.error(err);
        alert("Erreur mise à jour. Êtes-vous connecté en Admin ?");
    }
  };

  // 2. SUPPRESSION (SÉCURISÉE AVEC TOKEN)
  const handleDelete = async (orderId) => {
      if(!confirm("ATTENTION : Supprimer cette commande définitivement ?")) return;
      
      try {
          const token = localStorage.getItem('token');
          // On envoie le token, sinon le serveur refuse (401 Unauthorized)
          await axios.delete(`http://https://daara-app.onrender.com/api/orders/${orderId}`, {
              headers: { Authorization: `Bearer ${token}` }
          });

          // On retire la commande de la liste
          setOrders(orders.filter(o => o._id !== orderId));
          if(selectedOrder?._id === orderId) setSelectedOrder(null);
          
      } catch(err) { 
          console.error(err);
          alert("Erreur suppression. Vérifiez votre connexion."); 
      }
  };

  // --- RENDU BADGE STATUT ---
  const getStatusBadge = (status) => {
      const styles = {
          'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
          'Processing': 'bg-blue-100 text-blue-700 border-blue-200',
          'Shipping': 'bg-purple-100 text-purple-700 border-purple-200',
          'Delivered': 'bg-green-100 text-green-700 border-green-200',
          'Cancelled': 'bg-red-100 text-red-700 border-red-200',
      };
      const labels = {
          'Pending': 'En Attente',
          'Processing': 'Préparation',
          'Shipping': 'En Route',
          'Delivered': 'Livrée',
          'Cancelled': 'Annulée',
      };
      return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
              {labels[status] || status}
          </span>
      );
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-900 font-serif flex items-center gap-3">
            <ShoppingBag className="text-gold-500" size={32} /> Commandes Boutique
          </h1>
          <p className="text-gray-500 mt-2">Gérez les achats de produits physiques.</p>
        </div>
      </div>

      {/* FILTRES */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
              <input 
                type="text" 
                placeholder="Rechercher (ID, Nom, Tel)..." 
                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-gold-500 outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              {['All', 'Pending', 'Processing', 'Shipping', 'Delivered', 'Cancelled'].map(status => (
                  <button 
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${statusFilter === status ? 'bg-primary-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {status === 'All' ? 'Toutes' : status}
                  </button>
              ))}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LISTE */}
          <div className="lg:col-span-2 space-y-4">
              {loading ? (
                  <div className="text-center py-20 text-gray-400">Chargement...</div>
              ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed text-gray-400">Aucune commande trouvée.</div>
              ) : (
                  filteredOrders.map(order => (
                      <div 
                        key={order._id} 
                        onClick={() => setSelectedOrder(order)}
                        className={`bg-white p-5 rounded-xl border cursor-pointer transition-all hover:shadow-md flex justify-between items-center ${selectedOrder?._id === order._id ? 'border-gold-500 ring-1 ring-gold-500' : 'border-gray-100'}`}
                      >
                          <div>
                              <div className="flex items-center gap-3 mb-1">
                                  <span className="font-mono font-bold text-primary-900">#{order._id.slice(-6).toUpperCase()}</span>
                                  {getStatusBadge(order.status)}
                              </div>
                              <p className="text-sm text-gray-500">
                                  {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} Article(s)
                              </p>
                              <p className="text-sm font-bold text-gray-800 mt-1">{order.user?.fullName || 'Client Inconnu'}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-xl font-bold text-primary-900">{order.totalAmount.toLocaleString()} F</p>
                              <p className="text-xs text-gray-400 uppercase">{order.paymentMethod}</p>
                          </div>
                      </div>
                  ))
              )}
          </div>

          {/* DÉTAILS */}
          <div className="lg:col-span-1">
              {selectedOrder ? (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 sticky top-4 overflow-hidden">
                      <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                          <h3 className="font-bold text-gray-800">Détails Commande</h3>
                          <button onClick={() => setSelectedOrder(null)}><XCircle className="text-gray-400 hover:text-red-500"/></button>
                      </div>
                      
                      <div className="p-6 space-y-6">
                          {/* Info Client */}
                          <div>
                              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Client</h4>
                              <div className="flex items-center gap-3 mb-2">
                                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                                      {selectedOrder.user?.fullName?.charAt(0) || 'U'}
                                  </div>
                                  <div>
                                      <p className="font-bold text-gray-900">{selectedOrder.user?.fullName || 'Inconnu'}</p>
                                      <p className="text-xs text-gray-500">{selectedOrder.user?.email}</p>
                                  </div>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1 pl-13">
                                  <p className="flex items-center gap-2"><Phone size={14}/> {selectedOrder.customerPhone}</p>
                                  <p className="flex items-start gap-2"><MapPin size={14} className="shrink-0 mt-0.5"/> 
                                    {selectedOrder.address?.details || "Pas d'adresse"}, {selectedOrder.address?.city}
                                  </p>
                              </div>
                          </div>

                          <div className="h-px bg-gray-100"></div>

                          {/* Articles */}
                          <div>
                              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Panier ({selectedOrder.items.length})</h4>
                              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                  {selectedOrder.items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between text-sm">
                                          <span className="text-gray-700"><span className="font-bold">x{item.quantity}</span> {item.name}</span>
                                          <span className="font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()} F</span>
                                      </div>
                                  ))}
                              </div>
                              <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed border-gray-200">
                                  <span className="font-bold text-lg">Total</span>
                                  <span className="font-bold text-2xl text-gold-600">{selectedOrder.totalAmount.toLocaleString()} F</span>
                              </div>
                          </div>

                          <div className="h-px bg-gray-100"></div>

                          {/* Actions */}
                          <div>
                              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Modifier le Statut</h4>
                              <div className="grid grid-cols-2 gap-2 mb-4">
                                  <button onClick={() => handleStatusUpdate(selectedOrder._id, 'Processing')} className="py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded hover:bg-blue-100">Préparer</button>
                                  <button onClick={() => handleStatusUpdate(selectedOrder._id, 'Shipping')} className="py-2 bg-purple-50 text-purple-700 text-xs font-bold rounded hover:bg-purple-100">Expédier</button>
                                  <button onClick={() => handleStatusUpdate(selectedOrder._id, 'Delivered')} className="py-2 bg-green-50 text-green-700 text-xs font-bold rounded hover:bg-green-100">Livrer</button>
                                  <button onClick={() => handleStatusUpdate(selectedOrder._id, 'Cancelled')} className="py-2 bg-red-50 text-red-700 text-xs font-bold rounded hover:bg-red-100">Annuler</button>
                              </div>
                              <button onClick={() => handleDelete(selectedOrder._id)} className="w-full py-3 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 flex items-center justify-center gap-2"><Trash2 size={18}/> Supprimer la commande</button>
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center text-gray-400">
                      <ShoppingBag size={48} className="mb-4 opacity-20"/>
                      <p>Sélectionnez une commande pour voir les détails et agir.</p>
                  </div>
              )}
          </div>
      </div>
    </AdminLayout>
  );
}