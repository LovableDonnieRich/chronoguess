
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Utente ha tentato di accedere a un percorso inesistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-vintage-background">
      <div className="text-center p-8 max-w-md bg-vintage-paper rounded-lg shadow-lg">
        <h1 className="text-5xl font-bold mb-4 text-vintage-ink">404</h1>
        <p className="text-xl text-vintage-text mb-6">Oops! Pagina non trovata</p>
        <p className="mb-8 text-vintage-text">
          La pagina che stai cercando potrebbe essere stata rimossa o non esiste.
        </p>
        <Button asChild className="bg-vintage-accent hover:bg-vintage-accent/80 text-white">
          <a href="/">Torna alla Home</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
