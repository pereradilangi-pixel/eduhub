import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, Sparkles, FileText, HelpCircle, Lightbulb, Loader2,
  Key, X, Settings, Trash2, Mic, Volume2, Square,
} from 'lucide-react';
import { EditableText } from '@/context/AdminContext';
import { callGemini, getActiveApiKey, getStoredApiKey, saveApiKey, removeApiKey } from '@/lib/gemini';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  { label: 'Generate Quiz', icon: HelpCircle, text: 'Generate a 5-question quiz on photosynthesis for O/L Biology.' },
  { label: 'Quick Notes', icon: FileText, text: 'Create quick revision notes on Newton\'s Laws of Motion for A/L Physics.' },
  { label: 'Explain Concept', icon: Lightbulb, text: 'Explain the concept of demand and supply in Economics for A/L Commerce.' },
];

/* ---------- Smart fallback knowledge base ---------- */

interface KnowledgeEntry { keywords: string[]; title: string; content: string; }

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  { keywords: ['photosynthesis', 'chlorophyll', 'chloroplast'], title: 'Photosynthesis',
    content: `Photosynthesis — Complete Explanation:

Photosynthesis is the process by which green plants convert light energy into chemical energy (glucose).

** Equation: ** 6CO2 + 6H2O -> C6H12O6 + 6O2

** Two Stages: **
1. Light-Dependent Reactions (thylakoid membrane): Chlorophyll absorbs light, water splits, ATP and NADPH produced, O2 released.
2. Calvin Cycle (stroma): CO2 fixed by RuBisCO, uses ATP+NADPH, produces glucose.

** Key points: ** Chlorophyll is primary pigment. Xylem transports water. Phloem transports glucose. Stomata allow gas exchange.` },
  { keywords: ['newton', 'force', 'motion', 'inertia', 'momentum', 'acceleration'], title: "Newton's Laws",
    content: `Newton's Laws of Motion:

1. First Law (Inertia): Object stays at rest or in uniform motion unless net external force acts.
2. Second Law: F = ma. Force = mass x acceleration.
3. Third Law: Every action has equal and opposite reaction.

Key formulas: F=ma, p=mv, Impulse=F*t, Weight=W=mg (g=9.8)` },
  { keywords: ['demand', 'supply', 'economics', 'equilibrium', 'market'], title: 'Demand and Supply',
    content: `Demand and Supply:

Demand: Quantity consumers willing to buy at given price. Law of Demand: price up -> demand down.
Supply: Quantity producers willing to sell. Law of Supply: price up -> supply up.
Equilibrium: Qd = Qs, determines market price.` },
  { keywords: ['bmi', 'body mass index', 'weight', 'obesity'], title: 'BMI',
    content: `BMI (Body Mass Index):

Formula: BMI = weight(kg) / height(m)^2
Categories: Underweight <18.5, Normal 18.5-24.9, Overweight 25-29.9, Obese >=30.
Example: 60kg, 1.7m -> BMI = 60/2.89 = 20.76 (Normal).
Limitations: Doesn't distinguish fat vs muscle.` },
  { keywords: ['organic chemistry', 'alkene', 'alkane', 'alcohol', 'ester'], title: 'Organic Chemistry',
    content: `Organic Chemistry:

Homologous series: Alkanes (CnH2n+2), Alkenes (CnH2n), Alcohols, Carboxylic acids.
Key reactions: Combustion, Addition, Fermentation, Esterification.
Tests: Bromine water (unsaturation), Litmus (acids), Sodium (alcohols).` },
  { keywords: ['electricity', 'ohm', 'voltage', 'current', 'resistance', 'circuit'], title: 'Electricity',
    content: `Electricity:

Ohm's Law: V = IR. Power: P = VI = I^2R.
Series: same current, R = R1+R2+... Parallel: same voltage, 1/R = 1/R1+1/R2+...` },
  { keywords: ['cell', 'mitosis', 'meiosis', 'chromosome', 'dna'], title: 'Cell Division',
    content: `Cell Division:

Mitosis: 2 identical cells, same chromosome number, for growth/repair.
Meiosis: 4 different gametes, half chromosome number, for reproduction.
DNA: Double helix, bases A-T, G-C.` },
  { keywords: ['sri lanka', 'history', 'king', 'anuradhapura', 'polonnaruwa', 'independence'], title: 'Sri Lankan History',
    content: `Sri Lankan History:

Ancient: Vijaya (~543 BC), Anuradhapura Kingdom, King Dutugemunu defeated Elara (161 BC).
Colonial: Portuguese (1505), Dutch (1658), British (1796).
Independence: Feb 4, 1948. Republic: 1972.` },
  { keywords: ['differentiation', 'derivative', 'calculus', 'integration', 'integral'], title: 'Calculus',
    content: `Calculus:

Differentiation: Power rule d/dx(x^n)=n*x^(n-1). Chain, Product, Quotient rules.
Integration: Power rule. Applications: velocity=derivative of displacement, area=integral.` },
  { keywords: ['wave', 'frequency', 'wavelength', 'amplitude', 'sound', 'light'], title: 'Waves',
    content: `Waves:

v = f x lambda. Transverse (light) vs Longitudinal (sound).
Sound: ~340 m/s in air. Light: 3x10^8 m/s.
Electromagnetic spectrum: Radio to Gamma.` },
  { keywords: ['english', 'grammar', 'tense', 'essay', 'writing', 'passive', 'active voice'], title: 'English Grammar',
    content: `English Grammar:

Tenses: Present Simple, Past Simple, Present Perfect, Future.
Active vs Passive: "Teacher explains" vs "Lesson is explained".
Essay: Intro -> Body -> Conclusion. Use linking words.` },
  { keywords: ['periodic table', 'element', 'atomic', 'electron', 'proton', 'neutron'], title: 'Periodic Table',
    content: `Periodic Table:

Atomic structure: Protons(+), Neutrons(0), Electrons(-).
Electronic config: Shell 1: 2, Shell 2: 8, Shell 3: 8.
Groups: similar properties. Periods: same shells. Group 1 reactive, Group 18 noble.` },
];

