
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Confetti from 'react-confetti';
import useLocalStorage from '../hooks/useLocalStorage';
import { Poll, PollOption } from '../types';

const COLORS = ['#FF6B81', '#6C63FF', '#FFD93D', '#4BC0C0', '#9966FF'];

const PollCard: React.FC<{ poll: Poll, onVote: (pollId: string, optionIndex: number) => void, votedPolls: string[] }> = ({ poll, onVote, votedPolls }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(votedPolls.includes(poll.id));

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  const handleVote = () => {
    if (selectedOption !== null) {
      onVote(poll.id, selectedOption);
      setShowResult(true);
    }
  };

  const chartData = poll.options.map(opt => ({ name: opt.text, votes: opt.votes }));

  return (
    <motion.div 
        layout
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="bg-white p-8 rounded-2xl shadow-lg mb-8"
    >
      <h2 className="text-2xl font-bold mb-2">{poll.title}</h2>
      <p className="text-gray-500 mb-6">{poll.description || `ক্যাটেগরি: ${poll.category}`}</p>

      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div
            key="vote"
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="space-y-4 mb-6">
              {poll.options.map((option, index) => (
                <label
                  key={index}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedOption === index ? 'border-[#6C63FF] bg-purple-50 shadow-inner' : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`poll-${poll.id}`}
                    className="hidden"
                    onChange={() => setSelectedOption(index)}
                  />
                  <span className="text-lg">{option.text}</span>
                </label>
              ))}
            </div>
            <motion.button
              onClick={handleVote}
              disabled={selectedOption === null}
              whileHover={{ scale: selectedOption !== null ? 1.05 : 1 }}
              className="w-full p-3 bg-gradient-to-r from-[#FF6B81] to-[#FFB6C1] text-white font-bold rounded-full shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              ভোট দিন
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-semibold mb-4">ফলাফল</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#4A5568' }}/>
                  <Tooltip cursor={{fill: 'rgba(238, 238, 238, 0.5)'}}/>
                  <Bar dataKey="votes" barSize={30} radius={[0, 10, 10, 0]}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center mt-4 text-gray-600 font-semibold">মোট ভোট: {totalVotes}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


const PollPage: React.FC = () => {
  const [polls, setPolls] = useLocalStorage<Poll[]>('polls', []);
  const [votedPolls, setVotedPolls] = useLocalStorage<string[]>('votedPolls', []);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleVote = (pollId: string, optionIndex: number) => {
    if (votedPolls.includes(pollId)) return;

    const newPolls = polls.map(poll => {
      if (poll.id === pollId) {
        const newOptions = [...poll.options];
        newOptions[optionIndex].votes += 1;
        return { ...poll, options: newOptions };
      }
      return poll;
    });

    setPolls(newPolls);
    setVotedPolls([...votedPolls, pollId]);
    
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  return (
    <div className="container mx-auto px-6 py-12">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300}/>}
      <h1 className="text-4xl font-bold text-center mb-12">সক্রিয় ভোট</h1>
      <div className="max-w-3xl mx-auto">
        {polls.length > 0 ? (
          polls.map(poll => (
            <PollCard key={poll.id} poll={poll} onVote={handleVote} votedPolls={votedPolls} />
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <p className="text-2xl text-gray-500">এখন কোনো সক্রিয় ভোট নেই।</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollPage;
