import { motion } from "framer-motion";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const videos = [
  { id: "dQw4w9WgXcQ", title: "Comment l'IA transforme le marketing" },
  { id: "dQw4w9WgXcQ", title: "Automatisation: Guide Complet" },
  { id: "dQw4w9WgXcQ", title: "Chatbot IA en action" },
  { id: "dQw4w9WgXcQ", title: "Scoring de leads avec l'IA" },
];

const VideoGallery = () => {
  const [current, setCurrent] = useState(0);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % videos.length);
    setActiveVideo(null);
    setProgress(0);
  }, []);

  const prev = () => {
    setCurrent((c) => (c - 1 + videos.length) % videos.length);
    setActiveVideo(null);
    setProgress(0);
  };

  // Auto-scroll every 5 seconds (pause when video is playing)
  useEffect(() => {
    if (activeVideo !== null) return;
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
  }, [next, activeVideo]);

  const video = videos[current];

  return (
    <section id="videos" className="bg-section-alt relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(260_80%_62%_/_0.06),_transparent_60%)]" />
      <div className="container-narrow section-padding relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-display font-semibold text-accent text-xs tracking-widest uppercase mb-4">
            Ressources
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mt-3">Nos Vidéos</h2>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main video display */}
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-2xl overflow-hidden glow-border aspect-video"
          >
            {activeVideo === current ? (
              <iframe
                src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div className="relative w-full h-full cursor-pointer group" onClick={() => setActiveVideo(current)}>
                <img
                  src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center group-hover:bg-background/40 transition-colors">
                  <div className="w-20 h-20 rounded-full bg-accent/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Play className="text-accent-foreground ml-1" size={32} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background/90 to-transparent">
                  <p className="font-display font-bold text-foreground text-lg">{video.title}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-2">
              <button onClick={prev} className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center hover:bg-secondary hover:border-accent/30 transition-all text-foreground">
                <ChevronLeft size={18} />
              </button>
              <button onClick={next} className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center hover:bg-secondary hover:border-accent/30 transition-all text-foreground">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2 items-center">
              {videos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrent(i); setProgress(0); setActiveVideo(null); }}
                  className="relative w-12 h-1.5 bg-border/50 rounded-full overflow-hidden cursor-pointer hover:bg-border transition-colors"
                >
                  {i === current && (
                    <div className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
                  )}
                  {i < current && <div className="absolute inset-0 bg-accent/60 rounded-full" />}
                </button>
              ))}
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {videos.map((v, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setProgress(0); setActiveVideo(null); }}
                className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all duration-300 ${
                  i === current ? "border-accent glow-border" : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <img
                  src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                  alt={v.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-background/30 flex items-center justify-center">
                  <Play className="text-foreground" size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoGallery;
