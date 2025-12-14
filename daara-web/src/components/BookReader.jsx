import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, Download, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Worker Local (Indispensable pour Vite)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// --- COMPOSANT PAGE (Optimisé pour la performance) ---
const BookPage = React.forwardRef(({ pageNumber, width, height }, ref) => {
  return (
    <div ref={ref} className="bg-white shadow-sm overflow-hidden flex items-center justify-center relative">
       {/* Conteneur à taille fixe pour éviter les sauts */}
       <div style={{ width, height }} className="bg-white relative">
         <Page 
            pageNumber={pageNumber} 
            width={width}   // Force la netteté exacte
            height={height}
            renderAnnotationLayer={false} 
            renderTextLayer={false} // Désactivé pour la fluidité (surtout sur mobile)
            loading={
              <div className="flex items-center justify-center h-full w-full bg-gray-50 text-gray-400 text-xs animate-pulse">
                P.{pageNumber}
              </div>
            }
         />
       </div>
       {/* Numéro de page */}
       <div className="absolute bottom-3 w-full text-center text-[10px] text-gray-400 font-mono z-10 pointer-events-none">
         {pageNumber}
       </div>
    </div>
  );
});

export default function BookReader({ pdfUrl, onClose, title }) {
  const [numPages, setNumPages] = useState(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Dimensions dynamiques
  const [bookDimensions, setBookDimensions] = useState({ width: 300, height: 420 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const bookRef = useRef();
  
  // --- CALCULATEUR DE TAILLE RESPONSIVE ---
  // C'est le coeur du système : il adapte le livre à n'importe quel écran
  const updateDimensions = useCallback(() => {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const isSmallScreen = screenW < 1024; // Mobile ou Tablette Portrait

    setIsMobile(isSmallScreen);

    // Marges de sécurité (Barres d'outils, padding)
    const marginW = isSmallScreen ? 20 : 120; // Moins de marge sur mobile
    const marginH = isSmallScreen ? 100 : 140;

    const availableW = screenW - marginW;
    const availableH = screenH - marginH;

    // Ratio A4 standard (Hauteur = 1.41 * Largeur)
    const RATIO = 1.41;

    let newHeight = availableH;
    let newWidth = newHeight / RATIO;

    // Si on est sur PC, on affiche 2 pages, donc la largeur totale est double
    const totalWidthNeeded = isSmallScreen ? newWidth : newWidth * 2;

    // Si ça dépasse en largeur, on réduit la hauteur pour que ça rentre
    if (totalWidthNeeded > availableW) {
        const scaleFactor = availableW / totalWidthNeeded;
        newWidth = newWidth * scaleFactor;
        newHeight = newHeight * scaleFactor;
    }

    setBookDimensions({
        width: Math.floor(newWidth),
        height: Math.floor(newHeight)
    });
  }, []);

  // Écouteur de redimensionnement (Rotation écran, changement fenêtre)
  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  // --- SON OPTIMISÉ ---
  const flipAudio = useMemo(() => {
    const audio = new Audio('/page-flip.mp3');
    audio.volume = 0.4;
    return audio;
  }, []);

  const playFlipSound = useCallback(() => {
    if (isSoundEnabled) {
      if (flipAudio.paused) {
        flipAudio.play().catch(() => {});
      } else {
        flipAudio.currentTime = 0; // Rembobine si on tourne vite
      }
    }
  }, [isSoundEnabled, flipAudio]);

  // Navigation
  const nextFlip = () => bookRef.current?.pageFlip()?.flipNext();
  const prevFlip = () => bookRef.current?.pageFlip()?.flipPrev();

  // Plein écran
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/98 flex flex-col overflow-hidden">
      
      {/* --- BARRE D'OUTILS (TOP) --- */}
      <div className="h-16 flex justify-between items-center px-4 bg-gray-800 border-b border-gray-700 select-none z-50">
        <div className="flex flex-col">
           <h2 className="text-white font-bold text-sm md:text-base truncate max-w-[150px] md:max-w-md">{title}</h2>
           <span className="text-gray-400 text-xs hidden sm:block">{numPages ? `${numPages} Pages` : 'Chargement...'}</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
           {/* Boutons Desktop */}
           <button onClick={() => setIsSoundEnabled(!isSoundEnabled)} className="p-2 text-gray-400 hover:text-gold-500 transition hidden sm:block">
             {isSoundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
           </button>
           
           <button onClick={toggleFullscreen} className="p-2 text-gray-400 hover:text-white transition hidden sm:block">
             {isFullscreen ? <Minimize className="h-5 w-5"/> : <Maximize className="h-5 w-5"/>}
           </button>

           <a href={pdfUrl} download target="_blank" className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition shadow-lg">
             <Download className="h-4 w-4" /> <span className="hidden sm:inline">Télécharger</span>
           </a>

           <div className="w-px h-6 bg-gray-600 mx-2"></div>

           <button onClick={onClose} className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-full transition shadow-lg">
             <X className="h-5 w-5" />
           </button>
        </div>
      </div>

      {/* --- ZONE DE LECTURE (CENTER) --- */}
      <div className="flex-1 flex items-center justify-center relative bg-gray-900 overflow-hidden p-4">
        
        <Document 
            file={pdfUrl} 
            onLoadSuccess={({ numPages }) => setNumPages(numPages)} 
            loading={<div className="text-gold-500 animate-bounce font-bold">Chargement du livre...</div>}
            error={<div className="text-white bg-red-600/20 p-4 rounded border border-red-500">Erreur : Impossible d'afficher ce PDF.</div>}
            className="flex items-center justify-center"
        >
           {numPages && (
             <HTMLFlipBook
                // Clé unique pour forcer le redessin si la taille change (évite les bugs graphiques)
                key={`${bookDimensions.width}-${bookDimensions.height}`} 
                width={bookDimensions.width}
                height={bookDimensions.height}
                size="fixed"
                minWidth={200}
                maxWidth={1000}
                minHeight={300}
                maxHeight={1400}
                showCover={true}
                usePortrait={isMobile} // 1 page sur Mobile, 2 pages sur PC
                maxShadowOpacity={0.3}
                flippingTime={800}
                onFlip={playFlipSound}
                ref={bookRef}
                className="shadow-2xl"
                style={{ margin: 'auto' }}
             >
                {Array.from(new Array(numPages), (el, index) => (
                   <BookPage 
                     key={`page_${index + 1}`} 
                     pageNumber={index + 1} 
                     width={bookDimensions.width} 
                     height={bookDimensions.height} 
                   />
                ))}
             </HTMLFlipBook>
           )}
        </Document>

        {/* --- NAVIGATION (ARROWS) --- */}
        {/* Uniquement sur PC pour ne pas gêner le tactile sur mobile */}
        {!isMobile && (
          <>
            <button className="absolute left-4 z-50 p-3 bg-gray-800/50 hover:bg-gold-500 text-white rounded-full transition hover:scale-110 backdrop-blur-sm" onClick={prevFlip}>
                <ChevronLeft className="h-8 w-8" />
            </button>
            <button className="absolute right-4 z-50 p-3 bg-gray-800/50 hover:bg-gold-500 text-white rounded-full transition hover:scale-110 backdrop-blur-sm" onClick={nextFlip}>
                <ChevronRight className="h-8 w-8" />
            </button>
          </>
        )}
      </div>

      {/* --- BARRE INFO MOBILE (BOTTOM) --- */}
      <div className="h-8 bg-gray-800 flex items-center justify-center text-gray-500 text-xs md:hidden">
        Touchez les bords ou glissez pour tourner
      </div>
    </div>
  );
}