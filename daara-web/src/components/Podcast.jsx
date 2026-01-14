import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Headphones, Clock, Download, Share2, Mic, Music, 
  Info, X, RotateCcw, RotateCw 
} from 'lucide-react';

export default function Podcast() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Tous');

  // --- Nouveaux états pour les fonctionnalités audio ---
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);

  // 1. CHARGEMENT
  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const response = await API.get('/api/podcasts');
        setPodcasts(response.data || []);
      } catch (error) {
        console.error("Erreur chargement:", error);
        setPodcasts([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchPodcasts();
  }, []);

  // 2. GESTION LECTURE
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  // --- NOUVELLES FONCTIONS AUDIO ---
  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => setCurrentTime(audioRef.current.currentTime);
  const handleLoadedMetadata = () => setDuration(audioRef.current.duration);
  
  const handleScrub = (e) => {
    const value = e.target.value;
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const skipTime = (amount) => {
    audioRef.current.currentTime += amount;
  };

  const handlePlay = (track) => {
    if (currentTrack?._id === track._id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const categories = ['Tous', ...new Set(podcasts.map(p => p.category || 'Autre'))];
  const filteredPodcasts = activeCategory === 'Tous' ? podcasts : podcasts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      
      <audio 
        ref={audioRef} 
        src={currentTrack?.audioUrl} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* --- HERO HEADER (Ton design original préservé) --- */}
      <div className="relative pt-32 pb-24 px-4 overflow-hidden bg-primary-900 shadow-2xl">
        <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&w=2000&q=80" 
              className="w-full h-full object-cover opacity-30 mix-blend-overlay" alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary-900/90 via-primary-900/80 to-gray-50"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-end justify-between gap-8 text-white">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-gold-500/20 text-gold-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-gold-500/30 backdrop-blur-sm"
            >
              <Mic size={14} /> Audio & Conférences
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-4xl md:text-7xl font-serif font-bold mb-6 leading-tight"
            >
              La Voix du <span className="text-gold-500">Daara</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-primary-100 text-lg md:text-xl font-light leading-relaxed"
            >
              Une bibliothèque audio riche pour écouter les rappels, où que vous soyez.
            </motion.p>
          </div>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            className="bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-md w-full md:w-auto shadow-2xl flex items-center gap-6"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
              <Headphones size={32} className="text-white" />
            </div>
            <div><p className="text-3xl font-bold font-serif">{podcasts.length}</p><p className="text-xs text-primary-200 mt-1">Épisodes disponibles</p></div>
          </motion.div>
        </div>
      </div>

      {/* --- SECTION CONTENU --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        
        {/* FILTRES */}
        {podcasts.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-md ${
                  activeCategory === cat ? 'bg-gold-500 text-white shadow-lg scale-105' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* LISTE DES PODCASTS (Ton design original) */}
        <div className="flex flex-col gap-4">
          {loading ? (
              <div className="p-20 text-center text-gray-500 bg-white rounded-3xl shadow-sm font-bold">Chargement...</div>
          ) : filteredPodcasts.map((track, idx) => {
              const active = currentTrack?._id === track._id;
              return (
                <motion.div key={track._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  className={`group relative bg-white rounded-2xl p-4 md:p-6 shadow-sm border transition-all duration-300 flex flex-col md:flex-row items-center gap-6 ${active ? 'border-gold-500 bg-orange-50/30' : 'border-gray-100'}`}
                >
                  <div className="relative w-full md:w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-md">
                    {track.coverImage ? (
                      <img src={track.coverImage} className={`w-full h-full object-cover transition-transform duration-700 ${active && isPlaying ? 'animate-[spin_20s_linear_infinite]' : 'group-hover:scale-110'}`} alt="" />
                    ) : (
                      <div className="w-full h-full bg-primary-800 flex items-center justify-center text-white"><Music size={32} /></div>
                    )}
                    <button onClick={() => handlePlay(track)} className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-all ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-900 shadow-lg">
                        {active && isPlaying ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor" className="ml-1"/>}
                      </div>
                    </button>
                  </div>

                  <div className="flex-1 w-full text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-50 text-primary-700">{track.category || 'Général'}</span>
                      <span className="text-xs text-gray-400">{formatDate(track.createdAt)}</span>
                    </div>
                    <h3 className={`text-xl font-bold font-serif mb-1 ${active ? 'text-primary-800' : 'text-gray-900'}`}>{track.title}</h3>
                    <p className="text-gray-500 font-medium mb-4 flex items-center justify-center md:justify-start gap-2"><Mic size={14} className="text-gold-500"/> {track.speaker}</p>
                    <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-gray-400 border-t border-gray-100 pt-4 mt-2">
                      {track.duration && <div className="flex items-center gap-1.5"><Clock size={16} /> <span>{track.duration}</span></div>}
                      <div className="flex gap-2 ml-auto md:ml-0">
                         <a href={track.audioUrl} download className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-primary-600"><Download size={18}/></a>
                         <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-primary-600"><Share2 size={18}/></button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          }
        </div>
      </div>

      {/* --- LECTEUR STICKY AVEC SCRUBBING ET AVANCE/RETOUR --- */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div initial={{ y: 150 }} animate={{ y: 0 }} exit={{ y: 150 }}
            className="fixed bottom-0 left-0 w-full bg-primary-900/95 backdrop-blur-xl text-white border-t border-white/10 px-4 py-4 z-50 shadow-2xl"
          >
            <div className="max-w-7xl mx-auto">
              
              {/* 1. BARRE DE PROGRESSION (SCRUBBING) */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-mono text-primary-300 w-10 text-right">{formatTime(currentTime)}</span>
                <input 
                  type="range" min="0" max={duration || 0} value={currentTime} onChange={handleScrub}
                  className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold-500"
                  style={{ background: `linear-gradient(to right, #D4AF37 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) ${(currentTime / duration) * 100}%)` }}
                />
                <span className="text-[10px] font-mono text-primary-300 w-10">{formatTime(duration)}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                {/* Info (Gauche) */}
                <div className="flex items-center gap-4 w-1/3 min-w-0">
                  <img src={currentTrack.coverImage || "/logo.png"} 
                    className={`w-12 h-12 rounded-lg object-cover shadow-lg ${isPlaying ? 'animate-[spin_10s_linear_infinite] ring-2 ring-gold-500/50' : ''}`} alt="" 
                  />
                  <div className="hidden sm:block truncate">
                    <h4 className="font-bold text-sm truncate">{currentTrack.title}</h4>
                    <p className="text-xs text-primary-300 truncate">{currentTrack.speaker}</p>
                  </div>
                </div>

                {/* Contrôles (Centre) */}
                <div className="flex items-center gap-4 md:gap-8">
                  <button onClick={() => skipTime(-10)} className="text-primary-300 hover:text-gold-400 transition-colors"><RotateCcw size={22} /></button>
                  
                  <button onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all shadow-lg shadow-gold-500/20"
                  >
                    {isPlaying ? <Pause fill="white" size={20}/> : <Play fill="white" size={20} className="ml-1"/>}
                  </button>

                  <button onClick={() => skipTime(15)} className="text-primary-300 hover:text-gold-400 transition-colors"><RotateCw size={22} /></button>
                </div>

                {/* Fermer (Droite) */}
                <div className="w-1/3 flex justify-end">
                   <button onClick={() => { setIsPlaying(false); setCurrentTrack(null); }} className="text-primary-400 hover:text-white transition p-2"><X size={24}/></button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Style pour cacher la barre de scroll sur les filtres */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 0 5px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}