'use strict';

class GameData {
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
     * @var {number}
     */
    population= 1;

    /**
     * @var {boolean}
     */
    paused= true;

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

    // TODO --> new Set
    // TODO on save: persist set.values
    // TODO on load: new Set(values)
    /**
     *
     * @var {Object.<string, Module>}
     */
    currentModules;

    /**
     * @var {Object.<string, ModuleOperation>}
     */
    currentOperations;

    /**
     * @var {PointOfInterest}
     */
    currentPointOfInterest;

    /**
     * //@var {Battle} currentBattle
     */

    /**
     * @var {Object.<string, Battle>}
     */
    currentBattles;

    /**
     * @var {string}
     */
    stationName = stationNameGenerator.generate();

    /**
     * @var {string}
     */
    selectedTab = 'modules';

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

    constructor() {
        this.initSavedValues();
        this.resetCurrentValues();
    }

    initSavedValues() {
        this.savedValues = {};
        // TODO generify?
        this.savedValues.gridStrength = GridStrength.newSavedValues();

        this.savedValues.moduleCategories = {};
        for (let key in moduleCategories){
            this.savedValues.moduleCategories[key] = ModuleCategory.newSavedValues();
        }
        this.savedValues.modules = {};
        for (let key in modules){
            this.savedValues.modules[key] = Module.newSavedValues();
        }
        this.savedValues.moduleComponents = {};
        for (let key in moduleComponents){
            this.savedValues.moduleComponents[key] = ModuleComponent.newSavedValues();
        }
        this.savedValues.moduleOperations = {};
        for (let key in moduleOperations){
            this.savedValues.moduleOperations[key] = ModuleOperation.newSavedValues();
        }

        this.savedValues.battles = {};
        for (let key in battles){
            this.savedValues.battles[key] = Battle.newSavedValues();
        }

        this.savedValues.sectors = {};
        for (let key in sectors){
            this.savedValues.sectors[key] = Sector.newSavedValues();
        }
        this.savedValues.pointsOfInterest = {};
        for (let key in pointsOfInterest){
            this.savedValues.pointsOfInterest[key] = PointOfInterest.newSavedValues();
        }
    }

    resetCurrentValues() {
        this.currentModules = {};
        for (const module of defaultModules) {
            this.currentModules[module.name] = module;
        }
        this.currentPointOfInterest = defaultPointOfInterest;
        this.currentOperations = {};
        this.currentBattles = {};
    }

    /**
     * @return {boolean} true if there was a save game. false if not (aka new game)
     */
    tryLoading() {
        const localStorageItem = localStorage.getItem('gameDataSave');
        let saveGameFound = localStorageItem !== null;
        if (saveGameFound) {
            const gameDataSave = JSON.parse(localStorageItem);
            // noinspection JSUnresolvedReference
            _.merge(this, gameDataSave);
        }

        // TODO generify?
        gridStrength.loadData(this.savedValues.gridStrength);

        for (let key in moduleCategories){
            moduleCategories[key].loadData(this.savedValues.moduleCategories[key]);
        }
        for (let key in modules){
            modules[key].loadData(this.savedValues.modules[key]);
        }
        for (let key in moduleComponents){
            moduleComponents[key].loadData(this.savedValues.moduleComponents[key]);
        }
        for (let key in moduleOperations){
            moduleOperations[key].loadData(this.savedValues.moduleOperations[key]);
        }

        for (let key in battles){
            battles[key].loadData(this.savedValues.battles[key]);
        }

        for (let key in sectors){
            sectors[key].loadData(this.savedValues.sectors[key]);
        }
        for (let key in pointsOfInterest){
            pointsOfInterest[key].loadData(this.savedValues.pointsOfInterest[key]);
        }
        // TODO
        //      check Module hierarchy activation


        // if (gameDataSave !== null) {
        //     assignDictFromSaveData(modules, gameDataSave.moduleSaveData);
        //     replaceSaveDict(gameData, gameDataSave);
        //     replaceSaveDict(gameData.requirements, gameDataSave.requirements);
        //     replaceSaveDict(gameData.taskData, gameDataSave.taskData);
        //     replaceSaveDict(gameData.battleData, gameDataSave.battleData);
        //
        //     for (const id in gameDataSave.currentOperations) {
        //         gameDataSave.currentOperations[id] = moduleOperations[id];
        //     }
        //     for (const id in gameDataSave.currentModules) {
        //         //Migrate "current" modules before replacing save data, currentModules should probably be just strings in future.
        //         const override = modules[id];
        //         for (const component of override.components) {
        //             const saved = gameDataSave.currentModules[id].components.find((element) => element.name === component.name);
        //             if (saved.currentOperation === null || saved.currentOperation === undefined) continue;
        //             if (moduleOperations.hasOwnProperty(saved.currentOperation.name)) {
        //                 component.currentMode = moduleOperations[saved.currentOperation.name];
        //             }
        //         }
        //         modules[id].setEnabled(true);
        //         gameDataSave.currentModules[id] = modules[id];
        //     }
        //
        //     for (const key in gameDataSave.battleData) {
        //         let battle = gameDataSave.battleData[key];
        //         delete battle.baseData;
        //         battle = Object.assign(battles[battle.name], battle);
        //         gameDataSave.battleData[key] = battle;
        //     }
        //     for (const id in gameDataSave.currentBattles) {
        //         gameDataSave.currentBattles[id] = gameDataSave.battleData[id];
        //     }
        //
        //     gameData = gameDataSave;
        // } else {
        //     GameEvents.NewGameStarted.trigger(undefined);
        // }

        // assignMethods();

        return saveGameFound;
    }
}

/**
 * @type {GameData}
 */
let gameData ;


// function assignMethods() {
//     for (const key in gameData.requirements) {
//         let requirement = gameData.requirements[key];
//         switch (requirement.type) {
//             case 'TaskRequirement':
//                 requirement = Object.assign(new TaskRequirement(requirement.elements, requirement.requirements), requirement);
//                 break;
//             case 'AgeRequirement':
//                 requirement = Object.assign(new AgeRequirement(requirement.elements, requirement.requirements), requirement);
//                 break;
//             case 'AttributeRequirement':
//                 requirement = Object.assign(new AttributeRequirement(requirement.elements, requirement.requirements), requirement);
//                 break;
//         }
//
//         const tempRequirement = tempData['requirements'][key];
//         requirement.elements = tempRequirement.elements;
//         requirement.requirements = tempRequirement.requirements;
//         gameData.requirements[key] = requirement;
//     }
//
//     gameData.currentPointOfInterest = pointsOfInterest[gameData.currentPointOfInterest.name];
//     // if (gameData.currentBattle !== null) {
//     //     startBattle(gameData.currentBattle.name);
//     // }
// }

function assignAndReplaceSavedTaskObject(object, saveDict) {
    const key = object.name;
    if (key in saveDict) {
        object.loadData(saveDict[key]);
    }
    saveDict[key] = object;
}

// TODO move into GameData class
function saveGameData() {
    if (skipGameDataSave) return;

    updateModuleSavaData(gameData);
    localStorage.setItem('gameDataSave', JSON.stringify(gameData));
}

function updateModuleSavaData(saveData) {
    if (saveData.moduleSaveData === undefined) {
        saveData.moduleSaveData = {};
    }
    for (const id in modules) {
        const module = modules[id];
        saveData.moduleSaveData[id] = module.getSaveData();
    }
}

function assignDictFromSaveData(dict, saveData) {
    for (const id in dict) {
        const object = dict[id];
        if (saveData !== undefined && id in saveData) {
            object.loadData(saveData[id]);
        }
    }
}

// function replaceSaveDict(dict, saveDict) {
//     for (const key in dict) {
//         if (dict === gameData.taskData && (dict[key] instanceof ModuleOperation || dict[key] instanceof GridStrength)) {
//             assignAndReplaceSavedTaskObject(dict[key], saveDict);
//         } else if (dict === gameData.requirements) {
//             if (!(key in saveDict)) {
//                 saveDict[key] = dict[key];
//             }
//             if (saveDict[key].type !== tempData['requirements'][key].type) {
//                 saveDict[key] = tempData['requirements'][key];
//             }
//         }
//     }
//
//     for (const key in saveDict) {
//         if (!(key in dict)) {
//             delete saveDict[key];
//         }
//     }
// }

