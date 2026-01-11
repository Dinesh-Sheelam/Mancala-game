# landing-page Specification

## MODIFIED Requirements

### Requirement: Landing Page Chatbot
The landing page SHALL provide an interactive Mancala chatbot that helps players learn about Mancala history, rules, and strategies without affecting gameplay or other pages.

#### Scenario: Chatbot appears only on landing page
- **WHEN** the user navigates to the landing page
- **THEN** a floating chat button is displayed in the bottom-right corner
- **AND** the chatbot component is only rendered on the landing page
- **AND** the chatbot does not appear on any other page

#### Scenario: Chatbot opens and closes
- **WHEN** the user clicks the floating chat button
- **THEN** a chat window opens with a message history area
- **AND** the chat window displays an input field and send button
- **AND** the user can close the chat window by clicking a close button or outside the window
- **AND** the chat window has smooth open/close animations

#### Scenario: Chatbot answers Mancala history questions
- **WHEN** the user asks about Mancala history or origins
- **THEN** the chatbot provides information about Mancala's 1,300+ year history
- **AND** the chatbot explains Mancala's origins in Africa
- **AND** the chatbot mentions regional variations and spread
- **AND** the chatbot uses information from the provided knowledge base

#### Scenario: Chatbot explains Mancala rules
- **WHEN** the user asks about game rules, setup, or mechanics
- **THEN** the chatbot provides accurate rule explanations
- **AND** the chatbot explains objective, setup, basic rules, special rules, and ending conditions
- **AND** the chatbot clarifies extra turn and capture rules
- **AND** the chatbot uses information from the provided knowledge base

#### Scenario: Chatbot provides strategy guidance
- **WHEN** the user asks about strategy or tips
- **THEN** the chatbot provides descriptive strategy guidance
- **AND** the chatbot explains how to gain extra turns
- **AND** the chatbot explains how captures work and how to set them up
- **AND** the chatbot explains how to avoid giving opponents captures
- **AND** the chatbot provides basic, intermediate, and advanced strategic thinking
- **AND** the chatbot provides general planning and foresight (without playing the game for the user)
- **AND** strategy explanations are descriptive, not prescriptive

#### Scenario: Chatbot politely refuses non-Mancala questions
- **WHEN** the user asks a question unrelated to Mancala
- **THEN** the chatbot politely redirects the conversation back to Mancala
- **AND** the chatbot uses a friendly, educational tone
- **AND** the chatbot does not engage in general conversation
- **AND** the chatbot does not discuss unrelated games, tech, or personal topics

#### Scenario: Chatbot handles errors gracefully
- **WHEN** the user submits an unclear or unsupported question
- **THEN** the chatbot provides a helpful response without erroring
- **AND** the chatbot does not crash or display error messages
- **AND** the chatbot redirects to general Mancala information if needed
- **AND** the chatbot never says "I don't know" without redirecting

#### Scenario: Chatbot is isolated from game functionality
- **WHEN** the chatbot is active
- **THEN** the chatbot does not affect game logic or state
- **AND** the chatbot does not interfere with AI difficulty logic
- **AND** the chatbot does not provide move-by-move coaching during live games
- **AND** the chatbot does not simulate gameplay or predict exact outcomes
- **AND** the chatbot does not introduce global state

#### Scenario: Chatbot state resets on navigation
- **WHEN** the user navigates away from the landing page
- **THEN** the chat history is cleared
- **AND** the chatbot state does not persist across pages
- **AND** when the user returns to the landing page, the chatbot starts fresh

#### Scenario: Chatbot matches vintage theme
- **WHEN** the user views the chatbot
- **THEN** the chatbot UI matches the vintage blue, brown, and orange color scheme
- **AND** the chatbot has vintage-styled buttons and inputs
- **AND** the chatbot is responsive on mobile devices

#### Scenario: Chatbot is easily removable
- **WHEN** the chatbot component is removed from the codebase
- **THEN** the application continues to function normally
- **AND** no other components depend on the chatbot
- **AND** no global state or services are affected by removal
