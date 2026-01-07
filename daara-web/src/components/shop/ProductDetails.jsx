import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../services/api'; // ✅ UTILISE TON INSTANCE SÉCURISÉE
import { ArrowLeft, ShoppingBag, Check, Star, Share2, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [mainImage, setMainImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // ✅ Récupération via instance centralisée
        const res = await API.get('/api/products');
        const found = (res.data || []).find(p => p._id === id);
        
        if (found) {
            setProduct(found);
            setMainImage(found.images?.[0] || '/logo.png');
            if(found.sizes?.length > 0) setSelectedSize(found.sizes[0]);
            if(found.colors?.length > 0) setSelectedColor(found.colors[0]);
        }
      } catch (err) { console.error("Erreur produit", err); } 
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [id]);

  const addToCart = () => {
    if (!product) return;
    const currentCart = JSON.parse(localStorage.getItem('daara_cart') || '[]');
    const cartItemId = `${product._id}-${selectedSize}-${selectedColor}`;
    const existingIndex = currentCart.findIndex(item => item.cartId === cartItemId);

    let newCart = [...currentCart];
    if (existingIndex > -1) {
        newCart[existingIndex].quantity += quantity;
    } else {
        newCart.push({
            id: product._id,
            cartId: cartItemId,
            name: product.name,
            price: product.price,
            image: mainImage,
            type: 'product',
            quantity: quantity,
            options: `${selectedSize ? `Taille: ${selectedSize}` : ''} ${selectedColor ? `• ${selectedColor}` : ''}`.trim()
        });
    }

    localStorage.setItem('daara_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
    alert("Ajouté au panier !");
    navigate('/boutique');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Introuvable</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <Link to="/boutique" className="inline-flex items-center text-gray-500 mb-8"><ArrowLeft size={20} className="mr-2" /> Retour</Link>
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          <div className="bg-gray-50 p-8 flex flex-col items-center justify-center">
            <img src={mainImage} alt="" className="max-h-[400px] object-contain drop-shadow-2xl" />
          </div>
          <div className="p-8 lg:p-12">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-primary-900 mb-8">{product.price.toLocaleString()} FCFA</p>
            <p className="text-gray-600 mb-8 pb-8 border-b border-gray-100">{product.description}</p>
            
            <div className="space-y-6 mb-10">
              {product.sizes?.length > 0 && (
                <div className="flex gap-2">{product.sizes.map(s => <button key={s} onClick={()=>setSelectedSize(s)} className={`px-4 py-2 rounded-xl border-2 font-bold ${selectedSize === s ? 'border-primary-900 bg-primary-900 text-white' : 'border-gray-200'}`}>{s}</button>)}</div>
              )}
              <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-xl">
                      <button onClick={()=>setQuantity(Math.max(1, quantity-1))} className="p-3"><Minus size={18}/></button>
                      <span className="w-10 text-center font-bold">{quantity}</span>
                      <button onClick={()=>setQuantity(quantity+1)} className="p-3"><Plus size={18}/></button>
                  </div>
              </div>
            </div>
            <button onClick={addToCart} disabled={product.stock <= 0} className="w-full bg-gold-500 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-gold-600 transition disabled:opacity-50">
                <ShoppingBag size={20} className="inline mr-2" /> {product.stock > 0 ? 'Ajouter au panier' : 'Rupture'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}