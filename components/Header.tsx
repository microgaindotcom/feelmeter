
import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  const activeLinkClass = "text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B81] to-[#6C63FF] font-bold";
  const inactiveLinkClass = "hover:text-[#FF6B81] transition-colors duration-300";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <NavLink to="/" className="text-3xl font-bold text-gray-800 font-poppins">
          Feel<span className="text-[#FF6B81]">Meter</span> <span className="text-xl">ফিলমিটার</span>
        </NavLink>
        <nav className="hidden md:flex items-center space-x-8 text-lg font-semibold">
          <NavLink to="/" className={({ isActive }) => (isActive ? activeLinkClass : inactiveLinkClass)}>হোম</NavLink>
          <NavLink to="/calculate" className={({ isActive }) => (isActive ? activeLinkClass : inactiveLinkClass)}>পরিমাপ করুন</NavLink>
          <NavLink to="/poll" className={({ isActive }) => (isActive ? activeLinkClass : inactiveLinkClass)}>ভোট দিন</NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;
