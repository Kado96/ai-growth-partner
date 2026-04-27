import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitContact } from "@/lib/api";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitContact(form);
      toast.success("Message envoyé avec succès !");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error("Erreur lors de l'envoi du message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-section-alt relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(260_80%_62%_/_0.06),_transparent_60%)]" />
      <div className="container-narrow section-padding relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-display font-semibold text-accent text-xs tracking-widest uppercase mb-4">
            Parlons ensemble
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mt-3">Contactez-Nous</h2>
          <p className="font-body text-muted-foreground mt-4 max-w-xl mx-auto">
            Nous sommes là pour répondre à toutes vos questions et vous accompagner dans vos besoins.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label htmlFor="form-name" className="font-body text-sm font-medium text-foreground block mb-2">Nom</label>
              <input
                id="form-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm font-body text-foreground focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition placeholder:text-muted-foreground/50"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label htmlFor="form-email" className="font-body text-sm font-medium text-foreground block mb-2">Email</label>
              <input
                id="form-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm font-body text-foreground focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition placeholder:text-muted-foreground/50"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label htmlFor="form-message" className="font-body text-sm font-medium text-foreground block mb-2">Message</label>
              <textarea
                id="form-message"
                name="message"
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm font-body text-foreground focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition resize-none placeholder:text-muted-foreground/50"
                placeholder="Votre message..."
              />
            </div>
            <Button variant="cta" type="submit" className="w-full sm:w-auto gap-2" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {isSubmitting ? "Envoi..." : "Envoyer le Message"}
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              { icon: Mail, title: "Email", content: "koraagency05@gmail.com", href: "mailto:koraagency05@gmail.com" },
              { icon: Phone, title: "Téléphone", content: "+257 69 725 535", href: "tel:+25769725535" },
              { icon: MapPin, title: "Adresse", content: "Bujumbura, Burundi", href: undefined },
            ].map((item) => (
              <div key={item.title} className="glass-card p-5 flex items-start gap-4 hover:border-accent/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <item.icon className="text-accent" size={22} />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground">{item.title}</h4>
                  {item.href ? (
                    <a href={item.href} className="font-body text-muted-foreground hover:text-accent transition-colors">{item.content}</a>
                  ) : (
                    <p className="font-body text-muted-foreground">{item.content}</p>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
