import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Pencil, Trash2, Save, RotateCcw, Upload, CheckCircle2,
} from 'lucide-react';
import { useResources } from '@/context/ResourcesContext';
import { SUBJECT_ICONS, type PaperResource } from '@/data/mockData';

const STREAMS = ['O/L', 'A/L Science', 'A/L Commerce', 'A/L Arts', 'A/L Technology'] as const;
const TYPES = ['Past Paper', 'Model Paper', 'Marking Scheme', 'Revision Notes'] as const;
const ICON_NAMES = Object.keys(SUBJECT_ICONS);

const EMPTY_FORM: Omit<PaperResource, 'id' | 'downloads'> = {
  title: '', subject: '', stream: 'O/L', year: new Date().getFullYear(),
  type: 'Past Paper', fileSize: '2.0 MB', pages: 10, icon: 'FileText',
  description: '', fileUrl: '#', shortNotePrice: 490,
};

export function AdminResourceManager({ onClose }: { onClose: () => void }) {
  const { papers, addPaper, updatePaper, deletePaper, resetToDefault, lastSavedAt } = useResources();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (lastSavedAt) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [lastSavedAt]);

  const startEdit = (p: PaperResource) => {
    setEditingId(p.id);
    setForm({
      title: p.title, subject: p.subject, stream: p.stream, year: p.year,
      type: p.type, fileSize: p.fileSize, pages: p.pages, icon: p.icon,
      description: p.description, fileUrl: p.fileUrl, shortNotePrice: p.shortNotePrice,
    });
    setShowAdd(false);
  };

  const saveEdit = () => {
    if (editingId) {
      updatePaper(editingId, form);
      setEditingId(null);
      setToast('Resource updated and saved to browser');
    }
  };

  const saveAdd = () => {
    if (form.title.trim() && form.subject.trim()) {
      addPaper(form);
      setForm(EMPTY_FORM);
      setShowAdd(false);
      setToast('Resource added and saved to browser permanently');
    }
  };

  const handleDelete = (id: string) => {
    deletePaper(id);
    setToast('Resource removed and saved to browser');
  };

  const fieldClass = 'w-full bg-ink-600/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-neon-cyan/40 transition-all';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-neon-cyan" /> Manage Resources
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowAdd(true); setEditingId(null); setForm(EMPTY_FORM); }}
              className="flex items-center gap-1.5 bg-neon-cyan/10 text-neon-cyan text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-neon-cyan/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Add New
            </button>
            <button
              onClick={resetToDefault}
              className="flex items-center gap-1.5 text-gray-400 text-xs font-medium px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-all"
              title="Clear all resources"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-3">
          {/* Add/Edit form */}
          <AnimatePresence>
            {(showAdd || editingId) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-ink-600/30 border border-neon-cyan/20 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-neon-cyan">
                    {editingId ? 'Edit Resource' : 'New Resource'}
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      type="text" placeholder="Title" value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className={fieldClass}
                    />
                    <input
                      type="text" placeholder="Subject" value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className={fieldClass}
                    />
                    <select value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value as PaperResource['stream'] })} className={fieldClass}>
                      {STREAMS.map((s) => <option key={s} value={s} className="bg-ink-700">{s}</option>)}
                    </select>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PaperResource['type'] })} className={fieldClass}>
                      {TYPES.map((t) => <option key={t} value={t} className="bg-ink-700">{t}</option>)}
                    </select>
                    <input
                      type="number" placeholder="Year" value={form.year}
                      onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 0 })}
                      className={fieldClass}
                    />
                    <input
                      type="text" placeholder="File Size (e.g. 2.4 MB)" value={form.fileSize}
                      onChange={(e) => setForm({ ...form, fileSize: e.target.value })}
                      className={fieldClass}
                    />
                    <input
                      type="number" placeholder="Pages" value={form.pages}
                      onChange={(e) => setForm({ ...form, pages: parseInt(e.target.value) || 0 })}
                      className={fieldClass}
                    />
                    <input
                      type="number" placeholder="Short Note Price (Rs.)" value={form.shortNotePrice}
                      onChange={(e) => setForm({ ...form, shortNotePrice: parseInt(e.target.value) || 0 })}
                      className={fieldClass}
                    />
                    <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={fieldClass}>
                      {ICON_NAMES.map((ic) => <option key={ic} value={ic} className="bg-ink-700">{ic}</option>)}
                    </select>
                    <input
                      type="text" placeholder="PDF Link URL" value={form.fileUrl}
                      onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                      className={fieldClass}
                    />
                  </div>
                  <textarea
                    placeholder="Description" value={form.description} rows={2}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={`${fieldClass} resize-none`}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={editingId ? saveEdit : saveAdd}
                      className="flex items-center gap-1.5 bg-neon-gradient text-ink-900 font-semibold text-sm px-4 py-2 rounded-lg hover:scale-105 transition-all"
                    >
                      <Save className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Add Resource'}
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setShowAdd(false); }}
                      className="btn-ghost text-sm px-4 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resource list */}
          {papers.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 bg-ink-700/40 rounded-xl px-4 py-3 hover:bg-ink-700/60 transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{p.title}</div>
                <div className="text-xs text-gray-500">
                  {p.subject} · {p.stream} · {p.type} · {p.year}
                </div>
              </div>
              <button
                onClick={() => startEdit(p)}
                className="p-2 rounded-lg text-gray-400 hover:text-neon-cyan hover:bg-white/5 transition-all"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/5 text-xs text-gray-500">
          {papers.length} resources · Changes are saved in your browser
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className="absolute bottom-16 left-1/2 flex items-center gap-2 bg-green-500/15 border border-green-500/30 text-green-300 text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg backdrop-blur-sm"
            >
              <CheckCircle2 className="w-4 h-4" /> {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
