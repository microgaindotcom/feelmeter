import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, NavLink, useLocation, Link, useSearchParams } from 'react-router-dom';

// --- TYPE DEFINITIONS (from types.ts) ---
export interface PollOption {
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  options: PollOption[];
  category: string;
  createdAt: number;
  durationDays: number;
}

export interface Vote {
  [pollId: string]: number; // pollId -> optionIndex
}


// --- SERVICES (from services/pollService.ts) ---

const POLLS_KEY = 'feelmeter_polls';
const VOTES_KEY = 'feelmeter_votes';

const getDefaultPolls = (): Poll[] => [
  {
    id: 'poll1',
    title: 'আপনি কি মনে করেন বিএনপি এই নির্বাচনে জিতবে?',
    category: 'রাজনীতি',
    options: [{ text: 'জামাত', votes: 430 }, { text: 'বিএনপি', votes: 510 }, { text: 'কেউ না', votes: 60 }],
    createdAt: Date.now(),
    durationDays: 7
  },
  {
    id: 'poll2',
    title: 'আপনার প্রিয় স্ট্রিট ফুড কোনটি?',
    category: 'খাদ্য',
    options: [{ text: 'ফুচকা', votes: 820 }, { text: 'চটপটি', votes: 650 }, { text: 'ঝালমুড়ি', votes: 430 }],
    createdAt: Date.now(),
    durationDays: 5
  },
];

const getPolls = (): Poll[] => {
  try {
    const pollsJson = localStorage.getItem(POLLS_KEY);
    if (!pollsJson) {
      const defaultPolls = getDefaultPolls();
      localStorage.setItem(POLLS_KEY, JSON.stringify(defaultPolls));
      return defaultPolls;
    }
    return JSON.parse(pollsJson);
  } catch (error) {
    console.error("Failed to parse polls from localStorage", error);
    return getDefaultPolls();
  }
};

const savePolls = (polls: Poll[]): void => {
  localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
};

const addPoll = (poll: Omit<Poll, 'id' | 'createdAt' | 'options'> & { options: string[] }): void => {
  const polls = getPolls();
  const newPoll: Poll = {
    ...poll,
    id: `poll_${Date.now()}`,
    createdAt: Date.now(),
    options: poll.options.map(text => ({ text, votes: 0 })),
  };
  polls.unshift(newPoll);
  savePolls(polls);
};

const deletePoll = (pollId: string): void => {
  let polls = getPolls();
  polls = polls.filter(p => p.id !== pollId);
  savePolls(polls);
};

const getVotes = (): Vote => {
  try {
    const votesJson = localStorage.getItem(VOTES_KEY);
    return votesJson ? JSON.parse(votesJson) : {};
  } catch (error) {
    console.error("Failed to parse votes from localStorage", error);
    return {};
  }
};

const addVote = (pollId: string, optionIndex: number): void => {
  const polls = getPolls();
  const poll = polls.find(p => p.id === pollId);
  if (poll && poll.options[optionIndex]) {
    poll.options[optionIndex].votes += 1;
    savePolls(polls);

    const votes = getVotes();
    votes[pollId] = optionIndex;
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
  }
};

const hasVotedInStorage = (pollId: string): boolean => {
  const votes = getVotes();
  return votes.hasOwnProperty(pollId);
};


// --- HOOKS (from hooks/useIntersectionObserver.ts) ---

const useIntersectionObserver = <T extends HTMLElement,>(
  options: IntersectionObserverInit
): [React.RefObject<T>, boolean] => {
  const containerRef = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (containerRef.current) {
            observer.unobserve(containerRef.current);
        }
      }
    }, options);

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(containerRef.current);
      }
    };
  }, [containerRef, options]);

  return [containerRef, isVisible];
};


// --- COMPONENTS (from components folder) ---

// AnimatedSection.tsx
interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
}
const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children, className = '' }) => {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
  });

  const classes = `transition-all duration-1000 ease-out ${
    isVisible ? 'opacity-100 blur-0 translate-y-0' : 'opacity-0 blur-sm translate-y-10'
  } ${className}`;

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
};

