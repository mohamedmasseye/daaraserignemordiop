import React, { useState, useEffect } from 'react';
import API from '../../services/api'; // ✅ Instance sécurisée
import { 
  Package, Plus, Search, Trash2, Edit2, ImageIcon, X, 
  Layers, Save, Tag, AlignLeft, DollarSign, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout'; 

export default function AdminProducts() {
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 

  const [isProdFormOpen, setIsProdFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodData, setProdData] = useState({ 
      name: '', description: '', price: '', stock: '', category: '', 
      sizes: [], colors: [] 
  });
  const [prodImages, setProdImages] = useState([]);
  const [tempSize, setTempSize] = useState('');
  const [tempColor, setTempColor] = useState('');

  const [editingCategory, setEditingCategory] = useState(null); 
  const [newCatName, setNewCatName] = useState('');
  const [editCatName, setEditCatName] = useState('');

  // ✅ Style pour les champs bien encadrés
  const inputStyle = "w-full mt-1 p-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none font-bold transition-all duration-200 placeholder:text-gray-300";

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resProds, resCats] = await Promise.all([
        API.get('/api/products'),
        API.get('/api/categories?type=product')
      ]);
      setProducts(resProds.data || []);
      setCategories(resCats.data || []);
    } catch (err) { console.error("Erreur boutique:", err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const addTag = (type) => {
    const val = type === 'size' ? tempSize : tempColor;
    const field = type === 'size' ? 'sizes' : 'colors';
    if (val.trim() && !prodData[field].includes(val.trim())) {
        setProdData({ ...prodData, [field]: [...prodData[field], val.trim()] });
        if(type === 'size') setTempSize(''); else setTempColor('');
    }
  };

  const removeTag = (type, value) => {
    const field = type === 'size' ? 'sizes' : 'colors';
    setProdData({ ...prodData, [field]: prodData[field].filter(item => item !== value) });
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if(!newCatName.trim()) return;
    try {
        await API.post('/api/categories', { name: newCatName, type: 'product' });
        setNewCatName('');
        fetchData(); 
        alert("Catégorie créée !");
    } catch (err) { alert("Erreur catégorie."); }
  };

  const handleUpdateCategory = async (id) => {
    try {
        await API.put(`/api/categories/${id}`, { name: editCatName });
        setEditingCategory(null);
        fetchData();
    } catch (err) { alert("Erreur modification"); }
  };

  const handleDeleteCategory = async (id) => {
      if(!window.confirm("Supprimer cette catégorie ?")) return;
      try {
          await API.delete(`/api/categories/${id}`);
          fetchData();
      } catch (err) { alert("Impossible de supprimer"); }
  };

  const handleOpenProdForm = (product = null) => {
      if (product) {
          setEditingProduct(product);
          setProdData({
              name: product.name,
              description: product.description,
              price: product.price,
              stock: product.stock,
              category: product.category?._id || product.category,
              sizes: product.sizes || [],
              colors: product.colors || []
          });
      } else {
          setEditingProduct(null);
          setProdData({ name: '', description: '', price: '', stock: '', category: '', sizes: [], colors: [] });
          setProdImages([]);
      }
      setIsProdFormOpen(true);
  };

  const handleSubmitProduct = async (e) => {
      e.preventDefault();
      try {
          const formData = new FormData();
          formData.append('name', prodData.name);
          formData.append('description', prodData.description);
          formData.append('price', prodData.price);
          formData.append('stock', prodData.stock);
          formData.append('category', prodData.category);
          formData.append('sizes', JSON.stringify(prodData.sizes));
          formData.append('colors', JSON.stringify(prodData.colors));
          for (let i = 0; i < prodImages.length; i++) { formData.append('productImages', prodImages[i]); }

          if(!prodData.category) return alert("Choisissez une catégorie !");

          if (editingProduct) await API.put(`/api/products/${editingProduct._id}`, formData);
          else await API.post('/api/products', formData);

          alert(editingProduct ? "Mis à jour !" : "Produit créé !");
          setIsProdFormOpen(false);
          fetchData();
      } catch (err) { alert("Erreur : " + (err.response?.data?.error || "Erreur serveur")); }
  };

  const handleDeleteProduct = async (id) => {
      if(!window.confirm("Supprimer ce produit définitivement ?")) return;
      try {
          await API.delete(`/api/products/${id}`);
          setProducts(products.filter(p => p._id !== id));
      } catch (err) { alert("Erreur suppression."); }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div>
            <h1 className="text-4xl font-serif font-bold text-primary-900 flex items-center gap-4">
                <div className="p-3 bg-gold-500 rounded-2xl text-white shadow-lg"><Package size={32} /></div>
                Gestion Boutique
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Catalogue et Catégories de produits.</p>
        </div>
        <div className="bg-white p-2 rounded-2xl shadow-sm border-2 border-gray-100 inline-flex">
            <button onClick={() => setActiveTab('products')} className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'products' ? 'bg-primary-900 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>
                <Package size={18}/> Produits
            </button>
            <button onClick={() => setActiveTab('categories')} className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'categories' ? 'bg-primary-900 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>
                <Layers size={18}/> Catégories
            </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'products' ? (
            <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex justify-between items-center mb-8">
                    <span className="bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter">{products.length} Articles en ligne</span>
                    <button onClick={() => handleOpenProdForm()} className="bg-gold-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-gold-600 transition-all flex items-center gap-3 active:scale-95">
                        <Plus size={20}/> Nouveau Produit
                    </button>
                </div>

                {isProdFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-950/80 backdrop-blur-md p-4 overflow-y-auto">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden my-8">
                            <div className="bg-primary-900 p-8 text-white flex justify-between items-center">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    {editingProduct ? <><Edit2 size={24} className="text-gold-500"/> Modifier l'article</> : <><Plus size={24} className="text-gold-500"/> Nouveau produit</>}
                                </h2>
                                <button onClick={() => setIsProdFormOpen(false)} className="p-3 bg-white/10 rounded-full hover:bg-red-500 transition-colors"><X size={24}/></button>
                            </div>
                            <form onSubmit={handleSubmitProduct} className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Nom du produit</label><input className={inputStyle} value={prodData.name} onChange={e=>setProdData({...prodData, name:e.target.value})} required placeholder="Ex: Tapis de prière..."/></div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block"><DollarSign size={10}/> Prix (F)</label><input type="number" className={inputStyle} value={prodData.price} onChange={e=>setProdData({...prodData, price:e.target.value})} required/></div>
                                        <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block"><Database size={10}/> Stock disponible</label><input type="number" className={inputStyle} value={prodData.stock} onChange={e=>setProdData({...prodData, stock:e.target.value})} required/></div>
                                    </div>
                                    <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block"><AlignLeft size={10}/> Description</label><textarea className={`${inputStyle} h-40 resize-none`} value={prodData.description} onChange={e=>setProdData({...prodData, description:e.target.value})} /></div>
                                </div>
                                <div className="space-y-6 bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                                    <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Rayon / Catégorie</label>
                                    <select className={inputStyle} value={prodData.category} onChange={e=>setProdData({...prodData, category:e.target.value})} required>
                                        <option value="">-- Choisir --</option>
                                        {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                    </select></div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Tailles</label>
                                            <div className="flex gap-2 mb-3"><input type="text" className="w-full p-3 border-2 border-gray-200 rounded-xl" value={tempSize} onChange={e=>setTempSize(e.target.value)} /><button type="button" onClick={()=>addTag('size')} className="bg-primary-900 text-white px-4 rounded-xl font-bold">+</button></div>
                                            <div className="flex flex-wrap gap-1">{prodData.sizes.map(s => <span key={s} className="bg-white text-[10px] px-2 py-1 rounded-lg border font-bold flex items-center gap-1">{s}<X size={10} onClick={()=>removeTag('size', s)} className="cursor-pointer"/></span>)}</div>
                                        </div>
                                        <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Couleurs</label>
                                            <div className="flex gap-2 mb-3"><input type="text" className="w-full p-3 border-2 border-gray-200 rounded-xl" value={tempColor} onChange={e=>setTempColor(e.target.value)} /><button type="button" onClick={()=>addTag('color')} className="bg-primary-900 text-white px-4 rounded-xl font-bold">+</button></div>
                                            <div className="flex flex-wrap gap-1">{prodData.colors.map(c => <span key={c} className="bg-white text-[10px] px-2 py-1 rounded-lg border font-bold flex items-center gap-1">{c}<X size={10} onClick={()=>removeTag('color', c)} className="cursor-pointer"/></span>)}</div>
                                        </div>
                                    </div>
                                    <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Galerie Photos</label>
                                    <div className="h-32 border-2 border-dashed border-gray-300 rounded-[2rem] bg-white flex flex-col items-center justify-center cursor-pointer hover:border-gold-500 transition-colors relative">
                                        <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setProdImages([...e.target.files])} />
                                        <ImageIcon className="text-gray-300 mb-2" size={32}/>
                                        <span className="text-xs font-bold text-gray-400">{prodImages.length > 0 ? `${prodImages.length} images prêtes` : "Cliquer pour ajouter"}</span>
                                    </div></div>
                                    <button className="w-full bg-primary-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl hover:bg-gold-500 hover:text-primary-900 transition-all active:scale-95">Enregistrer au catalogue</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 pb-20">
                    {products.map(product => (
                        <div key={product._id} className="bg-white rounded-[2rem] border-2 border-gray-50 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 group relative">
                            <div className="h-56 bg-gray-100 relative overflow-hidden">
                                {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/> : <div className="w-full h-full flex items-center justify-center"><Package size={48} className="text-gray-200"/></div>}
                                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-10 group-hover:translate-x-0">
                                    <button onClick={() => handleOpenProdForm(product)} className="p-3 bg-white rounded-xl text-primary-900 shadow-xl hover:bg-gold-500 transition-colors"><Edit2 size={18}/></button>
                                    <button onClick={() => handleDeleteProduct(product._id)} className="p-3 bg-white rounded-xl text-red-500 shadow-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={18}/></button>
                                </div>
                                <span className="absolute bottom-4 left-4 bg-primary-950/80 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg backdrop-blur-md">{product.category?.name || "Général"}</span>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 truncate">{product.name}</h3>
                                <div className="flex justify-between items-end">
                                    <span className="text-xl font-black text-primary-900">{product.price.toLocaleString()} F</span>
                                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.stock} en stock</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        ) : (
            <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto pb-20">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-gray-50 mb-12 flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Nom du nouveau rayon</label>
                        <input className={inputStyle} placeholder="Ex: Livres, Parfums..." value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                    </div>
                    <button onClick={handleCreateCategory} className="w-full md:w-auto bg-primary-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-gold-500 transition-all active:scale-95"><Plus size={20}/> Créer</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categories.map(cat => (
                        <div key={cat._id} className="bg-white p-6 rounded-3xl border-2 border-gray-50 shadow-sm flex justify-between items-center hover:shadow-xl transition-all group">
                            {editingCategory === cat._id ? (
                                <div className="flex flex-1 gap-3">
                                    <input className="flex-1 p-3 border-2 border-primary-500 rounded-xl outline-none font-bold" value={editCatName} onChange={e => setEditCatName(e.target.value)} autoFocus />
                                    <button onClick={() => handleUpdateCategory(cat._id)} className="p-3 bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/20"><Save size={20}/></button>
                                    <button onClick={() => setEditingCategory(null)} className="p-3 bg-gray-100 text-gray-500 rounded-xl"><X size={20}/></button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gold-50 flex items-center justify-center text-gold-600 border border-gold-100"><Layers size={24}/></div>
                                        <span className="font-bold text-gray-800 text-xl">{cat.name}</span>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => { setEditingCategory(cat._id); setEditCatName(cat.name); }} className="p-3 text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"><Edit2 size={18}/></button>
                                        <button onClick={() => handleDeleteCategory(cat._id)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18}/></button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}