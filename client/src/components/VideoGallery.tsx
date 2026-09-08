import { motion } from "framer-motion";
import { Play, ChevronLeft, ChevronRight, Sparkles, Download } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface VideoItem {
  id: string;
  title: string;
  type: "hyperframe" | "youtube";
  aspectRatio: "16:9" | "9:16";
  url?: string;
  downloadUrl?: string;
}

const videos: VideoItem[] = [
  {
    id: "kora-leader-2min",
    title: "Kora Agency : Leader des Systèmes Marketing & IA au Burundi (2 min)",
    type: "hyperframe",
    aspectRatio: "16:9",
    url: "/templates/kora-leader-burundi-2min.html",
    downloadUrl: "/templates/kora-leader-burundi-2min.html"
  },
  {
    id: "kora-presentation-16x9",
    title: "Présentation Officielle Kora Agency (30s HD)",
    type: "hyperframe",
    aspectRatio: "16:9",
    url: "/templates/kora-agency-presentation-16x9.html",
    downloadUrl: "/templates/kora-agency-presentation-16x9.html"
  },
  {
    id: "kora-shorts-9x16",
    title: "Kora Agency Shorts & Reels Kinetic (30s Vertical)",
    type: "hyperframe",
    aspectRatio: "9:16",
    url: "/templates/kora-shorts-presentation/index.html",
    downloadUrl: "/templates/kora-shorts-presentation/index.html"
  }
];

const VideoGallery = () => {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % videos.length);
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const prev = () => {
    setCurrent((c) => (c - 1 + videos.length) % videos.length);
    setIsPlaying(false);
    setProgress(0);
  };

  // Auto-slide carrousel toutes les 8 secondes (si la vidéo n'est pas en lecture active)
  useEffect(() => {
    if (isPlaying) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          next();
          return 0;
        }
        return p + 1.25;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [next, isPlaying]);

  const video = videos[current];

  return (
    <section id="videos" className="bg-slate-950 py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(260_80%_62%_/_0.06),_transparent_60%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 font-display font-semibold text-accent text-xs tracking-widest uppercase mb-3">
            <Sparkles size={14} /> Carrousel Vidéos
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground">
            Galerie Vidéos & Démos Animées
          </h2>
          <p className="text-muted-foreground text-sm mt-2">
            Découvrez nos présentations interactives HyperFrames et vidéos promotionnelles.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Cadre vidéo Carrousel principal */}
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`relative rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-900 mx-auto ${
              video.aspectRatio === "9:16" ? "max-w-sm aspect-[9/16]" : "w-full aspect-video"
            }`}
          >
            {video.type === "hyperframe" ? (
              <iframe
                src={video.url}
                className="w-full h-full border-0"
                title={video.title}
              />
            ) : isPlaying ? (
              <iframe
                src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div className="relative w-full h-full cursor-pointer group" onClick={() => setIsPlaying(true)}>
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
              </div>
            )}

            {/* Titre & Badge en overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex justify-between items-end">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20 mb-2 inline-block">
                  {video.type === "hyperframe" ? "HyperFrame Interactive 30s" : "Vidéo YouTube"}
                </span>
                <h3 className="font-display font-extrabold text-white text-lg md:text-xl">
                  {video.title}
                </h3>
              </div>

              {video.downloadUrl && (
                <a
                  href={video.downloadUrl}
                  download
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30"
                  title="Télécharger la vidéo"
                >
                  <Download size={14} /> Télécharger
                </a>
              )}
            </div>
          </motion.div>

          {/* Navigation Carrousel */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-2">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center hover:bg-slate-800 hover:border-sky-500 transition-all text-white"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center hover:bg-slate-800 hover:border-sky-500 transition-all text-white"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Progress Dots */}
            <div className="flex gap-2 items-center">
              {videos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrent(i); setIsPlaying(false); setProgress(0); }}
                  className="relative w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  {i === current && (
                    <div className="absolute inset-y-0 left-0 bg-sky-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  )}
                  {i < current && <div className="absolute inset-0 bg-sky-500/50 rounded-full" />}
                </button>
              ))}
            </div>
          </div>

          {/* Vignettes miniatures du Carrousel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {videos.map((v, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setIsPlaying(false); setProgress(0); }}
                className={`relative rounded-xl overflow-hidden p-3 border-2 transition-all text-left bg-slate-900/60 backdrop-blur-sm ${
                  i === current ? "border-sky-500 shadow-lg shadow-sky-500/20" : "border-slate-800 opacity-60 hover:opacity-100"
                }`}
              >
                <span className="text-[9px] font-mono font-bold text-sky-400 uppercase block mb-1">
                  {v.aspectRatio} • {v.type}
                </span>
                <p className="text-xs font-bold text-white line-clamp-2">{v.title}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoGallery;
