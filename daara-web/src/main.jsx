import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// --- CORRECTION ICI ---
// On met l'adresse Coolify en "roue de secours" (fallback) au lieu de localhost
const API_URL = 'https://jcwwc8sgs480c0goww848og0.91.99.200.188.sslip.io';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || API_URL;
axios.defaults.withCredentials = true; // Important pour les cookies/sessions
// ---------------------

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)