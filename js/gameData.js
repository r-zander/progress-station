'use strict';

const localStorageKey = 'ps_gameDataSave';

/**
 * @typedef {Object} RunStatistic
 * @property {number} current
 * @property {number} max
 */

/**
 * @typedef {Object} GameState
 * @property {string} [name] name of the game state in the gameStates dictionary
 * @property {boolean} gameLoopRunning
 * @property {boolean} isTimeProgressing
 * @property {boolean} areAttributesUpdated
 * @property {boolean} areTasksProgressing
 * @property {boolean} isBossBattleProgressing
 * @property {boolean} canChangeActivation
 * @property {boolean} canEngageBattles
 * @property {boolean} areBattlesVisible
 * @property {boolean} musicInitialLayerPlaying
 * @property {boolean} musicProgressLayerPlaying
 * @property {boolean} musicBossPlaying
 * @property {GameState[]} [validNextStates]
 */

/**
 * @type {Object<GameState>}
 */
const gameStates = {
    NEW: {
        gameLoopRunning: false,
        isTimeProgressing: false,
        areAttributesUpdated: false,
        areTasksProgressing: false,
        isBossBattleProgressing: false,
        canChangeActivation: false,
        canEngageBattles: false,
        areBattlesVisible: true,
        musicInitialLayerPlaying: true,
        musicProgressLayerPlaying: false,
        musicBossPlaying: false,
    },
    PLAYING: {
        gameLoopRunning: true,
        isTimeProgressing: true,
        areAttributesUpdated: true,
        areTasksProgressing: true,
        isBossBattleProgressing: false,
        canChangeActivation: true,
        canEngageBattles: true,
        areBattlesVisible: true,
        musicInitialLayerPlaying: true,
        musicProgressLayerPlaying: true,
        musicBossPlaying: false,
    },
    PAUSED: {
        gameLoopRunning: false,
        isTimeProgressing: false,
        areAttributesUpdated: false,
        areTasksProgressing: false,
        isBossBattleProgressing: false,
        canChangeActivation: true,
        canEngageBattles: false,
        areBattlesVisible: true,
        musicInitialLayerPlaying: true,
        musicProgressLayerPlaying: false,
        musicBossPlaying: false,
    },
    BOSS_APPEARING: {
        gameLoopRunning: false,
        isTimeProgressing: false,
        areAttributesUpdated: false,
        areTasksProgressing: false,
        isBossBattleProgressing: false,
        canChangeActivation: true,
        canEngageBattles: false,
        areBattlesVisible: true,
        musicInitialLayerPlaying: true,
        musicProgressLayerPlaying: false,
        musicBossPlaying: false,
    },
    BOSS_FIGHT_INTRO: {
        gameLoopRunning: false,
        isTimeProgressing: false,
        areAttributesUpdated: false,
        areTasksProgressing: false,
        isBossBattleProgressing: false,
        canChangeActivation: false,
        canEngageBattles: false,
        areBattlesVisible: true,
        musicInitialLayerPlaying: true,
        musicProgressLayerPlaying: false,
        musicBossPlaying: false,
    },
    BOSS_FIGHT: {
        gameLoopRunning: true,
        isTimeProgressing: false,
        areAttributesUpdated: true,
        areTasksProgressing: false,
        isBossBattleProgressing: true,
        canChangeActivation: true,
        canEngageBattles: false,
        areBattlesVisible: false,
        musicInitialLayerPlaying: false,
        musicProgressLayerPlaying: false,
        musicBossPlaying: true,
    },
    BOSS_FIGHT_PAUSED: {
        gameLoopRunning: false,
        isTimeProgressing: false,
        areAttributesUpdated: false,
        areTasksProgressing: false,
        isBossBattleProgressing: false,
        canChangeActivation: true,
        canEngageBattles: false,
        areBattlesVisible: false,
        musicInitialLayerPlaying: true,
        musicProgressLayerPlaying: false,
        musicBossPlaying: false,
    },
    DEAD: {
        gameLoopRunning: false,
        isTimeProgressing: false,
        areAttributesUpdated: false,
        areTasksProgressing: false,
        isBossBattleProgressing: false,
        canChangeActivation: false,
        canEngageBattles: false,
        areBattlesVisible: false,
        musicInitialLayerPlaying: true,
        musicProgressLayerPlaying: false,
        musicBossPlaying: false,
    },
    BOSS_DEFEATED: {
        gameLoopRunning: false,
        isTimeProgressing: false,
        areAttributesUpdated: false,
        areTasksProgressing: false,
        isBossBattleProgressing: false,
        canChangeActivation: false,
        canEngageBattles: false,
        areBattlesVisible: false,
        musicInitialLayerPlaying: true,
        musicProgressLayerPlaying: false,
        musicBossPlaying: false,
    },
};
gameStates.NEW.validNextStates = [gameStates.PLAYING];
gameStates.PLAYING.validNextStates = [gameStates.PAUSED, gameStates.BOSS_APPEARING, gameStates.BOSS_FIGHT_INTRO];
gameStates.PAUSED.validNextStates = [gameStates.PLAYING];
gameStates.BOSS_APPEARING.validNextStates = [gameStates.PLAYING];
gameStates.BOSS_FIGHT_INTRO.validNextStates = [gameStates.PLAYING, gameStates.BOSS_FIGHT];
gameStates.BOSS_FIGHT.validNextStates = [gameStates.DEAD, gameStates.BOSS_FIGHT_PAUSED, gameStates.BOSS_DEFEATED];
gameStates.BOSS_FIGHT_PAUSED.validNextStates = [gameStates.BOSS_FIGHT];
gameStates.DEAD.validNextStates = [gameStates.NEW];
gameStates.BOSS_DEFEATED.validNextStates = [gameStates.PLAYING];

