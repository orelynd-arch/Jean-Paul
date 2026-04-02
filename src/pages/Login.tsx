import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { auth, signInWithRedirect, getRedirectResult, googleProvider } from '../firebase';
import { motion } from 'motion/react';
import { BarChart3, LogIn, ShieldAlert, Loader2, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [redirectLoading, setRedirectLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.email?.toLowerCase() === 'orelynd@gmail.com';

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, navigate]);

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const userEmail = result.user.email?.toLowerCase();
          if (userEmail !== 'orelynd@gmail.com') {
            setError(`Accès refusé. L'email ${userEmail} n'est pas autorisé.`);
            await auth.signOut();
          } else {
            navigate('/admin');
          }
        }
      } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/internal-error' || err.code === 'auth/network-request-failed') {
          setError("Erreur réseau. Veuillez vérifier votre connexion.");
        } else {
          setError("Une erreur est survenue lors de la connexion.");
        }
      } finally {
        setRedirectLoading(false);
      }
    };
    checkRedirect();
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err: any) {
      console.error(err);
      setError("Une erreur est survenue lors de la connexion.");
      setLoading(false);
    }
  };

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
                    Continuer avec Google
                  </>
                )}
              </button>
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
