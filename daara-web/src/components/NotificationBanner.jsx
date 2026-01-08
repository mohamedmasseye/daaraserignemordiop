import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMessaging, getToken } from "firebase/messaging";
import API from '../services/api'; // ✅ Utilise ton instance sécurisée

export default function NotificationBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      setIsVisible(false);
      return;
    }
    const isDismissed = localStorage.getItem('daara_notif_dismissed');
    if (isDismissed) return;

    // 2. Vérifier si on est en mode PWA (Standalone)
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

    // 3. N'afficher que si les permissions sont encore en mode "par défaut"
    if (isStandalone && Notification.permission === 'default') {
      setIsVisible(true);
    }
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const messaging = getMessaging();
      const permission = await Notification.requestPermission();
      
      // ✅ Quoi qu'il arrive, on cache la bannière après une décision (Autoriser ou Refuser)
      setIsVisible(false);
      localStorage.setItem('daara_notif_dismissed', 'true');

      if (permission === 'granted') {
        const token = await getToken(messaging, { 
          vapidKey: 'BJ74WZL1ng1TMrj6o-grxR-xu8JyKQtPyYMbYNkN2hXShorKLXraBUfHwanYJG1HYmJntivywjMNqmbUYTMGetY'
        });
        
        if (token) {
          // ✅ Utilisation de l'API sécurisée pour l'abonnement
          await API.post('/api/notifications/subscribe', { token });
          alert("✅ Notifications activées ! Vous recevrez les alertes du Daara.");
        }
      }
    } catch (error) {
      console.error("Erreur FCM:", error);
      setIsVisible(false); // Cacher même en cas d'erreur technique
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('daara_notif_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-20 left-4 right-4 z-[999] bg-primary-900 text-white p-5 rounded-[2rem] shadow-2xl border-2 border-gold-500/30 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gold-500 rounded-2xl text-primary-900 shadow-lg shadow-gold-500/20">
                <Bell size={24} className={loading ? "animate-bounce" : ""} />
              </div>
              <div>
                <p className="font-black text-sm uppercase tracking-wider">Restez connecté</p>
                <p className="text-xs text-primary-200 font-medium">Activez les alertes pour ne rien rater.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleEnable}
                disabled={loading}
                className="bg-gold-500 text-primary-900 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={16}/> : "Activer"}
              </button>
              <button onClick={handleDismiss} className="p-2 text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}