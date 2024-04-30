'use strict';

/**
 * @typedef {Object} AttributeDefinition
 * @property {string} [name] - identifier
 * @property {string} title - displayed name of the attribute
 * @property {string} textClass - css class to attack to the title
 * @property {string} icon - path to the icon file#
 * @property {string} [description] - (HTML) description of the attribute
 * @property {function(): number} getValue - retrieves the current value for this attribute
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

    registerRequirementInternal(requirement, index) {
        requirement.registerSaveAndLoad((completed) => {
            this.getSavedValues().requirementCompleted[index] = completed;
        }, () => {
            if (isUndefined(this.getSavedValues().requirementCompleted[index])) {
                this.getSavedValues().requirementCompleted[index] = false;
            }
            return this.getSavedValues().requirementCompleted[index];
        });
    }

    registerRequirement(requirement) {
        const index = this.requirements.push(requirement) - 1;
        this.registerRequirementInternal(requirement, index);
        return requirement;
    }

    loadValues(savedValues) {
        // Abstract method that needs to be implemented by each subclass
        throw new TypeError('loadValues not implemented by ' + this.constructor.name);
    }

    /**
     * @return {{
     *     requirementCompleted: boolean[]
     * }}
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
        for (const requirement of this.requirements) {
            requirement.reset();
        }
    }
}

/**
 * @typedef {Object} TaskSavedValues
 * @property {number} level
 * @property {number} maxLevel
 * @property {number} xp
 * @property {boolean[]} requirementCompleted
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
            requirementCompleted: JsTypes.Array,
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
            requirementCompleted: [],
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
     * @return {string}
     */
    getEffectDescription(levelOverride = undefined) {
        const level = isNumber(levelOverride) ? levelOverride : this.level;
        return Effect.getDescription(this, this.effects, level);
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
        return getGeneratedEnergy();
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


/**
 * @typedef {Object} ModuleCategorySavedValues
 * @property {boolean[]} requirementCompleted
 */

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

    /**
     * @param {ModuleCategorySavedValues} savedValues
     */
    loadValues(savedValues) {
        validateParameter(savedValues, {
            requirementCompleted: JsTypes.Array,
        }, this);
        this.savedValues = savedValues;
    }

    /**
     * @return {ModuleCategorySavedValues}
     */
    static newSavedValues() {
        return {
            requirementCompleted: [],
        };
    }

    /**
     * @return {ModuleCategorySavedValues}
     */
    getSavedValues() {
        return this.savedValues;
    }
}