const tempData = {};
let skipGameDataSave = false;

/**
 *
 * @type {
 * {
 *   element: HTMLElement,
 *   effectType: EffectType,
 *   getEffect: function(EffectType): number,
 *   getEffects: function(): EffectDefinition[],
 *   isActive: function(): boolean
 * }[]
 * }
 */
const attributeBalanceEntries = [];

/**
 *
 * @type {{element: HTMLElement, taskOrItem: EffectsHolder, isActive: function(): boolean}[]}
 */
const gridLoadBalanceEntries = [];

const tabButtons = {
    modules: document.getElementById('modulesTabButton'),
    location: document.getElementById('locationTabButton'),
    captainsLog: document.getElementById('captainsLogTabButton'),
    battles: document.getElementById('battleTabButton'),
    attributes: document.getElementById('attributesTabButton'),
    settings: document.getElementById('settingsTabButton'),
};

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}

function applyMultipliers(value, multipliers) {
    const finalMultiplier = multipliers.reduce((final, multiplierFn) => final * multiplierFn(), 1);

    return Math.round(value * finalMultiplier);
}

function applySpeed(value, ignoreDeath = false) {
    return value * getGameSpeed(ignoreDeath) / updateSpeed;
}

// TODO Need to review formula + application in populationDelta()
function calculateHeat() {
    const danger = attributes.danger.getValue();
    const military = attributes.military.getValue();

    return Math.max(danger - military, 1);
}

function populationDelta() {
    const growth = attributes.growth.getValue();
    const heat = attributes.heat.getValue();
    const population = attributes.population.getValue();
    return growth - population * 0.01 * heat;
}

function updatePopulation() {
    gameData.population += applySpeed(populationDelta());
    gameData.population = Math.max(gameData.population, 1);
}

function getGameSpeed(ignoreDeath = false) {
    if (ignoreDeath) {
        return baseGameSpeed * +!gameData.paused;
    } else {
        return baseGameSpeed * +isPlaying();
    }
}

function hideAllTooltips() {
    for (const tooltipTriggerElement of visibleTooltips) {
        // noinspection JSUnresolvedReference
        bootstrap.Tooltip.getInstance(tooltipTriggerElement).hide();
    }
}

function setTab(selectedTab) {
    const tabs = document.getElementsByClassName('tab');
    for (const tab of tabs) {
        tab.style.display = 'none';
    }
    document.getElementById(selectedTab).style.display = 'block';

    const tabButtonElements = document.getElementsByClassName('tabButton');
    for (const tabButton of tabButtonElements) {
        tabButton.classList.remove('active');
    }
    tabButtons[selectedTab].classList.add('active');
    gameData.selectedTab = selectedTab;
    saveGameData();

    hideAllTooltips();
}

// noinspection JSUnusedGlobalSymbols used in HTML
function setPause() {
    gameData.paused = !gameData.paused;
}

function unpause() {
    gameData.paused = false;
}

function setPointOfInterest(name) {
    if (!isPlaying()) {
        VFX.shakePlayButton();
        return;
    }

    gameData.currentPointOfInterest = pointsOfInterest[name];
}

// function setBattle(name) {
//     gameData.currentBattle = gameData.battleData[name];
//     const nameElement = document.getElementById('battleName');
//     nameElement.textContent = gameData.currentBattle.name;
// }
//
// function startBattle(name) {
//     setBattle(name);
//     const progressBar = document.getElementById('battleProgressBar');
//     progressBar.hidden = false;
// }
//
// function concedeBattle() {
//     gameData.currentBattle = null;
//     GameEvents.GameOver.trigger({
//         bossDefeated: false,
//     });
// }

function createRequiredRow(categoryName) {
    const requiredRow = Dom.new.fromTemplate('level4RequiredTemplate');
    requiredRow.classList.add('requiredRow', categoryName);
    requiredRow.id = categoryName;
    return requiredRow;
}

function createModuleLevel4Elements(categoryName, component) {
    const level4Elements = [];
    const operations = component.operations;

    for (const operation of operations) {
        const level4Element = Dom.new.fromTemplate('level4TaskTemplate');
        level4Element.id = operation.id;

        const level4DomGetter = Dom.get(level4Element);
        level4DomGetter.byClass('name').textContent = operation.title;
        const descriptionElement = level4DomGetter.byClass('descriptionTooltip');
        descriptionElement.ariaLabel = operation.title;
        if (isDefined(operation.description)) {
            descriptionElement.title = operation.description;
        } else {
            descriptionElement.removeAttribute('title');
        }
        level4DomGetter.byClass('progressBar').addEventListener('click', () => {
            component.setActiveOperation(operation);
        });
        formatValue(level4DomGetter.bySelector('.gridLoad > data'), operation.getGridLoad());

        level4Elements.push(level4Element);
    }

    level4Elements.push(createRequiredRow(categoryName));

    return level4Elements;
}

function createModuleLevel3Elements(categoryName, module) {
    const level3Elements = [];

    for (const component of module.components) {
        const level3Element = Dom.new.fromTemplate('level3TaskTemplate');
        const level3DomGetter = Dom.get(level3Element);

        const nameCell = level3DomGetter.byClass('name');
        nameCell.textContent = component.title;
        if (isDefined(component.description)) {
            nameCell.title = component.description;
        } else {
            nameCell.removeAttribute('title');
        }
        const level4Slot = level3DomGetter.byClass('level4');
        level4Slot.append(...createModuleLevel4Elements(categoryName, component));

        level3Elements.push(level3Element);
    }

    return level3Elements;
}

/**
 *
 * @param {string} categoryName
 * @param {ModuleCategory} category
 * @return {HTMLElement[]}
 */
function createModuleLevel2Elements(categoryName, category) {
    const level2Elements = [];

    for (const module of category.modules) {
        const level2Element = Dom.new.fromTemplate('level2Template');
        const level2DomGetter = Dom.get(level2Element);
        level2Element.id = 'module_row_' + module.name;
        const nameCell = level2DomGetter.byClass('name');
        nameCell.textContent = module.title;
        if (isDefined(module.description)) {
            nameCell.title = module.description;
        } else {
            nameCell.removeAttribute('title');
        }
        module.setToggleButton(level2DomGetter.byClass('form-check-input'));

        const level3Slot = level2DomGetter.byId('level3');
        level3Slot.replaceWith(...createModuleLevel3Elements(categoryName, module));

        level2Elements.push(level2Element);
    }

    return level2Elements;
}

function createModulesUI(categoryDefinition, domId) {
    const slot = Dom.get().byId(domId);
    const level1Elements = [];

    for (const categoryName in categoryDefinition) {
        const level1Element = Dom.new.fromTemplate('level1Template');

        /** @var {ModuleCategory} */
        const category = categoryDefinition[categoryName];
        level1Element.classList.add(categoryName);

        const level1DomGetter = Dom.get(level1Element);
        const categoryCell = level1DomGetter.byClass('category');
        categoryCell.textContent = category.title;
        if (isDefined(category.description)) {
            categoryCell.title = category.description;
        } else {
            categoryCell.removeAttribute('title');
        }
        level1DomGetter.byClass('level1-header').style.backgroundColor = category.color;

        const level2Slot = level1DomGetter.byId('level2');
        level2Slot.replaceWith(...createModuleLevel2Elements(categoryName, category));

        level1Elements.push(level1Element);
    }

    slot.replaceWith(...level1Elements);
}

/**
 *
 * @param {PointOfInterest[]} category
 * @param {string} categoryName
 * @return {HTMLElement[]}
 */
