import React, { useState, useEffect } from 'react';
import API from '../../services/api'; // ✅ Utilise l'instance sécurisée au lieu d'axios
import AdminLayout from './AdminLayout'; //
import { Mail, User, Clock, Trash2, Phone, MessageSquare, RefreshCw, Loader, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les messages via l'API centralisée
  const fetchMessages = async () => {
    setLoading(true);
    try {
      // ✅ L'intercepteur injecte automatiquement le token déchiffré
      const res = await API.get('/api/contact');
      setMessages(res.data || []); // ✅ Sécurité sur les données reçues
    } catch (err) {
      console.error("Erreur lors de la récupération des messages :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Supprimer un message
  const handleDelete = async (id) => {
      if(!window.confirm("Voulez-vous vraiment supprimer ce message de l'historique ?")) return;
      try {
          await API.delete(`/api/contact/${id}`); // ✅ Suppression sécurisée
          setMessages(messages.filter(m => m._id !== id));
      } catch (err) {
          alert("Erreur lors de la suppression");
      }
  };

  // Détection si c'est un email ou un téléphone pour le bouton répondre
  const getReplyLink = (contact) => {
      if(!contact) return "#";
      if(contact.includes('@')) return `mailto:${contact}`;
      return `tel:${contact}`;
  };

  return (
    <AdminLayout>
      {/* HEADER DE LA MESSAGERIE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
            <h1 className="text-4xl font-serif font-bold text-primary-900 flex items-center gap-4">
               <div className="p-3 bg-gold-500 rounded-2xl text-white shadow-lg shadow-gold-500/20">
                 <MessageSquare size={32} />
               </div>
               Messagerie
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Gérez les demandes de contact et les retours des visiteurs.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="bg-white px-5 py-2.5 rounded-2xl border-2 border-gray-100 shadow-sm text-sm font-black text-primary-900">
              Total : {messages.length}
            </div>
            <button 
              onClick={fetchMessages} 
              className="p-3 bg-primary-900 text-white rounded-2xl hover:bg-gold-500 hover:text-primary-900 transition-all shadow-lg active:scale-95"
              title="Rafraîchir"
            >
              <RefreshCw size={22} className={loading ? "animate-spin" : ""}/>
            </button>
        </div>
      </div>
      
      {/* LISTE DES MESSAGES */}
      <div className="space-y-6 pb-20">
        {loading ? (
             <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
               <Loader className="animate-spin inline-block text-gold-500" size={48} />
               <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs">Ouverture des plis...</p>
             </div>
        ) : (messages?.length || 0) === 0 ? (
            <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 shadow-inner">
                <Mail className="mx-auto h-16 w-16 text-gray-200 mb-4" />
                <p className="text-gray-400 font-serif text-xl italic">La boîte aux lettres est vide pour le moment.</p>
            </div>
        ) : (
          <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div 
                key={msg._id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-gray-100 hover:border-primary-100 hover:shadow-xl transition-all group relative overflow-hidden"
            >
              {/* Effet décoratif discret */}
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                <Mail size={120} />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="bg-primary-50 p-4 rounded-2xl border-2 border-primary-100 group-hover:bg-primary-900 group-hover:border-primary-900 transition-colors">
                    <User className="h-7 w-7 text-primary-900 group-hover:text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">{msg.name}</h3>
                    <div className="flex items-center gap-2 text-sm font-bold text-primary-600 mt-1">
                        {msg.emailOrPhone?.includes('@') ? <Mail size={14}/> : <Phone size={14}/>}
                        {msg.emailOrPhone}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center text-[10px] font-black text-gray-400 bg-gray-50 px-4 py-2 rounded-full uppercase tracking-widest border border-gray-100">
                        <Clock className="h-3 w-3 mr-2 text-gold-500" />
                        {new Date(msg.date).toLocaleDateString()} à {new Date(msg.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <button 
                        onClick={() => handleDelete(msg._id)}
                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-red-100"
                        title="Supprimer"
                    >
                        <Trash2 size={20}/>
                    </button>
                </div>
              </div>
              
              {/* Contenu du message - Bien encadré pour une lecture claire */}
              <div className="bg-gray-50 p-6 rounded-2xl text-gray-700 leading-relaxed border-2 border-gray-100 relative mb-6 font-medium">
                <div className="absolute top-0 left-6 -mt-2.5 w-5 h-5 bg-gray-50 border-t-2 border-l-2 border-gray-100 transform rotate-45"></div>
                {msg.message}
              </div>
              
              <div className="flex justify-end relative z-10">
                <a 
                    href={getReplyLink(msg.emailOrPhone)} 
                    className="inline-flex items-center gap-3 px-6 py-3.5 bg-primary-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-primary-900 transition-all shadow-lg shadow-primary-900/10 active:scale-95"
                >
                  {msg.emailOrPhone?.includes('@') ? <><Mail size={18}/> Répondre par Email</> : <><Phone size={18}/> Contacter le client</>}
                </a>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        )}
      </div>
    </AdminLayout>
  );
}