'use strict';

/**
 * @typedef {Object} GameData
 * @property {Object} taskData
 * @property {Object} battleData
 * @property {Object} [requirements]
 *
 * @property {number} population
 *
 * @property {boolean} paused
 *
 * @property {number} days
 * @property {number} rebirthOneCount
 * @property {number} rebirthTwoCount
 * @property {number} totalDays
 *
 * @property {Object<string, Module>} currentModules
 * @property {Object<string, ModuleOperation>} currentOperations
 * @property {PointOfInterest} currentPointOfInterest
 * @property {Battle} currentBattle
 *
 * @property {string} stationName
 * @property {string} selectedTab
 * @property {Object} settings
 * @property {boolean} settings.darkMode
 * @property {boolean} settings.sciFiMode
 * @property {string} settings.background
 */

/**
 * Not a const as it can be overridden when loading a save game.
 *
 * @type {GameData}
 */
let gameData = {
    taskData: {},
    battleData: {},

    population: 0,

    paused: true,

    days: 365 * 14,
    rebirthOneCount: 0,
    rebirthTwoCount: 0,
    totalDays: 365 * 14,

    currentModules: {},
    currentOperations: {},
    currentPointOfInterest: null,
    currentBattle: null,

    stationName: stationNameGenerator.generate(),
    selectedTab: 'jobs',
    settings: {
        darkMode: true,
        sciFiMode: true,
        background: 'space',
    }
};

const tempData = {};
let skipGameDataSave = false;

/**
 *
 * @type {{element: HTMLElement, effectType: EffectType, taskOrItem: EffectsHolder, isActive: function(): boolean}[]}
 */
const attributeBalanceEntries = [];

/**
 *
 * @type {{element: HTMLElement, taskOrItem: EffectsHolder, isActive: function(): boolean}[]}
 */
const gridLoadBalanceEntries = [];

const tabButtons = {
    'jobs': document.getElementById('jobsTabButton'),
    'location': document.getElementById('locationTabButton'),
    'rebirth': document.getElementById('rebirthTabButton'),
    'battle': document.getElementById('battleTabButton'),
    'attributes': document.getElementById('attributesTabButton'),
    'settings': document.getElementById('settingsTabButton'),
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

function setTab(element, selectedTab) {
    const tabs = Array.prototype.slice.call(document.getElementsByClassName('tab'));
    for (const tab of tabs) {
        tab.style.display = 'none';
    }
    document.getElementById(selectedTab).style.display = 'block';

    const tabButtons = document.getElementsByClassName('tabButton');
    for (const tabButton of tabButtons) {
        tabButton.classList.remove('active');
    }
    element.classList.add('active');
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

function setBattle(name) {
    gameData.currentBattle = gameData.battleData[name];
    const nameElement = document.getElementById('battleName');
    nameElement.textContent = gameData.currentBattle.name;
}

function createData(data, baseData) {
    for (const key in baseData) {
        const entity = baseData[key];
        createEntity(data, entity);
    }
}

function createEntity(data, entity) {
    if ('maxLayers' in entity) {
        data[entity.name] = new Battle(entity);
    } else if ('energyGeneration' in entity) {
        data[entity.name] = new ModuleOperation(entity);
    }
    data[entity.name].id = 'row_' + entity.name;
}

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
        const level4DomGetter = Dom.get(level4Element);

        level4DomGetter.byClass('name').textContent = operation.title;
        const descriptionElement = level4DomGetter.byClass('descriptionTooltip');
        descriptionElement.ariaLabel = operation.title;
        descriptionElement.title = tooltips[operation.title];
        level4Element.id = 'row_' + operation.name;
        level4DomGetter.byClass('progressBar').addEventListener('click', () => {
            component.setActiveOperation(operation);
        });

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

        level3DomGetter.byClass('name').textContent = component.title;
        level3DomGetter.byClass('skipSkill').style.display = 'none';

        const level4Slot = level3DomGetter.byClass('level4');
        level4Slot.append(...createModuleLevel4Elements(categoryName, component));

        level3Elements.push(level3Element);
    }

    return level3Elements;
}

