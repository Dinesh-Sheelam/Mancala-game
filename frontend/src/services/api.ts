const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Room {
  id: string;
  code: string;
  player1: string | null;
  player2: string | null;
  player1Name: string | null;
  player2Name: string | null;
  gameState: any;
  createdAt: number;
  lastActivity: number;
}

export async function createRoom(playerId: string, playerName: string): Promise<Room> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:15',message:'createRoom API called',data:{playerId,playerName,apiUrl:`${API_BASE_URL}/rooms/create`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  console.log('=== API: Creating room ===', {
    apiUrl: `${API_BASE_URL}/rooms/create`,
    playerId,
    playerName
  });
  
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:25',message:'Before fetch call',data:{url:`${API_BASE_URL}/rooms/create`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    const response = await fetch(`${API_BASE_URL}/rooms/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerId, playerName }),
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:35',message:'Fetch response received',data:{status:response.status,ok:response.ok,statusText:response.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    console.log('=== API: Response received ===', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:42',message:'API error response',data:{status:response.status,errorText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('=== API: Error response ===', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Failed to create room: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
    }

    const data = await response.json();
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:52',message:'API success: room data parsed',data:{roomId:data.id,roomCode:data.code,hasCode:!!data.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    console.log('=== API: Room data received ===', {
      roomId: data.id,
      roomCode: data.code,
      hasCode: !!data.code
    });
    
    if (!data.code) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:60',message:'No code in response',data:{roomId:data.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('=== API: Room created but no code in response ===', data);
      throw new Error('Room created but no code received from server');
    }
    
    return data;
  } catch (err: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6803f12c-a9a7-4455-8f9c-992e982d7a0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:67',message:'Exception in createRoom',data:{errorMessage:err?.message,errorType:err?.constructor?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.error('=== API: Exception during room creation ===', err);
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please ensure the backend is running on http://localhost:3000');
    }
    throw err;
  }
}

export async function joinRoom(code: string, playerId: string, playerName: string): Promise<Room> {
  const response = await fetch(`${API_BASE_URL}/rooms/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, playerId, playerName }),
  });

  if (!response.ok) {
    throw new Error('Failed to join room');
  }

  return response.json();
}

export async function getRoom(code: string): Promise<Room> {
  const response = await fetch(`${API_BASE_URL}/rooms/${code}`);

  if (!response.ok) {
    throw new Error('Room not found');
  }

  return response.json();
}
