import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { 
  BookOpen, Youtube, MapPin, ArrowRight, Heart, Star, 
  Calendar, Users, PlayCircle, Quote, Clock, ChevronLeft, ChevronRight, X, Ticket, 
  ShoppingBag, Image as ImageIcon, Bell, FileText, ChevronDown 
} from 'lucide-react';
import NotificationBanner from './NotificationBanner';
import { getOptimizedImage } from '../utils/imageHelper';

// --- VALEURS PAR DÉFAUT ---
const DEFAULT_CONTENT = {
  slides: [
    { id: 1, image: "", badge: "Bienvenue", title: "La Science est une Lumière", subtitle: "...", cta: "Découvrir", link: "about" }
  ],
  about: { title1: "...", highlight1: "foi", title2: "...", highlight2: "savoir", text1: "...", text2: "...", image: "", bioPdf: "" },
  pillars: {
    p1: { image: "", label: "Agenda", desc: "Événements à venir", link: "/evenements" },
    p2: { image: "", label: "Bibliothèque", desc: "Ouvrages numériques", link: "/livres" },
    p3: { image: "", label: "Médiathèque", desc: "Podcasts et Vidéos", link: "/podcast" }
  },
  quote: { text: "...", title: "..." },
  info: { address: "...", hours: "...", nextGamou: "...", phone: "...", contactName: "..." }
};

const getSecureUrl = (url) => {
  if (!url) return "";
  return url.startsWith('http://') ? url.replace('http://', 'https://') : url;
};

const ImagePlaceholder = ({ label }) => (
  <div className="w-full h-full bg-primary-800 flex flex-col items-center justify-center text-primary-200/50">
    <ImageIcon size={48} className="mb-2 opacity-50" /><span className="text-xs font-bold uppercase">{label}</span>
  </div>
);

const PdfPopup = ({ url, onClose }) => {
  if (!url) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary-950/90 backdrop-blur-md p-2 md:p-10">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-4xl h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-2xl">
        <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3 font-bold text-primary-900"><FileText className="text-red-600"/><span className="font-serif text-lg">Biographie Complète</span></div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all"><X size={24}/></button>
        </div>
        <div className="flex-1 bg-gray-100 relative">
          <iframe src={`${getSecureUrl(url)}#view=FitH`} className="w-full h-full border-none" title="Bio PDF" />
        </div>
        <div className="p-4 bg-gray-50 border-t text-center">
            <a href={getSecureUrl(url)} download target="_blank" rel="noreferrer" className="text-xs font-black uppercase tracking-widest text-primary-500 hover:text-gold-600 transition-colors">Télécharger le document</a>
        </div>
      </motion.div>
    </div>
  );
};

