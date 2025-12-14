import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Book, Download, Search, Eye, BookOpen, Filter } from 'lucide-react';
import BookReader from '../components/BookReader'; 

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tout');

  // Charger les livres
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('http://https://daara-app.onrender.com/api/books');
        setBooks(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur:", error);
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const categories = ['Tout', ...new Set(books.map(b => b.category).filter(Boolean))];

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tout' || b.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-primary-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 mb-4"></div>
      <p className="font-medium animate-pulse">Chargement de la bibliothèque...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* --- LE LECTEUR (MODAL) --- */}
      {selectedBook && (
        <BookReader 
          pdfUrl={selectedBook.pdfUrl} 
          title={selectedBook.title}
          onClose={() => setSelectedBook(null)} 
        />
      )}

      {/* --- HERO SECTION --- */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-16 px-4 mb-10 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <BookOpen className="h-16 w-16 mx-auto text-gold-500 mb-4 opacity-90" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Bibliothèque Numérique
          </h1>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto">
            Accédez à une collection riche d'ouvrages islamiques, lisez en ligne ou téléchargez pour étudier où que vous soyez.
          </p>
          
          <div className="max-w-xl mx-auto mt-8 relative group">
             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition h-5 w-5"/>
             <input 
               type="text" 
               placeholder="Rechercher par titre ou auteur..." 
               className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 shadow-xl focus:ring-4 focus:ring-gold-500/50 outline-none transition font-medium"
               onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        
        {/* --- FILTRES --- */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition duration-300 border ${
                selectedCategory === cat 
                  ? 'bg-primary-900 text-gold-500 border-primary-900 shadow-md transform scale-105' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* --- GRILLE DE LIVRES --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredBooks.length === 0 ? (
             <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
               <Filter className="h-12 w-12 mb-2 opacity-50"/>
               <p>Aucun livre ne correspond à votre recherche.</p>
             </div>
          ) : (
            filteredBooks.map((book) => (
              <div key={book._id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition duration-300 border border-gray-100 flex flex-col h-full group overflow-hidden">
                
                {/* ZONE DE COUVERTURE (MODIFIÉE) */}
                <div className="h-48 bg-primary-50 relative overflow-hidden flex items-center justify-center">
                   
                   {/* Si une image de couverture existe, on l'affiche */}
                   {book.coverImageUrl ? (
      <img 
        src={book.coverImageUrl} 
        alt={book.title} 
        className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
      />
   ) : (
      /* Sinon, affichage par défaut (Icone) */
      <>
        <div className="absolute inset-0 bg-primary-900/5 group-hover:bg-primary-900/10 transition duration-500"></div>
        <Book className="h-20 w-20 text-primary-200 group-hover:text-primary-300 group-hover:scale-110 transition duration-500" />
      </>
   )}
                   
                   {/* Badge Catégorie */}
                   <span className="absolute top-3 right-3 text-[10px] font-bold text-primary-900 bg-gold-400 px-2 py-1 rounded shadow-sm z-10">
                     {book.category || 'Général'}
                   </span>

                   {/* Overlay Action */}
                   <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-3 z-20">
                     <button 
                       onClick={() => setSelectedBook(book)}
                       className="bg-white text-primary-900 p-3 rounded-full hover:bg-gold-400 transition transform translate-y-4 group-hover:translate-y-0 duration-300"
                       title="Lire le livre"
                     >
                       <Eye className="h-5 w-5"/>
                     </button>
                   </div>
                </div>

                {/* Contenu Carte */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800 leading-snug mb-1 line-clamp-2" title={book.title}>
                    {book.title}
                  </h3>
                  <p className="text-xs text-primary-600 font-semibold mb-3 uppercase tracking-wide">
                    {book.author}
                  </p>
                  
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                    {book.description || "Aucune description disponible pour cet ouvrage."}
                  </p>
                  
                  <div className="flex gap-2 pt-4 border-t border-gray-50 mt-auto">
                    <button 
                      onClick={() => setSelectedBook(book)}
                      className="flex-1 bg-primary-50 text-primary-900 py-2 rounded-lg text-sm font-bold hover:bg-primary-900 hover:text-white transition flex items-center justify-center gap-2"
                    >
                      <BookOpen className="h-4 w-4" /> Lire
                    </button>
                    
                    <a 
                      href={book.pdfUrl} 
                      download 
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 border border-gray-200 rounded-lg text-gray-400 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition"
                      title="Télécharger"
                    >
                      <Download className="h-4 w-4"/>
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}