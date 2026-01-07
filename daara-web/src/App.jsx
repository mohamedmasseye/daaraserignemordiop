import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { secureStorage } from './utils/security';

// --- IMPORTS CAPACITOR / FIREBASE ---
import { PushNotifications } from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// --- FIREBASE CONFIG ---
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

// --- IMPORT COMPOSANTS ---
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
import AdminUsers from './components/admin/AdminUsers';

// =================================================
// 🔐 ROUTES PROTÉGÉES (CORRIGÉES)
// =================================================

const PublicProtectedRoute = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(secureStorage.getItem('_d_usr_vault'));
    setReady(true);
  }, []);

  if (!ready) return null;
  return token ? children : <Navigate to="/login-public" replace />;
};

const AdminProtectedRoute = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(secureStorage.getItem('_d_adm_vault'));
    setReady(true);
  }, []);

  if (!ready) return null;
  return token ? children : <Navigate to="/portal-daara-admin-77" replace />;
};

// =================================================

const PublicLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <Navbar />
    <div className="pt-16 flex-1">{children}</div>
    <Footer />
  </div>
);

function App() {

  // 🔇 Silence console en prod
  useEffect(() => {
    if (import.meta.env.PROD) {
      console.log = () => {};
      console.error = () => {};
      console.debug = () => {};
    }
  }, []);

  // 🔐 Google Auth MOBILE uniquement
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: '1060878832216-l4nfks09797bsh49u8jqce0kd95tfb8e.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
  }, []);

  // 🔔 PUSH MOBILE
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const initPush = async () => {
      const perm = await PushNotifications.requestPermissions();
      if (perm.receive !== 'granted') return;

      await PushNotifications.register();

      PushNotifications.addListener('registration', () => {
        FCM.subscribeTo({ topic: 'all_users' });
      });
    };

    initPush();
  }, []);

  // 🔔 PUSH WEB
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;

    onMessage(messaging, payload => {
      alert(`🔔 ${payload.notification.title}\n${payload.notification.body}`);
    });
  }, []);

  return (
    <Router>
      <Routes>

        {/* 🔐 ADMIN */}
        <Route path="/portal-daara-admin-77" element={<LoginAdmin />} />
        <Route path="/admin/users" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />

        {/* 🌍 PUBLIC */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/boutique" element={<PublicLayout><ShopHome /></PublicLayout>} />
        <Route path="/boutique/produit/:id" element={<PublicLayout><ProductDetails /></PublicLayout>} />
        <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
        <Route path="/livres" element={<PublicLayout><Books /></PublicLayout>} />
        <Route path="/evenements" element={<PublicLayout><Events /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/don" element={<PublicLayout><Donate /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
        <Route path="/galerie" element={<PublicLayout><Gallery /></PublicLayout>} />
        <Route path="/podcast" element={<PublicLayout><Podcast /></PublicLayout>} />

        <Route path="/login-public" element={<PublicLayout><LoginPublic /></PublicLayout>} />
        <Route path="/inscription" element={<PublicLayout><Register /></PublicLayout>} />

        {/* 👤 PROFIL */}
        <Route path="/profil" element={
          <PublicProtectedRoute>
            <PublicLayout><Profile /></PublicLayout>
          </PublicProtectedRoute>
        } />

        {/* 🔁 REDIRECTS */}
        <Route path="/login" element={<Navigate to="/login-public" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
