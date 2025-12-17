import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import CategoryManager from './CategoryManager';
import { Trash2, Plus, FileText, Loader, Search, Edit2, Image as ImageIcon, File, X } from 'lucide-react';

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // État pour savoir si on modifie (contient l'ID de l'article) ou si on crée (null)
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({ 
    title: '', summary: '', content: '', category: '', author: 'Administration' 
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('/api/blog');
      setPosts(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchPosts(); }, []);

  // --- 1. PRÉPARER LA MODIFICATION ---
  const handleEdit = (post) => {
    setEditingId(post._id); // On passe en mode édition
    setFormData({
        title: post.title,
        summary: post.summary,
        content: post.content,
        category: post.category,
        author: post.author || 'Administration'
    });
    // On ne pré-remplit pas les fichiers (pour ne pas écraser s'ils ne changent pas)
    setImageFile(null);
    setPdfFile(null);
    setIsFormVisible(true); // On ouvre le formulaire
    
    // Scroll vers le formulaire
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- 2. ANNULER / FERMER ---
  const resetForm = () => {
    setFormData({ title: '', summary: '', content: '', category: '', author: 'Administration' });
    setImageFile(null);
    setPdfFile(null);
    setEditingId(null); // On repasse en mode création
    
    // Reset visuel des inputs fichiers
    if(document.getElementById('imageInput')) document.getElementById('imageInput').value = "";
    if(document.getElementById('pdfInput')) document.getElementById('pdfInput').value = "";
    
    setIsFormVisible(false);
  };

  // --- 3. SOUMETTRE (CRÉATION OU MODIFICATION) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return alert("Le titre est obligatoire.");
    if (!formData.category) return alert("Veuillez choisir une catégorie.");
    if (!formData.content.trim()) return alert("Le contenu est vide.");

    setIsUploading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('summary', formData.summary);
      data.append('content', formData.content);
      data.append('category', formData.category);
      data.append('author', formData.author);

      if (imageFile) data.append('coverImageFile', imageFile);
      if (pdfFile) data.append('pdfDocumentFile', pdfFile);

      // Récupération du token
      const token = localStorage.getItem('token');
      const config = {
          headers: { Authorization: `Bearer ${token}` } // ✅ INDISPENSABLE pour éviter 401
      };

      if (editingId) {
          // --- MODE MODIFICATION (PUT) ---
          await axios.put(`/api/blog/${editingId}`, data, config);
          alert('Article modifié avec succès !');
      } else {
          // --- MODE CRÉATION (POST) ---
          await axios.post('/api/blog', data, config);
          alert('Article publié avec succès !');
      }
      
      resetForm();
      fetchPosts();
    } catch (error) { 
        console.error("Erreur Blog:", error);
        alert("Erreur : " + (error.response?.data?.error || error.message)); 
    } finally {
        setIsUploading(false);
    }
  };

  // --- 4. SUPPRIMER (CORRIGÉ 401) ---
  const handleDelete = async (id) => {
    if(window.confirm("⚠️ Êtes-vous sûr de vouloir supprimer cet article définitivement ?")) {
      try {
        const token = localStorage.getItem('token');
        // ✅ CORRECTION ICI : Ajout du header Authorization
        await axios.delete(`/api/blog/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setPosts(posts.filter(p => p._id !== id));
        // Si on était en train de modifier cet article, on ferme le formulaire
        if (editingId === id) resetForm();
      } catch (err) { 
          console.error(err);
          alert("Erreur lors de la suppression. Vérifiez votre connexion."); 
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 font-serif">Journal du Daara</h1>
            <p className="text-gray-500 text-sm mt-1">{posts.length} articles publiés</p>
        </div>
        <button 
            onClick={() => {
                if (isFormVisible) resetForm();
                else setIsFormVisible(true);
            }} 
            className={`${isFormVisible ? 'bg-gray-500 hover:bg-gray-600' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-6 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2`}
        >
          {isFormVisible ? <><X size={20}/> Fermer</> : <><Plus size={20}/> Nouvel Article</>}
        </button>
      </div>

      {isFormVisible && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-10 animate-fade-in-down">
          <h2 className="text-xl font-bold mb-6 text-emerald-800 flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
                {editingId ? <Edit2 size={24}/> : <FileText size={24}/>}
            </div>
            {editingId ? "Modifier l'article" : "Rédiger un article"}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Titre de l'article</label>
                  <input type="text" placeholder="Ex: Résumé de la conférence..." className="w-full p-3 bg-gray-50 border rounded-xl outline-emerald-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              
              <CategoryManager 
                type="blog" 
                selectedCategory={formData.category} 
                onSelectCategory={(cat) => setFormData({...formData, category: cat})} 
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-white transition cursor-pointer relative">
                    <label className="text-xs font-bold text-gray-500 block mb-2 text-center">
                        {editingId ? "Changer Image (Optionnel)" : "Image de couverture"}
                    </label>
                    <input id="imageInput" type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setImageFile(e.target.files[0])} />
                    <div className="text-center text-emerald-600">
                        <ImageIcon className="mx-auto mb-1" size={24}/>
                        <span className="text-xs">{imageFile ? imageFile.name : "Choisir image"}</span>
                    </div>
                </div>

                <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-white transition cursor-pointer relative">
                    <label className="text-xs font-bold text-gray-500 block mb-2 text-center">
                        {editingId ? "Changer PDF (Optionnel)" : "Document PDF"}
                    </label>
                    <input id="pdfInput" type="file" accept="application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setPdfFile(e.target.files[0])} />
                    <div className="text-center text-red-500">
                        <File className="mx-auto mb-1" size={24}/>
                        <span className="text-xs">{pdfFile ? pdfFile.name : "Choisir PDF"}</span>
                    </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 flex flex-col h-full">
              <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Résumé (Introduction)</label>
                  <textarea placeholder="Bref aperçu..." className="w-full h-20 p-3 bg-gray-50 border rounded-xl resize-none outline-emerald-500" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} />
              </div>
              
              <div className="flex-1">
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Contenu complet</label>
                  <textarea placeholder="Écrivez votre article ici..." className="w-full h-40 p-3 bg-gray-50 border rounded-xl resize-none outline-emerald-500" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
              </div>

              <div className="flex gap-3">
                  {editingId && (
                      <button type="button" onClick={resetForm} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition">
                          Annuler
                      </button>
                  )}
                  <button type="submit" disabled={isUploading} className="flex-[2] bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition flex justify-center items-center gap-2">
                     {isUploading ? <><Loader size={20} className="animate-spin"/> Traitement...</> : (editingId ? "Enregistrer les modifications" : "Publier l'article")}
                  </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* LISTE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center">
            <Search size={18} className="text-gray-400 mr-3"/>
            <input type="text" placeholder="Rechercher un article..." className="bg-transparent outline-none w-full text-sm" onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Article</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Catégorie</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map((post) => (
              <tr key={post._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-emerald-100 rounded-lg overflow-hidden mr-3 shrink-0 flex items-center justify-center">
                      {post.coverImage ? <img src={post.coverImage} className="h-full w-full object-cover"/> : <FileText className="text-emerald-600" size={20}/>}
                    </div>
                    <div>
                        <span className="font-bold text-sm text-gray-900 block">{post.title}</span>
                        <span className="text-xs text-gray-400 truncate max-w-[200px] block">{post.summary}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold">{post.category}</span></td>
                <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        {/* BOUTON MODIFIER */}
                        <button onClick={() => handleEdit(post)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Modifier">
                            <Edit2 size={18} />
                        </button>
                        {/* BOUTON SUPPRIMER */}
                        <button onClick={() => handleDelete(post._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Supprimer">
                            <Trash2 size={18} />
                        </button>
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