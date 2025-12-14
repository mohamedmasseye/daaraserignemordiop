import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Ticket, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CartDrawer({ isOpen, onClose, cartItems = [], onRemoveItem, onUpdateQuantity }) {
  // Calcul du total
  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Séparation intelligente des items
  const tickets = cartItems.filter(item => item.type === 'ticket');
  const products = cartItems.filter(item => item.type !== 'ticket');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay sombre */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Le Tiroir (Drawer) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white shadow-2xl flex flex-col h-full"
          >
            {/* 1. EN-TÊTE */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="bg-primary-50 p-2 rounded-full text-primary-600">
                  <ShoppingBag size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 font-serif">Mon Panier</h2>
                <span className="bg-gold-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {cartItems.length}
                </span>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
                <X size={24} />
              </button>
            </div>

            {/* 2. LISTE DES ARTICLES (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <ShoppingBag size={64} className="text-gray-300" />
                  <p className="text-lg font-medium text-gray-400">Votre panier est vide</p>
                  <button onClick={onClose} className="text-primary-600 font-bold hover:underline">
                    Commencer mes achats
                  </button>
                </div>
              ) : (
                <>
                  {/* --- SECTION TICKETS (Design Billet) --- */}
                  {tickets.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                        <Ticket size={14} className="text-gold-500"/> Billetterie ({tickets.length})
                      </h3>
                      {tickets.map((item) => (
                        <div key={item.id} className="relative bg-white border border-gold-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                            {/* En-tête Ticket */}
                            <div className="bg-primary-900 text-white p-3 flex justify-between items-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gold-500 rounded-full blur-2xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                                <div className="flex items-center gap-2 z-10">
                                    <Ticket size={16} className="text-gold-500"/>
                                    <span className="text-xs font-bold uppercase tracking-wider">Ticket Événement</span>
                                </div>
                                <button onClick={() => onRemoveItem(item.id)} className="text-white/50 hover:text-red-400 transition z-10"><X size={16}/></button>
                            </div>
                            
                            {/* Corps Ticket */}
                            <div className="p-4 flex gap-4 items-center">
                                {/* Bloc Quantité */}
                                <div className="bg-gray-100 rounded-lg w-14 h-14 flex-shrink-0 flex flex-col items-center justify-center border border-gray-200">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase">Qté</span>
                                    <span className="text-xl font-bold text-primary-900">{item.quantity}</span>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1 truncate">{item.name}</h4>
                                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                       {item.eventDate || 'Date à venir'}
                                    </p>
                                    <p className="text-gold-600 font-bold text-sm">{item.price.toLocaleString()} FCFA</p>
                                </div>
                                
                                {/* Contrôles Qte Mini */}
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center hover:bg-gold-100 text-gray-600 transition"><Plus size={12}/></button>
                                    <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center hover:bg-gold-100 text-gray-600 disabled:opacity-50 transition"><Minus size={12}/></button>
                                </div>
                            </div>

                            {/* Décoration "Déchirure" visuelle */}
                            <div className="absolute -left-2 top-[46px] w-4 h-4 bg-gray-50 rounded-full border-r border-gold-200"></div>
                            <div className="absolute -right-2 top-[46px] w-4 h-4 bg-gray-50 rounded-full border-l border-gold-200"></div>
                            <div className="absolute left-2 right-2 top-[53px] border-t border-dashed border-gray-300 opacity-50"></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* --- SECTION PRODUITS (Design Carte) --- */}
                  {products.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1 mt-4">
                        <Package size={14} /> Mes Achats ({products.length})
                      </h3>
                      {products.map((item) => (
                        <div key={item.id} className="flex gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-0.5">
                                <div className="flex justify-between items-start">
                                    <div className="pr-2">
                                        <h4 className="font-bold text-gray-800 text-sm line-clamp-2">{item.name}</h4>
                                        <p className="text-xs text-gray-400 mt-1">{item.options}</p>
                                    </div>
                                    <button onClick={() => onRemoveItem(item.id)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={16}/></button>
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                    <p className="font-bold text-primary-900">{item.price.toLocaleString()} F</p>
                                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 h-8">
                                        <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="px-2 h-full flex items-center hover:bg-gray-100 rounded-l-lg text-gray-500 disabled:opacity-30"><Minus size={12}/></button>
                                        <span className="px-2 text-xs font-bold w-6 text-center">{item.quantity}</span>
                                        <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="px-2 h-full flex items-center hover:bg-gray-100 rounded-r-lg text-gray-500"><Plus size={12}/></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 3. FOOTER (Total & Action) */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-white space-y-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
                <div className="flex justify-between items-center text-gray-500 text-sm">
                  <span>Sous-total</span>
                  <span>{total.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total à payer</span>
                  <span className="text-2xl font-bold text-primary-900">{total.toLocaleString()} <span className="text-sm font-normal text-gray-500">FCFA</span></span>
                </div>

                <Link 
                  to="/checkout" 
                  onClick={onClose}
                  className="w-full bg-primary-900 hover:bg-primary-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  Passer à la caisse <ArrowRight size={20} />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}