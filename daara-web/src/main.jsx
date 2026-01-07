import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'
import { secureStorage } from './utils/security' // ✅ Import de ton utilitaire de déchiffrement

// On force l'adresse HTTP (sans le S) pour contourner le problème de certificat
const API_URL = 'https://api.daaraserignemordiop.com';

// Configuration de base
axios.defaults.baseURL = API_URL; 
axios.defaults.withCredentials = true; 

// --- 🛡️ INTERCEPTEUR GLOBAL DE REQUÊTE ---
// Cet intercepteur s'exécute automatiquement avant chaque appel Axios
axios.interceptors.request.use(
  (config) => {
    // 1. On récupère le token via ton secureStorage (qui gère le déchiffrement AES)
    const token = secureStorage.getItem('_d_usr_vault') || secureStorage.getItem('_d_adm_vault');

    // 2. Si un token valide (déchiffré) est trouvé, on l'ajoute au header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)