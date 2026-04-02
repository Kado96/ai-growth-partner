import React, { useState, useEffect } from 'react';
import { useConfig } from '@/hooks/use-config';
import { loginAdmin, updateConfig } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Settings, Layout, MessageSquare, Save, LogOut, 
  Trash2, Plus, Globe, Sparkles, AlertCircle, 
  ChevronRight, Layers, CreditCard, Image as ImageIcon, UploadCloud
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
    }
  }, [isLoggedIn]);

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
              <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block tracking-wider">Identifiant Administrateur</label>
              <Input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="bg-slate-900 border-slate-800 text-white h-12 rounded-xl" 
                placeholder="Manager ID"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block tracking-wider">Passcode</label>
              <Input 
                type="password" 
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
                    <p className="text-slate-400 text-sm">Gérez les images de votre site (Stockées sur SQLite local ou Supabase Prod).</p>
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
                          src={media.path.startsWith('http') ? media.path : `http://localhost:5001${media.path}`} 
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

          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
