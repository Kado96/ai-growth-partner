import { motion } from "framer-motion";
import { Search, Cpu, PenTool, BarChart3, Quote } from "lucide-react";
import { useConfig } from "@/hooks/use-config";
import { API_URL } from "@/lib/api";

const MethodIconMap: Record<string, any> = {
  "Audit & Analyse": Search,
  "Stratégie IA": Cpu,
  "Exécution Créative": PenTool,
  "Suivi & Rapports": BarChart3
};

const About = () => {
  const { config, loading } = useConfig();

  if (loading || !config) return null;

  const { about = {
    title: "Notre Vision",
    motto: "L'intelligence artificielle au service de l'humain.",
    text: "Chargement...",
    methodology: []
  } } = config;

  return (
    <section id="about" className="section-padding relative overflow-hidden bg-background">
      <div className="container-narrow relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="font-display font-semibold text-accent text-xs tracking-widest uppercase mb-4 block">
              {about.title}
            </span>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground mb-6 leading-tight">
              {about.motto}
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              {about.text}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {about.methodology.map((item: any, i: number) => {
              const Icon = MethodIconMap[item.title] || Search;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6 border-accent/10"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <Icon className="text-accent" size={24} />
                  </div>
                  <h4 className="font-display font-bold text-foreground mb-2">{item.title}</h4>
                  <p className="font-body text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 sm:p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-cta to-accent rounded-t-2xl" />
          <Quote className="text-accent/20 absolute top-6 left-6" size={48} />
          <blockquote className="font-body text-xl text-foreground italic text-center relative z-10 leading-relaxed max-w-3xl mx-auto">
            "Kora Agency n'est pas qu'une agence de marketing. C'est votre partenaire de croissance, utilisant les technologies de demain pour résoudre les problèmes d'aujourd'hui."
          </blockquote>
          <p className="font-display font-semibold gradient-text text-center mt-6 uppercase tracking-wider">— Kora Team</p>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
