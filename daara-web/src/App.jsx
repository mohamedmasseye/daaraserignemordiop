import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORTS CAPACITOR & PLUGINS ---
import { PushNotifications } from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// --- NOUVEAUX IMPORTS POUR PWA (WEB) ---
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// --- CONFIGURATION FIREBASE WEB ---
const firebaseConfig = {
  apiKey: "AIzaSyDcBu_ebg9PHPW2Yzq4rdMymsEmcLdCAHA",
  authDomain: "daara-app-5a679.firebaseapp.com",
  projectId: "daara-app-5a679",
  storageBucket: "daara-app-5a679.firebasestorage.app",
  messagingSenderId: "1060878832216",
  appId: "1:1060878832216:web:1e26ab2371dfff293d702d"
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

// --- IMPORTS COMPOSANTS PUBLICS ---
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Books from './components/Books';
import Events from './components/Events'; 
import Contact from './components/Contact';
import Donate from './components/Donate';

// --- IMPORTS BOUTIQUE ---
import ShopHome from './components/shop/ShopHome';
import Checkout from './components/shop/Checkout';
import ProductDetails from './components/shop/ProductDetails';

// --- IMPORTS MÉDIATHÈQUE ---
import Blog from './components/Blog';
import Gallery from './components/Gallery';
import Podcast from './components/Podcast';

// --- IMPORTS AUTHENTIFICATION ---
import Register from './components/auth/Register';
import LoginPublic from './components/auth/LoginPublic';
import Profile from './components/auth/Profile';

// --- IMPORTS ADMINISTRATION ---
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

// --- PROTECTION DES ROUTES ---
const PublicProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); 
  return token ? children : <Navigate to="/login-public" replace />;
};

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/admin-login" replace />;
};

// --- LAYOUT PUBLIC ---
const PublicLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
    <Navbar />
    <div className="pt-16 flex-1">{children}</div>
    <Footer />
  </div>
);

function App() {

  // --- 1. INITIALISATION GOOGLE & TEST RÉSEAU ---
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: '1060878832216-l4nfks09797bsh49u8jqce0kd95tfb8e.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });

      const testUrl = 'https://api.daaraserignemordiop.com/api/home-content';
      fetch(testUrl)
        .then(() => console.log('Connexion API OK'))
        .catch(() => console.log('Erreur test réseau au démarrage'));
    }
  }, []);

  // --- 2. LOGIQUE DE NOTIFICATION PUSH (MOBILE NATIVE) ---
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const initPush = async () => {
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive === 'granted') {
          await PushNotifications.register();
          try {
            await FCM.subscribeTo({ topic: 'all_users' });
            console.log('✅ Mobile : Abonné au topic "all_users"');
          } catch (err) {
            console.error('❌ Erreur abonnement topic:', err);
          }
        }
      };

      initPush();

      const listenerReceived = PushNotifications.addListener('pushNotificationReceived', (notification) => {
        alert(`🔔 ${notification.title}\n${notification.body}`);
      });

      return () => {
        listenerReceived.remove();
      };
    }
  }, []);

  // --- 3. LOGIQUE DE NOTIFICATION PWA (WEB/IPHONE) ---
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      const initWebPush = async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            
            const token = await getToken(messaging, {
              serviceWorkerRegistration: registration,
              vapidKey: 'BJ74WZL1ng1TMrj6o-grxR-xu8JyKQtPyYMbYNkN2hXShorKLXraBUfHwanYJG1HYmJntivywjMNqmbUYTMGetY' 
            });

            if (token) {
              console.log('✅ Web : Token FCM récupéré :', token);
            }
          }
        } catch (err) {
          console.error('❌ Erreur Web Push (iPhone/Web):', err);
        }
      };

      // Gestion du premier plan pour PWA : Évite les doublons avec le Service Worker
      const unsubscribeOnMessage = onMessage(messaging, (payload) => {
        console.log('Message reçu au premier plan (Web) :', payload);
        alert(`🔔 ${payload.notification.title}\n${payload.notification.body}`);
      });
      
      if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
        initWebPush();
      }

      return () => unsubscribeOnMessage();
    }
  }, []);

  useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'REDIRECT' && event.data.url) {
        window.location.href = event.data.url;
      }
    });
  }
  }, []);

  return (
    <Router>
      <Routes>
        {/* ROUTES ADMIN */}
        <Route path="/admin-login" element={<LoginAdmin />} /> 
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
        <Route path="/admin/notifications" element={<AdminProtectedRoute><AdminNotifications /></AdminProtectedRoute>} />
        <Route path="/admin/messages" element={<AdminProtectedRoute><AdminMessages /></AdminProtectedRoute>} />
        <Route path="/admin/home" element={<AdminProtectedRoute><AdminHome /></AdminProtectedRoute>} />

        {/* ROUTES PUBLIQUES */}
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

        <Route path="/profil" element={
          <PublicProtectedRoute>
             <PublicLayout><Profile /></PublicLayout>
          </PublicProtectedRoute>
        } />
        
        <Route path="/login" element={<Navigate to="/admin-login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;