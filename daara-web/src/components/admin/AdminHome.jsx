import React, { useState, useEffect } from 'react';
import { 
  Save, Layout, BookOpen, Image as ImageIcon, Type, Info, 
  Plus, Trash2, ExternalLink, RotateCcw, UploadCloud 
} from 'lucide-react';

// --- CORRECTION DU CHEMIN D'IMPORT ---
import AdminLayout from './AdminLayout'; 

// Structure par défaut (Identique à Home.jsx pour init)
const DEFAULT_CONTENT = {
  slides: [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1000&auto=format&fit=crop",
      badge: "Bienvenue au Daara",
      title: "La Science est une Lumière",
      subtitle: "Héritier d’une lumière spirituelle et bâtisseur d’un héritage intemporel.",
      cta: "Découvrir le Daara",
      link: "about"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1576764402988-7143f6cca974?auto=format&fit=crop&q=80&w=2000",
      badge: "Éducation & Excellence",
      title: "Servir le Coran",
      subtitle: "Un abreuvoir où chacun peut étancher sa soif de connaissances.",
      cta: "Voir les Enseignements",
      link: "/livres"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=2000&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1542300058-b94b8ab7411b?q=80&w=800&auto=format&fit=crop"
  },
  pillars: {
    shopImage: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1000&auto=format&fit=crop",
    libraryImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop",
    mediaImage: "https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?q=80&w=1000&auto=format&fit=crop"
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

  // Charger les données
  useEffect(() => {
    const stored = localStorage.getItem('daara_home_content');
    if (stored) {
      const parsed = JSON.parse(stored);
      setContent({ ...DEFAULT_CONTENT, ...parsed });
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('daara_home_content', JSON.stringify(content));
    setHasChanges(false);
    alert("Page d'accueil mise à jour avec succès !");
    // Déclenche un événement pour que le frontend se mette à jour sans recharger
    window.dispatchEvent(new Event('storage'));
  };

  const handleReset = () => {
    if(confirm("Attention : Cela va effacer toutes vos modifications et remettre le contenu par défaut. Continuer ?")) {
      setContent(DEFAULT_CONTENT);
      localStorage.setItem('daara_home_content', JSON.stringify(DEFAULT_CONTENT));
      setHasChanges(false);
      window.dispatchEvent(new Event('storage'));
    }
  };

  // --- GESTION DE L'UPLOAD IMAGE (Base64 pour localStorage) ---
 // --- NOUVELLE GESTION UPLOAD (Vers Serveur) ---
const handleImageUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. On prépare l'envoi
    const formData = new FormData();
    formData.append('file', file);

    try {
        // 2. On envoie au serveur
        const token = localStorage.getItem('token');
        
        // Petit indicateur visuel (optionnel, on change le curseur)
        document.body.style.cursor = 'wait';

        const res = await fetch('http://https://daara-app.onrender.com/api/upload', {
            method: 'POST',
            body: formData,
            // Pas besoin de Content-Type pour FormData, fetch le fait tout seul
            // Mais si vous utilisez axios, c'est pareil. Ici j'utilise fetch pour faire simple.
        });

        const data = await res.json();
        
        if (data.url) {
            // 3. On reçoit l'URL (ex: http://https://daara-app.onrender.com/uploads/...)
            // C'est cette URL légère qu'on sauvegarde
            callback(data.url);
            setHasChanges(true);
        } else {
            alert("Erreur lors de l'upload de l'image.");
        }

    } catch (err) {
        console.error(err);
        alert("Erreur connexion serveur pour l'image.");
    } finally {
        document.body.style.cursor = 'default';
    }
};

  const updateSection = (section, key, value) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
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
      slides: [...prev.slides, { id: Date.now(), title: "Nouveau Slide", subtitle: "Description...", image: "", badge: "Nouveau", cta: "Voir", link: "/" }]
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
            <p className="text-gray-500 text-sm">Personnalisez le contenu visible par vos visiteurs.</p>
          </div>
          <div className="flex gap-2">
             <button onClick={handleReset} className="px-3 py-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1 transition" title="Réinitialiser par défaut">
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
            { id: 'pillars', icon: BookOpen, label: 'Piliers & Images' },
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
                 <button onClick={addSlide} className="text-sm bg-primary-100 text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-200 font-bold flex items-center gap-2 transition"><Plus size={16}/> Ajouter un slide</button>
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
                          <div className="h-40 bg-gray-200 rounded-lg overflow-hidden border border-gray-300 relative group/img">
                             <img src={slide.image} className="w-full h-full object-cover" alt="Aperçu" onError={(e) => e.target.src = 'https://via.placeholder.com/400x200?text=Image+Invalide'}/>
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition">
                                <UploadCloud className="text-white w-8 h-8" />
                             </div>
                          </div>
                          <div className="relative">
                             <input 
                               type="file" 
                               accept="image/*"
                               className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                               onChange={(e) => handleImageUpload(e, (base64) => updateSlide(index, 'image', base64))} 
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
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Badge (Petit texte)</label>
                                <input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" value={slide.badge} onChange={e => updateSlide(index, 'badge', e.target.value)} />
                             </div>
                             <div>
                                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Texte Bouton</label>
                                <input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" value={slide.cta} onChange={e => updateSlide(index, 'cta', e.target.value)} />
                             </div>
                          </div>
                          <div>
                             <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Lien du bouton</label>
                             <input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-gray-600" placeholder="/livres ou #about" value={slide.link} onChange={e => updateSlide(index, 'link', e.target.value)} />
                          </div>
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
                           type="file" 
                           accept="image/*"
                           className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 mb-2"
                           onChange={(e) => handleImageUpload(e, (base64) => updateSection('about', 'image', base64))} 
                         />
                         <img src={content.about.image} className="h-48 w-full object-cover rounded-xl mt-2 border bg-gray-100" alt="Prev"/>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                         <p className="text-xs font-bold text-gray-500 uppercase mb-2">Structure du Titre</p>
                         <div className="space-y-2">
                           <input className="w-full p-2 border rounded" placeholder="Partie 1 (Ex: Une vie dédiée à la)" value={content.about.title1} onChange={e => updateSection('about', 'title1', e.target.value)} />
                           <input className="w-full p-2 border rounded text-gold-600 font-bold" placeholder="Mot clé 1 (Ex: foi)" value={content.about.highlight1} onChange={e => updateSection('about', 'highlight1', e.target.value)} />
                           <input className="w-full p-2 border rounded" placeholder="Partie 2 (Ex: et au)" value={content.about.title2} onChange={e => updateSection('about', 'title2', e.target.value)} />
                           <input className="w-full p-2 border rounded text-gold-600 font-bold" placeholder="Mot clé 2 (Ex: savoir)" value={content.about.highlight2} onChange={e => updateSection('about', 'highlight2', e.target.value)} />
                         </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">Paragraphe 1</label>
                         <textarea className="w-full p-3 border rounded-xl h-32 focus:ring-2 focus:ring-primary-500 outline-none" value={content.about.text1} onChange={e => updateSection('about', 'text1', e.target.value)} />
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">Paragraphe 2</label>
                         <textarea className="w-full p-3 border rounded-xl h-32 focus:ring-2 focus:ring-primary-500 outline-none" value={content.about.text2} onChange={e => updateSection('about', 'text2', e.target.value)} />
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* 3. PILIERS */}
          {activeTab === 'pillars' && (
             <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 border-b pb-4">Images des Sections (Cartes)</h3>
                <div className="grid md:grid-cols-3 gap-6">
                   <div className="space-y-2">
                      <label className="font-bold text-sm text-gray-700">Carte Boutique</label>
                      <div className="h-32 bg-gray-100 rounded-lg overflow-hidden border mb-2">
                        <img src={content.pillars.shopImage} className="w-full h-full object-cover" alt="Shop"/>
                      </div>
                      <input 
                        type="file" accept="image/*"
                        className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-gray-100"
                        onChange={(e) => handleImageUpload(e, (base64) => updateSection('pillars', 'shopImage', base64))} 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="font-bold text-sm text-gray-700">Carte Bibliothèque</label>
                      <div className="h-32 bg-gray-100 rounded-lg overflow-hidden border mb-2">
                        <img src={content.pillars.libraryImage} className="w-full h-full object-cover" alt="Lib"/>
                      </div>
                      <input 
                        type="file" accept="image/*"
                        className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-gray-100"
                        onChange={(e) => handleImageUpload(e, (base64) => updateSection('pillars', 'libraryImage', base64))} 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="font-bold text-sm text-gray-700">Carte Médiathèque</label>
                      <div className="h-32 bg-gray-100 rounded-lg overflow-hidden border mb-2">
                        <img src={content.pillars.mediaImage} className="w-full h-full object-cover" alt="Media"/>
                      </div>
                      <input 
                        type="file" accept="image/*"
                        className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-gray-100"
                        onChange={(e) => handleImageUpload(e, (base64) => updateSection('pillars', 'mediaImage', base64))} 
                      />
                   </div>
                </div>
             </div>
          )}
          
          {/* 4. CITATION & INFOS */}
          {activeTab === 'quote' && (
             <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 border-b pb-4">Citation en bas de page</h3>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Titre / Slogan (ex: En Arabe/Wolof)</label>
                   <input className="w-full p-3 border rounded-xl font-serif text-lg text-primary-900" value={content.quote.title} onChange={e => updateSection('quote', 'title', e.target.value)} />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Texte de la citation</label>
                   <textarea className="w-full p-3 border rounded-xl h-24 focus:ring-2 focus:ring-primary-500 outline-none" value={content.quote.text} onChange={e => updateSection('quote', 'text', e.target.value)} />
                </div>
             </div>
          )}

          {/* 5. INFOS PRATIQUES */}
          {activeTab === 'info' && (
             <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 border-b pb-4">Pied de page (Footer)</h3>
                <div className="grid md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-sm font-medium mb-1">Adresse</label>
                      <textarea className="w-full p-2 border rounded-lg h-20" value={content.info.address} onChange={e => updateSection('info', 'address', e.target.value)} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium mb-1">Horaires</label>
                      <textarea className="w-full p-2 border rounded-lg h-20" value={content.info.hours} onChange={e => updateSection('info', 'hours', e.target.value)} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium mb-1">Prochain Gamou (Texte)</label>
                      <input className="w-full p-2 border rounded-lg" value={content.info.nextGamou} onChange={e => updateSection('info', 'nextGamou', e.target.value)} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium mb-1">Téléphone</label>
                      <input className="w-full p-2 border rounded-lg" value={content.info.phone} onChange={e => updateSection('info', 'phone', e.target.value)} />
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Nom du Contact</label>
                      <input className="w-full p-2 border rounded-lg" value={content.info.contactName} onChange={e => updateSection('info', 'contactName', e.target.value)} />
                   </div>
                </div>
             </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}