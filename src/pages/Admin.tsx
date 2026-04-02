import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, db, addDoc, updateDoc, deleteDoc, doc, Timestamp, handleFirestoreError, OperationType, setDoc } from '../firebase';
import { Post } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit, Save, X, LayoutDashboard, FileText, ChevronRight, AlertCircle, CheckCircle2, Loader2, Settings as SettingsIcon, Facebook, Phone, Mail } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { SiteSettings } from '../types';

export default function Admin({ user, settings }: { user: User | null, settings: SiteSettings }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'settings'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<Post>>({
    title: '',
    content: '',
    category: 'Statistiques',
  });
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(settings);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const isAdmin = user?.email?.toLowerCase() === 'orelynd@gmail.com';

  useEffect(() => {
    setSiteSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/login');
      return;
    }

    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'posts');
    });
    return () => unsubscribe();
  }, [user, isAdmin, navigate]);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await setDoc(doc(db, 'settings', 'global'), siteSettings);
      setMessage({ type: 'success', text: 'Paramètres mis à jour !' });
    } catch (error) {
      console.error(error);
      handleFirestoreError(error, OperationType.WRITE, 'settings/global');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setMessage(null);

    try {
      if (currentPost.id) {
        // Update
        const postRef = doc(db, 'posts', currentPost.id);
        await updateDoc(postRef, {
          ...currentPost,
          updatedAt: Timestamp.now(),
        });
        setMessage({ type: 'success', text: 'Article mis à jour avec succès !' });
      } else {
        // Create
        await addDoc(collection(db, 'posts'), {
          ...currentPost,
          createdAt: Timestamp.now(),
          authorUid: user.uid,
        });
        setMessage({ type: 'success', text: 'Nouvel article publié !' });
      }
      setIsEditing(false);
      setCurrentPost({ title: '', content: '', category: 'Statistiques' });
    } catch (error) {
      console.error(error);
      handleFirestoreError(error, currentPost.id ? OperationType.UPDATE : OperationType.CREATE, 'posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    
    try {
      await deleteDoc(doc(db, 'posts', id));
      setMessage({ type: 'success', text: 'Article supprimé.' });
    } catch (error) {
      console.error(error);
      handleFirestoreError(error, OperationType.DELETE, `posts/${id}`);
    }
  };

  const handleEdit = (post: Post) => {
    setCurrentPost(post);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen py-20 px-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-blue-500" />
            Espace Administrateur
          </h1>
          <p className="text-gray-400 mt-1">Gérez vos articles et les paramètres du site.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('posts')}
            className={cn(
              "px-4 py-2 rounded-xl font-medium transition-all",
              activeTab === 'posts' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
            )}
          >
            Articles
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              "px-4 py-2 rounded-xl font-medium transition-all",
              activeTab === 'settings' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
            )}
          >
            Paramètres
          </button>
        </div>
        {activeTab === 'posts' && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            Nouvel Article
          </button>
        )}
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-xl mb-8 flex items-center gap-3 border",
            message.type === 'success' 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-red-500/10 border-red-500/20 text-red-400"
          )}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'settings' ? (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <SettingsIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold">Paramètres Généraux</h2>
            </div>

            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Nom complet</label>
                <input
                  required
                  type="text"
                  value={siteSettings.name}
                  onChange={(e) => setSiteSettings({ ...siteSettings, name: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-blue-500" /> Facebook
                  </label>
                  <input
                    type="url"
                    value={siteSettings.facebook}
                    onChange={(e) => setSiteSettings({ ...siteSettings, facebook: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-500" /> WhatsApp (Numéro)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.whatsapp}
                    onChange={(e) => setSiteSettings({ ...siteSettings, whatsapp: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="229XXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-red-500" /> Gmail
                  </label>
                  <input
                    type="email"
                    value={siteSettings.gmail}
                    onChange={(e) => setSiteSettings({ ...siteSettings, gmail: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="exemple@gmail.com"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  disabled={loading}
                  type="submit"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </motion.div>
        ) : isEditing ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-zinc-900 border border-white/10 rounded-2xl p-8 mb-12 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">{currentPost.id ? 'Modifier l\'article' : 'Créer un nouvel article'}</h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setCurrentPost({ title: '', content: '', category: 'Statistiques' });
                }}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Titre</label>
                  <input
                    required
                    type="text"
                    value={currentPost.title}
                    onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Titre de l'article"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Catégorie</label>
                  <select
                    value={currentPost.category}
                    onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="Statistiques">Statistiques</option>
                    <option value="Planification">Planification</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Économie">Économie</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Contenu (Markdown supporté)</label>
                <textarea
                  required
                  rows={12}
                  value={currentPost.content}
                  onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
                  placeholder="Écrivez votre contenu ici..."
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                >
                  Annuler
                </button>
                <button
                  disabled={loading}
                  type="submit"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {currentPost.id ? 'Mettre à jour' : 'Publier l\'article'}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-4"
          >
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">{post.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-xs uppercase tracking-wider">{post.category}</span>
                      <span>•</span>
                      <span>{formatDate((post.createdAt as any).toDate())}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleEdit(post)}
                    className="p-3 bg-white/5 hover:bg-blue-500/10 hover:text-blue-400 rounded-xl transition-all"
                    title="Modifier"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id!)}
                    className="p-3 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="w-px h-8 bg-white/5 mx-2 hidden md:block" />
                  <ChevronRight className="w-5 h-5 text-gray-700 hidden md:block" />
                </div>
              </div>
            ))}

            {posts.length === 0 && (
              <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-white/10">
                <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">Aucun article publié pour le moment.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
