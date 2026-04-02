import { motion } from "framer-motion";
import { 
  Brain, Cog, Lightbulb, Palette, MessageSquare, 
  Calendar, Hash, Smartphone, MapPin, Home, 
  Video, Rocket, Zap, FileText, Check 
} from "lucide-react";
import { useConfig } from "@/hooks/use-config";
import { useQuote } from "@/hooks/use-quote";

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
          {services.items.map((service: any, i: number) => {
            const Icon = IconMap[service.icon] || Brain;
            const isPremium = service.price >= 1000000;
            
            return (
              <motion.div
                key={service.id || service.title}
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
                
                <div className="relative z-10 flex-grow">
                  {service.imagePath && service.imagePath !== '' ? (
                    <div className="w-full h-40 rounded-2xl overflow-hidden mb-6 group-hover:scale-105 transition-transform duration-300 shadow-lg">
                      <img 
                        src={service.imagePath.startsWith('http') ? service.imagePath : `http://localhost:5001${service.imagePath}`} 
                        alt={service.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ) : (
                    <div className={`w-14 h-14 rounded-2xl ${isPremium ? 'bg-accent/20' : 'bg-secondary'} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={isPremium ? "text-accent" : "text-slate-400"} size={28} />
                    </div>
                  )}
                  <h3 className="font-display font-bold text-xl text-foreground mb-3">{service.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">{service.description}</p>
                </div>

                <div className="relative z-10 mt-6 pt-6 border-t border-border/30">
                  <div className="flex items-end gap-1 mb-4">
                    <span className="font-display font-bold text-2xl text-foreground">
                      {service.price.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-xs text-muted-foreground mb-1 uppercase font-semibold">FBU</span>
                  </div>
                  <button 
                    onClick={() => openQuote(service.id)}
                    className={`w-full py-3 rounded-xl font-display font-bold text-sm transition-all ${isPremium ? 'bg-accent text-white hover:bg-accent/90' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}
                  >
                    Choisir ce service
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
