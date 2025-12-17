import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Tag, Loader } from 'lucide-react';

// Ce composant gère l'ajout et la suppression de catégories pour un type donné (blog, media, ou podcast)
export default function CategoryManager({ type, onCategoriesChange, selectedCategory, onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(false);

  // Charger les catégories (Public, pas besoin de token obligatoirement si la route est publique)
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`/api/categories/${type}`);
      setCategories(res.data);
      // Remonter l'info au parent si besoin
      if (onCategoriesChange) onCategoriesChange(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCategories(); }, [type]);

  // Ajouter (BESOIN DU TOKEN)
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setLoading(true);

    try {
      // 👇 AJOUT DU TOKEN ICI
      const token = localStorage.getItem('token');
      
      await axios.post('/api/categories', 
        { name: newCatName, type },
        { headers: { Authorization: `Bearer ${token}` } } // 🔑 La clé pour entrer
      );
      
      setNewCatName('');
      fetchCategories();
    } catch (error) { 
        alert("Erreur ajout catégorie (Vérifiez que vous êtes connecté)"); 
    } finally { 
        setLoading(false); 
    }
  };

  // Supprimer (BESOIN DU TOKEN)
  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Empêcher la sélection lors du clic sur supprimer
    if (!confirm("Supprimer cette catégorie ?")) return;

    try {
      // 👇 AJOUT DU TOKEN ICI
      const token = localStorage.getItem('token');

      await axios.delete(`/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Si la catégorie supprimée était sélectionnée, on désélectionne
      if (selectedCategory === categories.find(c => c._id === id)?.name) {
          if (onSelectCategory) onSelectCategory('');
      }

      fetchCategories();
    } catch (error) { alert("Erreur suppression"); }
  };

  return (
    <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200">
      <label className="text-sm font-bold text-gray-700 block mb-1 flex items-center gap-2">
        <Tag size={16} className="text-gold-500"/> Gestion des Catégories
      </label>
      
      {/* Zone de sélection visuelle */}
      <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
        {categories.length === 0 && <span className="text-xs text-gray-400 italic py-2">Aucune catégorie.</span>}
        
        {categories.map((cat) => (
          <div 
            key={cat._id}
            onClick={() => onSelectCategory && onSelectCategory(cat.name)}
            className={`
              cursor-pointer px-3 py-1.5 rounded-lg text-sm font-medium border transition-all flex items-center gap-2
              ${selectedCategory === cat.name 
                ? 'bg-primary-900 text-white border-primary-900 shadow-md transform scale-105' 
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gold-400 hover:bg-white'}
            `}
          >
            {cat.name}
            <button 
              onClick={(e) => handleDelete(cat._id, e)}
              className={`p-0.5 rounded-full transition ${selectedCategory === cat.name ? 'hover:bg-white/20 text-white' : 'hover:bg-red-100 text-gray-400 hover:text-red-500'}`}
              title="Supprimer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Input d'ajout rapide */}
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="Ajouter une catégorie..." 
          className="flex-1 p-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
        />
        <button 
          onClick={handleAdd}
          disabled={loading}
          className="bg-primary-100 hover:bg-gold-500 hover:text-white text-primary-900 px-3 py-2 rounded-lg transition disabled:opacity-50"
          type="button"
        >
          {loading ? <Loader size={18} className="animate-spin"/> : <Plus size={18} />}
        </button>
      </div>
    </div>
  );
}