function createLevel4SectorElements(category, categoryName) {
    const level4Elements = [];
    for (const pointOfInterest of category) {
        const level4Element = Dom.new.fromTemplate('level4PointOfInterestTemplate');
        level4Element.id = 'row_' + pointOfInterest.name;

        const level4DomGetter = Dom.get(level4Element);
        level4DomGetter.byClass('name').textContent = pointOfInterest.title;
        const descriptionElement = level4DomGetter.byClass('descriptionTooltip');
        descriptionElement.ariaLabel = pointOfInterest.title;
        if (isDefined(pointOfInterest.description)) {
            descriptionElement.title = pointOfInterest.description;
        } else {
            descriptionElement.removeAttribute('title');
        }
        level4DomGetter.byClass('modifier').innerHTML = pointOfInterest.modifiers.map(Modifier.getDescription).join(',\n');
        level4DomGetter.byClass('button').addEventListener('click', () => {
            setPointOfInterest(pointOfInterest.name);
        });
        level4DomGetter.byClass('radio').addEventListener('click', () => {
            setPointOfInterest(pointOfInterest.name);
        });

        level4Elements.push(level4Element);
    }

    level4Elements.push(createRequiredRow(categoryName));
    return level4Elements;
}

/**
 *
 * @param {string} domId
 * @param {Sector} category
 * @param {string} categoryName
 * @param {number} categoryIndex
 * @return {*}
 */
function createLevel3SectorElement(domId, category, categoryName, categoryIndex) {
    const level3Element = Dom.new.fromTemplate('level3PointOfInterestTemplate');

    level3Element.classList.add(categoryName);
    level3Element.classList.remove('ps-3');
    if (categoryIndex === 0) {
        level3Element.classList.remove('mt-2');
    }

    const level3DomGetter = Dom.get(level3Element);
    level3DomGetter.byClass('header-row').style.backgroundColor = category.color;
    const nameCell = level3DomGetter.byClass('name');
    nameCell.textContent = category.title;
    if (isDefined(category.description)) {
        nameCell.title = category.description;
    } else {
        nameCell.removeAttribute('title');
    }

    /** @type {HTMLElement} */
    const level4Slot = level3DomGetter.byClass('level4');
    level4Slot.append(...createLevel4SectorElements(category.pointsOfInterest, categoryName));
    return level3Element;
}

/**
 * Due to styling reasons, the two rendered levels are actually level 3 + 4 - don't get confused.
 * @param {Object.<string, Sector>} categoryDefinition
 * @param {string} domId
 */
function createSectorsUI(categoryDefinition, domId) {
    const slot = Dom.get().byId(domId);
    const level3Elements = [];

    for (const categoryName in categoryDefinition) {
        const category = categoryDefinition[categoryName];
        level3Elements.push(createLevel3SectorElement(domId, category, categoryName, level3Elements.length));
    }

    slot.replaceWith(...level3Elements);
}

/**
 *
 * @param {Battle[]} category
 * @param {string} categoryName
 * @return {HTMLElement[]}
 */
function createLevel4BattleElements(category, categoryName) {
    const level4Elements = [];
    for (const battle of category) {
        const level4Element = Dom.new.fromTemplate('level4BattleTemplate');
        level4Element.id = 'row_' + battle.name;
        const domGetter = Dom.get(level4Element);
        domGetter.byClass('name').textContent = battle.title;
        const descriptionElement = domGetter.byClass('descriptionTooltip');
        descriptionElement.ariaLabel = battle.title;
        descriptionElement.title = battle.faction.description;
        domGetter.byClass('rewards').textContent = battle.getRewardsDescription();
        domGetter.byClass('progressBar').addEventListener('click', () => {
            battle.toggle();
        });
        domGetter.byClass('radio').addEventListener('click', () => {
            battle.toggle();
        });

        level4Elements.push(level4Element);
    }

    level4Elements.push(createRequiredRow(categoryName));
    return level4Elements;
}

function createUnfinishedBattlesUI() {
    const level3Element = Dom.new.fromTemplate('level3BattleTemplate');

    level3Element.id = 'unfinishedBattles';
    level3Element.classList.remove('ps-3');
    //     level3Element.classList.remove('mt-2');

    const domGetter = Dom.get(level3Element);
    domGetter.byClass('header-row').style.backgroundColor = colorPalette.TomatoRed;
    domGetter.byClass('name').textContent = 'Open';

    /** @type {HTMLElement} */
    const level4Slot = domGetter.byClass('level4');
    level4Slot.append(...createLevel4BattleElements(Object.values(battles), 'unfinishedBattles'));

    return level3Element;
}

/**
 *
 * @param {Battle[]} category
 * @param {string} categoryName
 * @return {HTMLElement[]}
 */
function createLevel4FinishedBattleElements(category, categoryName) {
    const level4Elements = [];
    for (const battle of category) {
        const level4Element = Dom.new.fromTemplate('level4BattleTemplate');
        level4Element.id = 'row_done_' + battle.name;
        level4Element.classList.add('hidden');
        const domGetter = Dom.get(level4Element);
        domGetter.bySelector('.progressBar .progressBackground').style.backgroundColor = lastLayerData.color;
        domGetter.bySelector('.progressBar .progressFill').style.width = '0%';
        domGetter.byClass('name').textContent = battle.title;
        const descriptionElement = domGetter.byClass('descriptionTooltip');
        descriptionElement.ariaLabel = battle.title;
        if (isDefined(battle.description)) {
            descriptionElement.title = battle.description;
        } else {
            descriptionElement.removeAttribute('title');
        }
        domGetter.byClass('action').classList.add('hidden');
        formatValue(
            domGetter.bySelector('.level > data'),
            battle.maxLevel,
            {keepNumber: true}
        );
        domGetter.byClass('xpGain').classList.add('hidden');
        domGetter.byClass('xpLeft').classList.add('hidden');
        domGetter.byClass('danger').classList.add('hidden');
        domGetter.byClass('rewards').textContent = battle.getRewardsDescription();

        // unshift --> battles in reverse order
        level4Elements.unshift(level4Element);
    }

    level4Elements.push(createRequiredRow(categoryName));
    return level4Elements;
}

function createFinishedBattlesUI() {
    const level3Element = Dom.new.fromTemplate('level3BattleTemplate');

    level3Element.id = 'finishedBattles';
    level3Element.classList.remove('ps-3');

    const domGetter = Dom.get(level3Element);
    domGetter.byClass('header-row').style.backgroundColor = colorPalette.EasyGreen;
    domGetter.byClass('name').textContent = 'Completed';
    domGetter.byClass('action').classList.add('hidden');
    domGetter.byClass('level').textContent = 'Defeated levels';
    domGetter.byClass('xpGain').classList.add('hidden');
    domGetter.byClass('xpLeft').classList.add('hidden');
    domGetter.byClass('danger').classList.add('hidden');

    /** @type {HTMLElement} */
    const level4Slot = domGetter.byClass('level4');
    level4Slot.append(...createLevel4FinishedBattleElements(Object.values(battles), 'unfinishedBattles'));

    return level3Element;
}

function createBattlesUI(categoryDefinition, domId) {
    const slot = Dom.get().byId(domId);

    slot.replaceWith(createUnfinishedBattlesUI(), createFinishedBattlesUI());
}

function createModulesQuickDisplay() {
    const slot = Dom.get().byId('modulesQuickTaskDisplay');
    const quickDisplayElements = [];
    for (const moduleName in modules) {
        const module = modules[moduleName];
        const moduleQuickTaskDisplayElement = Dom.new.fromTemplate('moduleQuickTaskDisplayTemplate');
        const moduleDomGetter = Dom.get(moduleQuickTaskDisplayElement);
        moduleQuickTaskDisplayElement.classList.add(moduleName);
        moduleDomGetter.byClass('moduleName').textContent = module.title;
        const componentSlot = moduleDomGetter.byId('componentsQuickTaskDisplay');
        const componentQuickTaskDisplayElements = [];
        for (const component of module.components) {
            const componentQuickTaskDisplayElement = Dom.new.fromTemplate('componentQuickTaskDisplayTemplate');
            const componentDomGetter = Dom.get(componentQuickTaskDisplayElement);
            componentQuickTaskDisplayElement.classList.add(component.type, component.name);
            componentDomGetter.byClass('progressBar').classList.add(ModuleOperation.name);
            componentDomGetter.bySelector('.name > .component').textContent = component.title;

            componentQuickTaskDisplayElements.push(componentQuickTaskDisplayElement);
        }
        componentSlot.replaceWith(...componentQuickTaskDisplayElements);

        quickDisplayElements.push(moduleQuickTaskDisplayElement);
    }
    slot.replaceWith(...quickDisplayElements);
}

