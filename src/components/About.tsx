import { motion } from "framer-motion";
import { Users, Cpu, Quote, TrendingUp, Shield } from "lucide-react";

const stats = [
  { icon: Cpu, value: "150+", label: "Solutions sur mesure" },
  { icon: Users, value: "15", label: "Experts en IA" },
  { icon: TrendingUp, value: "98%", label: "Satisfaction client" },
  { icon: Shield, value: "24/7", label: "Support dédié" },
];

const About = () => {
  return (
    <section id="about" className="bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(180_70%_50%_/_0.05),_transparent_60%)]" />
      <div className="container-narrow section-padding relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-display font-semibold text-accent text-xs tracking-widest uppercase mb-4">
            Qui sommes-nous
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mt-3">À Propos de Kora Agency</h2>
          <p className="font-body text-muted-foreground mt-4 max-w-2xl mx-auto">
            Aider les entreprises à intégrer des solutions d'IA pour optimiser leurs opérations et améliorer leur prise de décision.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 text-center hover:border-accent/30 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <stat.icon className="text-accent" size={24} />
              </div>
              <h3 className="font-display font-extrabold text-2xl gradient-text">{stat.value}</h3>
              <p className="font-body text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 sm:p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-cta to-accent rounded-t-2xl" />
          <Quote className="text-accent/20 absolute top-6 left-6" size={48} />
          <blockquote className="font-body text-lg text-foreground italic text-center relative z-10 leading-relaxed">
            "Grâce à Kora Agency Marketing Automation, notre efficacité a considérablement augmenté. Leur expertise en IA a transformé notre approche stratégique et amélioré notre prise de décision."
          </blockquote>
          <p className="font-display font-semibold gradient-text text-center mt-6">— Sophie L.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
