import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ CORRECTION 1 : On envoie "identifier" (langage du serveur)
      const API_URL = 'https://daara-app.onrender.com';
      const res = await axios.post(`${API_URL}/api/auth/login`, { 
        identifier: email, 
        password 
      });

      
      // ✅ CORRECTION 2 : On stocke sous le nom 'token' (pas 'daara_token')
      localStorage.setItem('token', res.data.token);
      
      // On sauvegarde les infos user pour l'affichage
      localStorage.setItem('user_info', JSON.stringify(res.data.user));
      
      // Redirection vers les utilisateurs
      navigate('/admin/users'); 
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <Lock className="text-primary-900 h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 font-serif">Espace Admin</h2>
          <p className="text-gray-500 mt-2">Connectez-vous pour gérer le Daara.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email ou Téléphone</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                className="block w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition" 
                placeholder="admin@daara.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Mot de passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="password" 
                className="block w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition" 
                placeholder="••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16}/> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-primary-900 hover:bg-gold-500 hover:text-primary-900 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Connexion..." : "Accéder au tableau de bord"}
          </button>
        </form>
      </div>
    </div>
  );
}