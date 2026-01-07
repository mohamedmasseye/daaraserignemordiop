import React, { useState, useEffect } from 'react';
import API from '../services/api'; // ✅ UTILISE TON INSTANCE SÉCURISÉE
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Calendar as CalIcon, MapPin, Clock, ArrowRight, ChevronLeft, ChevronRight, 
  Moon, ChevronDown, X, Ticket, Star, CheckCircle, Minus, Plus, Loader, FileText, Download, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isPickerOpen, setIsPickerOpen] = useState(false); 

  // Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('details'); 

  // Booking State
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [purchaseStep, setPurchaseStep] = useState('selection');
  const [paymentMethod, setPaymentMethod] = useState('Wave'); 

  // 1. CHARGEMENT SÉCURISÉ
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await API.get('/api/events'); // ✅ Token géré par API.js
        const loadedEvents = (response.data || []).sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(loadedEvents);
        
        const upcoming = loadedEvents.find(e => new Date(e.date) >= new Date());
        setNextEvent(upcoming || loadedEvents[loadedEvents.length - 1]);
      } catch (error) { 
          console.error("Erreur chargement events:", error); 
          setEvents([]);
      } finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  // 2. AUTO-OUVERTURE (Si ID dans l'URL via notification)
  useEffect(() => {
    const eventId = searchParams.get('id');
    if (!loading && events.length > 0 && eventId) {
      const eventFound = events.find(e => String(e._id) === String(eventId));
      if (eventFound) {
        setSelectedEvent(eventFound);
        setIsModalOpen(true);
        setModalType('details');
      }
    }
  }, [events, loading, searchParams]);

  // --- LOGIQUE CALENDRIER (Restaurée) ---
  const getHijriDate = (date) => new Intl.DateTimeFormat('fr-FR-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; 
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const changeMonth = (offset) => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + offset)));
  
  const selectDate = (newMonth, newYear) => {
    const newDate = new Date(currentDate);
    if (newYear !== null) newDate.setFullYear(newYear);
    if (newMonth !== null) newDate.setMonth(newMonth);
    setCurrentDate(newDate);
    if (newMonth !== null) setIsPickerOpen(false); 
  };

  const days = getDaysInMonth();
  const today = new Date();
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const currentMonthIndex = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const hijriMonthName = new Intl.DateTimeFormat('fr-FR-u-ca-islamic', { month: 'long', year: 'numeric' }).format(currentDate);

  // --- ACTIONS ---
  const isLoggedIn = () => !!localStorage.getItem('_d_usr_vault'); // ✅ Utilise ton coffre chiffré
  
  const handleBookClick = (event) => {
    if (!isLoggedIn()) { navigate('/login-public', { state: { from: '/evenements' } }); return; }
    setSelectedEvent(event);
    setModalType('booking');
    setTicketQuantity(1);
    setPurchaseStep('selection');
    setPaymentMethod('Wave'); 
    setIsModalOpen(true);
  };

  const handleDetailsClick = (event) => {
    setSelectedEvent(event);
    setModalType('details');
    setIsModalOpen(true);
  };

  const handleConfirmPurchase = async () => {
    setPurchaseStep('processing');
    try {
      // ✅ L'API gère le header Authorization toute seule
      const userResponse = await API.get('/api/auth/me');
      const realUser = userResponse.data;

      const unitPrice = Number(selectedEvent.price || selectedEvent.ticketPrice || 0);
      const qty = Number(ticketQuantity);
      const total = unitPrice * qty;

      const orderData = {
          user: realUser._id,
          items: [{
              type: 'ticket',
              name: `Ticket - ${selectedEvent.title}`,
              quantity: qty,
              price: unitPrice, 
              ticketEvent: selectedEvent._id 
          }],
          totalAmount: total, 
          paymentMethod: paymentMethod, 
          customerPhone: realUser.phone || 'Non renseigné'
      };

      await API.post('/api/orders', orderData);
      setPurchaseStep('success');

    } catch (error) {
      console.error(error);
      alert("Erreur lors de la réservation.");
      setPurchaseStep('selection');
    }
  };

  const closeModal = () => { setIsModalOpen(false); setSelectedEvent(null); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-gold-500"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* 1. HERO SECTION (Design Original) */}
      <div className="relative h-[85vh] min-h-[600px] bg-primary-900 text-white overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
           {nextEvent?.image ? <img src={nextEvent.image} className="w-full h-full object-cover opacity-40 scale-105 animate-kenburns" alt="Hero" /> : <div className="w-full h-full bg-primary-800 opacity-30"></div>}
           <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-primary-900/60 to-transparent"></div>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-500/30 px-4 py-1.5 rounded-full text-gold-400 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm"><Star size={14} className="fill-gold-400" /> Événement à la une</div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-6">{nextEvent ? nextEvent.title : "Bienvenue au Daara"}</h1>
              <p className="text-lg md:text-xl text-primary-100 mb-8 leading-relaxed max-w-xl">{nextEvent ? (nextEvent.description || "").substring(0, 150) + "..." : "Découvrez nos prochains événements."}</p>
              {nextEvent && (
                <div className="flex flex-wrap gap-4">
                  {(nextEvent.hasTicket || nextEvent.price > 0) && (
                      <button onClick={() => handleBookClick(nextEvent)} className="px-8 py-4 bg-gold-500 text-primary-900 rounded-full font-bold text-lg hover:bg-white transition-all shadow-lg flex items-center gap-2 transform hover:-translate-y-1"><Ticket size={20} /> Réserver ma place</button>
                  )}
                  <button onClick={() => handleDetailsClick(nextEvent)} className="px-8 py-4 border border-white/30 rounded-full font-bold text-white hover:bg-white/10 transition-all backdrop-blur-md">Plus d'infos</button>
                  
                  {nextEvent.documentUrl && (
                      <div className="flex items-center gap-2 text-gold-400 text-sm font-bold border-l border-white/20 pl-4 ml-2">
                          <FileText size={18}/> PDF Disponible
                      </div>
                  )}
                </div>
              )}
            </motion.div>
            {nextEvent && (
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="hidden md:block">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl relative shadow-2xl">
                   <div className="absolute top-0 right-0 p-6 opacity-10"><Moon size={120} className="text-white"/></div>
                   <h3 className="text-gold-400 font-bold uppercase tracking-widest text-sm mb-2">Prochaine date</h3>
                   <div className="text-5xl font-serif font-bold text-white mb-2">{new Date(nextEvent.date).getDate()}</div>
                   <div className="text-2xl text-primary-200 mb-8">{new Date(nextEvent.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
                   <div className="space-y-4">
                      <div className="flex items-center gap-4 text-white"><div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Clock size={20}/></div><div><p className="text-xs text-primary-300 uppercase font-bold">Heure</p><p className="font-medium">{new Date(nextEvent.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p></div></div>
                      <div className="flex items-center gap-4 text-white"><div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><MapPin size={20}/></div><div><p className="text-xs text-primary-300 uppercase font-bold">Lieu</p><p className="font-medium">{nextEvent.location}</p></div></div>
                   </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION (Calendrier / Billetterie) */}
      <div id="agenda" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1.5 rounded-full shadow-sm border border-gray-200 inline-flex">
             {['calendar', 'tickets'].map((tab) => (
               <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === tab ? 'bg-primary-900 text-white shadow-lg transform scale-105' : 'text-gray-500 hover:text-primary-900'}`}>
                 {tab === 'calendar' ? <CalIcon size={18}/> : <Ticket size={18}/>} {tab === 'calendar' ? 'Calendrier Hégirien' : 'Billetterie'}
               </button>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CALENDRIER GAUCHE (Picker Restauré) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 sticky top-24">
              <div className="bg-gradient-to-br from-primary-900 to-primary-800 p-6 text-white relative">
                <div className="flex justify-between items-center">
                  {!isPickerOpen && <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-full transition"><ChevronLeft/></button>}
                  <button onClick={() => setIsPickerOpen(!isPickerOpen)} className="flex flex-col items-center mx-auto group hover:bg-white/10 px-4 py-2 rounded-xl transition cursor-pointer">
                    <div className="flex items-center gap-2"><h3 className="text-xl font-serif font-bold capitalize">{monthName}</h3><ChevronDown size={16} className={`text-gold-400 transition-transform duration-300 ${isPickerOpen ? 'rotate-180' : ''}`} /></div>
                    <p className="text-gold-400 text-xs font-bold uppercase tracking-wider opacity-80">{hijriMonthName}</p>
                  </button>
                  {!isPickerOpen && <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-full transition"><ChevronRight/></button>}
                </div>
              </div>
              <div className="p-6 min-h-[380px] bg-white">
                <AnimatePresence mode="wait">
                  {!isPickerOpen ? (
                    <motion.div key="grid" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                      <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">
                        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => <span key={d}>{d}</span>)}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {days.map((day, idx) => {
                          if (!day) return <div key={idx} className="aspect-square"></div>;
                          const isToday = day.toDateString() === today.toDateString();
                          const hasEvent = events.some(e => new Date(e.date).toDateString() === day.toDateString());
                          return (
                            <div key={idx} className={`aspect-square rounded-xl flex flex-col items-center justify-center relative cursor-pointer transition-all hover:scale-105 group ${isToday ? 'bg-primary-900 text-white shadow-lg' : 'bg-gray-50 text-gray-700 hover:bg-gold-50'} ${hasEvent ? 'border-2 border-gold-400' : 'border border-transparent'}`}>
                              <span className="text-sm font-bold">{day.getDate()}</span>
                              {hasEvent && <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-1"></div>}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="picker" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                      <div className="grid grid-cols-3 gap-3">
                        {monthNames.map((m, idx) => (<button key={m} onClick={() => selectDate(idx, null)} className={`py-3 rounded-xl text-sm font-bold transition-all ${idx === currentMonthIndex ? 'bg-gold-500 text-white' : 'bg-gray-50 text-gray-600'}`}>{m}</button>))}
                      </div>
                      <button onClick={() => setIsPickerOpen(false)} className="mt-8 w-full py-2 text-xs font-bold text-gray-400 hover:text-red-500 flex items-center justify-center gap-1"><X size={14}/> Fermer</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE : LISTE (Badges PDF inclus) */}
          <div className="lg:col-span-8">
             <div className="mb-6 flex items-center justify-between px-2">
                <h2 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
                    {activeTab === 'calendar' ? <><CalIcon size={24} className="text-gold-500"/> Agenda de {monthName}</> : <><Ticket size={24} className="text-gold-500"/> Billetterie</>}
                </h2>
             </div>

             <div className="space-y-6">
                {(activeTab === 'tickets' ? events.filter(e => e.hasTicket || e.price > 0) : events).map((event, index) => {
                   const eventDate = new Date(event.date);
                   return (
                     <motion.div 
                        key={event._id || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} 
                        className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row border border-gray-100"
                     >
                        <div className="md:w-1/3 h-56 md:h-auto relative overflow-hidden bg-gray-200 shrink-0">
                           {event.image ? <img src={event.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Moon size={40}/></div>}
                           
                           {/* Badge Prix */}
                           {(event.price > 0 || event.ticketPrice > 0) && (
                              <div className="absolute bottom-4 left-4 bg-primary-900 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                                {(event.price || event.ticketPrice).toLocaleString()} F
                              </div>
                           )}

                           {/* Badge PDF (Restauré) */}
                           {event.documentUrl && (
                             <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl text-primary-900 shadow-lg">
                                <FileText size={18} />
                             </div>
                           )}
                        </div>

                        <div className="flex-1 p-6 md:p-8 flex flex-col">
                           <div className="flex justify-between items-start mb-4">
                             <div>
                                {event.isOnline && <span className="inline-block bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded mb-2 uppercase tracking-widest">Live</span>}
                                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2 group-hover:text-gold-600 transition-colors">{event.title}</h3>
                                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase">
                                  <span className="flex items-center gap-1.5"><Clock size={14} className="text-gold-500"/> {eventDate.toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})}</span>
                                  <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gold-500"/> {event.location}</span>
                                </div>
                             </div>
                           </div>
                           
                           <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1">{event.description}</p>
                           
                           <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{getHijriDate(eventDate)}</span>
                              <div className="flex gap-2">
                                <button onClick={() => handleDetailsClick(event)} className="p-3 bg-gray-50 text-gray-400 hover:text-primary-900 hover:bg-gray-100 rounded-xl transition-all"><Eye size={18}/></button>
                                {(event.hasTicket || event.price > 0) && (
                                  <button onClick={() => handleBookClick(event)} className="bg-primary-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-primary-900 transition-all shadow-lg">Acheter</button>
                                )}
                              </div>
                           </div>
                        </div>
                     </motion.div>
                   );
                })}
             </div>
          </div>
        </div>
      </div>

      {/* --- MODAL UNIVERSELLE (Détails avec PDF & Réservation) --- */}
      <AnimatePresence>
        {isModalOpen && selectedEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto">
              <button onClick={closeModal} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 z-10 transition-colors"><X size={20}/></button>
              
              <div className="text-center mb-8">
                  <h3 className="text-2xl font-serif font-bold text-primary-900">{modalType === 'booking' ? 'Réserver vos places' : selectedEvent.title}</h3>
                  <p className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em] mt-2">{getHijriDate(new Date(selectedEvent.date))}</p>
              </div>

              {/* MODAL TYPE: DETAILS (Restauré avec PDF) */}
              {modalType === 'details' && (
                <div className="space-y-6">
                    <div className="h-48 rounded-2xl overflow-hidden bg-gray-100 relative">
                       {selectedEvent.image ? <img src={selectedEvent.image} className="w-full h-full object-cover" alt=""/> : <div className="w-full h-full bg-primary-800"></div>}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{selectedEvent.description}</p>
                    
                    {/* Bloc PDF dans la Modal (Restauré) */}
                    {selectedEvent.documentUrl && (
                      <div className="bg-gold-50 border border-gold-200 rounded-2xl p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="p-3 bg-gold-500 text-white rounded-xl shadow-lg"><FileText size={20}/></div>
                           <div><p className="text-sm font-bold text-primary-900">Programme PDF</p><p className="text-[10px] text-gray-400 font-bold uppercase">Disponible</p></div>
                        </div>
                        <a href={selectedEvent.documentUrl} target="_blank" rel="noopener noreferrer" className="bg-primary-900 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-gold-500 transition-all"><Download size={14}/> Ouvrir</a>
                      </div>
                    )}

                    {(selectedEvent.hasTicket || selectedEvent.price > 0) && (
                      <button onClick={() => setModalType('booking')} className="w-full py-5 bg-gold-500 text-primary-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">S'inscrire / Acheter</button>
                    )}
                </div>
              )}

              {/* MODAL TYPE: BOOKING (Selection / Paiement Wave-OM) */}
              {modalType === 'booking' && purchaseStep === 'selection' && (
                <div className="space-y-8 animate-fadeIn">
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                      <span className="font-bold text-gray-400 uppercase text-[10px]">Quantité</span>
                      <div className="flex items-center gap-6">
                        <button onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))} className="w-10 h-10 rounded-full bg-white border flex items-center justify-center font-bold">-</button>
                        <span className="font-serif font-bold text-2xl text-primary-900">{ticketQuantity}</span>
                        <button onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))} className="w-10 h-10 rounded-full bg-white border flex items-center justify-center font-bold">+</button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setPaymentMethod('Wave')} className={`h-20 rounded-[2rem] border-2 transition-all flex items-center justify-center gap-2 ${paymentMethod === 'Wave' ? 'border-[#1dc4ff] bg-[#1dc4ff]/5' : 'border-gray-100 bg-gray-50'}`}><img src={waveLogoImg} className="h-8" alt="Wave"/></button>
                      <button onClick={() => setPaymentMethod('Orange Money')} className={`h-20 rounded-[2rem] border-2 transition-all flex items-center justify-center gap-2 ${paymentMethod === 'Orange Money' ? 'border-[#ff7900] bg-[#ff7900]/5' : 'border-gray-100 bg-gray-50'}`}><img src={omLogoImg} className="h-8" alt="OM"/></button>
                    </div>

                    <div className="bg-primary-900 p-6 rounded-[2rem] flex justify-between items-center text-white">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-60">Total</span>
                      <span className="text-3xl font-serif font-bold">{( (selectedEvent.price || selectedEvent.ticketPrice || 0) * ticketQuantity).toLocaleString()} F</span>
                    </div>

                    <button onClick={handleConfirmPurchase} className="w-full py-5 bg-gold-500 text-primary-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">Valider la commande</button>
                </div>
              )}

              {/* ÉTAPE TRAITEMENT */}
              {purchaseStep === 'processing' && (
                <div className="py-16 text-center space-y-6">
                  <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent animate-spin rounded-full mx-auto"></div>
                  <h3 className="text-xl font-serif font-bold text-primary-900 italic">Sécurisation de vos places...</h3>
                </div>
              )}

              {/* ÉTAPE SUCCÈS */}
              {purchaseStep === 'success' && (
                <div className="py-10 text-center animate-fadeIn">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><CheckCircle size={40} className="text-green-500" /></div>
                  <h3 className="text-3xl font-serif font-bold text-primary-900 mb-4">Succès !</h3>
                  <p className="text-gray-500 mb-10 text-sm">Vos billets sont maintenant disponibles dans votre espace profil.</p>
                  <button onClick={() => { closeModal(); navigate('/profil'); }} className="w-full py-5 bg-primary-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all">Voir mes billets</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}