import React, { useState, useEffect } from 'react';
import { useConfig } from '@/hooks/use-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Settings, Layout, MessageSquare, Save, LogOut,
  Trash2, Plus, Globe, Sparkles, AlertCircle,
  ChevronRight, Layers, CreditCard, Image as ImageIcon, UploadCloud,
  Share2, Activity, Zap, Brain, BookOpen, Lightbulb, Rocket, Play, Inbox, Mail, Check, Reply
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { API_URL, loginAdmin, updateConfig, getMediaUrl } from '@/lib/api';

const ImagePickerButton = ({ onSelect, medias }: { onSelect: (path: string) => void, medias: any[] }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="link" size="sm" className="text-accent hover:text-accent/80 h-auto p-0 font-bold uppercase text-[9px] tracking-widest">
        <ImageIcon size={12} className="mr-1" /> Parcourir la bibliothèque
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-2xl bg-slate-950 border-white/10 text-white max-h-[80vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle>Choisir une Image</DialogTitle>
        <DialogDescription className="sr-only">
          Sélectionnez une image dans la médiathèque pour l'utiliser comme logo ou asset.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 overflow-y-auto custom-scrollbar">
        {!Array.isArray(medias) || medias.length === 0 ? (
          <p className="col-span-full text-center text-slate-500 py-10">Aucune image disponible dans la médiathèque.</p>
        ) : (
          medias.map(media => (
            <div
              key={media.id}
              onClick={() => {
                onSelect(media.path);
                toast.success("Image sélectionnée");
              }}
              className="relative group rounded-xl overflow-hidden border border-white/5 bg-white/5 aspect-square cursor-pointer hover:border-accent transition-all"
            >
              <img
                src={getMediaUrl(media.path)}
                alt={media.name}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-accent/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white text-[10px] font-black uppercase tracking-widest">
                Choisir
              </div>
            </div>
          ))
        )}
      </div>
    </DialogContent>
  </Dialog>
);

const Admin = () => {
  const { config, refresh } = useConfig();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [editedConfig, setEditedConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('branding');
  const [medias, setMedias] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [n8nUrl, setN8nUrl] = useState('');
  const [isTestingN8n, setIsTestingN8n] = useState(false);
  const [knowledgeItems, setKnowledgeItems] = useState<any[]>([]);
  const [newKnowledge, setNewKnowledge] = useState({ title: '', content: '' });
  const [isSavingKnowledge, setIsSavingKnowledge] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isSavingBlog, setIsSavingBlog] = useState(false);
  const [newBlog, setNewBlog] = useState({
    id: '',
    slug: '',
    serviceId: '',
    title: '',
    content: '',
    tags: '',
    readingTime: 5
  });

  const publishToN8n = async (blog: any) => {
    try {
      const webhookUrl = "https://n8n-o5yg.onrender.com/webhook-test/kora-article-publish";

      // Extraction de la première image du contenu Markdown ![alt](url)
      const imageMatch = blog.content.match(/!\[.*\]\((.*?)\)/);
      const extractedImage = imageMatch ? imageMatch[1] : (blog.imagePath || "");

      // Construction de l'URL absolue de l'image
      const imageUrl = extractedImage.startsWith('http')
        ? extractedImage
        : `${window.location.origin}${extractedImage}`;

      const platform = window.prompt("Sur quelle plateforme publier ? (instagram, linkedin, facebook, x, tiktok, threads)", "linkedin") || "linkedin";
      const account = window.prompt("Nom du profil (Account) défini dans n8n ?", "kora_agency") || "kora_agency";

      toast.info(`🚀 Propulsion de l'article vers ${platform}...`);

      await axios.post(webhookUrl, {
        Caption: `${blog.title}\n\nLisez l'article complet ici : ${window.location.origin}/blog/${blog.slug || blog.serviceId}`,
        Platform: platform.toLowerCase().trim(),
        Account: account.trim(),
        Upload: imageUrl,
        FacebookId: ""
      });

      toast.success(`Succès ! L'article "${blog.title}" a été envoyé à n8n.`);
    } catch (err) {
      console.error("[N8N_ERROR]", err);
      toast.error("Échec de la propulsion. Vérifiez que votre workflow n8n est actif.");
    }
  };

  const [contactMessages, setContactMessages] = useState<any[]>([]);

  const fetchContactMessages = async () => {
    try {
      const { data } = await axios.get('/api/contact-messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContactMessages(data);
    } catch (e) {
      console.error("Erreur chargement messages", e);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await axios.patch(`/api/contact-messages/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchContactMessages();
    } catch (e) { console.error(e); }
  };

  const handleDeleteContactMessage = async (id: string) => {
    try {
      await axios.delete(`/api/contact-messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Message supprimé.");
      fetchContactMessages();
    } catch (e) { toast.error("Échec de la suppression."); }
  };

  const fetchMedias = async () => {
    try {
      const { data } = await axios.get('/api/media');
      setMedias(data);
    } catch (e) {
      console.error("Erreur chargement médias", e);
    }
  };

  const [stats, setStats] = useState<{ totalVisits: number; uniqueVisitors: number; todayVisits: number; recentVisitors?: any[] } | null>(null);
  const [previewBlog, setPreviewBlog] = useState<any | null>(null);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(data);
    } catch (e) { console.error('Erreur chargement stats', e); }
  };

  const handleExportExcel = async () => {
    try {
      const response = await axios.get('/api/admin/visitors/export', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'statistiques_visiteurs_kora_agency.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Fichier Excel télécharge avec succès !");
    } catch (e) {
      toast.error("Erreur lors du téléchargement du fichier.");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchMedias();
      fetchN8nSettings();
      fetchKnowledge();
      fetchBlogs();
      fetchContactMessages();
      fetchStats();
    }
  }, [isLoggedIn]);

  const fetchKnowledge = async () => {
    try {
      const { data } = await axios.get('/api/knowledge', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKnowledgeItems(data);
    } catch (e) { console.error("Erreur knowledge", e); }
  };

  const handleAddKnowledge = async () => {
    if (!newKnowledge.title || !newKnowledge.content) return;
    setIsSavingKnowledge(true);
    try {
      await axios.post('/api/knowledge', newKnowledge, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Savoir ajouté au cerveau d'Alexa !");
      setNewKnowledge({ title: '', content: '' });
      fetchKnowledge();
    } catch (e) { toast.error("Échec de l'ajout."); }
    finally { setIsSavingKnowledge(false); }
  };

  const handleDeleteKnowledge = async (id: string) => {
    try {
      await axios.delete(`/api/knowledge/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Savoir supprimé.");
      fetchKnowledge();
    } catch (e) { toast.error("Échec de la suppression."); }
  };

  const fetchBlogs = async () => {
    try {
      const { data } = await axios.get('/api/blogs');
      setBlogs(data);
    } catch (e) { console.error("Erreur blogs", e); }
  };

  const handleSaveBlog = async () => {
    if ((!newBlog.serviceId && !newBlog.slug) || !newBlog.title || !newBlog.content) {
      toast.error("Veuillez remplir le titre, le contenu et l'URL personnalisée (slug) ou le service lié.");
      return;
    }
    setIsSavingBlog(true);
    try {
      const payload = {
        ...newBlog,
        id: newBlog.id || undefined,
        slug: newBlog.slug || newBlog.serviceId, // Fallback automatique
        tags: typeof newBlog.tags === 'string'
          ? newBlog.tags.split(',').map(t => t.trim()).filter(Boolean)
          : newBlog.tags
      };
      await axios.post('/api/blogs', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(newBlog.id ? "Article mis à jour avec succès !" : "Nouvel article publié avec succès !");
      setNewBlog({ id: '', slug: '', serviceId: '', title: '', content: '', tags: '', readingTime: 5 });
      fetchBlogs();
    } catch (e) { toast.error("Échec de la sauvegarde du blog."); }
    finally { setIsSavingBlog(false); }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet article de blog ?")) return;
    try {
      await axios.delete(`/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Blog supprimé.");
      fetchBlogs();
    } catch (e) { toast.error("Échec de la suppression."); }
  };

  const fetchN8nSettings = async () => {
    try {
      const { data } = await axios.get('/api/social/settings/n8n', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setN8nUrl(data.webhookUrl || '');
    } catch (e) {
      console.error("Erreur chargement n8n", e);
    }
  };

  useEffect(() => {
    if (config) {
      setEditedConfig(JSON.parse(JSON.stringify(config)));
    }
  }, [config]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginAdmin({ username, password });
      if (res.success) {
        setToken(res.token);
        setIsLoggedIn(true);
        toast.success('Connexion réussie');
      }
    } catch (err) {
      toast.error('Identifiants incorrects');
    }
  };

  const handleSave = async () => {
    try {
      await updateConfig(editedConfig, token);
      toast.success('Configuration mise à jour avec succès');
      refresh();
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      await axios.post('/api/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Média ajouté avec succès');
      fetchMedias();
    } catch (err) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      await axios.delete(`/api/media/${id}`);
      toast.success('Média supprimé');
      fetchMedias();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // --- CRUD Helpers ---
  const addProject = () => {
    const newProject = {
      id: `${Date.now()}`,
      title: "Nouveau Projet IA",
      client: "Nom du Client",
      description: "Description du projet et des technologies utilisées.",
      impact: "+50% d'efficacité",
      youtubeId: "dQw4w9WgXcQ",
      imagePath: ""
    };
    const currentProjects = editedConfig.projects?.items || [];
    setEditedConfig({
      ...editedConfig,
      projects: {
        ...(editedConfig.projects || { title: "Nos Projets en Action", subtitle: "Démonstrations Pro" }),
        items: [...currentProjects, newProject]
      }
    });
  };

  const removeProject = (index: number) => {
    const currentProjects = [...(editedConfig.projects?.items || [])];
    currentProjects.splice(index, 1);
    setEditedConfig({
      ...editedConfig,
      projects: {
        ...editedConfig.projects,
        items: currentProjects
      }
    });
  };

  const addService = () => {
    const newService = {
      id: `service_${Date.now()}`,
      title: "Nouveau Service",
      price: 0,
      description: "Description du service...",
      icon: "Briefcase",
      questions: ["Question 1 ?"]
    };
    setEditedConfig({
      ...editedConfig,
      services: {
        ...editedConfig.services,
        items: [...(editedConfig.services?.items || []), newService]
      }
    });
  };

  const removeService = (index: number) => {
    const newItems = [...editedConfig.services.items];
    newItems.splice(index, 1);
    setEditedConfig({ ...editedConfig, services: { ...editedConfig.services, items: newItems } });
  };

  const addQuestion = (serviceIdx: number) => {
    const newItems = [...editedConfig.services.items];
    newItems[serviceIdx].questions.push("Nouvelle question ?");
    setEditedConfig({ ...editedConfig, services: { ...editedConfig.services, items: newItems } });
  };

  const removeQuestion = (serviceIdx: number, qIdx: number) => {
    const newItems = [...editedConfig.services.items];
    newItems[serviceIdx].questions.splice(qIdx, 1);
    setEditedConfig({ ...editedConfig, services: { ...editedConfig.services, items: newItems } });
  };

  const addNews = () => {
    setEditedConfig({ ...editedConfig, news: [...(editedConfig.news || []), "Nouvelle notification..."] });
  };

  const removeNews = (index: number) => {
    const newNews = [...editedConfig.news];
    newNews.splice(index, 1);
    setEditedConfig({ ...editedConfig, news: newNews });
  };

  const addMethodology = () => {
    const newStep = { title: "Nouvelle Étape", description: "Description du processus..." };
    setEditedConfig({
      ...editedConfig,
      about: {
        ...editedConfig.about,
        methodology: [...(editedConfig.about?.methodology || []), newStep]
      }
    });
  };

  const removeMethodology = (index: number) => {
    const newM = [...editedConfig.about.methodology];
    newM.splice(index, 1);
    setEditedConfig({ ...editedConfig, about: { ...editedConfig.about, methodology: newM } });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-card p-8 border-slate-800">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center font-bold text-white shadow-lg shadow-accent/20">K</div>
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-6 text-center">Espace Manager Kora</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="text-[10px] uppercase font-bold text-slate-500 mb-1 block tracking-wider">Identifiant Administrateur</label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white h-12 rounded-xl"
                placeholder="Manager ID"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-[10px] uppercase font-bold text-slate-500 mb-1 block tracking-wider">Passcode</label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white h-12 rounded-xl"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 mt-6 h-12 rounded-xl font-bold shadow-lg shadow-accent/20">Accéder au Dashboard</Button>
          </form>
        </div>
      </div>
    );
  }

  if (!editedConfig) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Chargement de la configuration...</div>;

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200">
      {/* Top Header */}
      <header className="border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-accent to-cta flex items-center justify-center font-bold text-white text-base sm:text-lg flex-shrink-0">K</div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-white leading-tight text-sm sm:text-base truncate">Centre de Contrôle</h1>
              <p className="text-[9px] sm:text-[10px] text-accent font-bold uppercase tracking-widest hidden sm:block">Kora Agency v3.0</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} className="bg-white text-black hover:bg-slate-200 gap-1.5 h-8 sm:h-10 px-3 sm:px-6 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5 text-xs sm:text-sm">
              <Save size={14} /> <span className="hidden sm:inline">Publier les Changements</span><span className="sm:hidden">Publier</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsLoggedIn(false)} className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full w-8 h-8 sm:w-10 sm:h-10">
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-10">
        {/* Navigation: horizontal scroll on mobile, sidebar on desktop */}
        <div className="flex md:hidden overflow-x-auto gap-2 pb-3 mb-4 scrollbar-hide">
          {[
            { id: 'messages', label: 'Messages', icon: Inbox },
            { id: 'branding', label: 'Branding', icon: Globe },
            { id: 'hero', label: 'Accueil', icon: Layout },
            { id: 'projects', label: 'Projets', icon: Play },
            { id: 'services', label: 'Services', icon: Settings },
            { id: 'methodology', label: 'Méthodo', icon: Layers },
            { id: 'news', label: 'Ticker', icon: MessageSquare },
            { id: 'medias', label: 'Médias', icon: ImageIcon },
            { id: 'social', label: 'n8n', icon: Zap },
            { id: 'alexa-brain', label: 'Alexa', icon: Brain },
            { id: 'expertise', label: 'Blogs', icon: BookOpen },
            { id: 'stats', label: 'Stats', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all text-[10px] font-bold ${activeTab === tab.id
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'text-slate-400 bg-white/5'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-10">
        {/* Sidebar (desktop only) */}
        <aside className="w-72 flex-shrink-0 space-y-2 hidden md:block">
          {[
            { id: 'messages', label: 'Messages & Devis', icon: Inbox },
            { id: 'branding', label: 'Branding & Identité', icon: Globe },
            { id: 'hero', label: 'Section Accueil (Hero)', icon: Layout },
            { id: 'projects', label: 'Projets en Action', icon: Play },
            { id: 'services', label: 'Gestion des Services', icon: Settings },
            { id: 'methodology', label: 'Méthodologie Audit', icon: Layers },
            { id: 'news', label: 'Notifications Ticker', icon: MessageSquare },
            { id: 'medias', label: 'Médiathèque', icon: ImageIcon },
            { id: 'social', label: 'Automatisations n8n', icon: Zap },
            { id: 'alexa-brain', label: 'Cerveau Alexa', icon: Brain },
            { id: 'expertise', label: 'Expertise (Blogs)', icon: BookOpen },
            { id: 'stats', label: 'Statistiques Visiteurs', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all group ${activeTab === tab.id
                ? 'bg-accent/10 text-accent border border-accent/20 shadow-lg shadow-accent/5'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={18} />
                <span className="font-bold text-sm">{tab.label}</span>
              </div>
              <ChevronRight size={14} className={`transition-transform duration-300 ${activeTab === tab.id ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
            </button>
          ))}
        </aside>

        {/* Content Panel */}
        <main className="flex-grow p-1 rounded-3xl bg-gradient-to-br from-white/10 to-transparent min-w-0">
          <div className="bg-[#0b0f17] rounded-[22px] p-4 sm:p-8 min-h-[600px] border border-white/5">
            {activeTab === 'messages' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">Boîte de Réception (Messages & Devis)</h2>
                    <p className="text-slate-400 text-sm">Consultez les demandes des clients et répondez-leur directement par Gmail.</p>
                  </div>
                  <Button onClick={fetchContactMessages} variant="outline" size="sm" className="border-white/10 hover:bg-white/5 rounded-full text-xs">
                    Rafraîchir
                  </Button>
                </div>

                {!Array.isArray(contactMessages) || contactMessages.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
                    <Inbox size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400 font-bold">Aucun message reçu pour le moment.</p>
                    <p className="text-xs text-slate-500 mt-1">Les messages du formulaire de contact et les demandes de devis apparaîtront ici.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[650px] overflow-y-auto custom-scrollbar pr-2">
                    {contactMessages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`p-6 rounded-2xl border transition-all ${
                          msg.read 
                            ? 'bg-slate-900/40 border-white/5 opacity-80' 
                            : 'bg-accent/5 border-accent/30 shadow-lg shadow-accent/5'
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              msg.type === 'quote' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-accent/20 text-accent border border-accent/30'
                            }`}>
                              {msg.type === 'quote' ? `Devis : ${msg.service || 'Général'}` : 'Contact Web'}
                            </span>
                            {!msg.read && (
                              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" title="Non lu" />
                            )}
                            <span className="text-xs text-slate-500">
                              {new Date(msg.createdAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {msg.email && (
                              <a
                                href={`mailto:${msg.email}?subject=Re:%20Votre%20demande%20chez%20Kora%20Agency&body=Bonjour%20${encodeURIComponent(msg.name)},%0A%0AMerci%20pour%20votre%20message.%0A%0ACordialement,%0AL'équipe%20Kora%20Agency`}
                                onClick={() => handleMarkAsRead(msg.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent/80 text-white font-bold text-xs shadow-lg shadow-accent/20 transition-all"
                              >
                                <Reply size={14} /> Répondre par Gmail
                              </a>
                            )}
                            {msg.whatsapp && (
                              <a
                                href={`https://wa.me/${msg.whatsapp.replace(/\D/g, '')}?text=Bonjour%20${encodeURIComponent(msg.name)},%20je%20vous%20contacte%20suite%20à%20votre%20message%20sur%20Kora%20Agency.`}
                                onClick={() => handleMarkAsRead(msg.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-all"
                              >
                                WhatsApp
                              </a>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteContactMessage(msg.id)}
                              className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-baseline gap-2">
                            <h4 className="font-bold text-white text-base">{msg.name}</h4>
                            {msg.email && <span className="text-xs text-slate-400">({msg.email})</span>}
                            {msg.whatsapp && <span className="text-xs text-emerald-400 font-mono">WA: {msg.whatsapp}</span>}
                          </div>

                          {msg.message && (
                            <p className="text-sm text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-white/5 whitespace-pre-wrap leading-relaxed">
                              {msg.message}
                            </p>
                          )}

                          {msg.answers && typeof msg.answers === 'object' && (
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-1.5 mt-2">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Réponses au Devis :</p>
                              {Object.entries(msg.answers).map(([q, a]: any) => (
                                <div key={q} className="text-xs flex gap-2">
                                  <span className="text-slate-400 font-medium">{q} :</span>
                                  <span className="text-white font-semibold">{String(a)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white mb-2">Identité & Coordonnées</h2>
                  <p className="text-slate-400 text-sm">Configurez le nom, la description et les coordonnées de l'agence.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="brand-name" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Nom de l'Agence</label>
                    <Input
                      id="brand-name"
                      name="brand-name"
                      value={editedConfig.branding?.name || ''}
                      onChange={e => setEditedConfig({ ...editedConfig, branding: { ...editedConfig.branding, name: e.target.value } })}
                      className="bg-slate-900 border-white/10 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="brand-motto" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Slogan (Motto)</label>
                    <Input
                      id="brand-motto"
                      name="brand-motto"
                      value={editedConfig.branding?.motto || ''}
                      onChange={e => setEditedConfig({ ...editedConfig, branding: { ...editedConfig.branding, motto: e.target.value } })}
                      className="bg-slate-900 border-white/10 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="brand-email" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Adresse Email</label>
                    <Input
                      id="brand-email"
                      name="brand-email"
                      type="email"
                      value={editedConfig.branding?.email || ''}
                      onChange={e => setEditedConfig({ ...editedConfig, branding: { ...editedConfig.branding, email: e.target.value } })}
                      className="bg-slate-900 border-white/10 h-12"
                      placeholder="contact@kora-agency.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="brand-phone" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Numéro de Téléphone / WhatsApp</label>
                    <Input
                      id="brand-phone"
                      name="brand-phone"
                      value={editedConfig.branding?.phone || ''}
                      onChange={e => setEditedConfig({ ...editedConfig, branding: { ...editedConfig.branding, phone: e.target.value } })}
                      className="bg-slate-900 border-white/10 h-12"
                      placeholder="+257 79 92 88 64"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label htmlFor="brand-address" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Adresse Physique</label>
                    <Input
                      id="brand-address"
                      name="brand-address"
                      value={editedConfig.branding?.address || ''}
                      onChange={e => setEditedConfig({ ...editedConfig, branding: { ...editedConfig.branding, address: e.target.value } })}
                      className="bg-slate-900 border-white/10 h-12"
                      placeholder="Bujumbura, Burundi"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label htmlFor="brand-description" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Description de l'Agence</label>
                    <Textarea
                      id="brand-description"
                      name="brand-description"
                      rows={3}
                      value={editedConfig.branding?.description || ''}
                      onChange={e => setEditedConfig({ ...editedConfig, branding: { ...editedConfig.branding, description: e.target.value } })}
                      className="bg-slate-900 border-white/10"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="brand-logo" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Logo de l'Agence (Path)</label>
                      <ImagePickerButton
                        medias={medias}
                        onSelect={(path) => setEditedConfig({ ...editedConfig, branding: { ...editedConfig.branding, logoPath: path } })}
                      />
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1">
                        <Input
                          id="brand-logo"
                          name="brand-logo"
                          value={editedConfig.branding?.logoPath || ''}
                          onChange={e => setEditedConfig({ ...editedConfig, branding: { ...editedConfig.branding, logoPath: e.target.value } })}
                          className="bg-slate-900 border-white/10 h-12"
                          placeholder="Ex: /logo.PNG ou /media/mon-logo.png"
                        />
                      </div>
                      {editedConfig.branding?.logoPath && (
                        <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-2">
                          <img
                            src={editedConfig.branding.logoPath.startsWith('http') ? editedConfig.branding.logoPath : `${API_URL}${editedConfig.branding.logoPath}`}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hero' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white mb-2">Vitrine d'Accueil</h2>
                  <p className="text-slate-400 text-sm">Le premier message que vos clients verront en arrivant.</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="hero-badge" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Texte du Badge</label>
                    <Input
                      id="hero-badge"
                      name="hero-badge"
                      value={editedConfig.hero?.badge || ''}
                      onChange={e => setEditedConfig({ ...editedConfig, hero: { ...editedConfig.hero, badge: e.target.value } })}
                      className="bg-slate-900 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="hero-title" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Titre Accrocheur (H1)</label>
                    <Input
                      id="hero-title"
                      name="hero-title"
                      value={editedConfig.hero?.title || ''}
                      onChange={e => setEditedConfig({ ...editedConfig, hero: { ...editedConfig.hero, title: e.target.value } })}
                      className="bg-slate-900 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="hero-desc" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Paragraphe Descriptif</label>
                    <Textarea
                      id="hero-desc"
                      name="hero-desc"
                      rows={5}
                      value={editedConfig.hero?.description || ''}
                      onChange={e => setEditedConfig({ ...editedConfig, hero: { ...editedConfig.hero, description: e.target.value } })}
                      className="bg-slate-900 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="hero-img" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">URL de l'Image Principale (Médiathèque)</label>
                      <ImagePickerButton
                        medias={medias}
                        onSelect={(path) => setEditedConfig({ ...editedConfig, hero: { ...editedConfig.hero, imagePath: path } })}
                      />
                    </div>
                    <Input
                      id="hero-img"
                      name="hero-img"
                      value={editedConfig.hero?.imagePath || ''}
                      onChange={e => setEditedConfig({ ...editedConfig, hero: { ...editedConfig.hero, imagePath: e.target.value } })}
                      className="bg-slate-900 border-white/10"
                      placeholder="Ex: /media/xyz.jpg ou https://..."
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">Projets en Action</h2>
                    <p className="text-slate-400 text-sm">Gérez les démonstrations de projets de votre vitrine.</p>
                  </div>
                  <Button onClick={addProject} size="sm" className="bg-accent hover:bg-accent/80 gap-2 rounded-full">
                    <Plus size={16} /> Nouveau Projet
                  </Button>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
                  {(editedConfig.projects?.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-5 relative group">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProject(idx)}
                        className="absolute top-4 right-4 text-slate-600 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all rounded-full"
                      >
                        <Trash2 size={16} />
                      </Button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor={`project-title-${idx}`} className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Titre du Projet</label>
                          <Input
                            id={`project-title-${idx}`}
                            name={`project-title-${idx}`}
                            value={item.title || ''}
                            onChange={e => {
                              const newItems = [...(editedConfig.projects?.items || [])];
                              newItems[idx].title = e.target.value;
                              setEditedConfig({ ...editedConfig, projects: { ...editedConfig.projects, items: newItems } });
                            }}
                            className="bg-slate-900 border-white/5"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor={`project-client-${idx}`} className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Client / Secteur</label>
                          <Input
                            id={`project-client-${idx}`}
                            name={`project-client-${idx}`}
                            value={item.client || ''}
                            onChange={e => {
                              const newItems = [...(editedConfig.projects?.items || [])];
                              newItems[idx].client = e.target.value;
                              setEditedConfig({ ...editedConfig, projects: { ...editedConfig.projects, items: newItems } });
                            }}
                            className="bg-slate-900 border-white/5"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <label htmlFor={`project-desc-${idx}`} className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Description</label>
                          <Textarea
                            id={`project-desc-${idx}`}
                            name={`project-desc-${idx}`}
                            rows={2}
                            value={item.description || ''}
                            onChange={e => {
                              const newItems = [...(editedConfig.projects?.items || [])];
                              newItems[idx].description = e.target.value;
                              setEditedConfig({ ...editedConfig, projects: { ...editedConfig.projects, items: newItems } });
                            }}
                            className="bg-slate-900 border-white/5"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor={`project-impact-${idx}`} className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Résultats / Impact (ex: +70% conversion)</label>
                          <Input
                            id={`project-impact-${idx}`}
                            name={`project-impact-${idx}`}
                            value={item.impact || ''}
                            onChange={e => {
                              const newItems = [...(editedConfig.projects?.items || [])];
                              newItems[idx].impact = e.target.value;
                              setEditedConfig({ ...editedConfig, projects: { ...editedConfig.projects, items: newItems } });
                            }}
                            className="bg-slate-900 border-white/5"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor={`project-yt-${idx}`} className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">ID Vidéo YouTube (Optionnel)</label>
                          <Input
                            id={`project-yt-${idx}`}
                            name={`project-yt-${idx}`}
                            value={item.youtubeId || ''}
                            onChange={e => {
                              const newItems = [...(editedConfig.projects?.items || [])];
                              newItems[idx].youtubeId = e.target.value;
                              setEditedConfig({ ...editedConfig, projects: { ...editedConfig.projects, items: newItems } });
                            }}
                            className="bg-slate-900 border-white/5"
                            placeholder="ex: dQw4w9WgXcQ"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label htmlFor={`project-img-${idx}`} className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Image / Capture (Alternative à YouTube)</label>
                            <ImagePickerButton
                              medias={medias}
                              onSelect={(path) => {
                                const newItems = [...(editedConfig.projects?.items || [])];
                                newItems[idx].imagePath = path;
                                setEditedConfig({ ...editedConfig, projects: { ...editedConfig.projects, items: newItems } });
                              }}
                            />
                          </div>
                          <Input
                            id={`project-img-${idx}`}
                            name={`project-img-${idx}`}
                            value={item.imagePath || ''}
                            onChange={e => {
                              const newItems = [...(editedConfig.projects?.items || [])];
                              newItems[idx].imagePath = e.target.value;
                              setEditedConfig({ ...editedConfig, projects: { ...editedConfig.projects, items: newItems } });
                            }}
                            className="bg-slate-900 border-white/5"
                            placeholder="ex: /media/mon-projet.png"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">Catalogue de Services</h2>
                    <p className="text-slate-400 text-sm">Gérez les offres et les tarifs en FBU.</p>
                  </div>
                  <Button onClick={addService} size="sm" className="bg-accent hover:bg-accent/80 gap-2 rounded-full">
                    <Plus size={16} /> Nouveau Service
                  </Button>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
                  {(editedConfig.services?.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-5 relative group">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeService(idx)}
                        className="absolute top-4 right-4 text-slate-600 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all rounded-full"
                      >
                        <Trash2 size={16} />
                      </Button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor={`service-title-${idx}`} className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Titre du Service</label>
                          <Input
                            id={`service-title-${idx}`}
                            name={`service-title-${idx}`}
                            value={item.title || ''}
                            onChange={e => {
                              const newItems = [...editedConfig.services.items];
                              newItems[idx].title = e.target.value;
                              setEditedConfig({ ...editedConfig, services: { ...editedConfig.services, items: newItems } });
                            }}
                            className="bg-slate-900 border-white/5"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor={`service-price-${idx}`} className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Prix (FBU)</label>
                          <Input
                            id={`service-price-${idx}`}
                            name={`service-price-${idx}`}
                            type="number"
                            value={item.price || 0}
                            onChange={e => {
                              const newItems = [...editedConfig.services.items];
                              newItems[idx].price = parseInt(e.target.value);
                              setEditedConfig({ ...editedConfig, services: { ...editedConfig.services, items: newItems } });
                            }}
                            className="bg-slate-900 border-white/5"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1 mt-2">
                          <div className="flex justify-between items-center">
                            <label htmlFor={`service-img-${idx}`} className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Lien de l'Image (Optionnel - Écrase l'Icône SVG)</label>
                            <ImagePickerButton
                              medias={medias}
                              onSelect={(path) => {
                                const newItems = [...editedConfig.services.items];
                                newItems[idx].imagePath = path;
                                setEditedConfig({ ...editedConfig, services: { ...editedConfig.services, items: newItems } });
                              }}
                            />
                          </div>
                          <Input
                            id={`service-img-${idx}`}
                            name={`service-img-${idx}`}
                            value={item.imagePath || ''}
                            placeholder="Ex: /media/mon-image.jpg"
                            onChange={e => {
                              const newItems = [...editedConfig.services.items];
                              newItems[idx].imagePath = e.target.value;
                              setEditedConfig({ ...editedConfig, services: { ...editedConfig.services, items: newItems } });
                            }}
                            className="bg-slate-900 border-white/5"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Questions du Devis</p>
                          <div className="space-y-2 mt-2">
                            {(item.questions || []).map((q: string, qIdx: number) => (
                              <div key={qIdx} className="space-y-1">
                                <label htmlFor={`service-${idx}-q-${qIdx}`} className="sr-only">Question {qIdx + 1}</label>
                                <div className="flex gap-2">
                                  <Input
                                    id={`service-${idx}-q-${qIdx}`}
                                    name={`service-${idx}-q-${qIdx}`}
                                    aria-label={`Question ${qIdx + 1} for ${item.title}`}
                                    value={q}
                                    onChange={e => {
                                      const newItems = [...editedConfig.services.items];
                                      newItems[idx].questions[qIdx] = e.target.value;
                                      setEditedConfig({ ...editedConfig, services: { ...editedConfig.services, items: newItems } });
                                    }}
                                    className="bg-black/20 border-white/5 h-10 text-xs"
                                  />
                                  <Button variant="ghost" size="icon" onClick={() => removeQuestion(idx, qIdx)} className="text-slate-600 hover:text-red-500">
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => addQuestion(idx)} className="w-full border-dashed border-white/10 hover:border-accent text-[10px] font-bold text-slate-500 hover:text-accent mt-2 h-8 rounded-lg">
                              + Ajouter une question
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'expertise' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/5">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                      Éditeur d'Expertise ✍️
                      {newBlog.id && (
                        <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-sans font-bold">
                          Mode Édition Article
                        </span>
                      )}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Créez, modifiez, prévisualisez et publiez vos articles avec visuels.</p>
                  </div>
                  {newBlog.id && (
                    <Button
                      onClick={() => setNewBlog({ id: '', slug: '', serviceId: '', title: '', content: '', tags: '', readingTime: 5 })}
                      variant="outline"
                      className="border-white/10 hover:bg-white/10 text-white rounded-full text-xs font-bold gap-2"
                    >
                      <Plus size={14} /> Créer un nouvel article
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Editor Column */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white/5 p-6 sm:p-8 rounded-[32px] border border-white/5 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="blog-service" className="text-[10px] uppercase font-black text-accent tracking-[0.2em]">Service Lié (Optionnel)</label>
                          <select
                            id="blog-service"
                            name="blog-service"
                            value={newBlog.serviceId}
                            onChange={(e) => setNewBlog({ ...newBlog, serviceId: e.target.value, slug: newBlog.slug || e.target.value })}
                            className="w-full bg-slate-900 border-white/10 h-14 rounded-2xl px-4 text-white focus:border-accent ring-0 outline-none"
                          >
                            <option value="">Aucun service spécifique...</option>
                            {editedConfig.services?.items?.map((s: any) => (
                              <option key={s.id} value={s.id}>{s.title} ({s.id})</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="blog-slug" className="text-[10px] uppercase font-black text-accent tracking-[0.2em]">URL personnalisée (slug)</label>
                          <Input
                            id="blog-slug"
                            name="blog-slug"
                            value={newBlog.slug}
                            onChange={(e) => setNewBlog({ ...newBlog, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                            className="bg-slate-900 border-white/10 h-14 rounded-2xl"
                            placeholder="ex: conseils-strategiques"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="blog-title" className="text-[10px] uppercase font-black text-accent tracking-[0.2em]">Titre de l'Article Premium</label>
                          <Input
                            id="blog-title"
                            name="blog-title"
                            value={newBlog.title}
                            onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                            className="bg-slate-900 border-white/10 h-14 rounded-2xl"
                            placeholder="Ex: Stratégies de croissance..."
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center mb-1">
                          <label htmlFor="blog-content" className="text-[10px] uppercase font-black text-accent tracking-[0.2em]">Contenu Riche (Markdown)</label>
                          <div className="flex gap-2">
                            <span
                              onClick={() => setNewBlog({ ...newBlog, content: newBlog.content + "\n## Nouveau Titre\n" })}
                              className="text-[10px] bg-white/5 px-2.5 py-1 rounded-md cursor-pointer hover:bg-accent/20 transition-colors font-bold text-slate-300"
                            >
                              + Titre (H2)
                            </span>
                            <span
                              onClick={() => setNewBlog({ ...newBlog, content: newBlog.content + "\n### Sous-titre\n" })}
                              className="text-[10px] bg-white/5 px-2.5 py-1 rounded-md cursor-pointer hover:bg-accent/20 transition-colors font-bold text-slate-300"
                            >
                              + Sous-titre (H3)
                            </span>
                            <span
                              onClick={() => setNewBlog({ ...newBlog, content: newBlog.content + " **texte en gras** " })}
                              className="text-[10px] bg-white/5 px-2.5 py-1 rounded-md cursor-pointer hover:bg-accent/20 transition-colors font-bold text-slate-300"
                            >
                              B
                            </span>
                          </div>
                        </div>
                        <Textarea
                          id="blog-content"
                          name="blog-content"
                          rows={15}
                          value={newBlog.content}
                          onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                          className="bg-slate-900 border-white/10 font-mono text-sm rounded-[2rem] p-6 focus:ring-accent/20 min-h-[400px]"
                          placeholder="# Introduction...\n\nÉcrivez ici le texte de votre article. Utilisez la médiathèque à droite pour poser des visuels..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="blog-tags" className="text-[10px] uppercase font-black text-accent tracking-[0.2em]">Tags (Séparés par virgules)</label>
                          <Input
                            id="blog-tags"
                            name="blog-tags"
                            value={newBlog.tags}
                            onChange={(e) => setNewBlog({ ...newBlog, tags: e.target.value })}
                            className="bg-slate-900 border-white/10 h-12 rounded-xl"
                            placeholder="Fintech, Mobile Money, Lumicash"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="blog-time" className="text-[10px] uppercase font-black text-accent tracking-[0.2em]">Temps de lecture (min)</label>
                          <Input
                            id="blog-time"
                            name="blog-time"
                            type="number"
                            value={newBlog.readingTime}
                            onChange={(e) => setNewBlog({ ...newBlog, readingTime: parseInt(e.target.value) || 5 })}
                            className="bg-slate-900 border-white/10 h-12 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-4">
                        <Button
                          onClick={handleSaveBlog}
                          className="flex-1 bg-gradient-to-r from-accent to-purple-600 hover:from-accent/90 hover:to-purple-700 h-14 rounded-2xl font-black uppercase tracking-[0.1em] shadow-xl shadow-accent/20 text-white"
                          disabled={isSavingBlog}
                        >
                          {isSavingBlog ? "Enregistrement..." : (newBlog.id ? "Mettre à jour l'Article" : "Publier l'Article d'Expertise")}
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="border-white/10 hover:bg-white/10 h-14 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider text-slate-300">
                              👁️ Aperçu Direct
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-4xl bg-slate-950 border-white/10 text-white max-h-[85vh] overflow-y-auto custom-scrollbar p-8">
                            <DialogHeader>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-[10px] font-black uppercase tracking-widest border border-accent/30">
                                  {newBlog.serviceId ? `Service: ${newBlog.serviceId}` : 'Article d\'Expertise'}
                                </span>
                                <span className="text-xs text-slate-400 font-bold">⏱️ {newBlog.readingTime || 5} min de lecture</span>
                              </div>
                              <DialogTitle className="text-3xl font-display font-extrabold text-white mb-2 leading-tight">{newBlog.title || "Titre de l'article"}</DialogTitle>
                              <DialogDescription className="text-xs text-accent font-bold uppercase tracking-widest">
                                Aperçu direct (Slug: {newBlog.slug || newBlog.serviceId || 'non-defini'})
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-6 border-t border-white/10 pt-6">
                              <div className="prose prose-invert prose-lg max-w-none text-slate-300 font-sans leading-relaxed">
                                <ReactMarkdown
                                  components={{
                                    h2: ({ node, ...props }) => <h2 className="font-display font-bold text-2xl text-white mt-8 mb-4 border-b border-white/5 pb-2" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="font-display font-bold text-xl text-white mt-6 mb-3" {...props} />,
                                    p: ({ node, children, ...props }) => {
                                      return <p className="mb-4 text-slate-300 leading-relaxed" {...props}>{children}</p>;
                                    },
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-300" {...props} />,
                                    li: ({ node, ...props }) => <li {...props} />,
                                    strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
                                    img: ({ node, alt, src, ...props }) => {
                                      let rawSrc = src || '';
                                      let rawAlt = alt || '';

                                      // Si le src contient la forme ![IMAGE-RIGHT:/path]
                                      if (rawAlt.startsWith('IMAGE') || rawSrc.includes('/')) {
                                        const cleanSrc = rawSrc.startsWith('http') ? rawSrc : getMediaUrl(rawSrc);
                                        let alignClass = "block my-8 mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10";

                                        if (rawAlt === 'IMAGE-LEFT' || rawSrc.includes('IMAGE-LEFT')) {
                                          alignClass = "block md:float-left w-full md:w-5/12 mx-auto md:ml-0 md:mr-6 mb-6 md:mt-2 rounded-2xl overflow-hidden shadow-xl border border-white/10 clear-both";
                                        } else if (rawAlt === 'IMAGE-RIGHT' || rawSrc.includes('IMAGE-RIGHT')) {
                                          alignClass = "block md:float-right w-full md:w-5/12 mx-auto md:mr-0 md:ml-6 mb-6 md:mt-2 rounded-2xl overflow-hidden shadow-xl border border-white/10 clear-both";
                                        }

                                        return (
                                          <span className={alignClass}>
                                            <img src={cleanSrc} alt="Illustration Article" className="w-full h-auto object-cover max-h-[450px]" />
                                          </span>
                                        );
                                      }

                                      return <img src={getMediaUrl(rawSrc)} alt={rawAlt} className="w-full h-auto rounded-2xl my-4" />;
                                    },
                                    blockquote: ({ node, ...props }) => (
                                      <blockquote className="border-l-4 border-accent bg-accent/5 p-6 my-6 rounded-r-2xl italic text-lg text-white font-serif" {...props} />
                                    )
                                  }}
                                >
                                  {newBlog.content 
                                    ? newBlog.content.replace(/!\[(IMAGE-[A-Z]+):(.*?)\]/g, '![$1]($2)')
                                    : "*Aucun contenu saisi pour le moment.*"
                                  }
                                </ReactMarkdown>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const plainText = newBlog.content.replace(/#+ /g, '').replace(/!\[.*\]\(.*\)/g, '').replace(/\*\*.*\*\*/g, '').replace(/\[.*\]\(.*\)/g, '');
                            navigator.clipboard.writeText(`${newBlog.title}\n\n${plainText}`);
                            toast.success("Contenu copié pour Facebook/WhatsApp (Texte pur)");
                          }}
                          className="border-white/10 hover:bg-white/5 h-14 px-6 rounded-2xl text-slate-400 hover:text-white"
                          title="Copier pour Réseaux Sociaux"
                        >
                          <Share2 size={20} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Media Picker Column */}
                  <div className="lg:col-span-4 flex flex-col gap-6 max-h-[800px]">
                    <div className="sidebar-box flex flex-col flex-grow min-h-0 bg-white/5 p-6 rounded-[32px] border border-white/5">
                      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="text-accent" size={18} />
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Ma Médiathèque</h3>
                        </div>
                        <div>
                          <input
                            type="file"
                            id="sidebar-media-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleUpload}
                          />
                          <label htmlFor="sidebar-media-upload" className="inline-flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-wider bg-accent hover:bg-accent/80 text-white gap-1 px-3 py-1.5 cursor-pointer shadow-md transition-all">
                            <UploadCloud size={12} /> {isUploading ? '...' : '+ Photo'}
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pb-4 overflow-y-auto custom-scrollbar pr-1 max-h-[500px]">
                        {!Array.isArray(medias) || medias.length === 0 ? (
                          <p className="text-slate-500 text-xs text-center w-full py-10">Aucune image disponible.</p>
                        ) : (
                          medias.map(media => (
                            <div
                              key={media.id}
                              className="relative group w-[calc(50%-6px)] h-36 rounded-2xl overflow-hidden border border-white/10 cursor-pointer hover:border-accent transition-all flex-shrink-0 bg-slate-900"
                            >
                              <img src={getMediaUrl(media.path)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt={media.name} />
                              <div className="absolute inset-0 bg-slate-950/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 p-2 transition-all backdrop-blur-xs">
                                <span className="text-[9px] font-black text-white uppercase tracking-widest text-center leading-tight">Aligner l'Image</span>
                                <div className="flex flex-col gap-1 w-full">
                                  <button onClick={() => { setNewBlog({ ...newBlog, content: newBlog.content + `\n\n![IMAGE-LEFT:${media.path}]\n\n` }); toast.info("Image alignée à Gauche"); }} className="bg-white/10 hover:bg-accent font-bold text-[9px] text-white py-1 rounded-md w-full transition-colors">← Gauche</button>
                                  <button onClick={() => { setNewBlog({ ...newBlog, content: newBlog.content + `\n\n![IMAGE-CENTER:${media.path}]\n\n` }); toast.info("Image au Centre"); }} className="bg-white/10 hover:bg-accent font-bold text-[9px] text-white py-1 rounded-md w-full transition-colors">↔ Centre</button>
                                  <button onClick={() => { setNewBlog({ ...newBlog, content: newBlog.content + `\n\n![IMAGE-RIGHT:${media.path}]\n\n` }); toast.info("Image alignée à Droite"); }} className="bg-white/10 hover:bg-accent font-bold text-[9px] text-white py-1 rounded-md w-full transition-colors">→ Droite</button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <p className="mt-3 text-[9px] text-slate-500 uppercase font-black text-center tracking-widest flex-shrink-0">Survoler pour insérer dans l'article</p>
                    </div>

                    <div className="bg-accent/10 border border-accent/20 rounded-[2rem] p-6 space-y-2 flex-shrink-0">
                      <div className="flex items-center gap-2 text-accent">
                        <Lightbulb size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Conseil d'Édition</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Chaque image insérée avec <code>![IMAGE-LEFT:...]</code> s'enroulera harmonieusement avec votre texte, exactement comme sur les grands médias professionnels.
                      </p>
                    </div>
                  </div>
                </div>

                {/* List of existing blogs */}
                <div className="mt-12 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-display font-bold text-white flex items-center gap-3">
                      <BookOpen className="text-accent" size={22} />
                      Tous les Articles de Blog Publiés ({blogs.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.isArray(blogs) && blogs.map((blog) => (
                      <div key={blog.id} className="p-6 rounded-[2rem] border border-white/10 bg-slate-900/60 relative group hover:border-accent/40 transition-all flex flex-col justify-between shadow-lg">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest border border-accent/20">
                              {blog.serviceId ? `Service: ${blog.serviceId}` : 'Article Général'}
                            </span>
                            <div className="flex gap-1.5">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setNewBlog({
                                    id: blog.id,
                                    slug: blog.slug || blog.serviceId,
                                    serviceId: blog.serviceId || '',
                                    title: blog.title,
                                    content: blog.content,
                                    tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
                                    readingTime: blog.readingTime
                                  });
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                  toast.info(`Article "${blog.title}" chargé dans l'éditeur !`);
                                }}
                                className="bg-accent text-white hover:bg-accent/80 h-9 px-3 rounded-xl font-bold text-xs gap-1.5 shadow-md shadow-accent/20"
                              >
                                ✏️ Éditer
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteBlog(blog.id)}
                                className="text-red-400 hover:bg-red-500/20 hover:text-red-300 h-9 w-9 rounded-xl"
                                title="Supprimer l'article"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                          <h4 className="font-display font-bold text-lg text-white mb-2 line-clamp-2">{blog.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                            {blog.content.replace(/#+ /g, '').replace(/!\[.*\]\(.*\)/g, '').substring(0, 150)}...
                          </p>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                          <div className="flex flex-wrap gap-1.5">
                            {blog.tags && Array.isArray(blog.tags) && blog.tags.map((tag: string) => (
                              <span key={tag} className="text-[9px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">#{tag}</span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                            <span>⏱️ {blog.readingTime || 5} min read</span>
                            <a
                              href={`/blog/${blog.slug || blog.serviceId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:underline font-bold"
                            >
                              Voir sur le site ↗
                            </a>
                          </div>
                          <div className="pt-2 flex gap-2 w-full opacity-60 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => publishToN8n(blog)}
                              className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Zap size={12} /> Auto-Partage Social (n8n)
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'news' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">Bandeau de Notifications</h2>
                    <p className="text-slate-400 text-sm">Gérez les messages défilants (News Ticker).</p>
                  </div>
                  <Button onClick={addNews} size="sm" className="bg-accent hover:bg-accent/80 gap-2 rounded-full">
                    <Plus size={16} /> Ajouter une News
                  </Button>
                </div>

                <div className="space-y-3">
                  {(editedConfig.news || []).map((msg: string, idx: number) => (
                    <div key={idx} className="flex gap-3 group animate-in slide-in-from-left-4 duration-300">
                      <div className="flex-grow">
                        <Input
                          id={`news-${idx}`}
                          name={`news-${idx}`}
                          aria-label={`Message défilant ${idx + 1}`}
                          value={msg}
                          onChange={e => {
                            const newNews = [...editedConfig.news];
                            newNews[idx] = e.target.value;
                            setEditedConfig({ ...editedConfig, news: newNews });
                          }}
                          className="bg-slate-900 border-white/10 h-12"
                        />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeNews(idx)} className="text-slate-600 hover:text-red-500 hover:bg-red-500/10 h-12 w-12 rounded-xl">
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'methodology' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">Méthodologie & Approche</h2>
                    <p className="text-slate-400 text-sm">Les étapes de votre processus de travail.</p>
                  </div>
                  <Button onClick={addMethodology} size="sm" className="bg-accent hover:bg-accent/80 gap-2 rounded-full">
                    <Plus size={16} /> Ajouter une Étape
                  </Button>
                </div>
                <div className="space-y-6">
                  {(editedConfig.about?.methodology || []).map((m: any, idx: number) => (
                    <div key={idx} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4 relative group">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMethodology(idx)}
                        className="absolute top-4 right-4 text-slate-600 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all rounded-full"
                      >
                        <Trash2 size={16} />
                      </Button>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center font-bold text-accent text-xs">{idx + 1}</div>
                        <label htmlFor={`meth-title-${idx}`} className="sr-only">Titre de l'étape {idx + 1}</label>
                        <Input
                          id={`meth-title-${idx}`}
                          name={`meth-title-${idx}`}
                          value={m.title || ''}
                          onChange={e => {
                            const newM = [...editedConfig.about.methodology];
                            newM[idx].title = e.target.value;
                            setEditedConfig({ ...editedConfig, about: { ...editedConfig.about, methodology: newM } });
                          }}
                          className="bg-slate-900 border-white/10 h-10 font-bold"
                        />
                      </div>
                      <Textarea
                        id={`meth-desc-${idx}`}
                        name={`meth-desc-${idx}`}
                        aria-label={`Description de l'étape ${idx + 1}`}
                        value={m.description || ''}
                        onChange={e => {
                          const newM = [...editedConfig.about.methodology];
                          newM[idx].description = e.target.value;
                          setEditedConfig({ ...editedConfig, about: { ...editedConfig.about, methodology: newM } });
                        }}
                        className="bg-slate-900 border-white/10 text-xs"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'medias' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">Médiathèque</h2>
                    <p className="text-slate-400 text-sm">Gerez les images de votre site (Stokees sur SQLite local ou Supabase Prod).</p>
                  </div>
                  <div>
                    <input
                      type="file"
                      id="media-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleUpload}
                    />
                    <label htmlFor="media-upload" className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-accent hover:bg-accent/80 text-primary-foreground gap-2 h-9 px-4 cursor-pointer">
                      <UploadCloud size={16} /> {isUploading ? 'Upload...' : 'Uploader une image'}
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {!Array.isArray(medias) || medias.length === 0 ? (
                    <div className="col-span-full border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-slate-500">
                      <ImageIcon size={48} className="mb-4 opacity-50" />
                      <p>Aucun média disponible.</p>
                    </div>
                  ) : (
                    medias.map(media => (
                      <div key={media.id} className="relative group rounded-xl overflow-hidden border border-white/10 bg-slate-900 aspect-square">
                        <img
                          src={getMediaUrl(media.path)}
                          alt={media.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2 p-4">
                          <p className="text-xs text-white text-center truncate w-full">{media.name}</p>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteMedia(media.id)}
                            className="bg-red-500/80 hover:bg-red-500 rounded-full h-8"
                          >
                            <Trash2 size={14} className="mr-1" /> Supprimer
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(media.path);
                              toast.success('Lien copié');
                            }}
                            className="rounded-full h-8 w-full"
                          >
                            Copier le lien
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white leading-tight">Pont n8n (Social Media)</h2>
                    <p className="text-slate-400 text-sm">Diffusez vos expertises automatiquement sur vos réseaux sociaux.</p>
                  </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Share2 size={120} />
                  </div>

                  <div className="relative z-10 space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label htmlFor="n8n-webhook" className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">URL du Webhook n8n</label>
                        <span className="px-2 py-0.5 rounded bg-cta/10 text-cta text-[10px] font-bold uppercase tracking-widest">Opérationnel</span>
                      </div>
                      <div className="flex gap-4">
                        <Input
                          id="n8n-webhook"
                          name="n8n-webhook"
                          value={n8nUrl}
                          onChange={e => setN8nUrl(e.target.value)}
                          placeholder="https://n8n.votredomaine.com/webhook/..."
                          className="bg-slate-900 border-white/10 h-14 rounded-2xl flex-grow font-mono text-xs"
                        />
                        <Button
                          onClick={async () => {
                            try {
                              await axios.post('/api/social/settings/n8n', { webhookUrl: n8nUrl }, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              toast.success("Webhook n8n sauvegardé !");
                            } catch (e) {
                              toast.error("Échec de la sauvegarde.");
                            }
                          }}
                          className="h-14 px-8 rounded-2xl bg-accent hover:bg-accent/80 font-bold"
                        >
                          Sauvegarder
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                      <div className="space-y-4">
                        <h4 className="font-display font-bold text-white flex items-center gap-2">
                          <Activity size={16} className="text-cta" /> Statut de Connexion
                        </h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          Vérifiez si Kora Agency arrive à joindre votre instance n8n. Un payload de test sera envoyé.
                        </p>
                        <Button
                          variant="outline"
                          disabled={isTestingN8n || !n8nUrl}
                          onClick={async () => {
                            setIsTestingN8n(true);
                            try {
                              const { data } = await axios.post('/api/social/test-n8n', {}, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              if (data.success) toast.success("Test n8n réussi ! Votre workflow a été déclenché.");
                              else toast.error("n8n a répondu mais avec une erreur.");
                            } catch (e) {
                              toast.error("Connexion impossible à n8n. Vérifiez l'URL.");
                            } finally {
                              setIsTestingN8n(false);
                            }
                          }}
                          className="w-full border-white/10 h-12 rounded-xl hover:bg-white/5 font-bold"
                        >
                          {isTestingN8n ? "Test en cours..." : "Lancer un Test de Ping"}
                        </Button>
                      </div>

                      <div className="bg-cta/5 border border-cta/20 rounded-3xl p-6 space-y-4">
                        <h4 className="font-display font-bold text-cta flex items-center gap-2 text-sm">
                          <AlertCircle size={14} /> Comment ça marche ?
                        </h4>
                        <ul className="space-y-3">
                          {[
                            "Créez un noeud 'Webhook' (POST) dans n8n.",
                            "Copiez l'URL de test ou de production.",
                            "Collez l'URL ci-dessus et sauvegardez.",
                            "Chaque blog créé sera envoyé à n8n."
                          ].map((step, i) => (
                            <li key={i} className="flex gap-3 text-[11px] text-slate-400">
                              <span className="text-cta font-black">•</span> {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'alexa-brain' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                    <Brain size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white leading-tight">Centre d'apprentissage Alexa</h2>
                    <p className="text-slate-400 text-sm">Enrichissez Alexa avec vos informations, brochures et FAQ.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 space-y-6 h-fit">
                    <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                      <Lightbulb size={20} className="text-cta" /> Nouveau Savoir
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="brain-title" className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Sujet (Titre)</label>
                        <Input
                          id="brain-title"
                          name="brain-title"
                          value={newKnowledge.title}
                          onChange={(e) => setNewKnowledge({ ...newKnowledge, title: e.target.value })}
                          placeholder="Ex: Notre méthode de recrutement..."
                          className="bg-slate-900 border-white/10 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="brain-content" className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Contenu (Savoir)</label>
                        <textarea
                          id="brain-content"
                          name="brain-content"
                          value={newKnowledge.content}
                          onChange={(e) => setNewKnowledge({ ...newKnowledge, content: e.target.value })}
                          placeholder="Collez ici le texte que vous voulez qu'Alexa apprenne..."
                          className="w-full h-48 bg-slate-900 border border-white/10 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>
                      <Button
                        onClick={handleAddKnowledge}
                        disabled={isSavingKnowledge || !newKnowledge.title || !newKnowledge.content}
                        className="w-full h-12 rounded-xl bg-accent hover:bg-accent/80 font-bold"
                      >
                        {isSavingKnowledge ? "Enrichissement..." : "Ajouter au Cerveau"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                      <BookOpen size={20} className="text-accent" /> Fragments de Savoir
                    </h3>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {!Array.isArray(knowledgeItems) || knowledgeItems.length === 0 ? (
                        <div className="border border-dashed border-white/5 rounded-3xl p-10 text-center text-slate-500">
                          Alexa n'a pas encore de savoir spécifique. Ajoutez-en un !
                        </div>
                      ) : (
                        knowledgeItems.map(item => (
                          <div key={item.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-white/10 transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-accent text-sm">{item.title}</h4>
                              <button
                                onClick={() => handleDeleteKnowledge(item.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-500 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                              {item.content}
                            </p>
                            <div className="mt-3 text-[9px] text-slate-600 uppercase tracking-widest font-bold">
                              Appris le {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                      <Activity size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-white leading-tight">Statistiques de Fréquentation</h2>
                      <p className="text-slate-400 text-sm">Consultez les visites horodatées et téléchargez le registre complet sous Excel.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={handleExportExcel} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs h-10 px-4 gap-2 shadow-lg shadow-emerald-600/20">
                      <UploadCloud size={16} /> Télécharger en Excel (.csv)
                    </Button>
                    <Button onClick={fetchStats} variant="outline" size="sm" className="border-white/10 hover:bg-white/5 rounded-xl text-xs h-10">
                      <Activity size={14} className="mr-2 text-accent" /> Rafraîchir
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-8 rounded-[2rem] bg-gradient-to-br from-accent/10 to-purple-500/5 border border-accent/20 space-y-2">
                    <p className="text-[10px] uppercase font-black text-accent tracking-[0.2em]">Total Visites Enregistrées</p>
                    <p className="text-4xl font-extrabold text-white">{stats ? stats.totalVisits : "..."}</p>
                    <p className="text-xs text-slate-400 mt-2">Visites enregistrées depuis la création</p>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 space-y-2">
                    <p className="text-[10px] uppercase font-black text-emerald-400 tracking-[0.2em]">Visiteurs Uniques (IP)</p>
                    <p className="text-4xl font-extrabold text-white">{stats ? stats.uniqueVisitors : "..."}</p>
                    <p className="text-xs text-slate-400 mt-2">Utilisateurs distincts ayant visité le site</p>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 space-y-2">
                    <p className="text-[10px] uppercase font-black text-blue-400 tracking-[0.2em]">Visites Aujourd'hui</p>
                    <p className="text-4xl font-extrabold text-white">{stats ? stats.todayVisits : "..."}</p>
                    <p className="text-xs text-slate-400 mt-2">Nombre de consultations effectuées ce jour</p>
                  </div>
                </div>

                {/* Tableau Horodaté des Dernières Visites */}
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                      <Activity size={18} className="text-accent" /> Historique Horodaté des Dernières Visites
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">Dernières consultations</span>
                  </div>

                  {!stats?.recentVisitors || stats.recentVisitors.length === 0 ? (
                    <div className="border border-dashed border-white/10 rounded-2xl p-8 text-center text-slate-500 text-sm">
                      Aucune donnée de visite récente enregistrée.
                    </div>
                  ) : (
                    <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-900/50 backdrop-blur-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="p-4">Date & Heure</th>
                              <th className="p-4">Adresse IP</th>
                              <th className="p-4">Page Consultée</th>
                              <th className="p-4">Navigateur / Appareil</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-slate-300 font-mono text-[11px]">
                            {stats.recentVisitors.map((v: any) => (
                              <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-4 text-accent font-bold">
                                  {new Date(v.createdAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'medium' })}
                                </td>
                                <td className="p-4 text-white font-bold">{v.ip || 'Anonyme'}</td>
                                <td className="p-4">
                                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-slate-200">
                                    {v.path || '/'}
                                  </span>
                                </td>
                                <td className="p-4 text-slate-500 truncate max-w-xs" title={v.userAgent}>
                                  {v.userAgent || 'Navigateur Standard'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
        </div> {/* end flex gap-10 (desktop layout) */}
      </div>
    </div>
  );
};

export default Admin;
