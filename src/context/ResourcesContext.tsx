import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { type PaperResource } from '@/data/mockData';

const STORAGE_KEY = 'student_resources';

interface ResourcesContextValue {
  papers: PaperResource[];
  addPaper: (paper: Omit<PaperResource, 'id' | 'downloads'>) => void;
  updatePaper: (id: string, updates: Partial<PaperResource>) => void;
  deletePaper: (id: string) => void;
  resetToDefault: () => void;
  lastSavedAt: number | null;
}

const ResourcesContext = createContext<ResourcesContextValue | null>(null);

function loadFromStorage(): PaperResource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as PaperResource[];
    }
  } catch { /* ignore */ }
  return [];
}

function saveToStorage(papers: PaperResource[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
    return true;
  } catch { /* ignore */ }
  return false;
}

export function ResourcesProvider({ children }: { children: ReactNode }) {
  const [papers, setPapers] = useState<PaperResource[]>(() => loadFromStorage());
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  useEffect(() => {
    const ok = saveToStorage(papers);
    if (ok) setLastSavedAt(Date.now());
  }, [papers]);

  const addPaper = useCallback((paper: Omit<PaperResource, 'id' | 'downloads'>) => {
    const newPaper: PaperResource = {
      ...paper,
      id: `pp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      downloads: 0,
    };
    setPapers((prev) => [newPaper, ...prev]);
  }, []);

  const updatePaper = useCallback((id: string, updates: Partial<PaperResource>) => {
    setPapers((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const deletePaper = useCallback((id: string) => {
    setPapers((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const resetToDefault = useCallback(() => {
    setPapers([]);
  }, []);

  return (
    <ResourcesContext.Provider value={{ papers, addPaper, updatePaper, deletePaper, resetToDefault, lastSavedAt }}>
      {children}
    </ResourcesContext.Provider>
  );
}

export function useResources() {
  const ctx = useContext(ResourcesContext);
  if (!ctx) throw new Error('useResources must be used within ResourcesProvider');
  return ctx;
}
