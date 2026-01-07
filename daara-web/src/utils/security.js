import CryptoJS from 'crypto-js';
const SECRET_KEY = 'daara_lumiere_spirituelle_77'; 

export const secureStorage = {
  setItem: (key, value) => {
    // On transforme tout en texte avant de chiffrer
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const encrypted = CryptoJS.AES.encrypt(stringValue, SECRET_KEY).toString();
    localStorage.setItem(key, encrypted);
  },

  getItem: (key) => {
    const data = localStorage.getItem(key);
    if (!data) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) return null;

      // ✅ TENTATIVE INTELLIGENTE DE PARSE
      try {
        return JSON.parse(decrypted); // Pour les objets (user info)
      } catch {
        return decrypted; // Pour les chaînes brutes (token JWT)
      }
    } catch (e) {
      return null;
    }
  },
  removeItem: (key) => localStorage.removeItem(key)
};