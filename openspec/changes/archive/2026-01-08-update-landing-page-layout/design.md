## Context
The landing page and game design needed updates for better UX, vintage aesthetic, and improved functionality. This includes layout changes, color theme updates, board redesign, multiplayer fixes, and audio integration.

## Goals / Non-Goals

### Goals
- Move profile section to top-left with vintage-styled icon
- Stack buttons vertically for better mobile experience
- Implement vintage wood-textured game board
- Apply vintage blue, brown, and orange color theme
- Fix multiplayer functionality (player names, turn handling)
- Add background music across all pages
- Improve board sizing and marble arrangement
- Add Mancala image to landing page
- Apply retro font to title

### Non-Goals
- Changing core game logic or rules
- Modifying backend API structure
- Adding new game modes beyond existing ones
- Changing database schema

## Decisions

### Decision: Vintage Board Design
**What**: Implement realistic wood texture with colorful glossy marbles and wooden number plaques
**Why**: 
- Matches classic Mancala aesthetic
- Provides authentic vintage game feel
- Colorful marbles enhance visual appeal
- Wooden plaques match traditional game boards

**Alternatives considered**:
- Modern flat design - Rejected: doesn't match vintage aesthetic requirement
- Simple colored circles - Rejected: lacks authentic game feel

### Decision: Color Theme
**What**: Vintage blue, brown, and orange color scheme throughout application
**Why**:
- Matches reference image aesthetic
- Creates cohesive vintage feel
- Brown complements wood board design
- Blue and orange provide good contrast

**Alternatives considered**:
- Keep original purple/indigo theme - Rejected: doesn't match vintage aesthetic
- Full brown/wood theme - Rejected: too monochromatic

### Decision: Profile Icon Design
**What**: SVG icon with blue-orange-brown gradient, clickable to edit
**Why**: 
- Matches vintage color theme
- No external dependencies
- Crisp rendering at any size
- Intuitive interaction

**Alternatives considered**:
- Icon library - Rejected: adds dependency, may not match theme
- Image asset - Rejected: less flexible

### Decision: Board Sizing
**What**: Increased board, pit, and store sizes with fixed positioning
**Why**:
- Better visibility and usability
- Prevents stores from being cut off
- Better centering on page
- Improved marble visibility

**Alternatives considered**:
- Keep original sizes - Rejected: stores were being cut off
- Responsive sizing only - Rejected: fixed sizes needed for consistency

### Decision: Audio System
**What**: Global audio initialization with controls on all pages
**Why**:
- Seamless music experience across navigation
- User control from any page
- Matches modern game UX expectations

**Alternatives considered**:
- Audio only on landing page - Rejected: user wants music during gameplay
- Separate audio per page - Rejected: creates jarring experience

### Decision: Multiplayer Player 2 Name
**What**: Modal input when starting local multiplayer game
**Why**:
- Clear user flow
- Validates input before starting game
- Matches single-player pattern (Player 1 name from profile)

**Alternatives considered**:
- Pre-set Player 2 name - Rejected: user wants to name Player 2
- In-game name entry - Rejected: better to set before game starts

## Risks / Trade-offs

### Risk: Vintage design may not render consistently across browsers
**Mitigation**: Use standard CSS gradients and shadows, test on multiple browsers

### Risk: Larger board may not fit on small screens
**Mitigation**: Use responsive design, test on various screen sizes, consider mobile-specific adjustments

### Risk: Audio may not work on all devices/browsers
**Mitigation**: Use Howler.js library which handles cross-browser compatibility, provide fallback

### Risk: Color theme may reduce accessibility
**Mitigation**: Ensure sufficient contrast ratios, test with accessibility tools

### Risk: Board movement when messages appear/disappear
**Mitigation**: Use fixed-height message container to prevent layout shifts

## Migration Plan

### Steps
1. Update ProfileSection component with vintage icon
2. Update LandingPage layout and colors
3. Redesign board components with vintage wood texture
4. Update all page backgrounds to vintage theme
5. Fix multiplayer functionality
6. Integrate audio system globally
7. Add image and retro font to landing page
8. Update button colors throughout application
9. Test on multiple screen sizes and browsers
10. Verify all functionality works correctly

### Rollback
- Revert component files to previous versions
- Revert color theme changes
- Remove audio integration
- No database or API changes required

## Open Questions
- Should the vintage theme extend to modals and other UI elements?
- Are there any performance concerns with the wood texture rendering?
- Should audio volume persist across sessions?
