import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container-narrow section-padding !py-0">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <a href="#" className="font-display font-extrabold text-xl sm:text-2xl text-foreground">
            Kora<span className="text-accent">Agency</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#services" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Nos Services</a>
            <a href="#projects" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Nos Projets</a>
            <a href="#about" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">À Propos</a>
            <a href="#videos" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Vidéos</a>
            <a href="#contact" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="cta" size="sm">Demander un Devis</Button>
          </div>

          <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            <a href="#services" className="font-body text-sm text-muted-foreground py-2" onClick={() => setIsOpen(false)}>Nos Services</a>
            <a href="#projects" className="font-body text-sm text-muted-foreground py-2" onClick={() => setIsOpen(false)}>Nos Projets</a>
            <a href="#about" className="font-body text-sm text-muted-foreground py-2" onClick={() => setIsOpen(false)}>À Propos</a>
            <a href="#videos" className="font-body text-sm text-muted-foreground py-2" onClick={() => setIsOpen(false)}>Vidéos</a>
            <a href="#contact" className="font-body text-sm text-muted-foreground py-2" onClick={() => setIsOpen(false)}>Contact</a>
            <Button variant="cta" size="sm" className="w-fit">Demander un Devis</Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
