import { motion } from "framer-motion";
import { Users, Cpu, Quote } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="bg-section-alt">
      <div className="container-narrow section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="font-display font-semibold text-accent text-sm tracking-widest uppercase">Qui sommes-nous</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mt-3">À Propos de Kora Agency</h2>
          <p className="font-body text-muted-foreground mt-4 max-w-2xl mx-auto">
            Aider les entreprises à intégrer des solutions d'IA pour optimiser leurs opérations et améliorer leur prise de décision.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-background rounded-2xl p-8 shadow-[var(--shadow-card)] text-center"
          >
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Cpu className="text-accent" size={28} />
            </div>
            <h3 className="font-display font-extrabold text-3xl text-foreground">150+</h3>
            <p className="font-body text-muted-foreground mt-1">Solutions sur mesure</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-background rounded-2xl p-8 shadow-[var(--shadow-card)] text-center"
          >
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Users className="text-accent" size={28} />
            </div>
            <h3 className="font-display font-extrabold text-3xl text-foreground">15</h3>
            <p className="font-body text-muted-foreground mt-1">Experts en IA</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-background rounded-2xl p-8 sm:p-12 shadow-[var(--shadow-card)] relative"
        >
          <Quote className="text-accent/20 absolute top-6 left-6" size={48} />
          <blockquote className="font-body text-lg text-foreground italic text-center relative z-10">
            "Grâce à Kora Agency Marketing Automation, notre efficacité a considérablement augmenté. Leur expertise en IA a transformé notre approche stratégique et amélioré notre prise de décision."
          </blockquote>
          <p className="font-display font-semibold text-accent text-center mt-6">— Sophie L.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
