import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { 
  Play, Pause, Headphones, Clock, Download, Share2, Mic, Music, 
  X, RotateCcw, RotateCw, Volume2, Calendar
} from 'lucide-react';

export default function Podcast() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const response = await API.get('/api/podcasts');
        setPodcasts(response.data || []);
      } catch (error) {
        console.error("Erreur chargement:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPodcasts();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

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

  const categories = ['Tous', ...new Set(podcasts.map(p => p.category || 'Autre'))];
  const filteredPodcasts = activeCategory === 'Tous' ? podcasts : podcasts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 pb-40 font-sans">
      <audio 
        ref={audioRef} 
        src={currentTrack?.audioUrl} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* --- HERO HEADER --- */}
      <div className="relative pt-32 pb-32 px-4 overflow-hidden bg-primary-900">
        <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&w=2000&q=80" 
              className="w-full h-full object-cover opacity-20" alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary-900/60 to-primary-900"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <span className="inline-block py-1 px-4 rounded-full bg-gold-500/20 text-gold-400 text-xs font-bold tracking-widest uppercase mb-6 border border-gold-500/30">
              Médiathèque Spirituelle
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 italic">
              La Voix du <span className="text-gold-500">Daara</span>
            </h1>
            <p className="text-primary-100 text-lg max-w-2xl mx-auto font-light opacity-80">
              Écoutez, apprenez et méditez avec nos conférences et rappels audio.
            </p>
          </motion.div>
        </div>
      </div>

      {/* --- SECTION CONTENU --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        
        {/* FILTRES RESPONSIVES (Horizontal scroll on mobile) */}
        <div className="flex overflow-x-auto no-scrollbar gap-3 mb-12 pb-4 justify-start md:justify-center">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 shadow-xl border ${
                activeCategory === cat 
                ? 'bg-gold-500 text-white border-gold-400 scale-105' 
                : 'bg-white text-primary-900 border-transparent hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRILLE DES PODCASTS */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => <div key={n} className="h-80 bg-white/50 animate-pulse rounded-3xl"></div>)}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredPodcasts.map((track, idx) => {
                const active = currentTrack?._id === track._id;
                return (
                  <motion.div
                    layout
                    key={track._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`group bg-white rounded-[2.5rem] p-5 shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative ${active ? 'ring-2 ring-gold-500 bg-gold-50/10' : ''}`}
                  >
                    {/* Image / Cover */}
                    <div className="relative aspect-square mb-6 rounded-[2rem] overflow-hidden shadow-inner bg-gray-100">
                      {track.coverImage ? (
                        <img 
                          src={track.coverImage} 
                          className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${active && isPlaying ? 'scale-105' : ''}`} 
                          alt="" 
                        />
                      ) : (
                        <div className="w-full h-full bg-primary-50 flex items-center justify-center text-primary-200"><Music size={64} /></div>
                      )}
                      
                      {/* Overlay Play */}
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <button 
                          onClick={() => handlePlay(track)}
                          className="w-20 h-20 bg-white text-primary-900 rounded-full flex items-center justify-center shadow-2xl transform transition-transform hover:scale-110 active:scale-95"
                        >
                          {active && isPlaying ? <Pause size={32} fill="currentColor"/> : <Play size={32} fill="currentColor" className="ml-2"/>}
                        </button>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-primary-900 uppercase tracking-widest shadow-sm">
                        {track.category || 'Général'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 px-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-tighter">
                        <Calendar size={12} className="text-gold-500"/> {new Date(track.createdAt).toLocaleDateString()}
                      </div>
                      <h3 className="text-xl font-bold font-serif text-primary-900 mb-2 line-clamp-2 leading-tight group-hover:text-gold-600 transition-colors">
                        {track.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-6 flex items-center gap-2 italic">
                        <Mic size={14} className="text-gold-500 shrink-0"/> {track.speaker}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary-400">
                           <Clock size={14}/> {track.duration || '--:--'}
                        </div>
                        <div className="flex gap-1">
                          <a href={track.audioUrl} download className="p-3 bg-gray-50 text-gray-400 hover:text-gold-600 hover:bg-gold-50 rounded-2xl transition-all">
                            <Download size={18}/>
                          </a>
                          <button className="p-3 bg-gray-50 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all">
                            <Share2 size={18}/>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* --- LECTEUR FLOTTANT (DESIGN PREMIUM) --- */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 md:left-10 md:right-10 z-[100]"
          >
            <div className="bg-primary-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl p-4 md:p-6 text-white max-w-5xl mx-auto overflow-hidden relative">
              
              {/* Progress Bar (at the top edge) */}
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <motion.div 
                  className="h-full bg-gold-500"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                
                {/* Info & Cover */}
                <div className="flex items-center gap-4 w-full md:w-1/3 min-w-0">
                  <div className="relative shrink-0">
                    <img 
                      src={currentTrack.coverImage || "/logo.png"} 
                      className={`w-14 h-14 rounded-2xl object-cover shadow-2xl ${isPlaying ? 'animate-pulse' : ''}`} alt="" 
                    />
                    {isPlaying && (
                      <div className="absolute -bottom-1 -right-1 bg-gold-500 p-1 rounded-full border-2 border-primary-900">
                        <Volume2 size={10} className="text-primary-900" />
                      </div>
                    )}
                  </div>
                  <div className="truncate">
                    <h4 className="font-bold text-sm truncate">{currentTrack.title}</h4>
                    <p className="text-[10px] text-primary-300 font-bold uppercase tracking-widest">{currentTrack.speaker}</p>
                  </div>
                </div>

                {/* Controls & Progress Slider */}
                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center justify-center gap-6 md:gap-10">
                    <button onClick={() => skipTime(-10)} className="text-white/40 hover:text-gold-400 transition-colors"><RotateCcw size={22} /></button>
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-14 h-14 bg-white text-primary-900 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"
                    >
                      {isPlaying ? <Pause fill="currentColor" size={24}/> : <Play fill="currentColor" size={24} className="ml-1"/>}
                    </button>
                    <button onClick={() => skipTime(15)} className="text-white/40 hover:text-gold-400 transition-colors"><RotateCw size={22} /></button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-primary-300 w-10 text-right">{formatTime(currentTime)}</span>
                    <input 
                      type="range" min="0" max={duration || 0} value={currentTime} onChange={handleScrub}
                      className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-gold-500"
                    />
                    <span className="text-[10px] font-mono text-primary-300 w-10">{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Close/Actions */}
                <div className="hidden md:flex items-center gap-4 w-1/3 justify-end">
                   <button onClick={() => { setIsPlaying(false); setCurrentTrack(null); }} className="p-3 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-full transition-all group">
                     <X size={20}/>
                   </button>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #D4AF37;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}