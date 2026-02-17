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
 * @property {number} medianProgressSpeed - in level / cycle
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
    #medianProgressSpeed = 0;
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
        if (nearlyEquals(this.#avgProgressSpeed, value, 0.001)) return;

        this.#avgProgressSpeed = value;
        this.#isDirty = true;
        this.#changedFields.push('avgProgressSpeed');
    }

    get medianProgressSpeed() {
        return this.#medianProgressSpeed;
    }

    set medianProgressSpeed(value) {
        if (nearlyEquals(this.#medianProgressSpeed, value, 0.001)) return;

        this.#medianProgressSpeed = value;
        this.#isDirty = true;
        this.#changedFields.push('medianProgressSpeed');
    }

    get maxProgressSpeed() {
        return this.#maxProgressSpeed;
    }

    set maxProgressSpeed(value) {
        if (nearlyEquals(this.#maxProgressSpeed, value, 0.001)) return;

        this.#maxProgressSpeed = value;
        this.#isDirty = true;
        this.#changedFields.push('maxProgressSpeed');
    }

    get totalProgressSpeed() {
        return this.#totalProgressSpeed;
    }

    set totalProgressSpeed(value) {
        if (nearlyEquals(this.#totalProgressSpeed, value, 0.001)) return;

        this.#totalProgressSpeed = value;
        this.#isDirty = true;
        this.#changedFields.push('totalProgressSpeed');
    }

    get dangerLevel() {
        return this.#dangerLevel;
    }

    set dangerLevel(value) {
        if (nearlyEquals(this.#dangerLevel, value, 0.001)) return;

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


        const gridStrengthDelta = gridStrength.getDelta();
        if (gridStrengthDelta > 0) {
            progressSpeeds.push(gridStrengthDelta);
        }
        const analysisCoreDelta = analysisCore.getDelta();
        if (analysisCoreDelta) {
            progressSpeeds.push(analysisCoreDelta);
        }

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

            // Calculate median
            const sortedSpeeds = [...progressSpeeds].sort((a, b) => a - b);
            const midpoint = Math.floor(sortedSpeeds.length / 2);
            if (sortedSpeeds.length % 2 === 0) {
                // Even number of elements: average the two middle values
                this.medianProgressSpeed = (sortedSpeeds[midpoint - 1] + sortedSpeeds[midpoint]) / 2;
            } else {
                // Odd number of elements: take the middle value
                this.medianProgressSpeed = sortedSpeeds[midpoint];
            }
        } else {
            this.totalProgressSpeed = 0;
            this.maxProgressSpeed = 0;
            this.avgProgressSpeed = 0;
            this.medianProgressSpeed = 0;
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

    /** @type {Set<string>} States currently being preloaded — #updateMusicLayers must not touch these */
    static #statesPendingStart = new Set();

    /** @type {Object.<string, 'unloaded'|'loading'|'loaded'>} Loading state per music state */
    static #musicStateLoadingStatus = {};

    /** @type {Object.<string, Promise<void>>} Active loading promises per music state */
    static #musicStateLoadingPromises = {};

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
        AudioEngine.updateHowlerMute();
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

        document.addEventListener("visibilitychange", () => {
            AudioEngine.updateHowlerMute();
        });
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

        // console.log('[Audio Engine] Play event:', event);

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

            // If the previous state was still pending start, clean up its guard
            if (AudioEngine.#statesPendingStart.has(previousState)) {
                console.warn(`AudioEngine: State '${previousState}' was still pending start when superseded by '${state}'.`);
                AudioEngine.#statesPendingStart.delete(previousState);
            }
        }

        // Start layers from new state (with preloading)
        if (AudioEngine.#musicStates[state]) {
            const musicState = AudioEngine.#musicStates[state];

            // Guard: prevent #updateMusicLayers from touching this state during preload
            AudioEngine.#statesPendingStart.add(state);

            AudioEngine.#preloadMusicState(musicState)
                .then(() => {
                    // Verify we're still in this state (user might have switched)
                    if (AudioEngine.#activeStates[stateGroup] === state) {
                        AudioEngine.#startMusicStateSynchronized(musicState);
                    } else {
                        AudioEngine.#statesPendingStart.delete(state);
                    }
                })
                .catch((error) => {
                    console.error(`AudioEngine: Failed to preload/start music state ${state}:`, error);
                    // Attempt to start anyway with whatever loaded
                    if (AudioEngine.#activeStates[stateGroup] === state) {
                        AudioEngine.#startMusicStateSynchronized(musicState);
                    } else {
                        AudioEngine.#statesPendingStart.delete(state);
                    }
                });
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

        AudioEngine.updateHowlerMute();
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

        AudioEngine.updateHowlerMute();

        gameData.save();
    }

    static updateHowlerMute() {
        if (document.hidden && !gameData.settings.audio.enableBackgroundAudio) {
            Howler.mute(true);
            return;
        }

        Howler.mute(!gameData.settings.audio.enabled);
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

            // Skip states that are still being preloaded — they'll be started by #startMusicStateSynchronized
            if (AudioEngine.#statesPendingStart.has(stateName)) continue;

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
     * Stop a music state (all its layers).
     * Fades out active layers, then stops Howl playback and resets soundIds
     * so layers restart from 0:00 when the state is re-entered.
     *
     * @param {MusicState} musicState
     */
    static #stopMusicState(musicState) {
        const stateName = musicState.name;

        for (const layerName in musicState.layers) {
            const layer = musicState.layers[layerName];
            const layerKey = AudioEngine.#getLayerKey(stateName, layerName);

            // Remove from active tracking
            delete AudioEngine.#activeLayers[layerKey];

            const layerHowl = AudioEngine.#layerHowls[layerKey];
            if (!layerHowl || layerHowl.soundId === null) continue;

            const segment = layer.segment;
            const soundId = layerHowl.soundId;

            console.assert(
                isNumber(soundId),
                `AudioEngine: #stopMusicState found non-numeric soundId for ${layerKey}: ${soundId}`
            );

            // Reset soundId immediately — prevents any other code path from using the stale id
            layerHowl.soundId = null;

            if (isNumber(segment.fadeOutTime) && segment.fadeOutTime > 0) {
                // Fade out, then stop after fade completes
                layerHowl.howl.fade(layerHowl.howl.volume(soundId), 0, segment.fadeOutTime, soundId);
                const capturedHowl = layerHowl.howl;
                setTimeout(() => {
                    capturedHowl.stop(soundId);
                }, segment.fadeOutTime + 50);
            } else {
                layerHowl.howl.stop(soundId);
            }
        }

        // Verify: no active layers should remain for this state
        for (const layerName in musicState.layers) {
            const layerKey = AudioEngine.#getLayerKey(stateName, layerName);
            console.assert(
                AudioEngine.#activeLayers[layerKey] === undefined,
                `AudioEngine: Active layer ${layerKey} still present after #stopMusicState`
            );
            const layerHowl = AudioEngine.#layerHowls[layerKey];
            if (layerHowl) {
                console.assert(
                    layerHowl.soundId === null,
                    `AudioEngine: soundId for ${layerKey} not null after #stopMusicState: ${layerHowl.soundId}`
                );
            }
        }
    }

    /**
     * Fade in a music layer.
     * The layer must already be playing (started by #startMusicStateSynchronized).
     * This method only handles volume — it never calls play().
     *
     * @param {string} stateName
     * @param {string} layerName
     * @param {MusicLayer} layer
     */
    static #startLayer(stateName, layerName, layer) {
        const layerKey = AudioEngine.#getLayerKey(stateName, layerName);
        const layerHowl = AudioEngine.#layerHowls[layerKey];

        // Layer must already be playing (started by #startMusicStateSynchronized)
        if (!layerHowl || layerHowl.soundId === null) {
            console.assert(false,
                `AudioEngine: #startLayer called for ${layerKey} but layer is not playing (soundId is null). ` +
                `This means #startMusicStateSynchronized hasn't run yet — possible race condition.`
            );
            return;
        }

        console.assert(
            !AudioEngine.#statesPendingStart.has(stateName),
            `AudioEngine: #startLayer called for ${layerKey} while state '${stateName}' is still pending start. ` +
            `#updateMusicLayers should have skipped this state.`
        );

        const segment = layer.segment;
        const targetVolume = segment.volume * gameData.settings.audio.musicVolume;
        const soundId = layerHowl.soundId;

        // Fade in if specified
        if (isNumber(segment.fadeInTime) && segment.fadeInTime > 0) {
            layerHowl.howl.fade(layerHowl.howl.volume(soundId), targetVolume, segment.fadeInTime, soundId);
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

        console.assert(
            soundId !== null,
            `AudioEngine: #stopLayer called for ${layerKey} but soundId is null. Layer is in #activeLayers but has no valid sound instance.`
        );

        // Fade out if specified
        if (isNumber(segment.fadeOutTime) && segment.fadeOutTime > 0) {
            activeLayer.howl.fade(
                activeLayer.howl.volume(soundId),
                0,
                segment.fadeOutTime,
                soundId,
            );
        } else {
            // Immediately set volume to 0
            activeLayer.howl.volume(0, soundId);
        }

        // Remove from active tracking (but Howl stays in #layerHowls for reuse)
        delete AudioEngine.#activeLayers[layerKey];
    }

    /**
     * Preload all layers for a music state
     * Creates Howl instances and waits for all to finish loading
     *
     * @param {MusicState} musicState - The music state to preload
     * @returns {Promise<void>} Resolves when all layers are loaded
     */
    static #preloadMusicState(musicState) {
        const stateName = musicState.name;

        // Check if already loaded or loading
        const status = AudioEngine.#musicStateLoadingStatus[stateName];
        if (status === 'loaded') {
            return Promise.resolve(); // Already loaded
        }
        if (status === 'loading') {
            return AudioEngine.#musicStateLoadingPromises[stateName]; // Return existing promise
        }

        // Mark as loading
        AudioEngine.#musicStateLoadingStatus[stateName] = 'loading';

        // Create array of promises for each layer
        const loadPromises = [];

        for (const layerName in musicState.layers) {
            const layer = musicState.layers[layerName];
            const layerKey = AudioEngine.#getLayerKey(stateName, layerName);

            // Skip if this layer's Howl already exists
            if (AudioEngine.#layerHowls[layerKey]) {
                continue;
            }

            // Create promise for this layer's loading
            const layerPromise = new Promise((resolve, reject) => {
                const segment = layer.segment;

                const howl = new Howl({
                    src: [segment.src],
                    volume: 0, // Start at 0, will be adjusted when layer activates
                    loop: segment.loop,
                    preload: true,
                });

                // Listen for load completion
                howl.once('load', () => {
                    resolve();
                });

                // Listen for load errors
                howl.once('loaderror', (soundId, error) => {
                    console.error(`Failed to load layer ${layerKey}:`, error);
                    reject(new Error(`Layer ${layerKey} failed to load: ${error}`));
                });

                // Store the Howl immediately (before loading completes)
                // This prevents duplicate creation if preload called multiple times
                AudioEngine.#layerHowls[layerKey] = {
                    howl: howl,
                    soundId: null, // Will be set when playback starts
                };
            });

            loadPromises.push(layerPromise);
        }

        // Wait for all layers to load
        const allLoadedPromise = Promise.all(loadPromises)
            .then(() => {
                AudioEngine.#musicStateLoadingStatus[stateName] = 'loaded';
                console.log(`AudioEngine: All layers loaded for music state: ${stateName}`);
            })
            .catch((error) => {
                // Even if some layers failed, mark as loaded so we can try to play what we have
                AudioEngine.#musicStateLoadingStatus[stateName] = 'loaded';
                console.error(`AudioEngine: Error loading music state ${stateName}:`, error);
                // Don't re-throw - allow partial playback
            });

        AudioEngine.#musicStateLoadingPromises[stateName] = allLoadedPromise;
        return allLoadedPromise;
    }

    /**
     * Start all layers of a music state synchronously.
     * All layers begin playback at the exact same moment (at 0 volume),
     * then conditions are evaluated to fade in appropriate layers.
     *
     * This is the ONLY code path that should call howl.play() for music layers.
     *
     * @param {MusicState} musicState - The music state to start
     */
    static #startMusicStateSynchronized(musicState) {
        const stateName = musicState.name;

        console.assert(
            AudioEngine.#statesPendingStart.has(stateName),
            `AudioEngine: #startMusicStateSynchronized called for '${stateName}' but it's not in #statesPendingStart. This means #updateMusicLayers could have raced with us.`
        );

        // Step 1: Stop any stale instances (edge case: #stopMusicState fade-cleanup hasn't finished yet)
        for (const layerName in musicState.layers) {
            const layerKey = AudioEngine.#getLayerKey(stateName, layerName);
            const layerHowl = AudioEngine.#layerHowls[layerKey];
            if (!layerHowl || !layerHowl.howl) continue;

            if (layerHowl.soundId !== null) {
                console.warn(`AudioEngine: Stale soundId found for ${layerKey} during synchronized start — stopping it.`);
                layerHowl.howl.stop(layerHowl.soundId);
                layerHowl.soundId = null;
            }
        }

        // Step 2: Start ALL layers at 0 volume simultaneously
        const startedSoundIds = [];
        for (const layerName in musicState.layers) {
            const layerKey = AudioEngine.#getLayerKey(stateName, layerName);
            const layerHowl = AudioEngine.#layerHowls[layerKey];

            if (!layerHowl || !layerHowl.howl) {
                console.warn(`AudioEngine: Layer ${layerKey} not loaded, skipping`);
                continue;
            }

            console.assert(
                layerHowl.soundId === null,
                `AudioEngine: soundId for ${layerKey} should be null before play(), but is ${layerHowl.soundId}. Step 1 should have cleaned this up.`
            );

            layerHowl.soundId = layerHowl.howl.play();
            layerHowl.howl.volume(0, layerHowl.soundId);

            console.assert(
                isNumber(layerHowl.soundId),
                `AudioEngine: play() for ${layerKey} did not return a valid soundId: ${layerHowl.soundId}`
            );

            startedSoundIds.push({ layerKey, soundId: layerHowl.soundId });
        }

        // Verify no duplicate soundIds (would mean Howler reused an id — should never happen)
        const ids = startedSoundIds.map(e => e.soundId);
        console.assert(
            ids.length === new Set(ids).size,
            `AudioEngine: Duplicate soundIds detected after synchronized start: ${JSON.stringify(startedSoundIds)}`
        );

        // Step 3: Allow #updateMusicLayers to manage this state from now on
        AudioEngine.#statesPendingStart.delete(stateName);

        // Step 4: Evaluate conditions and fade in active layers
        AudioEngine.#updateMusicLayers();
    }
}

// ============================================
// GLOBAL INSTANCES
// ============================================

/** @type {MusicContext} Global music context instance */
const musicContext = new ProgressStationMusicContext();
