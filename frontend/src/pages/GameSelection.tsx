import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMancalaStore } from '../store/mancalaStore';
import type { Difficulty } from '../types/mancala';
import Modal from '../components/common/Modal';
import AudioControls from '../components/landing/AudioControls';
import PageTransition from '../components/common/PageTransition';

export default function GameSelection() {
  const navigate = useNavigate();
  const initializeGame = useMancalaStore((state) => state.initializeGame);
  const [selectedMode, setSelectedMode] = useState<'offline' | 'online' | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showPlayer2Modal, setShowPlayer2Modal] = useState(false);
  const [player2Name, setPlayer2Name] = useState('');

  const handleExit = () => {
    // Navigate back to landing page instead of trying to close window
    // (window.close() only works for windows opened via JavaScript)
    navigate('/landing');
  };

  const handleOfflineSinglePlayer = () => {
    initializeGame('single-player', selectedDifficulty);
    navigate('/offline-game');
  };

  const handleOfflineMultiplayer = () => {
    setShowPlayer2Modal(true);
  };

  const handlePlayer2NameSubmit = () => {
    if (player2Name.trim() && player2Name.trim().length >= 2) {
      initializeGame('multiplayer', undefined, player2Name.trim());
      setShowPlayer2Modal(false);
      setPlayer2Name('');
      navigate('/offline-game');
    }
  };

  const handleCreateRoom = () => {
    navigate('/online-game?mode=create');
  };

  const handleJoinRoom = () => {
    navigate('/online-game?mode=join');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Audio Controls - Top Right */}
        <div className="absolute top-6 right-6 z-10">
          <AudioControls />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            className="flex justify-between items-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/landing')}
              className="text-white/90 hover:text-white flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </motion.button>
            
            {/* Exit Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExitConfirm(true)}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Exit
            </motion.button>
          </motion.div>

          <motion.h1
            className="text-5xl font-bold text-white text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            Select Game Mode
          </motion.h1>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            <motion.button
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMode('offline')}
              className={`p-8 rounded-2xl transition-all duration-300 backdrop-blur-sm border-2 ${
                selectedMode === 'offline'
                  ? 'bg-white/20 ring-4 ring-orange-500/30 border-orange-500/50 shadow-xl'
                  : 'bg-white/10 hover:bg-white/15 border-white/20 hover:border-white/30'
              }`}
            >
              <h2 className="text-3xl font-bold text-white mb-3">Offline</h2>
              <p className="text-white/80 text-lg">Play locally on this device</p>
            </motion.button>

            <motion.button
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0 },
              }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMode('online')}
              className={`p-8 rounded-2xl transition-all duration-300 backdrop-blur-sm border-2 ${
                selectedMode === 'online'
                  ? 'bg-white/20 ring-4 ring-blue-500/30 border-blue-500/50 shadow-xl'
                  : 'bg-white/10 hover:bg-white/15 border-white/20 hover:border-white/30'
              }`}
            >
              <h2 className="text-3xl font-bold text-white mb-3">Online</h2>
              <p className="text-white/80 text-lg">Play with friends online</p>
            </motion.button>
          </motion.div>

          {selectedMode === 'offline' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 space-y-6 border border-white/20 shadow-xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Offline Game Options</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Single Player (vs AI)</h4>
                <div className="mb-4">
                  <label className="text-white/80 mb-2 block">Difficulty:</label>
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => {
                      const getButtonColor = () => {
                        if (selectedDifficulty === diff) {
                          if (diff === 'easy') return 'bg-green-600 text-white';
                          if (diff === 'medium') return 'bg-amber-600 text-white';
                          if (diff === 'hard') return 'bg-red-600 text-white';
                        }
                        return 'bg-white/20 text-white/80 hover:bg-white/30';
                      };
                      
                      return (
                        <button
                          key={diff}
                          onClick={() => setSelectedDifficulty(diff)}
                          className={`px-4 py-2 rounded-lg transition-colors ${getButtonColor()}`}
                        >
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOfflineSinglePlayer}
                  className={`w-full text-white font-semibold py-4 rounded-xl transition-all shadow-lg ${
                    selectedDifficulty === 'easy'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      : selectedDifficulty === 'medium'
                      ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                      : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                  }`}
                >
                  Start Single Player Game
                </motion.button>
              </div>

              <div className="border-t border-white/20 pt-4">
                <h4 className="text-lg font-semibold text-white mb-2">Local Multiplayer</h4>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOfflineMultiplayer}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-4 rounded-xl hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg"
                >
                  Start Multiplayer Game
                </motion.button>
              </div>
            </div>
            </motion.div>
          )}

          {selectedMode === 'online' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 space-y-6 border border-white/20 shadow-xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Online Game Options</h3>
              
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateRoom}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
                >
                  Create Room
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoinRoom}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold py-4 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg"
                >
                  Join Room
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

      {/* Player 2 Name Modal */}
      <Modal
        isOpen={showPlayer2Modal}
        onClose={() => {
          setShowPlayer2Modal(false);
          setPlayer2Name('');
        }}
        title="Enter Multiplayer Name"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Multiplayer Name
            </label>
            <input
              type="text"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && player2Name.trim().length >= 2) {
                  handlePlayer2NameSubmit();
                }
              }}
              className="w-full px-3 py-2 border border-amber-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-800/90 text-white placeholder-white/60"
              placeholder="Enter multiplayer name"
              maxLength={20}
              autoFocus
            />
            {player2Name.trim().length > 0 && player2Name.trim().length < 2 && (
              <p className="text-sm text-red-500 mt-1">Name must be at least 2 characters</p>
            )}
          </div>
          <div className="flex gap-4 justify-end">
            <button
              onClick={() => {
                setShowPlayer2Modal(false);
                setPlayer2Name('');
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePlayer2NameSubmit}
              disabled={player2Name.trim().length < 2}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Start Game
            </button>
          </div>
        </div>
      </Modal>

      {/* Exit Confirmation Modal */}
      <Modal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        title="Exit to Main Menu"
      >
        <div className="space-y-4">
          <p className="text-gray-700">Do you want to return to the main menu?</p>
          <div className="flex gap-4 justify-end">
            <button
              onClick={() => {
                setShowExitConfirm(false);
                handleExit();
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => setShowExitConfirm(false)}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              No
            </button>
          </div>
        </div>
      </Modal>
      </div>
    </PageTransition>
  );
}
