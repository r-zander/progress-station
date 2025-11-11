# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Progress Station is a browser-based incremental/idle game built in vanilla JavaScript. It's a space-themed auto-idler where players manage a space station, level up operations, and battle alien factions. The game is inspired by Progress Knight and features a complete game loop with boss battles and galactic secrets.

## Development Commands

This is a pure client-side HTML/JS/CSS project with no build system:

- **Development**: Open `index.html` directly in a browser or use IntelliJ IDEA's HTML Preview feature
- **Deployment**: Run `publish.bat` to deploy via Butler to itch.io (`butler push ./ kringelgames/progress-station:html5`)

## Code Architecture

### Core Structure
- **Entry Point**: `js/main.js` - Initializes the game loop and manages the main update cycle
- **Game State**: `js/gameData.js` - Handles all save/load operations and persistent game state
- **Game Logic**: `js/classes.js` - Contains the Entity system and core game classes
- **Game Configuration**: `js/game-config/` directory contains all game data definitions:
  - `modules.js` - Station modules and operations
  - `battles.js` - Faction battles and rewards
  - `locations.js` - Space sectors and points of interest
  - `galactic-secrets.js` - End-game unlockable content
  - `attributes.js` - Player attributes (population, industry, research, etc.)
  - `requirements.js` - Unlock conditions for game elements

### Key Systems
- **Entity System**: All game objects inherit from the `Entity` base class defined in `classes.js`
- **Effects System**: Uses `EffectDefinition` objects to define how game elements modify attributes
- **Progress Bars**: Clickable UI elements that drive progression, managed through HTML templates
- **Tab System**: Multi-panel UI controlled by `setTab()` function
- **Audio System**: `js/audio.js` handles sound effects using Howler.js

### UI Architecture
- **HTML Templates**: The main `index.html` contains `<template>` elements for dynamic content generation
- **CSS Structure**: Organized in `css/` with global styles, element-specific styles, and theme modes
- **Bootstrap Integration**: Uses Bootstrap 5 for layout and components

### Dependencies
- **Bootstrap 5.3.1**: UI framework and components
- **Lodash 4.17.15**: Utility functions
- **Fastdom 1.0.11**: DOM batching for performance
- **Howler.js 2.2.4**: Audio management
- **HackTimer 1.1.3**: Background timer functionality (production only)

### File Organization
- `js/` - All JavaScript files
- `css/` - Stylesheets organized by purpose (global/, elements/, modes/)
- `img/` - Game assets (icons, planets, etc.)
- `vendor/` - Third-party libraries
- Game configuration files use underscore notation for large numbers: `100_000`

### Development Notes
- Colors should be defined in `/css/global/_colors.css` and managed via CSS classes
- The `js/cheats.js` file is removed for production builds
- Game uses FastDOM for performance-optimized DOM operations
- No package.json - this is a vanilla JavaScript project

### Code Style
- **No falsy/truthy checks**: Always use explicit type checks instead of relying on falsy/truthy values
  - Use `isFunction()`, `isNumber()`, `isString()`, etc. for type checking
  - Use explicit comparisons: `!== null`, `!== undefined`, `=== 0`, etc.
  - Example: Use `if (isFunction(callback))` instead of `if (callback)`

## Game Mechanics & Interaction

### Core Game Loop
- **Main Update**: `update()` function in `main.js` runs every 1000/targetTicksPerSecond ms (default ~50ms)
- **Time Progression**: `increaseCycle()` advances game state, triggers boss battles, updates population
- **State Management**: Game states include PLAYING, PAUSED, BOSS_FIGHT, etc. managed via `gameData.transitionState()`

### Player Actions
- **Operations**: Click `.progressBar` elements to activate/switch operations via `tryActivateOperation()`
- **Battles**: Click battle progress bars to toggle engagement via `battle.toggle()`
- **Locations**: Click `.point-of-interest` buttons to change active location via `setPointOfInterest()`
- **Modules**: Use module activation switches to enable/disable entire modules

### Attributes System
- **Population**: Core resource, affected by Growth and Danger, calculated via `calculatePopulationDelta()`
- **Growth**: Drives population increase, prioritized when population < 95% of theoretical max
- **Military**: Increases damage against battles
- **Danger**: Risk level from battles/locations, causes population loss
- **Industry/Research**: Primary progression stats for unlocking content

### Modal System
- Game shows Bootstrap modals for story events, boss encounters, and game over
- Default behavior: click `.btn-primary` to dismiss
- Game over modal (`#gameOverModal`) appears on win/loss with `.win-only` elements for victory

### Module/Operation System Architecture
- **Module Categories**: Visual groupings with no gameplay impact
- **Modules**: Can be activated/deactivated independently, any number can be active simultaneously
- **Components**: Each module has components (typically 2), all active when module is active
- **Operations**: Each component has multiple operations (typically 3-4), exactly one active per component
- **Grid System**: Operations consume `gridLoad`, total cannot exceed `gridStrength` attribute
- **Optimization**: Higher gridLoad operations typically have better effects but same XP requirements
- **Special Priority**: "Standby Generator" should be prioritized until 10 Grid Strength OR 1,000,000 Energy generated

### Autoplay Integration
- `js/autoplay.js` provides automated gameplay via Greedy Hill Climber algorithm
- Toggle appears under Play button, evaluates actions every 1 second by efficiency score
- Prioritizes Growth effects unless population near theoretical maximum
- Respects safety constraints and handles modals automatically
- **Action Types**: Operations, Battles, Locations, and Module activation/deactivation
