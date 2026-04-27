import React, { useState, useEffect } from 'react';
import { useConfig } from '@/hooks/use-config';
import { loginAdmin, updateConfig, getMediaUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Settings, Layout, MessageSquare, Save, LogOut, 
  Trash2, Plus, Globe, Sparkles, AlertCircle, 
  ChevronRight, Layers, CreditCard, Image as ImageIcon, UploadCloud, 
  Share2, Activity, Zap, Brain, BookOpen, Lightbulb, Rocket
} from 'lucide-react';
import axios from 'axios';

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
      const webhookUrl = "https://n8n.votresite.com/webhook/publish"; // URL générique
      const blogUrl = `${window.location.origin}/blog/${blog.slug || blog.serviceId}`;
      
      toast.info("Validation n8n en cours...");
      
      await axios.post(webhookUrl, {
        action: "publish_article",
        title: blog.title,
        content: blog.content,
        url: blogUrl,
        tags: blog.tags,
        source: "kora-agency-admin"
      });
      
      toast.success("Envoyé à la machine n8n avec succès !");
    } catch (err) {
      console.error(err);
      toast.error("Échec n8n. URL du Webhook introuvable ou bloquée.");
    }
  };

  const fetchMedias = async () => {
    try {
      const { data } = await axios.get('/api/media');
      setMedias(data);
    } catch (e) {
      console.error("Erreur chargement médias", e);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchMedias();
      fetchN8nSettings();
      fetchKnowledge();
      fetchBlogs();
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
      toast.error("Veuillez remplir le titre, le contenu et soit l'ID de service, soit l'adresse URL (slug).");
      return;
    }
    setIsSavingBlog(true);
    try {
      const payload = {
        ...newBlog,
        slug: newBlog.slug || newBlog.serviceId, // Fallback automatique
        tags: typeof newBlog.tags === 'string' 
          ? newBlog.tags.split(',').map(t => t.trim()) 
          : newBlog.tags
      };
      await axios.post('/api/blogs', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Blog d'expertise enregistré !");
      setNewBlog({ id: '', slug: '', serviceId: '', title: '', content: '', tags: '', readingTime: 5 });
      fetchBlogs();
    } catch (e) { toast.error("Échec de la sauvegarde du blog."); }
    finally { setIsSavingBlog(false); }
  };

  const handleDeleteBlog = async (id: string) => {
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
    setEditedConfig({...editedConfig, services: {...editedConfig.services, items: newItems}});
  };

  const addQuestion = (serviceIdx: number) => {
    const newItems = [...editedConfig.services.items];
    newItems[serviceIdx].questions.push("Nouvelle question ?");
    setEditedConfig({...editedConfig, services: {...editedConfig.services, items: newItems}});
  };

  const removeQuestion = (serviceIdx: number, qIdx: number) => {
    const newItems = [...editedConfig.services.items];
    newItems[serviceIdx].questions.splice(qIdx, 1);
    setEditedConfig({...editedConfig, services: {...editedConfig.services, items: newItems}});
  };

  const addNews = () => {
    setEditedConfig({...editedConfig, news: [...(editedConfig.news || []), "Nouvelle notification..."]});
  };

  const removeNews = (index: number) => {
    const newNews = [...editedConfig.news];
    newNews.splice(index, 1);
    setEditedConfig({...editedConfig, news: newNews});
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
    setEditedConfig({...editedConfig, about: {...editedConfig.about, methodology: newM}});
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
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-cta flex items-center justify-center font-bold text-white text-lg">K</div>
            <div>
              <h1 className="font-display font-bold text-white leading-tight">Centre de Contrôle</h1>
              <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Kora Agency v3.0</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleSave} className="bg-white text-black hover:bg-slate-200 gap-2 h-10 px-6 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5">
              <Save size={16} /> Publier les Changements
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsLoggedIn(false)} className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-10">
        {/* Navigation Sidebar */}
        <aside className="w-72 flex-shrink-0 space-y-2">
          {[
            { id: 'branding', label: 'Branding & Identité', icon: Globe },
            { id: 'hero', label: 'Section Accueil (Hero)', icon: Layout },
            { id: 'services', label: 'Gestion des Services', icon: Settings },
            { id: 'methodology', label: 'Méthodologie Audit', icon: Layers },
            { id: 'news', label: 'Notifications Ticker', icon: MessageSquare },
            { id: 'medias', label: 'Médiathèque', icon: ImageIcon },
            { id: 'social', label: 'Automatisations n8n', icon: Zap },
            { id: 'alexa-brain', label: 'Cerveau Alexa', icon: Brain },
            { id: 'expertise', label: 'Expertise (Blogs)', icon: BookOpen },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all group ${
                activeTab === tab.id 
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
        <main className="flex-grow p-1 rounded-3xl bg-gradient-to-br from-white/10 to-transparent">
          <div className="bg-[#0b0f17] rounded-[22px] p-8 min-h-[600px] border border-white/5">
            
            {activeTab === 'branding' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                   <h2 className="text-2xl font-display font-bold text-white mb-2">Identité de l'Agence</h2>
                   <p className="text-slate-400 text-sm">Configurez le nom et les messages globaux de votre marque.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Nom de l'Agence</label>
                    <Input 
                      value={editedConfig.branding?.name || ''} 
                      onChange={e => setEditedConfig({...editedConfig, branding: {...editedConfig.branding, name: e.target.value}})}
                      className="bg-slate-900 border-white/10 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Slogan (Motto)</label>
                    <Input 
                      value={editedConfig.branding?.motto || ''} 
                      onChange={e => setEditedConfig({...editedConfig, branding: {...editedConfig.branding, motto: e.target.value}})}
                      className="bg-slate-900 border-white/10 h-12"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Description de l'Agence</label>
                    <Textarea 
                      rows={3}
                      value={editedConfig.branding?.description || ''} 
                      onChange={e => setEditedConfig({...editedConfig, branding: {...editedConfig.branding, description: e.target.value}})}
                      className="bg-slate-900 border-white/10"
                    />
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
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Texte du Badge</label>
                    <Input 
                      value={editedConfig.hero?.badge || ''} 
                      onChange={e => setEditedConfig({...editedConfig, hero: {...editedConfig.hero, badge: e.target.value}})}
                      className="bg-slate-900 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Titre Accrocheur (H1)</label>
                    <Input 
                      value={editedConfig.hero?.title || ''} 
                      onChange={e => setEditedConfig({...editedConfig, hero: {...editedConfig.hero, title: e.target.value}})}
                      className="bg-slate-900 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Paragraphe Descriptif</label>
                    <Textarea 
                      rows={5}
                      value={editedConfig.hero?.description || ''} 
                      onChange={e => setEditedConfig({...editedConfig, hero: {...editedConfig.hero, description: e.target.value}})}
                      className="bg-slate-900 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">URL de l'Image Principale (Médiathèque)</label>
                    <Input 
                      value={editedConfig.hero?.imagePath || ''} 
                      onChange={e => setEditedConfig({...editedConfig, hero: {...editedConfig.hero, imagePath: e.target.value}})}
                      className="bg-slate-900 border-white/10"
                      placeholder="Ex: /media/xyz.jpg ou https://..."
                    />
                  </div>
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
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Titre du Service</label>
                          <Input 
                            value={item.title || ''} 
                            onChange={e => {
                              const newItems = [...editedConfig.services.items];
                              newItems[idx].title = e.target.value;
                              setEditedConfig({...editedConfig, services: {...editedConfig.services, items: newItems}});
                            }}
                            className="bg-slate-900 border-white/5"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Prix (FBU)</label>
                          <Input 
                            type="number"
                            value={item.price || 0} 
                            onChange={e => {
                              const newItems = [...editedConfig.services.items];
                              newItems[idx].price = parseInt(e.target.value);
                              setEditedConfig({...editedConfig, services: {...editedConfig.services, items: newItems}});
                            }}
                            className="bg-slate-900 border-white/5"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1 mt-2">
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Lien de l'Image (Optionnel - Écrase l'Icône SVG)</label>
                          <Input 
                            value={item.imagePath || ''} 
                            placeholder="Ex: /media/mon-image.jpg"
                            onChange={e => {
                              const newItems = [...editedConfig.services.items];
                              newItems[idx].imagePath = e.target.value;
                              setEditedConfig({...editedConfig, services: {...editedConfig.services, items: newItems}});
                            }}
                            className="bg-slate-900 border-white/5"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Questions du Devis</label>
                          <div className="space-y-2 mt-2">
                             {(item.questions || []).map((q: string, qIdx: number) => (
                               <div key={qIdx} className="flex gap-2">
                                 <Input 
                                   value={q} 
                                   onChange={e => {
                                     const newItems = [...editedConfig.services.items];
                                     newItems[idx].questions[qIdx] = e.target.value;
                                     setEditedConfig({...editedConfig, services: {...editedConfig.services, items: newItems}});
                                   }}
                                   className="bg-black/20 border-white/5 h-10 text-xs"
                                 />
                                 <Button variant="ghost" size="icon" onClick={() => removeQuestion(idx, qIdx)} className="text-slate-600 hover:text-red-500">
                                   <Trash2 size={14} />
                                 </Button>
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
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">Éditeur d'Expertise "Makamba Pro" ✍️</h2>
                    <p className="text-slate-400 text-sm">Créez des articles riches avec photos pour un impact maximal à Makamba et ailleurs.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Editor Column */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white/5 p-6 sm:p-8 rounded-[32px] border border-white/5 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black text-accent tracking-[0.2em]">Service Lié (Optionnel)</label>
                          <select 
                            value={newBlog.serviceId}
                            onChange={(e) => setNewBlog({...newBlog, serviceId: e.target.value, slug: newBlog.slug || e.target.value})}
                            className="w-full bg-slate-900 border-white/10 h-14 rounded-2xl px-4 text-white focus:border-accent ring-0 outline-none"
                          >
                            <option value="">Aucun service spécifique...</option>
                            {editedConfig.services?.items?.map((s: any) => (
                              <option key={s.id} value={s.id}>{s.title} ({s.id})</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black text-accent tracking-[0.2em]">URL personnalisée (slug)</label>
                          <Input 
                            value={newBlog.slug}
                            onChange={(e) => setNewBlog({...newBlog, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                            className="bg-slate-900 border-white/10 h-14 rounded-2xl"
                            placeholder="ex: conseils-strategiques"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black text-accent tracking-[0.2em]">Titre de l'Article Premium</label>
                          <Input 
                            value={newBlog.title}
                            onChange={(e) => setNewBlog({...newBlog, title: e.target.value})}
                            className="bg-slate-900 border-white/10 h-14 rounded-2xl"
                            placeholder="Ex: Stratégie de croissance à Makamba..."
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] uppercase font-black text-accent tracking-[0.2em]">Contenu Riche (Markdown)</label>
                          <div className="flex gap-2">
                            <span 
                              onClick={() => setNewBlog({...newBlog, content: newBlog.content + "\n## Nouveau Titre\n"})}
                              className="text-[10px] bg-white/5 px-2 py-1 rounded cursor-pointer hover:bg-accent/20 transition-colors"
                            >
                              Titre
                            </span>
                            <span 
                              onClick={() => setNewBlog({...newBlog, content: newBlog.content + "**gras**"})}
                              className="text-[10px] bg-white/5 px-2 py-1 rounded cursor-pointer hover:bg-accent/20 transition-colors"
                            >
                              B
                            </span>
                          </div>
                        </div>
                        <Textarea 
                          rows={15}
                          value={newBlog.content}
                          onChange={(e) => setNewBlog({...newBlog, content: e.target.value})}
                          className="bg-slate-900 border-white/10 font-mono text-sm rounded-[2rem] p-6 focus:ring-accent/20 min-h-[400px]"
                          placeholder="# Introduction... ![IMAGE:/media/ma-photo.jpg]..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black text-accent tracking-[0.2em]">Tags (Virgules)</label>
                          <Input 
                            value={newBlog.tags}
                            onChange={(e) => setNewBlog({...newBlog, tags: e.target.value})}
                            className="bg-slate-900 border-white/10 h-12 rounded-xl"
                            placeholder="Makamba, Stratégie, Vente"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black text-accent tracking-[0.2em]">Temps de lecture (min)</label>
                          <Input 
                            type="number"
                            value={newBlog.readingTime}
                            onChange={(e) => setNewBlog({...newBlog, readingTime: parseInt(e.target.value)})}
                            className="bg-slate-900 border-white/10 h-12 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button 
                          onClick={handleSaveBlog} 
                          className="flex-1 bg-accent hover:bg-accent/80 h-14 rounded-2xl font-black uppercase tracking-[0.1em] shadow-xl shadow-accent/10"
                          disabled={isSavingBlog}
                        >
                          {isSavingBlog ? "Publication..." : "Publier l'Expertise (Makamba Style)"}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            const plainText = newBlog.content.replace(/#+ /g, '').replace(/!\[.*\]\(.*\)/g, '').replace(/\*\*.*\*\*/g, '').replace(/\[.*\]\(.*\)/g, '');
                            navigator.clipboard.writeText(`${newBlog.title}\n\n${plainText}`);
                            toast.success("Contenu copié pour Facebook/WhatsApp (Texte pur)");
                          }}
                          className="border-white/10 hover:bg-white/5 h-14 px-6 rounded-2xl"
                          title="Copier pour Réseaux Sociaux"
                        >
                          <Share2 size={20} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Media Picker Column - Organized to avoid conflicts */}
                  <div className="lg:col-span-4 flex flex-col gap-6 max-h-[800px]">
                    <div className="sidebar-box flex flex-col flex-grow min-h-0">
                      <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4 flex-shrink-0">
                        <ImageIcon className="text-accent" size={18} />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Ma Médiathèque</h3>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 pb-20 overflow-y-auto custom-scrollbar pr-2 min-h-[400px]">
                        {medias.map(media => (
                          <div 
                            key={media.id} 
                            className="relative group w-[calc(50%-8px)] h-40 rounded-xl overflow-hidden border border-white/5 cursor-pointer hover:border-accent transition-all flex-shrink-0"
                          >
                            <img src={getMediaUrl(media.path)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                            <div className="absolute inset-0 bg-accent/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 p-3 transition-all">
                              <span className="text-[10px] font-black text-white uppercase tracking-widest text-center leading-tight">Poser l'image</span>
                              <div className="flex flex-col gap-1.5 w-full">
                                <button onClick={() => { setNewBlog({...newBlog, content: newBlog.content + `\n\n![IMAGE-LEFT:${media.path}]\n\n`}); toast.info("Image placée à Gauche"); }} className="bg-black/50 hover:bg-black font-bold text-[10px] text-white py-1.5 rounded-lg w-full transition-colors">← Gauche</button>
                                <button onClick={() => { setNewBlog({...newBlog, content: newBlog.content + `\n\n![IMAGE-CENTER:${media.path}]\n\n`}); toast.info("Image au Centre"); }} className="bg-black/50 hover:bg-black font-bold text-[10px] text-white py-1.5 rounded-lg w-full transition-colors">↔ Centre</button>
                                <button onClick={() => { setNewBlog({...newBlog, content: newBlog.content + `\n\n![IMAGE-RIGHT:${media.path}]\n\n`}); toast.info("Image placée à Droite"); }} className="bg-black/50 hover:bg-black font-bold text-[10px] text-white py-1.5 rounded-lg w-full transition-colors">→ Droite</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="mt-4 text-[9px] text-slate-500 uppercase font-black text-center tracking-widest flex-shrink-0">Cliquez pour insérer</p>
                    </div>

                    <div className="bg-cta/10 border border-cta/20 rounded-[2.5rem] p-8 space-y-4 flex-shrink-0">
                      <div className="flex items-center gap-2 text-cta">
                        <Lightbulb size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Conseil Makamba</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Pour un rendu **"Premium"**, ajoutez une image tous les 2 paragraphes. Utilisez les titres (##) pour structurer.
                      </p>
                    </div>
                  </div>
                </div>

                {/* List of existing blogs */}
                <div className="mt-12 space-y-6">
                  <h3 className="text-lg font-serif font-bold text-white flex items-center gap-3">
                    <BookOpen className="text-accent" size={20} />
                    Articles Publiés
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                      <div key={blog.id} className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] relative group hover:border-accent/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                            <Rocket size={24} />
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
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
                              }}
                              className="text-white hover:bg-accent/20 rounded-full"
                            >
                              <Settings size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteBlog(blog.id)}
                              className="text-red-500 hover:bg-red-500/10 rounded-full"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                        <h4 className="font-serif font-bold text-xl text-white mb-2 line-clamp-1">{blog.title}</h4>
                        <p className="text-[10px] text-accent font-black uppercase tracking-widest mb-4">ID Service: {blog.serviceId}</p>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {blog.tags && Array.isArray(blog.tags) && blog.tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-white/5 px-2 py-0.5 rounded-md">#{tag}</span>
                          ))}
                        </div>
                        <div className="pt-4 border-t border-white/5 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all">
                           <button 
                             onClick={() => publishToN8n(blog)}
                             className="w-full py-2 bg-gradient-to-r from-purple-500/10 hover:from-purple-500/20 to-blue-500/10 hover:to-blue-500/20 border border-purple-500/20 text-purple-400 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                           >
                              <Zap size={14} /> Envoyer à n8n 
                           </button>
                           <div className="flex gap-2 w-full">
                               <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/blog/' + (blog.slug || blog.serviceId))}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white/5 hover:bg-[#1877F2]/20 border border-white/5 text-slate-400 hover:text-[#1877F2] py-2 rounded-xl flex justify-center transition-colors">
                                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                               </a>
                               <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin + '/blog/' + (blog.slug || blog.serviceId))}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white py-2 rounded-xl flex justify-center transition-colors">
                                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                               </a>
                               <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/blog/' + (blog.slug || blog.serviceId))}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white/5 hover:bg-[#0A66C2]/20 border border-white/5 text-slate-400 hover:text-[#0A66C2] py-2 rounded-xl flex justify-center transition-colors">
                                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                               </a>
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
                          value={msg} 
                          onChange={e => {
                            const newNews = [...editedConfig.news];
                            newNews[idx] = e.target.value;
                            setEditedConfig({...editedConfig, news: newNews});
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
                         <Input 
                           value={m.title || ''} 
                           onChange={e => {
                             const newM = [...editedConfig.about.methodology];
                             newM[idx].title = e.target.value;
                             setEditedConfig({...editedConfig, about: {...editedConfig.about, methodology: newM}});
                           }}
                           className="bg-slate-900 border-white/10 h-10 font-bold"
                         />
                      </div>
                      <Textarea 
                        value={m.description || ''} 
                        onChange={e => {
                          const newM = [...editedConfig.about.methodology];
                          newM[idx].description = e.target.value;
                          setEditedConfig({...editedConfig, about: {...editedConfig.about, methodology: newM}});
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
                  {medias.length === 0 ? (
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
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">URL du Webhook n8n</label>
                        <span className="px-2 py-0.5 rounded bg-cta/10 text-cta text-[10px] font-bold uppercase tracking-widest">Opérationnel</span>
                      </div>
                      <div className="flex gap-4">
                        <Input 
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
                    <h2 className="text-2xl font-display font-bold text-white leading-tight">Centre d'Apprentissage Alexa</h2>
                    <p className="text-slate-400 text-sm">Éduquez Alexa avec vos propres informations, brochures et FAQ privées.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 space-y-6 h-fit">
                    <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                       <Lightbulb size={20} className="text-cta" /> Nouveau Savoir
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Sujet (Titre)</label>
                        <Input 
                          value={newKnowledge.title}
                          onChange={(e) => setNewKnowledge({...newKnowledge, title: e.target.value})}
                          placeholder="Ex: Notre méthode de recrutement..."
                          className="bg-slate-900 border-white/10 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Contenu (Savoir)</label>
                        <textarea 
                          value={newKnowledge.content}
                          onChange={(e) => setNewKnowledge({...newKnowledge, content: e.target.value})}
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
                      {knowledgeItems.length === 0 ? (
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

          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
