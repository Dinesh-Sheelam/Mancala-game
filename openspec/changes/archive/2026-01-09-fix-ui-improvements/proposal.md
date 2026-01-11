# Change: UI Improvements and Bug Fixes

## Why
Several UI improvements and bug fixes were needed to enhance user experience:
- Profile edit button was not clickable due to z-index issues
- Multiplayer name input had poor visibility (white text on white background)
- Create Room interface lacked navigation back to game selection
- Game board components (pits and stores) needed size adjustments for better visual balance

## What Changes
- **Profile Section**: Fixed z-index and event handling for profile edit button on landing page
- **Multiplayer Input**: Changed label from "Player 2 Name" to "Multiplayer Name" and fixed input background color for better text visibility
- **Navigation**: Added "Back to Game Selection" button to Create Room interface (matching Join Room interface)
- **Game Board**: Decreased pit size from 128px to 112px and store size from 120px×280px to 100px×240px while keeping board size unchanged

## Impact
- Affected specs: `landing-page` (profile section), game board components
- Affected code:
  - `frontend/src/components/landing/ProfileSection.tsx`
  - `frontend/src/pages/GameSelection.tsx`
  - `frontend/src/pages/OnlineGame.tsx`
  - `frontend/src/components/mancala/Pit.tsx`
  - `frontend/src/components/mancala/Store.tsx`