const EventPopup = ({ event, onClose, onBook }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-3xl overflow-hidden relative shadow-2xl">
      <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-black/10 text-white z-20 rounded-full"><X size={20} /></button>
      <div className="h-48 relative">
        <img src={getOptimizedImage(getSecureUrl(event.image), 500)} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
          <span className="bg-gold-500 text-primary-900 text-[10px] font-bold px-2 py-1 rounded-full uppercase mb-2 inline-block w-fit">Prochain Événement</span>
          <h3 className="text-white text-xl font-serif font-bold">{event.title}</h3>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-500 text-sm mb-6 line-clamp-2">{event.description}</p>
        <button onClick={onBook} className="w-full py-3 bg-primary-900 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"><Ticket size={18}/> Réserver</button>
      </div>
    </motion.div>
  </div>
);

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [isBioOpen, setIsBioOpen] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await API.get('/api/home-content'); 
        if (res.data && Object.keys(res.data).length > 0) {
          setContent(prev => ({ 
            ...prev, 
            ...res.data,
            pillars: { ...prev.pillars, ...res.data.pillars } 
          }));
        }
      } catch (err) {}
    };
    fetchContent();
  }, []);

  useEffect(() => {
    const checkEvents = async () => {
      try {
        const res = await API.get('/api/events'); 
        const nextEvent = (res.data || []).filter(e => new Date(e.date) > new Date()).sort((a,b) => new Date(a.date)-new Date(b.date))[0];
        if (nextEvent) {
            setFeaturedEvent(nextEvent);
            const today = new Date().toDateString();
            const stored = JSON.parse(localStorage.getItem('home_popup_log') || '{}');
            if (stored.eventId !== nextEvent._id || stored.lastSeenDate !== today) setTimeout(() => setShowPopup(true), 2500);
        }
      } catch (e) {}
    };
    checkEvents();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => { if(content.slides?.length) setCurrentSlide(p => (p + 1) % content.slides.length); }, 6000);
    return () => clearInterval(timer);
  }, [content.slides]);

  const fadeInUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 overflow-x-hidden">
      <NotificationBanner />
      <AnimatePresence>{showPopup && featuredEvent && <EventPopup event={featuredEvent} onClose={() => setShowPopup(false)} onBook={() => navigate('/evenements')} />}</AnimatePresence>
      <AnimatePresence>{isBioOpen && <PdfPopup url={content.about.bioPdf} onClose={() => setIsBioOpen(false)} />}</AnimatePresence>

      {/* 1. HERO SLIDER */}
      <section className="relative h-[90vh] flex items-center justify-center bg-primary-900 overflow-hidden">
        <AnimatePresence mode='wait'>
          <motion.div key={currentSlide} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0">
            {content.slides[currentSlide]?.image ? <img src={content.slides[currentSlide].image} className="w-full h-full object-cover opacity-50" /> : <div className="w-full h-full bg-primary-900" />}
            <div className="absolute inset-0 bg-gradient-to-b from-primary-900/60 to-primary-900"></div>
          </motion.div>
        </AnimatePresence>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <span className="bg-gold-500/20 text-gold-400 px-4 py-1 rounded-full text-xs font-bold uppercase mb-6 inline-block tracking-widest">{content.slides[currentSlide]?.badge}</span>
          <h1 className="text-4xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">{content.slides[currentSlide]?.title}</h1>
          <p className="text-gray-300 text-lg md:text-xl mb-10">{content.slides[currentSlide]?.subtitle}</p>
          <button onClick={() => navigate(content.slides[currentSlide]?.link)} className="px-10 py-4 bg-gold-500 text-primary-950 rounded-full font-bold text-lg hover:bg-white transition-all shadow-xl">{content.slides[currentSlide]?.cta} <ArrowRight className="inline ml-2"/></button>
        </div>
      </section>

      {/* 2. BIOGRAPHIE */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
             <div className="relative rounded-[2rem] overflow-hidden shadow-2xl h-[500px] bg-primary-900">
               {content.about.image ? <img src={content.about.image} className="w-full h-full object-cover" /> : <ImagePlaceholder label="Portrait" />}
               <div className="absolute bottom-0 left-0 p-8 text-white bg-gradient-to-t from-black/80 to-transparent w-full">
                  <p className="text-gold-400 text-xs font-bold uppercase">Guide Spirituel</p>
                  <h3 className="text-2xl font-serif font-bold">Serigne Mor Diop</h3>
               </div>
             </div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-6">
            <h2 className="text-4xl font-serif font-bold text-primary-900 leading-tight">{content.about.title1} <span className="text-gold-500">{content.about.highlight1}</span></h2>
            <p className="text-gray-600 text-lg leading-relaxed">{content.about.text1}</p>
            {content.about.bioPdf && (
              <button onClick={() => setIsBioOpen(true)} className="flex items-center gap-4 bg-white border-2 border-primary-900/5 px-8 py-4 rounded-2xl shadow-sm hover:shadow-xl transition-all group">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-black uppercase">Voir plus</span>
                  <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ChevronDown size={18} className="text-gold-500" /></motion.div>
                </div>
                <div className="p-2 bg-primary-900 text-white rounded-xl group-hover:bg-gold-500 transition-colors"><FileText size={20} /></div>
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* 3. LES PILIERS (DYNAMIQUE) */}
      <section className="bg-primary-900 text-white py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Explorez le Daara</h2>
            <p className="text-primary-200">Services et ressources spirituelles.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {['p1', 'p2', 'p3'].map((id) => (
              <motion.div key={id} whileHover={{ y: -10 }} onClick={() => navigate(content.pillars[id]?.link)} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden cursor-pointer group">
                <div className="h-48 bg-gray-800">
                  {content.pillars[id]?.image ? <img src={content.pillars[id].image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <ImagePlaceholder label={content.pillars[id]?.label} />}
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-serif font-bold mb-2">{content.pillars[id]?.label}</h3>
                  <p className="text-primary-200 text-sm mb-6">{content.pillars[id]?.desc}</p>
                  <span className="text-gold-400 font-bold flex items-center gap-2 group-hover:gap-4 transition-all">Découvrir <ArrowRight size={16}/></span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CITATION (BOUTON RETIRÉ) */}
      <section className="py-24 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="max-w-5xl mx-auto bg-gold-50 rounded-[3rem] p-12 md:p-20 text-center shadow-xl">
          <Quote className="text-gold-200 w-16 h-16 mx-auto mb-8 opacity-50" />
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary-900 mb-8 italic">{content.quote.title}</h2>
          <p className="text-xl md:text-2xl text-gray-700 font-medium max-w-2xl mx-auto leading-relaxed">{content.quote.text}</p>
        </motion.div>
      </section>

      {/* 5. INFOS */}
      <footer className="bg-white border-t py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div><h4 className="font-bold text-primary-900 mb-4 flex items-center gap-2"><MapPin size={18} className="text-gold-500"/> Adresse</h4><p className="text-gray-600 whitespace-pre-line">{content.info.address}</p></div>
          <div><h4 className="font-bold text-primary-900 mb-4 flex items-center gap-2"><Clock size={18} className="text-gold-500"/> Horaires</h4><p className="text-gray-600 whitespace-pre-line">{content.info.hours}</p></div>
          <div><h4 className="font-bold text-primary-900 mb-4 flex items-center gap-2"><Calendar size={18} className="text-gold-500"/> Agenda</h4><p className="text-gold-600 font-bold">{content.info.nextGamou}</p></div>
          <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100 text-center"><p className="text-sm font-bold text-primary-800">Contact</p><p className="text-xl font-bold text-primary-900">{content.info.phone}</p></div>
        </div>
      </footer>
    </div>
  );
}