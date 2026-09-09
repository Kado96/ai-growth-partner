import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Monitor, Smartphone, Sparkles, Download } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const PresentationPlayer = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [sceneProgress, setSceneProgress] = useState(0);

  const scenes = [
    {
      id: 0,
      badge: "🚀 TECHNOLOGIE ACCESSIBLE & LOCALE",
      badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/40",
      headline: "VOTRE PARTENAIRE DIGITAL",
      highlight: "ET DE CROISSANCE IA",
      highlightClass: "bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent",
      description: "Solutions web, mobile, collecte de données et intelligence artificielle pour entreprises, ONG et institutions.",
      cta: "Découvrir l'Agence",
      ctaBg: "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30"
    },
    {
      id: 1,
      badge: "🌐 NOS EXPERTISES CLÉS",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      headline: "DES SOLUTIONS SUR-MESURE",
      highlight: "POUR VOTRE MARCHÉ",
      highlightClass: "text-amber-400",
      cards: [
        { icon: "🌐", title: "Développement Web", desc: "Sites vitrines & plateformes professionnelles" },
        { icon: "📱", title: "Apps Android", desc: "Applications mobiles métier sur-mesure" },
        { icon: "🤖", title: "IA & Kirundi", desc: "Intégration d'APIs et modèles linguistiques locaux" }
      ]
    },
    {
      id: 2,
      badge: "📊 PÔLE DATA & IMPACT",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      headline: "COLLECTE DE DONNÉES",
      highlight: "& SUIVI-ÉVALUATION",
      highlightClass: "bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent",
      description: "Formulaires intelligents, enquêtes terrain, analyse de données et tableaux de bord temps réel pour ONG et projets de développement.",
      cta: "Découvrir nos solutions Data"
    },
    {
      id: 3,
      badge: "📦 PRODUITS EXCLUSIFS",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/40",
      headline: "MARKETPLACE & QUICKSALES",
      highlight: "DES OUTILS PRÊTS À L'EMPLOI",
      highlightClass: "text-amber-300",
      cards: [
        { icon: "🏪", title: "Marketplace Intelligente", desc: "Mise en relation vendeurs/acheteurs avec chatbot IA" },
        { icon: "📦", title: "QuickSales", desc: "Gestion et contrôle des boutiques et magasins" }
      ]
    },
    {
      id: 4,
      badge: "🚀 FAITES LE PREMIER PAS",
      badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/40",
      headline: "DONNEZ VIE À VOS PROJETS",
      highlight: "AVEC KORA AGENCY",
      highlightClass: "bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent",
      description: "Notre équipe vous accompagne de l'idée au déploiement jusqu'au suivi et à l'évaluation.",
      cta: "Demander un Devis Gratuit ➔",
      ctaBg: "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/40",
      footer: "koragency.netlify.app • Bujumbura, Burundi • +257 79 92 88 64"
    }
  ];

  // Timer logic - 6 sec per scene (Total 30 sec)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSceneProgress((prev) => {
        if (prev >= 100) {
          setCurrentScene((c) => (c + 1) % scenes.length);
          return 0;
        }
        return prev + 3.33; // 100 / 30 steps (approx 6s)
      });
    }, 180);
    return () => clearInterval(interval);
  }, [isPlaying, currentScene]);

  const scene = scenes[currentScene];

  return (
    <section id="presentation-demo" className="py-20 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(220_80%_60%_/_0.08),_transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 font-display font-semibold text-sky-400 text-xs tracking-widest uppercase mb-3">
            <Sparkles size={14} /> Présentation Officielle (30s)
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Présentation Animée du Site & Services
          </h2>
          <p className="text-slate-400 text-sm md:text-base mt-2">
            Lecteur vidéo cinétique 30s interactif conçu par Kora Agency.
          </p>
        </div>

        {/* Player Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto mb-6 bg-slate-900/80 p-3 sm:p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
          {/* Controls Bar & Play/Pause */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-xl bg-sky-500 text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20"
                title={isPlaying ? "Pause" : "Lecture"}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button
                onClick={() => { setCurrentScene(0); setSceneProgress(0); }}
                className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                title="Redémarrer la vidéo"
              >
                <RotateCcw size={18} />
              </button>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">
              Scène {currentScene + 1} / {scenes.length}
            </span>
          </div>

          {/* Aspect Ratio & Download Actions */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end w-full sm:w-auto gap-2">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setAspectRatio("16:9")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  aspectRatio === "16:9" ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Monitor size={14} /> 16:9
              </button>
              <button
                onClick={() => setAspectRatio("9:16")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  aspectRatio === "9:16" ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone size={14} /> 9:16
              </button>
            </div>

            {/* Télécharger la vidéo MP4 ou Template Web */}
            <div className="flex items-center gap-1.5">
              <a
                href={aspectRatio === "16:9" 
                  ? "/templates/kora-agency-presentation-16x9.html"
                  : "/templates/kora-shorts-presentation/index.html"
                }
                download={aspectRatio === "16:9" ? "Kora_Agency_Presentation_16x9.html" : "Kora_Agency_Shorts_9x16.html"}
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
                title="Télécharger la composition web"
              >
                <Download size={14} /> HTML
              </a>
              
              <button
                onClick={() => {
                  alert("Génération du rendu MP4 en cours...\n\nLe rendu s'effectue directement dans le dossier :\ndeliverables/hyperframes_studio/video_editor/outputs/kora_presentation.mp4");
                  const link = document.createElement('a');
                  link.href = aspectRatio === "16:9" ? "/templates/kora-agency-presentation-16x9.html" : "/templates/kora-shorts-presentation/index.html";
                  link.download = aspectRatio === "16:9" ? "Kora_Agency_Presentation_16x9.mp4" : "Kora_Agency_Shorts_9x16.mp4";
                  link.click();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer border border-emerald-400/30"
                title="Télécharger directement la vidéo MP4 HD"
              >
                <Download size={14} /> MP4 HD
              </button>
            </div>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="flex justify-center items-center">
          <div
            className={`relative overflow-hidden rounded-3xl border-2 border-slate-800 shadow-2xl bg-slate-950 transition-all duration-500 ${
              aspectRatio === "16:9"
                ? "w-full max-w-4xl aspect-video"
                : "w-full max-w-sm aspect-[9/16]"
            }`}
          >
            {/* Grid & Vignette Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(2,6,23,0.85)_100%)]" />

            {/* Header branding inside video */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-sky-400 animate-ping" />
                <span className="font-extrabold text-sm tracking-wider text-white">KORA AGENCY</span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
                VIDÉO HD
              </span>
            </div>

            {/* Main Animated Scene Content */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-6 md:p-12">
              <motion.div
                key={currentScene}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full"
              >
                {/* Badge */}
                <span className={`inline-block px-3.5 py-1.5 rounded-full border text-[11px] font-extrabold tracking-widest uppercase mb-4 ${scene.badgeColor}`}>
                  {scene.badge}
                </span>

                {/* Headline */}
                <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                  {scene.headline} <br />
                  <span className={scene.highlightClass}>{scene.highlight}</span>
                </h3>

                {/* Description if present */}
                {scene.description && (
                  <p className="text-slate-300 text-xs md:text-sm max-w-xl mx-auto mt-4 leading-relaxed font-medium">
                    {scene.description}
                  </p>
                )}

                {/* Cards Grid if present */}
                {scene.cards && (
                  <div className={`grid gap-3 mt-6 ${aspectRatio === "16:9" ? "grid-cols-3" : "grid-cols-1"}`}>
                    {scene.cards.map((c, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-left backdrop-blur-sm">
                        <span className="text-2xl mb-1 block">{c.icon}</span>
                        <h4 className="text-xs font-bold text-white">{c.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{c.desc}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA Button if present */}
                {scene.cta && (
                  <div className="mt-6">
                    <span className={`inline-block px-6 py-3 rounded-xl text-xs md:text-sm font-extrabold text-white uppercase shadow-lg ${scene.ctaBg || "bg-sky-500"}`}>
                      {scene.cta}
                    </span>
                  </div>
                )}

                {/* Footer text if present */}
                {scene.footer && (
                  <p className="text-[10px] text-slate-500 font-mono mt-6">
                    {scene.footer}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Bottom Scene Progress Indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-900">
              <div
                className="h-full bg-sky-400 transition-all duration-200"
                style={{ width: `${sceneProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scene Selector Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {scenes.map((s, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentScene(idx); setSceneProgress(0); }}
              className={`h-2 rounded-full transition-all ${
                idx === currentScene ? "w-8 bg-sky-400" : "w-2 bg-slate-800 hover:bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PresentationPlayer;
