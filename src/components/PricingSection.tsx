import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, X, Zap, Sparkles, MessageCircle, Copy } from 'lucide-react';
import { useSiteConfig, ALL_FEATURES, type FeatureKey } from '@/context/SiteConfigContext';

const FULL_BUNDLE_PRICE = 890;
const FULL_BUNDLE_ORIGINAL = 1890;
const SINGLE_PRICE = 300;
const DUO_PRICE = 450;

export function PricingSection() {
  const { whatsappNumber, isFullyUnlocked, unlockedFeatures } = useSiteConfig();
  const [showPurchase, setShowPurchase] = useState(false);

  return (
    <section id="pricing" className="relative py-20">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[120px]" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <span className="section-tag mb-4"><Crown className="w-3 h-3" /> Premium Access</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white dark:text-white light:text-gray-900">Unlock All Features</h2>
          <p className="mt-3 text-gray-400 dark:text-gray-400 light:text-gray-600 max-w-xl mx-auto">Choose what you need — unlock a single feature, a duo bundle, or get everything with the Full Pass.</p>
        </motion.div>

        {isFullyUnlocked && (
          <div className="glass-card p-4 mb-6 text-center border-green-400/20">
            <p className="text-sm text-green-400 flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Full Pass is active — all features unlocked!</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-5">
          {/* Single Feature */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.05 }} className="glass-card p-6 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center mb-4"><Zap className="w-6 h-6 text-neon-cyan" /></div>
            <h3 className="font-display text-xl font-bold text-white dark:text-white light:text-gray-900 mb-1">Single Feature</h3>
            <p className="text-sm text-gray-400 mb-4">Unlock any one feature of your choice</p>
            <div className="mb-4">
              <span className="text-3xl font-bold text-white dark:text-white light:text-gray-900">Rs. {SINGLE_PRICE}</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-400 mb-6 flex-1">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Choose any 1 AI feature</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Unlimited usage</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Paper marking included</li>
            </ul>
            <button onClick={() => setShowPurchase('single')} className="btn-primary w-full text-sm">Choose Feature</button>
          </motion.div>

          {/* Duo Bundle */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }} className="glass-card p-6 flex flex-col border-neon-cyan/20">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neon-cyan text-ink-900 text-xs font-bold px-3 py-1 rounded-full">SAVE Rs. 150</div>
            <div className="w-12 h-12 rounded-xl bg-neon-violet/10 flex items-center justify-center mb-4"><Sparkles className="w-6 h-6 text-neon-violet" /></div>
            <h3 className="font-display text-xl font-bold text-white dark:text-white light:text-gray-900 mb-1">Duo Bundle</h3>
            <p className="text-sm text-gray-400 mb-4">Unlock any 2 features together</p>
            <div className="mb-4">
              <span className="text-3xl font-bold text-white dark:text-white light:text-gray-900">Rs. {DUO_PRICE}</span>
              <span className="text-sm text-gray-500 line-through ml-2">Rs. 600</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-400 mb-6 flex-1">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Pick any 2 AI features</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Unlimited usage on both</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Best value for 2 tools</li>
            </ul>
            <button onClick={() => setShowPurchase('duo')} className="btn-primary w-full text-sm">Choose 2 Features</button>
          </motion.div>

          {/* Full Bundle */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.15 }} className="glass-card p-6 flex flex-col border-neon-pink/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/5 to-transparent pointer-events-none" />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neon-pink text-white text-xs font-bold px-3 py-1 rounded-full">SAVE Rs. 1000</div>
            <div className="w-12 h-12 rounded-xl bg-neon-pink/10 flex items-center justify-center mb-4 relative"><Crown className="w-6 h-6 text-neon-pink" /></div>
            <h3 className="font-display text-xl font-bold text-white dark:text-white light:text-gray-900 mb-1 relative">Full Pass</h3>
            <p className="text-sm text-gray-400 mb-4 relative">Everything unlocked + all O/L & A/L papers</p>
            <div className="mb-4 relative">
              <span className="text-3xl font-bold text-neon-pink">Rs. {FULL_BUNDLE_PRICE}</span>
              <span className="text-sm text-gray-500 line-through ml-2">Rs. {FULL_BUNDLE_ORIGINAL}</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-400 mb-6 flex-1 relative">
              {ALL_FEATURES.map((f) => (
                <li key={f.key} className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> {f.label}</li>
              ))}
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> All past papers & notes</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Unlimited paper marking</li>
            </ul>
            <button onClick={() => setShowPurchase('full')} className="btn-primary w-full text-sm relative">Get Full Pass</button>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showPurchase && (
          <PurchaseModal mode={showPurchase as string} whatsappNumber={whatsappNumber} onClose={() => setShowPurchase(false)} />
        )}
      </AnimatePresence>
    </section>
  );
}

