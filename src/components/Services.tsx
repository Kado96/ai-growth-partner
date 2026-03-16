import { motion } from "framer-motion";
import strategyImg from "@/assets/service-strategy.png";
import solutionsImg from "@/assets/service-solutions.png";
import automationImg from "@/assets/service-automation.png";

const services = [
  {
    title: "Stratégie, Conseil & Formations IA",
    description: "Analyse des processus, définition de stratégie IA adaptée, intégration sur mesure pour maximiser l'impact.",
    image: strategyImg,
  },
  {
    title: "Solutions IA sur Mesure",
    description: "Développement de solutions IA personnalisées pour optimiser les processus, améliorer la prise de décision et accélérer la croissance.",
    image: solutionsImg,
  },
  {
    title: "Automatisation des Processus",
    description: "Automatisation des workflows pour augmenter la productivité, minimiser les erreurs et gagner du temps.",
    image: automationImg,
  },
];

const Services = () => {
  return (
    <section id="services" className="bg-section-alt">
      <div className="container-narrow section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="font-display font-semibold text-accent text-sm tracking-widest uppercase">Ce que nous faisons</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mt-3">Nos Services</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-background rounded-2xl p-8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow group text-center"
            >
              <div className="w-28 h-28 mx-auto mb-6">
                <img src={service.image} alt={service.title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">{service.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