/**
 * @typedef {Object} ModuleSavedValues
 * @property {number} maxLevel
 * @property {boolean[]} requirementCompleted
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
            requirementCompleted: JsTypes.Array,
        }, this);
        this.savedValues = savedValues;
    }

    /**
     * @return {ModuleSavedValues}
     */
    static newSavedValues() {
        return {
            maxLevel: 0,
            requirementCompleted: [],
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

/**
 * @typedef {Object} ModuleComponentSavedValues
 * @property {boolean[]} requirementCompleted
 */

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
     * @param {ModuleComponentSavedValues} savedValues
     */
    loadValues(savedValues) {
        validateParameter(savedValues, {
            requirementCompleted: JsTypes.Array,
        }, this);
        this.savedValues = savedValues;
    }

    /**
     * @return {ModuleComponentSavedValues}
     */
    static newSavedValues() {
        return {
            requirementCompleted: [],
        };
    }

    /**
     * @return {ModuleComponentSavedValues}
     */
    getSavedValues() {
        return this.savedValues;
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


/**
 * @typedef {Object} SectorSavedValues
 * @property {boolean[]} requirementCompleted
 */

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

    /**
     * @param {SectorSavedValues} savedValues
     */
    loadValues(savedValues) {
        validateParameter(savedValues, {
            requirementCompleted: JsTypes.Array,
        }, this);
        this.savedValues = savedValues;
    }

    /**
     * @return {SectorSavedValues}
     */
    static newSavedValues() {
        return {
            requirementCompleted: [],
        };
    }

    /**
     *
     * @return {SectorSavedValues}
     */
    getSavedValues() {
        return this.savedValues;
    }
}


/**
 * @typedef {Object} PointOfInterestSavedValues
 * @property {boolean[]} requirementCompleted
 */

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
     * @param {PointOfInterestSavedValues} savedValues
     */
    loadValues(savedValues) {
        validateParameter(savedValues, {
            requirementCompleted: JsTypes.Array,
        }, this);
        this.savedValues = savedValues;
    }

    /**
     * @return {PointOfInterestSavedValues}
     */
    static newSavedValues() {
        return {requirementCompleted: []};
    }

    /**
     * @return {PointOfInterestSavedValues}
     */
    getSavedValues() {
        return this.savedValues;
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
     * @return {string}
     */
    getEffectDescription() {
        // Danger is displayed in a separate column
        return Effect.getDescriptionExcept(this, this.effects, 1, EffectType.Danger);
    }
}

/**
 * @typedef {Object} GalacticSecretSavedValues
 * @property {boolean} unlocked
 * @property {boolean[]} requirementCompleted
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
        this.unlocks.registerRequirement(new GalacticSecretRequirement([{galacticSecret: this}]));
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
            requirementCompleted: JsTypes.Array,
        }, this);
        this.savedValues = savedValues;
    }

    /**
     * @return {GalacticSecretSavedValues}
     */
    static newSavedValues() {
        return {
            unlocked: false,
            requirementCompleted: [],
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
 */

/**
 * @extends {RequirementLike}
 */
class Requirement {
    /** @var {function(boolean)} */
    saveFn;
    /** @var {function(): boolean} */
    loadFn;

    /**
     *
     * @param {string} type
     * @param {'permanent'|'playthrough'|'update'} scope
     * @param {*[]} requirements
     */
    constructor(type, scope, requirements) {
        this.type = type;
        this.scope = scope;
        this.requirements = requirements;
    }

    /**
     * @param {function(boolean)} saveFn
     * @param {function(): boolean} loadFn
     */
    registerSaveAndLoad(saveFn, loadFn) {
        this.saveFn = saveFn;
        this.loadFn = loadFn;
    }

    set completed(completed) {
        switch (this.scope) {
            case 'permanent':
            case 'playthrough':
                this.saveFn(completed);
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
                return this.loadFn();
            case 'update':
                return false;
        }
    }

    /**
     * @return {boolean}
     */
    isCompleted() {
        if (this.completed) return true;

        for (const requirement of this.requirements) {
            if (!this.getCondition(requirement)) {
                return false;
            }
        }
        this.completed = true;
        return true;
    }

    reset() {
        switch (this.scope) {
            case 'permanent':
                // Keep value
                break;
            case 'playthrough':
                this.saveFn(false);
                break;
            case 'update':
                // discarded anyway
                break;
        }
    }

    /**
     * @return {boolean}
     */
    getCondition(requirement) {
        throw new TypeError('getCondition not implemented.');
    }

    /**
     * @return {string}
     */
    toHtml() {
        return '<span class="' + this.type + '">'
            + this.requirements
                .filter(requirement => !this.getCondition(requirement))
                .map(requirement => this.toHtmlInternal(requirement).trim())
                .join(', ')
            + '</span>';
    }

    /**
     * @return {string}
     */
    toHtmlInternal(requirement) {
        throw new TypeError('toHtml not implemented.');
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
}

class OperationLevelRequirement extends Requirement {
    /**
     * @param {'permanent'|'playthrough'|'update'} scope
     * @param {{operation: ModuleOperation, requirement: number}[]} requirements
     */
    constructor(scope, requirements) {
        super('OperationLevelRequirement', scope, requirements);
    }

    /**
     * @param {{operation: ModuleOperation, requirement: number}} requirement
     * @return {boolean}
     */
    getCondition(requirement) {
        return requirement.operation.level >= requirement.requirement;
    }

    /**
     * @param {{operation: ModuleOperation, requirement: number}} requirement
     * @return {string}
     */
    toHtmlInternal(requirement) {
        return `
<span class="name">${requirement.operation.title}</span>
level 
<data value="${requirement.operation.level}">${requirement.operation.level}</data> /
<data value="${requirement.requirement}">${requirement.requirement}</data>
`;
    }
}

class AgeRequirement extends Requirement {
    /**
     * @param {'permanent'|'playthrough'|'update'} scope
     * @param {{requirement: number}[]} requirements
     */
    constructor(scope, requirements) {
        super('AgeRequirement', scope, requirements);
    }

    /**
     *
     * @param {{requirement: number}} requirement
     * @return {boolean}
     */
    getCondition(requirement) {
        return gameData.cycles >= requirement.requirement;
    }

    /**
     * @param {{requirement: number}} requirement
     * @return {string}
     */
    toHtmlInternal(requirement) {
        return `
<span class="name">IC</span>
<data value="${gameData.cycles}">${gameData.cycles}</data> /
<data value="${requirement.requirement}">${requirement.requirement}</data>`;
    }
}

class AttributeRequirement extends Requirement {
    /**
     * @param {'permanent'|'playthrough'|'update'} scope
     * @param {{attribute: AttributeDefinition, requirement: number}[]} requirements
     */
    constructor(scope, requirements) {
        super('AttributeRequirement', scope, requirements);
    }

    /**
     * @param {{attribute: AttributeDefinition, requirement: number}} requirement
     * @return {boolean}
     */
    getCondition(requirement) {
        return requirement.attribute.getValue() >= requirement.requirement;
    }

    /**
     * @param {{attribute: AttributeDefinition, requirement: number}} requirement
     * @return {string}
     */
    toHtmlInternal(requirement) {
        const value = requirement.attribute.getValue();
        // TODO format value correctly
        return `
<span class="name">${requirement.attribute.title}</span> 
<data value="${value}">${formatNumber(value)}</data> /
<data value="${requirement.requirement}">${formatNumber(requirement.requirement)}</data>
`;
    }
}

class PointOfInterestVisitedRequirement extends Requirement {
      /**
     * @param {'permanent'|'playthrough'|'update'} scope
     * @param {{pointOfInterest: PointOfInterest}[]} requirements
     */
    constructor(scope, requirements) {
        super('PointOfInterestVisitedRequirement', scope, requirements);
    }

    /**
     * @param {{pointOfInterest: PointOfInterest}} requirement
     * @return {boolean}
     */
    getCondition(requirement) {
        return requirement.pointOfInterest.isActive();
    }

    /**
     * @param {{pointOfInterest: PointOfInterest}} requirement
     * @return {string}
     */
    toHtmlInternal(requirement) {
        return `visit <span class="name">${requirement.pointOfInterest.title}</span>`;
    }
}

class GalacticSecretRequirement extends Requirement {
    /**
     * @param {{galacticSecret: GalacticSecret}[]} requirements
     */
    constructor(requirements) {
        super('GalacticSecretRequirement', 'permanent', requirements);
    }

    /**
     * @param {{galacticSecret: GalacticSecret}} requirement
     * @return {boolean}
     */
    getCondition(requirement) {
        return requirement.galacticSecret.isUnlocked;
    }

    /**
     * @param {{galacticSecret: GalacticSecret}} requirement
     * @return {string}
     */
    toHtmlInternal(requirement) {
        return 'an unraveled Galactic Secret';
    }
}

/**
 * @typedef {Object} HtmlElementWithRequirementSavedValues
 * @property {boolean[]} requirementCompleted
 * @property {boolean[]} prerequirementCompleted
 */

class HtmlElementWithRequirement {
    /**
     * @param {{
     *     elementsWithRequirements: HTMLElement[],
     *     requirements: Requirement[],
     *     elementsToShowRequirements?: HTMLElement[],
     *     prerequirements?: Requirement[],
     * }} baseData
     */
    constructor(baseData) {
        this.elementsWithRequirements = baseData.elementsWithRequirements;
        this.requirements = baseData.requirements;
        this.elementsToShowRequirements = isUndefined(baseData.elementsToShowRequirements) ? [] : baseData.elementsToShowRequirements;
        this.prerequirements = baseData.prerequirements;

        if (Array.isArray(this.requirements)) {
            // Use Array.prototype.forEach to a) have an index and b) capture it
            this.requirements.forEach(this.registerRequirementInternal, this);
        } else {
            this.requirements = [];
        }
        if (Array.isArray(this.prerequirements)) {
            // Use Array.prototype.forEach to a) have an index and b) capture it
            this.prerequirements.forEach(this.registerPrerequirementInternal, this);
        } else {
            this.prerequirements = [];
        }
    }

    registerPrerequirementInternal(requirement, index) {
        requirement.registerSaveAndLoad((completed) => {
            this.getSavedValues().prerequirementCompleted[index] = completed;
        }, () => {
            if (isUndefined(this.getSavedValues().prerequirementCompleted[index])) {
                this.getSavedValues().prerequirementCompleted[index] = false;
            }
            return this.getSavedValues().prerequirementCompleted[index];
        });
    }

    /**
     * @param {HtmlElementWithRequirementSavedValues} savedValues
     */
    loadValues(savedValues) {
        validateParameter(savedValues, {
            requirementCompleted: JsTypes.Array,
        }, this);
        this.savedValues = savedValues;
    }

    /**
     * @return {HtmlElementWithRequirementSavedValues}
     */
    static newSavedValues() {
        return {
            requirementCompleted: [],
            prerequirementCompleted: [],
        };
    }

    /**
     *
     * @return {HtmlElementWithRequirementSavedValues}
     */
    getSavedValues() {
        return this.savedValues;
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
        return this.prerequirements.every(requirement => requirement.isCompleted());
    }

    /**
     * @return {string}
     */
    toHtml() {
        // TODO use #requirementsTemplate
        const requirementsString = this.requirements
            .map(requirement => requirement.toHtml())
            .filter(requirementString => requirementString !== null && requirementString.trim() !== '')
            .join(', ');
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
        for (const requirement of this.requirements) {
            requirement.reset();
        }
        for (const requirement of this.prerequirements) {
            requirement.reset();
        }
    }
}

// Funky cross-extension aka "Trait"
HtmlElementWithRequirement.prototype.registerRequirementInternal = Entity.prototype.registerRequirementInternal;
