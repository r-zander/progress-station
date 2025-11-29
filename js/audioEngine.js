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
 * @typedef {Object} PlaybackLimit
 * @property {number} time - Minimum time between triggers (in ms)
 */

/**
 * @typedef {Object} SoundBankEntry
 * @property {string|string[]} src - Single file or array for variations
 * @property {number} [volume] - Base volume (0-1)
 * @property {boolean} [loop] - Whether to loop the sound
 * @property {'random'|'sequence'} [containerType] - Playback container type
 * @property {Randomization} [randomization] - Randomization settings
 * @property {PlaybackLimit} [playbackLimit] - Playback limit settings
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
 * @property {string} highestAttribute - Name of the attribute with the highest value currently
 * @property {number} avgProgressSpeed - in level / cycle
 * @property {number} maxProgressSpeed - in level / cycle
 * @property {number} totalProgressSpeed - in level / cycle
 * @property {number} dangerLevel - 0 --> no danger. 1.0 --> danger == military. >1.0 --> heat
 * @property {number} numberOfEngagedBattles - 0 to 6
 * @property {'NEW'|'PLAYING'|'PAUSED'|'TUTORIAL_PAUSED'|'BOSS_FIGHT_INTRO'|'BOSS_FIGHT'|'DEAD'|'BOSS_DEFEATED'} gameState
 *
 * @property {function(function())} registerListener - allows to add a listener that gets called whenever one or more fields change in an update
 * @property {function()} update - updates the MusicContext with the current game state
 */

// ============================================
// MAIN AUDIO ENGINE API
// ============================================

/**
 * @extends MusicContext
 */
class ProgressStationMusicContext {
    #highestAttribute = attributes.industry.name;
    #avgProgressSpeed = 0;
    #maxProgressSpeed = 0;
    #totalProgressSpeed = 0;
    #dangerLevel = 0;
    #numberOfEngagedBattles = 0;
    #gameState = 'NEW';

    #listeners = [];

    #isDirty = false;
    #changedFields = [];

    constructor() {
    }

    get highestAttribute() {
        return this.#highestAttribute;
    }

