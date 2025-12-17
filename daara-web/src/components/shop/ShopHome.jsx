import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Calendar, MapPin, ArrowRight, Search, X, Ticket, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import CartDrawer from './CartDrawer';

export default function ShopHome() {
  const [products, setProducts] = useState([]);
  const [featuredEvent, setFeaturedEvent] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [hoveredProduct, setHoveredProduct] = useState(null);
  
  // État pour la Popup
  const [showPromoPopup, setShowPromoPopup] = useState(false);

  // Panier
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('daara_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) { return []; }
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => { localStorage.setItem('daara_cart', JSON.stringify(cart)); }, [cart]);

  // --- CHARGEMENT DONNÉES ET LOGIQUE POPUP "1 FOIS PAR JOUR" ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await axios.get('/api/products');
        setProducts(productsRes.data);

        const eventsRes = await axios.get('/api/events');
        
        // On cherche le prochain événement futur
        const upcomingEvents = eventsRes.data
            .filter(e => new Date(e.date) > new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const nextEvent = upcomingEvents[0];

        if (nextEvent) {
            setFeaturedEvent(nextEvent);

            // --- NOUVELLE LOGIQUE : 1 FOIS PAR JOUR ---
            const todayStr = new Date().toDateString(); // Ex: "Sun Dec 14 2025"
            
            // On récupère l'objet stocké (ID + Date)
            const storedData = JSON.parse(localStorage.getItem('promo_popup_log') || '{}');
            
            // On affiche SI :
            // 1. C'est un événement différent de celui stocké
            // 2. OU C'est le même événement, mais la date stockée n'est pas aujourd'hui
            if (storedData.eventId !== nextEvent._id || storedData.lastSeenDate !== todayStr) {
                setTimeout(() => setShowPromoPopup(true), 1500); // Petit délai 1.5s
            }
        }

      } catch (err) { console.error("Erreur chargement", err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // --- FERMETURE POPUP (Sauvegarde ID + Date du jour) ---
  const handleClosePopup = () => {
      setShowPromoPopup(false);
      if (featuredEvent) {
          const todayStr = new Date().toDateString();
          // On sauvegarde l'événement ET la date d'aujourd'hui
          localStorage.setItem('promo_popup_log', JSON.stringify({
              eventId: featuredEvent._id,
              lastSeenDate: todayStr
          }));
      }
  };

  // --- AJOUT PANIER ---
  const addToCart = (item, isTicket = false) => {
    setCart(prevCart => {
      const itemId = item._id || item.id;
      const existingItem = prevCart.find(i => i.id === itemId);
      
      if (existingItem) {
        return prevCart.map(i => (i.id === itemId) ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        const newItem = {
          id: itemId,
          name: isTicket ? `Ticket : ${item.title}` : item.name,
          price: isTicket ? (item.price || item.ticketPrice) : item.price,
          image: isTicket ? (item.image || '/logo.png') : (item.images && item.images[0] ? item.images[0] : '/logo.png'),
          type: isTicket ? 'ticket' : 'product',
          eventDate: isTicket ? new Date(item.date).toLocaleDateString() : null,
          quantity: 1,
          product: itemId, 
          ticketEvent: isTicket ? itemId : null 
        };
        return [...prevCart, newItem];
      }
    });
    setIsCartOpen(true);
    if(isTicket) handleClosePopup(); // Fermer la popup si achat
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const updateQuantity = (id, q) => {
      if (q < 1) return;
      setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: q } : item));
  };

  const getCategoryName = (p) => p.category?.name || p.category || "Autre";
  const categories = ['Tous', ...new Set(products.map(p => getCategoryName(p)))];
  
  const filteredProducts = activeCategory === 'Tous' 
    ? products 
    : products.filter(p => getCategoryName(p) === activeCategory);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-gold-500"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative font-sans">
      
      {/* POPUP PROMO (1 FOIS PAR JOUR) */}
      <AnimatePresence>
        {showPromoPopup && featuredEvent && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 50 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.8, y: 50 }}
                    className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative"
                >
                    <button onClick={handleClosePopup} className="absolute top-3 right-3 p-2 bg-black/10 hover:bg-black/20 rounded-full z-10 transition">
                        <X size={20} className="text-white"/>
                    </button>

                    <div className="h-48 bg-primary-900 relative">
                        {featuredEvent.image ? (
                            <img src={featuredEvent.image} className="w-full h-full object-cover" alt="Event" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20"><Calendar size={64}/></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                            <span className="bg-gold-500 text-primary-900 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">Ne manquez pas</span>
                            <h3 className="text-xl font-serif font-bold leading-tight">{featuredEvent.title}</h3>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-gray-600 text-sm">
                                <Calendar size={16} className="text-gold-500"/>
                                <span>{new Date(featuredEvent.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 text-sm">
                                <MapPin size={16} className="text-gold-500"/>
                                <span>{featuredEvent.location}</span>
                            </div>
                        </div>

                        {(featuredEvent.hasTicket || featuredEvent.price > 0) ? (
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={() => addToCart(featuredEvent, true)} 
                                    className="w-full py-3 bg-primary-900 text-white rounded-xl font-bold hover:bg-gold-500 transition-colors shadow-lg flex items-center justify-center gap-2"
                                >
                                    <Ticket size={18}/> Réserver ({ (featuredEvent.price || featuredEvent.ticketPrice).toLocaleString() } F)
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleClosePopup} className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                                Voir les détails
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cart} onRemoveItem={removeFromCart} onUpdateQuantity={updateQuantity} />

      <button onClick={() => setIsCartOpen(true)} className="fixed bottom-8 right-6 z-40 bg-primary-900 text-white p-4 rounded-full shadow-2xl border-2 border-gold-500 group hover:scale-110 transition">
        <ShoppingBag size={24} />
        {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">{cart.reduce((acc, i) => acc + i.quantity, 0)}</span>}
      </button>

      {/* --- HERO EVENT DYNAMIQUE (Section Page) --- */}
      {featuredEvent ? (
        <div className="relative h-[85vh] bg-primary-900 overflow-hidden flex items-center">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=1600&q=80')] bg-cover bg-center opacity-40"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-900/80 to-transparent"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
                <span className="inline-block py-1 px-3 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30 text-xs font-bold uppercase tracking-widest mb-6">Billetterie Ouverte</span>
                <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">{featuredEvent.title}</h1>
                <div className="flex flex-col gap-4 text-primary-100 text-lg mb-8">
                <div className="flex items-center gap-3"><Calendar className="text-gold-500" /> {new Date(featuredEvent.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                <div className="flex items-center gap-3"><MapPin className="text-gold-500" /> {featuredEvent.location}</div>
                <div className="text-2xl font-bold text-gold-400 mt-2">{(featuredEvent.price || featuredEvent.ticketPrice || 0).toLocaleString()} FCFA</div>
                </div>
                <button 
                onClick={() => addToCart(featuredEvent, true)} 
                className="bg-gold-500 hover:bg-gold-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-gold-500/30 transition transform hover:-translate-y-1 flex items-center gap-2"
                >
                    Réserver mon Billet <ArrowRight size={20} />
                </button>
            </motion.div>
            </div>
        </div>
      ) : (
        <div className="relative h-[60vh] bg-primary-900 flex items-center justify-center text-center px-4">
             <div className="z-10">
                 <h1 className="text-5xl font-serif font-bold text-white mb-4">La Boutique du Daara</h1>
                 <p className="text-primary-200 text-xl">Découvrez nos produits et soutenez nos actions.</p>
             </div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
      )}

      {/* --- GRILLE PRODUITS --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-100">
           <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-primary-900 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
             <input type="text" placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? <div className="col-span-full text-center py-20">Chargement...</div> : filteredProducts.map((product, idx) => (
            <div key={product._id} className="h-full"> 
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                onMouseEnter={() => setHoveredProduct(product._id)} onMouseLeave={() => setHoveredProduct(null)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-gray-100 h-full flex flex-col relative"
              >
                <Link to={`/boutique/produit/${product._id}`} className="absolute inset-0 z-0" />
                <div className="relative h-72 overflow-hidden bg-gray-100 z-10 pointer-events-none">
                  <img 
                    src={product.images && product.images[0] ? product.images[0] : "/logo.png"} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className={`absolute bottom-4 left-4 right-4 transition-all duration-300 transform ${hoveredProduct === product._id ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} pointer-events-auto`}>
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                        }}
                        className="w-full bg-white text-primary-900 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-900 hover:text-white transition flex items-center justify-center gap-2"
                    >
                        <ShoppingBag size={18} /> Ajouter au panier
                    </button>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col z-10 pointer-events-none">
                  <p className="text-xs text-gray-500 mb-1">{getCategoryName(product)}</p>
                  <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">{product.name}</h3>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-bold text-primary-900">{product.price.toLocaleString()} F</span>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
        {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-20">
                <p className="text-gray-500 text-lg">Aucun produit trouvé dans cette catégorie.</p>
            </div>
        )}
      </div>
    </div>
  );
}