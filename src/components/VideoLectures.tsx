import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Edit2, Trash2, Plus, X, Video, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/context/AdminContext';

interface VideoLecture {
  id: string;
  title: string;
  teacher_name: string;
  thumbnail_url: string;
  youtube_url: string;
  description: string;
  sort_order: number;
}

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : '';
}

export function VideoLectures() {
  const { editMode } = useAdmin();
  const [videos, setVideos] = useState<VideoLecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<VideoLecture | null>(null);
  const [editing, setEditing] = useState<VideoLecture | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const loadVideos = useCallback(async () => {
    const { data } = await supabase.from('video_lectures').select('*').order('sort_order');
    setVideos(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadVideos(); }, [loadVideos]);

  const handleSave = async (video: VideoLecture) => {
    if (videos.some((v) => v.id === video.id)) {
      await supabase.from('video_lectures').update(video).eq('id', video.id);
    } else {
      await supabase.from('video_lectures').insert(video);
    }
    setShowEditor(false); setEditing(null);
    loadVideos();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('video_lectures').delete().eq('id', id);
    loadVideos();
  };

  return (
    <section id="video-lectures" className="relative py-20 bg-ink-800/50 dark:bg-ink-800/50 light:bg-gray-50 transition-colors">
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-neon-cyan/5 rounded-full blur-[100px]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center"><Video className="w-5 h-5 text-red-400" /></div>
            <div>
              <span className="section-tag mb-2"><Video className="w-3 h-3" /> Featured Classes</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white dark:text-white light:text-gray-900">Featured Classes & Seminars</h2>
              <p className="text-sm text-gray-400 mt-1">Watch video lectures from top Sri Lankan teachers</p>
            </div>
          </div>
          {editMode && (
            <button onClick={() => { setEditing(null); setShowEditor(true); }} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Video</button>
          )}
        </motion.div>

        {loading ? (
          <div className="text-center py-12"><Video className="w-10 h-10 text-gray-600 mx-auto mb-3 animate-pulse" /><p className="text-gray-500 text-sm">Loading videos...</p></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map((video, i) => {
              const ytId = extractYouTubeId(video.youtube_url);
              const thumb = video.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '');
              return (
                <motion.div key={video.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="glass-card p-0 overflow-hidden group hover:border-red-400/20 transition-all relative">
                  {editMode && (
                    <div className="absolute top-2 right-2 z-10 flex gap-1">
                      <button onClick={() => { setEditing(video); setShowEditor(true); }} className="p-1.5 rounded-lg bg-black/40 text-gray-300 hover:text-neon-cyan"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(video.id)} className="p-1.5 rounded-lg bg-black/40 text-gray-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                  <button onClick={() => setPlaying(video)} className="block w-full text-left">
                    <div className="relative aspect-video bg-ink-700/50 dark:bg-ink-700/50 light:bg-gray-200 overflow-hidden">
                      {thumb ? (
                        <img src={thumb} alt={video.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="flex items-center justify-center h-full"><Video className="w-10 h-10 text-gray-600" /></div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                          <Play className="w-6 h-6 text-white fill-white ml-1" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white dark:text-white light:text-gray-900 text-sm leading-snug mb-2 line-clamp-2">{video.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <User className="w-3.5 h-3.5" /> {video.teacher_name}
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {playing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPlaying(null)} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-lg font-bold text-white">{playing.title}</h3>
                <button onClick={() => setPlaying(null)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <div className="aspect-video rounded-xl overflow-hidden bg-black">
                {extractYouTubeId(playing.youtube_url) ? (
                  <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${extractYouTubeId(playing.youtube_url)}?autoplay=1`} title={playing.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500"><a href={playing.youtube_url} target="_blank" rel="noopener noreferrer" className="text-neon-cyan underline">Open on YouTube</a></div>
                )}
              </div>
              {playing.description && <p className="text-sm text-gray-400 mt-3">{playing.description}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && <VideoEditor video={editing} onSave={handleSave} onClose={() => { setShowEditor(false); setEditing(null); }} />}
      </AnimatePresence>
    </section>
  );
}

function VideoEditor({ video, onSave, onClose }: { video: VideoLecture | null; onSave: (v: VideoLecture) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<VideoLecture>(() => video ?? {
    id: `vid_${Date.now()}`, title: '', teacher_name: '', thumbnail_url: '', youtube_url: '', description: '', sort_order: 0,
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white dark:text-white light:text-gray-900">{video ? 'Edit Video' : 'Add Video'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Class Title</label>
            <input type="text" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Teacher Name</label>
            <input type="text" value={draft.teacher_name} onChange={(e) => setDraft({ ...draft, teacher_name: e.target.value })} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">YouTube Video URL</label>
            <input type="text" value={draft.youtube_url} onChange={(e) => setDraft({ ...draft, youtube_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Custom Thumbnail URL (optional — auto from YouTube if blank)</label>
            <input type="text" value={draft.thumbnail_url} onChange={(e) => setDraft({ ...draft, thumbnail_url: e.target.value })} placeholder="https://..." className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={2} className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={() => onSave(draft)} disabled={!draft.title.trim() || !draft.youtube_url.trim()} className="btn-primary flex-1 text-sm disabled:opacity-50">Save</button>
          <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
