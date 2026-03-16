import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-ai.jpg";
import { Sparkles, ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(260_80%_62%_/_0.12),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(180_70%_50%_/_0.08),_transparent_60%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container-narrow section-padding w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
            >
              <Sparkles className="text-accent" size={14} />
              <span className="font-display font-semibold text-accent text-xs tracking-widest uppercase">
                Marketing Automation & IA
              </span>
            </motion.div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight text-foreground mb-6">
              L'IA au service de{" "}
              <span className="gradient-text">votre succès.</span>
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
              Accélérez votre croissance, automatisez vos processus et prenez des décisions plus intelligentes grâce à l'intelligence artificielle.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" asChild>
                <a href="#services" className="group">
                  Nos Services
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button variant="hero-outline" asChild>
                <a href="#contact">Contactez-Nous</a>
              </Button>
            </div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-8 mt-12 pt-8 border-t border-border/50"
            >
              {[
                { value: "150+", label: "Solutions livrées" },
                { value: "98%", label: "Satisfaction client" },
                { value: "3x", label: "Plus rapide" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display font-extrabold text-2xl gradient-text">{stat.value}</p>
                  <p className="font-body text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden glow-border">
              <img src={heroImg} alt="Intelligence artificielle et automatisation" className="w-full h-auto object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            </div>
            {/* Floating accent elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-cta/10 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
