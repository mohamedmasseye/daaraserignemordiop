import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Headphones, Clock, Download, Share2, Mic, Music, 
  Info, X, RotateCcw, RotateCw, Volume2 
} from 'lucide-react';

export default function Podcast() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Tous');
  
  // Nouveaux états pour le lecteur
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
        console.error("Erreur chargement podcasts:", error);
        setPodcasts([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchPodcasts();
  }, []);

  // 2. GESTION LECTURE AUDIO
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  // FONCTIONS UTILITAIRES POUR LE TEMPS
  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

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
      setCurrentTime(0); // Reset le temps pour une nouvelle piste
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const categories = ['Tous', ...new Set(podcasts.map(p => p.category || 'Autre'))];
  const filteredPodcasts = activeCategory === 'Tous' ? podcasts : podcasts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      
      <audio 
        ref={audioRef} 
        src={currentTrack?.audioUrl} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* --- HERO HEADER --- */}
      <div className="relative pt-32 pb-24 px-4 overflow-hidden bg-slate-900 shadow-2xl">
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&w=2000&q=80" 
                alt="Background" 
                className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-gray-50"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-end justify-between gap-8 text-white">
          <div className="max-w-2xl text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-orange-500/30 backdrop-blur-sm"
            >
              <Mic size={14} /> Audio & Conférences
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-7xl font-serif font-bold mb-6 leading-tight"
            >
              La Voix du <span className="text-orange-500">Daara</span>
            </motion.h1>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-md w-full md:w-auto shadow-2xl flex items-center gap-6"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
              <Headphones size={32} className="text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold font-serif">{podcasts.length}</p>
              <p className="text-xs text-slate-300 mt-1">Épisodes disponibles</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- SECTION CONTENU --- */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        
        {/* FILTRES */}
        <div className="flex overflow-x-auto pb-4 no-scrollbar items-center justify-start md:justify-center gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-md ${
                activeCategory === cat 
                  ? 'bg-orange-500 text-white scale-105 shadow-orange-500/20' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* LISTE DES PODCASTS */}
        <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
          {loading ? (
              <div className="p-20 text-center text-gray-400 font-medium">Chargement de la bibliothèque...</div>
          ) : filteredPodcasts.map((track, idx) => {
              const active = currentTrack?._id === track._id;
              return (
                <motion.div 
                  key={track._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  className={`group bg-white rounded-2xl p-4 shadow-sm border transition-all flex items-center gap-4 ${active ? 'border-orange-500 bg-orange-50/50' : 'border-gray-100 hover:shadow-md'}`}
                >
                  <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
                    {track.coverImage ? (
                      <img src={track.coverImage} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white"><Music size={24} /></div>
                    )}
                    <button onClick={() => handlePlay(track)} className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {active && isPlaying ? <Pause size={24} className="text-white" fill="white"/> : <Play size={24} className="text-white ml-1" fill="white"/>}
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base md:text-lg font-bold truncate ${active ? 'text-orange-600' : 'text-gray-900'}`}>{track.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{track.speaker}</p>
                    <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                       <span className="flex items-center gap-1"><Clock size={12}/> {track.duration || '--:--'}</span>
                       <span>{formatDate(track.createdAt)}</span>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-2">
                     <a href={track.audioUrl} download className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"><Download size={20}/></a>
                     <button className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"><Share2 size={20}/></button>
                  </div>
                </motion.div>
              );
            })
          }
        </div>
      </div>

      {/* --- LECTEUR AUDIO "MODERN GLASS" --- */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div 
            initial={{ y: 150 }} animate={{ y: 0 }} exit={{ y: 150 }}
            className="fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-2xl text-white border-t border-white/10 px-4 py-4 md:py-6 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]"
          >
            <div className="max-w-7xl mx-auto">
              
              {/* Timeline (Scrubbing) */}
              <div className="flex items-center gap-3 mb-4 group">
                <span className="text-[10px] font-mono text-slate-400 w-10 text-right">{formatTime(currentTime)}</span>
                <div className="relative flex-1 flex items-center">
                  <input 
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleScrub}
                    className="absolute w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500 z-10"
                    style={{
                      background: `linear-gradient(to right, #f97316 ${(currentTime / duration) * 100}%, #334155 ${(currentTime / duration) * 100}%)`
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400 w-10">{formatTime(duration)}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                
                {/* Info Track (Gauche) */}
                <div className="flex items-center gap-3 w-1/4 md:w-1/3 min-w-0">
                  <img 
                    src={currentTrack.coverImage || "/logo.png"} 
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover shadow-lg ${isPlaying ? 'ring-2 ring-orange-500 animate-pulse' : ''}`} 
                    alt="" 
                  />
                  <div className="hidden sm:block truncate">
                    <h4 className="font-bold text-sm md:text-base truncate">{currentTrack.title}</h4>
                    <p className="text-xs text-slate-400 truncate">{currentTrack.speaker}</p>
                  </div>
                </div>

                {/* Contrôles (Centre) */}
                <div className="flex items-center gap-4 md:gap-8">
                  <button onClick={() => skipTime(-10)} className="text-slate-400 hover:text-white transition-colors" title="Reculer de 10s">
                    <RotateCcw size={22} />
                  </button>
                  
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-14 h-14 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-500/40 hover:scale-110 active:scale-95 transition-all"
                  >
                    {isPlaying ? <Pause fill="white" size={24}/> : <Play fill="white" size={24} className="ml-1"/>}
                  </button>

                  <button onClick={() => skipTime(15)} className="text-slate-400 hover:text-white transition-colors" title="Avancer de 15s">
                    <RotateCw size={22} />
                  </button>
                </div>

                {/* Actions (Droite) */}
                <div className="flex items-center justify-end gap-2 md:gap-4 w-1/4 md:w-1/3">
                  <div className="hidden md:flex items-center gap-2 text-slate-400 mr-4">
                     <Volume2 size={18} />
                     <div className="w-20 h-1 bg-slate-700 rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-slate-400 w-3/4"></div>
                     </div>
                  </div>
                  <button onClick={() => { setIsPlaying(false); setCurrentTrack(null); }} className="p-2 text-slate-400 hover:text-white transition-colors">
                    <X size={24}/>
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: 2px solid #f97316;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .group:hover input[type='range']::-webkit-slider-thumb {
          opacity: 1;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}