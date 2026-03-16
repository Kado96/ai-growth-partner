const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-narrow section-padding !py-12">
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display font-extrabold text-xl mb-3">
              Kora<span className="text-accent">Agency</span>
            </h3>
            <p className="font-body text-sm text-primary-foreground/70">
              Marketing Automation & IA
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-3 text-primary-foreground/80">Contact</h4>
            <ul className="space-y-2 font-body text-sm text-primary-foreground/70">
              <li><a href="mailto:koraagency05@gmail.com" className="hover:text-accent transition-colors">koraagency05@gmail.com</a></li>
              <li><a href="tel:+25769725535" className="hover:text-accent transition-colors">+257 69 725 535</a></li>
              <li>Bujumbura, Burundi</li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-3 text-primary-foreground/80">Liens</h4>
            <ul className="space-y-2 font-body text-sm text-primary-foreground/70">
              <li><a href="#services" className="hover:text-accent transition-colors">Nos Services</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Politique de Confidentialité</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Conditions Générales d'Utilisation</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center">
          <p className="font-body text-xs text-primary-foreground/50">
            © 2025 Kora Agency Marketing Automation. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
