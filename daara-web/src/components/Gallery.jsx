import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Play, Maximize2, X, Filter, Film, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Gallery() {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  // --- ÉTATS PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // 1. CHARGEMENT DES DONNÉES
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await axios.get('https://daara-app.onrender.com/api/media');
        setMediaItems(response.data);
      } catch (error) {
        console.error("Erreur chargement galerie:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  // Reset page quand on change de filtre
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // 2. LOGIQUE DE FILTRAGE & PAGINATION
  const categories = ['Tous', ...new Set(mediaItems.map(item => item.category || 'Autre'))];

  const filteredItems = activeFilter === 'Tous' 
    ? mediaItems 
    : mediaItems.filter(item => item.category === activeFilter);

  // Calculs pour la pagination
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  // Fonction pour changer de page avec scroll top doux
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 400, behavior: 'smooth' }); // Remonte un peu après le changement
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* --- HEADER --- */}
      <div className="bg-primary-900 text-white pt-24 pb-16 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-purple-600 rounded-full blur-[150px] opacity-20"></div>

        <motion.h1 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-6xl font-serif font-bold mb-6 relative z-10"
        >
          Médiathèque
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.2 }}
          className="text-primary-200 mb-10 text-lg relative z-10 max-w-2xl mx-auto"
        >
          Revivez les moments forts du Daara en images et vidéos. Ziarra, Gamou, Conférences et vie quotidienne.
        </motion.p>
        
        {/* --- FILTRES --- */}
        <div className="flex flex-wrap justify-center gap-3 relative z-10">
          {categories.map((cat, idx) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (idx * 0.05) }}
              onClick={() => setActiveFilter(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                activeFilter === cat 
                  ? 'bg-gold-500 text-white shadow-lg scale-105 ring-4 ring-gold-500/20' 
                  : 'bg-white/10 text-primary-100 hover:bg-white/20 backdrop-blur-sm'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* --- GRILLE MASONRY (5 COLONNES) --- */}
      <div className="max-w-[1600px] mx-auto px-4 py-12">
        {currentItems.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
             <Image className="h-16 w-16 text-gray-300 mx-auto mb-4" />
             <p className="text-gray-500 text-lg">Aucun média trouvé dans cette catégorie.</p>
           </div>
        ) : (
          <>
            <motion.div 
              layout 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              <AnimatePresence mode='popLayout'>
                {currentItems.map((item) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    key={item._id}
                    className="relative group rounded-xl overflow-hidden shadow-md cursor-pointer bg-gray-200 aspect-square border border-gray-100 hover:shadow-xl hover:z-10 transition-all"
                    onClick={() => setSelectedMedia(item)}
                  >
                    {item.type === 'video' ? (
                       <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                          {item.thumbnail ? (
                              <img src={item.thumbnail} className="w-full h-full object-cover opacity-60" />
                          ) : (
                              <Film className="text-white/20 w-16 h-16 absolute" />
                          )}
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 z-10 group-hover:scale-110 transition-transform">
                             <Play fill="white" size={20} className="text-white ml-1" />
                          </div>
                       </div>
                    ) : (
                       <img 
                         src={item.url} 
                         alt={item.title}
                         className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                       />
                    )}
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center text-white p-4 text-center backdrop-blur-[2px]">
                      <Maximize2 size={24} className="mb-3 text-gold-400" />
                      <h3 className="font-bold text-base font-serif leading-tight mb-1 line-clamp-2">{item.title}</h3>
                      <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">{item.category}</span>
                    </div>

                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1 border border-white/10 shadow-lg">
                      {item.type === 'video' ? <Play size={8} fill="currentColor"/> : <Image size={10}/>}
                      {item.type === 'video' ? 'Vidéo' : 'Photo'}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* --- PAGINATION --- */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-2">
                <button 
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-gold-50 hover:text-gold-600 hover:border-gold-200 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-full shadow-sm border border-gray-100">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`
                        w-8 h-8 rounded-full text-sm font-bold transition-all duration-300 flex items-center justify-center
                        ${currentPage === i + 1 
                          ? 'bg-gold-500 text-white shadow-md scale-110' 
                          : 'text-gray-500 hover:bg-gray-100'}
                      `}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-gold-50 hover:text-gold-600 hover:border-gold-200 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- LIGHTBOX --- */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl"
            onClick={() => setSelectedMedia(null)}
          >
            <button className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition z-50">
              <X size={28} />
            </button>

            <div 
              className="max-w-6xl w-full max-h-[90vh] flex flex-col items-center justify-center" 
              onClick={e => e.stopPropagation()}
            >
              {selectedMedia.type === 'video' ? (
                <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
                   <video controls autoPlay className="w-full h-full">
                     <source src={selectedMedia.url} type="video/mp4" />
                   </video>
                </div>
              ) : (
                <img 
                  src={selectedMedia.url} 
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" 
                  alt={selectedMedia.title}
                />
              )}

              <div className="mt-6 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white font-serif mb-2">{selectedMedia.title}</h2>
                <div className="flex items-center justify-center gap-3">
                   <span className="text-gold-500 font-bold uppercase tracking-widest text-sm bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20">{selectedMedia.category}</span>
                   <span className="text-gray-400 text-sm">• {new Date(selectedMedia.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}