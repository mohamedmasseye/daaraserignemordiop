// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// 👇 AJOUT IMPORTANT : On importe les outils d'authentification
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcBu_ebg9PHPW2Yzq4rdMymsEmcLdCAHA",
  authDomain: "daara-app-5a679.firebaseapp.com",
  projectId: "daara-app-5a679",
  storageBucket: "daara-app-5a679.firebasestorage.app",
  messagingSenderId: "1060878832216",
  appId: "1:1060878832216:web:1e26ab2371dfff293d702d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 👇 AJOUT IMPORTANT : On initialise et on EXPORTE l'auth pour l'utiliser ailleurs
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();