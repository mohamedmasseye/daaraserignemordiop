import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import { secureStorage } from './utils/security';
import { motion, AnimatePresence } from 'framer-motion';

// --- IMPORTS PLUGINS & FIREBASE ---
import { PushNotifications } from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { initializeApp } from "firebase/app";
import { 
  X, Download, Share, PlusSquare, Smartphone, Monitor, ChevronLeft, ChevronRight, Star 
} from 'lucide-react';

// --- CONFIGURATION FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDcBu_ebg9PHPW2Yzq4rdMymsEmcLdCAHA",
  authDomain: "daara-app-5a679.firebaseapp.com",
  projectId: "daara-app-5a679",
  storageBucket: "daara-app-5a679.firebasestorage.app",
  messagingSenderId: "1060878832216",
  appId: "1:1060878832216:web:1e26ab2371dfff293d702d"
};
const firebaseApp = initializeApp(firebaseConfig);

// --- IMPORTS COMPOSANTS PUBLICS ---
import ScrollToTop from './components/ScrollToTop'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Books from './components/Books';
import Events from './components/Events'; 
import Contact from './components/Contact';
import Donate from './components/Donate';
import ShopHome from './components/shop/ShopHome';
import Checkout from './components/shop/Checkout';
import ProductDetails from './components/shop/ProductDetails';
import Blog from './components/Blog';
import Gallery from './components/Gallery';
import Podcast from './components/Podcast';
import Register from './components/auth/Register';
import LoginPublic from './components/auth/LoginPublic';
import Profile from './components/auth/Profile';
import PrivacyPolicy from './components/PrivacyPolicy';
import MentionsLegales from './components/MentionsLegales';

// --- IMPORTS COMPOSANTS ADMIN ---
import LoginAdmin from './components/admin/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminBooks from './components/admin/AdminBooks';
import AdminEvents from './components/admin/AdminEvents';
import AdminUsers from './components/admin/AdminUsers';
import AdminNotifications from './components/admin/AdminNotifications';
import AdminMessages from './components/admin/AdminMessages';
import AdminBlog from './components/admin/AdminBlog';
import AdminGallery from './components/admin/AdminGallery';
import AdminPodcast from './components/admin/AdminPodcast';
import AdminProducts from './components/admin/AdminProducts';
import AdminOrders from './components/admin/AdminOrders';
import AdminHome from './components/admin/AdminHome';
import AdminMonitoring from './components/admin/AdminMonitoring';

// --- ✅ CONFIGURATION DES ÉTAPES D'INSTALLATION (MODÈLE CONSERVÉ) ---
const INSTALL_STEPS = {
  safari: [
    { title: "Étape 1", desc: "Appuyez sur l'icône 'Partager' en bas du navigateur Safari.", img: "/safari_step1.png", icon: <Share className="text-blue-500" /> },
    { title: "Étape 2", desc: "Faites défiler le menu et sélectionnez 'Sur l'écran d'accueil'.", img: "/safari_step2.png", icon: <PlusSquare className="text-primary-900" /> },
    { title: "Étape 3", desc: "Appuyez sur 'Ajouter' en haut à droite pour finaliser.", img: "/safari_step3.png", icon: <Smartphone className="text-gold-500" /> }
  ],
  google: [
    { title: "Étape 1", desc: "Appuyez sur les trois points verticaux en haut à droite.", img: "/google_step1.png", icon: <Monitor className="text-gray-500" /> },
    { title: "Étape 2", desc: "Sélectionnez 'Installer l'application' dans la liste.", img: "/google_step2.png", icon: <Download className="text-primary-900" /> },
    { title: "Étape 3", desc: "Confirmez l'installation pour voir le Daara sur votre écran.", img: "/google_step3.png", icon: <Star className="text-gold-500" /> }
  ]
};

