import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Save, Layout, BookOpen, Image as ImageIcon, Type, Info, 
  Plus, Trash2, ExternalLink, RotateCcw, UploadCloud 
} from 'lucide-react';

// Assurez-vous que ce chemin est correct selon votre structure
import AdminLayout from './AdminLayout'; 

// --- 1. CONTENU PAR DÉFAUT (VIDE D'IMAGES) ---
const DEFAULT_CONTENT = {
  slides: [
    {
      id: 1,
      image: "", // Vide par défaut
      badge: "Bienvenue au Daara",
      title: "La Science est une Lumière",
      subtitle: "Héritier d’une lumière spirituelle et bâtisseur d’un héritage intemporel.",
      cta: "Découvrir le Daara",
      link: "about"
    },
    {
      id: 2,
      image: "", // Vide
      badge: "Éducation & Excellence",
      title: "Servir le Coran",
      subtitle: "Un abreuvoir où chacun peut étancher sa soif de connaissances.",
      cta: "Voir les Enseignements",
      link: "/livres"
    },
    {
      id: 3,
      image: "", // Vide
      badge: "Communauté & Partage",
      title: "Au Service de l'Humanité",
      subtitle: "Un sanctuaire où chaque échange devient une source d’inspiration.",
      cta: "Faire un Don",
      link: "/don"
    }
  ],
  about: {
    title1: "Une vie dédiée à la",
    highlight1: "foi",
    title2: "et au",
    highlight2: "savoir",
    text1: "Figure éminente de l’islam au Sénégal et pilier de la Tariqa Tidjaniyya, Serigne Mor Diop incarne l’excellence dans la transmission du savoir.",
    text2: "Fils cadet de Serigne Alioune Diop « Jubbal », il a su transformer chaque pas de sa vie en une leçon d'humilité.",
    image: "" // Vide
  },
  pillars: {
    shopImage: "",    // Vide
    libraryImage: "", // Vide
    mediaImage: ""    // Vide
  },
  quote: {
    text: "Servir le Coran, c’est servir l’humanité. Votre soutien permet de perpétuer cet héritage de lumière.",
    title: "« Ligueyal Al Qur’ran »"
  },
  info: {
    address: "Parcelles Assainies U25, Villa N169, Dakar, Sénégal",
    hours: "Daara ouvert 24h/24, 7j/7.\nRéception Serigne Mor : Tlj sauf Vendredi.",
    nextGamou: "Dernier samedi avant Ramadan",
    phone: "77 559 20 28",
    contactName: "Oumar Faroukh Diop"
  }
};