function createBattlesQuickDisplay() {
    const slot = Dom.get().byId('battlesQuickTaskDisplay');
    const quickDisplayElements = [];
    for (const battleName in battles) {
        const battle = battles[battleName];
        const quickDisplayElement = Dom.new.fromTemplate('battleQuickTaskDisplayTemplate');
        const componentDomGetter = Dom.get(quickDisplayElement);
        quickDisplayElement.classList.add(battle.name);
        componentDomGetter.byClass('name').textContent = battle.title;

        quickDisplayElements.push(quickDisplayElement);
    }

    slot.replaceWith(...quickDisplayElements);
}

/**
 * @param {AttributeDefinition} attribute
 */
function createAttributeInlineHTML(attribute) {
    return `<span class="attribute" style="color: ${attribute.color}">${attribute.title}</span>`;
}

/**
 *
 * @param {AttributeDefinition} attribute
 * @returns {HTMLElement}
 */
function createAttributeRow(attribute) {
    const dangerRow = Dom.new.fromTemplate('attributeRowTemplate');
    dangerRow.classList.add(attribute.name);
    const dangerDomGetter = Dom.get(dangerRow);
    if (attribute.icon === null) {
        dangerDomGetter.byClass('icon').remove();
    } else {
        dangerDomGetter.byClass('icon').src = attribute.icon;
    }
    let nameElement = dangerDomGetter.byClass('name');
    nameElement.textContent = attribute.title;
    if (attribute.color === null) {
        nameElement.style.removeProperty('color');
    } else {
        nameElement.style.color = attribute.color;
    }
    dangerDomGetter.byClass('description').innerHTML = attribute.description;
    return dangerRow;
}

/**
 *
 * @param {HTMLElement} balanceElement
 * @param {function(EffectType): number} getEffectFn
 * @param {function(): EffectDefinition[]} getEffectsFn
 * @param {EffectType} effectType
 * @param {string} name
 * @param {function():boolean} isActiveFn
 */
function createAttributeBalanceEntry(balanceElement, getEffectFn, getEffectsFn, effectType, name, isActiveFn) {
    const affectsEffectType = getEffectsFn()
        .find((effect) => effect.effectType === effectType) !== undefined;
    if (!affectsEffectType) return;

    const balanceEntryElement = Dom.new.fromTemplate('balanceEntryTemplate');
    const domGetter = Dom.get(balanceEntryElement);
    domGetter.byClass('name').textContent = '(' + name + ')';
    domGetter.byClass('operator').textContent = effectType.operator;
    attributeBalanceEntries.push({
        element: balanceEntryElement,
        effectType: effectType,
        getEffect: getEffectFn,
        getEffects: getEffectsFn,
        isActive: isActiveFn,
    });
    balanceElement.append(balanceEntryElement);
}

/**
 *
 * @param {HTMLElement} rowElement
 * @param {EffectType[]} effectTypes
 */
function createAttributeBalance(rowElement, effectTypes) {
    const balanceElement = Dom.get(rowElement).byClass('balance');
    balanceElement.classList.remove('hidden');

    let onlyMultipliers = effectTypes.every((effectType) => effectType.operator === 'x');

    if (onlyMultipliers) {
        const balanceEntryElement = Dom.new.fromTemplate('balanceEntryTemplate');
        const domGetter = Dom.get(balanceEntryElement);
        domGetter.byClass('operator').textContent = '';
        domGetter.byClass('entryValue').textContent = '1';
        domGetter.byClass('name').textContent = '(Base)';
        balanceElement.append(balanceEntryElement);
    }

    for (const effectType of effectTypes) {
        for (const moduleName in modules) {
            const module = modules[moduleName];
            for (const component of module.components) {
                for (const operation of component.operations) {
                    createAttributeBalanceEntry(
                        balanceElement,
                        operation.getEffect.bind(operation),
                        operation.getEffects.bind(operation),
                        effectType,
                        module.title + ' ' + component.title + ': ' + operation.title,
                        operation.isActive.bind(operation),
                    );
                }
            }
        }

        for (const key in battles) {
            /** @type {Battle} */
            const battle = battles[key];
            createAttributeBalanceEntry(
                balanceElement,
                battle.getReward.bind(battle),
                () => battle.rewards,
                effectType,
                'Defeated ' + battle.title,
                battle.isDone.bind(battle)
            );
            createAttributeBalanceEntry(
                balanceElement,
                battle.getEffect.bind(battle),
                battle.getEffects.bind(battle),
                effectType,
                'Fighting ' + battle.title,
                () => battle.isActive() && !battle.isDone(),
            );
        }

        for (const poiName in pointsOfInterest) {
            const pointOfInterest = pointsOfInterest[poiName];
            createAttributeBalanceEntry(
                balanceElement,
                pointOfInterest.getEffect.bind(pointOfInterest),
                pointOfInterest.getEffects.bind(pointOfInterest),
                effectType,
                'Point of Interest: ' + pointOfInterest.baseData.title,
                pointOfInterest.isActive.bind(pointOfInterest)
            );
        }
    }
}

/**
 * @param {HTMLElement} rowElement
 */
function createGridLoadBalance(rowElement) {
    const balanceElement = Dom.get(rowElement).byClass('balance');
    balanceElement.classList.remove('hidden');

    for (const moduleName in modules) {
        const module = modules[moduleName];
        for (const component of module.components) {
            for (const operation of component.operations) {
                if (operation.getGridLoad() === 0) continue;

                const balanceEntryElement = Dom.new.fromTemplate('balanceEntryTemplate');
                const domGetter = Dom.get(balanceEntryElement);
                domGetter.byClass('name').textContent = '(' + module.title + ' ' + component.title + ': ' + operation.title + ')';
                domGetter.byClass('operator').textContent = '+';
                formatValue(domGetter.byClass('entryValue'), operation.getGridLoad());
                gridLoadBalanceEntries.push({
                    element: balanceEntryElement,
                    taskOrItem: operation,
                    isActive: () => gameData.currentOperations.hasOwnProperty(operation.name),
                });
                balanceElement.append(balanceEntryElement);
            }
        }
    }
}

function createAttributesUI() {
    const slot = Dom.get().byId('attributeRows');
    const rows = [];

    // Danger
    const dangerRow = createAttributeRow(attributes.danger);
    Dom.get(dangerRow).byClass('balance').classList.remove('hidden');
    createAttributeBalance(dangerRow, [EffectType.Danger]);
    rows.push(dangerRow);

    // Grid Load
    const gridLoadRow = createAttributeRow(attributes.gridLoad);
    Dom.get(gridLoadRow).byClass('balance').classList.remove('hidden');
    createGridLoadBalance(gridLoadRow);
    rows.push(gridLoadRow);

    // Grid Strength
    const gridStrengthRow = createAttributeRow(attributes.gridStrength);
    const gridStrengthFormulaElement = Dom.get(gridStrengthRow).byClass('formula');
    gridStrengthFormulaElement.classList.remove('hidden');
    gridStrengthFormulaElement.innerHTML = '+<data value="0" class="delta">?</data> per cycle';
    rows.push(gridStrengthRow);

    // Growth
    const growthRow = createAttributeRow(attributes.growth);
    Dom.get(growthRow).byClass('balance').classList.remove('hidden');
    createAttributeBalance(growthRow, [EffectType.Growth]);
    rows.push(growthRow);

    // Heat
    const heatRow = createAttributeRow(attributes.heat);
    const heatFormulaElement = Dom.get(heatRow).byClass('formula');
    heatFormulaElement.classList.remove('hidden');
    heatFormulaElement.innerHTML = 'max(' + createAttributeInlineHTML(attributes.danger) + ' - ' + createAttributeInlineHTML(attributes.military) + ', 1)';
    rows.push(heatRow);

    // Industry
    const industryRow = createAttributeRow(attributes.industry);
    Dom.get(industryRow).byClass('balance').classList.remove('hidden');
    createAttributeBalance(industryRow, [EffectType.Industry]);
    rows.push(industryRow);

    // Military
    const militaryRow = createAttributeRow(attributes.military);
    Dom.get(militaryRow).byClass('balance').classList.remove('hidden');
    createAttributeBalance(militaryRow, [EffectType.Military, EffectType.MilitaryFactor]);
    rows.push(militaryRow);

    // Population
    const populationRow = createAttributeRow(attributes.population);
    const populationFormulaElement = Dom.get(populationRow).byClass('formula');
    populationFormulaElement.classList.remove('hidden');
    populationFormulaElement.innerHTML =
        createAttributeInlineHTML(attributes.growth) + ' - ' +
        createAttributeInlineHTML(attributes.population) + ' * 0.01 * ' +
        createAttributeInlineHTML(attributes.heat) + '<br />&wedgeq; <data value="0" class="delta">?</data> per cycle';
    rows.push(populationRow);

    // Research
    const researchRow = createAttributeRow(attributes.research);
    Dom.get(researchRow).byClass('balance').classList.remove('hidden');
    createAttributeBalance(researchRow, [EffectType.Research, EffectType.ResearchFactor]);
    rows.push(researchRow);

    slot.append(...rows);
}

