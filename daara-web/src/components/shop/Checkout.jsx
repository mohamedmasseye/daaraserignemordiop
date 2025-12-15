import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, MapPin, Phone, User, CreditCard, ArrowLeft, Loader, Truck, ShoppingBag, Smartphone } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // États
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(''); // Pour les messages d'étape
  const [step, setStep] = useState(1); // 1: Formulaire, 2: Succès
  
  const [cartItems, setCartItems] = useState(() => {
      const saved = localStorage.getItem('daara_cart');
      return saved ? JSON.parse(saved) : [];
  });

  const user = JSON.parse(localStorage.getItem('user_info'));

  const [formData, setFormData] = useState({
    fullName: user ? user.fullName : '',
    phone: user ? (user.phone || '') : '',
    city: 'Dakar',
    neighborhood: '',
    details: '',
    paymentMethod: 'Wave'
  });

  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // --- FONCTION DE PAUSE (Pour la simulation) ---
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Vérification Connexion
    if (!user) {
        if(window.confirm("Veuillez vous connecter pour commander.")) {
            navigate('/login-public', { state: { from: location.pathname } });
        }
        return;
    }

    setLoading(true);

    try {
      const userId = user.id || user._id;
      const token = localStorage.getItem('token');

      if (!token) throw new Error("Session expirée");

      // --- SIMULATION DU PAIEMENT MOBILE (EFFET WOW) ---
      setLoadingMessage("Connexion au service de paiement...");
      await sleep(1500); // 1.5s connexion

      setLoadingMessage(`Veuillez valider le paiement sur votre téléphone (${formData.paymentMethod})...`);
      await sleep(4000); // 4s pour "laisser le temps" au client de valider fictivement

      setLoadingMessage("Confirmation de la transaction...");
      await sleep(1000); // 1s vérification

      setLoadingMessage("Finalisation de la commande...");

      // --- ENVOI RÉEL AU BACKEND ---
      const orderData = {
        user: userId,
        items: cartItems.map(item => ({
            type: item.type || (item.name.toLowerCase().includes('ticket') ? 'ticket' : 'product'),
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            options: item.options || '',
            // Liaison sécurisée : Si l'item n'a pas d'ID valide (ex: ancien panier), on met null
            ticketEvent: (item.type === 'ticket' && item.id.length === 24) ? item.id : null,
            product: (item.type !== 'ticket' && item.id.length === 24) ? item.id : null
        })),
        totalAmount: total,
        paymentMethod: formData.paymentMethod,
        customerPhone: formData.phone,
        address: {
            city: formData.city,
            neighborhood: formData.neighborhood,
            details: formData.details
        }
      };

      await axios.post('https://daara-app.onrender.com/api/orders', orderData, {
          headers: { Authorization: `Bearer ${token}` }
      });

      // Succès
      localStorage.removeItem('daara_cart');
      setCartItems([]);
      setStep(2);

    } catch (error) {
      console.error("Erreur commande:", error);
      
      // Gestion erreur token
      if (error.response?.status === 401 || error.response?.status === 403) {
          alert("Session expirée. Reconnectez-vous.");
          localStorage.removeItem('token');
          navigate('/login-public', { state: { from: location.pathname } });
      } else {
          // Si erreur serveur, on affiche le message précis
          alert(`Échec : ${error.response?.data?.error || "Vérifiez votre panier (produits invalides ?)"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- ÉCRAN DE CHARGEMENT (OVERLAY) ---
  if (loading) {
      return (
          <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
              <div className="relative mb-8">
                  <div className="w-24 h-24 border-4 border-gray-100 rounded-full"></div>
                  <div className="w-24 h-24 border-4 border-gold-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                  <Smartphone className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-900" size={32}/>
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-2 text-center animate-pulse">
                  {loadingMessage}
              </h3>
              <p className="text-gray-500 text-sm">Ne fermez pas cette fenêtre.</p>
          </div>
      );
  }

  // --- ÉCRAN SUCCÈS ---
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-md w-full">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-12 h-12 text-green-600" /></div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Paiement Réussi !</h2>
          <p className="text-gray-500 mb-8">Votre commande a été validée. Vous pouvez suivre son statut dans votre profil.</p>
          <Link to="/profil" className="block w-full bg-primary-900 text-white py-4 rounded-xl font-bold hover:bg-primary-800 transition shadow-lg mb-4">Suivre ma commande</Link>
          <Link to="/boutique" className="text-gray-400 text-sm hover:text-gray-600">Retourner à la boutique</Link>
        </motion.div>
      </div>
    );
  }

  // --- PANIER VIDE ---
  if (cartItems.length === 0 && step === 1) {
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
              <div className="bg-white p-6 rounded-full shadow-sm mb-4"><ShoppingBag size={48} className="text-gray-300"/></div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Votre panier est vide</h2>
              <Link to="/boutique" className="bg-gold-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-gold-600 transition flex items-center gap-2"><ArrowLeft size={18}/> Retourner à la boutique</Link>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <Link to="/boutique" className="inline-flex items-center text-gray-500 hover:text-primary-900 mb-8 font-medium transition-colors"><ArrowLeft size={20} className="mr-2"/> Poursuivre mes achats</Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <h2 className="text-xl font-bold text-primary-900 mb-6 flex items-center gap-3 relative z-10"><div className="bg-primary-100 p-2 rounded-lg text-primary-700"><MapPin size={22}/></div>Adresse de Livraison</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                    <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Nom Complet</label><input type="text" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" value={formData.fullName} onChange={e=>setFormData({...formData, fullName:e.target.value})} placeholder="Votre nom"/></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Téléphone</label><input type="tel" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} placeholder="77 000 00 00"/></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Ville</label><select className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer" value={formData.city} onChange={e=>setFormData({...formData, city:e.target.value})}><option value="Dakar">Dakar</option><option value="Thies">Thiès</option><option value="Saint-Louis">Saint-Louis</option><option value="Touba">Touba</option><option value="Ziguinchor">Ziguinchor</option></select></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Quartier</label><input type="text" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" value={formData.neighborhood} onChange={e=>setFormData({...formData, neighborhood:e.target.value})} placeholder="Ex: Parcelles U26"/></div>
                    <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Instructions (Optionnel)</label><input type="text" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" value={formData.details} onChange={e=>setFormData({...formData, details:e.target.value})} placeholder="Ex: Maison verte à côté de la pharmacie..."/></div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <h2 className="text-xl font-bold text-primary-900 mb-6 flex items-center gap-3 relative z-10"><div className="bg-orange-100 p-2 rounded-lg text-orange-600"><CreditCard size={22}/></div>Paiement Sécurisé</h2>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    {['Wave', 'Orange Money'].map(m => (
                        <div key={m} onClick={()=>setFormData({...formData, paymentMethod: m})} className={`cursor-pointer p-4 rounded-2xl border-2 flex items-center gap-3 transition-all duration-300 ${formData.paymentMethod === m ? 'border-primary-600 bg-primary-50 shadow-md transform scale-105' : 'border-gray-100 hover:border-gray-300 bg-gray-50'}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${formData.paymentMethod === m ? 'border-primary-600' : 'border-gray-300'}`}>{formData.paymentMethod === m && <div className="w-2.5 h-2.5 rounded-full bg-primary-600"></div>}</div>
                            <span className="font-bold text-gray-700">{m}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-28">
               <h3 className="text-lg font-bold text-gray-900 mb-6 font-serif">Votre Commande</h3>
               <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map((item, i) => (
                      <div key={i} className="flex justify-between items-start text-sm py-2 border-b border-gray-50 last:border-0">
                          <div className="flex-1 pr-4">
                              <p className="font-bold text-gray-800 line-clamp-1">{item.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{item.options || 'Standard'} (x{item.quantity})</p>
                          </div>
                          <p className="font-bold text-primary-900 whitespace-nowrap">{(item.price * item.quantity).toLocaleString()} F</p>
                      </div>
                  ))}
               </div>
               <div className="bg-gray-50 p-4 rounded-xl space-y-2 mb-6 border border-gray-100">
                   <div className="flex justify-between text-gray-500 text-sm"><span>Sous-total</span><span>{total.toLocaleString()} F</span></div>
                   <div className="flex justify-between text-gray-500 text-sm"><span>Livraison</span><span className="text-green-600 font-bold">Gratuite</span></div>
                   <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-lg font-bold text-primary-900"><span>Total à payer</span><span>{total.toLocaleString()} FCFA</span></div>
               </div>
               <button onClick={handleSubmit} disabled={loading} className="w-full bg-gold-500 hover:bg-gold-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-gold-500/30 transition transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                   {loading ? "Traitement..." : (user ? 'Confirmer la commande' : 'Se connecter pour commander')}
               </button>
               <p className="text-center text-[10px] text-gray-400 mt-4 flex items-center justify-center gap-1"><Truck size={12}/> Livraison rapide partout au Sénégal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 