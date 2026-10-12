export const GEMINI_SYSTEM_PROMPT = `You are an encouraging, expert Sri Lankan O/L and A/L AI Tutor. You help students master subjects aligned to the Sri Lankan national syllabus. You respond in English or Sinhala based on the student's input language. You are always positive, motivational, and break down complex concepts into simple, structured explanations. Use numbered lists, bullet points, and clear formatting. When generating quizzes, return ONLY valid JSON in the exact format requested.`;

const API_KEY_STORAGE = 'gemini_api_key_v1';
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function saveApiKey(key: string): void {
  try { localStorage.setItem(API_KEY_STORAGE, key); } catch { /* ignore */ }
}

export function removeApiKey(): void {
  try { localStorage.removeItem(API_KEY_STORAGE); } catch { /* ignore */ }
}

export function getActiveApiKey(): string | undefined {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  const userKey = getStoredApiKey();
  const key = userKey || (envKey && envKey.length > 10 ? envKey : undefined);
  return key;
}

export function isAiConnected(): boolean {
  return !!getActiveApiKey();
}

interface GeminiOptions {
  temperature?: number;
  maxOutputTokens?: number;
}

/** Classifies an error as one that should trigger a local fallback (404, model not found, network, etc.) */
function isRecoverableError(err: unknown): boolean {
  if (!(err instanceof Error)) return true;
  const msg = err.message.toLowerCase();
  return (
    msg.includes('404') ||
    msg.includes('not found') ||
    msg.includes('model') ||
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('api error') ||
    msg.includes('no response text') ||
    msg.includes('invalid response') ||
    msg.includes('failed to parse')
  );
}

async function callGeminiRaw(prompt: string, apiKey: string, opts?: GeminiOptions): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${GEMINI_SYSTEM_PROMPT}\n\n${prompt}` }] }],
        generationConfig: {
          temperature: opts?.temperature ?? 0.7,
          maxOutputTokens: opts?.maxOutputTokens ?? 2048,
        },
      }),
    });
  } catch {
    throw new Error('Network error: Unable to reach Gemini API.');
  }

  if (!res.ok) {
    let errorMsg = `API error: ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData?.error?.message) errorMsg = errorData.error.message;
    } catch { /* response body not JSON */ }
    throw new Error(errorMsg);
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error('Invalid response from Gemini API.');
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const finishReason = data?.candidates?.[0]?.finishReason;
    if (finishReason === 'SAFETY') throw new Error('Response blocked by safety filters.');
    throw new Error('No response text from API.');
  }
  return text;
}

// ─── Public API: text & JSON ──────────────────────────────────────────────

export async function callGemini(prompt: string, apiKey: string, opts?: GeminiOptions): Promise<string> {
  return callGeminiRaw(prompt, apiKey, opts);
}

export async function callGeminiJSON<T>(prompt: string, apiKey: string, opts?: GeminiOptions): Promise<T> {
  const raw = await callGeminiRaw(prompt, apiKey, {
    temperature: opts?.temperature ?? 0.5,
    maxOutputTokens: opts?.maxOutputTokens ?? 2048,
  });
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned) as T;
}

// ─── Local rule-based fallback generators ──────────────────────────────────

