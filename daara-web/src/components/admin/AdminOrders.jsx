import React, { useState, useEffect } from 'react';
import API from '../../services/api'; // ✅ Instance sécurisée
import { 
  ShoppingBag, Search, Eye, CheckCircle, XCircle, 
  Truck, Package, Clock, Trash2, MapPin, Phone, 
  RefreshCw, CreditCard, Loader
} from 'lucide-react';
import AdminLayout from './AdminLayout'; 

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/orders'); 
      const shopOnlyOrders = (res.data || []).filter(order => 
          order?.items?.some(item => item?.type !== 'ticket')
      );
      setOrders(shopOnlyOrders);
      setFilteredOrders(shopOnlyOrders);
    } catch (err) { console.error("Erreur commandes:", err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    let result = orders;
    if (statusFilter !== 'All') result = result.filter(o => o.status === statusFilter);
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

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
        await API.put(`/api/orders/${orderId}`, { status: newStatus });
        const updated = orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o);
        setOrders(updated);
        if (selectedOrder?._id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
        alert(`Statut mis à jour : ${newStatus}`);
    } catch (err) { alert("Erreur mise à jour."); }
  };

  const handleDelete = async (orderId) => {
      if(!window.confirm("⚠️ Supprimer cette commande définitivement ?")) return;
      try {
          await API.delete(`/api/orders/${orderId}`);
          setOrders(orders.filter(o => o._id !== orderId));
          if(selectedOrder?._id === orderId) setSelectedOrder(null);
      } catch(err) { alert("Erreur suppression."); }
  };

  const getStatusBadge = (status) => {
      const styles = {
          'Pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
          'Processing': 'bg-blue-50 text-blue-700 border-blue-200',
          'Shipping': 'bg-purple-50 text-purple-700 border-purple-200',
          'Delivered': 'bg-green-50 text-green-700 border-green-200',
          'Cancelled': 'bg-red-50 text-red-700 border-red-200',
      };
      const labels = {
          'Pending': 'En Attente',
          'Processing': 'Préparation',
          'Shipping': 'En Route',
          'Delivered': 'Livrée',
          'Cancelled': 'Annulée',
      };
      return <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${styles[status] || 'bg-gray-50 text-gray-500'}`}>{labels[status] || status}</span>;
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-primary-900 flex items-center gap-4">
            <div className="p-3 bg-gold-500 rounded-2xl text-white shadow-lg"><ShoppingBag size={32} /></div>
            Commandes Boutique
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Gérez le flux des ventes de produits physiques.</p>
        </div>
        <button onClick={fetchOrders} className="p-4 bg-primary-900 text-white rounded-2xl shadow-xl hover:bg-gold-500 hover:text-primary-900 transition-all active:scale-95"><RefreshCw size={24} className={loading ? "animate-spin" : ""}/></button>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-gray-50 mb-10 flex flex-col lg:flex-row gap-6 justify-between items-center">
          <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20}/>
              <input type="text" placeholder="Rechercher une commande..." className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none font-bold" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
              {['All', 'Pending', 'Processing', 'Shipping', 'Delivered', 'Cancelled'].map(s => (
                  <button key={s} onClick={()=>setStatusFilter(s)} className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === s ? 'bg-primary-900 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{s === 'All' ? 'Toutes' : s}</button>
              ))}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6 pb-20">
              {loading ? <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-50 shadow-sm"><Loader className="animate-spin text-gold-500 mx-auto" size={48}/><p className="mt-4 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Récupération des bordereaux...</p></div> : filteredOrders.length === 0 ? <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 text-gray-300 font-serif text-xl italic">Aucune commande trouvée.</div> : (
                  filteredOrders.map(order => (
                      <div key={order._id} onClick={()=>setSelectedOrder(order)} className={`bg-white p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-300 flex flex-col md:flex-row justify-between items-center group ${selectedOrder?._id === order._id ? 'border-primary-500 shadow-2xl scale-[1.02]' : 'border-gray-50 shadow-sm hover:border-primary-100'}`}>
                          <div className="flex items-center gap-6 w-full">
                              <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-900 group-hover:bg-primary-900 group-hover:text-gold-500 transition-colors"><Package size={28}/></div>
                              <div>
                                  <div className="flex items-center gap-3 mb-1"><span className="font-mono font-black text-primary-900 text-lg">#{order._id.slice(-6).toUpperCase()}</span>{getStatusBadge(order.status)}</div>
                                  <p className="text-sm font-bold text-gray-800">{order.user?.fullName || 'Client Anonyme'}</p>
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mt-1">{new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} Article(s)</p>
                              </div>
                          </div>
                          <div className="mt-4 md:mt-0 text-right w-full md:w-auto shrink-0 flex flex-col items-end">
                              <p className="text-2xl font-black text-primary-900">{(order.totalAmount || 0).toLocaleString()} F</p>
                              <span className="text-[10px] font-black text-gold-600 uppercase tracking-widest flex items-center gap-1"><CreditCard size={10}/> {order.paymentMethod}</span>
                          </div>
                      </div>
                  ))
              )}
          </div>

          <div className="lg:col-span-1">
              {selectedOrder ? (
                  <div className="bg-white rounded-[3rem] shadow-2xl border-2 border-gray-50 sticky top-24 overflow-hidden">
                      <div className="bg-primary-900 p-6 flex justify-between items-center text-white">
                          <h3 className="font-bold text-lg uppercase tracking-widest text-[10px]">Détails du Bordereau</h3>
                          <button onClick={()=>setSelectedOrder(null)} className="p-2 bg-white/10 rounded-full hover:bg-red-500"><XCircle size={20}/></button>
                      </div>
                      
                      <div className="p-8 space-y-8">
                          <div>
                              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Informations Client</h4>
                              <div className="flex items-center gap-4 mb-5">
                                  <div className="w-14 h-14 rounded-2xl bg-gold-50 flex items-center justify-center text-gold-600 border border-gold-100 font-black text-xl">{selectedOrder.user?.fullName?.charAt(0) || 'U'}</div>
                                  <div><p className="font-black text-primary-900">{selectedOrder.user?.fullName || 'Utilisateur'}</p><p className="text-xs text-gray-400 font-medium">{selectedOrder.user?.email || 'Pas d\'email'}</p></div>
                              </div>
                              <div className="space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                  <p className="flex items-center gap-3 text-sm font-bold text-gray-600"><Phone size={16} className="text-gold-500"/> {selectedOrder.customerPhone || 'N/A'}</p>
                                  <p className="flex items-start gap-3 text-sm font-bold text-gray-600"><MapPin size={16} className="text-gold-500 shrink-0 mt-0.5"/> {selectedOrder.address?.details}, {selectedOrder.address?.city}</p>
                              </div>
                          </div>

                          <div>
                              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Panier d'articles</h4>
                              <div className="space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                                  {selectedOrder.items?.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                          <span className="text-sm font-bold text-gray-700">x{item.quantity} <span className="text-primary-900 ml-1">{item.name}</span></span>
                                          <span className="text-xs font-black text-gold-600">{(item.price * item.quantity).toLocaleString()} F</span>
                                      </div>
                                  ))}
                              </div>
                              <div className="mt-6 flex justify-between items-center pt-6 border-t-2 border-dashed border-gray-100"><span className="font-black uppercase text-xs tracking-widest text-gray-400">Total Global</span><span className="text-3xl font-black text-primary-900">{(selectedOrder.totalAmount || 0).toLocaleString()} F</span></div>
                          </div>

                          <div>
                              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Piloter le Statut</h4>
                              <div className="grid grid-cols-2 gap-3 mb-6">
                                  {['Processing', 'Shipping', 'Delivered', 'Cancelled'].map(status => (
                                      <button key={status} onClick={()=>handleStatusUpdate(selectedOrder._id, status)} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${status === 'Cancelled' ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-gray-100 text-primary-900 hover:bg-primary-900 hover:text-white'}`}>{status}</button>
                                  ))}
                              </div>
                              <button onClick={()=>handleDelete(selectedOrder._id)} className="w-full py-4 border-2 border-red-100 text-red-600 font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center justify-center gap-3"><Trash2 size={16}/> Supprimer la commande</button>
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3rem] p-12 text-center h-[500px] flex flex-col items-center justify-center text-gray-300">
                      <div className="w-24 h-24 bg-white rounded-3xl shadow-inner flex items-center justify-center mb-6"><ShoppingBag size={48} className="opacity-20"/></div>
                      <p className="font-serif text-lg italic">Sélectionnez une commande.</p>
                  </div>
              )}
          </div>
      </div>
    </AdminLayout>
  );
}