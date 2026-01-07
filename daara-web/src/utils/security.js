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
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedString) {
        console.warn(`⚠️ Impossible de déchiffrer la clé : ${key}. La clé secrète a peut-être changé.`);
        return null;
      }

      return JSON.parse(decryptedString);
    } catch (e) {
      // Si ce n'est pas du JSON ou si le déchiffrement échoue
      console.error(`❌ Erreur de lecture pour ${key}:`, e.message);
      return null;
    }
  },

  removeItem: (key) => localStorage.removeItem(key)
};