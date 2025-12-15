import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ShoppingBag, Check, Star, Share2, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // États d'interaction
  const [mainImage, setMainImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Charger le produit (Récupération sécurisée)
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Idéalement : axios.get(`/api/products/${id}`)
        // Ici on filtre comme dans votre code précédent
        const res = await axios.get('https://daara-app.onrender.com/api/products');
        const found = res.data.find(p => p._id === id);
        
        if (found) {
            setProduct(found);
            // Initialisation sécurisée de l'image
            setMainImage((found.images && found.images.length > 0) ? found.images[0] : '/logo.png');
            
            // Initialisation options
            if(found.sizes && found.sizes.length > 0) setSelectedSize(found.sizes[0]);
            if(found.colors && found.colors.length > 0) setSelectedColor(found.colors[0]);
        }
      } catch (err) { console.error("Erreur chargement produit", err); } 
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [id]);

  const addToCart = () => {
    if (!product) return;
    
    const currentCart = JSON.parse(localStorage.getItem('daara_cart') || '[]');

    // Création ID unique pour panier (Produit + Variantes)
    const cartItemId = `${product._id}-${selectedSize || ''}-${selectedColor || ''}`;
    
    // Vérifier si cet article exact (même taille/couleur) existe déjà
    const existingIndex = currentCart.findIndex(item => item.cartId === cartItemId);

    let newCart;
    if (existingIndex > -1) {
        // Mise à jour quantité
        newCart = [...currentCart];
        newCart[existingIndex].quantity += quantity;
    } else {
        // Nouvel article
        const newItem = {
            id: product._id, // ID original pour backend
            cartId: cartItemId, // ID unique panier
            name: product.name,
            price: product.price,
            image: mainImage,
            type: 'product',
            quantity: quantity,
            selectedSize: selectedSize,
            selectedColor: selectedColor,
            // Pour affichage panier
            options: `${selectedSize ? `Taille: ${selectedSize}` : ''} ${selectedColor ? `• Couleur: ${selectedColor}` : ''}`.trim()
        };
        newCart = [...currentCart, newItem];
    }

    localStorage.setItem('daara_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage')); // Mise à jour header
    alert("Produit ajouté au panier !");
    navigate('/boutique');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Chargement...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Produit introuvable</div>;

  // Récupération sécurisée du nom de catégorie
  const categoryName = product.category?.name || product.category || "Boutique";

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <Link to="/boutique" className="inline-flex items-center text-gray-500 hover:text-primary-900 mb-8 font-medium transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Retour à la boutique
        </Link>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 grid grid-cols-1 lg:grid-cols-2">
          
          {/* --- GAUCHE : GALERIE IMAGES --- */}
          <div className="bg-gray-50 p-8 flex flex-col items-center justify-center relative">
            <motion.div 
               key={mainImage} 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               className="w-full aspect-square flex items-center justify-center mb-6"
            >
              <img 
                src={mainImage} 
                alt={product.name} 
                className="max-h-[400px] w-full object-contain drop-shadow-xl"
              />
            </motion.div>

            {/* Miniatures (Carousel) */}
            {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto p-2 w-full justify-center">
                    {product.images.map((img, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setMainImage(img)}
                          className={`w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${mainImage === img ? 'border-gold-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                            <img src={img} className="w-full h-full object-cover" alt="" />
                        </button>
                    ))}
                </div>
            )}
          </div>

          {/* --- DROITE : INFOS & SÉLECTION --- */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
               <span className="text-xs font-bold uppercase tracking-widest text-gold-600 bg-gold-50 px-3 py-1 rounded-full">
                 {categoryName}
               </span>
               <div className="flex text-yellow-400">
                 {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor"/>)}
               </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-primary-900 mb-6">{product.price.toLocaleString()} FCFA</p>
            
            <p className="text-gray-600 leading-relaxed mb-8 border-b border-gray-100 pb-8 text-sm">
              {product.description || "Aucune description disponible pour ce produit."}
            </p>

            {/* SÉLECTEURS */}
            <div className="space-y-6 mb-8">
              
              {/* Taille */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <span className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Taille</span>
                  <div className="flex gap-3 flex-wrap">
                    {product.sizes.map(size => (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[48px] h-12 px-3 rounded-xl border-2 flex items-center justify-center font-bold text-sm transition-all ${
                            selectedSize === size 
                            ? 'border-primary-900 bg-primary-900 text-white shadow-md transform scale-105' 
                            : 'border-gray-200 text-gray-600 hover:border-primary-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
               {/* Couleurs */}
               {product.colors && product.colors.length > 0 && (
                <div>
                  <span className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Couleur</span>
                  <div className="flex gap-3 flex-wrap">
                    {product.colors.map(color => (
                      <button 
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-5 h-10 rounded-full border flex items-center justify-center font-medium text-sm transition-all relative overflow-hidden ${
                            selectedColor === color 
                            ? 'border-primary-900 text-primary-900 ring-2 ring-primary-100 bg-primary-50' 
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {selectedColor === color && <Check size={14} className="mr-1" />}
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantité */}
              <div>
                <span className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Quantité</span>
                <div className="flex items-center gap-4">
                   <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-sm">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50 rounded-l-xl text-gray-600 transition"><Minus size={18}/></button>
                      <span className="w-12 text-center font-bold text-gray-900 text-lg">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-50 rounded-r-xl text-gray-600 transition"><Plus size={18}/></button>
                   </div>
                   <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                     {product.stock > 0 ? `En stock (${product.stock})` : 'Rupture de stock'}
                   </span>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <button 
                onClick={addToCart}
                disabled={product.stock <= 0}
                className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-gold-500/30 transition transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <ShoppingBag size={20} /> {product.stock > 0 ? 'Ajouter au panier' : 'Indisponible'}
              </button>
              <button className="p-4 border-2 border-gray-100 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-primary-600 transition">
                <Share2 size={20} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}