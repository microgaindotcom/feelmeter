
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CalculatePage from './pages/CalculatePage';
import PollPage from './pages/PollPage';
import AdminPage from './pages/AdminPage';
import Header from './components/Header';
import Footer from './hooks/Footer';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 overflow-x-hidden">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/calculate" element={<CalculatePage />} />
            <Route path="/poll" element={<PollPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
