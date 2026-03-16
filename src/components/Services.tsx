import { motion } from "framer-motion";
import { Brain, Cog, Lightbulb } from "lucide-react";

const services = [
  {
    title: "Stratégie, Conseil & Formations IA",
    description: "Analyse des processus, définition de stratégie IA adaptée, intégration sur mesure pour maximiser l'impact.",
    icon: Lightbulb,
    gradient: "from-accent/20 to-accent/5",
  },
  {
    title: "Solutions IA sur Mesure",
    description: "Développement de solutions IA personnalisées pour optimiser les processus, améliorer la prise de décision et accélérer la croissance.",
    icon: Brain,
    gradient: "from-cta/20 to-cta/5",
  },
  {
    title: "Automatisation des Processus",
    description: "Automatisation des workflows pour augmenter la productivité, minimiser les erreurs et gagner du temps.",
    icon: Cog,
    gradient: "from-accent/20 to-cta/5",
  },
];

const Services = () => {
  return (
    <section id="services" className="bg-section-alt relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(260_80%_62%_/_0.05),_transparent_70%)]" />
      <div className="container-narrow section-padding relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-display font-semibold text-accent text-xs tracking-widest uppercase mb-4">
            Ce que nous faisons
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mt-3">Nos Services</h2>
          <p className="font-body text-muted-foreground mt-4 max-w-xl mx-auto">
            Des solutions innovantes pour transformer votre entreprise avec l'intelligence artificielle.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-card p-8 hover:border-accent/30 transition-all duration-500 group relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="text-accent" size={28} />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-3">{service.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
