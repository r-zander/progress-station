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

function initAudio() {
    // TODO needs special handling to circumvent brower's audio auto-play blocking
    gameData.settings.audio.enabled = false;

    Howler.mute(gameData.settings.audio.enabled);
    Howler.volume(gameData.settings.audio.masterVolume);

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
