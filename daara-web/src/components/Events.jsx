import React, { useState, useEffect } from 'react';
import API from '../services/api'; // ✅ UTILISE TON INSTANCE SÉCURISÉE
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Calendar as CalIcon, MapPin, Clock, ArrowRight, ChevronLeft, ChevronRight, 
  Moon, X, Ticket, Star, CheckCircle2, Minus, Plus, Loader2, FileText, Download, Eye, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { secureStorage } from '../utils/security'; // ✅ Pour vérifier la connexion

const waveLogoImg = "/wave.png"; 
const omLogoImg = "/om.png";

export default function Events() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('calendar');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextEvent, setNextEvent] = useState(null);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('details'); 

  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [purchaseStep, setPurchaseStep] = useState('selection');
  const [paymentMethod, setPaymentMethod] = useState('Wave'); 

  // --- CHARGEMENT ---
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await API.get('/api/events'); // ✅ Utilise API
        const loadedEvents = (response.data || []).sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(loadedEvents);
        
        const upcoming = loadedEvents.find(e => new Date(e.date) >= new Date());
        setNextEvent(upcoming || loadedEvents[loadedEvents.length - 1]);
      } catch (error) { 
        console.error("Erreur events:", error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchEvents();
  }, []);

  // --- AUTO-OUVERTURE ---
  useEffect(() => {
    const eventId = searchParams.get('id');
    if (!loading && events.length > 0 && eventId) {
      const eventFound = events.find(e => String(e._id) === String(eventId));
      if (eventFound) {
        setSelectedEvent(eventFound);
        setIsModalOpen(true);
        if (eventFound.hasTicket) setActiveTab('tickets');
      }
    }
  }, [events, loading, searchParams]);

  const isLoggedIn = () => !!secureStorage.getItem('_d_usr_vault'); // ✅ Utilise ton coffre-fort public
  
  const handleBookClick = (event) => {
    if (!isLoggedIn()) { 
      navigate('/login-public', { state: { from: '/evenements' } }); 
      return; 
    }
    setSelectedEvent(event);
    setModalType('booking');
    setTicketQuantity(1);
    setPurchaseStep('selection');
    setIsModalOpen(true);
  };

  const handleConfirmPurchase = async () => {
    setPurchaseStep('processing');
    try {
      // ✅ Plus besoin de headers manuels
      const userResponse = await API.get('/api/auth/me'); 
      const realUser = userResponse.data;
      const unitPrice = Number(selectedEvent.price || selectedEvent.ticketPrice || 0);
      const qty = Number(ticketQuantity);

      const orderData = {
          user: realUser._id,
          items: [{ type: 'ticket', name: `Ticket - ${selectedEvent.title}`, quantity: qty, price: unitPrice, ticketEvent: selectedEvent._id }],
          totalAmount: unitPrice * qty, 
          paymentMethod: paymentMethod, 
          customerPhone: realUser.phone || 'Non renseigné'
      };

      await API.post('/api/orders', orderData); // ✅ Token auto
      setPurchaseStep('success');
    } catch (error) {
      setPurchaseStep('selection');
      alert("Erreur lors de la validation.");
    }
  };

  // ... (Garder les fonctions calendrier getHijriDate, getDaysInMonth, changeMonth, etc. identiques)
  const getHijriDate = (date) => new Intl.DateTimeFormat('fr-FR-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = [];
    const startingDay = new Date(year, month, 1).getDay() === 0 ? 6 : new Date(year, month, 1).getDay() - 1; 
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= new Date(year, month + 1, 0).getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };
  const changeMonth = (offset) => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + offset)));
  const days = getDaysInMonth();

  const closeModal = () => { setIsModalOpen(false); setSelectedEvent(null); navigate('/evenements', { replace: true }); };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
      <p className="text-primary-900 font-serif italic">Chargement de l'Agenda...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-20 font-sans">
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-[80vh] min-h-[650px] bg-primary-900 overflow-hidden flex items-center">
        <div className="absolute inset-0">
           {nextEvent?.image && (
             <motion.img 
              initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
              src={nextEvent.image} className="w-full h-full object-cover opacity-50" alt="Hero" 
             />
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-primary-900/40 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 px-5 py-2 rounded-full text-gold-400 text-xs font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md">
              <Sparkles size={14} className="animate-pulse" /> Événement Majeur
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-tight mb-8 drop-shadow-2xl">
              {nextEvent ? nextEvent.title : "L'Agenda Spirituel"}
            </h1>
            <div className="flex flex-wrap gap-5">
              {nextEvent?.hasTicket && (
                <button onClick={() => handleBookClick(nextEvent)} className="px-10 py-5 bg-gold-500 text-primary-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white transition-all shadow-2xl flex items-center gap-3 active:scale-95">
                  <Ticket size={20} /> Réserver ma place
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- NAVIGATION ET LISTE --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <div className="flex justify-center mb-16">
          <div className="bg-white/80 backdrop-blur-2xl p-2 rounded-[2.5rem] shadow-2xl border border-gray-100 flex gap-2">
             {['calendar', 'tickets'].map((tab) => (
               <button key={tab} onClick={() => setActiveTab(tab)} className={`px-10 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${activeTab === tab ? 'bg-primary-900 text-white shadow-xl scale-105' : 'text-gray-400 hover:bg-gray-50'}`}>
                 {tab === 'calendar' ? <CalIcon size={18}/> : <Ticket size={18}/>}
                 {tab === 'calendar' ? 'Calendrier' : 'Billetterie'}
               </button>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* CALENDRIER */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 sticky top-24">
              <div className="bg-primary-900 p-8 text-white relative text-center">
                <div className="flex justify-between items-center relative z-10">
                  <button onClick={() => changeMonth(-1)}><ChevronLeft/></button>
                  <h3 className="text-2xl font-serif font-bold capitalize">{currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h3>
                  <button onClick={() => changeMonth(1)}><ChevronRight/></button>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-7 gap-3">
                  {days.map((day, idx) => {
                    if (!day) return <div key={idx}></div>;
                    const hasEvent = events.some(e => new Date(e.date).toDateString() === day.toDateString());
                    return (
                      <div key={idx} className={`aspect-square rounded-2xl flex items-center justify-center relative cursor-pointer hover:bg-gold-50 ${hasEvent ? 'ring-2 ring-gold-400 ring-offset-2' : 'bg-gray-50'}`}>
                        <span className="text-sm font-bold">{day.getDate()}</span>
                        {hasEvent && <div className="absolute bottom-1 w-1 h-1 bg-gold-500 rounded-full animate-pulse"></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* LISTE */}
          <div className="lg:col-span-8 space-y-8">
             {(activeTab === 'tickets' ? events.filter(e => e.hasTicket || e.price > 0) : events).map((event, index) => {
               const eventDate = new Date(event.date);
               return (
                 <motion.div 
                    key={event._id || index} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                    className="group bg-white rounded-[2rem] p-4 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row gap-8"
                 >
                    <div className="md:w-52 h-52 rounded-[1.5rem] overflow-hidden relative shrink-0">
                       {event.image ? <img src={event.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt=""/> : <div className="w-full h-full bg-gray-100 flex items-center justify-center"><Moon size={40}/></div>}
                    </div>
                    <div className="flex-1 py-4 pr-4">
                       <h3 className="text-2xl font-serif font-bold text-primary-900 mb-2">{event.title}</h3>
                       <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400 uppercase mb-8">
                          <div className="flex items-center gap-1.5"><Clock size={14}/> {eventDate.toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})}</div>
                          <div className="flex items-center gap-1.5"><MapPin size={14}/> {event.location}</div>
                       </div>
                       <div className="flex items-center justify-between border-t border-gray-50 pt-6">
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{getHijriDate(eventDate)}</span>
                          <div className="flex gap-3">
                            <button onClick={() => { setSelectedEvent(event); setModalType('details'); setIsModalOpen(true); }} className="p-3 bg-gray-50 text-primary-900 rounded-xl"><Eye size={18}/></button>
                            <button onClick={() => handleBookClick(event)} className="px-6 py-3 bg-primary-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-gold-500 transition-all shadow-lg">Réserver</button>
                          </div>
                       </div>
                    </div>
                 </motion.div>
               );
             })}
          </div>
        </div>
      </div>

      {/* --- MODAL --- */}
      <AnimatePresence>
        {isModalOpen && selectedEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-primary-950/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="relative h-64 shrink-0">
                {selectedEvent.image ? <img src={selectedEvent.image} className="w-full h-full object-cover" alt=""/> : <div className="w-full h-full bg-primary-800"></div>}
                <button onClick={closeModal} className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white text-primary-900 rounded-full transition-all shadow-xl"><X size={20}/></button>
              </div>

              <div className="p-10 -mt-20 relative bg-white rounded-t-[3rem] overflow-y-auto flex-1">
                <h3 className="text-3xl font-serif font-bold text-primary-900 mb-6">{selectedEvent.title}</h3>
                
                {modalType === 'details' && (
                  <div className="space-y-10">
                    <p className="text-gray-500 text-sm italic">"{selectedEvent.description}"</p>
                    {selectedEvent.hasTicket && <button onClick={() => setModalType('booking')} className="w-full py-5 bg-gold-500 text-primary-950 rounded-[1.5rem] font-black uppercase text-xs hover:bg-primary-900 hover:text-white transition-all shadow-xl shadow-gold-500/20 active:scale-95">Réserver mon billet</button>}
                  </div>
                )}

                {modalType === 'booking' && purchaseStep === 'selection' && (
                  <div className="space-y-8 animate-fadeIn">
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                      <span className="font-black uppercase text-[10px] text-gray-400">Quantité</span>
                      <div className="flex items-center gap-6">
                        <button onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))} className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center font-bold">-</button>
                        <span className="font-serif font-bold text-2xl text-primary-900">{ticketQuantity}</span>
                        <button onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))} className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center font-bold">+</button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setPaymentMethod('Wave')} className={`py-6 rounded-[2rem] border-2 transition-all ${paymentMethod === 'Wave' ? 'border-primary-900 bg-primary-900 text-white' : 'border-gray-100 bg-white text-gray-400'}`}>Wave</button>
                      <button onClick={() => setPaymentMethod('Orange Money')} className={`py-6 rounded-[2rem] border-2 transition-all ${paymentMethod === 'Orange Money' ? 'border-primary-900 bg-primary-900 text-white' : 'border-gray-100 bg-white text-gray-400'}`}>OM</button>
                    </div>

                    <div className="flex justify-between items-center px-4">
                      <span className="text-gray-400 font-bold uppercase text-[10px]">Total</span>
                      <span className="text-3xl font-serif font-bold text-primary-900 underline decoration-gold-500">{(Number(selectedEvent.price || selectedEvent.ticketPrice || 0) * ticketQuantity).toLocaleString()} F</span>
                    </div>

                    <button onClick={handleConfirmPurchase} className="w-full py-5 bg-gold-500 text-primary-950 rounded-[1.5rem] font-black uppercase text-xs shadow-2xl active:scale-95 transition-all">Valider la commande</button>
                  </div>
                )}

                {purchaseStep === 'processing' && (
                  <div className="py-20 text-center space-y-6">
                    <Loader2 className="w-16 h-16 text-gold-500 animate-spin mx-auto opacity-50" />
                    <p className="font-serif font-bold text-primary-900 text-xl italic">Sécurisation de votre place...</p>
                  </div>
                )}

                {purchaseStep === 'success' && (
                  <div className="py-20 text-center animate-fadeIn">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><CheckCircle2 size={60} className="text-green-500" /></div>
                    <h3 className="text-3xl font-serif font-bold text-primary-900 mb-4">Succès !</h3>
                    <p className="text-gray-500 mb-10 font-medium">Vos billets sont disponibles sur votre profil.</p>
                    <button onClick={() => { closeModal(); navigate('/profil'); }} className="w-full py-5 bg-primary-900 text-white rounded-[1.5rem] font-black uppercase text-xs shadow-2xl hover:bg-gold-500 transition-all">Consulter mes billets</button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}