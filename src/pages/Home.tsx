import { motion, useScroll, useTransform } from 'motion/react';
import { BarChart3, TrendingUp, PieChart, Database, ArrowRight, ChevronRight, BookOpen, GraduationCap, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SiteSettings } from '../types';

const stats = [
  { label: 'Analyses', value: '50+', icon: BarChart3 },
  { label: 'Projets', value: '12', icon: TrendingUp },
  { label: 'Articles', value: '25', icon: BookOpen },
];

export default function Home({ settings }: { settings: SiteSettings }) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <div className="relative overflow-hidden">
      {/* Enhanced Hero Background Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Animated Blobs with continuous movement - Increased Opacity and Size */}
        <motion.div 
          animate={{ 
            x: [0, 80, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ y: y1 }}
          className="absolute top-[-15%] left-[-15%] w-[70%] h-[70%] bg-blue-500/35 blur-[140px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            x: [0, -60, 0],
            y: [0, -70, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ y: y2 }}
          className="absolute bottom-[-15%] right-[-15%] w-[80%] h-[80%] bg-emerald-500/35 blur-[140px] rounded-full" 
        />
        
        {/* Dynamic Grid - More Visible */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808025_1px,transparent_1px),linear-gradient(to_bottom,#80808025_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)]" />

        {/* Floating Data Points - More visible and vibrant with glow */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              y: Math.random() * 100 + '%', 
              x: Math.random() * 100 + '%',
              opacity: Math.random() * 0.4 + 0.4
            }}
            animate={{ 
              y: [null, Math.random() * 100 + '%'],
              x: [null, Math.random() * 100 + '%'],
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-2 h-2 bg-blue-400/60 rounded-full blur-[1px] shadow-[0_0_10px_rgba(96,165,250,0.6)]"
          />
        ))}

        {/* Matrix-like numbers - Falling Effect - Increased Opacity and Color */}
        <div className="absolute inset-0 opacity-[0.2] font-mono text-[14px] flex justify-around p-4 overflow-hidden select-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -100 }}
              animate={{ y: ['0vh', '100vh'] }}
              transition={{ 
                duration: Math.random() * 8 + 8, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * 10
              }}
              className="flex flex-col gap-2 text-blue-400/80"
            >
              {[...Array(20)].map((_, j) => (
                <span key={j}>{Math.random() > 0.5 ? '1' : '0'}</span>
              ))}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <GraduationCap className="w-4 h-4" />
              <span>Étudiant à l'ENSPD - Université de Parakou</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Donner du sens aux <br />
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Données Statistiques
              </span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Je suis {settings.name}, futur statisticien planificateur. Passionné par l'analyse de données, 
              la planification stratégique et le partage de connaissances.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/knowledge"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group"
              >
                Explorer mes articles
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#contact"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all"
              >
                Me contacter
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full" />
            <div className="relative bg-zinc-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center p-6 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-colors">
                  <stat.icon className="w-8 h-8 text-blue-400 mb-4" />
                  <span className="text-3xl font-bold mb-1">{stat.value}</span>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-24 px-4 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Domaines d'Expertise</h2>
            <p className="text-gray-400">Mes compétences au service de la planification et du développement.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Statistiques Descriptives",
                desc: "Analyse approfondie des données pour en extraire des tendances significatives.",
                icon: PieChart,
                color: "text-blue-400"
              },
              {
                title: "Planification Stratégique",
                desc: "Élaboration de plans d'action basés sur des projections statistiques rigoureuses.",
                icon: TrendingUp,
                color: "text-emerald-400"
              },
              {
                title: "Gestion de Données",
                desc: "Collecte, nettoyage et structuration de bases de données complexes.",
                icon: Database,
                color: "text-purple-400"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-zinc-900 border border-white/5 hover:border-white/10 transition-all"
              >
                <item.icon className={cn("w-10 h-10 mb-6", item.color)} />
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-blue-600/20 to-emerald-600/20 border border-blue-500/20 rounded-3xl p-12 backdrop-blur-md">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à collaborer ?</h2>
          <p className="text-gray-300 text-lg mb-10">
            Vous avez un projet d'analyse de données ou besoin d'une expertise en planification ? 
            N'hésitez pas à me contacter.
          </p>
          <a
            href="mailto:orelynd@gmail.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            Envoyer un message
            <Mail className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
