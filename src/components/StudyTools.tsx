import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Timer, Play, Pause, RotateCcw, Volume2, VolumeX,
  Calculator, TrendingUp, Gauge, Award, Edit3,
  Brain, Settings, FileStack, Image as ImageIcon, FileDown, Edit,
  Upload, Download, Loader2, X, FileText, Copy, Check, Trash2,
} from 'lucide-react';
import { EditableText } from '@/context/AdminContext';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/* ============================ Pomodoro Timer ============================ */

const DEFAULT_DURATIONS = { focus: 25, short: 5, long: 20 };
const DURATIONS_KEY = 'pomodoro_durations_v1';

type Phase = 'focus' | 'short' | 'long';
interface Durations { focus: number; short: number; long: number }

function loadDurations(): Durations {
  try {
    const raw = localStorage.getItem(DURATIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.focus === 'number') return parsed;
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_DURATIONS };
}

function PomodoroTimer() {
  const [durations, setDurations] = useState<Durations>(() => loadDurations());
  const [phase, setPhase] = useState<Phase>('focus');
  const [seconds, setSeconds] = useState(() => loadDurations().focus * 60);
  const [running, setRunning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [completed, setCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    localStorage.setItem(DURATIONS_KEY, JSON.stringify(durations));
  }, [durations]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            if (soundOn) {
              try {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 800;
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                osc.start();
                osc.stop(ctx.currentTime + 0.5);
              } catch { /* ignore */ }
            }
            setCompleted((c) => c + 1);
            setRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, soundOn]);

  const switchPhase = (p: Phase) => {
    setPhase(p);
    setSeconds(durations[p] * 60);
    setRunning(false);
  };

  const reset = () => {
    setSeconds(durations[phase] * 60);
    setRunning(false);
  };

  const updateDuration = (key: Phase, value: number) => {
    const clamped = Math.max(1, Math.min(180, value || 1));
    setDurations((prev) => {
      const next = { ...prev, [key]: clamped };
      if (phase === key && !running) setSeconds(clamped * 60);
      return next;
    });
  };

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const totalSeconds = durations[phase] * 60;
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 120;
  const dashOffset = circumference - (progress / 100) * circumference;

  const phaseColor = phase === 'focus' ? '#22d3ee' : phase === 'short' ? '#a3e635' : '#a78bfa';
  const phaseLabel = phase === 'focus' ? 'Focus' : phase === 'short' ? 'Short Break' : 'Long Break';

  return (
    <div className="glass-card p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
          <Timer className="w-5 h-5 text-neon-cyan" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-white">Pomodoro Timer</h3>
          <p className="text-xs text-gray-400">Stay focused with timed study sessions</p>
        </div>
        <button
          onClick={() => setShowSettings((p) => !p)}
          className={`p-2.5 rounded-xl border transition-all ${showSettings ? 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10' : 'text-gray-400 border-white/10 hover:text-white hover:bg-white/5'}`}
          title="Customize durations"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Custom duration settings */}
      {showSettings && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="overflow-hidden mb-6"
        >
          <div className="bg-ink-600/30 border border-neon-cyan/20 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-semibold text-neon-cyan flex items-center gap-2">
              <Settings className="w-4 h-4" /> Custom Durations (minutes)
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {(['focus', 'short', 'long'] as const).map((p) => (
                <div key={p}>
                  <label className="block text-xs text-gray-400 mb-1.5">
                    {p === 'focus' ? 'Focus' : p === 'short' ? 'Short Break' : 'Long Break'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={durations[p]}
                    onChange={(e) => updateDuration(p, parseInt(e.target.value) || 1)}
                    className="w-full bg-ink-600/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-center outline-none focus:border-neon-cyan/40 transition-all"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => { setDurations({ ...DEFAULT_DURATIONS }); setSeconds(DEFAULT_DURATIONS[phase] * 60); setRunning(false); }}
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset to defaults
            </button>
          </div>
        </motion.div>
      )}

      {/* Phase switcher */}
      <div className="flex gap-2 mb-6">
        {(['focus', 'short', 'long'] as const).map((p) => (
          <button
            key={p}
            onClick={() => switchPhase(p)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              phase === p
                ? 'bg-ink-500 text-white border border-white/10'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {p === 'focus' ? `Focus ${durations.focus}` : p === 'short' ? `Break ${durations.short}` : `Long ${durations.long}`}
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div className="relative flex items-center justify-center mb-6">
        <svg width="260" height="260" className="transform -rotate-90">
          <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle
            cx="130" cy="130" r="120" fill="none" stroke={phaseColor} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.5 }}
            style={{ filter: `drop-shadow(0 0 8px ${phaseColor})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold font-mono text-white tabular-nums">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          <span className="text-sm text-gray-400 mt-1">{phaseLabel}</span>
          <span className="text-xs text-gray-500 mt-1">Sessions: {completed}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setRunning((p) => !p)}
          className="bg-neon-gradient text-ink-900 font-semibold px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-neon-soft"
        >
          {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {running ? 'Pause' : 'Start'}
        </button>
        <button onClick={reset} className="btn-ghost p-3" title="Reset">
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={() => setSoundOn((p) => !p)}
          className={`p-3 rounded-xl border transition-all ${soundOn ? 'text-neon-cyan border-neon-cyan/30' : 'text-gray-500 border-white/10'}`}
          title="Notification sound"
        >
          {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

/* ============================ Z-Score Calculator ============================ */

interface SubjectInput {
  name: string;
  zScore: string;
}

function ZScoreCalculator() {
  const [subjects, setSubjects] = useState<SubjectInput[]>([
    { name: 'Subject 1', zScore: '' },
    { name: 'Subject 2', zScore: '' },
    { name: 'Subject 3', zScore: '' },
  ]);

  const avgZ = (() => {
    const valid = subjects.filter((s) => s.zScore !== '');
    if (valid.length === 0) return null;
    const sum = valid.reduce((acc, s) => acc + parseFloat(s.zScore), 0);
    return sum / valid.length;
  })();

  const totalZ = (() => {
    const valid = subjects.filter((s) => s.zScore !== '');
    if (valid.length === 0) return null;
    return valid.reduce((acc, s) => acc + parseFloat(s.zScore), 0);
  })();

  const getRating = (z: number) => {
    if (z >= 2) return { label: 'Excellent', color: 'text-green-400', icon: Award };
    if (z >= 1) return { label: 'Very Good', color: 'text-neon-cyan', icon: TrendingUp };
    if (z >= 0) return { label: 'Good', color: 'text-neon-lime', icon: Gauge };
    if (z >= -1) return { label: 'Average', color: 'text-yellow-400', icon: Gauge };
    return { label: 'Below Average', color: 'text-orange-400', icon: Gauge };
  };

  const rating = avgZ !== null ? getRating(avgZ) : null;

  return (
    <div className="glass-card p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-neon-violet/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-neon-violet" />
        </div>
        <div>
          <h3 className="font-display font-bold text-white">Z-Score & GPA Calculator</h3>
          <p className="text-xs text-gray-400">Calculate your A/L admission score</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {subjects.map((s, i) => (
          <div key={i} className="flex gap-3">
            <input
              type="text"
              value={s.name}
              onChange={(e) => {
                const next = [...subjects];
                next[i] = { ...next[i], name: e.target.value };
                setSubjects(next);
              }}
              className="flex-1 bg-ink-600/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-neon-violet/40 transition-all"
              placeholder="Subject name"
            />
            <input
              type="number"
              step="0.01"
              value={s.zScore}
              onChange={(e) => {
                const next = [...subjects];
                next[i] = { ...next[i], zScore: e.target.value };
                setSubjects(next);
              }}
              className="w-28 bg-ink-600/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white text-center outline-none focus:border-neon-violet/40 transition-all font-mono"
              placeholder="Z-Score"
            />
          </div>
        ))}
        <button
          onClick={() => setSubjects([...subjects, { name: `Subject ${subjects.length + 1}`, zScore: '' }])}
          className="text-xs text-neon-violet hover:text-white transition-colors"
        >
          + Add Subject
        </button>
      </div>

      <div className="border-t border-white/5 pt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total Z-Score</span>
          <span className="font-mono font-bold text-white">
            {totalZ !== null ? totalZ.toFixed(4) : '—'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Average Z-Score</span>
          <span className="font-mono font-bold text-white">
            {avgZ !== null ? avgZ.toFixed(4) : '—'}
          </span>
        </div>
        {rating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between bg-ink-600/40 rounded-lg px-4 py-3"
          >
            <span className="text-sm text-gray-400">Performance</span>
            <span className={`flex items-center gap-2 font-semibold ${rating.color}`}>
              <rating.icon className="w-4 h-4" /> {rating.label}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ============================ PDF Toolkit ============================ */

type PdfToolMode = 'merge' | 'image' | 'compress' | 'text';

interface PdfToolConfig {
  id: PdfToolMode;
  title: string;
  desc: string;
  icon: typeof FileStack;
  color: string;
  border: string;
  accept: string;
  multiple: boolean;
}

const PDF_TOOLS: PdfToolConfig[] = [
  { id: 'merge', title: 'Merge PDF', desc: 'Combine multiple PDFs into one file', icon: FileStack, color: 'text-neon-cyan', border: 'border-neon-cyan/20', accept: 'application/pdf', multiple: true },
  { id: 'image', title: 'Image to PDF', desc: 'Convert JPG, PNG images to PDF', icon: ImageIcon, color: 'text-neon-violet', border: 'border-neon-violet/20', accept: 'image/jpeg,image/png', multiple: true },
  { id: 'compress', title: 'Compress PDF', desc: 'Reduce PDF file size', icon: FileDown, color: 'text-neon-pink', border: 'border-neon-pink/20', accept: 'application/pdf', multiple: false },
  { id: 'text', title: 'PDF to Text', desc: 'Extract text from PDF documents', icon: Edit, color: 'text-neon-lime', border: 'border-neon-lime/20', accept: 'application/pdf', multiple: false },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadBlob(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const src = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  return merged.save();
}

async function imagesToPdf(files: File[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    let img;
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      img = await pdf.embedJpg(bytes);
    } else {
      img = await pdf.embedPng(bytes);
    }
    const page = pdf.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  return pdf.save();
}

async function compressPdf(file: File): Promise<Uint8Array> {
  const srcBytes = await file.arrayBuffer();
  const src = await PDFDocument.load(srcBytes);
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, src.getPageIndices());
  pages.forEach((p) => out.addPage(p));
  out.setCreator('');
  out.setProducer('');
  return out.save({ useObjectStreams: true });
}

async function extractTextFromPdf(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const pageCount = pdf.numPages;
  const parts: string[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => 'str' in item ? item.str : '')
      .join(' ');
    parts.push(`--- Page ${i} ---\n${pageText.trim()}`);
  }

  const fullText = parts.join('\n\n');
  return fullText.trim() || 'No extractable text found. This PDF may contain scanned images instead of text.';
}

function PDFToolkit() {
  const [activeMode, setActiveMode] = useState<PdfToolMode>('merge');
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeTool = PDF_TOOLS.find((t) => t.id === activeMode)!;

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    const valid = arr.filter((f) => {
      if (activeMode === 'image') return f.type === 'image/jpeg' || f.type === 'image/png';
      return f.type === 'application/pdf';
    });
    if (valid.length === 0) {
      setError(`Please select ${activeMode === 'image' ? 'JPG or PNG images' : 'PDF files'}.`);
      return;
    }
    setError(null);
    setExtractedText(null);
    if (activeTool.multiple) {
      setFiles((prev) => [...prev, ...valid]);
    } else {
      setFiles(valid.slice(0, 1));
    }
  }, [activeMode, activeTool.multiple]);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setExtractedText(null);
  };

  const clearAll = () => {
    setFiles([]);
    setError(null);
    setExtractedText(null);
  };

  const switchMode = (mode: PdfToolMode) => {
    setActiveMode(mode);
    setFiles([]);
    setError(null);
    setExtractedText(null);
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    setExtractedText(null);

    try {
      if (activeMode === 'merge') {
        if (files.length < 2) {
          setError('Select at least 2 PDF files to merge.');
          setProcessing(false);
          return;
        }
        const result = await mergePdfs(files);
        downloadBlob(result, 'merged.pdf');
      } else if (activeMode === 'image') {
        if (files.length === 0) {
          setError('Select at least 1 image to convert.');
          setProcessing(false);
          return;
        }
        const result = await imagesToPdf(files);
        downloadBlob(result, 'images-converted.pdf');
      } else if (activeMode === 'compress') {
        const result = await compressPdf(files[0]);
        downloadBlob(result, `compressed-${files[0].name.replace(/\.pdf$/i, '')}.pdf`);
      } else if (activeMode === 'text') {
        const text = await extractTextFromPdf(files[0]);
        setExtractedText(text);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyText = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="glass-card p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-neon-pink/10 flex items-center justify-center">
          <Edit3 className="w-5 h-5 text-neon-pink" />
        </div>
        <div>
          <h3 className="font-display font-bold text-white">PDF Toolkit</h3>
          <p className="text-xs text-gray-400">Manage your study documents — all processing happens in your browser</p>
        </div>
      </div>

      {/* Tool selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {PDF_TOOLS.map((tool) => {
          const isActive = activeMode === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => switchMode(tool.id)}
              className={`group bg-ink-600/30 border ${isActive ? `${tool.border} bg-ink-600/50` : 'border-white/5'} rounded-xl p-4 text-left transition-all hover:bg-ink-600/50`}
            >
              <tool.icon className={`w-6 h-6 ${tool.color} mb-3`} />
              <div className="text-sm font-semibold text-white mb-1">{tool.title}</div>
              <div className="text-xs text-gray-400">{tool.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-neon-pink/50 bg-neon-pink/5'
            : 'border-white/10 hover:border-white/20 hover:bg-white/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={activeTool.accept}
          multiple={activeTool.multiple}
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
          className="hidden"
        />
        <Upload className={`w-8 h-8 mx-auto mb-2 ${dragOver ? 'text-neon-pink' : 'text-gray-500'}`} />
        <p className="text-sm text-gray-300">
          Drag & drop {activeMode === 'image' ? 'images' : 'PDF files'} here or click to upload
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {activeMode === 'image' ? 'JPG, PNG' : 'PDF'} · {activeTool.multiple ? 'Multiple files allowed' : 'Single file'} · Up to 50MB
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {files.length} file{files.length > 1 ? 's' : ''} selected · {formatBytes(files.reduce((a, f) => a + f.size, 0))}
            </span>
            <button
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          </div>
          <AnimatePresence>
            {files.map((file, i) => (
              <motion.div
                key={`${file.name}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 bg-ink-600/40 border border-white/5 rounded-lg px-4 py-2.5"
              >
                {activeMode === 'image' ? (
                  <ImageIcon className="w-4 h-4 text-neon-violet flex-shrink-0" />
                ) : (
                  <FileText className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{file.name}</div>
                  <div className="text-xs text-gray-500">{formatBytes(file.size)}</div>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="p-1 rounded text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5"
        >
          {error}
        </motion.div>
      )}

      {/* Process button */}
      {files.length > 0 && activeMode !== 'text' && (
        <button
          onClick={handleProcess}
          disabled={processing}
          className="mt-4 w-full bg-neon-gradient text-ink-900 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
          ) : (
            <><Download className="w-5 h-5" /> Process & Download</>
          )}
        </button>
      )}

      {files.length > 0 && activeMode === 'text' && (
        <button
          onClick={handleProcess}
          disabled={processing}
          className="mt-4 w-full bg-neon-gradient text-ink-900 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Extracting text...</>
          ) : (
            <><FileText className="w-5 h-5" /> Extract Text</>
          )}
        </button>
      )}

      {/* Extracted text result */}
      {extractedText !== null && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium">Extracted Text</span>
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 text-xs text-neon-lime hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy text'}
            </button>
          </div>
          <textarea
            readOnly
            value={extractedText}
            className="w-full h-48 bg-ink-700/50 border border-white/10 rounded-lg p-3 text-sm text-gray-300 font-mono resize-y outline-none focus:border-neon-lime/30 transition-all"
            placeholder="Extracted text will appear here..."
          />
        </motion.div>
      )}
    </div>
  );
}

/* ============================ Study Tools Section ============================ */

export function StudyTools() {
  return (
    <section id="tools" className="relative py-20 bg-ink-800/50">
      <div className="absolute inset-0 bg-grid-pattern bg-[size:60px_60px] opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="section-tag mb-4">
            <Brain className="w-3 h-3" /> Productivity
          </span>
          <EditableText field="toolsTitle" as="h2" className="font-display text-3xl sm:text-4xl font-bold text-white" />
          <EditableText field="toolsSubtitle" as="p" className="mt-3 text-gray-400 max-w-2xl mx-auto" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:row-span-1"
          >
            <PomodoroTimer />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ZScoreCalculator />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-2"
          >
            <PDFToolkit />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
