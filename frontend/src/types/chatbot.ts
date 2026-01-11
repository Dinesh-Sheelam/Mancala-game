/**
 * Types for the Mancala RAG Chatbot
 * 
 * The chatbot is a self-contained component that only appears on the landing page.
 * It uses RAG (Retrieval-Augmented Generation) to answer questions from PDF documents.
 */

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatState {
  isOpen: boolean;
  messages: Message[];
  inputValue: string;
}
