import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { DEFAULT_QUIZ_SETS, DEFAULT_STUDY_TIPS, type QuizSet, type StudyTip } from '@/data/mockData';

export interface EditableContent {
  heroTitle: string;
  heroSubtitle: string;
  papersTitle: string;
  papersSubtitle: string;
  toolsTitle: string;
  toolsSubtitle: string;
  aiTitle: string;
  aiSubtitle: string;
  communityTitle: string;
  communitySubtitle: string;
  quizTitle: string;
  quizSubtitle: string;
  aiToolsTitle: string;
  aiToolsSubtitle: string;
}

const DEFAULT_CONTENT: EditableContent = {
  heroTitle: 'Master Your O/L & A/L Exams',
  heroSubtitle: 'The all-in-one learning portal for Sri Lankan students — past papers, AI study assistant, productivity tools, and a vibrant community.',
  papersTitle: 'Past Papers & Resources',
  papersSubtitle: 'Search and download past papers, model papers, and revision notes for O/L and A/L — Science, Commerce, Arts, and Technology streams.',
  toolsTitle: 'Student Productivity Tools',
  toolsSubtitle: 'Boost your study efficiency with our built-in Pomodoro timer, Z-Score calculator, and PDF toolkit.',
  aiTitle: 'Gemini AI Study Assistant',
  aiSubtitle: 'Your 24/7 AI tutor. Ask O/L or A/L questions, generate quizzes, and get instant explanations — no setup required.',
  communityTitle: 'Student Community Forum',
  communitySubtitle: 'Ask questions, share study tips, and collaborate with fellow students across Sri Lanka.',
  quizTitle: 'Interactive MCQ Quizzes',
  quizSubtitle: 'Test your knowledge with interactive quizzes. Get instant feedback and track your progress.',
  aiToolsTitle: 'AI Study Tools',
  aiToolsSubtitle: 'Generate flashcards from your notes, get your essays evaluated, and create a personalized study timetable — all powered by Gemini AI.',
};

interface AdminContextValue {
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  toggleEditMode: () => void;
  content: EditableContent;
  updateContent: (key: keyof EditableContent, value: string) => void;
  quizSets: QuizSet[];
  addQuizSet: (set: QuizSet) => void;
  updateQuizSet: (id: string, set: QuizSet) => void;
  deleteQuizSet: (id: string) => void;
  studyTips: StudyTip[];
  addStudyTip: (tip: StudyTip) => void;
  updateStudyTip: (id: string, tip: StudyTip) => void;
  deleteStudyTip: (id: string) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

const QUIZ_KEY = 'admin_quiz_sets_v1';
const TIPS_KEY = 'admin_study_tips_v1';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as T;
    }
  } catch { /* ignore */ }
  return fallback;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditMode] = useState(false);
  const [content, setContent] = useState<EditableContent>(DEFAULT_CONTENT);
  const [quizSets, setQuizSets] = useState<QuizSet[]>(() => loadFromStorage(QUIZ_KEY, DEFAULT_QUIZ_SETS));
  const [studyTips, setStudyTips] = useState<StudyTip[]>(() => loadFromStorage(TIPS_KEY, DEFAULT_STUDY_TIPS));

  useEffect(() => {
    try { localStorage.setItem(QUIZ_KEY, JSON.stringify(quizSets)); } catch { /* ignore */ }
  }, [quizSets]);

  useEffect(() => {
    try { localStorage.setItem(TIPS_KEY, JSON.stringify(studyTips)); } catch { /* ignore */ }
  }, [studyTips]);

  const toggleEditMode = useCallback(() => setEditMode((p) => !p), []);
  const updateContent = useCallback((key: keyof EditableContent, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  }, []);

  const addQuizSet = useCallback((set: QuizSet) => {
    setQuizSets((prev) => [...prev, set]);
  }, []);
  const updateQuizSet = useCallback((id: string, set: QuizSet) => {
    setQuizSets((prev) => prev.map((s) => (s.id === id ? set : s)));
  }, []);
  const deleteQuizSet = useCallback((id: string) => {
    setQuizSets((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addStudyTip = useCallback((tip: StudyTip) => {
    setStudyTips((prev) => [...prev, tip]);
  }, []);
  const updateStudyTip = useCallback((id: string, tip: StudyTip) => {
    setStudyTips((prev) => prev.map((t) => (t.id === id ? tip : t)));
  }, []);
  const deleteStudyTip = useCallback((id: string) => {
    setStudyTips((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <AdminContext.Provider value={{
      editMode, setEditMode, toggleEditMode, content, updateContent,
      quizSets, addQuizSet, updateQuizSet, deleteQuizSet,
      studyTips, addStudyTip, updateStudyTip, deleteStudyTip,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}

export function EditableText({
  field,
  as: Tag = 'span',
  className = '',
}: {
  field: keyof EditableContent;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
}) {
  const { editMode, content, updateContent } = useAdmin();
  const value = content[field];

  if (editMode) {
    return (
      <textarea
        className={`edit-input w-full resize-none ${className}`}
        value={value}
        onChange={(e) => updateContent(field, e.target.value)}
        rows={Math.min(value.length / 60 + 1, 4)}
      />
    );
  }

  return <Tag className={className}>{value}</Tag>;
}
