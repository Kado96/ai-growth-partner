import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, FileText, Mail, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Array<{ from: string; text: string }>>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages([
          { from: "alexa", text: "Bonjour ! Je suis Alexa, votre assistante IA. 👋 Comment puis-je vous aider à automatiser votre succès aujourd'hui ?" },
        ]);
        setShowWelcome(true);
      }, 2000);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDevis = () => {
    window.open("mailto:koraagency05@gmail.com?subject=Demande de Devis - Kora Agency", "_blank");
  };

  const handleMail = () => {
    window.open("mailto:koraagency05@gmail.com?subject=Contact - Kora Agency", "_blank");
  };

  return (
    <>
      {/* Floating button with glow */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:scale-110 transition-transform"
        style={{ boxShadow: "0 0 30px hsl(260 80% 62% / 0.5)" }}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 glass-card overflow-hidden"
            style={{ boxShadow: "0 0 40px hsl(260 80% 62% / 0.15), 0 12px 40px hsl(0 0% 0% / 0.4)" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-accent to-cta p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-foreground/20 flex items-center justify-center">
                <Bot size={20} className="text-accent-foreground" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-sm text-accent-foreground">Alexa</h4>
                <p className="text-xs text-accent-foreground/80">Assistante IA — Kora Agency</p>
              </div>
            </div>

            {/* Messages */}
            <div className="p-4 max-h-64 overflow-y-auto space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "alexa" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-body ${
                    msg.from === "alexa"
                      ? "bg-secondary text-secondary-foreground rounded-bl-sm"
                      : "bg-accent text-accent-foreground rounded-br-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {showWelcome && (
              <div className="p-4 pt-0 space-y-2">
                <Button variant="cta" className="w-full text-sm" onClick={handleDevis}>
                  <FileText size={16} />
                  Demander un Devis
                </Button>
                <Button variant="hero-outline" className="w-full text-sm !px-4 !py-2 !h-auto" onClick={handleMail}>
                  <Mail size={16} />
                  Nous Écrire
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
