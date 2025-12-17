import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, Plus, Search, Trash2, Edit2, ImageIcon, X, 
  Layers, Save, Tag // Import de Tag ajouté
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout'; 

export default function AdminProducts() {
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  
  // Données
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 

  // États Produits
  const [isProdFormOpen, setIsProdFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // --- MODIFICATION 1 : Ajout de sizes et colors dans l'état initial ---
  const [prodData, setProdData] = useState({ 
      name: '', description: '', price: '', stock: '', category: '', 
      sizes: [], colors: [] 
  });
  const [prodImages, setProdImages] = useState([]);

  // --- MODIFICATION 2 : États pour les champs de saisie temporaire ---
  const [tempSize, setTempSize] = useState('');
  const [tempColor, setTempColor] = useState('');

  // États Catégories
  const [editingCategory, setEditingCategory] = useState(null); 
  const [newCatName, setNewCatName] = useState('');
  const [editCatName, setEditCatName] = useState('');

  // --- CHARGEMENT ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const resProds = await axios.get('/api/products');
      setProducts(resProds.data);

      const resCats = await axios.get('/api/categories?type=product');
      setCategories(resCats.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- MODIFICATION 3 : Fonctions de gestion des Tags ---
  const addTag = (type) => {
    // type est soit 'size' soit 'color'
    const val = type === 'size' ? tempSize : tempColor;
    const field = type === 'size' ? 'sizes' : 'colors';
    
    if (val.trim() && !prodData[field].includes(val.trim())) {
        setProdData({ ...prodData, [field]: [...prodData[field], val.trim()] });
        // Reset du champ input correspondant
        if(type === 'size') setTempSize(''); 
        else setTempColor('');
    }
  };

  const removeTag = (type, value) => {
    const field = type === 'size' ? 'sizes' : 'colors';
    setProdData({ ...prodData, [field]: prodData[field].filter(item => item !== value) });
  };

  // --- LOGIQUE CATÉGORIES ---
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if(!newCatName.trim()) return;
    
    try {
        const token = localStorage.getItem('token');
        
        // On vérifie si le token existe avant d'envoyer
        if (!token) {
            alert("Vous avez été déconnecté. Veuillez vous reconnecter.");
            return;
        }

        await axios.post('/api/categories', 
            { name: newCatName, type: 'product' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setNewCatName('');
        fetchData(); 
        alert("Catégorie créée avec succès !");
    } catch (err) { 
        console.error(err);
        if (err.response && err.response.status === 403) {
            alert("Votre session a expiré. Déconnectez-vous et reconnectez-vous.");
        } else {
            alert("Erreur lors de la création de la catégorie."); 
        }
    }
  };

  const handleUpdateCategory = async (id) => {
    try {
        const token = localStorage.getItem('token');
        await axios.put(`/api/categories/${id}`, 
            { name: editCatName },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingCategory(null);
        fetchData();
    } catch (err) { alert("Erreur modification"); }
  };

  const handleDeleteCategory = async (id) => {
      if(!confirm("Supprimer cette catégorie ?")) return;
      try {
          const token = localStorage.getItem('token');
          await axios.delete(`/api/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          fetchData();
      } catch (err) { alert("Impossible de supprimer"); }
  };

  // --- LOGIQUE PRODUITS ---
  const handleOpenProdForm = (product = null) => {
      if (product) {
          setEditingProduct(product);
          setProdData({
              name: product.name,
              description: product.description,
              price: product.price,
              stock: product.stock,
              category: product.category?._id || product.category,
              // Récupération des tableaux existants
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
          const token = localStorage.getItem('token');
          const formData = new FormData();
          
          // Ajout des champs simples
          formData.append('name', prodData.name);
          formData.append('description', prodData.description);
          formData.append('price', prodData.price);
          formData.append('stock', prodData.stock);
          formData.append('category', prodData.category);

          // --- MODIFICATION 4 : Envoi des tableaux (Stringify pour FormData) ---
          formData.append('sizes', JSON.stringify(prodData.sizes));
          formData.append('colors', JSON.stringify(prodData.colors));
          
          // Ajout des images
          for (let i = 0; i < prodImages.length; i++) {
              formData.append('productImages', prodImages[i]);
          }

          if(!prodData.category) { alert("Choisissez une catégorie !"); return; }

          const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };

          if (editingProduct) {
              await axios.put(`/api/products/${editingProduct._id}`, formData, config);
              alert("Produit mis à jour !");
          } else {
              await axios.post('/api/products', formData, config);
              alert("Produit créé !");
          }

          setIsProdFormOpen(false);
          fetchData();
      } catch (err) { 
          console.error(err); 
          alert("Erreur : " + (err.response?.data?.error || "Erreur serveur")); 
      }
  };

  const handleDeleteProduct = async (id) => {
      if(!confirm("Voulez-vous vraiment supprimer ce produit ?")) return;
      try {
          const token = localStorage.getItem('token');
          await axios.delete(`/api/products/${id}`, { 
              headers: { Authorization: `Bearer ${token}` } 
          });
          setProducts(products.filter(p => p._id !== id));
      } catch (err) { 
          alert("Erreur suppression."); 
      }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6">
            <div>
                <h1 className="text-3xl font-bold text-primary-900 font-serif flex items-center gap-3">
                    <Package className="text-gold-500" size={32} /> Gestion Boutique
                </h1>
                <p className="text-gray-500 mt-2">Gérez votre catalogue et vos catégories.</p>
            </div>
            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 inline-flex mt-4 md:mt-0">
                <button onClick={() => setActiveTab('products')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'products' ? 'bg-primary-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <Package size={18}/> Produits
                </button>
                <button onClick={() => setActiveTab('categories')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'categories' ? 'bg-primary-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <Layers size={18}/> Catégories
                </button>
            </div>
        </div>
      </div>

      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
            
            {/* --- ONGLET PRODUITS --- */}
            {activeTab === 'products' && (
                <motion.div key="products" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-sm font-bold text-gray-500">{products.length} Articles</div>
                        <button onClick={() => handleOpenProdForm()} className="bg-gold-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-gold-600 transition flex items-center gap-2">
                            <Plus size={20}/> Nouveau Produit
                        </button>
                    </div>

                    {isProdFormOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
                                <div className="bg-primary-900 p-6 text-white flex justify-between items-center shrink-0">
                                    <h2 className="font-bold text-xl flex items-center gap-2">
                                        {editingProduct ? <><Edit2/> Modifier le produit</> : <><Plus/> Créer un produit</>}
                                    </h2>
                                    <button onClick={() => setIsProdFormOpen(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={20}/></button>
                                </div>
                                <div className="p-8">
                                    <form onSubmit={handleSubmitProduct} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        
                                        {/* COLONNE GAUCHE */}
                                        <div className="space-y-5">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nom du produit</label>
                                                <input className="w-full p-3 border rounded-xl" value={prodData.name} onChange={e=>setProdData({...prodData, name:e.target.value})} required/>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Prix</label><input type="number" className="w-full p-3 border rounded-xl" value={prodData.price} onChange={e=>setProdData({...prodData, price:e.target.value})} required/></div>
                                                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Stock</label><input type="number" className="w-full p-3 border rounded-xl" value={prodData.stock} onChange={e=>setProdData({...prodData, stock:e.target.value})} required/></div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label>
                                                <textarea className="w-full h-32 p-3 border rounded-xl resize-none" value={prodData.description} onChange={e=>setProdData({...prodData, description:e.target.value})} />
                                            </div>
                                        </div>

                                        {/* COLONNE DROITE */}
                                        <div className="space-y-6">
                                            <div className="bg-gold-50 p-6 rounded-xl border border-gold-200">
                                                <label className="text-xs font-bold text-gold-700 uppercase mb-2 block flex items-center gap-2"><Layers size={14}/> Catégorie</label>
                                                <select className="w-full p-3 border border-gold-300 rounded-xl bg-white" value={prodData.category} onChange={e=>setProdData({...prodData, category:e.target.value})} required>
                                                    <option value="">-- Sélectionner --</option>
                                                    {categories.map(cat => (
                                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* --- SECTION TAILLES & COULEURS AJOUTÉE --- */}
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Tailles */}
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1"><Tag size={12}/> Tailles</label>
                                                    <div className="flex gap-1 mb-2">
                                                        <input type="text" placeholder="S, M..." className="w-full p-2 text-sm border rounded-lg" value={tempSize} onChange={e => setTempSize(e.target.value)} />
                                                        <button type="button" onClick={() => addTag('size')} className="bg-primary-900 text-white px-3 rounded-lg font-bold">+</button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {prodData.sizes.map(s => (
                                                            <span key={s} className="bg-gray-100 text-xs px-2 py-1 rounded border flex items-center gap-1">
                                                                {s} <button type="button" onClick={() => removeTag('size', s)}><X size={10}/></button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Couleurs */}
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1"><Tag size={12}/> Couleurs</label>
                                                    <div className="flex gap-1 mb-2">
                                                        <input type="text" placeholder="Rouge..." className="w-full p-2 text-sm border rounded-lg" value={tempColor} onChange={e => setTempColor(e.target.value)} />
                                                        <button type="button" onClick={() => addTag('color')} className="bg-primary-900 text-white px-3 rounded-lg font-bold">+</button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {prodData.colors.map(c => (
                                                            <span key={c} className="bg-gray-100 text-xs px-2 py-1 rounded border flex items-center gap-1">
                                                                {c} <button type="button" onClick={() => removeTag('color', c)}><X size={10}/></button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Images</label>
                                                <div className="h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 relative">
                                                    <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setProdImages([...e.target.files])} />
                                                    <ImageIcon className="text-gray-400 mb-1"/>
                                                    <span className="text-xs text-gray-500">{prodImages.length > 0 ? `${prodImages.length} img` : "Ajouter photos"}</span>
                                                </div>
                                            </div>

                                            <button className="w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-green-700 transition">Enregistrer</button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <div key={product._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition group relative">
                                <div className="h-48 bg-gray-100 relative">
                                    {product.images && product.images[0] ? <img src={product.images[0]} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center"><Package className="text-gray-300"/></div>}
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                        <button onClick={() => handleOpenProdForm(product)} className="p-2 bg-white rounded-full text-blue-600 shadow-sm hover:bg-blue-50"><Edit2 size={16}/></button>
                                        <button onClick={() => handleDeleteProduct(product._id)} className="p-2 bg-white rounded-full text-red-600 shadow-sm hover:bg-red-50"><Trash2 size={16}/></button>
                                    </div>
                                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                                        {product.category?.name || "Sans catégorie"}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-gold-600 font-bold">{product.price} F</span>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.stock} stock</span>
                                    </div>
                                    {/* Affichage des tags dans la carte */}
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {product.sizes && product.sizes.map(s => <span key={s} className="text-[9px] bg-gray-100 px-1 rounded border">{s}</span>)}
                                        {product.colors && product.colors.map(c => <span key={c} className="text-[9px] bg-gray-100 px-1 rounded border">{c}</span>)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* --- ONGLET CATÉGORIES --- */}
            {activeTab === 'categories' && (
                <motion.div key="categories" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="max-w-4xl mx-auto">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Nouvelle Catégorie</label>
                            <input className="w-full p-4 border rounded-xl bg-gray-50 focus:bg-white transition" placeholder="Nom..." value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                        </div>
                        <button onClick={handleCreateCategory} className="bg-primary-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-gold-500 transition flex items-center gap-2"><Plus size={20}/> Créer</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.map(cat => (
                            <div key={cat._id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition group">
                                {editingCategory === cat._id ? (
                                    <div className="flex flex-1 gap-2 mr-4">
                                        <input className="flex-1 p-2 border rounded-lg" value={editCatName} onChange={e => setEditCatName(e.target.value)} autoFocus />
                                        <button onClick={() => handleUpdateCategory(cat._id)} className="p-2 bg-green-100 text-green-700 rounded-lg"><Save size={18}/></button>
                                        <button onClick={() => setEditingCategory(null)} className="p-2 bg-gray-100 text-gray-600 rounded-lg"><X size={18}/></button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center text-gold-600"><Layers size={20}/></div>
                                        <span className="font-bold text-gray-800 text-lg">{cat.name}</span>
                                    </div>
                                )}
                                {editingCategory !== cat._id && (
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                        <button onClick={() => { setEditingCategory(cat._id); setEditCatName(cat.name); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18}/></button>
                                        <button onClick={() => handleDeleteCategory(cat._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}