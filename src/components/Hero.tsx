import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-ai.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      <div className="container-narrow section-padding w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block font-display font-semibold text-accent text-sm tracking-widest uppercase mb-4">
              Marketing Automation & IA
            </span>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight text-foreground mb-6">
              L'IA au service de{" "}
              <span className="text-accent">votre succès.</span>
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-lg mb-8">
              Accélérez votre croissance, automatisez vos processus et prenez des décisions plus intelligentes grâce à l'intelligence artificielle.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" asChild>
                <a href="#services">Nos Services</a>
              </Button>
              <Button variant="hero-outline" asChild>
                <a href="#contact">Contactez-Nous</a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-[var(--shadow-elevated)]">
              <img src={heroImg} alt="Intelligence artificielle et automatisation" className="w-full h-auto object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
