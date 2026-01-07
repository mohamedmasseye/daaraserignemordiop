import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, CheckCircle, Loader, ArrowLeft } from 'lucide-react';

// --- IMPORTS SÉCURITÉ & CONTEXTE ---
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// --- IMPORTS CAPACITOR & FIREBASE ---
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase"; 

export default function Register() {
  const navigate = useNavigate();
  const { loginUser, token } = useAuth(); // ✅ Utilisation du contexte
  
  const [formData, setFormData] = useState({ fullName: '', identifier: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🛡️ REDIRECTION RÉACTIVE : Si on est connecté, on part vers le profil
  useEffect(() => {
    if (token) {
      navigate('/profil', { replace: true });
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      let idToken;
      if (Capacitor.isNativePlatform()) {
        const nativeUser = await GoogleAuth.signIn();
        idToken = nativeUser.authentication.idToken;
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        idToken = await result.user.getIdToken();
      }

      const endpoint = Capacitor.isNativePlatform() ? '/api/auth/google-mobile' : '/api/auth/google';
      const res = await API.post(endpoint, { token: idToken });

      if (res.data && res.data.token) {
        loginUser(res.data); // ✅ Met à jour le contexte global
      }
    } catch (err) {
      console.error("Erreur Inscription Google:", err);
      setError("Impossible de s'inscrire avec Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError("Les mots de passe ne correspondent pas.");
    
    setLoading(true);
    try {
      // 1. Inscription
      await API.post('/api/auth/register', formData);
      
      // 2. Connexion automatique
      const loginRes = await API.post('/api/auth/login', {
        identifier: formData.identifier,
        password: formData.password
      });

      if (loginRes.data && loginRes.data.token) {
        loginUser(loginRes.data); // ✅ Met à jour le contexte global
      }
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-full h-[40vh] bg-primary-900 rounded-b-[50%] scale-x-150 z-0"></div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-gray-100">
        <div className="p-8 pb-4 text-center">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Créer un compte</h1>
          <p className="text-gray-500 mt-2">Rejoignez la communauté</p>
        </div>

        <div className="px-8 pb-10">
          <button type="button" onClick={handleGoogleRegister} disabled={loading} className="w-full mb-6 py-3 border border-gray-300 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition font-bold text-gray-700 shadow-sm disabled:opacity-50">
            {loading ? <Loader className="animate-spin text-primary-900" size={20} /> : (
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
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center">{error}</div>}

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nom Complet</label>
              <div className="relative mt-1">
                <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input type="text" name="fullName" required placeholder="Prénom Nom" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" value={formData.fullName} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email ou Téléphone</label>
              <div className="relative mt-1">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input type="text" name="identifier" required placeholder="exemple@mail.com" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" value={formData.identifier} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mot de passe</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input type="password" name="password" required placeholder="••••••" className="w-full pl-10 pr-2 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm" value={formData.password} onChange={handleChange} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Confirmer</label>
                <div className="relative mt-1">
                  <CheckCircle className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input type="password" name="confirmPassword" required placeholder="••••••" className="w-full pl-10 pr-2 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm" value={formData.confirmPassword} onChange={handleChange} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-primary-800 transition transform active:scale-95 flex items-center justify-center gap-2 mt-4">
              {loading ? <Loader className="animate-spin" /> : "Créer mon compte"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">Déjà membre ? <Link to="/login-public" className="text-primary-900 font-bold hover:underline">Se connecter</Link></p>
            <Link to="/" className="text-gray-400 text-xs mt-4 flex items-center justify-center gap-1"><ArrowLeft size={12}/> Accueil</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}