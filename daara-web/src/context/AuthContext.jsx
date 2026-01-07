import React, { createContext, useContext, useState, useEffect } from 'react';
import { secureStorage } from '../utils/security';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ ÉTAT CRITIQUE

  useEffect(() => {
    // Au démarrage, on synchronise une seule fois
    const t = secureStorage.getItem('_d_usr_vault');
    const u = secureStorage.getItem('_d_usr_info');
    const a = secureStorage.getItem('_d_adm_vault');
    
    if (t) setToken(t);
    if (u) setUser(u);
    if (a) setAdminToken(a);
    
    setLoading(false); // ✅ On libère l'application seulement ici
  }, []);

  const loginUser = (userData) => {
    secureStorage.setItem('_d_usr_vault', userData.token);
    secureStorage.setItem('_d_usr_info', userData.user);
    setToken(userData.token);
    setUser(userData.user);
  };

  const logout = () => {
    secureStorage.removeItem('_d_usr_vault');
    secureStorage.removeItem('_d_usr_info');
    secureStorage.removeItem('_d_adm_vault');
    setToken(null);
    setUser(null);
    setAdminToken(null);
    window.location.href = isAdmin ? '/portal-daara-admin-77' : '/login-public';
  };

  return (
    <AuthContext.Provider value={{ token, user, adminToken, loading, loginUser, logout, setAdminToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);