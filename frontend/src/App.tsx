import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NameEntry from './pages/NameEntry';
import LandingPage from './pages/LandingPage';
import GameSelection from './pages/GameSelection';
import OfflineGame from './pages/OfflineGame';
import OnlineGame from './pages/OnlineGame';
import { useUserStore } from './store/userStore';
import { useAudioStore } from './store/audioStore';
import { initializeAudio, playBackgroundMusic } from './services/audioService';

function App() {
  const userName = useUserStore((state) => state.name);
  const muted = useAudioStore((state) => state.muted);

  // Initialize audio globally when app loads
  useEffect(() => {
    initializeAudio();
  }, []);

  // Play background music if not muted
  useEffect(() => {
    if (!muted) {
      playBackgroundMusic();
    }
  }, [muted]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={userName ? <Navigate to="/landing" replace /> : <NameEntry />}
        />
        <Route
          path="/landing"
          element={userName ? <LandingPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/game-selection"
          element={userName ? <GameSelection /> : <Navigate to="/" replace />}
        />
        <Route
          path="/offline-game"
          element={userName ? <OfflineGame /> : <Navigate to="/" replace />}
        />
        <Route
          path="/online-game"
          element={userName ? <OnlineGame /> : <Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
