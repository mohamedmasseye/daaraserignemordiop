import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ArrowRight, MessageSquare, Tag, X, Send, Heart, LogIn, FileText, Download, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';

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
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // États PDF
  const [numPages, setNumPages] = useState(null);

  // États Interaction
  const [commentText, setCommentText] = useState('');
  const [user, setUser] = useState(null);
  const [isLiking, setIsLiking] = useState(false); // Pour éviter le double-clic

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user_info'));
    setUser(storedUser);
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('https://daara-app.onrender.com/api/blog');
      setPosts(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleLike = async (e, post) => {
    e.stopPropagation(); // Empêche d'ouvrir le modal si on clique sur like depuis la liste
    if (isLiking) return;
    setIsLiking(true);

    try {
      const res = await axios.put(`https://daara-app.onrender.com/api/blog/${post._id}/like`);
      
      // Mise à jour locale optimiste
      const updatedPosts = posts.map(p => p._id === post._id ? res.data : p);
      setPosts(updatedPosts);
      
      if (selectedPost && selectedPost._id === post._id) {
          setSelectedPost(res.data);
      }
    } catch (error) { console.error(error); } 
    finally { setIsLiking(false); }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    if (!user) return alert("Veuillez vous connecter pour commenter !");
    try {
      const res = await axios.post(`https://daara-app.onrender.com/api/blog/${selectedPost._id}/comment`, {
        author: user.fullName, content: commentText
      });
      const updatedPosts = posts.map(p => p._id === selectedPost._id ? res.data : p);
      setPosts(updatedPosts);
      setSelectedPost(res.data); // Met à jour le modal ouvert
      setCommentText('');
    } catch (error) { console.error(error); }
  };

  // Fermeture du modal propre
  const closeModal = () => {
      setSelectedPost(null);
      setNumPages(null); // Reset PDF
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-emerald-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-current mb-4"></div>
        <p className="font-serif animate-pulse">Chargement du Journal...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-800">
      
      {/* Header Héroique */}
      <div className="bg-emerald-900 text-white pt-28 pb-24 px-4 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/50 to-emerald-900"></div>
        <motion.div 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="relative z-10"
        >
            <span className="inline-block py-1 px-3 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold tracking-widest uppercase mb-4 border border-gold-500/30">
                Médiathèque & Savoir
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">Le Journal du Daara</h1>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto font-light">
                Explorez nos articles, reflexions spirituelles et documents d'étude.
            </p>
        </motion.div>
      </div>

      {/* Grille des Articles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full cursor-pointer transform hover:-translate-y-1"
              onClick={() => setSelectedPost(post)}
            >
              {/* Image Card */}
              <div className="h-56 overflow-hidden relative">
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full bg-emerald-50 flex items-center justify-center flex-col text-emerald-200">
                      <FileText size={48} />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-emerald-800 uppercase tracking-wider shadow-sm">
                  {post.category}
                </div>
                {post.pdfDocument && (
                  <div className="absolute bottom-4 right-4 bg-red-600 text-white p-2 rounded-full shadow-lg" title="PDF Inclus">
                    <FileText size={16} />
                  </div>
                )}
              </div>
              
              {/* Contenu Card */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span className="flex items-center"><Calendar size={14} className="mr-1"/> {new Date(post.createdAt).toLocaleDateString()}</span>
                  
                  {/* Bouton Like Card */}
                  <button 
                    onClick={(e) => handleLike(e, post)}
                    className="flex items-center text-gray-400 hover:text-rose-500 transition-colors z-10"
                  >
                    <Heart size={16} className={`mr-1 ${post.likes > 0 ? 'fill-rose-500 text-rose-500' : ''}`}/> 
                    {post.likes || 0}
                  </button>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-serif group-hover:text-emerald-700 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1 leading-relaxed">
                    {post.summary || "Aucun résumé disponible."}
                </p>
                
                <div className="mt-auto w-full py-3 bg-gray-50 text-emerald-700 rounded-xl font-bold group-hover:bg-emerald-600 group-hover:text-white transition flex items-center justify-center gap-2 text-sm">
                  Lire l'article <ArrowRight size={16}/>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- MODAL ARTICLE (DESIGN REVU) --- */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-emerald-950/80 backdrop-blur-md overflow-y-auto" // Scroll sur le parent
            onClick={closeModal}
          >
            {/* Conteneur Flex items-start pour voir le haut */}
            <div className="min-h-full w-full flex items-start justify-center p-4 md:p-8">
              
              <motion.div 
                initial={{ y: 50, opacity: 0, scale: 0.95 }} 
                animate={{ y: 0, opacity: 1, scale: 1 }} 
                exit={{ y: 50, opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", bounce: 0.3 }}
                className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden relative my-4" // Marge verticale
                onClick={e => e.stopPropagation()}
              >
                {/* Bouton Fermer Flottant */}
                <button 
                    onClick={closeModal} 
                    className="absolute top-4 right-4 z-30 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition backdrop-blur-md"
                >
                  <X size={24}/>
                </button>

                {/* --- 1. HERO IMAGE DU MODAL --- */}
                <div className="relative h-64 md:h-96 w-full">
                  {selectedPost.coverImage ? (
                      <img src={selectedPost.coverImage} className="w-full h-full object-cover" alt="" />
                  ) : (
                      <div className="w-full h-full bg-emerald-900 flex items-center justify-center">
                          <Tag size={64} className="text-emerald-700 opacity-50"/>
                      </div>
                  )}
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  
                  {/* Titre et Infos sur l'image */}
                  <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white">
                    <span className="bg-gold-500 text-emerald-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
                        {selectedPost.category}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold leading-tight mb-4 text-shadow-lg">
                        {selectedPost.title}
                    </h2>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-300">
                        <span className="flex items-center gap-2"><User size={16}/> {selectedPost.author || 'Administration'}</span>
                        <span className="flex items-center gap-2"><Calendar size={16}/> {new Date(selectedPost.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* BOUTON LIKE FLOTTANT (Gros) */}
                  <motion.button 
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => handleLike(e, selectedPost)}
                    className="absolute bottom-[-24px] right-8 md:right-12 bg-white text-emerald-900 p-4 rounded-full shadow-2xl flex items-center gap-2 z-20 border-4 border-gray-50 hover:border-emerald-100 transition-colors"
                  >
                    <Heart size={28} className={selectedPost.likes > 0 ? "fill-rose-500 text-rose-500" : "text-gray-400"} />
                    <span className="font-bold text-lg">{selectedPost.likes || 0}</span>
                  </motion.button>
                </div>

                {/* --- 2. CONTENU PRINCIPAL --- */}
                <div className="p-6 md:p-12 bg-white">
                  
                  {/* Texte Riche */}
                  <div className="prose prose-lg prose-emerald max-w-none font-serif text-gray-700 leading-loose mb-12 first-letter:text-5xl first-letter:font-bold first-letter:text-emerald-700 first-letter:mr-1 first-letter:float-left">
                    {selectedPost.content.split('\n').map((para, i) => (
                        <p key={i} className="mb-4">{para}</p>
                    ))}
                  </div>

                  {/* --- 3. LECTEUR PDF AMÉLIORÉ --- */}
                  {selectedPost.pdfDocument && (
                    <div className="my-12 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                      <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
                        <h3 className="font-bold flex items-center gap-2"><FileText/> Document Joint</h3>
                        <a 
                            href={selectedPost.pdfDocument} 
                            download 
                            target="_blank"
                            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2"
                        >
                            <Download size={16}/> Télécharger PDF
                        </a>
                      </div>
                      
                      <div className="p-6 flex flex-col items-center bg-gray-200/50 max-h-[80vh] overflow-y-auto custom-scrollbar">
                        <Document 
                          file={selectedPost.pdfDocument} 
                          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                          loading={<div className="p-10 text-gray-500 animate-pulse">Chargement du document...</div>}
                          error={<div className="p-10 text-red-500">Impossible de charger l'aperçu PDF.</div>}
                        >
                          {Array.from(new Array(numPages), (el, index) => (
                            <div key={`page_${index + 1}`} className="mb-6 shadow-xl rounded-sm overflow-hidden">
                              <Page 
                                pageNumber={index + 1} 
                                width={Math.min(window.innerWidth * 0.85, 800)} 
                                renderTextLayer={false} 
                                renderAnnotationLayer={false}
                              />
                            </div>
                          ))}
                        </Document>
                      </div>
                    </div>
                  )}

                  {/* --- 4. ZONE COMMENTAIRES --- */}
                  <div className="border-t border-gray-100 pt-12 mt-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700"><MessageSquare size={24}/></div>
                      Discussion <span className="text-gray-400 text-lg font-normal">({selectedPost.comments?.length || 0})</span>
                    </h3>
                    
                    {/* Formulaire */}
                    {user ? (
                      <div className="flex gap-4 mb-10">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xl shrink-0">
                            {user.fullName.charAt(0)}
                        </div>
                        <div className="flex-1 relative">
                            <textarea 
                                value={commentText} 
                                onChange={(e) => setCommentText(e.target.value)} 
                                placeholder="Partagez votre avis avec la communauté..." 
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] resize-y text-gray-700"
                            ></textarea>
                            <button 
                                onClick={handleCommentSubmit} 
                                disabled={!commentText.trim()}
                                className="absolute bottom-3 right-3 bg-emerald-600 disabled:bg-gray-300 text-white p-2 rounded-xl transition hover:bg-emerald-700"
                            >
                                <Send size={20}/>
                            </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-8 mb-10 text-center">
                          <LogIn className="mx-auto text-orange-400 mb-3" size={32}/>
                          <p className="text-orange-800 font-bold mb-4">Connectez-vous pour participer à la discussion.</p>
                          <Link to="/login-public" className="inline-block bg-white text-orange-600 px-6 py-2 rounded-full font-bold shadow-sm hover:shadow-md transition">Se connecter</Link>
                      </div>
                    )}

                    {/* Liste des commentaires */}
                    <div className="space-y-6">
                      {selectedPost.comments && selectedPost.comments.slice().reverse().map((comment, i) => (
                        <div key={i} className="group flex gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm shrink-0 border border-gray-200">
                              {comment.author.charAt(0)}
                          </div>
                          <div className="flex-1">
                              <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none">
                                  <div className="flex justify-between items-baseline mb-1">
                                      <h4 className="font-bold text-gray-900 text-sm">{comment.author}</h4>
                                      <span className="text-xs text-gray-400">{new Date(comment.date).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                              </div>
                          </div>
                        </div>
                      ))}
                      {(!selectedPost.comments || selectedPost.comments.length === 0) && (
                          <p className="text-center text-gray-400 italic py-8">Soyez le premier à commenter cet article.</p>
                      )}
                    </div>
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