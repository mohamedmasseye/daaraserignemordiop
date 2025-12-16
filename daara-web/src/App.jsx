import React, { useEffect } from 'react'; // J'ai ajouté useEffect ici
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- 1. IMPORTS CAPACITOR (NOUVEAU) ---
import { PushNotifications } from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';
import { Capacitor } from '@capacitor/core';

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

// --- GARDIENS DE SÉCURITÉ (PROTECTION DES ROUTES) ---

// 1. Protection Public
const PublicProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); 
  if (!token) {
    return <Navigate to="/login-public" replace />; 
  }
  return children;
};

// 2. Protection Admin
const AdminProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/admin-login" replace />; 
    }
    return children;
}

// --- LAYOUT PUBLIC GLOBAL ---
const PublicLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
    <Navbar />
    <div className="pt-16 flex-1">
      {children}
    </div>
    <Footer />
  </div>
);

function App() {

  // --- 2. LOGIQUE DE NOTIFICATION (NOUVEAU) ---
  useEffect(() => {
    // On vérifie si on est sur mobile pour ne pas faire planter le site web
    if (Capacitor.isNativePlatform()) {
      
      const initPush = async () => {
        // A. Vérifier / Demander la permission
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive === 'granted') {
          // B. Enregistrer l'appareil sur le réseau
          await PushNotifications.register();
          
          // C. S'abonner au canal "all_users" pour recevoir les messages de l'admin
          try {
            await FCM.subscribeTo({ topic: 'all_users' });
            console.log('✅ Mobile : Abonné au topic "all_users"');
          } catch (err) {
            console.error('❌ Erreur abonnement topic:', err);
          }
        }
      };

      initPush();

      // D. Écouter les notifications reçues (App ouverte)
      const listenerReceived = PushNotifications.addListener('pushNotificationReceived', (notification) => {
        alert(`🔔 ${notification.title}\n${notification.body}`);
      });

      // E. Écouter le clic sur la notification
      const listenerAction = PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Notification ouverte:', notification);
        // Vous pourrez ajouter une redirection ici plus tard si besoin
      });

      // Nettoyage des écouteurs
      return () => {
        listenerReceived.remove();
        listenerAction.remove();
      };
    }
  }, []);
  // ---------------------------------------------

  return (
    <Router>
      <Routes>
        
        {/* =======================================================
            ZONE ADMINISTRATION (BACK-OFFICE)
            ======================================================= */}
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


        {/* =======================================================
            ZONE PUBLIQUE (VISITEURS & MEMBRES)
            ======================================================= */}
        
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
             <PublicLayout>
                <Profile />
             </PublicLayout>
          </PublicProtectedRoute>
        } />
        
        <Route path="/login" element={<Navigate to="/admin-login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </Router>
  );
}

export default App;