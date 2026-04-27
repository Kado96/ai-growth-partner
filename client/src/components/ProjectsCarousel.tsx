import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, TrendingUp, Play } from "lucide-react";

const projects = [
  {
    title: "Assistant IA — Gestion des Réservations",
    client: "Chaîne de restaurants semi-gastronomiques",
    description: "Agent IA multicanal (WhatsApp + site web) pour réservations, commandes à emporter, FAQ.",
    impact: "+40% de réservations automatisées, -60% d'appels entrants",
    youtubeId: "dQw4w9WgXcQ", // Remplacez par vos IDs réels
  },
  {
    title: "Scoring de Leads IA",
    client: "Agence de génération de leads B2B",
    description: "Modèle IA de qualification automatique des prospects.",
    impact: "+70% de taux de conversion, meilleure priorisation",
    youtubeId: "dQw4w9WgXcQ",
  },
  {
    title: "Agent Conversationnel WhatsApp",
    client: "Sites web & e-commerce",
    description: "Agent conversationnel autonome pour gérer 80% des requêtes utilisateurs ou prospects.",
    impact: "Temps de réponse 3x plus rapide, -50% charge support",
    youtubeId: "dQw4w9WgXcQ",
  },
];

const ProjectsCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % projects.length);
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const prev = () => {
    setCurrent((c) => (c - 1 + projects.length) % projects.length);
    setIsPlaying(false);
    setProgress(0);
  };

  useEffect(() => {
    if (isPlaying) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          next();
          return 0;
        }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [next, isPlaying]);

  const project = projects[current];

  return (
    <section id="projects" className="bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_hsl(260_80%_62%_/_0.06),_transparent_60%)]" />
      <div className="container-narrow section-padding relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-display font-semibold text-accent text-xs tracking-widest uppercase mb-4">
            Démonstrations Pro
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-3">Nos Projets en Action</h2>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.5 }}
              className="grid lg:grid-cols-2 gap-8 items-center"
            >
              {/* Lecteur Vidéo Premium */}
              <div className="rounded-3xl overflow-hidden glow-border relative group aspect-video bg-slate-900 shadow-2xl">
                {isPlaying ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${project.youtubeId}?autoplay=1`}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <div className="relative w-full h-full cursor-pointer" onClick={() => setIsPlaying(true)}>
                    <img 
                      src={`https://img.youtube.com/vi/${project.youtubeId}/maxresdefault.jpg`} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-accent/90 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                        <Play className="text-white ml-1" size={32} fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  </div>
                )}
              </div>

              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cta/10 border border-cta/20 font-body text-xs text-cta font-medium mb-3">
                  {project.client}
                </span>
                <h3 className="font-display font-bold text-2xl text-white mt-2 mb-4">{project.title}</h3>
                <p className="font-body text-muted-foreground mb-6 leading-relaxed">{project.description}</p>
                <div className="inline-flex items-center gap-3 glass-card px-6 py-4 border-cta/20 bg-cta/5">
                  <TrendingUp className="text-cta" size={24} />
                  <div>
                    <p className="text-cta font-display font-black text-lg leading-none">{project.impact.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{project.impact.split(' ').slice(1).join(' ')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between mt-12">
            <div className="flex gap-3">
              <button onClick={prev} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-accent/30 transition-all text-white">
                <ChevronLeft size={20} />
              </button>
              <button onClick={next} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-accent/30 transition-all text-white">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="flex gap-2 items-center">
              {projects.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrent(i); setProgress(0); setIsPlaying(false); }}
                  className="relative w-16 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer"
                >
                  {i === current && (
                    <div className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
                  )}
                  {i < current && <div className="absolute inset-0 bg-accent/40 rounded-full" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsCarousel;
