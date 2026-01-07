import React, { useState, useEffect } from 'react';
import API from '../../services/api'; // ✅ Instance sécurisée
import AdminLayout from './AdminLayout';
import CategoryManager from './CategoryManager';
import { Trash2, Plus, Mic, Music, PlayCircle, Loader, User, Clock, CheckCircle, Edit3, X, Save, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPodcast() {
  const [podcasts, setPodcasts] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState('');
  
  const [formData, setFormData] = useState({ title: '', speaker: 'Serigne Mor Diop', category: '', duration: '' });
  const [audioFiles, setAudioFiles] = useState([]); 
  const [coverFile, setCoverFile] = useState(null); 
  
  // Modification
  const [editingPod, setEditingPod] = useState(null);

  const inputStyle = "w-full mt-1 p-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold transition-all placeholder:text-gray-300";

  const fetchPodcasts = async () => {
    try {
      const res = await API.get('/api/podcasts');
      setPodcasts(res.data || []);
    } catch (err) { console.error("Erreur podcasts:", err); }
  };

  useEffect(() => { fetchPodcasts(); }, []);

  const handleEdit = (pod) => {
    setEditingPod(pod);
    setFormData({ title: pod.title, speaker: pod.speaker, category: pod.category, duration: pod.duration || '' });
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingPod(null);
    setFormData({ title: '', speaker: 'Serigne Mor Diop', category: '', duration: '' });
    setAudioFiles([]);
    setCoverFile(null);
    setIsFormVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return alert("Sélectionnez une catégorie");
    setIsUploading(true);

    try {
      if (editingPod) {
        // MODIFICATION
        await API.put(`/api/podcasts/${editingPod._id}`, formData);
        alert("Audio mis à jour !");
      } else {
        // AJOUT MULTIPLE
        if (audioFiles.length === 0) return alert("Sélectionnez au moins un fichier");
        for (let i = 0; i < audioFiles.length; i++) {
          setUploadStep(`Envoi ${i + 1}/${audioFiles.length}...`);
          const data = new FormData();
          data.append('title', formData.title || audioFiles[i].name.replace(/\.[^/.]+$/, ""));
          data.append('speaker', formData.speaker);
          data.append('category', formData.category);
          data.append('duration', formData.duration);
          data.append('audioFile', audioFiles[i]);
          if (coverFile) data.append('coverImageFile', coverFile);

          await API.post('/api/podcasts', data, {
            onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
          });
        }
        alert("Enregistrement réussi !");
      }
      fetchPodcasts();
      cancelEdit();
    } catch (error) { alert("Erreur lors de l'upload."); } 
    finally { setIsUploading(false); }
  };

  const handleDelete = async (id) => {
      if(window.confirm("Supprimer cet audio définitivement ?")) {
          try {
             await API.delete(`/api/podcasts/${id}`);
             setPodcasts(podcasts.filter(p => p._id !== id));
          } catch (error) { alert("Erreur lors de la suppression."); }
      }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 flex items-center gap-4">
            <div className="p-3 bg-rose-500 rounded-2xl text-white shadow-lg"><Mic size={32} /></div>
            Podcasts & Audios
          </h1>
          <p className="text-gray-500 mt-2 font-medium">{podcasts.length} fichiers audio disponibles.</p>
        </div>
        <button onClick={() => { setIsFormVisible(!isFormVisible); if(editingPod) cancelEdit(); }} className={`${isFormVisible ? 'bg-white text-gray-600 border border-gray-200' : 'bg-rose-600 text-white hover:bg-rose-700'} px-8 py-4 rounded-2xl font-bold shadow-xl transition flex items-center gap-2`}>
          {isFormVisible ? <><X size={20}/> Annuler</> : <><Plus size={20}/> Ajouter Podcast</>}
        </button>
      </div>

      <AnimatePresence>
      {isFormVisible && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 mb-12 relative overflow-hidden">
          {isUploading && (
              <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md">
                  <div className="w-80 p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
                      <Loader className="animate-spin h-12 w-12 text-rose-600 mx-auto mb-4"/>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{uploadStep}</h3>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                          <div className="h-full bg-rose-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <span className="font-black text-rose-600">{uploadProgress}%</span>
                  </div>
              </div>
          )}
          
          <h2 className="text-xl font-bold mb-8 text-rose-800 flex items-center gap-3">
             <div className="p-2 bg-rose-100 rounded-xl text-rose-600">{editingPod ? <Edit3 size={24}/> : <Mic size={24}/>}</div>
             {editingPod ? `Modification : ${editingPod.title}` : 'Publier de nouveaux audios'}
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Type size={12}/> Titre de l'audio</label>
                <input type="text" placeholder="Laisser vide pour utiliser le nom du fichier" className={inputStyle} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><User size={12}/> Orateur</label>
                  <input type="text" className={inputStyle} value={formData.speaker} onChange={e => setFormData({...formData, speaker: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Clock size={12}/> Durée (Optionnel)</label>
                  <input type="text" placeholder="Ex: 45:00" className={inputStyle} value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                </div>
              </div>
              <CategoryManager type="podcast" selectedCategory={formData.category} onSelectCategory={(cat) => setFormData({...formData, category: cat})} />
            </div>

            <div className="space-y-6">
               {!editingPod && (
                  <div className="p-6 border-2 border-dashed border-rose-200 rounded-2xl bg-rose-50/30 hover:border-rose-400 transition-colors relative group">
                    <label className="text-xs font-bold text-rose-700 mb-2 block text-center cursor-pointer">{audioFiles.length > 0 ? `${audioFiles.length} fichier(s) sélectionné(s)` : "Sélectionner Fichiers Audio (MP3)"}</label>
                    <input id="audioInput" type="file" multiple accept="audio/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setAudioFiles(e.target.files)} required />
                  </div>
               )}
               <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30 hover:border-gray-400 transition-colors relative group">
                 <label className="text-xs font-bold text-gray-500 mb-2 block text-center">🖼️ Image de Couverture (Optionnel)</label>
                 <input id="coverInput" type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setCoverFile(e.target.files[0])} />
               </div>
               <button type="submit" disabled={isUploading} className="w-full py-5 bg-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-rose-700 transition-all shadow-xl transform active:scale-95">
                 {isUploading ? 'Traitement...' : editingPod ? 'Sauvegarder les modifications' : 'Démarrer la publication'}
               </button>
            </div>
          </form>
        </motion.div>
      )}
      </AnimatePresence>

      <div className="bg-white rounded-[2.5rem] shadow-lg border border-gray-100 overflow-hidden mb-20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
              <th className="px-8 py-5">Titre de l'audio</th>
              <th className="px-8 py-5">Orateur / Catégorie</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {podcasts.map((pod) => (
              <tr key={pod._id} className="group hover:bg-rose-50/30 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 shrink-0 overflow-hidden shadow-inner border border-rose-100">
                      {pod.coverImage ? <img src={pod.coverImage} className="w-full h-full object-cover" alt=""/> : <Music size={24} />}
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 block truncate max-w-[250px]">{pod.title}</span>
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">{pod.duration ? `${pod.duration} min` : 'Format Audio'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                   <p className="text-sm font-bold text-gray-700">{pod.speaker}</p>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter italic">{pod.category}</p>
                </td>
                <td className="px-8 py-5 text-right space-x-2">
                    <a href={pod.audioUrl} target="_blank" rel="noopener noreferrer" className="inline-flex p-3 text-rose-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-rose-100 transition-all"><PlayCircle size={20}/></a>
                    <button onClick={() => handleEdit(pod)} className="p-3 text-primary-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-primary-100 transition-all"><Edit3 size={20}/></button>
                    <button onClick={() => handleDelete(pod._id)} className="p-3 text-red-400 hover:text-red-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-red-100 transition-all"><Trash2 size={20}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {podcasts.length === 0 && <div className="p-20 text-center text-gray-300 italic font-medium">Aucun podcast disponible.</div>}
      </div>
    </AdminLayout>
  );
}