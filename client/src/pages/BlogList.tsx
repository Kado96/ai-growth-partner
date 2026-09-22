import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Tag, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const BlogList = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchBlogs = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || window.location.origin}/api/blogs`);
        setBlogs(data);
      } catch (err) {
        console.error("Erreur chargement des blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-foreground flex flex-col justify-between">
      <Header />

      <main className="pt-28 pb-20 container-narrow section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 font-display font-semibold text-accent text-xs tracking-widest uppercase mb-4">
            <BookOpen size={14} /> Kora Agency Insights
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white mt-3 leading-tight">
            Blog & Expertises Digitales
          </h1>
          <p className="font-body text-slate-400 mt-4 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Découvrez nos derniers articles, études de cas et guides sur l'Intelligence Artificielle, le développement mobile, la communication et la data au Burundi.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
            <p className="text-slate-400 font-bold">Aucun article publié pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => {
              const imageMatch = blog.content.match(/!\[.*\]\((.*?)\)/);
              const imageUrl = imageMatch ? imageMatch[1] : "/media/service-automation.png";
              const tagsArray = Array.isArray(blog.tags) ? blog.tags : (typeof blog.tags === 'string' ? blog.tags.split(',') : []);

              return (
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden flex flex-col hover:border-accent/40 transition-all duration-300 group hover:shadow-2xl hover:shadow-accent/10"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-900">
                    <img
                      src={imageUrl}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                      <span className="flex items-center gap-1 font-mono text-accent">
                        <Clock size={12} /> {blog.readingTime || 5} min
                      </span>
                      <span>•</span>
                      <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        {blog.author || 'Kora Agency'}
                      </span>
                    </div>

                    <h2 className="font-display font-bold text-xl text-white group-hover:text-accent transition-colors line-clamp-2 mb-3 leading-snug">
                      {blog.title}
                    </h2>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {tagsArray.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-400">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                      <Link
                        to={`/blog/${blog.slug || blog.serviceId}`}
                        className="inline-flex items-center gap-2 text-xs font-bold text-white group-hover:text-accent transition-colors uppercase tracking-wider"
                      >
                        Lire l'article <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogList;
