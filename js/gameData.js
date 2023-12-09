'use strict';

const localStorageKey = 'ps_gameDataSave';

class GameData {

    /**
     * Version of the save data. Lower versioned save
     * data needs to be migrated to the current version.
     *
     * @type {number}
     */
    version = 1;

    /**
     * @var {string}
     */
    stationName = stationNameGenerator.generate();

    /**
     * @var {string}
     */
    selectedTab = 'modules';

    /**
     * @var {boolean}
     */
    paused= true;

    /**
     * @var {number}
     */
    population= 1;

    /**
     * @var {number}
     */
    days= 365 * 14;

    /**
     * @var {number}
     */
    totalDays = 365 * 14;

    /**
     * @var {number}
     */
    rebirthOneCount= 0;

    /**
     * @var {number}
     */
    rebirthTwoCount = 0;

    /**
     * @var {{
     *     gridStrength: TaskSavedValues,
     *
     *     moduleCategories: Object.<string, EmptySavedValues>,
     *     modules: Object.<string, ModuleSavedValues>,
     *     moduleComponents: Object.<string, EmptySavedValues>,
     *     moduleOperations: Object.<string, TaskSavedValues>,
     *
     *     battles: Object.<string, TaskSavedValues>,
     *
     *     sectors: Object.<string, EmptySavedValues>,
     *     pointsOfInterest: Object.<string, EmptySavedValues>,
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
    };

    skipSave = false;

    constructor() {
        this.initSavedValues();
        this.resetCurrentValues();
    }

    initSavedValues() {
        this.savedValues = {};

        this.savedValues.gridStrength = GridStrength.newSavedValues();

        this.savedValues.moduleCategories = {};
        for (const key in moduleCategories){
            this.savedValues.moduleCategories[key] = ModuleCategory.newSavedValues();
        }
        this.savedValues.modules = {};
        for (const key in modules){
            this.savedValues.modules[key] = Module.newSavedValues();
        }
        this.savedValues.moduleComponents = {};
        for (const key in moduleComponents){
            this.savedValues.moduleComponents[key] = ModuleComponent.newSavedValues();
        }
        this.savedValues.moduleOperations = {};
        for (const key in moduleOperations){
            this.savedValues.moduleOperations[key] = ModuleOperation.newSavedValues();
        }

        this.savedValues.battles = {};
        for (const key in battles){
            this.savedValues.battles[key] = Battle.newSavedValues();
        }

        this.savedValues.sectors = {};
        for (const key in sectors){
            this.savedValues.sectors[key] = Sector.newSavedValues();
        }
        this.savedValues.pointsOfInterest = {};
        for (const key in pointsOfInterest){
            this.savedValues.pointsOfInterest[key] = PointOfInterest.newSavedValues();
        }
    }

    resetCurrentValues() {
        this.activeEntities.modules = new Set();
        for (const module of defaultModules) {
            this.activeEntities.modules.add(module.name);
        }
        this.activeEntities.operations = new Set();
        this.activeEntities.pointOfInterest = defaultPointOfInterest;
        this.activeEntities.battles = new Set();
    }

    /**
     * @return {boolean} true if there was a save game. false if not (aka new game)
     */
    tryLoading() {
        const localStorageItem = localStorage.getItem(localStorageKey);
        let saveGameFound = localStorageItem !== null;
        if (saveGameFound) {
            const gameDataSave = JSON.parse(localStorageItem);
            // noinspection JSUnresolvedReference
            _.merge(this, gameDataSave);

            this.activeEntities.modules = new Set(gameDataSave.activeEntities.modules);
            this.activeEntities.operations = new Set(gameDataSave.activeEntities.operations);
            this.activeEntities.battles = new Set(gameDataSave.activeEntities.battles);
        }

        gridStrength.loadValues(this.savedValues.gridStrength);

        // Inverse order of hierarchy during loading --> allows for data propagation
        for (const key in moduleOperations){
            moduleOperations[key].loadValues(this.savedValues.moduleOperations[key]);
        }
        for (const key in moduleComponents){
            moduleComponents[key].loadValues(this.savedValues.moduleComponents[key]);
        }
        for (const key in modules){
            modules[key].loadValues(this.savedValues.modules[key]);
        }
        for (const key in moduleCategories){
            moduleCategories[key].loadValues(this.savedValues.moduleCategories[key]);
        }

        for (const key in battles){
            battles[key].loadValues(this.savedValues.battles[key]);
        }

        for (const key in sectors){
            sectors[key].loadValues(this.savedValues.sectors[key]);
        }
        for (const key in pointsOfInterest){
            pointsOfInterest[key].loadValues(this.savedValues.pointsOfInterest[key]);
        }

        return saveGameFound;
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
        localStorage.setItem(localStorageKey, window.atob(importExportBox.value));
        location.reload();
    }

    export() {
        const importExportBox = document.getElementById('importExportBox');
        importExportBox.value = window.btoa(gameData.serializeAsJson());
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
