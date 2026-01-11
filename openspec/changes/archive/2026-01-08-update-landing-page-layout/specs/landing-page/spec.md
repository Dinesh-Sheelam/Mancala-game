## ADDED Requirements

### Requirement: Landing Page Layout
The landing page SHALL display the user profile section at the top-left position with a user profile icon above the player name, and the main action buttons (Play and How to Play) SHALL be stacked vertically and centered horizontally on the page.

#### Scenario: Profile section displays at top-left with vintage icon
- **WHEN** the user navigates to the landing page
- **THEN** the profile section is positioned at the top-left of the page
- **AND** a user profile icon with edit symbol (blue-orange-brown gradient) is displayed above the player name
- **AND** the player name is displayed directly below the icon, centered
- **AND** the icon is clickable to edit the name

#### Scenario: Player name updates reflect below icon
- **WHEN** the user edits their name in the profile section
- **THEN** the updated name is immediately displayed below the profile icon
- **AND** the name change persists across page refreshes
- **AND** the edit mode can be toggled by clicking the icon

#### Scenario: Buttons are stacked vertically and centered
- **WHEN** the user views the landing page
- **THEN** the "Play" button is displayed first
- **AND** the "How to Play" button is displayed directly below the "Play" button
- **AND** both buttons are centered horizontally on the page
- **AND** the buttons are positioned in the upper-mid section of the screen
- **AND** the buttons maintain their full width on mobile devices

#### Scenario: Mancala title uses retro font
- **WHEN** the user views the landing page
- **THEN** the "Mancala" title displays in "Bungee Shade" retro font
- **AND** the title has vintage styling with text shadow and letter spacing
- **AND** the title is prominently displayed above the game image

#### Scenario: Mancala board image displays
- **WHEN** the user views the landing page
- **THEN** a vintage Mancala board image is displayed above the action buttons
- **AND** the image is centered and properly sized (max 188px height, 500px width)
- **AND** the image has rounded corners and shadow effects

#### Scenario: Audio controls are accessible
- **WHEN** the user views the landing page
- **THEN** audio controls are positioned in the top-right corner
- **AND** the controls allow volume adjustment and mute toggle
- **AND** background music plays if not muted

#### Scenario: Exit button is not on landing page
- **WHEN** the user views the landing page
- **THEN** no exit button is displayed
- **AND** the exit button is available on the Game Selection page instead

### Requirement: Game Board Design
The game board SHALL display with a vintage wood texture, colorful glossy marbles, and wooden number plaques.

#### Scenario: Board displays vintage wood texture
- **WHEN** the user views the game board
- **THEN** the board has a realistic aged wood appearance
- **AND** wood grain patterns are visible
- **AND** the board has appropriate shadows and depth

#### Scenario: Pits display as circular depressions
- **WHEN** the user views the game board
- **THEN** pits appear as circular depressions carved into wood
- **AND** pits contain colorful glossy marbles (red, green, blue, purple)
- **AND** wooden number plaques display above/below pits showing seed count

#### Scenario: Stores display as vertical ovals
- **WHEN** the user views the game board
- **THEN** stores appear as vertical oval depressions
- **AND** stores contain colorful glossy marbles
- **AND** wooden number plaques display at the top of stores
- **AND** player names display at the bottom of stores

#### Scenario: Four seeds fit within pit borders
- **WHEN** a pit contains exactly 4 seeds
- **THEN** the seeds are arranged in a 2x2 square pattern
- **AND** all seeds fit within the pit border without crossing

### Requirement: Color Theme
The application SHALL use a vintage blue, brown, and orange color scheme throughout.

#### Scenario: Background uses vintage gradient
- **WHEN** the user views any page
- **THEN** the background uses a gradient from slate-800 via blue-900 to slate-900
- **AND** no orange appears at the bottom of the gradient

#### Scenario: Buttons use vintage colors
- **WHEN** the user views buttons
- **THEN** primary action buttons use orange/amber gradients
- **AND** secondary buttons use blue gradients
- **AND** Create Room buttons use green gradients
- **AND** Exit buttons use red color
- **AND** difficulty buttons use green (easy), amber (medium), red (hard)

### Requirement: Multiplayer Functionality
Local multiplayer games SHALL allow both players to play with custom names.

#### Scenario: Player 2 name is requested
- **WHEN** the user clicks "Start Multiplayer Game"
- **THEN** a modal appears requesting Player 2 name
- **AND** the name must be at least 2 characters
- **AND** the game starts only after valid name is entered

#### Scenario: Both players can play
- **WHEN** a local multiplayer game is active
- **THEN** Player 1 can click their pits (0-5) when it's their turn
- **AND** Player 2 can click their pits (7-12) when it's their turn
- **AND** player names are displayed correctly on the board
- **AND** turn indicator shows whose turn it is

### Requirement: Audio System
Background music SHALL play across all pages with user controls available.

#### Scenario: Music plays globally
- **WHEN** the application loads
- **THEN** background music initializes
- **AND** music plays if not muted
- **AND** music continues playing when navigating between pages

#### Scenario: Audio controls are available
- **WHEN** the user views any game page
- **THEN** audio controls are visible in the top-right corner
- **AND** the controls allow volume adjustment (0-100%)
- **AND** the controls allow mute/unmute toggle
- **AND** settings persist across sessions