function detectLanguage(text: string): 'si' | 'en' {
  return /[\u0D80-\u0DFF]/.test(text) ? 'si' : 'en';
}

function findKnowledge(input: string): KnowledgeEntry | null {
  const lower = input.toLowerCase();
  let best: KnowledgeEntry | null = null;
  let bestScore = 0;
  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) if (lower.includes(kw)) score += kw.length;
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  return bestScore > 0 ? best : null;
}

function extractTopic(input: string): string {
  const remove = ['explain','what','is','how','do','does','why','tell','me','about','the','a','an','create','generate','make','give','notes','on','for','please','can','you','i','need','help','study','revision','summary','quiz','mcq','questions','question','ol','al','o/l','a/l','level','exam','test'];
  let words = input.toLowerCase().split(/[\s,.?]+/).filter((w) => w.length > 2 && !remove.includes(w));
  if (words.length === 0) words = input.toLowerCase().split(/[\s,.?]+/).filter((w) => w.length > 1);
  return words.slice(0, 5).join(' ');
}

function generateSmartResponse(input: string): string {
  const lang = detectLanguage(input);
  const lower = input.toLowerCase();

  if (/^(hello|hi|hey|greetings|ayubowan|kohomada)/i.test(input.trim())) {
    return lang === 'si'
      ? `ආයුබෝවන්! මම ඔබගේ AI අධ්‍යාපන සහායකයා. මට O/L සහ A/L විෂයන් පිළිබඳ ප්‍රශ්න විසඳිය හැක. අසන්න!`
      : `Hello! I'm your AI Study Assistant. I can help with O/L and A/L subjects. Ask me any question!`;
  }

  const knowledge = findKnowledge(input);
  if (knowledge) return knowledge.content;

  const topic = extractTopic(input);
  if (lang === 'si') {
    return `"${topic}" පිළිබඳව: මෙම මාතෘකාව පිළිබඳ මූලික සංකල්ප හඳුනාගන්න. සූත්‍ර පුහුණු වන්න. පසුගිය විභාගය ප්‍රශ්න විසඳන්න. වඩාත් සවිස්තරාත්මක පිළිතුරු සඳහා Gemini API key එකක් එක් කරන්න!`;
  }
  return `Here's what I can tell you about "${topic}":\n\n1. Identify the key concepts and definitions.\n2. Practice relevant formulas and their applications.\n3. Solve past paper questions on this topic.\n\nFor detailed AI-powered explanations, add your free Gemini API key via the Settings icon!`;
}

/* ---------- Typing animation ---------- */

function useTypingText(fullText: string, speed = 8) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDisplayed(''); setDone(false); indexRef.current = 0;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (indexRef.current >= fullText.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setDone(true); return;
      }
      const nextIdx = indexRef.current + Math.ceil(fullText.length / 200);
      indexRef.current = Math.min(nextIdx, fullText.length);
      setDisplayed(fullText.slice(0, indexRef.current));
    }, speed);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fullText, speed]);

  return { displayed, done };
}

function TypingMessage({ content, isTyping }: { content: string; isTyping: boolean }) {
  const { displayed, done } = useTypingText(content, isTyping ? 8 : 0);
  if (!isTyping || done) return <span className="whitespace-pre-wrap">{content}</span>;
  return (
    <span className="whitespace-pre-wrap">
      {displayed}
      <span className="inline-block w-2 h-4 bg-neon-cyan ml-0.5 animate-pulse" />
    </span>
  );
}

/* ---------- Main Component ---------- */

