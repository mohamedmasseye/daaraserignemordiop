import React, { useState } from 'react';
import API from '../../services/api'; // ✅ UTILISE TON INSTANCE SÉCURISÉE
import { useAuth } from '../../context/AuthContext'; // ✅ UTILISE LE CONTEXTE
import { CheckCircle, MapPin, Phone, CreditCard, ArrowLeft, Smartphone, ShoppingBag, Truck } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // ✅ Récupère l'utilisateur du contexte

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState(() => JSON.parse(localStorage.getItem('daara_cart') || '[]'));

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    city: 'Dakar',
    neighborhood: '',
    details: '',
    paymentMethod: 'Wave'
  });

  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
        if(window.confirm("Connectez-vous pour commander.")) {
            navigate('/login-public', { state: { from: location.pathname } });
        }
        return;
    }

    setLoading(true);
    try {
      setLoadingMessage("Connexion au service de paiement...");
      await sleep(1500);
      setLoadingMessage(`Validez le paiement sur votre téléphone (${formData.paymentMethod})...`);
      await sleep(3000);
      setLoadingMessage("Finalisation de la commande...");

      // ✅ Utilise l'instance API (Token auto-injecté)
      await API.post('/api/orders', {
        user: user._id || user.id,
        items: cartItems.map(item => ({
            type: item.type,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            options: item.options || '',
            ticketEvent: item.ticketEvent || null,
            product: item.product || null
        })),
        totalAmount: total,
        paymentMethod: formData.paymentMethod,
        customerPhone: formData.phone,
        address: { city: formData.city, neighborhood: formData.neighborhood, details: formData.details }
      });

      localStorage.removeItem('daara_cart');
      setCartItems([]);
      setStep(2);
    } catch (error) {
      alert("Erreur transaction. Vérifiez votre connexion.");
    } finally { setLoading(false); }
  };

  // ... (Garder les rendus conditionnels loading, step 2, et cartItems.length === 0 identiques à votre version)
  
  if (loading) return (
    <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 border-4 border-gold-500 border-t-transparent animate-spin rounded-full mb-8"></div>
        <h3 className="text-xl font-bold text-primary-900 mb-2 text-center animate-pulse">{loadingMessage}</h3>
        <p className="text-gray-500 text-sm text-center italic">Sécurisation en cours...</p>
    </div>
  );

  if (step === 2) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Commande Confirmée !</h2>
            <p className="text-gray-500 mb-8">Merci pour votre confiance. Suivez votre colis sur votre profil.</p>
            <Link to="/profil" className="block w-full bg-primary-900 text-white py-4 rounded-xl font-bold shadow-lg">Voir mes commandes</Link>
        </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <Link to="/boutique" className="inline-flex items-center text-gray-500 mb-8 font-medium"><ArrowLeft size={20} className="mr-2"/> Continuer mes achats</Link>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-primary-900 mb-6 flex items-center gap-3"><MapPin className="text-gold-500"/> Adresse de Livraison</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input type="text" className="w-full p-4 bg-gray-50 border rounded-xl" value={formData.fullName} onChange={e=>setFormData({...formData, fullName:e.target.value})} placeholder="Nom Complet"/>
                    <input type="tel" className="w-full p-4 bg-gray-50 border rounded-xl" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} placeholder="77 000 00 00"/>
                    <input type="text" className="w-full p-4 bg-gray-50 border rounded-xl" value={formData.neighborhood} onChange={e=>setFormData({...formData, neighborhood:e.target.value})} placeholder="Quartier"/>
                    <input type="text" className="w-full p-4 bg-gray-50 border rounded-xl md:col-span-2" value={formData.details} onChange={e=>setFormData({...formData, details:e.target.value})} placeholder="Instructions livraison..."/>
                </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-primary-900 mb-6 flex items-center gap-3"><CreditCard className="text-gold-500"/> Paiement Mobile</h2>
                <div className="grid grid-cols-2 gap-4">
                    {['Wave', 'Orange Money'].map(m => (
                        <div key={m} onClick={()=>setFormData({...formData, paymentMethod: m})} className={`cursor-pointer p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${formData.paymentMethod === m ? 'border-primary-600 bg-primary-50' : 'border-gray-100 bg-gray-50'}`}>
                            <span className="font-bold text-gray-700">{m}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-28">
               <h3 className="text-lg font-bold text-gray-900 mb-6">Récapitulatif</h3>
               <div className="space-y-4 mb-6">{cartItems.map((item, i) => (<div key={i} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0"><p className="font-bold">{item.name} (x{item.quantity})</p><p className="font-black">{(item.price * item.quantity).toLocaleString()} F</p></div>))}</div>
               <div className="bg-gray-50 p-4 rounded-xl mb-6"><div className="flex justify-between text-lg font-bold text-primary-900"><span>Total</span><span>{total.toLocaleString()} F</span></div></div>
               <button onClick={handleSubmit} disabled={loading} className="w-full bg-gold-500 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-gold-600 transition">Commander maintenant</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}