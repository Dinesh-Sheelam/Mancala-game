import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AudioState {
  volume: number;
  muted: boolean;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      volume: 10,
      muted: false,
      setVolume: (volume) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioStore.ts:17',message:'setVolume called in store',data:{volume},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        set({ volume });
      },
      setMuted: (muted) => set({ muted }),
      toggleMute: () => set((state) => ({ muted: !state.muted })),
    }),
    {
      name: 'audio-storage',
    }
  )
);
