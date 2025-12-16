import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import CategoryManager from './CategoryManager';
import { Trash2, Plus, Mic, Music, PlayCircle, Loader, User, Clock } from 'lucide-react';

export default function AdminPodcast() {
  const [podcasts, setPodcasts] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({ title: '', speaker: 'Serigne Mor Diop', category: '', duration: '' });
  
  // Gestion de fichiers multiples pour l'audio
  const [audioFiles, setAudioFiles] = useState([]); 
  const [coverFile, setCoverFile] = useState(null); 

  const fetchPodcasts = async () => {
    try {
      const res = await axios.get('https://daara-app.onrender.com/api/podcasts');
      setPodcasts(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchPodcasts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return alert("Sélectionnez une catégorie");
    if (audioFiles.length === 0) return alert("Veuillez sélectionner au moins un fichier audio");

    setIsUploading(true);

    try {
      const token = localStorage.getItem('token'); // Récupération du token

      for (let i = 0; i < audioFiles.length; i++) {
        const currentAudio = audioFiles[i];
        const data = new FormData();
        
        // Nom du fichier sans extension si le titre est vide, sinon Titre + Index
        const podcastTitle = formData.title 
            ? (audioFiles.length > 1 ? `${formData.title} ${i+1}` : formData.title)
            : currentAudio.name.replace(/\.[^/.]+$/, "");

        data.append('title', podcastTitle);
        data.append('speaker', formData.speaker);
        data.append('category', formData.category);
        data.append('duration', formData.duration);
        data.append('audioFile', currentAudio); 
        
        if (coverFile) data.append('coverImageFile', coverFile);

        // ✅ CORRECTION : Ajout du token & Suppression du Content-Type manuel
        await axios.post('https://daara-app.onrender.com/api/podcasts', data, {
            headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      alert(`${audioFiles.length} podcast(s) ajouté(s) avec succès !`);
      
      setFormData({ title: '', speaker: 'Serigne Mor Diop', category: '', duration: '' });
      setAudioFiles([]);
      setCoverFile(null);
      if(document.getElementById('audioInput')) document.getElementById('audioInput').value = "";
      if(document.getElementById('coverInput')) document.getElementById('coverInput').value = "";
      
      setIsFormVisible(false);
      fetchPodcasts();
    } catch (error) { 
      console.error(error);
      alert("Erreur lors de l'upload : " + (error.response?.data?.error || error.message)); 
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
      if(window.confirm("Voulez-vous vraiment supprimer cet audio ?")) {
          try {
             const token = localStorage.getItem('token');
             
             // ✅ CORRECTION ICI : Ajout du Header Authorization pour éviter l'erreur 401
             await axios.delete(`https://daara-app.onrender.com/api/podcasts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
             });

             setPodcasts(podcasts.filter(p => p._id !== id));
          } catch (error) {
             console.error(error);
             alert("Erreur serveur lors de la suppression");
          }
      }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 font-serif">Gestion Podcasts</h1>
          <p className="text-gray-500 text-sm mt-1">{podcasts.length} fichiers audio disponibles</p>
        </div>
        <button 
          onClick={() => setIsFormVisible(!isFormVisible)} 
          className={`${isFormVisible ? 'bg-gray-500' : 'bg-rose-600 hover:bg-rose-700'} text-white px-6 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2`}
        >
          {isFormVisible ? 'Fermer' : <><Plus size={20}/> Ajouter Audio(s)</>}
        </button>
      </div>

      {isFormVisible && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8 animate-fade-in-down">
          <h2 className="text-xl font-bold mb-6 text-rose-800 flex items-center gap-2">
            <div className="p-2 bg-rose-100 rounded-lg"><Mic size={24}/></div>
            Ajouter des fichiers audio
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Titre (Base)</label>
                <input 
                  type="text" 
                  placeholder="Laisser vide pour utiliser le nom du fichier" 
                  className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block flex items-center gap-1"><User size={14}/> Conférencier</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" 
                  value={formData.speaker} 
                  onChange={e => setFormData({...formData, speaker: e.target.value})} 
                />
              </div>

              <CategoryManager 
                type="podcast" 
                selectedCategory={formData.category} 
                onSelectCategory={(cat) => setFormData({...formData, category: cat})} 
              />
              
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block flex items-center gap-1"><Clock size={14}/> Durée (Optionnel)</label>
                <input 
                  type="text" 
                  placeholder="Ex: 45:00" 
                  className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" 
                  value={formData.duration} 
                  onChange={e => setFormData({...formData, duration: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-4 flex flex-col h-full">
               <div className={`p-4 border-2 border-dashed rounded-xl flex-1 flex flex-col justify-center transition ${audioFiles.length > 0 ? 'border-rose-500 bg-rose-50' : 'border-rose-200 bg-rose-50'}`}>
                 <label className="text-xs font-bold text-rose-700 uppercase mb-2 block text-center cursor-pointer">
                    {audioFiles.length > 0 ? `${audioFiles.length} fichier(s) prêt(s)` : "Sélectionner Fichiers Audio (MP3)"}
                 </label>
                 <input 
                   id="audioInput"
                   type="file" 
                   multiple 
                   accept="audio/*" 
                   className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white file:text-rose-700 file:shadow-sm cursor-pointer" 
                   onChange={(e) => setAudioFiles(e.target.files)} 
                   required 
                 />
                 {audioFiles.length > 0 && (
                    <div className="mt-2 text-center text-xs text-rose-600 font-medium">
                        {Array.from(audioFiles).slice(0, 3).map(f => f.name).join(', ')}
                        {audioFiles.length > 3 && ` + ${audioFiles.length - 3} autres`}
                    </div>
                 )}
               </div>

               <div className="p-4 border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-2 block text-center">Image de couverture (Pour tous)</label>
                 <input 
                   id="coverInput"
                   type="file" 
                   accept="image/*" 
                   className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white file:text-gray-700 file:shadow-sm cursor-pointer" 
                   onChange={(e) => setCoverFile(e.target.files[0])} 
                 />
               </div>

               <button 
                 type="submit" 
                 disabled={isUploading}
                 className={`w-full text-white py-4 rounded-xl font-bold transition shadow-md flex items-center justify-center gap-2 ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 hover:shadow-lg'}`}
               >
                 {isUploading ? <><Loader size={20} className="animate-spin"/> Envoi ({audioFiles.length})...</> : `Uploader ${audioFiles.length > 0 ? `(${audioFiles.length})` : ''}`}
               </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Titre</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Catégorie</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Auteur</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {podcasts.map((pod) => (
              <tr key={pod._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 mr-3 overflow-hidden shadow-sm border border-rose-200">
                      {pod.coverImage ? <img src={pod.coverImage} className="w-full h-full object-cover" alt="cover"/> : <Music size={20} />}
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 text-sm block max-w-[200px] truncate" title={pod.title}>{pod.title}</span>
                      <span className="text-xs text-gray-400">{pod.duration ? `${pod.duration} min` : 'Audio'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-100">{pod.category}</span></td>
                <td className="px-6 py-4 text-sm text-gray-500 font-medium">{pod.speaker}</td>
                <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a href={pod.audioUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition"><PlayCircle size={20}/></a>
                      <button onClick={() => handleDelete(pod._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"><Trash2 size={18}/></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}