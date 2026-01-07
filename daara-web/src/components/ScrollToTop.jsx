import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Cette fonction remonte la page tout en haut à chaque changement d'URL
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // ✅ Ajout de l'effet de glissement fluide
    });
  }, [pathname]);

  return null;
}