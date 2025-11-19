'use strict';

/**
 *
 * @param {MouseEvent} event
 */
function showCredits(event) {
    event.preventDefault();
    setTab('settings');
    Dom.get().byId('credits').scrollIntoView(true);
}

function createLinkBehavior() {
    Dom.get().allBySelector('a[href="#credits"]').forEach(linkElement => {
        linkElement.addEventListener('click', showCredits);
    });
}


/**
 * @param {string} toastId
 */
function disableAudioFromToast(toastId) {
    gameData.settings.audio.toastAnswered = true;
    AudioEngine.toggleEnabled(false);
    const toast = bootstrap.Toast.getOrCreateInstance(Dom.get().byId(toastId));
    toast.hide();
}

/**
 * @param {string} toastId
 */
function enableAudioFromToast(toastId) {
    gameData.settings.audio.toastAnswered = true;
    AudioEngine.toggleEnabled(true);
    const toast = bootstrap.Toast.getOrCreateInstance(Dom.get().byId(toastId));
    toast.hide();
}

/**
 * @param {boolean} force
 */
function toggleVfxFollowProgressBars(force = undefined) {
    if (force === undefined) {
        gameData.settings.vfx.followProgressBars = !gameData.settings.vfx.followProgressBars;
    } else {
        gameData.settings.vfx.followProgressBars = force;
    }
    VFX.followProgressBars(gameData.settings.vfx.followProgressBars);
    gameData.save();
}

/**
 * @param {boolean} force
 */
function toggleVfxSplashOnLevelUp(force = undefined) {
    if (force === undefined) {
        gameData.settings.vfx.splashOnLevelUp = !gameData.settings.vfx.splashOnLevelUp;
    } else {
        gameData.settings.vfx.splashOnLevelUp = force;
    }
    gameData.save();
}

/**
 * @param {boolean} force
 */
function toggleVfxFlashOnLevelUp(force = undefined) {
    if (force === undefined) {
        gameData.settings.vfx.flashOnLevelUp = !gameData.settings.vfx.flashOnLevelUp;
    } else {
        gameData.settings.vfx.flashOnLevelUp = force;
    }
    gameData.save();
}

/**
 * @param {boolean} force
 */
function toggleLightDarkMode(force = undefined) {
    if (force === undefined) {
        gameData.settings.darkMode = !gameData.settings.darkMode;
    } else {
        gameData.settings.darkMode = force;
    }
    document.documentElement.dataset['bsTheme'] = gameData.settings.darkMode ? 'dark' : 'light';
    gameData.save();
}

/**
 * @param {boolean} force
 */
function toggleSciFiMode(force = undefined) {
    const body = document.getElementById('body');
    gameData.settings.sciFiMode = body.classList.toggle('sci-fi', force);
    gameData.save();
}

function setBackground(background) {
    const body = document.getElementById('body');
    body.classList.forEach((cssClass, index, classList) => {
        if (cssClass.startsWith('background-')) {
            classList.remove(cssClass);
        }
    });

    body.classList.add('background-' + background);
    document.querySelector(`.background-${background} > input[type="radio"]`).checked = true;
    gameData.settings.background = background;
    gameData.save();
}

/**
 * Sets up a volume slider with its output display and change handler.
 * @param {string} rangeId - The ID of the range input element
 * @param {string} outputId - The ID of the output display element
 * @param {function(): number} getValue - Getter for the current volume value
 * @param {function(number): void} setValue - Setter called when volume changes
 */
function setupVolumeSlider(rangeId, outputId, getValue, setValue) {
    const rangeInput = Dom.get().byId(rangeId);
    const rangeOutput = Dom.get().byId(outputId);

    const currentValue = getValue();
    rangeInput.value = currentValue;
    rangeOutput.textContent = (currentValue * 100).toFixed(0) + '%';

    rangeInput.addEventListener('input', function() {
        const newValue = parseFloat(this.value);
        setValue(newValue);
        rangeOutput.textContent = (newValue * 100).toFixed(0) + '%';
        gameData.save();
    });
}

// const settings = {
//     vfx: {
//         followProgressBars: new Observable(gameData.settings.vfx.followProgressBars),
//         splashOnLevelUp: new Observable(gameData.settings.vfx.splashOnLevelUp),
//         flashOnLevelUp: new Observable(gameData.settings.vfx.flashOnLevelUp),
//     },
//     audio: {
//         enabled: new ObservableProperty(
//             () => gameData.settings.audio.enabled,
//             (value) => { gameData.settings.audio.enabled = value;},
//             JsTypes.Boolean,
//         ),
//         toastAnswered: new Observable(gameData.settings.audio.toastAnswered),
//         masterVolume: new Observable(gameData.settings.audio.masterVolume),
//         enableBackgroundAudio: new Observable(gameData.settings.audio.enableBackgroundAudio),
//         // musicVolume: 1.0, new Observable(gameData.settings.audio.musicVolume),
//     }
// };


function initSettings() {
    const background = gameData.settings.background;
    if (isString(background)) {
        setBackground(background);
    }

    if (isBoolean(gameData.settings.darkMode)) {
        toggleLightDarkMode(gameData.settings.darkMode);
    }
    if (isBoolean(gameData.settings.sciFiMode)) {
        toggleSciFiMode(gameData.settings.sciFiMode);
    }
    // gameData.settings.vfx.* is applied in the VFX module itself - we just need to adjust the UI
    Dom.get().byId('vfxProgressBarFollowSwitch').checked = gameData.settings.vfx.followProgressBars;
    Dom.get().byId('vfxSplashOnLevelUpSwitch').checked = gameData.settings.vfx.splashOnLevelUp;
    Dom.get().byId('vfxFlashOnLevelUpSwitch').checked = gameData.settings.vfx.flashOnLevelUp;

    // gameData.settings.audio.* is applied in the audio module itself - we just need to adjust the UI
    Dom.get().byId('audioEnabledSwitch').checked = gameData.settings.audio.enabled;

    setupVolumeSlider('masterVolumeRange', 'masterVolumeOutput',
        () => gameData.settings.audio.masterVolume,
        (value) => {
            gameData.settings.audio.masterVolume = value;
            AudioEngine.setMasterVolume(value);
        }
    );

    setupVolumeSlider('musicVolumeRange', 'musicVolumeOutput',
        () => gameData.settings.audio.musicVolume,
        (value) => {
            gameData.settings.audio.musicVolume = value;
            AudioEngine.setMusicVolume(value);
        }
    );

    setupVolumeSlider('soundVolumeRange', 'soundVolumeOutput',
        () => gameData.settings.audio.soundVolume,
        (value) => {
            gameData.settings.audio.soundVolume = value;
            AudioEngine.setSoundVolume(value);
        }
    );
}
