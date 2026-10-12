import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export interface SocialLinks {
  instagram: string;
  youtube: string;
  twitter: string;
  github: string;
}

export interface ExamDate {
  name: string;
  date: string; // ISO string
  color: string;
}

export interface SiteConfig {
  social: SocialLinks;
  exams: ExamDate[];
  ownerPassword: string;
  whatsappNumber: string;
}

const DEFAULT_CONFIG: SiteConfig = {
  social: {
    instagram: '',
    youtube: '',
    twitter: '',
    github: '',
  },
  exams: [
    { name: 'O/L 2026', date: '2026-12-01T08:30:00+05:30', color: '#22d3ee' },
    { name: 'A/L 2026', date: '2026-08-01T08:30:00+05:30', color: '#a78bfa' },
  ],
  ownerPassword: 'eduhub2026',
  whatsappNumber: '94767749660',
};

const CONFIG_KEY = 'site_config_v1';

function loadConfig(): SiteConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        social: { ...DEFAULT_CONFIG.social, ...parsed.social },
        exams: parsed.exams?.length ? parsed.exams : DEFAULT_CONFIG.exams,
        ownerPassword: parsed.ownerPassword || DEFAULT_CONFIG.ownerPassword,
        whatsappNumber: parsed.whatsappNumber || DEFAULT_CONFIG.whatsappNumber,
      };
    }
  } catch { /* ignore */ }
  return DEFAULT_CONFIG;
}

// ─── Usage metering & unlock state ─────────────────────────────────────────

const FREE_LIMIT = 3;
const USAGE_KEY = 'feature_usage_v1';
const UNLOCK_KEY = 'unlocked_features_v1';

export const FEATURE_KEYS = {
  flashcards: 'flashcards',
  essayEvaluator: 'essayEvaluator',
  studyPlanner: 'studyPlanner',
  quizGenerator: 'quizGenerator',
  paperMarking: 'paperMarking',
} as const;

export type FeatureKey = typeof FEATURE_KEYS[keyof typeof FEATURE_KEYS];

export const ALL_FEATURES: { key: FeatureKey; label: string; icon: string }[] = [
  { key: 'flashcards', label: 'AI Flashcards', icon: 'Layers' },
  { key: 'essayEvaluator', label: 'Essay Evaluator', icon: 'PenLine' },
  { key: 'studyPlanner', label: 'Study Planner', icon: 'CalendarClock' },
  { key: 'quizGenerator', label: 'Quiz Generator', icon: 'Brain' },
  { key: 'paperMarking', label: 'Paper Marking', icon: 'FileCheck' },
];

function loadUsage(): Record<string, number> {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function loadUnlocked(): string[] {
  try {
    const raw = localStorage.getItem(UNLOCK_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

interface SiteConfigValue extends SiteConfig {
  updateSocial: (key: keyof SocialLinks, value: string) => void;
  updateExam: (index: number, patch: Partial<ExamDate>) => void;
  addExam: (exam: ExamDate) => void;
  removeExam: (index: number) => void;
  setOwnerPassword: (pw: string) => void;
  setWhatsappNumber: (num: string) => void;
  resetConfig: () => void;
  // Usage
  usage: Record<string, number>;
  incrementUsage: (feature: FeatureKey) => void;
  isFeatureUnlocked: (feature: FeatureKey) => boolean;
  isFeatureLocked: (feature: FeatureKey) => boolean;
  remainingUses: (feature: FeatureKey) => number;
  unlockedFeatures: string[];
  unlockFeature: (feature: FeatureKey) => void;
  unlockAll: () => void;
  unlockByCode: (features: string[]) => void;
  isFullyUnlocked: boolean;
  freeLimit: number;
}

const SiteConfigContext = createContext<SiteConfigValue | null>(null);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(() => loadConfig());
  const [usage, setUsage] = useState<Record<string, number>>(() => loadUsage());
  const [unlockedFeatures, setUnlockedFeatures] = useState<string[]>(() => loadUnlocked());

  useEffect(() => {
    try { localStorage.setItem(CONFIG_KEY, JSON.stringify(config)); } catch { /* ignore */ }
  }, [config]);

  useEffect(() => {
    try { localStorage.setItem(USAGE_KEY, JSON.stringify(usage)); } catch { /* ignore */ }
  }, [usage]);

  useEffect(() => {
    try { localStorage.setItem(UNLOCK_KEY, JSON.stringify(unlockedFeatures)); } catch { /* ignore */ }
  }, [unlockedFeatures]);

  const updateSocial = useCallback((key: keyof SocialLinks, value: string) => {
    setConfig((prev) => ({ ...prev, social: { ...prev.social, [key]: value } }));
  }, []);

  const updateExam = useCallback((index: number, patch: Partial<ExamDate>) => {
    setConfig((prev) => ({
      ...prev,
      exams: prev.exams.map((e, i) => (i === index ? { ...e, ...patch } : e)),
    }));
  }, []);

  const addExam = useCallback((exam: ExamDate) => {
    setConfig((prev) => ({ ...prev, exams: [...prev.exams, exam] }));
  }, []);

  const removeExam = useCallback((index: number) => {
    setConfig((prev) => ({ ...prev, exams: prev.exams.filter((_, i) => i !== index) }));
  }, []);

  const setOwnerPassword = useCallback((pw: string) => {
    setConfig((prev) => ({ ...prev, ownerPassword: pw }));
  }, []);

  const setWhatsappNumber = useCallback((num: string) => {
    setConfig((prev) => ({ ...prev, whatsappNumber: num }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  const incrementUsage = useCallback((feature: FeatureKey) => {
    setUsage((prev) => ({ ...prev, [feature]: (prev[feature] || 0) + 1 }));
  }, []);

  const isFeatureUnlocked = useCallback((feature: FeatureKey) => {
    return unlockedFeatures.includes(feature) || unlockedFeatures.includes('all');
  }, [unlockedFeatures]);

  const isFeatureLocked = useCallback((feature: FeatureKey) => {
    return !isFeatureUnlocked(feature);
  }, [isFeatureUnlocked]);

  const remainingUses = useCallback((feature: FeatureKey) => {
    if (isFeatureUnlocked(feature)) return Infinity;
    const used = usage[feature] || 0;
    return Math.max(0, FREE_LIMIT - used);
  }, [usage, isFeatureUnlocked]);

  const unlockFeature = useCallback((feature: FeatureKey) => {
    setUnlockedFeatures((prev) => prev.includes(feature) ? prev : [...prev, feature]);
  }, []);

  const unlockAll = useCallback(() => {
    setUnlockedFeatures((prev) => prev.includes('all') ? prev : [...prev, 'all']);
  }, []);

  const unlockByCode = useCallback((features: string[]) => {
    setUnlockedFeatures((prev) => {
      const next = new Set(prev);
      for (const f of features) next.add(f);
      return Array.from(next);
    });
  }, []);

  const isFullyUnlocked = unlockedFeatures.includes('all');

  return (
    <SiteConfigContext.Provider value={{
      ...config,
      updateSocial,
      updateExam,
      addExam,
      removeExam,
      setOwnerPassword,
      setWhatsappNumber,
      resetConfig,
      usage,
      incrementUsage,
      isFeatureUnlocked,
      isFeatureLocked,
      remainingUses,
      unlockedFeatures,
      unlockFeature,
      unlockAll,
      unlockByCode,
      isFullyUnlocked,
      freeLimit: FREE_LIMIT,
    }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error('useSiteConfig must be used within SiteConfigProvider');
  return ctx;
}
