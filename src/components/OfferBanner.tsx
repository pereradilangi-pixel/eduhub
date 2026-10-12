import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, ChevronRight } from 'lucide-react';

export function OfferBanner() {
  const [dismissed, setDismissed] = useState(false);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
          <div className="bg-gradient-to-r from-neon-pink via-neon-violet to-neon-cyan text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                <Crown className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Unlock All Features & Full O/L + A/L Papers Pass for</span>
                <span className="sm:hidden">Full Pass</span>
                <span className="font-bold">Rs. 890</span>
                <span className="line-through opacity-70 text-xs">Rs. 1890</span>
                <span className="text-yellow-200 font-bold text-xs hidden sm:inline">— Save Rs. 1000 Today!</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a href="#pricing" className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 text-xs font-semibold flex items-center gap-1 transition-all">
                  Get Pass <ChevronRight className="w-3 h-3" />
                </a>
                <button onClick={() => setDismissed(true)} className="text-white/70 hover:text-white p-0.5"><X className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
