import React, { useState, useEffect } from 'react';
import API from '../../services/api'; // ✅ Utilise l'instance sécurisée
import { 
  Bell, Trash2, Send, CheckCircle, AlertTriangle, Info, AlertCircle, Tag, AlignLeft 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', body: '', type: 'info' });
  const [isSending, setIsSending] = useState(false);

  // ✅ Style réutilisable pour les champs bien encadrés
  const inputStyle = "w-full mt-1 p-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none font-bold transition-all duration-200 placeholder:text-gray-300";

  // Charger les notifs
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/notifications'); // ✅ Token automatique
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Erreur chargement notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  // Envoyer une notif
  const handleSend = async (e) => {
      e.preventDefault();
      setIsSending(true);
      try {
          const res = await API.post('/api/notifications', formData); // ✅ Token automatique
          setNotifications([res.data, ...notifications]);
          setFormData({ title: '', body: '', type: 'info' }); 
          alert("🚀 Annonce diffusée à toute la communauté !");
      } catch (err) {
          alert("Erreur lors de l'envoi.");
      } finally {
          setIsSending(false);
      }
  };

  // Supprimer
  const handleDelete = async (id) => {
      if(!window.confirm("Supprimer cet historique ?")) return;
      try {
          await API.delete(`/api/notifications/${id}`); // ✅ Token automatique
          setNotifications(notifications.filter(n => n._id !== id));
      } catch (err) { alert("Erreur lors de la suppression."); }
  };

  const getTypeIcon = (type) => {
      switch(type) {
          case 'success': return <CheckCircle className="text-green-500" />;
          case 'warning': return <AlertTriangle className="text-orange-500" />;
          case 'alert': return <AlertCircle className="text-red-500" />;
          default: return <Info className="text-blue-500" />;
      }
  };

  const getTypeStyle = (type) => {
      switch(type) {
          case 'success': return "bg-green-50 border-green-100";
          case 'warning': return "bg-orange-50 border-orange-100";
          case 'alert': return "bg-red-50 border-red-100";
          default: return "bg-blue-50 border-blue-100";
      }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-10">
        <div>
            <h1 className="text-4xl font-serif font-bold text-gray-900 flex items-center gap-4">
               <div className="p-3 bg-gold-500 rounded-2xl text-white shadow-lg shadow-gold-500/20"><Bell size={32} /></div>
               Centre de Notifications
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Diffusez des messages instantanés à tous les fidèles (Web & Mobile).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
          
          {/* GAUCHE : FORMULAIRE D'ENVOI */}
          <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 sticky top-24">
                  <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-primary-900">
                     <Send size={20} className="text-gold-500"/> Nouvelle Annonce
                  </h3>
                  <form onSubmit={handleSend} className="space-y-6">
                      <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                             <Tag size={12}/> Titre de l'alerte
                          </label>
                          <input type="text" required placeholder="Ex: Maintenance, Gamou..." 
                              className={inputStyle}
                              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Niveau d'urgence</label>
                          <div className="grid grid-cols-4 gap-3">
                              {['info', 'success', 'warning', 'alert'].map(t => (
                                  <button 
                                    key={t} type="button"
                                    onClick={() => setFormData({...formData, type: t})}
                                    className={`p-3 rounded-2xl flex justify-center border-2 transition-all ${formData.type === t ? 'border-primary-500 bg-primary-50 shadow-inner' : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200'}`}
                                    title={t}
                                  >
                                      {getTypeIcon(t)}
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                             <AlignLeft size={12}/> Message de diffusion
                          </label>
                          <textarea required placeholder="Rédigez votre annonce ici..." rows="5"
                              className={`${inputStyle} resize-none font-medium`}
                              value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})}
                          />
                      </div>
                      <button type="submit" disabled={isSending} className="w-full py-5 bg-primary-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-gold-500 hover:text-primary-900 transition-all shadow-xl flex items-center justify-center gap-3 transform active:scale-95 disabled:bg-gray-200">
                          {isSending ? <Loader className="animate-spin" size={18}/> : <>Diffuser l'annonce <Send size={18}/></>}
                      </button>
                  </form>
              </div>
          </div>

          {/* DROITE : LISTE DES NOTIFS */}
          <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-gray-700 text-lg">Historique des diffusions</h3>
                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-bold">{notifications.length} messages</span>
              </div>
              
              {loading ? (
                  <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100"><Loader className="animate-spin inline-block text-gold-500" size={40}/></div>
              ) : (notifications?.length || 0) === 0 ? (
                  <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 text-gray-400 font-medium italic">Aucun historique de diffusion.</div>
              ) : (
                  <AnimatePresence>
                      {notifications.map((notif) => (
                          <motion.div 
                              key={notif._id}
                              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                              className={`p-6 rounded-[2rem] border-2 flex items-start justify-between group transition-all hover:shadow-lg ${getTypeStyle(notif.type)}`}
                          >
                              <div className="flex gap-5">
                                  <div className="mt-1 bg-white p-3 rounded-2xl shadow-sm">{getTypeIcon(notif.type)}</div>
                                  <div>
                                      <h4 className="font-bold text-gray-900 text-lg">{notif.title}</h4>
                                      <p className="text-gray-600 mt-2 whitespace-pre-wrap leading-relaxed">{notif.body}</p>
                                      <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                         Envoyé le {new Date(notif.date).toLocaleDateString()} à {new Date(notif.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </div>
                                  </div>
                              </div>
                              <button onClick={() => handleDelete(notif._id)} className="p-3 bg-white text-gray-400 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-transparent hover:border-red-100">
                                  <Trash2 size={20}/>
                              </button>
                          </motion.div>
                      ))}
                  </AnimatePresence>
              )}
          </div>

      </div>
    </AdminLayout>
  );
}