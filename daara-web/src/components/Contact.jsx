import React, { useState } from 'react';
import API from '../services/api'; // ✅ UTILISE TON INSTANCE SÉCURISÉE
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, Youtube, Instagram, Facebook, Music, X, User, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', emailOrPhone: '', message: '' });
  const [status, setStatus] = useState('idle');

  // ✅ Style pour les champs bien encadrés (Identique à ton Admin)
  const inputStyle = "w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all duration-200 font-medium placeholder:text-gray-300";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      // ✅ Utilisation de l'instance API centralisée
      await API.post('/api/contact', formData);
      setStatus('success');
      setFormData({ name: '', emailOrPhone: '', message: '' });
    } catch (error) {
      console.error("Erreur envoi contact:", error);
      setStatus('error');
    }
  };

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
      lines: ["daaraserignemordiop@gmail.com", "moultazam@gmail.com","infos@daaraserignemordiop.com"],
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
    { icon: Music, link: "https://tiktok.com/@moultazam_daara_smd_off", label: "TikTok" },
    { icon: X, link: "https://twitter.com/daarasmd", label: "X" },
    { icon: Send, link: "https://t.me/MoultazamDaara", label: "Telegram" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
      
      {/* --- HERO HEADER --- */}
      <div className="relative h-[45vh] bg-primary-900 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500 rounded-full blur-[120px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10 text-center text-white px-4">
          <motion.span 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-gold-400 text-xs font-black uppercase tracking-widest mb-4 backdrop-blur-sm"
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
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-1.5 bg-gold-500 mx-auto rounded-full"></motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        
        {/* --- CARTES D'INFO --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactInfo.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (idx * 0.2) }}
              className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 group text-center"
            >
              <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 ${item.color} group-hover:rotate-12 transition-transform duration-300`}>
                <item.icon size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3 font-serif">{item.title}</h3>
              <div className="space-y-1">
                {item.lines.map((line, i) => (
                  <p key={i} className="text-gray-500 font-bold text-sm break-words">{line}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- FORMULAIRE --- */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100"
        >
          {/* GAUCHE : VISUEL */}
          <div className="lg:w-5/12 bg-primary-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-serif font-bold mb-6">Écrivez-nous</h3>
              <p className="text-primary-100 leading-relaxed mb-10 text-lg">
                Notre équipe est à votre disposition pour toute demande d'inscription ou information générale.
              </p>
              
              <div className="flex items-center space-x-4 text-gold-400 bg-white/5 p-5 rounded-2xl border border-white/10">
                <Clock size={24} />
                <div>
                    <p className="font-bold text-xs uppercase tracking-widest">Délai de réponse</p>
                    <p className="text-sm">Généralement sous 24 heures</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-12">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400 mb-6">Communauté numérique</p>
              <div className="flex flex-wrap gap-4">
                {socialLinks.map((social, idx) => (
                  <a key={idx} href={social.link} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-gold-500 hover:text-primary-900 transition-all duration-300 hover:scale-110 shadow-lg" title={social.label}>
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* DROITE : FORMULAIRE */}
          <div className="lg:w-7/12 p-8 md:p-14 bg-white">
            {status === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 animate-fadeIn">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 shadow-inner">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">Message Reçu !</h3>
                <p className="text-gray-500 text-lg mb-10">Merci de nous avoir contactés. Nous reviendrons vers vous très prochainement.</p>
                <button onClick={() => setStatus('idle')} className="px-10 py-4 bg-primary-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-gold-500 transition-all">Envoyer un autre message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <User size={12}/> Nom Complet
                    </label>
                    <input 
                      type="text" required
                      className={inputStyle}
                      placeholder="Ex: Mouhamadou Fall"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Mail size={12}/> Email ou Téléphone
                    </label>
                    <input 
                      type="text" required
                      className={inputStyle}
                      placeholder="contact@exemple.com"
                      value={formData.emailOrPhone}
                      onChange={(e) => setFormData({...formData, emailOrPhone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <MessageCircle size={12}/> Votre Message
                  </label>
                  <textarea 
                    rows={6} required
                    className={`${inputStyle} resize-none`}
                    placeholder="Comment pouvons-nous vous aider ?"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={status === 'loading'}
                    className="w-full bg-primary-900 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl shadow-2xl hover:bg-gold-500 hover:text-primary-900 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {status === 'loading' ? <>Traitement...</> : <>Envoyer le message <Send size={18}/></>}
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