/**
 * Map of oldVersionNumber to migrationFunction that should return the gameDataSave in the next higher version.
 */
const gameDataMigrations = {};

/**
 * @type {Object<RunStatistic>}}
 */
const DEFAULT_RUN_STATS = {
    battlesFinished: {current: 0, max: 0},
    wavesDefeated: {current: 0, max: 0},
    maxPopulation: {current: 1, max: 1},
    maxIndustry: {current: 0, max: 0},
    maxGrowth: {current: 0, max: 0},
    maxMilitary: {current: 0, max: 0},
    maxDanger: {current: 0, max: 0},
    gridStrength: {current: 0, max: 0},
};

/**
 * @typedef {Object} EntryEntity
 * @property {string} type
 * @property {string} name
 * @property {number} [level]
 */

/**
 * @typedef {Object} EssenceHistoryEntry
 * @property {number} amount - Positive for gain, negative for spend
 * @property {EntryEntity} entity
 * @property {number} cycle
 * @property {number} timestamp epoch milliseconds in UTC aka Date.now() when the entry was created
 */

/**
 * @typedef {Object} DefeatedBossEntry
 * @property {string} name
 * @property {number} cycle
 * @property {number} timestamp epoch milliseconds in UTC aka Date.now() when the entry was created
 */

class GameData {

    /**
     * Version of the save data. Lower versioned save
     * data needs to be migrated to the current version.
     *
     * @type {number}
     */
    version = 10;

    /**
     * @type {string}
     */
    previousStateName = gameStates.NEW.name;

    /**
     * @type {string}
     */
    stateName = gameStates.NEW.name;

    /**
     * @var {string}
     */
    previousStationName = undefined;

    /**
     * @var {string}
     */
    stationName = stationNameGenerator.generate();

    /**
     * @var {string}
     */
    selectedTab = 'modules';

    /**
     * @var {number}
     */
    population;

    /**
     * @var {number}
     */
    cycles;

    /**
     * @var {number}
     */
    totalCycles = 0;

    /**
     * @var {boolean}
     */
    bossBattleAvailable;

    /**
     * @var {number}
     */
    bossEncounterCount = 0;

    /**
     * @var {DefeatedBossEntry[]}
     */
    bossesDefeated = [];

    /**
     * @var {number}
     */
    bossAppearedCycle = 0;

    // /**
    //  * @var {number}
    //  */
    // rebirthTwoCount = 0;

    /**
     * @var {number}
     */
    essenceOfUnknown = 0;

    /**
     * @var {number}
     */
    data = 0;

    /**
     * @type {EssenceHistoryEntry[]}
     */
    essenceOfUnknownHistory = [];

