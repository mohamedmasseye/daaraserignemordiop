import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import { Trash2, Plus, Book, Image as ImageIcon, CheckCircle, Loader } from 'lucide-react';

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({
    title: '', author: 'Serigne Mor Diop', description: '', category: ''
  });
  
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  
  // States pour la progression
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // On initialise avec un texte simple
  const [uploadStep, setUploadStep] = useState('Préparation...');

  const fetchBooks = async () => {
    try {
      const res = await axios.get('/api/books');
      setBooks(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchBooks(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile && !formData.pdfUrl) {
        alert("Veuillez sélectionner un fichier PDF.");
        return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    // ✅ TEXTE SIMPLIFIÉ AU DÉBUT
    setUploadStep('Démarrage de l\'ajout...');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('author', formData.author);
      data.append('category', formData.category);
      data.append('description', formData.description);
      if (pdfFile) data.append('pdfFile', pdfFile);
      if (coverFile) data.append('coverImage', coverFile);

      await axios.post('/api/books', data, {
          headers: { 
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          // ✅ GESTION DE LA PROGRESSION CORRIGÉE
          onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
              
              // On change le texte selon l'étape, SANS remettre le % dans le texte
              if (percentCompleted < 100) {
                  setUploadStep('Ajout du livre en cours...');
              } else {
                  // Quand c'est à 100%, c'est que le serveur traite le fichier
                  setUploadStep('Finalisation du traitement (Ne quittez pas)...');
              }
          }
      });
      
      setUploadStep('Terminé !');
      setTimeout(() => {
          setIsUploading(false);
          alert('✅ Livre ajouté avec succès !');
          setFormData({ title: '', author: 'Serigne Mor Diop', description: '', category: '' });
          setPdfFile(null);
          setCoverFile(null);
          document.getElementById('fileInputPdf').value = "";
          document.getElementById('fileInputCover').value = "";
          fetchBooks();
      }, 500);

    } catch (error) {
      console.error(error);
      setIsUploading(false);
      alert(error.response?.data?.error || "Erreur lors de l'ajout.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ Supprimer ce livre ?")) {
      try {
        await axios.delete(`/api/books/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setBooks(books.filter(b => b._id !== id));
      } catch (error) { console.error(error); }
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Gestion des Livres</h1>

        {/* --- ZONE D'AJOUT --- */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-10 relative overflow-hidden">
          
          {/* ✅ OVERLAY DE CHARGEMENT CORRIGÉ */}
          {isUploading && (
              <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center backdrop-blur-md transition-all">
                  <div className="w-72 p-6 bg-white rounded-2xl shadow-xl border border-gray-100 text-center">
                      {/* Icône animée */}
                      <div className="mb-4 flex justify-center text-primary-600">
                        {uploadProgress < 100 ? (
                           <Loader className="animate-spin h-10 w-10"/>
                        ) : (
                           <CheckCircle className="h-10 w-10 text-green-500 animate-bounce"/>
                        )}
                      </div>

                      {/* Titre de l'étape */}
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{uploadStep}</h3>
                      
                      {/* Barre et Pourcentage unique */}
                      <div className="flex items-center justify-between text-sm font-bold text-primary-700 mb-2">
                          <span>Progression</span>
                          {/* ✅ LE SEUL ENDROIT OÙ LE % S'AFFICHE */}
                          <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-200 relative">
                          <div 
                              className={`h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden ${uploadProgress < 100 ? 'bg-primary-600' : 'bg-green-500'}`}
                              style={{ width: `${uploadProgress}%` }}
                          >
                              {/* Petit effet brillant sur la barre */}
                              <div className="absolute inset-0 bg-white/30 w-full h-full animate-pulse"></div>
                          </div>
                      </div>
                      
                      <p className="text-xs text-gray-400 mt-4 italic">Cela peut prendre quelques secondes selon la taille du PDF.</p>
                  </div>
              </div>
          )}

          <h2 className="text-xl font-bold mb-6 flex items-center text-primary-900">
            <div className="p-2 bg-primary-100 rounded-lg mr-3 text-primary-600">
                <Plus className="h-6 w-6" />
            </div>
            Ajouter un nouveau livre
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre du livre</label>
                    <input 
                        type="text" required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                    <input 
                        type="text" placeholder="Ex: Biographie"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                        rows="3"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="p-4 border-2 border-dashed border-primary-200 rounded-xl bg-primary-50/50 hover:bg-primary-50 transition-colors cursor-pointer relative group">
                    <label className="block text-sm font-bold text-primary-900 mb-2 group-hover:text-primary-700 transition-colors">📄 Fichier PDF (Livre) *</label>
                    <input 
                        id="fileInputPdf" type="file" accept="application/pdf" required
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200 cursor-pointer"
                        onChange={(e) => setPdfFile(e.target.files[0])}
                    />
                    {pdfFile && <div className="mt-2 text-xs text-green-600 flex items-center font-medium"><CheckCircle size={14} className="mr-1"/> {pdfFile.name} ({(pdfFile.size/1024/1024).toFixed(2)} MB)</div>}
                </div>

                <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 transition-colors relative">
                    <label className="block text-sm font-bold text-gray-700 mb-2">🖼️ Couverture (Optionnel)</label>
                    <input 
                        id="fileInputCover" type="file" accept="image/*"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                        onChange={(e) => setCoverFile(e.target.files[0])}
                    />
                    {coverFile && <div className="mt-2 text-xs text-green-600 flex items-center font-medium"><CheckCircle size={14} className="mr-1"/> Image sélectionnée</div>}
                </div>

                <button 
                    type="submit" 
                    disabled={isUploading}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform transition hover:-translate-y-1 flex items-center justify-center ${
                        isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-900 text-white hover:bg-primary-800 shadow-primary-900/30'
                    }`}
                >
                    {isUploading ? <Loader className="animate-spin mr-2"/> : <Plus className="mr-2"/>}
                    {isUploading ? 'Patientez...' : 'Enregistrer le Livre'}
                </button>
            </div>
          </form>
        </div>

        {/* --- LISTE DES LIVRES --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Bibliothèque ({books.length})</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-100">
            <tbody className="divide-y divide-gray-100">
              {books.map((book) => (
                <tr key={book._id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-12 w-10 flex-shrink-0 bg-gray-200 rounded overflow-hidden mr-4 shadow-sm border border-gray-100">
                          {book.coverUrl ? (
                              <img src={book.coverUrl} alt="" className="h-full w-full object-cover"/>
                          ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400 bg-gray-100"><Book size={20}/></div>
                          )}
                      </div>
                      <div>
                          <div className="font-bold text-gray-900">{book.title}</div>
                          <div className="text-sm text-gray-500">{book.category || 'Général'} • {(new Date(book.createdAt)).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <a href={book.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg text-sm font-medium mr-4 transition-colors">
                      <Book size={16} className="mr-1"/> Voir PDF
                    </a>
                    <button onClick={() => handleDelete(book._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {books.length === 0 && (
              <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                  <Book size={48} className="mb-4 opacity-20"/>
                  <p>Aucun livre pour le moment.</p>
              </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}