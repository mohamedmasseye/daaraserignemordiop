import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios' // <--- 1. On importe Axios
import './index.css'
import App from './App.jsx'

// <--- 2. On configure l'adresse de base pour toute l'application
// Si une variable VITE_API_URL existe (sur Coolify), on l'utilise.
// Sinon (sur votre ordi), on utilise localhost:5000.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)