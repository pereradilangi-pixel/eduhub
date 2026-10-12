import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, ThumbsUp, Send, Tag, Clock, User, Loader2, Plus, X,
  CornerDownRight, Trash2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { EditableText } from '@/context/AdminContext';
import { FORUM_SEED, FORUM_REPLIES_SEED, SUBJECT_TAGS, type ForumPost, type ForumReply } from '@/data/mockData';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diff / 60000);
  return `${mins}m ago`;
}

export function CommunityForum() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({ author: '', subject_tag: 'Mathematics', title: '', body: '' });
  const [submitting, setSubmitting] = useState(false);
  const [votedPosts, setVotedPosts] = useState<Set<string>>(new Set());
  const [votedReplies, setVotedReplies] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState({ author: '', body: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      setPosts(FORUM_SEED.sort((a, b) => b.created_at.localeCompare(a.created_at)));
      setReplies(FORUM_REPLIES_SEED);
    } else {
      setPosts(data as ForumPost[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    if (!newPost.author.trim() || !newPost.title.trim() || !newPost.body.trim()) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        author: newPost.author.trim(),
        subject_tag: newPost.subject_tag,
        title: newPost.title.trim(),
        body: newPost.body.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      setPosts((prev) => [data as ForumPost, ...prev]);
    } else {
      const local: ForumPost = {
        id: crypto.randomUUID(),
        author: newPost.author.trim(),
        subject_tag: newPost.subject_tag,
        title: newPost.title.trim(),
        body: newPost.body.trim(),
        upvotes: 0,
        created_at: new Date().toISOString(),
      };
      setPosts((prev) => [local, ...prev]);
    }
    setNewPost({ author: '', subject_tag: 'Mathematics', title: '', body: '' });
    setShowForm(false);
    setSubmitting(false);
  };

  const togglePostVote = (postId: string) => {
    const hasVoted = votedPosts.has(postId);
    setVotedPosts((prev) => {
      const next = new Set(prev);
      if (hasVoted) next.delete(postId);
      else next.add(postId);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + (hasVoted ? -1 : 1) } : p))
    );
  };

  const toggleReplyVote = (replyId: string) => {
    const hasVoted = votedReplies.has(replyId);
    setVotedReplies((prev) => {
      const next = new Set(prev);
      if (hasVoted) next.delete(replyId);
      else next.add(replyId);
      return next;
    });
    setReplies((prev) =>
      prev.map((r) => (r.id === replyId ? { ...r, upvotes: r.upvotes + (hasVoted ? -1 : 1) } : r))
    );
  };

  const handleReply = (postId: string) => {
    if (!replyDraft.author.trim() || !replyDraft.body.trim()) return;
    const newReply: ForumReply = {
      id: crypto.randomUUID(),
      postId,
      author: replyDraft.author.trim(),
      body: replyDraft.body.trim(),
      upvotes: 0,
      created_at: new Date().toISOString(),
    };
    setReplies((prev) => [...prev, newReply]);
    setReplyDraft({ author: '', body: '' });
    setReplyingTo(null);
  };

  const deleteReply = (replyId: string) => {
    setReplies((prev) => prev.filter((r) => r.id !== replyId));
  };

  const filtered = activeTag === 'All' ? posts : posts.filter((p) => p.subject_tag === activeTag);

  return (
    <section id="community" className="relative py-20 bg-ink-800/50 dark:bg-ink-800/50 light:bg-gray-50 transition-colors">
      <div className="absolute inset-0 bg-grid-pattern bg-[size:60px_60px] opacity-20" />
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-neon-pink/5 rounded-full blur-[100px]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="section-tag mb-4">
            <MessageSquare className="w-3 h-3" /> Q&A Board
          </span>
          <EditableText field="communityTitle" as="h2" className="font-display text-3xl sm:text-4xl font-bold text-white dark:text-white light:text-gray-900" />
          <EditableText field="communitySubtitle" as="p" className="mt-3 text-gray-400 dark:text-gray-400 light:text-gray-600 max-w-2xl mx-auto" />
        </motion.div>

        {/* New post button + Tag filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Ask a Question
          </button>

          <div className="flex flex-wrap gap-2">
            {SUBJECT_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTag === tag
                    ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Posts list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((post, i) => {
                const postReplies = replies.filter((r) => r.postId === post.id);
                return (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="glass-card p-5 group hover:border-neon-cyan/15 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Upvote */}
                      <button
                        onClick={() => togglePostVote(post.id)}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all flex-shrink-0 ${
                          votedPosts.has(post.id)
                            ? 'bg-neon-cyan/15 text-neon-cyan'
                            : 'bg-ink-600/40 text-gray-400 hover:text-neon-cyan hover:bg-neon-cyan/10'
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${votedPosts.has(post.id) ? 'fill-current' : ''}`} />
                        <span className="text-sm font-bold">{post.upvotes}</span>
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-neon-violet/10 text-neon-violet border border-neon-violet/20">
                            <Tag className="w-3 h-3" /> {post.subject_tag}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="w-3 h-3" /> {post.author}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" /> {timeAgo(post.created_at)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-white dark:text-white light:text-gray-900 text-base mb-2">{post.title}</h3>
                        <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 leading-relaxed">{post.body}</p>

                        {/* Reply button */}
                        <button
                          onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                          className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 hover:text-neon-cyan transition-colors"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          {postReplies.length > 0 ? `${postReplies.length} repl${postReplies.length > 1 ? 'ies' : 'y'}` : 'Reply'}
                        </button>

                        {/* Reply form */}
                        <AnimatePresence>
                          {replyingTo === post.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-3"
                            >
                              <div className="space-y-2 pl-4 border-l-2 border-neon-cyan/20">
                                <input
                                  type="text"
                                  value={replyDraft.author}
                                  onChange={(e) => setReplyDraft({ ...replyDraft, author: e.target.value })}
                                  placeholder="Your name"
                                  className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 placeholder:text-gray-500 outline-none focus:border-neon-cyan/40 transition-all"
                                />
                                <textarea
                                  value={replyDraft.body}
                                  onChange={(e) => setReplyDraft({ ...replyDraft, body: e.target.value })}
                                  placeholder="Write your reply..."
                                  rows={2}
                                  className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-lg px-3 py-2 text-sm text-white dark:text-white light:text-gray-900 placeholder:text-gray-500 outline-none focus:border-neon-cyan/40 transition-all resize-none"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleReply(post.id)}
                                    disabled={!replyDraft.author.trim() || !replyDraft.body.trim()}
                                    className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50"
                                  >
                                    <Send className="w-3.5 h-3.5" /> Post Reply
                                  </button>
                                  <button
                                    onClick={() => { setReplyingTo(null); setReplyDraft({ author: '', body: '' }); }}
                                    className="btn-ghost text-xs px-3 py-2"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Replies */}
                        {postReplies.length > 0 && (
                          <div className="mt-4 space-y-3 pl-4 border-l-2 border-white/5 dark:border-white/5 light:border-gray-200">
                            {postReplies.map((reply) => (
                              <motion.div
                                key={reply.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-ink-600/30 dark:bg-ink-600/30 light:bg-gray-100 rounded-lg p-3"
                              >
                                <div className="flex items-start gap-3">
                                  <button
                                    onClick={() => toggleReplyVote(reply.id)}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all flex-shrink-0 ${
                                      votedReplies.has(reply.id)
                                        ? 'text-neon-cyan bg-neon-cyan/10'
                                        : 'text-gray-500 hover:text-neon-cyan hover:bg-neon-cyan/5'
                                    }`}
                                  >
                                    <ThumbsUp className={`w-3.5 h-3.5 ${votedReplies.has(reply.id) ? 'fill-current' : ''}`} />
                                    <span className="text-xs font-bold">{reply.upvotes}</span>
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <User className="w-3 h-3" /> {reply.author}
                                      </span>
                                      <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {timeAgo(reply.created_at)}
                                      </span>
                                      <button
                                        onClick={() => deleteReply(reply.id)}
                                        className="ml-auto p-1 text-gray-600 hover:text-red-400 transition-colors"
                                        title="Delete reply"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <p className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-700 leading-relaxed">{reply.body}</p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No posts yet for {activeTag}. Be the first to ask!</p>
          </div>
        )}
      </div>

      {/* New post modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-lg space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-white dark:text-white light:text-gray-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-neon-cyan" /> New Question
                </h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <input
                type="text"
                value={newPost.author}
                onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                placeholder="Your name"
                className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-xl px-4 py-3 text-sm text-white dark:text-white light:text-gray-900 placeholder:text-gray-500 outline-none focus:border-neon-cyan/40 transition-all"
              />

              <select
                value={newPost.subject_tag}
                onChange={(e) => setNewPost({ ...newPost, subject_tag: e.target.value })}
                className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-xl px-4 py-3 text-sm text-white dark:text-white light:text-gray-900 outline-none focus:border-neon-cyan/40 transition-all"
              >
                {SUBJECT_TAGS.filter((t) => t !== 'All').map((tag) => (
                  <option key={tag} value={tag} className="bg-ink-700 dark:bg-ink-700 light:bg-white">{tag}</option>
                ))}
              </select>

              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="Question title"
                className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-xl px-4 py-3 text-sm text-white dark:text-white light:text-gray-900 placeholder:text-gray-500 outline-none focus:border-neon-cyan/40 transition-all"
              />

              <textarea
                value={newPost.body}
                onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                placeholder="Describe your question or share study tips..."
                rows={4}
                className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-xl px-4 py-3 text-sm text-white dark:text-white light:text-gray-900 placeholder:text-gray-500 outline-none focus:border-neon-cyan/40 transition-all resize-none"
              />

              <button
                onClick={handleSubmit}
                disabled={submitting || !newPost.author.trim() || !newPost.title.trim() || !newPost.body.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post Question
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
