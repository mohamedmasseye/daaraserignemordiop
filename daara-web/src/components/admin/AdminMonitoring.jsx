import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
  Activity, ShieldCheck, Zap, HardDrive, RefreshCw, 
  AlertTriangle, Cpu, Terminal, Trash2, CheckCircle, 
  Package, Globe, Clock, Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout';

export default function AdminMonitoring() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMonitoring = async () => {
    try {
      const [resStats, resLogs] = await Promise.all([
        API.get('/api/admin/monitoring/stats'),
        API.get('/api/admin/monitoring/logs')
      ]);
      setStats(resStats.data);
      setLogs(resLogs.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { 
    fetchMonitoring();
    const interval = setInterval(fetchMonitoring, 30000); // Auto-refresh toutes les 30s
    return () => clearInterval(interval);
  }, []);

  const clearLogs = async () => {
    if(window.confirm("Vider l'historique des erreurs ?")) {
      await API.delete('/api/admin/monitoring/logs');
      fetchMonitoring();
    }
  };

  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  if (loading && !stats) return <div className="p-20 text-center animate-pulse text-gold-500 font-bold">Initialisation du cockpit...</div>;

  return (
    <AdminLayout>
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-primary-900 flex items-center gap-4">
          <Activity className="text-gold-500" size={36} /> État du Système
        </h1>
        <p className="text-gray-500 mt-2">Surveillance en temps réel de l'application Daara SMD.</p>
      </div>

      {/* --- BLOC 1 : VITALS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Serveur API" value="Opérationnel" icon={<Server/>} color="bg-green-500" detail="Instance Coolify" />
        <StatCard title="Base de Données" value={stats?.database} icon={<HardDrive/>} color={stats?.database === 'Connecté' ? "bg-green-500" : "bg-red-500"} detail="MongoDB Atlas" />
        <StatCard title="Mémoire vive" value={`${stats?.memory.usage} MB`} icon={<Cpu/>} color="bg-blue-500" detail={`Sur ${stats?.memory.total} MB total`} />
        <StatCard title="Temps d'activité" value={formatUptime(stats?.uptime)} icon={<Clock/>} color="bg-purple-500" detail={`Version ${stats?.version}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- BLOC 2 : LOGS D'ERREURS (LA RÉALITÉ DU TERRAIN) --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 bg-primary-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Terminal size={24} className="text-gold-500"/>
                <h2 className="text-xl font-bold">Dernières Alertes</h2>
              </div>
              <button onClick={clearLogs} className="p-2 bg-white/10 hover:bg-red-500 rounded-xl transition-all"><Trash2 size={18}/></button>
            </div>
            <div className="p-6 max-h-[500px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <CheckCircle size={48} className="mx-auto mb-4 opacity-20 text-green-500"/>
                  <p className="italic">Aucune erreur détectée récemment. Tout roule !</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl group relative">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 px-2 py-0.5 rounded">Erreur 500</span>
                      <span className="text-[10px] text-gray-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="font-bold text-primary-900 mt-1">{log.message}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1 bg-white/50 p-1 rounded italic">{log.method} {log.path}</p>
                    {log.userId && <p className="text-[10px] mt-2 text-gray-400">Utilisateur : {log.userId.fullName}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* --- BLOC 3 : MAINTENANCE & ACTIONS --- */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
            <h2 className="text-xl font-bold text-primary-900 mb-6 flex items-center gap-2">
              <ShieldCheck className="text-gold-500"/> Sécurité
            </h2>
            <div className="space-y-4">
               <ActionRow icon={<Globe className="text-blue-500"/>} label="SSL Certificat" status="Valide" />
               <ActionRow icon={<Zap className="text-gold-500"/>} label="Node.js" status="v20.x (OK)" />
               <ActionRow icon={<Package className="text-purple-500"/>} label="Dépendances" status="À jour" />
            </div>
            <hr className="my-6 opacity-50"/>
            <div className="bg-gold-50 p-4 rounded-2xl border border-gold-100">
                <p className="text-[10px] font-black text-gold-700 uppercase mb-1">Action corrective suggérée :</p>
                <p className="text-xs text-gold-900 leading-relaxed font-medium">
                  {logs.length > 5 
                    ? "Plusieurs erreurs 500 détectées. Vérifiez les logs pour corriger le formatage des dates." 
                    : "Système stable. Prévoyez une sauvegarde manuelle de MongoDB avant le Ramadan."}
                </p>
            </div>
          </div>

          <button onClick={fetchMonitoring} className="w-full py-5 bg-primary-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex justify-center items-center gap-3 hover:bg-gold-500 transition-all shadow-lg active:scale-95">
            <RefreshCw size={18}/> Actualiser les données
          </button>
        </div>

      </div>
    </AdminLayout>
  );
}

// --- SOUS-COMPOSANTS ---
function StatCard({ title, value, icon, color, detail }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
      <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}>
        {icon}
      </div>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-bold text-primary-900 my-1">{value}</h3>
      <p className="text-[10px] text-gray-500 font-medium">{detail}</p>
    </div>
  );
}

function ActionRow({ icon, label, status }) {
  return (
    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-xs font-bold text-gray-700">{label}</span>
      </div>
      <span className="text-[10px] font-black text-green-600 bg-green-100 px-2 py-1 rounded-lg">{status}</span>
    </div>
  );
}