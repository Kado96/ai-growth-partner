import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-ai.jpg";
import { Sparkles, ArrowRight } from "lucide-react";
import { useConfig } from "@/hooks/use-config";
import { useQuote } from "@/hooks/use-quote";
import { API_URL } from "@/lib/api";

const Hero = () => {
  const { config, loading } = useConfig();
  const { openQuote } = useQuote();

  if (loading || !config) return <div className="min-h-screen bg-slate-950" />;

  const { hero = { 
    badge: "Kora Agency", 
    title: "Propulsez votre croissance..", 
    description: "Solutions innovantes de marketing digital et automatisation IA au Burundi.", 
    stats: [] 
  }, branding } = config;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(260_80%_62%_/_0.15),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(180_70%_50%_/_0.1),_transparent_60%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container-narrow section-padding w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
            >
              <Sparkles className="text-accent" size={14} />
              <span className="font-display font-semibold text-accent text-xs tracking-widest uppercase">
                {hero.badge}
              </span>
            </motion.div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-7xl leading-tight text-foreground mb-6">
              {hero.title.split('.').map((part: string, i: number) => (
                <span key={i} className={i === 1 ? "gradient-text" : ""}>
                  {part}{i === 0 && part.length > 0 ? "" : ""} 
                </span>
              ))}
            </h1>
            <p className="font-body text-xl text-muted-foreground max-w-lg mb-8 leading-relaxed">
              {hero.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" asChild size="lg">
                <a href="#services" className="group">
                  Nos Tarifs
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button variant="hero-outline" onClick={openQuote} size="lg">
                Demander un Devis
              </Button>
            </div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex gap-12 mt-12 pt-8 border-t border-border/30"
            >
              {(hero.stats || []).map((stat: any) => (
                <div key={stat.label}>
                  <p className="font-display font-extrabold text-3xl gradient-text">{stat.value}</p>
                  <p className="font-body text-xs text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-3xl overflow-hidden glow-border shadow-2xl shadow-accent/20">
              <img 
                src={hero.imagePath && hero.imagePath !== '' ? (hero.imagePath.startsWith('http') ? hero.imagePath : `${API_URL}${hero.imagePath}`) : heroImg} 
                alt={hero.title} 
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
            </div>
            {/* Visual enhancements */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent/20 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-cta/15 rounded-full blur-3xl opacity-50" />
            
            {/* Floating Badge */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 -left-10 glass-card px-6 py-4 border-accent/30 shadow-xl"
            >
              <p className="font-display font-bold text-accent">Croissance +300%</p>
              <p className="text-[10px] text-slate-400">Optimisation IA</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
