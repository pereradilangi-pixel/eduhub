import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Loader2, Sparkles, RotateCw, ChevronLeft, ChevronRight,
  FileText, Lock,
} from 'lucide-react';
import { generateFlashcards, getActiveApiKey, type AIFlashcard } from '@/lib/gemini';
import { useSiteConfig, FEATURE_KEYS } from '@/context/SiteConfigContext';
import { UnlockModal } from '@/components/UnlockModal';

export function AIFlashcards() {
  const { isFeatureUnlocked, incrementUsage, remainingUses, freeLimit } = useSiteConfig();
  const unlocked = isFeatureUnlocked(FEATURE_KEYS.flashcards);
  const remaining = remainingUses(FEATURE_KEYS.flashcards);
  const [showUnlock, setShowUnlock] = useState(false);
  const [notes, setNotes] = useState('');
  const [cards, setCards] = useState<AIFlashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!notes.trim() || loading) return;
    if (!unlocked && remaining <= 0) {
      setShowUnlock(true);
      return;
    }
    const apiKey = getActiveApiKey();
    if (!apiKey) {
      setError('Please add your Gemini API key in the AI Tutor settings to generate flashcards.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await generateFlashcards(notes.trim(), apiKey);
      if (result && result.length > 0) {
        setCards(result);
        setCurrentIndex(0);
        setFlipped(false);
        setHasGenerated(true);
        incrementUsage(FEATURE_KEYS.flashcards);
      } else {
        setError('No flashcards were generated. Try adding more detail to your notes.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate flashcards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIndex((p) => (p + 1) % cards.length), 150);
  };
  const prevCard = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIndex((p) => (p - 1 + cards.length) % cards.length), 150);
  };

  const card = cards[currentIndex];

  return (
    <div className="glass-card p-5 lg:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-neon-pink/10 flex items-center justify-center">
          <Layers className="w-5 h-5 text-neon-pink" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-white dark:text-white light:text-gray-900">AI Flashcard Generator</h3>
          <p className="text-xs text-gray-400">Paste your study notes and instantly get flip cards</p>
        </div>
        {!unlocked && (
          <span className="text-[10px] text-gray-400 bg-ink-700/50 rounded-full px-2 py-1 flex items-center gap-1 flex-shrink-0">
            {remaining > 0 ? `${remaining}/${freeLimit} free` : <span className="flex items-center gap-1 text-amber-400"><Lock className="w-2.5 h-2.5" /> Locked</span>}
          </span>
        )}
      </div>

      {!hasGenerated ? (
        <div className="space-y-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your study notes here... e.g. 'Photosynthesis is the process by which plants make food. The equation is 6CO2 + 6H2O -> C6H12O6 + 6O2. Chlorophyll absorbs light...'"
            rows={5}
            className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-xl px-4 py-3 text-sm text-white dark:text-white light:text-gray-900 placeholder:text-gray-500 outline-none focus:border-neon-pink/40 transition-all resize-none"
          />
          {error && (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
              <span>{error}</span>
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={loading || !notes.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating Flashcards...</> : <><Sparkles className="w-4 h-4" /> Generate Flashcards</>}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative" style={{ perspective: '1000px' }}>
            <motion.div
              key={currentIndex}
              className="relative w-full min-h-[200px] cursor-pointer"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setFlipped((p) => !p)}
            >
              <div
                className="absolute inset-0 glass-card p-6 flex flex-col items-center justify-center text-center"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className="text-xs text-neon-pink mb-2 uppercase tracking-wider">Question {currentIndex + 1}</span>
                <p className="text-base font-medium text-white dark:text-white light:text-gray-900 leading-relaxed">{card?.front}</p>
                <span className="text-xs text-gray-500 mt-4">Click to flip</span>
              </div>
              <div
                className="absolute inset-0 glass-card p-6 flex flex-col items-center justify-center text-center bg-neon-pink/5"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <span className="text-xs text-neon-cyan mb-2 uppercase tracking-wider">Answer</span>
                <p className="text-sm text-gray-200 dark:text-gray-200 light:text-gray-700 leading-relaxed">{card?.back}</p>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={prevCard} disabled={cards.length <= 1} className="p-2 rounded-lg border border-white/10 dark:border-white/10 light:border-gray-200 text-gray-400 hover:text-white disabled:opacity-30 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs text-gray-400 font-mono">{currentIndex + 1} / {cards.length}</span>
            <button onClick={nextCard} disabled={cards.length <= 1} className="p-2 rounded-lg border border-white/10 dark:border-white/10 light:border-gray-200 text-gray-400 hover:text-white disabled:opacity-30 transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setHasGenerated(false); setCards([]); setNotes(''); }}
              className="btn-ghost text-xs flex-1 flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> New Notes
            </button>
            <button
              onClick={() => { setFlipped(false); setCurrentIndex(0); }}
              className="btn-ghost text-xs flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" /> Restart
            </button>
          </div>
        </div>
      )}

      <UnlockModal open={showUnlock} onClose={() => setShowUnlock(false)} featureName="AI Flashcards" />
    </div>
  );
}
