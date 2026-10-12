import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCheck, Upload, Loader2, Clock, CheckCircle2, XCircle, FileText, MessageSquare, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/context/AdminContext';
import { useSiteConfig, FEATURE_KEYS } from '@/context/SiteConfigContext';

interface PaperSubmission {
  id: string;
  student_name: string;
  contact: string;
  subject: string;
  file_url: string;
  status: string;
  feedback: string;
  marked_file_url: string;
  created_at: string;
}

const STATUS_META: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: 'Pending Review', icon: Clock, color: 'text-amber-400' },
  grading: { label: 'Being Graded', icon: Loader2, color: 'text-neon-cyan' },
  completed: { label: 'Marked & Returned', icon: CheckCircle2, color: 'text-green-400' },
};

export function PaperMarkingHub() {
  const { editMode } = useAdmin();
  const { isFeatureUnlocked, incrementUsage, remainingUses, freeLimit } = useSiteConfig();
  const unlocked = isFeatureUnlocked(FEATURE_KEYS.paperMarking);
  const remaining = remainingUses(FEATURE_KEYS.paperMarking);
  const [submissions, setSubmissions] = useState<PaperSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ student_name: '', contact: '', subject: '', file_url: '' });
  const [submitted, setSubmitted] = useState(false);
  const [grading, setGrading] = useState<PaperSubmission | null>(null);
  const [gradeForm, setGradeForm] = useState({ feedback: '', marked_file_url: '', status: 'completed' });

  const loadSubmissions = useCallback(async () => {
    const { data } = await supabase.from('paper_submissions').select('*').order('created_at', { ascending: false });
    setSubmissions(data || []);
  }, []);

  useEffect(() => { if (editMode) loadSubmissions(); }, [editMode, loadSubmissions]);

  const handleSubmit = async () => {
    if (!form.student_name.trim() || !form.contact.trim() || !form.subject.trim() || !form.file_url.trim()) return;
    setLoading(true);
    await supabase.from('paper_submissions').insert({
      student_name: form.student_name,
      contact: form.contact,
      subject: form.subject,
      file_url: form.file_url,
      status: 'pending',
    });
    incrementUsage(FEATURE_KEYS.paperMarking);
    setLoading(false);
    setSubmitted(true);
    setForm({ student_name: '', contact: '', subject: '', file_url: '' });
    if (editMode) loadSubmissions();
  };

  const handleGrade = async () => {
    if (!grading) return;
    await supabase.from('paper_submissions').update({
      feedback: gradeForm.feedback,
      marked_file_url: gradeForm.marked_file_url,
      status: gradeForm.status,
      updated_at: new Date().toISOString(),
    }).eq('id', grading.id);
    setGrading(null);
    setGradeForm({ feedback: '', marked_file_url: '', status: 'completed' });
    loadSubmissions();
  };

  const locked = !unlocked && remaining <= 0;

  return (
    <section id="paper-marking" className="relative py-20 bg-ink-800/50 dark:bg-ink-800/50 light:bg-gray-50 transition-colors">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-3"><FileCheck className="w-6 h-6 text-green-400" /></div>
          <span className="section-tag mb-2"><FileCheck className="w-3 h-3" /> Expert Marking</span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white dark:text-white light:text-gray-900">Online Paper Marking Hub</h2>
          <p className="text-sm text-gray-400 mt-2 max-w-xl mx-auto">Upload a scan or photo of your written paper. Our teachers will grade it, write detailed feedback, and return the marked paper to you.</p>
        </motion.div>

        {!unlocked && (
          <div className="glass-card p-3 mb-6 text-center">
            <p className="text-xs text-gray-400">
              {remaining > 0 ? <>Free submissions remaining: <span className="font-bold text-neon-cyan">{remaining}/{freeLimit}</span></> : <span className="text-amber-400">Free limit reached — unlock to submit more papers</span>}
            </p>
          </div>
        )}

        {locked ? (
          <div className="glass-card p-8 text-center">
            <XCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <p className="text-gray-300 dark:text-gray-300 light:text-gray-600 mb-2">You've used all {freeLimit} free submissions.</p>
            <p className="text-sm text-gray-400">Unlock the Paper Marking feature for unlimited submissions, or get the Full Bundle Pass for access to everything.</p>
            <a href="#pricing" className="btn-primary inline-flex mt-4 text-sm">View Pricing Options</a>
          </div>
        ) : submitted ? (
          <div className="glass-card p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-white dark:text-white light:text-gray-900 mb-2">Paper Submitted Successfully!</h3>
            <p className="text-sm text-gray-400 mb-4">Your paper is now in the review queue. You'll receive feedback via WhatsApp or email once it's graded.</p>
            <button onClick={() => setSubmitted(false)} className="btn-ghost text-sm">Submit Another Paper</button>
          </div>
        ) : (
          <div className="glass-card p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Your Name</label>
                <input type="text" value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2.5 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">WhatsApp / Mobile Number</label>
                <input type="text" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2.5 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" placeholder="076 123 4567" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Subject</label>
              <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2.5 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" placeholder="e.g. O/L Science, A/L Physics" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Paper File URL (Google Drive, Dropbox, or direct link to your scan/photo)</label>
              <input type="text" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2.5 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" placeholder="https://drive.google.com/..." />
              <p className="text-xs text-gray-500 mt-1">Upload your paper to Google Drive or similar, then paste the share link here.</p>
            </div>
            <button onClick={handleSubmit} disabled={loading || !form.student_name.trim() || !form.contact.trim() || !form.subject.trim() || !form.file_url.trim()} className="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Submit Paper for Marking
            </button>
          </div>
        )}

        {/* Admin grading view */}
        {editMode && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Submitted Papers (Admin View)</h3>
            {submissions.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No submissions yet.</p>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub) => {
                  const meta = STATUS_META[sub.status] || STATUS_META.pending;
                  const StatusIcon = meta.icon;
                  return (
                    <div key={sub.id} className="glass-card p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-ink-700/50 flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-gray-400" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold text-white dark:text-white light:text-gray-900 truncate">{sub.student_name} — {sub.subject}</h4>
                          <span className={`text-xs flex items-center gap-1 flex-shrink-0 ${meta.color}`}><StatusIcon className="w-3 h-3" /> {meta.label}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{sub.contact}</p>
                        <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-neon-cyan flex items-center gap-1 mt-1"><Download className="w-3 h-3" /> View Submitted Paper</a>
                        {sub.feedback && <p className="text-xs text-gray-300 dark:text-gray-300 light:text-gray-600 mt-2 bg-ink-700/30 rounded p-2"><MessageSquare className="w-3 h-3 inline mr-1" /> {sub.feedback}</p>}
                        {sub.marked_file_url && <a href={sub.marked_file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-400 flex items-center gap-1 mt-1"><Download className="w-3 h-3" /> View Marked Paper</a>}
                      </div>
                      <button onClick={() => { setGrading(sub); setGradeForm({ feedback: sub.feedback, marked_file_url: sub.marked_file_url, status: 'completed' }); }} className="btn-ghost text-xs px-3 py-1.5 flex-shrink-0">Grade</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grading Modal */}
      <AnimatePresence>
        {grading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGrading(null)} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="glass-card p-6 w-full max-w-md space-y-4">
              <h3 className="font-display text-lg font-bold text-white dark:text-white light:text-gray-900">Grade Paper: {grading.student_name}</h3>
              <a href={grading.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-neon-cyan flex items-center gap-1"><Download className="w-4 h-4" /> Open Student's Paper</a>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Feedback for Student</label>
                <textarea value={gradeForm.feedback} onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })} rows={4} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" placeholder="Write detailed feedback..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Marked Paper URL</label>
                <input type="text" value={gradeForm.marked_file_url} onChange={(e) => setGradeForm({ ...gradeForm, marked_file_url: e.target.value })} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" placeholder="https://...marked-paper.pdf" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleGrade} className="btn-primary flex-1 text-sm">Save Grade & Return</button>
                <button onClick={() => setGrading(null)} className="btn-ghost text-sm">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