    /**
     * Values from {@link Entity}s that are saved.
     *
     * @var {{
     *     gridStrength: TaskSavedValues,
     *     analysisCore: TaskSavedValues,
     *     modules: Object<ModuleSavedValues>,
     *     moduleOperations: Object<TaskSavedValues>,
     *     battles: Object<BattleSavedValues>,
     *     galacticSecrets: Object<GalacticSecretSavedValues>,
     *     technologies: Object<TechnologySavedValues>,
     *     requirements: Object<RequirementSavedValues>
     * }}
     */
    savedValues;

    /**
     * Names of active entities.
     *
     * @type {{
     *     modules: Set.<string>,
     *     operations: Set.<string>,
     *     pointOfInterest: string,
     *     battles: Set.<string>,
     * }}
     */
    activeEntities = {};

    /**
     * Starts as a copy of DEFAULT_RUN_STATS.
     *
     * @type {Object<RunStatistic>}
     * @type
     */
    stats = structuredClone(DEFAULT_RUN_STATS);

    /**
     * @var {{
     *     darkMode: boolean,
     *     sciFiMode: boolean,
     *     background: string,
     * }}
     */
    settings = {
        darkMode: undefined,
        sciFiMode: true,
        background: 'space',
        vfx: {
            followProgressBars: false,
            splashOnLevelUp: false,
            flashOnLevelUp: false,
        },
        audio: {
            enabled: false,
            toastAnswered: false,
            masterVolume: 0.5,
            enableBackgroundAudio: true,
            musicVolume: 0.6,
            soundVolume: 0.7,
        }
    };

    skipSave = false;

    ignoredVersionUpgrades = [];

    constructor() {
        this.initValues();
        this.initSavedValues();
        this.resetCurrentValues();
    }

    initValues() {
        this.population = 1;
        this.cycles = 0;
        this.bossBattleAvailable = false;
    }

    initSavedValues() {
        this.savedValues = {};

        this.savedValues.gridStrength = GridStrength.newSavedValues();
        this.savedValues.analysisCore = AnalysisCore.newSavedValues();

        this.savedValues.modules = {};
        for (const key in modules) {
            this.savedValues.modules[key] = Module.newSavedValues();
        }
        this.savedValues.moduleOperations = {};
        for (const key in moduleOperations) {
            this.savedValues.moduleOperations[key] = ModuleOperation.newSavedValues();
        }

        this.savedValues.battles = {};
        for (const key in battles) {
            this.savedValues.battles[key] = Battle.newSavedValues();
        }
        this.savedValues.battles[bossBattle.name] = BossBattle.newSavedValues();

        this.savedValues.galacticSecrets = {};
        for (const key in galacticSecrets) {
            this.savedValues.galacticSecrets[key] = GalacticSecret.newSavedValues();
        }

        this.savedValues.technologies = {};
        for (const key in technologies) {
            this.savedValues.technologies[key] = Technology.newSavedValues();
        }

        this.savedValues.requirements = {};
        for (const key in requirementRegistry) {
            this.savedValues.requirements[key] = Requirement.newSavedValues();
        }
    }

    resetCurrentValues() {
        this.activeEntities.modules = new Set();
        this.activeEntities.operations = new Set();
        this.activeEntities.pointOfInterest = defaultPointOfInterest.name;
        this.activeEntities.battles = new Set();
        for (const module of defaultModules) {
            this.activeEntities.modules.add(module.name);
        }
        for (const key in this.stats) {
            this.stats[key].current = DEFAULT_RUN_STATS[key].current;
        }
    }

    /**
     * @return {boolean} true if there was a save game. false if not (aka new game)
     */
    tryLoading() {
        const localStorageItem = localStorage.getItem(localStorageKey);
        let saveGameFound = localStorageItem !== '' && localStorageItem !== null;
        if (saveGameFound) {
            const gameDataSave = JSON.parse(localStorageItem);
            this.#checkSaveGameVersion(gameDataSave);

            // noinspection JSUnresolvedReference
            _.merge(this, gameDataSave);

            this.activeEntities.modules = new Set(gameDataSave.activeEntities.modules);
            this.activeEntities.operations = new Set(gameDataSave.activeEntities.operations);
            this.activeEntities.battles = new Set(gameDataSave.activeEntities.battles);
        }

        gridStrength.loadValues(this.savedValues.gridStrength);
        analysisCore.loadValues(this.savedValues.analysisCore);

        for (const key in moduleOperations) {
            moduleOperations[key].loadValues(this.savedValues.moduleOperations[key]);
        }
        for (const key in modules) {
            modules[key].loadValues(this.savedValues.modules[key]);
        }

        for (const key in battles) {
            battles[key].loadValues(this.savedValues.battles[key]);
        }

        for (const key in galacticSecrets) {
            galacticSecrets[key].loadValues(this.savedValues.galacticSecrets[key]);
        }

        for (const key in technologies) {
            technologies[key].loadValues(this.savedValues.technologies[key]);
        }

        for (const key in requirementRegistry) {
            requirementRegistry[key].loadValues(this.savedValues.requirements[key]);
        }

        GameEvents.GameStateChanged.trigger({
            previousState: gameStates.NEW.name,
            newState: this.stateName,
        });

        for (const key in this.stats) {
            if (this.stats.hasOwnProperty(key)) continue;

            // Copy default stats
            this.stats[key] = structuredClone(DEFAULT_RUN_STATS[key]);
        }

        return saveGameFound;
    }

