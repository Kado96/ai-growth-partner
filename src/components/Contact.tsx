import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `mailto:koraagency05@gmail.com?subject=Contact de ${form.name}&body=${encodeURIComponent(form.message)}%0A%0ADe: ${form.name} (${form.email})`;
  };

  return (
    <section id="contact" className="bg-section-alt">
      <div className="container-narrow section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="font-display font-semibold text-accent text-sm tracking-widest uppercase">Parlons ensemble</span>
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
              <label className="font-body text-sm font-medium text-foreground block mb-2">Nom</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background font-body text-foreground focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-foreground block mb-2">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background font-body text-foreground focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-foreground block mb-2">Message</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background font-body text-foreground focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition resize-none"
                placeholder="Votre message..."
              />
            </div>
            <Button variant="cta" type="submit" className="w-full sm:w-auto">
              Envoyer le Message
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Mail className="text-accent" size={22} />
              </div>
              <div>
                <h4 className="font-display font-semibold text-foreground">Email</h4>
                <a href="mailto:koraagency05@gmail.com" className="font-body text-muted-foreground hover:text-accent transition-colors">koraagency05@gmail.com</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Phone className="text-accent" size={22} />
              </div>
              <div>
                <h4 className="font-display font-semibold text-foreground">Téléphone</h4>
                <a href="tel:+25769725535" className="font-body text-muted-foreground hover:text-accent transition-colors">+257 69 725 535</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <MapPin className="text-accent" size={22} />
              </div>
              <div>
                <h4 className="font-display font-semibold text-foreground">Adresse</h4>
                <p className="font-body text-muted-foreground">Bujumbura, Burundi</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