export default function AdminHome() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [activeTab, setActiveTab] = useState('slides');
  const [hasChanges, setHasChanges] = useState(false);

  // --- CHARGEMENT API (Prioritaire) ou LocalStorage ---
  useEffect(() => {
    // On essaie d'abord de charger depuis l'API (MongoDB)
    // Si l'API est vide, on prend les DEFAULT_CONTENT vides
    const fetchContent = async () => {
        // ... (Logique API ici si vous l'avez ajoutée)
        // Pour l'instant, on simule le chargement localStorage comme avant pour ne pas casser
        const stored = localStorage.getItem('daara_home_content');
        if (stored) {
            const parsed = JSON.parse(stored);
            setContent({ ...DEFAULT_CONTENT, ...parsed });
        }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
  try {
    // 1. Sauvegarde Locale (Backup rapide)
    localStorage.setItem('daara_home_content', JSON.stringify(content));

    // 2. Sauvegarde Serveur (LA VRAIE SAUVEGARDE)
    // On récupère le token pour avoir le droit d'écrire
    const token = localStorage.getItem('token'); 
    
    // On envoie les données à votre backend (sur Render)
    await axios.post('/api/home-content', content, {
        headers: { Authorization: `Bearer ${token}` }
    });

    setHasChanges(false);
    alert("Modifications enregistrées et publiées en ligne !");
    window.dispatchEvent(new Event('storage'));

  } catch (err) {
    console.error("Erreur sauvegarde:", err);
    alert("Erreur lors de la sauvegarde sur le serveur.");
  }
};

  const handleReset = () => {
    if(confirm("Attention : Cela va remettre le contenu par défaut (sans images). Continuer ?")) {
      setContent(DEFAULT_CONTENT);
      localStorage.setItem('daara_home_content', JSON.stringify(DEFAULT_CONTENT));
      setHasChanges(false);
      window.dispatchEvent(new Event('storage'));
    }
  };

  // --- GESTION UPLOAD ---
// Remplacez votre fonction handleImageUpload existante par celle-ci :
const handleImageUpload = async (e, callback) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file); // 'file' doit correspondre au backend

  try {
    document.body.style.cursor = 'wait';
    const token = localStorage.getItem('token'); // Récupère votre jeton admin

    // Utilisation d'Axios pour envoyer le fichier avec les bons en-têtes
    const res = await axios.post('/api/upload', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}` 
      }
    });

    if (res.data.url) {
      callback(res.data.url); // Met à jour l'image dans l'éditeur
      setHasChanges(true);
    }
  } catch (err) {
    console.error("Erreur upload:", err);
    alert("L'upload a échoué. Vérifiez votre connexion ou la taille du fichier.");
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

  return (
    <AdminLayout>
      <div className="p-8 max-w-5xl mx-auto font-sans text-gray-900">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 sticky top-0 bg-gray-50 py-4 z-20 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 font-serif flex items-center gap-2">
              <Layout className="text-gold-500"/> Éditeur Page d'Accueil
            </h1>
            <p className="text-gray-500 text-sm">Gérez le contenu visible par vos visiteurs.</p>
          </div>
          <div className="flex gap-2">
             <button onClick={handleReset} className="px-3 py-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1 transition" title="Réinitialiser (Vider)">
               <RotateCcw size={18}/>
             </button>
             <a href="/" target="_blank" className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 text-gray-600 hover:bg-white transition"><ExternalLink size={16}/> Voir site</a>
             <button 
               onClick={handleSave} 
               disabled={!hasChanges}
               className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md ${hasChanges ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
             >
               <Save size={20}/> {hasChanges ? 'Enregistrer' : 'À jour'}
             </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'slides', icon: Layout, label: 'Carrousel (Hero)' },
            { id: 'about', icon: Type, label: 'Présentation' },
            { id: 'pillars', icon: BookOpen, label: 'Piliers' },
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
                 <h3 className="font-bold text-xl text-gray-800">Diapositives ({content.slides.length})</h3>
                 <button onClick={addSlide} className="text-sm bg-primary-100 text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-200 font-bold flex items-center gap-2 transition"><Plus size={16}/> Ajouter</button>
              </div>
              
              {content.slides.map((slide, index) => (
                <div key={slide.id} className="border border-gray-200 rounded-xl p-6 bg-gray-50 relative group hover:border-gold-300 transition-colors">
                   <div className="absolute top-4 right-4 flex gap-2">
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded font-bold">Slide {index + 1}</span>
                      <button onClick={() => removeSlide(index)} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={20}/></button>
                   </div>
                   
                   <div className="grid md:grid-cols-12 gap-6">
                      {/* Image Preview & Upload */}
                      <div className="md:col-span-4 space-y-3">
                          <div className="h-40 bg-gray-200 rounded-lg overflow-hidden border border-gray-300 relative group/img flex items-center justify-center">
                             {slide.image ? (
                                <img src={slide.image} className="w-full h-full object-cover" alt="Aperçu"/>
                             ) : (
                                <div className="text-gray-400 flex flex-col items-center">
                                    <ImageIcon size={32} />
                                    <span className="text-xs mt-1">Aucune image</span>
                                </div>
                             )}
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition">
                                <UploadCloud className="text-white w-8 h-8" />
                             </div>
                          </div>
                          <div className="relative">
                             <input 
                               type="file" accept="image/*"
                               className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                               onChange={(e) => handleImageUpload(e, (url) => updateSlide(index, 'image', url))} 
                             />
                          </div>
                      </div>

                      {/* Contenu Texte */}
                      <div className="md:col-span-8 space-y-4">
                          <div>
                             <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Titre Principal</label>
                             <input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-serif text-lg" value={slide.title} onChange={e => updateSlide(index, 'title', e.target.value)} />
                          </div>
                          <div>
                             <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Sous-titre / Description</label>
                             <textarea className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none h-20 resize-none" value={slide.subtitle} onChange={e => updateSlide(index, 'subtitle', e.target.value)} />
                          </div>
                          {/* ... reste des inputs inchangés ... */}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. PRÉSENTATION */}
          {activeTab === 'about' && (
             <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 border-b pb-4">Section "Biographie"</h3>
                <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Image Portrait</label>
                          <input 
                            type="file" accept="image/*"
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 mb-2"
                            onChange={(e) => handleImageUpload(e, (url) => updateSection('about', 'image', url))} 
                          />
                          <div className="h-48 w-full rounded-xl mt-2 border bg-gray-100 flex items-center justify-center overflow-hidden">
                             {content.about.image ? (
                                <img src={content.about.image} className="w-full h-full object-cover" alt="Prev"/>
                             ) : (
                                <div className="text-gray-400 flex flex-col items-center"><ImageIcon size={32}/><span className="text-xs">Pas d'image</span></div>
                             )}
                          </div>
                      </div>
                      {/* ... inputs titres inchangés ... */}
                   </div>
                   {/* ... textareas inchangés ... */}
                </div>
             </div>
          )}

          {/* 3. PILIERS */}
          {activeTab === 'pillars' && (
             <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 border-b pb-4">Images des Sections</h3>
                <div className="grid md:grid-cols-3 gap-6">
                   {['shopImage', 'libraryImage', 'mediaImage'].map((key, idx) => (
                       <div key={key} className="space-y-2">
                          <label className="font-bold text-sm text-gray-700">Carte {idx === 0 ? 'Boutique' : idx === 1 ? 'Bibliothèque' : 'Médiathèque'}</label>
                          <div className="h-32 bg-gray-100 rounded-lg overflow-hidden border mb-2 flex items-center justify-center">
                             {content.pillars[key] ? (
                                <img src={content.pillars[key]} className="w-full h-full object-cover" alt={key}/>
                             ) : (
                                <ImageIcon className="text-gray-300"/>
                             )}
                          </div>
                          <input 
                            type="file" accept="image/*"
                            className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-gray-100"
                            onChange={(e) => handleImageUpload(e, (url) => updateSection('pillars', key, url))} 
                          />
                       </div>
                   ))}
                </div>
             </div>
          )}
          
          {/* ... Tabs Quote et Info restent inchangés ... */}
          {activeTab === 'quote' && (
             <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 border-b pb-4">Citation</h3>
                <input className="w-full p-3 border rounded-xl" value={content.quote.title} onChange={e => updateSection('quote', 'title', e.target.value)} />
                <textarea className="w-full p-3 border rounded-xl h-24" value={content.quote.text} onChange={e => updateSection('quote', 'text', e.target.value)} />
             </div>
          )}

          {activeTab === 'info' && (
             <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 border-b pb-4">Pied de page</h3>
                {/* ... inputs infos inchangés ... */}
             </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}