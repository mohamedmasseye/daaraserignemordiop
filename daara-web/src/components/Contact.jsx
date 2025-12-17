import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, Youtube, Instagram, Facebook, Music, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', emailOrPhone: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await axios.post('/api/contact', formData);
      setStatus('success');
      setFormData({ name: '', emailOrPhone: '', message: '' });
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  // Données mises à jour
  const contactInfo = [
    { 
      icon: Phone, 
      title: "Appelez-nous", 
      lines: ["(+221) 77 559 20 28", "(+221) 77 832 35 35"],
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    { 
      icon: Mail, 
      title: "Écrivez-nous", 
      lines: ["daaraserignemordiop@gmail.com", "moultazam@gmail.com"],
      color: "text-gold-600",
      bg: "bg-gold-50"
    },
    { 
      icon: MapPin, 
      title: "Rendez-nous visite", 
      lines: ["Parcelles Assainies U25", "Villa N169, Sénégal"],
      color: "text-primary-600",
      bg: "bg-primary-50"
    },
  ];

  const socialLinks = [
    { icon: Youtube, link: "https://www.youtube.com/@MoultazamTv", label: "YouTube" },
    { icon: Instagram, link: "https://www.instagram.com/Moultazam_daara_SMD_officiel", label: "Instagram" },
    { icon: Facebook, link: "https://www.facebook.com/MoultazamDaara", label: "Facebook" },
    { icon: Music, link: "https://tiktok.com/@moultazam_daara_smd_off", label: "TikTok" }, // Music icon for TikTok
    { icon: X, link: "https://twitter.com/daarasmd", label: "X" },
    { icon: Send, link: "https://t.me/MoultazamDaara", label: "Telegram" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      {/* --- HERO HEADER (Parallax) --- */}
      <div className="relative h-[45vh] bg-primary-900 overflow-hidden flex items-center justify-center">
        {/* Fond décoratif */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 animate-pulse-slow"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500 rounded-full blur-[120px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10 text-center text-white px-4">
          <motion.span 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-gold-400 text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-sm"
          >
            Assistance & Information
          </motion.span>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif font-bold mb-6"
          >
            Restons en Contact
          </motion.h1>
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-24 h-1 bg-gold-500 mx-auto rounded-full"
          ></motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        
        {/* --- CARTES D'INFO FLOTTANTES --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactInfo.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (idx * 0.2) }}
              className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group text-center"
            >
              <div className={`w-16 h-16 ${item.bg} rounded-full flex items-center justify-center mx-auto mb-6 ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                <item.icon size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3 font-serif">{item.title}</h3>
              <div className="space-y-1">
                {item.lines.map((line, i) => (
                  <p key={i} className="text-gray-600 font-medium text-sm md:text-base break-words">{line}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- FORMULAIRE DOUBLE COLONNE --- */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100"
        >
          
          {/* GAUCHE : VISUEL & SOCIAL */}
          <div className="lg:w-5/12 bg-primary-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Décoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500 opacity-20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-serif font-bold mb-4 text-white">Envoyez-nous un message</h3>
              <p className="text-primary-100 leading-relaxed mb-8">
                Pour toute demande d'inscription, partenariat ou information générale, notre équipe est à votre disposition.
              </p>
              
              <div className="flex items-center space-x-3 text-sm text-gold-400 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 inline-flex">
                <Clock size={20} />
                <span>Réponse généralement sous 24h</span>
              </div>
            </div>

            {/* Section Réseaux Sociaux Intégrée */}
            <div className="relative z-10 mt-12">
              <p className="text-sm font-bold uppercase tracking-widest text-primary-300 mb-4">Suivez-nous</p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social, idx) => (
                  <a 
                    key={idx} 
                    href={social.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold-500 hover:text-white transition-all duration-300 hover:scale-110"
                    title={social.label}
                  >
                    <social.icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* DROITE : FORMULAIRE */}
          <div className="lg:w-7/12 p-8 md:p-12 bg-white">
            {status === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-fade-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-gray-800 mb-2">Message Envoyé !</h3>
                <p className="text-gray-500 text-lg mb-8 max-w-sm mx-auto">
                  Merci de nous avoir contactés. Nous traiterons votre demande dans les plus brefs délais.
                </p>
                <button 
                  onClick={() => setStatus('idle')} 
                  className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-primary-600 transition shadow-lg"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Nom Complet</label>
                    <input 
                      type="text" required
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-transparent outline-none transition duration-200"
                      placeholder="Mouhamadou..."
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Email / Téléphone</label>
                    <input 
                      type="text" required
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-transparent outline-none transition duration-200"
                      placeholder="contact@email.com"
                      value={formData.emailOrPhone}
                      onChange={(e) => setFormData({...formData, emailOrPhone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Votre Message</label>
                  <textarea 
                    rows={6} required
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-transparent outline-none transition duration-200 resize-none"
                    placeholder="Comment pouvons-nous vous aider aujourd'hui ?"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={status === 'loading'}
                    className="w-full bg-gold-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gold-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                  >
                    {status === 'loading' ? (
                      <>Envoi en cours...</>
                    ) : (
                      <>Envoyer le message <Send size={20}/></>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}