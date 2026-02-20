import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // ✅ Chemin corrigé
import { 
  LayoutDashboard, BookOpen, Calendar, MessageSquare, 
  Bell, LogOut, Users, ChevronRight, Mic, Image, 
  Newspaper, Menu, X, Package, ShoppingBag, Layout,Activity
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const { logout } = useAuth(); // ✅ Récupération de logout depuis le contexte
  const [isSidebarOpen, setSidebarOpen] = useState(false); 

  const handleLogout = () => {
    if(window.confirm("Voulez-vous vraiment vous déconnecter de l'administration ?")) {
      logout(true); // ✅ Utilise la redirection vers le portail secret
    }
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { path: '/admin/monitoring', icon: Activity, label: 'Monitoring Système' },
    { path: '/admin/home', icon: Layout, label: 'Gestion Accueil' },
    { path: '/admin/books', icon: BookOpen, label: 'Bibliothèque' },
    { path: '/admin/blog', icon: Newspaper, label: 'Journal / Blog' },
    { path: '/admin/galerie', icon: Image, label: 'Médiathèque' },
    { path: '/admin/podcast', icon: Mic, label: 'Podcasts' },
    { path: '/admin/products', icon: Package, label: 'Boutique (Produits)' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Commandes' },
    { path: '/admin/events', icon: Calendar, label: 'Agenda' },
    { path: '/admin/users', icon: Users, label: 'Utilisateurs' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
    { path: '/admin/messages', icon: MessageSquare, label: 'Messagerie' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans relative overflow-hidden">
      
      {/* OVERLAY MOBILE */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside 
        className={`
          bg-primary-900 text-white w-72 flex-col shadow-2xl z-30
          fixed inset-y-0 left-0 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static md:flex 
        `}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 bg-primary-950">
          <div className="flex items-center gap-3">
            <div className="bg-gold-500 p-2 rounded-lg shadow-lg">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg leading-tight tracking-wide">Daara Admin</h1>
              <p className="text-xs text-primary-300 font-medium">Panel de Gestion</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-primary-400 uppercase tracking-wider mb-2">Menu Principal</p>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' 
                    : 'text-primary-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={isActive ? 'text-white' : 'text-primary-300 group-hover:text-white'} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 bg-primary-950">
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-bold text-red-100 bg-red-500/20 rounded-xl hover:bg-red-600 hover:text-white transition-colors"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Menu size={24} />
            </button>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-gray-800 truncate">
              {menuItems.find(i => i.path === location.pathname)?.label || 'Espace Admin'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">Super Admin</p>
              <p className="text-xs text-green-600 font-medium">● En ligne</p>
            </div>
            <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold border-2 border-white shadow-sm">
              A
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto pb-20">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}