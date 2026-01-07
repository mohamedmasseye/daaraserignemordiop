import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, LogOut, MapPin, Phone, Camera, Save, X, 
  Ticket, Download, Calendar, QrCode, Mail, ShoppingBag, 
  CheckCircle, Package, Truck, Clock, AlertCircle, Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- IMPORTS SÉCURITÉ & CONTEXTE ---
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ... (Garder tes composants SmartTimeline, DeliveredBanner, ClassyTicket tels quels)

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user: authUser, logout, token } = useAuth(); // ✅ Utilisation du contexte
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ bio: '', city: '', phone: '', avatar: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // 1. Chargement des infos utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const resUser = await API.get('/api/auth/me'); // ✅ Utilise l'intercepteur
        setUser(resUser.data);
        setFormData({ 
          bio: resUser.data.bio || '', 
          city: resUser.data.city || '', 
          phone: resUser.data.phone || '', 
          avatar: resUser.data.avatar || '' 
        });
      } catch (err) {
        console.error("Erreur Profil:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
            logout(); // ✅ Déconnexion propre si token expiré
        }
      } finally { setLoading(false); }
    };

    if (token) fetchUserData();
  }, [token, logout]);

  // 2. Chargement des commandes et billets
  useEffect(() => {
    const fetchLiveUpdates = async () => {
        if (!token) return;
        try {
            const [resOrders, resTickets] = await Promise.all([
                API.get('/api/my-orders'),
                API.get('/api/my-tickets')
            ]);
            setOrders(resOrders.data);
            setTickets(resTickets.data);
        } catch (e) { console.error("Update background error", e); }
    };
    
    fetchLiveUpdates();
    const interval = setInterval(fetchLiveUpdates, 10000); // ✅ Augmenté à 10s pour économiser l'API
    return () => clearInterval(interval);
  }, [token]);

  const handleFileChange = (e) => { 
      const file = e.target.files[0]; 
      if (file) {
          setSelectedFile(file);
          setFormData(prev => ({ ...prev, avatar: URL.createObjectURL(file) }));
      }
  };

  const handleSave = async () => {
      try {
          const dataToSend = new FormData();
          dataToSend.append('fullName', user.fullName);
          dataToSend.append('bio', formData.bio);
          dataToSend.append('city', formData.city);
          dataToSend.append('phone', formData.phone);
          if (selectedFile) dataToSend.append('avatar', selectedFile);

          const res = await API.put('/api/auth/me', dataToSend, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });

          setUser(res.data);
          setIsEditing(false); 
          setSelectedFile(null);
          alert("Profil mis à jour !");
      } catch (err) { alert("Erreur lors de la sauvegarde."); }
  };

  const handleDeleteOrder = async (orderId) => {
      if(!window.confirm("Supprimer de l'historique ?")) return;
      try {
          await API.delete(`/api/orders/${orderId}`);
          setOrders(orders.filter(o => o._id !== orderId));
      } catch (err) { alert("Erreur."); }
  };

  if (loading) return (<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gold-500"></div></div>);
  if (!user) return null;

  const shopOrders = orders.filter(order => order.items.some(item => item.type !== 'ticket'));

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 min-h-screen font-sans">
      
      {/* BLOC 1 : PROFIL */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden relative mb-12">
        <div className="h-48 bg-gradient-to-r from-primary-900 to-primary-700 relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        </div>
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-16 mb-6">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center">
                {(isEditing ? formData.avatar : user.avatar) ? (
                    <img src={isEditing ? formData.avatar : user.avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                    <span className="text-4xl font-bold text-primary-300">{user.fullName?.charAt(0)}</span>
                )}
              </div>
              {isEditing && <div onClick={() => fileInputRef.current.click()} className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer text-gray-600 hover:text-primary-600 transition"><Camera className="h-5 w-5" /></div>}
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </div>
            
            <div className="mt-4 md:mt-0 space-x-3">
              {isEditing ? (
                <>
                    <button onClick={() => { setIsEditing(false); setSelectedFile(null); setFormData({...formData, avatar: user.avatar}); }} className="px-4 py-2 bg-gray-100 rounded-lg font-bold text-gray-600">Annuler</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary-600 rounded-lg font-bold text-white shadow-lg">Enregistrer</button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="px-6 py-2 border-2 border-gray-200 rounded-lg font-bold text-gray-600 hover:border-primary-600 hover:text-primary-600 transition">Modifier le profil</button>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-serif">{user.fullName}</h1>
            <p className="text-primary-600 font-medium flex items-center gap-2 mb-4">
              {user.email ? <><Mail size={16}/> {user.email}</> : <><Phone size={16}/> {user.phone}</>}
            </p>
            {isEditing ? (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="col-span-2">
                    <label className="text-sm font-bold text-gray-700 mb-1 block">Bio</label>
                    <textarea className="w-full p-3 border border-gray-300 rounded-xl outline-none" rows="3" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-700 mb-1 block">Ville</label>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-xl outline-none" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-700 mb-1 block">Téléphone</label>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-xl outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100"><p className="text-gray-600 italic">{user.bio || "Aucune description."}</p></div>
                <div className="flex gap-6 text-gray-600 text-sm font-medium">
                  <div className="flex items-center"><MapPin className="h-5 w-5 mr-2 text-gold-500" />{user.city || "Ville non renseignée"}</div>
                  <div className="flex items-center"><Phone className="h-5 w-5 mr-2 text-gold-500" />{user.phone || "Non renseigné"}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ... (Garder le reste du JSX des Commandes et Billets, ils sont OK) ... */}

      <div className="pt-6 border-t border-gray-200">
        <button onClick={logout} className="text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition flex items-center gap-2">
            <LogOut size={20} /> Se déconnecter
        </button>
      </div>
      <AnimatePresence>{selectedTicket && <ClassyTicket ticket={selectedTicket} userName={user.fullName} onClose={() => setSelectedTicket(null)} />}</AnimatePresence>
    </div>
  );
}