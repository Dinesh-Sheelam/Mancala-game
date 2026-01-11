# Change: Update Landing Page Layout and Game Design

## Why
The current landing page layout and game design needed improvements for better UX and a vintage aesthetic:
- Profile information needed better positioning and visual design
- Buttons needed better organization and visual hierarchy
- Game board needed a vintage, classic look matching the traditional Mancala aesthetic
- Color scheme needed to match vintage blue, brown, and orange theme from reference image
- Multiplayer functionality needed fixes for player names and turn handling
- Audio controls needed to be accessible on all pages

## What Changes

### Landing Page Layout
- **Profile Section**: Moved to top-left position with custom SVG icon (blue-to-purple gradient)
- **Profile Icon**: User silhouette with edit pencil, clickable to edit name
- **Name Display**: Shows below icon, updates dynamically when name changes
- **Button Layout**: Stacked vertically and centered ("Play" above "How to Play")
- **Audio Controls**: Moved to top-right corner
- **Exit Button**: Removed from landing page, added to Game Selection page
- **Mancala Image**: Added vintage board image above buttons
- **Title Font**: Applied retro "Bungee Shade" font with vintage styling

### Game Board Design
- **Vintage Wood Texture**: Realistic aged wood appearance with grain patterns
- **Pit Design**: Circular depressions in wood with colorful glossy marbles (red, green, blue, purple)
- **Store Design**: Vertical oval depressions with vintage wood texture
- **Wooden Plaques**: Number displays styled as small wooden plaques above/below pits
- **Board Size**: Increased board, pit, and store sizes for better visibility
- **Marble Arrangement**: Special 2x2 square pattern for 4 seeds to fit within pit borders

### Color Theme
- **Background**: Changed from purple/indigo to vintage blue-to-slate gradient (`from-slate-800 via-blue-900 to-slate-900`)
- **Primary Buttons**: Orange/amber gradients (`from-amber-600 to-orange-600`)
- **Secondary Buttons**: Blue gradients (`from-blue-600 to-blue-800`)
- **Create Room**: Green gradient (`from-green-600 to-emerald-600`)
- **Exit Buttons**: Red (`bg-red-600`)
- **Difficulty Buttons**: Green (easy), Amber (medium), Red (hard)
- **Start Single Player**: Dynamic color based on difficulty (green/orange/red)

### Multiplayer Functionality
- **Player 2 Name Input**: Modal to enter Player 2 name when starting local multiplayer
- **Turn Handling**: Fixed so both players can play in local multiplayer
- **Player Names**: Displayed correctly on board and in game messages
- **Game State**: Player 2 name stored in game state

### Audio System
- **Global Audio**: Background music plays across all pages
- **Audio Controls**: Added to all game pages (top-right corner)
- **Soundtrack**: Integrated `mancala.mp3` from `public/audio/` folder

### Online Game Layout
- **Centered Board**: Board centered vertically on page
- **Fixed Message Area**: Messages at bottom with fixed height to prevent board movement
- **Room Creation Flow**: Fixed to show room code and wait for opponent before starting game

## Impact
- **Affected specs**: Landing page, Game Selection, Offline Game, Online Game, Board components
- **Affected code**:
  - `frontend/src/pages/LandingPage.tsx` - Layout, image, font, colors
  - `frontend/src/pages/GameSelection.tsx` - Exit button, difficulty colors, multiplayer modal
  - `frontend/src/pages/OfflineGame.tsx` - Layout, player names, audio controls
  - `frontend/src/pages/OnlineGame.tsx` - Layout, room flow, audio controls
  - `frontend/src/components/landing/ProfileSection.tsx` - Icon design, vintage colors
  - `frontend/src/components/mancala/MancalaBoard.tsx` - Vintage wood design, sizing
  - `frontend/src/components/mancala/Pit.tsx` - Vintage design, colorful marbles, wooden plaques
  - `frontend/src/components/mancala/Store.tsx` - Vintage design, wooden plaques
  - `frontend/src/services/audioService.ts` - Background music integration
  - `frontend/src/App.tsx` - Global audio initialization
  - `frontend/src/types/mancala.ts` - Added player2Name field
  - `frontend/src/store/mancalaStore.ts` - Player 2 name support
- **UI/UX**: Improved visual hierarchy, vintage aesthetic, better mobile responsiveness, enhanced gameplay experience
