import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, FileText, Mail, Bot, Send, 
  Sparkles, MessageSquare, Briefcase, Zap, 
  Terminal, ShieldCheck, HeartPulse
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuote } from "@/hooks/use-quote";
import { submitChatSummary, chatWithAlexa, getMediaUrl } from "@/lib/api";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

const ChatBot = () => {
  const { openQuote } = useQuote();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ from: string; text: string }>>([
    { from: "alexa", text: "Bonjour ! Je suis Alexa, votre assistante IA stratégique. 🚀 Comment puis-je vous aider à automatiser votre succès aujourd'hui ?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Initial greeting
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue.trim();
    setMessages(prev => [...prev, { from: "user", text: userMsg }]);
    setInputValue("");
    setIsTyping(true);

    try {
      console.log(`[ALEXA] Envoi à ${import.meta.env.DEV ? 'Proxy' : 'Prod'} : "${userMsg}"...`);
      const data = await chatWithAlexa(userMsg);
      console.log("[ALEXA] Succès :", data.response);
      setMessages(prev => [...prev, { from: "alexa", text: data.response }]);
    } catch (err) {
      console.error("[ALEXA_ERROR] Échec de la connexion Kora-Brain :", err);
      setMessages(prev => [...prev, { 
        from: "alexa", 
        text: "Désolée, j'ai une petite perte de connexion. Veuillez rafraîchir la page (F5) ou réessayez dans un instant. Sinon, contactez mon responsable au +25779928864." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClose = async () => {
    // If we have more than the welcome message, send summary
    if (messages.length > 1) {
      try {
        await submitChatSummary({ transcript: messages });
        console.log("[CHAT] Résumé envoyé par email.");
      } catch (err) {
        console.error("Failed to send chat summary", err);
      }
    }
    setIsOpen(false);
  };

  const handleDevis = () => {
    setIsOpen(false);
    openQuote();
  };

  return (
    <>
      {/* Floating Entry Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-16 right-6 z-50 w-16 h-16 rounded-3xl bg-accent text-white flex items-center justify-center shadow-2xl shadow-accent/40 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <MessageSquare size={26} className="relative z-10" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Sidebar Bot */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full sm:w-[450px] bg-slate-950 h-full shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-white/5 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-accent/20 to-cta/10 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                      <Bot size={24} className="text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-slate-950" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white text-lg leading-tight">Alexa</h4>
                    <p className="text-[10px] text-accent font-black uppercase tracking-widest">IA Strategic Partner</p>
                  </div>
                </div>
                <button 
                  onClick={handleClose}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
              >
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.from === "alexa" ? "justify-start" : "justify-end"}`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                      msg.from === "alexa"
                        ? "bg-white/5 text-slate-200 rounded-bl-sm border border-white/5"
                        : "bg-accent text-white rounded-br-sm shadow-lg shadow-accent/10"
                    }`}>
                      <MessageContent content={msg.text} from={msg.from} />
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/5 rounded-3xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                       <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                       <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
                       <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "400ms" }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Quick Chips */}
              <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar">
                <button onClick={handleDevis} className="whitespace-nowrap px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-slate-300 hover:bg-accent hover:text-white transition-all flex items-center gap-2">
                  <FileText size={12} /> Devis Gratuit
                </button>
                <button onClick={() => window.open("https://wa.me/25779928864")} className="whitespace-nowrap px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-slate-300 hover:bg-white/10 transition-all flex items-center gap-2">
                  <Zap size={12} /> Appel Urgent
                </button>
              </div>

              {/* Input Footer */}
              <div className="p-6 mt-auto border-t border-white/5 bg-slate-900/30">
                <form onSubmit={handleSend} className="relative">
                  <Input 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Écrivez à Alexa ici..."
                    className="h-14 bg-white/5 border-white/10 rounded-2xl pr-14 text-white placeholder:text-slate-600 focus:border-accent/40 transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 active:scale-95"
                  >
                    <Send size={18} />
                  </button>
                </form>
                <div className="mt-4 flex items-center justify-center gap-6 opacity-40">
                  <Terminal size={12} />
                  <ShieldCheck size={12} />
                  <HeartPulse size={12} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const MessageContent = ({ content, from }: { content: string; from: string }) => {
  // Détection des images [IMAGE:path]
  const imageRegex = /\[IMAGE:(.*?)\]/g;
  const parts = content.split(imageRegex);
  const images = [...content.matchAll(imageRegex)].map(match => match[1]);

  if (from === "user") return <span>{content}</span>;

  return (
    <div className="space-y-4 prose prose-invert prose-sm max-w-none">
      <ReactMarkdown
        components={{
          a: ({ node, ...props }) => {
            const isInternal = props.href?.startsWith("/");
            if (isInternal) {
              return <Link to={props.href!} className="text-accent font-bold hover:underline" {...props} />;
            }
            return <a target="_blank" rel="noopener noreferrer" className="text-accent font-bold hover:underline" {...props} />;
          },
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>
        }}
      >
        {content.replace(imageRegex, "")}
      </ReactMarkdown>

      {images.map((path, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900 aspect-video"
        >
          <img 
            src={getMediaUrl(path)} 
            alt="Suggestion Alexa" 
            className="w-full h-full object-cover"
          />
        </motion.div>
      ))}
    </div>
  );
};

export default ChatBot;