function createEnergyGridDisplay() {
    const tickElementsTop = [];
    const tickElementsBottom = [];
    for (let i = 0; i < (5 * 8 + 1); i++) {
        tickElementsTop.push(Dom.new.fromTemplate('tickTemplate'));
        tickElementsBottom.push(Dom.new.fromTemplate('tickTemplate'));
    }

    Dom.get().byId('ticksTop').replaceWith(...tickElementsTop);
    Dom.get().byId('ticksBottom').replaceWith(...tickElementsBottom);
}

/**
 * Does layout calculations Raoul's too stupid to do in pure CSS.
 */
function adjustLayout() {
    const headerHeight = Dom.outerHeight(Dom.get().byId('stationOverview'));
    Dom.get().byId('contentWrapper').style.maxHeight = `calc(100vh - ${headerHeight}px)`;
}

function cleanUpDom() {
    for (const template of document.querySelectorAll('template')) {
        if (template.classList.contains('keep')) continue;

        template.remove();
    }
}

function initSidebar() {
    const energyDisplayElement = document.querySelector('#energyDisplay');
    energyDisplayElement.addEventListener('click', () => {
        energyDisplayElement.classList.toggle('detailed');
    });
}

function updateModulesQuickDisplay() {
    for (const moduleName in modules) {
        let container = Dom.get().bySelector('.quickTaskDisplayContainer.' + moduleName);
        if (!gameData.currentModules.hasOwnProperty(moduleName)) {
            container.classList.add('hidden');
            continue;
        }

        const module = modules[moduleName];
        container.classList.remove('hidden');
        const containerDomGetter = Dom.get(container);
        for (const component of module.components) {
            const componentDomGetter = Dom.get(containerDomGetter.bySelector('.quickTaskDisplay.' + component.name));
            let currentOperation = component.currentOperation;
            // Operation classes are never removed, but who cares
            componentDomGetter.byClass('progressBar').classList.add(currentOperation.name);
            componentDomGetter.bySelector('.name > .operation').textContent = currentOperation.title;
            formatValue(
                componentDomGetter.bySelector('.name > .level'),
                currentOperation.level,
                {keepNumber: true}
            );
            setProgress(componentDomGetter.byClass('progressFill'), currentOperation.xp / currentOperation.getMaxXp());
        }
    }
}

/**
 *
 * @param {HTMLElement} progressBar
 * @param {LayeredTask} battle
 */
function setBattleProgress(progressBar, battle) {
    if (battle.isDone()) {
        Dom.get(progressBar).byClass('progressBackground').style.backgroundColor = lastLayerData.color;
        Dom.get(progressBar).byClass('progressFill').style.width = '0%';
        Dom.get(progressBar).byClass('name').textContent = battle.title + ' defeated!';
        return;
    }

    if (battle instanceof BossBattle) {
        Dom.get().byId('battleName').textContent = battle.title;
        Dom.get(progressBar).byClass('name').textContent = battle.layerLabel + ' ' + battle.getDisplayedLevel();
    }

    const progressBarFill = Dom.get(progressBar).byClass('progressFill');
    setProgress(progressBarFill, 1 - (battle.xp / battle.getMaxXp()), false);

    if (battle instanceof BossBattle) {
        progressBarFill.style.backgroundColor = layerData[battle.level].color;

        if (battle.level < battle.maxLevel - 1 &&
            battle.level < layerData.length - 1
        ) {
            Dom.get(progressBar).byClass('progressBackground').style.backgroundColor = layerData[battle.level + 1].color;
        } else {
            Dom.get(progressBar).byClass('progressBackground').style.backgroundColor = lastLayerData.color;
        }
    }
}

function updateBattlesQuickDisplay() {
    // const currentTask = gameData.currentBattle;
    // if (currentTask === null) return;
    //
    // const progressBar = document.querySelector(`.quickTaskDisplay .battle`);
    // setBattleProgress(currentTask, progressBar);


    for (const battleName in battles) {
        /** @type {Battle} */
        const battle = battles[battleName];
        const quickDisplayElement = Dom.get().bySelector('#battleTabButton .quickTaskDisplay.' + battle.name);
        const componentDomGetter = Dom.get(quickDisplayElement);
        if (!battle.isActive()) {
            quickDisplayElement.classList.add('hidden');
            continue;
        }

        quickDisplayElement.classList.remove('hidden');
        componentDomGetter.byClass('progressFill').classList.toggle('current', !battle.isDone());
        formatValue(
            componentDomGetter.byClass('level'),
            battle.getDisplayedLevel(),
            {keepNumber: true}
        );
        setBattleProgress(componentDomGetter.byClass('progressBar'), battle);
    }
}

/**
 *
 * @param {HTMLElement} progressFillElement
 * @param {number} progress between 0.0 and 1.0
 * @param {boolean} increasing set to false if it's not a progress bar but a regress bar
 */
function setProgress(progressFillElement, progress, increasing = true) {
    // Clamp value to [0.0, 1.0]
    progress = Math.max(0.0, Math.min(progress, 1.0));
    // Make sure to disable the transition if the progress is being reset
    const previousProgress = parseFloat(progressFillElement.dataset.progress);
    if ((increasing && (previousProgress - progress) >= 0.01) ||
        (!increasing && (progress - previousProgress) >= 0.01)
    ) {
        progressFillElement.style.transitionDuration = '0s';
    } else {
        progressFillElement.style.removeProperty('transition-duration');
    }
    progressFillElement.dataset.progress = String(progress);
    progressFillElement.style.width = (progress * 100) + '%';
    let parentElement = progressFillElement.closest('.progress');
    if (parentElement !== null) {
        parentElement.ariaValueNow = (progress * 100).toFixed(1);
    }
}

