import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Bot, Users, ArrowRight, TrendingUp, Download, Star } from 'lucide-react';
import { EditableText } from '@/context/AdminContext';
import { whatsappLink } from '@/lib/whatsapp';
import { AdBanner } from './AdBanner';

const HERO_IMG = 'https://images.pexels.com/photos/8199160/pexels-photo-8199160.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const STATS = [
  { label: 'Past Papers', value: '500+', icon: Download },
  { label: 'Active Students', value: '12K+', icon: Users },
  { label: 'Subjects Covered', value: '30+', icon: BookOpen },
  { label: 'Avg. Rating', value: '4.8', icon: Star },
];

const FEATURES = [
  { title: 'AI Study Assistant', desc: 'Gemini-powered tutor for instant answers', icon: Bot, color: 'text-neon-cyan' },
  { title: 'Productivity Tools', desc: 'Pomodoro, Z-Score calc, PDF toolkit', icon: TrendingUp, color: 'text-neon-violet' },
  { title: 'Community Forum', desc: 'Collaborate with students islandwide', icon: Users, color: 'text-neon-pink' },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-12 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:60px_60px] opacity-40" />
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-violet/10 rounded-full blur-[120px] animate-pulse-glow" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="section-tag">
                <Sparkles className="w-3 h-3" /> Smart Learning Platform
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <EditableText
                field="heroTitle"
                as="h1"
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
              />
              <div className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text font-display">
                Made for Sri Lanka
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <EditableText
                field="heroSubtitle"
                as="p"
                className="text-gray-400 text-lg leading-relaxed max-w-xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <a href="#papers" className="btn-primary flex items-center gap-2">
                Explore Resources <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={whatsappLink('Hi, I want to learn more about EduHub SL premium resources.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost flex items-center gap-2"
              >
                Get Premium Access
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6"
            >
              {STATS.map((s) => (
                <div key={s.label} className="glass-card p-4 text-center">
                  <s.icon className="w-5 h-5 text-neon-cyan mx-auto mb-2" />
                  <div className="text-2xl font-bold font-display text-white">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Image + Features */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-float">
              <img
                src={HERO_IMG}
                alt="Students studying together"
                className="w-full h-[400px] object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/20 to-transparent" />
            </div>

            {/* Floating feature cards */}
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.15 }}
                className="absolute glass-card p-3 pr-5 flex items-center gap-3 shadow-neon-soft"
                style={{
                  top: i === 0 ? '5%' : i === 1 ? '45%' : '75%',
                  right: i === 0 ? '-5%' : i === 1 ? '10%' : '-5%',
                  left: i === 1 ? undefined : 'auto',
                }}
              >
                <div className={`w-10 h-10 rounded-lg bg-ink-600/80 flex items-center justify-center ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{f.title}</div>
                  <div className="text-xs text-gray-400">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Top ad banner */}
        <div className="mt-10">
          <AdBanner slot="header" className="h-20" />
        </div>
      </div>
    </section>
  );
}
