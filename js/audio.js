'use strict';

const audioEvents = {};
/**
 * ... during this session.
 */
let wasAudioEnabled = false;

const musicContext = new MusicContext();

/**
 * Manages trigger intervals to prevent audio spam by tracking the last trigger time
 * and enforcing minimum intervals between triggers for named events.
 */
class TriggerIntervalMap {
    constructor() {
        this.lastTriggeredMap = new Map();
    }

    /**
     * Check if a trigger can be activated based on its interval
     * @param {string} triggerName - Name of the trigger to check
     * @return {boolean} True if the trigger can be activated
     */
    canTrigger(triggerName) {
        const currentTime = Date.now();
        const soundData = this.lastTriggeredMap.get(triggerName);

        return isUndefined(soundData) ||
            (currentTime - soundData.lastTriggered) >= soundData.interval;
    }

    /**
     * Attempt to trigger a named event with a specified interval
     * @param {string} triggerName - Name of the trigger
     * @param {number} interval - Minimum interval in milliseconds between triggers
     * @return {boolean} True if the trigger was activated, false if still in cooldown
     */
    trigger(triggerName, interval) {
        if (!this.canTrigger(triggerName)) {
            return false;
        }
        this.lastTriggeredMap.set(triggerName, {lastTriggered: Date.now(), interval: interval});
        return true;
    }
}



/**
 * @param {boolean} force
 */
function toggleAudioEnabled(force = undefined) {
    if (force === undefined) {
        gameData.settings.audio.enabled = !gameData.settings.audio.enabled;
    } else {
        gameData.settings.audio.enabled = force;
        Dom.get().byId('audioEnabledSwitch').checked = force;
    }
    Howler.mute(!gameData.settings.audio.enabled);
    if (!wasAudioEnabled && gameData.settings.audio.enabled) {
        audioEvents['mainTheme'].play();
        wasAudioEnabled = true;
    }
    gameData.save();
}

/**
 * @param {boolean} force
 */
function toggleAudioBackgroundAudioEnabled(force = undefined) {
    if (force === undefined) {
        gameData.settings.audio.enableBackgroundAudio = !gameData.settings.audio.enableBackgroundAudio;
    } else {
        gameData.settings.audio.enableBackgroundAudio = force;
        Dom.get().byId('audioBackgroundAudioEnabledSwitch').checked = force;
    }
    // TODO enable / disable background audio
    gameData.save();
}

/**
 *
 * @param rawValue {number} 0.0 to 1.0
 * @return {number} 0.0 to 1.0, mapped in three zones with different curves
 */
function mapVolumeThreeZone(rawValue) {
    rawValue = Math.max(0, Math.min(1, rawValue));

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
    }

    // ZONE 2: 10-90% - Logarithmic/dB curve for natural perception
    else if (rawValue <= ZONE2_END) {
        // Normalized position within this zone (0-1)
        const normalized = (rawValue - ZONE1_END) / (ZONE2_END - ZONE1_END);

        // Convert to dB range
        const minDb = 20 * Math.log10(ZONE1_OUTPUT);
        const maxDb = 20 * Math.log10(ZONE2_OUTPUT);

        // Interpolate in dB space
        const db = minDb + (maxDb - minDb) * normalized;

        // Convert back to linear amplitude
        return Math.pow(10, db / 20);
    }

    // ZONE 3: 90-100% - Linear for precise control near maximum
    else {
        // Normalized position within this zone (0-1)
        const normalized = (rawValue - ZONE2_END) / (1 - ZONE2_END);

        // Linear interpolation from ZONE2_OUTPUT to 1.0
        return ZONE2_OUTPUT + (1.0 - ZONE2_OUTPUT) * normalized;
    }
}

function setAudioVolume(newValue) {
    // noinspection JSCheckFunctionSignatures
    Howler.volume(mapVolumeThreeZone(newValue));
}

function updateMusicContext() {
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
    musicContext.highestAttribute = highestAttribute;

    // Collect progress speeds from all active tasks
    const progressSpeeds = [];

    // Add progress speeds from all active operations (in hierarchy)
    for (const operationName in moduleOperations) {
        const operation = moduleOperations[operationName];
        if (operation.isActive('inHierarchy') && operation.isProgressing()) {
            progressSpeeds.push(operation.getDelta());
        }
    }

    // Add progress speed from gridStrength
    if (gridStrength.isProgressing()) {
        progressSpeeds.push(gridStrength.getDelta());
    }

    // Add progress speeds from all active battles
    for (const battleName of gameData.activeEntities.battles) {
        const battle = battles[battleName];
        if (battle.isProgressing()) {
            progressSpeeds.push(battle.getDelta());
        }
    }

    // Calculate statistics
    if (progressSpeeds.length > 0) {
        musicContext.totalProgressSpeed = progressSpeeds.reduce((sum, speed) => sum + speed, 0);
        musicContext.maxProgressSpeed = Math.max(...progressSpeeds);
        musicContext.avgProgressSpeed = musicContext.totalProgressSpeed / progressSpeeds.length;
    } else {
        musicContext.totalProgressSpeed = 0;
        musicContext.maxProgressSpeed = 0;
        musicContext.avgProgressSpeed = 0;
    }

    musicContext.dangerLevel = attributes.danger.getValue() / attributes.military.getValue();
    musicContext.numberOfEngagedBattles = gameData.activeEntities.battles.size;
    musicContext.gameState = gameData.stateName;

    musicContext.finishUpdate();
}

function initAudio() {
    // TODO needs special handling to circumvent brower's audio auto-play blocking
    const savedValueAudioEnabled = gameData.settings.audio.enabled;
    gameData.settings.audio.enabled = false;

    AudioEngine.SetMusicContext(musicContext);

    Howler.mute(gameData.settings.audio.enabled);
    setAudioVolume(gameData.settings.audio.masterVolume);

    audioEvents['mainTheme'] = new Howl({
        src: ['./audio/main-theme.mp3'],
        html5: true,
        preload: 'metadata',
        loop: true,
        // onplayerror: function() {
        //     audioEvents['mainTheme'].once('unlock', function() {
        //         audioEvents['mainTheme'].play();
        //     });
        // },
        // onunlock: function () {
        //     console.log('Unlocked', this);
        //     audioEvents['mainTheme'].play();
        // }
    });

    // if (gameData.settings.audio.enabled) {
    //     audioEvents['mainTheme'].play();
    //     wasAudioEnabled = true;
    // }

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
