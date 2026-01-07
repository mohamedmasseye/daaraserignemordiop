import React, { useState, useEffect } from 'react';
import API from '../../services/api'; // ✅ Utilise l'instance sécurisée
import AdminLayout from './AdminLayout';
import CategoryManager from './CategoryManager';
import { Trash2, Plus, Image, Film, Upload, Loader, X, CheckSquare, Square, Edit3, Save, Tag, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminGallery() {
  const [mediaList, setMediaList] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: '', type: 'photo' });
  const [files, setFiles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // État pour la modification
  const [editingItem, setEditingItem] = useState(null);

  const inputStyle = "w-full mt-1 p-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none font-bold transition-all placeholder:text-gray-300";

  const fetchMedia = async () => {
    try {
      const res = await API.get('/api/media');
      setMediaList(res.data || []);
    } catch (err) { console.error("Erreur galerie:", err); }
  };

  useEffect(() => { fetchMedia(); }, []);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(item => item !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === mediaList.length) setSelectedIds([]);
    else setSelectedIds(mediaList.map(m => m._id));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`⚠️ Supprimer définitivement ces ${selectedIds.length} éléments ?`)) {
      setIsProcessing(true);
      try {
        for (const id of selectedIds) { await API.delete(`/api/media/${id}`); }
        setMediaList(mediaList.filter(m => !selectedIds.includes(m._id)));
        setSelectedIds([]);
        alert("Suppression terminée !");
      } catch (error) { alert("Erreur lors de la suppression."); } 
      finally { setIsProcessing(false); }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ title: item.title, category: item.category, type: item.type });
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return alert("Sélectionnez une catégorie");
    setIsProcessing(true);

    try {
      if (editingItem) {
        // MODIFICATION
        await API.put(`/api/media/${editingItem._id}`, formData);
        alert("Média mis à jour !");
      } else {
        // AJOUT MULTIPLE
        if (files.length === 0) return alert("Veuillez sélectionner au moins un fichier");
        for (let i = 0; i < files.length; i++) {
          const data = new FormData();
          data.append('title', files.length > 1 ? `${formData.title} ${i + 1}` : formData.title);
          data.append('category', formData.category);
          data.append('type', formData.type);
          data.append('mediaFile', files[i]);
          await API.post('/api/media', data);
        }
        alert(`${files.length} média(s) ajouté(s) !`);
      }
      
      setFormData({ title: '', category: '', type: 'photo' });
      setFiles([]);
      setEditingItem(null);
      setIsFormVisible(false);
      fetchMedia(); 
    } catch (error) { alert("Erreur lors de l'opération."); } 
    finally { setIsProcessing(false); }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-gray-900">Médiathèque</h1>
          <p className="text-gray-500 mt-2 font-medium">{mediaList.length} éléments • {selectedIds.length} sélectionné(s)</p>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 ? (
            <>
              <button onClick={handleBulkDelete} disabled={isProcessing} className="bg-red-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-red-700 transition flex items-center gap-2 animate-pulse">
                {isProcessing ? <Loader size={18} className="animate-spin"/> : <Trash2 size={18}/>} Supprimer ({selectedIds.length})
              </button>
              <button onClick={() => setSelectedIds([])} className="bg-gray-200 text-gray-700 px-6 py-3.5 rounded-2xl font-bold text-xs uppercase transition">Annuler</button>
            </>
          ) : (
            <button onClick={() => { setIsFormVisible(!isFormVisible); if(editingItem) setEditingItem(null); }} className={`${isFormVisible ? 'bg-white text-gray-600 border border-gray-200' : 'bg-primary-900 text-white hover:bg-primary-800'} px-8 py-4 rounded-2xl font-bold shadow-xl transition flex items-center gap-2`}>
              {isFormVisible ? <><X size={20}/> Fermer</> : <><Plus size={20}/> Ajouter Média</>}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
      {isFormVisible && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 mb-12 relative overflow-hidden">
          <h2 className="text-xl font-bold mb-8 text-primary-900 flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-xl text-primary-600">{editingItem ? <Edit3 size={24}/> : <Upload size={24}/>}</div>
            {editingItem ? `Modifier : ${editingItem.title}` : 'Nouvel Ajout'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Type size={12}/> Titre du média</label>
                  <input type="text" placeholder="Ziarra, Gamou..." className={inputStyle} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Type de contenu</label>
                  <select className={inputStyle} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="photo">📷 Photographie</option>
                    <option value="video">🎥 Vidéo</option>
                  </select>
                </div>
              </div>
              <div className="space-y-6">
                <CategoryManager type="media" selectedCategory={formData.category} onSelectCategory={(cat) => setFormData({...formData, category: cat})} />
                {!editingItem && (
                   <div className="p-6 border-2 border-dashed border-primary-100 rounded-2xl bg-primary-50/30 hover:border-primary-400 transition-colors relative group">
                      <label className="text-xs font-bold text-primary-900 mb-2 block text-center">{files.length > 0 ? `${files.length} fichier(s) prêt(s)` : "Cliquez pour sélectionner vos fichiers"}</label>
                      <input id="fileInput" type="file" multiple accept={formData.type === 'photo' ? "image/*" : "video/*"} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setFiles(e.target.files)} required />
                   </div>
                )}
                <button type="submit" disabled={isProcessing} className="w-full py-5 bg-primary-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gold-500 hover:text-primary-900 transition-all shadow-xl">
                   {isProcessing ? <Loader size={20} className="animate-spin mx-auto" /> : editingItem ? 'Mettre à jour' : `Enregistrer les médias`}
                </button>
              </div>
          </form>
        </motion.div>
      )}
      </AnimatePresence>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
        {mediaList.map((item) => {
          const isSelected = selectedIds.includes(item._id);
          return (
            <div key={item._id} className={`group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border-2 cursor-pointer ${isSelected ? 'border-primary-600 ring-4 ring-primary-500/10' : 'border-gray-100'}`}>
              <div className="absolute top-3 left-3 z-30" onClick={(e) => { e.stopPropagation(); toggleSelect(item._id); }}>
                <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary-900 border-primary-900' : 'bg-white/80 border-gray-300 group-hover:border-primary-400'}`}>
                  {isSelected && <CheckSquare size={16} className="text-white" />}
                </div>
              </div>

              <div className="aspect-square relative" onClick={() => toggleSelect(item._id)}>
                {item.type === 'photo' ? (
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center group-hover:bg-gray-800 transition"><Film className="text-white w-12 h-12 opacity-30 group-hover:opacity-100 transition-opacity" /></div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end">
                   <div className="flex justify-between items-end">
                      <div className="min-w-0">
                        <span className="text-[8px] text-gold-400 font-black uppercase tracking-widest block mb-1">{item.category}</span>
                        <h3 className="text-white font-bold text-sm truncate">{item.title}</h3>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="p-2 bg-white/20 hover:bg-white text-white hover:text-primary-900 rounded-lg backdrop-blur-md transition-all"><Edit3 size={16}/></button>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}