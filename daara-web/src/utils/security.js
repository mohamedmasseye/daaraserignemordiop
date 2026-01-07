import CryptoJS from 'crypto-js';

const SECRET_KEY = 'daara_lumiere_spirituelle_77'; 

export const secureStorage = {
  setItem: (key, value) => {
    try {
      // On s'assure de transformer en string avant de chiffrer
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(value), SECRET_KEY).toString();
      localStorage.setItem(key, encrypted);
    } catch (e) {
      console.error("Erreur lors de la sauvegarde sécurisée:", e);
    }
  },

  getItem: (key) => {
  const data = localStorage.getItem(key);
  if (!data) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    // ✅ Si le déchiffrement échoue ou est vide
    if (!decrypted) return null;

    // ✅ On n'utilise JSON.parse QUE si c'est un objet (comme les infos user)
    // Si c'est le token (qui commence par "eyJ"), on le renvoie tel quel
    try {
      return JSON.parse(decrypted);
    } catch (e) {
      return decrypted; // C'est le token brut
    }
  } catch (e) { 
    return null; 
  }
},
  removeItem: (key) => localStorage.removeItem(key)
};