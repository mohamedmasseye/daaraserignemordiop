import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, Trash2, Send, CheckCircle, AlertTriangle, Info, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Utilisation de "body" au lieu de "message" pour correspondre à votre modèle
  const [formData, setFormData] = useState({ title: '', body: '', type: 'info' });
  const [isSending, setIsSending] = useState(false);

  // Charger les notifs
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
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
          const token = localStorage.getItem('token');
          const res = await axios.post('/api/notifications', formData, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setNotifications([res.data, ...notifications]);
          setFormData({ title: '', body: '', type: 'info' }); // Reset form
          alert("Notification diffusée !");
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
          const token = localStorage.getItem('token');
          await axios.delete(`/api/notifications/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setNotifications(notifications.filter(n => n._id !== id));
      } catch (err) { alert("Erreur."); }
  };

  // Icône selon le type
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
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 font-serif flex items-center gap-3">
            <Bell className="text-gold-500" size={32} /> Centre de Notifications
            </h1>
            <p className="text-gray-500 mt-1">Diffusez des messages importants à votre communauté.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* GAUCHE : FORMULAIRE D'ENVOI */}
          <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Send size={18}/> Nouvelle Annonce</h3>
                  <form onSubmit={handleSend} className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Titre</label>
                          <input type="text" required placeholder="Ex: Maintenance, Promo..." 
                              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-gold-500 mt-1"
                              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                          <div className="grid grid-cols-4 gap-2 mt-1">
                              {['info', 'success', 'warning', 'alert'].map(t => (
                                  <button 
                                    key={t} type="button"
                                    onClick={() => setFormData({...formData, type: t})}
                                    className={`p-2 rounded-lg flex justify-center border-2 transition ${formData.type === t ? 'border-gold-500 bg-gold-50' : 'border-gray-100 hover:bg-gray-50'}`}
                                  >
                                      {getTypeIcon(t)}
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Message</label>
                          {/* Ici on bind sur formData.body */}
                          <textarea required placeholder="Votre message..." rows="4"
                              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-gold-500 mt-1"
                              value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})}
                          />
                      </div>
                      <button type="submit" disabled={isSending} className="w-full py-3 bg-primary-900 text-white font-bold rounded-xl hover:bg-gold-500 hover:text-primary-900 transition shadow-lg flex items-center justify-center gap-2">
                          {isSending ? "Envoi..." : <>Envoyer <Send size={16}/></>}
                      </button>
                  </form>
              </div>
          </div>

          {/* DROITE : LISTE DES NOTIFS */}
          <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-gray-700 text-lg mb-4">Historique des diffusions</h3>
              
              {loading ? (
                  <div className="text-center py-10"><div className="animate-spin inline-block w-8 h-8 border-4 border-gold-500 rounded-full border-t-transparent"></div></div>
              ) : notifications.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">Aucune notification envoyée.</div>
              ) : (
                  <AnimatePresence>
                      {notifications.map((notif) => (
                          <motion.div 
                              key={notif._id}
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }}
                              className={`p-5 rounded-2xl border flex items-start justify-between group ${getTypeStyle(notif.type)}`}
                          >
                              <div className="flex gap-4">
                                  <div className="mt-1">{getTypeIcon(notif.type)}</div>
                                  <div>
                                      <h4 className="font-bold text-gray-900">{notif.title}</h4>
                                      {/* Affichage de notif.body */}
                                      <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{notif.body}</p>
                                      {/* Affichage de notif.date */}
                                      <p className="text-xs text-gray-400 mt-3 font-medium">Envoyé le {new Date(notif.date).toLocaleDateString()} à {new Date(notif.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                  </div>
                              </div>
                              <button onClick={() => handleDelete(notif._id)} className="p-2 bg-white rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100 shadow-sm">
                                  <Trash2 size={16}/>
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