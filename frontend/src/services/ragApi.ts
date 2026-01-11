/**
 * RAG API Client
 * 
 * Client for communicating with the backend RAG chatbot API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface QueryResponse {
  answer: string;
}

export interface HealthResponse {
  initialized: boolean;
  documentCount: number;
  isVectorStoreReady: boolean;
}

/**
 * Query the RAG chatbot with a question
 */
export async function queryChatbot(question: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chatbot/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: QueryResponse = await response.json();
    return data.answer;
  } catch (error) {
    console.error('Error querying chatbot:', error);
    throw error;
  }
}

/**
 * Check the health/status of the RAG system
 */
export async function checkChatbotHealth(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chatbot/health`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: HealthResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking chatbot health:', error);
    throw error;
  }
}
