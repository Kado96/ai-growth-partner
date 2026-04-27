import { useQuote } from "@/hooks/use-quote";

const Footer = () => {
  const { openQuote } = useQuote();
  
  return (
    <footer className="bg-card border-t border-border/50">
      <div className="container-narrow section-padding !py-12">
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display font-extrabold text-xl mb-3 text-foreground">
              Kora<span className="gradient-text">Agency</span>
            </h3>
            <p className="font-body text-sm text-muted-foreground">
              Marketing Automation & IA
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-3 text-muted-foreground">Contact</h4>
            <ul className="space-y-2 font-body text-sm text-muted-foreground">
              <li><a href="mailto:koraagency05@gmail.com" className="hover:text-accent transition-colors">koraagency05@gmail.com</a></li>
              <li><a href="tel:+25769725535" className="hover:text-accent transition-colors">+257 69 725 535</a></li>
              <li>Bujumbura, Burundi</li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-3 text-muted-foreground">Navigation</h4>
            <ul className="space-y-2 font-body text-sm text-muted-foreground">
              <li><a href="/" className="hover:text-accent transition-colors">Accueil</a></li>
              <li><a href="/#services" className="hover:text-accent transition-colors">Nos Services</a></li>
              <li><button onClick={openQuote} className="hover:text-accent transition-colors text-left">Obtenir un Devis</button></li>
              <li><a href="/#about" className="hover:text-accent transition-colors">À Propos</a></li>
              <li><a href="/#contact" className="hover:text-accent transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/30 mt-8 pt-8 text-center">
          <p className="font-body text-xs text-muted-foreground/60">
            © 2026 Kora Agency Marketing Automation. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
