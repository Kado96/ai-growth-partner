import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import restaurantImg from "@/assets/project-restaurant.jpg";
import leadsImg from "@/assets/project-leads.jpg";
import chatbotImg from "@/assets/project-chatbot.jpg";

const projects = [
  {
    title: "Assistant IA — Gestion des Réservations",
    client: "Chaîne de restaurants semi-gastronomiques",
    description: "Agent IA multicanal (WhatsApp + site web) pour réservations, commandes à emporter, FAQ.",
    impact: "+40% de réservations automatisées, -60% d'appels entrants",
    image: restaurantImg,
  },
  {
    title: "Scoring de Leads IA",
    client: "Agence de génération de leads B2B",
    description: "Modèle IA de qualification automatique des prospects.",
    impact: "+70% de taux de conversion, meilleure priorisation",
    image: leadsImg,
  },
  {
    title: "Agent Conversationnel WhatsApp",
    client: "Sites web & e-commerce",
    description: "Agent conversationnel autonome pour gérer 80% des requêtes utilisateurs ou prospects.",
    impact: "Temps de réponse 3x plus rapide, -50% charge support",
    image: chatbotImg,
  },
];

const ProjectsCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % projects.length);
    setProgress(0);
  }, []);

  const prev = () => {
    setCurrent((c) => (c - 1 + projects.length) % projects.length);
    setProgress(0);
  };

  useEffect(() => {
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
  }, [next]);

  const project = projects[current];

  return (
    <section id="projects" className="bg-background">
      <div className="container-narrow section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="font-display font-semibold text-accent text-sm tracking-widest uppercase">Nos réalisations</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mt-3">Nos Projets</h2>
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
              <div className="rounded-2xl overflow-hidden shadow-[var(--shadow-elevated)]">
                <img src={project.image} alt={project.title} className="w-full h-64 sm:h-80 object-cover" />
              </div>
              <div>
                <span className="font-body text-sm text-accent font-medium">{project.client}</span>
                <h3 className="font-display font-bold text-2xl text-foreground mt-2 mb-4">{project.title}</h3>
                <p className="font-body text-muted-foreground mb-4">{project.description}</p>
                <div className="inline-block bg-cta/10 text-cta font-body font-semibold text-sm px-4 py-2 rounded-lg">
                  📈 {project.impact}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex gap-2">
              <button onClick={prev} className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors text-foreground">
                <ChevronLeft size={18} />
              </button>
              <button onClick={next} className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors text-foreground">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2 items-center">
              {projects.map((_, i) => (
                <div key={i} className="relative w-12 h-1 bg-border rounded-full overflow-hidden">
                  {i === current && (
                    <div className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
                  )}
                  {i < current && <div className="absolute inset-0 bg-accent rounded-full" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsCarousel;
