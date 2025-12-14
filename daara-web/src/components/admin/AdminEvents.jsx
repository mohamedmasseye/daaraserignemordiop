import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trash2, Plus, Calendar, Edit, Ticket, DollarSign, Users, 
  Image as ImageIcon, X, Download, QrCode, Loader, Paperclip, 
  FileText, MapPin, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout';

// --- COMPOSANT VUE BILLET (Impression) ---
const AdminTicketView = ({ ticket, onClose }) => {
  const handlePrint = () => { window.print(); };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 print:p-0 print:bg-white print:fixed print:inset-0">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row print:shadow-none print:w-full print:h-full print:rounded-none print:border-none">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/10 rounded-full print:hidden hover:bg-black/20"><X size={24} className="text-white md:text-gray-600"/></button>
        <div className="w-full md:w-2/3 bg-primary-900 text-white p-8 md:p-12 relative overflow-hidden flex flex-col justify-between print:bg-black print:text-white">
           <div className="relative z-10">
             <div className="inline-block px-3 py-1 border border-gold-500/50 rounded-full text-xs font-bold text-gold-400 uppercase tracking-widest mb-6">Billet Officiel Daara</div>
             <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight mb-4 text-white">{ticket.eventTitle || "Événement"}</h2>
             <div className="grid grid-cols-2 gap-8 text-primary-200">
               <div><p className="text-xs uppercase tracking-wider text-gold-500 mb-1">Date Achat</p><p className="font-serif text-xl text-white">{new Date(ticket.purchaseDate).toLocaleDateString()}</p></div>
               <div><p className="text-xs uppercase tracking-wider text-gold-500 mb-1">Prix Unitaire</p><p className="font-serif text-xl text-white">{ticket.price} F</p></div>
             </div>
           </div>
           <div className="relative z-10 mt-8 md:mt-0 flex items-end justify-between border-t border-white/10 pt-4">
             <div><p className="text-xs text-primary-400 mb-1">Acheteur</p><p className="font-bold text-lg">{ticket.userName}</p></div>
             <div className="text-right"><p className="text-3xl font-bold text-gold-400">x{ticket.quantity}</p></div>
           </div>
        </div>
        <div className="w-full md:w-1/3 bg-white p-8 border-l-4 border-dashed border-gray-200 relative flex flex-col items-center justify-center text-center">
           <div className="bg-white p-2 border-2 border-gold-500 rounded-xl mb-4 shadow-sm"><QrCode size={120} className="text-primary-900" /></div>
           <p className="text-xs font-mono text-gray-500 mb-6 text-center break-all">ID: {ticket._id}</p>
           <button onClick={handlePrint} className="bg-primary-900 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gold-500 transition-colors print:hidden shadow-lg"><Download size={16}/> Imprimer</button>
        </div>
      </motion.div>
    </div>
  );
};

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedEventForStats, setSelectedEventForStats] = useState(null);
  const [ticketToPrint, setTicketToPrint] = useState(null);
  
  // États Modification
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title: '', description: '', date: '', location: '', locationLink: '', isOnline: false,
    hasTicket: false, ticketPrice: 0, ticketStock: 0 
  });
  const [imageFile, setImageFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);

  // --- 1. CHARGEMENT DES DONNÉES ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const eventsRes = await axios.get('http://https://daara-app.onrender.com/api/events');
      setEvents(eventsRes.data);

      // Récupération des tickets vendus depuis les commandes
      const ordersRes = await axios.get('http://https://daara-app.onrender.com/api/orders');
      const extractedTickets = [];
      ordersRes.data.forEach(order => {
          if (order.status !== 'Cancelled') {
              order.items.forEach(item => {
                  if (item.type === 'ticket') {
                      extractedTickets.push({
                          _id: order._id,
                          eventId: item.ticketEvent || item.product,
                          eventTitle: item.name.replace('Ticket - ', ''),
                          userName: order.user ? order.user.fullName : 'Anonyme',
                          userEmail: order.user ? order.user.email : 'N/A',
                          quantity: item.quantity,
                          price: item.price,
                          totalPrice: item.price * item.quantity,
                          purchaseDate: order.createdAt
                      });
                  }
              });
          }
      });
      setAllTickets(extractedTickets);
    } catch (e) { console.error("Erreur chargement", e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const getEventStats = (eventId) => {
    const eventTickets = allTickets.filter(t => String(t.eventId) === String(eventId));
    const totalSold = eventTickets.reduce((acc, t) => acc + (t.quantity || 0), 0);
    const totalRevenue = eventTickets.reduce((acc, t) => acc + (t.totalPrice || 0), 0);
    return { totalSold, totalRevenue, eventTickets };
  };

  // --- 2. GESTION FORMULAIRE ---
  const handleEditClick = (event) => {
      setIsEditing(true);
      setEditId(event._id);
      setIsFormVisible(true);
      setFormData({
          title: event.title,
          description: event.description,
          date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
          location: event.location || '',
          locationLink: event.locationLink || '',
          isOnline: event.isOnline,
          hasTicket: event.hasTicket,
          ticketPrice: event.ticketPrice || 0,
          ticketStock: event.ticketStock || 0
      });
      setImageFile(null); 
      setDocumentFile(null); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        
        if (imageFile) data.append('eventImage', imageFile);
        if (documentFile) data.append('eventDocument', documentFile);

        const token = localStorage.getItem('token'); // Token de sécurité
        const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };

        if (isEditing) {
            await axios.put(`http://https://daara-app.onrender.com/api/events/${editId}`, data, config);
            alert("Événement modifié avec succès !");
        } else {
            await axios.post('http://https://daara-app.onrender.com/api/events', data, config);
            alert("Événement créé avec succès !");
        }
        
        closeForm();
        fetchData(); 
    } catch (err) { 
        console.error(err); 
        alert("Erreur lors de l'enregistrement. Vérifiez votre connexion."); 
    } finally {
        setUploading(false);
    }
  };

  const closeForm = () => {
    setIsFormVisible(false);
    setIsEditing(false);
    setEditId(null);
    setFormData({ title: '', description: '', date: '', location: '', locationLink: '', isOnline: false, hasTicket: false, ticketPrice: 0, ticketStock: 0 });
    setImageFile(null);
    setDocumentFile(null);
  };

  const handleDelete = async (id) => {
    if(window.confirm("Voulez-vous vraiment supprimer cet événement ?")) {
      try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://https://daara-app.onrender.com/api/events/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setEvents(events.filter(e => e._id !== id));
      } catch (err) { alert("Erreur suppression (Token invalide ?)"); }
    }
  };

  return (
    <AdminLayout>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 font-serif flex items-center gap-3"><Calendar className="text-gold-500" size={32} /> Gestion Agenda</h1>
            <p className="text-gray-500 mt-2">{events.length} événements programmés</p>
          </div>
          <button onClick={() => { closeForm(); setIsFormVisible(true); }} className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 ${isFormVisible ? 'bg-white text-gray-700 border border-gray-200' : 'bg-primary-900 text-white hover:bg-primary-800'}`}>
            {isFormVisible ? <><X size={20}/> Fermer</> : <><Plus size={20}/> Nouvel Événement</>}
          </button>
        </div>

        {/* --- FORMULAIRE --- */}
        <AnimatePresence>
        {isFormVisible && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-10">
              <div className="bg-primary-900 p-6 text-white flex justify-between items-center">
                  <h2 className="font-bold text-xl flex gap-2">
                      {isEditing ? <><Edit/> Modifier l'événement</> : <><Plus/> Ajouter un événement</>}
                  </h2>
                  <button onClick={closeForm} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={20}/></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* COLONNE GAUCHE */}
                <div className="md:col-span-2 space-y-5 border-r md:pr-8 border-gray-100">
                    <h3 className="text-lg font-bold text-primary-900 border-b pb-2 mb-4">Informations Générales</h3>
                    
                    <div><label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Titre</label><input className="w-full p-3 border rounded-xl" value={formData.title} onChange={e=>setFormData({...formData, title:e.target.value})} required/></div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1"><Clock size={14}/> Date & Heure</label><input type="datetime-local" className="w-full p-3 border rounded-xl" value={formData.date} onChange={e=>setFormData({...formData, date:e.target.value})} required/></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1"><MapPin size={14}/> Lieu</label><input className="w-full p-3 border rounded-xl" value={formData.location} onChange={e=>setFormData({...formData, location:e.target.value})}/></div>
                    </div>

                    <div><label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Lien (URL)</label><input className="w-full p-3 border rounded-xl" value={formData.locationLink} onChange={e=>setFormData({...formData, locationLink:e.target.value})}/></div>

                    <div><label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Description</label><textarea className="w-full p-3 border rounded-xl h-32 resize-none" value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})}/></div>

                    <label className="flex items-center gap-2 font-bold cursor-pointer text-gray-700">
                      <input type="checkbox" checked={formData.isOnline} onChange={e=>setFormData({...formData, isOnline:e.target.checked})} className="w-5 h-5 accent-gold-500"/> Événement en Ligne
                    </label>
                </div>

                {/* COLONNE DROITE */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-primary-900 border-b pb-2 mb-4">Médias & Billets</h3>
                    
                    <div className="p-4 bg-gray-50 rounded-xl space-y-4 border border-gray-100">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1"><ImageIcon size={14}/> Affiche</label>
                            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full p-2 bg-white border rounded-lg text-sm"/>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1"><FileText size={14}/> Programme PDF</label>
                            <input type="file" accept=".pdf" onChange={e => setDocumentFile(e.target.files[0])} className="w-full p-2 bg-white border rounded-lg text-sm"/>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border ${formData.hasTicket ? 'bg-gold-50 border-gold-300' : 'bg-gray-50 border-gray-100'}`}>
                      <label className="flex items-center gap-2 font-bold cursor-pointer text-primary-900 mb-2">
                        <input type="checkbox" checked={formData.hasTicket} onChange={e=>setFormData({...formData, hasTicket:e.target.checked})} className="w-5 h-5 accent-gold-500"/> Activer Billetterie
                      </label>
                      {formData.hasTicket && (
                        <div className="flex gap-4 mt-3">
                           <div className="flex-1"><span className="text-xs font-bold uppercase text-gray-500">Prix (F)</span><input type="number" min="0" className="w-full p-2 border rounded-lg" value={formData.ticketPrice} onChange={e=>setFormData({...formData, ticketPrice:e.target.value})}/></div>
                           <div className="flex-1"><span className="text-xs font-bold uppercase text-gray-500">Stock</span><input type="number" min="0" className="w-full p-2 border rounded-lg" value={formData.ticketStock} onChange={e=>setFormData({...formData, ticketStock:e.target.value})}/></div>
                        </div>
                      )}
                    </div>
                    
                    <button disabled={uploading} type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg mt-4 flex justify-center">
                        {uploading ? <Loader className="animate-spin"/> : (isEditing ? "Enregistrer" : "Publier")}
                    </button>
                </div>
              </form>
          </motion.div>
        )}
        </AnimatePresence>

        {/* LISTE DES EVENEMENTS */}
        <div className="space-y-4">
          {loading ? <div className="text-center py-20"><Loader className="animate-spin mx-auto text-primary-900"/></div> : events.length === 0 ? (
             <div className="text-center py-20 text-gray-400 bg-white rounded-3xl border-2 border-dashed">Aucun événement programmé.</div>
          ) : (
            events.map((event) => {
              const stats = getEventStats(event._id);
              return (
                <div key={event._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 hover:shadow-lg transition">
                   <div className="flex items-center gap-4 flex-1 w-full">
                      <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        {event.image ? <img src={event.image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon/></div>}
                      </div>
                      <div className="flex-1">
                          <h3 className="font-bold text-xl text-primary-900">{event.title}</h3>
                          <p className="text-sm text-gray-500 mb-2 flex items-center gap-2"><Calendar size={14}/> {new Date(event.date).toLocaleDateString()}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {event.documentUrl && <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-lg text-xs font-bold border border-purple-100 flex items-center gap-1"><Paperclip size={12}/> PDF</span>}
                            {event.hasTicket && <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-bold border border-green-100 flex items-center gap-1"><DollarSign size={12}/> {stats.totalRevenue.toLocaleString()} F</span>}
                          </div>
                      </div>
                   </div>
                   <div className="flex gap-2 w-full md:w-auto justify-end">
                      {event.hasTicket && <button onClick={() => setSelectedEventForStats({ ...event, ...stats })} className="p-2 bg-primary-900 text-white rounded-xl hover:bg-gold-500 transition-colors" title="Participants"><Users size={20}/></button>}
                      <button onClick={() => handleEditClick(event)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-gray-200"><Edit size={20} /></button>
                      <button onClick={() => handleDelete(event._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-gray-200"><Trash2 size={20} /></button>
                   </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL STATS */}
        <AnimatePresence>
          {selectedEventForStats && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
                  <div className="bg-primary-900 p-6 text-white flex justify-between items-start shrink-0">
                     <div><h2 className="font-bold text-2xl font-serif mb-1">{selectedEventForStats.title}</h2><p className="text-gold-400 text-sm flex items-center gap-2">Liste des participants</p></div>
                     <button onClick={() => setSelectedEventForStats(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={20}/></button>
                  </div>
                  <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                       <table className="w-full text-left border-collapse">
                          <thead className="bg-gray-50 border-b border-gray-200">
                             <tr><th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Nom</th><th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Date</th><th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase text-center">Qté</th><th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase text-right">Action</th></tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                             {selectedEventForStats.eventTickets.map((t, i) => (
                               <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                                  <td className="py-4 px-6"><p className="font-bold text-gray-900">{t.userName}</p><p className="text-xs text-gray-500">{t.userEmail}</p></td>
                                  <td className="py-4 px-6 text-sm text-gray-600">{new Date(t.purchaseDate).toLocaleDateString()}</td>
                                  <td className="py-4 px-6 text-center font-bold text-primary-900">{t.quantity}</td>
                                  <td className="py-4 px-6 text-right"><button onClick={() => setTicketToPrint(t)} className="text-primary-600 hover:text-primary-800 text-sm font-bold flex items-center justify-end gap-1 ml-auto"><Ticket size={16}/> Voir</button></td>
                               </tr>
                             ))}
                             {selectedEventForStats.eventTickets.length === 0 && <tr><td colSpan="4" className="py-12 text-center text-gray-400 italic">Aucune vente pour le moment.</td></tr>}
                          </tbody>
                       </table>
                     </div>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        {/* MODAL IMPRESSION BILLET */}
        {ticketToPrint && <AdminTicketView ticket={ticketToPrint} onClose={() => setTicketToPrint(null)} />}
    </AdminLayout>
  );
}