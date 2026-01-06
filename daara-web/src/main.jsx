import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// On force l'adresse HTTP (sans le S) pour contourner le problème de certificat
const API_URL = 'https://api.daaraserignemordiop.com';

// 🛑 MODIFICATION ICI : On enlève le "import.meta.env..." pour ce test
axios.defaults.baseURL = API_URL; 
axios.defaults.withCredentials = true; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)