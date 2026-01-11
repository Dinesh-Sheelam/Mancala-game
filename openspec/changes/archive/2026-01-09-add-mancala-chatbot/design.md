# Design: Mancala Chatbot Implementation

## Architecture

### Component Structure
```
MancalaChatbot (self-contained component)
├── ChatButton (floating button)
└── ChatWindow (modal-like interface)
    ├── MessageList (scrollable message history)
    ├── MessageItem (individual message bubbles)
    └── MessageInput (input field with send button)
```

### Service Layer
```
chatbotService.ts
├── Knowledge Base (structured data from PDFs)
├── Question Parser (intent detection)
├── Response Generator (knowledge base lookup)
└── Topic Filter (Mancala-only validation)
```

## Technical Decisions

### 1. Knowledge Base Storage
**Decision**: Store knowledge base as structured TypeScript objects/constants in `chatbotService.ts`

**Rationale**:
- No external API calls needed
- Fast response times
- Easy to maintain and update
- No network dependencies
- Aligns with "no external knowledge" requirement

**Structure**:
```typescript
interface KnowledgeBase {
  history: string[];
  rules: {
    objective: string;
    setup: string;
    basicRules: string[];
    specialRules: {
      extraTurn: string;
      capture: string;
    };
    ending: string;
  };
  strategies: {
    basic: string[];
    intermediate: string[];
    advanced: string[];
  };
  terminology: Record<string, string>;
}
```

### 2. Question Processing
**Decision**: Use keyword matching and intent detection (simple pattern matching, not ML)

**Rationale**:
- No external dependencies
- Fast and predictable
- Easy to debug and maintain
- Sufficient for focused Mancala domain

**Approach**:
- Normalize input (lowercase, remove punctuation)
- Match keywords to knowledge base sections
- Use fuzzy matching for common variations
- Fallback to general Mancala information if no match

### 3. Component State Management
**Decision**: Use React `useState` hooks within the component (no global state)

**Rationale**:
- Component is self-contained
- State resets on unmount (as required)
- No interference with game state
- Easy to remove without side effects

**State Structure**:
```typescript
interface ChatState {
  isOpen: boolean;
  messages: Message[];
  inputValue: string;
}
```

### 4. UI Positioning
**Decision**: Floating chat button in bottom-right corner, chat window opens as overlay

**Rationale**:
- Doesn't interfere with existing landing page layout
- Standard chat UI pattern (familiar to users)
- Easy to dismiss
- Mobile-friendly

### 5. Styling
**Decision**: Match vintage blue/brown/orange theme with rounded corners and shadows

**Rationale**:
- Consistent with application design
- Maintains vintage aesthetic
- Professional appearance

**Color Scheme**:
- Chat button: Blue gradient (`from-blue-600 to-blue-800`)
- Chat window: Vintage wood-like background with blue accents
- User messages: Blue bubbles
- Bot messages: Brown/amber bubbles
- Input field: Vintage-styled with blue focus

### 6. Response Generation
**Decision**: Template-based responses with knowledge base lookup

**Rationale**:
- Predictable and consistent responses
- Easy to maintain and update
- No hallucination risk
- Fast response times

**Response Types**:
1. **Direct Match**: Exact answer from knowledge base
2. **Related Topic**: Related information from knowledge base
3. **Strategy Guidance**: Descriptive strategy tips (not prescriptive)
4. **Polite Refusal**: Template for non-Mancala questions

### 7. Error Handling
**Decision**: Graceful degradation with helpful fallback messages

**Rationale**:
- Never crashes or errors
- Always provides helpful response
- Maintains user experience

**Fallback Strategy**:
- If question unclear: "Could you rephrase your question about Mancala?"
- If topic not in knowledge base: Redirect to general Mancala rules
- If completely unrelated: Use polite refusal template

### 8. Mobile Responsiveness
**Decision**: Responsive design with mobile-optimized chat window

**Rationale**:
- Application supports mobile browsers
- Chat should work on all screen sizes
- Touch-friendly interface

**Mobile Adaptations**:
- Chat window takes full screen on mobile
- Larger touch targets
- Optimized message display

## Knowledge Base Content

### Sources
1. `Mancala_AI_Knowledge_Base.pdf` - Primary source for history, terminology, rules
2. `mancala_rules.pdf` - Primary source for gameplay rules and examples

### Content Categories
1. **History**: Origins, spread, regional variations, terminology
2. **Rules**: Objective, setup, basic rules, special rules, ending
3. **Strategies**: Basic tips, intermediate tactics, advanced strategies
4. **Terminology**: Definitions of seeds, pits, stores, etc.

## Integration Points

### Landing Page
- Chatbot component added as sibling to existing components
- No changes to existing landing page functionality
- Chatbot state is completely isolated

### Removal Strategy
To remove chatbot:
1. Remove `MancalaChatbot` import from `LandingPage.tsx`
2. Remove `<MancalaChatbot />` component usage
3. Delete chatbot files:
   - `frontend/src/components/landing/MancalaChatbot.tsx`
   - `frontend/src/services/chatbotService.ts`
   - `frontend/src/types/chatbot.ts`

No other changes needed - completely self-contained.

## Testing Strategy

### Unit Tests (Future)
- Test knowledge base lookup
- Test question parsing
- Test response generation
- Test topic filtering

### Manual Testing
- Test various question types
- Test edge cases (empty input, very long input)
- Test non-Mancala questions
- Test mobile responsiveness
- Test state reset on navigation

## Performance Considerations

### Optimization
- Knowledge base loaded once (module-level constant)
- No re-renders for unrelated state changes
- Message list virtualization for long conversations (future enhancement)

### Bundle Size
- Minimal impact (text-based knowledge base)
- No external dependencies
- Component code is lightweight
