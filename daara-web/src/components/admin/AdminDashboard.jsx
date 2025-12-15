import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Users, BookOpen, Bell, ShoppingBag, 
  TrendingUp, Calendar, ArrowRight, Activity, 
  DollarSign, Package, CheckCircle, Clock 
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminLayout from './AdminLayout';

export default function AdminDashboard() {
  const [data, setData] = useState({
    counts: { books: 0, users: 0, notifications: 0, orders: 0, revenue: 0 },
    recentUsers: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Appels API simultanés
        const [usersRes, booksRes, ordersRes] = await Promise.all([
            axios.get('https://daara-app.onrender.com/api/users', config),
            axios.get('https://daara-app.onrender.com/api/books'),
            axios.get('https://daara-app.onrender.com/api/orders', config)
        ]);

        // --- FILTRAGE CORRECT ---
        
        // 1. Commandes "Boutique" (Produits physiques uniquement)
        const shopOrders = ordersRes.data.filter(order => 
            order.items.some(item => item.type !== 'ticket')
        );

        // 2. Revenu Total (Inclut TOUT : Boutique + Billetterie, car c'est de l'argent réel)
        const totalRevenue = ordersRes.data
            .filter(o => o.status !== 'Cancelled')
            .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

        setData({
            counts: {
                users: usersRes.data.length,
                books: booksRes.data.length,
                orders: shopOrders.length, // Affiche seulement le nombre de commandes boutique
                revenue: totalRevenue
            },
            recentUsers: usersRes.data.slice(0, 5),
            recentOrders: shopOrders.slice(0, 5) // Affiche seulement les dernières commandes boutique
        });
      } catch (error) {
        console.error("Erreur chargement dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- STATS CARDS CONFIG ---
  const stats = [
    { 
      label: "Chiffre d'Affaires Global", 
      value: `${data.counts.revenue.toLocaleString()} F`, 
      icon: DollarSign, 
      color: "text-green-600", bg: "bg-green-100", 
      trend: "Total (Boutique + Tickets)" 
    },
    { 
      label: "Commandes Boutique", 
      value: data.counts.orders, 
      icon: ShoppingBag, 
      color: "text-blue-600", bg: "bg-blue-100", 
      trend: "Produits physiques" 
    },
    { 
      label: "Membres Inscrits", 
      value: data.counts.users, 
      icon: Users, 
      color: "text-purple-600", bg: "bg-purple-100", 
      trend: "Actifs" 
    },
    { 
      label: "Bibliothèque", 
      value: data.counts.books, 
      icon: BookOpen, 
      color: "text-orange-600", bg: "bg-orange-100", 
      trend: "Ouvrages en ligne" 
    },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Activity className="animate-spin text-primary-900 mr-2"/> Chargement du Dashboard...</div>;

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* EN-TÊTE */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900">Tableau de Bord</h1>
                <p className="text-gray-500 mt-1">Bienvenue dans l'espace d'administration du Daara.</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-600">
                <Calendar size={16} className="text-gold-500"/>
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
        </div>

        {/* 1. CARTES STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
                <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                            <stat.icon size={24}/>
                        </div>
                        <span className="text-xs font-bold bg-gray-50 text-gray-500 px-2 py-1 rounded-full">{stat.trend}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                </motion.div>
            ))}
        </div>

        {/* 2. SECTION CENTRALE (Commandes & Inscriptions) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* DERNIÈRES COMMANDES (BOUTIQUE SEULEMENT) */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <ShoppingBag size={20} className="text-gold-500"/> Dernières Commandes (Boutique)
                    </h3>
                    <Link to="/admin/orders" className="text-sm font-bold text-primary-900 hover:text-gold-600 flex items-center gap-1 transition">
                        Voir tout <ArrowRight size={14}/>
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Montant</th>
                                <th className="px-6 py-4">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.recentOrders.map(order => (
                                <tr key={order._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-mono font-bold text-gray-400">#{order._id.slice(-6).toUpperCase()}</td>
                                    <td className="px-6 py-4 font-bold text-gray-800">{order.user?.fullName || 'Client Inconnu'}</td>
                                    <td className="px-6 py-4 font-bold text-primary-900">{order.totalAmount.toLocaleString()} F</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {order.status === 'Pending' ? 'En attente' : order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {data.recentOrders.length === 0 && <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400 italic">Aucune commande boutique récente.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DERNIERS MEMBRES */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <Users size={20} className="text-primary-900"/> Nouveaux Membres
                    </h3>
                </div>
                <div className="p-4 space-y-4">
                    {data.recentUsers.map(user => (
                        <div key={user._id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition">
                            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-900 font-bold flex items-center justify-center text-sm">
                                {user.fullName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 truncate">{user.fullName}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    ))}
                    {data.recentUsers.length === 0 && <p className="text-center text-gray-400 py-8 italic">Aucun membre inscrit.</p>}
                </div>
                <div className="p-4 border-t border-gray-50 bg-gray-50/50 text-center">
                    <Link to="/admin/users" className="text-sm font-bold text-primary-900 hover:text-gold-600 transition">Gérer les utilisateurs</Link>
                </div>
            </div>

        </div>

        {/* 3. RACCOURCIS RAPIDES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: "Ajouter Produit", icon: Package, link: "/admin/products", color: "bg-blue-600" },
                { label: "Nouvel Événement", icon: Calendar, link: "/admin/events", color: "bg-gold-500" },
                { label: "Publier Livre", icon: BookOpen, link: "/admin/books", color: "bg-purple-600" },
                { label: "Envoyer Notif", icon: Bell, link: "/admin/notifications", color: "bg-red-500" },
            ].map((action, i) => (
                <Link to={action.link} key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group">
                    <div className={`p-3 rounded-lg ${action.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                        <action.icon size={20}/>
                    </div>
                    <span className="font-bold text-gray-700 text-sm">{action.label}</span>
                </Link>
            ))}
        </div>

      </div>
    </AdminLayout>
  );
}