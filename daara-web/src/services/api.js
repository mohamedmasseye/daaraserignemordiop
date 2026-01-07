import axios from 'axios';
import { secureStorage } from '../utils/security';

const API = axios.create({
  baseURL: 'https://api.daaraserignemordiop.com',
});

// ✅ INTERCEPTEUR : Injecte le token automatiquement
API.interceptors.request.use(
  (config) => {
    // 1. Récupération du token (secureStorage s'occupe de le déchiffrer)
    const token = secureStorage.getItem('_d_usr_vault') || secureStorage.getItem('_d_adm_vault');

    // 2. Si le token existe, on l'ajoute au header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optionnel : Gérer les erreurs 401/403 globalement (redirection vers login)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Session expirée ou invalide");
      // localStorage.clear(); // Optionnel : vider en cas d'erreur
      // window.location.href = '/login-public';
    }
    return Promise.reject(error);
  }
);

export default API;