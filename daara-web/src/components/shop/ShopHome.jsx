import React, { useState, useEffect } from 'react';
import API from '../../services/api'; // ✅ UTILISE TON INSTANCE SÉCURISÉE
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
  const [showPromoPopup, setShowPromoPopup] = useState(false);

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('daara_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) { return []; }
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => { localStorage.setItem('daara_cart', JSON.stringify(cart)); }, [cart]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Chargement via API centralisée
        const [productsRes, eventsRes] = await Promise.all([
            API.get('/api/products'),
            API.get('/api/events')
        ]);

        setProducts(productsRes.data || []);

        const upcomingEvents = (eventsRes.data || [])
            .filter(e => new Date(e.date) > new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const nextEvent = upcomingEvents[0];
        if (nextEvent) {
            setFeaturedEvent(nextEvent);
            const todayStr = new Date().toDateString();
            const storedData = JSON.parse(localStorage.getItem('promo_popup_log') || '{}');
            if (storedData.eventId !== nextEvent._id || storedData.lastSeenDate !== todayStr) {
                setTimeout(() => setShowPromoPopup(true), 1500);
            }
        }
      } catch (err) { console.error("Erreur boutique:", err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleClosePopup = () => {
      setShowPromoPopup(false);
      if (featuredEvent) {
          const todayStr = new Date().toDateString();
          localStorage.setItem('promo_popup_log', JSON.stringify({ eventId: featuredEvent._id, lastSeenDate: todayStr }));
      }
  };

  const addToCart = (item, isTicket = false) => {
    setCart(prevCart => {
      const itemId = item._id || item.id;
      const existingItem = prevCart.find(i => i.id === itemId);
      if (existingItem) {
        return prevCart.map(i => (i.id === itemId) ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        return [...prevCart, {
          id: itemId,
          name: isTicket ? `Ticket : ${item.title}` : item.name,
          price: isTicket ? (item.price || item.ticketPrice) : item.price,
          image: isTicket ? (item.image || '/logo.png') : (item.images?.[0] || '/logo.png'),
          type: isTicket ? 'ticket' : 'product',
          eventDate: isTicket ? new Date(item.date).toLocaleDateString() : null,
          quantity: 1,
          product: isTicket ? null : itemId, 
          ticketEvent: isTicket ? itemId : null 
        }];
      }
    });
    setIsCartOpen(true);
    if(isTicket) handleClosePopup();
  };

  const getCategoryName = (p) => p.category?.name || p.category || "Autre";
  const categories = ['Tous', ...new Set(products.map(p => getCategoryName(p)))];
  const filteredProducts = activeCategory === 'Tous' ? products : products.filter(p => getCategoryName(p) === activeCategory);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gold-500"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      <AnimatePresence>
        {showPromoPopup && featuredEvent && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">
                    <button onClick={handleClosePopup} className="absolute top-3 right-3 p-2 bg-black/10 text-white rounded-full"><X size={20}/></button>
                    <div className="h-48 bg-primary-900 relative">
                        {featuredEvent.image && <img src={featuredEvent.image} className="w-full h-full object-cover" alt="" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                            <h3 className="text-xl font-serif font-bold leading-tight">{featuredEvent.title}</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <button onClick={() => addToCart(featuredEvent, true)} className="w-full py-3 bg-primary-900 text-white rounded-xl font-bold hover:bg-gold-500 transition-colors shadow-lg flex items-center justify-center gap-2">
                            <Ticket size={18}/> Réserver ({ (featuredEvent.price || featuredEvent.ticketPrice).toLocaleString() } F)
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cart} onRemoveItem={(id) => setCart(cart.filter(i => i.id !== id))} onUpdateQuantity={(id, q) => setCart(cart.map(i => i.id === id ? {...i, quantity: Math.max(1, q)} : i))} />

      <button onClick={() => setIsCartOpen(true)} className="fixed bottom-8 right-6 z-40 bg-primary-900 text-white p-4 rounded-full shadow-2xl border-2 border-gold-500 hover:scale-110 transition">
        <ShoppingBag size={24} />
        {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">{cart.reduce((acc, i) => acc + i.quantity, 0)}</span>}
      </button>

      {/* --- HERO --- */}
      <div className="relative h-[60vh] bg-primary-900 flex items-center justify-center text-center px-4 overflow-hidden">
           <div className="z-10">
               <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4">La Boutique</h1>
               <p className="text-primary-200 text-xl">Soutenez le Daara par vos achats.</p>
           </div>
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
      </div>

      {/* --- FILTRES & GRILLE --- */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-12 flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-100">
           <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-primary-900 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <motion.div key={product._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col relative group" onMouseEnter={() => setHoveredProduct(product._id)} onMouseLeave={() => setHoveredProduct(null)}>
                <Link to={`/boutique/produit/${product._id}`} className="absolute inset-0 z-0" />
                <div className="relative h-72 overflow-hidden bg-gray-100">
                  <img src={product.images?.[0] || "/logo.png"} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className={`absolute bottom-4 left-4 right-4 transition-all duration-300 transform ${hoveredProduct === product._id ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} z-10`}>
                    <button onClick={(e) => { e.preventDefault(); addToCart(product); }} className="w-full bg-white text-primary-900 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-900 hover:text-white transition flex items-center justify-center gap-2">
                        <ShoppingBag size={18} /> Ajouter
                    </button>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs text-gray-400 mb-1">{getCategoryName(product)}</p>
                  <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{product.name}</h3>
                  <div className="mt-auto"><span className="text-xl font-black text-primary-900">{product.price.toLocaleString()} F</span></div>
                </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}