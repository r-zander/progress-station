// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * @typedef {Object} VolumeRange
 * @property {number} min - Volume variation minimum (in dB)
 * @property {number} max - Volume variation maximum (in dB)
 */

/**
 * @typedef {Object} PitchRange
 * @property {number} min - Pitch variation minimum (in cents)
 * @property {number} max - Pitch variation maximum (in cents)
 */

/**
 * @typedef {Object} DelayRange
 * @property {number} min - Delay minimum (in ms)
 * @property {number} max - Delay maximum (in ms)
 */

/**
 * @typedef {Object} Randomization
 * @property {VolumeRange} [volume] - Volume variation range
 * @property {PitchRange} [pitch] - Pitch variation range
 * @property {DelayRange} [delay] - Delay before playback range
 * @property {number} [avoidRepeat] - Don't repeat within last N plays
 * @property {number[]} [weights] - Weighted selection for multi-src
 */

/**
 * @typedef {Object} SoundBankEntry
 * @property {string|string[]} src - Single file or array for variations
 * @property {number} [volume] - Base volume (0-1)
 * @property {boolean} [loop] - Whether to loop the sound
 * @property {'random'|'sequence'} [containerType] - Playback container type
 * @property {Randomization} [randomization] - Randomization settings
 * @property {number} [pool] - Max concurrent instances
 * @property {Object.<string, [number, number]>} [sprite] - Audio sprites
 */

/**
 * @typedef {Object.<string, SoundBankEntry>} SoundBank
 */

/**
 * @typedef {Object} MusicSegment
 * @property {string} src - Audio file source
 * @property {number} volume - Volume (0-1)
 * @property {boolean} loop - Whether to loop
 * @property {number} [fadeInTime] - Fade in duration (ms)
 * @property {number} [fadeOutTime] - Fade out duration (ms)
 */

/**
 * @typedef {Object} MusicLayer
 * @property {MusicSegment} segment - The audio segment
 * @property {function(MusicContext): boolean} conditions - Layer activation conditions
 */

/**
 * @typedef {Object} MusicState
 * @property {string} name - State name
 * @property {Object.<string, MusicLayer>} layers - Named layers with conditions
 */

/**
 * @typedef {Object} MusicContext
 * @property {number} tension - Tension level (0-100)
 * @property {number} energy - Energy level (0-100)
 * @property {'exploration'|'combat'|'victory'|'defeat'} phase - Current game phase
 */

// ============================================
// MAIN AUDIO ENGINE API
// ============================================

class AudioEngine {
    // ============================================
    // PRIVATE STATIC MEMBERS
    // ============================================

    /** @type {Object.<string, Object>} Loaded sound banks with their Howl instances */
    static _banks = {};

    /** @type {Object.<string, Array>} Recent play history for avoidRepeat */
    static _recentPlays = {};

    /** @type {Object.<string, number>} Sequence counters for 'sequence' container type */
    static _sequenceCounters = {};

    /** @type {MusicContext} Current music context */
    static _musicContext = {
        tension: 0,
        energy: 0,
        phase: 'exploration'
    };

    /** @type {Object.<string, MusicState>} Registered music states */
    static _musicStates = {};

    /** @type {Object.<string, string>} Current active state per state group */
    static _activeStates = {};

    /** @type {Object.<string, Object>} Active music layers with their Howl instances */
    static _activeLayers = {};

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    /**
     * Convert decibels to linear volume (0-1)
     * @param {number} db - Decibel value
     * @returns {number} Linear volume
     * @private
     */
    static _dbToLinear(db) {
        return Math.pow(10, db / 20);
    }

    /**
     * Convert cents to playback rate multiplier
     * @param {number} cents - Pitch shift in cents
     * @returns {number} Rate multiplier
     * @private
     */
    static _centsToRate(cents) {
        return Math.pow(2, cents / 1200);
    }

    /**
     * Select index using weighted random selection
     * @param {number[]} weights - Array of weights
     * @returns {number} Selected index
     * @private
     */
    static _weightedRandom(weights) {
        const total = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * total;

        for (let i = 0; i < weights.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return i;
            }
        }

