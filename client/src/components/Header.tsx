import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useQuote } from "@/hooks/use-quote";

const Header = () => {
  const { openQuote } = useQuote();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/50">
      <div className="container-narrow section-padding !py-0">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <a href="/" className="font-display font-extrabold text-xl sm:text-2xl text-foreground">
            Kora<span className="gradient-text">Agency</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {["Nos Services", "Nos Projets", "À Propos", "Vidéos", "Contact"].map((item) => {
              const id = item === "Nos Services" ? "services" : item === "Nos Projets" ? "projects" : item === "À Propos" ? "about" : item === "Vidéos" ? "videos" : "contact";
              return (
                <a key={id} href={`/#${id}`} className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors relative group">
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300 rounded-full" />
                </a>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="cta" size="sm" onClick={openQuote}>Demander un Devis</Button>
          </div>

          <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3 border-t border-border/50 pt-4">
            {[
              { label: "Nos Services", id: "services" },
              { label: "Nos Projets", id: "projects" },
              { label: "À Propos", id: "about" },
              { label: "Vidéos", id: "videos" },
              { label: "Contact", id: "contact" },
            ].map((item) => (
              <a key={item.id} href={`/#${item.id}`} className="font-body text-sm text-muted-foreground py-2 hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>
                {item.label}
              </a>
            ))}
            <Button variant="cta" size="sm" className="w-fit mt-2" onClick={() => { setIsOpen(false); openQuote(); }}>Demander un Devis</Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
