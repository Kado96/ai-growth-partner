import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { 
  Calendar, Clock, User, ArrowLeft, 
  Share2, Tag, ChevronRight
} from "lucide-react";
import { useConfig } from "@/hooks/use-config";
import { useQuote } from "@/hooks/use-quote";
import { getMediaUrl } from "@/lib/api";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const BlogDetail = () => {
    const { serviceId } = useParams();
    const { config } = useConfig();
    const { openQuote } = useQuote();
    const [blog, setBlog] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const targetServiceId = blog?.serviceId || serviceId;
    const service = config?.services?.items.find((s: any) => s.id === targetServiceId);
    
    const otherServices = config?.services?.items.filter((s: any) => s.id !== targetServiceId) || [];
    const suggestedService = otherServices.length > 0 
        ? otherServices[(targetServiceId?.length || 0) % otherServices.length] 
        : service;

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = blog?.title || 'Kora Agency';

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    url: shareUrl
                });
            } catch (err) {
                console.log("Erreur partage:", err);
            }
        } else {
            console.log("Web Share API non supportée sur ce navigateur desktop.");
        }
    };

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/blogs/${serviceId}`);
                setBlog(response.data);
            } catch (err) {
                console.error("Erreur lors de la récupération du blog:", err);
            } finally {
                setLoading(false);
            }
        };

        if (serviceId) {
            fetchBlog();
        }
    }, [serviceId]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [serviceId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (!blog || !service) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <h1 className="text-3xl font-display font-bold text-white mb-4">Article introuvable</h1>
                <Link to="/">
                    <Button variant="hero">Retour à l'accueil</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-foreground">
            <Header />
            
            <div className="pt-24 pb-12">
                <div className="container-narrow">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Link to="/" className="inline-flex items-center gap-2 text-accent hover:underline mb-8">
                            <ArrowLeft size={16} /> Retour aux services
                        </Link>
                        
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider">
                                {service.category || "Service"}
                            </span>
                            <span className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Clock size={14} /> {blog.readingTime} min de lecture
                            </span>
                        </div>

                        <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-white mb-8 leading-tight">
                            {blog.title}
                        </h1>

                        <div className="flex items-center gap-4 text-muted-foreground border-b border-white/10 pb-12">
                            <div className="flex items-center gap-2">
                                <User size={16} />
                                <span>{blog.author || "Kora Agency"}</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-border" />
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
                        <div className="lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mb-12 rounded-3xl overflow-hidden shadow-2xl"
                            >
                                <img 
                                    src={getMediaUrl(service.imagePath)} 
                                    alt={blog.title} 
                                    className="w-full h-auto object-cover"
                                />
                            </motion.div>

                            <div className="prose prose-invert prose-lg max-w-none text-slate-300 font-body leading-relaxed">
                                <ReactMarkdown
                                    components={{
                                        h2: ({node, ...props}) => <h2 className="font-display font-bold text-3xl text-white mt-12 mb-6" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="font-display font-bold text-2xl text-white mt-8 mb-4" {...props} />,
                                        p: ({node, ...props}) => <p className="mb-6" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2" {...props} />,
                                        li: ({node, ...props}) => <li {...props} />,
                                        strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
                                        img: ({node, alt, src, ...props}) => {
                                            // Gestion des images spéciales avec alignement
                                            let finalSrc = src;
                                            // Style par défaut (centre)
                                            let alignClass = "block my-10 mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/5"; 
                                            let imgClass = "w-full h-auto object-cover hover:scale-105 transition-transform duration-700";

                                            if (src && alt?.startsWith('IMAGE')) {
                                                finalSrc = getMediaUrl(src);
                                                
                                                if (alt === 'IMAGE-LEFT') {
                                                    // Image alignée à gauche sur PC, en bloc sur mobile
                                                    alignClass = "block md:float-left w-full md:w-5/12 mx-auto md:ml-0 md:mr-8 mb-6 md:mt-2 rounded-2xl overflow-hidden shadow-xl border border-white/5 clear-both";
                                                } else if (alt === 'IMAGE-RIGHT') {
                                                    // Image alignée à droite sur PC, en bloc sur mobile
                                                    alignClass = "block md:float-right w-full md:w-5/12 mx-auto md:mr-0 md:ml-8 mb-6 md:mt-2 rounded-2xl overflow-hidden shadow-xl border border-white/5 clear-both";
                                                }
                                            }
                                            
                                            return (
                                                <span className={alignClass}>
                                                    <img 
                                                        src={finalSrc} 
                                                        alt="Illustration" 
                                                        className={imgClass}
                                                        {...props} 
                                                    />
                                                </span>
                                            );
                                        },
                                        blockquote: ({node, ...props}) => (
                                            <blockquote className="border-l-4 border-accent bg-accent/5 p-8 my-10 rounded-r-3xl italic text-xl text-white font-serif" {...props} />
                                        )
                                    }}
                                >
                                    {blog.content}
                                </ReactMarkdown>
                            </div>

                            <div className="mt-16 pt-12 border-t border-white/10">
                                <div className="p-8 rounded-3xl glass-card border-accent/20 bg-accent/5">
                                    <h3 className="font-display font-bold text-2xl text-white mb-4">Prêt à propulser votre croissance ?</h3>
                                    <p className="text-muted-foreground mb-6">Contactez-nous pour une stratégie sur mesure adaptée à vos besoins spécifiques.</p>
                                    <Button variant="hero" onClick={() => openQuote(serviceId)}>
                                        Demander un audit gratuit
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <aside className="space-y-12">
                            <div className="glass-card p-8 rounded-3xl border-white/5">
                                <h3 className="font-display font-bold text-white mb-6 flex items-center gap-2">
                                    <Share2 size={18} className="text-accent" /> Partager l'article
                                </h3>
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-3">
                                        {/* Facebook */}
                                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" 
                                           className="w-12 h-12 rounded-full flex items-center justify-center bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 transition-all group">
                                            <svg viewBox="0 0 24 24" fill="#1877F2" className="w-5 h-5 group-hover:scale-110 transition-transform"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                        </a>
                                        {/* X / Twitter */}
                                        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`} target="_blank" rel="noopener noreferrer" 
                                           className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 transition-all group tracking-widest text-white">
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                        </a>
                                        {/* LinkedIn */}
                                        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" 
                                           className="w-12 h-12 rounded-full flex items-center justify-center bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 transition-all group">
                                            <svg viewBox="0 0 24 24" fill="#0A66C2" className="w-5 h-5 group-hover:scale-110 transition-transform"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                        </a>
                                    </div>
                                    <button 
                                        onClick={handleNativeShare}
                                        className="mt-2 w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/30 text-emerald-400 font-bold py-3 px-4 rounded-xl transition-all hover:scale-[1.02]"
                                    >
                                        <Share2 size={18} />
                                        <span>Statuts / Réseaux Mobiles</span>
                                    </button>
                                </div>
                            </div>

                            <div className="glass-card p-8 rounded-3xl border-white/5">
                                <h3 className="font-display font-bold text-white mb-6 flex items-center gap-2">
                                    <Tag size={18} className="text-accent" /> Tags stratégiques
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {blog.tags?.map((tag: string) => (
                                        <span key={tag} className="px-3 py-1 rounded-lg bg-white/5 text-slate-400 text-xs hover:text-accent transition-colors">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-card p-8 rounded-3xl border-accent/10 bg-accent/5">
                                <h4 className="font-display font-bold text-white mb-4">Solution complémentaire</h4>
                                <div className="group block">
                                    <p className="text-accent font-semibold mb-2">{suggestedService?.title}</p>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{suggestedService?.description}</p>
                                    <Link to={`/blog/${suggestedService?.id}`} onClick={() => window.scrollTo(0, 0)} className="inline-flex items-center gap-2 text-white text-sm font-bold group-hover:gap-3 transition-all">
                                        En découvrir plus <ChevronRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default BlogDetail;
