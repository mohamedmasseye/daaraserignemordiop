import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, Trash2, Lock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
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
           <div className="w-20 h-20 bg-gold-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-gold-500/30">
              <ShieldCheck size={40} className="text-gold-500" />
           </div>
           <h1 className="text-3xl font-serif font-bold text-white leading-tight">Politique de Confidentialité</h1>
           <p className="text-gold-400/80 text-xs uppercase tracking-[0.2em] font-black mt-4">Version 2.0 - Février 2026</p>
        </div>

        <div className="p-8 md:p-12 space-y-10 leading-relaxed text-gray-600">
          <section>
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-primary-50 text-primary-900 rounded-lg"><Eye size={20}/></div>
               <h2 className="text-xl font-bold text-primary-900 font-serif">Collecte des Données</h2>
            </div>
            <p>Nous collectons uniquement les données nécessaires au bon fonctionnement de l'application :</p>
            <ul className="list-disc ml-5 mt-3 space-y-2 italic">
              <li>Identité (Nom, Prénom) et Email pour votre compte.</li>
              <li>Historique des commandes et billets d'événements.</li>
              <li>Données de navigation pour améliorer l'expérience utilisateur.</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-primary-50 text-primary-900 rounded-lg"><Lock size={20}/></div>
               <h2 className="text-xl font-bold text-primary-900 font-serif">Sécurité & Hébergement</h2>
            </div>
            <p>Vos données sont stockées de manière sécurisée sur nos serveurs gérés via <strong>Coolify</strong> et protégées par des protocoles SSL. Nous ne vendons jamais vos données à des tiers.</p>
          </section>

          <section className="bg-red-50 p-6 md:p-8 rounded-[2rem] border border-red-100">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-red-100 text-red-600 rounded-lg"><Trash2 size={20}/></div>
               <h2 className="text-xl font-bold text-red-900 font-serif">Droit à la Suppression</h2>
            </div>
            <p className="text-red-800 text-sm mb-4">Conformément aux exigences de Google Play, vous avez le droit de supprimer votre compte à tout moment.</p>
            <p className="font-bold text-red-900">Comment faire ?</p>
            <p className="text-sm">Connectez-vous à votre profil dans l'application et utilisez le bouton <strong>"Supprimer mon compte"</strong> dans la zone de danger. Cela effacera instantanément toutes vos données de nos serveurs MongoDB.</p>
          </section>

          <div className="pt-8 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Besoin d'aide ?</p>
            <p className="text-primary-900 font-bold">support@daaraserignemordiop.com</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}