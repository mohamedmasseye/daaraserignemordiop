import React, { useState, useEffect } from 'react';
import API from '../../services/api'; 
import AdminLayout from './AdminLayout';
import { Trash2, Plus, Book, Image as ImageIcon, CheckCircle, Loader, Edit3, X, Save, User, AlignLeft, Tag } from 'lucide-react';

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({
    title: '', 
    author: 'Serigne Mor Diop', 
    description: '', 
    category: ''
  });
  
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchBooks = async () => {
    try {
      const res = await API.get('/api/books');
      setBooks(res.data || []);
    } catch (err) { console.error("Erreur fetch books:", err); }
  };

  useEffect(() => { fetchBooks(); }, []);

  const handleEdit = (book) => {
    setIsEditing(true);
    setEditId(book._id);
    setFormData({
      title: book.title || '',
      author: book.author || 'Serigne Mor Diop',
      description: book.description || '',
      category: book.category || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ title: '', author: 'Serigne Mor Diop', description: '', category: '' });
    setPdfFile(null);
    setCoverFile(null);
    if (document.getElementById('fileInputPdf')) document.getElementById('fileInputPdf').value = "";
    if (document.getElementById('fileInputCover')) document.getElementById('fileInputCover').value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing && !pdfFile) return alert("Veuillez sélectionner un fichier PDF.");

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStep(isEditing ? 'Mise à jour...' : 'Téléversement...');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('author', formData.author);
      data.append('category', formData.category);
      data.append('description', formData.description);
      if (pdfFile) data.append('pdfFile', pdfFile);
      if (coverFile) data.append('coverImage', coverFile);

      const config = {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      };

      if (isEditing) {
        await API.put(`/api/books/${editId}`, data, config);
      } else {
        await API.post('/api/books', data, config);
      }
      
      setUploadStep('Terminé !');
      setTimeout(() => {
          setIsUploading(false);
          alert(isEditing ? '✅ Livre mis à jour !' : '✅ Livre ajouté !');
          cancelEdit();
          fetchBooks();
      }, 600);

    } catch (error) {
      setIsUploading(false);
      alert(error.response?.data?.error || "Une erreur est survenue.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ Supprimer définitivement ce livre ?")) {
      try {
        await API.delete(`/api/books/${id}`);
        setBooks(books.filter(b => b._id !== id));
      } catch (error) { alert("Erreur lors de la suppression."); }
    }
  };

  // ✅ Style réutilisable pour les inputs bien encadrés
  const inputStyle = "w-full mt-1 p-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none font-bold transition-all duration-200 placeholder:text-gray-300";

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900">Bibliothèque Numérique</h1>
            <div className="bg-primary-100 text-primary-700 px-4 py-1 rounded-full text-sm font-bold">
                {books.length} Ouvrages
            </div>
        </div>

        {/* --- FORMULAIRE --- */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-12 relative overflow-hidden">
          
          {isUploading && (
              <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center backdrop-blur-md">
                  <div className="w-80 p-8 bg-white rounded-3xl shadow-2xl border border-gray-100 text-center">
                      <div className="mb-4 flex justify-center">
                        {uploadProgress < 100 ? <Loader className="animate-spin text-primary-600" size={40}/> : <CheckCircle className="text-green-500 animate-bounce" size={40}/>}
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{uploadStep}</h3>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                          <div className="h-full bg-primary-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <span className="text-sm font-black text-primary-900">{uploadProgress}%</span>
                  </div>
              </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold flex items-center text-primary-900">
                <div className="p-2 bg-gold-100 rounded-xl mr-3 text-gold-600">
                    {isEditing ? <Edit3 size={24}/> : <Plus size={24} />}
                </div>
                {isEditing ? `Modification : ${formData.title}` : 'Ajouter un nouvel ouvrage'}
            </h2>
            {isEditing && (
                <button onClick={cancelEdit} className="text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition flex items-center gap-2">
                    <X size={18}/> Annuler
                </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-5">
                <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Book size={14}/> Titre de l'œuvre
                    </label>
                    <input type="text" required placeholder="Entrez le titre..." className={inputStyle} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <User size={14}/> Auteur
                    </label>
                    <input type="text" required className={inputStyle} value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Tag size={14}/> Catégorie
                        </label>
                        <input type="text" placeholder="Ex: Xassaïd" className={inputStyle} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <AlignLeft size={14}/> Description
                        </label>
                        <textarea rows="1" placeholder="..." className={inputStyle} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                </div>
            </div>

            <div className="space-y-5">
                <div className="p-6 border-2 border-dashed border-primary-100 rounded-2xl bg-primary-50/30 hover:border-primary-400 transition-colors">
                    <label className="block text-sm font-bold text-primary-900 mb-2">📄 Fichier PDF {isEditing && '(Optionnel si inchangé)'}</label>
                    <input id="fileInputPdf" type="file" accept="application/pdf" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary-900 file:text-white cursor-pointer" onChange={(e) => setPdfFile(e.target.files[0])} />
                </div>

                <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30 hover:border-gray-400 transition-colors">
                    <label className="block text-sm font-bold text-gray-700 mb-2">🖼️ Image de Couverture</label>
                    <input id="fileInputCover" type="file" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-gray-200 file:text-gray-700 cursor-pointer" onChange={(e) => setCoverFile(e.target.files[0])} />
                </div>

                <button type="submit" disabled={isUploading} className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 ${isUploading ? 'bg-gray-300 text-gray-500' : 'bg-primary-900 text-white hover:bg-gold-500 hover:text-primary-900'}`}>
                    {isUploading ? <Loader className="animate-spin"/> : isEditing ? <Save size={20}/> : <Plus size={20}/>}
                    {isUploading ? 'Traitement en cours...' : isEditing ? 'Sauvegarder les modifications' : 'Publier l\'ouvrage'}
                </button>
            </div>
          </form>
        </div>

        {/* --- LISTE --- */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                    <th className="px-8 py-4">Ouvrage</th>
                    <th className="px-8 py-4">Auteur / Catégorie</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {books.map((book) => (
                <tr key={book._id} className="group hover:bg-primary-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-12 bg-gray-100 rounded-lg overflow-hidden shadow-sm border border-gray-200 shrink-0">
                          {book.coverUrl ? <img src={book.coverUrl} className="h-full w-full object-cover" alt=""/> : <div className="h-full w-full flex items-center justify-center text-gray-300"><Book size={20}/></div>}
                      </div>
                      <div>
                          <p className="font-bold text-gray-900 leading-tight">{book.title}</p>
                          <p className="text-xs text-primary-600 font-medium mt-1 uppercase tracking-tighter">Ajouté le {new Date(book.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                      <p className="text-sm font-bold text-gray-700">{book.author}</p>
                      <p className="text-xs text-gray-400 font-medium italic">{book.category || 'Général'}</p>
                  </td>
                  <td className="px-8 py-5 text-right space-x-2">
                    <button onClick={() => handleEdit(book)} className="p-3 text-primary-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-primary-100 transition-all">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => handleDelete(book._id)} className="p-3 text-red-400 hover:text-red-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-red-100 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {books.length === 0 && <div className="p-20 text-center text-gray-300 font-medium italic">Aucun livre dans la bibliothèque.</div>}
        </div>
      </div>
    </AdminLayout>
  );
}