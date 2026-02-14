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
          <div className="text-left"><span className="block font-bold font-serif text-lg leading-none">Biographie</span><span className="text-[10px] text-gold-400 font-black uppercase tracking-widest mt-1">Lecture Interactive</span></div>
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

// --- VALEURS PAR DÉFAUT ---
const DEFAULT_CONTENT = {
  slides: [{ id: 1, image: "", badge: "Bienvenue", title: "Daara SMD", subtitle: "Chargement...", cta: "Découvrir", link: "about" }],
  about: { title1: "Biographie", text1: "", bioPdf: "" },
  pillars: { p1: {}, p2: {}, p3: {} },
  quote: {}, info: {}
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
        if (upcoming[0]) setFeaturedEvent(upcoming[0]);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 overflow-x-hidden">
      
      {/* 1. BANNIÈRE D'INSTALLATION DYNAMIQUE */}
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

      <AnimatePresence>{isBioOpen && <PdfPopup url={content.about.bioPdf} onClose={() => setIsBioOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{isPWAOpen && <PWAInstallGuide isOpen={isPWAOpen} onClose={() => setIsPWAOpen(false)} />}</AnimatePresence>

      <div className="relative h-[90vh] bg-primary-900 flex items-center justify-center overflow-hidden">
          <div className="z-10 text-center text-white px-4">
              <h1 className="text-4xl md:text-7xl font-serif font-bold mb-4">{content.slides[0]?.title || "Daara SMD"}</h1>
              <p className="text-lg opacity-80 max-w-2xl mx-auto mb-8">{content.slides[0]?.subtitle || "La Science est une Lumière."}</p>
              <button onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-gold-500 text-primary-950 rounded-full font-bold uppercase tracking-widest text-xs">Découvrir le Daara</button>
          </div>
          <div className="absolute inset-0 bg-black/50 z-0"></div>
      </div>

      <section id="about" className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center text-center md:text-left">
          <div className="relative">
            <div className="absolute inset-0 bg-gold-500 rounded-[2rem] opacity-20 rotate-3 translate-x-2 translate-y-2"></div>
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl h-[500px] bg-primary-900 flex items-center justify-center">
              {getSecureUrl(content.about.image) ? <img src={getOptimizedImage(getSecureUrl(content.about.image), 600)} alt="Serigne Mor" className="w-full h-full object-cover opacity-90" /> : <ImagePlaceholder label="Portrait" />}
              <div className="absolute bottom-0 left-0 p-8 text-white"><p className="text-gold-400 font-bold uppercase tracking-wider text-xs mb-1">Guide Spirituel</p><h3 className="text-3xl font-serif font-bold">Serigne Mor Diop</h3></div>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-serif font-bold text-primary-900 leading-tight">{content.about.title1}</h2>
            <p className="text-gray-600 text-lg leading-relaxed">{content.about.text1}</p>
            {content.about.bioPdf && (
              <button onClick={() => setIsBioOpen(true)} className="inline-flex items-center gap-4 bg-white border-2 border-primary-100 px-8 py-5 rounded-[2rem] shadow-sm hover:shadow-xl transition-all">
                <span className="font-bold text-sm uppercase tracking-widest text-primary-900">Lire la Biographie</span>
                <div className="p-3 bg-primary-900 text-white rounded-2xl"><FileText size={20}/></div>
              </button>
            )}
          </div>
        </div>
      </section>

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