// Confetti.tsx
const Confetti: React.FC = () => {
  useEffect(() => {
    const container = document.getElementById('confetti-container');
    if (!container) return;

    const colors = ['#FF6B81', '#6C63FF', '#FFD93D', '#4CAF50', '#2196F3'];
    const confettiCount = 100;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'absolute';
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = `${Math.random() * 10 + 5}px`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.top = `${Math.random() * -20}vh`;
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.opacity = '1';
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      confetti.style.transition = 'top 2s ease-out, opacity 2s ease-out, transform 2s ease-out';
      container.appendChild(confetti);

      setTimeout(() => {
        confetti.style.top = `${Math.random() * 100 + 100}vh`;
        confetti.style.opacity = '0';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      }, 100);

      setTimeout(() => {
        container.removeChild(confetti);
      }, 2100);
    }
  }, []);

  return <div id="confetti-container" className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden" />;
};


// --- PAGES (from pages folder) ---

// HomePage.tsx
const CategoryCard: React.FC<{ icon: string; title: string; link: string }> = ({ icon, title, link }) => (
  <Link to={link} className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
  </Link>
);
const PollPreviewCard: React.FC<{ title: string; }> = ({ title }) => (
  <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg">
    <h4 className="text-xl font-semibold text-gray-700 mb-4">{title}</h4>
    <Link to="/poll" className="w-full text-center bg-secondary text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition-transform hover:scale-105 duration-300 inline-block">
      ভোট দিন
    </Link>
  </div>
);
const HomePage: React.FC = () => {
    const recentPolls = getPolls().slice(0, 3);

    return (
        <div>
            {/* Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center text-white text-center px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-start via-primary-via to-primary-end animate-gradient bg-[400%_400%]" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10">
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight drop-shadow-lg">
                        ফিলমিটার <br /> যেখানে অনুভূতি মাপা যায়!
                    </h1>
                    <p className="mt-4 text-xl md:text-2xl max-w-2xl mx-auto drop-shadow-md">
                        ভালোবাসা, বন্ধুত্ব, মুড কিংবা অলসতা - সবকিছুরই পরিমাপ আছে এখানে!
                    </p>
                    <Link
                        to="/calculate"
                        className="mt-8 inline-block bg-accent text-gray-900 font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-300"
                    >
                        শুরু করুন
                    </Link>
                </div>
            </section>

            {/* Featured Categories */}
            <section className="py-20 bg-white/70 backdrop-blur-md">
                <div className="container mx-auto px-6">
                    <AnimatedSection>
                        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">অনুভূতির জগৎ</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            <CategoryCard icon="❤️" title="ভালোবাসা মিটার" link="/calculate?category=love" />
                            <CategoryCard icon="🤝" title="বন্ধুত্ব স্কেল" link="/calculate?category=friendship" />
                            <CategoryCard icon="🎨" title="মুড মিটার" link="/calculate?category=mood" />
                            <CategoryCard icon="💤" title="অলসতা স্কোর" link="/calculate?category=laziness" />
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Poll Preview */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <AnimatedSection>
                        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">🗳️ আজকের ভোট</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {recentPolls.map(poll => (
                                <PollPreviewCard key={poll.id} title={poll.title} />
                            ))}
                        </div>
                    </AnimatedSection>
                </div>
            </section>
        </div>
    );
};

