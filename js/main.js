'use strict';

/**
 * @type {GameData}
 */
let gameData;

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

/**
 *
 * @type {Object<HTMLElement>}
 */
const tabButtons = {
    modules: document.getElementById('modulesTabButton'),
    location: document.getElementById('locationTabButton'),
    battles: document.getElementById('battleTabButton'),
    galacticSecrets: document.getElementById('galacticSecretsTabButton'),
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

function applySpeed(value) {
    return value * getGameSpeed() / updateSpeed;
}

function calculateHeat() {
    const danger = attributes.danger.getValue();
    const military = attributes.military.getValue();
    const rawHeat = Effect.getTotalValue([EffectType.Heat]);
    const calculatedHeat = Math.max(danger - military, 0) + rawHeat;

    return calculatedHeat;
}

function populationDelta() {
    const growth = attributes.growth.getValue() / 10;
    const heat = attributes.heat.getValue();
    const population = attributes.population.getValue();
    return growth - population * 0.01 * heat;
}

function updatePopulation() {
    if (!gameData.state.areAttributesUpdated) return;

    gameData.population += applySpeed(populationDelta());
    gameData.population = Math.max(gameData.population, 1);

    if (gameData.state === gameStates.BOSS_FIGHT && Math.round(gameData.population) === 1) {
        gameData.transitionState(gameStates.DEAD);
    }
}

function getPopulationProgressSpeedMultiplier() {
    // Random ass formula ᕕ( ᐛ )ᕗ
    // Pop 1 = x1
    // Pop 10 ~= x3.4
    // Pop 100 ~= x12
    // Pop 1000 ~= x40
    // Pop 10000 ~= x138
    // Pop 40000 ~= x290
    return Math.max(1, Math.pow(Math.round(gameData.population), 1 / 1.869));
}

function getGameSpeed() {
    return baseGameSpeed;
}

function hideAllTooltips() {
    for (const tooltipTriggerElement of visibleTooltips) {
        // noinspection JSUnresolvedReference
        bootstrap.Tooltip.getInstance(tooltipTriggerElement).hide();
    }
}

/**
 * @param {string} selectedTab
 */
function setTab(selectedTab) {
    if (tabButtons[selectedTab].classList.contains('hidden')) {
        // Tab is not available
        return;
    }

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
    gameData.save();

    hideAllTooltips();
}

// noinspection JSUnusedGlobalSymbols -- used in HTML
function togglePause() {
    switch (gameData.state) {
        case gameStates.PLAYING:
            gameData.transitionState(gameStates.PAUSED);
            break;
        case gameStates.PAUSED:
            gameData.transitionState(gameStates.PLAYING);
            break;
        case gameStates.BOSS_FIGHT:
            gameData.transitionState(gameStates.BOSS_FIGHT_PAUSED);
            break;
        case gameStates.BOSS_FIGHT_PAUSED:
            gameData.transitionState(gameStates.BOSS_FIGHT);
            break;
    }
    // Any other state is ignored
}

function setPointOfInterest(name) {
    if (!gameData.state.canChangeActivation) {
        VFX.shakePlayButton();
        return;
    }

    gameData.activeEntities.pointOfInterest = name;
}

/**
 * @param {Module} module
 */
function switchModuleActivation(module) {
    if (!gameData.state.canChangeActivation) {
        VFX.shakePlayButton();
        return;
    }

    if (module.isActive()) {
        module.setActive(false);
        return;
    }

    const gridLoadAfterActivation = attributes.gridLoad.getValue() + module.getGridLoad();
    if (gridLoadAfterActivation > attributes.gridStrength.getValue()) {
        VFX.highlightText(Dom.get().bySelector(`#${module.domId} .gridLoad`), 'flash-text-denied', 'flash-text-denied');
        return;
    }

    module.setActive(true);
}

/**
 * @param {ModuleComponent} component
 * @param {ModuleOperation} operation
 */
function tryActivateOperation(component, operation) {
    if (operation.isActive('self')) {
        // Already active, nothing to do
        return;
    }

    const gridLoadAfterActivation = attributes.gridLoad.getValue()
        + operation.getGridLoad()
        - component.getActiveOperation().getGridLoad();
    if (gridLoadAfterActivation > attributes.gridStrength.getValue()) {
        VFX.highlightText(Dom.get().bySelector(`#${operation.domId} .gridLoad`), 'flash-text-denied', 'flash-text-denied');
        return;
    }

    // This needs to go through the component as it needs to disable other operations
    component.activateOperation(operation);
}

/**
 * @param {string} domId
 *
 * @return {HTMLElement}
 */
function createRequiredRow(domId) {
    const requirementsElement = Dom.new.fromTemplate('level4RequiredTemplate');
    requirementsElement.id = domId;
    requirementsElement.classList.add('level4-requirements');
    return requirementsElement;
}

/**
 * @param {string} categoryName
 * @param {ModuleComponent} component
 *
 * @returns {HTMLElement[]}
 */
function createModuleLevel4Elements(categoryName, component) {
    const level4Elements = [];
    const operations = component.operations;

    for (const operation of operations) {
        const level4Element = Dom.new.fromTemplate('level4TaskTemplate');
        level4Element.id = operation.domId;

        const level4DomGetter = Dom.get(level4Element);
        level4DomGetter.byClass('name').textContent = operation.title;
        const descriptionElement = level4DomGetter.byClass('descriptionTooltip');
        descriptionElement.ariaLabel = operation.title;
        if (isDefined(operation.description)) {
            descriptionElement.title = operation.description;
        } else {
            descriptionElement.removeAttribute('title');
        }
        level4DomGetter.byClass('progressBar').addEventListener('click', tryActivateOperation.bind(this, component, operation));
        formatValue(level4DomGetter.bySelector('.gridLoad > data'), operation.getGridLoad());

        level4Elements.push(level4Element);
    }

    level4Elements.push(createRequiredRow('row_requirements_component_' + component.name));

    return level4Elements;
}

/**
 * @param {string} categoryName
 * @param {Module} module
 * @param {HTMLSlotElement} requirementsSlot
 *
 * @return {HTMLElement[]}
 */
function createModuleLevel3Elements(categoryName, module, requirementsSlot) {
    const level3Elements = [];

    for (const component of module.components) {
        const level3Element = Dom.new.fromTemplate('level3TaskTemplate');
        level3Element.id = component.domId;

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

    const requirementsElement = Dom.new.fromTemplate('requirementsTemplate');
    requirementsElement.id = 'row_requirements_module_' + module.name;
    requirementsElement.classList.add('level3-requirements');
    requirementsSlot.replaceWith(requirementsElement);

    return level3Elements;
}

/**
 *
 * @param {string} categoryName
 * @param {ModuleCategory} category
 * @param {HTMLSlotElement} requirementsSlot
 * @return {HTMLElement[]}
 */
function createModuleLevel2Elements(categoryName, category, requirementsSlot) {
    const level2Elements = [];

    for (const module of category.modules) {
        const level2Element = Dom.new.fromTemplate('level2Template');
        level2Element.id = module.domId;

        const level2DomGetter = Dom.get(level2Element);
        const nameCell = level2DomGetter.byClass('name');
        nameCell.textContent = module.title;
        if (isDefined(module.description)) {
            nameCell.title = module.description;
        } else {
            nameCell.removeAttribute('title');
        }
        /** @var {HTMLInputElement} */
        const switchElement = level2DomGetter.byClass('moduleActivationSwitch');
        switchElement.id = 'switch_' + module.name;
        switchElement.addEventListener('click', switchModuleActivation.bind(this, module));
        level2DomGetter.byClass('moduleActivationLabel').for = switchElement.id;
        initTooltip(level2DomGetter.byClass('maxLevel'), {
            title: () => {
                return `<b>x${(1 + module.maxLevel / 100).toFixed(2)} XP</b> for all operations in this module.`;
            },
            html: true,
        });

        const level3Slot = level2DomGetter.byId('level3');
        level3Slot.replaceWith(...createModuleLevel3Elements(categoryName, module, level2DomGetter.byId('level3Requirements')));

        level2Elements.push(level2Element);
    }

    const requirementsElement = Dom.new.fromTemplate('requirementsTemplate');
    requirementsElement.id = 'row_requirements_category_' + categoryName;
    requirementsElement.classList.add('level2-requirements');
    requirementsSlot.replaceWith(requirementsElement);

    return level2Elements;
}

function createModulesUI(categoryDefinition, domId) {
    const slot = Dom.get().byId(domId);
    const level1Elements = [];

    for (const key in categoryDefinition) {
        const level1Element = Dom.new.fromTemplate('level1Template');

        /** @var {ModuleCategory} */
        const category = categoryDefinition[key];
        level1Element.id = category.domId;
        level1Element.classList.add(category.name);

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
        level2Slot.replaceWith(...createModuleLevel2Elements(category.name, category, level1DomGetter.byId('level2Requirements')));

        level1Elements.push(level1Element);
    }

    slot.replaceWith(...level1Elements);

    const requirementsElement = Dom.new.fromTemplate('requirementsTemplate');
    requirementsElement.id = 'row_requirements_moduleCategory';
    requirementsElement.classList.add('level1-requirements');
    Dom.get().byId('moduleCategoryRequirements').replaceWith(requirementsElement);
}

/**
 *
 * @param {PointOfInterest[]} pointsOfInterest
 * @param {string} sectorName
 * @return {HTMLElement[]}
 */
function createLevel4SectorElements(pointsOfInterest, sectorName) {
    const level4Elements = [];
    for (const pointOfInterest of pointsOfInterest) {
        const level4Element = Dom.new.fromTemplate('level4PointOfInterestTemplate');
        level4Element.id = pointOfInterest.domId;

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

    level4Elements.push(createRequiredRow('row_requirements_sector_' + sectorName));
    return level4Elements;
}

/**
 *
 * @param {Sector} sector
 * @param {string} sectorName
 * @return {HTMLElement}
 */
function createLevel3SectorElement(sector, sectorName) {
    const level3Element = Dom.new.fromTemplate('level3PointOfInterestTemplate');

    level3Element.id = sector.domId;
    level3Element.classList.add(sectorName);
    level3Element.classList.remove('ps-3');

    const level3DomGetter = Dom.get(level3Element);
    level3DomGetter.byClass('header-row').style.backgroundColor = sector.color;
    const nameCell = level3DomGetter.byClass('name');
    nameCell.textContent = sector.title;
    if (isDefined(sector.description)) {
        nameCell.title = sector.description;
    } else {
        nameCell.removeAttribute('title');
    }

    /** @type {HTMLElement} */
    const level4Slot = level3DomGetter.byClass('level4');
    level4Slot.append(...createLevel4SectorElements(sector.pointsOfInterest, sectorName));
    return level3Element;
}

/**
 * Due to styling reasons, the two rendered levels are actually level 3 + 4 - don't get confused.
 * @param {Object<Sector>} categoryDefinition
 * @param {string} domId
 */
function createSectorsUI(categoryDefinition, domId) {
    const slot = Dom.get().byId(domId);
    const level3Elements = [];

    for (const key in categoryDefinition) {
        const sector = categoryDefinition[key];
        const sectorElement = createLevel3SectorElement(sector, sector.name);
        if (level3Elements.length === 0) {
            sectorElement.classList.remove('mt-2');
        }
        level3Elements.push(sectorElement);
    }

    slot.replaceWith(...level3Elements);

    const requirementsElement = Dom.new.fromTemplate('requirementsTemplate');
    requirementsElement.id = 'row_requirements_sector';
    requirementsElement.classList.add('level1-requirements');
    Dom.get().byId('sectorRequirements').replaceWith(requirementsElement);
}

/**
 *
 * @param {DomGetter} domGetter
 * @param {Battle} battle
 */
function initializeBattleElement(domGetter, battle) {
    domGetter.byClass('name').textContent = battle.title;
    const descriptionElement = domGetter.byClass('descriptionTooltip');
    descriptionElement.ariaLabel = battle.title;
    if (isDefined(battle.description)) {
        descriptionElement.title = battle.description;
    } else {
        descriptionElement.removeAttribute('title');
    }
}

/**
 *
 * @param {Battle[]} battles
 * @return {HTMLElement[]}
 */
function createLevel4BattleElements(battles) {
    const level4Elements = [];
    for (const battle of battles) {
        const level4Element = Dom.new.fromTemplate('level4BattleTemplate');
        level4Element.id = battle.domId;
        const domGetter = Dom.get(level4Element);
        initializeBattleElement(domGetter, battle);
        domGetter.byClass('rewards').textContent = battle.getRewardsDescription();
        const clickListener = () => {
            if (!gameData.state.canChangeActivation) {
                VFX.shakePlayButton();
                return;
            }

            if (battle instanceof BossBattle){
                gameData.transitionState(gameStates.BOSS_FIGHT_INTRO);
            } else {
                battle.toggle();
            }
        };
        domGetter.byClass('progressBar').addEventListener('click', clickListener);
        domGetter.byClass('progressFill').classList.toggle('bossBattle', battle instanceof BossBattle);
        domGetter.byClass('radio').addEventListener('click', clickListener);
        if (battle instanceof BossBattle) {
            domGetter.byClass('danger').innerHTML = battle.getEffectDescription();
        } else {
            formatValue(domGetter.bySelector('.danger > data'), battle.getEffect(EffectType.Danger));
        }

        level4Elements.push(level4Element);
    }

    level4Elements.push(createRequiredRow('row_requirements_battle'));
    return level4Elements;
}

function createUnfinishedBattlesUI() {
    const level3Element = Dom.new.fromTemplate('level3BattleTemplate');

    level3Element.id = 'unfinishedBattles';
    level3Element.classList.remove('ps-3');

    const domGetter = Dom.get(level3Element);
    domGetter.byClass('header-row').style.backgroundColor = colorPalette.TomatoRed;
    domGetter.byClass('name').textContent = 'Open';

    /** @type {HTMLElement} */
    const level4Slot = domGetter.byClass('level4');
    level4Slot.append(...createLevel4BattleElements(Object.values(battles)));

    return level3Element;
}

/**
 *
 * @param {Battle[]} battles
 * @return {HTMLElement[]}
 */
function createLevel4FinishedBattleElements(battles) {
    const level4Elements = [];
    for (const battle of battles) {
        const level4Element = Dom.new.fromTemplate('level4BattleTemplate');
        level4Element.id = 'row_done_' + battle.name;
        level4Element.classList.add('hidden');
        const domGetter = Dom.get(level4Element);
        initializeBattleElement(domGetter, battle);
        domGetter.bySelector('.progressBar .progressBackground').style.backgroundColor = lastLayerData.color;
        domGetter.bySelector('.progressBar .progressFill').style.width = '0%';
        domGetter.byClass('action').classList.add('hidden');
        formatValue(
            domGetter.bySelector('.level > data'),
            battle.targetLevel,
            {keepNumber: true},
        );
        domGetter.byClass('xpGain').classList.add('hidden');
        domGetter.byClass('xpLeft').classList.add('hidden');
        domGetter.byClass('danger').classList.add('hidden');
        domGetter.byClass('rewards').textContent = battle.getRewardsDescription();

        // unshift --> battles in reverse order
        level4Elements.unshift(level4Element);
    }

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
    level4Slot.append(...createLevel4FinishedBattleElements(Object.values(battles)));

    return level3Element;
}

function createBattlesUI(categoryDefinition, domId) {
    const slot = Dom.get().byId(domId);
    slot.replaceWith(createUnfinishedBattlesUI(), createFinishedBattlesUI());
}

function createGalacticSecretsUI() {
    const level4Elements = [];
    for (const key in galacticSecrets) {
        const galacticSecret = galacticSecrets[key];
        const level4Element = Dom.new.fromTemplate('level4GalacticSecretTemplate');
        level4Element.id = galacticSecret.domId;
        const domGetter = Dom.get(level4Element);
        domGetter.byClass('component').textContent = galacticSecret.unlocks.component.title;
        domGetter.byClass('operation').textContent = galacticSecret.unlocks.title;
        const descriptionElement = domGetter.byClass('descriptionTooltip');
        descriptionElement.ariaLabel = galacticSecret.title;
        if (isDefined(galacticSecret.description)) {
            descriptionElement.title = galacticSecret.description;
        } else {
            descriptionElement.removeAttribute('title');
        }
        domGetter.bySelector('.progressBar .progressFill').style.width = '0%';

        domGetter.byClass('parent').textContent = galacticSecret.unlocks.module.title;
        domGetter.byClass('effect').textContent = galacticSecret.unlocks.getEffectDescription(1);
        formatValue(domGetter.bySelector('.gridLoad > data'), galacticSecret.unlocks.getGridLoad());

        domGetter.byClass('progressBar').addEventListener('pointerdown', (event) => {
            if (galacticSecret.isUnlocked) return;

            const galacticSecretCost = calculateGalacticSecretCost();
            if (galacticSecretCost > gameData.essenceOfUnknown) {
                visuallyDenyGalacticSecretUnlock(galacticSecret);
                return;
            }

            const tooltip = bootstrap.Tooltip.getInstance(event.currentTarget);
            if (tooltip !== null) {
                tooltip.hide();
                tooltip.disable();
            }
            galacticSecret.inProgress = true;
        });

        level4Elements.push(level4Element);
    }

    window.addEventListener('pointerup', () => {
        for (const key in galacticSecrets) {
            const galacticSecret = galacticSecrets[key];
            galacticSecret.inProgress = false;
            const tooltip = bootstrap.Tooltip.getInstance(Dom.get().bySelector('#' + galacticSecret.domId + ' .progressBar'));
            if (tooltip !== null) {
                tooltip.enable();
            }
        }
    });

    const level4Slot = Dom.get().bySelector('#galacticSecrets tbody.level4');
    level4Slot.append(...level4Elements);
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
            for (const operation of component.operations) {
                const componentQuickTaskDisplayElement = Dom.new.fromTemplate('componentQuickTaskDisplayTemplate');
                componentQuickTaskDisplayElement.title = component.title + ': ' + operation.title;
                const componentDomGetter = Dom.get(componentQuickTaskDisplayElement);
                componentQuickTaskDisplayElement.classList.add(component.name, operation.name);
                componentDomGetter.bySelector('.name > .component').textContent = component.title;
                componentDomGetter.bySelector('.name > .operation').textContent = operation.title;
                componentQuickTaskDisplayElements.push(componentQuickTaskDisplayElement);
            }
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
        const domGetter = Dom.get(quickDisplayElement);
        quickDisplayElement.classList.add(battle.name);
        domGetter.byClass('name').textContent = battle.title;
        domGetter.byClass('progressFill').classList.toggle('bossBattle', battle instanceof BossBattle);

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

        const balanceEntryElement = Dom.new.fromTemplate('balanceEntryTemplate');
        const domGetter = Dom.get(balanceEntryElement);
        domGetter.byClass('operator').textContent = '';
        if (onlyMultipliers) {
            domGetter.byClass('entryValue').textContent = '1';
        } else {
            domGetter.byClass('entryValue').textContent = '0';
        }
        domGetter.byClass('name').textContent = '(Base)';
        balanceElement.append(balanceEntryElement);

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
                        module.title + ': ' + component.title + ': ' + operation.title,
                        operation.isActive.bind(operation, 'inHierarchy'),
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
                battle.isDone.bind(battle),
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

        for (const key in pointsOfInterest) {
            const pointOfInterest = pointsOfInterest[key];
            createAttributeBalanceEntry(
                balanceElement,
                pointOfInterest.getEffect.bind(pointOfInterest),
                pointOfInterest.getEffects.bind(pointOfInterest),
                effectType,
                'Point of Interest: ' + pointOfInterest.title,
                pointOfInterest.isActive.bind(pointOfInterest),
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
                domGetter.byClass('name').textContent = '(' + module.title + ': ' + component.title + ': ' + operation.title + ')';
                domGetter.byClass('operator').textContent = '+';
                formatValue(domGetter.byClass('entryValue'), operation.getGridLoad());
                gridLoadBalanceEntries.push({
                    element: balanceEntryElement,
                    taskOrItem: operation,
                    isActive: operation.isActive.bind(operation, 'inHierarchy'),
                });
                balanceElement.append(balanceEntryElement);
            }
        }
    }
}

function createAttributesDisplay() {
    const attributeContainers = Dom.get().allBySelector('[data-attribute]');
    for (/** @var {HTMLElement} */ const attributeContainer of attributeContainers) {
        /** @var {AttributeDefinition} */
        const attribute = attributes[attributeContainer.dataset.attribute];
        const domGetter = Dom.get(attributeContainer);
        attributeContainer.dataset.bsTitle = attribute.description;
        const iconElement = domGetter.byClass('icon');
        iconElement.src = attribute.icon;
        iconElement.alt = attribute.title + ' icon';
        const labelElement = domGetter.byClass('label');
        labelElement.style.color = attribute.color;
        labelElement.textContent = attribute.title;
    }
}

function createAttributesUI() {
    const slot = Dom.get().byId('attributeRows');
    const rows = [];

    // Danger
    const dangerRow = createAttributeRow(attributes.danger);
    Dom.get(dangerRow).byClass('balance').classList.remove('hidden');
    createAttributeBalance(dangerRow, [EffectType.Danger, EffectType.DangerFactor]);
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
    createAttributeBalance(growthRow, [EffectType.Growth, EffectType.GrowthFactor]);
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
    createAttributeBalance(industryRow, [EffectType.Industry, EffectType.IndustryFactor]);
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
    const tooltipText = createGridStrengthAndLoadDescription(createAttributeInlineHTML);
    Dom.get().byId('gridLabel').title = tooltipText;
    Dom.get().byId('gridStrength').title = tooltipText;

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

function updateModulesQuickDisplay() {
    for (const key in modules) {
        const module = modules[key];
        let container = Dom.get().bySelector('.quickTaskDisplayContainer.' + module.name);
        if (!module.isActive()) {
            container.classList.add('hidden');
            continue;
        }

        container.classList.remove('hidden');
        const containerDomGetter = Dom.get(container);
        for (const component of module.components) {
            for (const operation of component.operations) {
                let quickDisplayElement = containerDomGetter.bySelector('.quickTaskDisplay.' + component.name + '.' + operation.name);
                const componentDomGetter = Dom.get(quickDisplayElement);

                if (!operation.isActive('self')) {
                    quickDisplayElement.classList.add('hidden');
                    continue;
                }

                quickDisplayElement.classList.remove('hidden');
                formatValue(
                    componentDomGetter.bySelector('.name > .level'),
                    operation.level,
                    {keepNumber: true},
                );
                setProgress(componentDomGetter.byClass('progressFill'), operation.xp / operation.getMaxXp());
            }
        }
    }
}

/**
 *
 * @param {HTMLElement} progressBar
 * @param {LayeredTask} battle
 */
function setBattleProgress(progressBar, battle) {
    const domGetter = Dom.get(progressBar);
    if (battle.isDone()) {
        domGetter.byClass('progressBackground').style.backgroundColor = lastLayerData.color;
        domGetter.byClass('progressFill').style.width = '0%';
        return;
    }

    const progressBarFill = domGetter.byClass('progressFill');
    setProgress(progressBarFill, 1 - (battle.xp / battle.getMaxXp()), false);

    if (!(battle instanceof BossBattle)) {
        return;
    }

    const layerLevel = battle.level % layerData.length;
    progressBarFill.style.backgroundColor = layerData[layerLevel].color;
    if (battle.getDisplayedLevel() === 1) {
        domGetter.byClass('progressBackground').style.backgroundColor = lastLayerData.color;
    } else {
        const nextLayerLevel = (battle.level + 1) % layerData.length;
        domGetter.byClass('progressBackground').style.backgroundColor = layerData[nextLayerLevel].color;
    }
}

function updateBattlesQuickDisplay() {
    for (const battleName in battles) {
        /** @type {Battle} */
        const battle = battles[battleName];
        const quickDisplayElement = Dom.get().bySelector('#battleTabButton .quickTaskDisplay.' + battle.name);
        const componentDomGetter = Dom.get(quickDisplayElement);
        if (battle instanceof BossBattle) {
            if (!isBossBattleAvailable()) {
                quickDisplayElement.classList.add('hidden');
                continue;
            }
        } else if (!battle.isActive()) {
            quickDisplayElement.classList.add('hidden');
            continue;
        }

        quickDisplayElement.classList.remove('hidden');
        componentDomGetter.byClass('progressFill').classList.toggle('current', battle.isActive() && !battle.isDone());
        const levelElement = componentDomGetter.byClass('level');
        if (battle.isDone()) {
            componentDomGetter.byClass('levelLabel').classList.add('hidden');
            levelElement.classList.add('hidden');
            componentDomGetter.byClass('defeatedLabel').classList.remove('hidden');
        } else {
            componentDomGetter.byClass('levelLabel').classList.remove('hidden');
            levelElement.classList.remove('hidden');
            componentDomGetter.byClass('defeatedLabel').classList.add('hidden');
            formatValue(
                levelElement,
                battle.getDisplayedLevel(),
                {keepNumber: true},
            );
        }
        setBattleProgress(componentDomGetter.byClass('progressBar'), battle);
    }
}

function updateLocationQuickDisplay() {
    const activePointOfInterest = pointsOfInterest[gameData.activeEntities.pointOfInterest];
    const quickDisplay = Dom.get().byId('locationQuickDisplay');
    const title = activePointOfInterest.sector.title + ': ' + activePointOfInterest.title;
    if (title !== quickDisplay.title) {
        quickDisplay.title = title;
        bootstrap.Tooltip.getInstance(quickDisplay).setContent({'.tooltip-inner': quickDisplay.title});
    }
    const domGetter = Dom.get(quickDisplay);
    domGetter.byClass('sector').textContent = activePointOfInterest.sector.title;
    domGetter.byClass('pointOfInterest').textContent = activePointOfInterest.title;
}

/**
 *
 * @param {HTMLElement} progressFillElement
 * @param {number} progress between 0.0 and 1.0
 * @param {boolean} increasing set to false if it's not a progress bar but a regress bar
 *
 * @return {number} clamped progress value.
 */
function setProgress(progressFillElement, progress, increasing = true) {
    // Clamp value to [0.0, 1.0]
    progress = Math.max(0.0, Math.min(progress, 1.0));
    XFastdom.mutate(() => {
        // Make sure to disable the transition if the progress is being reset
        const previousProgress = parseFloat(progressFillElement.dataset.progress);
        if ((increasing && (previousProgress - progress) >= 0.01) ||
            (!increasing && (progress - previousProgress) >= 0.01)
        ) {
            progressFillElement.style.transitionDuration = '0s';
        } else {
            progressFillElement.style.removeProperty('transition-duration');
        }
        progressFillElement.style.width = (progress * 100) + '%';
    });

    return progress;
}

/**
 * @param {Requirement[]|null} unfulfilledRequirements
 * @param {{
 *     hasUnfulfilledRequirements: boolean,
 *     requirementsElement: HTMLElement,
 *     setHtmlCache: function(string),
 *     getHtmlCache: function(): string,
 * }} context
 * @return {boolean} true if the entity is available, false if not
 */
function updateRequirements(unfulfilledRequirements, context) {
    // Block all following entities
    if (context.hasUnfulfilledRequirements) {
        return false;
    }

    if (unfulfilledRequirements !== null) {
        // Only first requirement is shown
        if (context.hasUnfulfilledRequirements !== true) {
            const html = unfulfilledRequirements
                .map(requirement => requirement.toHtml())
                .join(', ');
            if (html !== context.getHtmlCache()) {
                Dom.get(context.requirementsElement).byClass('rendered').innerHTML = html;
                context.setHtmlCache(html);
            }
            context.hasUnfulfilledRequirements = true;
        }

        return false;
    }

    return true;
}

let moduleCategoryRequirementsHtmlCache = '';
const moduleRequirementsHtmlCache = {};
const moduleComponentRequirementsHtmlCache = {};
const moduleOperationRequirementsHtmlCache = {};

function updateModuleOperationRow(operation, operationRequirementsContext) {
    const row = Dom.get().byId(operation.domId);

    if (!updateRequirements(operation.getUnfulfilledRequirements(), operationRequirementsContext)) {
        row.classList.add('hidden');
        return;
    }
    row.classList.remove('hidden');

    const domGetter = Dom.get(row);
    formatValue(domGetter.bySelector('.level > data'), operation.level, {keepNumber: true});
    formatValue(domGetter.bySelector('.xpGain > data'), operation.getXpGain());
    formatValue(domGetter.bySelector('.xpLeft > data'), operation.getXpLeft());

    const progressFillElement = domGetter.byClass('progressFill');
    setProgress(progressFillElement, operation.xp / operation.getMaxXp());
    progressFillElement.classList.toggle('current', operation.isActive('self'));

    domGetter.byClass('effect').textContent = operation.getEffectDescription();
    domGetter.byClass('gridLoad').classList.toggle('hidden', attributes.gridStrength.getValue() === 0);
}

function updateModuleComponentRow(component, componentRequirementsContext) {
    const row = document.getElementById(component.domId);

    if (!updateRequirements(component.getUnfulfilledRequirements(), componentRequirementsContext)) {
        row.classList.add('hidden');
        return;
    }

    row.classList.remove('hidden');

    const domGetter = Dom.get(row);
    domGetter.byClass('gridLoad').classList.toggle('hidden', attributes.gridStrength.getValue() === 0);

    // noinspection JSUnusedGlobalSymbols
    const operationRequirementsContext = {
        hasUnfulfilledRequirements: false,
        requirementsElement: Dom.get().byId('row_requirements_component_' + component.name),
        setHtmlCache: (newValue) => {
            moduleOperationRequirementsHtmlCache[component.name] = newValue;
        },
        getHtmlCache: () => {
            if (moduleOperationRequirementsHtmlCache.hasOwnProperty(component.name)) {
                return moduleOperationRequirementsHtmlCache[component.name];
            }

            return '';
        },
    };

    for (const operation of component.operations) {
        updateModuleOperationRow(operation, operationRequirementsContext);
    }

    operationRequirementsContext.requirementsElement.classList.toggle('hidden', !operationRequirementsContext.hasUnfulfilledRequirements);
}

function updateModuleRow(module, moduleRequirementsContext) {
    const row = document.getElementById(module.domId);

    if (!updateRequirements(module.getUnfulfilledRequirements(), moduleRequirementsContext)) {
        row.classList.add('hidden');
        return;
    }

    row.classList.remove('hidden');
    const isActive = module.isActive();
    row.classList.toggle('inactive', !isActive);

    const domGetter = Dom.get(row);
    const level2Header = domGetter.byClass('level2-header');
    level2Header.classList.toggle('bg-light', isActive);
    level2Header.classList.toggle('text-dark', isActive);
    level2Header.classList.toggle('bg-dark', !isActive);
    level2Header.classList.toggle('text-light', !isActive);

    domGetter.byClass('moduleActivationSwitch').checked = module.isActive();
    formatValue(domGetter.byClass('level'), module.getLevel());

    const maxLevelElement = domGetter.byClass('maxLevel');
    if (gameData.bossEncounterCount > 0) {
        maxLevelElement.classList.remove('hidden');
        formatValue(domGetter.bySelector('.maxLevel > data'), module.maxLevel, {keepNumber: true});
    } else {
        maxLevelElement.classList.add('hidden');
    }

    if (attributes.gridStrength.getValue() >= 1) {
        domGetter.byClass('gridLoad').classList.remove('hidden');
        formatValue(domGetter.bySelector('.gridLoad > data'), module.getGridLoad());
    } else {
        domGetter.byClass('gridLoad').classList.add('hidden');
    }

    // noinspection JSUnusedGlobalSymbols
    const componentRequirementsContext = {
        hasUnfulfilledRequirements: false,
        requirementsElement: Dom.get().byId('row_requirements_module_' + module.name),
        setHtmlCache: (newValue) => {
            moduleComponentRequirementsHtmlCache[module.name] = newValue;
        },
        getHtmlCache: () => {
            if (moduleComponentRequirementsHtmlCache.hasOwnProperty(module.name)) {
                return moduleComponentRequirementsHtmlCache[module.name];
            }

            return '';
        },
    };

    for (const component of module.components) {
        updateModuleComponentRow(component, componentRequirementsContext);
    }

    componentRequirementsContext.requirementsElement.classList.toggle('hidden', !componentRequirementsContext.hasUnfulfilledRequirements);
}

function updateModuleCategoryRow(category, categoryRequirementsContext) {
    const categoryRow = Dom.get().byId(category.domId);

    const categoryAvailable = updateRequirements(category.getUnfulfilledRequirements(), categoryRequirementsContext);
    if (!categoryAvailable) {
        categoryRow.classList.add('hidden');
        // continue;
    }

    categoryRow.classList.remove('hidden');

    // noinspection JSUnusedGlobalSymbols
    const moduleRequirementsContext = {
        hasUnfulfilledRequirements: false,
        requirementsElement: Dom.get().byId('row_requirements_category_' + category.name),
        setHtmlCache: (newValue) => {
            moduleRequirementsHtmlCache[category.name] = newValue;
        },
        getHtmlCache: () => {
            if (moduleRequirementsHtmlCache.hasOwnProperty(category.name)) {
                return moduleRequirementsHtmlCache[category.name];
            }

            return '';
        },
    };

    for (const module of category.modules) {
        updateModuleRow(module, moduleRequirementsContext);
    }

    moduleRequirementsContext.requirementsElement.classList.toggle('hidden', !moduleRequirementsContext.hasUnfulfilledRequirements);
}

function updateModulesUI() {
    // noinspection JSUnusedGlobalSymbols
    const categoryRequirementsContext = {
        hasUnfulfilledRequirements: false,
        requirementsElement: Dom.get().byId('row_requirements_moduleCategory'),
        setHtmlCache: (newValue) => {
            moduleCategoryRequirementsHtmlCache = newValue;
        },
        getHtmlCache: () => moduleCategoryRequirementsHtmlCache,
    };
    for (const key in moduleCategories) {
        const category = moduleCategories[key];
        updateModuleCategoryRow(category, categoryRequirementsContext);
    }

    categoryRequirementsContext.requirementsElement.classList.toggle('hidden', !categoryRequirementsContext.hasUnfulfilledRequirements);
}

let battleRequirementsHtmlCache = '';

function updateBattleRows() {
    // Determine visibility
    const maxBattles = maximumAvailableBattles();
    let visibleBattles = 0;
    const visibleFactions = {};
    const bossRow = Dom.get().byId(bossBattle.domId);

    // noinspection JSUnusedGlobalSymbols
    const requirementsContext = {
        hasUnfulfilledRequirements: false,
        requirementsElement: Dom.get().byId('row_requirements_battle'),
        setHtmlCache: (newValue) => {
            battleRequirementsHtmlCache = newValue;
        },
        getHtmlCache: () => {
            return battleRequirementsHtmlCache;
        },
    };

    for (const key in battles) {
        /** @type {Battle} */
        const battle = battles[key];
        const row = Dom.get().byId(battle.domId);

        if (battle.isDone()) {
            row.classList.add('hidden');
            Dom.get().byId('row_done_' + battle.name).classList.remove('hidden');
            continue;
        }

        Dom.get().byId('row_done_' + battle.name).classList.add('hidden');

        const unfulfilledRequirements = [];
        if (visibleBattles >= maxBattles.limit) {
            if (maxBattles.requirement === null) {
                unfulfilledRequirements.push({
                    toHtml: () => {
                        return `Win open battles`;
                    },
                });
            } else {
                unfulfilledRequirements.push(maxBattles.requirement);
            }
        }

        if (visibleFactions.hasOwnProperty(battle.faction.name)) {
            unfulfilledRequirements.push({
                toHtml: () => {
                    return `${battle.faction.name} defeated`;
                },
            });
        }

        if (!(battle instanceof BossBattle)) {
            if (!updateRequirements(
                unfulfilledRequirements.length === 0 ? null : unfulfilledRequirements,
                requirementsContext)
            ) {
                row.classList.add('hidden');
                continue;
            }

            visibleBattles++;
            visibleFactions[battle.faction.name] = true;

            row.classList.remove('hidden');
        }

        const domGetter = Dom.get(row);
        formatValue(domGetter.bySelector('.level > data'), battle.getDisplayedLevel(), {keepNumber: true});
        formatValue(domGetter.bySelector('.xpGain > data'), battle.getXpGain());
        formatValue(domGetter.bySelector('.xpLeft > data'), battle.getXpLeft());

        setBattleProgress(domGetter.byClass('progressBar'), battle);

        const isActive = battle.isActive();
        domGetter.byClass('progressFill').classList.toggle('current', isActive);
        domGetter.byClass('active').style.backgroundColor = isActive ? colorPalette.TomatoRed : colorPalette.White;

        if (isBossBattleAvailable() &&
            visibleBattles === bossBattle.distance
        ) {
            if (row.nextElementSibling !== bossRow) { // Do not update the DOM if not necessary
                row.after(bossRow);
            }
        }
    }

    if (isBossBattleAvailable() && !bossBattle.isDone()) {
        bossRow.classList.remove('hidden');
        if (visibleBattles < bossBattle.distance) {
            // There are fewer battles visible than the boss distance --> move boss in last position.
            // Is the bossRow already the last element?
            if (bossRow.nextElementSibling !== requirementsContext.requirementsElement) { // Do not update the DOM if not necessary
                requirementsContext.requirementsElement.before(bossRow);
            }
        } else if (bossBattle.distance === 0) {
            // Boss should be in first position.
            // Is the bossRow already the first element?
            if (bossRow.previousElementSibling !== null) { // Do not update the DOM if not necessary
                Dom.get()
                    .bySelector('#unfinishedBattles tbody.level4')
                    .prepend(bossRow);
            }
        }
    } else {
        bossRow.classList.add('hidden');
    }

    requirementsContext.requirementsElement.classList.toggle('hidden', !requirementsContext.hasUnfulfilledRequirements);
}

let sectorRequirementsHtmlCache = '';
const pointOfInterestRequirementsHtmlCache = {};

function updateSectorRows() {
    // noinspection JSUnusedGlobalSymbols
    const sectorRequirementsContext = {
        hasUnfulfilledRequirements: false,
        requirementsElement: Dom.get().byId('row_requirements_sector'),
        setHtmlCache: (newValue) => {
            sectorRequirementsHtmlCache = newValue;
        },
        getHtmlCache: () => sectorRequirementsHtmlCache,
    };

    for (const key in sectors) {
        const sector = sectors[key];

        const categoryAvailable = updateRequirements(sector.getUnfulfilledRequirements(), sectorRequirementsContext);
        Dom.get().byId(sector.domId).classList.toggle('hidden', !categoryAvailable);

        // noinspection JSUnusedGlobalSymbols
        const requirementsContext = {
            hasUnfulfilledRequirements: false,
            requirementsElement: Dom.get().byId('row_requirements_sector_' + sector.name),
            setHtmlCache: (newValue) => {
                pointOfInterestRequirementsHtmlCache[sector.name] = newValue;
            },
            getHtmlCache: () => {
                if (pointOfInterestRequirementsHtmlCache.hasOwnProperty(sector.name)) {
                    return pointOfInterestRequirementsHtmlCache[sector.name];
                }

                return '';
            },
        };

        for (const pointOfInterest of sector.pointsOfInterest) {
            const row = Dom.get().byId(pointOfInterest.domId);

            if (!updateRequirements(pointOfInterest.getUnfulfilledRequirements(), requirementsContext)) {
                row.classList.add('hidden');
                continue;
            }
            row.classList.remove('hidden');

            const domGetter = Dom.get(row);
            const isActive = pointOfInterest.isActive();
            domGetter.byClass('active').style.backgroundColor = isActive ? 'rgb(12, 101, 173)' : 'white';
            domGetter.byClass('button').classList.toggle('btn-dark', !isActive);
            domGetter.byClass('button').classList.toggle('btn-warning', isActive);
            domGetter.byClass('effect').textContent = pointOfInterest.getEffectDescription();
            formatValue(domGetter.bySelector('.danger > data'), pointOfInterest.getEffect(EffectType.Danger));
        }

        requirementsContext.requirementsElement.classList.toggle('hidden', !requirementsContext.hasUnfulfilledRequirements);
    }

    sectorRequirementsContext.requirementsElement.classList.toggle('hidden', !sectorRequirementsContext.hasUnfulfilledRequirements);
}

function updateGalacticSecretRows() {
    for (const key in galacticSecrets) {
        const galacticSecret = galacticSecrets[key];
        const row = Dom.get().byId(galacticSecret.domId);
        const domGetter = Dom.get(row);
        const isUnlocked = galacticSecret.isUnlocked;
        const progressFillElement = domGetter.byClass('progressFill');
        if (isUnlocked) {
            progressFillElement.classList.add('unlocked');
            domGetter.byClass('progressBar').classList.add('unlocked');
            progressFillElement.style.removeProperty('width');
        } else {
            progressFillElement.classList.toggle('unlocked', galacticSecret.inProgress);
            domGetter.byClass('progressBar').classList.remove('unlocked');
            setProgress(progressFillElement, galacticSecret.unlockProgress);
        }
    }
}

function updateAttributeRows() {
    for (const balanceEntry of attributeBalanceEntries) {
        if (balanceEntry.isActive()) {
            formatValue(
                Dom.get(balanceEntry.element).byClass('entryValue'),
                balanceEntry.getEffect(balanceEntry.effectType),
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

/**
 *
 * @param {number} amount
 * @param {HTMLDataElement} dataElement
 * @param {{prefixes?: string[], unit?: string, forceSign?: boolean}} formatConfig
 */
function formatEnergyValue(amount, dataElement, formatConfig = {}) {
    formatValue(dataElement, amount, Object.assign({
        unit: units.energy,
        prefixes: metricPrefixes,
    }, formatConfig));
}

function updateEnergyGridBar() {
    const energyDisplayElement = Dom.get().byId('energyGridDisplay');
    const domGetter = Dom.get(energyDisplayElement);

    const currentGridLoad = attributes.gridLoad.getValue();
    const currentGridStrength = attributes.gridStrength.getValue();
    const gridLoadElement = domGetter.byClass('gridLoad');
    const gridStrengthElement = domGetter.byClass('gridStrength');
    if (currentGridLoad === 0) {
        gridLoadElement.style.left = '0';
        gridLoadElement.style.removeProperty('translate');
        gridLoadElement.style.removeProperty('right');
    } else if (currentGridLoad === 1 && currentGridStrength === 1) {
        gridLoadElement.style.left = '50%';
        gridLoadElement.style.translate = '-50% 0';
        gridLoadElement.style.removeProperty('right');
    } else {
        // Using right alignment to respect the gridStrength element
        const rightLimit = gridStrengthElement.offsetWidth;
        const relativeGridLoad = 100 * (1 - currentGridLoad / currentGridStrength);
        gridLoadElement.style.right = `max(${relativeGridLoad}%, ${rightLimit}px)`;
        gridLoadElement.style.removeProperty('translate');
        gridLoadElement.style.removeProperty('left');
    }

    formatValue(Dom.get(gridLoadElement).bySelector('data'), currentGridLoad, {keepNumber: true});
    formatValue(Dom.get(gridStrengthElement).bySelector('data'), currentGridStrength, {keepNumber: true});

    const numberOfBoxes = Dom.get().allBySelector('#gridStrength > .grid-strength-box').length;
    if (numberOfBoxes > currentGridStrength) {
        for (let i = 0; i < (numberOfBoxes - currentGridStrength); i++) {
            Dom.get().bySelector('#gridStrength .grid-strength-box').remove();
        }
    } else if (currentGridStrength > numberOfBoxes) {
        for (let i = numberOfBoxes; i < currentGridStrength; i++) {
            const gridStrengthBox = Dom.new.fromTemplate('gridStrengthBoxTemplate');
            Dom.get().byId('gridStrength').append(gridStrengthBox);
        }
    }

    Dom.get().allBySelector('#gridStrength > .grid-strength-box').forEach((gridStrengthBox, index) => {
        gridStrengthBox.classList.toggle('in-use', index < currentGridLoad);
    });

    const energyGeneratedElement = domGetter.byClass('energyGenerated');
    formatEnergyValue(gridStrength.getXpGain(), Dom.get(energyGeneratedElement).bySelector('data'), {forceSign: true});
    const energyLeftElement = domGetter.byClass('energyLeft');
    formatEnergyValue(gridStrength.getXpLeft(), Dom.get(energyLeftElement).bySelector('data'));

    const progressFillElement = domGetter.byClass('progressFill');
    progressFillElement.classList.toggle('current', getGeneratedEnergy() > 0);
    const energyProgress = setProgress(progressFillElement, gridStrength.xp / gridStrength.getMaxXp());

    // Using right alignment to respect the energyLeft element
    const relativeEnergy = 100 * (1 - energyProgress);
    const leftLimit = energyGeneratedElement.offsetWidth + (gameData.settings.sciFiMode ? 30 : 0);
    const rightLimit = energyLeftElement.offsetWidth;
    energyGeneratedElement.style.right = `clamp(${rightLimit}px, ${relativeEnergy}%, calc(100% - ${leftLimit}px))`;
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
            'RGB',
        ).toString('rgb');
    } else {
        color = lerpColor(
            dangerColors[1],
            dangerColors[2],
            (heat - mediumHeat) / (maxHeat - mediumHeat),
            'RGB',
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
    const cyclesSinceLastEncounterElement = Dom.get().byId('cyclesSinceLastEncounter');
    const cyclesTotalElement = Dom.get().byId('cyclesTotal');
    if (gameData.bossEncounterCount === 0) {
        cyclesSinceLastEncounterElement.classList.add('hidden');
        cyclesTotalElement.classList.replace('secondary-stat', 'primary-stat');
        cyclesTotalElement.classList.remove('help-text');
    } else {
        cyclesSinceLastEncounterElement.classList.remove('hidden');
        // TODO adjust formatting & use formatValue
        Dom.get(cyclesSinceLastEncounterElement).bySelector('data').textContent = Math.round(gameData.cycles).toLocaleString('en-US');
        cyclesTotalElement.classList.replace('primary-stat', 'secondary-stat');
        cyclesTotalElement.classList.add('help-text');
    }
    // TODO adjust formatting & use formatValue
    Dom.get(cyclesTotalElement).bySelector('data').textContent = Math.round(startCycle + gameData.totalCycles).toLocaleString('en-US');
    const pauseButton = document.getElementById('pauseButton');
    if (gameData.state === gameStates.PAUSED || gameData.state === gameStates.BOSS_FIGHT_PAUSED) {
        pauseButton.textContent = 'Play';
        pauseButton.classList.replace('btn-secondary', 'btn-primary');
    } else if (gameData.state === gameStates.PLAYING || gameData.state === gameStates.BOSS_FIGHT) {
        pauseButton.textContent = 'Pause';
        pauseButton.classList.replace('btn-primary', 'btn-secondary');
    } else {
        pauseButton.textContent = 'Intermission';
        pauseButton.classList.replace('btn-primary', 'btn-secondary');
    }

    const danger = attributes.danger.getValue();
    formatValue(Dom.get().byId('dangerDisplay'), danger);
    formatValue(Dom.get().bySelector('#attributeRows > .danger .value'), danger);

    updateEnergyGridBar();
    formatValue(Dom.get().bySelector('#attributeRows > .gridLoad .value'), attributes.gridLoad.getValue());
    formatValue(Dom.get().bySelector('#attributeRows > .gridStrength .value'), attributes.gridStrength.getValue());
    const delta = gridStrength.getDelta();
    const gridStrengthDeltaElement = Dom.get().bySelector('#attributeRows > .gridStrength .delta');
    if (delta < 0.1) {
        formatValue(gridStrengthDeltaElement, 1, {forceInteger: true});
        gridStrengthDeltaElement.nextSibling.textContent = ' per ' + (1 / delta).toFixed(0) + ' cycles';
    } else {
        formatValue(gridStrengthDeltaElement, delta);
        gridStrengthDeltaElement.nextSibling.textContent = ' per cycle';
    }

    const growth = attributes.growth.getValue() / 10;
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
    formatValue(Dom.get().byId('populationProgressSpeedDisplay'), getPopulationProgressSpeedMultiplier(), {});
    formatValue(Dom.get().bySelector('#attributeRows > .population .value'), population, {forceInteger: true});
    formatValue(Dom.get().bySelector('#attributeRows > .population .delta'), populationDelta(), {forceSign: true});

    const research = attributes.research.getValue();
    formatValue(Dom.get().byId('researchDisplay'), research);
    formatValue(Dom.get().bySelector('#attributeRows > .research .value'), research);

    const essenceOfUnknown = attributes.essenceOfUnknown.getValue();
    formatValue(Dom.get().byId('essenceOfUnknownDisplay'), essenceOfUnknown, {forceInteger: true, keepNumber: true});

    const galacticSecretCost = calculateGalacticSecretCost();
    formatValue(Dom.get().byId('galacticSecretCostDisplay'), galacticSecretCost, {forceInteger: true, keepNumber: true});
}

function updateHtmlElementRequirements() {
    for (const key in htmlElementRequirements) {
        const htmlElementWithRequirement = htmlElementRequirements[key];
        const completed = htmlElementWithRequirement.isCompleted();
        const visible = htmlElementWithRequirement.isVisible();
        for (const element of htmlElementWithRequirement.elementsWithRequirements) {
            if (element instanceof LazyHtmlElement) {
                if (element.found()) {
                    element.get().classList.toggle('hidden', !completed);
                }
            } else if (element instanceof LazyHtmlElementCollection) {
                if (element.found()) {
                    element.get().forEach(element => {
                        element.classList.toggle('hidden', !completed);
                    });
                }
            } else {
                element.classList.toggle('hidden', !completed);
            }
        }
        const requirementHtml = htmlElementWithRequirement.toHtml();
        for (const element of htmlElementWithRequirement.elementsToShowRequirements) {
            if (completed || !visible) {
                element.classList.add('hidden');
            } else {
                element.classList.remove('hidden');
                element.innerHTML = requirementHtml;
            }
        }
    }
}

function updateBodyClasses() {
    document.getElementById('body').classList.toggle('game-paused', gameData.state === gameStates.PAUSED);
    document.getElementById('body').classList.toggle('game-playing', gameData.state === gameStates.PLAYING);
}

function doTasks() {
    for (const key of gameData.activeEntities.operations) {
        const operation = moduleOperations[key];
        if (!operation.isActive('parent')) continue;
        operation.do();
    }

    for (const battleName of gameData.activeEntities.battles) {
        const battle = battles[battleName];
        if (battle.isDone()) {
            if (gameData.selectedTab === 'battles') {
                // Quality of life - a battle is done and the player is already on the battles tab
                // or visited it first after the battle was completed --> deactivate battle
                battle.stop();
                // TODO VFX should not be called, but triggered via Event
                VFX.flash(Dom.get().bySelector('#row_done_' + battle.name + ' .progressBar'));
            }

            continue;
        }

        battle.do();
        if (gameData.state === gameStates.PLAYING &&
            isBossBattleAvailable() &&
            battle.isDone()
        ) {
            bossBattle.decrementDistance();
        }
    }

    gridStrength.do();
}

function getGeneratedEnergy() {
    return Effect.getTotalValue([EffectType.Energy, EffectType.EnergyFactor]);
}

function calculateGridLoad() {
    let gridLoad = 0;

    for (const key of gameData.activeEntities.operations) {
        const operation = moduleOperations[key];
        if (!operation.isActive('parent')) continue;

        gridLoad += operation.getGridLoad();
    }

    return gridLoad;
}

function calculateGalacticSecretCost() {
    const unlockedGalacticSecrets = Object.values(galacticSecrets)
        .filter(galacticSecret => galacticSecret.isUnlocked)
        .length;
    return Math.pow(3, unlockedGalacticSecrets);
}

function increaseCycle() {
    if (!gameData.state.isTimeProgressing) return;

    const increase = applySpeed(1);
    gameData.cycles += increase;
    gameData.totalCycles += increase;

    if (!isBossBattleAvailable() && gameData.cycles >= getBossAppearanceCycle()) {
        gameData.bossBattleAvailable = true;
        gameData.transitionState(gameStates.PAUSED);
        GameEvents.BossAppearance.trigger(undefined);
    }
}

function updateBossDistance() {
    if (gameData.state !== gameStates.PLAYING) return;
    if (!isBossBattleAvailable()) return;

    // How much time has past since the boss' arrival?
    const overtime = gameData.cycles - getBossAppearanceCycle();
    // Translate the elapsed time into distance according to config
    bossBattle.coveredDistance = Math.floor(overtime / bossBattleApproachInterval);
}

function visuallyDenyGalacticSecretUnlock(galacticSecret) {
    VFX.shakeElement(Dom.get().bySelector(`#${galacticSecret.domId} .progress`), galacticSecret.domId);
    VFX.highlightText(Dom.get().byId('galacticSecretCostDisplay').parentElement, 'flash-text-denied', 'flash-text-denied');
    VFX.highlightText(Dom.get().byId('essenceOfUnknownDisplay'), 'flash-text-denied', 'flash-text-denied');
}

function progressGalacticSecrets() {
    for (const key in galacticSecrets) {
        const galacticSecret = galacticSecrets[key];
        galacticSecret.update();
        if (galacticSecret.unlockProgress < 1) {
            continue;
        }

        const galacticSecretCost = calculateGalacticSecretCost();
        if (galacticSecretCost > gameData.essenceOfUnknown) {
            visuallyDenyGalacticSecretUnlock(galacticSecret);
        } else {
            // Unlock & pay the required essence of unknown
            galacticSecret.isUnlocked = true;
            galacticSecret.inProgress = false;
            gameData.essenceOfUnknown -= galacticSecretCost;
            GameEvents.TaskLevelChanged.trigger({
                type: galacticSecret.type,
                name: galacticSecret.name,
                previousLevel: 0,
                nextLevel: 1,
            });
        }
        galacticSecret.unlockProgress = 0;
    }
}

/**
 * Activate the first/saved operation of any component that doesn't
 * have yet an active operation, e.g. because it was blocked.
 */
function activateComponentOperations() {
    for (const key in moduleComponents) {
        const component = moduleComponents[key];

        if (component.getUnfulfilledRequirements() !== null) continue;
        if (component.getActiveOperation() !== null) continue;

        // TODO include in save game?
        let activeOperation = component.operations.find(operation => operation.isActive('self'));
        // No operation was active yet --> fall back to first configured operation as fallback
        if (isUndefined(activeOperation)) {
            activeOperation = component.operations[0];
            activeOperation.setActive(true);
        }
        component.activeOperation = activeOperation;
    }
}

/**
 *
 * @param {HTMLDataElement} dataElement
 * @param {number} value
 * @param {{
 *     prefixes?: string[],
 *     unit?: string,
 *     forceSign?: boolean,
 *     keepNumber?: boolean,
 *     forceInteger?: boolean,
 *     toStringFn?: function(number): string,
 * }} config
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
        toStringFn: undefined,
    };
    config = Object.assign({}, defaultConfig, config);

    const toString = (value) => {
        if (config.forceInteger || Number.isInteger(value)) {
            return value.toFixed(0);
        } else if (isFunction(config.toStringFn)) {
            return config.toStringFn(value);
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
            value = Math.abs(value);
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
    return document.getElementById(task.domId);
}

function getBattleElement(taskName) {
    if (!battles.hasOwnProperty(taskName)) {
        console.log('Battle not found in data: ' + taskName);
        return;
    }
    const battle = battles[taskName];
    return Dom.get().byId(battle.domId);
}

function getPointOfInterestElement(name) {
    if (!pointsOfInterest.hasOwnProperty(name)) {
        console.log('Point of Interest not found in data: ' + name);
        return null;
    }

    const pointOfInterest = pointsOfInterest[name];
    return document.getElementById(pointOfInterest.domId);
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

function resetBattle(name) {
    const battle = battles[name];
    battle.level = 0;
    battle.xp = 0;
}

function startNewPlaythrough() {
    gameData.bossEncounterCount += 1;
    playthroughReset('UPDATE_MAX_LEVEL');
}

// function rebirthTwo() {
//     gameData.rebirthTwoCount += 1;
//     playthroughReset('RESET_MAX_LEVEL');
// }

/**
 * @param {MaxLevelBehavior} maxLevelBehavior
 */
function playthroughReset(maxLevelBehavior) {
    gameData.initValues();
    gameData.resetCurrentValues();

    for (const key in moduleCategories) {
        const category = moduleCategories[key];
        category.reset(maxLevelBehavior);
    }

    for (const key in modules) {
        const module = modules[key];
        module.reset(maxLevelBehavior);
    }

    for (const key in moduleComponents) {
        const component = moduleComponents[key];
        component.reset(maxLevelBehavior);
    }

    for (const key in moduleOperations) {
        const operation = moduleOperations[key];
        operation.reset(maxLevelBehavior);
    }

    gridStrength.reset(maxLevelBehavior);

    for (const key in battles) {
        const battle = battles[key];
        battle.reset(maxLevelBehavior);
    }

    for (const key in moduleCategories) {
        const category = moduleCategories[key];
        category.reset(maxLevelBehavior);
    }

    for (const key in sectors) {
        const sector = sectors[key];
        sector.reset(maxLevelBehavior);
    }

    for (const key in pointsOfInterest) {
        const pointOfInterest = pointsOfInterest[key];
        pointOfInterest.reset(maxLevelBehavior);
    }

    for (const key in htmlElementRequirements) {
        const elementRequirement = htmlElementRequirements[key];
        elementRequirement.reset();
    }

    setTab('modules');
    gameData.transitionState(gameStates.NEW);
}

function getBossAppearanceCycle() {
    //Lifespan not defined in station design, if years are not reset this will break the game
    //const immortality = gameData.taskData['Immortality'];
    //const superImmortality = gameData.taskData['Super immortality'];
    //return bossAppearanceCycle * immortality.getEffect() * superImmortality.getEffect();
    return bossAppearanceCycle;
}

function isBossBattleAvailable() {
    return gameData.bossBattleAvailable;
}

function updateUI() {
    if (document.hidden) {
        // Tab is currently not active - no need to update the UI
        return;
    }

    updateModulesUI();

    updateBattleRows();
    updateSectorRows();
    updateGalacticSecretRows();

    updateModulesQuickDisplay();
    updateBattlesQuickDisplay();
    updateLocationQuickDisplay();
    updateAttributeRows();

    updateHtmlElementRequirements();

    updateText();
    updateBodyClasses();
}

function update() {
    increaseCycle();
    updateBossDistance();
    progressGalacticSecrets();
    activateComponentOperations();
    doTasks();
    updatePopulation();
    updateUI();
}

function rerollStationName() {
    setStationName(stationNameGenerator.generate());
}

const visibleTooltips = [];

/**
 *
 * @param {HTMLElement} tooltipTriggerElement
 * @param {Object} tooltipConfig
 */
function initTooltip(tooltipTriggerElement, tooltipConfig) {
    const mergedTooltipConfig = Object.assign({container: 'body', trigger: 'hover', sanitize: false}, tooltipConfig);
    // noinspection JSUnresolvedReference
    new bootstrap.Tooltip(tooltipTriggerElement, mergedTooltipConfig);
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

function initTooltips() {
    const tooltipTriggerElements = document.querySelectorAll('[title], [data-bs-title]');
    for (const tooltipTriggerElement of tooltipTriggerElements) {
        initTooltip(tooltipTriggerElement, {});
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
    // saveGameData();
}

function initStationName() {
    setStationName(gameData.stationName);
    const stationNameDisplayElement = document.getElementById('nameDisplay');
    stationNameDisplayElement.addEventListener('click', (event) => {
        event.preventDefault();

        setTab('settings');
        /** @var {HTMLInputElement} */
        const settingsStationNameInput = Dom.get().byId('settingsStationNameInput');
        settingsStationNameInput.focus();
        settingsStationNameInput.select();
    });
    for (const stationNameInput of Dom.get().allByClass('stationNameInput')) {
        stationNameInput.placeholder = emptyStationName;
        stationNameInput.addEventListener('input', (event) => {
            setStationName(event.target.value);
        });
    }
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
    // gameData.settings.vfx.followProgressBars is applied in the VFX module itself - we just need to adjust the UI
    Dom.get().byId('vfxProgressBarFollowSwitch').checked = gameData.settings.vfx.followProgressBars;
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
    assignNames(gameStates);
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
    assignNames(galacticSecrets);
}

function init() {
    initConfigNames();

    gameData = new GameData();
    /*
     * During the setup a lot of functions are called that trigger an auto save.
     * To not save various times, saving is skipped until the game is actually
     * under player control.
     */
    gameData.skipSave = true;

    gameData.tryLoading();

    createModulesUI(moduleCategories, 'modulesTable');
    createSectorsUI(sectors, 'sectorTable');
    createBattlesUI(battles, 'battlesTable');
    createGalacticSecretsUI(galacticSecrets, 'galacticSecrets');
    createModulesQuickDisplay();
    createBattlesQuickDisplay();

    adjustLayout();

    createAttributeDescriptions(createAttributeInlineHTML);
    createAttributesDisplay();
    createAttributesUI();
    createEnergyGridDisplay();

    if (tabButtons.hasOwnProperty(gameData.selectedTab)) {
        setTab(gameData.selectedTab);
    } else {
        setTab('modules');
    }
    initTooltips();
    initStationName();
    initSettings();

    cleanUpDom();

    gameData.skipSave = false;
    gameData.save();
    displayLoaded();

    update();
    setInterval(update, 1000 / updateSpeed);
    setInterval(gameData.save.bind(gameData), 3000);
}

init();
