import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, FileText, Bot, Send, User, Loader2, MessageCircle, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuote } from "@/hooks/use-quote";
import { submitChatSummary, chatWithAlexa, getMediaUrl } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

const WELCOME_TEXT =
  "Bienvenue chez **Kora Agency**.\n\nJe suis **Alexa**, votre concierge digital. C'est un honneur de vous accueillir. Dites-moi simplement ce dont vous avez besoin, je m'occupe du reste avec attention et discrétion.";

const SUGGESTIONS = [
  "Présentez-moi vos services",
  "Je souhaite un site web",
  "Enquêtes & suivi-évaluation",
  "Demander un devis",
];

type ChatMessage = {
  id: number;
  from: "assistant" | "user";
  text: string;
  isLoading?: boolean;
  suggestions?: string[];
};

const ChatBot = () => {
  const { openQuote } = useQuote();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, from: "assistant", text: WELCOME_TEXT, suggestions: SUGGESTIONS },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Le chatbot reste fermé au démarrage jusqu'à ce que l'utilisateur clique dessus

  const sendMessage = useCallback(
    async (raw?: string) => {
      const userMsg = (raw ?? inputValue).trim();
      if (!userMsg || isTyping) return;

      setInputValue("");
      setIsTyping(true);

      const historyForApi = messages.map((m) => ({ from: m.from, text: m.text }));
      const userEntry: ChatMessage = { id: Date.now(), from: "user", text: userMsg };
      const loadingId = Date.now() + 1;
      const loadingEntry: ChatMessage = {
        id: loadingId,
        from: "assistant",
        text: "",
        isLoading: true,
      };

      setMessages((prev) => [...prev, userEntry, loadingEntry]);

      try {
        const data = await chatWithAlexa(userMsg, [
          ...historyForApi,
          { from: "user", text: userMsg },
        ]);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingId
              ? {
                  id: loadingId,
                  from: "assistant",
                  text: data.response,
                  suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
                }
              : m
          )
        );
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingId
              ? {
                  id: loadingId,
                  from: "assistant",
                  text: "Je vous prie de m'excuser : une brève interruption est survenue. Puis-je vous proposer de réessayer, ou de nous joindre directement sur WhatsApp au **+257 79 92 88 64** ?",
                }
              : m
          )
        );
      } finally {
        setIsTyping(false);
      }
    },
    [inputValue, isTyping, messages]
  );

  const handleClose = () => {
    setIsOpen(false);
    if (messages.length > 1) {
      submitChatSummary({
        transcript: messages
          .filter((m) => !m.isLoading)
          .map((m) => ({ from: m.from, text: m.text })),
      }).catch(() => {
        /* silencieux */
      });
    }
  };

  const handleDevis = () => {
    setIsOpen(false);
    openQuote();
  };

  return (
    <>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.08 }}
          onClick={() => setIsOpen(true)}
          aria-label="Ouvrir le concierge Kora Agency"
          className="fixed bottom-16 right-6 z-[9999] w-14 h-14 rounded-full bg-accent text-white shadow-xl shadow-accent/30 flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed bottom-16 right-6 z-[9999] w-[380px] max-w-[calc(100vw-1.5rem)] h-[580px] max-h-[calc(100vh-5rem)] bg-slate-950 rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
          >
            {/* Header style Kukasoko */}
            <div className="bg-gradient-to-r from-accent to-cta/90 text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight">Alexa · Concierge</p>
                  <p className="text-[11px] opacity-90 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block animate-pulse" />
                    À votre disposition · Kora Agency
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <MessageBubble msg={msg} />
                  {msg.from === "assistant" &&
                    !msg.isLoading &&
                    msg.suggestions &&
                    msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-9">
                        {msg.suggestions.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() =>
                              s.toLowerCase().includes("devis")
                                ? handleDevis()
                                : sendMessage(s)
                            }
                            className="text-[11px] px-2.5 py-1 rounded-full border border-accent/40 text-accent hover:bg-accent hover:text-white transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Actions rapides */}
            <div className="px-3 pb-1 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
              <button
                type="button"
                onClick={handleDevis}
                className="whitespace-nowrap px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-slate-300 hover:bg-accent hover:text-white transition-all flex items-center gap-1.5"
              >
                <FileText size={11} /> Devis
              </button>
              <button
                type="button"
                onClick={() => window.open("https://wa.me/25779928864", "_blank")}
                className="whitespace-nowrap px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-slate-300 hover:bg-white/10 transition-all flex items-center gap-1.5"
              >
                <Phone size={11} /> WhatsApp
              </button>
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-3 shrink-0 bg-slate-900/50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <label htmlFor="chatbot-input" className="sr-only">
                  Message pour Alexa
                </label>
                <input
                  id="chatbot-input"
                  name="chatbot-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Comment puis-je vous aider ?"
                  disabled={isTyping}
                  maxLength={500}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isTyping || !inputValue.trim()}
                  className="bg-accent hover:bg-accent/90 text-white shrink-0 rounded-xl h-10 w-10"
                  aria-label="Envoyer"
                >
                  {isTyping ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
              <p className="text-[10px] text-slate-500 text-center mt-1.5">
                Accueil personnalisé · Kora Agency
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const MessageBubble = ({ msg }: { msg: ChatMessage }) => {
  if (msg.from === "user") {
    return (
      <div className="flex gap-2 justify-end">
        <div className="max-w-[82%] rounded-2xl rounded-br-sm px-3 py-2 text-sm bg-accent text-white leading-relaxed">
          {msg.text}
        </div>
        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
          <User className="w-4 h-4 text-slate-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 justify-start">
      <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-1">
        {msg.isLoading ? (
          <Loader2 className="w-4 h-4 text-accent animate-spin" />
        ) : (
          <Bot className="w-4 h-4 text-accent" />
        )}
      </div>
      <div className="max-w-[92%] rounded-2xl rounded-bl-sm px-3 py-2 text-sm bg-white/5 text-slate-200 border border-white/5 whitespace-pre-line leading-relaxed">
        {msg.isLoading ? (
          <span className="text-slate-400 italic">Un instant, je m'en occupe…</span>
        ) : (
          <MessageContent content={msg.text} />
        )}
      </div>
    </div>
  );
};

const MessageContent = ({ content }: { content: string }) => {
  const imageRegex = /\[IMAGE:(.*?)\]/g;
  const images = [...content.matchAll(imageRegex)].map((match) => match[1]);

  return (
    <div className="space-y-3 prose prose-invert prose-sm max-w-none">
      <ReactMarkdown
        components={{
          a: ({ ...props }) => {
            const isInternal = props.href?.startsWith("/");
            if (isInternal) {
              return (
                <Link
                  to={props.href!}
                  className="text-accent font-semibold hover:underline"
                  {...props}
                />
              );
            }
            return (
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent font-semibold hover:underline"
                {...props}
              />
            );
          },
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        }}
      >
        {content.replace(imageRegex, "")}
      </ReactMarkdown>

      {images.map((path, idx) => (
        <div
          key={idx}
          className="rounded-xl overflow-hidden border border-white/10 bg-slate-900 aspect-video"
        >
          <img
            src={getMediaUrl(path)}
            alt="Illustration Kora Agency"
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export default ChatBot;
