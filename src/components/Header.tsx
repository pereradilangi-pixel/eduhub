import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, BookOpen, Wrench, MessageSquare, Phone, Pencil, Check, Brain, Sun, Moon, Video, ShoppingBag, FileCheck } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useTheme } from '@/context/ThemeContext';
import { whatsappLink } from '@/lib/whatsapp';
import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'Papers', href: '#papers', icon: BookOpen },
  { label: 'Tools', href: '#tools', icon: Wrench },
  { label: 'Quizzes', href: '#quiz', icon: Brain },
  { label: 'Videos', href: '#video-lectures', icon: Video },
  { label: 'Store', href: '#marketplace', icon: ShoppingBag },
  { label: 'Marking', href: '#paper-marking', icon: FileCheck },
  { label: 'Community', href: '#community', icon: MessageSquare },
];

export function Header() {
  const { editMode, toggleEditMode } = useAdmin();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ink-900/95 dark:bg-ink-900/95 light:bg-white/95 backdrop-blur-xl border-b border-white/5 dark:border-white/5 light:border-gray-200 shadow-card'
          : 'bg-ink-900/80 dark:bg-ink-900/80 light:bg-white/80 backdrop-blur-md border-b border-white/5 dark:border-white/5 light:border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group flex-shrink-0">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 rounded-xl bg-neon-gradient flex items-center justify-center shadow-neon-soft"
            >
              <GraduationCap className="w-6 h-6 text-ink-900" />
            </motion.div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-lg text-white dark:text-white light:text-gray-900">EduHub</span>
              <span className="text-[10px] font-mono text-neon-cyan tracking-widest">SRI LANKA</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 dark:text-gray-300 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-gray-100 transition-all duration-200 whitespace-nowrap"
              >
                <link.icon className="w-4 h-4 flex-shrink-0" />
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-400 hover:text-neon-cyan border border-white/10 dark:border-white/10 light:border-gray-200 hover:border-neon-cyan/40 transition-all"
              title="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div key="moon" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                    <Moon className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div key="sun" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }}>
                    <Sun className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Admin toggle */}
            <button
              onClick={toggleEditMode}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                editMode
                  ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40'
                  : 'text-gray-400 hover:text-white dark:hover:text-white light:hover:text-gray-900 border border-white/10 dark:border-white/10 light:border-gray-200 hover:border-white/20 dark:hover:border-white/20 light:hover:border-gray-300'
              }`}
              title="Toggle Admin Edit Mode"
            >
              {editMode ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
              <span className="hidden sm:inline">{editMode ? 'Editing' : 'Edit'}</span>
            </button>

            {/* WhatsApp */}
            <a
              href={whatsappLink('Hi, I have a question about EduHub SL resources.')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] text-white font-semibold px-3 sm:px-4 py-2 rounded-lg text-sm hover:bg-[#1eb558] transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/20 whitespace-nowrap"
            >
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="lg:hidden p-2 rounded-lg text-gray-300 dark:text-gray-300 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-gray-100"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden bg-ink-800/95 dark:bg-ink-800/95 light:bg-white/95 backdrop-blur-xl border-b border-white/5 dark:border-white/5 light:border-gray-200"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 dark:text-gray-300 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-gray-100 transition-all"
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
