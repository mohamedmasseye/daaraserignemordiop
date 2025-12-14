import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, CreditCard, Building, BookOpen, Users, Copy, Check, Smartphone } from 'lucide-react';

export default function Donate() {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const paymentMethods = [
    {
      id: 'wave',
      name: 'Wave',
      color: 'bg-[#1dc4ff]',
      icon: Smartphone,
      number: '', // Numéro retiré
      desc: ''
    },
    {
      id: 'om',
      name: 'Orange Money',
      color: 'bg-[#ff7900]',
      icon: Smartphone,
      number: '', // Numéro retiré
      desc: ''
    }
    // Option Virement Bancaire supprimée
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      {/* --- HERO HEADER --- */}
      <div className="relative h-[50vh] bg-primary-900 overflow-hidden flex items-center justify-center text-center px-4">
        {/* Fond décoratif */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 animate-pulse-slow"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500 rounded-full blur-[150px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500 rounded-full blur-[150px] opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
            className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/20 shadow-2xl"
          >
            <Heart size={48} className="text-gold-500 fill-current animate-pulse" />
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight"
          >
            Soutenez le <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">Daara</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-primary-100 text-lg md:text-2xl font-light max-w-2xl mx-auto italic"
          >
            "Ceux qui dépensent leurs biens dans le sentier d'Allah ressemblent à un grain d'où naissent sept épis..."
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        
        {/* --- SECTION PAIEMENT --- */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-16 mb-20 border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3 font-serif">Choisissez votre moyen de contribution</h2>
            <p className="text-gray-500">Tous les paiements sont sécurisés et vont directement au compte du Daara.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {paymentMethods.map((method, idx) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`absolute top-0 left-0 w-full h-2 ${method.color} rounded-t-2xl`}></div>
                
                <div className={`w-16 h-16 ${method.color} rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg mx-auto transform group-hover:rotate-6 transition-transform`}>
                  <method.icon size={32} />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">{method.name}</h3>
                <p className="text-sm text-gray-500 text-center mb-8">{method.desc}</p>
                
                {/* On n'affiche la zone de copie que si un numéro est présent */}
                {method.number && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center group-hover:border-gold-300 transition-colors">
                    <span className="font-mono font-bold text-lg text-primary-900 tracking-wide">{method.number}</span>
                    <button 
                      onClick={() => copyToClipboard(method.number, method.id)}
                      className="p-2 hover:bg-white rounded-lg transition text-gray-400 hover:text-green-600 hover:shadow-sm"
                      title="Copier le numéro"
                    >
                      {copied === method.id ? <Check size={20} className="text-green-600"/> : <Copy size={20}/>}
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- SECTION IMPACT (Pourquoi donner ?) --- */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-primary-900 mb-12 font-serif">Où va votre argent ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: "Éducation & Livres", desc: "Achat de Corans, livres et matériel pédagogique pour les étudiants." },
              { icon: Users, title: "Vie des Étudiants", desc: "Restauration, soins médicaux et hébergement des pensionnaires." },
              { icon: Building, title: "Extension du Daara", desc: "Construction de nouvelles salles de classe pour accueillir plus d'élèves." },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03 }}
                className="bg-primary-900 text-white p-8 rounded-2xl text-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <card.icon size={32} className="text-gold-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                <p className="text-primary-200 text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}