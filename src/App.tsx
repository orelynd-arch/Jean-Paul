/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signOut, signInWithPopup, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, BarChart3, BookOpen, User as UserIcon, LogOut, LayoutDashboard, Plus, Trash2, Edit, ChevronRight, Mail, ArrowRight, PieChart, TrendingUp, Database, Facebook, Phone } from 'lucide-react';
import { cn } from './lib/utils';
import { SiteSettings } from './types';
import { db, onSnapshot, doc } from './firebase';
import Home from './pages/Home';
import Knowledge from './pages/Knowledge';
import Admin from './pages/Admin';
import Login from './pages/Login';
import ErrorBoundary from './components/ErrorBoundary';

function Navbar({ user, settings }: { user: User | null, settings: SiteSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAdmin = user?.email?.toLowerCase() === 'orelynd@gmail.com';

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Connaissances', path: '/knowledge' },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Dashboard', path: '/admin' });
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {settings.name}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-blue-400",
                  location.pathname === link.path ? "text-blue-400" : "text-gray-400"
                )}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500">{user.email}</span>
                <button
                  onClick={() => signOut(auth)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <UserIcon className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium",
                    location.pathname === link.path
                      ? "bg-blue-500/10 text-blue-400"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:bg-white/5 hover:text-white"
                >
                  Connexion Admin
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>({
    name: 'Jean Paul',
    facebook: '',
    whatsapp: '',
    gmail: 'orelynd@gmail.com'
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Safety timeout for loading state
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 8000);

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as SiteSettings);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/global');
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSettings();
      clearTimeout(timeout);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <BarChart3 className="w-12 h-12 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
          <Navbar user={user} settings={settings} />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home settings={settings} />} />
              <Route path="/knowledge" element={<Knowledge />} />
              <Route path="/admin" element={<Admin user={user} settings={settings} />} />
              <Route path="/login" element={<Login user={user} />} />
            </Routes>
          </main>
          
          <footer className="bg-black border-t border-white/10 py-12 px-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-blue-500" />
                <span className="text-lg font-bold">{settings.name}</span>
              </div>
              <div className="flex space-x-6">
                {settings.facebook && (
                  <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {settings.whatsapp && (
                  <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Phone className="w-5 h-5" />
                  </a>
                )}
                {settings.gmail && (
                  <a href={`mailto:${settings.gmail}`} className="text-gray-400 hover:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                  </a>
                )}
              </div>
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} {settings.name}. Tous droits réservés.
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </ErrorBoundary>
  );
}
