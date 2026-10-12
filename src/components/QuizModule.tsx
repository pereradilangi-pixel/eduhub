import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, CheckCircle2, XCircle, RotateCcw, Plus, Trash2, Edit2,
  X, Award, ChevronRight, Lightbulb, Heart,
} from 'lucide-react';
import { useAdmin, EditableText } from '@/context/AdminContext';
import type { QuizSet, QuizQuestion } from '@/data/mockData';

/* ---------- Quiz Player (Student) ---------- */

interface PlayerQuestion extends QuizQuestion {
  motivationalNote?: string;
}

function QuizPlayer({ set, onClose }: { set: QuizSet & { questions: PlayerQuestion[] }; onClose: () => void }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = set.questions[current];
  const isCorrect = selected === question.correctIndex;

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === question.correctIndex) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= set.questions.length) {
      setFinished(true);
    } else {
      setCurrent((p) => p + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const handleRestart = () => {
    setCurrent(0); setSelected(null); setAnswered(false); setScore(0); setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / set.questions.length) * 100);
    const messages = pct >= 80 ? "Outstanding! You're mastering this topic!" : pct >= 60 ? "Great work! Keep practicing and you'll ace the exam!" : pct >= 40 ? "Good effort! Review the explanations and try again — you're improving!" : "Every expert was once a beginner. Review the notes and try again — you've got this!";
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-neon-gradient flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-ink-900" />
        </div>
        <h3 className="font-display text-2xl font-bold text-white dark:text-white light:text-gray-900 mb-2">Quiz Complete!</h3>
        <p className="text-lg text-gray-300 dark:text-gray-300 light:text-gray-600 mb-1">You scored <span className="font-bold text-neon-cyan">{score}</span> out of {set.questions.length}</p>
        <p className="text-3xl font-bold gradient-text font-display mb-2">{pct}%</p>
        <p className="text-sm text-neon-cyan mb-6 flex items-center justify-center gap-1.5"><Heart className="w-4 h-4" /> {messages}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={handleRestart} className="btn-primary flex items-center gap-2 text-sm"><RotateCcw className="w-4 h-4" /> Try Again</button>
          <button onClick={onClose} className="btn-ghost text-sm">Back to Quizzes</button>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-400">Question {current + 1} of {set.questions.length}</span>
        <span className="text-xs font-mono text-neon-cyan">Score: {score}</span>
      </div>
      <div className="h-1.5 bg-ink-600/50 dark:bg-ink-600/50 light:bg-gray-200 rounded-full mb-6 overflow-hidden">
        <motion.div className="h-full bg-neon-gradient rounded-full" animate={{ width: `${((current + (answered ? 1 : 0)) / set.questions.length) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>

      <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-5">{question.question}</h3>

      <div className="space-y-2.5 mb-6">
        {question.options.map((opt, idx) => {
          const sel = selected === idx;
          const correct = idx === question.correctIndex;
          let stateClass = 'border-white/10 dark:border-white/10 light:border-gray-200 bg-ink-600/30 dark:bg-ink-600/30 light:bg-white';
          if (answered) {
            if (correct) stateClass = 'border-green-400/40 bg-green-400/10';
            else if (sel) stateClass = 'border-red-400/40 bg-red-400/10';
            else stateClass = 'border-white/5 opacity-50 dark:border-white/5 light:border-gray-100';
          } else if (sel) stateClass = 'border-neon-cyan/40 bg-neon-cyan/10';
          return (
            <button key={idx} onClick={() => handleSelect(idx)} disabled={answered} className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3 ${stateClass} ${!answered && 'hover:scale-[1.01] cursor-pointer'}`}>
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${answered && correct ? 'bg-green-400/20 text-green-400' : answered && sel ? 'bg-red-400/20 text-red-400' : 'bg-ink-500/50 text-gray-400 dark:bg-ink-500/50 light:bg-gray-100 light:text-gray-500'}`}>{String.fromCharCode(65 + idx)}</span>
              <span className="text-sm text-gray-200 dark:text-gray-200 light:text-gray-700 flex-1">{opt}</span>
              {answered && correct && <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />}
              {answered && sel && !correct && <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Feedback after answering */}
      <AnimatePresence>
        {answered && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden mb-4 space-y-3">
            {/* Explanation */}
            <div className={`rounded-xl p-4 border ${isCorrect ? 'border-green-400/20 bg-green-400/5' : 'border-amber-400/20 bg-amber-400/5'}`}>
              <div className="flex items-start gap-2">
                <Lightbulb className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isCorrect ? 'text-green-400' : 'text-amber-400'}`} />
                <div>
                  <p className={`text-xs font-semibold mb-1 ${isCorrect ? 'text-green-400' : 'text-amber-400'}`}>{isCorrect ? 'Correct!' : 'Not quite right'}</p>
                  <p className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-600 leading-relaxed">{question.explanation}</p>
                </div>
              </div>
            </div>

            {/* Motivational note for wrong answers */}
            {!isCorrect && question.motivationalNote && (
              <div className="rounded-xl p-4 border border-neon-pink/20 bg-neon-pink/5">
                <div className="flex items-start gap-2">
                  <Heart className="w-4 h-4 flex-shrink-0 mt-0.5 text-neon-pink" />
                  <div>
                    <p className="text-xs font-semibold mb-1 text-neon-pink">Don't give up!</p>
                    <p className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-600 leading-relaxed">{question.motivationalNote}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {answered && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleNext} className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
          {current + 1 >= set.questions.length ? 'See Results' : 'Next Question'}
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  );
}

/* ---------- Quiz Editor (Admin) ---------- */

function QuizEditor({ set, onSave, onClose }: { set: QuizSet | null; onSave: (set: QuizSet) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<QuizSet>(() => set ?? {
    id: `quiz_${Date.now()}`, title: '', subject: 'Science',
    questions: [{ id: `q_${Date.now()}`, question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }],
  });

  const updateQuestion = (qi: number, patch: Partial<QuizQuestion>) => {
    setDraft((d) => ({ ...d, questions: d.questions.map((q, i) => (i === qi ? { ...q, ...patch } : q)) }));
  };
  const updateOption = (qi: number, oi: number, val: string) => {
    setDraft((d) => ({ ...d, questions: d.questions.map((q, i) => (i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? val : o)) } : q)) }));
  };
  const addQuestion = () => {
    setDraft((d) => ({ ...d, questions: [...d.questions, { id: `q_${Date.now()}`, question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }] }));
  };
  const removeQuestion = (qi: number) => {
    setDraft((d) => ({ ...d, questions: d.questions.filter((_, i) => i !== qi) }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card p-6 w-full max-w-2xl space-y-4 my-8">
        <div className="flex items-center justify-between sticky top-0 bg-inherit z-10 pb-2">
          <h3 className="font-display text-lg font-bold text-white dark:text-white light:text-gray-900 flex items-center gap-2"><Edit2 className="w-5 h-5 text-neon-cyan" /> {set ? 'Edit Quiz' : 'New Quiz'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Quiz Title</label>
            <input type="text" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40 transition-all" placeholder="e.g. O/L Biology Quiz" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Subject</label>
            <input type="text" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40 transition-all" placeholder="e.g. Biology" />
          </div>
        </div>
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {draft.questions.map((q, qi) => (
            <div key={q.id} className="bg-ink-700/40 dark:bg-ink-700/40 light:bg-gray-50 rounded-lg p-3 border border-white/5 dark:border-white/5 light:border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400">Question {qi + 1}</span>
                {draft.questions.length > 1 && <button onClick={() => removeQuestion(qi)} className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
              <input type="text" value={q.question} onChange={(e) => updateQuestion(qi, { question: e.target.value })} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40 transition-all" placeholder="Question text..." />
              <div className="space-y-1.5">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <button onClick={() => updateQuestion(qi, { correctIndex: oi })} className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-all ${q.correctIndex === oi ? 'border-green-400 bg-green-400/20' : 'border-gray-500 hover:border-gray-400'}`} title="Mark as correct" />
                    <input type="text" value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} className="flex-1 bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-1.5 text-xs text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40 transition-all" placeholder={`Option ${String.fromCharCode(65 + oi)}`} />
                  </div>
                ))}
              </div>
              <input type="text" value={q.explanation} onChange={(e) => updateQuestion(qi, { explanation: e.target.value })} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-300 dark:text-gray-300 light:text-gray-600 outline-none focus:border-neon-cyan/40 transition-all" placeholder="Explanation (shown after answering)..." />
            </div>
          ))}
        </div>
        <button onClick={addQuestion} className="text-xs text-neon-cyan hover:text-white transition-colors flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Question</button>
        <div className="flex gap-3 pt-2">
          <button onClick={() => onSave(draft)} disabled={!draft.title.trim() || draft.questions.some((q) => !q.question.trim())} className="btn-primary flex-1 text-sm disabled:opacity-50">Save Quiz</button>
          <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- Main QuizModule ---------- */

export function QuizModule() {
  const { editMode, quizSets, addQuizSet, updateQuizSet, deleteQuizSet } = useAdmin();
  const [activeSet, setActiveSet] = useState<(QuizSet & { questions: PlayerQuestion[] }) | null>(null);
  const [editingSet, setEditingSet] = useState<QuizSet | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleSave = useCallback((set: QuizSet) => {
    if (quizSets.some((s) => s.id === set.id)) updateQuizSet(set.id, set);
    else addQuizSet(set);
    setShowEditor(false); setEditingSet(null);
  }, [quizSets, addQuizSet, updateQuizSet]);

  if (activeSet) {
    return (
      <section id="quiz" className="relative py-20 bg-ink-800/50 dark:bg-ink-800/50 light:bg-gray-50 transition-colors">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neon-violet/10 flex items-center justify-center"><Brain className="w-5 h-5 text-neon-violet" /></div>
                <div>
                  <h3 className="font-display font-bold text-white dark:text-white light:text-gray-900">{activeSet.title}</h3>
                  <p className="text-xs text-gray-400">{activeSet.subject} · {activeSet.questions.length} questions</p>
                </div>
              </div>
              <button onClick={() => setActiveSet(null)} className="btn-ghost text-xs px-3 py-2">Exit</button>
            </div>
            <QuizPlayer set={activeSet} onClose={() => setActiveSet(null)} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="quiz" className="relative py-20 bg-ink-800/50 dark:bg-ink-800/50 light:bg-gray-50 transition-colors">
      <div className="absolute inset-0 bg-grid-pattern bg-[size:60px_60px] opacity-20" />
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-neon-violet/5 rounded-full blur-[100px]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-10">
          <span className="section-tag mb-4"><Brain className="w-3 h-3" /> Quiz Zone</span>
          <EditableText field="quizTitle" as="h2" className="font-display text-3xl sm:text-4xl font-bold text-white dark:text-white light:text-gray-900" />
          <EditableText field="quizSubtitle" as="p" className="mt-3 text-gray-400 dark:text-gray-400 light:text-gray-600 max-w-2xl mx-auto" />
        </motion.div>

        {/* Quiz Library */}
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Quiz Library</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizSets.map((set, i) => (
            <motion.div key={set.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="glass-card p-5 group hover:border-neon-violet/15 transition-all relative">
              {editMode && (
                <div className="absolute top-3 right-3 flex gap-1">
                  <button onClick={() => { setEditingSet(set); setShowEditor(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-neon-cyan hover:bg-white/5 transition-all" title="Edit quiz"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteQuizSet(set.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-all" title="Delete quiz"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              )}
              <div className="w-12 h-12 rounded-xl bg-neon-violet/10 flex items-center justify-center mb-4"><Brain className="w-6 h-6 text-neon-violet" /></div>
              <h3 className="font-semibold text-white dark:text-white light:text-gray-900 text-base mb-1">{set.title}</h3>
              <span className="text-xs text-neon-cyan mb-3 inline-block">{set.subject}</span>
              <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 mb-4">{set.questions.length} question{set.questions.length !== 1 ? 's' : ''}</p>
              <button onClick={() => setActiveSet(set as QuizSet & { questions: PlayerQuestion[] })} className="btn-primary w-full text-sm flex items-center justify-center gap-2">Start Quiz <ChevronRight className="w-4 h-4" /></button>
            </motion.div>
          ))}
          {editMode && (
            <motion.button initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} onClick={() => { setEditingSet(null); setShowEditor(true); }} className="glass-card p-5 border-dashed border-2 border-neon-cyan/20 flex flex-col items-center justify-center gap-3 min-h-[200px] hover:bg-neon-cyan/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center"><Plus className="w-6 h-6 text-neon-cyan" /></div>
              <span className="text-sm text-gray-400">Add New Quiz</span>
            </motion.button>
          )}
        </div>
        {quizSets.length === 0 && !editMode && (
          <div className="text-center py-16"><Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" /><p className="text-gray-400">No quizzes in the library yet. Switch to Edit mode to add one!</p></div>
        )}
      </div>
      <AnimatePresence>
        {showEditor && <QuizEditor set={editingSet} onSave={handleSave} onClose={() => { setShowEditor(false); setEditingSet(null); }} />}
      </AnimatePresence>
    </section>
  );
}
