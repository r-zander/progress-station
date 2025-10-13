'use strict';

/**
 * @typedef {Object} AttributeDefinition
 * @property {string} [name] - identifier
 * @property {string} title - displayed name of the attribute
 * @property {string} textClass - css class to attack to the title
 * @property {string} icon - path to the icon file#
 * @property {string} [description] - (HTML) description of the attribute
 * @property {string} [inlineHtml] - inline display of the attribute, only text
 * @property {string} [inlineHtmlWithIcon] - inline display of the attribute, with icon
 * @property {function(): number} getValue - retrieves the current value for this attribute
 * @property {boolean} relevantForMusicContext - should this attribute value be considered for the MusicContext.highestAttribute ?
 */

/**
 * @typedef {Object} FactionDefinition
 * @property {string} [name]
 * @property {string} title
 * @property {string} [description]
 * @property {number} maxXp
 */

/**
 * @typedef {'RESET_MAX_LEVEL'|'UPDATE_MAX_LEVEL'} MaxLevelBehavior
 */

/**
 * Saved Values that do not (yet) contain any values.
 * These are implemented to enforce a schema that all entities are able to load and save data.
 * @typedef {Object} EmptySavedValues
 */

/**
 * Super class for just about anything in the game.
 * If it has a constructor, it should probably extend Entity.
 */
class Entity {
    /**
     * @readonly
     * @var {string}
     */
    #name;

    /**
     * @readonly
     * @var {string}
     */
    type;

    /**
     * @readonly
     * @var {string}
     */
    domId;

    /**
     * @param {string} title
     * @param {string|undefined} description
     * @param {Requirement[]|undefined} [requirements=undefined]
     */
    constructor(title, description) {
        this.type = this.constructor.name;
        this.title = prepareTitle(title);
        this.description = description;
        /** @var {Requirement[]} */
        this.requirements = [];

    }

    get name() {
        return this.#name;
    }

