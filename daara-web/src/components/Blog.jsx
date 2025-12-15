import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ArrowRight, MessageSquare, Tag, X, Send, Heart, LogIn, FileText, Download } from 'lucide-react';
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

  const handleLike = async (post) => {
    try {
      const res = await axios.put(`https://daara-app.onrender.com/api/blog/${post._id}/like`);
      const updatedPosts = posts.map(p => p._id === post._id ? res.data : p);
      setPosts(updatedPosts);
      if (selectedPost && selectedPost._id === post._id) setSelectedPost(res.data);
    } catch (error) { console.error(error); }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    if (!user) return alert("Veuillez vous connecter !");
    try {
      const res = await axios.post(`https://daara-app.onrender.com/api/blog/${selectedPost._id}/comment`, {
        author: user.fullName, content: commentText
      });
      const updatedPosts = posts.map(p => p._id === selectedPost._id ? res.data : p);
      setPosts(updatedPosts);
      setSelectedPost(res.data);
      setCommentText('');
    } catch (error) { console.error(error); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Header */}
      <div className="bg-primary-900 text-white pt-24 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-6xl font-serif font-bold mb-4 relative z-10"
        >
          Le Journal du Daara
        </motion.h1>
        <p className="text-primary-200 text-lg relative z-10">Réflexions, actualités et vie de la communauté</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
            >
              <div className="h-56 overflow-hidden relative cursor-pointer" onClick={() => setSelectedPost(post)}>
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full bg-emerald-100 flex items-center justify-center"><Tag className="text-emerald-300 w-16 h-16"/></div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary-900 uppercase tracking-wider">
                  {post.category}
                </div>
                {post.pdfUrl && (
                  <div className="absolute top-4 right-4 bg-red-600/90 backdrop-blur-sm p-1.5 rounded-lg text-white" title="Contient un PDF">
                    <FileText size={16} />
                  </div>
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="flex items-center"><Calendar size={14} className="mr-1"/> {new Date(post.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center text-rose-500 font-bold"><Heart size={14} className="mr-1 fill-current"/> {post.likes || 0}</div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-serif group-hover:text-gold-600 transition-colors cursor-pointer" onClick={() => setSelectedPost(post)}>
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">{post.summary}</p>
                
                <button onClick={() => setSelectedPost(post)} className="mt-auto w-full py-3 border border-primary-100 text-primary-700 rounded-xl font-bold hover:bg-primary-900 hover:text-white transition flex items-center justify-center gap-2 group/btn">
                  Lire l'article <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform"/>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* MODAL ARTICLE COMPLET */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-primary-900/95 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedPost(null)}
          >
            <div className="min-h-full flex items-center justify-center py-10 w-full">
              <motion.div 
                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col relative"
                onClick={e => e.stopPropagation()}
              >
                <button onClick={() => setSelectedPost(null)} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full z-20 transition">
                  <X size={24} color="white"/>
                </button>

                {/* Cover */}
                <div className="h-64 md:h-80 w-full relative shrink-0">
                  {selectedPost.coverImage && <img src={selectedPost.coverImage} className="w-full h-full object-cover" alt="" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-8">
                    <div className="w-full flex justify-between items-end">
                       <div>
                          <span className="text-gold-400 font-bold uppercase tracking-widest text-xs mb-2 block">{selectedPost.category}</span>
                          <h2 className="text-2xl md:text-4xl font-serif font-bold text-white leading-tight">{selectedPost.title}</h2>
                       </div>
                       <button onClick={() => handleLike(selectedPost)} className="flex flex-col items-center gap-1 group">
                          <div className="bg-white/10 p-3 rounded-full backdrop-blur-md group-hover:bg-white transition-colors border border-white/20">
                            <Heart size={28} className="text-white group-hover:text-rose-500 group-hover:fill-rose-500 transition-colors" />
                          </div>
                          <span className="text-white font-bold text-sm">{selectedPost.likes || 0}</span>
                       </button>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-12">
                  {/* Contenu Texte */}
                  <div className="prose prose-lg text-gray-700 max-w-none font-serif leading-loose mb-10">
                    {selectedPost.content}
                  </div>

                  {/* --- LECTEUR PDF INTÉGRÉ (Vertical) --- */}
                  {selectedPost.pdfUrl && (
                    <div className="mt-8 mb-12 border-t border-b border-gray-100 py-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-primary-900 flex items-center gap-2">
                          <FileText className="text-red-500"/> Document attaché
                        </h3>
                        <a href={selectedPost.pdfUrl} download target="_blank" className="text-sm font-bold text-primary-600 hover:underline flex items-center gap-1">
                          <Download size={14}/> Télécharger
                        </a>
                      </div>

                      <div className="bg-gray-100 p-4 rounded-xl max-h-[600px] overflow-y-auto flex flex-col items-center custom-scrollbar">
                        <Document 
                          file={selectedPost.pdfUrl} 
                          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                          loading={<div className="text-gray-500">Chargement du document...</div>}
                          error={<div className="text-red-500">Erreur de chargement PDF</div>}
                        >
                          {/* Boucle pour afficher toutes les pages les unes sous les autres */}
                          {Array.from(new Array(numPages), (el, index) => (
                            <div key={`page_${index + 1}`} className="mb-4 shadow-lg">
                              <Page 
                                pageNumber={index + 1} 
                                width={Math.min(window.innerWidth * 0.8, 700)} // Responsive width
                                renderTextLayer={false} 
                                renderAnnotationLayer={false}
                              />
                            </div>
                          ))}
                        </Document>
                      </div>
                    </div>
                  )}

                  {/* Commentaires */}
                  <div className="mt-10">
                    <h3 className="text-2xl font-bold text-primary-900 mb-6 flex items-center">
                      <MessageSquare className="mr-3 text-gold-500"/> 
                      Commentaires <span className="ml-2 text-sm bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{selectedPost.comments?.length || 0}</span>
                    </h3>
                    
                    {user ? (
                      <div className="bg-gray-50 p-6 rounded-2xl mb-10 border border-gray-100">
                        <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Partagez votre avis..." className="w-full bg-white border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-gold-500 outline-none h-24 resize-none text-sm"></textarea>
                        <div className="flex justify-end mt-3"><button onClick={handleCommentSubmit} className="bg-primary-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary-800 transition flex items-center gap-2 text-sm shadow-lg">Publier <Send size={16}/></button></div>
                      </div>
                    ) : (
                      <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 mb-10 text-center"><p className="text-orange-800 font-medium mb-4">Connectez-vous pour participer à la discussion.</p><Link to="/login-public" className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-2 rounded-full font-bold shadow-sm hover:shadow-md transition"><LogIn size={16} /> Se connecter</Link></div>
                    )}

                    <div className="space-y-6">
                      {selectedPost.comments && selectedPost.comments.slice().reverse().map((comment, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm">{comment.author.charAt(0)}</div>
                          <div><div className="flex items-center gap-2 mb-1"><h4 className="font-bold text-gray-900">{comment.author}</h4><span className="text-gray-400 text-xs">• {new Date(comment.date).toLocaleDateString()}</span></div><p className="text-gray-600 text-sm leading-relaxed">{comment.content}</p></div>
                        </div>
                      ))}
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