    #checkSaveGameVersion(gameDataSave) {
        if (gameDataSave.hasOwnProperty('version') &&
            isNumber(gameDataSave.version) &&
            gameDataSave.version < this.version
        ) {
            // Player decided before to ignore this incompatibility, so just continue
            if (gameDataSave.hasOwnProperty('ignoredVersionUpgrades') &&
                gameDataSave.ignoredVersionUpgrades.includes(this.#serializeVersionUpgrade(gameDataSave.version, this.version))
            ) {
                return true;
            }

            while (gameDataSave.version < this.version) {
                if (!gameDataMigrations.hasOwnProperty(gameDataSave.version)) {
                    break;
                }

                console.info('Migrating game save from version ' + gameDataSave.version);
                gameDataSave = gameDataMigrations[gameDataSave.version](gameDataSave);
                gameDataSave.version += 1;
                console.info('Successfully migrated to version ' + gameDataSave.version);
            }

            if (gameDataSave.version === this.version) {
                return true;
            }

            GameEvents.IncompatibleVersionFound.trigger({
                savedVersion: gameDataSave.version,
                expectedVersion: this.version,
            });

            return false;
        }

        return true;
    }

    /**
     * @param {number} savedVersion
     * @param {number} expectedVersion
     */
    ignoreCurrentVersionUpgrade(savedVersion, expectedVersion) {
        this.ignoredVersionUpgrades.push(this.#serializeVersionUpgrade(savedVersion, expectedVersion));
    }

    /**
     * @param {number} savedVersion
     * @param {number} expectedVersion
     */
    #serializeVersionUpgrade(savedVersion, expectedVersion) {
        return `${savedVersion} -> ${expectedVersion}`;
    }

    save() {
        if (this.skipSave) return;

        localStorage.setItem(localStorageKey, gameData.serializeAsJson());
    }

    reset() {
        this.skipSave = true;
        // TODO use some nice modal
        if (confirm('This is going to delete all your progress. Continue?')) {
            localStorage.removeItem(localStorageKey);
            location.reload();
        } else {
            this.skipSave = false;
        }
    }

    import() {
        const importExportBox = document.getElementById('importExportBox');
        const rawValue = importExportBox.value.trim();

        try {
            const decoded = decodeURIComponent(escape(window.atob(rawValue)));
            const parsed = JSON.parse(decoded);

            if (!_.isObjectLike(parsed) || Object.keys(parsed).length === 0) {
                throw new Error("Invalid save data format.");
            }

            //Save only if valid
            localStorage.setItem(localStorageKey, decoded);
            location.reload();

        } catch (e) {
            console.error("Import failed:", e);
            alert("Invalid save data. Please check and try again.");
        }
    }

    exportAsString() {
        return window.btoa(unescape(encodeURIComponent(this.serializeAsJson())));
    }

    export() {
        const importExportBox = document.getElementById('importExportBox');
        importExportBox.value = this.exportAsString();
    }

    /**
     * @return {GameState}
     */
    get state() {
        return gameStates[this.stateName];
    }

    /**
     * @param {GameState} newState
     */
    set state(newState) {
        this.transitionState(newState);
    }

