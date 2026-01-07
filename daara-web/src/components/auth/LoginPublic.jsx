import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, Loader, ArrowLeft } from 'lucide-react';
import { secureStorage } from '../../utils/security';

// --- IMPORTS CAPACITOR & FIREBASE ---
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase"; 

// Configuration de l'URL de base si nécessaire (ajustez selon votre environnement)
const API_URL = "https://api.daaraserignemordiop.com"; // Ou laissez vide si proxy configuré

export default function LoginPublic() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Initialisation GoogleAuth pour le Web
  useEffect(() => {
    const initWebAuth = async () => {
      if (!Capacitor.isNativePlatform()) {
        try {
          await GoogleAuth.initialize({
            clientId: '1060878832216-l4nfks09797bsh49u8jqce0kd95tfb8e.apps.googleusercontent.com',
            scopes: ['profile', 'email'],
            grantOfflineAccess: true,
          });
          console.log("✅ GoogleAuth Web initialisé");
        } catch (err) {
          console.warn("⚠️ GoogleAuth déjà initialisé ou erreur:", err);
        }
      }
    };
    initWebAuth();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // 2. Logique de connexion Google
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    console.log("🚀 Lancement du flux Google...");

    try {
      let idToken;

      if (Capacitor.isNativePlatform()) {
        // --- MOBILE ---
        const nativeUser = await GoogleAuth.signIn();
        idToken = nativeUser.authentication.idToken;
        console.log("📱 Token Mobile obtenu");
      } else {
        // --- WEB (Firebase Popup) ---
        // Si le pop-up se ferme sans rien faire, vérifiez les "Domaines autorisés" dans Firebase Console
        const result = await signInWithPopup(auth, googleProvider);
        idToken = await result.user.getIdToken();
        console.log("🌐 Token Web obtenu via Firebase");
      }

      // Envoi au Backend
      const endpoint = Capacitor.isNativePlatform() ? '/api/auth/google-mobile' : '/api/auth/google';
      const res = await axios.post(`${API_URL}${endpoint}`, { token: idToken });

      if (res.data && res.data.token) {
        secureStorage.setItem('_d_usr_vault', res.data.token);
        secureStorage.setItem('_d_usr_info', res.data.user);
        localStorage.removeItem('_d_adm_vault');

        const origin = location.state?.from || '/profil';
        navigate(origin, { replace: true });
        console.log("✅ Authentification réussie et redirection effectuée");
      }
    } catch (err) {
      console.error("❌ Erreur complète:", err);
      // Gestion spécifique des erreurs Firebase (ex: Popup fermée par l'utilisateur)
      if (err.code === 'auth/popup-closed-by-user') {
        setError("La fenêtre de connexion a été fermée.");
      } else {
        setError(err.response?.data?.error || "Échec de l'authentification avec Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Connexion classique
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      secureStorage.setItem('_d_usr_vault', res.data.token);
      secureStorage.setItem('_d_usr_info', res.data.user);
      localStorage.removeItem('_d_adm_vault');

      navigate(location.state?.from || '/profil', { replace: true });
    } catch (err) {
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
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-gray-100">
        <div className="p-8 text-center pb-6">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg text-primary-900">
             <User size={32} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Bienvenue</h1>
          <p className="text-gray-500 text-sm mt-1">Espace Membre</p>
        </div>

        <div className="px-8 pb-10">
          <button type="button" onClick={handleGoogleLogin} disabled={loading} className="w-full mb-6 py-3 border border-gray-300 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition font-bold text-gray-700 shadow-sm disabled:opacity-50">
            {loading ? <Loader className="animate-spin text-primary-900" size={20} /> : (
                <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5"/>
                    Continuer avec Google
                </>
            )}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="px-2 bg-white text-gray-400 font-bold">Ou avec email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center">{error}</motion.div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email ou Téléphone</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input type="text" name="identifier" required placeholder="exemple@mail.com" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-900" value={formData.identifier} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input type={showPassword ? "text" : "password"} name="password" required placeholder="••••••••" className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-900" value={formData.password} onChange={handleChange} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm pt-2">
                <Link to="/" className="text-gray-400 hover:text-gray-600 flex items-center gap-1"><ArrowLeft size={14}/> Retour site</Link>
                <Link to="/forgot-password" className="text-gold-600 hover:text-gold-700 font-medium">Oublié ?</Link>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-primary-800 transition transform active:scale-95 flex items-center justify-center gap-2">
              {loading ? <Loader className="animate-spin" /> : "Se connecter"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Pas de compte ? <Link to="/inscription" className="text-primary-900 font-bold hover:underline">S'inscrire</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}