function PurchaseModal({ mode, whatsappNumber, onClose }: { mode: string; whatsappNumber: string; onClose: () => void }) {
  const { unlockAll, unlockFeature } = useSiteConfig();
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureKey[]>([]);
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'sent'>('select');
  const [showRedeem, setShowRedeem] = useState(false);

  const maxSelectable = mode === 'single' ? 1 : mode === 'duo' ? 2 : ALL_FEATURES.length;
  const price = mode === 'single' ? SINGLE_PRICE : mode === 'duo' ? DUO_PRICE : FULL_BUNDLE_PRICE;

  const toggleFeature = (key: FeatureKey) => {
    if (mode === 'full') return;
    setSelectedFeatures((prev) => {
      if (prev.includes(key)) return prev.filter((f) => f !== key);
      if (prev.length >= maxSelectable) return prev;
      return [...prev, key];
    });
  };

  const handleConfirm = () => {
    const featureLabels = mode === 'full'
      ? ALL_FEATURES.map((f) => f.label).join(', ')
      : selectedFeatures.map((key) => ALL_FEATURES.find((f) => f.key === key)?.label).join(', ');
    const verificationCode = `EDUHUB-${Date.now().toString(36).toUpperCase()}-${mode.toUpperCase()}`;
    const msg = `Hi EduHub! I want to purchase:\n\n*Plan:* ${mode === 'full' ? 'Full Pass' : mode === 'duo' ? 'Duo Bundle' : 'Single Feature'}\n*Features:* ${featureLabels}\n*Price:* Rs. ${price}\n*My Contact:* ${contact}\n*Verification Code:* ${verificationCode}\n\nPlease confirm my purchase and send the unlock link.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    setStep('sent');
  };

  const handleRedeem = () => {
    // Check unlock codes in DB
    import('@/lib/supabase').then(async ({ supabase }) => {
      const { data } = await supabase.from('unlock_codes').select('*').eq('code', code.trim()).maybeSingle();
      if (data && !data.used) {
        if (data.features.includes('all')) {
          unlockAll();
        } else {
          for (const f of data.features) unlockFeature(f as FeatureKey);
        }
        await supabase.from('unlock_codes').update({ used: true }).eq('id', data.id);
        setStep('sent');
      } else {
        alert('Invalid or already used code. Please check with the owner.');
      }
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white dark:text-white light:text-gray-900">
            {mode === 'full' ? 'Full Pass' : mode === 'duo' ? 'Duo Bundle' : 'Single Feature'} — Rs. {price}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {step === 'select' && (
          <>
            <p className="text-sm text-gray-400">
              {mode === 'full' ? 'All features will be unlocked.' : `Select ${maxSelectable} feature${maxSelectable > 1 ? 's' : ''} to unlock:`}
            </p>
            <div className="space-y-2">
              {ALL_FEATURES.map((feature) => {
                const selected = mode === 'full' || selectedFeatures.includes(feature.key);
                return (
                  <button key={feature.key} onClick={() => toggleFeature(feature.key)} disabled={mode === 'full'} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${selected ? 'border-neon-cyan/40 bg-neon-cyan/10' : 'border-white/10 dark:border-white/10 light:border-gray-200 hover:border-neon-cyan/20'}`}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selected ? 'border-neon-cyan bg-neon-cyan/20' : 'border-gray-500'}`}>
                      {selected && <Check className="w-3 h-3 text-neon-cyan" />}
                    </div>
                    <span className="text-sm text-white dark:text-white light:text-gray-900">{feature.label}</span>
                  </button>
                );
              })}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Your Email or WhatsApp Number</label>
              <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="076 123 4567 or your@email.com" className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2.5 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" />
            </div>
            <button onClick={handleConfirm} disabled={mode !== 'full' && selectedFeatures.length !== maxSelectable || !contact.trim()} className="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              <MessageCircle className="w-4 h-4" /> Confirm Purchase via WhatsApp
            </button>
            <div className="text-center">
              <button onClick={() => setShowRedeem(!showRedeem)} className="text-xs text-gray-500 hover:text-neon-cyan transition-colors">Already paid? Enter unlock code</button>
            </div>
            {showRedeem && (
              <div className="flex gap-2">
                <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="EDUHUB-XXXX-XXXX" className="flex-1 bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40 font-mono" />
                <button onClick={handleRedeem} className="btn-primary text-sm px-4">Redeem</button>
              </div>
            )}
          </>
        )}

        {step === 'sent' && (
          <div className="text-center py-6">
            <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h4 className="font-display text-lg font-bold text-white dark:text-white light:text-gray-900 mb-2">Purchase Request Sent!</h4>
            <p className="text-sm text-gray-400">Your WhatsApp message has been opened with your verification code. Once the owner confirms your payment, you'll receive an unlock link to activate your features.</p>
            <button onClick={onClose} className="btn-ghost text-sm mt-4">Close</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
