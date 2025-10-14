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
    UI: {
        BUTTON_CLICK: 'UI_Button_Click',
        BUTTON_HOVER: 'UI_Button_Hover',
        PANEL_OPEN: 'UI_Panel_Open',
        PANEL_CLOSE: 'UI_Panel_Close',
        NOTIFICATION: 'UI_Notification',
        TAB_SWITCH: 'UI_Tab_Switch',
    },
    GAMEPLAY: {
        OPERATION_ACTIVATE: 'GP_Operation_Activate',
        BATTLE_START: 'GP_Battle_Start',
        BATTLE_WIN: 'GP_Battle_Win',
        BATTLE_LOSE: 'GP_Battle_Lose',
        LEVEL_UP: 'GP_Level_Up',
        MILESTONE: 'GP_Milestone',
    },
    MUSIC: {
        MAIN_THEME: 'Music_MainTheme',
        COMBAT_THEME: 'Music_Combat',
        VICTORY_THEME: 'Music_Victory',
    }
};

// ============================================
// SOUND BANKS
// ============================================

/** @type {import('../audioEngine.js').SoundBank} */
const UISoundBank = {
    [AudioEvents.UI.BUTTON_CLICK]: {
        src: ['audio/sounds/245645__unfa__cartoon-pop-clean.mp3'],
        volume: 0.5,
        randomization: {
            volume: { min: -2, max: 2 },
            pitch: { min: -30, max: 30 }
        },
        pool: 5
    },

    [AudioEvents.UI.BUTTON_HOVER]: {
        src: ['audio/sounds/245645__unfa__cartoon-pop-clean.mp3'],
        volume: 0.2,
        randomization: {
            pitch: { min: 50, max: 100 },
            volume: { min: -3, max: 0 }
        },
        pool: 3
    },

    [AudioEvents.UI.TAB_SWITCH]: {
        src: ['audio/sounds/245645__unfa__cartoon-pop-clean.mp3'],
        volume: 0.4,
        randomization: {
            pitch: { min: -50, max: -20 },
            volume: { min: -2, max: 1 }
        },
        pool: 3
    },

    [AudioEvents.UI.NOTIFICATION]: {
        src: ['audio/sounds/245645__unfa__cartoon-pop-clean.mp3'],
        volume: 0.6,
        randomization: {
            pitch: { min: 100, max: 200 }
        },
        pool: 5
    }
};

/** @type {import('../audioEngine.js').SoundBank} */
const GameplaySoundBank = {
    [AudioEvents.GAMEPLAY.OPERATION_ACTIVATE]: {
        src: [
            'audio/sounds/348241__newagesoup__punch-boxing-04.mp3',
            'audio/sounds/319229__worthahep88__single-rock-hit-dirt-2.mp3'
        ],
        volume: 0.4,
        containerType: 'random',
        randomization: {
            volume: { min: -2, max: 2 },
            pitch: { min: -20, max: 20 },
            avoidRepeat: 1
        },
        pool: 5
    },

    [AudioEvents.GAMEPLAY.BATTLE_START]: {
        src: ['audio/sounds/389708__suspensiondigital__large-angry-cats.mp3'],
        volume: 0.5,
        randomization: {
            pitch: { min: -50, max: 50 }
        },
        pool: 2
    },

    [AudioEvents.GAMEPLAY.BATTLE_WIN]: {
        src: ['audio/sounds/398430__naturestemper__wolf-howl.mp3'],
        volume: 0.6,
        randomization: {
            pitch: { min: 0, max: 100 }
        },
        pool: 2
    },

    [AudioEvents.GAMEPLAY.BATTLE_LOSE]: {
        src: [
            'audio/sounds/413179__micahlg__male_hurt14.mp3',
            'audio/sounds/413175__micahlg__male_hurt10.mp3',
            'audio/sounds/413181__micahlg__male_hurt5.mp3'
        ],
        volume: 0.5,
        containerType: 'random',
        randomization: {
            pitch: { min: -30, max: 30 },
            avoidRepeat: 2
        },
        pool: 3
    },

    [AudioEvents.GAMEPLAY.LEVEL_UP]: {
        src: ['audio/sounds/411184__d3rfux__gruzi.mp3'],
        volume: 0.7,
        randomization: {
            pitch: { min: 0, max: 50 }
        },
        pool: 3
    },

    [AudioEvents.GAMEPLAY.MILESTONE]: {
        src: ['audio/sounds/435507__benjaminnelan__rooster-crow-2.mp3'],
        volume: 0.6,
        randomization: {
            pitch: { min: -100, max: 100 }
        },
        pool: 2
    }
};

// ============================================
// MUSIC CONFIGURATION
// ============================================

// Note: Music files would need to be created with separate layers
// This is a placeholder structure for when music assets are available

/** @type {import('../audioEngine.js').MusicState} */
const MainThemeMusicState = {
    name: AudioEvents.MUSIC.MAIN_THEME,
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
    name: AudioEvents.MUSIC.COMBAT_THEME,
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

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the audio system by loading all sound banks
 */
function initializeAudio() {
    // Load sound banks
    AudioEngine.LoadBank('UI', UISoundBank);
    AudioEngine.LoadBank('Gameplay', GameplaySoundBank);

    // Register music states (when music is available)
    // AudioEngine.RegisterMusicState(MainThemeMusicState);
    // AudioEngine.RegisterMusicState(CombatMusicState);
    // AudioEngine.SetState('MusicState', AudioEvents.MUSIC.MAIN_THEME);
}
