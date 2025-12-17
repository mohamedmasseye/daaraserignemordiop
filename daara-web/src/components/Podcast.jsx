import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Headphones, Clock, Download, Share2, Mic, Music, Calendar, Filter } from 'lucide-react';

// Données de secours (Pour voir le design même si la base de données est vide)
const MOCK_PODCASTS = [
  { _id: '1', title: "Tafsir Sourate Al-Baqara", speaker: "Serigne Mor Diop", duration: "45:20", category: "Tafsir", coverImage: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600&q=80", createdAt: new Date().toISOString() },
  { _id: '2', title: "L'importance de la prière", speaker: "Oustaz Alioune", duration: "32:15", category: "Rappel", coverImage: "https://images.unsplash.com/photo-1584291411281-451e6b052d97?w=600&q=80", createdAt: new Date().toISOString() },
  { _id: '3', title: "Éducation spirituelle", speaker: "Serigne Mor Diop", duration: "58:00", category: "Éducation", coverImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80", createdAt: new Date().toISOString() },
];

export default function Podcast() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Tous'); // État pour le filtre

  const audioRef = useRef(null);

  // Charger les podcasts depuis le backend
  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const response = await axios.get('/api/podcasts');
        // Si l'API retourne une liste vide, on utilise les MOCK pour la démo
        setPodcasts(response.data.length > 0 ? response.data : MOCK_PODCASTS);
      } catch (error) {
        console.error("Erreur chargement podcasts:", error);
        setPodcasts(MOCK_PODCASTS); // Fallback en cas d'erreur
      } finally {
        setLoading(false);
      }
    };
    fetchPodcasts();
  }, []);

  // Gestion lecture Audio
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Erreur lecture auto:", error);
            setIsPlaying(false);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  const handlePlay = (track) => {
    if (currentTrack?._id === track._id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // --- LOGIQUE DE FILTRAGE ---
  // Extraction des catégories uniques
  const categories = ['Tous', ...new Set(podcasts.map(p => p.category || 'Autre'))];

  // Filtrage des podcasts
  const filteredPodcasts = activeCategory === 'Tous' 
    ? podcasts 
    : podcasts.filter(p => p.category === activeCategory);


  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      
      {/* BALISE AUDIO CACHÉE */}
      <audio 
        ref={audioRef} 
        src={currentTrack?.audioUrl} 
        onEnded={() => setIsPlaying(false)}
      />

      {/* --- HERO HEADER AVEC IMAGE DE FOND --- */}
      <div className="relative pt-32 pb-24 px-4 overflow-hidden bg-primary-900 shadow-2xl">
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&w=2000&q=80" 
                alt="Background" 
                className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary-900/90 via-primary-900/80 to-gray-50"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-end justify-between gap-8 text-white">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-gold-500/20 text-gold-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-gold-500/30 backdrop-blur-sm"
            >
              <Mic size={14} /> Audio & Conférences
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-7xl font-serif font-bold mb-6 leading-tight"
            >
              La Voix du <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-600">Daara</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-primary-100 text-lg md:text-xl font-light leading-relaxed"
            >
              Une bibliothèque audio riche pour écouter les durus, les prêches et les rappels, où que vous soyez.
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-md w-full md:w-auto shadow-2xl flex items-center gap-6"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
              <Headphones size={32} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gold-300 font-bold uppercase tracking-wider mb-1">Médiathèque Audio</p>
              <p className="text-3xl font-bold font-serif">{podcasts.length}</p>
              <p className="text-xs text-primary-200 mt-1">Épisodes disponibles</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- SECTION CONTENU --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        
        {/* --- FILTRES CATÉGORIES --- */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {categories.map((cat, idx) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (idx * 0.05) }}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-md ${
                activeCategory === cat 
                  ? 'bg-gold-500 text-white ring-4 ring-gold-500/20' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-primary-900 border border-gray-100'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* --- LISTE DES PODCASTS --- */}
        <div className="flex flex-col gap-4">
          
          {loading ? (
             <div className="p-20 text-center text-gray-500 bg-white rounded-3xl shadow-sm">Chargement des audios...</div>
          ) : filteredPodcasts.length === 0 ? (
             <div className="p-20 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
               <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4 text-gray-400">
                 <Filter size={24} />
               </div>
               <p className="text-gray-500 text-lg">Aucun audio trouvé dans cette catégorie.</p>
               <button onClick={() => setActiveCategory('Tous')} className="mt-4 text-gold-600 font-bold hover:underline">
                 Voir tous les audios
               </button>
             </div>
          ) : (
            filteredPodcasts.map((track, idx) => {
              const active = currentTrack?._id === track._id;
              return (
                <motion.div 
                  key={track._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`
                    group relative bg-white rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-xl border transition-all duration-300 flex flex-col md:flex-row items-center gap-6
                    ${active ? 'border-gold-500 ring-1 ring-gold-100 bg-orange-50/30' : 'border-gray-100 hover:border-gold-200'}
                  `}
                >
                  {/* Image Pochette */}
                  <div className="relative w-full md:w-32 h-32 md:h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg transition-all">
                    {track.coverImage ? (
                      <img src={track.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={track.title} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-800 to-primary-600 flex items-center justify-center text-white">
                        <Music size={32} />
                      </div>
                    )}
                    
                    {/* Bouton Play Overlay */}
                    <button 
                      onClick={() => handlePlay(track)}
                      className={`
                        absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all duration-300
                        ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                      `}
                    >
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-primary-900 hover:scale-110 transition-transform">
                        {active && isPlaying ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor" className="ml-1"/>}
                      </div>
                    </button>
                    
                    {/* Égaliseur animé si lecture en cours */}
                    {active && isPlaying && (
                      <div className="absolute bottom-2 right-2 flex gap-0.5 items-end h-4">
                        <div className="w-1 bg-gold-500 animate-[bounce_1s_infinite] h-2"></div>
                        <div className="w-1 bg-gold-500 animate-[bounce_1.2s_infinite] h-4"></div>
                        <div className="w-1 bg-gold-500 animate-[bounce_0.8s_infinite] h-3"></div>
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 w-full text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-50 text-primary-700 border border-primary-100">
                        {track.category || 'Général'}
                      </span>
                      <span className="flex items-center text-xs text-gray-400 font-medium">
                        <Calendar size={12} className="mr-1"/> {formatDate(track.createdAt)}
                      </span>
                    </div>
                    
                    <h3 className={`text-xl font-bold font-serif mb-1 ${active ? 'text-primary-800' : 'text-gray-900'}`}>
                      {track.title}
                    </h3>
                    <p className="text-gray-500 font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
                      <Mic size={14} className="text-gold-500"/> {track.speaker}
                    </p>

                    {/* Meta Data */}
                    <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-gray-400 border-t border-gray-100 pt-4 mt-2">
                      {track.duration && (
                        <div className="flex items-center gap-1.5 hover:text-primary-600 transition-colors">
                          <Clock size={16} /> <span className="font-medium">{track.duration}</span>
                        </div>
                      )}
                      
                      <div className="flex gap-2 ml-auto md:ml-0">
                         {/* Actions rapides */}
                         <a href={track.audioUrl} download className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-primary-600" title="Télécharger">
                           <Download size={18}/>
                         </a>
                         <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-primary-600" title="Partager">
                           <Share2 size={18}/>
                         </button>
                      </div>
                    </div>
                  </div>

                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* --- LECTEUR STICKY (Fixe en bas) --- */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-0 left-0 w-full bg-primary-900/95 backdrop-blur-xl text-white border-t border-white/10 p-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              
              {/* Info Piste */}
              <div className="flex items-center gap-4 w-1/3">
                <div className="relative">
                   <img src={currentTrack.coverImage || "/logo.png"} className={`w-12 h-12 rounded-lg object-cover border border-white/10 ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`} alt="" />
                   <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
                </div>
                <div className="hidden sm:block overflow-hidden">
                  <h4 className="font-bold text-sm truncate text-white">{currentTrack.title}</h4>
                  <p className="text-xs text-primary-300 truncate">{currentTrack.speaker}</p>
                </div>
              </div>

              {/* Contrôles */}
              <div className="flex flex-col items-center w-1/3">
                <div className="flex items-center gap-6">
                  <button className="text-primary-400 hover:text-white transition transform active:scale-95">
                    <Play size={20} className="rotate-180" fill="currentColor"/>
                  </button>
                  
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center text-white hover:bg-gold-400 hover:scale-110 transition-all shadow-lg shadow-gold-500/30"
                  >
                    {isPlaying ? <Pause fill="white" size={20}/> : <Play fill="white" size={20} className="ml-1"/>}
                  </button>
                  
                  <button className="text-primary-400 hover:text-white transition transform active:scale-95">
                    <Play size={20} fill="currentColor"/>
                  </button>
                </div>
              </div>

              {/* Volume / Extra */}
              <div className="w-1/3 flex justify-end gap-4">
                 <button className="text-primary-400 hover:text-gold-500 transition"><Share2 size={20}/></button>
              </div>
            </div>
            
            {/* Barre de progression décorative */}
            <div className="absolute top-0 left-0 w-full h-1 bg-primary-800">
               <motion.div 
                 className="h-full bg-gold-500 shadow-[0_0_10px_#E6AA76]"
                 initial={{ width: "0%" }}
                 animate={{ width: isPlaying ? "100%" : "0%" }}
                 transition={{ duration: 300, ease: "linear", repeat: Infinity }} // Simulation de progression
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}