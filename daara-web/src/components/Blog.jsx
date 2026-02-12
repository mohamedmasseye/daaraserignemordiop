import React, { useState, useEffect } from 'react';
import API from '../services/api'; // ✅ UTILISE TON INSTANCE SÉCURISÉE
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, User, ArrowRight, Heart, X, Send, 
  Tag, FileText, Download, Search, SearchX 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { useAuth } from '../context/AuthContext'; 

// Imports CSS react-pdf
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Worker Local
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // ✅ État pour la recherche
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);
  const [commentText, setCommentText] = useState('');
  const { user } = useAuth(); 
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await API.get('/api/blog'); 
      setPosts(res.data || []);
    } catch (err) { 
      console.error("Erreur blog:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  // ✅ LOGIQUE DE RECHERCHE INTELLIGENTE
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLike = async (e, post) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await API.put(`/api/blog/${post._id}/like`); 
      const updatedPosts = posts.map(p => p._id === post._id ? res.data : p);
      setPosts(updatedPosts);
      if (selectedPost && selectedPost._id === post._id) setSelectedPost(res.data);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsLiking(false); 
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    if (!user) return alert("Veuillez vous connecter pour commenter !");
    try {
      const res = await API.post(`/api/blog/${selectedPost._id}/comment`, {
        author: user.fullName, 
        content: commentText
      });
      const updatedPosts = posts.map(p => p._id === selectedPost._id ? res.data : p);
      setPosts(updatedPosts);
      setSelectedPost(res.data);
      setCommentText('');
    } catch (error) { 
      console.error(error); 
    }
  };

  const closeModal = () => { setSelectedPost(null); setNumPages(null); };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-primary-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-900 mb-4"></div>
        <p className="font-serif animate-pulse">Chargement du Journal...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-800">
      
      {/* Header avec Barre de Recherche intégrée */}
      <div className="bg-primary-900 text-white pt-32 pb-32 px-4 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/50 to-primary-900"></div>
        
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10 max-w-4xl mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold tracking-widest uppercase mb-4 border border-gold-500/30">Médiathèque & Savoir</span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 italic">Le Journal du Daara</h1>
            <p className="text-primary-100 text-lg mb-10 font-light opacity-80">Explorez nos articles et réflexions spirituelles.</p>

            {/* ✅ BARRE DE RECHERCHE DESIGN */}
            <div className="relative max-w-xl mx-auto group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-primary-300 group-focus-within:text-gold-400 transition-colors" />
              </div>
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un sujet, un titre..."
                className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:bg-white/20 transition-all shadow-2xl"
              />
              <AnimatePresence>
                {searchTerm && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <X size={20} className="text-white/60 hover:text-white" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
        </motion.div>
      </div>

      {/* Grille de posts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        
        {/* ✅ MESSAGE SI AUCUN RÉSULTAT */}
        {filteredPosts.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-12 text-center shadow-xl border border-gray-100">
            <SearchX size={64} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-primary-900 mb-2">Aucun article trouvé</h3>
            <p className="text-gray-500">Essayez d'autres mots clés ou parcourez nos catégories.</p>
            <button onClick={() => setSearchTerm('')} className="mt-6 text-gold-600 font-bold hover:underline">Effacer la recherche</button>
          </motion.div>
        )}

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode='popLayout'>
            {filteredPosts.map((post) => (
              <motion.div 
                layout // ✅ Animation de réorganisation fluide
                key={post._id} 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full cursor-pointer transform hover:-translate-y-1" 
                onClick={() => setSelectedPost(post)}
              >
                <div className="h-56 overflow-hidden relative">
                  {post.coverImage ? <img src={post.coverImage} alt="" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" /> : <div className="w-full h-full bg-primary-50 flex items-center justify-center"><FileText size={48} className="text-primary-200" /></div>}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary-900 uppercase shadow-sm">{post.category}</div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span className="flex items-center"><Calendar size={14} className="mr-1"/> {new Date(post.createdAt).toLocaleDateString()}</span>
                    <button onClick={(e) => handleLike(e, post)} className="flex items-center text-gray-400 hover:text-rose-500 transition-colors z-10"><Heart size={16} className={`mr-1 ${post.likes > 0 ? 'fill-rose-500 text-rose-500' : ''}`}/> {post.likes || 0}</button>
                  </div>
                  <h3 className="text-xl font-bold text-primary-900 mb-3 font-serif group-hover:text-gold-600 transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1 leading-relaxed">{post.summary}</p>
                  <div className="mt-auto w-full py-3 bg-gray-50 text-primary-700 rounded-xl font-bold group-hover:bg-primary-900 group-hover:text-white transition flex items-center justify-center gap-2 text-sm">Lire l'article <ArrowRight size={16}/></div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modal / Overlay Article */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-primary-950/80 backdrop-blur-md overflow-y-auto" onClick={closeModal}>
            <div className="min-h-full w-full flex items-start justify-center p-4 md:p-8">
              <motion.div initial={{ y: 50, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 50, opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden relative my-4" onClick={e => e.stopPropagation()}>
                <button onClick={closeModal} className="absolute top-4 right-4 z-30 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition backdrop-blur-md"><X size={24}/></button>
                <div className="relative h-64 md:h-96 w-full">
                  {selectedPost.coverImage ? <img src={selectedPost.coverImage} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-primary-900 flex items-center justify-center"><Tag size={64} className="text-primary-700 opacity-50"/></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white">
                    <span className="bg-gold-500 text-primary-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">{selectedPost.category}</span>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold leading-tight mb-4">{selectedPost.title}</h2>
                    <div className="flex items-center gap-6 text-sm text-gray-300">
                        <span className="flex items-center gap-2"><User size={16}/> {selectedPost.author || 'Administration'}</span>
                        <span className="flex items-center gap-2"><Calendar size={16}/> {new Date(selectedPost.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => handleLike(e, selectedPost)} className="absolute bottom-[-24px] right-8 md:right-12 bg-white text-primary-900 p-4 rounded-full shadow-2xl flex items-center gap-2 z-20 border-4 border-gray-50"><Heart size={28} className={selectedPost.likes > 0 ? "fill-rose-500 text-rose-500" : "text-gray-400"} /><span className="font-bold text-lg">{selectedPost.likes || 0}</span></motion.button>
                </div>
                <div className="p-6 md:p-12 bg-white">
                  <div className="prose prose-lg prose-primary max-w-none font-serif text-gray-700 leading-loose mb-12">
                    {selectedPost.content?.split('\n').map((para, i) => <p key={i} className="mb-4">{para}</p>)}
                  </div>
                  
                  {selectedPost.pdfDocument && (
                    <div className="my-12 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                      <div className="bg-primary-900 text-white p-4 flex items-center justify-between">
                        <h3 className="font-bold flex items-center gap-2"><FileText/> Document Joint</h3>
                        <a href={selectedPost.pdfDocument} download target="_blank" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2"><Download size={16}/> Télécharger PDF</a>
                      </div>
                      <div className="p-6 flex flex-col items-center bg-gray-200/50 max-h-[80vh] overflow-y-auto">
                        <Document file={selectedPost.pdfDocument} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                          {Array.from(new Array(numPages), (el, index) => <div key={`page_${index + 1}`} className="mb-6 shadow-xl rounded-sm overflow-hidden"><Page pageNumber={index + 1} width={Math.min(window.innerWidth * 0.85, 800)} renderTextLayer={false} renderAnnotationLayer={false}/></div>)}
                        </Document>
                      </div>
                    </div>
                  )}

                  {/* Zone Commentaires */}
                  <div className="border-t border-gray-100 pt-12 mt-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">Discussion ({selectedPost.comments?.length || 0})</h3>
                    {user ? (
                      <div className="flex gap-4 mb-10">
                        <div className="flex-1 relative">
                            <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Votre avis..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-primary-500 outline-none min-h-[100px]"></textarea>
                            <button onClick={handleCommentSubmit} disabled={!commentText.trim()} className="absolute bottom-3 right-3 bg-primary-900 text-white p-2 rounded-xl"><Send size={20}/></button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-orange-50 p-8 rounded-2xl text-center mb-10">
                          <p className="text-orange-800 font-bold mb-4">Connectez-vous pour commenter.</p>
                          <Link to="/login-public" className="inline-block bg-white text-orange-600 px-6 py-2 rounded-full font-bold shadow-sm">Se connecter</Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}