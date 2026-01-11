import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useMancalaStore } from '../store/mancalaStore';
import type { MancalaState } from '../types/mancala';
import MancalaBoard from '../components/mancala/MancalaBoard';
import Modal from '../components/common/Modal';
import AudioControls from '../components/landing/AudioControls';
import { createRoom, joinRoom } from '../services/api';
import type { Room } from '../services/api';
import {
  connectSocket,
  disconnectSocket,
  joinRoom as socketJoinRoom,
  leaveRoom as socketLeaveRoom,
  makeMove as socketMakeMove,
  onGameUpdate,
  onGameOver,
  onError,
  onRoomUpdate,
  onGameStarted,
  offGameUpdate,
  offGameOver,
  offError,
  offRoomUpdate,
  offGameStarted,
} from '../services/socket';

export default function OnlineGame() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode'); // 'create' or 'join'
  const userName = useUserStore((state) => state.name);
  
  // Declare all state FIRST before any useEffects that use them
  const gameState = useMancalaStore((state) => state.gameState);
  const setGameState = useMancalaStore((state) => state.setGameState);
  const resetGame = useMancalaStore((state) => state.resetGame);

  const [room, setRoom] = useState<Room | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [status, setStatus] = useState<string>('');
  const [showGameOver, setShowGameOver] = useState(false);
  const [winner, setWinner] = useState<1 | 2 | 'tie' | null>(null);
  const [error, setError] = useState<string>('');
  const [socketJoined, setSocketJoined] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  // Use a consistent playerId - store it in state so it doesn't change
  // CRITICAL: Each player must have a UNIQUE playerId, even if they have the same username
  // Generate a unique ID that includes timestamp and random component
  const [playerId] = useState(() => {
    // Try to get from localStorage first, or generate a new one
    const stored = localStorage.getItem('mancala_playerId');
    if (stored) return stored;
    // Always generate a unique ID - never use just userName as it can collide
    const newId = `${userName || 'player'}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('mancala_playerId', newId);
    return newId;
  });

  // Use refs to access latest values in event handlers without causing re-renders
  const roomRef = useRef(room);
  const gameStateRef = useRef(gameState);
  const playerIdRef = useRef(playerId);

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    playerIdRef.current = playerId;
  }, [playerId]);

  // Reset room state when mode changes to ensure clean state
  // Use a ref to track previous mode so we only reset when mode actually changes
  const prevModeRef = useRef<string | null>(null);
  
  useEffect(() => {
    const prevMode = prevModeRef.current;
    prevModeRef.current = mode;
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:77',message:'Mode change effect triggered',data:{prevMode,currentMode:mode,willReset:prevMode !== null && prevMode !== mode},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'FIX'})}).catch(()=>{});
    // #endregion
    
    // Only reset if mode actually changed (not on initial mount or when room state changes)
    if (prevMode !== null && prevMode !== mode) {
      console.log('=== OnlineGame Mode Changed ===', { 
        prevMode,
        newMode: mode,
        searchParams: searchParams.toString(),
        currentRoom: room?.code,
        currentRoomCode: roomCode
      });
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:87',message:'Resetting room state due to mode change',data:{prevMode,newMode:mode},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'FIX'})}).catch(()=>{});
      // #endregion
      
      // Reset room-related state when mode changes
      console.log('Clearing room state due to mode change');
      setRoom(null);
      setRoomCode('');
      setStatus('');
      setError('');
      setSocketJoined(false);
    }
    
    if (!mode || (mode !== 'create' && mode !== 'join')) {
      console.warn('⚠️ Invalid or missing mode. URL:', window.location.href);
    }
  }, [mode]); // Only depend on mode - do NOT include room or roomCode!

  useEffect(() => {
    connectSocket();

    const handleGameUpdate = (data: { gameState: MancalaState; extraTurn: boolean; captured: boolean }) => {
      // Always overwrite - backend is source of truth
      setGameState(data.gameState);
      setStatus(data.extraTurn ? 'You get an extra turn!' : '');
      setError(''); // Unlock input
    };

    const handleGameOver = (data: { winner: 1 | 2 | 'tie'; finalState: MancalaState }) => {
      setGameState(data.finalState);
      setWinner(data.winner);
      setShowGameOver(true);
    };

    const handleError = (error: { message: string }) => {
      const currentRoom = roomRef.current;
      console.error('=== Socket Error Received ===', {
        error: error.message,
        roomId: currentRoom?.id,
        roomCode: currentRoom?.code
      });
      
      setError(error.message);
    };

    const handleRoomUpdate = (updatedRoom: Room) => {
      console.log('=== Room Update Received ===', {
        roomId: updatedRoom.id,
        roomCode: updatedRoom.code,
        player1: updatedRoom.player1,
        player2: updatedRoom.player2,
        hasGameState: !!updatedRoom.gameState,
        currentPlayer: updatedRoom.gameState?.currentPlayer
      });
      
      setRoom(updatedRoom);
      // Only set gameState if it exists AND both players are present
      // Game should only start when both players have joined
      if (updatedRoom.gameState && updatedRoom.player1 && updatedRoom.player2) {
        setGameState(updatedRoom.gameState as MancalaState);
      }
      // Update status based on room state
      if (updatedRoom.player1 && updatedRoom.player2) {
        setStatus(updatedRoom.gameState ? 'Game started!' : 'Both players ready!');
      } else {
        setStatus('Waiting for opponent to join...');
      }
    };

    const handleGameStarted = (data: { gameState: MancalaState }) => {
      console.log('=== Game Started Event Received ===', {
        currentPlayer: data.gameState.currentPlayer,
        gameStatus: data.gameState.gameStatus,
        board: data.gameState.board
      });
      // Always overwrite - backend is source of truth
      setGameState(data.gameState);
      setStatus('Game started!');
      setError('');
    };

    onGameUpdate(handleGameUpdate);
    onGameOver(handleGameOver);
    onError(handleError);
    onRoomUpdate(handleRoomUpdate);
    onGameStarted(handleGameStarted);

    return () => {
      offGameUpdate(handleGameUpdate);
      offGameOver(handleGameOver);
      offError(handleError);
      offRoomUpdate(handleRoomUpdate);
      offGameStarted(handleGameStarted);
      // Only leave room and disconnect on component unmount, not when room changes
      const currentRoom = roomRef.current;
      if (currentRoom) {
        socketLeaveRoom(currentRoom.id);
      }
      // Don't disconnect socket here - let it stay connected for the component lifecycle
      // Only disconnect on actual component unmount
    };
  }, [setGameState]); // Removed 'room' from dependencies to prevent reconnection loop

  // Separate effect to disconnect socket only on component unmount
  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []); // Empty deps - only run on mount/unmount

  // Effect to sync game state from room when it becomes available
  // This handles cases where room.gameState exists but local gameState is null
  // This can happen due to timing issues or missed socket events
  useEffect(() => {
    if (room && room.gameState && !gameState && room.player1 && room.player2) {
      console.log('=== useEffect: Room has gameState but local state is null, syncing now ===', {
        currentPlayer: room.gameState.currentPlayer,
        gameStatus: room.gameState.gameStatus,
        player1: room.player1,
        player2: room.player2,
        mode
      });
      setGameState(room.gameState as MancalaState);
      setStatus('Game started!');
    }
  }, [room, gameState, mode]); // Re-run when room, gameState, or mode changes

  const handleCreateRoom = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:241',message:'handleCreateRoom called',data:{isCreatingRoom},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Prevent multiple clicks
    if (isCreatingRoom) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:245',message:'Early return: already creating',data:{isCreatingRoom},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      console.log('Already creating room, ignoring click');
      return;
    }
    
    // Clear any previous errors
    setError('');
    setStatus('Creating room...');
    setIsCreatingRoom(true);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:252',message:'Before API call',data:{playerId,userName,mode},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    try {
      // Ensure playerId is set and stored before creating room
      const currentPlayerId = playerId || userName || `player-${Date.now()}`;
      if (currentPlayerId !== playerId) {
        localStorage.setItem('mancala_playerId', currentPlayerId);
      }
      
      console.log('=== Creating Room ===', {
        playerId: currentPlayerId,
        userName,
        mode: 'create',
        storedPlayerId: localStorage.getItem('mancala_playerId'),
        apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      });
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:268',message:'Calling createRoom API',data:{currentPlayerId,userName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      const newRoom = await createRoom(currentPlayerId, userName);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:270',message:'API call succeeded',data:{roomId:newRoom?.id,roomCode:newRoom?.code,hasCode:!!newRoom?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      console.log('=== Room Created (FULL RESPONSE) ===', {
        roomId: newRoom.id,
        roomCode: newRoom.code,
        player1: newRoom.player1,
        player2: newRoom.player2,
        player1Name: newRoom.player1Name,
        player2Name: newRoom.player2Name,
        hasGameState: !!newRoom.gameState,
        myPlayerId: currentPlayerId,
        isPlayer1: newRoom.player1 === currentPlayerId,
        playerIdMatch: newRoom.player1 === currentPlayerId ? '✅ MATCH' : '❌ MISMATCH',
        fullRoomObject: newRoom
      });
      
      // Verify playerId matches what was stored
      if (newRoom.player1 !== currentPlayerId) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:285',message:'Player ID mismatch - early return',data:{sentPlayerId:currentPlayerId,storedPlayer1:newRoom.player1},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        console.error('❌ CRITICAL: Room creator playerId mismatch!', {
          sentPlayerId: currentPlayerId,
          storedPlayer1: newRoom.player1,
          userName
        });
        setError('Player ID mismatch. Please refresh and try again.');
        setIsCreatingRoom(false);
        return;
      }
      
      // Verify room code exists
      if (!newRoom.code) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:297',message:'No room code - early return',data:{roomId:newRoom.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        console.error('❌ CRITICAL: Room created but no code returned!', {
          roomId: newRoom.id,
          room: newRoom
        });
        setError('Room created but no code received. Please try again.');
        setIsCreatingRoom(false);
        return;
      }
      
      // Set room state
      console.log('=== Setting room state ===', {
        roomCode: newRoom.code,
        roomId: newRoom.id
      });
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:308',message:'Before setRoom/setRoomCode',data:{roomCode:newRoom.code,roomId:newRoom.id,currentRoom:room?.code,currentRoomCode:roomCode},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      setRoom(newRoom);
      setRoomCode(newRoom.code);
      setStatus('Waiting for opponent to join...');
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:312',message:'After setRoom/setRoomCode',data:{roomCode:newRoom.code,roomId:newRoom.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      // Join socket room immediately - the socket service will handle connection
      if (newRoom.id) {
        console.log('=== Creator joining socket room ===', { roomId: newRoom.id });
        socketJoinRoom(newRoom.id);
        setSocketJoined(true);
      }
    } catch (err: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:320',message:'Error caught in handleCreateRoom',data:{errorMessage:err?.message,errorType:err?.constructor?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('=== Error creating room ===', err);
      const errorMessage = err?.message || 'Failed to create room. Please check your connection and try again.';
      setError(errorMessage);
      setStatus('');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setStatus('Room code copied!');
      setTimeout(() => {
        if (room?.player2) {
          setStatus('Both players ready!');
        } else {
          setStatus('Waiting for opponent to join...');
        }
      }, 2000);
    } catch (err) {
      setError('Failed to copy room code');
    }
  };

  const handleJoinRoom = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:388',message:'handleJoinRoom called',data:{joinCode:joinCode.trim()},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    if (!joinCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    // Clear any previous errors
    setError('');
    setStatus('Joining room...');

    try {
      // Ensure playerId is set and stored before joining room
      const currentPlayerId = playerId || userName || `player-${Date.now()}`;
      if (currentPlayerId !== playerId) {
        localStorage.setItem('mancala_playerId', currentPlayerId);
      }
      
      console.log('=== Joining Room ===', {
        playerId: currentPlayerId,
        userName,
        joinCode: joinCode.toUpperCase(),
        mode: 'join',
        storedPlayerId: localStorage.getItem('mancala_playerId')
      });
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:413',message:'Calling joinRoom API',data:{joinCode:joinCode.toUpperCase(),currentPlayerId,userName,playerIdFromState:playerId,isUnique:currentPlayerId !== playerId},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      const joinedRoom = await joinRoom(joinCode.toUpperCase(), currentPlayerId, userName);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:415',message:'joinRoom API response received',data:{roomId:joinedRoom?.id,roomCode:joinedRoom?.code,hasGameState:!!joinedRoom?.gameState,player1:!!joinedRoom?.player1,player2:!!joinedRoom?.player2,bothPlayers:!!(joinedRoom?.player1 && joinedRoom?.player2)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      console.log('=== Room Joined (FULL RESPONSE) ===', {
        roomId: joinedRoom.id,
        roomCode: joinedRoom.code,
        player1: joinedRoom.player1,
        player2: joinedRoom.player2,
        player1Name: joinedRoom.player1Name,
        player2Name: joinedRoom.player2Name,
        hasGameState: !!joinedRoom.gameState,
        gameState: joinedRoom.gameState, // Log full gameState object
        gameStatus: joinedRoom.gameState?.gameStatus,
        currentPlayer: joinedRoom.gameState?.currentPlayer,
        board: joinedRoom.gameState?.board,
        myPlayerId: currentPlayerId,
        isPlayer1: joinedRoom.player1 === currentPlayerId,
        isPlayer2: joinedRoom.player2 === currentPlayerId,
        player1Match: joinedRoom.player1 === currentPlayerId ? '✅ MATCH' : '❌ MISMATCH',
        player2Match: joinedRoom.player2 === currentPlayerId ? '✅ MATCH' : '❌ MISMATCH',
        bothPlayersPresent: !!(joinedRoom.player1 && joinedRoom.player2),
        shouldHaveGameState: !!(joinedRoom.player1 && joinedRoom.player2)
      });
      
      // Verify playerId matches what was stored
      if (joinedRoom.player1 !== currentPlayerId && joinedRoom.player2 !== currentPlayerId) {
        console.error('❌ CRITICAL: Joiner playerId mismatch!', {
          sentPlayerId: currentPlayerId,
          storedPlayer1: joinedRoom.player1,
          storedPlayer2: joinedRoom.player2,
          userName
        });
        setError('Player ID mismatch. Please refresh and try again.');
        return;
      }
      
      // Join socket room FIRST - before setting room state
      // This ensures we're in the socket room to receive events
      if (joinedRoom.id) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:450',message:'Joining socket room',data:{roomId:joinedRoom.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.log('=== Joiner joining socket room (BEFORE setting state) ===', { roomId: joinedRoom.id });
        socketJoinRoom(joinedRoom.id);
        setSocketJoined(true);
      }
      
      // Set room state AFTER joining socket room
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:457',message:'Before setRoom',data:{hasGameState:!!joinedRoom.gameState,bothPlayers:!!(joinedRoom.player1 && joinedRoom.player2)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      setRoom(joinedRoom);
      setRoomCode(joinedRoom.code);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:461',message:'After setRoom, checking gameState',data:{hasGameState:!!joinedRoom.gameState,bothPlayers:!!(joinedRoom.player1 && joinedRoom.player2),willSetGameState:!!(joinedRoom.gameState && joinedRoom.player1 && joinedRoom.player2)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      // Check if game state exists - if both players are present, game should be initialized
      if (joinedRoom.gameState && joinedRoom.player1 && joinedRoom.player2) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:464',message:'Setting gameState from API response',data:{currentPlayer:joinedRoom.gameState.currentPlayer,gameStatus:joinedRoom.gameState.gameStatus},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.log('=== Game already initialized in API response, setting game state ===', {
          currentPlayer: joinedRoom.gameState.currentPlayer,
          gameStatus: joinedRoom.gameState.gameStatus,
          board: joinedRoom.gameState.board,
          player1: joinedRoom.player1,
          player2: joinedRoom.player2
        });
        // Set game state immediately from API response
        setGameState(joinedRoom.gameState as MancalaState);
        setStatus('Game started!');
        // Clear join code since we've successfully joined
        setJoinCode('');
      } else if (joinedRoom.player1 && joinedRoom.player2) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:476',message:'Both players present but no gameState, waiting for socket',data:{hasGameState:!!joinedRoom.gameState},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        // Both players present but no game state yet - wait for socket event
        // The socket join handler should broadcast the game state
        console.log('=== Both players present, waiting for game initialization via socket ===', {
          player1: joinedRoom.player1,
          player2: joinedRoom.player2,
          hasGameState: !!joinedRoom.gameState
        });
        setStatus('Both players ready. Game starting...');
      } else {
        // Only one player - waiting for opponent
        console.log('=== Only one player in room, waiting for opponent ===', {
          player1: joinedRoom.player1,
          player2: joinedRoom.player2
        });
        setStatus('Waiting for opponent to join...');
      }
    } catch (err: any) {
      console.error('=== Error joining room ===', err);
      const errorMessage = err?.message || 'Failed to join room. Check the code and try again.';
      setError(errorMessage);
      setStatus('');
    }
  };

  const handlePitClick = async (pitIndex: number) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:567',message:'handlePitClick called',data:{pitIndex,hasRoom:!!room,hasGameState:!!gameState,roomId:room?.id,playerId},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    
    // Match backup: Use gameState directly from Zustand store (not room.gameState fallback)
    if (!room || !gameState || !room.id) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:571',message:'handlePitClick early return: missing room/gamestate',data:{hasRoom:!!room,hasGameState:!!gameState,roomId:room?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      setError('Room or game state not available');
      return;
    }
    
    if (gameState.gameStatus !== 'playing') {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:576',message:'handlePitClick early return: game not playing',data:{gameStatus:gameState.gameStatus},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      setError('Game is not in progress');
      return;
    }

    // Lock input immediately - clear previous errors
    setError('');
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:585',message:'Calling socketMakeMove',data:{roomId:room.id,pitIndex,roomCode:room.code,playerId},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    
    // Send move - backend validates everything (turn, pit ownership, empty pits, etc.)
    socketMakeMove(room.id, pitIndex, room.code, playerId);
  };

  const handleBack = () => {
    if (room) {
      socketLeaveRoom(room.id);
    }
    resetGame();
    navigate('/game-selection');
  };

  const getPlayerNumber = (): 1 | 2 | null => {
    if (!room) return null;
    
    // Normalize playerId and room player IDs for comparison (trim whitespace, handle null/undefined)
    const normalizedPlayerId = String(playerId || '').trim();
    const normalizedPlayer1 = String(room.player1 || '').trim();
    const normalizedPlayer2 = String(room.player2 || '').trim();
    
    console.log('=== getPlayerNumber ===', {
      playerId: normalizedPlayerId,
      roomPlayer1: normalizedPlayer1,
      roomPlayer2: normalizedPlayer2,
      player1Match: normalizedPlayer1 === normalizedPlayerId,
      player2Match: normalizedPlayer2 === normalizedPlayerId,
      player1Name: room.player1Name,
      player2Name: room.player2Name,
      mode,
      originalPlayerId: playerId,
      originalRoomPlayer1: room.player1,
      originalRoomPlayer2: room.player2
    });
    
    if (normalizedPlayer1 === normalizedPlayerId) {
      console.log('✅ Identified as Player 1 (room creator)');
      return 1;
    }
    if (normalizedPlayer2 === normalizedPlayerId) {
      console.log('✅ Identified as Player 2 (joiner)');
      return 2;
    }
    console.error('❌ Player ID does not match room players!', {
      playerId: normalizedPlayerId,
      roomPlayer1: normalizedPlayer1,
      roomPlayer2: normalizedPlayer2,
      typeCheck: {
        playerIdType: typeof playerId,
        player1Type: typeof room.player1,
        player2Type: typeof room.player2
      }
    });
    return null;
  };

  // If mode is invalid or missing, redirect to game selection
  if (!mode || (mode !== 'create' && mode !== 'join')) {
    console.warn('Invalid mode, redirecting to game selection');
    navigate('/game-selection');
    return null;
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:538',message:'Render check: create mode',data:{mode,hasRoom:!!room,roomCode,hasGameState:!!gameState,renderCondition:mode === 'create' && !room},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  if (mode === 'create' && !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center relative">
        {/* Audio Controls - Top Right */}
        <div className="absolute top-6 right-6 z-10">
          <AudioControls />
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-md w-full border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">Create Room</h1>
          {status && <p className="mb-4 text-white/80 text-center">{status}</p>}
          <button
            onClick={handleCreateRoom}
            disabled={isCreatingRoom}
            className={`w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg ${
              isCreatingRoom 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:from-green-700 hover:to-emerald-700'
            }`}
          >
            {isCreatingRoom ? 'Creating Room...' : 'Create Room'}
          </button>
          {error && <p className="mt-4 text-red-300 text-center">{error}</p>}
          <button
            onClick={() => navigate('/game-selection')}
            className="mt-4 w-full text-white/80 hover:text-white text-sm transition-colors"
          >
            ← Back to Game Selection
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'join' && !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center relative">
        {/* Audio Controls - Top Right */}
        <div className="absolute top-6 right-6 z-10">
          <AudioControls />
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-md w-full border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">Join Room</h1>
          <div className="space-y-4">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                setJoinCode(value);
                setError(''); // Clear error when typing
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && joinCode.trim().length >= 4) {
                  handleJoinRoom();
                }
              }}
              placeholder="Enter room code"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all text-lg text-center font-mono tracking-wider"
              autoFocus
            />
            <button
              onClick={handleJoinRoom}
              disabled={!joinCode.trim() || joinCode.trim().length < 4}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold py-3 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Room
            </button>
          </div>
          {error && <p className="mt-4 text-red-300 text-center">{error}</p>}
          <button
            onClick={() => navigate('/game-selection')}
            className="mt-4 w-full text-white/80 hover:text-white text-sm transition-colors"
          >
            ← Back to Game Selection
          </button>
        </div>
      </div>
    );
  }

  // Show room code screen ONLY for creators (mode === 'create'), not for joiners
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnlineGame.tsx:614',message:'Render check: room code screen',data:{mode,hasRoom:!!room,roomCode,hasGameState:!!gameState,renderCondition:mode === 'create' && room && !gameState && roomCode},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  if (mode === 'create' && room && !gameState && roomCode) {
    // Join socket room when showing the room code (if not already joined)
    // This ensures creator is in socket room to receive updates when joiner joins
    if (room.id && !socketJoined) {
      console.log('=== Creator joining socket room (room code page) ===', { 
        roomId: room.id,
        roomCode: room.code,
        player1: room.player1,
        player2: room.player2,
        hasGameState: !!room.gameState
      });
      socketJoinRoom(room.id);
      setSocketJoined(true);
    }
    
    // Also check if game state exists in room but not in local state
    // This handles the case where joiner joined before creator joined socket room
    // BUT only set game state if BOTH players are present
    if (room.gameState && !gameState && room.player1 && room.player2) {
      console.log('=== Room has gameState but local state is null, setting it ===', {
        currentPlayer: room.gameState.currentPlayer,
        player1: room.player1,
        player2: room.player2
      });
      setGameState(room.gameState as MancalaState);
      setStatus('Game started!');
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center relative">
        {/* Audio Controls - Top Right */}
        <div className="absolute top-6 right-6 z-10">
          <AudioControls />
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-md w-full text-center border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Room Code</h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl font-mono font-bold text-white bg-white/20 px-4 py-2 rounded-lg">
              {roomCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2"
              title="Copy room code"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
          </div>
          <p className="text-white/80 mb-4">{status || 'Waiting for opponent...'}</p>
          {room.player1 && room.player2 && !gameState && (
            <p className="text-white/60">Both players ready. Starting game...</p>
          )}
          <button
            onClick={handleBack}
            className="mt-6 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Leave Room
          </button>
        </div>
      </div>
    );
  }

  // For joiners: if room exists but game hasn't started, show waiting screen
  if (mode === 'join' && room && !gameState) {
    // Join socket room if not already joined
    if (room.id && !socketJoined) {
      console.log('=== Joiner joining socket room (waiting screen check) ===', { 
        roomId: room.id,
        roomCode: room.code,
        player1: room.player1,
        player2: room.player2,
        hasGameState: !!room.gameState,
        gameStateDetails: room.gameState ? {
          currentPlayer: room.gameState.currentPlayer,
          gameStatus: room.gameState.gameStatus,
          board: room.gameState.board
        } : null
      });
      socketJoinRoom(room.id);
      setSocketJoined(true);
    }
    
    // CRITICAL: Check if game state exists in room but not in local state
    // This is the key check - if room.gameState exists, we MUST set it
    if (room.gameState && room.player1 && room.player2) {
      console.log('=== Joiner: Room has gameState in waiting screen check, setting it NOW ===', {
        currentPlayer: room.gameState.currentPlayer,
        gameStatus: room.gameState.gameStatus,
        board: room.gameState.board,
        player1: room.player1,
        player2: room.player2,
        localGameState: gameState
      });
      // Set game state immediately - this will cause a re-render
      setGameState(room.gameState as MancalaState);
      setStatus('Game started!');
      // Don't return - let component re-render with gameState
      // The next render will have gameState set and will show the game board
    } else {
      // Only show waiting screen if game truly hasn't started
      console.log('=== Joiner: No game state available, showing waiting screen ===', {
        hasGameState: !!room.gameState,
        player1: room.player1,
        player2: room.player2,
        bothPlayersPresent: !!(room.player1 && room.player2)
      });
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center relative">
          {/* Audio Controls - Top Right */}
          <div className="absolute top-6 right-6 z-10">
            <AudioControls />
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-md w-full text-center border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Waiting for Game</h2>
            <p className="text-white/80 mb-4">
              {room.player1 && room.player2 
                ? 'Both players ready. Game starting...' 
                : 'Waiting for opponent to join...'}
            </p>
            {status && status !== 'Waiting for opponent to join...' && (
              <p className="text-white/60 mb-4">{status}</p>
            )}
            {error && (
              <p className="text-red-300 mb-4">{error}</p>
            )}
            <button
              onClick={handleBack}
              className="mt-6 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Leave Room
            </button>
          </div>
        </div>
      );
    }
  }

      const playerNumber = getPlayerNumber();
      
      // Match backup: Use gameState directly from Zustand store (not room.gameState fallback)
      // If gameState is not set yet, show loading or wait
      if (!gameState) {
        if (room && room.player1 && room.player2) {
          console.log('=== Final check: Both players present but no gameState ===', {
            hasRoomGameState: !!room.gameState,
            hasLocalGameState: !!gameState,
            roomGameState: room.gameState
          });
          return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
              <div className="text-white text-xl">Waiting for game to start...</div>
            </div>
          );
        }
        return null;
      }

      const isMyTurn = playerNumber !== null && playerNumber === gameState.currentPlayer;
      
      // Determine role for logging
      const role = mode === 'create' ? 'ROOM CREATOR (should be Player 1)' : 'JOINER (should be Player 2)';
      const expectedPlayer = mode === 'create' ? 1 : 2;
      const playerMatch = playerNumber === expectedPlayer ? '✅ CORRECT' : '❌ WRONG';
      
      console.log('=== OnlineGame Render ===', {
        role,
        userName,
        playerId,
        playerNumber,
        expectedPlayer,
        playerMatch,
        currentPlayer: gameState.currentPlayer,
        isMyTurn,
        roomPlayer1: room?.player1,
        roomPlayer2: room?.player2,
        player1Name: room?.player1Name,
        player2Name: room?.player2Name,
        mode,
        shouldBeMyTurn: playerNumber === gameState.currentPlayer
      });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex flex-col relative overflow-hidden">
      {/* Audio Controls - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <AudioControls />
      </div>
      
      <div className="max-w-6xl mx-auto w-full flex flex-col flex-1">
        {/* Header - Top */}
        <div className="mb-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={handleBack}
            className="text-white/80 hover:text-white flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <div className="text-white">
            <div className="bg-white/20 px-4 py-2 rounded-lg flex items-center justify-between gap-2">
              <span>Room: {roomCode} | You are {playerNumber === 1 ? room?.player1Name : room?.player2Name}</span>
              <button
                onClick={handleCopyCode}
                className="px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors text-sm flex items-center gap-1"
                title="Copy room code"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Board - Centered */}
        <div className="flex-1 flex items-center justify-center">
          <MancalaBoard 
            onPitClick={handlePitClick}
            player1Name={room?.player1Name || 'Player 1'}
            player2Name={room?.player2Name || 'Player 2'}
            currentUserPlayer={playerNumber || undefined}
          />
        </div>

        {/* Messages - Bottom with fixed height to prevent board movement */}
        <div className="mt-6 flex-shrink-0 min-h-[120px] flex flex-col justify-end">
          {status && (
            <div className="text-center mb-2">
              <div className="inline-block bg-white/20 text-yellow-300 px-6 py-3 rounded-lg">
                {status}
              </div>
            </div>
          )}
          {error && (
            <div className="text-center mb-2">
              <div className="inline-block bg-white/20 text-red-300 px-6 py-3 rounded-lg">
                {error}
              </div>
            </div>
          )}
          {!isMyTurn && gameState.gameStatus === 'playing' && (
            <div className="text-center mb-2">
              <div className="inline-block bg-white/20 text-amber-300 px-6 py-3 rounded-lg">
                Waiting for opponent's move...
              </div>
            </div>
          )}

          {gameState.gameStatus === 'finished' && (
            <div className="text-center">
              <p className="text-white text-xl font-semibold">
                {room?.player1Name || 'Player 1'}: {gameState.board[6]} seeds | {room?.player2Name || 'Player 2'}: {gameState.board[13]} seeds
              </p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showGameOver} onClose={() => {}} title="Game Over">
        <div className="space-y-4">
          <p className="text-2xl font-bold text-center text-gray-800">
            {winner === 'tie'
              ? "It's a tie!"
              : winner === playerNumber
              ? 'You Win!'
              : 'You Lost!'}
          </p>
          <p className="text-center text-gray-600">
            Final Score: Player 1: {gameState.board[6]} | Player 2: {gameState.board[13]}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
