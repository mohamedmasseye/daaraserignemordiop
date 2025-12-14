import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Trash2, Search, Mail, Phone, Shield, RefreshCw, 
  UserPlus, Edit3, Key, X, CheckCircle, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États des Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' ou 'edit'
  
  // Données temporaires pour l'édition/ajout
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', identifier: '', role: 'user', password: '' });
  const [newPassword, setNewPassword] = useState('');

  // --- CHARGEMENT ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://https://daara-app.onrender.com/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Erreur", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- ACTIONS ---

  // 1. Ouvrir Modal Ajout
  const openAddModal = () => {
      setModalType('add');
      setFormData({ fullName: '', identifier: '', role: 'user', password: '' });
      setIsModalOpen(true);
  };

  // 2. Ouvrir Modal Édition
  const openEditModal = (user) => {
      setModalType('edit');
      setCurrentUser(user);
      setFormData({ 
          fullName: user.fullName, 
          identifier: user.email || user.phone, // On affiche l'un ou l'autre
          role: user.role, 
          password: '' // Pas utilisé en edit
      });
      setIsModalOpen(true);
  };

  // 3. Ouvrir Modal Password
  const openPasswordModal = (user) => {
      setCurrentUser(user);
      setNewPassword('');
      setIsPasswordModalOpen(true);
  };

  // --- SOUMISSIONS ---

  const handleSaveUser = async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      try {
          if (modalType === 'add') {
              // Création
              const res = await axios.post('http://https://daara-app.onrender.com/api/users', formData, {
                  headers: { Authorization: `Bearer ${token}` }
              });
              setUsers([res.data, ...users]);
              alert("Utilisateur créé avec succès !");
          } else {
              // Modification (Pas le mot de passe ici)
              const res = await axios.put(`http://https://daara-app.onrender.com/api/users/${currentUser._id}`, {
                  fullName: formData.fullName,
                  role: formData.role
              }, {
                  headers: { Authorization: `Bearer ${token}` }
              });
              setUsers(users.map(u => u._id === currentUser._id ? res.data : u));
              alert("Utilisateur modifié !");
          }
          setIsModalOpen(false);
      } catch (err) {
          alert(err.response?.data?.error || "Une erreur est survenue.");
      }
  };

  const handleResetPassword = async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      try {
          await axios.put(`http://https://daara-app.onrender.com/api/users/${currentUser._id}/reset-password`, {
              newPassword: newPassword
          }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          alert("Mot de passe réinitialisé !");
          setIsPasswordModalOpen(false);
      } catch (err) {
          alert(err.response?.data?.error || "Erreur reset password.");
      }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr ? Cette action est irréversible.")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://https://daara-app.onrender.com/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(users.filter(user => user._id !== id));
      } catch (err) { alert("Erreur suppression"); }
    }
  };

  // --- FILTRES ---
  const filteredUsers = users.filter(user => {
      const search = searchTerm.toLowerCase();
      return (user.fullName || "").toLowerCase().includes(search) ||
             (user.email || "").toLowerCase().includes(search) ||
             (user.phone || "").includes(search);
  });

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 font-serif flex items-center gap-3">
            <Users className="text-gold-500" size={32} /> Administration Utilisateurs
            </h1>
            <p className="text-gray-500 mt-1">Gérez les membres, les admins et leurs privilèges.</p>
        </div>
        <button onClick={openAddModal} className="px-6 py-3 bg-primary-900 text-white rounded-xl font-bold shadow-lg hover:bg-gold-500 hover:text-primary-900 transition flex items-center gap-2 transform hover:scale-105">
            <UserPlus size={20}/> Ajouter un membre
        </button>
      </div>

      {/* BARRE OUTILS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Rechercher (Nom, Email, Tél)..." 
                className="w-full pl-12 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">Total : {users.length}</span>
            <button onClick={fetchUsers} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"><RefreshCw size={18}/></button>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-primary-50/50 text-gray-500 uppercase font-bold text-xs tracking-wider">
              <tr>
                <th className="px-6 py-5">Utilisateur</th>
                <th className="px-6 py-5">Identifiant</th>
                <th className="px-6 py-5">Rôle / Privilèges</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-10"><div className="animate-spin inline-block w-8 h-8 border-4 border-gold-500 rounded-full border-t-transparent"></div></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-10 text-gray-400">Aucun résultat.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-blue-50/30 transition duration-200 group">
                    {/* DANS AdminUsers.jsx - Remplacement de la colonne Avatar */}

