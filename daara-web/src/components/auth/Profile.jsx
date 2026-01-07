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

// --- COMPOSANTS AUXILIAIRES ---
const SmartTimeline = ({ status }) => {
    const steps = [
        { key: 'Pending', label: 'Validée', icon: Clock },
        { key: 'Processing', label: 'Préparation', icon: Package },
        { key: 'Shipping', label: 'En route', icon: Truck },
        { key: 'Delivered', label: 'Livrée', icon: CheckCircle }
    ];
    const currentStepIndex = steps.findIndex(s => s.key === status);
    
    if (status === 'Cancelled') return <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-center text-red-600 font-bold gap-2"><AlertCircle size={20}/> Commande Annulée</div>;

    return (
        <div className="w-full py-4">
            <div className="hidden md:flex justify-between items-center relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full z-0"></div>
                <motion.div className="absolute top-1/2 left-0 h-1 bg-gold-500 -translate-y-1/2 rounded-full z-0" initial={{ width: 0 }} animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }} transition={{ duration: 0.8 }} />
                {steps.map((step, idx) => (
                    <div key={step.key} className="relative z-10 flex flex-col items-center group">
                        <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-colors duration-500 ${idx <= currentStepIndex ? 'bg-gold-500 text-white border-gold-500' : 'bg-gray-50 text-gray-400 border-gray-200'}`}><step.icon size={16} strokeWidth={3} /></div>
                        <span className={`text-xs font-bold mt-2 uppercase tracking-wide ${idx <= currentStepIndex ? 'text-gold-600' : 'text-gray-400'}`}>{step.label}</span>
                    </div>
                ))}
            </div>
            <div className="md:hidden flex flex-col gap-2 pl-2">
                <span className="font-bold text-gold-600">Statut : {status}</span>
            </div>
        </div>
    );
};

const DeliveredBanner = () => (<div className="bg-green-50 p-4 rounded text-center text-green-700 font-bold">Commande Livrée !</div>);

const ClassyTicket = ({ ticket, onClose, userName }) => {
  if (!ticket) return null;
  const handlePrint = () => { window.print(); };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <style type="text/css" media="print">
        {`
          @page { size: landscape; margin: 0; }
          body { margin: 0; padding: 0; height: 100vh; width: 100vw; display: flex; justify-content: center; align-items: center; overflow: hidden; }
          body * { visibility: hidden; height: 0; overflow: hidden; }
          #printable-ticket-container, #printable-ticket-container * { visibility: visible; height: auto; overflow: visible; }
          #printable-ticket-container { position: fixed; left: 50% !important; top: 50% !important; transform: translate(-50%, -50%) scale(0.9) !important; width: 100%; max-width: 900px !important; border: 1px solid #ddd; display: flex !important; flex-direction: row !important; z-index: 99999; }
          .no-print { display: none !important; }
        `}
      </style>

      <motion.div id="printable-ticket-container" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row print:shadow-none print:rounded-none">
        <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition no-print md:text-gray-800 md:bg-gray-100 md:hover:bg-gray-200">
            <X size={20} />
        </button>
        <div className="relative bg-primary-900 text-white p-8 flex-1 overflow-hidden print:bg-primary-900 print:text-white">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-50 rounded-full z-10 hidden md:block print:block"></div>
            <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="w-14 h-14 bg-gold-500/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-gold-500/30">
                    <Ticket className="text-gold-400" size={28} />
                </div>
                <div>
                    <h2 className="text-gold-400 font-serif font-bold tracking-widest uppercase text-sm">Billet Officiel</h2>
                    <p className="text-white/60 text-xs uppercase tracking-wide">Daara Serigne Mor Diop</p>
                </div>
            </div>
            <div className="mb-10 relative z-10">
                <span className="text-gold-300/60 text-[10px] font-bold uppercase tracking-widest block mb-3">Événement</span>
                <h3 className="text-3xl md:text-4xl font-bold leading-tight text-white">{ticket.event?.title || "Événement Spécial"}</h3>
            </div>
            <div className="grid grid-cols-3 gap-8 relative z-10">
                <div>
                    <span className="text-gold-300/60 text-[10px] font-bold block mb-2 uppercase tracking-widest">Date</span>
                    <div className="flex items-center gap-2 font-bold text-xl"><Calendar size={20} className="text-gold-500"/> {ticket.event?.date ? new Date(ticket.event.date).toLocaleDateString() : "--/--"}</div>
                </div>
                <div>
                    <span className="text-gold-300/60 text-[10px] font-bold block mb-2 uppercase tracking-widest">Heure</span>
                    <div className="flex items-center gap-2 font-bold text-xl"><Clock size={20} className="text-gold-500"/> {ticket.event?.date ? new Date(ticket.event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--"}</div>
                </div>
                <div className="col-span-3 md:col-span-1">
                    <span className="text-gold-300/60 text-[10px] font-bold block mb-2 uppercase tracking-widest">Détenteur</span>
                    <p className="font-bold text-lg text-white leading-tight break-words">{userName || "Client Invité"}</p>
                </div>
            </div>
        </div>
        <div className="hidden md:flex flex-col items-center justify-center relative bg-gray-50 w-8 print:flex">
            <div className="h-full border-l-2 border-dashed border-gray-300"></div>
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary-900 rounded-full z-10"></div>
        </div>
        <div className="bg-gray-50 p-8 md:w-80 flex flex-col justify-between relative print:bg-gray-50 print:w-auto">
            <div className="text-center mt-4 relative z-10">
                <div className="inline-block mb-2 px-3 py-1 bg-gray-200 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">Scan Entry</div>
                <div className="bg-white border-2 border-gray-200 p-4 rounded-3xl inline-block shadow-sm mb-4"><QrCode size={140} className="text-gray-900" /></div>
                <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest break-all">ID: {ticket.qrCode || ticket._id}</p>
            </div>
            <div className="mt-6 no-print relative z-10">
                <button className="w-full py-4 bg-primary-900 text-white font-bold rounded-xl hover:bg-gold-500 hover:text-primary-900 transition shadow-lg flex items-center justify-center gap-2 active:scale-95" onClick={handlePrint}><Download size={20}/> Imprimer le Billet</button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- COMPOSANT PRINCIPAL ---
export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user: authUser, logout, token } = useAuth(); //
  
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
        const resUser = await API.get('/api/auth/me'); //
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
            logout(false); //
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
                API.get('/api/my-orders'), //
                API.get('/api/my-tickets') //
            ]);
            setOrders(resOrders.data);
            setTickets(resTickets.data);
        } catch (e) { console.error("Update background error", e); }
    };
    
    fetchLiveUpdates();
    const interval = setInterval(fetchLiveUpdates, 10000);
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

          const res = await API.put('/api/auth/me', dataToSend, { //
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
          await API.delete(`/api/orders/${orderId}`); //
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

      {/* BLOC 2 : COMMANDES */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 font-serif mb-6 flex items-center gap-2"><ShoppingBag className="text-gold-500" /> Suivi de mes Commandes</h2>
        <div className="grid grid-cols-1 gap-8">
            {shopOrders.length > 0 ? shopOrders.map(order => (
                <div key={order._id} className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-all relative group">
                    <button onClick={() => handleDeleteOrder(order._id)} className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-gray-50">
                        <div>
                            <div className="flex items-center gap-3 mb-1"><span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Commande</span><span className="font-mono font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</span></div>
                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="mt-4 md:mt-0 text-right pr-12"><span className="block text-2xl font-bold text-primary-900">{order.totalAmount.toLocaleString()} FCFA</span></div>
                    </div>
                    <div className="mb-8"><SmartTimeline status={order.status} /></div>
                    {order.status === 'Delivered' && <DeliveredBanner />}
                </div>
            )) : <p className="text-center py-12 text-gray-400">Aucune commande.</p>}
        </div>
      </div>

      {/* BLOC 3 : BILLETS */}
      {tickets.length > 0 && (
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 font-serif mb-6 flex items-center gap-2"><Ticket className="text-gold-500" /> Mes Billets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tickets.map((ticket, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col relative">
                    <div className="h-32 bg-primary-900 flex items-center justify-center text-white"><Ticket size={40}/></div>
                    <div className="p-6 flex-1 flex flex-col">
                        <p className="font-bold text-lg mb-2">{ticket.event?.title || "Événement"}</p>
                        <button onClick={() => setSelectedTicket(ticket)} className="mt-auto w-full py-3 rounded-xl border-2 border-primary-900 text-primary-900 font-bold hover:bg-primary-900 hover:text-white transition-all flex items-center justify-center gap-2"><Download size={18} /> Voir le Billet</button>
                    </div>
                </div>
                ))}
            </div>
        </div>
      )}

      <div className="pt-6 border-t border-gray-200">
        <button onClick={() => logout(false)} className="text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition flex items-center gap-2">
            <LogOut size={20} /> Se déconnecter
        </button>
      </div>
      <AnimatePresence>{selectedTicket && <ClassyTicket ticket={selectedTicket} userName={user.fullName} onClose={() => setSelectedTicket(null)} />}</AnimatePresence>
    </div>
  );
}