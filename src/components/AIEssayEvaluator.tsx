import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PenLine, Loader2, Sparkles, Award, TrendingUp, AlertCircle, FileText, Lock,
} from 'lucide-react';
import { evaluateEssay, getActiveApiKey, type EssayEvaluation } from '@/lib/gemini';
import { useSiteConfig, FEATURE_KEYS } from '@/context/SiteConfigContext';
import { UnlockModal } from '@/components/UnlockModal';

export function AIEssayEvaluator() {
  const { isFeatureUnlocked, incrementUsage, remainingUses, freeLimit } = useSiteConfig();
  const unlocked = isFeatureUnlocked(FEATURE_KEYS.essayEvaluator);
  const remaining = remainingUses(FEATURE_KEYS.essayEvaluator);
  const [showUnlock, setShowUnlock] = useState(false);
  const [essay, setEssay] = useState('');
  const [subject, setSubject] = useState('');
  const [result, setResult] = useState<EssayEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEvaluate = async () => {
    if (!essay.trim() || loading) return;
    if (!unlocked && remaining <= 0) {
      setShowUnlock(true);
      return;
    }
    const apiKey = getActiveApiKey();
    if (!apiKey) {
      setError('Please add your Gemini API key in the AI Tutor settings to use the essay evaluator.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const evalResult = await evaluateEssay(essay.trim(), subject.trim() || 'General', apiKey);
      setResult(evalResult);
      incrementUsage(FEATURE_KEYS.essayEvaluator);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to evaluate essay. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEssay('');
    setSubject('');
    setResult(null);
    setError('');
  };

  return (
    <div className="glass-card p-5 lg:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
          <PenLine className="w-5 h-5 text-neon-cyan" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-white dark:text-white light:text-gray-900">AI Essay Evaluator</h3>
          <p className="text-xs text-gray-400">Submit your answer and get feedback + grade estimate</p>
        </div>
        {!unlocked && (
          <span className="text-[10px] text-gray-400 bg-ink-700/50 rounded-full px-2 py-1 flex items-center gap-1 flex-shrink-0">
            {remaining > 0 ? `${remaining}/${freeLimit} free` : <span className="flex items-center gap-1 text-amber-400"><Lock className="w-2.5 h-2.5" /> Locked</span>}
          </span>
        )}
      </div>

      {!result ? (
        <div className="space-y-3">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (e.g. O/L Science, A/L Economics)"
            className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-xl px-4 py-2.5 text-sm text-white dark:text-white light:text-gray-900 placeholder:text-gray-500 outline-none focus:border-neon-cyan/40 transition-all"
          />
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Type or paste your essay or answer here..."
            rows={6}
            className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-xl px-4 py-3 text-sm text-white dark:text-white light:text-gray-900 placeholder:text-gray-500 outline-none focus:border-neon-cyan/40 transition-all resize-none"
          />
          {error && (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
              <span>{error}</span>
            </div>
          )}
          <button
            onClick={handleEvaluate}
            disabled={loading || !essay.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</> : <><Sparkles className="w-4 h-4" /> Evaluate My Answer</>}
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4 bg-ink-700/40 dark:bg-ink-700/40 light:bg-gray-50 rounded-xl p-4">
            <div className="w-14 h-14 rounded-xl bg-neon-gradient flex items-center justify-center flex-shrink-0">
              <Award className="w-7 h-7 text-ink-900" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white dark:text-white light:text-gray-900 font-display">{result.grade}</span>
                <span className="text-lg text-neon-cyan font-bold">{result.score}</span>
              </div>
              <p className="text-xs text-gray-400">Estimated grade and score</p>
            </div>
          </div>

          {result.strengths && result.strengths.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Strengths
              </h4>
              <ul className="space-y-1.5">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-600 flex items-start gap-2">
                    <span className="text-green-400 flex-shrink-0">+</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.improvements && result.improvements.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Areas to Improve
              </h4>
              <ul className="space-y-1.5">
                {result.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-600 flex items-start gap-2">
                    <span className="text-amber-400 flex-shrink-0">-</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-ink-700/30 dark:bg-ink-700/30 light:bg-gray-50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-neon-cyan uppercase tracking-wider mb-2">Detailed Feedback</h4>
            <p className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-600 leading-relaxed">{result.detailedFeedback}</p>
          </div>

          <div className="bg-neon-gradient/10 border border-neon-cyan/20 rounded-xl p-4">
            <p className="text-sm text-gray-200 dark:text-gray-200 light:text-gray-700 italic">{result.motivationalNote}</p>
          </div>

          <button onClick={handleReset} className="btn-ghost text-xs w-full flex items-center justify-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Evaluate Another Answer
          </button>
        </motion.div>
      )}

      <UnlockModal open={showUnlock} onClose={() => setShowUnlock(false)} featureName="Essay Evaluator" />
    </div>
  );
}
