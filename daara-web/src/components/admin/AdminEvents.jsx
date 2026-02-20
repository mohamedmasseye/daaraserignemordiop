import React, { useState, useEffect } from 'react';
import API from '../../services/api'; // ✅ Utilise l'instance sécurisée
import { 
  Trash2, Plus, Calendar, Edit, Ticket, DollarSign, Users, 
  Image as ImageIcon, X, Download, QrCode, Loader, Paperclip, 
  FileText, MapPin, Clock, Bell, ArrowUpRight, CheckCircle2, 
  AlertCircle, Tag, AlignLeft, Link as LinkIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout';

// ✅ Style réutilisable pour les champs bien encadrés
const inputStyle = "w-full mt-1 p-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none font-bold transition-all duration-200 placeholder:text-gray-300";

const AdminTicketView = ({ ticket, onClose }) => {
  const handlePrint = () => { window.print(); };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-primary-950/90 backdrop-blur-md p-4 print:p-0 print:bg-white">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-4xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row print:rounded-none">
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full print:hidden transition-colors"><X size={24} className="text-gray-600"/></button>
        
        <div className="w-full md:w-2/3 bg-primary-900 text-white p-10 md:p-14 relative overflow-hidden flex flex-col justify-between print:bg-black">
            <div className="absolute top-0 right-0 p-10 opacity-10"><Ticket size={200} /></div>
            <div className="relative z-10">
              <span className="inline-block px-4 py-1.5 bg-gold-500/20 border border-gold-500/30 rounded-full text-xs font-black text-gold-400 uppercase tracking-[0.2em] mb-8">Billet Officiel Daara</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-6">{ticket.eventTitle}</h2>
              <div className="flex gap-12">
                <div><p className="text-[10px] uppercase tracking-widest text-gold-500/60 mb-2 font-bold">Date de l'événement</p><p className="font-serif text-2xl">{new Date(ticket.purchaseDate).toLocaleDateString()}</p></div>
                <div><p className="text-[10px] uppercase tracking-widest text-gold-500/60 mb-2 font-bold">Prix Unitaire</p><p className="font-serif text-2xl">{ticket.price} F</p></div>
              </div>
            </div>
            <div className="relative z-10 mt-12 flex items-end justify-between border-t border-white/10 pt-6">
              <div><p className="text-[10px] uppercase tracking-widest text-primary-400 mb-2 font-bold">Détenteur du billet</p><p className="font-bold text-xl">{ticket.userName}</p></div>
              <div className="text-right"><p className="text-5xl font-bold text-gold-500">x{ticket.quantity}</p></div>
            </div>
        </div>

        <div className="w-full md:w-1/3 bg-white p-10 border-l-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-gray-50 rounded-3xl mb-6 border border-gray-100"><QrCode size={140} className="text-primary-900" /></div>
            <p className="text-[10px] font-mono text-gray-400 mb-8 uppercase tracking-tighter">Ref: {ticket._id?.slice(-12)}</p>
            <button onClick={handlePrint} className="w-full py-4 bg-primary-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gold-500 transition-all shadow-xl print:hidden active:scale-95"><Download size={20}/> Imprimer le billet</button>
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
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title: '', description: '', date: '', location: '', locationLink: '', isOnline: false,
    hasTicket: false, ticketPrice: 0, ticketStock: 0, isDaily: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const eventsRes = await API.get('/api/events');
      setEvents(eventsRes.data || []);

      try {
        const ordersRes = await API.get('/api/orders'); 
        const extractedTickets = [];
        (ordersRes.data || []).forEach(order => {
          if (order.status !== 'Cancelled') {
            (order.items || []).forEach(item => {
              if (item.type === 'ticket') {
                extractedTickets.push({
                  _id: order._id,
                  eventId: item.ticketEvent || item.product,
                  eventTitle: item.name?.replace('Ticket - ', '') || 'Événement',
                  userName: order.user?.fullName || 'Anonyme',
                  userEmail: order.user?.email || 'N/A',
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
      } catch (orderErr) {
        console.error("Erreur stats billets :", orderErr);
      }
    } catch (e) {
      console.error("Erreur fetchData :", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBroadcastEvent = async (event) => {
    if (!window.confirm(`Diffuser une notification pour : ${event.title} ?`)) return;
    try {
      await API.post('/api/notifications', {
        title: "📅 Nouvel Événement !",
        body: `${event.title}. Cliquez pour voir les détails et réserver.`,
        type: 'info',
        url: `/evenements?id=${event._id}` 
      });
      alert("🚀 Notification diffusée !");
    } catch (err) { alert("Erreur lors de la diffusion."); }
  };

  const getEventStats = (eventId) => {
    const eventTickets = allTickets.filter(t => String(t.eventId) === String(eventId));
    return { 
        totalSold: eventTickets.reduce((acc, t) => acc + (t.quantity || 0), 0), 
        totalRevenue: eventTickets.reduce((acc, t) => acc + (t.totalPrice || 0), 0), 
        eventTickets 
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (imageFile) data.append('eventImage', imageFile);
        if (documentFile) data.append('eventDocument', documentFile);

        if (isEditing) await API.put(`/api/events/${editId}`, data);
        else await API.post('/api/events', data);
        
        closeForm();
        fetchData();
        alert("Opération réussie !");
    } catch (err) { alert("Erreur d'enregistrement."); } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ Supprimer définitivement cet événement ?")) return;
    try {
      await API.delete(`/api/events/${id}`);
      setEvents(events.filter(e => e._id !== id));
      alert("Supprimé.");
    } catch (error) { alert("Erreur suppression."); }
  };

  const closeForm = () => {
    setIsFormVisible(false); setIsEditing(false); setEditId(null);
    setFormData({ title: '', description: '', date: '', location: '', locationLink: '', isOnline: false, hasTicket: false, ticketPrice: 0, ticketStock: 0, isDaily: false });
    setImageFile(null); setDocumentFile(null);
  };

  const handleEditClick = (event) => {
      setIsEditing(true); setEditId(event._id); setIsFormVisible(true);
      setFormData({
          title: event.title, description: event.description,
          date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
          location: event.location || '', locationLink: event.locationLink || '',
          isOnline: event.isOnline, hasTicket: event.hasTicket,
          ticketPrice: event.ticketPrice || 0, ticketStock: event.ticketStock || 0,
          isDaily: event.isDaily || false
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AdminLayout>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-primary-900 flex items-center gap-4">
                <div className="p-3 bg-gold-500 rounded-2xl text-white shadow-lg shadow-gold-500/20"><Calendar size={28} /></div>
                Agenda Spirituel
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Gérez vos célébrations et billetteries.</p>
          </div>
          <button 
            onClick={() => { isFormVisible ? closeForm() : setIsFormVisible(true); }} 
            className={`px-8 py-4 rounded-2xl font-bold shadow-xl transition-all flex items-center gap-3 active:scale-95 ${isFormVisible ? 'bg-white text-gray-600 border border-gray-200' : 'bg-primary-900 text-white hover:bg-primary-800'}`}
          >
            {isFormVisible ? <><X size={20}/> Annuler</> : <><Plus size={20}/> Créer un événement</>}
          </button>
        </div>

        <AnimatePresence>
        {isFormVisible && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden mb-12">
              <div className="bg-primary-900 p-8 text-white flex justify-between items-center">
                  <h2 className="text-xl font-bold flex items-center gap-3">{isEditing ? <><Edit size={20} className="text-gold-500"/> Modifier l'événement</> : <><Plus size={20} className="text-gold-500"/> Nouvel événement</>}</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-6">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1 flex items-center gap-2"><Tag size={12}/> Nom de l'événement</label>
                          <input className={inputStyle} value={formData.title} onChange={e=>setFormData({...formData, title:e.target.value})} required placeholder="Ex: Grand Gamou Annuel"/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1 flex items-center gap-2"><Clock size={12}/> Date & Heure</label>
                              <input type="datetime-local" className={inputStyle} value={formData.date} onChange={e=>setFormData({...formData, date:e.target.value})} required/>
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1 flex items-center gap-2"><MapPin size={12}/> Lieu</label>
                              <input className={inputStyle} value={formData.location} onChange={e=>setFormData({...formData, location:e.target.value})} placeholder="Ville, Quartier..."/>
                            </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1 flex items-center gap-2"><AlignLeft size={12}/> Description détaillée</label>
                          <textarea className={`${inputStyle} h-40 resize-none font-medium`} value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} placeholder="Présentez l'événement..."/>
                        </div>
                    </div>
                </div>
                <div className="space-y-8 bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Options & Médias</label>
                        <div className="grid grid-cols-1 gap-4">
                            {/* RECURRENCE QUOTIDIENNE */}
                            <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.isDaily ? 'bg-primary-900 text-white border-primary-950' : 'bg-white border-gray-200 text-gray-400 hover:border-gold-500'}`}>
                                <label className="flex items-center gap-3 font-bold text-xs uppercase cursor-pointer">
                                    <input type="checkbox" checked={formData.isDaily} onChange={e=>setFormData({...formData, isDaily:e.target.checked})} className="w-5 h-5 rounded-lg accent-gold-500"/> 
                                    <Clock size={16}/> Événement Quotidien
                                </label>
                            </div>

                            <div className="relative group">
                              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10"/>
                              <div className="p-4 bg-white border-2 border-dashed border-gray-200 rounded-xl text-center group-hover:border-gold-500 transition-colors">
                                <ImageIcon className="mx-auto text-gray-400 mb-2"/> 
                                <span className="text-xs font-bold text-gray-500 truncate block">{imageFile ? imageFile.name : "Affiche (JPG/PNG)"}</span>
                              </div>
                            </div>
                            <div className="relative group">
                              <input type="file" accept=".pdf" onChange={e => setDocumentFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10"/>
                              <div className="p-4 bg-white border-2 border-dashed border-gray-200 rounded-xl text-center group-hover:border-gold-500 transition-colors">
                                <FileText className="mx-auto text-gray-400 mb-2"/> 
                                <span className="text-xs font-bold text-gray-500 truncate block">{documentFile ? documentFile.name : "Programme (PDF)"}</span>
                              </div>
                            </div>
                        </div>
                    </div>
                    <div className={`p-6 rounded-2xl border-2 transition-all ${formData.hasTicket ? 'bg-gold-500 text-white border-gold-600 shadow-lg shadow-gold-500/20' : 'bg-white border-gray-100 text-gray-400'}`}>
                        <label className="flex items-center gap-3 font-black uppercase text-[10px] tracking-widest cursor-pointer"><input type="checkbox" checked={formData.hasTicket} onChange={e=>setFormData({...formData, hasTicket:e.target.checked})} className="w-5 h-5 rounded-lg accent-primary-900"/> Activer la Billetterie</label>
                        {formData.hasTicket && (
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div><span className="text-[8px] font-black uppercase block mb-1">Prix (F)</span><input type="number" className="w-full p-2 bg-white/20 border-none rounded-lg text-white font-bold placeholder-white/50" value={formData.ticketPrice} onChange={e=>setFormData({...formData, ticketPrice:e.target.value})}/></div>
                                <div><span className="text-[8px] font-black uppercase block mb-1">Places</span><input type="number" className="w-full p-2 bg-white/20 border-none rounded-lg text-white font-bold placeholder-white/50" value={formData.ticketStock} onChange={e=>setFormData({...formData, ticketStock:e.target.value})}/></div>
                            </div>
                        )}
                    </div>
                    <button disabled={uploading} type="submit" className="w-full bg-primary-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-gold-500 transition-all shadow-xl flex justify-center items-center gap-3">
                        {uploading ? <Loader className="animate-spin"/> : (isEditing ? "Mettre à jour" : "Publier l'événement")}
                    </button>
                </div>
              </form>
          </motion.div>
        )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-6">
          {loading ? <div className="text-center py-20"><Loader className="animate-spin mx-auto text-gold-500" size={48}/></div> : events.length === 0 ? (
             <div className="text-center py-24 text-gray-400 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 italic">Aucun événement.</div>
          ) : (
            events.map((event) => {
              const stats = getEventStats(event._id);
              const eventDate = new Date(event.date);
              return (
                <motion.div 
                  key={event._id} 
                  initial={{ opacity: 0, x: -20 }} 
                  whileInView={{ opacity: 1, x: 0 }} 
                  viewport={{ once: true }}
                  className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-500 flex flex-col lg:flex-row items-center gap-8 group"
                >
                   <div className="flex flex-col items-center justify-center w-20 h-20 bg-primary-50 rounded-2xl shrink-0 group-hover:bg-primary-900 transition-colors duration-500">
                      <span className="text-2xl font-black text-primary-900 group-hover:text-gold-500 leading-none">{eventDate.getDate()}</span>
                      <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest group-hover:text-white">{eventDate.toLocaleDateString('fr-FR', {month: 'short'})}</span>
                   </div>

                   <div className="flex items-center gap-6 flex-1 w-full">
                      <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100 relative shadow-inner">
                        {event.image ? <img src={event.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><ImageIcon size={32}/></div>}
                      </div>
                      <div className="space-y-2">
                          <h3 className="font-serif font-bold text-2xl text-primary-900 group-hover:text-gold-600 transition-colors">
                              {event.title}
                              {event.isDaily && <span className="ml-3 text-[9px] bg-gold-500 text-primary-900 px-2 py-0.5 rounded-full uppercase tracking-tighter">Quotidien</span>}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                            <span className="flex items-center gap-1.5"><Clock size={14} className="text-gold-500"/> {eventDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gold-500"/> {event.location || 'N/A'}</span>
                          </div>
                      </div>
                   </div>

                   <div className="flex gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                      {event.hasTicket && (
                        <>
                          <div className="px-5 py-3 bg-green-50 border border-green-100 rounded-2xl">
                              <span className="block text-[8px] font-black text-green-400 uppercase mb-1">Recettes</span>
                              <span className="text-sm font-black text-green-700">{stats.totalRevenue.toLocaleString()} F</span>
                          </div>
                          <div className="px-5 py-3 bg-blue-50 border border-blue-100 rounded-2xl">
                              <span className="block text-[8px] font-black text-blue-400 uppercase mb-1">Vendus</span>
                              <span className="text-sm font-black text-blue-700">{stats.totalSold} / {event.ticketStock}</span>
                          </div>
                        </>
                      )}
                   </div>

                   <div className="flex gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-50">
                      <button onClick={() => handleBroadcastEvent(event)} className="p-4 bg-gradient-to-br from-gold-400 to-gold-600 text-white rounded-2xl hover:shadow-lg transition-all active:scale-95" title="Diffuser"><Bell size={20}/></button>
                      {event.hasTicket && (
                        <button onClick={() => setSelectedEventForStats({ ...event, ...stats })} className="p-4 bg-primary-900 text-white rounded-2xl hover:bg-gold-500 transition-all active:scale-95" title="Liste participants"><Users size={20}/></button>
                      )}
                      <button onClick={() => handleEditClick(event)} className="p-4 text-gray-400 hover:text-primary-900 hover:bg-gray-100 rounded-2xl transition-all"><Edit size={20} /></button>
                      <button onClick={() => handleDelete(event._id)} className="p-4 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={20} /></button>
                   </div>
                </motion.div>
              );
            })
          )}
        </div>

        <AnimatePresence>
          {selectedEventForStats && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-950/80 backdrop-blur-sm p-4">
               <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
                  <div className="bg-primary-900 p-8 text-white flex justify-between items-start shrink-0">
                     <div>
                        <h2 className="font-serif font-bold text-3xl mb-2">{selectedEventForStats.title}</h2>
                        <div className="flex gap-4">
                          <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-gold-400 flex items-center gap-2"><CheckCircle2 size={12}/> {selectedEventForStats.totalSold} Tickets</span>
                          <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-green-400 flex items-center gap-2"><DollarSign size={12}/> {selectedEventForStats.totalRevenue.toLocaleString()} F</span>
                        </div>
                     </div>
                     <button onClick={() => setSelectedEventForStats(null)} className="p-3 bg-white/10 rounded-full hover:bg-red-500 transition-colors"><X size={24}/></button>
                  </div>
                  <div className="p-8 overflow-y-auto bg-gray-50 flex-1">
                     <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                       <table className="w-full text-left border-collapse">
                          <thead className="bg-gray-50/50 border-b border-gray-100">
                             <tr>
                                <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Acheteur</th>
                                <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qté</th>
                                <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                             {selectedEventForStats.eventTickets.map((t, i) => (
                               <tr key={i} className="group hover:bg-primary-50/30 transition-colors">
                                  <td className="py-5 px-8">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-900 flex items-center justify-center font-black text-xs">{t.userName.charAt(0)}</div>
                                      <div><p className="font-bold text-primary-900">{t.userName}</p><p className="text-[10px] text-gray-400 font-medium">{t.userEmail}</p></div>
                                    </div>
                                  </td>
                                  <td className="py-5 px-8 text-center"><span className="px-3 py-1 bg-gold-100 text-gold-700 rounded-lg font-black text-sm">x{t.quantity}</span></td>
                                  <td className="py-5 px-8 text-right"><button onClick={() => setTicketToPrint(t)} className="p-2 bg-gray-100 text-primary-900 rounded-xl hover:bg-primary-900 hover:text-white transition-all opacity-0 group-hover:opacity-100"><ArrowUpRight size={18}/></button></td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                       {selectedEventForStats.eventTickets.length === 0 && <div className="py-20 text-center text-gray-400 flex flex-col items-center gap-4"><AlertCircle size={48} className="opacity-20"/><p className="font-medium italic text-sm">Aucune vente.</p></div>}
                     </div>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        {ticketToPrint && <AdminTicketView ticket={ticketToPrint} onClose={() => setTicketToPrint(null)} />}
    </AdminLayout>
  );
}