import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMessaging, getToken } from "firebase/messaging";
import axios from 'axios';

export default function NotificationBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est sur iPhone PWA (standalone) et n'a pas encore décidé
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone && Notification.permission === 'default') {
      setIsVisible(true);
    }
  }, []);

  const handleEnable = async () => {
    try {
      const messaging = getMessaging();
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const token = await getToken(messaging, { 
          vapidKey: 'BJ74WZL1ng1TMrj6o-grxR-xu8JyKQtPyYMbYNkN2hXShorKLXraBUfHwanYJG1HYmJntivywjMNqmbUYTMGetY'
        });
        
        if (token) {
          // Abonner automatiquement au topic via votre API
          await axios.post('/api/notifications/subscribe', { token });
          setIsVisible(false);
          alert("Notifications activées avec succès !");
        }
      }
    } catch (error) {
      console.error("Erreur activation notifications:", error);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-20 left-4 right-4 z-50 bg-primary-900 text-white p-4 rounded-2xl shadow-2xl border border-gold-500/30 backdrop-blur-md"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold-500 rounded-full text-primary-900">
                <Bell size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">Restez informé !</p>
                <p className="text-xs text-white/70">Activez les alertes pour ne rien rater du Daara.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleEnable}
                className="bg-gold-500 text-primary-900 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gold-400 transition"
              >
                Activer
              </button>
              <button onClick={() => setIsVisible(false)} className="text-white/50 hover:text-white">
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}