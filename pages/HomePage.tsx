import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants, useScroll, useTransform } from 'framer-motion';
import { FaHeart, FaUserGroup, FaBed, FaFaceSmile } from 'react-icons/fa6';
import useLocalStorage from '../hooks/useLocalStorage';
import { Poll } from '../types';

const heroContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
};

const heroItemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
};

const categoryContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const categoryCardVariants: Variants = {
  hidden: { opacity: 0, y: 50, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: "easeOut" }
  },
};

const HomePage: React.FC = () => {
  const [polls] = useLocalStorage<Poll[]>('polls', []);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const featuredCategories = [
    { name: "ভালোবাসার মিটার", icon: <FaHeart className="text-5xl text-red-400" />, link: "/calculate?category=ভালোবাসা" },
    { name: "বন্ধুত্বের স্কেল", icon: <FaUserGroup className="text-5xl text-blue-400" />, link: "/calculate?category=বন্ধুত্ব" },
    { name: "মুড মিটার", icon: <FaFaceSmile className="text-5xl text-yellow-400" />, link: "/calculate?category=মুড" },
    { name: "অলসতা স্কোর", icon: <FaBed className="text-5xl text-purple-400" />, link: "/calculate?category=অলসতা" },
  ];

  return (
    <div className="space-y-20 md:space-y-32">
      {/* Hero Section */}
      <section ref={heroRef} className="relative text-center py-20 md:py-32 px-4 overflow-hidden">
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute inset-0 bg-gradient-to-r from-[#FF6B81]/20 via-[#FFB6C1]/20 to-[#6C63FF]/20 animate-[pulse_8s_ease-in-out_infinite] blur-3xl"
        ></motion.div>
        <motion.div 
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          <motion.h1 variants={heroItemVariants} className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
            ফিলমিটার, যেখানে অনুভূতি মাপা যায়!
          </motion.h1>
          <motion.p variants={heroItemVariants} className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            ভালোবাসা, বন্ধুত্ব, মুড কিংবা অলসতা - সবকিছুরই পরিমাপ আছে এখানে! যা মাপে না মন, তা মাপে ফিলমিটার!
          </motion.p>
          <motion.div variants={heroItemVariants}>
            <Link to="/calculate">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(255, 107, 129, 0.7)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-[#FF6B81] to-[#FFB6C1] text-white font-bold text-lg rounded-full shadow-lg transition-all duration-300"
              >
                শুরু করুন
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">কী মাপতে চান?</h2>
        <motion.div 
          variants={categoryContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredCategories.map((cat) => (
            <motion.div
              key={cat.name}
              variants={categoryCardVariants}
              whileHover={{ y: -8, boxShadow: "0px 10px 25px rgba(108, 99, 255, 0.15)" }}
              transition={{ duration: 0.3 }}
            >
              <Link to={cat.link} className="block p-8 bg-white rounded-2xl shadow-lg h-full text-center group">
                <div className="flex justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{cat.name}</h3>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
      
      {/* Poll Preview */}
      {polls.length > 0 && (
        <section className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">🗳️ আজকের ভোট</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {polls.slice(0, 3).map(poll => (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{poll.title}</h3>
                  <p className="text-gray-500">{poll.category}</p>
                </div>
                <Link to="/poll">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(108, 99, 255, 0.6)" }}
                    className="px-6 py-2 bg-[#6C63FF] text-white font-semibold rounded-full shadow-md hover:bg-opacity-90 transition-all"
                  >
                    ভোট দিন
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;