        return weights.length - 1;
    }

    /**
     * Random number between min and max
     * @param {number} min
     * @param {number} max
     * @returns {number}
     * @private
     */
    static _randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }

    /**
     * Select next source index based on container type
     * @param {string} event - Event name
     * @param {SoundBankEntry} entry - Sound bank entry
     * @param {string[]} srcArray - Array of source files
     * @returns {number} Selected index
     * @private
     */
    static _selectNextSource(event, entry, srcArray) {
        const containerType = entry.containerType || 'random';
        const randomization = entry.randomization || {};

        if (srcArray.length === 1) {
            return 0;
        }

        if (containerType === 'sequence') {
            // Cycle through sources in order
            if (typeof AudioEngine._sequenceCounters[event] !== 'number') {
                AudioEngine._sequenceCounters[event] = 0;
            }
            const index = AudioEngine._sequenceCounters[event];
            AudioEngine._sequenceCounters[event] = (index + 1) % srcArray.length;
            return index;
        }

        if (containerType === 'random') {
            let selectedIndex;

            // Use weighted random if weights are provided
            if (randomization.weights && randomization.weights.length === srcArray.length) {
                selectedIndex = AudioEngine._weightedRandom(randomization.weights);
            } else {
                selectedIndex = Math.floor(Math.random() * srcArray.length);
            }

            // Handle avoidRepeat
            if (typeof randomization.avoidRepeat === 'number' && randomization.avoidRepeat > 0) {
                if (!AudioEngine._recentPlays[event]) {
                    AudioEngine._recentPlays[event] = [];
                }

                const recentPlays = AudioEngine._recentPlays[event];
                const maxAttempts = 50;
                let attempts = 0;

                while (recentPlays.includes(selectedIndex) && attempts < maxAttempts) {
                    if (randomization.weights && randomization.weights.length === srcArray.length) {
                        selectedIndex = AudioEngine._weightedRandom(randomization.weights);
                    } else {
                        selectedIndex = Math.floor(Math.random() * srcArray.length);
                    }
                    attempts++;
                }

                // Update recent plays
                recentPlays.push(selectedIndex);
                if (recentPlays.length > randomization.avoidRepeat) {
                    recentPlays.shift();
                }
            }

            return selectedIndex;
        }

        return 0;
    }

    // ============================================
    // PUBLIC API
    // ============================================

    /**
     * Load a soundbank
     * @param {string} bankName - Name of the bank
     * @param {SoundBank} soundBank - Sound bank definition
     * @returns {void}
     */
    static LoadBank(bankName, soundBank) {
        if (AudioEngine._banks[bankName]) {
            console.warn(`AudioEngine: Bank "${bankName}" is already loaded`);
            return;
        }

        const bankData = {
            name: bankName,
            events: {}
        };

        // Create Howl instances for each event
        for (const eventName in soundBank) {
            const entry = soundBank[eventName];
            const srcArray = Array.isArray(entry.src) ? entry.src : [entry.src];

            // Create one Howl per source file
            bankData.events[eventName] = {
                entry: entry,
                howls: srcArray.map(src => new Howl({
                    src: [src],
                    volume: entry.volume !== undefined ? entry.volume : 1.0,
                    loop: entry.loop || false,
                    pool: entry.pool || 5,
                    sprite: entry.sprite || undefined,
                    preload: true
                }))
            };
        }

        AudioEngine._banks[bankName] = bankData;
    }

    /**
     * Trigger an audio event (Wwise-style)
     * @param {AudioEvent} event - The audio event to trigger
     * @param {any} [gameObject] - Optional game object reference
     * @returns {void}
     */
    static PostEvent(event, gameObject) {
        // Find the event in loaded banks
        let eventData = null;

        for (const bankName in AudioEngine._banks) {
            const bank = AudioEngine._banks[bankName];
            if (bank.events[event]) {
                eventData = bank.events[event];
                break;
            }
        }

        if (eventData === null) {
            console.warn(`AudioEngine: Event "${event}" not found in any loaded bank`);
            return;
        }

        const entry = eventData.entry;
        const howls = eventData.howls;
        const srcArray = Array.isArray(entry.src) ? entry.src : [entry.src];

        // Select which source to play
        const sourceIndex = AudioEngine._selectNextSource(event, entry, srcArray);
        const howl = howls[sourceIndex];

        // Apply randomization
        const randomization = entry.randomization || {};
        let volume = entry.volume !== undefined ? entry.volume : 1.0;
        let rate = 1.0;
        let delay = 0;

        if (randomization.volume) {
            const volumeDb = AudioEngine._randomBetween(
                randomization.volume.min,
                randomization.volume.max
            );
            volume *= AudioEngine._dbToLinear(volumeDb);
        }

        if (randomization.pitch) {
            const pitchCents = AudioEngine._randomBetween(
                randomization.pitch.min,
                randomization.pitch.max
            );
            rate = AudioEngine._centsToRate(pitchCents);
        }

        if (randomization.delay) {
            delay = AudioEngine._randomBetween(
                randomization.delay.min,
                randomization.delay.max
            );
        }

        // Play the sound
        const playSound = () => {
            const soundId = howl.play();

            // Apply per-instance volume and rate
            howl.volume(volume, soundId);
            howl.rate(rate, soundId);
        };

        if (delay > 0) {
            setTimeout(playSound, delay);
        } else {
            playSound();
        }
    }

    /**
     * Set a real-time parameter control value (Wwise RTPC)
     * @param {string} rtpcName - Name of the RTPC
     * @param {number} value - Value to set
     * @returns {void}
     */
    static SetRTPCValue(rtpcName, value) {
        // Map RTPC names to MusicContext fields
        if (rtpcName === 'tension') {
            AudioEngine._musicContext.tension = value;
        } else if (rtpcName === 'energy') {
            AudioEngine._musicContext.energy = value;
        } else {
            console.warn(`AudioEngine: Unknown RTPC "${rtpcName}"`);
            return;
        }

        // Re-evaluate all active music layers
        AudioEngine._updateMusicLayers();
    }

    /**
     * Set the music context (convenience method)
     * @param {Partial<MusicContext>} context - Context object with music parameters
     * @returns {void}
     */
    static SetMusicContext(context) {
        // Update context fields
        if (typeof context.tension === 'number') {
            AudioEngine._musicContext.tension = context.tension;
        }
        if (typeof context.energy === 'number') {
            AudioEngine._musicContext.energy = context.energy;
        }
        if (typeof context.phase === 'string') {
            AudioEngine._musicContext.phase = context.phase;
        }

        // Re-evaluate all active music layers
        AudioEngine._updateMusicLayers();
    }

    /**
     * Set a music state (Wwise-style)
     * @param {string} stateGroup - State group name
     * @param {string} state - State name
     * @returns {void}
     */
    static SetState(stateGroup, state) {
        const previousState = AudioEngine._activeStates[stateGroup];

        if (previousState === state) {
            return; // Already in this state
        }

        AudioEngine._activeStates[stateGroup] = state;

        // Stop layers from previous state
        if (previousState && AudioEngine._musicStates[previousState]) {
            const previousMusicState = AudioEngine._musicStates[previousState];
            AudioEngine._stopMusicState(previousMusicState);
        }

        // Start layers from new state
        if (AudioEngine._musicStates[state]) {
            const musicState = AudioEngine._musicStates[state];
            AudioEngine._startMusicState(musicState);
        }
    }

    /**
     * Register a music state with layer logic
     * @param {MusicState} state - Music state definition
     * @returns {void}
     */
    static RegisterMusicState(state) {
        AudioEngine._musicStates[state.name] = state;
    }

    /**
     * Unload a soundbank
     * @param {string} bankName - Name of the bank to unload
     * @returns {void}
     */
    static UnloadBank(bankName) {
        const bank = AudioEngine._banks[bankName];

        if (!bank) {
            console.warn(`AudioEngine: Bank "${bankName}" not found`);
            return;
        }

        // Unload all Howl instances
        for (const eventName in bank.events) {
            const eventData = bank.events[eventName];
            eventData.howls.forEach(howl => howl.unload());
        }

        delete AudioEngine._banks[bankName];
    }

    /**
     * Stop all currently playing sounds
     * @returns {void}
     */
    static StopAll() {
        // Stop all sound effects
        for (const bankName in AudioEngine._banks) {
            const bank = AudioEngine._banks[bankName];
            for (const eventName in bank.events) {
                const eventData = bank.events[eventName];
                eventData.howls.forEach(howl => howl.stop());
            }
        }

        // Stop all music layers
        for (const layerKey in AudioEngine._activeLayers) {
            const layer = AudioEngine._activeLayers[layerKey];
            if (layer.howl) {
                layer.howl.stop();
            }
        }

        AudioEngine._activeLayers = {};
    }

    // ============================================
    // PRIVATE MUSIC SYSTEM METHODS
    // ============================================

    /**
     * Update music layers based on current context
     * @private
     */
    static _updateMusicLayers() {
        for (const stateName in AudioEngine._musicStates) {
            // Only update layers for active states
            if (AudioEngine._activeStates[stateName] !== stateName) {
                continue;
            }

            const musicState = AudioEngine._musicStates[stateName];

            for (const layerName in musicState.layers) {
                const layer = musicState.layers[layerName];
                const layerKey = `${stateName}_${layerName}`;
                const shouldBeActive = layer.conditions(AudioEngine._musicContext);
                const isActive = AudioEngine._activeLayers[layerKey] !== undefined;

                if (shouldBeActive && !isActive) {
                    AudioEngine._startLayer(stateName, layerName, layer);
                } else if (!shouldBeActive && isActive) {
                    AudioEngine._stopLayer(stateName, layerName, layer);
                }
            }
        }
    }

    /**
     * Start a music state (all layers that meet conditions)
     * @param {MusicState} musicState
     * @private
     */
    static _startMusicState(musicState) {
        for (const layerName in musicState.layers) {
            const layer = musicState.layers[layerName];
            if (layer.conditions(AudioEngine._musicContext)) {
                AudioEngine._startLayer(musicState.name, layerName, layer);
            }
        }
    }

    /**
     * Stop a music state (all its layers)
     * @param {MusicState} musicState
     * @private
     */
    static _stopMusicState(musicState) {
        for (const layerName in musicState.layers) {
            const layer = musicState.layers[layerName];
            AudioEngine._stopLayer(musicState.name, layerName, layer);
        }
    }

    /**
     * Start a music layer
     * @param {string} stateName
     * @param {string} layerName
     * @param {MusicLayer} layer
     * @private
     */
    static _startLayer(stateName, layerName, layer) {
        const layerKey = `${stateName}_${layerName}`;
        const segment = layer.segment;

        // Create Howl for this layer
        const howl = new Howl({
            src: [segment.src],
            volume: segment.volume,
            loop: segment.loop,
            preload: true
        });

        const soundId = howl.play();

        // Fade in if specified
        if (typeof segment.fadeInTime === 'number' && segment.fadeInTime > 0) {
            howl.volume(0, soundId);
            howl.fade(0, segment.volume, segment.fadeInTime, soundId);
        }

        AudioEngine._activeLayers[layerKey] = {
            howl: howl,
            soundId: soundId
        };
    }

    /**
     * Stop a music layer
     * @param {string} stateName
     * @param {string} layerName
     * @param {MusicLayer} layer
     * @private
     */
    static _stopLayer(stateName, layerName, layer) {
        const layerKey = `${stateName}_${layerName}`;
        const activeLayer = AudioEngine._activeLayers[layerKey];

        if (!activeLayer) {
            return;
        }

        const segment = layer.segment;

        // Fade out if specified
        if (typeof segment.fadeOutTime === 'number' && segment.fadeOutTime > 0) {
            activeLayer.howl.fade(
                segment.volume,
                0,
                segment.fadeOutTime,
                activeLayer.soundId
            );

            // Stop and unload after fade
            setTimeout(() => {
                activeLayer.howl.stop();
                activeLayer.howl.unload();
                delete AudioEngine._activeLayers[layerKey];
            }, segment.fadeOutTime);
        } else {
            activeLayer.howl.stop();
            activeLayer.howl.unload();
            delete AudioEngine._activeLayers[layerKey];
        }
    }
}