export function AIAssistant() {
  const envApiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  const [userApiKey, setUserApiKey] = useState<string>(() => getStoredApiKey());
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your AI Study Assistant. I can help you with O/L and A/L questions, generate quizzes, create revision notes, and explain concepts. Ask me anything or try the quick prompts below! You can also use the microphone button to speak your question." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiError, setApiError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenMessageIdx, setSpokenMessageIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const activeApiKey = userApiKey || (envApiKey && envApiKey.length > 10 ? envApiKey : undefined);
  const isAiConnected = !!activeApiKey;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const speakText = useCallback((text: string, msgIdx: number) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking && spokenMessageIdx === msgIdx) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpokenMessageIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.onend = () => { setIsSpeaking(false); setSpokenMessageIdx(null); };
    utterance.onerror = () => { setIsSpeaking(false); setSpokenMessageIdx(null); };
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setSpokenMessageIdx(msgIdx);
  }, [isSpeaking, spokenMessageIdx]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, [isListening]);

  const handleSend = useCallback(async (text?: string) => {
    const message = text || input.trim();
    if (!message || loading) return;
    setInput('');
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false); setSpokenMessageIdx(null);
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setLoading(true);
    try {
      let response: string;
      if (activeApiKey) {
        try {
          response = await callGemini(`Student question: ${message}`, activeApiKey);
        } catch {
          response = generateSmartResponse(message);
        }
      } else {
        await new Promise((r) => setTimeout(r, 400));
        response = generateSmartResponse(message);
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I had trouble generating a response. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, activeApiKey]);

  const handleSaveApiKey = () => {
    const key = apiKeyInput.trim();
    if (key.length > 10) {
      saveApiKey(key);
      setUserApiKey(key);
      setShowSettings(false);
      setApiKeyInput(''); setApiError('');
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Gemini API key connected! I can now provide full AI-powered responses. Try asking me something!' }]);
    } else {
      setApiError('Please enter a valid API key (at least 10 characters).');
    }
  };

  const handleRemoveApiKey = () => {
    removeApiKey();
    setUserApiKey(''); setApiKeyInput(''); setApiError('');
  };

  const handleClearChat = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false); setSpokenMessageIdx(null);
    setMessages([{ role: 'assistant', content: "Chat cleared! Ask me a new question anytime." }]);
  };

  const speechSupported = typeof window !== 'undefined' && (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window));
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  return (
    <section id="ai" className="relative py-20 overflow-hidden">
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-neon-cyan/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-neon-violet/5 rounded-full blur-[100px]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-10">
          <span className="section-tag mb-4"><Bot className="w-3 h-3" /> AI Powered</span>
          <EditableText field="aiTitle" as="h2" className="font-display text-3xl sm:text-4xl font-bold text-white dark:text-white light:text-gray-900" />
          <EditableText field="aiSubtitle" as="p" className="mt-3 text-gray-400 dark:text-gray-400 light:text-gray-600 max-w-2xl mx-auto" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="glass-card overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 dark:border-white/5 light:border-gray-200 bg-ink-700/40 dark:bg-ink-700/40 light:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-neon-gradient flex items-center justify-center"><Bot className="w-5 h-5 text-ink-900" /></div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-ink-700 dark:border-ink-700 light:border-gray-50" />
              </div>
              <div>
                <div className="font-semibold text-white dark:text-white light:text-gray-900 text-sm">Gemini AI Tutor</div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${isAiConnected ? 'bg-green-400' : 'bg-amber-400'}`} />
                  {isAiConnected ? 'AI Connected' : 'Smart Mode — add API key for full AI'}
                  {speechSupported && <span className="ml-1 text-neon-cyan">· Voice Ready</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleClearChat} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-gray-100 transition-all" title="Clear chat"><Trash2 className="w-4 h-4" /></button>
              <button onClick={() => { setApiKeyInput(userApiKey); setShowSettings(true); setApiError(''); }} className="p-2 rounded-lg text-gray-400 hover:text-neon-cyan hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-gray-100 transition-all" title="API Settings"><Settings className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="h-[400px] overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-ink-500 dark:bg-ink-500 light:bg-gray-300' : 'bg-neon-gradient'}`}>
                  {msg.role === 'user' ? <span className="text-xs font-bold text-white dark:text-white light:text-gray-700">You</span> : <Bot className="w-4 h-4 text-ink-900" />}
                </div>
                <div className="max-w-[80%]">
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-neon-cyan/10 text-gray-100 dark:text-gray-100 light:text-gray-800 rounded-tr-sm'
                      : 'bg-ink-600/60 dark:bg-ink-600/60 light:bg-gray-100 text-gray-200 dark:text-gray-200 light:text-gray-700 rounded-tl-sm border border-white/5 dark:border-white/5 light:border-gray-200'
                  }`}>
                    <TypingMessage content={msg.content} isTyping={i === messages.length - 1 && msg.role === 'assistant' && !loading} />
                  </div>
                  {msg.role === 'assistant' && ttsSupported && i !== 0 && (
                    <button
                      onClick={() => speakText(msg.content, i)}
                      className={`mt-1 flex items-center gap-1 text-xs transition-colors ${isSpeaking && spokenMessageIdx === i ? 'text-neon-cyan' : 'text-gray-500 hover:text-neon-cyan'}`}
                    >
                      {isSpeaking && spokenMessageIdx === i ? <><Square className="w-3 h-3" /> Stop</> : <><Volume2 className="w-3 h-3" /> Listen</>}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-neon-gradient flex items-center justify-center flex-shrink-0"><Bot className="w-4 h-4 text-ink-900" /></div>
                <div className="bg-ink-600/60 dark:bg-ink-600/60 light:bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-neon-cyan" /><span className="text-sm text-gray-400">Thinking...</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick prompts */}
          <div className="px-5 py-3 border-t border-white/5 dark:border-white/5 light:border-gray-200 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button key={p.label} onClick={() => handleSend(p.text)} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ink-600/50 dark:bg-ink-600/50 light:bg-gray-100 text-xs text-gray-300 dark:text-gray-300 light:text-gray-600 hover:text-neon-cyan hover:bg-neon-cyan/10 border border-white/5 dark:border-white/5 light:border-gray-200 hover:border-neon-cyan/20 transition-all disabled:opacity-50">
                <p.icon className="w-3.5 h-3.5" /> {p.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-white/5 dark:border-white/5 light:border-gray-200 flex gap-3 items-center">
            {speechSupported && (
              <button
                onClick={startListening}
                className={`p-3 rounded-xl border transition-all flex-shrink-0 ${isListening ? 'bg-red-400/20 border-red-400/40 text-red-400 animate-pulse' : 'border-white/10 dark:border-white/10 light:border-gray-200 text-gray-400 hover:text-neon-cyan hover:border-neon-cyan/40'}`}
                title={isListening ? 'Stop recording' : 'Speak your question'}
              >
                {isListening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? 'Listening...' : "Ask any question — or use the mic to speak"}
              className="flex-1 bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-xl px-4 py-3 text-sm text-white dark:text-white light:text-gray-900 placeholder:text-gray-500 outline-none focus:border-neon-cyan/40 focus:ring-2 focus:ring-neon-cyan/20 transition-all"
            />
            <button onClick={() => handleSend()} disabled={loading || !input.trim()} className="bg-neon-gradient text-ink-900 font-semibold px-4 py-3 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex-shrink-0">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          {isAiConnected ? 'Powered by Google Gemini 1.5 Flash' : 'Smart Mode active — add your free Gemini API key via Settings for full AI responses'}
        </p>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettings(false)} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-white dark:text-white light:text-gray-900 flex items-center gap-2"><Key className="w-5 h-5 text-neon-cyan" /> Gemini API Key</h3>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              {envApiKey ? (
                <div className="bg-green-400/10 border border-green-400/20 rounded-xl p-3 text-sm text-green-400 flex items-center gap-2"><Sparkles className="w-4 h-4" /> System API key is configured. AI responses are fully enabled.</div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">Enter your free Google Gemini API key for full AI-powered responses. Get one at <span className="text-neon-cyan font-mono">aistudio.google.com/apikey</span></p>
              )}
              {userApiKey && (
                <div className="flex items-center justify-between bg-green-400/10 border border-green-400/20 rounded-xl p-3">
                  <span className="text-sm text-green-400">Your API key is saved</span>
                  <button onClick={handleRemoveApiKey} className="text-xs text-red-400 hover:text-red-300 transition-colors">Remove</button>
                </div>
              )}
              <input type="password" value={apiKeyInput} onChange={(e) => { setApiKeyInput(e.target.value); setApiError(''); }} placeholder="AIza..." className="w-full bg-ink-600/50 dark:bg-ink-600/50 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200 rounded-xl px-4 py-3 text-sm text-white dark:text-white light:text-gray-900 placeholder:text-gray-500 outline-none focus:border-neon-cyan/40 transition-all font-mono" />
              {apiError && <p className="text-xs text-red-400">{apiError}</p>}
              <div className="flex gap-3">
                <button onClick={handleSaveApiKey} className="btn-primary flex-1 text-sm">Save Key</button>
                <button onClick={() => setShowSettings(false)} className="btn-ghost text-sm">Cancel</button>
              </div>
              <div className="text-xs text-gray-500 pt-2 border-t border-white/5 dark:border-white/5 light:border-gray-200">Without an API key, the assistant uses a smart knowledge base covering key O/L and A/L topics. Add a key for full Gemini AI responses.</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
