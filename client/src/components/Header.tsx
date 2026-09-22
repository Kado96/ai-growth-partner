import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useQuote } from "@/hooks/use-quote";
import { useConfig } from "@/hooks/use-config";
import { API_URL } from "@/lib/api";

const Header = () => {
  const { config } = useConfig();
  const { openQuote } = useQuote();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/50">
      <div className="container-narrow section-padding !py-0">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <a href="/" className="flex items-center gap-2.5 group">
            {config?.branding?.logoPath && (
              <img
                src={config.branding.logoPath.startsWith('http') ? config.branding.logoPath : `${API_URL}${config.branding.logoPath}`}
                alt={config?.branding?.name || "Logo"}
                className="h-8 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            )}
            <span className="font-display font-extrabold text-lg sm:text-2xl text-white tracking-tight">
              {config?.branding?.name || "Kora Agency"}
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {[
              { label: "Accueil", href: "/" },
              { label: "Services", href: "/#services" },
              { label: "Projets", href: "/#projects" },
              { label: "À Propos", href: "/#about" },
              { label: "Blog", href: "/blog" },
              { label: "Vidéos", href: "/#videos" },
              { label: "Contact", href: "/#contact" }
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="font-body text-sm font-medium text-slate-300 hover:text-white transition-colors relative group py-1"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300 rounded-full" />
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="cta" size="sm" className="font-bold tracking-wide shadow-lg shadow-accent/20" onClick={() => openQuote()}>
              Demander un Devis
            </Button>
          </div>

          <button className="md:hidden text-foreground p-2" onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-6 flex flex-col gap-3 border-t border-white/10 pt-4 animate-in slide-in-from-top-2 duration-300">
            {[
              { label: "Accueil", href: "/" },
              { label: "Services", href: "/#services" },
              { label: "Projets", href: "/#projects" },
              { label: "À Propos", href: "/#about" },
              { label: "Blog", href: "/blog" },
              { label: "Vidéos", href: "/#videos" },
              { label: "Contact", href: "/#contact" }
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="font-body text-sm font-medium text-slate-300 hover:text-white py-2 px-1 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Button variant="cta" size="sm" className="w-full mt-2 font-bold" onClick={() => { setIsOpen(false); openQuote(); }}>
              Demander un Devis
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
