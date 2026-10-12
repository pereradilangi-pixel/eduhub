import { motion } from 'framer-motion';
import { Sparkles, Crown } from 'lucide-react';
import { AIFlashcards } from '@/components/AIFlashcards';
import { AIEssayEvaluator } from '@/components/AIEssayEvaluator';
import { AIStudyPlanner } from '@/components/AIStudyPlanner';
import { AdBanner } from '@/components/AdBanner';
import { EditableText } from '@/context/AdminContext';
import { useSiteConfig } from '@/context/SiteConfigContext';

export function AITools() {
  const { isFullyUnlocked } = useSiteConfig();

  return (
    <section id="ai-tools" className="relative py-20 overflow-hidden">
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-neon-pink/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-neon-cyan/5 rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="section-tag mb-4">
            <Sparkles className="w-3 h-3" /> AI Study Tools
          </span>
          <EditableText field="aiToolsTitle" as="h2" className="font-display text-3xl sm:text-4xl font-bold text-white dark:text-white light:text-gray-900" />
          <EditableText field="aiToolsSubtitle" as="p" className="mt-3 text-gray-400 dark:text-gray-400 light:text-gray-600 max-w-2xl mx-auto" />
        </motion.div>

        {!isFullyUnlocked && (
          <div className="glass-card p-3 mb-6 text-center">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
              <Crown className="w-3.5 h-3.5 text-neon-pink" />
              Free users get 3 uses per feature. <a href="#pricing" className="text-neon-cyan hover:underline">Unlock unlimited access</a>
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-5">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.05 }}>
            <AIFlashcards />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}>
            <AIEssayEvaluator />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.15 }}>
            <AIStudyPlanner />
          </motion.div>
        </div>

        <div className="mt-8">
          <AdBanner slot="ai-tools" className="h-24" />
        </div>
      </div>
    </section>
  );
}
