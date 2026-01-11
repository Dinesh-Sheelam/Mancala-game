import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProfileSection from '../components/landing/ProfileSection';
import AudioControls from '../components/landing/AudioControls';
import HowToPlayModal from '../components/landing/HowToPlayModal';
import MancalaChatbot from '../components/landing/MancalaChatbot';
import PageTransition from '../components/common/PageTransition';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 relative flex flex-col overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      {/* Profile Section - Top Left */}
      <ProfileSection />

      {/* Audio Controls - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <AudioControls />
      </div>

        <div className="flex-1 flex flex-col items-center relative z-10">
          <div className="max-w-4xl mx-auto w-full">
            {/* Header with enhanced animations */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.h1
                className="text-7xl md:text-8xl font-bold text-white mb-4 relative"
                style={{
                  fontFamily: "'Bungee Shade', cursive",
                  textShadow: '4px 4px 8px rgba(0,0,0,0.6), 0 0 30px rgba(242, 133, 13, 0.4)',
                  letterSpacing: '3px',
                }}
                animate={{
                  textShadow: [
                    '4px 4px 8px rgba(0,0,0,0.6), 0 0 30px rgba(242, 133, 13, 0.4)',
                    '4px 4px 8px rgba(0,0,0,0.6), 0 0 40px rgba(242, 133, 13, 0.6)',
                    '4px 4px 8px rgba(0,0,0,0.6), 0 0 30px rgba(242, 133, 13, 0.4)',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                Mancala
              </motion.h1>
              <motion.p
                className="text-xl text-white/90 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Classic Strategy Game
              </motion.p>
            </motion.div>

            {/* Mancala Board Image with enhanced styling */}
            <motion.div
              className="flex justify-center mb-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/images/Mancala.jpg"
                  alt="Mancala Game Board"
                  className="max-w-full h-auto rounded-2xl shadow-2xl border-4 border-orange-500/20"
                  style={{ maxHeight: '188px', maxWidth: '500px' }}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-orange-500/10 to-transparent pointer-events-none" />
              </motion.div>
            </motion.div>

            {/* Main Actions with enhanced animations */}
            <motion.div
              className="flex flex-col items-center gap-6 max-w-md mx-auto pt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -4, boxShadow: '0 20px 40px rgba(242, 133, 13, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/game-selection')}
                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white font-bold text-xl py-6 rounded-2xl transition-all duration-300 shadow-xl relative overflow-hidden group"
              >
                <span className="relative z-10">Play</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -4, boxShadow: '0 20px 40px rgba(37, 99, 235, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowHowToPlay(true)}
                className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white font-bold text-xl py-6 rounded-2xl transition-all duration-300 shadow-xl relative overflow-hidden group"
              >
                <span className="relative z-10">How to Play</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* How to Play Modal */}
        <HowToPlayModal isOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)} />

        {/* Mancala Chatbot - Only on Landing Page */}
        <MancalaChatbot />
      </div>
    </PageTransition>
  );
}
