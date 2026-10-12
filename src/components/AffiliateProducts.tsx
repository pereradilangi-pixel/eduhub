import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ExternalLink, Edit2, Trash2, Plus, X, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/context/AdminContext';

interface Product {
  id: string;
  title: string;
  price: string;
  image_url: string;
  affiliate_url: string;
  category: string;
  sort_order: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  stationery: 'Stationery',
  electronics: 'Electronics',
  books: 'Books & Notes',
};

export function AffiliateProducts() {
  const { editMode } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const loadProducts = useCallback(async () => {
    const { data } = await supabase.from('affiliate_products').select('*').order('sort_order');
    setProducts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleSave = async (product: Product) => {
    if (products.some((p) => p.id === product.id)) {
      await supabase.from('affiliate_products').update(product).eq('id', product.id);
    } else {
      await supabase.from('affiliate_products').insert(product);
    }
    setShowEditor(false); setEditing(null);
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('affiliate_products').delete().eq('id', id);
    loadProducts();
  };

  return (
    <section className="relative py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-pink/10 flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-neon-pink" /></div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white dark:text-white light:text-gray-900">Recommended Study Equipment & Stationeries</h2>
              <p className="text-sm text-gray-400 mt-1">Curated products to help you study smarter</p>
            </div>
          </div>
          {editMode && (
            <button onClick={() => { setEditing(null); setShowEditor(true); }} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Product</button>
          )}
        </motion.div>

        {loading ? (
          <div className="text-center py-12"><Package className="w-10 h-10 text-gray-600 mx-auto mb-3 animate-pulse" /><p className="text-gray-500 text-sm">Loading products...</p></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {products.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="glass-card p-3 group relative hover:border-neon-pink/20 transition-all">
                {editMode && (
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <button onClick={() => { setEditing(product); setShowEditor(true); }} className="p-1 rounded-lg text-gray-400 hover:text-neon-cyan hover:bg-white/5"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => handleDelete(product.id)} className="p-1 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5"><Trash2 className="w-3 h-3" /></button>
                  </div>
                )}
                <a href={product.affiliate_url || '#'} target="_blank" rel="noopener noreferrer nofollow" className="block">
                  <div className="w-full aspect-square rounded-lg bg-ink-700/50 dark:bg-ink-700/50 light:bg-gray-100 flex items-center justify-center mb-3 overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-gray-600" />
                    )}
                  </div>
                  <span className="text-[10px] text-neon-cyan uppercase tracking-wide block mb-1">{CATEGORY_LABELS[product.category] || product.category}</span>
                  <h3 className="text-xs font-semibold text-white dark:text-white light:text-gray-900 leading-snug mb-2 line-clamp-2">{product.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-neon-pink">{product.price}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-neon-cyan transition-colors" />
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showEditor && <ProductEditor product={editing} onSave={handleSave} onClose={() => { setShowEditor(false); setEditing(null); }} />}
      </AnimatePresence>
    </section>
  );
}

function ProductEditor({ product, onSave, onClose }: { product: Product | null; onSave: (p: Product) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<Product>(() => product ?? {
    id: `prod_${Date.now()}`, title: '', price: 'Rs. ', image_url: '', affiliate_url: '', category: 'stationery', sort_order: 0,
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white dark:text-white light:text-gray-900">{product ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Product Title</label>
            <input type="text" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Price</label>
              <input type="text" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Category</label>
              <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40">
                <option value="stationery">Stationery</option>
                <option value="electronics">Electronics</option>
                <option value="books">Books & Notes</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Image URL</label>
            <input type="text" value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} placeholder="https://..." className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Affiliate URL (Daraz link)</label>
            <input type="text" value={draft.affiliate_url} onChange={(e) => setDraft({ ...draft, affiliate_url: e.target.value })} placeholder="https://www.daraz.lk/..." className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" />
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
