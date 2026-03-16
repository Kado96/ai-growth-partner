import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useState } from "react";

const videos = [
  { id: "dQw4w9WgXcQ", title: "Comment l'IA transforme le marketing" },
  { id: "dQw4w9WgXcQ", title: "Automatisation: Guide Complet" },
  { id: "dQw4w9WgXcQ", title: "Chatbot IA en action" },
  { id: "dQw4w9WgXcQ", title: "Scoring de leads avec l'IA" },
];

const VideoGallery = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section id="videos" className="bg-background">
      <div className="container-narrow section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="font-display font-semibold text-accent text-sm tracking-widest uppercase">Ressources</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mt-3">Nos Vidéos</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {videos.map((video, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl overflow-hidden shadow-[var(--shadow-card)] group cursor-pointer aspect-video"
              onClick={() => setActiveVideo(activeVideo === `${video.id}-${i}` ? null : `${video.id}-${i}`)}
            >
              {activeVideo === `${video.id}-${i}` ? (
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <>
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center group-hover:bg-foreground/50 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-lg">
                      <Play className="text-accent-foreground ml-1" size={28} />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent">
                    <p className="font-display font-semibold text-primary-foreground text-sm">{video.title}</p>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoGallery;
