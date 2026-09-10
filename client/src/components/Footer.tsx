import { useQuote } from "@/hooks/use-quote";
import { useConfig } from "@/hooks/use-config";
import { API_URL } from "@/lib/api";

const Footer = () => {
  const { openQuote } = useQuote();
  const { config } = useConfig();

  return (
    <footer className="bg-card border-t border-border/50">
      <div className="container-narrow section-padding !py-12">
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              {config?.branding?.logoPath && (
                <img
                  src={config.branding.logoPath.startsWith('http') ? config.branding.logoPath : `${API_URL}${config.branding.logoPath}`}
                  alt={config?.branding?.name || "Logo"}
                  className="h-9 w-auto object-contain"
                />
              )}
              <h3 className="font-display font-extrabold text-xl text-foreground">
                {config?.branding?.name || "Kora Agency"}
              </h3>
            </div>
            <p className="font-body text-sm text-muted-foreground">
              {config?.branding?.description || "Communication, tech et solutions digitales"}
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-3 text-muted-foreground">Contact</h4>
            <ul className="space-y-2 font-body text-sm text-muted-foreground">
              {config?.branding?.email && (
                <li>
                  <a href={`mailto:${config.branding.email}`} className="hover:text-accent transition-colors">
                    {config.branding.email}
                  </a>
                </li>
              )}
              {config?.branding?.phone && (
                <li>
                  <a href={`tel:${config.branding.phone.replace(/\s+/g, '')}`} className="hover:text-accent transition-colors">
                    {config.branding.phone}
                  </a>
                </li>
              )}
              {config?.branding?.address && (
                <li>{config.branding.address}</li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-3 text-muted-foreground">Navigation</h4>
            <ul className="space-y-2 font-body text-sm text-muted-foreground">
              <li><a href="/" className="hover:text-accent transition-colors">Accueil</a></li>
              <li><a href="/#services" className="hover:text-accent transition-colors">Nos Services</a></li>
              <li><button onClick={() => openQuote()} className="hover:text-accent transition-colors text-left">Obtenir un Devis</button></li>
              <li><a href="/#about" className="hover:text-accent transition-colors">À Propos</a></li>
              <li><a href="/#contact" className="hover:text-accent transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/30 mt-8 pt-8 text-center">
          <p className="font-body text-xs text-muted-foreground/60">
            © 2026 {config?.branding?.name || "Kora Agency"}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