function createModuleLevel2Elements(categoryName, category) {
    const level2Elements = [];

    for (const module of category) {
        const level2Element = Dom.new.fromTemplate('level2Template');
        const level2DomGetter = Dom.get(level2Element);
        level2Element.id = 'module-row-' + module.name;
        level2DomGetter.byClass('name').textContent = module.title + ' Module';
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

        const category = categoryDefinition[categoryName];
        level1Element.classList.add(categoryName);

        const level1DomGetter = Dom.get(level1Element);
        level1DomGetter.byClass('category').textContent = categoryName;
        level1DomGetter.byClass('value').textContent = '';
        level1DomGetter.byClass('level1-header').style.backgroundColor = headerRowColors[categoryName];

        const level2Slot = level1DomGetter.byId('level2');
        level2Slot.replaceWith(...createModuleLevel2Elements(categoryName, category));

        level1Elements.push(level1Element);
    }

    slot.replaceWith(...level1Elements);
}

/**
 *
 * @param {string} domId
 * @param {PointOfInterest[]} category
 * @param {string} categoryName
 * @return {HTMLElement[]}
 */
function createLevel4Elements(domId, category, categoryName) {
    const level4Elements = [];
    for (const pointOfInterest of category) {
        const level4Element = Dom.new.fromTemplate('level4PointOfInterestTemplate');
        const level4DomGetter = Dom.get(level4Element);
        level4DomGetter.byClass('name').textContent = pointOfInterest.title;
        const descriptionElement = level4DomGetter.byClass('descriptionTooltip');
        descriptionElement.ariaLabel = pointOfInterest.title;
        descriptionElement.title = tooltips[pointOfInterest.name];
        level4Element.id = 'row_' + pointOfInterest.name;
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

function createLevel3Element(domId, category, categoryName, categoryIndex) {
    let level3Element = Dom.new.fromTemplate('level3PointOfInterestTemplate');

    level3Element.classList.add(categoryName);
    level3Element.classList.remove('ps-3');
    if (categoryIndex === 0) {
        level3Element.classList.remove('mt-2');
    }

    const level3DomGetter = Dom.get(level3Element);
    level3DomGetter.byClass('name').textContent = category.title;
    level3Element.querySelector('.header-row').style.backgroundColor = headerRowColors[categoryName];

    /** @type {HTMLElement} */
    const level4Slot = level3DomGetter.byClass('level4');
    level4Slot.append(...createLevel4Elements(domId, category.pointsOfInterest, categoryName));
    return level3Element;
}

/**
 * Due to styling reasons, the two rendered levels are actually level 3 + 4 - don't get confused.
 */
function createSectorsUI(categoryDefinition, domId) {
    const slot = Dom.get().byId(domId);
    const level3Elements = [];

    for (const categoryName in categoryDefinition) {
        const category = categoryDefinition[categoryName];
        level3Elements.push(createLevel3Element(domId, category, categoryName, level3Elements.length));
    }

    slot.replaceWith(...level3Elements);
}

function createModuleQuickTaskDisplay() {
    const slot = Dom.get().byId('modulesQuickTaskDisplay');
    const moduleQuickTaskDisplayElements = [];
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

        moduleQuickTaskDisplayElements.push(moduleQuickTaskDisplayElement);
    }
    slot.replaceWith(...moduleQuickTaskDisplayElements);
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
 * @param {EffectsHolder} effectsHolder
 * @param {EffectType} effectType
 * @param {string} name
 * @param {function():boolean} isActiveFn
 */
function createAttributeBalanceEntry(balanceElement, effectsHolder, effectType, name, isActiveFn) {
    const affectsEffectType = effectsHolder.getEffects()
        .find((effect) => effect.effectType === effectType) !== undefined;
    if (!affectsEffectType) return;

    const balanceEntryElement = Dom.new.fromTemplate('balanceEntryTemplate');
    const domGetter = Dom.get(balanceEntryElement);
    domGetter.byClass('name').textContent = '(' + name + ')';
    domGetter.byClass('operator').textContent = effectType.operator;
    attributeBalanceEntries.push({
        element: balanceEntryElement,
        effectType: effectType,
        taskOrItem: effectsHolder,
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
                    createAttributeBalanceEntry(balanceElement, operation, effectType,
                        module.title + ' ' + component.title + ': ' + operation.title,
                        () => gameData.currentOperations.hasOwnProperty(operation.name)
                    );
                }
            }
        }

        for (const poiName in pointsOfInterest) {
            const pointOfInterest = pointsOfInterest[poiName];
            createAttributeBalanceEntry(balanceElement, pointOfInterest, effectType,
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
    createAttributeBalance(militaryRow, [EffectType.Military]);
    rows.push(militaryRow);

    // Population
    const populationRow = createAttributeRow(attributes.population);
    const populationFormulaElement = Dom.get(populationRow).byClass('formula');
    populationFormulaElement.classList.remove('hidden');
    populationFormulaElement.innerHTML =
        createAttributeInlineHTML(attributes.growth) + ' - ' +
        createAttributeInlineHTML(attributes.population) + ' * 0.01 * ' +
        createAttributeInlineHTML(attributes.heat) + '<br />&wedgeq;<data value="0" class="delta">?</data> per cycle';
    rows.push(populationRow);

    // Research
    const researchRow = createAttributeRow(attributes.research);
    Dom.get(researchRow).byClass('balance').classList.remove('hidden');
    createAttributeBalance(researchRow, [EffectType.Research, EffectType.ResearchFactor]);
    rows.push(researchRow);

    slot.append(...rows);
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
        template.remove();
    }
}

function initSidebar() {
    const energyDisplayElement = document.querySelector('#energyDisplay');
    energyDisplayElement.addEventListener('click', () => {
        energyDisplayElement.classList.toggle('detailed');
    });
}

function updateModuleQuickTaskDisplay() {
    for (const moduleName in modules) {
        let container = Dom.get().bySelector('.quickTaskDisplayContainer.' + moduleName);
        if (!gameData.currentModules.hasOwnProperty(moduleName)) {
            container.classList.add('hidden');
            return;
        }

        const module = modules[moduleName];
        container.classList.remove('hidden');
        const containerDomGetter = Dom.get(container);
        for (const component of module.components) {
            const componentDomGetter = Dom.get(containerDomGetter.bySelector('.quickTaskDisplay.' + component.name));
            let currentOperation = component.currentOperation;
            // Operation classes are never removed, but who cares
            componentDomGetter.bySelector('.progressBar').classList.add(currentOperation.name);
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
 * @param {LayeredTask} currentTask
 * @param {HTMLElement} progressBar
 */
function setBattleProgress(currentTask, progressBar) {
    if (currentTask.isDone()) {
        Dom.get(progressBar).byClass('progressBackground').style.backgroundColor = lastLayerData.color;
        Dom.get(progressBar).byClass('progressFill').style.width = '0%';
        Dom.get(progressBar).byClass('name').textContent = currentTask.title + ' defeated!';
        return;
    }

    Dom.get().byId('battleName').textContent = currentTask.title;
    Dom.get(progressBar).byClass('name').textContent = currentTask.baseData.layerLabel + ' ' + (currentTask.maxLayers - currentTask.level);

    const progressBarFill = Dom.get(progressBar).byClass('progressFill');
    setProgress(progressBarFill, 1 - (currentTask.xp / currentTask.getMaxXp()), false);
    progressBarFill.style.backgroundColor = layerData[currentTask.level].color;

    if (currentTask.level < currentTask.maxLayers - 1 &&
        currentTask.level < layerData.length - 1
    ) {
        Dom.get(progressBar).byClass('progressBackground').style.backgroundColor = layerData[currentTask.level + 1].color;
    } else {
        Dom.get(progressBar).byClass('progressBackground').style.backgroundColor = lastLayerData.color;
    }
}

function updateBattleQuickTaskDisplay() {
    const currentTask = gameData.currentBattle;
    if (currentTask === null) return;

    const progressBar = document.querySelector(`.quickTaskDisplay .battle`);
    setBattleProgress(currentTask, progressBar);
}

function updateBattleTaskDisplay() {
    /** @type {LayeredTask} */
    const currentTask = gameData.currentBattle;
    if (currentTask === null) return;

    const progressBar = Dom.get().byId(currentTask.baseData.progressBarId);
    setBattleProgress(currentTask, progressBar);
}

/**
 *
 * @param {HTMLElement} progressFillElement
 * @param {number} progress between 0.0 and 1.0
 * @param {boolean} increasing set to false if its not a progress bar but a regress bar
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

function updateRequiredRows(categoryType) {
    const requiredRows = document.getElementsByClassName('requiredRow');
    for (const requiredRow of requiredRows) {
        let nextEntity = null;
        let category = categoryType[requiredRow.id];
        if (category === undefined) {
            continue;
        }
        for (let i = 0; i < category.length; i++) {
            let candidate = category[i];
            if (i >= category.length - 1) break;
            let requirements = gameData.requirements[candidate.name];
            if (requirements && i === 0) {
                if (!requirements.isCompleted()) {
                    nextEntity = candidate;
                    break;
                }
            }

            const nextIndex = i + 1;
            if (nextIndex >= category.length) {
                break;
            }
            candidate = category[nextIndex];
            let nextEntityRequirements = gameData.requirements[candidate.name];

            if (!nextEntityRequirements.isCompleted()) {
                nextEntity = candidate;
                break;
            }
        }

        if (nextEntity == null) {
            requiredRow.classList.add('hiddenTask');
        } else {
            requiredRow.classList.remove('hiddenTask');
            const requirementObject = gameData.requirements[nextEntity.name];
            let requirements = requirementObject.requirements;

            const energyStoredElement = requiredRow.getElementsByClassName('energy-stored')[0];
            const levelElement = requiredRow.getElementsByClassName('levels')[0];

            let finalText = [];
            if (categoryType === moduleCategories) {
                energyStoredElement.classList.add('hiddenTask');
                levelElement.classList.remove('hiddenTask');
                for (const requirement of requirements) {
                    const task = gameData.taskData[requirement.task];
                    if (task.level >= requirement.requirement) continue;
                    const text = requirement.task + ' level ' +
                        '<data value="' + task.level + '">' + task.level + '</data>' + '/' +
                        '<data value="' + requirement.requirement + '">' + requirement.requirement + '</data>';
                    finalText.push(text);
                }
                levelElement.innerHTML = finalText.join(', ');
            } else if (categoryType === sectors) {
                levelElement.classList.add('hiddenTask');
                energyStoredElement.classList.remove('hiddenTask');
                updateEnergyDisplay(
                    requirements[0].requirement,
                    energyStoredElement.getElementsByTagName('data')[0],
                    {unit: units.storedEnergy}
                );
            }
        }
    }
}

function updateModuleRows() {
    for (const moduleName in modules) {
        const module = modules[moduleName];
        const row = document.getElementById('module-row-' + module.name);
        const level = module.getLevel();
        const dataElement = row.querySelector('.level');
        formatValue(dataElement, level);
    }
}

function updateTaskRows() {
    for (const key in gameData.taskData) {
        const task = gameData.taskData[key];
        if (task instanceof GridStrength) continue;
        const row = document.getElementById('row_' + task.name);
        formatValue(row.querySelector('.level > data'), task.level, {keepNumber: true});
        formatValue(row.querySelector('.xpGain > data'), task.getXpGain());
        formatValue(row.querySelector('.xpLeft > data'), task.getXpLeft());

        let maxLevel = row.querySelector('.maxLevel > data');
        formatValue(maxLevel, task.maxLevel, {keepNumber: true});
        maxLevel = maxLevel.parentElement;
        gameData.rebirthOneCount > 0 ? maxLevel.classList.remove('hidden') : maxLevel.classList.add('hidden');

        const progressFill = row.getElementsByClassName('progressFill')[0];
        setProgress(progressFill, task.xp / task.getMaxXp());
        if (task instanceof ModuleOperation && gameData.currentOperations.hasOwnProperty(task.name)) {
            progressFill.classList.add('current');
        } else {
            progressFill.classList.remove('current');
        }

        const valueElement = row.getElementsByClassName('value')[0];
        valueElement.getElementsByClassName('energy-generated')[0].style.display = task instanceof Job ? 'block' : 'none';
        //TODO 'Skill' feature leftovers
        valueElement.getElementsByClassName('effect')[0].style.display = 'none';
        const skipSkillElement = row.getElementsByClassName('skipSkill')[0];
        skipSkillElement.style.display = 'none';

        if (task instanceof Job) {
            valueElement.getElementsByClassName('energy-generated')[0].textContent = task.getEffectDescription();
        } else {
            valueElement.getElementsByClassName('effect')[0].textContent = task.getEffectDescription();
        }
    }
}

function updateSectorRows() {
    for (const key in pointsOfInterest) {
        const pointOfInterest = pointsOfInterest[key];
        const row = document.getElementById('row_' + pointOfInterest.name);
        const domGetter = Dom.get(row);
        const isActive = pointOfInterest === gameData.currentPointOfInterest;
        domGetter.byClass('active').style.backgroundColor = isActive ? 'rgb(12, 101, 173)' : 'white';
        domGetter.byClass('button').classList.toggle('btn-dark', !isActive);
        domGetter.byClass('button').classList.toggle('btn-warning', isActive);
        domGetter.byClass('effect').textContent = pointOfInterest.getEffectDescription();
        domGetter.byClass('danger').textContent = pointOfInterest.getEffect(EffectType.Danger);
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
                balanceEntry.taskOrItem.getEffect(balanceEntry.effectType)
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
    //TODO Raoul: Update for Grid Strength
    const energyDisplayElement = document.getElementById('energyDisplay');
    updateEnergyDisplay(attributes.gridStrength.getValue(), energyDisplayElement.querySelector('.energy-generated > data'));
    updateEnergyDisplay(getRemainingGridStrength(), energyDisplayElement.querySelector('.energy-net > data'), {forceSign: true});
    updateEnergyDisplay(0, energyDisplayElement.querySelector('.energy-stored > data'), {unit: units.storedEnergy});
    updateEnergyDisplay(getMaxEnergy(), energyDisplayElement.querySelector('.energy-max > data'), {unit: units.storedEnergy});
    updateEnergyDisplay(attributes.gridLoad.getValue(), energyDisplayElement.querySelector('.energy-usage > data'));
    setProgress(energyDisplayElement.querySelector('.energy-fill'), gridStrength.xp / gridStrength.getMaxXp());
}

// TODO fully borked. This need to be adjusted after a working heat formula is found
function updateHeatDisplay() {
    const heat = attributes.heat.getValue();
    let heatText = (heat * 100).toFixed(1) + '%';
    let color;
    if (heat < 0.5) {
        color = lerpColor(
            dangerColors[0],
            dangerColors[1],
            heat / 0.5,
            'RGB'
        ).toString('rgb');
    } else {
        color = lerpColor(
            dangerColors[1],
            dangerColors[2],
            (heat - 0.5) / 0.5,
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
    formatValue(Dom.get().byId('populationDisplay'), population);
    formatValue(Dom.get().bySelector('#attributeRows > .population .value'), population);
    formatValue(Dom.get().bySelector('#attributeRows > .population .delta'), populationDelta());

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
    for (const key in gameData.requirements) {
        const requirement = gameData.requirements[key];
        const completed = requirement.isCompleted();
        for (const element of requirement.elements) {
            if (completed) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    }
}

function updateBodyClasses() {
    document.getElementById('body').classList.toggle('game-paused', !isPlaying());
    document.getElementById('body').classList.toggle('game-playing', isPlaying());
}

function doTasks() {
    const modules = gameData.currentModules;
    if (modules !== null) {
        for (const moduleName in modules) {
            const module = modules[moduleName];
            module.do();
        }
    }

    /*
    const tasks = gameData.currentOperations;
    if (tasks !== null){
        for (const taskName in tasks){
            const task = tasks[taskName];
            if(task != null)
                task.do();
        }
    }*/

    // Legacy
    doTask(gameData.currentBattle);
    doTask(gridStrength);
}

function doTask(task) {
    if (task == null) return;
    task.do();
}

function getEnergyGeneration() {
    let energy = 0;
    const tasks = gameData.currentOperations;
    if (tasks !== null) {
        for (const taskName in tasks) {
            const task = tasks[taskName];
            if (task != null) {
                energy += task.getEnergyGeneration();
            }
        }
        for (const taskName in tasks) {
            const task = tasks[taskName];
            if (task != null) {
                const multiplier = task.getEnergyMultiplier();
                if (multiplier !== 1 && energy === 0) {
                    energy = 1;
                }
                energy *= multiplier;
            }
        }
    }
    return energy;
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
    setDefaultCurrentValues();
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
 * @param {{prefixes?: string[], unit?: string, forceSign?: boolean, keepNumber?: boolean}} config
 */
function formatValue(dataElement, value, config = {}) {
    // TODO render full number + unit into dataElement.title
    dataElement.value = String(value);

    const toString = (value) => {
        if (Number.isInteger(value)) {
            return value.toFixed(0);
        } else if (Math.abs(value) < 1) {
            return value.toFixed(2);
        } else {
            return value.toPrecision(3);
        }
    };

    const defaultConfig = {
        prefixes: magnitudes,
        unit: '',
        forceSign: false,
        keepNumber: false,
    };
    config = Object.assign({}, defaultConfig, config);

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

function getTaskElement(taskName) {
    const task = gameData.taskData[taskName];
    if (task == null) {
        console.log('Task not found in data: ' + taskName);
        return;
    }
    return document.getElementById(task.id);
}

function getBattleElement(taskName) {
    const task = gameData.battleData[taskName];
    if (task == null) {
        console.log('Battle not found in data: ' + taskName);
        return;
    }
    return document.getElementById(task.baseData.progressBarId);
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
    const battle = gameData.battleData[name];
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
    setTab(tabButtons.jobs, 'jobs');

    setDefaultGameDataValues();
    setPermanentUnlocksAndResetData();
}

function setPermanentUnlocksAndResetData() {
    for (const taskName in gameData.taskData) {
        const task = gameData.taskData[taskName];
        task.updateMaxLevelAndReset();
    }

    for (const battleName in gameData.battleData) {
        const battle = gameData.battleData[battleName];
        battle.updateMaxLevelAndReset();
    }

    for (const key in gameData.requirements) {
        const requirement = gameData.requirements[key];
        if (requirement.completed && permanentUnlocks.includes(key)) continue;
        requirement.completed = false;
    }

    for (const key in modules) {
        const module = modules[key];
        module.updateMaxLevel();
    }
}

function resetMaxLevels() {
    for (const taskName in gameData.taskData) {
        const task = gameData.taskData[taskName];
        task.maxLevel = 0;
    }
    for (const battleName in gameData.battleData) {
        const battle = gameData.battleData[battleName];
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

function assignMethods() {
    for (const key in gameData.battleData) {
        let battle = gameData.battleData[key];
        battle.baseData = battleBaseData[battle.name];
        battle = Object.assign(new Battle(battleBaseData[battle.name]), battle);
        gameData.battleData[key] = battle;
    }

    for (const key in gameData.requirements) {
        let requirement = gameData.requirements[key];
        switch (requirement.type) {
            case 'TaskRequirement':
                requirement = Object.assign(new TaskRequirement(requirement.elements, requirement.requirements), requirement);
                break;
            case 'GridStrengthRequirement':
                requirement = Object.assign(new GridStrengthRequirement(requirement.elements, requirement.requirements), requirement);
                break;
            case 'AgeRequirement':
                requirement = Object.assign(new AgeRequirement(requirement.elements, requirement.requirements), requirement);
                break;
            case 'ResearchRequirement':
                requirement = Object.assign(new AgeRequirement(requirement.elements, requirement.requirements), requirement);
                break;
        }

        const tempRequirement = tempData['requirements'][key];
        requirement.elements = tempRequirement.elements;
        requirement.requirements = tempRequirement.requirements;
        gameData.requirements[key] = requirement;
    }

    gameData.currentPointOfInterest = pointsOfInterest[gameData.currentPointOfInterest.name];
    if (gameData.currentBattle !== null) {
        startBattle(gameData.currentBattle.name);
    }
}

function replaceSaveDict(dict, saveDict) {
    for (const key in dict) {
        if (dict === gameData.taskData && (dict[key] instanceof Job || dict[key] instanceof GridStrength)) {
            assignAndReplaceSavedTaskObject(dict[key], saveDict);
        } else if (dict === gameData.requirements) {
            if (!(key in saveDict)) {
                saveDict[key] = dict[key];
            }
            if (saveDict[key].type !== tempData['requirements'][key].type) {
                saveDict[key] = tempData['requirements'][key];
            }
        }
    }

    for (const key in saveDict) {
        if (!(key in dict)) {
            delete saveDict[key];
        }
    }
}

function assignAndReplaceSavedTaskObject(object, saveDict) {
    const key = object.name;
    if (key in saveDict) {
        object.assignSaveData(saveDict[key]);
    }
    saveDict[key] = object;
}

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
            object.loadSaveData(saveData[id]);
        }
    }
}

function loadGameData() {
    const gameDataSave = JSON.parse(localStorage.getItem('gameDataSave'));

    if (gameDataSave !== null) {
        assignDictFromSaveData(modules, gameDataSave.moduleSaveData);
        replaceSaveDict(gameData, gameDataSave);
        replaceSaveDict(gameData.requirements, gameDataSave.requirements);
        replaceSaveDict(gameData.taskData, gameDataSave.taskData);
        replaceSaveDict(gameData.battleData, gameDataSave.battleData);

        for (const id in gameDataSave.currentOperations) {
            gameDataSave.currentOperations[id] = moduleOperations[id];
        }
        for (const id in gameDataSave.currentModules) {
            //Migrate "current" modules before replacing save data, currentModules should probably be just strings in future.
            const override = modules[id];
            for (const component of override.components) {
                const saved = gameDataSave.currentModules[id].components.find((element) => element.name === component.name);
                if (saved.currentOperation === null || saved.currentOperation === undefined) continue;
                if (moduleOperations.hasOwnProperty(saved.currentOperation.name)) {
                    component.currentMode = moduleOperations[saved.currentOperation.name];
                }
            }
            modules[id].setEnabled(true);
            gameDataSave.currentModules[id] = modules[id];
        }

        gameData = gameDataSave;
    } else {
        GameEvents.NewGameStarted.trigger(undefined);
    }

    assignMethods();
}

function updateUI() {
    updateTaskRows();
    updateModuleRows();
    updateSectorRows();
    updateRequiredRows(moduleCategories);
    updateRequiredRows(sectors);
    updateHeaderRows();
    updateModuleQuickTaskDisplay();
    updateBattleQuickTaskDisplay();
    updateBattleTaskDisplay();
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
    localStorage.clear();
    location.reload();
}

function rerollStationName() {
    setStationName(stationNameGenerator.generate());
}

function importGameData() {
    const importExportBox = document.getElementById('importExportBox');
    gameData = JSON.parse(window.atob(importExportBox.value));
    saveGameData();
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

        setTab(tabButtons.settings, 'settings');
    });
    for (const stationNameInput of Dom.get().allByClass('stationNameInput')) {
        stationNameInput.placeholder = emptyStationName;
        stationNameInput.addEventListener('input', (event) => {
            setStationName(event.target.value);
        });
    }
}

function setDefaultGameDataValues() {
    setDefaultCurrentValues();
}

function setDefaultCurrentValues() {
    gameData.currentPointOfInterest = defaultPointOfInterest;
    gameData.currentModules = {};
    gameData.currentOperations = {};

    for (const module of defaultModules) {
        module.setEnabled(false);
    }
}

function startBattle(name) {
    setBattle(name);
    const progressBar = document.getElementById('battleProgressBar');
    progressBar.hidden = false;
}

function concedeBattle() {
    gameData.currentBattle = null;
    GameEvents.GameOver.trigger({
        bossDefeated: false,
    });
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
        val.id = 'row_' + key;
    }
}

function initConfigNames() {
    for (const [key, module] of Object.entries(moduleOperations)) {
        module.name = key;
        module.baseData.name = key;
    }

    assignNames(attributes);
    assignNames(moduleComponents);
    assignNames(modules);
    assignNames(moduleCategories);
    assignNames(battleBaseData);
    assignNames(sectors);
    assignNames(pointsOfInterest);
}

function init() {
    // During the setup a lot of functions are called that trigger an auto save. To not save various times,
    // saving is skipped until the game is actually under player control.
    skipGameDataSave = true;

    initConfigNames();

    createModulesUI(moduleCategories, 'jobTable');
    createSectorsUI(sectors, 'sectorTable');
    createModuleQuickTaskDisplay();

    adjustLayout();

    initSidebar();

    //direct ref assignment - taskData could be replaced
    for (const entityData of Object.values(moduleOperations)) {
        entityData.id = 'row_' + entityData.name;
        gameData.taskData[entityData.name] = entityData;
    }
    createData(gameData.battleData, battleBaseData);
    gameData.taskData[gridStrength.name] = gridStrength;

    setDefaultCurrentValues();

    gameData.requirements = createRequirements(getTaskElement, getPointOfInterestElement);

    tempData['requirements'] = {};
    for (const key in gameData.requirements) {
        tempData['requirements'][key] = gameData.requirements[key];
    }

    loadGameData();

    createAttributeDescriptions(createAttributeInlineHTML);
    createAttributesUI();

    //setCustomEffects();
    addMultipliers();

    //Init and enable/disable modules
    for (const id in modules) {
        const module = modules[id];
        module.init();
    }

    if (tabButtons.hasOwnProperty(gameData.selectedTab)) {
        setTab(tabButtons[gameData.selectedTab], gameData.selectedTab);
    } else {
        setTab(tabButtons.jobs, 'jobs');
    }
    initTooltips();
    initStationName();
    initSettings();

    cleanUpDom();

    skipGameDataSave = false;
    displayLoaded();

    update();
    setInterval(update, 1000 / updateSpeed);
    setInterval(saveGameData, 3000);
}

init();