// function updateRequiredRows(categoryType) {
//     const requiredRows = document.getElementsByClassName('requiredRow');
//     for (const requiredRow of requiredRows) {
//         let nextEntity = null;
//         let category = categoryType[requiredRow.id];
//         if (category === undefined) {
//             continue;
//         }
//         for (let i = 0; i < category.length; i++) {
//             let candidate = category[i];
//             if (i >= category.length - 1) break;
//             let requirements = gameData.requirements[candidate.name];
//             if (requirements && i === 0) {
//                 if (!requirements.isCompleted()) {
//                     nextEntity = candidate;
//                     break;
//                 }
//             }
//
//             const nextIndex = i + 1;
//             if (nextIndex >= category.length) {
//                 break;
//             }
//             candidate = category[nextIndex];
//             let nextEntityRequirements = gameData.requirements[candidate.name];
//
//             if (!nextEntityRequirements.isCompleted()) {
//                 nextEntity = candidate;
//                 break;
//             }
//         }
//
//         if (nextEntity == null) {
//             requiredRow.classList.add('hiddenTask');
//         } else {
//             requiredRow.classList.remove('hiddenTask');
//             const requirementObject = gameData.requirements[nextEntity.name];
//             let requirements = requirementObject.requirements;
//
//             const energyStoredElement = requiredRow.getElementsByClassName('energy-stored')[0];
//             const levelElement = requiredRow.getElementsByClassName('levels')[0];
//
//             let finalText = [];
//             if (categoryType === moduleCategories) {
//                 energyStoredElement.classList.add('hiddenTask');
//                 levelElement.classList.remove('hiddenTask');
//                 for (const requirement of requirements) {
//                     const task = gameData.taskData[requirement.task];
//                     if (task.level >= requirement.requirement) continue;
//                     const text = requirement.task + ' level ' +
//                         '<data value="' + task.level + '">' + task.level + '</data>' + '/' +
//                         '<data value="' + requirement.requirement + '">' + requirement.requirement + '</data>';
//                     finalText.push(text);
//                 }
//                 levelElement.innerHTML = finalText.join(', ');
//             } else if (categoryType === sectors) {
//                 levelElement.classList.add('hiddenTask');
//                 energyStoredElement.classList.remove('hiddenTask');
//                 updateEnergyDisplay(
//                     requirements[0].requirement,
//                     energyStoredElement.getElementsByTagName('data')[0],
//                     {unit: units.storedEnergy}
//                 );
//             }
//         }
//     }
// }

function updateModuleRows() {
    for (const moduleName in modules) {
        /** @var {Module} */
        const module = modules[moduleName];
        const row = document.getElementById('module_row_' + module.name);
        const level = module.getLevel();
        const dataElement = row.querySelector('.level');
        formatValue(dataElement, level);
        formatValue(Dom.get(row).byClass('gridLoad'), module.getGridLoad());
    }
}

function updateTaskRows() {
    for (const key in moduleOperations) {
        const operation = moduleOperations[key];
        const row = Dom.get().byId(operation.id);
        const domGetter = Dom.get(row);
        formatValue(domGetter.bySelector('.level > data'), operation.level, {keepNumber: true});
        formatValue(domGetter.bySelector('.xpGain > data'), operation.getXpGain());
        formatValue(domGetter.bySelector('.xpLeft > data'), operation.getXpLeft());

        let maxLevel = domGetter.bySelector('.maxLevel > data');
        formatValue(maxLevel, operation.maxLevel, {keepNumber: true});
        maxLevel = maxLevel.parentElement;
        gameData.rebirthOneCount > 0 ? maxLevel.classList.remove('hidden') : maxLevel.classList.add('hidden');

        const progressFill = domGetter.byClass('progressFill');
        setProgress(progressFill, operation.xp / operation.getMaxXp());
        progressFill.classList.toggle('current', operation.isActive());

        domGetter.byClass('effect').textContent = operation.getEffectDescription();
    }
}

function updateBattleRows() {
    // Determine visibility
    const maxBattles = maximumAvailableBattles();
    let visibleBattles = 0;
    const visibleFactions = {};

    for (const key in battles) {
        /** @type {Battle} */
        const battle = battles[key];
        const row = Dom.get().byId('row_' + battle.name);

        if (battle.isDone()) {
            row.classList.add('hidden');
            Dom.get().byId('row_done_' + battle.name).classList.remove('hidden');
            continue;
        }

        if (visibleBattles >= maxBattles) {
            row.classList.add('hidden');
            continue;
        }

        if (visibleFactions.hasOwnProperty(battle.faction.name)) {
            row.classList.add('hidden');
            continue;
        }

        visibleBattles++;
        visibleFactions[battle.faction.name] = true;

        row.classList.remove('hidden');

        const domGetter = Dom.get(row);
        formatValue(domGetter.bySelector('.level > data'), battle.getDisplayedLevel(), {keepNumber: true});
        formatValue(domGetter.bySelector('.xpGain > data'), battle.getXpGain());
        formatValue(domGetter.bySelector('.xpLeft > data'), battle.getXpLeft());

        setBattleProgress(domGetter.byClass('progressBar'), battle);

        const isActive = battle.isActive();
        domGetter.byClass('progressFill').classList.toggle('current', isActive);
        domGetter.byClass('active').style.backgroundColor = isActive ? colorPalette.TomatoRed :colorPalette.White;
        formatValue(domGetter.bySelector('.danger > data'), battle.getEffect(EffectType.Danger));
    }
}

function updateSectorRows() {
    for (const key in pointsOfInterest) {
        /** @type {PointOfInterest} */
        const pointOfInterest = pointsOfInterest[key];
        const row = Dom.get().byId('row_' + pointOfInterest.name);
        const domGetter = Dom.get(row);
        const isActive = pointOfInterest.isActive();
        domGetter.byClass('active').style.backgroundColor = isActive ? 'rgb(12, 101, 173)' : 'white';
        domGetter.byClass('button').classList.toggle('btn-dark', !isActive);
        domGetter.byClass('button').classList.toggle('btn-warning', isActive);
        domGetter.byClass('effect').textContent = pointOfInterest.getEffectDescription();
        formatValue(domGetter.bySelector('.danger > data'), pointOfInterest.getEffect(EffectType.Danger));
    }
}

function updateHeaderRows() {
    for (const maxLevelElement of document.querySelectorAll('.level3 .maxLevel')) {
        maxLevelElement.classList.toggle('hidden', gameData.rebirthOneCount === 0);
    }
}

function updateAttributeRows() {
    for (const balanceEntry of attributeBalanceEntries) {
        if (balanceEntry.isActive()) {
            formatValue(
                Dom.get(balanceEntry.element).byClass('entryValue'),
                balanceEntry.getEffect(balanceEntry.effectType)
            );
            balanceEntry.element.classList.remove('hidden');
        } else {
            balanceEntry.element.classList.add('hidden');
        }
    }

    for (const balanceEntry of gridLoadBalanceEntries) {
        balanceEntry.element.classList.toggle('hidden', !balanceEntry.isActive());
    }
}

function updateEnergyBar() {
    const energyDisplayElement = Dom.get().byId('energyGridDisplay');
    const domGetter = Dom.get(energyDisplayElement);
    updateEnergyDisplay(gridStrength.getXpGain(), domGetter.bySelector('.energy-net > data'));
    updateEnergyDisplay(gridStrength.getMaxXp(), domGetter.bySelector('.energy-max > data'));
    const currentGridLoad = attributes.gridLoad.getValue();
    const currentGridStrength = attributes.gridStrength.getValue();
    formatValue(domGetter.bySelector('.gridLoad > data'), currentGridLoad, {keepNumber: true});
    formatValue(domGetter.bySelector('.gridStrength > data'), currentGridStrength, {keepNumber: true});
    setProgress(domGetter.byClass('progressFill'), gridStrength.xp / gridStrength.getMaxXp());

    const numberOfBoxes = Dom.get().allBySelector('#gridStrength > .grid-strength-box').length;
    for(let i = numberOfBoxes; i < currentGridStrength; i++) {
        const gridStrengthBox = Dom.new.fromTemplate('gridStrengthBoxTemplate');
        Dom.get().byId('gridStrength').append(gridStrengthBox);
    }

    Dom.get().allBySelector('#gridStrength > .grid-strength-box').forEach((gridStrengthBox, index) => {
        gridStrengthBox.classList.toggle('in-use', index < currentGridLoad);
    });
}

function updateHeatDisplay() {
    const mediumHeat = 1000;
    const maxHeat = 8000;

    const heat = attributes.heat.getValue();
    let heatText = (heat).toFixed(0);
    let color;
    if (heat < mediumHeat) {
        color = lerpColor(
            dangerColors[0],
            dangerColors[1],
            heat / mediumHeat,
            'RGB'
        ).toString('rgb');
    } else {
        color = lerpColor(
            dangerColors[1],
            dangerColors[2],
            (heat - mediumHeat) / (maxHeat - mediumHeat),
            'RGB'
        ).toString('rgb');
    }

    const heatElement1 = Dom.get().byId('heatDisplay');
    heatElement1.textContent = heatText;
    heatElement1.style.color = color;

    const heatElement2 = Dom.get().bySelector('#attributeRows > .heat .value');
    heatElement2.textContent = heatText;
    heatElement2.style.color = color;
}