const GENERIC_QUESTIONS: AIQuizQuestion[] = [
  {
    question: 'Which of the following best describes the process of photosynthesis?',
    options: [
      'Plants convert sunlight, water, and CO₂ into glucose and oxygen',
      'Plants absorb oxygen and release carbon dioxide',
      'Plants convert soil nutrients directly into energy',
      'Plants use nitrogen to create glucose',
    ],
    correctIndex: 0,
    explanation: 'Photosynthesis uses sunlight energy to convert carbon dioxide and water into glucose (food) and oxygen. The chlorophyll in leaves captures light energy to drive this reaction.',
    motivationalNote: "Great effort! Remember the word equation: Sunlight + CO₂ + Water → Glucose + Oxygen. Visualize the plant 'eating' sunlight and 'drinking' water to make its food!",
  },
  {
    question: 'In a right-angled triangle, if the two shorter sides are 3 cm and 4 cm, what is the length of the hypotenuse?',
    options: ['5 cm', '6 cm', '7 cm', '12 cm'],
    correctIndex: 0,
    explanation: 'Using Pythagoras\' theorem: c² = a² + b² = 3² + 4² = 9 + 16 = 25. So c = √25 = 5 cm.',
    motivationalNote: "Don't worry! Just remember: square the two shorter sides, add them up, then take the square root. 3² + 4² = 9 + 16 = 25, and √25 = 5. You've got this!",
  },
  {
    question: 'What is the chemical symbol for sodium?',
    options: ['So', 'Na', 'Sd', 'Sn'],
    correctIndex: 1,
    explanation: 'Sodium\'s symbol is Na, derived from its Latin name "Natrium". Many element symbols come from Latin names rather than English ones.',
    motivationalNote: 'Tricky one! Many symbols come from Latin, not English. Sodium = Na (from Natrium). Make a flashcard for elements with Latin-based symbols like Na, K, Fe, Cu, Ag, Au.',
  },
  {
    question: 'Which type of rock is formed by the cooling and solidification of magma or lava?',
    options: ['Sedimentary rock', 'Metamorphic rock', 'Igneous rock', 'Fossil rock'],
    correctIndex: 2,
    explanation: 'Igneous rocks (like basalt and granite) form when molten magma or lava cools and solidifies. Sedimentary rocks form from deposited sediments, and metamorphic rocks form from heat and pressure on existing rocks.',
    motivationalNote: 'Remember the rock cycle! Igneous = "ignited" (from fire/heat). Sedimentary = sediments piling up. Metamorphic = morphed by heat & pressure. Think of the three as fire, water, and pressure!',
  },
  {
    question: 'If f(x) = 2x + 3, what is f(5)?',
    options: ['10', '13', '8', '28'],
    correctIndex: 1,
    explanation: 'Substitute x = 5: f(5) = 2(5) + 3 = 10 + 3 = 13.',
    motivationalNote: 'Substitution is straightforward — replace every x with the given number, then calculate. 2 × 5 = 10, plus 3 = 13. Practice with different values to build confidence!',
  },
];

function fallbackQuiz(topic: string): AIQuizSet {
  return {
    title: `Practice Quiz: ${topic}`,
    questions: GENERIC_QUESTIONS,
  };
}

function fallbackFlashcards(notes: string): AIFlashcard[] {
  const lines = notes.split('\n').map(l => l.trim()).filter(l => l.length > 10);
  const cards: AIFlashcard[] = [];

  if (lines.length >= 3) {
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i];
      const colonIdx = line.indexOf(':');
      if (colonIdx > 3 && colonIdx < line.length - 3) {
        cards.push({
          front: line.substring(0, colonIdx).trim(),
          back: line.substring(colonIdx + 1).trim(),
        });
      } else if (line.includes(' is ')) {
        const idx = line.indexOf(' is ');
        cards.push({
          front: `What is ${line.substring(0, idx).trim()}?`,
          back: line.substring(idx + 4).trim(),
        });
      } else {
        const words = line.split(' ');
        const keyWord = words.find(w => w.length > 5) || words[0];
        cards.push({
          front: `Explain: "${keyWord}"`,
          back: line,
        });
      }
    }
  }

  if (cards.length < 3) {
    cards.push(
      { front: 'What is the main topic of these notes?', back: topic_fromNotes(notes) },
      { front: 'Define the key concept from your notes', back: notes.substring(0, 200) || 'Review your notes and identify the most important definition.' },
      { front: 'Why is this topic important for your exam?', back: 'Understanding core concepts helps you answer both MCQ and essay questions with confidence.' },
      { front: 'How would you apply this knowledge in an exam?', back: 'Connect the concept to real examples and practice past paper questions on this topic.' },
      { front: 'What is one thing to memorize from these notes?', back: 'Pick the most frequently mentioned term or formula and create a mnemonic to remember it.' },
    );
  }

  return cards;
}

function topic_fromNotes(notes: string): string {
  const words = notes.split(/\s+/).filter(w => w.length > 4);
  return words.slice(0, 3).join(' ') || 'your study notes';
}

