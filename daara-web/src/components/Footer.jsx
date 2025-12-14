import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Youtube, Instagram, MapPin, Phone, Mail, ArrowRight, BookOpen, X, Send, Music, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white pt-16 pb-8 border-t-4 border-gold-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* --- Colonne 1: Logo & Présentation --- */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="bg-white p-1 rounded-full shadow-lg overflow-hidden flex items-center justify-center h-12 w-12 transition-transform duration-300 group-hover:scale-105">
                <img 
                  src="/logo.png" 
                  alt="Logo Daara" 
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <BookOpen className="text-primary-900 hidden h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-serif text-gold-500 leading-none">
                  Daara SMD
                </span>
                <span className="text-[10px] text-primary-300 uppercase tracking-widest">
                  Moultazam
                </span>
              </div>
            </Link>

            <p className="text-gray-300 leading-relaxed text-sm mb-6">
              Un centre d'excellence pour l'apprentissage du Coran et des sciences religieuses.
            </p>
            
            {/* Réseaux Sociaux Modernes & Classes */}
            <div className="flex flex-wrap gap-3">
              <SocialLink 
                href="https://www.youtube.com/@MoultazamTv" 
                icon={Youtube} 
                color="hover:bg-red-600 hover:border-red-600 hover:shadow-red-500/50" 
                label="YouTube"
              />
              <SocialLink 
                href="https://www.instagram.com/Moultazam_daara_SMD_officiel" 
                icon={Instagram} 
                color="hover:bg-purple-600 hover:border-purple-600 hover:shadow-purple-500/50" 
                label="Instagram"
              />
              <SocialLink 
                href="https://www.facebook.com/MoultazamDaara" 
                icon={Facebook} 
                color="hover:bg-blue-600 hover:border-blue-600 hover:shadow-blue-500/50" 
                label="Facebook"
              />
              <SocialLink 
                href="https://tiktok.com/@moultazam_daara_smd_off" 
                icon={Music} 
                color="hover:bg-pink-500 hover:border-pink-500 hover:shadow-pink-500/50" 
                label="TikTok"
              />
              <SocialLink 
                href="https://twitter.com/daarasmd" 
                icon={X} 
                color="hover:bg-black hover:border-gray-600 hover:shadow-gray-500/50" 
                label="X"
              />
              <SocialLink 
                href="https://t.me/MoultazamDaara" 
                icon={Send} 
                color="hover:bg-blue-400 hover:border-blue-400 hover:shadow-blue-400/50" 
                label="Telegram"
              />
            </div>
          </div>

          {/* --- Colonne 2: Accès Rapide --- */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-white/20 pb-2 inline-block">Navigation</h4>
            <ul className="space-y-3 text-sm">
              {['Accueil', 'Livres', 'Evenements', 'Contact'].map((item) => (
                <li key={item}>
                  <Link to={item === 'Accueil' ? '/' : `/${item.toLowerCase().replace(/ /g, '-')}`} className="text-gray-300 hover:text-gold-500 transition flex items-center group">
                    <ArrowRight size={14} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    {item}
                  </Link>
                </li>
              ))}
              {/* LIEN AJOUTÉ ICI */}
              <li>
                <Link to="/don" className="text-gold-400 hover:text-white transition flex items-center group font-bold mt-2">
                  <Heart size={14} className="mr-2 fill-current" /> Faire un don
                </Link>
              </li>
            </ul>
          </div>

          {/* --- Colonne 3: Coordonnées --- */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-white/20 pb-2 inline-block">Nous Contacter</h4>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li className="flex items-start">
                <MapPin className="mr-3 h-5 w-5 text-gold-500 flex-shrink-0 mt-1" />
                <span>Parcelles Assainies U25,<br/>Villa N169, Sénégal</span>
              </li>
              <li className="flex items-start">
                <Phone className="mr-3 h-5 w-5 text-gold-500 flex-shrink-0 mt-1" />
                <div className="flex flex-col">
                  <span>(+221) 77 559 20 28</span>
                  <span>(+221) 77 832 35 35</span>
                </div>
              </li>
              <li className="flex items-start">
                <Mail className="mr-3 h-5 w-5 text-gold-500 flex-shrink-0 mt-1" />
                <div className="flex flex-col">
                  <span className="break-all">daaraserignemordiop@gmail.com</span>
                  <span className="break-all">moultazam@gmail.com</span>
                </div>
              </li>
            </ul>
          </div>

          {/* --- Colonne 4: Newsletter --- */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-white/20 pb-2 inline-block">Restez informé</h4>
            <p className="text-gray-300 text-sm mb-4">Recevez les nouveaux livres et dates d'événements directement.</p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Votre email" className="bg-white/5 border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-gold-500 text-white text-sm transition-colors focus:bg-white/10" />
              <button className="bg-gold-500 text-white font-bold py-2 rounded hover:bg-gold-600 transition text-sm shadow-lg hover:shadow-gold-500/30">S'inscrire</button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-xs">
          <p>&copy; {new Date().getFullYear()} Moultazam Daara Serigne Mor Diop. Tous droits réservés.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Composant pour les icônes sociales "Classes"
function SocialLink({ href, icon: Icon, color, label }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer" 
      title={label} 
      className={`
        w-10 h-10 rounded-full border border-white/20 bg-white/5 
        flex items-center justify-center text-gray-300
        transition-all duration-300 ease-out
        hover:text-white hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:border-transparent
        ${color}
      `}
    >
      <Icon size={18} strokeWidth={1.5} />
    </a>
  );
}