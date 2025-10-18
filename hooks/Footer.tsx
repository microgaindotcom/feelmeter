import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white/50 border-t border-gray-200 mt-16">
      <div className="container mx-auto px-6 py-8 text-center text-gray-600">
        <p className="mb-4">© {new Date().getFullYear()} ফিলমিটার। সর্বস্বত্ব সংরক্ষিত।</p>
        <div className="flex justify-center space-x-6">
          <a href="#" className="hover:text-[#FF6B81] transition-colors"><FaFacebook size={24} /></a>
          <a href="#" className="hover:text-[#FF6B81] transition-colors"><FaTwitter size={24} /></a>
          <a href="#" className="hover:text-[#FF6B81] transition-colors"><FaInstagram size={24} /></a>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200/50">
           <Link to="/admin" className="text-sm text-gray-500 hover:text-gray-800 hover:underline transition-colors">
            অ্যাডমিন লগইন
           </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;