function fallbackEssay(essay: string, subject: string): EssayEvaluation {
  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
  const hasIntro = /^(in this|this essay|i will|the purpose|in this essay)/i.test(essay);
  const hasConclusion = /(in conclusion|to conclude|in summary|therefore|finally|in short)/i.test(essay);
  const hasExamples = /(for example|such as|for instance|e\.g\.|like)/i.test(essay);

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (wordCount > 100) strengths.push('Your answer has sufficient length and shows effort to develop ideas.');
  if (hasIntro) strengths.push('You have a clear introduction that sets up the topic.');
  if (hasConclusion) strengths.push('You include a conclusion that wraps up your argument.');
  if (hasExamples) strengths.push('Good use of examples to support your points.');

  if (!hasIntro) improvements.push('Add a clear introduction that outlines what your essay will cover.');
  if (!hasConclusion) improvements.push('Include a concluding paragraph that summarizes your key points.');
  if (!hasExamples) improvements.push('Support your arguments with specific examples from the syllabus.');
  if (wordCount < 100) improvements.push('Expand your answer with more detailed explanations — aim for at least 150-200 words for O/L and 300+ for A/L.');
  improvements.push('Structure your answer with clear paragraphs: one idea per paragraph.');

  let score: string;
  let grade: string;
  const scoreNum = Math.min(85, 40 + (strengths.length * 12) - (improvements.length * 3));
  if (scoreNum >= 75) { score = `${scoreNum}%`; grade = 'A'; }
  else if (scoreNum >= 65) { score = `${scoreNum}%`; grade = 'B'; }
  else if (scoreNum >= 55) { score = `${scoreNum}%`; grade = 'C'; }
  else if (scoreNum >= 45) { score = `${scoreNum}%`; grade = 'S'; }
  else { score = `${scoreNum}%`; grade = subject.match(/A\/?L/i) ? 'F' : '7'; }

  return {
    grade,
    score,
    strengths: strengths.length > 0 ? strengths : ['You made a genuine attempt to answer the question — that\'s the first step to success!'],
    improvements,
    detailedFeedback: `Your ${subject} essay shows ${wordCount} words of effort. ${hasIntro ? 'You started well with an introduction.' : 'Work on adding a clear introduction.'} ${hasConclusion ? 'Your conclusion helps tie things together.' : 'A conclusion would strengthen your answer.'} ${hasExamples ? 'Your use of examples is commendable.' : 'Adding specific examples would make your arguments more convincing.'} Focus on clear paragraph structure: introduction, body paragraphs (one main point each with examples), and a conclusion. Keep practicing — every essay you write improves your exam technique!`,
    motivationalNote: 'Every great student started where you are now. The fact that you\'re seeking feedback shows you\'re serious about improving. Keep writing, keep practicing, and your grades will climb. You\'ve got this!',
  };
}

function fallbackTimetable(
  examDate: string,
  subjects: string[],
  weakSubjects: string[],
  studyHoursPerDay: string,
): StudyTimetable {
  const hours = parseInt(studyHoursPerDay) || 3;
  const sessionsPerDay = Math.max(2, Math.min(4, Math.floor(hours / 1.5)));
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const allSubjects = subjects.length > 0 ? subjects : ['Core Subject 1', 'Core Subject 2', 'Core Subject 3'];
  const weak = weakSubjects.length > 0 ? weakSubjects : [];

  const weeklySchedule = days.map((day, dayIdx) => {
    const sessions: { time: string; subject: string; activity: string }[] = [];
    const baseHour = 4; // 4 PM start
    for (let s = 0; s < sessionsPerDay; s++) {
      const startHour = baseHour + s * 2;
      const endHour = startHour + 1;
      const subjectIdx = (dayIdx + s) % allSubjects.length;
      const subject = allSubjects[subjectIdx];
      const isWeak = weak.includes(subject);
      const activities = isWeak
        ? ['Deep revision of key concepts + practice past paper questions', 'Review weak areas, create summary notes, and attempt 10 MCQs', 'Focus on difficult topics — re-read textbook sections and make flashcards']
        : ['Revise notes and practice 5 past paper questions', 'Review textbook summaries and create a mind map', 'Practice past papers under timed conditions'];
      sessions.push({
        time: `${startHour}:00 PM - ${endHour}:30 PM`,
        subject,
        activity: activities[s % activities.length],
      });
    }
    if (dayIdx === 6) {
      sessions.push({
        time: '7:00 PM - 8:00 PM',
        subject: 'All Subjects',
        activity: 'Weekly review: go through everything studied this week and identify areas to revisit',
      });
    }
    return { day, sessions };
  });

  const exam = examDate || 'your exam date';
  return {
    overview: `This study plan covers all your subjects with extra focus on ${weak.join(', ') || 'your weaker areas'}. You'll study approximately ${hours} hours per day across ${sessionsPerDay} focused sessions. The schedule rotates through subjects to keep your study varied and engaging, with extra attention to subjects that need improvement. Your exam on ${exam} is the target — stay consistent and you'll be ready!`,
    weeklySchedule,
    motivationalNote: 'A study plan is your roadmap to success. Follow it consistently, but don\'t be afraid to adjust if something isn\'t working. Remember: consistency beats intensity. A little every day adds up to massive results. You\'re investing in your future — keep going!',
  };
}

