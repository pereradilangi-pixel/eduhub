import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronDown, ChevronUp, Settings2, X, Plus, Trash2 } from 'lucide-react';
import { useSiteConfig, type ExamDate } from '@/context/SiteConfigContext';

function calcCountdown(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, past: false };
}

export function ExamCountdown() {
  const { exams, updateExam, addExam, removeExam } = useSiteConfig();
  const [expanded, setExpanded] = useState(true);
  const [showConfig, setShowConfig] = useState(false);

  return (
    <div className="bg-ink-800/80 dark:bg-ink-800/80 light:bg-gray-50/80 backdrop-blur-md border-b border-white/5 dark:border-white/5 light:border-gray-200 transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          <button onClick={() => setExpanded((p) => !p)} className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neon-cyan" />
            <span className="text-xs font-semibold text-gray-300 dark:text-gray-300 light:text-gray-700 uppercase tracking-wide">
              Exam Countdown
            </span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowConfig(true)} className="p-1 rounded-lg text-gray-500 hover:text-neon-cyan transition-colors" title="Edit exam dates">
              <Settings2 className="w-3.5 h-3.5" />
            </button>
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="flex flex-wrap gap-4 pb-3 pt-1">
                {exams.map((exam) => {
                  const cd = calcCountdown(new Date(exam.date));
                  const parts = [
                    { label: 'Days', value: cd.days },
                    { label: 'Hrs', value: cd.hours },
                    { label: 'Min', value: cd.minutes },
                    { label: 'Sec', value: cd.seconds },
                  ];
                  return (
                    <div key={exam.name} className="flex items-center gap-2 bg-ink-700/40 dark:bg-ink-700/40 light:bg-gray-100 rounded-lg px-3 py-1.5">
                      <span className="text-xs font-semibold" style={{ color: exam.color }}>{exam.name}</span>
                      <div className="flex gap-1.5">
                        {parts.map((p) => (
                          <div key={p.label} className="text-center">
                            <span className="text-sm font-bold font-mono text-white dark:text-white light:text-gray-900 tabular-nums" style={{ minWidth: '2ch', display: 'inline-block' }}>
                              {String(p.value).padStart(2, '0')}
                            </span>
                            <span className="text-[9px] text-gray-500 uppercase block -mt-0.5">{p.label}</span>
                          </div>
                        ))}
                      </div>
                      {cd.past && <Clock className="w-3 h-3 text-gray-500" />}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showConfig && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfig(false)} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card p-6 w-full max-w-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-white dark:text-white light:text-gray-900 flex items-center gap-2"><Settings2 className="w-5 h-5 text-neon-cyan" /> Edit Exam Dates</h3>
                <button onClick={() => setShowConfig(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                {exams.map((exam, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">Exam Name</label>
                      <input type="text" value={exam.name} onChange={(e) => updateExam(i, { name: e.target.value })} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">Target Date</label>
                      <input type="date" value={exam.date.substring(0, 10)} onChange={(e) => updateExam(i, { date: `${e.target.value}T08:30:00+05:30` })} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Color</label>
                      <input type="color" value={exam.color} onChange={(e) => updateExam(i, { color: e.target.value })} className="w-10 h-9 rounded-lg border border-white/10 dark:border-white/10 light:border-gray-200 bg-transparent cursor-pointer" />
                    </div>
                    <button onClick={() => removeExam(i)} className="p-2 rounded-lg text-gray-500 hover:text-red-400 transition-colors mb-0.5"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => addExam({ name: 'New Exam', date: new Date(Date.now() + 86400000 * 30).toISOString().substring(0, 10) + 'T08:30:00+05:30', color: '#22d3ee' })} className="text-xs text-neon-cyan hover:text-white transition-colors flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Exam</button>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowConfig(false)} className="btn-primary flex-1 text-sm">Done</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
