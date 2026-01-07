import React, { createContext, useContext, useState, useEffect } from 'react';
import { secureStorage } from '../utils/security';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lecture initiale au chargement de l'app
    const savedToken = secureStorage.getItem('_d_usr_vault');
    const savedUser = secureStorage.getItem('_d_usr_info');
    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(savedUser);
    setLoading(false);
  }, []);

  const loginUser = (userData) => {
    // 1. On stocke d'abord
    secureStorage.setItem('_d_usr_vault', userData.token);
    secureStorage.setItem('_d_usr_info', userData.user);
    // 2. On met à jour l'état React (déclenche le re-render)
    setToken(userData.token);
    setUser(userData.user);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, loginUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);