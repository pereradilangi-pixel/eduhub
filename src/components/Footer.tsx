import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Phone, Mail, Heart, Github, Twitter, Youtube, Instagram, Settings2, X } from 'lucide-react';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { OwnerTrigger } from '@/components/OwnerDashboard';

export function Footer() {
  const { social, updateSocial, whatsappNumber } = useSiteConfig();
  const [showSocialEditor, setShowSocialEditor] = useState(false);

  const socialLinks = [
    { key: 'instagram' as const, icon: Instagram, label: 'Instagram', href: social.instagram },
    { key: 'youtube' as const, icon: Youtube, label: 'YouTube', href: social.youtube },
    { key: 'twitter' as const, icon: Twitter, label: 'Twitter/X', href: social.twitter },
    { key: 'github' as const, icon: Github, label: 'GitHub', href: social.github },
  ];

  const whatsAppUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <footer className="relative border-t border-white/5 bg-ink-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-neon-gradient flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-ink-900" />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-white block leading-none">EduHub</span>
                <span className="text-[10px] font-mono text-neon-cyan tracking-widest">SRI LANKA</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              The smart learning platform for Sri Lankan students. Past papers, study tools, video lectures, and community — all in one place.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#papers" className="hover:text-neon-cyan transition-colors">Past Papers</a></li>
              <li><a href="#tools" className="hover:text-neon-cyan transition-colors">Study Tools</a></li>
              <li><a href="#quiz" className="hover:text-neon-cyan transition-colors">Quizzes</a></li>
              <li><a href="#video-lectures" className="hover:text-neon-cyan transition-colors">Video Lectures</a></li>
              <li><a href="#marketplace" className="hover:text-neon-cyan transition-colors">Resources Store</a></li>
              <li><a href="#community" className="hover:text-neon-cyan transition-colors">Community Forum</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Exam Streams</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>O/L (Ordinary Level)</li>
              <li>A/L Science Stream</li>
              <li>A/L Commerce Stream</li>
              <li>A/L Arts & Technology</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-neon-cyan transition-colors">
                  <Phone className="w-4 h-4" /> 0{whatsappNumber.substring(2)}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> support@eduhub.lk
              </li>
            </ul>
            <div className="flex gap-3 mt-4 items-center">
              {socialLinks.map(({ key, icon: Icon, href }) => (
                <a key={key} href={href || '#'} target="_blank" rel="noopener noreferrer" className={`w-9 h-9 rounded-lg bg-ink-700 flex items-center justify-center transition-all ${href ? 'text-gray-400 hover:text-neon-cyan hover:bg-ink-600' : 'text-gray-600 cursor-default'}`}>
                  <Icon className="w-4 h-4" />
                </a>
              ))}
              <button onClick={() => setShowSocialEditor(true)} className="w-9 h-9 rounded-lg bg-ink-700 flex items-center justify-center text-gray-500 hover:text-neon-cyan hover:bg-ink-600 transition-all" title="Edit social links">
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p><OwnerTrigger /> All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="w-3.5 h-3.5 text-neon-pink fill-current" /> for Sri Lankan students
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showSocialEditor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSocialEditor(false)} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-white dark:text-white light:text-gray-900 flex items-center gap-2"><Settings2 className="w-5 h-5 text-neon-cyan" /> Edit Social Links</h3>
                <button onClick={() => setShowSocialEditor(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                {socialLinks.map(({ key, label, icon: Icon }) => (
                  <div key={key}>
                    <label className="flex items-center gap-2 text-xs text-gray-400 mb-1"><Icon className="w-3.5 h-3.5" /> {label} URL</label>
                    <input type="text" value={social[key]} onChange={(e) => updateSocial(key, e.target.value)} placeholder={`https://${key}.com/your-page`} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 placeholder:text-gray-500 outline-none focus:border-neon-cyan/40" />
                  </div>
                ))}
              </div>
              <button onClick={() => setShowSocialEditor(false)} className="btn-primary w-full text-sm">Save & Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
