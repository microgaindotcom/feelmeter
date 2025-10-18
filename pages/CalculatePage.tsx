
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShareNodes, FaArrowRotateRight } from 'react-icons/fa6';
import { MeterCategory, MeterQuestion } from '../types';

const questionsData: Record<MeterCategory, MeterQuestion[]> = {
  [MeterCategory.Love]: [
    { question: "আপনারা একসাথে কতটা সময় কাটান?", options: ["খুব কম", "মাঝে মাঝে", "অনেক"], type: 'radio' },
    { question: "ছোট ছোট বিষয়ে কি আপনারা ঝগড়া করেন?", options: ["হ্যাঁ, প্রায়ই", "মাঝে মাঝে", "না, করি না"], type: 'radio' },
    { question: "একে অপরকে কতটা বোঝেন?", options: ["একদমই না", "মোটামুটি", "খুব ভালো"], type: 'radio' },
  ],
  [MeterCategory.Friendship]: [
    { question: "বিপদে পড়লে কাকে আগে ফোন দেন?", options: ["পরিবারকে", "এই বন্ধুকে", "অন্য কাউকে"], type: 'radio' },
    { question: "আপনাদের মধ্যে গোপন কথা শেয়ার হয়?", options: ["না, হয় না", "কিছু কিছু", "সবকিছু"], type: 'radio' },
    { question: "কতদিন কথা না বলে থাকতে পারেন?", options: ["এক সপ্তাহ", "এক মাস", "এক বছর"], type: 'radio' },
  ],
  [MeterCategory.Laziness]: [
    { question: "সকালে ঘুম থেকে উঠতে কেমন লাগে?", options: ["খুব কষ্ট", "মাঝে মাঝে", "সহজ"], type: 'radio' },
    { question: "আজকের কাজ কি কালকের জন্য রাখেন?", options: ["সবসময়", "মাঝে মাঝে", "কখনোই না"], type: 'radio' },
    { question: "বিছানা থেকে উঠতে কতক্ষণ লাগে?", options: ["৩০ মিনিটের বেশি", "১০-২০ মিনিট", "৫ মিনিটের কম"], type: 'radio' },
  ],
   [MeterCategory.Mood]: [
    { question: "আজ আপনার দিনটা কেমন যাচ্ছে?", options: ["খুব খারাপ", "মোটামুটি", "চমৎকার"], type: 'radio' },
    { question: "ছোট বিষয়ে কি মেজাজ খারাপ হয়?", options: ["হ্যাঁ, প্রায়ই", "মাঝে মাঝে", "না"], type: 'radio' },
    { question: "আপনার কি এখন গান শুনতে ইচ্ছা করছে?", options: ["হ্যাঁ", "না", "কিছু বলতে পারছি না"], type: 'radio' },
  ],
  [MeterCategory.Maturity]: [
    { question: "সমালোচনা কীভাবে গ্রহণ করেন?", options: ["খুব রেগে যাই", "কিছুটা খারাপ লাগে", "ভুল থেকে শিখি"], type: 'radio' },
    { question: "আবেগ দিয়ে সিদ্ধান্ত নেন নাকি যুক্তি দিয়ে?", options: ["শুধু আবেগ", "দুটোই", "শুধু যুক্তি"], type: 'radio' },
    { question: "ভবিষ্যৎ নিয়ে কি আপনি চিন্তিত?", options: ["অতিরিক্ত", "মাঝে মাঝে", "পরিকল্পনা করে চলি"], type: 'radio' },
  ],
  [MeterCategory.Frustration]: [
    { question: "ছোটখাটো বিষয়ে কি হতাশ হন?", options: ["হ্যাঁ, সবসময়", "মাঝে মাঝে", "না, হই না"], type: 'radio' },
    { question: "মনে হয় কি আপনার সাথে কিছুই ভালো হয় না?", options: ["হ্যাঁ, প্রায়ই", "কখনো কখনো", "না, মনে হয় না"], type: 'radio' },
    { question: "কতটা একা লাগে আপনার?", options: ["খুব বেশি", "মাঝে মাঝে", "লাগে না"], type: 'radio' },
  ],
  [MeterCategory.Foodie]: [
    { question: "নতুন খাবার চেষ্টা করতে কেমন লাগে?", options: ["ভয় লাগে", "মাঝে মাঝে", "খুব ভালোবাসি"], type: 'radio' },
    { question: "আপনার কি প্রায়ই ক্ষুধা লাগে?", options: ["হ্যাঁ, সবসময়", "মাঝে মাঝে", "না"], type: 'radio' },
    { question: "맛집 দেখলেই কি খেতে ইচ্ছা করে?", options: ["হ্যাঁ!", "না", "কখনো কখনো"], type: 'radio' },
  ]
};

