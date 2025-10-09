'use strict';

const localStorageKey = 'ps_gameDataSave';

/**
 * @typedef {Object} GameState
 * @property {string} [name] name of the game state in the gameStates dictionary
 * @property {boolean} gameLoopRunning
 * @property {boolean} isTimeProgressing
 * @property {boolean} areAttributesUpdated
 * @property {boolean} areTasksProgressing
 * @property {boolean} isBossBattleProgressing
 * @property {boolean} canChangeActivation
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
    },
    PLAYING: {
        gameLoopRunning: true,
        isTimeProgressing: true,
        areAttributesUpdated: true,
        areTasksProgressing: true,
        isBossBattleProgressing: false,
        canChangeActivation: true,
    },
    PAUSED: {
        gameLoopRunning: false,
        isTimeProgressing: false,
        areAttributesUpdated: false,
        areTasksProgressing: false,
        isBossBattleProgressing: false,
        canChangeActivation: true,
    },
    TUTORIAL_PAUSED: {
        gameLoopRunning: false,
        isTimeProgressing: false,
        areAttributesUpdated: false,
        areTasksProgressing: false,
        isBossBattleProgressing: false,
        canChangeActivation: true,
    },
    BOSS_FIGHT_INTRO: {
        gameLoopRunning: false,
        isTimeProgressing: false,
        areAttributesUpdated: false,
        areTasksProgressing: false,
        isBossBattleProgressing: false,
        canChangeActivation: false,
    },
    BOSS_FIGHT: {
        gameLoopRunning: true,
        isTimeProgressing: false,
        areAttributesUpdated: true,
        areTasksProgressing: false,
        isBossBattleProgressing: true,
        canChangeActivation: true,
    },
    BOSS_FIGHT_PAUSED: {
        gameLoopRunning: false,
        isTimeProgressing: false,
        areAttributesUpdated: false,
        areTasksProgressing: false,
        isBossBattleProgressing: false,
        canChangeActivation: true,
    },
    DEAD: {
        gameLoopRunning: false,
        isTimeProgressing: false,
        areAttributesUpdated: false,
        areTasksProgressing: false,
        isBossBattleProgressing: false,
        canChangeActivation: false,
    },
    BOSS_DEFEATED: {
        gameLoopRunning: false,
        isTimeProgressing: false,
        areAttributesUpdated: false,
        areTasksProgressing: false,
        isBossBattleProgressing: false,
        canChangeActivation: false,
    },
};
gameStates.NEW.validNextStates = [gameStates.PLAYING];
gameStates.PLAYING.validNextStates = [gameStates.PAUSED, gameStates.TUTORIAL_PAUSED, gameStates.BOSS_FIGHT_INTRO];
gameStates.PAUSED.validNextStates = [gameStates.PLAYING];
gameStates.TUTORIAL_PAUSED.validNextStates = [gameStates.PLAYING];
gameStates.BOSS_FIGHT_INTRO.validNextStates = [gameStates.PLAYING, gameStates.BOSS_FIGHT];
gameStates.BOSS_FIGHT.validNextStates = [gameStates.DEAD, gameStates.BOSS_FIGHT_PAUSED, gameStates.BOSS_DEFEATED];
gameStates.BOSS_FIGHT_PAUSED.validNextStates = [gameStates.BOSS_FIGHT];
gameStates.DEAD.validNextStates = [gameStates.NEW];
gameStates.BOSS_DEFEATED.validNextStates = [gameStates.PLAYING];

/**
 * Map of oldVersionNumber to migrationFunction that should return the gameDataSave in the next higher version.
 */
const gameDataMigrations = {};

class GameData {

    /**
     * Version of the save data. Lower versioned save
     * data needs to be migrated to the current version.
     *
     * @type {number}
     */
    version = 7;

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
    lastPopulationDelta;

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

    // /**
    //  * @var {number}
    //  */
    // rebirthTwoCount = 0;

    /**
     * @var {number}
     */
    essenceOfUnknown = 0;

    /**
     * Values from {@link Entity}s that are saved.
     *
     * @var {{
     *     gridStrength: TaskSavedValues,
     *     modules: Object<ModuleSavedValues>,
     *     moduleOperations: Object<TaskSavedValues>,
     *     battles: Object<TaskSavedValues>,
     *     galacticSecrets: Object<GalacticSecretSavedValues>,
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
            masterVolume: 0.7,
            enableBackgroundAudio: false,
            // musicVolume: 1.0,
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
        this.lastPopulationDelta = 0;
        this.cycles = 0;
        this.bossBattleAvailable = false;
    }

    // TODO lots of changes - do we need a migration?
    initSavedValues() {
        this.savedValues = {};

        this.savedValues.gridStrength = GridStrength.newSavedValues();

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

        for (const key in requirementRegistry) {
            requirementRegistry[key].loadValues(this.savedValues.requirements[key]);
        }

        GameEvents.GameStateChanged.trigger({
            previousState: gameStates.NEW.name,
            newState: this.stateName,
        });

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
            const decoded = window.atob(rawValue);
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

    export() {
        const importExportBox = document.getElementById('importExportBox');
        importExportBox.value = window.btoa(gameData.serializeAsJson());
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

gameDataMigrations[5] = (gameDataSave) => {
    // Change default value of GameData.settings.vfx.followProgressBars
    if (_.has(gameDataSave, 'settings.vfx.followProgressBars')) {
        gameDataSave.settings.vfx.followProgressBars = false;
    }

    return gameDataSave;
};

gameDataMigrations[6] = (gameDataSave) => {
    GameEvents.RebalancedVersionFound.trigger({
        savedVersion: gameDataSave.version,
        // TODO post-beta please fix
        expectedVersion: 7,
    });

    return gameDataSave;
};
