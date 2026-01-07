import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, CheckCircle, Loader, ArrowLeft } from 'lucide-react';
import { secureStorage } from '../../utils/security'; // ✅ IMPORT SÉCURITÉ

// --- IMPORTS CAPACITOR & FIREBASE (Identiques) ---
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase"; 

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', identifier: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // --- 1. INSCRIPTION VIA GOOGLE ---
  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      let userData;
      if (Capacitor.isNativePlatform()) {
        const nativeUser = await GoogleAuth.signIn();
        const res = await axios.post('/api/auth/google-mobile', { idToken: nativeUser.authentication.idToken });
        userData = res.data;
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        const tokenForBackend = await result.user.getIdToken();
        const res = await axios.post('/api/auth/google', { token: tokenForBackend });
        userData = res.data;
      }
      secureStorage.setItem('_d_usr_vault', userData.token);
      secureStorage.setItem('_d_usr_info', userData.user);
      navigate('/profil', { replace: true });
    } catch (err) {
      setError("Impossible de s'inscrire avec Google.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. INSCRIPTION CLASSIQUE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError("Les mots de passe ne correspondent pas.");
    
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/register', formData);
      // Après inscription, on connecte automatiquement
      const loginRes = await axios.post('/api/auth/login', {
        identifier: formData.identifier,
        password: formData.password
      });
      secureStorage.setItem('_d_usr_vault', loginRes.data.token);
      secureStorage.setItem('_d_usr_info', loginRes.data.user);
      navigate('/profil');
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Fond décoratif */}
      <div className="absolute top-0 right-0 w-full h-[40vh] bg-primary-900 rounded-b-[50%] scale-x-150 z-0"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-gray-100"
      >
        <div className="p-8 pb-4 text-center">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Créer un compte</h1>
          <p className="text-gray-500 mt-2">Rejoignez la communauté du Daara</p>
        </div>

        <div className="px-8 pb-10">
          
          {/* --- BOUTON GOOGLE --- */}
          <button 
            type="button"
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full mb-6 py-3 border border-gray-300 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition font-bold text-gray-700 shadow-sm disabled:opacity-50"
          >
            {loading ? (
                <Loader className="animate-spin text-primary-900" size={20} />
            ) : (
                <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5"/>
                    S'inscrire avec Google
                </>
            )}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="px-2 bg-white text-gray-400 font-bold">Ou via formulaire</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}

            {/* Nom Complet */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nom Complet</label>
              <div className="relative mt-1">
                <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="text" name="fullName" required
                  placeholder="Prénom Nom"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-900 outline-none"
                  value={formData.fullName} onChange={handleChange}
                />
              </div>
            </div>

            {/* EMAIL OU TÉLÉPHONE */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email ou Téléphone</label>
              <div className="relative mt-1">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="text" 
                  name="identifier" 
                  required
                  placeholder="exemple@mail.com ou 77 000 00 00"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-900 outline-none"
                  value={formData.identifier} 
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Mots de passe */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mot de passe</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input 
                    type="password" name="password" required
                    placeholder="••••••"
                    className="w-full pl-10 pr-2 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-900 outline-none text-sm"
                    value={formData.password} onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Confirmer</label>
                <div className="relative mt-1">
                  <CheckCircle className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input 
                    type="password" name="confirmPassword" required
                    placeholder="••••••"
                    className="w-full pl-10 pr-2 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-900 outline-none text-sm"
                    value={formData.confirmPassword} onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-primary-800 transition transform active:scale-95 flex items-center justify-center gap-2 mt-4">
              {loading ? <Loader className="animate-spin" /> : "Créer mon compte"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Déjà membre ?{' '}
              <Link to="/login-public" className="text-primary-900 font-bold hover:underline">Se connecter</Link>
            </p>
            <div className="mt-4">
                <Link to="/" className="text-gray-400 text-xs hover:text-gray-600 flex items-center justify-center gap-1"><ArrowLeft size={12}/> Retour à l'accueil</Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}