import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfig } from "@/hooks/use-config";
import { submitQuote } from "@/lib/api";
import { toast } from "sonner";
import { 
  Check, ArrowRight, ArrowLeft, Send, Sparkles, 
  Palette, MessageSquare, Calendar, Hash, Smartphone, 
  MapPin, Home, Video, Rocket, Zap, Settings, FileText,
  CreditCard, Briefcase, ZapIcon
} from "lucide-react";

const IconMap: Record<string, any> = {
  Palette, MessageSquare, Calendar, Hash, Smartphone, 
  MapPin, Home, Video, Rocket, Zap, Settings, FileText,
  Briefcase, ZapIcon
};

interface QuoteWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuoteWizard = ({ isOpen, onClose }: QuoteWizardProps) => {
  const { config } = useConfig();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [contact, setContact] = useState({ name: "", email: "", whatsapp: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep(1);
        setSelectedService(null);
        setAnswers({});
        setContact({ name: "", email: "", whatsapp: "" });
        setIsSuccess(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
  };

  const handleContactChange = (field: string, value: string) => {
    setContact(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const quoteDetails = Object.entries(answers).map(([q, a]) => `• ${q} : ${a}`).join('\n');
      
      const quoteData = {
        service: selectedService.title,
        name: contact.name,
        whatsapp: contact.whatsapp,
        answers: answers,
        total: selectedService.price
      };

      // 1. Envoi par Email (Backend) - On attend pas la réponse pour l'expérience client
      submitQuote(quoteData).catch(e => console.error("Email failed but continuing to WA", e));

      // 2. Préparation du lien WhatsApp de redirection
      const waText = encodeURIComponent(
        `🚀 *NOUVEAU DEVIS KORA AGENCY*\n\n` +
        `👤 *Client :* ${contact.name}\n` +
        `💼 *Service :* ${selectedService.title}\n` +
        `💰 *Estimation :* ${selectedService.price.toLocaleString()} FBU\n\n` +
        `*DÉTAILS DU PROJET :*\n${quoteDetails}\n\n` +
        `✅ Merci de confirmer la réception de ma demande.`
      );
      
      // On redirige vers votre numéro pour que le client vous envoie les infos directement
      const waLink = `https://wa.me/25779928864?text=${waText}`;
      
      setIsSuccess(true);

      // 3. Redirection automatique après 1.5s (laisse le temps de voir l'animation de succès)
      setTimeout(() => {
        window.open(waLink, "_blank");
      }, 1500);

    } catch (err) {
      toast.error("Une erreur est survenue lors de la génération du devis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = config?.services?.items || [];
  const progress = (step / 3) * 100;

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.3 } }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Assistant Devis Kora Agency</DialogTitle>
          <DialogDescription>
            Configurez votre solution marketing personnalisée et obtenez une estimation immédiate.
          </DialogDescription>
        </DialogHeader>
        {/* Animated Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-white/5 z-50">
          <motion.div 
            className="h-full bg-gradient-to-r from-accent via-cta to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
          />
        </div>
        
        <div className="relative p-0 h-full flex flex-col sm:flex-row min-h-[550px]">
          {/* Sidebar - Visual Context */}
          <div className="hidden sm:flex w-1/3 bg-gradient-to-b from-slate-900 to-black p-8 flex-col justify-between border-r border-white/5">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-6">
                <Sparkles className="text-accent" size={24} />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2">Devis Instantané</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configurez votre solution marketing en quelques clics et obtenez une estimation immédiate.
              </p>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                    step >= s ? "bg-accent border-accent text-white" : "border-white/20 text-slate-500"
                  }`}>
                    {step > s ? <Check size={12} /> : s}
                  </div>
                  <span className={`text-[11px] font-medium transition-colors ${step >= s ? "text-white" : "text-slate-600"}`}>
                    {s === 1 ? "Service" : s === 2 ? "Détails" : "Contact"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-8 sm:p-10 flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="h-full flex flex-col items-center justify-center text-center py-10"
                >
                  <div className="relative mb-8">
                    <motion.div 
                      className="absolute inset-0 bg-accent/20 blur-3xl rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <div className="w-24 h-24 bg-accent rounded-3xl flex items-center justify-center shadow-lg shadow-accent/40 relative z-10">
                      <Send className="text-white" size={40} />
                    </div>
                  </div>
                  <h2 className="text-3xl font-display font-bold text-white mb-4">Parfait, {contact.name.split(' ')[0]} !</h2>
                  <p className="text-slate-400 mb-10 max-w-sm mx-auto leading-relaxed">
                    Votre demande de devis pour <span className="text-accent font-semibold">{selectedService?.title}</span> a été transmise à nos experts. 
                    Nous vous recontacterons sur WhatsApp très prochainement.
                  </p>
                  <Button variant="hero" onClick={onClose} className="w-full sm:w-auto px-12 group">
                    Retour à l'accueil <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key={`step-${step}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex-1 flex flex-col"
                >
                  {step === 1 && (
                    <>
                      <div className="mb-8">
                        <span className="text-accent font-bold text-[10px] uppercase tracking-[0.2em] mb-2 block">Source : Kora Cloud</span>
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">Quel service boostera votre croissance ?</h2>
                        <p className="text-slate-400 text-sm">Sélectionnez une catégorie pour personnaliser votre offre.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-2 custom-scrollbar max-h-[380px]">
                        {(services || []).map((s: any, idx: number) => {
                          const Icon = IconMap[s.icon] || Briefcase;
                          const sId = s.id || `quote-service-${idx}`;
                          return (
                            <button
                              key={sId}
                              onClick={() => handleServiceSelect(s)}
                              className="group relative flex flex-col items-start p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-accent/10 hover:border-accent/30 transition-all text-left overflow-hidden h-[120px]"
                            >
                              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Icon size={48} />
                              </div>
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                                <Icon className="text-slate-400 group-hover:text-accent transition-colors" size={16} />
                              </div>
                              <span className="font-display font-bold text-white text-sm group-hover:text-accent transition-colors line-clamp-1">{s.title}</span>
                              <span className="text-accent font-display font-black text-xs mt-auto">
                                {s.price.toLocaleString()} <span className="text-[10px] opacity-70">FBU</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {step === 2 && selectedService && (
                    <>
                      <div className="mb-8">
                        <div className="flex items-center gap-2 text-accent mb-2">
                          <ZapIcon size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{selectedService.title}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">Précisons vos besoins</h2>
                        <p className="text-slate-400 text-sm">Répondez à ces quelques questions pour un devis 100% adapté.</p>
                      </div>

                      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[350px]">
                        {selectedService.questions.map((q: string, i: number) => (
                          <div key={i} className="space-y-3">
                            <Label htmlFor={`q-${i}`} className="text-slate-300 font-medium text-sm">{q}</Label>
                            <Input 
                              id={`q-${i}`}
                              name={`question-${i}`}
                              className="h-12 bg-white/5 border-white/10 text-white focus:border-accent/50 focus:ring-accent/20 transition-all rounded-xl placeholder:text-slate-600" 
                              placeholder="Votre réponse précise..."
                              value={answers[q] || ""}
                              onChange={(e) => handleAnswerChange(q, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3 mt-10 pt-4 border-t border-white/5">
                        <Button variant="outline" className="flex-1 h-12 border-white/10 text-white rounded-xl hover:bg-white/5" onClick={() => setStep(1)}>
                           Retour
                        </Button>
                        <Button variant="hero" className="flex-1 h-12 rounded-xl group" onClick={() => setStep(3)} disabled={Object.keys(answers).length < selectedService.questions.length}>
                          Finaliser <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <div className="mb-8">
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">Où vous envoyer le devis ?</h2>
                        <p className="text-slate-400 text-sm">Dernière étape pour concrétiser votre projet.</p>
                      </div>

                      <div className="space-y-4 mb-8">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contact-name" className="text-slate-300 text-xs uppercase tracking-wider font-bold">Nom complet / Entreprise</Label>
                            <Input 
                              id="contact-name"
                              name="name"
                              autoComplete="name"
                              className="h-12 bg-white/5 border-white/10 text-white rounded-xl" 
                              placeholder="Kora Agency / Jean Dupont"
                              value={contact.name}
                              onChange={(e) => handleContactChange("name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contact-whatsapp" className="text-slate-300 text-xs uppercase tracking-wider font-bold">Numéro WhatsApp</Label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">+257</span>
                              <Input 
                                id="contact-whatsapp"
                                name="whatsapp"
                                autoComplete="tel"
                                className="h-12 bg-white/5 border-white/10 text-white pl-14 rounded-xl" 
                                placeholder="69 ...."
                                value={contact.whatsapp}
                                onChange={(e) => handleContactChange("whatsapp", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Order Summary "Receipt" */}
                        <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-[10px] uppercase font-bold text-slate-500">Service sélectionné</span>
                            <span className="text-[11px] font-bold text-accent">{selectedService?.title}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-bold text-slate-500">Total estimé</span>
                            <span className="text-xl font-black text-white">{selectedService?.price.toLocaleString()} FBU</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-auto">
                        <Button variant="outline" className="flex-1 h-12 border-white/10 text-white rounded-xl" onClick={() => setStep(2)}>
                           Retour
                        </Button>
                        <Button 
                          variant="cta" 
                          className="flex-[2] h-12 shadow-lg shadow-accent/20 rounded-xl font-display font-bold group relative overflow-hidden" 
                          onClick={handleSubmit}
                          disabled={!contact.name || !contact.whatsapp || isSubmitting}
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            {isSubmitting ? "Initialisation..." : "Générer mon Devis"}
                            {!isSubmitting && <Send size={18} className="ml-2 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />}
                          </span>
                          <motion.div 
                            className="absolute inset-0 bg-white/20"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "0%" }}
                            transition={{ duration: 0.3 }}
                          />
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteWizard;