// CalculatePage.tsx
type Category = 'love' | 'friendship' | 'laziness' | 'mood' | 'maturity' | 'depression' | 'foodie';
interface Question {
  text: string;
  options: string[];
}
const questionsData: Record<Category, Question[]> = {
  love: [
    { text: 'আপনারা একসাথে কতটা সময় কাটান?', options: ['খুব কম', 'মাঝে মাঝে', 'অনেক'] },
    { text: 'ছোট ছোট বিষয়েও কি তার কথা মনে পড়ে?', options: ['না', 'মাঝে মাঝে', 'হ্যাঁ, সবসময়'] },
    { text: 'তার খুশিতে কি আপনিও খুশি হন?', options: ['না', 'কিছুটা', 'অনেক বেশি'] },
  ],
  friendship: [
    { text: 'বিপদে পড়লে কাকে আগে ফোন করেন?', options: ['পরিবার', 'অন্য কেউ', 'এই বন্ধুকে'] },
    { text: 'আপনাদের মধ্যে গোপন কথা শেয়ার হয়?', options: ['না', 'কিছু কিছু', 'সবকিছুই'] },
    { text: 'কতদিন কথা না বলে থাকতে পারেন?', options: ['অনেকদিন', 'কিছুদিন', 'একদমই না'] },
  ],
  laziness: [
    { text: 'সকালে ঘুম থেকে উঠতে কেমন লাগে?', options: ['খুব ভালো', 'কষ্ট হয়', 'উঠতেই ইচ্ছা করে না'] },
    { text: 'আজকের কাজ কালকের জন্য কতবার ফেলেন?', options: ['কখনোই না', 'মাঝে মাঝে', 'সবসময়'] },
    { text: 'বিছানা থেকে উঠতে কতটা সময় লাগে?', options: ['সাথে সাথে', 'একটু পর', 'ঘণ্টার পর ঘণ্টা'] },
  ],
  mood: [
    { text: 'আজ আপনার মন কেমন?', options: ['খুব ফুরফুরে', 'মোটামুটি', 'একদম ভালো না'] },
    { text: 'ছোট ছোট জিনিসে কি আনন্দ পাচ্ছেন?', options: ['হ্যাঁ, পাচ্ছি', 'মাঝে মাঝে', 'একদমই না'] },
    { text: 'ভবিষ্যৎ নিয়ে কী ভাবছেন?', options: ['খুব আশাবাদী', 'কিছুটা চিন্তিত', 'খুব হতাশ লাগছে'] },
  ],
  maturity: [
    { text: 'সমালোচনা কীভাবে গ্রহণ করেন?', options: ['রেগে যাই', 'কিছুটা ভাবি', 'শান্তভাবে শুনি'] },
    { text: 'নিজের ভুলের জন্য কি ক্ষমা চান?', options: ['না', 'পরিস্থিতি বুঝে', 'হ্যাঁ, চাই'] },
    { text: 'অন্যের মতামতকে গুরুত্ব দেন?', options: ['কম', 'মাঝে মাঝে', 'সবসময়'] },
  ],
  depression: [
    { text: 'সবকিছুতে কি আগ্রহ হারিয়ে ফেলছেন?', options: ['না', 'কিছুটা', 'হ্যাঁ'] },
    { text: 'আপনার ঘুমের রুটিন কেমন?', options: ['স্বাভাবিক', 'কিছুটা অনিয়মিত', 'খুবই অনিয়মিত'] },
    { text: 'নিজেকে কি প্রায়ই একা মনে হয়?', options: ['না', 'মাঝে মাঝে', 'হ্যাঁ, প্রায়ই'] },
  ],
  foodie: [
    { text: 'নতুন খাবার চেষ্টা করতে কেমন লাগে?', options: ['ভয় লাগে', 'মাঝে মাঝে', 'খুব ভালোবাসি'] },
    { text: 'আপনার দিনের সেরা অংশ কোনটি?', options: ['কাজ', 'ঘুম', 'খাবার সময়'] },
    { text: 'সোশ্যাল মিডিয়ায় খাবারের ছবি দেখেন?', options: ['না', 'মাঝে মাঝে', 'হ্যাঁ, সবসময়'] },
  ],
};
const categoryNames: Record<Category, string> = {
  love: 'ভালোবাসা', friendship: 'বন্ধুত্ব', laziness: 'অলসতা', mood: 'মুড',
  maturity: 'ম্যাচিউরিটি', depression: 'হতাশার লেভেল', foodie: 'খাদ্য প্রেম'
};
const resultTexts: Record<Category, (score: number) => { text: string; emoji: string }> = {
  love: score => score > 80 ? { text: 'এটা একেবারে প্রেমিক-লেভেল ভালোবাসা!', emoji: '🥰' } : score > 50 ? { text: 'আপনাদের সম্পর্ক বেশ মজবুত!', emoji: '😊' } : { text: 'আরো একটু যত্ন নিন!', emoji: '🤔' },
  friendship: score => score > 80 ? { text: 'আপনারা মানিকজোড় বন্ধু!', emoji: '😎' } : score > 50 ? { text: 'বন্ধুত্ব বেশ ভালো!', emoji: '🙂' } : { text: 'বন্ধুত্বে আরও সময় দিন!', emoji: '😐' },
  laziness: score => score > 80 ? { text: 'আপনি তো কুম্ভকর্ণের বংশধর!', emoji: '😴' } : score > 50 ? { text: 'মাঝে মাঝে আলসেমি ভালো!', emoji: '😌' } : { text: 'আপনি খুবই কর্মঠ!', emoji: '💪' },
  mood: score => score > 70 ? { text: 'আপনার মন আজ ফুরফুরে!', emoji: '😄' } : score > 40 ? { text: 'মনটা একটু মেঘলা।', emoji: '😕' } : { text: 'মন খারাপ করবেন না, সব ঠিক হয়ে যাবে!', emoji: '😔' },
  maturity: score => score > 80 ? { text: 'আপনি খুবই পরিণত!', emoji: '🧐' } : score > 50 ? { text: 'আপনি সঠিক পথেই আছেন!', emoji: '👍' } : { text: 'অভিজ্ঞতা আপনাকে শিখিয়ে দেবে!', emoji: '🌱' },
  depression: score => score > 75 ? { text: 'বিশেষজ্ঞের পরামর্শ নেওয়া প্রয়োজন।', emoji: '🫂' } : score > 40 ? { text: 'নিজের যত্ন নিন, বন্ধুদের সাথে কথা বলুন।', emoji: '❤️' } : { text: 'আপনি মানসিকভাবে শক্তিশালী আছেন!', emoji: '😊' },
  foodie: score => score > 80 ? { text: 'আপনি একজন সত্যিকারের খাদ্যরসিক!', emoji: '😋' } : score > 50 ? { text: 'খাবার উপভোগ করতে জানেন!', emoji: '🍔' } : { text: 'আপনি স্বাস্থ্যসচেতন!', emoji: '🍎' },
};
const CalculatePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') as Category | null;

    const [category, setCategory] = useState<Category | null>(initialCategory);
    const [names, setNames] = useState({ name1: '', name2: '' });
    const [answers, setAnswers] = useState<number[]>([]);
    const [result, setResult] = useState<number | null>(null);

    useEffect(() => {
        if (initialCategory) {
            setCategory(initialCategory);
            reset();
        }
    }, [initialCategory]);
    
    const handleAnswer = (optionIndex: number) => {
        setAnswers([...answers, optionIndex]);
    };

    const calculateResult = () => {
        const totalPoints = answers.reduce((sum, ans) => sum + ans, 0);
        const maxPoints = (answers.length) * 2;
        const score = Math.floor((totalPoints / maxPoints) * 100) + Math.floor(Math.random() * 10);
        setResult(Math.min(100, score));
    };

    const reset = () => {
        setAnswers([]);
        setResult(null);
        setNames({ name1: '', name2: '' });
    };

    const currentQuestionIndex = answers.length;
    const questions = category ? questionsData[category] : [];
    const isNameCategory = category === 'love' || category === 'friendship';

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategory = e.target.value as Category;
        setCategory(newCategory);
        reset();
    };

    if (result !== null) {
        const { text, emoji } = resultTexts[category!](result);
        return (
            <div className="container mx-auto px-6 py-12 text-center">
                <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-lg mx-auto">
                    <h2 className="text-3xl font-bold mb-4">{categoryNames[category!]} ফলাফল</h2>
                    {isNameCategory && <p className="text-xl mb-4">{names.name1} ও {names.name2}</p>}
                    <div className="relative w-48 h-48 mx-auto my-6 flex items-center justify-center">
                        {category === 'love' ? 
                            <div className="text-red-500 text-8xl animate-heartbeat">❤️</div>
                            :
                            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center" style={{background: `conic-gradient(#6C63FF ${result * 3.6}deg, #e0e0e0 0deg)`}}>
                                <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-4xl font-bold text-secondary">{result}%</span>
                                </div>
                            </div>
                        }
                    </div>
                    <p className="text-2xl font-semibold text-gray-700">{result}% {emoji}</p>
                    <p className="text-lg mt-2">{text}</p>
                    <button onClick={() => { setCategory(null); reset();}} className="mt-8 bg-secondary text-white font-bold py-3 px-6 rounded-full hover:bg-opacity-90 transition-transform hover:scale-105 duration-300">
                        আবার চেষ্টা করুন
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto">
                {!category ? (
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-2">অনুভূতি পরিমাপ করুন</h1>
                        <p className="text-lg text-gray-600 mb-8">যা মাপে না মন, তা মাপে ফিলমিটার!</p>
                        <div className="mb-6">
                            <label htmlFor="category" className="text-xl font-semibold mb-2 block">আপনি কী মাপতে চান?</label>
                            <select
                                id="category"
                                onChange={handleCategoryChange}
                                defaultValue=""
                                className="w-full max-w-xs mx-auto p-3 border-2 border-primary-end rounded-full text-lg focus:ring-2 focus:ring-primary-start focus:border-transparent outline-none"
                            >
                                <option value="" disabled>একটি বিষয় নির্বাচন করুন</option>
                                {Object.entries(categoryNames).map(([key, name]) => (
                                    <option key={key} value={key}>{name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-3xl font-bold text-center mb-6">{categoryNames[category]}</h2>
                        
                        {isNameCategory && currentQuestionIndex === 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <input type="text" placeholder="আপনার নাম" value={names.name1} onChange={e => setNames({...names, name1: e.target.value})} className="p-3 border rounded-lg w-full"/>
                                <input type="text" placeholder="অন্যজনের নাম" value={names.name2} onChange={e => setNames({...names, name2: e.target.value})} className="p-3 border rounded-lg w-full"/>
                            </div>
                        )}

                        {currentQuestionIndex < questions.length ? (
                            <div className="text-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                                    <div className="bg-gradient-to-r from-primary-start via-primary-via to-primary-end h-2.5 rounded-full transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                                </div>
                                <h3 className="text-2xl font-semibold mb-6">{questions[currentQuestionIndex].text}</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {questions[currentQuestionIndex].options.map((opt, i) => (
                                        <button key={i} onClick={() => handleAnswer(i)} className="w-full text-left p-4 bg-white border-2 border-transparent rounded-lg shadow-md hover:border-secondary hover:scale-105 transition-all duration-300">
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <h3 className="text-2xl font-semibold mb-6">সব প্রশ্নের উত্তর দেওয়া হয়েছে!</h3>
                                <button onClick={calculateResult} disabled={isNameCategory && (!names.name1 || !names.name2)} className="bg-accent text-gray-900 font-bold py-3 px-8 rounded-full hover:bg-opacity-90 transition-transform hover:scale-105 duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    ফলাফল দেখুন
                                </button>
                            </div>
                        )}
                        <button onClick={() => { setCategory(null); reset(); }} className="mt-8 text-sm text-gray-500 hover:text-secondary">অন্য কিছু মাপুন</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// PollPage.tsx
const PollResultBar: React.FC<{ option: PollOption; totalVotes: number }> = ({ option, totalVotes }) => {
  const percentage = totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(1) : '0.0';
  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-gray-700">{option.text}</span>
        <span className="text-sm font-medium text-secondary">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div className="bg-gradient-to-r from-primary-start via-primary-via to-primary-end h-4 rounded-full transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};
const PollCard: React.FC<{ poll: Poll; onVote: (pollId: string, optionIndex: number) => void; hasVoted: boolean; votedOptionIndex: number | null }> = ({ poll, onVote, hasVoted, votedOptionIndex }) => {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

    return (
        <AnimatedSection className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl w-full transition-transform transition-shadow duration-300 hover:scale-105 hover:shadow-2xl">
            <h3 className="text-2xl font-bold mb-2 text-gray-800">{poll.title}</h3>
            <p className="text-sm text-gray-500 mb-4">ক্যাটাগরি: {poll.category} | মোট ভোট: {totalVotes}</p>
            
            {hasVoted ? (
                <div>
                    <h4 className="font-semibold mb-2">ফলাফল:</h4>
                    {poll.options.map((option, index) => (
                        <PollResultBar key={index} option={option} totalVotes={totalVotes} />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {poll.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => onVote(poll.id, index)}
                            className="w-full text-left p-3 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:border-secondary hover:bg-secondary/10 transition-all duration-200"
                        >
                            {option.text}
                        </button>
                    ))}
                </div>
            )}
        </AnimatedSection>
    );
};
const PollPage: React.FC = () => {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [votedPolls, setVotedPolls] = useState<Record<string, number | null>>({});
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        const allPolls = getPolls();
        setPolls(allPolls);
        const userVotes = JSON.parse(localStorage.getItem('feelmeter_votes') || '{}');
        const initialVotedState: Record<string, number | null> = {};
        allPolls.forEach(poll => {
            initialVotedState[poll.id] = hasVotedInStorage(poll.id) ? userVotes[poll.id] : null;
        });
        setVotedPolls(initialVotedState);
    }, []);

    const handleVote = (pollId: string, optionIndex: number) => {
        if (hasVotedInStorage(pollId)) return;

        addVote(pollId, optionIndex);
        
        setPolls(getPolls());
        setVotedPolls(prev => ({ ...prev, [pollId]: optionIndex }));

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
    };

    return (
        <div className="container mx-auto px-4 py-12">
            {showConfetti && <Confetti />}
            <h1 className="text-5xl font-bold text-center mb-12 text-gray-800">জনমত জরিপ</h1>
            <div className="max-w-3xl mx-auto space-y-8">
                {polls.map(poll => (
                    <PollCard
                        key={poll.id}
                        poll={poll}
                        onVote={handleVote}
                        hasVoted={votedPolls[poll.id] !== null}
                        votedOptionIndex={votedPolls[poll.id]}
                    />
                ))}
            </div>
        </div>
    );
};

// AdminPage.tsx
const ADMIN_PASSWORD = "admin"; 
const AdminPage: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [polls, setPolls] = useState<Poll[]>([]);
    const [newPoll, setNewPoll] = useState({
        title: '',
        category: '',
        options: ['', ''],
        durationDays: 7,
    });

    useEffect(() => {
        if (isLoggedIn) {
            setPolls(getPolls());
        }
    }, [isLoggedIn]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsLoggedIn(true);
            setError('');
        } else {
            setError('ভুল পাসওয়ার্ড!');
        }
    };
    
    const handleAddOption = () => {
        if (newPoll.options.length < 5) {
            setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const options = [...newPoll.options];
        options[index] = value;
        setNewPoll({ ...newPoll, options });
    };

    const handleCreatePoll = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPoll.title && newPoll.category && newPoll.options.every(opt => opt.trim() !== '')) {
            addPoll({
                title: newPoll.title,
                category: newPoll.category,
                options: newPoll.options,
                durationDays: newPoll.durationDays,
            });
            setNewPoll({ title: '', category: '', options: ['', ''], durationDays: 7 });
            setPolls(getPolls());
        } else {
            alert('অনুগ্রহ করে সব ঘর পূরণ করুন।');
        }
    };

    const handleDeletePoll = (pollId: string) => {
        if(window.confirm('আপনি কি এই পোলটি মুছে ফেলতে চান?')) {
            deletePoll(pollId);
            setPolls(getPolls());
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                    <h1 className="text-2xl font-bold text-center mb-4">অ্যাডমিন লগইন</h1>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="পাসওয়ার্ড দিন"
                            className="w-full p-2 border rounded mb-4"
                        />
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <button type="submit" className="w-full bg-secondary text-white p-2 rounded hover:bg-opacity-90">
                            প্রবেশ করুন
                        </button>
                    </form>
                    <Link to="/" className="text-center block mt-4 text-sm text-gray-600 hover:underline">হোম পেজে ফিরে যান</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">অ্যাডমিন ড্যাশবোর্ড</h1>
                <Link to="/" className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">সাইট দেখুন</Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold mb-4">নতুন পোল তৈরি করুন</h2>
                <form onSubmit={handleCreatePoll} className="space-y-4">
                    <input
                        type="text"
                        placeholder="পোলের শিরোনাম (বাংলায় লিখুন)"
                        value={newPoll.title}
                        onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="ক্যাটাগরি (যেমন: রাজনীতি, সমাজ)"
                        value={newPoll.category}
                        onChange={(e) => setNewPoll({ ...newPoll, category: e.target.value })}
                        className="w-full p-2 border rounded"
                    />
                    <div>
                        <label className="block mb-2 font-semibold">অপশনসমূহ:</label>
                        {newPoll.options.map((option, index) => (
                            <input
                                key={index}
                                type="text"
                                placeholder={`অপশন ${index + 1}`}
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                className="w-full p-2 border rounded mb-2"
                            />
                        ))}
                        {newPoll.options.length < 5 && (
                            <button type="button" onClick={handleAddOption} className="text-sm text-secondary hover:underline">
                                + আরও অপশন যোগ করুন
                            </button>
                        )}
                    </div>
                     <input
                        type="number"
                        placeholder="সময়সীমা (দিন)"
                        value={newPoll.durationDays}
                        onChange={(e) => setNewPoll({ ...newPoll, durationDays: parseInt(e.target.value) || 7 })}
                        className="w-full p-2 border rounded"
                    />
                    <button type="submit" className="w-full bg-accent text-gray-900 p-3 rounded font-bold hover:bg-opacity-90">
                        পোল তৈরি করুন
                    </button>
                </form>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">বিদ্যমান পোলসমূহ</h2>
                <div className="space-y-4">
                    {polls.map(poll => (
                        <div key={poll.id} className="flex justify-between items-center p-4 border rounded">
                            <p>{poll.title}</p>
                            <button onClick={() => handleDeletePoll(poll.id)} className="text-red-500 hover:text-red-700 font-semibold">
                                মুছে ফেলুন
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


// --- APP STRUCTURE (from App.tsx) ---

const Header: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        document.addEventListener('scroll', handleScroll);
        return () => {
            document.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `px-4 rounded-full transition-all duration-300 hover:bg-white/20 hover:text-white ${isActive ? 'bg-white/20 font-bold text-white' : 'text-white/80'} ${scrolled ? 'py-1 text-base' : 'py-2 text-lg'}`;

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${scrolled ? 'py-2 bg-gradient-to-r from-primary-start/80 via-primary-via/80 to-primary-end/80 backdrop-blur-xl shadow-xl' : 'py-3 bg-gradient-to-r from-primary-start/60 via-primary-via/60 to-primary-end/60 backdrop-blur-lg shadow-lg'}`}>
            <nav className="container mx-auto px-6 flex justify-between items-center">
                <NavLink to="/" className={`font-bold text-white animate-glow transition-all duration-300 ease-in-out ${scrolled ? 'text-2xl' : 'text-3xl'}`}>
                    ফিলমিটার
                </NavLink>
                <div className="flex items-center space-x-4">
                    <NavLink to="/" className={navLinkClass}>হোম</NavLink>
                    <NavLink to="/calculate" className={navLinkClass}>পরিমাপ করুন</NavLink>
                    <NavLink to="/poll" className={navLinkClass}>ভোট দিন</NavLink>
                </div>
            </nav>
        </header>
    );
};

const Footer: React.FC = () => {
    return (
        <footer className="bg-dark-bg text-white py-6 mt-16">
            <div className="container mx-auto px-6 text-center">
                <p>&copy; ২০২৪ ফিলমিটার। সর্বসত্ত্ব সংরক্ষিত।</p>
                <p className="text-sm text-gray-400 mt-2">যা মাপে না মন, তা মাপে ফিলমিটার!</p>
                 <div className="mt-4">
                    <NavLink to="/admin" className="text-gray-400 hover:text-white transition-colors duration-300">অ্যাডমিন প্যানেল</NavLink>
                </div>
            </div>
        </footer>
    );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const isAdminPage = location.pathname === '/admin';
    
    return (
        <div className="min-h-screen bg-light-bg/95 text-gray-800 font-sans relative overflow-x-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-start via-primary-via to-primary-end opacity-25 -z-10 animate-gradient bg-[400%_400%]" />
            {!isAdminPage && <Header />}
            <main className={!isAdminPage ? "pt-24" : ""}>
                {children}
            </main>
            {!isAdminPage && <Footer />}
        </div>
    );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calculate" element={<CalculatePage />} />
          <Route path="/poll" element={<PollPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};


// --- RENDER APP ---

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
