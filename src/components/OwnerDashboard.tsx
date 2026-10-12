import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Key, Copy, Check, X, Lock, Unlock, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSiteConfig, ALL_FEATURES, type FeatureKey } from '@/context/SiteConfigContext';

interface UnlockCodeRow {
  id: string;
  code: string;
  features: string[];
  contact: string;
  used: boolean;
  created_at: string;
}

const OWNER_KEY = 'owner_dashboard_access';

export function OwnerDashboard() {
  const { ownerPassword, whatsappNumber } = useSiteConfig();
  const [accessed, setAccessed] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [codes, setCodes] = useState<UnlockCodeRow[]>([]);
  const [generating, setGenerating] = useState(false);
  const [newCode, setNewCode] = useState({ features: [] as string[], contact: '' });

  useEffect(() => {
    try { setAccessed(localStorage.getItem(OWNER_KEY) === 'true'); } catch { /* ignore */ }
  }, []);

  const loadCodes = useCallback(async () => {
    const { data } = await supabase.from('unlock_codes').select('*').order('created_at', { ascending: false });
    setCodes(data || []);
  }, []);

  useEffect(() => { if (accessed) loadCodes(); }, [accessed, loadCodes]);

  const handleLogin = () => {
    if (pwInput === ownerPassword) {
      setAccessed(true);
      try { localStorage.setItem(OWNER_KEY, 'true'); } catch { /* ignore */ }
      setShowLogin(false);
      setPwInput('');
    } else {
      alert('Wrong password');
    }
  };

  const handleLogout = () => {
    setAccessed(false);
    try { localStorage.removeItem(OWNER_KEY); } catch { /* ignore */ }
  };

  const generateCode = async () => {
    const code = `EDUHUB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const features = newCode.features.includes('all') ? ['all'] : newCode.features;
    await supabase.from('unlock_codes').insert({ code, features, contact: newCode.contact });
    setGenerating(false);
    setNewCode({ features: [], contact: '' });
    loadCodes();
  };

  const deleteCode = async (id: string) => {
    await supabase.from('unlock_codes').delete().eq('id', id);
    loadCodes();
  };

  const buildUnlockLink = (code: string) => {
    const base = window.location.origin + window.location.pathname;
    return `${base}#unlock=${code}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  // Hidden trigger: triple-click on footer copyright
  if (!accessed && !showLogin) {
    return null;
  }

  if (showLogin && !accessed) {
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogin(false)} className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="glass-card p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-white dark:text-white light:text-gray-900 flex items-center gap-2"><Shield className="w-5 h-5 text-neon-cyan" /> Owner Login</h3>
              <button onClick={() => setShowLogin(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <input type="password" value={pwInput} onChange={(e) => setPwInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="Owner password" className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2.5 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" />
            <button onClick={handleLogin} className="btn-primary w-full text-sm">Login</button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!accessed) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[90] overflow-y-auto bg-ink-900 dark:bg-ink-900 light:bg-gray-100">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-gradient flex items-center justify-center"><Shield className="w-5 h-5 text-ink-900" /></div>
            <div>
              <h1 className="font-display text-xl font-bold text-white dark:text-white light:text-gray-900">Owner Dashboard</h1>
              <p className="text-xs text-gray-400">Generate unlock links for paid students</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost text-xs px-3 py-2">Exit</button>
        </div>

        {/* Generate new code */}
        <div className="glass-card p-5 mb-6 space-y-4">
          <h3 className="font-semibold text-white dark:text-white light:text-gray-900 text-sm flex items-center gap-2"><Key className="w-4 h-4 text-neon-cyan" /> Generate Unlock Link</h3>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Select features to unlock:</label>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setNewCode((p) => ({ ...p, features: ['all'] }))} className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${newCode.features.includes('all') ? 'border-neon-pink bg-neon-pink/10 text-neon-pink' : 'border-white/10 text-gray-400 hover:border-neon-pink/30'}`}>
                Full Pass (All Features)
              </button>
              {ALL_FEATURES.map((f) => {
                const selected = newCode.features.includes(f.key);
                return (
                  <button key={f.key} onClick={() => setNewCode((p) => ({ ...p, features: p.features.includes('all') ? [f.key] : selected ? p.features.filter((x) => x !== f.key) : [...p.features, f.key] }))} className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${selected ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan' : 'border-white/10 text-gray-400 hover:border-neon-cyan/30'}`}>
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Student Contact (optional)</label>
            <input type="text" value={newCode.contact} onChange={(e) => setNewCode({ ...newCode, contact: e.target.value })} placeholder="Student's WhatsApp or email" className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" />
          </div>
          <button onClick={generateCode} disabled={newCode.features.length === 0} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"><Plus className="w-4 h-4" /> Generate Unlock Link</button>
        </div>

        {/* Existing codes */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Generated Links</h3>
          {codes.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No unlock links generated yet.</p>
          ) : (
            <div className="space-y-3">
              {codes.map((row) => {
                const link = buildUnlockLink(row.code);
                const featureLabels = row.features.includes('all') ? 'Full Pass' : row.features.map((f) => ALL_FEATURES.find((af) => af.key === f)?.label).join(', ');
                return (
                  <div key={row.id} className="glass-card p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-xs text-gray-400">Features: </span>
                        <span className="text-sm font-semibold text-neon-cyan">{featureLabels}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {row.used ? <span className="text-xs text-amber-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Used</span> : <span className="text-xs text-green-400 flex items-center gap-1"><Unlock className="w-3 h-3" /> Active</span>}
                        <button onClick={() => deleteCode(row.id)} className="text-gray-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    {row.contact && <p className="text-xs text-gray-500 mb-2">Student: {row.contact}</p>}
                    <div className="flex items-center gap-2">
                      <input type="text" readOnly value={link} className="flex-1 bg-ink-700/50 dark:bg-ink-700/50 light:bg-gray-100 border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-300 dark:text-gray-300 light:text-gray-600 font-mono" />
                      <button onClick={() => copyToClipboard(link)} className="p-2 rounded-lg text-gray-400 hover:text-neon-cyan hover:bg-white/5 transition-all" title="Copy link"><Copy className="w-4 h-4" /></button>
                      <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Here is your EduHub unlock link: ${link}`)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-[#25D366] text-white hover:scale-105 transition-all" title="Send via WhatsApp"><Check className="w-4 h-4" /></a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/** Hidden trigger component — triple-click opens owner login */
export function OwnerTrigger() {
  const [clicks, setClicks] = useState(0);
  const [showLogin, setShowLogin] = useState(false);

  const handleClick = () => {
    const next = clicks + 1;
    setClicks(next);
    if (next >= 3) {
      setShowLogin(true);
      setClicks(0);
    }
    setTimeout(() => setClicks(0), 1000);
  };

  return <OwnerLoginTrigger onClick={handleClick} showLogin={showLogin} setShowLogin={setShowLogin} />;
}

function OwnerLoginTrigger({ onClick, showLogin, setShowLogin }: { onClick: () => void; showLogin: boolean; setShowLogin: (v: boolean) => void }) {
  return (
    <>
      <span onClick={onClick} className="select-none cursor-pointer">&copy; 2026 EduHub Sri Lanka.</span>
      <OwnerLoginModal show={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}

function OwnerLoginModal({ show, onClose }: { show: boolean; onClose: () => void }) {
  const { ownerPassword } = useSiteConfig();
  const [pw, setPw] = useState('');

  if (!show) return null;

  const handleLogin = () => {
    if (pw === ownerPassword) {
      try { localStorage.setItem(OWNER_KEY, 'true'); } catch { /* ignore */ }
      window.location.reload();
    } else {
      alert('Wrong password');
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div onClick={(e) => e.stopPropagation()} className="glass-card p-6 w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white dark:text-white light:text-gray-900 flex items-center gap-2"><Shield className="w-5 h-5 text-neon-cyan" /> Owner Login</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="Owner password" className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2.5 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" />
        <button onClick={handleLogin} className="btn-primary w-full text-sm">Login</button>
        <p className="text-xs text-gray-500 text-center">Default password: eduhub2026 (change in config)</p>
      </div>
    </div>
  );
}
