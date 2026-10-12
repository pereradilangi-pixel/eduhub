import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarClock, Loader2, Sparkles, Calendar, Target, Clock, AlertCircle, Lock,
} from 'lucide-react';
import { generateTimetable, getActiveApiKey, type StudyTimetable } from '@/lib/gemini';
import { useSiteConfig, FEATURE_KEYS } from '@/context/SiteConfigContext';
import { UnlockModal } from '@/components/UnlockModal';

export function AIStudyPlanner() {
  const { isFeatureUnlocked, incrementUsage, remainingUses, freeLimit } = useSiteConfig();
  const unlocked = isFeatureUnlocked(FEATURE_KEYS.studyPlanner);
  const remaining = remainingUses(FEATURE_KEYS.studyPlanner);
  const [showUnlock, setShowUnlock] = useState(false);
  const [examDate, setExamDate] = useState('');
  const [subjects, setSubjects] = useState('');
  const [weakSubjects, setWeakSubjects] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('3');
  const [result, setResult] = useState<StudyTimetable | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!examDate || loading) return;
    if (!unlocked && remaining <= 0) {
      setShowUnlock(true);
      return;
    }
    const apiKey = getActiveApiKey();
    if (!apiKey) {
      setError('Please add your Gemini API key in the AI Tutor settings to generate a timetable.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const subjectList = subjects.split(',').map((s) => s.trim()).filter(Boolean);
      const weakList = weakSubjects.split(',').map((s) => s.trim()).filter(Boolean);
      const timetable = await generateTimetable(examDate, subjectList, weakList, hoursPerDay, apiKey);
      setResult(timetable);
      incrementUsage(FEATURE_KEYS.studyPlanner);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate timetable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError('');
  };

  if (result) {
    return (
      <div className="glass-card p-5 lg:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-neon-violet/10 flex items-center justify-center">
            <CalendarClock className="w-5 h-5 text-neon-violet" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-white dark:text-white light:text-gray-900">Your Study Timetable</h3>
            <p className="text-xs text-gray-400">Personalized AI-generated plan</p>
          </div>
          <button onClick={handleReset} className="btn-ghost text-xs px-3 py-2">New Plan</button>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <p className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-600 leading-relaxed">{result.overview}</p>

          <div className="space-y-3">
            {result.weeklySchedule.map((day, di) => (
              <div key={di} className="bg-ink-700/30 dark:bg-ink-700/30 light:bg-gray-50 rounded-xl p-3 border border-white/5 dark:border-white/5 light:border-gray-200">
                <h4 className="text-sm font-semibold text-neon-cyan mb-2">{day.day}</h4>
                <div className="space-y-1.5">
                  {day.sessions.map((session, si) => (
                    <div key={si} className="flex items-start gap-3 text-xs">
                      <span className="text-gray-500 font-mono flex-shrink-0 w-32">{session.time}</span>
                      <div className="flex-1">
                        <span className="text-white dark:text-white light:text-gray-900 font-medium">{session.subject}</span>
                        <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 block">{session.activity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-neon-gradient/10 border border-neon-violet/20 rounded-xl p-4">
            <p className="text-sm text-gray-200 dark:text-gray-200 light:text-gray-700 italic">{result.motivationalNote}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 lg:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-neon-violet/10 flex items-center justify-center">
          <CalendarClock className="w-5 h-5 text-neon-violet" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-white dark:text-white light:text-gray-900">AI Study Timetable Planner</h3>
          <p className="text-xs text-gray-400">Get a personalized study plan in seconds</p>
        </div>
        {!unlocked && (
          <span className="text-[10px] text-gray-400 bg-ink-700/50 rounded-full px-2 py-1 flex items-center gap-1 flex-shrink-0">
            {remaining > 0 ? `${remaining}/${freeLimit} free` : <span className="flex items-center gap-1 text-amber-400"><Lock className="w-2.5 h-2.5" /> Locked</span>}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Exam Date</label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-xl px-4 py-2.5 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-violet/40 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> Subjects (comma-separated)</label>
          <input
            type="text"
            value={subjects}
            onChange={(e) => setSubjects(e.target.value)}
            placeholder="e.g. Physics, Chemistry, Biology, Maths"
            className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-xl px-4 py-2.5 text-sm text-white dark:text-white light:text-gray-900 placeholder:text-gray-500 outline-none focus:border-neon-violet/40 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Weak Subjects (comma-separated)</label>
          <input
            type="text"
            value={weakSubjects}
            onChange={(e) => setWeakSubjects(e.target.value)}
            placeholder="e.g. Physics, Chemistry"
            className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-xl px-4 py-2.5 text-sm text-white dark:text-white light:text-gray-900 placeholder:text-gray-500 outline-none focus:border-neon-violet/40 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Study Hours Per Day</label>
          <select
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(e.target.value)}
            className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-xl px-4 py-2.5 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-violet/40 transition-all"
          >
            <option value="2" className="bg-ink-700 dark:bg-ink-700 light:bg-white">2 hours</option>
            <option value="3" className="bg-ink-700 dark:bg-ink-700 light:bg-white">3 hours</option>
            <option value="4" className="bg-ink-700 dark:bg-ink-700 light:bg-white">4 hours</option>
            <option value="5" className="bg-ink-700 dark:bg-ink-700 light:bg-white">5 hours</option>
            <option value="6" className="bg-ink-700 dark:bg-ink-700 light:bg-white">6 hours</option>
            <option value="8" className="bg-ink-700 dark:bg-ink-700 light:bg-white">8 hours</option>
          </select>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !examDate}
          className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating Plan...</> : <><Sparkles className="w-4 h-4" /> Generate My Timetable</>}
        </button>
      </div>

      <UnlockModal open={showUnlock} onClose={() => setShowUnlock(false)} featureName="Study Planner" />
    </div>
  );
}
