import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../services/api'; 
import { 
  BookOpen, Youtube, MapPin, ArrowRight, Heart, Star, 
  Calendar, Users, PlayCircle, Quote, Clock, ChevronLeft, ChevronRight, X, Ticket, 
  ShoppingBag, Image as ImageIcon, Bell, FileText, ChevronDown, Loader, Download, Share, PlusSquare, Smartphone, Monitor
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

// --- CONFIGURATION DES ÉTAPES ---
const INSTALL_STEPS = {
  safari: [
    { title: "Étape 1", desc: "Appuyez sur l'icône 'Partager' en bas du navigateur Safari.", img: "/safari_step1.png", icon: <Share className="text-blue-500" /> },
    { title: "Étape 2", desc: "Faites défiler le menu et sélectionnez 'Sur l'écran d'accueil'.", img: "/safari_step2.png", icon: <PlusSquare className="text-primary-900" /> },
    { title: "Étape 3", desc: "Appuyez sur 'Ajouter' en haut à droite pour finaliser.", img: "/safari_step3.png", icon: <Smartphone className="text-gold-500" /> }
  ],
  google: [
    { title: "Étape 1", desc: "Appuyez sur les trois points verticaux en haut à droite.", img: "/google_step1.png", icon: <Monitor className="text-gray-500" /> },
    { title: "Étape 2", desc: "Sélectionnez 'Installer l'application' dans la liste.", img: "/google_step2.png", icon: <Download className="text-primary-900" /> },
    { title: "Étape 3", desc: "Confirmez l'installation pour voir le Daara sur votre écran.", img: "/google_step3.png", icon: <Star className="text-gold-500" /> }
  ]
};

const ImagePlaceholder = ({ label }) => (
  <div className="w-full h-full bg-primary-800 flex flex-col items-center justify-center text-primary-200/50">
    <ImageIcon size={48} className="mb-2 opacity-50" />
    <span className="text-xs font-bold uppercase tracking-widest">{label || "Image non disponible"}</span>
  </div>
);

const getSecureUrl = (url) => {
  if (!url) return "";
  if (url.includes('localhost:5000')) return url.replace('http://localhost:5000', '');
  if (url.startsWith('http://')) return url.replace('http://', 'https://');
  return url;
};

// --- GUIDE INSTALLATION PLEIN ÉCRAN ---
const PWAInstallGuide = ({ isOpen, onClose }) => {
  const [browser, setBrowser] = useState('safari'); 
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-white flex flex-col font-sans"
    >
      <div className="p-4 md:p-6 flex justify-between items-center bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="w-8 h-8 object-contain" alt="Logo" />
          <h3 className="font-black text-primary-900 uppercase tracking-tighter text-sm">Installation Daara App</h3>
        </div>
        <button onClick={onClose} className="p-2 bg-primary-50 rounded-full text-primary-900 hover:bg-red-50 hover:text-red-500 transition-all"><X size={24}/></button>
      </div>

      <div className="bg-gray-50 p-4 shrink-0">
        <div className="max-w-md mx-auto flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          <button onClick={() => { setBrowser('safari'); setStep(0); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${browser === 'safari' ? 'bg-primary-900 text-white shadow-lg' : 'text-gray-400'}`}>Safari (iOS)</button>
          <button onClick={() => { setBrowser('google'); setStep(0); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${browser === 'google' ? 'bg-primary-900 text-white shadow-lg' : 'text-gray-400'}`}>Chrome (Android)</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 flex flex-col items-center">
        <div className="max-w-2xl w-full flex flex-col items-center text-center">
          <motion.div key={`${browser}-${step}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full mb-8">
            <div className="inline-flex items-center gap-2 bg-gold-50 text-gold-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
               {INSTALL_STEPS[browser][step].icon} {INSTALL_STEPS[browser][step].title}
            </div>
            <h4 className="text-xl md:text-3xl font-serif font-bold text-primary-900 leading-tight">{INSTALL_STEPS[browser][step].desc}</h4>
          </motion.div>

          <div className="w-full max-w-[280px] md:max-w-[350px] aspect-[9/16] bg-gray-100 rounded-[3rem] border-[8px] border-primary-900 shadow-2xl overflow-hidden relative mb-10">
             <motion.img 
                key={`img-${browser}-${step}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                src={INSTALL_STEPS[browser][step].img} className="w-full h-full object-cover" alt="Instruction"
                onError={(e) => { e.target.src = "https://via.placeholder.com/600x1200?text=Capture+Ecran"; }}
             />
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border-t border-gray-100 shrink-0">
        <div className="max-w-md mx-auto flex items-center justify-between gap-6">
          <button disabled={step === 0} onClick={() => setStep(s => s - 1)} className="p-4 bg-gray-50 rounded-2xl text-primary-900 disabled:opacity-20 transition-all font-bold"><ChevronLeft size={28} /></button>
          <div className="flex gap-2">{[0, 1, 2].map(i => (<div key={i} className={`h-2 rounded-full transition-all duration-300 ${step === i ? 'w-10 bg-gold-500' : 'w-2 bg-gray-200'}`} />))}</div>
          {step < 2 ? (
            <button onClick={() => setStep(s => s + 1)} className="flex-1 py-4 bg-primary-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2">Suivant <ChevronRight size={18}/></button>
          ) : (
            <button onClick={onClose} className="flex-1 py-4 bg-gold-500 text-primary-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Terminer</button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- PDF POPUP ---
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
        <div className="flex items-center gap-3 text-white">
          <div className="p-2 bg-gold-500 text-primary-900 rounded-xl shadow-lg"><FileText size={20}/></div>
          <div className="text-left">
            <span className="block font-bold font-serif text-lg leading-none">Biographie</span>
            <span className="text-[10px] text-gold-400 font-black uppercase tracking-widest mt-1">Lecture Interactive</span>
          </div>
        </div>
        <button onClick={onClose} className="p-3 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-all"><X size={24}/></button>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <Document file={getSecureUrl(url)} onLoadSuccess={({ numPages }) => setNumPages(numPages)} loading={<div className="flex flex-col items-center py-20 text-gold-500 gap-4"><Loader className="animate-spin" size={40} /><p className="font-bold animate-pulse text-xs tracking-widest uppercase text-center">Préparation du document...</p></div>}>
            {Array.from(new Array(numPages || 0), (el, index) => (
              <motion.div key={`page_${index + 1}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="mb-8 shadow-2xl rounded-lg overflow-hidden border border-white/5">
                <Page pageNumber={index + 1} width={pageWidth} renderTextLayer={true} renderAnnotationLayer={false}/>
              </motion.div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
};

// --- POPUP ÉVÉNEMENT ---
const EventPopup = ({ event, onClose, onBook }) => {
  if (!event) return null;
  const imageUrl = getOptimizedImage(getSecureUrl(event.image), 500);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative border-2 border-gold-500/30">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-black/10 hover:bg-black/20 rounded-full text-white z-20 transition-colors"><X size={20} /></button>
        <div className="h-48 relative bg-gray-100">
          {imageUrl ? <img src={imageUrl} alt={event.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-300"><Calendar size={48}/></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4"><span className="bg-gold-500 text-primary-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">Prochain Événement</span><h3 className="text-white text-xl font-serif font-bold leading-tight">{event.title}</h3></div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
              <div className="flex items-center gap-2"><Calendar size={16} className="text-gold-500"/><span>{new Date(event.date).toLocaleDateString('fr-FR')}</span></div>
              <div className="flex items-center gap-2"><Clock size={16} className="text-gold-500"/><span>{new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
          </div>
          <p className="text-gray-500 text-sm line-clamp-2 mb-6">{event.description || "Rejoignez-nous."}</p>
          <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">Fermer</button>
              <button onClick={onBook} className="flex-[2] py-3 bg-primary-900 text-white font-bold rounded-xl hover:bg-gold-500 hover:text-primary-900 transition-all shadow-lg flex items-center justify-center gap-2"><ArrowRight size={18}/> En savoir plus</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- VALEURS PAR DÉFAUT ---
const DEFAULT_CONTENT = {
  slides: [
    { id: 1, image: "", badge: "Bienvenue au Daara", title: "La Science est une Lumière", subtitle: "Héritier d’une lumière spirituelle...", cta: "Découvrir le Daara", link: "about" },
    { id: 2, image: "", badge: "Éducation & Excellence", title: "Servir le Coran", subtitle: "Un abreuvoir de connaissances.", cta: "Voir les Enseignements", link: "/livres" },
    { id: 3, image: "", badge: "Communauté & Partage", title: "Au Service de l'Humanité", subtitle: "Un sanctuaire d'inspiration.", cta: "Faire un Don", link: "/don" }
  ],
  about: { title1: "Biographie", highlight1: "foi", title2: "et au", highlight2: "savoir", text1: "...", text2: "...", image: "", bioPdf: "" },
  pillars: {
    p1: { image: "", label: "Agenda", desc: "Événements à venir", link: "/evenements" },
    p2: { image: "", label: "Bibliothèque", desc: "Ouvrages numériques", link: "/livres" },
    p3: { image: "", label: "Médiathèque", desc: "Podcasts et Vidéos", link: "/podcast" }
  },
  quote: { text: "...", title: "..." },
  info: { address: "...", hours: "...", nextGamou: "...", phone: "...", contactName: "..." }
};

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(true); 
  const [isPWAOpen, setIsPWAOpen] = useState(false);
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [isBioOpen, setIsBioOpen] = useState(false);

  // ✅ DÉTECTION DU MODE PWA AU CHARGEMENT
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setShowInstallBanner(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resHome, resEvents] = await Promise.all([API.get('/api/home-content'), API.get('/api/events')]);
        if (resHome.data) setContent(prev => ({ ...prev, ...resHome.data }));
        const upcoming = (resEvents.data || []).filter(e => new Date(e.date) > new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
        if (upcoming[0]) {
            setFeaturedEvent(upcoming[0]);
            const stored = JSON.parse(localStorage.getItem('home_popup_log') || '{}');
            if (stored.eventId !== upcoming[0]._id) setTimeout(() => setShowPopup(true), 2500); 
        }
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => { if(content.slides?.length > 0) setCurrentSlide((prev) => (prev + 1) % content.slides.length); }, 6000); 
    return () => clearInterval(timer);
  }, [content.slides]);

  const handleClosePopup = () => {
      setShowPopup(false);
      if (featuredEvent) localStorage.setItem('home_popup_log', JSON.stringify({ eventId: featuredEvent._id, lastSeenDate: new Date().toDateString() }));
  };

  const fadeInUp = { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };
  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 overflow-x-hidden">
      
      {/* 1. BANNIÈRE D'INSTALLATION (STICKY TOP) */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div exit={{ height: 0, opacity: 0 }} className="bg-primary-950 text-white py-3 px-4 md:px-8 flex items-center justify-between border-b border-white/5 relative z-[60] shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-inner">
                <img src="/logo.png" className="w-full h-full object-contain" alt="Logo" />
              </div>
              <div className="text-left">
                <h2 className="text-[11px] md:text-sm font-black uppercase tracking-tighter leading-none">Daara App</h2>
                <p className="text-[9px] md:text-[10px] text-primary-400 font-bold uppercase tracking-widest mt-1">Installation iOS / Android</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsPWAOpen(true)} className="bg-gold-500 text-primary-900 px-5 py-2 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg active:scale-95 flex items-center gap-2">
                Installer <Download size={14} />
              </button>
              <button onClick={() => setShowInstallBanner(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors text-primary-400"><X size={18}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NotificationBanner />

      <AnimatePresence>{showPopup && featuredEvent && <EventPopup event={featuredEvent} onClose={handleClosePopup} onBook={() => { handleClosePopup(); navigate('/evenements'); }} />}</AnimatePresence>
      <AnimatePresence>{isBioOpen && <PdfPopup url={content.about.bioPdf} onClose={() => setIsBioOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{isPWAOpen && <PWAInstallGuide isOpen={isPWAOpen} onClose={() => setIsPWAOpen(false)} />}</AnimatePresence>

      {/* 2. HERO SLIDER */}
      <div className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-primary-900">
        <AnimatePresence mode='wait'>
          <motion.div key={content.slides[currentSlide]?.id} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="absolute inset-0 z-0">
            {getSecureUrl(content.slides[currentSlide]?.image) ? <img src={getOptimizedImage(getSecureUrl(content.slides[currentSlide]?.image), 1000)} alt="Hero" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary-900 flex items-center justify-center"><div className="text-primary-800 opacity-20 transform scale-[5]"><Star /></div></div>}
            <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 via-primary-900/50 to-primary-900"></div>
          </motion.div>
        </AnimatePresence>
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-6">
          <AnimatePresence mode='wait'>
            <motion.div key={content.slides[currentSlide]?.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/50 bg-gold-500/10 text-gold-400 text-xs font-bold uppercase tracking-widest backdrop-blur-sm mb-6"><Star size={12} className="fill-gold-400"/> {content.slides[currentSlide]?.badge}</div>
              <h1 className="text-4xl md:text-7xl font-serif font-bold text-white leading-tight mb-6">{content.slides[currentSlide]?.title}</h1>
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed mb-8">{content.slides[currentSlide]?.subtitle}</p>
              <button onClick={() => { const link = content.slides[currentSlide]?.link; if (link?.startsWith('/')) navigate(link); else document.getElementById(link)?.scrollIntoView({ behavior: 'smooth' }); }} className="px-8 py-4 bg-gold-500 text-primary-950 rounded-full font-bold shadow-lg transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 mx-auto uppercase text-xs tracking-widest">{content.slides[currentSlide]?.cta} <ArrowRight size={20}/></button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 3. BIOGRAPHIE */}
      <section id="about" className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeInUp} className="relative">
            <div className="absolute inset-0 bg-gold-500 rounded-[2rem] opacity-20 rotate-3 translate-x-2 translate-y-2"></div>
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl h-[500px] bg-primary-900 flex items-center justify-center">
              {getSecureUrl(content.about.image) ? <img src={getOptimizedImage(getSecureUrl(content.about.image), 600)} alt="Serigne Mor" className="w-full h-full object-cover opacity-90" /> : <ImagePlaceholder label="Portrait" />}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 text-white"><p className="text-gold-400 font-bold uppercase tracking-wider text-xs mb-1">Guide Spirituel</p><h3 className="text-3xl font-serif font-bold">Serigne Mor Diop</h3></div>
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="space-y-6">
            <h2 className="text-4xl font-serif font-bold text-primary-900 leading-tight">{content.about.title1}</h2>
            <p className="text-gray-600 text-lg leading-relaxed">{content.about.text1}</p>
            {content.about.bioPdf && (
              <button onClick={() => setIsBioOpen(true)} className="inline-flex items-center gap-4 bg-white border-2 border-primary-100 px-8 py-5 rounded-[2rem] shadow-sm hover:shadow-xl transition-all">
                <span className="font-bold text-sm uppercase tracking-widest text-primary-900">Lire la Biographie</span>
                <div className="p-3 bg-primary-900 text-white rounded-2xl"><FileText size={20}/></div>
              </button>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* 4. LES PILIERS */}
      <section className="bg-primary-900 text-white py-24 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Explorez le Daara</h2>
            <p className="text-primary-200 text-lg">Services et ressources spirituelles.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {['p1', 'p2', 'p3'].map((id) => (
              <motion.div key={id} variants={fadeInUp} whileHover={{ y: -10 }} onClick={() => navigate(content.pillars[id]?.link)} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden cursor-pointer p-8 group">
                <div className="h-48 relative overflow-hidden rounded-2xl mb-6">
                  {getSecureUrl(content.pillars[id]?.image) ? <img src={getOptimizedImage(getSecureUrl(content.pillars[id].image), 400)} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" /> : <ImagePlaceholder label={content.pillars[id]?.label} />}
                </div>
                <h3 className="text-2xl font-serif font-bold mb-2">{content.pillars[id]?.label}</h3>
                <p className="text-primary-200 text-sm mb-6">{content.pillars[id]?.desc}</p>
                <span className="text-gold-400 font-bold text-sm flex items-center gap-2 group-hover:gap-4 transition-all">Découvrir <ArrowRight size={16}/></span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CITATION */}
      <section className="py-24 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="max-w-5xl mx-auto bg-gold-50 rounded-[3rem] p-8 md:p-16 text-center relative overflow-hidden shadow-xl">
          <Quote className="absolute top-10 left-10 text-gold-200 w-24 h-24 -scale-x-100 opacity-50" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary-900 mb-8 italic">{content.quote?.title}</h2>
            <p className="text-xl md:text-2xl text-gray-700 font-medium max-w-2xl mx-auto leading-relaxed">{content.quote?.text}</p>
          </div>
        </motion.div>
      </section>

      {/* 6. INFOS PRATIQUES / FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div><h4 className="font-bold text-lg text-primary-900 mb-4 flex items-center gap-2"><MapPin className="text-gold-500"/> Adresse</h4><p className="text-gray-600 whitespace-pre-line">{content.info.address}</p></div>
            <div><h4 className="font-bold text-lg text-primary-900 mb-4 flex items-center gap-2"><Clock className="text-gold-500"/> Horaires</h4><p className="text-gray-600 whitespace-pre-line">{content.info.hours}</p></div>
            <div><h4 className="font-bold text-lg text-primary-900 mb-4 flex items-center gap-2"><Calendar className="text-gold-500"/> Prochain Gamou</h4><p className="text-gray-600 whitespace-pre-line text-gold-600 font-bold">{content.info.nextGamou}</p></div>
            <div className="bg-primary-50 p-4 rounded-xl border border-primary-100"><p className="text-sm text-primary-800 font-bold mb-2">Besoin d'aide ?</p><p className="text-2xl font-bold text-primary-900 whitespace-pre-line">{content.info.phone}</p></div>
        </div>
      </footer>
    </div>
  );
}