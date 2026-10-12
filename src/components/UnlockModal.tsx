import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Zap } from 'lucide-react';

interface UnlockModalProps {
  open: boolean;
  onClose: () => void;
  featureName?: string;
}

export function UnlockModal({ open, onClose, featureName }: UnlockModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card p-8 w-full max-w-md text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/10 via-neon-cyan/5 to-transparent pointer-events-none" />
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><X className="w-5 h-5" /></button>

            <div className="relative">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }} className="w-20 h-20 rounded-2xl bg-neon-gradient flex items-center justify-center mx-auto mb-5 shadow-neon-soft">
                <Crown className="w-10 h-10 text-ink-900" />
              </motion.div>

              <h3 className="font-display text-2xl font-bold text-white dark:text-white light:text-gray-900 mb-2">Unlock Unlimited Pass</h3>
              {featureName && <p className="text-sm text-gray-400 mb-4">You've used all free tries for <span className="text-neon-cyan font-semibold">{featureName}</span></p>}
              {!featureName && <p className="text-sm text-gray-400 mb-4">You've reached the free usage limit</p>}

              <div className="bg-ink-700/40 rounded-xl p-4 mb-5 space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Full Bundle Pass</span>
                  <span className="text-lg font-bold text-neon-pink">Rs. 890</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Original Price</span>
                  <span className="text-sm text-gray-500 line-through">Rs. 1890</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-2">
                  <span className="text-sm text-green-400 font-semibold">You Save</span>
                  <span className="text-sm text-green-400 font-bold">Rs. 1000</span>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                {['Unlimited AI Flashcards', 'Unlimited Essay Evaluations', 'Unlimited Study Planner', 'Unlimited Paper Marking', 'All Past Papers & Notes'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-300 dark:text-gray-300 light:text-gray-600">
                    <Zap className="w-4 h-4 text-neon-cyan flex-shrink-0" /> {item}
                  </div>
                ))}
              </div>

              <a href="#pricing" onClick={onClose} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" /> Unlock Now — Save Rs. 1000
              </a>
              <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-400 mt-3">Maybe later</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
