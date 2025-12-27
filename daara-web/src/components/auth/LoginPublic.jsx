import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, Loader, ArrowLeft } from 'lucide-react';

// --- IMPORTS CAPACITOR & NATIF ---
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// --- IMPORTS FIREBASE ---
import { signInWithPopup, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth, googleProvider } from "../../firebase"; 

export default function LoginPublic() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // --- 1. CONNEXION VIA GOOGLE (HYBRIDE WEB/NATIF) ---
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      let idToken;

      // A. DÉTECTION DE LA PLATEFORME
      if (Capacitor.isNativePlatform()) {
        // 📱 MODE NATIF (Android/iOS) : Utilisation du plugin GoogleAuth
        console.log("Utilisation du login natif Google...");
        const nativeUser = await GoogleAuth.signIn();
        idToken = nativeUser.authentication.idToken;
      } else {
        // 💻 MODE WEB : Utilisation du popup Firebase classique
        console.log("Utilisation du popup web Google...");
        const result = await signInWithPopup(auth, googleProvider);
        idToken = await result.user.getIdToken();
      }

      // B. CONNEXION À FIREBASE AVEC LE TOKEN RÉCUPÉRÉ
      // Cela permet de créer la session Firebase peu importe la plateforme
      const credential = GoogleAuthProvider.credential(idToken);
      const firebaseUserCredential = await signInWithCredential(auth, credential);
      
      // C. RÉCUPÉRATION DU TOKEN POUR VOTRE BACKEND NODE.JS
      const tokenForBackend = await firebaseUserCredential.user.getIdToken();
      console.log("Token prêt pour le backend");

      // D. ENVOI AU SERVEUR (Votre API sur 91.99.200.188:5000)
      const res = await axios.post('/api/auth/google', {
        token: tokenForBackend
      });

      // E. SAUVEGARDE DE LA SESSION LOCALE
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_info', JSON.stringify(res.data.user));
      
      console.log("✅ Connexion Google réussie !");
      
      // F. REDIRECTION
      let origin = location.state?.from;
      if (!origin || origin.includes('/login') || origin.includes('/register') || origin.includes('/auth')) {
          origin = '/profil';
      }
      navigate(origin, { replace: true });

    } catch (err) {
      console.error("Erreur Google détaillée:", err);
      
      // Gestion d'erreur spécifique
      if (err.code === 'auth/popup-closed-by-user' || err.message === 'User cancelled login') {
          setLoading(false);
          return;
      }
      setError("Échec de la connexion Google. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. CONNEXION CLASSIQUE (Email/Pass) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/login', formData);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_info', JSON.stringify(res.data.user));

      let origin = location.state?.from;
      if (!origin || origin.includes('/login') || origin.includes('/register') || origin.includes('/auth')) {
          origin = '/profil';
      }

      navigate(origin, { replace: true });

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Identifiant ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-primary-900 rounded-b-[3rem] z-0">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-gray-100"
      >
        <div className="p-8 text-center pb-6">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg text-primary-900">
             <User size={32} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Bienvenue</h1>
          <p className="text-gray-500 text-sm mt-1">Espace Membre</p>
        </div>

        <div className="px-8 pb-10">
          
          {/* --- BOUTON GOOGLE --- */}
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full mb-6 py-3 border border-gray-300 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition font-bold text-gray-700 shadow-sm disabled:opacity-50"
          >
            {loading ? (
                <Loader className="animate-spin text-primary-900" size={20} />
            ) : (
                <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5"/>
                    Continuer avec Google
                </>
            )}
          </button>

          {/* SÉPARATEUR */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="px-2 bg-white text-gray-400 font-bold">Ou avec email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center flex items-center justify-center gap-2">
                 {error}
              </motion.div>
            )}

            {/* Champ Identifiant (Email ou Tel) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email ou Téléphone</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="text" 
                  name="identifier"
                  required
                  placeholder="exemple@mail.com ou 77..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-900 outline-none transition-all focus:bg-white"
                  value={formData.identifier}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-900 outline-none transition-all focus:bg-white"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm pt-2">
                <Link to="/" className="text-gray-400 hover:text-gray-600 flex items-center gap-1"><ArrowLeft size={14}/> Retour site</Link>
                <Link to="/forgot-password" className="text-gold-600 hover:text-gold-700 font-medium">Mot de passe oublié ?</Link>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-primary-800 transition transform active:scale-95 flex items-center justify-center gap-2">
              {loading ? <Loader className="animate-spin" /> : "Se connecter"}
            </button>

          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Pas encore de compte ?{' '}
              <Link to="/inscription" className="text-primary-900 font-bold hover:underline">Créer un compte</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}