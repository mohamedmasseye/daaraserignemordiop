import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';

export default function PWAHeader({ onInstallClick }) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Vérifie si on est déjà en mode PWA (Standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    // 2. Vérifie si on est sur un Laptop/PC (Largeur > 1024px)
    const isLaptop = window.innerWidth > 1024;
    // 3. Vérifie si l'utilisateur l'a déjà fermée
    const isDismissed = localStorage.getItem('daara_pwa_dismissed');

    if (!isStandalone && !isLaptop && !isDismissed) {
      setShowBanner(true);
    }
  }, []);

  const handleDismiss = (e) => {
    e.stopPropagation();
    setShowBanner(false);
    localStorage.setItem('daara_pwa_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-[#050b15] text-white py-2.5 px-4 flex items-center justify-between border-b border-gold-500/20 relative z-[999] shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-inner">
              <img src="/logo.png" className="w-full h-full object-contain" alt="Logo" />
            </div>
            <div className="text-left">
              <h2 className="text-[10px] md:text-sm font-black uppercase tracking-tighter leading-none text-gold-400">Daara App</h2>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">Installer sur votre écran</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={onInstallClick}
              className="bg-gold-500 text-primary-950 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all active:scale-95 flex items-center gap-2"
            >
              Installer <Download size={12} />
            </button>
            <button onClick={handleDismiss} className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-500">
              <X size={18}/>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}