function updateText() {
    //Sidebar
    document.getElementById('ageDisplay').textContent = String(daysToYears(gameData.days));
    document.getElementById('dayDisplay').textContent = String(getDay()).padStart(3, '0');
    document.getElementById('stationAge').textContent = String(daysToYears(gameData.totalDays));
    const pauseButton = document.getElementById('pauseButton');
    // TODO could also show "Touch the eye" as third state when dead
    if (gameData.paused) {
        pauseButton.textContent = 'Play';
        pauseButton.classList.replace('btn-secondary', 'btn-primary');
    } else {
        pauseButton.textContent = 'Pause';
        pauseButton.classList.replace('btn-primary', 'btn-secondary');
    }

    const danger = attributes.danger.getValue();
    formatValue(Dom.get().byId('dangerDisplay'), danger);
    formatValue(Dom.get().bySelector('#attributeRows > .danger .value'), danger);

    updateEnergyBar();
    formatValue(Dom.get().bySelector('#attributeRows > .gridLoad .value'), attributes.gridLoad.getValue());
    formatValue(Dom.get().bySelector('#attributeRows > .gridStrength .value'), attributes.gridStrength.getValue());
    formatValue(Dom.get().bySelector('#attributeRows > .gridStrength .delta'), gridStrength.getDelta());

    const growth = attributes.growth.getValue();
    formatValue(Dom.get().byId('growthDisplay'), growth);
    formatValue(Dom.get().bySelector('#attributeRows > .growth .value'), growth);

    updateHeatDisplay();

    const industry = attributes.industry.getValue();
    formatValue(Dom.get().byId('industryDisplay'), industry);
    formatValue(Dom.get().bySelector('#attributeRows > .industry .value'), industry);

    const military = attributes.military.getValue();
    formatValue(Dom.get().byId('militaryDisplay'), military);
    formatValue(Dom.get().bySelector('#attributeRows > .military .value'), military);

    const population = attributes.population.getValue();
    formatValue(Dom.get().byId('populationDisplay'), population, {forceInteger: true});
    formatValue(Dom.get().bySelector('#attributeRows > .population .value'), population, {forceInteger: true});
    formatValue(Dom.get().bySelector('#attributeRows > .population .delta'), populationDelta(), {forceSign: true});

    const research = attributes.research.getValue();
    formatValue(Dom.get().byId('researchDisplay'), research);
    formatValue(Dom.get().bySelector('#attributeRows > .research .value'), research);
}

/**
 *
 * @param {number} amount
 * @param {HTMLDataElement} dataElement
 * @param {{prefixes?: string[], unit?: string, forceSign?: boolean}} formatConfig
 */
function updateEnergyDisplay(amount, dataElement, formatConfig = {}) {
    formatValue(dataElement, amount, Object.assign({
        unit: units.energy,
        prefixes: metricPrefixes
    }, formatConfig));
}

function getRemainingGridStrength() {
    return attributes.gridStrength.getValue() - attributes.gridLoad.getValue();
}

function hideEntities() {
    // TODO this needs to work with the new requirements
    // for (const key in gameData.requirements) {
    //     const requirement = gameData.requirements[key];
    //     const completed = requirement.isCompleted();
    //     for (const element of requirement.elements) {
    //         if (completed) {
    //             element.classList.remove('hidden');
    //         } else {
    //             element.classList.add('hidden');
    //         }
    //     }
    // }
}

function updateBodyClasses() {
    document.getElementById('body').classList.toggle('game-paused', !isPlaying());
    document.getElementById('body').classList.toggle('game-playing', isPlaying());
}

function doTasks() {
    const modules = gameData.currentModules;
    for (const moduleName in modules) {
        const module = modules[moduleName];
        module.do();
    }

    for (const battleName in gameData.currentBattles) {
        /** @type {Battle} */
        const battle = battles[battleName];
        if (battle.isDone() && gameData.selectedTab === 'battles') {
            // Quality of life - a battle is done and the player is already on the battles tab
            // or visited it first after the battle was completed --> deactivate battle
            battle.stop();
            VFX.flash(Dom.get().bySelector('#row_done_' + battle.name + ' .progressBar'));
        }

        battle.do();
    }

    gridStrength.do();
}

function getEnergyGeneration() {
    return Effect.getTotalValue([EffectType.Energy, EffectType.EnergyFactor]);
}

function getMaxEnergy() {
    return gridStrength.getMaxXp();
}

function calculateGridLoad() {
    let gridLoad = 0;

    const tasks = gameData.currentOperations;
    if (tasks !== null) {
        for (const taskName in tasks) {
            const task = tasks[taskName];
            if (task != null)
                gridLoad += task.getGridLoad();
        }
    }

    return gridLoad;
}

function goBlackout() {
   gameData.resetCurrentValues();
}

function daysToYears(days) {
    return Math.floor(days / 365);
}

function yearsToDays(years) {
    return years * 365;
}

function getDay() {
    return Math.floor(gameData.days - daysToYears(gameData.days) * 365);
}

function increaseDays() {
    const increase = applySpeed(1);
    if (gameData.days >= getLifespan()) return;

    gameData.days += increase;
    gameData.totalDays += increase;

    if (gameData.days >= getLifespan()) {
        GameEvents.Death.trigger(undefined);
    }
}

/**
 *
 * @param {HTMLDataElement} dataElement
 * @param {number} value
 * @param {{prefixes?: string[], unit?: string, forceSign?: boolean, keepNumber?: boolean, forceInteger?: boolean}} config
 */
function formatValue(dataElement, value, config = {}) {
    // TODO render full number + unit into dataElement.title
    dataElement.value = String(value);

    const defaultConfig = {
        prefixes: magnitudes,
        unit: '',
        forceSign: false,
        keepNumber: false,
        forceInteger: false,
    };
    config = Object.assign({}, defaultConfig, config);

    const toString = (value) => {
        if (config.forceInteger || Number.isInteger(value)) {
            return value.toFixed(0);
        } else if (Math.abs(value) < 1) {
            return value.toFixed(2);
        } else {
            return value.toPrecision(3);
        }
    };

    // what tier? (determines SI symbol)
    const tier = Math.max(0, Math.log10(Math.abs(value)) / 3 | 0);

    let prefix = '';
    if (config.forceSign) {
        if (Math.abs(value) <= 0.001) {
            prefix = '±';
        } else if (value > 0) {
            prefix = '+';
        }
    }

    if (config.keepNumber) {
        dataElement.textContent = prefix + value;
        delete dataElement.dataset.unit;
        return;
    }

    // get suffix and determine scale
    let suffix = config.prefixes[tier];
    if (typeof config.unit === 'string' && config.unit.length > 0) {
        dataElement.dataset.unit = suffix + config.unit;
    } else if (suffix.length > 0) {
        dataElement.dataset.unit = suffix;
    } else {
        delete dataElement.dataset.unit;
    }

    if (tier === 0) {
        dataElement.textContent = prefix + toString(value);
        return;
    }
    const scale = Math.pow(10, tier * 3);

    // scale the number
    const scaled = value / scale;

    // format number and add suffix
    dataElement.textContent = prefix + toString(scaled);
}

function getModuleOperationElement(operationName) {
    if (!moduleOperations.hasOwnProperty(operationName)) {
        console.log('ModuleOperation not found in data: ' + operationName);
        return null;
    }
    const task = moduleOperations[operationName];
    return document.getElementById(task.id);
}

function getBattleElement(taskName) {
    if (!battles.hasOwnProperty(taskName)) {
        console.log('Battle not found in data: ' + taskName);
        return;
    }
    const battle = battles[taskName];
    if (battle instanceof BossBattle) {
        return document.getElementById(battle.progressBarId);
    }

    return Dom.get().byId('row_' + battle.name);
}

function getPointOfInterestElement(name) {
    if (!pointsOfInterest.hasOwnProperty(name)) {
        console.log('Point of Interest not found in data: ' + name);
        return null;
    }

    const pointOfInterest = pointsOfInterest[name];
    return document.getElementById(pointOfInterest.id);
}

