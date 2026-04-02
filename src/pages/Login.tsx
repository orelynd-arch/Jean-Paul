import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { auth, signInWithRedirect, signInWithPopup, getRedirectResult, googleProvider } from '../firebase';
import { motion } from 'motion/react';
import { BarChart3, LogIn, ShieldAlert, Loader2, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [redirectLoading, setRedirectLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useRedirect, setUseRedirect] = useState(true);
  const [showDebug, setShowDebug] = useState(false);

  const isAdmin = user?.email?.toLowerCase() === 'orelynd@gmail.com';

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, navigate]);

  useEffect(() => {
    let isMounted = true;
    const checkRedirect = async () => {
      try {
        console.log("Checking for redirect result...");
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 15000)
        );
        
        const result = await Promise.race([
          getRedirectResult(auth),
          timeoutPromise
        ]) as any;

        if (result && isMounted) {
          console.log("Redirect result found:", result.user.email);
          const userEmail = result.user.email?.toLowerCase();
          if (userEmail !== 'orelynd@gmail.com') {
            setError(`Email non autorisé : ${userEmail}. Veuillez utiliser orelynd@gmail.com`);
            await auth.signOut();
          } else {
            navigate('/admin');
          }
        }
      } catch (err: any) {
        console.error("Redirect check failed:", err);
        if (err.code === 'auth/unauthorized-domain') {
          setError("Ce domaine n'est pas autorisé dans Firebase. Vérifiez l'onglet 'Authorized domains' dans votre console Firebase.");
        } else if (err.message !== 'Timeout') {
          setError(`Erreur : ${err.code || err.message}`);
        }
      } finally {
        if (isMounted) setRedirectLoading(false);
      }
    };
    checkRedirect();
    return () => { isMounted = false; };
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      if (useRedirect) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        const userEmail = result.user.email?.toLowerCase();
        if (userEmail !== 'orelynd@gmail.com') {
          setError(`Email non autorisé : ${userEmail}`);
          await auth.signOut();
        } else {
          navigate('/admin');
        }
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.code === 'auth/popup-blocked') {
        setError("Popup bloqué. Veuillez autoriser les fenêtres surgissantes.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("Domaine non autorisé. Ajoutez portfolio-jeanpaul.netlify.app dans votre console Firebase.");
      } else {
        setError(`Erreur : ${err.code || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const firebaseConfig = auth.app.options;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-3xl p-10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <BarChart3 className="w-32 h-32 text-blue-500" />
        </div>

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Espace Administration</h1>
          <p className="text-gray-400 mb-8">Connectez-vous pour gérer votre portfolio.</p>

          {redirectLoading ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-400">Vérification de la connexion...</p>
            </div>
          ) : (
            <>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl mb-8 flex items-center gap-3 text-sm text-left"
                >
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  {error}
                </motion.div>
              )}

              {user && !isAdmin && (
                <div className="mb-8 p-4 bg-white/5 rounded-xl text-center">
                  <p className="text-sm text-gray-400 mb-1">Connecté en tant que :</p>
                  <p className="font-medium text-white">{user.email}</p>
                  <p className="text-xs text-red-400 mt-2">Cet email n'est pas autorisé.</p>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    {useRedirect ? 'Continuer avec Google' : 'Connexion (Fenêtre)'}
                  </>
                )}
              </button>

              <button
                onClick={() => setUseRedirect(!useRedirect)}
                className="w-full mt-4 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {useRedirect ? "Problème ? Essayer le mode fenêtre" : "Essayer le mode redirection"}
              </button>

              <button
                onClick={() => setShowDebug(!showDebug)}
                className="w-full mt-2 py-2 text-[10px] text-gray-600 hover:text-gray-400 transition-colors uppercase tracking-widest"
              >
                {showDebug ? "Masquer les diagnostics" : "Diagnostics techniques"}
              </button>

              {showDebug && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 bg-black/40 rounded-xl text-left font-mono text-[10px] text-gray-500 border border-white/5 overflow-hidden"
                >
                  <p className="text-blue-400 mb-2 font-bold">CONFIGURATION ACTUELLE :</p>
                  <p><span className="text-gray-400">Project ID:</span> {(firebaseConfig as any).projectId}</p>
                  <p><span className="text-gray-400">Auth Domain:</span> {(firebaseConfig as any).authDomain}</p>
                  <p className="mt-2 text-blue-400 mb-2 font-bold">ÉTAT AUTH :</p>
                  <p><span className="text-gray-400">User:</span> {user ? user.email : 'Non connecté'}</p>
                  <p><span className="text-gray-400">Admin:</span> {isAdmin ? 'OUI' : 'NON'}</p>
                  <p className="mt-2 text-yellow-500 italic">
                    Note : Le Project ID doit correspondre à celui affiché dans votre console Firebase.
                  </p>
                </motion.div>
              )}
            </>
          )}

          <div className="mt-8 pt-8 border-t border-white/5">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