const resultTexts: Record<MeterCategory, (score: number) => string> = {
    [MeterCategory.Love]: score => `আপনার ভালোবাসার মাত্রা: ${score}%! 🥰 ${score > 80 ? 'এটা একেবারে প্রেমিক-লেভেল ভালোবাসা!' : (score > 50 ? 'আপনাদের সম্পর্ক বেশ মজবুত।' : 'আরও একটু যত্ন নিন সম্পর্কের।')}`,
    [MeterCategory.Friendship]: score => `আপনাদের বন্ধুত্বের স্কেল: ${score}%! 🤝 ${score > 85 ? 'আপনারা তো একেবারে হরিহর আত্মা!' : (score > 60 ? 'বন্ধুত্ব বেশ ভালো, চালিয়ে যান।': 'বন্ধুত্বের চর্চা দরকার।')}`,
    [MeterCategory.Laziness]: score => `আপনার অলসতা স্কোর: ${score}%! 💤 ${score > 80 ? 'আপনি তো কুম্ভকর্ণের বংশধর!' : (score > 50 ? 'মাঝে মাঝে আলসেমি করা ভালো।' : 'আপনি খুবই পরিশ্রমী!')}`,
    [MeterCategory.Mood]: score => `আপনার মুড মিটার: ${score}%! 🎨 ${score > 75 ? 'আপনার মন আজ ফুরফুরে!' : (score > 40 ? 'মন মোটামুটি ভালো।': 'মনটা একটু ভালো করুন।')}`,
    [MeterCategory.Maturity]: score => `আপনার ম্যাচিউরিটি লেভেল: ${score}%! 🤔 ${score > 80 ? 'আপনি বয়সের চেয়ে অনেক বেশি পরিণত!' : (score > 50 ? 'আপনি সঠিক পথেই আছেন।': 'অভিজ্ঞতা আপনাকে আরও শেখাবে।')}`,
    [MeterCategory.Frustration]: score => `আপনার হতাশার লেবেল: ${score}%! 😟 ${score > 70 ? 'মনে হচ্ছে আপনি খুব কঠিন সময় পার করছেন।' : (score > 40 ? 'কিছুটা চাপ আছে, তবে ঠিক হয়ে যাবে।': 'আপনি বেশ শান্ত আছেন।')}`,
    [MeterCategory.Foodie]: score => `আপনি ${score}% খাদ্য প্রেমিক! 🍔 ${score > 85 ? 'খাবারই আপনার প্রথম ভালোবাসা!' : (score > 60 ? 'আপনি খেতে ভালোবাসেন।': 'আপনি স্বাস্থ্যের প্রতি বেশ সচেতন।')}`,
};


