import CryptoJS from 'crypto-js';
const SECRET_KEY = 'daara_lumiere_spirituelle_77'; // Garde cette clé secrète

export const secureStorage = {
  setItem: (key, value) => {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(value), SECRET_KEY).toString();
    localStorage.setItem(key, encrypted);
  },
  getItem: (key) => {
    const data = localStorage.getItem(key);
    if (!data) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) { return null; }
  },
  removeItem: (key) => localStorage.removeItem(key)
};