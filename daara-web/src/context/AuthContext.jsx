import React, { createContext, useContext, useState, useEffect } from 'react';
import { secureStorage } from '../utils/security';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(secureStorage.getItem('_d_usr_info'));
    const [token, setToken] = useState(secureStorage.getItem('_d_usr_vault'));
    const [adminToken, setAdminToken] = useState(secureStorage.getItem('_d_adm_vault'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialisation au démarrage
        const t = secureStorage.getItem('_d_usr_vault');
        const a = secureStorage.getItem('_d_adm_vault');
        const u = secureStorage.getItem('_d_usr_info');
        setToken(t);
        setAdminToken(a);
        setUser(u);
        setLoading(false);
    }, []);

    const loginUser = (userData) => {
        secureStorage.setItem('_d_usr_vault', userData.token);
        secureStorage.setItem('_d_usr_info', userData.user);
        localStorage.removeItem('_d_adm_vault');
        setToken(userData.token);
        setUser(userData.user);
        setAdminToken(null);
    };

    const logout = () => {
        secureStorage.removeItem('_d_usr_vault');
        secureStorage.removeItem('_d_usr_info');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, adminToken, loading, loginUser, logout, setAdminToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);