import React, { useState, useEffect } from 'react';
import API from '../services/api'; 
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Calendar as CalIcon, MapPin, Clock, ArrowRight, ChevronLeft, ChevronRight, 
  Moon, ChevronDown, X, Ticket, Star, CheckCircle, Minus, Plus, Loader, FileText, Download, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Events() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextEvent, setNextEvent] = useState(null);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPickerOpen, setIsPickerOpen] = useState(false); 

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await API.get('/api/events'); 
        const loadedEvents = (response.data || []).sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(loadedEvents);
        const upcoming = loadedEvents.find(e => new Date(e.date) >= new Date());
        setNextEvent(upcoming || loadedEvents[loadedEvents.length - 1]);
      } catch (error) { console.error(error); setEvents([]); } finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const id = searchParams.get('id');
    if (!loading && events.length > 0 && id) {
      const eventFound = events.find(e => String(e._id) === String(id));
      if (eventFound) { setSelectedEvent(eventFound); setIsModalOpen(true); }
    }
  }, [events, loading, searchParams]);

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
  const days = getDaysInMonth();
  const today = new Date();
  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const hijriMonthName = new Intl.DateTimeFormat('fr-FR-u-ca-islamic', { month: 'long', year: 'numeric' }).format(currentDate);

  const handleDetailsClick = (event) => { setSelectedEvent(event); setIsModalOpen(true); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader className="animate-spin text-gold-500" size={48}/></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* HERO SECTION */}
      <div className="relative h-[80vh] bg-primary-900 text-white overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
           {nextEvent?.image ? <img src={nextEvent.image} className="w-full h-full object-cover opacity-40 animate-kenburns" alt="" /> : <div className="w-full h-full bg-primary-800 opacity-30"></div>}
           <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-transparent to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full pt-16">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-500/30 px-4 py-1.5 rounded-full text-gold-400 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm"><Star size={14} className="fill-gold-400" /> Événement à la une</div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-6">{nextEvent ? nextEvent.title : "Bienvenue au Daara"}</h1>
              <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-xl">{nextEvent?.description?.substring(0, 150)}...</p>
              <button onClick={() => handleDetailsClick(nextEvent)} className="px-8 py-4 bg-gold-500 text-primary-900 rounded-full font-bold text-lg hover:bg-white transition-all shadow-xl">Plus d'informations</button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* CALENDRIER */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 sticky top-24 overflow-hidden">
              <div className="bg-primary-900 p-6 text-white text-center">
                <div className="flex justify-between items-center px-4">
                  <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft/></button>
                  <div className="cursor-pointer" onClick={() => setIsPickerOpen(!isPickerOpen)}>
                    <h3 className="text-xl font-serif font-bold capitalize flex items-center gap-2">{monthName} <ChevronDown size={14}/></h3>
                    <p className="text-gold-400 text-[10px] uppercase font-black">{hijriMonthName}</p>
                  </div>
                  <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight/></button>
                </div>
              </div>
              <div className="p-6 bg-white">
                  <div className="grid grid-cols-7 text-center text-[10px] font-black text-gray-300 mb-4 uppercase tracking-widest">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => <span key={d}>{d}</span>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {days.map((day, idx) => {
                      if (!day) return <div key={idx} className="aspect-square"></div>;
                      const isToday = day.toDateString() === today.toDateString();
                      
                      const hasEvent = events.some(e => {
                          const start = new Date(e.date).setHours(0,0,0,0);
                          const end = e.endDate ? new Date(e.endDate).setHours(23,59,59,999) : start;
                          const current = day.getTime();
                          return current >= start && current <= end;
                      });

                      return (
                        <div key={idx} className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${isToday ? 'bg-primary-900 text-white shadow-lg' : 'bg-gray-50 text-gray-700 hover:bg-gold-50'} ${hasEvent ? 'border-2 border-gold-400' : 'border border-transparent'}`}>
                          <span className="text-xs font-bold">{day.getDate()}</span>
                          {hasEvent && <div className="w-1 h-1 bg-gold-500 rounded-full mt-0.5"></div>}
                        </div>
                      );
                    })}
                  </div>
              </div>
            </div>
          </div>

          {/* LISTE */}
          <div className="lg:col-span-8 space-y-8">
             <h2 className="text-3xl font-serif font-bold text-primary-900 flex items-center gap-3"><CalIcon className="text-gold-500"/> Agenda de {monthName}</h2>
             {events.map((event, index) => {
                const date = new Date(event.date);
                return (
                  <motion.div key={event._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col md:flex-row group">
                    <div className="md:w-1/3 h-52 md:h-auto bg-gray-200 overflow-hidden shrink-0">
                       {event.image ? <img src={event.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Moon size={48}/></div>}
                    </div>
                    <div className="flex-1 p-8 flex flex-col justify-between">
                        <div>
                           <div className="flex gap-2 mb-3">
                             {event.isDaily && <span className="bg-gold-500 text-primary-900 text-[9px] font-black px-3 py-1 rounded-full uppercase shadow-sm flex items-center gap-1"><Clock size={10}/> Tous les jours</span>}
                             {event.isOnline && <span className="bg-red-50 text-red-600 text-[9px] font-black px-3 py-1 rounded-full uppercase border border-red-100">Live</span>}
                           </div>
                           <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">{event.title}</h3>
                           <div className="flex items-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              <span className="flex items-center gap-2"><Clock size={14} className="text-gold-500"/> {date.toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})}</span>
                              <span className="flex items-center gap-2"><MapPin size={14} className="text-gold-500"/> {event.isOnline ? "En ligne" : event.location}</span>
                           </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-300 uppercase">{event.isDaily ? "Période du mois" : getHijriDate(date)}</span>
                            <button onClick={() => handleDetailsClick(event)} className="p-3 bg-primary-50 text-primary-900 rounded-xl hover:bg-primary-900 hover:text-white transition-all shadow-sm"><Eye size={20}/></button>
                        </div>
                    </div>
                  </motion.div>
                );
             })}
          </div>
      </div>

      {/* MODALE DÉTAILS */}
      <AnimatePresence>
        {isModalOpen && selectedEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-10 relative overflow-hidden text-gray-900 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X size={20}/></button>
              <div className="text-center mb-8">
                  <h3 className="text-3xl font-serif font-bold text-primary-900 mb-2">{selectedEvent.title}</h3>
                  <p className="text-gold-600 text-[10px] font-black uppercase tracking-[0.3em]">{selectedEvent.isDaily ? "Programme Quotidien" : getHijriDate(new Date(selectedEvent.date))}</p>
              </div>
              <div className="space-y-6">
                  <div className="h-44 rounded-3xl overflow-hidden shadow-inner bg-gray-50">
                     {selectedEvent.image ? <img src={selectedEvent.image} className="w-full h-full object-cover" alt=""/> : <div className="w-full h-full bg-primary-900 opacity-20"></div>}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed italic">{selectedEvent.description}</p>
                  {selectedEvent.documentUrl && (
                    <div className="bg-gold-50 border-2 border-gold-100 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3"><FileText className="text-gold-600"/><p className="text-xs font-black text-primary-900 uppercase">Programme PDF</p></div>
                      <a href={selectedEvent.documentUrl} target="_blank" rel="noopener noreferrer" className="bg-primary-900 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-gold-500 transition-all flex items-center gap-2"><Download size={14}/> Ouvrir</a>
                    </div>
                  )}
                  <button onClick={() => setIsModalOpen(false)} className="w-full py-4 bg-primary-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gold-500 transition-all shadow-lg">Fermer</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}