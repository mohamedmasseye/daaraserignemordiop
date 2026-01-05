// src/utils/imageHelper.js

export const getOptimizedImage = (url, width = 500) => {
  // 1. Si pas d'URL, on ne fait rien (ou on retourne une image par défaut si tu en as une)
  if (!url) return url;

  // 2. Si l'image ne vient pas de Cloudinary, on la retourne telle quelle
  if (!url.includes('cloudinary')) return url;

  // 3. Si l'image est déjà optimisée (contient déjà w_), on ne touche à rien pour éviter les bugs
  if (url.includes('/w_')) return url;

  // 4. INJECTION MAGIQUE :
  // w_${width} : On redimensionne à la largeur demandée
  // f_auto : Le navigateur choisit le meilleur format (WebP sur Android)
  // q_auto : Compression intelligente sans perte visible
  return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
};