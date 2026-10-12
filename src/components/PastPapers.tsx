import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Download, Eye, X, FileText, Filter,
  BookOpen, Star, Clock, TrendingUp, Settings2, CheckCircle2,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { EditableText, useAdmin } from '@/context/AdminContext';
import { useResources } from '@/context/ResourcesContext';
import type { PaperResource } from '@/data/mockData';
import { AdBanner } from './AdBanner';
import { DownloadPromoModal } from './DownloadPromoModal';
import { AdminResourceManager } from './AdminResourceManager';

const STREAMS = ['All', 'O/L', 'A/L Science', 'A/L Commerce', 'A/L Arts', 'A/L Technology'] as const;
const TYPES = ['All', 'Past Paper', 'Model Paper', 'Marking Scheme', 'Revision Notes'] as const;

function PaperIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] || FileText;
  return <Icon className={className} />;
}

function PaperCard({
  paper,
  onPreview,
  onDownload,
}: {
  paper: PaperResource;
  onPreview: () => void;
  onDownload: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="glass-card p-5 group hover:border-neon-cyan/20 transition-all relative overflow-hidden"
    >
      {/* FREE badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500/15 text-green-400 text-[10px] font-bold px-2 py-1 rounded-full border border-green-500/20">
        FREE
      </div>

      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-neon-cyan/10 text-neon-cyan">
          <PaperIcon name={paper.icon} className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white text-sm leading-snug mb-1 line-clamp-2">{paper.title}</h3>
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-ink-600/60 text-gray-400">{paper.stream}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-ink-600/60 text-gray-400">{paper.type}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4 line-clamp-2">{paper.description}</p>

      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {paper.downloads.toLocaleString()}</span>
        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {paper.pages}p</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {paper.year}</span>
        <span>{paper.fileSize}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onPreview}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-ink-600/40 text-gray-300 text-xs font-medium hover:bg-ink-600/60 hover:text-white transition-all"
        >
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
        <button
          onClick={onDownload}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-neon-cyan/10 text-neon-cyan text-xs font-medium hover:bg-neon-cyan/20 transition-all"
        >
          <Download className="w-3.5 h-3.5" /> Download
        </button>
      </div>
    </motion.div>
  );
}

function PreviewModal({ paper, onClose, onDownload }: { paper: PaperResource; onClose: () => void; onDownload: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-neon-cyan/10 text-neon-cyan">
              <PaperIcon name={paper.icon} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">{paper.title}</h3>
              <span className="text-xs text-gray-500">{paper.stream} · {paper.year}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-ink-900/60 rounded-xl border border-white/5 p-8 mb-4 min-h-[300px] flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-neon-cyan/10 flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-neon-cyan" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">{paper.title}</h4>
            <p className="text-sm text-gray-400 text-center max-w-md mb-4">{paper.description}</p>
            <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
              <div className="text-center">
                <div className="text-xs text-gray-500">Pages</div>
                <div className="text-sm font-bold text-white">{paper.pages}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Size</div>
                <div className="text-sm font-bold text-white">{paper.fileSize}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Downloads</div>
                <div className="text-sm font-bold text-white">{paper.downloads.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onDownload}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" /> Download Free
            </button>
            <button onClick={onClose} className="btn-ghost px-6">Close</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function PastPapers() {
  const { editMode } = useAdmin();
  const { papers, updatePaper } = useResources();
  const [search, setSearch] = useState('');
  const [stream, setStream] = useState<string>('All');
  const [type, setType] = useState<string>('All');
  const [preview, setPreview] = useState<PaperResource | null>(null);
  const [promoPaper, setPromoPaper] = useState<PaperResource | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const filtered = useMemo(() => {
    return papers.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.subject.toLowerCase().includes(search.toLowerCase()) ||
        p.stream.toLowerCase().includes(search.toLowerCase());
      const matchStream = stream === 'All' || p.stream === stream;
      const matchType = type === 'All' || p.type === type;
      return matchSearch && matchStream && matchType;
    });
  }, [papers, search, stream, type]);

  const handleDownload = (paper: PaperResource) => {
    updatePaper(paper.id, { downloads: paper.downloads + 1 });

    const url = paper.fileUrl;
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setPromoPaper(paper);
  };

  return (
    <section id="papers" className="relative py-20">
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-neon-violet/5 rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="section-tag mb-4">
            <BookOpen className="w-3 h-3" /> Resource Library
          </span>
          <EditableText field="papersTitle" as="h2" className="font-display text-3xl sm:text-4xl font-bold text-white" />
          <EditableText field="papersSubtitle" as="p" className="mt-3 text-gray-400 max-w-2xl mx-auto" />

          {/* Free + Admin badges */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All papers 100% Free
            </span>
            {editMode && (
              <button
                onClick={() => setShowAdmin(true)}
                className="flex items-center gap-1.5 text-xs text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20 rounded-full px-3 py-1 hover:bg-neon-cyan/20 transition-all"
              >
                <Settings2 className="w-3.5 h-3.5" /> Manage Resources
              </button>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <div className="glass-card p-5 mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, subject, or stream..."
              className="w-full bg-ink-600/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-neon-cyan/40 transition-all"
            />
          </div>

          {/* Stream filters */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mr-2">
              <Filter className="w-4 h-4" /> Stream:
            </div>
            {STREAMS.map((s) => (
              <button
                key={s}
                onClick={() => setStream(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  stream === s
                    ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Type filters */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mr-2">
              <Star className="w-4 h-4" /> Type:
            </div>
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  type === t
                    ? 'bg-neon-violet/15 text-neon-violet border border-neon-violet/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">
            <span className="text-neon-cyan font-bold">{filtered.length}</span> resources found
          </p>
          <TrendingUp className="w-4 h-4 text-gray-500" />
        </div>

        {/* Grid */}
        <motion.div
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                onPreview={() => setPreview(paper)}
                onDownload={() => handleDownload(paper)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            {papers.length === 0 ? (
              <>
                <p className="text-gray-400 mb-2">No resources yet.</p>
                <p className="text-sm text-gray-500">
                  {editMode
                    ? 'Click "Manage Resources" above to add your first past paper.'
                    : 'Toggle Edit mode in the header to add resources.'}
                </p>
              </>
            ) : (
              <p className="text-gray-400">No papers found. Try adjusting your search or filters.</p>
            )}
          </div>
        )}

        {/* Download section ad */}
        <div className="mt-10">
          <AdBanner slot="download-section" className="h-20" />
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {preview && (
          <PreviewModal
            paper={preview}
            onClose={() => setPreview(null)}
            onDownload={() => { setPreview(null); handleDownload(preview); }}
          />
        )}
      </AnimatePresence>

      {promoPaper && (
        <DownloadPromoModal paper={promoPaper} onClose={() => setPromoPaper(null)} />
      )}

      <AnimatePresence>
        {showAdmin && <AdminResourceManager onClose={() => setShowAdmin(false)} />}
      </AnimatePresence>
    </section>
  );
}
