import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import { Mail, User, Clock, Trash2, Phone, MessageSquare, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les messages
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // ⚠️ IMPORTANT : On ajoute le header Authorization
      const res = await axios.get('https://daara-app.onrender.com/api/contact', {
          headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Supprimer un message
  const handleDelete = async (id) => {
      if(!window.confirm("Supprimer ce message ?")) return;
      try {
          const token = localStorage.getItem('token');
          await axios.delete(`https://daara-app.onrender.com/api/contact/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setMessages(messages.filter(m => m._id !== id));
      } catch (err) {
          alert("Erreur lors de la suppression");
      }
  };

  // Détection si c'est un email ou un téléphone pour le bouton répondre
  const getReplyLink = (contact) => {
      if(contact.includes('@')) return `mailto:${contact}`;
      return `tel:${contact}`;
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 font-serif flex items-center gap-3">
             <MessageSquare className="text-gold-500" size={32} /> Messagerie
            </h1>
            <p className="text-gray-500 mt-1">Gérez les demandes de contact des visiteurs.</p>
        </div>
        <div className="flex items-center gap-2">
            <span className="bg-white px-3 py-1 rounded-lg border text-sm font-bold text-gray-500">Total : {messages.length}</span>
            <button onClick={fetchMessages} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"><RefreshCw size={20}/></button>
        </div>
      </div>
      
      <div className="space-y-4">
        {loading ? (
             <div className="text-center py-12"><div className="animate-spin inline-block w-8 h-8 border-4 border-gold-500 rounded-full border-t-transparent"></div></div>
        ) : messages.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Mail className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">Aucun message reçu pour le moment.</p>
            </div>
        ) : (
          <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div 
                key={msg._id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary-50 p-3 rounded-full border border-primary-100">
                    <User className="h-6 w-6 text-primary-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{msg.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        {msg.emailOrPhone.includes('@') ? <Mail size={14}/> : <Phone size={14}/>}
                        {msg.emailOrPhone}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(msg.date).toLocaleDateString()} à {new Date(msg.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <button 
                        onClick={() => handleDelete(msg._id)}
                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition opacity-0 group-hover:opacity-100"
                        title="Supprimer"
                    >
                        <Trash2 size={18}/>
                    </button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-5 rounded-xl text-gray-700 leading-relaxed border border-gray-100 relative">
                <div className="absolute top-0 left-4 -mt-2 w-4 h-4 bg-gray-50 border-t border-l border-gray-100 transform rotate-45"></div>
                {msg.message}
              </div>
              
              <div className="mt-4 flex justify-end">
                <a 
                    href={getReplyLink(msg.emailOrPhone)} 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-900 text-white rounded-lg font-bold text-sm hover:bg-gold-500 hover:text-primary-900 transition shadow-sm"
                >
                  {msg.emailOrPhone.includes('@') ? <><Mail size={16}/> Répondre par Email</> : <><Phone size={16}/> Appeler / SMS</>}
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