    set name(name) {
        if (isDefined(this.#name)) {
            throw TypeError(this.type + '.name already set to "' + this.#name + '". Attempted override name: "' + name + '".');
        }

        this.#name = name;
        this.domId = 'row_' + this.type + '_' + name;
    }

    /**
     * @param {Requirement} requirement
     * @return {Requirement} the passed in requirement
     */
    registerRequirement(requirement) {
        this.requirements.push(requirement);
        return requirement;
    }

    loadValues(savedValues) {
        // Abstract method that needs to be implemented by each subclass
        throw new TypeError('loadValues not implemented by ' + this.constructor.name);
    }

    /**
     * @return {Object}
     */
    getSavedValues() {
        throw new TypeError('getSavedValues not implemented by ' + this.constructor.name);
    }

    /**
     * @return {Requirement[]|null} Either a list of open {@link Requirement}s or `null` if there are no open requirements.
     */
    getUnfulfilledRequirements() {
        return Requirement.getUnfulfilledRequirements(this.requirements);
    }

    reset() {
        // Nothing to do - requirements get centrally reset
    }
}

/**
 * @typedef {Object} TaskSavedValues
 * @property {number} level
 * @property {number} maxLevel
 * @property {number} xp
 */

/**
 * @implements EffectsHolder
 */
class Task extends Entity {
    /**
     * @param {{
     *     title: string,
     *     description?: string,
     *     maxXp: number,
     *     effects: EffectDefinition[],
     * }} baseData
     */
    constructor(baseData) {
        super(baseData.title, baseData.description);

        this.maxXp = baseData.maxXp;
        this.effects = baseData.effects;
        this.xpMultipliers = [];
        this.xpMultipliers.push(this.getMaxLevelMultiplier.bind(this));
        // Yey lazy functions
        this.xpMultipliers.push(() => getPopulationProgressSpeedMultiplier());
    }

    /**
     * @param {TaskSavedValues} savedValues
     */
    loadValues(savedValues) {
        validateParameter(savedValues, {
            level: JsTypes.Number,
            maxLevel: JsTypes.Number,
            xp: JsTypes.Number,
        }, this);
        this.savedValues = savedValues;
    }

    /**
     *
     * @return {TaskSavedValues}
     */
    static newSavedValues() {
        return {
            level: 0,
            maxLevel: 0,
            xp: 0,
        };
    }

    /**
     * @return {TaskSavedValues}
     */
    getSavedValues() {
        return this.savedValues;
    }

    get level() {
        return this.savedValues.level;
    }

    set level(level) {
        this.savedValues.level = level;
    }

    get maxLevel() {
        return this.savedValues.maxLevel;
    }

    set maxLevel(maxLevel) {
        this.savedValues.maxLevel = maxLevel;
    }

    get xp() {
        return this.savedValues.xp;
    }

    set xp(xp) {
        this.savedValues.xp = xp;
    }

    /**
     * @return {boolean}
     */
    isProgressing() {
        return gameData.state.areTasksProgressing;
    }

    do() {
        if (!this.isProgressing()) return;

        this.increaseXp();
    }

    getMaxXp() {
        return Math.round(this.maxXp * (this.level + 1) * Math.pow(1.01, this.level));
    }

    getXpLeft() {
        return Math.round(this.getMaxXp() - this.xp);
    }

    /**
     * value change per cycle. Inversion of number of cycles to increase value by 1.
     */
    getDelta() {
        return this.getXpGain() / this.getMaxXp();
    }

    /**
     * @returns {EffectDefinition[]}
     */
    getEffects() {
        return this.effects;
    }

    getMaxLevelMultiplier() {
        return 1 + this.maxLevel / 10;
    }

    getXpGain() {
        return applyMultipliers(10, this.xpMultipliers);
    }

    /**
     * @param {EffectType} effectType
     * @returns {number}
     */
    getEffect(effectType) {
        return Effect.getValue(this, effectType, this.effects, this.level);
    }

    /**
     * @param {number} [levelOverride] if provided, the returned text will use the provided
     *                                 level instead of the current level of this task.
     * @return {string} HTML
     */
    getEffectDescription(levelOverride = undefined) {
        const level = isNumber(levelOverride) ? levelOverride : this.level;
        return Effect.getDescription(this, this.effects, level);
    }

    /**
     * @param {number} [levelOverride] if provided, the returned text will use the provided
     *                                 level instead of the current level of this task.
     * @return {string[]} plain text
     */
    getFormattedEffectValues(levelOverride = undefined){
        const level = isNumber(levelOverride) ? levelOverride : this.level;
        return Effect.getFormattedValues(this, this.effects, level);
    }

    increaseXp() {
        this.xp += applySpeed(this.getXpGain());
        if (this.xp >= this.getMaxXp()) {
            this.levelUp();
        }
    }

    levelUp() {
        let excess = this.xp - this.getMaxXp();
        const previousLevel = this.level;
        while (excess >= 0) {
            this.level += 1;
            excess -= this.getMaxXp();

            if (isDefined(this.targetLevel) && this.level === this.targetLevel) {
                break;
            }
        }
        if (this.level > previousLevel) {
            this.onLevelUp(previousLevel, this.level);
        }
        this.xp = this.getMaxXp() + excess;
    }

    onLevelUp(previousLevel, newLevel) {
        GameEvents.TaskLevelChanged.trigger({
            type: this.type,
            name: this.name,
            previousLevel: previousLevel,
            nextLevel: newLevel,
        });
    }

    /**
     * @param {MaxLevelBehavior} maxLevelBehavior
     */
    reset(maxLevelBehavior) {
        super.reset(maxLevelBehavior);

        this.level = 0;
        this.xp = 0;
        switch (maxLevelBehavior) {
            case 'UPDATE_MAX_LEVEL':
                if (this.level > this.maxLevel) {
                    this.maxLevel = this.level;
                }
                break;
            case 'RESET_MAX_LEVEL':
                this.maxLevel = 0;
                break;
        }
    }
}

class GridStrength extends Task {
    constructor(baseData) {
        super(baseData);
    }

    getXpGain() {
        return attributes.energy.getValue();
    }

    /**
     * @return {number}
     */
    getGridStrength() {
        return this.level;
    }

    getMaxXp() {
        return Math.round(this.maxXp * (this.level + 1) * Math.pow(1.6, this.level));
    }
}

class ModuleCategory extends Entity {

    /**
     *
     * @param {{
     *     title: string,
     *     description?: string,
     *     modules: Module[],
     * }} baseData
     */
    constructor(baseData) {
        super(baseData.title, baseData.description);

        this.modules = baseData.modules;
    }
}

/**
 * @typedef {Object} ModuleSavedValues
 * @property {number} maxLevel
 */

class Module extends Entity {

    /**
     *
     * @param {{
     *     title: string,
     *     description?: string,
     *     components: ModuleComponent[],
     * }} baseData
     */
    constructor(baseData) {
        super(baseData.title, baseData.description);

        this.data = baseData;
        this.components = baseData.components;
        for (const component of this.components) {
            component.registerModule(this);
        }
    }

    /**
     * @param {ModuleSavedValues} savedValues
     */
    loadValues(savedValues) {
        validateParameter(savedValues, {
            maxLevel: JsTypes.Number,
        }, this);
        this.savedValues = savedValues;
    }

    /**
     * @return {ModuleSavedValues}
     */
    static newSavedValues() {
        return {
            maxLevel: 0,
        };
    }

    /**
     * @return {ModuleSavedValues}
     */
    getSavedValues() {
        return this.savedValues;
    }

    /**
     * @return {boolean}
     */
    isActive() {
        return gameData.activeEntities.modules.has(this.name);
    }

    /**
     *
     * @param {boolean} active
     */
    setActive(active) {
        if (active) {
            gameData.activeEntities.modules.add(this.name);
        } else {
            gameData.activeEntities.modules.delete(this.name);
        }
    }

    get maxLevel() {
        return this.savedValues.maxLevel;
    }

    set maxLevel(maxLevel) {
        this.savedValues.maxLevel = maxLevel;
    }

    getLevel() {
        return this.components.reduce((levelSum, component) => levelSum + component.getOperationLevels(), 0);
    }

    /**
     *
     * @param {MaxLevelBehavior} maxLevelBehavior
     */
    reset(maxLevelBehavior) {
        super.reset(maxLevelBehavior);

        switch (maxLevelBehavior) {
            case 'UPDATE_MAX_LEVEL':
                const currentLevel = this.getLevel();
                if (currentLevel > this.maxLevel) {
                    this.maxLevel = currentLevel;
                }
                break;
            case 'RESET_MAX_LEVEL':
                this.maxLevel = 0;
                break;
        }
    }

    /**
     * @return {number}
     */
    getGridLoad() {
        return this.components
            .filter(component => component.getActiveOperation() !== null)
            .reduce((gridLoadSum, component) => {
                return gridLoadSum + component.getActiveOperation().getGridLoad();
            }, 0);
    }
}

class ModuleComponent extends Entity {

    /** @var {Module} */
    module = null;
    /** @var {ModuleOperation} */
    activeOperation = null;

    /**
     * @param {{
     *     title: string,
     *     description?: string,
     *     operations: ModuleOperation[],
     * }} baseData
     */
    constructor(baseData) {
        super(baseData.title, baseData.description);

        this.operations = baseData.operations;
    }

    /**
     * @param {Module} module
     */
    registerModule(module) {
        console.assert(this.module === null, 'Module already registered.');
        this.module = module;

        for (const operation of this.operations) {
            operation.registerModule(module, this);
        }
    }

    /**
     * @return {ModuleOperation}
     */
    getActiveOperation() {
        return this.activeOperation;
    }

    /**
     * @param {ModuleOperation} operation
     */
    activateOperation(operation) {
        this.activeOperation.setActive(false);
        this.activeOperation = operation;
        this.activeOperation.setActive(true);
    }

    getOperationLevels() {
        let levels = 0;
        for (const operation of this.operations) {
            levels += operation.level;
        }
        return levels;
    }

    /**
     * @param {MaxLevelBehavior} maxLevelBehavior
     */
    reset(maxLevelBehavior) {
        super.reset(maxLevelBehavior);

        this.activeOperation = null;
    }
}

class ModuleOperation extends Task {

    /** @var {Module} */
    module = null;

    /** @var {ModuleComponent} */
    component = null;

    /**
     * @param {{
     *     title: string,
     *     description?: string,
     *     maxXp: number,
     *     gridLoad: number,
     *     effects: EffectDefinition[]
     * }} baseData
     */
    constructor(baseData) {
        super(baseData);
        this.gridLoad = baseData.gridLoad;
        this.xpMultipliers.push(attributes.industry.getValue);
    }

    get maxLevel() {
        return this.module.maxLevel;
    }

    set maxLevel(maxLevel) {
        // Do nothing
        // throw new TypeError('ModuleOperations only inherit the maxLevel of their modules but can not modify it.');
    }

    /**
     * @param {Module} module
     * @param {ModuleComponent} component
     */
    registerModule(module, component) {
        console.assert(this.module === null, 'Module already registered.');
        this.module = module;
        this.component = component;
    }

    /**
     * @param {'self'|'inHierarchy'|'parent'} scope
     * @return {boolean}
     */
    isActive(scope) {
        switch (scope) {
            case 'self':
                return gameData.activeEntities.operations.has(this.name);
            case 'parent':
                return this.module.isActive();
            case 'inHierarchy':
                return this.isActive('self') && this.isActive('parent');
        }
    }

    /**
     * @param {boolean} active
     */
    setActive(active) {
        if (active) {
            gameData.activeEntities.operations.add(this.name);
        } else {
            gameData.activeEntities.operations.delete(this.name);
        }
        GameEvents.TaskActivityChanged.trigger({
            type: this.type,
            name: this.name,
            newActivityState: active,
        });
    }

    /**
     * @return {number}
     */
    getLevelMultiplier() {
        return 1 + Math.log10(this.level + 1);
    }

    getMaxLevelMultiplier() {
        return 1 + this.maxLevel / 100;
    }

    /**
     * @return {number}
     */
    getGridLoad() {
        return this.gridLoad;
    }
}


class Sector extends Entity {
    /**
     * @param {{
     *     title: string,
     *     description?: string,
     *     pointsOfInterest: PointOfInterest[]
     * }} baseData
     */
    constructor(baseData) {
        super(baseData.title, baseData.description);

        this.pointsOfInterest = baseData.pointsOfInterest;
        for (const pointOfInterest of this.pointsOfInterest) {
            pointOfInterest.registerSector(this);
        }
    }
}


/**
 * @implements EffectsHolder
 */
class PointOfInterest extends Entity {
    /** @var {Sector} */
    sector = null;

    /**
     *
     * @param {{
     *     title: string,
     *     description?: string,
     *     effects: EffectDefinition[],
     *     modifiers: ModifierDefinition[],
     * }} baseData
     */
    constructor(baseData) {
        super(baseData.title, baseData.description);

        this.effects = baseData.effects;
        this.modifiers = baseData.modifiers;
    }

    /**
     * @param {Sector} sector
     */
    registerSector(sector) {
        console.assert(this.sector === null, 'Sector already registered.');
        this.sector = sector;
    }

    /**
     * @return {boolean}
     */
    isActive() {
        return gameData.activeEntities.pointOfInterest === this.name;
    }

    /**
     * @returns {EffectDefinition[]}
     */
    getEffects() {
        return this.effects;
    }

    /**
     * @param {EffectType} effectType
     * @returns {number}
     */
    getEffect(effectType) {
        return Effect.getValue(this, effectType, this.effects, 1);
    }

    /**
     * @return {string} HTML
     */
    getEffectDescription() {
        // Danger is displayed in a separate column
        return Effect.getDescriptionExcept(this, this.effects, 1, EffectType.Danger);
    }

    /**
     * @return {string[]} plain text
     */
    getFormattedEffectValues(){
        return Effect.getFormattedValuesExcept(this, this.effects, 1, EffectType.Danger);
    }
}

/**
 * @typedef {Object} GalacticSecretSavedValues
 * @property {boolean} unlocked
 */

class GalacticSecret extends Entity {
    /**
     * 0.0 - 1.0
     * @type {number}
     */
    unlockProgress = 0;
    inProgress = false;
    lastUpdate = performance.now();

    /**
     * @param {{
     *     unlocks: ModuleOperation,
     * }} baseData
     */
    constructor(baseData) {
        super(GalacticSecret.#createTitle(baseData.unlocks), baseData.unlocks.description);

        this.unlocks = baseData.unlocks;
        this.unlocks.registerRequirement(new GalacticSecretRequirement({galacticSecret: this}));
    }

    /**
     * @param {ModuleOperation} unlock
     */
    static #createTitle(unlock) {
        return unlock.component.title + ': ' + unlock.title;
    }

    /**
     * @param {GalacticSecretSavedValues} savedValues
     */
    loadValues(savedValues) {
        validateParameter(savedValues, {
            unlocked: JsTypes.Boolean,
        }, this);
        this.savedValues = savedValues;
    }

    /**
     * @return {GalacticSecretSavedValues}
     */
    static newSavedValues() {
        return {
            unlocked: false,
        };
    }

    /**
     *
     * @return {GalacticSecretSavedValues}
     */
    getSavedValues() {
        return this.savedValues;
    }

    get isUnlocked() {
        return this.savedValues.unlocked;
    }

    set isUnlocked(unlocked) {
        this.savedValues.unlocked = unlocked;
    }

    update() {
        const now = performance.now();
        const timeDelta = now - this.lastUpdate;
        this.lastUpdate = now;
        if (this.inProgress) {
            if (this.unlockProgress < 1) {
                this.unlockProgress += timeDelta / galacticSecretUnlockDuration;
            }
        } else {
            if (this.unlockProgress > 0) {
                this.unlockProgress -= timeDelta / galacticSecretUnlockDuration;
                if (this.unlockProgress < 0) {
                    this.unlockProgress = 0;
                }
            }
        }
    }
}

/**
 * @typedef {Object} RequirementLike
 * @property {function(): string} toHtml
 * @property {function(): boolean} isVisible
 */

/**
 * @typedef {Object} RequirementSavedValues
 * @property {boolean} completed
 */

/**
 * @extends {RequirementLike}
 */
class Requirement {
    /**
     * This list is only used during initialization. Afterward its 
     * discarded, and you have to use the global `requirementRegistry`.
     * 
     * @type {Requirement[]}
     */
    static allRequirements = [];

    /**
     * @readonly
     * @var {string}
     */
    #name;

    get name() {
        return this.#name;
    }

    /**
     *
     * @param {string} type
     * @param {'permanent'|'playthrough'|'update'} scope
     * @param {*} baseData - The data object for this requirement (previously an array)
     * @param {Requirement[]} [prerequisites]
     */
    constructor(type, scope, baseData, prerequisites) {
        this.type = type;
        this.scope = scope;
        this.baseData = baseData;
        this.prerequisites = prerequisites;

        if (Array.isArray(prerequisites)) {
            this.prerequisites = prerequisites;
        } else {
            this.prerequisites = [];
        }

        Requirement.allRequirements.push(this);
    }

    /**
     * @param {Object<string, Requirement>} requirementRegistry
     */
    register(requirementRegistry){
        // Auto-generate name and self-register
        const generatedName = this.generateName();

        if (requirementRegistry.hasOwnProperty(generatedName)) {
            throw new Error(
                `Duplicate requirement detected: "${generatedName}". Reusing existing instance.`,
            );
        }

        // New requirement - register it
        this.#name = generatedName;
        requirementRegistry[generatedName] = this;
    }

    /**
     * Generate a unique name for this requirement based on its type, scope, and content.
     * Must be implemented by each subclass.
     * @abstract
     * @return {string}
     */
    generateName() {
        throw new TypeError('generateName() not implemented by ' + this.constructor.name);
    }

    /**
     * @param {RequirementSavedValues} savedValues
     */
    loadValues(savedValues) {
        validateParameter(savedValues, {
            completed: JsTypes.Boolean,
        }, this);
        this.savedValues = savedValues;
    }

    /**
     * @return {RequirementSavedValues}
     */
    static newSavedValues() {
        return {
            completed: false,
        };
    }

    /**
     * @return {RequirementSavedValues}
     */
    getSavedValues() {
        return this.savedValues;
    }

    set completed(completed) {
        switch (this.scope) {
            case 'permanent':
            case 'playthrough':
                this.getSavedValues().completed = completed;
                break;
            case 'update':
                // discard
                break;
        }
    }

    /**
     * @return {boolean}
     */
    get completed() {
        switch (this.scope) {
            case 'permanent':
            case 'playthrough':
                return this.getSavedValues().completed;
            case 'update':
                return false;
        }
    }

    /**
     * @return {boolean}
     */
    isCompleted() {
        if (this.completed) return true;

        if (!this.getCondition(this.baseData)) {
            return false;
        }
        this.completed = true;
        return true;
    }

    /**
     * @return {boolean}
     */
    isVisible() {
        return this.prerequisites.every(requirement => requirement.isCompleted());
    }

    reset() {
        switch (this.scope) {
            case 'permanent':
                // Keep value
                break;
            case 'playthrough':
                this.getSavedValues().completed = false;
                break;
            case 'update':
                // discarded anyway
                break;
        }
    }

    /**
     * @param {*} baseData - The data object for this requirement
     * @return {boolean}
     */
    getCondition(baseData) {
        throw new TypeError('getCondition not implemented.');
    }

    /**
     * @return {string}
     */
    toHtml() {
        if (this.getCondition(this.baseData)) {
            return '';
        }

        const innerHtml = this.toHtmlInternal(this.baseData).trim();

        console.assert(innerHtml !== '', 'Empty requirement html', this);

        return `<span class="${this.type}">${innerHtml}</span>`;
    }

    /**
     * @param {*} baseData - The data object for this requirement
     * @return {string}
     */
    toHtmlInternal(baseData) {
        throw new TypeError('toHtmlInternal not implemented.');
    }

    /**
     * @param {Requirement[]} requirements
     * @return {Requirement[]|null} Either a list of open {@link Requirement}s or `null` if there are no open requirements.
     */
    static getUnfulfilledRequirements(requirements) {
        if (isUndefined(requirements)) {
            return null;
        }

        const openRequirements = requirements.filter(requirement => !requirement.isCompleted());
        if (openRequirements.length === 0) {
            return null;
        }
        return openRequirements;
    }

    /**
     * @param {{requirements: Requirement[]}} entity
     */
    static hasRequirementsFulfilled(entity) {
        if (isUndefined(entity.requirements)) {
            return true;
        }

        return entity.requirements.every(requirement => requirement.isCompleted());
    }

    /**
     * @param {{requirements: Requirement[]}} entity
     */
    static hasUnfulfilledRequirements(entity) {
        return !Requirement.hasRequirementsFulfilled(entity);
    }
}

/**
 *
 * @param {Requirement[]} requirements
 * @return {'permanent'|'playthrough'|'update'}
 */
function findShortestScope(requirements) {
    let scope = 'permanent';
    for (const requirement of requirements) {
        switch (requirement.scope) {
            case 'permanent':
                break;
            case 'playthrough':
                if (scope === 'permanent') {
                    scope = 'playthrough';
                }
                break;
            case 'update':
                return 'update'; // can instantly return, there is no shorter scope
        }
    }

    return scope;
}

/**
 * Usually used as Prerequisites to check if the requirements of another entity are fulfilled.
 *
 * The scope is automatically set to the shortest scope among requirements of the provided entity to ensure accurate checking.
 */
class EntityUnlockedRequirement extends Requirement {
    /**
     * @param {{requirements: Requirement[]}} entity
     */
    constructor(entity) {
        super('EntityUnlockedRequirement', findShortestScope(entity.requirements), entity);
    }

    generateName() {
        const entityName = this.baseData.name;
        return `EntityUnlocked_${this.scope}_${entityName}`;
    }

    /**
     * @param {{requirements: Requirement[]}} entity
     * @return {boolean}
     */
    getCondition(entity) {
        return Requirement.hasRequirementsFulfilled(entity);
    }

    /**
     * @param {{requirements: Requirement[]}} entity
     * @return {string}
     */
    toHtmlInternal(entity) {
        throw new TypeError('toHtmlInternal not supported.');
    }
}

class OperationLevelRequirement extends Requirement {
    /**
     * @param {'permanent'|'playthrough'|'update'} scope
     * @param {{operation: ModuleOperation, requirement: number}} baseData
     * @param {Requirement[]} [prerequisites]
     */
    constructor(scope, baseData, prerequisites) {
        super('OperationLevelRequirement', scope, baseData, prerequisites);
    }

    generateName() {
        return `OperationLevel_${this.scope}_${this.baseData.operation.name}_${this.baseData.requirement}`;
    }

    /**
     * @param {{operation: ModuleOperation, requirement: number}} baseData
     * @return {boolean}
     */
    getCondition(baseData) {
        return baseData.operation.level >= baseData.requirement;
    }

    isVisible() {
        return Requirement.hasRequirementsFulfilled(this.baseData.operation)
            && super.isVisible();
    }

    /**
     * @param {{operation: ModuleOperation, requirement: number}} baseData
     * @return {string}
     */
    toHtmlInternal(baseData) {
        return `
<span class="name">${baseData.operation.title}</span>
level
<data value="${baseData.operation.level}">${baseData.operation.level}</data> /
<data value="${baseData.requirement}">${baseData.requirement}</data>
`;
    }
}

class CyclesPassedRequirement extends Requirement {
    /**
     * @param {'permanent'|'playthrough'|'update'} scope
     * @param {{requirement: number}} baseData
     * @param {Requirement[]} [prerequisites]
     */
    constructor(scope, baseData, prerequisites) {
        super('CyclesPassedRequirement', scope, baseData, prerequisites);
    }

    generateName() {
        return `CyclesPassed_${this.scope}_${this.baseData.requirement}`;
    }

    /**
     * @param {{requirement: number}} baseData
     * @return {boolean}
     */
    getCondition(baseData) {
        return gameData.cycles >= baseData.requirement;
    }

    /**
     * @param {{requirement: number}} baseData
     * @return {string}
     */
    toHtmlInternal(baseData) {
        return `
<span class="name">IC</span>
<data value="${gameData.cycles}">${gameData.cycles}</data> /
<data value="${baseData.requirement}">${baseData.requirement}</data>`;
    }
}

class AttributeRequirement extends Requirement {
    /**
     * @param {'permanent'|'playthrough'|'update'} scope
     * @param {{attribute: AttributeDefinition, requirement: number}} baseData
     * @param {Requirement[]} [prerequisites]
     */
    constructor(scope, baseData, prerequisites) {
        super('AttributeRequirement', scope, baseData, prerequisites);
    }

    generateName() {
        return `Attribute_${this.scope}_${this.baseData.attribute.name}_${this.baseData.requirement}`;
    }

    /**
     * @param {{attribute: AttributeDefinition, requirement: number}} baseData
     * @return {boolean}
     */
    getCondition(baseData) {
        return baseData.attribute.getValue() >= baseData.requirement;
    }

    /**
     * @param {{attribute: AttributeDefinition, requirement: number}} baseData
     * @return {string}
     */
    toHtmlInternal(baseData) {
        const value = baseData.attribute.getValue();

        // TODO format value correctly
        return `
<span class="name">${baseData.attribute.title}</span>
<data value="${value}">${formatNumber(value)}</data> /
<data value="${baseData.requirement}">${formatNumber(baseData.requirement)}</data>
`;
    }
}

class PointOfInterestVisitedRequirement extends Requirement {
      /**
     * @param {'permanent'|'playthrough'|'update'} scope
     * @param {{pointOfInterest: PointOfInterest}} baseData
     * @param {Requirement[]} [prerequisites]
     */
    constructor(scope, baseData, prerequisites) {
        super('PointOfInterestVisitedRequirement', scope, baseData, prerequisites);
    }

    generateName() {
        return `PointOfInterestVisited_${this.scope}_${this.baseData.pointOfInterest.name}`;
    }

    /**
     * @param {{pointOfInterest: PointOfInterest}} baseData
     * @return {boolean}
     */
    getCondition(baseData) {
        return baseData.pointOfInterest.isActive();
    }

    /**
     * @param {{pointOfInterest: PointOfInterest}} baseData
     * @return {string}
     */
    toHtmlInternal(baseData) {
        const poiUnlocked = Requirement.hasRequirementsFulfilled(this.baseData.pointOfInterest);
        if (poiUnlocked) {
            return `visit <span class="name">${baseData.pointOfInterest.title}</span>`;
        } else {
            // Instead of completely hiding this requirement, we mask it a bit
            return `visit <span class="name"><i>Undiscovered Location</i></span>`;
        }
    }
}

class GalacticSecretRequirement extends Requirement {
    /**
     * @param {{galacticSecret: GalacticSecret}} baseData
     * @param {Requirement[]} [prerequisites]
     */
    constructor(baseData, prerequisites) {
        super('GalacticSecretRequirement', 'permanent', baseData, prerequisites);
    }

    generateName() {
        return `GalacticSecret_${this.baseData.galacticSecret.name}`;
    }

    /**
     * @param {{galacticSecret: GalacticSecret}} baseData
     * @return {boolean}
     */
    getCondition(baseData) {
        return baseData.galacticSecret.isUnlocked;
    }

    isVisible() {
        // Hide Galactic Secret requirements, unless the player currently has Essence of Unknown available
        return attributes.essenceOfUnknown.getValue() > 0
            && super.isVisible();
    }

    /**
     * @param {{galacticSecret: GalacticSecret}} baseData
     * @return {string}
     */
    toHtmlInternal(baseData) {
        return 'an unraveled Galactic Secret';
    }
}

class HtmlElementWithRequirement {

    /**
     * @param {{
     *     elementsWithRequirements: (HTMLElement|LazyHtmlElement|LazyHtmlElementCollection)[],
     *     requirements: Requirement[],
     *     elementsToShowRequirements?: HTMLElement[],
     * }} baseData
     */
    constructor(baseData) {
        this.elementsWithRequirements = baseData.elementsWithRequirements;
        this.requirements = baseData.requirements;
        this.elementsToShowRequirements = isUndefined(baseData.elementsToShowRequirements) ? [] : baseData.elementsToShowRequirements;

        if (!Array.isArray(this.requirements)) {
            this.requirements = [];
        }
    }

    /**
     * @return {boolean}
     */
    isCompleted() {
        return this.requirements.every(requirement => requirement.isCompleted());
    }

    /**
     * @return {boolean}
     */
    isVisible() {
        return this.requirements.every(requirement => requirement.isVisible());
    }

    /**
     * @return {string}
     */
    toHtml() {
        const requirementsString = this.requirements
            .map(requirement => requirement.toHtml())
            .filter(requirementString => requirementString !== null && requirementString.trim() !== '')
            .join(', ');
        // This HTML should match the content of <template id="requirementsTemplate">
        return `<div class="requirements help-text">
            Next unlock at:
            <span class="rendered">${requirementsString}</span>
        </div>`;
    }

    /**
     * @return {Requirement[]|null} Either a list of open {@link Requirement}s or `null` if there are no open requirements.
     */
    getUnfulfilledRequirements() {
        return Requirement.getUnfulfilledRequirements(this.requirements);
    }

    reset() {
        // Nothing to do - requirements get centrally reset
    }
}