    /**
     * @param {GameState} newState
     */
    transitionState(newState) {
        // Validate transition
        if (!this.state.validNextStates.includes(newState)) {
            throw new Error('Invalide state transition from ' + this.state.name + ' to ' + newState.name
                + '. Valid states would be: ' + this.state.validNextStates.map(gameState => gameState.name).join(', '));
        }

        const previousState = this.stateName;
        this.previousStateName = previousState;
        this.stateName = newState.name;

        GameEvents.GameStateChanged.trigger({
            previousState: previousState,
            newState: newState.name,
        });
    }

    /**
     *
     * @return {string}
     */
    serializeAsJson() {
        return JSON.stringify(this, (key, value) => {
            if (value instanceof Set) {
                return [...value];
            }

            return value;
        });
    }
}

/**
 * @param {GameData} gameDataSave
 * @param {GameState} newState
 */
function migrateGameState(gameDataSave, newState){
    gameDataSave.previousStateName = gameDataSave.stateName;
    gameDataSave.stateName = newState.name;
}

// Migrate from v5 to v6
gameDataMigrations[5] = (gameDataSave) => {
    // Change default value of GameData.settings.vfx.followProgressBars
    if (_.has(gameDataSave, 'settings.vfx.followProgressBars')) {
        gameDataSave.settings.vfx.followProgressBars = false;
    }

    return gameDataSave;
};

// Migrate from v9 to v10
/**
 *
 * @param {GameData} gameDataSave
 * @return {GameData}
 */
gameDataMigrations[9] = (gameDataSave) => {
    // Find out if the boss was defeated before
    if (gameDataSave.savedValues.battles['Boss10'].level === 10) {
        // Set various fields so that the boss battle starts again
        // Flatten Boss battle XP
        gameDataSave.savedValues.battles['Boss10'].xp = 0;
        // Basically a slightly modified version of `summonBoss` function
        gameDataSave.bossBattleAvailable = true;
        gameDataSave.bossAppearedCycle = gameData.cycles;
        migrateGameState(gameDataSave, gameStates.BOSS_APPEARING);
        bossBarAcceleratedProgress = 0;
        // this could basically be treated either as "boss appearance" with 800 cycles etc OR be treated as "boss fight intro", throwing the player straight into the fight
    }
    // All good, keep on playing

    return gameDataSave;
};

/**
 * Shows a generic warning modal with configurable content
 * @param {Object} config - Modal configuration
 * @param {string} config.title - Modal title
 * @param {string} config.bodyHtml - Modal body content (HTML)
 * @param {string} [config.primaryButtonClass] - CSS class for primary (right) button. Defaults to btn-primary
 * @param {string} config.primaryButtonText - Text for primary (right) button
 * @param {Function} config.primaryButtonCallback - Callback for primary button
 * @param {string} [config.primaryButtonHint] - Small text shown below primary button
 * @param {string} [config.secondaryButtonClass] - CSS class for secondary (left) button. Defaults to btn-warning
 * @param {string} config.secondaryButtonText - Text for secondary (left) button
 * @param {Function} config.secondaryButtonCallback - Callback for secondary button
 * @param {string} [config.secondaryButtonHint] - Small text shown below secondary button
 */
function showVersionWarningModal(config) {
    const modalElement = document.getElementById('genericWarningModal');
    const modal = new bootstrap.Modal(modalElement);

    // Set title
    modalElement.querySelector('.modal-title').textContent = config.title;

    // Set body
    modalElement.querySelector('.modal-body').innerHTML = config.bodyHtml;

    // Set primary button
    const primaryButton = modalElement.querySelector('.primary-button');

    if (isString(config.primaryButtonClass)) {
        primaryButton.classList.add(config.primaryButtonClass);
    } else {
        primaryButton.classList.add('.btn-primary');
    }

    primaryButton.textContent = config.primaryButtonText;
    primaryButton.onclick = () => {
        config.primaryButtonCallback();
        modal.hide();
    };

    const primaryHint = modalElement.querySelector('.primary-hint small');
    if (isString(config.primaryButtonHint)) {
        primaryHint.textContent = config.primaryButtonHint;
        primaryHint.parentElement.style.display = '';
    } else {
        primaryHint.parentElement.style.display = 'none';
    }

    // Set secondary button
    const secondaryButton = modalElement.querySelector('.secondary-button');

    if (isString(config.secondaryButtonClass)) {
        secondaryButton.classList.add(config.secondaryButtonClass);
    } else {
        secondaryButton.classList.add('.btn-warning');
    }

    secondaryButton.textContent = config.secondaryButtonText;
    secondaryButton.onclick = () => {
        config.secondaryButtonCallback();
        modal.hide();
    };

    const secondaryHint = modalElement.querySelector('.secondary-hint small');
    if (config.secondaryButtonHint) {
        secondaryHint.textContent = config.secondaryButtonHint;
        secondaryHint.parentElement.style.display = '';
    } else {
        secondaryHint.parentElement.style.display = 'none';
    }

    modal.show();
    return modal;
}

