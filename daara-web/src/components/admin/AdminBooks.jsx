import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import { Trash2, Plus, Book, Image as ImageIcon } from 'lucide-react';

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({
    title: '', author: 'Serigne Mor Diop', description: '', pdfUrl: '', category: ''
  });
  
  // States pour les fichiers
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null); // Pour l'image de couverture

  // 1. Charger les livres
  const fetchBooks = async () => {
    try {
      const res = await axios.get('https://daara-app.onrender.com/api/books');
      setBooks(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchBooks(); }, []);

  // 2. Ajouter un livre (Avec support PDF + Image)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('author', formData.author);
      data.append('category', formData.category);
      data.append('description', formData.description);
      
      // Gestion du PDF
      if (pdfFile) {
        data.append('pdfFile', pdfFile);
      } else {
        data.append('pdfUrl', formData.pdfUrl); 
      }

      // Gestion de l'Image de couverture
      if (coverFile) {
        data.append('coverImage', coverFile);
      }

      await axios.post('https://daara-app.onrender.com/api/books', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert('Livre ajouté avec succès !');
      
      // Reset tout
      setFormData({ title: '', author: 'Serigne Mor Diop', description: '', pdfUrl: '', category: '' });
      setPdfFile(null);
      setCoverFile(null);
      
      // On vide les inputs fichiers visuellement
      if(document.getElementById('fileInputPdf')) document.getElementById('fileInputPdf').value = "";
      if(document.getElementById('fileInputCover')) document.getElementById('fileInputCover').value = "";
      
      fetchBooks();
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l\'ajout');
    }
  };

  // 3. Supprimer un livre
  const handleDelete = async (id) => {
    if (window.confirm("⚠️ Attention : Voulez-vous vraiment supprimer ce livre définitivement ?")) {
      try {
        await axios.delete(`https://daara-app.onrender.com/api/books/${id}`);
        setBooks(books.filter(book => book._id !== id));
        alert("Livre supprimé avec succès !");
      } catch (error) {
        console.error(error);
        alert("Erreur lors de la suppression. Vérifiez que le serveur tourne.");
      }
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Gestion des Livres</h1>

      {/* Formulaire d'Ajout */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-primary-900">
          <Plus className="h-5 w-5 mr-2" /> Ajouter un nouveau livre
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <input 
            type="text" placeholder="Titre du livre" required
            className="p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
          />
          
          <input 
            type="text" placeholder="Catégorie (ex: Biographie, Tawhid)"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
          />
          
          {/* Input PDF */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Fichier PDF (Livre)</label>
            <input 
              id="fileInputPdf"
              type="file" 
              accept="application/pdf"
              required
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100 border rounded-lg p-1"
              onChange={(e) => setPdfFile(e.target.files[0])}
            />
          </div>

          {/* Input Image de Couverture */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Image de couverture (Optionnel)</label>
            <input 
              id="fileInputCover"
              type="file" 
              accept="image/*"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-green-50 file:text-green-700
                hover:file:bg-green-100 border rounded-lg p-1"
              onChange={(e) => setCoverFile(e.target.files[0])}
            />
          </div>

          <textarea 
            placeholder="Description courte..."
            className="p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none md:col-span-2"
            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
          />
          
          <button type="submit" className="md:col-span-2 bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition">
            Enregistrer le Livre
          </button>
        </form>
      </div>

      {/* Liste des Livres existants */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {books.map((book) => (
              <tr key={book._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {/* Affichage miniature si dispo, sinon icone */}
                    {book.coverUrl ? (
                        <img src={book.coverUrl} alt="cover" className="h-8 w-8 object-cover rounded mr-3"/>
                    ) : (
                        <Book className="h-5 w-5 text-gray-400 mr-3" />
                    )}
                    <span className="font-medium text-gray-900">{book.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {book.category || 'Général'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-900 mr-4">
                    Voir PDF
                  </a>
                  <button onClick={() => handleDelete(book._id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}