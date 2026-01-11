import { Howl } from 'howler';

let backgroundMusic: Howl | null = null;
let moveSound: Howl | null = null;
let captureSound: Howl | null = null;
let gameEndSound: Howl | null = null;

let audioInitialized = false;
let pendingVolume: number | null = null;

export function initializeAudio() {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioService.ts:10',message:'initializeAudio called',data:{audioInitialized},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  if (audioInitialized) return; // Prevent re-initialization
  
  // Initialize background music
  backgroundMusic = new Howl({
    src: ['/audio/mancala.mp3'],
    loop: true,
    volume: 0.1,
    preload: true,
  });
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioService.ts:19',message:'backgroundMusic created',data:{initialVolume:0.1,pendingVolume},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Apply any pending volume that was set before initialization
  if (pendingVolume !== null && backgroundMusic) {
    try {
      const volumeDecimal = pendingVolume / 100;
      backgroundMusic.volume(volumeDecimal);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioService.ts:28',message:'Applied pending volume after initialization',data:{volume:pendingVolume,volumeDecimal},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      pendingVolume = null;
    } catch (error) {
      console.warn('Failed to apply pending volume:', error);
    }
  }
  
  // Sound effects can be added later if needed
  // moveSound = new Howl({
  //   src: ['/audio/move.mp3'],
  //   volume: 0.3,
  // });
  
  // captureSound = new Howl({
  //   src: ['/audio/capture.mp3'],
  //   volume: 0.5,
  // });
  
  // gameEndSound = new Howl({
  //   src: ['/audio/game-end.mp3'],
  //   volume: 0.6,
  // });
  
  audioInitialized = true;
}

export function playBackgroundMusic() {
  if (backgroundMusic && !backgroundMusic.playing()) {
    try {
      backgroundMusic.play();
    } catch (error) {
      console.warn('Failed to play background music:', error);
    }
  }
}

export function stopBackgroundMusic() {
  if (backgroundMusic && backgroundMusic.playing()) {
    try {
      backgroundMusic.stop();
    } catch (error) {
      console.warn('Failed to stop background music:', error);
    }
  }
}

export function setMusicVolume(volume: number) {
  // #region agent log
  const bgMusicExists = !!backgroundMusic;
  fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioService.ts:67',message:'setMusicVolume called',data:{volume,volumeDecimal:volume/100,backgroundMusicExists:bgMusicExists},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  // Store pending volume if audio isn't ready yet
  if (!backgroundMusic) {
    pendingVolume = volume;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioService.ts:73',message:'setMusicVolume - storing pending volume',data:{volume},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // Retry after a short delay
    setTimeout(() => {
      if (backgroundMusic && pendingVolume !== null) {
        try {
          const volumeDecimal = pendingVolume / 100;
          backgroundMusic.volume(volumeDecimal);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioService.ts:79',message:'setMusicVolume - applied pending volume after retry',data:{volume:pendingVolume,volumeDecimal},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          pendingVolume = null;
        } catch (error) {
          console.warn('Failed to set music volume on retry:', error);
        }
      }
    }, 100);
    return;
  }
  
  // Apply volume immediately if audio is ready
  try {
    const volumeDecimal = volume / 100;
    backgroundMusic.volume(volumeDecimal);
    pendingVolume = null; // Clear any pending volume
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioService.ts:92',message:'Howl volume set successfully',data:{volume,volumeDecimal},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioService.ts:95',message:'Howl volume set failed',data:{volume,error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    console.warn('Failed to set music volume:', error);
  }
}

export function setMusicMuted(muted: boolean) {
  if (backgroundMusic) {
    try {
      backgroundMusic.mute(muted);
    } catch (error) {
      console.warn('Failed to set music mute:', error);
    }
  }
}

export function playMoveSound() {
  if (moveSound) {
    try {
      moveSound.play();
    } catch (error) {
      // Silently fail - sound effects are optional
    }
  }
}

export function playCaptureSound() {
  if (captureSound) {
    try {
      captureSound.play();
    } catch (error) {
      // Silently fail - sound effects are optional
    }
  }
}

export function playGameEndSound() {
  if (gameEndSound) {
    try {
      gameEndSound.play();
    } catch (error) {
      // Silently fail - sound effects are optional
    }
  }
}

export function setSoundEffectsVolume(volume: number) {
  const volumeDecimal = volume / 100;
  try {
    if (moveSound) moveSound.volume(volumeDecimal * 0.3);
    if (captureSound) captureSound.volume(volumeDecimal * 0.5);
    if (gameEndSound) gameEndSound.volume(volumeDecimal * 0.6);
  } catch (error) {
    console.warn('Failed to set sound effects volume:', error);
  }
}

export function setSoundEffectsMuted(muted: boolean) {
  try {
    if (moveSound) moveSound.mute(muted);
    if (captureSound) captureSound.mute(muted);
    if (gameEndSound) gameEndSound.mute(muted);
  } catch (error) {
    console.warn('Failed to set sound effects mute:', error);
  }
}
