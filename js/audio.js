const audioEvents = {};
/**
 * ... during this session.
 */
let wasAudioEnabled = false;

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

function initAudio() {
    // TODO needs special handling to circumvent brower's audio auto-play blocking
    gameData.settings.audio.enabled = false;

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


    // Potentially show "Enable Audio?" toast
    // if (gameData.settings.audio.toastAnswered === false) {
        const toast = bootstrap.Toast.getOrCreateInstance(Dom.get().byId('enableAudioToast'));
        toast.show();
    // }
}
