import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Save, Layout, BookOpen, Image as ImageIcon, Type, Info, 
  Plus, Trash2, ExternalLink, RotateCcw, UploadCloud, Loader
} from 'lucide-react';

import AdminLayout from './AdminLayout'; 

// --- 1. CONTENU PAR DÉFAUT (Structure de secours) ---
const DEFAULT_CONTENT = {
  slides: [
    { id: 1, image: "", badge: "Bienvenue au Daara", title: "La Science est une Lumière", subtitle: "Héritier d’une lumière spirituelle...", cta: "Découvrir", link: "about" }
  ],
  about: { title1: "Une vie dédiée", highlight1: "foi", title2: "et au", highlight2: "savoir", text1: "...", text2: "...", image: "" },
  pillars: { shopImage: "", libraryImage: "", mediaImage: "" },
  quote: { text: "...", title: "..." },
  info: { address: "...", hours: "...", nextGamou: "...", phone: "...", contactName: "..." }
};

export default function AdminHome() {
  const [content, setContent] = useState(null); // Initialisé à null pour savoir quand le chargement est fini
  const [activeTab, setActiveTab] = useState('slides');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- 2. CHARGEMENT DEPUIS LE SERVEUR (MongoDB) ---
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        // On récupère les données réelles du serveur
        const res = await axios.get('/api/home-content');
        
        if (res.data && Object.keys(res.data).length > 0) {
          // On fusionne les données du serveur avec la structure par défaut (au cas où des champs manquent)
          setContent({ ...DEFAULT_CONTENT, ...res.data });
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

  // --- 3. SAUVEGARDE SUR LE SERVEUR ---
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token'); 
      await axios.post('/api/home-content', content, {
          headers: { Authorization: `Bearer ${token}` }
      });

      setHasChanges(false);
      alert("Modifications enregistrées sur le serveur !");
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
      alert("Erreur lors de la sauvegarde.");
    }
  };

  // --- 4. GESTION UPLOAD ---
  const handleImageUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      document.body.style.cursor = 'wait';
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` 
        }
      });

      if (res.data.url) {
        callback(res.data.url); // Met à jour l'image dans l'état local
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

  const addSlide = () => {
    setContent(prev => ({
      ...prev,
      slides: [...prev.slides, { id: Date.now(), title: "Nouveau", subtitle: "...", image: "", badge: "Info", cta: "Voir", link: "/" }]
    }));
    setHasChanges(true);
  };

  const removeSlide = (index) => {
    if (confirm("Supprimer ce slide ?")) {
      const newSlides = content.slides.filter((_, i) => i !== index);
      setContent(prev => ({ ...prev, slides: newSlides }));
      setHasChanges(true);
    }
  };

  // Ecran de chargement pendant que l'API répond
  if (isLoading) return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-96 text-primary-900">
        <Loader className="animate-spin mb-4" size={40} />
        <p className="font-bold">Chargement du contenu...</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="p-8 max-w-5xl mx-auto font-sans text-gray-900">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 sticky top-0 bg-gray-50/80 backdrop-blur-sm py-4 z-20 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 font-serif flex items-center gap-2">
              <Layout className="text-gold-500"/> Éditeur Page d'Accueil
            </h1>
            <p className="text-gray-500 text-sm">Les modifications seront visibles sur le site et l'app mobile.</p>
          </div>
          <div className="flex gap-2">
             <a href="/" target="_blank" className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 text-gray-600 hover:bg-white transition"><ExternalLink size={16}/> Voir site</a>
             <button 
               onClick={handleSave} 
               className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md ${hasChanges ? 'bg-green-600 text-white hover:bg-green-700 animate-pulse' : 'bg-gray-200 text-gray-400'}`}
             >
               <Save size={20}/> Enregistrer les changements
             </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'slides', icon: Layout, label: 'Slider Hero' },
            { id: 'about', icon: Type, label: 'Présentation' },
            { id: 'pillars', icon: BookOpen, label: 'Piliers/Services' },
            { id: 'quote', icon: Type, label: 'Citation' },
            { id: 'info', icon: Info, label: 'Infos Pratiques' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all text-sm font-medium ${activeTab === tab.id ? 'bg-primary-900 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
            >
              <tab.icon size={16}/> {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[500px]">
          
          {/* 1. SLIDES */}
          {activeTab === 'slides' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                 <h3 className="font-bold text-xl text-gray-800">Gestion du Carrousel</h3>
                 <button onClick={addSlide} className="text-sm bg-primary-100 text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-200 font-bold flex items-center gap-2 transition"><Plus size={16}/> Nouveau Slide</button>
              </div>
              
              {content.slides.map((slide, index) => (
                <div key={slide.id} className="border border-gray-200 rounded-xl p-6 bg-gray-50 relative group hover:border-gold-300 transition-colors">
                   <div className="absolute top-4 right-4 flex gap-2">
                      <span className="bg-white border border-gray-200 text-gray-600 text-xs px-2 py-1 rounded font-bold">Slide {index + 1}</span>
                      <button onClick={() => removeSlide(index)} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={20}/></button>
                   </div>
                   
                   <div className="grid md:grid-cols-12 gap-6">
                      <div className="md:col-span-4 space-y-3">
                          <div className="h-44 bg-gray-200 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 relative group/img flex items-center justify-center">
                             {slide.image ? (
                                <img src={slide.image} className="w-full h-full object-cover" alt="Aperçu"/>
                             ) : (
                                <div className="text-gray-400 flex flex-col items-center">
                                    <ImageIcon size={32} />
                                    <span className="text-xs mt-1">Aucune image</span>
                                </div>
                             )}
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition cursor-pointer">
                                <UploadCloud className="text-white w-8 h-8" />
                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, (url) => updateSlide(index, 'image', url))} />
                             </div>
                          </div>
                          <p className="text-[10px] text-center text-gray-400">Format recommandé : 1920x1080px</p>
                      </div>

                      <div className="md:col-span-8 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Badge</label>
                               <input className="w-full p-2 border rounded-lg text-sm" value={slide.badge} onChange={e => updateSlide(index, 'badge', e.target.value)} />
                            </div>
                            <div>
                               <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Lien du bouton</label>
                               <input className="w-full p-2 border rounded-lg text-sm" value={slide.link} onChange={e => updateSlide(index, 'link', e.target.value)} />
                            </div>
                          </div>
                          <div>
                             <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Titre</label>
                             <input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-serif" value={slide.title} onChange={e => updateSlide(index, 'title', e.target.value)} />
                          </div>
                          <div>
                             <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Sous-titre</label>
                             <textarea className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none h-16 resize-none text-sm" value={slide.subtitle} onChange={e => updateSlide(index, 'subtitle', e.target.value)} />
                          </div>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. PRÉSENTATION (ABOUT) */}
          {activeTab === 'about' && (
             <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 border-b pb-4">Biographie de Serigne Mor Diop</h3>
                <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Image Portrait</label>
                          <div className="h-64 w-full rounded-xl border-2 border-dashed bg-gray-50 flex items-center justify-center overflow-hidden relative group">
                             {content.about.image ? (
                                <img src={content.about.image} className="w-full h-full object-cover" alt="Prev"/>
                             ) : (
                                <ImageIcon size={40} className="text-gray-300"/>
                             )}
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold cursor-pointer">
                                Changer l'image
                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, (url) => updateSection('about', 'image', url))} />
                             </div>
                          </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input className="p-2 border rounded-lg" placeholder="Titre 1" value={content.about.title1} onChange={e => updateSection('about', 'title1', e.target.value)} />
                        <input className="p-2 border rounded-lg font-bold text-gold-600" placeholder="Highlight 1" value={content.about.highlight1} onChange={e => updateSection('about', 'highlight1', e.target.value)} />
                      </div>
                      <textarea className="w-full p-3 border rounded-xl h-32 text-sm" value={content.about.text1} onChange={e => updateSection('about', 'text1', e.target.value)} />
                      <textarea className="w-full p-3 border rounded-xl h-32 text-sm" value={content.about.text2} onChange={e => updateSection('about', 'text2', e.target.value)} />
                   </div>
                </div>
             </div>
          )}

          {/* 3. PILIERS */}
          {activeTab === 'pillars' && (
             <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 border-b pb-4">Images des sections (Piliers)</h3>
                <div className="grid md:grid-cols-3 gap-6">
                   {[
                     { key: 'shopImage', label: 'Boutique' },
                     { key: 'libraryImage', label: 'Bibliothèque' },
                     { key: 'mediaImage', label: 'Médiathèque' }
                   ].map((item) => (
                       <div key={item.key} className="space-y-2">
                          <label className="font-bold text-sm text-gray-700">{item.label}</label>
                          <div className="h-40 bg-gray-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-200 relative group flex items-center justify-center">
                             {content.pillars[item.key] ? (
                                <img src={content.pillars[item.key]} className="w-full h-full object-cover" alt={item.key}/>
                             ) : (
                                <ImageIcon className="text-gray-300" size={30}/>
                             )}
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold cursor-pointer">
                                Téléverser
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
             <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 border-b pb-4">Citation mise en avant</h3>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Titre de la citation</label>
                  <input className="w-full p-3 border rounded-xl font-serif text-xl" value={content.quote.title} onChange={e => updateSection('quote', 'title', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Texte</label>
                  <textarea className="w-full p-4 border rounded-xl h-40 italic text-gray-700" value={content.quote.text} onChange={e => updateSection('quote', 'text', e.target.value)} />
                </div>
             </div>
          )}

          {/* 5. INFOS PRATIQUES */}
          {activeTab === 'info' && (
             <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 border-b pb-4">Informations de contact et horaires</h3>
                <div className="grid md:grid-cols-2 gap-6">
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Adresse</label>
                      <textarea className="w-full p-3 border rounded-xl h-24" value={content.info.address} onChange={e => updateSection('info', 'address', e.target.value)} />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Horaires</label>
                      <textarea className="w-full p-3 border rounded-xl h-24" value={content.info.hours} onChange={e => updateSection('info', 'hours', e.target.value)} />
                   </div>
                   <input className="p-3 border rounded-xl" placeholder="Prochain Gamou" value={content.info.nextGamou} onChange={e => updateSection('info', 'nextGamou', e.target.value)} />
                   <input className="p-3 border rounded-xl" placeholder="Téléphone" value={content.info.phone} onChange={e => updateSection('info', 'phone', e.target.value)} />
                </div>
             </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}