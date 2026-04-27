import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Brain, Cog, Lightbulb, Palette, MessageSquare, 
  Calendar, Hash, Smartphone, MapPin, Home, 
  Video, Rocket, Zap, FileText, ChevronRight 
} from "lucide-react";
import { useConfig } from "@/hooks/use-config";
import { useQuote } from "@/hooks/use-quote";
import { API_URL } from "@/lib/api";

const IconMap: Record<string, any> = {
  Brain, Cog, Lightbulb, Palette, MessageSquare, 
  Calendar, Hash, Smartphone, MapPin, Home, 
  Video, Rocket, Zap, FileText
};

const Services = () => {
  const { config, loading } = useConfig();
  const { openQuote } = useQuote();

  if (loading || !config) return null;

  const { services = { 
    title: "Nos Services", 
    subtitle: "Kora Agency", 
    description: "Chargement des services...", 
    items: [] 
  } } = config;

  return (
    <section id="services" className="bg-section-alt relative overflow-hidden section-padding">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(260_80%_62%_/_0.05),_transparent_70%)]" />
      <div className="container-narrow relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-display font-semibold text-accent text-xs tracking-widest uppercase mb-4">
            {services.subtitle}
          </span>
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground mt-3">{services.title}</h2>
          <p className="font-body text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
            {services.description}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(services.items || []).map((service: any, i: number) => {
            const Icon = IconMap[service.icon] || Brain;
            const isPremium = service.price >= 1000000;
            const sId = service.id || `service-${i}`;
            
            return (
              <motion.div
                key={sId}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card p-8 transition-all duration-500 group relative overflow-hidden flex flex-col ${isPremium ? 'border-accent/40 ring-1 ring-accent/20' : 'hover:border-accent/30'}`}
              >
                {isPremium && (
                  <div className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-tighter">
                    Recommandé
                  </div>
                )}
                
                <Link to={`/blog/${sId}`} className="relative z-10 flex-grow block">
                  {service.imagePath && service.imagePath !== '' ? (
                    <div className="w-full h-40 rounded-2xl overflow-hidden mb-6 group-hover:scale-105 transition-transform duration-300 shadow-lg">
                      <img 
                        src={service.imagePath.startsWith('http') ? service.imagePath : `${API_URL}${service.imagePath}`} 
                        alt={service.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ) : (
                    <div className={`w-14 h-14 rounded-2xl ${isPremium ? 'bg-accent/20' : 'bg-secondary'} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={isPremium ? "text-accent" : "text-slate-400"} size={28} />
                    </div>
                  )}
                  <h3 className="font-display font-bold text-xl text-foreground mb-3 group-hover:text-accent transition-colors flex items-center gap-2">
                    {service.title}
                    <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">{service.description}</p>
                </Link>

                <div className="relative z-10 mt-auto pt-6 border-t border-white/5">
                  <button 
                    onClick={() => openQuote(sId)}
                    className={`w-full py-4 rounded-xl font-display font-bold text-sm transition-all ${isPremium ? 'bg-accent text-white hover:bg-accent/90 shadow-[0_10px_20px_-5px_rgba(0,255,255,0.3)]' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}
                  >
                    Demander l'expertise
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