function initVersionWarning() {
    const versionUpgrade = {
        savedVersion: undefined,
        expectedVersion: undefined
    };

    GameEvents.IncompatibleVersionFound.subscribe((payload) => {
        versionUpgrade.savedVersion = payload.savedVersion;
        versionUpgrade.expectedVersion = payload.expectedVersion;

        switch (payload.expectedVersion) {
            case 7:
                showVersionWarningModal({
                    title: 'Older Save Game found',
                    bodyHtml: `
                        <p>You have already played <b>Progress Station</b> in the past, thank you!</p>
                        <p>The game has evolved a lot since then. Our recommendation is to start
                            with a fresh game. But you can also keep playing with your older save game.</p>
                    `,
                    secondaryButtonText: 'Keep save',
                    secondaryButtonCallback: () => {
                        gameData.ignoreCurrentVersionUpgrade(versionUpgrade.savedVersion, versionUpgrade.expectedVersion);
                    },
                    primaryButtonText: 'Start new game',
                    primaryButtonCallback: () => {
                        gameData.reset();
                    }
                });
                break;
            case 8:
                showVersionWarningModal({
                    title: 'Unstable Save Game found',
                    bodyHtml: `
                        <p>You have already played <b>Progress Station</b> in the past, thank you!</p>
                        <p>
                            As the game is currently in beta and we pushed a big update, 
                            the save game structure has changed.<br/>
                            You might see a missing unlock or two, but should easily be able to unlock those again.<br />
                            If you don't want to risk it, feel free to start fresh.
                        </p>
                    `,
                    secondaryButtonText: 'Start new game',
                    secondaryButtonCallback: () => {
                        gameData.reset();
                    },
                    primaryButtonText: 'Keep save',
                    primaryButtonCallback: () => {
                        gameData.ignoreCurrentVersionUpgrade(versionUpgrade.savedVersion, versionUpgrade.expectedVersion);
                    }
                });
                break;
            case 9:
                showVersionWarningModal({
                    title: 'Old Save Game found',
                    bodyHtml: `
                        <p>
                            You have already played the <b class="text-yellow">Progress Station</b>
                             Beta in the past, thank you!
                        </p>
                        <p>
                            The game progression has changed - unfortunately you will need to start over.<br />
                            We hope you enjoy the new experience!
                        </p>
                    `,
                    secondaryButtonClass: 'hidden',
                    secondaryButtonText: 'Start new game',
                    secondaryButtonCallback: () => {
                        gameData.reset();
                    },
                    primaryButtonText: 'Start new game',
                    primaryButtonCallback: () => {
                        gameData.reset();
                    }
                });
                break;
            default:
                showVersionWarningModal({
                    title: 'Incompatible Save Game found',
                    bodyHtml: `
                        <p>You have already played <b>Progress Station</b> in the past, thank you!</p>
                        <p>The game has evolved a lot since then and we can not guarantee that your save game is still fully compatible.</p>
                        <p>Our recommendation is to start with a fresh game. But you can also try and let the game reuse your save file.</p>
                    `,
                    secondaryButtonText: 'Keep save',
                    secondaryButtonHint: '(might break the game)',
                    secondaryButtonCallback: () => {
                        gameData.ignoreCurrentVersionUpgrade(versionUpgrade.savedVersion, versionUpgrade.expectedVersion);
                    },
                    primaryButtonText: 'Reset game',
                    primaryButtonHint: '(deletes all progress)',
                    primaryButtonCallback: () => {
                        gameData.reset();
                    }
                });
                break;
        }
    });

    withCheats(cheats => {
        cheats.Story['VersionWarning'] = {
            trigger: (savedVersion = 7, expectedVersion = 8) => {
                GameEvents.IncompatibleVersionFound.trigger({
                    savedVersion: savedVersion,
                    expectedVersion: expectedVersion
                });
            }
        };
    });
}

initVersionWarning();