// --- ✅ COMPOSANT GUIDE INSTALLATION PLEIN ÉCRAN ---
const PWAInstallGuide = ({ isOpen, onClose }) => {
  const [browser, setBrowser] = useState('safari'); 
  const [step, setStep] = useState(0);
  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-white flex flex-col font-sans">
      <div className="p-4 md:p-6 flex justify-between items-center bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="w-8 h-8 object-contain" alt="Logo" />
          <h3 className="font-black text-primary-900 uppercase tracking-tighter text-sm">Installation Daara App</h3>
        </div>
        <button onClick={onClose} className="p-2 bg-primary-50 rounded-full text-primary-900 hover:bg-red-50 hover:text-red-500 transition-all"><X size={24}/></button>
      </div>
      <div className="bg-gray-50 p-4 shrink-0">
        <div className="max-w-md mx-auto flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          <button onClick={() => { setBrowser('safari'); setStep(0); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${browser === 'safari' ? 'bg-primary-900 text-white shadow-lg' : 'text-gray-400'}`}>Safari (iOS)</button>
          <button onClick={() => { setBrowser('google'); setStep(0); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${browser === 'google' ? 'bg-primary-900 text-white shadow-lg' : 'text-gray-400'}`}>Chrome (Android)</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-10 flex flex-col items-center">
        <div className="max-w-2xl w-full flex flex-col items-center text-center">
          <motion.div key={`${browser}-${step}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full mb-8">
            <div className="inline-flex items-center gap-2 bg-gold-50 text-gold-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
               {INSTALL_STEPS[browser][step].icon} {INSTALL_STEPS[browser][step].title}
            </div>
            <h4 className="text-xl md:text-3xl font-serif font-bold text-primary-900 leading-tight">{INSTALL_STEPS[browser][step].desc}</h4>
          </motion.div>
          <div className="w-full max-w-[280px] md:max-w-[350px] aspect-[9/16] bg-gray-100 rounded-[3rem] border-[8px] border-primary-900 shadow-2xl overflow-hidden relative mb-10">
             <motion.img key={`img-${browser}-${step}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} src={INSTALL_STEPS[browser][step].img} className="w-full h-full object-cover" alt="Instruction" onError={(e) => { e.target.src = "https://via.placeholder.com/600x1200?text=Capture+Ecran"; }} />
          </div>
        </div>
      </div>
      <div className="p-6 bg-white border-t border-gray-100 shrink-0">
        <div className="max-w-md mx-auto flex items-center justify-between gap-6">
          <button disabled={step === 0} onClick={() => setStep(s => s - 1)} className="p-4 bg-gray-50 rounded-2xl text-primary-900 disabled:opacity-20 transition-all font-bold"><ChevronLeft size={28} /></button>
          <div className="flex gap-2">{[0, 1, 2].map(i => (<div key={i} className={`h-2 rounded-full transition-all duration-300 ${step === i ? 'w-10 bg-gold-500' : 'w-2 bg-gray-200'}`} />))}</div>
          {step < 2 ? (
            <button onClick={() => setStep(s => s + 1)} className="flex-1 py-4 bg-primary-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2">Suivant <ChevronRight size={18}/></button>
          ) : (
            <button onClick={onClose} className="flex-1 py-4 bg-gold-500 text-primary-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Terminer</button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- ✅ COMPOSANT BANNIÈRE PWA HEADER ---
const PWAHeader = ({ onInstallClick }) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const isLaptop = window.innerWidth > 1024;
    const isDismissed = localStorage.getItem('daara_pwa_dismissed');
    const isNative = Capacitor.isNativePlatform();
    const isHome = location.pathname === "/";

    if (isHome && !isNative && !isStandalone && !isLaptop && !isDismissed) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [location.pathname]);

  if (!isVisible) return null;

  return (
    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-[#050b15] text-white py-2.5 px-4 md:px-8 flex items-center justify-between border-b border-gold-500/20 relative z-[999] shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-inner"><img src="/logo.png" className="w-full h-full object-contain" alt="" /></div>
        <div className="text-left">
          <h2 className="text-[10px] md:text-sm font-black uppercase text-gold-400 leading-none">Daara App</h2>
          <p className="text-[8px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Application iOS & Android</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onInstallClick} className="bg-gold-500 text-primary-950 px-5 py-1.5 rounded-full font-black text-[10px] uppercase shadow-lg active:scale-95 hover:bg-white transition-all">Installer</button>
        <button onClick={() => { setIsVisible(false); localStorage.setItem('daara_pwa_dismissed', 'true'); }} className="p-1 text-gray-500 hover:text-white transition-colors"><X size={18}/></button>
      </div>
    </motion.div>
  );
};

// --- PROTECTION DES ROUTES ---
const PublicProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null; 
  return token ? children : <Navigate to="/login-public" replace />;
};

const AdminProtectedRoute = ({ children }) => {
  const { adminToken, loading } = useAuth();
  if (loading) return null;
  return adminToken ? children : <Navigate to="/portal-daara-admin-77" replace />;
};

// --- LAYOUTS ---
const PublicLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
    <Navbar />
    <div className="pt-16 flex-1">{children}</div>
    <Footer />
  </div>
);

// --- LOGIQUE PRINCIPALE APP ---
function AppContent() {
  const [isPWAOpen, setIsPWAOpen] = useState(false);

  useEffect(() => {
    if (import.meta.env.PROD) {
      console.log = () => {}; console.error = () => {}; console.debug = () => {};
    }
  }, []);

  useEffect(() => {
    const initGoogle = async () => {
      if (Capacitor.isNativePlatform()) {
        await GoogleAuth.initialize({
          clientId: '1060878832216-l4nfks09797bsh49u8jqce0kd95tfb8e.apps.googleusercontent.com',
          scopes: ['profile', 'email'], grantOfflineAccess: true,
        });
      }
    };
    initGoogle();
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const initPushLogic = async () => {
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') { permStatus = await PushNotifications.requestPermissions(); }
        if (permStatus.receive !== 'granted') return;
        await PushNotifications.removeAllListeners();
        await PushNotifications.addListener('registration', (token) => { FCM.subscribeTo({ topic: 'all_users' }); });
        await PushNotifications.addListener('pushNotificationReceived', (notification) => { alert(`🔔 ${notification.title}\n${notification.body}`); });
        await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          const url = action.notification.data?.url; if (url) window.location.href = url;
        });
        await PushNotifications.register();
      };
      initPushLogic();
    }
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      const initWebPush = async () => {
        try {
          const { getMessaging, getToken, onMessage } = await import("firebase/messaging");
          const messaging = getMessaging(firebaseApp);
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            await getToken(messaging, { 
              serviceWorkerRegistration: registration, 
              vapidKey: 'BJ74WZL1ng1TMrj6o-grxR-xu8JyKQtPyYMbYNkN2hXShorKLXraBUfHwanYJG1HYmJntivywjMNqmbUYTMGetY' 
            });
            onMessage(messaging, (payload) => { alert(`🔔 ${payload.notification.title}\n${payload.notification.body}`); });
          }
        } catch (err) { console.log("Erreur initialisation Web Push", err); }
      };
      if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) { initWebPush(); }
    }
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => { if (event.data && event.data.url) window.location.href = event.data.url; });
    }
    const handleCheckRouting = () => {
      const params = new URLSearchParams(window.location.search);
      const eventId = params.get('id');
      if (eventId && !window.location.pathname.includes('/evenements')) { window.location.href = `/evenements?id=${eventId}`; }
    };
    handleCheckRouting();
    window.addEventListener('focus', handleCheckRouting);
    return () => window.removeEventListener('focus', handleCheckRouting);
  }, []);

  return (
    <>
      <PWAHeader onInstallClick={() => setIsPWAOpen(true)} />
      <AnimatePresence>
        {isPWAOpen && <PWAInstallGuide isOpen={isPWAOpen} onClose={() => setIsPWAOpen(false)} />}
      </AnimatePresence>

      <Routes>
        <Route path="/portal-daara-admin-77" element={<LoginAdmin />} /> 
        <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/admin/books" element={<AdminProtectedRoute><AdminBooks /></AdminProtectedRoute>} />
        <Route path="/admin/blog" element={<AdminProtectedRoute><AdminBlog /></AdminProtectedRoute>} />
        <Route path="/admin/galerie" element={<AdminProtectedRoute><AdminGallery /></AdminProtectedRoute>} />
        <Route path="/admin/podcast" element={<AdminProtectedRoute><AdminPodcast /></AdminProtectedRoute>} />
        <Route path="/admin/products" element={<AdminProtectedRoute><AdminProducts /></AdminProtectedRoute>} />
        <Route path="/admin/orders" element={<AdminProtectedRoute><AdminOrders /></AdminProtectedRoute>} />
        <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
        <Route path="/admin/events" element={<AdminProtectedRoute><AdminEvents /></AdminProtectedRoute>} />
        <Route path="/admin/monitoring" element={<AdminMonitoring />} />
        <Route path="/admin/notifications" element={<AdminProtectedRoute><AdminNotifications /></AdminProtectedRoute>} />
        <Route path="/admin/messages" element={<AdminProtectedRoute><AdminMessages /></AdminProtectedRoute>} />
        <Route path="/admin/home" element={<AdminProtectedRoute><AdminHome /></AdminProtectedRoute>} />

        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/boutique" element={<PublicLayout><ShopHome /></PublicLayout>} />
        <Route path="/boutique/produit/:id" element={<PublicLayout><ProductDetails /></PublicLayout>} />
        <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
        <Route path="/livres" element={<PublicLayout><Books /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
        <Route path="/galerie" element={<PublicLayout><Gallery /></PublicLayout>} />
        <Route path="/podcast" element={<PublicLayout><Podcast /></PublicLayout>} />
        <Route path="/evenements" element={<PublicLayout><Events /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/don" element={<PublicLayout><Donate /></PublicLayout>} />
        <Route path="/inscription" element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/login-public" element={<PublicLayout><LoginPublic /></PublicLayout>} />
        <Route path="/privacy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
        <Route path="/mentions-legales" element={<PublicLayout><MentionsLegales /></PublicLayout>} />

        <Route path="/profil" element={<PublicProtectedRoute><PublicLayout><Profile /></PublicLayout></PublicProtectedRoute>} />
        
        <Route path="/admin-login" element={<Navigate to="/portal-daara-admin-77" replace />} />
        <Route path="/login" element={<Navigate to="/login-public" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;