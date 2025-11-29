// ============================================
// AUDIO EVENTS (Type-safe event strings)
// ============================================

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
    PLUS_DATA: 'PLUS_DATA',
    TECHNOLOGY_UNLOCKED: 'TECHNOLOGY_UNLOCKED',
    CHANGE_LOCATION: 'CHANGE_LOCATION',
    BOSS_APPEARANCE: 'BOSS_APPEARANCE',
    GAME_OVER_DEFEAT: 'GAME_OVER_DEFEAT',
    GAME_OVER_WIN: 'GAME_OVER_WIN',
    HEAT_WARNING: 'HEAT_WARNING',
    INSUFFICIENT_POWER_GRID: 'INSUFFICIENT_POWER_GRID',
    ON_PAUSE: 'ON_PAUSE',
    ON_PLAY: 'ON_PLAY',
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
            'audio/sfx/power_up.mp3',
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
            'audio/sfx/power_down.mp3',
        ],
        volume: 1.0,
        // randomization: {
        //     volume: { min: -2, max: 2 },
        //     pitch: { min: -30, max: 30 }
        // },
    },

    [AudioEvents.BATTLE_START]: {
        src: [
            'audio/sfx/battle_start.mp3',
        ],
        volume: 1.0,
        // randomization: {
        //     volume: { min: -2, max: 2 },
        //     pitch: { min: -30, max: 30 }
        // },
        playbackLimit: {
            time: 1000,
        }
    },

    [AudioEvents.BATTLE_FINISH]: {
        src: [
            'audio/sfx/battle_finish.mp3',
        ],
        volume: 1.0,
        randomization: {
             volume: { min: -2, max: 2 },
             pitch: { min: -10, max: 10 }
        },
        playbackLimit: {
            time: 200,
        }
    },

    [AudioEvents.GRID_UPGRADE]: {
        src: [
            'audio/sfx/grid_up.mp3',
        ],
        volume: 1.0,
    },

    [AudioEvents.PLUS_DATA]: {
        src: [
            'audio/sfx/new_data_level.mp3',
        ],
        volume: 1.0,
        randomization: {
             volume: { min: -2, max: 2 },
             pitch: { min: -10, max: 10 }
        },
        playbackLimit: {
            time: 500,
        }
    },

    [AudioEvents.TECHNOLOGY_UNLOCKED]: {
        src: [
            'audio/sfx/unlock_tech.mp3',
        ],
        volume: 1.0,
    },

    [AudioEvents.CHANGE_LOCATION]: {
        src: [
            'audio/sfx/new_location.mp3',
        ],
        volume: 1.0,
        randomization: {
             volume: { min: -2, max: 2 },
             pitch: { min: -5, max: 5 }
        },
        playbackLimit: {
            time: 2000,
        }
    },

    [AudioEvents.BOSS_APPEARANCE]: {
        src: [
            'audio/sfx/boss_arrives.mp3',
        ],
        volume: 1.0,
    },

    [AudioEvents.GAME_OVER_DEFEAT]: {
        src: [
            'audio/sfx/bossfight_lost.mp3',
        ],
        volume: 1.0,
    },

    [AudioEvents.GAME_OVER_WIN]: {
        src: [
            'audio/sfx/bossfight_won.mp3',
        ],
        volume: 1.0,
    },

    [AudioEvents.HEAT_WARNING]: {
        src: [
            'audio/sfx/heat_warning.mp3',
        ],
        volume: 1.0,
        // Safety, not sure how often this might get triggered otherwise
        playbackLimit: {
            time: 5000,
        }
    },

    [AudioEvents.INSUFFICIENT_POWER_GRID]: {
        src: [
            'audio/sfx/insufficient_power_grid.mp3',
        ],
        volume: 1.0,
        playbackLimit: {
            time: 500,
        }
    },

    [AudioEvents.ON_PAUSE]: {
        src: [
            'audio/sfx/pause.mp3',
        ],
        volume: 1.0,
    },

    [AudioEvents.ON_PLAY]: {
        src: [
            'audio/sfx/play.mp3',
        ],
        volume: 1.0,
    },

};

// ============================================
// MUSIC CONFIGURATION
// ============================================

// Note: Music files would need to be created with separate layers
// This is a placeholder structure for when music assets are available

/** @type {import('../audioEngine.js').MusicState} */
const LayeredMainThemeMusicState = {
    name: MusicIds.MAIN_THEME,
    layers: {
        initial: {
            segment: {
                src: 'audio/music/ps_bgm_initial_layer.mp3',
                volume: 0.5,
                loop: true,
                fadeInTime: 600,
                fadeOutTime: 600
            },
            conditions: (_) => {
                if (!gameData.state.musicInitialLayerPlaying) return false;

                return true; // Always playing
            },
        },
        slow_progress: {
            segment: {
                src: 'audio/music/ps_bgm_low_layer.mp3',
                volume: 1.0,
                loop: true,
                fadeInTime: 6000,
                fadeOutTime: 6000
            },
            conditions: (musicContext) => {
                if (!gameData.state.musicProgressLayerPlaying) return false;

                return musicContext.avgProgressSpeed <= 0.30;
            },
        },
        medium_progress: {
            segment: {
                src: 'audio/music/ps_bgm_mid_layer.mp3',
                volume: 1.0,
                loop: true,
                fadeInTime: 6000,
                fadeOutTime: 6000
            },
            conditions: (musicContext) => {
                if (!gameData.state.musicProgressLayerPlaying) return false;

                // Slow progress?
                if (musicContext.avgProgressSpeed <= 0.30) return false;

                // Fast progress?
                if (musicContext.avgProgressSpeed > 0.80) return false;

                // Then it's medium!
                return true;
            },
        },
        fast_progress: {
            segment: {
                src: 'audio/music/ps_bgm_high_layer.mp3',
                volume: 1.0,
                loop: true,
                fadeInTime: 3000,
                fadeOutTime: 3000
            },
            conditions: (musicContext) => {
                if (!gameData.state.musicProgressLayerPlaying) return false;

                if (musicContext.avgProgressSpeed > 0.80) return true;

                // Not fast enough...
                return false;
            },
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

// /** @type {import('../audioEngine.js').MusicState} */
// const MainThemeMusicState = {
//     name: MusicIds.MAIN_THEME,
//     layers: {
//         base: {
//             segment: {
//                 src: './audio/main-theme.mp3',
//                 volume: 1.0,
//                 loop: true,
//                 fadeInTime: 2000,
//                 fadeOutTime: 2000
//             },
//             conditions: (ctx) => true // Always playing
//         }
//     }
// };

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
    AudioEngine.registerMusicState(LayeredMainThemeMusicState);
    // AudioEngine.registerMusicState(ComplexMainThemeMusicState);
    // AudioEngine.registerMusicState(CombatMusicState);
}