    set highestAttribute(value) {
        if (this.#highestAttribute === value) return;

        this.#highestAttribute = value;
        this.#isDirty = true;
        this.#changedFields.push('highestAttribute');
    }

    get avgProgressSpeed() {
        return this.#avgProgressSpeed;
    }

    set avgProgressSpeed(value) {
        if (nearlyEquals(this.#avgProgressSpeed, value, 0.01)) return;

        this.#avgProgressSpeed = value;
        this.#isDirty = true;
        this.#changedFields.push('avgProgressSpeed');
    }

    get maxProgressSpeed() {
        return this.#maxProgressSpeed;
    }

    set maxProgressSpeed(value) {
        if (nearlyEquals(this.#maxProgressSpeed, value, 0.01)) return;

        this.#maxProgressSpeed = value;
        this.#isDirty = true;
        this.#changedFields.push('maxProgressSpeed');
    }

    get totalProgressSpeed() {
        return this.#totalProgressSpeed;
    }

    set totalProgressSpeed(value) {
        if (nearlyEquals(this.#totalProgressSpeed, value, 0.01)) return;

        this.#totalProgressSpeed = value;
        this.#isDirty = true;
        this.#changedFields.push('totalProgressSpeed');
    }

    get dangerLevel() {
        return this.#dangerLevel;
    }

    set dangerLevel(value) {
        if (nearlyEquals(this.#dangerLevel, value, 0.01)) return;

        this.#dangerLevel = value;
        this.#isDirty = true;
        this.#changedFields.push('dangerLevel');
    }

    get numberOfEngagedBattles() {
        return this.#numberOfEngagedBattles;
    }

    set numberOfEngagedBattles(value) {
        if (this.#numberOfEngagedBattles === value) return;

        this.#numberOfEngagedBattles = value;
        this.#isDirty = true;
        this.#changedFields.push('numberOfEngagedBattles');
    }

    get gameState() {
        return this.#gameState;
    }

    set gameState(value) {
        if (this.#gameState === value) return;

        this.#gameState = value;
        this.#isDirty = true;
        this.#changedFields.push('gameState');
    }

    registerListener(callback) {
        this.#listeners.push(callback);
    }

    /**
     * Update the music context based on current game state
     * This function is game-specific and should be called each game tick
     */
    update() {
        let maxValue = -Infinity;
        /** @var {string|null} */
        let highestAttribute = null;
        for (const attributeName in attributes) {
            const attribute = attributes[attributeName];

            if (!attribute.relevantForMusicContext) continue;

            const value = attribute.getValue();
            if (value > maxValue) {
                maxValue = value;
                highestAttribute = attributeName;
            }
        }
        this.highestAttribute = highestAttribute;

        const progressSpeeds = [];

        for (const operationName in moduleOperations) {
            const operation = moduleOperations[operationName];
            if (operation.isActive('inHierarchy')) {
                progressSpeeds.push(operation.getDelta());
            }
        }

        progressSpeeds.push(gridStrength.getDelta());
        progressSpeeds.push(analysisCore.getDelta());

        for (const battleName of gameData.activeEntities.battles) {
            const battle = battles[battleName];
            if (battle.isDone()) continue;

            progressSpeeds.push(battle.getDelta());
        }

        // Calculate statistics
        if (progressSpeeds.length > 0) {
            this.totalProgressSpeed = progressSpeeds.reduce((sum, speed) => sum + speed, 0);
            this.maxProgressSpeed = Math.max(...progressSpeeds);
            this.avgProgressSpeed = this.totalProgressSpeed / progressSpeeds.length;
        } else {
            this.totalProgressSpeed = 0;
            this.maxProgressSpeed = 0;
            this.avgProgressSpeed = 0;
        }

        this.dangerLevel = attributes.danger.getValue() / attributes.military.getValue();
        this.numberOfEngagedBattles = gameData.activeEntities.battles.size;
        this.gameState = gameData.stateName;

        this.finishUpdate();
    }

    finishUpdate() {
        if (!this.#isDirty) return;

        // console.log('MusicContext changed.', this.#changedFields, {
        //     highestAttribute: this.highestAttribute,
        //     avgProgressSpeed: this.avgProgressSpeed,
        //     maxProgressSpeed: this.maxProgressSpeed,
        //     totalProgressSpeed: this.totalProgressSpeed,
        //     dangerLevel: this.dangerLevel,
        //     numberOfEngagedBattles: this.numberOfEngagedBattles,
        //     gameState: this.gameState,
        // });

        this.#listeners.forEach((listener) => {
            listener();
        });

        this.#isDirty = false;
        // Empty array
        this.#changedFields.length = 0;
    }
}

class AudioEngine {
    // ============================================
    // PRIVATE STATIC MEMBERS
    // ============================================

    /** @type {boolean} Track if audio was enabled during this session */
    static #wasAudioEnabled = false;

    /** @type {Object.<string, {name: string, events: Object.<string, {entry: SoundBank, howls: Howl[]}> }>} Loaded sound banks with their Howl instances */
    static #banks = {};

    /** @type {Object.<string, Array>} Recent play history for avoidRepeat */
    static #recentPlays = {};

    /** @type {Object.<string, number>} Sequence counters for 'sequence' container type */
    static #sequenceCounters = {};

    /** @type {Object.<string, number>} Last play timestamps for playback limiting */
    static #lastPlayTimes = {};

    /** @type {MusicContext|null} Current music context */
    static #musicContext = null;

    /** @type {Object.<string, MusicState>} Registered music states */
    static #musicStates = {};

    /** @type {Object.<string, string>} Current active state per state group */
    static #activeStates = {};

    /** @type {Object.<string, {howl: Howl, soundId: number}>} Permanent Howl instances for each layer (never unloaded) */
    static #layerHowls = {};

    /** @type {Object.<string, Object>} Active music layers with their Howl instances */
    static #activeLayers = {};

    // ============================================
    // PUBLIC API
    // ============================================

    /**
     * Initialize the audio system
     * Sets up AudioEngine, loads sound banks, and handles browser autoplay restrictions
     * @returns {void}
     */
    static init() {
        // TODO needs special handling to circumvent browser's audio auto-play blocking
        const savedValueAudioEnabled = gameData.settings.audio.enabled;
        gameData.settings.audio.enabled = false;

        // Connect music context to AudioEngine
        AudioEngine.setMusicContext(musicContext);

        // Set initial volume and mute state
        Howler.mute(!gameData.settings.audio.enabled);
        AudioEngine.setMasterVolume(gameData.settings.audio.masterVolume);
        AudioEngine.setMusicVolume(gameData.settings.audio.musicVolume);
        AudioEngine.setSoundVolume(gameData.settings.audio.soundVolume);

        // Load audio config from game config
        initializeAudio();
        // TODO what's the sense of this?
        this.setState(MusicIds.MAIN_THEME, MusicIds.MAIN_THEME);

        // Show appropriate toast notification based on settings
        if (gameData.settings.audio.toastAnswered) {
            if (savedValueAudioEnabled) {
                // "Welcome back, re-enable audio?"
                const toast = bootstrap.Toast.getOrCreateInstance(Dom.get().byId('reEnableAudioToast'));
                toast.show();
            } // else don't annoy player and devs :)
        } else {
            // "Hello, would you like audio?"
            const toast = bootstrap.Toast.getOrCreateInstance(Dom.get().byId('enableAudioToast'));
            toast.show();
        }
    }

    /**
     * Load a soundbank
     * @param {string} bankName - Name of the bank
     * @param {SoundBank} soundBank - Sound bank definition
     * @returns {void}
     */
    static loadBank(bankName, soundBank) {
        if (AudioEngine.#banks[bankName]) {
            console.warn(`AudioEngine: Bank "${bankName}" is already loaded`);
            return;
        }

        const bankData = {
            name: bankName,
            events: {},
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
                    volume: (entry.volume !== undefined ? entry.volume : 1.0) * gameData.settings.audio.musicVolume,
                    loop: entry.loop || false,
                    pool: entry.pool || 5,
                    sprite: entry.sprite || undefined,
                    preload: true,
                })),
            };
        }

        AudioEngine.#banks[bankName] = bankData;
    }

    /**
     * Trigger an audio event (Wwise-style)
     * @param {AudioEvent} event - The audio event to trigger
     * @param {any} [gameObject] - Optional game object reference
     * @returns {void}
     */
    static postEvent(event, gameObject) {
        // Find the event in loaded banks
        let eventData = null;

        for (const bankName in AudioEngine.#banks) {
            const bank = AudioEngine.#banks[bankName];
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

        // Check playback limit
        if (entry.playbackLimit && isNumber(entry.playbackLimit.time)) {
            const now = performance.now();
            const lastPlayTime = AudioEngine.#lastPlayTimes[event];

            if (isNumber(lastPlayTime) && (now - lastPlayTime) < entry.playbackLimit.time) {
                return; // Skip - minimum re-trigger time not reached
            }

            AudioEngine.#lastPlayTimes[event] = now;
        }

        const howls = eventData.howls;
        const srcArray = Array.isArray(entry.src) ? entry.src : [entry.src];

        // Select which source to play
        const sourceIndex = AudioEngine.#selectNextSource(event, entry, srcArray);
        const howl = howls[sourceIndex];

        // Apply randomization
        const randomization = entry.randomization || {};
        let volume = (entry.volume !== undefined ? entry.volume : 1.0) * gameData.settings.audio.soundVolume;
        let rate = 1.0;
        let delay = 0;

        if (randomization.volume) {
            const volumeDb = randomBetween(
                randomization.volume.min,
                randomization.volume.max,
            );
            volume *= AudioEngine.#dbToLinear(volumeDb);
        }

        if (randomization.pitch) {
            const pitchCents = randomBetween(
                randomization.pitch.min,
                randomization.pitch.max,
            );
            rate = AudioEngine.#centsToRate(pitchCents);
        }

        if (randomization.delay) {
            delay = randomBetween(
                randomization.delay.min,
                randomization.delay.max,
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
     * @param {MusicContext} context - Context object with music parameters
     * @returns {void}
     */
    static setMusicContext(context) {
        AudioEngine.#musicContext = context;

        // Re-evaluate all active music layers
        context.registerListener(AudioEngine.#updateMusicLayers);
    }

    /**
     * Set a music state (Wwise-style)
     * @param {string} stateGroup - State group name
     * @param {string} state - State name
     * @returns {void}
     */
    static setState(stateGroup, state) {
        const previousState = AudioEngine.#activeStates[stateGroup];

        if (previousState === state) {
            return; // Already in this state
        }

        AudioEngine.#activeStates[stateGroup] = state;

        // Stop layers from previous state
        if (previousState && AudioEngine.#musicStates[previousState]) {
            const previousMusicState = AudioEngine.#musicStates[previousState];
            AudioEngine.#stopMusicState(previousMusicState);
        }

        // Start layers from new state
        if (AudioEngine.#musicStates[state]) {
            const musicState = AudioEngine.#musicStates[state];
            AudioEngine.#startMusicState(musicState);
        }
    }

    /**
     * Register a music state with layer logic
     * @param {MusicState} state - Music state definition
     * @returns {void}
     */
    static registerMusicState(state) {
        AudioEngine.#musicStates[state.name] = state;
    }

    /**
     * Unload a soundbank
     * @param {string} bankName - Name of the bank to unload
     * @returns {void}
     */
    static unloadBank(bankName) {
        const bank = AudioEngine.#banks[bankName];

        if (!bank) {
            console.warn(`AudioEngine: Bank "${bankName}" not found`);
            return;
        }

        // Unload all Howl instances
        for (const eventName in bank.events) {
            const eventData = bank.events[eventName];
            eventData.howls.forEach(howl => howl.unload());
        }

        delete AudioEngine.#banks[bankName];
    }

    /**
     * Stop all currently playing sounds
     * @returns {void}
     */
    static stopAll() {
        // Stop all sound effects
        for (const bankName in AudioEngine.#banks) {
            const bank = AudioEngine.#banks[bankName];
            for (const eventName in bank.events) {
                const eventData = bank.events[eventName];
                eventData.howls.forEach(howl => howl.stop());
            }
        }

        // Pause all music layers (don't destroy them)
        for (const layerKey in AudioEngine.#layerHowls) {
            const layer = AudioEngine.#layerHowls[layerKey];
            if (layer.howl) {
                layer.howl.volume(0, layer.soundId);
                layer.howl.pause(layer.soundId);
            }
        }

        AudioEngine.#activeLayers = {};
    }

    /**
     * Get internal state for debugging (minimal exposure)
     * WARNING: This exposes private state - only use for debugging!
     * @returns {Object} Internal references for debugging
     */
    static getDebugState() {
        return {
            banks: AudioEngine.#banks,
            musicStates: AudioEngine.#musicStates,
            activeStates: AudioEngine.#activeStates,
            layerHowls: AudioEngine.#layerHowls,
            activeLayers: AudioEngine.#activeLayers,
        };
    }

    /**
     * @param {number} newValue - Volume value from 0.0 to 1.0
     * @returns {void}
     */
    static setMasterVolume(newValue) {
        // noinspection JSCheckFunctionSignatures
        Howler.volume(AudioEngine.#mapVolumeThreeZone(newValue));
    }

    /**
     * @param {number} newValue
     */
    static setMusicVolume(newValue) {
        const newVolume = AudioEngine.#mapVolumeThreeZone(newValue);
        for (const layerKey in AudioEngine.#activeLayers) {
            const layer = AudioEngine.#activeLayers[layerKey];
            if (layer.howl) {
                // TODO jeez...
                const layerKeyParts = layerKey.split('##');
                const stateName = layerKeyParts[0];
                const layerName = layerKeyParts[1];
                layer.howl.volume(AudioEngine.#musicStates[stateName].layers[layerName].segment.volume * newVolume);
            }
        }
    }

    /**
     * @param {number} newValue
     */
    static setSoundVolume(newValue) {
        const newVolume = AudioEngine.#mapVolumeThreeZone(newValue);
        for (const bankName in AudioEngine.#banks) {
            const bank = AudioEngine.#banks[bankName];
            for (const eventName in bank.events) {
                const eventData = bank.events[eventName];
                eventData.howls.forEach(howl => howl.volume(eventData.entry.volume * newVolume) );
            }
        }
    }

    /**
     * Toggle audio enabled/disabled or force a specific state
     * @param {boolean} [force] - Optional: force audio to this state
     * @returns {void}
     */
    static toggleEnabled(force = undefined) {
        if (force === undefined) {
            gameData.settings.audio.enabled = !gameData.settings.audio.enabled;
        } else {
            gameData.settings.audio.enabled = force;
            Dom.get().byId('audioEnabledSwitch').checked = force;
        }
        Howler.mute(!gameData.settings.audio.enabled);

        AudioEngine.#updateMusicLayers();

        gameData.save();
    }

    /**
     * Toggle background audio enabled/disabled or force a specific state
     * @param {boolean} [force] - Optional: force background audio to this state
     * @returns {void}
     */
    static toggleBackgroundAudio(force = undefined) {
        if (force === undefined) {
            gameData.settings.audio.enableBackgroundAudio = !gameData.settings.audio.enableBackgroundAudio;
        } else {
            gameData.settings.audio.enableBackgroundAudio = force;
            Dom.get().byId('audioBackgroundAudioEnabledSwitch').checked = force;
        }

        // TODO enable / disable background audio

        gameData.save();
    }

    // ============================================
    // PRIVATE METHODS
    // ============================================

    /**
     * Convert decibels to linear volume (0-1)
     * @param {number} db - Decibel value
     * @returns {number} Linear volume
     */
    static #dbToLinear(db) {
        return Math.pow(10, db / 20);
    }

    /**
     * Convert cents to playback rate multiplier
     * @param {number} cents - Pitch shift in cents
     * @returns {number} Rate multiplier
     */
    static #centsToRate(cents) {
        return Math.pow(2, cents / 1200);
    }

    /**
     * Select next source index based on container type
     * @param {string} event - Event name
     * @param {SoundBankEntry} entry - Sound bank entry
     * @param {string[]} srcArray - Array of source files
     * @returns {number} Selected index
     */
    static #selectNextSource(event, entry, srcArray) {
        const containerType = entry.containerType || 'random';
        const randomization = entry.randomization || {};

        if (srcArray.length === 1) {
            return 0;
        }

        if (containerType === 'sequence') {
            // Cycle through sources in order
            if (!isNumber(AudioEngine.#sequenceCounters[event])) {
                AudioEngine.#sequenceCounters[event] = 0;
            }
            const index = AudioEngine.#sequenceCounters[event];
            AudioEngine.#sequenceCounters[event] = (index + 1) % srcArray.length;
            return index;
        }

        if (containerType === 'random') {
            let selectedIndex;

            // Use weighted random if weights are provided
            if (randomization.weights && randomization.weights.length === srcArray.length) {
                selectedIndex = weightedRandom(randomization.weights);
            } else {
                selectedIndex = Math.floor(Math.random() * srcArray.length);
            }

            // Handle avoidRepeat
            if (isNumber(randomization.avoidRepeat) && randomization.avoidRepeat > 0) {
                if (!AudioEngine.#recentPlays[event]) {
                    AudioEngine.#recentPlays[event] = [];
                }

                const recentPlays = AudioEngine.#recentPlays[event];
                const maxAttempts = 50;
                let attempts = 0;

                while (recentPlays.includes(selectedIndex) && attempts < maxAttempts) {
                    if (randomization.weights && randomization.weights.length === srcArray.length) {
                        selectedIndex = weightedRandom(randomization.weights);
                    } else {
                        selectedIndex = randomInt(srcArray.length);
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

    /**
     * Maps a linear volume value (0-1) to a perceptually balanced curve using three zones
     * @param {number} rawValue - Linear volume value from 0.0 to 1.0
     * @returns {number} Mapped volume value from 0.0 to 1.0
     */
    static #mapVolumeThreeZone(rawValue) {
        // Very, very quite --> just mute
        if (rawValue <= 0.001) {
            return 0;
        }

        rawValue = clamp(rawValue, 0.0, 1.0);

        const ZONE1_END = 0.2;
        const ZONE2_END = 0.8;

        // Output values at zone boundaries to ensure smooth transitions
        const ZONE1_OUTPUT = 0.05;  // Volume at 10% slider (~-26dB, rather quiet)
        const ZONE2_OUTPUT = 0.7;   // Volume at 90% slider (~-3dB, nearly full)

        // ZONE 1: 0-10% - Exponential curve for fine control at low volumes
        if (rawValue <= ZONE1_END) {
            const normalized = rawValue / ZONE1_END;
            // Quadratic curve (x^2) scaled to end at ZONE1_OUTPUT
            return Math.pow(normalized, 2) * ZONE1_OUTPUT;

        // ZONE 2: 10-90% - Logarithmic/dB curve for natural perception
        } else if (rawValue <= ZONE2_END) {
            // Normalized position within this zone (0-1)
            const normalized = (rawValue - ZONE1_END) / (ZONE2_END - ZONE1_END);

            // Convert to dB range
            const minDb = 20 * Math.log10(ZONE1_OUTPUT);
            const maxDb = 20 * Math.log10(ZONE2_OUTPUT);

            // Interpolate in dB space
            const db = minDb + (maxDb - minDb) * normalized;

            // Convert back to linear amplitude
            return AudioEngine.#dbToLinear(db);

        // ZONE 3: 90-100% - Linear for precise control near maximum
        } else {
            // Normalized position within this zone (0-1)
            const normalized = (rawValue - ZONE2_END) / (1 - ZONE2_END);

            // Linear interpolation from ZONE2_OUTPUT to 1.0
            return ZONE2_OUTPUT + (1.0 - ZONE2_OUTPUT) * normalized;
        }
    }

    /**
     * Update music layers based on current context
     */
    static #updateMusicLayers() {
        for (const stateName in AudioEngine.#musicStates) {
            // Only update layers for active states
            if (AudioEngine.#activeStates[stateName] !== stateName) continue;

            const musicState = AudioEngine.#musicStates[stateName];

            for (const layerName in musicState.layers) {
                const layer = musicState.layers[layerName];
                const layerKey = AudioEngine.#getLayerKey(stateName, layerName);
                const shouldBeActive = layer.conditions(AudioEngine.#musicContext);
                const isActive = AudioEngine.#activeLayers[layerKey] !== undefined;

                if (shouldBeActive && !isActive) {
                    AudioEngine.#startLayer(stateName, layerName, layer);
                } else if (!shouldBeActive && isActive) {
                    AudioEngine.#stopLayer(stateName, layerName, layer);
                }
            }
        }
    }

    /**
     * Start a music state (all layers that meet conditions)
     *
     * @param {MusicState} musicState
     */
    static #startMusicState(musicState) {
        for (const layerName in musicState.layers) {
            const layer = musicState.layers[layerName];
            if (layer.conditions(AudioEngine.#musicContext)) {
                AudioEngine.#startLayer(musicState.name, layerName, layer);
            }
        }
    }

    /**
     * Stop a music state (all its layers)
     *
     * @param {MusicState} musicState
     */
    static #stopMusicState(musicState) {
        for (const layerName in musicState.layers) {
            const layer = musicState.layers[layerName];
            AudioEngine.#stopLayer(musicState.name, layerName, layer);
        }
    }

    /**
     * Start a music layer
     *
     * @param {string} stateName
     * @param {string} layerName
     * @param {MusicLayer} layer
     */
    static #startLayer(stateName, layerName, layer) {
        const layerKey = AudioEngine.#getLayerKey(stateName, layerName);
        const segment = layer.segment;
        const targetVolume = segment.volume * gameData.settings.audio.musicVolume;

        let layerHowl = AudioEngine.#layerHowls[layerKey];
        let soundId;

        // Check if Howl already exists (reuse instead of recreate)
        if (layerHowl) {
            soundId = layerHowl.soundId;

            // Resume if paused
            if (!layerHowl.howl.playing(soundId)) {
                layerHowl.howl.play(soundId);
            }
        } else {
            // Create Howl for this layer (first time only)
            const howl = new Howl({
                src: [segment.src],
                volume: 0, // Start at 0, will fade in
                loop: segment.loop,
                preload: true,
            });

            soundId = howl.play();

            // Store permanently in layerHowls
            layerHowl = {
                howl: howl,
                soundId: soundId,
            };
            AudioEngine.#layerHowls[layerKey] = layerHowl;
        }

        // Fade in if specified
        if (isNumber(segment.fadeInTime) && segment.fadeInTime > 0) {
            layerHowl.howl.volume(0, soundId);
            layerHowl.howl.fade(0, targetVolume, segment.fadeInTime, soundId);
        } else {
            layerHowl.howl.volume(targetVolume, soundId);
        }

        // Track that this layer is logically active
        AudioEngine.#activeLayers[layerKey] = layerHowl;
    }

    static #getLayerKey(stateName, layerName) {
        return `${stateName}##${layerName}`;
    }

    /**
     * Stop a music layer
     *
     * @param {string} stateName
     * @param {string} layerName
     * @param {MusicLayer} layer
     */
    static #stopLayer(stateName, layerName, layer) {
        const layerKey = AudioEngine.#getLayerKey(stateName, layerName);
        const activeLayer = AudioEngine.#activeLayers[layerKey];

        if (!activeLayer) {
            return;
        }

        const segment = layer.segment;
        const soundId = activeLayer.soundId;

        // Fade out if specified, then pause (NOT stop/unload)
        if (isNumber(segment.fadeOutTime) && segment.fadeOutTime > 0) {
            activeLayer.howl.fade(
                segment.volume * gameData.settings.audio.musicVolume,
                0,
                segment.fadeOutTime,
                soundId,
            );

            // Pause after fade completes (using Howl's onfade callback)
            activeLayer.howl.once('fade', () => {
                activeLayer.howl.pause(soundId);
            }, soundId);
        } else {
            // Immediately set volume to 0 and pause
            activeLayer.howl.volume(0, soundId);
            activeLayer.howl.pause(soundId);
        }

        // Remove from active tracking (but Howl stays in #layerHowls for reuse)
        delete AudioEngine.#activeLayers[layerKey];
    }
}

// ============================================
// GLOBAL INSTANCES
// ============================================

/** @type {MusicContext} Global music context instance */
const musicContext = new ProgressStationMusicContext();
