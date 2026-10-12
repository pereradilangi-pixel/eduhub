export interface PaperResource {
  id: string;
  title: string;
  subject: string;
  stream: 'O/L' | 'A/L Science' | 'A/L Commerce' | 'A/L Arts' | 'A/L Technology';
  year: number;
  type: 'Past Paper' | 'Model Paper' | 'Marking Scheme' | 'Revision Notes';
  downloads: number;
  fileSize: string;
  pages: number;
  icon: string;
  description: string;
  fileUrl: string;
  shortNotePrice: number;
}

export interface ForumReply {
  id: string;
  postId: string;
  author: string;
  body: string;
  upvotes: number;
  created_at: string;
}

export interface ForumPost {
  id: string;
  author: string;
  subject_tag: string;
  title: string;
  body: string;
  upvotes: number;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizSet {
  id: string;
  title: string;
  subject: string;
  questions: QuizQuestion[];
}

export interface StudyTip {
  id: string;
  title: string;
  body: string;
}

export const SUBJECT_TAGS = [
  'All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Science', 'ICT', 'Economics', 'Accounting', 'Business Studies',
  'Sinhala', 'History', 'Technology',
] as const;

export const SUBJECT_ICONS: Record<string, string> = {
  'Mathematics': 'Calculator',
  'Physics': 'Atom',
  'Chemistry': 'FlaskConical',
  'Biology': 'Dna',
  'English': 'Languages',
  'Science': 'Microscope',
  'ICT': 'Laptop',
  'Economics': 'TrendingUp',
  'Accounting': 'BookOpen',
  'Business Studies': 'Briefcase',
  'Sinhala': 'FileText',
  'History': 'Landmark',
  'Technology': 'Cpu',
};

export const PAST_PAPERS: PaperResource[] = [
  { id: 'pp1', title: 'O/L Mathematics Past Paper 2023', subject: 'Mathematics', stream: 'O/L', year: 2023, type: 'Past Paper', downloads: 12450, fileSize: '2.4 MB', pages: 12, icon: 'Calculator', description: 'Complete G.C.E. Ordinary Level Mathematics past paper with all three parts.', fileUrl: '#', shortNotePrice: 490 },
  { id: 'pp2', title: 'A/L Physics Past Paper 2023 — Science Stream', subject: 'Physics', stream: 'A/L Science', year: 2023, type: 'Past Paper', downloads: 8920, fileSize: '3.1 MB', pages: 18, icon: 'Atom', description: 'Advanced Level Physics structured essay and MCQ paper from 2023.', fileUrl: '#', shortNotePrice: 590 },
  { id: 'pp3', title: 'A/L Chemistry Model Paper 2024', subject: 'Chemistry', stream: 'A/L Science', year: 2024, type: 'Model Paper', downloads: 5600, fileSize: '4.2 MB', pages: 24, icon: 'FlaskConical', description: 'Model paper with detailed solutions and marking scheme for Chemistry.', fileUrl: '#', shortNotePrice: 590 },
  { id: 'pp4', title: 'O/L Science Past Paper 2022', subject: 'Science', stream: 'O/L', year: 2022, type: 'Past Paper', downloads: 15300, fileSize: '1.8 MB', pages: 10, icon: 'Microscope', description: 'G.C.E. O/L Science past paper with all structured questions.', fileUrl: '#', shortNotePrice: 490 },
  { id: 'pp5', title: 'A/L Technology ICT Model Paper 2024', subject: 'ICT', stream: 'A/L Technology', year: 2024, type: 'Model Paper', downloads: 4200, fileSize: '2.9 MB', pages: 15, icon: 'Laptop', description: 'Technology stream ICT model paper covering latest syllabus updates.', fileUrl: '#', shortNotePrice: 490 },
  { id: 'pp6', title: 'A/L Economics Past Paper 2023 — Commerce', subject: 'Economics', stream: 'A/L Commerce', year: 2023, type: 'Past Paper', downloads: 6700, fileSize: '2.2 MB', pages: 14, icon: 'TrendingUp', description: 'Commerce stream Economics past paper with essay questions.', fileUrl: '#', shortNotePrice: 590 },
  { id: 'pp7', title: 'O/L English Marking Scheme 2023', subject: 'English', stream: 'O/L', year: 2023, type: 'Marking Scheme', downloads: 9100, fileSize: '1.5 MB', pages: 8, icon: 'Languages', description: 'Official marking scheme for O/L English paper with answers.', fileUrl: '#', shortNotePrice: 390 },
  { id: 'pp8', title: 'A/L Biology Revision Notes 2024', subject: 'Biology', stream: 'A/L Science', year: 2024, type: 'Revision Notes', downloads: 3800, fileSize: '5.6 MB', pages: 42, icon: 'Dna', description: 'Comprehensive A/L Biology revision notes with diagrams and summaries.', fileUrl: '#', shortNotePrice: 590 },
  { id: 'pp9', title: 'A/L Accounting Model Paper — Commerce', subject: 'Accounting', stream: 'A/L Commerce', year: 2024, type: 'Model Paper', downloads: 5100, fileSize: '2.7 MB', pages: 16, icon: 'BookOpen', description: 'Accounting model paper with practical accounting problems.', fileUrl: '#', shortNotePrice: 590 },
  { id: 'pp10', title: 'O/L ICT Past Paper 2022', subject: 'ICT', stream: 'O/L', year: 2022, type: 'Past Paper', downloads: 11200, fileSize: '1.9 MB', pages: 11, icon: 'Laptop', description: 'O/L Information & Communication Technology past paper 2022.', fileUrl: '#', shortNotePrice: 490 },
  { id: 'pp11', title: 'A/L Business Studies Revision Notes', subject: 'Business Studies', stream: 'A/L Commerce', year: 2024, type: 'Revision Notes', downloads: 2900, fileSize: '4.8 MB', pages: 38, icon: 'Briefcase', description: 'Business Studies revision notes covering full syllabus topics.', fileUrl: '#', shortNotePrice: 590 },
  { id: 'pp12', title: 'A/L Technology — Electronics Past Paper', subject: 'Technology', stream: 'A/L Technology', year: 2023, type: 'Past Paper', downloads: 3400, fileSize: '2.5 MB', pages: 13, icon: 'Cpu', description: 'Technology stream Electronics past paper with circuit diagrams.', fileUrl: '#', shortNotePrice: 490 },
  { id: 'pp13', title: 'A/L History Model Paper — Arts Stream', subject: 'History', stream: 'A/L Arts', year: 2024, type: 'Model Paper', downloads: 4500, fileSize: '2.1 MB', pages: 14, icon: 'Landmark', description: 'Arts stream History model paper with essay questions.', fileUrl: '#', shortNotePrice: 490 },
  { id: 'pp14', title: 'O/L Sinhala Past Paper 2023', subject: 'Sinhala', stream: 'O/L', year: 2023, type: 'Past Paper', downloads: 18700, fileSize: '2.0 MB', pages: 12, icon: 'FileText', description: 'G.C.E. O/L Sinhala Language and Literature past paper 2023.', fileUrl: '#', shortNotePrice: 390 },
  { id: 'pp15', title: 'A/L Physics Revision Notes Mega Pack', subject: 'Physics', stream: 'A/L Science', year: 2024, type: 'Revision Notes', downloads: 6200, fileSize: '8.3 MB', pages: 56, icon: 'Atom', description: 'Complete A/L Physics revision mega pack with solved problems.', fileUrl: '#', shortNotePrice: 690 },
  { id: 'pp16', title: 'A/L Arts — Sinhala Model Paper 2024', subject: 'Sinhala', stream: 'A/L Arts', year: 2024, type: 'Model Paper', downloads: 7300, fileSize: '1.7 MB', pages: 10, icon: 'FileText', description: 'Arts stream Sinhala model paper for 2024 exam preparation.', fileUrl: '#', shortNotePrice: 490 },
];

export const FORUM_SEED: ForumPost[] = [
  { id: 'seed1', author: 'Nimal Perera', subject_tag: 'Physics', title: 'How to solve projectile motion problems easily?', body: 'I struggle with projectile motion questions in A/L Physics. Can someone share a simple method to approach these problems? The horizontal and vertical components always confuse me.', upvotes: 24, created_at: '2026-10-01T10:00:00Z' },
  { id: 'seed2', author: 'Sanduni Fernando', subject_tag: 'Mathematics', title: 'Differentiation shortcuts for O/L exam', body: 'Here are some differentiation shortcuts that helped me score A in O/L Maths: 1) Power rule: d/dx(x^n) = nx^(n-1), 2) Chain rule simplified, 3) Product rule patterns. Hope this helps everyone preparing for O/L!', upvotes: 45, created_at: '2026-10-03T14:30:00Z' },
  { id: 'seed3', author: 'Kasun Silva', subject_tag: 'ICT', title: 'Best resources for A/L Technology ICT?', body: 'What are the best online resources and YouTube channels for A/L Technology ICT? Looking for video tutorials and practice papers for the 2026 exam.', upvotes: 18, created_at: '2026-10-05T09:15:00Z' },
  { id: 'seed4', author: 'Tharushi Jayawardena', subject_tag: 'Chemistry', title: 'Organic chemistry reaction mechanisms — help needed', body: 'I find organic chemistry reaction mechanisms very confusing. Any tips or simplified notes for memorizing the key reactions for A/L? Especially SN1 vs SN2 mechanisms.', upvotes: 31, created_at: '2026-10-06T16:45:00Z' },
  { id: 'seed5', author: 'Dinithi Senanayake', subject_tag: 'Science', title: 'How to calculate BMI and interpret the values?', body: 'Can someone explain the BMI equation and how to interpret the results? Our teacher mentioned it in class but I did not fully understand the categories.', upvotes: 12, created_at: '2026-10-07T11:00:00Z' },
];

export const FORUM_REPLIES_SEED: ForumReply[] = [
  { id: 'r1', postId: 'seed1', author: 'Prof. Wickrama', body: 'Break it into horizontal and vertical components. Horizontal velocity is constant (no acceleration). Vertical motion has acceleration g downward. Use v = u + at for vertical, and range = u_x * t for horizontal. Practice with past A/L papers!', upvotes: 15, created_at: '2026-10-01T12:30:00Z' },
  { id: 'r2', postId: 'seed1', author: 'Ishara', body: 'Thanks for asking this! I had the same problem. The key is to always draw a diagram first and label the initial velocity components.', upvotes: 8, created_at: '2026-10-01T15:00:00Z' },
  { id: 'r3', postId: 'seed2', author: 'Ravindu', body: 'These shortcuts are gold! Saved me so much time during the exam. The power rule is the most important one to remember.', upvotes: 22, created_at: '2026-10-03T16:00:00Z' },
  { id: 'r4', postId: 'seed2', author: 'Chamodi', body: 'Don\'t forget the quotient rule too: (u\'v - uv\') / v^2. It comes up a lot in A/L as well.', upvotes: 11, created_at: '2026-10-04T08:20:00Z' },
  { id: 'r5', postId: 'seed4', author: 'Dr. Perera', body: 'For SN1: two steps, forms carbocation intermediate, rate depends only on substrate. For SN2: one step, backside attack, rate depends on both substrate and nucleophile. SN1 gives racemic mixture, SN2 gives inversion.', upvotes: 19, created_at: '2026-10-06T18:00:00Z' },
  { id: 'r6', postId: 'seed5', author: 'Nethmi', body: 'BMI = weight(kg) / height(m)^2. Categories: Underweight <18.5, Normal 18.5-24.9, Overweight 25-29.9, Obese >=30. It\'s a simple formula but remember it doesn\'t account for muscle mass!', upvotes: 14, created_at: '2026-10-07T13:00:00Z' },
  { id: 'r7', postId: 'seed5', author: 'Sahan', body: 'Adding to Nethmi\'s answer — for O/L you also need to know the limitations of BMI. It doesn\'t distinguish between fat and muscle mass, so athletes may have high BMI but be healthy.', upvotes: 7, created_at: '2026-10-07T14:30:00Z' },
];

export const DEFAULT_QUIZ_SETS: QuizSet[] = [
  {
    id: 'quiz1',
    title: 'O/L Science — Photosynthesis',
    subject: 'Science',
    questions: [
      { id: 'q1', question: 'What is the primary pigment involved in photosynthesis?', options: ['Carotene', 'Chlorophyll', 'Xanthophyll', 'Anthocyanin'], correctIndex: 1, explanation: 'Chlorophyll is the main photosynthetic pigment that absorbs light energy, primarily in the red and blue wavelengths.' },
      { id: 'q2', question: 'In which part of the chloroplast does the light-dependent reaction occur?', options: ['Stroma', 'Thylakoid membrane', 'Outer membrane', 'Inner membrane'], correctIndex: 1, explanation: 'Light-dependent reactions take place in the thylakoid membrane where chlorophyll is located.' },
      { id: 'q3', question: 'What are the two main products of photosynthesis?', options: ['Glucose and CO2', 'Glucose and O2', 'Water and CO2', 'Water and O2'], correctIndex: 1, explanation: 'Photosynthesis produces glucose (C6H12O6) and oxygen (O2) from CO2 and water.' },
      { id: 'q4', question: 'Which equation correctly represents photosynthesis?', options: ['6CO2 + 6H2O -> C6H12O6 + 6O2', 'C6H12O6 + 6O2 -> 6CO2 + 6H2O', '6CO2 + 12H2O -> C6H12O6 + 6O2 + 6H2O', 'C6H12O6 -> 2CO2 + 2C2H5OH'], correctIndex: 0, explanation: 'The balanced equation: 6CO2 + 6H2O in the presence of light gives C6H12O6 + 6O2.' },
      { id: 'q5', question: 'What is the role of ATP in photosynthesis?', options: ['Absorbs light', 'Provides energy for Calvin cycle', 'Releases oxygen', 'Produces water'], correctIndex: 1, explanation: 'ATP produced in light-dependent reactions provides energy for the Calvin cycle (light-independent reactions) to fix CO2.' },
    ],
  },
  {
    id: 'quiz2',
    title: 'A/L Physics — Newton\'s Laws',
    subject: 'Physics',
    questions: [
      { id: 'q1', question: 'Newton\'s First Law is also known as the law of:', options: ['Acceleration', 'Inertia', 'Momentum', 'Gravity'], correctIndex: 1, explanation: 'The First Law states that an object maintains its state of rest or uniform motion unless acted upon by a net external force — this is the law of inertia.' },
      { id: 'q2', question: 'Which formula represents Newton\'s Second Law?', options: ['F = mv', 'F = ma', 'F = m/a', 'F = a/m'], correctIndex: 1, explanation: 'Force equals mass times acceleration: F = ma.' },
      { id: 'q3', question: 'For every action, there is an equal and opposite reaction. This is:', options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravitation'], correctIndex: 2, explanation: 'This is Newton\'s Third Law — forces always come in pairs that are equal in magnitude and opposite in direction.' },
      { id: 'q4', question: 'A 2kg object accelerates at 5 m/s^2. What net force acts on it?', options: ['2.5 N', '7 N', '10 N', '0.4 N'], correctIndex: 2, explanation: 'F = ma = 2 x 5 = 10 N.' },
    ],
  },
  {
    id: 'quiz3',
    title: 'O/L History — Ancient Sri Lanka',
    subject: 'History',
    questions: [
      { id: 'q1', question: 'Who was the first king of Sri Lanka according to chronicles?', options: ['King Devanampiya Tissa', 'King Pandukabhaya', 'King Vijaya', 'King Dutugemunu'], correctIndex: 2, explanation: 'According to the Mahavamsa, King Vijaya was the first recorded king of Sri Lanka, arriving around 543 BC.' },
      { id: 'q2', question: 'Which ancient city was the first capital of Sri Lanka?', options: ['Anuradhapura', 'Polonnaruwa', 'Kandy', 'Kotte'], correctIndex: 0, explanation: 'Anuradhapura was the first capital of Sri Lanka, established as a kingdom by King Pandukabhaya around 377 BC.' },
      { id: 'q3', question: 'King Dutugemunu is famous for defeating which invader?', options: ['Elara (Chola)', 'Magha (Kalinga)', 'Rajendra Chola', 'Kulottunga'], correctIndex: 0, explanation: 'King Dutugemunu defeated the South Indian invader Elara in 161 BC, unifying the country.' },
    ],
  },
];

export const DEFAULT_STUDY_TIPS: StudyTip[] = [
  { id: 'tip1', title: 'Active Recall', body: 'Instead of re-reading notes, close the book and try to write down everything you remember. This strengthens memory far more than passive reading.' },
  { id: 'tip2', title: 'Pomodoro Technique', body: 'Study for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-20 minute break. This keeps your mind fresh and focused.' },
  { id: 'tip3', title: 'Past Paper Practice', body: 'Always practice with past papers under timed conditions. This helps you manage time during the actual exam and familiarizes you with question patterns.' },
  { id: 'tip4', title: 'Teach to Learn', body: 'Explain concepts to a friend or even to yourself out loud. If you can explain it simply, you truly understand it.' },
];

export const MOTIVATIONAL_QUOTES = [
  'The expert in anything was once a beginner. Keep going!',
  'Success is the sum of small efforts repeated day in and day out.',
  'Don\'t watch the clock; do what it does — keep going.',
  'The future depends on what you do today. Study hard!',
  'Every accomplishment starts with the decision to try.',
  'Push yourself, because no one else is going to do it for you.',
  'Study while others are sleeping; work while others are loafing.',
  'Dream big, study hard, and make it happen. You\'ve got this!',
  'The only way to do great work is to love what you do.',
  'Believe in yourself and all that you are. Success is near!',
  'Hard work beats talent when talent doesn\'t work hard.',
  'Your only limit is the one you set on yourself. Break through it!',
];