const CalculatePage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = (queryParams.get('category') as MeterCategory) || '';
  
  const [selectedCategory, setSelectedCategory] = useState<MeterCategory | ''>(initialCategory);
  const [names, setNames] = useState({ name1: '', name2: '' });
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    setSelectedCategory(initialCategory);
    resetForm();
  }, [initialCategory]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value as MeterCategory);
    resetForm();
  };
  
  const resetForm = () => {
    setNames({ name1: '', name2: '' });
    setAnswers([]);
    setResult(null);
  }

  const handleAnswer = (qIndex: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = value;
    setAnswers(newAnswers);
  };
  
  const calculateResult = () => {
    const totalPossibleScore = (questionsData[selectedCategory as MeterCategory]?.length || 0) * 2;
    const userScore = answers.reduce((acc, curr) => acc + curr, 0);
    const percentage = Math.floor(((userScore + Math.random() * 2) / (totalPossibleScore + 1)) * 100);
    setResult(Math.min(100, Math.max(10, percentage)));
  };

  const isFormComplete = selectedCategory && 
    (![MeterCategory.Love, MeterCategory.Friendship].includes(selectedCategory) || (names.name1 && names.name2)) &&
    (answers.length === questionsData[selectedCategory]?.length && answers.every(a => a !== undefined));

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <AnimatePresence mode="wait">
          {result === null ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-center mb-6">অনুভূতি পরিমাপ করুন</h1>
              
              <div className="mb-6">
                <label className="block text-lg font-semibold mb-2" htmlFor="category-select">আপনি কী মাপতে চান?</label>
                <select 
                  id="category-select" 
                  value={selectedCategory} 
                  onChange={handleCategoryChange}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#FF6B81] focus:border-transparent transition"
                >
                  <option value="" disabled>একটি নির্বাচন করুন</option>
                  {Object.values(MeterCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {selectedCategory && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {[MeterCategory.Love, MeterCategory.Friendship].includes(selectedCategory) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <input type="text" placeholder="আপনার নাম" value={names.name1} onChange={e => setNames({...names, name1: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C63FF]"/>
                      <input type="text" placeholder="অন্যজনের নাম" value={names.name2} onChange={e => setNames({...names, name2: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C63FF]"/>
                    </div>
                  )}

                  {questionsData[selectedCategory].map((q, qIndex) => (
                    <div key={qIndex} className="mb-6 p-4 bg-pink-50/50 rounded-lg">
                      <p className="font-semibold mb-3">{q.question}</p>
                      <div className="flex justify-around">
                        {q.options.map((opt, oIndex) => (
                          <label key={oIndex} className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name={`q${qIndex}`} checked={answers[qIndex] === oIndex} onChange={() => handleAnswer(qIndex, oIndex)} className="form-radio text-[#FF6B81] focus:ring-[#FF6B81]"/>
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <motion.button 
                    onClick={calculateResult}
                    disabled={!isFormComplete}
                    whileHover={{ scale: isFormComplete ? 1.05 : 1 }}
                    className="w-full p-4 bg-gradient-to-r from-[#FF6B81] to-[#FFB6C1] text-white font-bold text-lg rounded-full shadow-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    ফলাফল দেখুন
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-4">আপনার ফলাফল</h2>
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    className="stroke-current text-gray-200"
                    fill="none"
                    strokeWidth="3.8"
                  />
                  <motion.path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="3.8"
                    strokeDasharray={`${result}, 100`}
                    className="stroke-current text-[#FF6B81]"
                    initial={{ strokeDasharray: '0, 100' }}
                    animate={{ strokeDasharray: `${result}, 100` }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    className="text-5xl font-bold text-[#FF6B81]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    {result}%
                  </motion.span>
                </div>
              </div>

              <p className="text-xl text-gray-700 mb-8">{resultTexts[selectedCategory as MeterCategory](result)}</p>

              <div className="flex justify-center space-x-4">
                <button className="flex items-center px-6 py-2 bg-[#6C63FF] text-white font-semibold rounded-full shadow-md hover:bg-opacity-90 transition-all">
                  <FaShareNodes className="mr-2"/> শেয়ার করুন
                </button>
                 <button onClick={resetForm} className="flex items-center px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-all">
                  <FaArrowRotateRight className="mr-2"/> আবার করুন
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CalculatePage;
