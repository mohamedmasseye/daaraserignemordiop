import React, { useState, useEffect } from 'react';
import API from '../../services/api'; // ✅ Utilise l'instance sécurisée
import { 
  Save, Layout, BookOpen, Image as ImageIcon, Type, Info, 
  Plus, Trash2, ExternalLink, UploadCloud, Loader, Tag, AlignLeft, MapPin, Phone,User,FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout'; 

const DEFAULT_CONTENT = {
  slides: [
    { id: 1, image: "", badge: "Bienvenue", title: "Titre", subtitle: "Sous-titre", cta: "Découvrir", link: "about" }
  ],
  about: { title1: "", highlight1: "", title2: "", highlight2: "", text1: "", text2: "", image: "",bioPdf: "" },
  pillars: { shopImage: "", libraryImage: "", mediaImage: "" },
  quote: { text: "", title: "" },
  info: { address: "", hours: "", nextGamou: "", phone: "", contactName: "" }
};

export default function AdminHome() {
  const [content, setContent] = useState(null);
  const [activeTab, setActiveTab] = useState('slides');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Style pour les champs bien encadrés
  const inputStyle = "w-full mt-1 p-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none font-bold transition-all duration-200";

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const res = await API.get('/api/home-content');
        if (res.data && Object.keys(res.data).length > 0) {
          setContent({ ...DEFAULT_CONTENT, ...res.data,about: { ...DEFAULT_CONTENT.about, ...res.data.about } });
        } else {
          setContent(DEFAULT_CONTENT);
        }
      } catch (err) {
        console.error("Erreur chargement contenu:", err);
        setContent(DEFAULT_CONTENT);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    try {
      await API.post('/api/home-content', content); // ✅ Token automatique
      setHasChanges(false);
      alert("✅ Page d'accueil mise à jour !");
    } catch (err) {
      alert("Erreur lors de la sauvegarde.");
    }
  };

  const handleImageUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      document.body.style.cursor = 'wait';
      const res = await API.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.url) {
        callback(res.data.url);
        setHasChanges(true);
      }
    } catch (err) {
      alert("Erreur d'upload.");
    } finally {
      document.body.style.cursor = 'default';
    }
  };

  const updateSection = (section, key, value) => {
    setContent(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
    setHasChanges(true);
  };

  const updateSlide = (index, key, value) => {
    const newSlides = [...content.slides];
    newSlides[index][key] = value;
    setContent(prev => ({ ...prev, slides: newSlides }));
    setHasChanges(true);
  };

  if (isLoading) return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-96 text-primary-900">
        <Loader className="animate-spin mb-4" size={48} />
        <p className="font-bold uppercase tracking-widest text-xs">Chargement du temple...</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto pb-20">
        
        {/* HEADER FIXE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 sticky top-0 bg-gray-50/90 backdrop-blur-md py-4 z-20 border-b-2 border-gray-100">
          <div>
            <h1 className="text-4xl font-serif font-bold text-primary-900 flex items-center gap-4">
              <div className="p-3 bg-gold-500 rounded-2xl text-white shadow-lg"><Layout size={32}/></div>
              Éditeur Accueil
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Modifiez l'apparence du site en temps réel.</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={!hasChanges}
            className={`px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl transition-all flex items-center gap-3 active:scale-95 ${hasChanges ? 'bg-green-600 text-white hover:bg-green-700 animate-pulse' : 'bg-gray-200 text-gray-400'}`}
          >
            <Save size={20}/> Enregistrer les changements
          </button>
        </div>

        {/* NAVIGATION ONGLETS */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'slides', icon: Layout, label: 'Slider Hero' },
            { id: 'about', icon: User, label: 'Biographie' },
            { id: 'pillars', icon: BookOpen, label: 'Sections' },
            { id: 'quote', icon: Type, label: 'Citation' },
            { id: 'info', icon: Info, label: 'Contact' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-2xl flex items-center gap-2 whitespace-nowrap transition-all text-xs font-black uppercase tracking-widest ${activeTab === tab.id ? 'bg-primary-900 text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-100 border-2 border-gray-100'}`}
            >
               {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-gray-50 p-10 min-h-[500px]">
          
          {/* 1. SLIDES */}
          {activeTab === 'slides' && (
            <div className="space-y-10">
              <div className="flex justify-between items-center border-b-2 border-gray-50 pb-6">
                  <h3 className="font-bold text-2xl text-primary-900">Carrousel Principal</h3>
                  <button onClick={() => setContent(prev => ({...prev, slides: [...prev.slides, { id: Date.now(), title: "Nouveau", subtitle: "...", image: "", badge: "Info", cta: "Voir", link: "/" }]}))} className="bg-primary-50 text-primary-900 px-6 py-3 rounded-xl hover:bg-primary-100 font-bold text-sm flex items-center gap-2 transition-all"><Plus size={18}/> Ajouter un Slide</button>
              </div>
              
              {content.slides.map((slide, index) => (
                <div key={slide.id} className="border-2 border-gray-100 rounded-[2rem] p-8 bg-gray-50/50 hover:border-gold-400 transition-colors relative group">
                   <button onClick={() => setContent(prev => ({...prev, slides: prev.slides.filter((_, i) => i !== index)}))} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 transition"><Trash2 size={24}/></button>
                   
                   <div className="grid lg:grid-cols-12 gap-10">
                      <div className="lg:col-span-4 space-y-4">
                          <div className="h-56 bg-white rounded-[2rem] overflow-hidden border-2 border-dashed border-gray-200 relative group/img flex items-center justify-center shadow-inner">
                             {slide.image ? <img src={slide.image} className="w-full h-full object-cover" alt="Prev"/> : <ImageIcon size={48} className="text-gray-200" />}
                             <div className="absolute inset-0 bg-primary-900/60 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition cursor-pointer">
                                <UploadCloud className="text-white w-10 h-10 mb-2" />
                                <span className="text-white text-[10px] font-black uppercase">Changer l'image</span>
                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, (url) => updateSlide(index, 'image', url))} />
                             </div>
                          </div>
                      </div>

                      <div className="lg:col-span-8 space-y-6">
  <div className="grid grid-cols-3 gap-6"> {/* Changé de grid-cols-2 à 3 */}
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Badge</label>
      <input className={inputStyle} value={slide.badge} onChange={e => updateSlide(index, 'badge', e.target.value)} />
    </div>
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Texte Bouton (CTA)</label>
      <input className={`${inputStyle} text-primary-600`} value={slide.cta} onChange={e => updateSlide(index, 'cta', e.target.value)} placeholder="Ex: Nous contacter" />
    </div>
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Lien (Route)</label>
      <input className={inputStyle} value={slide.link} onChange={e => updateSlide(index, 'link', e.target.value)} />
    </div>
  </div>
  
  <div>
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Titre principal</label>
    <input className={`${inputStyle} font-serif text-lg`} value={slide.title} onChange={e => updateSlide(index, 'title', e.target.value)} />
  </div>
  
  <div>
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Sous-titre explicatif</label>
    <textarea className={`${inputStyle} h-24 resize-none`} value={slide.subtitle} onChange={e => updateSlide(index, 'subtitle', e.target.value)} />
  </div>
</div>
                   </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. PRÉSENTATION (ABOUT) */}
          {activeTab === 'about' && (
             <div className="space-y-8">
                <h3 className="font-bold text-2xl text-primary-900 border-b-2 border-gray-50 pb-6">Biographie du Maître</h3>
                <div className="grid lg:grid-cols-2 gap-12">
                   <div className="space-y-4 text-center">
                      <div className="h-96 w-full rounded-[3rem] border-4 border-gray-50 bg-gray-50 flex items-center justify-center overflow-hidden relative group shadow-2xl">
                         {content.about.image ? <img src={content.about.image} className="w-full h-full object-cover" alt="Portrait"/> : <ImageIcon size={64} className="text-gray-200"/>}
                         <div className="absolute inset-0 bg-primary-900/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white cursor-pointer">
                            <UploadCloud size={40} className="mb-2"/>
                            <span className="font-black text-xs uppercase">Téléverser le portrait</span>
                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, (url) => updateSection('about', 'image', url))} />
                         </div>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <input className={inputStyle} placeholder="Ligne 1" value={content.about.title1} onChange={e => updateSection('about', 'title1', e.target.value)} />
                        <input className={`${inputStyle} text-gold-600`} placeholder="Mot Clé 1" value={content.about.highlight1} onChange={e => updateSection('about', 'highlight1', e.target.value)} />
                      </div>
                      <textarea className={`${inputStyle} h-40 font-medium`} placeholder="Paragraphe de début..." value={content.about.text1} onChange={e => updateSection('about', 'text1', e.target.value)} />
                      <textarea className={`${inputStyle} h-40 font-medium`} placeholder="Paragraphe de fin..." value={content.about.text2} onChange={e => updateSection('about', 'text2', e.target.value)} />
                   </div>
                </div>
                <div className="mt-10 p-8 border-2 border-dashed border-gray-200 rounded-[2rem] bg-gray-50/50">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-red-100 text-red-600 rounded-xl"><FileText size={24}/></div>
        <div>
          <h4 className="font-bold text-primary-900">Document de Biographie complet</h4>
          <p className="text-xs text-gray-500">Téléversez un fichier PDF (Curriculum, biographie détaillée...)</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex-1 relative h-16 bg-white border-2 border-gray-100 rounded-2xl flex items-center px-6 overflow-hidden">
           <span className="text-sm font-medium text-gray-400 truncate">
             {content.about.bioPdf ? "📄 Document lié : " + content.about.bioPdf.split('/').pop() : "Aucun fichier PDF sélectionné"}
           </span>
           <input 
             type="file" 
             accept="application/pdf" 
             className="absolute inset-0 opacity-0 cursor-pointer" 
             onChange={(e) => handleImageUpload(e, (url) => updateSection('about', 'bioPdf', url))} 
           />
        </div>
        {content.about.bioPdf && (
          <button 
            onClick={() => updateSection('about', 'bioPdf', "")}
            className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"
          >
            <Trash2 size={20}/>
          </button>
        )}
      </div>
    </div>
             </div>
          )}

          {/* 3. PILIERS (SERVICES) */}
          {activeTab === 'pillars' && (
             <div className="space-y-8">
                <h3 className="font-bold text-2xl text-primary-900 border-b-2 border-gray-50 pb-6">Images des sections</h3>
                <div className="grid md:grid-cols-3 gap-8">
                   {[
                     { key: 'shopImage', label: 'Boutique' },
                     { key: 'libraryImage', label: 'Bibliothèque' },
                     { key: 'mediaImage', label: 'Médiathèque' }
                   ].map((item) => (
                       <div key={item.key} className="space-y-4">
                          <label className="font-black text-[10px] text-gray-400 uppercase tracking-widest ml-1">{item.label}</label>
                          <div className="h-64 bg-gray-50 rounded-[2rem] overflow-hidden border-2 border-dashed border-gray-200 relative group flex items-center justify-center shadow-inner hover:border-primary-500 transition-colors">
                             {content.pillars[item.key] ? <img src={content.pillars[item.key]} className="w-full h-full object-cover" alt=""/> : <ImageIcon className="text-gray-200" size={40}/>}
                             <div className="absolute inset-0 bg-primary-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white cursor-pointer">
                                <span className="font-black text-xs uppercase">Remplacer</span>
                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, (url) => updateSection('pillars', item.key, url))} />
                             </div>
                          </div>
                       </div>
                   ))}
                </div>
             </div>
          )}

          {/* 4. CITATION */}
          {activeTab === 'quote' && (
             <div className="space-y-8">
                <h3 className="font-bold text-2xl text-primary-900 border-b-2 border-gray-50 pb-6">Parole Sacrée</h3>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Titre ou Référence</label>
                  <input className={`${inputStyle} font-serif text-xl`} value={content.quote.title} onChange={e => updateSection('quote', 'title', e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Texte de la citation</label>
                  <textarea className={`${inputStyle} h-56 italic text-lg leading-relaxed`} value={content.quote.text} onChange={e => updateSection('quote', 'text', e.target.value)} />
                </div>
             </div>
          )}

          {/* 5. INFOS PRATIQUES */}
          {activeTab === 'info' && (
             <div className="space-y-8">
                <h3 className="font-bold text-2xl text-primary-900 border-b-2 border-gray-50 pb-6">Contact & Accès</h3>
                <div className="grid md:grid-cols-2 gap-8">
                   <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block flex items-center gap-2"><MapPin size={12}/> Adresse Physique</label>
                      <textarea className={`${inputStyle} h-32`} value={content.info.address} onChange={e => updateSection('info', 'address', e.target.value)} />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block flex items-center gap-2"><AlignLeft size={12}/> Horaires d'ouverture</label>
                      <textarea className={`${inputStyle} h-32`} value={content.info.hours} onChange={e => updateSection('info', 'hours', e.target.value)} />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Prochain grand événement</label>
                      <input className={inputStyle} placeholder="Ex: Gamou 2026" value={content.info.nextGamou} onChange={e => updateSection('info', 'nextGamou', e.target.value)} />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block flex items-center gap-2"><Phone size={12}/> Téléphone de contact</label>
                      <input className={inputStyle} value={content.info.phone} onChange={e => updateSection('info', 'phone', e.target.value)} />
                   </div>
                </div>
             </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}