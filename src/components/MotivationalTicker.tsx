import { useState, useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { MOTIVATIONAL_QUOTES } from '@/data/mockData';

export function MotivationalTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    setIndex(dayOfYear % MOTIVATIONAL_QUOTES.length);
  }, []);

  const next = () => setIndex((p) => (p + 1) % MOTIVATIONAL_QUOTES.length);
  const prev = () => setIndex((p) => (p - 1 + MOTIVATIONAL_QUOTES.length) % MOTIVATIONAL_QUOTES.length);

  return (
    <div className="bg-neon-gradient text-ink-900 py-1.5 px-4 flex items-center justify-center gap-3 relative z-40">
      <Sparkles className="w-3.5 h-3.5 flex-shrink-0 hidden sm:block" />
      <button onClick={prev} className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <p className="text-xs sm:text-sm font-medium text-center truncate transition-all">
        {MOTIVATIONAL_QUOTES[index]}
      </p>
      <button onClick={next} className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
