// ============================================
// AUDIO EVENTS (Type-safe event strings)
// ============================================

// TODO @Dementum all this setup is merely an example - you can delete
//  and change EVERYTHING to set up the music experience you wish.

/**
 * @typedef {string} AudioEvent
 */

// We will have to talk what events make sense and then to trigger them appropriately
const AudioEvents = {
    MODULE_ON: 'MODULE_ON',
    MODULE_OFF: 'MODULE_OFF',
    BATTLE_START: 'BATTLE_START',
    BATTLE_FINISH: 'BATTLE_FINISH',
    GRID_UPGRADE: 'GRID_UPGRADE',
    CHANGE_LOCATION: 'CHANGE_LOCATION',
};

const MusicIds = {
    MAIN_THEME: 'Music_MainTheme',
    COMBAT_THEME: 'Music_Combat',
    VICTORY_THEME: 'Music_Victory',
};

// ============================================
// SOUND BANKS
// ============================================

/** @type {import('../audioEngine.js').SoundBank} */
const SoundBank = {
    [AudioEvents.MODULE_ON]: {
        src: [
            'audio/sfx/power-up.mp3',
            'audio/sfx/power-up-v2.mp3',
            'audio/sfx/power-up-v3.mp3',
            'audio/sfx/power-up-v4.mp3',
            'audio/sfx/new-power-up.mp3',
        ],
        containerType: 'sequence',
        volume: 1.0,
        // randomization: {
        //     volume: { min: -2, max: 2 },
        //     pitch: { min: -30, max: 30 }
        // },
    },

    [AudioEvents.MODULE_OFF]: {
        src: [
            'audio/sfx/power-down-v1.mp3',
            'audio/sfx/power-down-v2.mp3',
        ],
        volume: 1.0,
        // randomization: {
        //     volume: { min: -2, max: 2 },
        //     pitch: { min: -30, max: 30 }
        // },
    },

    [AudioEvents.BATTLE_START]: {
        src: [
            'audio/sfx/battle-start-v1.mp3',
        ],
        volume: 1.0,
        // randomization: {
        //     volume: { min: -2, max: 2 },
        //     pitch: { min: -30, max: 30 }
        // },
    },

    // [AudioEvents.UI.BUTTON_HOVER]: {
    //     src: ['audio/sounds/245645__unfa__cartoon-pop-clean.mp3'],
    //     volume: 0.2,
    //     randomization: {
    //         pitch: { min: 50, max: 100 },
    //         volume: { min: -3, max: 0 }
    //     },
    //     pool: 3
    // },
    //
    // [AudioEvents.UI.TAB_SWITCH]: {
    //     src: ['audio/sounds/245645__unfa__cartoon-pop-clean.mp3'],
    //     volume: 0.4,
    //     randomization: {
    //         pitch: { min: -50, max: -20 },
    //         volume: { min: -2, max: 1 }
    //     },
    //     pool: 3
    // },
    //
    // [AudioEvents.UI.NOTIFICATION]: {
    //     src: ['audio/sounds/245645__unfa__cartoon-pop-clean.mp3'],
    //     volume: 0.6,
    //     randomization: {
    //         pitch: { min: 100, max: 200 }
    //     },
    //     pool: 5
    // }
};

// ============================================
// MUSIC CONFIGURATION
// ============================================

// Note: Music files would need to be created with separate layers
// This is a placeholder structure for when music assets are available

/** @type {import('../audioEngine.js').MusicState} */
const ComplexMainThemeMusicState = {
    name: MusicIds.MAIN_THEME,
    layers: {
        ambient: {
            segment: {
                src: 'audio/music/main_ambient.mp3',
                volume: 0.5,
                loop: true,
                fadeInTime: 2000,
                fadeOutTime: 2000
            },
            conditions: (ctx) => true // Always playing
        },
        energy: {
            segment: {
                src: 'audio/music/main_energy.mp3',
                volume: 0.6,
                loop: true,
                fadeInTime: 1500,
                fadeOutTime: 1500
            },
            conditions: (ctx) => ctx.energy > 30
        },
        tension: {
            segment: {
                src: 'audio/music/main_tension.mp3',
                volume: 0.5,
                loop: true,
                fadeInTime: 1000,
                fadeOutTime: 1000
            },
            conditions: (ctx) => ctx.tension > 50
        }
    }
};

/** @type {import('../audioEngine.js').MusicState} */
const CombatMusicState = {
    name: MusicIds.COMBAT_THEME,
    layers: {
        combat_bass: {
            segment: {
                src: 'audio/music/combat_bass.mp3',
                volume: 0.7,
                loop: true,
                fadeInTime: 500,
                fadeOutTime: 1000
            },
            conditions: (ctx) => ctx.phase === 'combat'
        },
        combat_drums: {
            segment: {
                src: 'audio/music/combat_drums.mp3',
                volume: 0.8,
                loop: true,
                fadeInTime: 500,
                fadeOutTime: 1000
            },
            conditions: (ctx) => ctx.phase === 'combat' && ctx.tension > 60
        }
    }
};

/** @type {import('../audioEngine.js').MusicState} */
const MainThemeMusicState = {
    name: MusicIds.MAIN_THEME,
    layers: {
        base: {
            segment: {
                src: './audio/main-theme.mp3',
                volume: 0.5,
                loop: true,
                fadeInTime: 2000,
                fadeOutTime: 2000
            },
            conditions: (ctx) => true // Always playing
        }
    }
};

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the audio system by loading all sound banks
 */
function initializeAudio() {
    // Load sound banks
    AudioEngine.loadBank('Game', SoundBank);

    // Register music states (when music is available)
    AudioEngine.registerMusicState(MainThemeMusicState);
    // AudioEngine.registerMusicState(ComplexMainThemeMusicState);
    // AudioEngine.registerMusicState(CombatMusicState);
}
