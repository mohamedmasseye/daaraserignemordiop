import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORTS COMPOSANTS PUBLICS ---
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Books from './components/Books';
import Events from './components/Events'; // Import du composant Events (Agenda & Billetterie)
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

// 1. Protection Public (Pour le Profil utilisateur connecté)
const PublicProtectedRoute = ({ children }) => {
  // 👇 CORRECTION ICI : on cherche 'token'
  const token = localStorage.getItem('token'); 
  if (!token) {
    return <Navigate to="/login-public" replace />; 
  }
  return children;
};

// 2. Protection Admin (Pour le Back-office)
const AdminProtectedRoute = ({ children }) => {
    // 👇 CORRECTION ICI : on cherche 'token' (C'est le plus important !)
    const token = localStorage.getItem('token');
    
    if (!token) {
        return <Navigate to="/admin-login" replace />; 
    }
    return children;
}

// --- LAYOUT PUBLIC GLOBAL ---
// Ce layout assure que la Navbar et le Footer sont présents sur toutes les pages publiques
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
  return (
    <Router>
      <Routes>
        
        {/* =======================================================
            ZONE ADMINISTRATION (BACK-OFFICE)
            Accessibles uniquement via connexion Admin
           ======================================================= */}
        
        {/* Connexion Admin */}
        <Route path="/admin-login" element={<LoginAdmin />} /> 
        
        {/* Dashboard & Général */}
        <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        
        {/* Gestion Contenu (Médiathèque) */}
        <Route path="/admin/books" element={<AdminProtectedRoute><AdminBooks /></AdminProtectedRoute>} />
        <Route path="/admin/blog" element={<AdminProtectedRoute><AdminBlog /></AdminProtectedRoute>} />
        <Route path="/admin/galerie" element={<AdminProtectedRoute><AdminGallery /></AdminProtectedRoute>} />
        <Route path="/admin/podcast" element={<AdminProtectedRoute><AdminPodcast /></AdminProtectedRoute>} />

        {/* Gestion Boutique */}
        <Route path="/admin/products" element={<AdminProtectedRoute><AdminProducts /></AdminProtectedRoute>} />
        <Route path="/admin/orders" element={<AdminProtectedRoute><AdminOrders /></AdminProtectedRoute>} />

        {/* Gestion Communauté & Communication */}
        <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
        <Route path="/admin/events" element={<AdminProtectedRoute><AdminEvents /></AdminProtectedRoute>} />
        <Route path="/admin/notifications" element={<AdminProtectedRoute><AdminNotifications /></AdminProtectedRoute>} />
        <Route path="/admin/messages" element={<AdminProtectedRoute><AdminMessages /></AdminProtectedRoute>} />
        <Route path="/admin/home" element={<AdminProtectedRoute><AdminHome /></AdminProtectedRoute>} />


        {/* =======================================================
            ZONE PUBLIQUE (VISITEURS & MEMBRES)
            Utilise le PublicLayout (Navbar + Footer)
           ======================================================= */}
        
        {/* Accueil */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        
        {/* Boutique Client */}
        <Route path="/boutique" element={<PublicLayout><ShopHome /></PublicLayout>} />
        <Route path="/boutique/produit/:id" element={<PublicLayout><ProductDetails /></PublicLayout>} />
        <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />

        {/* Médiathèque */}
        <Route path="/livres" element={<PublicLayout><Books /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
        <Route path="/galerie" element={<PublicLayout><Gallery /></PublicLayout>} />
        <Route path="/podcast" element={<PublicLayout><Podcast /></PublicLayout>} />

        {/* Pages d'Information & Interaction */}
        <Route path="/evenements" element={<PublicLayout><Events /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/don" element={<PublicLayout><Donate /></PublicLayout>} />
        
        {/* Authentification Membre */}
        <Route path="/inscription" element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/login-public" element={<PublicLayout><LoginPublic /></PublicLayout>} />

        {/* Espace Membre (Protégé) */}
        <Route path="/profil" element={
          <PublicProtectedRoute>
             <PublicLayout>
                <Profile />
             </PublicLayout>
          </PublicProtectedRoute>
        } />
        
        {/* Redirection par défaut pour /login */}
        <Route path="/login" element={<Navigate to="/admin-login" replace />} />
        
        {/* Route 404 (Optionnelle, redirige vers l'accueil) */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </Router>
  );
}

export default App;