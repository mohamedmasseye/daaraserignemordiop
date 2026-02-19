import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, MapPin, User, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MentionsLegales() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 font-sans text-gray-800">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="bg-primary-900 p-8 md:p-12 text-center relative">
           <button onClick={() => navigate(-1)} className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors"><ArrowLeft /></button>
           <div className="w-20 h-20 bg-gold-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-gold-500/30">
              <FileText size={40} className="text-gold-500" />
           </div>
           <h1 className="text-3xl font-serif font-bold text-white leading-tight">Mentions Légales</h1>
           <p className="text-gold-400/80 text-xs uppercase tracking-[0.2em] font-black mt-4">Daara Serigne Mor Diop</p>
        </div>

        <div className="p-8 md:p-12 space-y-10 text-gray-600">
          <div className="grid md:grid-cols-2 gap-8">
            <section>
              <h2 className="text-sm font-black text-gold-600 uppercase tracking-widest mb-4 flex items-center gap-2"><User size={16}/> Éditeur</h2>
              <p className="font-bold text-primary-900">Association Daara Serigne Mor Diop</p>
              <p className="text-sm mt-1">Responsable : Serigne Mor Diop</p>
              <p className="text-sm">Dakar, Sénégal</p>
            </section>

            <section>
              <h2 className="text-sm font-black text-gold-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Globe size={16}/> Hébergement</h2>
              <p className="font-bold text-primary-900">Infrastructure Privée</p>
              <p className="text-sm mt-1">Géré via Coolify sur Serveur Dédié</p>
              <p className="text-sm">Hébergeur : Contabo / Hetzner</p>
            </section>
          </div>

          <section className="pt-8 border-t border-gray-100">
            <h2 className="text-xl font-bold text-primary-900 font-serif mb-4">Propriété Intellectuelle</h2>
            <p className="text-sm leading-relaxed italic">
              L'ensemble de ce site et de l'application (textes, logos, podcasts, vidéos) est la propriété exclusive du Daara Serigne Mor Diop. Toute reproduction, même partielle, est interdite sans autorisation préalable.
            </p>
          </section>

          <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Contact Officiel</p>
            <p className="text-primary-900 font-bold">infos@daaraserignemordiop.com</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}