<td className="px-6 py-4">
  <div className="flex items-center gap-4">
    
    {/* LOGIQUE AVATAR INTELLIGENTE */}
    <div className="relative w-12 h-12 flex-shrink-0">
        {user.avatar ? (
            <img 
                src={user.avatar} 
                alt={user.fullName}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                onError={(e) => {
                    // ASTUCE : Si l'image plante, on cache l'image et on affiche le div d'initiales qui est juste en dessous
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                }}
            />
        ) : null}

        {/* C'est ce bloc qui s'affiche si pas d'image OU si l'image plante */}
        <div 
            style={{ display: user.avatar ? 'none' : 'flex' }}
            className={`w-12 h-12 rounded-full font-bold items-center justify-center text-lg shadow-sm absolute top-0 left-0 ${user.role === 'admin' ? 'bg-gradient-to-br from-gold-400 to-gold-600 text-white' : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600'}`}
        >
            {(user.fullName || "?").charAt(0).toUpperCase()}
        </div>
    </div>

    {/* Info Nom + Date */}
    <div>
        <p className="font-bold text-gray-900 text-base">{user.fullName}</p>
        <p className="text-xs text-gray-400">Inscrit le {new Date(user.createdAt).toLocaleDateString()}</p>
    </div>
  </div>
</td>
                    <td className="px-6 py-4">
                      {user.email ? (
                          <div className="flex items-center gap-2 text-sm text-gray-700 font-medium bg-white border border-gray-200 px-3 py-1 rounded-full w-fit"><Mail size={14} className="text-blue-500"/> {user.email}</div>
                      ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-700 font-medium bg-white border border-gray-200 px-3 py-1 rounded-full w-fit"><Phone size={14} className="text-green-500"/> {user.phone || "Inconnu"}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-100 text-primary-800 text-xs font-bold border border-primary-200 shadow-sm">
                          <Shield size={14} className="fill-primary-800"/> Administrateur
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                          <Users size={14}/> Membre
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition">
                            <button onClick={() => openEditModal(user)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition" title="Modifier le rôle/infos">
                                <Edit3 size={18}/>
                            </button>
                            <button onClick={() => openPasswordModal(user)} className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition" title="Réinitialiser Mot de passe">
                                <Key size={18}/>
                            </button>
                            {/* Protection : On ne peut pas supprimer le Super Admin */}
                            {user.email !== 'admin@daara.com' && (
                                <button onClick={() => handleDelete(user._id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition" title="Supprimer le compte">
                                    <Trash2 size={18}/>
                                </button>
                            )}
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALE AJOUT / ÉDITION --- */}
      <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.9}} className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-primary-900 p-6 flex justify-between items-center text-white">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            {modalType === 'add' ? <UserPlus/> : <Edit3/>} 
                            {modalType === 'add' ? 'Ajouter un utilisateur' : 'Modifier le profil'}
                        </h3>
                        <button onClick={() => setIsModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"><X size={20}/></button>
                    </div>
                    <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nom Complet</label>
                            <input type="text" required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-gold-500" 
                                value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                        </div>
                        
                        {/* En mode édition, on ne change pas l'email/tél pour éviter les conflits, ou alors il faut gérer l'unicité */}
                        {modalType === 'add' && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email ou Téléphone</label>
                                <input type="text" required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-gold-500" 
                                    value={formData.identifier} onChange={e => setFormData({...formData, identifier: e.target.value})} />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Rôle / Privilèges</label>
                            <select className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                <option value="user">Membre (Utilisateur standard)</option>
                                <option value="admin">Administrateur (Accès complet)</option>
                            </select>
                        </div>

                        {modalType === 'add' && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Mot de passe initial</label>
                                <input type="password" required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-gold-500" 
                                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                            </div>
                        )}

                        <button type="submit" className="w-full py-3 bg-gold-500 text-white font-bold rounded-xl hover:bg-gold-600 transition shadow-lg mt-4">
                            {modalType === 'add' ? 'Créer le compte' : 'Sauvegarder les modifications'}
                        </button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* --- MODALE RESET PASSWORD --- */}
      <AnimatePresence>
        {isPasswordModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.9}} className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border-t-4 border-orange-500">
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2"><Key className="text-orange-500"/> Nouveau mot de passe</h3>
                        <p className="text-sm text-gray-500 mb-4">Définissez un nouveau mot de passe pour <strong>{currentUser?.fullName}</strong>.</p>
                        
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <input type="text" required placeholder="Nouveau mot de passe" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-mono text-center text-lg" 
                                value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">Annuler</button>
                                <button type="submit" className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition shadow-lg">Confirmer</button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </AdminLayout>
  );
}