import { useEffect } from 'react';
import { useAudioStore } from '../../store/audioStore';
import {
  setMusicVolume,
  setMusicMuted,
  playBackgroundMusic,
  stopBackgroundMusic,
} from '../../services/audioService';

export default function AudioControls() {
  const { volume, muted, setVolume, toggleMute } = useAudioStore();

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AudioControls.tsx:13',message:'AudioControls mounted',data:{volume,muted},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }, []);
  // #endregion

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AudioControls.tsx:18',message:'useEffect volume changed',data:{volume},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    setMusicVolume(volume);
  }, [volume]);

  useEffect(() => {
    setMusicMuted(muted);
    if (muted) {
      stopBackgroundMusic();
    } else {
      playBackgroundMusic();
    }
  }, [muted]);

  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-xl p-3" style={{ width: '144px' }}>
      <button
        onClick={toggleMute}
        className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex-shrink-0"
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => {
            const newVolume = Number(e.target.value);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AudioControls.tsx:53',message:'Slider onChange triggered',data:{newVolume,oldVolume:volume},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            setVolume(newVolume);
          }}
          className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.5) ${volume}%, rgba(255,255,255,0.2) ${volume}%, rgba(255,255,255,0.2) 100%)`,
          }}
        />
      </div>
      <span className="text-white text-xs w-8 text-right flex-shrink-0">{volume}%</span>
    </div>
  );
}
