import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Calendar as CalIcon, MapPin, Clock, ArrowRight, ChevronLeft, ChevronRight, 
  Moon, ChevronDown, X, Ticket, Star, CheckCircle2, Minus, Plus, Loader2, FileText, Download, Eye, Sparkles
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

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('details'); 

  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [purchaseStep, setPurchaseStep] = useState('selection');
  const [paymentMethod, setPaymentMethod] = useState('Wave'); 

  // --- CHARGEMENT INITIAL ---
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/api/events');
        const loadedEvents = response.data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(loadedEvents);
        
        const upcoming = loadedEvents.find(e => new Date(e.date) >= new Date());
        setNextEvent(upcoming || loadedEvents[loadedEvents.length - 1]);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  // ✅ LOGIQUE D'INNOVATION : AUTO-OUVERTURE (CONSERVÉE)
  useEffect(() => {
    const eventId = searchParams.get('id');
    if (!loading && events.length > 0 && eventId) {
      const eventFound = events.find(e => String(e._id) === String(eventId));
      if (eventFound) {
        setSelectedEvent(eventFound);
        setModalType('details');
        setIsModalOpen(true);
        if (eventFound.hasTicket) setActiveTab('tickets');
      }
    }
  }, [events, loading, searchParams]);

  // --- LOGIQUE CALENDRIER ---
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

  const isLoggedIn = () => !!localStorage.getItem('token');
  
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
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const userResponse = await axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        const realUser = userResponse.data;
        const unitPrice = Number(selectedEvent.price || selectedEvent.ticketPrice || 0);
        const qty = Number(ticketQuantity);
        const orderData = {
            user: realUser._id,
            items: [{ type: 'ticket', name: `Ticket - ${selectedEvent.title}`, quantity: qty, price: unitPrice, ticketEvent: selectedEvent._id }],
            totalAmount: unitPrice * qty, 
            paymentMethod: paymentMethod === 'Wave' ? 'Wave' : 'Orange Money', 
            customerPhone: realUser.phone || 'Non renseigné'
        };
        await axios.post('/api/orders', orderData, { headers: { Authorization: `Bearer ${token}` } });
        setPurchaseStep('success');
      } catch (error) {
        setPurchaseStep('selection');
        alert("Erreur de transaction.");
      }
    }, 2000);
  };

  const closeModal = () => { setIsModalOpen(false); setSelectedEvent(null); navigate('/evenements', { replace: true }); };

  if (loading) return <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
    <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
    <p className="text-primary-900 font-serif italic">Chargement de la Lumière...</p>
  </div>;

  return (
    <div className="min-h-screen bg-white pb-20 font-sans selection:bg-gold-200">
      
      {/* 1. HERO SECTION (ULTRA CLASSE) */}
      <div className="relative h-[80vh] min-h-[650px] bg-primary-900 overflow-hidden flex items-center">
        <div className="absolute inset-0">
           {nextEvent?.image ? (
             <motion.img 
              initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
              src={nextEvent.image} className="w-full h-full object-cover opacity-50" alt="Hero" 
             />
           ) : <div className="w-full h-full bg-primary-800"></div>}
           <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-primary-900/40 to-transparent"></div>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-[0.03]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full pt-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 px-5 py-2 rounded-full text-gold-400 text-xs font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md">
                <Sparkles size={14} className="animate-pulse" /> Événement Majeur
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-tight mb-8 drop-shadow-2xl">
                {nextEvent ? nextEvent.title : "L'Agenda Spirituel"}
              </h1>
              <div className="flex flex-wrap gap-5">
                {(nextEvent?.hasTicket) && (
                  <button onClick={() => handleBookClick(nextEvent)} className="px-10 py-5 bg-gold-500 text-primary-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white hover:scale-105 transition-all shadow-2xl shadow-gold-500/20 flex items-center gap-3">
                    <Ticket size={20} /> Réserver ma place
                  </button>
                )}
                <button onClick={() => handleDetailsClick(nextEvent)} className="px-10 py-5 border-2 border-white/20 rounded-2xl font-black text-sm uppercase tracking-widest text-white hover:bg-white/10 hover:border-white transition-all backdrop-blur-md">
                  Découvrir
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION ET LISTE */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        {/* Tab Switcher "Pill" Design */}
        <div className="flex justify-center mb-16">
          <div className="bg-white/80 backdrop-blur-2xl p-2 rounded-[2.5rem] shadow-2xl border border-gray-100 flex gap-2">
             {['calendar', 'tickets'].map((tab) => (
               <button key={tab} onClick={() => setActiveTab(tab)} className={`px-10 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${activeTab === tab ? 'bg-primary-900 text-white shadow-xl scale-105' : 'text-gray-400 hover:text-primary-900 hover:bg-gray-50'}`}>
                 {tab === 'calendar' ? <CalIcon size={18}/> : <Ticket size={18}/>}
                 {tab === 'calendar' ? 'Calendrier' : 'Billetterie'}
               </button>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* CALENDRIER (DESIGN RAFFINÉ) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 sticky top-24">
              <div className="bg-primary-900 p-8 text-white relative">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Moon size={80}/></div>
                <div className="flex justify-between items-center relative z-10">
                  <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft/></button>
                  <div className="text-center">
                    <h3 className="text-2xl font-serif font-bold capitalize">{monthName}</h3>
                    <p className="text-gold-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{hijriMonthName}</p>
                  </div>
                  <button onClick={() => changeMonth(1)} className="p-3 hover:bg-white/10 rounded-full transition-colors"><ChevronRight/></button>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-7 text-center text-[10px] font-black text-gray-300 mb-6 uppercase tracking-widest">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => <span key={d}>{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-3">
                  {days.map((day, idx) => {
                    if (!day) return <div key={idx} className="aspect-square"></div>;
                    const isToday = day.toDateString() === today.toDateString();
                    const hasEvent = events.some(e => new Date(e.date).toDateString() === day.toDateString());
                    return (
                      <div key={idx} className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative cursor-pointer transition-all hover:scale-110 group ${isToday ? 'bg-primary-900 text-white shadow-lg' : 'bg-gray-50 text-gray-700 hover:bg-gold-50'} ${hasEvent ? 'ring-2 ring-gold-400 ring-offset-2' : ''}`}>
                        <span className="text-sm font-bold">{day.getDate()}</span>
                        {hasEvent && <div className="absolute bottom-1 w-1 h-1 bg-gold-500 rounded-full animate-pulse"></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* LISTE DES EVENEMENTS (DESIGN CARTE MODERNE) */}
          <div className="lg:col-span-8 space-y-8">
             <div className="flex items-center justify-between px-4">
                <h2 className="text-3xl font-serif font-bold text-primary-900">Programmation</h2>
                <div className="h-[1px] flex-1 mx-8 bg-gray-100 hidden md:block"></div>
                <span className="text-[10px] font-black text-gold-600 uppercase tracking-[0.2em]">{events.length} Cérémonies</span>
             </div>

             <div className="grid grid-cols-1 gap-8">
                {(activeTab === 'tickets' ? events.filter(e => e.hasTicket || e.price > 0) : events).map((event, index) => {
                   const eventDate = new Date(event.date);
                   return (
                     <motion.div 
                        key={event._id || index} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }}
                        className="group bg-white rounded-[2rem] p-4 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row gap-8"
                     >
                        <div className="md:w-52 h-52 rounded-[1.5rem] overflow-hidden relative shrink-0">
                           {event.image ? (
                             <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                           ) : <div className="w-full h-full bg-gray-100 flex items-center justify-center"><Moon size={40} className="text-gray-200"/></div>}
                           
                           <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl text-center shadow-sm">
                             <span className="block text-lg font-bold text-primary-900 leading-none">{eventDate.getDate()}</span>
                             <span className="block text-[8px] font-black text-gold-600 uppercase tracking-tighter">{eventDate.toLocaleDateString('fr-FR', {month:'short'})}</span>
                           </div>
                        </div>

                        <div className="flex-1 py-4 pr-4">
                           <div className="flex justify-between items-start mb-4">
                             <div>
                                {event.isOnline && <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded-full mb-3 uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"/> En Direct</span>}
                                <h3 className="text-2xl font-serif font-bold text-primary-900 group-hover:text-gold-600 transition-colors mb-2 leading-tight">{event.title}</h3>
                                <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                   <div className="flex items-center gap-1.5"><Clock size={14} className="text-gold-500"/> {eventDate.toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})}</div>
                                   <div className="flex items-center gap-1.5"><MapPin size={14} className="text-gold-500"/> {event.location}</div>
                                </div>
                             </div>
                             {(event.price > 0 || event.ticketPrice > 0) && (
                               <div className="bg-primary-50 text-primary-900 px-4 py-2 rounded-xl font-black text-sm">
                                 {(event.price || event.ticketPrice).toLocaleString()} F
                               </div>
                             )}
                           </div>
                           
                           <p className="text-gray-500 text-sm line-clamp-2 mb-8 font-medium italic">"{event.description}"</p>
                           
                           <div className="flex items-center justify-between border-t border-gray-50 pt-6">
                              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{getHijriDate(eventDate)}</span>
                              <div className="flex gap-3">
                                <button onClick={() => handleDetailsClick(event)} className="p-3 bg-gray-50 text-primary-900 rounded-xl hover:bg-primary-900 hover:text-white transition-all">
                                  <Eye size={18}/>
                                </button>
                                <button onClick={() => handleBookClick(event)} className="px-6 py-3 bg-primary-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-gold-500 transition-all flex items-center gap-2 shadow-lg">
                                  <Ticket size={16}/> Réserver
                                </button>
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

      {/* --- MODAL (DESIGN RAFFINÉ) --- */}
      <AnimatePresence>
        {isModalOpen && selectedEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-primary-950/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl p-0 relative overflow-hidden max-h-[90vh] flex flex-col">
              
              {/* Header de la Modal */}
              <div className="relative h-64 shrink-0">
                {selectedEvent.image ? <img src={selectedEvent.image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-primary-800"></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
                <button onClick={closeModal} className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white text-primary-900 backdrop-blur-md rounded-full transition-all shadow-xl"><X size={20}/></button>
              </div>

              <div className="p-10 -mt-20 relative bg-white rounded-t-[3rem] overflow-y-auto flex-1">
                <div className="inline-flex items-center gap-2 bg-gold-50 px-4 py-1.5 rounded-full text-gold-600 text-[10px] font-black uppercase tracking-widest mb-6">Détails officiels</div>
                <h3 className="text-3xl font-serif font-bold text-primary-900 mb-6 leading-tight">{selectedEvent.title}</h3>
                
                <div className="grid grid-cols-2 gap-6 mb-10">
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                     <Clock className="text-gold-500 mb-2" size={18}/>
                     <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Date & Heure</p>
                     <p className="text-sm font-bold text-primary-900">{new Date(selectedEvent.date).toLocaleDateString()} à {new Date(selectedEvent.date).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})}</p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                     <MapPin className="text-gold-500 mb-2" size={18}/>
                     <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Localisation</p>
                     <p className="text-sm font-bold text-primary-900">{selectedEvent.location}</p>
                   </div>
                </div>

                {modalType === 'details' && (
                  <div className="space-y-10">
                    <p className="text-gray-500 text-sm leading-relaxed font-medium italic">"{selectedEvent.description}"</p>
                    {selectedEvent.documentUrl && (
                      <div className="bg-primary-900 rounded-[2rem] p-6 flex items-center justify-between group shadow-xl">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/10 rounded-2xl text-gold-400 group-hover:bg-gold-500 group-hover:text-primary-900 transition-all"><FileText size={24}/></div>
                          <div><p className="text-white font-bold text-sm">Programme PDF</p><p className="text-white/40 text-[10px] font-black uppercase tracking-tighter text-xs">Informations complètes</p></div>
                        </div>
                        <a href={selectedEvent.documentUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 text-white rounded-xl hover:bg-white hover:text-primary-900 transition-all"><Download size={20}/></a>
                      </div>
                    )}
                    {selectedEvent.hasTicket && <button onClick={() => setModalType('booking')} className="w-full py-5 bg-gold-500 text-primary-950 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-primary-900 hover:text-white transition-all shadow-xl shadow-gold-500/20 active:scale-95">Réserver mon billet</button>}
                  </div>
                )}

                {modalType === 'booking' && purchaseStep === 'selection' && (
                  <div className="space-y-8 animate-fadeIn">
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                      <span className="font-black uppercase text-[10px] text-gray-400 tracking-widest">Quantité de billets</span>
                      <div className="flex items-center gap-6">
                        <button onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))} className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-primary-900 hover:bg-gold-500 hover:text-white transition-all font-bold">-</button>
                        <span className="font-serif font-bold text-2xl text-primary-900">{ticketQuantity}</span>
                        <button onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))} className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-primary-900 hover:bg-gold-500 hover:text-white transition-all font-bold">+</button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setPaymentMethod('Wave')} className={`relative py-6 rounded-[2rem] border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'Wave' ? 'border-primary-900 bg-primary-900 text-white' : 'border-gray-100 bg-white text-gray-400'}`}>
                        <img src={waveLogoImg} alt="Wave" className="h-8 grayscale group-hover:grayscale-0" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Wave</span>
                      </button>
                      <button onClick={() => setPaymentMethod('Orange Money')} className={`relative py-6 rounded-[2rem] border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'Orange Money' ? 'border-primary-900 bg-primary-900 text-white' : 'border-gray-100 bg-white text-gray-400'}`}>
                        <img src={omLogoImg} alt="OM" className="h-8" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Orange Money</span>
                      </button>
                    </div>

                    <div className="flex justify-between items-center px-4">
                      <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Total à régler</span>
                      <span className="text-3xl font-serif font-bold text-primary-900 underline decoration-gold-500 underline-offset-8 decoration-4">{((selectedEvent.price || selectedEvent.ticketPrice || 0) * ticketQuantity).toLocaleString()} F</span>
                    </div>

                    <button onClick={handleConfirmPurchase} className="w-full py-5 bg-gold-500 text-primary-950 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95 transition-all">Valider la commande</button>
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
                    <h3 className="text-3xl font-serif font-bold text-primary-900 mb-4">Qu’Allah vous récompense !</h3>
                    <p className="text-gray-500 mb-10 font-medium">Votre réservation est confirmée. Vos billets sont disponibles sur votre profil.</p>
                    <button onClick={() => { closeModal(); navigate('/profil'); }} className="w-full py-5 bg-primary-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-gold-500 transition-all">Consulter mes billets</button>
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