import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import { secureStorage } from './utils/security';

// --- IMPORTS PLUGINS & FIREBASE ---
import { PushNotifications } from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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
const messaging = getMessaging(firebaseApp);

// --- IMPORTS COMPOSANTS ---
import ScrollToTop from './components/ScrollToTop'; // ✅ AJOUT DE L'IMPORT
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

// --- PROTECTION DES ROUTES SÉCURISÉES ---
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

// --- LOGIQUE PRINCIPALE ---
function AppContent() {
  
  // 1. SILENCE CONSOLES EN PROD
  useEffect(() => {
    if (import.meta.env.PROD) {
      console.log = () => {};
      console.error = () => {};
      console.debug = () => {};
    }
  }, []);

  // 2. INITIALISATION GOOGLE AUTH
  useEffect(() => {
    const initGoogle = async () => {
      if (Capacitor.isNativePlatform()) {
        await GoogleAuth.initialize({
          clientId: '1060878832216-l4nfks09797bsh49u8jqce0kd95tfb8e.apps.googleusercontent.com',
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
      }
    };
    initGoogle();
  }, []);

  // 3. LOGIQUE NOTIFICATIONS PUSH (MOBILE)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const initPushLogic = async () => {
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') { 
          permStatus = await PushNotifications.requestPermissions(); 
        }
        if (permStatus.receive !== 'granted') return;

        await PushNotifications.removeAllListeners();
        await PushNotifications.addListener('registration', (token) => {
          FCM.subscribeTo({ topic: 'all_users' });
        });
        await PushNotifications.addListener('pushNotificationReceived', (notification) => {
          alert(`🔔 ${notification.title}\n${notification.body}`);
        });
        await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          const url = action.notification.data?.url;
          if (url) window.location.href = url;
        });
        await PushNotifications.register();
      };
      initPushLogic();
    }
  }, []);

  // 4. LOGIQUE WEB PUSH (FIREBASE)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      const initWebPush = async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            await getToken(messaging, { 
              serviceWorkerRegistration: registration, 
              vapidKey: 'BJ74WZL1ng1TMrj6o-grxR-xu8JyKQtPyYMbYNkN2hXShorKLXraBUfHwanYJG1HYmJntivywjMNqmbUYTMGetY' 
            });
          }
        } catch (err) {}
      };
      onMessage(messaging, (payload) => { 
        alert(`🔔 ${payload.notification.title}\n${payload.notification.body}`); 
      });
      if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) { 
        initWebPush(); 
      }
    }
  }, []);

  // 5. GESTION ROUTING & SERVICE WORKERS
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.url) window.location.href = event.data.url;
      });
    }
    const handleCheckRouting = () => {
      const params = new URLSearchParams(window.location.search);
      const eventId = params.get('id');
      if (eventId && !window.location.pathname.includes('/evenements')) {
        window.location.href = `/evenements?id=${eventId}`;
      }
    };
    handleCheckRouting();
    window.addEventListener('focus', handleCheckRouting);
    return () => window.removeEventListener('focus', handleCheckRouting);
  }, []);

  return (
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

      <Route path="/profil" element={
        <PublicProtectedRoute>
            <PublicLayout><Profile /></PublicLayout>
        </PublicProtectedRoute>
      } />
      
      <Route path="/admin-login" element={<Navigate to="/portal-daara-admin-77" replace />} />
      <Route path="/login" element={<Navigate to="/login-public" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// --- WRAPPER FINAL ---
function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop /> {/* ✅ PLACÉ ICI, IL AGIRA SUR TOUTES LES PAGES */}
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;