import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle } from 'lucide-react';
import { secureStorage } from '../../utils/security'; // ✅ IMPORT SÉCURITÉ

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
      const res = await axios.post(`/api/auth/login`, { 
        identifier: email, 
        password 
      });

      // ✅ VÉRIFICATION DU RÔLE (SÉCURITÉ SUPPLÉMENTAIRE)
      if (res.data.user.role !== 'admin') {
        setError("Accès refusé. Vous n'êtes pas administrateur.");
        return;
      }
      
      // ✅ STOCKAGE CHIFFRÉ DANS LE COFFRE ADMIN
      secureStorage.setItem('_d_adm_vault', res.data.token);
      secureStorage.setItem('_d_adm_info', res.data.user);
      
      // ✅ ON NETTOIE LE TOKEN PUBLIC POUR ÉVITER LES CONFLITS
      localStorage.removeItem('_d_usr_vault');

      navigate('/admin/dashboard'); 
    } catch (err) {
      setError(err.response?.data?.error || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-gold-50 w-20 h-20 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 shadow-inner">
             <Lock className="text-gold-600 h-10 w-10 -rotate-3" />
          </div>
          <h2 className="text-3xl font-bold text-primary-900 font-serif">Portail Sacré</h2>
          <p className="text-gray-400 mt-2 text-sm font-medium">Administration du Daara</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identifiant Maître</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-300" />
              <input 
                type="text" 
                className="block w-full pl-12 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gold-500 transition-all font-bold" 
                placeholder="Email ou Téléphone"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Clef d'accès</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-300" />
              <input 
                type="password" 
                className="block w-full pl-12 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gold-500 transition-all font-bold" 
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border border-red-100 animate-shake">
                <AlertCircle size={18}/> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-primary-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-gold-500 hover:text-primary-900 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {loading ? "Vérification..." : "Déverrouiller le Daara"}
          </button>
        </form>
      </div>
    </div>
  );
}