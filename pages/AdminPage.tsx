import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Poll } from '../types';
// FIX: Replaced non-existent 'FaSignOutAlt' icon with 'FaArrowRightFromBracket'.
import { FaPlus, FaTrash, FaPencil, FaArrowRightFromBracket } from 'react-icons/fa6';

const ADMIN_PASSWORD = "admin"; // Simple password for demo

const AdminPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('isAdminLoggedIn') === 'true');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [polls, setPolls] = useLocalStorage<Poll[]>('polls', []);
  const [editingPollId, setEditingPollId] = useState<string | null>(null);
  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    options: ['', ''],
    category: 'মজা',
    duration: 7,
  });
  
  useEffect(() => {
    sessionStorage.setItem('isAdminLoggedIn', String(isLoggedIn));
  }, [isLoggedIn]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('ভুল পাসওয়ার্ড!');
    }
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
  }

  const handleOptionChange = (index: number, value: string) => {
    const options = [...newPoll.options];
    options[index] = value;
    setNewPoll({ ...newPoll, options });
  };

  const addOption = () => {
    if (newPoll.options.length < 5) {
      setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
    }
  };
  
  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      const options = newPoll.options.filter((_, i) => i !== index);
      setNewPoll({ ...newPoll, options });
    }
  };
  
  const resetForm = () => {
    setEditingPollId(null);
    setNewPoll({ title: '', description: '', options: ['', ''], category: 'মজা', duration: 7 });
  }

  const handleEdit = (poll: Poll) => {
    setEditingPollId(poll.id);
    setNewPoll({
      title: poll.title,
      description: poll.description || '',
      options: poll.options.map(o => o.text),
      category: poll.category,
      duration: poll.duration
    });
  }

  const handleSubmit = () => {
    if (!newPoll.title || !newPoll.options.every(opt => opt.trim() !== '')) {
        alert('Please fill out the title and all options.');
        return;
    }

    if (editingPollId) {
        // Update existing poll
        setPolls(polls.map(p => p.id === editingPollId ? {
            ...p,
            title: newPoll.title,
            description: newPoll.description,
            options: newPoll.options.map((optText, index) => {
                const oldOption = p.options[index];
                // Preserve votes if option text is the same, otherwise reset
                return oldOption && oldOption.text === optText ? oldOption : { text: optText, votes: 0 };
            }),
            category: newPoll.category,
            duration: newPoll.duration,
        } : p));
    } else {
        // Create new poll
        const pollToAdd: Poll = {
            id: new Date().toISOString(),
            title: newPoll.title,
            description: newPoll.description,
            options: newPoll.options.map(opt => ({ text: opt, votes: 0 })),
            category: newPoll.category,
            createdAt: Date.now(),
            duration: newPoll.duration,
        };
        setPolls([pollToAdd, ...polls]);
    }
    
    resetForm();
  };

  const deletePoll = (id: string) => {
    if (window.confirm("আপনি কি এই পোলটি মুছে ফেলতে চান?")) {
        setPolls(polls.filter(poll => poll.id !== id));
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-6 py-20 flex justify-center items-center" style={{minHeight: 'calc(100vh - 200px)'}}>
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl">
          <h1 className="text-2xl font-bold text-center mb-6">অ্যাডমিন লগইন</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="পাসওয়ার্ড দিন"
            className="w-full p-3 border border-gray-300 rounded-lg mb-4"
          />
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <button onClick={handleLogin} className="w-full p-3 bg-[#6C63FF] text-white font-bold rounded-full">
            প্রবেশ করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
       <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
            <h1 className="text-4xl font-bold">অ্যাডমিন ড্যাশবোর্ড</h1>
            <button 
                onClick={handleLogout} 
                className="flex items-center px-4 py-2 bg-gray-600 text-white font-semibold rounded-full hover:bg-gray-700 transition-all text-sm sm:text-base"
            >
                {/* FIX: Replaced non-existent 'FaSignOutAlt' icon with 'FaArrowRightFromBracket'. */}
                <FaArrowRightFromBracket className="mr-2"/> লগআউট
            </button>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Create/Edit Poll Form */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">{editingPollId ? 'পোল সম্পাদনা করুন' : 'নতুন পোল তৈরি করুন'}</h2>
          <div className="space-y-4">
            <input type="text" placeholder="পোলের শিরোনাম (বাংলায়)" value={newPoll.title} onChange={e => setNewPoll({...newPoll, title: e.target.value})} className="w-full p-3 border rounded-lg"/>
            <textarea placeholder="সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)" value={newPoll.description} onChange={e => setNewPoll({...newPoll, description: e.target.value})} className="w-full p-3 border rounded-lg h-24"/>
            <div>
              <label className="font-semibold">অপশনগুলো</label>
              {newPoll.options.map((opt, index) => (
                <div key={index} className="flex items-center space-x-2 mt-2">
                  <input type="text" placeholder={`অপশন ${index + 1}`} value={opt} onChange={e => handleOptionChange(index, e.target.value)} className="w-full p-2 border rounded-lg"/>
                  {newPoll.options.length > 2 && <button onClick={() => removeOption(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><FaTrash /></button>}
                </div>
              ))}
              {newPoll.options.length < 5 && <button onClick={addOption} className="mt-2 flex items-center text-sm text-[#6C63FF] font-semibold"><FaPlus className="mr-1"/> অপশন যোগ করুন</button>}
            </div>
            <select value={newPoll.category} onChange={e => setNewPoll({...newPoll, category: e.target.value})} className="w-full p-3 border rounded-lg bg-white">
              <option>রাজনীতি</option>
              <option>সমাজ</option>
              <option>ট্রেন্ড</option>
              <option>মজা</option>
            </select>
            <input type="number" placeholder="সময়কাল (দিন)" value={newPoll.duration} onChange={e => setNewPoll({...newPoll, duration: parseInt(e.target.value) || 0})} className="w-full p-3 border rounded-lg"/>
            <div className="flex space-x-2">
                <button onClick={handleSubmit} className="w-full p-3 bg-gradient-to-r from-[#FF6B81] to-[#FFB6C1] text-white font-bold rounded-full">{editingPollId ? 'আপডেট করুন' : 'পোল তৈরি করুন'}</button>
                {editingPollId && (
                  <button onClick={resetForm} className="w-1/2 p-3 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-all">বাতিল করুন</button>
                )}
            </div>
          </div>
        </div>

        {/* Existing Polls List */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">বিদ্যমান পোলসমূহ</h2>
          <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-2">
            {polls.length > 0 ? polls.map(poll => (
                <div key={poll.id} className="p-4 border rounded-lg flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="font-semibold">{poll.title}</h3>
                        <p className="text-sm text-gray-500">{poll.category} - মোট ভোট: {poll.options.reduce((a, b) => a + b.votes, 0)}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => handleEdit(poll)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"><FaPencil /></button>
                        <button onClick={() => deletePoll(poll.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"><FaTrash /></button>
                    </div>
                </div>
            )) : <p className="text-center text-gray-500 py-8">কোনো পোল তৈরি করা হয়নি।</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;