import { motion } from 'framer-motion';

export function AdBanner({ slot = 'header', className = '' }: { slot?: string; className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center bg-ink-700/40 border border-dashed border-white/10 rounded-xl overflow-hidden ${className}`}
      data-adsense-slot={slot}
    >
      <div className="absolute inset-0 shimmer-bg animate-shimmer pointer-events-none" />
      <span className="text-xs text-gray-500 font-mono uppercase tracking-widest py-3 px-4">
        Ad Space ({slot})
      </span>
    </div>
  );
}

export function AdSidebar() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="sticky top-24"
    >
      <div className="glass-card p-6 space-y-4">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Sponsored</h4>
        <AdBanner slot="sidebar" className="h-64" />
      </div>
    </motion.div>
  );
}
