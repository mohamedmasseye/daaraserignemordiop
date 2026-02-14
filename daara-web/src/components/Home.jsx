import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../services/api'; 
import { 
  BookOpen, Youtube, MapPin, ArrowRight, Heart, Star, 
  Calendar, Users, PlayCircle, Quote, Clock, ChevronLeft, ChevronRight, X, Ticket, 
  ShoppingBag, Image as ImageIcon, Bell, FileText, ChevronDown, Loader
} from 'lucide-react';
import NotificationBanner from './NotificationBanner';
import { getOptimizedImage } from '../utils/imageHelper';

// IMPORTS PDF
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// --- ANIMATIONS VARIANTS (LE STYLE CLASSE) ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

const imageReveal = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } 
  }
};

// --- COMPOSANTS UTILITAIRES ---
const ImagePlaceholder = ({ label }) => (
  <div className="w-full h-full bg-primary-800 flex flex-col items-center justify-center text-primary-200/50 text-center p-4">
    <ImageIcon size={48} className="mb-2 opacity-50" />
    <span className="text-xs font-bold uppercase tracking-widest">{label || "Image non disponible"}</span>
  </div>
);

const getSecureUrl = (url) => {
  if (!url) return "";
  if (url.includes('localhost:5000')) return url.replace('http://localhost:5000', '');
  return url.replace('http://', 'https://');
};