function fallbackChat(message: string): string {
  const msg = message.toLowerCase();
  if (msg.match(/hello|hi|hey|greetings/)) {
    return `Hello! I'm your AI Study Assistant for Sri Lankan O/L and A/L exams. I can help you with:\n\n• Explaining difficult concepts in Science, Maths, Commerce, and Arts\n• Creating practice quizzes\n• Generating flashcards from your notes\n• Evaluating your essays\n• Creating a personalized study timetable\n\nWhat would you like help with today?`;
  }
  if (msg.match(/photosynthesis/)) {
    return `**Photosynthesis** is the process by which green plants make their own food.\n\n**Word equation:**\nCarbon Dioxide + Water → (Sunlight, Chlorophyll) → Glucose + Oxygen\n\n**Key points:**\n1. It happens in the chloroplasts, which contain chlorophyll\n2. Sunlight provides the energy\n3. CO₂ enters through stomata in leaves\n4. Water is absorbed by roots and transported to leaves\n5. Glucose is the food (energy source) for the plant\n6. Oxygen is released as a by-product\n\n**Why it matters:** Photosynthesis is the foundation of all food chains and produces the oxygen we breathe!`;
  }
  if (msg.match(/pythagoras|theorem/)) {
    return `**Pythagoras' Theorem** states that in a right-angled triangle:\n\n**a² + b² = c²**\n\nWhere:\n• a and b are the two shorter sides (legs)\n• c is the hypotenuse (longest side, opposite the right angle)\n\n**Example:** If a = 3 and b = 4, then c² = 9 + 16 = 25, so c = 5.\n\n**Remember:** This only works for right-angled triangles!`;
  }
  if (msg.match(/exam|tip|study|how to/)) {
    return `Here are my top study tips for O/L and A/L success:\n\n1. **Active recall:** Instead of re-reading notes, test yourself by closing the book and writing what you remember\n2. **Past papers:** Practice with at least 5 years of past papers — they reveal exam patterns\n3. **Spaced repetition:** Review topics at increasing intervals (1 day, 3 days, 1 week, 2 weeks)\n4. **Pomodoro technique:** Study 25 minutes, rest 5 minutes — keeps you focused\n5. **Teach someone:** Explaining a concept to someone else reveals gaps in your understanding\n6. **Weak subjects first:** Tackle your hardest subjects when your energy is highest\n\nWould you like me to create a personalized study timetable for you?`;
  }
  return `That's a great question! Here's what I can tell you:\n\nI'm currently running in offline mode, so my response is limited. For full, detailed AI explanations on any O/L or A/L topic, please add your free Gemini API key using the Settings button in the AI Tutor section above.\n\nIn the meantime, here are some general study tips:\n• Break the topic into smaller parts and tackle one at a time\n• Look for past paper questions on this topic\n• Create flashcards for key terms and definitions\n• Try to explain the concept in your own words\n\nFeel free to ask me about photosynthesis, Pythagoras' theorem, or study tips — I have built-in knowledge for those topics!`;
}

// ─── Public AI feature functions with fallback ─────────────────────────────

export interface AIQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  motivationalNote: string;
}

export interface AIQuizSet {
  title: string;
  questions: AIQuizQuestion[];
}

