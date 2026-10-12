import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Edit2, Trash2, Plus, X, FileText, Download, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/context/AdminContext';
import { useSiteConfig } from '@/context/SiteConfigContext';

interface Resource {
  id: string;
  title: string;
  price: string;
  description: string;
  cover_url: string;
  resource_type: string;
  sort_order: number;
}

const TYPE_LABELS: Record<string, string> = {
  'notes': 'Short Notes',
  'model-papers': 'Model Papers',
  'revision-pack': 'Revision Pack',
};

export function Marketplace() {
  const { editMode } = useAdmin();
  const { whatsappNumber } = useSiteConfig();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const loadResources = useCallback(async () => {
    const { data } = await supabase.from('marketplace_resources').select('*').order('sort_order');
    setResources(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadResources(); }, [loadResources]);

  const handleSave = async (resource: Resource) => {
    if (resources.some((r) => r.id === resource.id)) {
      await supabase.from('marketplace_resources').update(resource).eq('id', resource.id);
    } else {
      await supabase.from('marketplace_resources').insert(resource);
    }
    setShowEditor(false); setEditing(null);
    loadResources();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('marketplace_resources').delete().eq('id', id);
    loadResources();
  };

  const buyNow = (resource: Resource) => {
    const msg = `Hi EduHub! I want to buy: ${resource.title} (${resource.price}). Please share payment details.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <section id="marketplace" className="relative py-20">
      <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-neon-cyan/5 rounded-full blur-[100px]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center"><BookOpen className="w-5 h-5 text-neon-cyan" /></div>
            <div>
              <span className="section-tag mb-2"><ShoppingBag className="w-3 h-3" /> Digital Store</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white dark:text-white light:text-gray-900">Digital Resources Marketplace</h2>
              <p className="text-sm text-gray-400 mt-1">Short Notes, Model Papers & Revision Packs — instant access via WhatsApp</p>
            </div>
          </div>
          {editMode && (
            <button onClick={() => { setEditing(null); setShowEditor(true); }} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Resource</button>
          )}
        </motion.div>

        {loading ? (
          <div className="text-center py-12"><FileText className="w-10 h-10 text-gray-600 mx-auto mb-3 animate-pulse" /><p className="text-gray-500 text-sm">Loading resources...</p></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.map((resource, i) => (
              <motion.div key={resource.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="glass-card p-4 group hover:border-neon-cyan/20 transition-all relative">
                {editMode && (
                  <div className="absolute top-3 right-3 flex gap-1 z-10">
                    <button onClick={() => { setEditing(resource); setShowEditor(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-neon-cyan hover:bg-white/5"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(resource.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
                <div className="w-full aspect-[3/4] max-h-48 rounded-lg bg-ink-700/50 dark:bg-ink-700/50 light:bg-gray-100 flex items-center justify-center mb-4 overflow-hidden">
                  {resource.cover_url ? (
                    <img src={resource.cover_url} alt={resource.title} className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="w-10 h-10 text-gray-600" />
                  )}
                </div>
                <span className="text-[10px] text-neon-cyan uppercase tracking-wide block mb-1">{TYPE_LABELS[resource.resource_type] || resource.resource_type}</span>
                <h3 className="font-semibold text-white dark:text-white light:text-gray-900 text-sm leading-snug mb-2">{resource.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">{resource.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-neon-cyan">{resource.price}</span>
                  <button onClick={() => buyNow(resource)} className="btn-primary text-sm flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5" /> Buy Now</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showEditor && <ResourceEditor resource={editing} onSave={handleSave} onClose={() => { setShowEditor(false); setEditing(null); }} />}
      </AnimatePresence>
    </section>
  );
}

function ResourceEditor({ resource, onSave, onClose }: { resource: Resource | null; onSave: (r: Resource) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<Resource>(() => resource ?? {
    id: `res_${Date.now()}`, title: '', price: 'Rs. ', description: '', cover_url: '', resource_type: 'notes', sort_order: 0,
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white dark:text-white light:text-gray-900">{resource ? 'Edit Resource' : 'Add Resource'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Resource Title</label>
            <input type="text" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Price</label>
              <input type="text" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Type</label>
              <select value={draft.resource_type} onChange={(e) => setDraft({ ...draft, resource_type: e.target.value })} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40">
                <option value="notes">Short Notes</option>
                <option value="model-papers">Model Papers</option>
                <option value="revision-pack">Revision Pack</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={2} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Cover Image URL</label>
            <input type="text" value={draft.cover_url} onChange={(e) => setDraft({ ...draft, cover_url: e.target.value })} placeholder="https://..." className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={() => onSave(draft)} disabled={!draft.title.trim()} className="btn-primary flex-1 text-sm disabled:opacity-50">Save</button>
          <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