const PdfPopup = ({ url, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageWidth, setPageWidth] = useState(window.innerWidth * 0.9);
  useEffect(() => {
    const handleResize = () => setPageWidth(Math.min(window.innerWidth * 0.95, 850));
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  if (!url) return null;
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-primary-950/95 backdrop-blur-xl">
      <div className="p-4 md:p-6 flex justify-between items-center border-b border-white/10 bg-primary-900/50 shadow-xl relative z-10">
        <div className="flex items-center gap-3 text-white"><div className="p-2 bg-gold-500 text-primary-900 rounded-xl shadow-lg"><FileText size={20}/></div><div className="text-left"><span className="block font-bold font-serif text-lg leading-none">Biographie</span><span className="text-[10px] text-gold-400 font-black uppercase tracking-widest mt-1">Lecture Interactive</span></div></div>
        <button onClick={onClose} className="p-3 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-all"><X size={24}/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-hide">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <Document file={getSecureUrl(url)} onLoadSuccess={({ numPages }) => setNumPages(numPages)} loading={<div className="flex flex-col items-center py-20 text-gold-500 animate-pulse font-bold uppercase tracking-widest">Préparation...</div>}>
            {Array.from(new Array(numPages || 0), (el, index) => (
              <motion.div key={`page_${index + 1}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="mb-8 shadow-2xl rounded-lg overflow-hidden border border-white/5"><Page pageNumber={index + 1} width={pageWidth} renderTextLayer={true} renderAnnotationLayer={false}/></motion.div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
};

const EventPopup = ({ event, onClose, onBook }) => {
  if (!event) return null;
  const imageUrl = getOptimizedImage(getSecureUrl(event.image), 500);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative border-2 border-gold-500/30">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-black/10 hover:bg-black/20 rounded-full text-white z-20 transition-colors"><X size={20} /></button>
        <div className="h-48 relative bg-gray-100">{imageUrl ? <img src={imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-300"><Calendar size={48}/></div>}<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div><div className="absolute bottom-4 left-4 right-4"><span className="bg-gold-500 text-primary-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">Prochain Événement</span><h3 className="text-white text-xl font-serif font-bold leading-tight">{event.title}</h3></div></div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4 text-sm text-gray-600"><div className="flex items-center gap-2"><Calendar size={16} className="text-gold-500"/><span>{new Date(event.date).toLocaleDateString('fr-FR')}</span></div><div className="flex items-center gap-2"><Clock size={16} className="text-gold-500"/><span>{new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div></div>
          <p className="text-gray-500 text-sm line-clamp-2 mb-6">{event.description || "Rejoignez-nous."}</p>
          <div className="flex gap-3"><button onClick={onClose} className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">Fermer</button><button onClick={onBook} className="flex-[2] py-3 bg-primary-900 text-white font-bold rounded-xl hover:bg-gold-500 hover:text-primary-900 transition-all shadow-lg flex items-center justify-center gap-2"><ArrowRight size={18}/> En savoir plus</button></div>
        </div>
      </motion.div>
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [content, setContent] = useState({ slides: [], about: {}, pillars: {p1:{},p2:{},p3:{}}, quote: {}, info: {} });
  const [isBioOpen, setIsBioOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resHome, resEvents] = await Promise.all([API.get('/api/home-content'), API.get('/api/events')]);
        if (resHome.data) setContent(prev => ({ ...prev, ...resHome.data }));
        const upcoming = (resEvents.data || []).filter(e => new Date(e.date) > new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
        if (upcoming[0]) {
            setFeaturedEvent(upcoming[0]);
            const log = JSON.parse(localStorage.getItem('home_popup_log') || '{}');
            if (log.eventId !== upcoming[0]._id || log.lastSeenDate !== new Date().toDateString()) setTimeout(() => setShowPopup(true), 2500); 
        }
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => { if(content.slides?.length > 0) setCurrentSlide((p) => (p + 1) % content.slides.length); }, 6000); 
    return () => clearInterval(timer);
  }, [content.slides]);

  const handleCloseEventPopup = () => {
    setShowPopup(false);
    if (featuredEvent) localStorage.setItem('home_popup_log', JSON.stringify({ eventId: featuredEvent._id, lastSeenDate: new Date().toDateString() }));
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 overflow-x-hidden">
      <NotificationBanner />

      <AnimatePresence>{showPopup && featuredEvent && <EventPopup event={featuredEvent} onClose={handleCloseEventPopup} onBook={() => { handleCloseEventPopup(); navigate('/evenements'); }} />}</AnimatePresence>
      <AnimatePresence>{isBioOpen && <PdfPopup url={content.about.bioPdf} onClose={() => setIsBioOpen(false)} />}</AnimatePresence>

      {/* 1. HERO SLIDER */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-primary-900">
        <AnimatePresence mode='wait'>
          <motion.div key={content.slides[currentSlide]?.id} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 z-0">
            {getSecureUrl(content.slides[currentSlide]?.image) ? <img src={getOptimizedImage(getSecureUrl(content.slides[currentSlide]?.image), 1000)} alt="Hero" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary-900 flex items-center justify-center"><Star className="text-primary-800 opacity-20 transform scale-[5]" /></div>}
            <div className="absolute inset-0 bg-gradient-to-b from-primary-900/70 via-primary-900/40 to-primary-900"></div>
          </motion.div>
        </AnimatePresence>
        <div className="relative z-10 text-center text-white px-4 max-w-5xl">
           <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
              <span className="inline-block px-4 py-1.5 rounded-full border border-gold-500/50 bg-gold-500/10 text-gold-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">{content.slides[currentSlide]?.badge || "Bienvenue"}</span>
              <h1 className="text-5xl md:text-8xl font-serif font-bold mb-6 drop-shadow-2xl leading-tight">{content.slides[currentSlide]?.title || "Daara SMD"}</h1>
              <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-10 font-light italic leading-relaxed">{content.slides[currentSlide]?.subtitle}</p>
              <button onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })} className="px-10 py-5 bg-gold-500 text-primary-950 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl transform hover:scale-105 active:scale-95 transition-all">Explorer l'Enseignement</button>
           </motion.div>
        </div>
      </section>

      {/* 2. BIOGRAPHIE (REVEAL ON SCROLL) */}
      <section id="about" className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer}
          className="grid md:grid-cols-2 gap-16 items-center"
        >
          <motion.div variants={imageReveal} className="relative">
            <div className="absolute inset-0 bg-gold-500 rounded-[3rem] opacity-20 rotate-6 translate-x-4 translate-y-4"></div>
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[600px] bg-primary-900 flex items-center justify-center group">
              {getSecureUrl(content.about.image) ? <img src={getOptimizedImage(getSecureUrl(content.about.image), 600)} alt="Serigne Mor" className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-[2s]" /> : <ImagePlaceholder label="Portrait" />}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-12 text-white"><p className="text-gold-400 font-black uppercase tracking-[0.2em] text-xs mb-2">Guide Spirituel</p><h3 className="text-4xl font-serif font-bold">Serigne Mor Diop</h3></div>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-8 text-center md:text-left">
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-primary-900 leading-tight">{content.about.title1}</h2>
            <div className="w-20 h-1 bg-gold-500 mx-auto md:mx-0 rounded-full"></div>
            <p className="text-gray-600 text-xl leading-relaxed font-light">{content.about.text1}</p>
            {content.about.bioPdf && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsBioOpen(true)} className="inline-flex items-center gap-6 bg-white border-2 border-primary-100 px-10 py-6 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all group">
                <div className="text-left"><span className="block font-black text-xs uppercase tracking-widest text-primary-900">Biographie</span><span className="text-[10px] text-gray-400 uppercase font-bold mt-1">Version intégrale</span></div>
                <div className="p-4 bg-primary-900 text-white rounded-2xl group-hover:bg-gold-500 transition-colors shadow-lg"><FileText size={24}/></div>
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* 3. LES PILIERS (STAGGERED ANIMATION) */}
      <section className="bg-primary-900 text-white py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-20"><h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 italic">Services & Spiritualité</h2><p className="text-primary-200 text-xl font-light opacity-70">Explorez les ressources numériques du Daara.</p></motion.div>
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}
            className="grid md:grid-cols-3 gap-10"
          >
            {['p1', 'p2', 'p3'].map((id) => (
              <motion.div key={id} variants={fadeInUp} whileHover={{ y: -15 }} onClick={() => navigate(content.pillars[id]?.link)} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] p-10 cursor-pointer group flex flex-col items-center shadow-2xl transition-all duration-500">
                <div className="w-full h-56 relative overflow-hidden rounded-[2.5rem] mb-8 shadow-inner">
                  {getSecureUrl(content.pillars[id]?.image) ? <img src={getOptimizedImage(getSecureUrl(content.pillars[id].image), 400)} alt="" className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-125" /> : <ImagePlaceholder label={content.pillars[id]?.label} />}
                  <div className="absolute inset-0 bg-primary-950/20 group-hover:bg-transparent transition-colors"></div>
                </div>
                <h3 className="text-3xl font-serif font-bold mb-4 group-hover:text-gold-400 transition-colors">{content.pillars[id]?.label}</h3>
                <p className="text-primary-200 text-sm mb-8 leading-relaxed opacity-80 text-center">{content.pillars[id]?.desc}</p>
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-gold-500 group-hover:text-primary-900 transition-all"><ArrowRight size={20}/></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. CITATION (SOFT ZOOM) */}
      <section className="py-32 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }}
          className="max-w-5xl mx-auto bg-gold-50 rounded-[4rem] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl border border-gold-100/50"
        >
          <Quote className="absolute top-10 left-10 text-gold-200 w-32 h-32 opacity-30 -scale-x-100" />
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-4xl md:text-6xl font-serif font-bold text-primary-900 mb-10 italic drop-shadow-sm leading-tight">{content.quote?.title}</h2 >
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-2xl md:text-3xl text-gray-700 max-w-3xl mx-auto leading-relaxed italic font-light opacity-90">"{content.quote?.text}"</motion.p>
        </motion.div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-24 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-16 text-center md:text-left">
            <motion.div variants={fadeInUp}><h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-gold-600 mb-8"><MapPin className="inline mr-3" size={14}/> Adresse</h4><p className="text-primary-900 font-bold text-lg whitespace-pre-line leading-relaxed">{content.info.address}</p></motion.div>
            <motion.div variants={fadeInUp}><h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-gold-600 mb-8"><Clock className="inline mr-3" size={14}/> Horaires</h4><p className="text-primary-900 font-bold text-lg whitespace-pre-line leading-relaxed">{content.info.hours}</p></motion.div>
            <motion.div variants={fadeInUp}><h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-gold-600 mb-8"><Calendar className="inline mr-3" size={14}/> Agenda</h4><p className="text-primary-900 font-bold text-lg whitespace-pre-line leading-relaxed">{content.info.nextGamou}</p></motion.div>
            <motion.div variants={fadeInUp} className="bg-primary-950 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gold-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <p className="text-[10px] font-black uppercase text-gold-500 mb-4 tracking-widest">Assistance 24/7</p>
              <p className="text-3xl font-black mb-4">{content.info.phone}</p>
              <p className="text-[10px] text-primary-300 font-bold uppercase">Contactez {content.info.contactName}</p>
            </motion.div>
        </motion.div>
      </footer>
    </div>
  );
}