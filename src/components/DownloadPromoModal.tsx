import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, BookOpen, FileText, ClipboardList,
  ShoppingBag, Sparkles, Check,
} from 'lucide-react';
import type { PaperResource } from '@/data/mockData';
import { whatsappLink } from '@/lib/whatsapp';

const PROMO_BENEFITS = [
  { icon: BookOpen, text: 'Complete Syllabus Short Notes' },
  { icon: FileText, text: 'Model Papers with Step-by-Step Model Answers' },
  { icon: ClipboardList, text: 'Exam Revision Sheets & Target Papers' },
];

export function DownloadPromoModal({
  paper,
  onClose,
}: {
  paper: PaperResource;
  onClose: () => void;
}) {
  const buyLink = whatsappLink(
    `Hi, I want to purchase the Short Note Pack for ${paper.subject}`
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card w-full max-w-lg overflow-hidden"
        >
          {/* Download confirmation bar */}
          <div className="bg-green-500/10 border-b border-green-500/20 px-5 py-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            <span className="text-sm text-green-300">
              Your free download has started! Check your downloads folder.
            </span>
            <button onClick={onClose} className="ml-auto text-gray-400 hover:text-white flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Promo content */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-violet/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-neon-cyan" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-lg leading-tight">
                  Get the Complete Short Note &amp; Target Paper Pack
                </h3>
                <p className="text-sm text-neon-cyan font-medium">for {paper.subject}</p>
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-5">
              Boost your exam prep with our premium Short Note Pack — everything you need
              to score high in one downloadable bundle.
            </p>

            {/* Benefits */}
            <div className="space-y-2.5 mb-6">
              {PROMO_BENEFITS.map((b) => (
                <div
                  key={b.text}
                  className="flex items-center gap-3 bg-ink-600/40 rounded-xl px-4 py-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center flex-shrink-0">
                    <b.icon className="w-4 h-4 text-neon-cyan" />
                  </div>
                  <span className="text-sm text-gray-200">{b.text}</span>
                  <Check className="w-4 h-4 text-green-400 ml-auto flex-shrink-0" />
                </div>
              ))}
            </div>

            {/* Price + CTA */}
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-sm text-gray-400">Complete Pack Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-gray-500 line-through">Rs. 990</span>
                <span className="text-2xl font-bold gradient-text font-display">
                  Rs. {paper.shortNotePrice}
                </span>
              </div>
            </div>

            <a
              href={buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-4 rounded-xl hover:bg-[#1eb558] transition-all hover:scale-[1.02] shadow-lg shadow-green-500/20"
            >
              <ShoppingBag className="w-5 h-5" />
              Buy Complete Pack via WhatsApp
            </a>

            <button
              onClick={onClose}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-300 mt-3 transition-colors"
            >
              No thanks, I'll stick with the free paper
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
