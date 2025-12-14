import React, { useState, useEffect } from 'react';
import { Menu, X, BookOpen, User, Heart, ChevronDown, Mic, Image, Newspaper, Book } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMediaOpen, setIsMobileMediaOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user_info'));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_info');
    navigate('/auth');
    window.location.reload();
  };

  const isActive = (path) => location.pathname === path;
  const isMediaActive = ['/livres', '/blog', '/galerie', '/podcast'].includes(location.pathname);

  // Animations Menu Mobile
  const menuVariants = {
    closed: { opacity: 0, x: "100%" },
    open: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 20, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    closed: { opacity: 0, x: 50 },
    open: { opacity: 1, x: 0 }
  };

  return (
    <>
      <nav 
        className={`fixed w-full z-50 transition-all duration-500 ease-in-out border-b ${
          scrolled 
            ? "bg-primary-900/95 backdrop-blur-md py-2 border-primary-800 shadow-xl" 
            : "bg-primary-900 py-4 border-transparent shadow-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-3 group relative z-50">
              <div className="bg-white p-1 rounded-full shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 overflow-hidden flex items-center justify-center h-10 w-10 md:h-12 md:w-12">
                <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" 
                     onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                <BookOpen className="text-primary-900 hidden h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-serif font-bold tracking-wide leading-none text-white drop-shadow-md">Daara<span className="text-gold-500">SMD</span></span>
                <span className={`text-[10px] md:text-xs text-primary-300 uppercase tracking-widest hidden sm:block transition-all duration-300 ${scrolled ? 'opacity-0 h-0' : 'opacity-100'}`}>Enseignement & Excellence</span>
              </div>
            </Link>

            {/* --- MENU BUREAU (CAPSULE) --- */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              <div className={`flex items-center space-x-1 px-6 py-2 rounded-full border transition-all duration-300 ${
                  scrolled 
                  ? "bg-transparent border-transparent" 
                  : "bg-white/5 border-white/10 shadow-lg"
              }`}>
                <DesktopNavItem to="/" current={location.pathname}>Accueil</DesktopNavItem>
                
                {/* Dropdown Médiathèque Desktop */}
                <div className="relative group px-3 py-2 cursor-pointer rounded-full transition-colors hover:bg-white/5">
                  <span className={`text-sm font-medium flex items-center gap-1 transition-colors relative z-10 ${
                    isMediaActive ? "text-gold-500 font-bold" : "text-gray-300 group-hover:text-white"
                  }`}>
                    Médiathèque <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                  </span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pt-2">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 p-2">
                      <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Explorer</div>
                      <DropdownItem to="/livres" icon={Book} label="Bibliothèque" desc="Livres & PDF" color="bg-blue-50 text-blue-600" />
                      <DropdownItem to="/blog" icon={Newspaper} label="Le Blog" desc="Articles & Actualités" color="bg-green-50 text-green-600" />
                      <DropdownItem to="/galerie" icon={Image} label="Galerie Photo" desc="Souvenirs en images" color="bg-purple-50 text-purple-600" />
                      <DropdownItem to="/podcast" icon={Mic} label="Podcasts" desc="Audios & Conférences" color="bg-red-50 text-red-600" />
                    </div>
                  </div>
                </div>

                <DesktopNavItem to="/boutique" current={location.pathname}>Boutique</DesktopNavItem>
                <DesktopNavItem to="/evenements" current={location.pathname}>Agenda</DesktopNavItem>
                <DesktopNavItem to="/contact" current={location.pathname}>Contact</DesktopNavItem>
              </div>

              <div className="flex items-center gap-4">
                <Link to="/don" className="bg-gradient-to-r from-gold-500 to-gold-600 text-white px-5 py-2.5 rounded-full font-bold shadow-lg hover:shadow-gold-500/40 hover:-translate-y-0.5 transition-all duration-300 text-sm flex items-center gap-2">
                  <Heart size={16} fill="currentColor" /> <span className="hidden xl:inline">Don</span>
                </Link>

                {user ? (
                  <Link to="/profil" className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-primary-800/50 border border-primary-700 hover:bg-primary-800 transition-all duration-300 group">
                    <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-gold-500 group-hover:scale-110 transition-transform">
                         {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover"/> : <User size={16} />}
                    </div>
                    <span className="text-sm font-medium text-white max-w-[80px] truncate">{user.fullName.split(' ')[0]}</span>
                  </Link>
                ) : (
                  <Link to="/login-public" className="text-sm font-bold text-gray-300 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full hover:bg-white/10 border border-white/5">Connexion</Link>
                )}
              </div>
            </div>

            {/* --- BOUTON MOBILE --- */}
            <div className="lg:hidden relative z-50">
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`p-2 rounded-full transition-all duration-300 ${isOpen ? 'text-white' : 'text-gold-500'}`}
              >
                {isOpen ? <X size={32} /> : <Menu size={32} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* =======================================================
                         MENU MOBILE (MODIFIÉ)
      ======================================================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial="closed" 
            animate="open" 
            exit="closed" 
            variants={menuVariants} 
            className="fixed inset-0 z-40 bg-primary-900 lg:hidden flex flex-col pt-24 pb-10 px-6 overflow-y-auto"
          >
            <div className="flex flex-col space-y-2 flex-1">
              
              {/* LIENS AVEC ANIMATION LAYOUTID SUR MOBILE */}
              <motion.div variants={itemVariants}>
                 <MobileNavItem to="/" onClick={() => setIsOpen(false)}>Accueil</MobileNavItem>
              </motion.div>

              {/* Accordéon Médiathèque (Style unifié) */}
              <motion.div variants={itemVariants} className="pl-2 py-1">
                <button 
                  onClick={() => setIsMobileMediaOpen(!isMobileMediaOpen)} 
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all ${isMediaActive ? 'text-gold-500 font-bold' : 'text-white/80'}`}
                >
                  <span className="text-lg font-medium">Médiathèque</span>
                  <ChevronDown size={20} className={`transition-transform duration-300 ${isMobileMediaOpen ? 'rotate-180 text-gold-500' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isMobileMediaOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: "auto", opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }} 
                      className="overflow-hidden pl-4 border-l border-white/10 mt-1 space-y-1"
                    >
                      <MobileSubLink to="/livres" onClick={() => setIsOpen(false)} icon={Book} label="Bibliothèque" />
                      <MobileSubLink to="/blog" onClick={() => setIsOpen(false)} icon={Newspaper} label="Le Blog" />
                      <MobileSubLink to="/galerie" onClick={() => setIsOpen(false)} icon={Image} label="Galerie Photos" />
                      <MobileSubLink to="/podcast" onClick={() => setIsOpen(false)} icon={Mic} label="Podcasts Audio" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div variants={itemVariants}>
                 <MobileNavItem to="/boutique" onClick={() => setIsOpen(false)}>Boutique</MobileNavItem>
              </motion.div>
              <motion.div variants={itemVariants}>
                 <MobileNavItem to="/evenements" onClick={() => setIsOpen(false)}>Agenda</MobileNavItem>
              </motion.div>
              <motion.div variants={itemVariants}>
                 <MobileNavItem to="/contact" onClick={() => setIsOpen(false)}>Contact</MobileNavItem>
              </motion.div>

            </div>

            {/* Footer Mobile */}
            <motion.div variants={itemVariants} className="mt-8 border-t border-white/10 pt-6 space-y-4">
              <Link to="/don" onClick={() => setIsOpen(false)} className="w-full bg-gold-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform">
                <Heart size={20} fill="currentColor" /> Faire un don
              </Link>
              
              {user ? (
                 <>
                    <Link to="/profil" onClick={() => setIsOpen(false)} className="w-full bg-primary-800 border border-primary-700 text-white py-3 rounded-xl font-medium text-center flex justify-center items-center gap-2">
                      <User size={18} /> Mon Profil
                    </Link>
                    <button onClick={handleLogout} className="w-full text-center text-red-400 text-sm mt-2 hover:text-red-300">
                      Se déconnecter
                    </button>
                 </>
              ) : (
                <Link to="/login-public" onClick={() => setIsOpen(false)} className="block w-full text-center py-3 bg-white/5 rounded-xl text-gray-300 hover:text-white font-medium border border-white/5">
                  Connexion
                </Link>
              )}
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// --- SOUS-COMPOSANTS ---

// 1. Desktop NavItem (Capsule)
const DesktopNavItem = ({ to, children, current }) => {
  const isActive = current === to;
  return (
    <Link to={to} className="relative px-4 py-2 rounded-full transition-colors duration-200">
      {isActive && (
        <motion.div 
          layoutId="activeTab" 
          className="absolute inset-0 bg-white/10 rounded-full shadow-inner" 
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <span className={`relative z-10 text-sm font-medium transition-colors duration-200 ${
        isActive ? 'text-gold-500 font-bold' : 'text-gray-300 hover:text-white'
      }`}>
        {children}
      </span>
    </Link>
  );
};

// 2. Mobile NavItem (Avec Animation layoutId fluide sur mobile aussi)
const MobileNavItem = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} onClick={onClick} className="relative block px-4 py-3 rounded-xl transition-colors">
      {isActive && (
        <motion.div
          layoutId="activeMobileTab" // ID différent pour éviter conflit avec Desktop
          className="absolute inset-0 bg-white/10 rounded-xl"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <span className={`relative z-10 text-lg font-medium ${isActive ? "text-gold-500 font-bold" : "text-gray-100"}`}>
        {children}
      </span>
    </Link>
  );
};

// 3. Dropdown Item Desktop
const DropdownItem = ({ to, icon: Icon, label, desc, color }) => (
    <Link to={to} className="flex items-center px-4 py-3 m-1 rounded-xl transition-all duration-300 group hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent hover:shadow-sm relative overflow-hidden">
      <div className={`p-2.5 rounded-xl ${color} bg-opacity-20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm relative z-10`}>
        <Icon size={20} className={color.split(' ')[1]} />
      </div>
      <div className="ml-3.5 relative z-10">
        <p className="text-sm font-bold text-gray-800 group-hover:text-primary-800 transition-colors">{label}</p>
        <p className="text-[11px] font-medium text-gray-400 group-hover:text-primary-600/80 transition-colors mt-0.5">{desc}</p>
      </div>
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </Link>
);

// 4. Mobile SubLink
const MobileSubLink = ({ to, onClick, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} onClick={onClick} className={`flex items-center gap-3 py-3 px-4 rounded-xl text-base font-medium transition-colors ${isActive ? "text-gold-500 bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
      <Icon size={18} className={isActive ? "text-gold-500" : "text-gray-500"}/>
      <span>{label}</span>
    </Link>
  );
};