function toggleLightDarkMode(force = undefined) {
    if (force === undefined) {
        gameData.settings.darkMode = !gameData.settings.darkMode;
    } else {
        gameData.settings.darkMode = force;
    }
    document.documentElement.dataset['bsTheme'] = gameData.settings.darkMode ? 'dark' : 'light';
    saveGameData();
}

function toggleSciFiMode(force = undefined) {
    const body = document.getElementById('body');
    gameData.settings.sciFiMode = body.classList.toggle('sci-fi', force);
    saveGameData();
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
    saveGameData();
}

function resetBattle(name) {
    const battle = battles[name];
    battle.level = 0;
    battle.xp = 0;
}

function rebirthOne() {
    gameData.rebirthOneCount += 1;
    rebirthReset();
}

function rebirthTwo() {
    gameData.rebirthTwoCount += 1;
    rebirthReset();
    resetMaxLevels();
}

function rebirthReset() {
    setTab('modules');

    setDefaultGameDataValues();
    setPermanentUnlocksAndResetData();
}

function setPermanentUnlocksAndResetData() {
    for (const key in moduleOperations) {
        const operation = moduleOperations[key];
        operation.updateMaxLevelAndReset();
    }

    gridStrength.updateMaxLevelAndReset();

    for (const key in battles) {
        const battle = battles[key];
        battle.updateMaxLevelAndReset();
    }

    // TODO rework
    // for (const key in gameData.requirements) {
    //     const requirement = gameData.requirements[key];
    //     if (requirement.completed && permanentUnlocks.includes(key)) continue;
    //     requirement.completed = false;
    // }

    for (const key in modules) {
        const module = modules[key];
        module.updateMaxLevel();
    }
}

function resetMaxLevels() {
    for (const key in moduleOperations) {
        const operation = moduleOperations[key];
        operation.maxLevel = 0;
    }

    gridStrength.maxLevel = 0;

    for (const key in battles) {
        const battle = battles[key];
        battle.maxLevel = 0;
    }
}

function getLifespan() {
    //Lifespan not defined in station design, if years are not reset this will break the game
    //const immortality = gameData.taskData['Immortality'];
    //const superImmortality = gameData.taskData['Super immortality'];
    //return baseLifespan * immortality.getEffect() * superImmortality.getEffect();
    return Number.MAX_VALUE;
}

function isAlive() {
    return gameData.days < getLifespan();
}

/**
 * Player is alive and game is not paused aka the game is actually running.
 */
function isPlaying() {
    return !gameData.paused && isAlive();
}

function updateUI() {
    updateTaskRows();
    updateModuleRows();
    updateBattleRows();
    updateSectorRows();
    // updateRequiredRows(moduleCategories);
    // updateRequiredRows(sectors);
    updateHeaderRows();
    updateModulesQuickDisplay();
    updateBattlesQuickDisplay();
    updateAttributeRows();
    hideEntities();
    updateText();
    updateBodyClasses();
}

function update() {
    increaseDays();
    doTasks();
    updatePopulation();
    updateUI();
}

function resetGameData() {
    // TODO use some nice modal
    if (confirm('This is going to delete all your progress. Continue?')) {
        localStorage.removeItem('gameDataSave');
        // Give localStorage time to actually clear
        setTimeout(() => {location.reload();}, 0);
    }
}

function rerollStationName() {
    setStationName(stationNameGenerator.generate());
}

function importGameData() {
    const importExportBox = document.getElementById('importExportBox');
    // saveGameData();
    localStorage.setItem('gameDataSave', window.atob(importExportBox.value));
    location.reload();
}

function exportGameData() {
    const importExportBox = document.getElementById('importExportBox');
    importExportBox.value = window.btoa(JSON.stringify(gameData));
}

const visibleTooltips = [];

function initTooltips() {
    const tooltipTriggerElements = document.querySelectorAll('[title]');
    const tooltipConfig = {container: 'body', trigger: 'hover'};
    for (const tooltipTriggerElement of tooltipTriggerElements) {
        // noinspection JSUnresolvedReference
        new bootstrap.Tooltip(tooltipTriggerElement, tooltipConfig);
        tooltipTriggerElement.addEventListener('show.bs.tooltip', () => {
            visibleTooltips.push(tooltipTriggerElement);
        });
        tooltipTriggerElement.addEventListener('hide.bs.tooltip', () => {
            let indexOf = visibleTooltips.indexOf(tooltipTriggerElement);
            if (indexOf !== -1) {
                visibleTooltips.splice(indexOf);
            }
        });
    }
}

/**
 * @param {string} newStationName
 */
function setStationName(newStationName) {
    if (newStationName) {
        gameData.stationName = newStationName;
    } else {
        gameData.stationName = emptyStationName;
    }
    Dom.get().byId('nameDisplay').textContent = gameData.stationName;
    for (const stationNameInput of Dom.get().allByClass('stationNameInput')) {
        stationNameInput.value = newStationName;
    }
    saveGameData();
}

function initStationName() {
    setStationName(gameData.stationName);
    const stationNameDisplayElement = document.getElementById('nameDisplay');
    stationNameDisplayElement.addEventListener('click', (event) => {
        event.preventDefault();

        setTab('settings');
    });
    for (const stationNameInput of Dom.get().allByClass('stationNameInput')) {
        stationNameInput.placeholder = emptyStationName;
        stationNameInput.addEventListener('input', (event) => {
            setStationName(event.target.value);
        });
    }
}

function setDefaultGameDataValues() {
    gameData.resetCurrentValues();
}

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
}

function displayLoaded() {
    document.getElementById('main').classList.add('ready');
}

function assignNames(data) {
    for (const [key, val] of Object.entries(data)) {
        val.name = key;
    }
}

function initConfigNames() {
    gridStrength.name = 'gridStrength';
    assignNames(attributes);
    assignNames(moduleCategories);
    assignNames(modules);
    assignNames(moduleComponents);
    assignNames(moduleOperations);
    assignNames(factions);
    assignNames(battles);
    assignNames(pointsOfInterest);
    assignNames(sectors);
}

function init() {
    // During the setup a lot of functions are called that trigger an auto save. To not save various times,
    // saving is skipped until the game is actually under player control.
    skipGameDataSave = true;

    initConfigNames();
    // //direct ref assignment - taskData could be replaced
    // for (const entityData of Object.values(moduleOperations)) {
    //     gameData.taskData[entityData.name] = entityData;
    // }
    // gameData.battleData = battles;
    // gameData.taskData[gridStrength.name] = gridStrength;

    gameData = new GameData();
    // TODO questionable
// resetGameDataCurrentValues();
    // gameData.requirements = createRequirements(getTaskElement, getPointOfInterestElement);
    //
    // tempData['requirements'] = {};
    // for (const key in gameData.requirements) {
    //     tempData['requirements'][key] = gameData.requirements[key];
    // }
// initGameData();
// loadGameData();

    const saveGameFound = gameData.tryLoading();
    if (saveGameFound === false) {
        GameEvents.NewGameStarted.trigger(undefined);
    }

    createModulesUI(moduleCategories, 'modulesTable');
    createSectorsUI(sectors, 'sectorTable');
    createBattlesUI(battles, 'battlesTable');
    createModulesQuickDisplay();
    createBattlesQuickDisplay();

    adjustLayout();

    initSidebar();







    createAttributeDescriptions(createAttributeInlineHTML);
    createAttributesUI();
    createEnergyGridDisplay();

    //setCustomEffects();

    //Init and enable/disable modules
    for (const id in modules) {
        const module = modules[id];
        module.init();
    }

    if (tabButtons.hasOwnProperty(gameData.selectedTab)) {
        setTab(gameData.selectedTab);
    } else {
        setTab('modules');
    }
    initTooltips();
    initStationName();
    initSettings();

    cleanUpDom();

    skipGameDataSave = false;
    displayLoaded();

    update();
    setInterval(update, 1000 / updateSpeed);
    // TODO RE-ENABLE!!!!
    // setInterval(saveGameData, 3000);
}

init();
