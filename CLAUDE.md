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