export async function generateAIQuiz(topic: string, apiKey: string): Promise<AIQuizSet> {
  const prompt = `Generate a 5-question multiple choice quiz on the topic "${topic}" for a Sri Lankan O/L or A/L student. Each question must have exactly 4 options, one correct answer, a clear explanation, AND a motivationalNote — a short, highly encouraging message the student sees if they get that question wrong, with step-by-step guidance on how to improve.

Return ONLY valid JSON in this exact format, no markdown:
{
  "title": "Quiz on ${topic}",
  "questions": [
    {
      "question": "...",
      "options": ["a)", "b)", "c)", "d)"],
      "correctIndex": 0,
      "explanation": "...",
      "motivationalNote": "Don't worry! Here's how to think about it: ..."
    }
  ]
}`;

  try {
    return await callGeminiJSON<AIQuizSet>(prompt, apiKey, { temperature: 0.7, maxOutputTokens: 4096 });
  } catch (err) {
    if (isRecoverableError(err)) return fallbackQuiz(topic);
    throw err;
  }
}

export interface AIFlashcard {
  front: string;
  back: string;
}

export async function generateFlashcards(notes: string, apiKey: string): Promise<AIFlashcard[]> {
  const prompt = `Create revision flashcards from the following study notes. Each flashcard has a "front" (a question or key term) and a "back" (the answer or explanation). Generate between 5 and 15 flashcards depending on the length of the notes. Make them suitable for Sri Lankan O/L or A/L exam revision.

Return ONLY valid JSON array, no markdown:
[
  { "front": "...", "back": "..." }
]

Study notes:
${notes}`;

  try {
    const cards = await callGeminiJSON<AIFlashcard[]>(prompt, apiKey, { temperature: 0.5, maxOutputTokens: 4096 });
    if (cards.length === 0) return fallbackFlashcards(notes);
    return cards;
  } catch (err) {
    if (isRecoverableError(err)) return fallbackFlashcards(notes);
    throw err;
  }
}

export interface EssayEvaluation {
  grade: string;
  score: string;
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
  motivationalNote: string;
}

export async function evaluateEssay(essay: string, subject: string, apiKey: string): Promise<EssayEvaluation> {
  const prompt = `You are an expert Sri Lankan O/L and A/L examiner. Evaluate the following student essay/answer for the subject "${subject}". Provide a grade estimate (A, B, C, S, F or 1-9 for O/L), a score percentage, strengths, areas for improvement, detailed feedback, and a motivational note.

Return ONLY valid JSON, no markdown:
{
  "grade": "...",
  "score": "...%",
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "detailedFeedback": "...",
  "motivationalNote": "..."
}

Student's essay:
${essay}`;

  try {
    return await callGeminiJSON<EssayEvaluation>(prompt, apiKey, { temperature: 0.4, maxOutputTokens: 4096 });
  } catch (err) {
    if (isRecoverableError(err)) return fallbackEssay(essay, subject);
    throw err;
  }
}

export interface StudyTimetable {
  overview: string;
  weeklySchedule: { day: string; sessions: { time: string; subject: string; activity: string }[] }[];
  motivationalNote: string;
}

export async function generateTimetable(
  examDate: string,
  subjects: string[],
  weakSubjects: string[],
  studyHoursPerDay: string,
  apiKey: string,
): Promise<StudyTimetable> {
  const prompt = `Create a personalized study timetable for a Sri Lankan student. The student's exam date is ${examDate}, they study ${studyHoursPerDay} hours per day, their subjects are: ${subjects.join(', ')}. Their weak subjects that need extra focus are: ${weakSubjects.join(', ') || 'None specified'}.

Create a weekly study schedule that allocates more time to weak subjects, includes revision sessions, past paper practice, and breaks. Make it practical and followable.

Return ONLY valid JSON, no markdown:
{
  "overview": "...",
  "weeklySchedule": [
    {
      "day": "Monday",
      "sessions": [
        { "time": "4:00 PM - 5:30 PM", "subject": "Physics", "activity": "Revise Newton's Laws + practice 5 MCQs" }
      ]
    }
  ],
  "motivationalNote": "..."
}`;

  try {
    return await callGeminiJSON<StudyTimetable>(prompt, apiKey, { temperature: 0.6, maxOutputTokens: 4096 });
  } catch (err) {
    if (isRecoverableError(err)) return fallbackTimetable(examDate, subjects, weakSubjects, studyHoursPerDay);
    throw err;
  }
}

// ─── Chatbot with fallback ─────────────────────────────────────────────────

export async function chatWithFallback(message: string, apiKey: string): Promise<string> {
  try {
    return await callGeminiRaw(`Student question: ${message}`, apiKey);
  } catch (err) {
    if (isRecoverableError(err)) return fallbackChat(message);
    throw err;
  }
}
