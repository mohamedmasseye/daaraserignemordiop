import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import CategoryManager from './CategoryManager';
import { Trash2, Plus, Image, Film, Upload, Loader, X, CheckSquare, Square } from 'lucide-react';

export default function AdminGallery() {
  const [mediaList, setMediaList] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // État global de chargement (ajout ou suppression)
  
  const [formData, setFormData] = useState({ title: '', category: '', type: 'photo' });
  const [files, setFiles] = useState([]);

  // --- NOUVEAU : GESTION DE LA SÉLECTION ---
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchMedia = async () => {
    try {
      const res = await axios.get('https://daara-app.onrender.com/api/media');
      setMediaList(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchMedia(); }, []);

  // --- FONCTIONS DE SÉLECTION ---
  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === mediaList.length) {
      setSelectedIds([]); // Tout désélectionner
    } else {
      setSelectedIds(mediaList.map(m => m._id)); // Tout sélectionner
    }
  };

  // --- SUPPRESSION DE MASSE ---
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    if (window.confirm(`⚠️ Voulez-vous vraiment supprimer ces ${selectedIds.length} éléments définitivement ?`)) {
      setIsProcessing(true);
      try {
        // On boucle sur chaque ID sélectionné et on envoie une requête DELETE
        for (const id of selectedIds) {
          await axios.delete(`https://daara-app.onrender.com/api/media/${id}`);
        }
        
        // Mise à jour locale (plus rapide que de refetch tout)
        setMediaList(mediaList.filter(m => !selectedIds.includes(m._id)));
        setSelectedIds([]); // On vide la sélection
        alert("Suppression terminée avec succès !");
        
      } catch (error) {
        console.error(error);
        alert("Une erreur est survenue lors de la suppression de certains éléments.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // --- AJOUT MULTIPLE (Identique à avant) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return alert("Sélectionnez une catégorie");
    if (files.length === 0) return alert("Veuillez sélectionner au moins un fichier");

    setIsProcessing(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const currentFile = files[i];
        const data = new FormData();
        const itemTitle = files.length > 1 ? `${formData.title} ${i + 1}` : formData.title;

        data.append('title', itemTitle);
        data.append('category', formData.category);
        data.append('type', formData.type);
        data.append('mediaFile', currentFile);

        await axios.post('https://daara-app.onrender.com/api/media', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      alert(`${files.length} média(s) ajouté(s) !`);
      setFormData({ title: '', category: '', type: 'photo' });
      setFiles([]);
      document.getElementById('fileInput').value = ""; 
      setIsFormVisible(false);
      fetchMedia(); 
    } catch (error) { 
      console.error(error);
      alert("Erreur lors de l'upload."); 
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AdminLayout>
      {/* EN-TÊTE AVEC ACTIONS DE MASSE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 font-serif">Galerie Photo & Vidéo</h1>
          <p className="text-gray-500 text-sm mt-1">
            {mediaList.length} éléments • {selectedIds.length} sélectionné(s)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Boutons d'action conditionnels */}
          {selectedIds.length > 0 ? (
            <>
              <button 
                onClick={handleBulkDelete}
                disabled={isProcessing}
                className="bg-red-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:bg-red-700 transition flex items-center gap-2 animate-pulse"
              >
                {isProcessing ? <Loader size={20} className="animate-spin"/> : <Trash2 size={20}/>}
                Supprimer ({selectedIds.length})
              </button>
              
              <button 
                onClick={() => setSelectedIds([])}
                className="bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
              >
                Annuler
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsFormVisible(!isFormVisible)} 
              className={`${isFormVisible ? 'bg-gray-500' : 'bg-purple-600 hover:bg-purple-700'} text-white px-6 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2`}
            >
              {isFormVisible ? 'Fermer' : <><Plus size={20}/> Ajouter Média</>}
            </button>
          )}
        </div>
      </div>

      {/* BARRE DE SÉLECTION RAPIDE */}
      {mediaList.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <button 
            onClick={toggleSelectAll}
            className="text-sm font-bold text-purple-700 hover:bg-purple-50 px-3 py-2 rounded-lg transition flex items-center gap-2"
          >
            {selectedIds.length === mediaList.length ? <CheckSquare size={18}/> : <Square size={18}/>}
            {selectedIds.length === mediaList.length ? "Tout désélectionner" : "Tout sélectionner"}
          </button>
        </div>
      )}

      {/* FORMULAIRE D'AJOUT (Inchangé ou presque) */}
      {isFormVisible && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8 animate-fade-in-down">
          <h2 className="text-lg font-bold mb-4 text-purple-800 flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg"><Upload size={20}/></div>
            Ajout Multiple
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
             {/* ... (Le contenu du formulaire reste identique à ton code précédent) ... */}
             {/* Pour gagner de la place ici, je remets le bloc formulaire standard */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Titre (base)</label>
                  <input type="text" placeholder="Ex: Ziarra 2024" className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Type</label>
                  <select className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="photo">Photo</option>
                    <option value="video">Vidéo</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <CategoryManager type="media" selectedCategory={formData.category} onSelectCategory={(cat) => setFormData({...formData, category: cat})} />
                <div className={`p-4 border-2 border-dashed rounded-xl transition relative ${files.length > 0 ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50 hover:bg-white'}`}>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block text-center cursor-pointer">{files.length > 0 ? `${files.length} fichier(s)` : "Sélectionner fichiers"}</label>
                  <input id="fileInput" type="file" multiple accept={formData.type === 'photo' ? "image/*" : "video/*"} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setFiles(e.target.files)} required />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isProcessing} className={`text-white px-8 py-3 rounded-xl font-bold transition shadow-md flex items-center gap-2 ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}>
                {isProcessing ? <Loader size={20} className="animate-spin" /> : `Enregistrer`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GRILLE DES MÉDIAS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mediaList.map((item) => {
          const isSelected = selectedIds.includes(item._id);
          return (
            <div 
              key={item._id} 
              // Au clic sur la carte, on sélectionne (sauf si on clique sur des boutons spécifiques)
              onClick={() => toggleSelect(item._id)}
              className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border cursor-pointer ${isSelected ? 'border-purple-600 ring-2 ring-purple-600 ring-offset-2' : 'border-gray-100'}`}
            >
              
              {/* CHECKBOX DE SÉLECTION (Visible tout le temps ou si sélectionné) */}
              <div className="absolute top-2 left-2 z-30">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-purple-600 border-purple-600' : 'bg-white/80 border-gray-400 group-hover:border-purple-400'}`}>
                  {isSelected && <CheckSquare size={14} className="text-white" />}
                </div>
              </div>

              {/* IMAGE / VIDEO */}
              <div className="aspect-square relative">
                {item.type === 'photo' ? (
                  <img src={item.url} alt={item.title} className={`w-full h-full object-cover transition duration-700 ${isSelected ? 'scale-95' : 'group-hover:scale-110'}`} />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center group-hover:bg-gray-800 transition">
                     <Film className="text-white w-12 h-12 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
                
                {/* Overlay au survol (Info + Suppression unique) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                  <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider mb-1">{item.category}</span>
                  <h3 className="text-white font-bold text-sm truncate leading-tight">{item.title}</h3>
                </div>
              </div>

              {/* BADGE TYPE (Déplacé en bas à gauche pour laisser la place à la checkbox) */}
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 text-gray-800 shadow-sm z-20">
                {item.type === 'photo' ? <Image size={10} className="text-purple-600"/> : <Film size={10} className="text-red-600"/>} 
                <span className="uppercase">{item.type}</span>
              </div>

            </div>
          );
        })}
        
        {mediaList.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
            <Image size={48} className="mx-auto mb-4 opacity-20" />
            <p>Aucun média pour le moment.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}