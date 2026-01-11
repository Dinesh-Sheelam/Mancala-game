# Change: Add Mancala Chatbot to Landing Page

## Why
Players need better onboarding and learning support for Mancala. The current "How to Play" modal provides static information, but players may have specific questions about:
- Mancala history and origins
- Detailed rule clarifications
- Strategic tips and strategies
- How specific game mechanics work

A chatbot provides an interactive, conversational way to help players learn without cluttering the interface or affecting gameplay.

## What Changes

### Landing Page Chatbot
- **Chatbot Component**: New interactive chatbot component that appears only on the landing page
- **Chat Interface**: Floating chat button that opens a chat window with message history
- **Knowledge Base**: Chatbot uses provided Mancala knowledge base (Mancala_AI_Knowledge_Base.pdf and mancala_rules.pdf) to answer questions
- **Topic Restrictions**: Chatbot only discusses Mancala-related topics (history, rules, strategies, gameplay)
- **Isolation**: Chatbot is completely isolated from game logic, state management, and other pages
- **Removability**: Chatbot can be easily removed without affecting other functionality

### Chatbot Capabilities
- **History & Origins**: Explains Mancala's 1,300+ year history, origins in Africa, and regional variations
- **Rules Explanation**: Clarifies game rules, setup, special rules (extra turns, captures), and game ending conditions
- **Strategy Guidance**: Provides strategic tips about:
  - How to gain extra turns
  - How captures work and how to set them up
  - How to avoid giving opponents captures
  - Basic, intermediate, and advanced strategic thinking
  - General planning and foresight (without playing the game for the user)
- **Polite Refusal**: Politely redirects non-Mancala questions back to Mancala topics

### Chatbot Constraints
- **Scope**: Only appears on landing page, never on game pages
- **State**: No global state, chat history resets when component unmounts
- **No Game Interference**: Does not affect game logic, AI difficulty, or multiplayer functionality
- **No External Dependencies**: Uses only provided knowledge base, no internet browsing
- **Error Handling**: Gracefully handles unsupported questions without crashing

## Impact
- **Affected specs**: Landing page (MODIFIED to add chatbot requirement)
- **Affected code**:
  - `frontend/src/pages/LandingPage.tsx` - Add chatbot component
  - `frontend/src/components/landing/MancalaChatbot.tsx` - New chatbot component (self-contained)
  - `frontend/src/services/chatbotService.ts` - New service for chatbot logic and knowledge base
  - `frontend/src/types/chatbot.ts` - TypeScript types for chatbot
- **UI/UX**: Enhanced onboarding experience on landing page, no impact on gameplay or other pages
- **Dependencies**: No new external dependencies required (uses existing React/TypeScript stack)
