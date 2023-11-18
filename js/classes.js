'use strict';

/**
 * @typedef {Object} AttributeDefinition
 * @property {string} [name] - identifier
 * @property {string} title - displayed name of the attribute
 * @property {null|string} color - font color to display the title
 * @property {null|string} icon - path to the icon file#
 * @property {string} [description] - (HTML) description of the attribute
 * @property {function(): number} getValue - retrieves the current value for this attribute
 */

/**
 * @typedef {Object} FactionDefinition
 * @property {string} title
 * @property {string} [description]
 * @property {number} maxXp
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
    id;



    /**
     * @param {string} title
     * @param {string|undefined} description
     */
    constructor(title, description) {
        this.type = this.constructor.name;
        this.title = prepareTitle(title);
        this.description = description;
    }

    get name(){
        return this.#name;
    }

    set name(name) {
        if (isDefined(this.#name)) {
            throw TypeError(this.type + '.name already set to "' + this.#name + '". Attempted override name: "' + name + '".');
        }

        this.#name = name;
        this.id = 'row_' + this.type + name;
    }

    loadData(savedValues){
        // Abstract method that needs to be implemented by each sub class
        throw new TypeError('loadData not implemented by ' + this.constructor.name);
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

        this.baseData = baseData;
        this.level = 0;
        this.maxLevel = 0;
        this.xp = 0;
        this.xpMultipliers = [];
    }

    /**
     * @param {TaskSavedValues} savedValues
     */
    loadData(savedValues){
        validateParameter(savedValues, {
            level: JsTypes.Number,
            maxLevel: JsTypes.Number,
            xp: JsTypes.Number,
        });
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

    get level(){
        return this.savedValues.level;
    }

    set level(level) {
        this.savedValues.level = level;
    }

    get maxLevel(){
        return this.savedValues.level;
    }

    set maxLevel(maxLevel) {
        this.savedValues.maxLevel = maxLevel;
    }

    get xp(){
        return this.savedValues.xp;
    }

    set xp(level) {
        this.savedValues.xp = xp;
    }

    do() {
        this.increaseXp();
    }

    getMaxXp() {
        return Math.round(this.baseData.maxXp * (this.level + 1) * Math.pow(1.01, this.level));
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

    collectEffects() {
        this.xpMultipliers.push(this.getMaxLevelMultiplier.bind(this));

        //this.populationEffectMethods.push(getBoundTaskEffect('Dark influence'));
        //this.xpMultipliers.push(getBoundTaskEffect('Demon training'));
    }

    /**
     * @returns {EffectDefinition[]}
     */
    getEffects() {
        return this.baseData.effects;
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
        return Effect.getValue(this, effectType, this.baseData.effects, this.level);
    }

    /**
     * @return {string}
     */
    getEffectDescription() {
        return Effect.getDescription(this, this.baseData.effects, this.level);
    }

    increaseXp(ignoreDeath = false) {
        this.xp += applySpeed(this.getXpGain(), ignoreDeath);
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
        }
        if (this.level > previousLevel) {
            GameEvents.TaskLevelChanged.trigger({
                type: this.type,
                name: this.name,
                previousLevel: previousLevel,
                nextLevel: this.level,
            });
        }
        this.xp = this.getMaxXp() + excess;
    }

    updateMaxLevelAndReset() {
        if (this.level > this.maxLevel) {
            this.maxLevel = this.level;
        }
        this.level = 0;
        this.xp = 0;
    }
}

class GridStrength extends Task {
    constructor(baseData) {
        super(baseData);
    }

    getXpGain() {
        return applyMultipliers(getEnergyGeneration(), this.xpMultipliers);
    }

    getGridStrength() {
        return this.level;
    }

    getMaxXp() {
        // TODO not final, but works somewhat okay
        return Math.round(this.baseData.maxXp * Math.pow(Math.E, this.level * 2));
    }
}

class ModuleCategory extends Entity {

    /**
     *
     * @param {{
     *     title: string,
     *     description?: string,
     *     color: string
     *     modules: Module[],
     * }} baseData
     */
    constructor(baseData) {
        super(baseData.title, baseData.description);

        this.modules = baseData.modules;
        this.color = baseData.color;
    }

    /**
     * @param {EmptySavedValues} savedValues
     */
    loadData(savedValues){
        validateParameter(savedValues, {}, this);
    }

    /**
     * @return {EmptySavedValues}
     */
    static newSavedValues() {
        return {};
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
        this.maxLevel = 0;
    }

    /**
     * @param {ModuleSavedValues} savedValues
     */
    loadData(savedValues){
        validateParameter(savedValues, {maxLevel: JsTypes.Number}, this);
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

    get maxLevel() {
        return this.savedValues.maxLevel;
    }

    set maxLevel(maxLevel) {
        this.savedValues.maxLevel = maxLevel;
    }

    // TODO remove
    getSaveData() {
        return {maxLevel: this.maxLevel};
    }

    loadSaveData(saveData) {
        this.maxLevel = saveData.maxLevel;
        this.propagateMaxLevel();
    }

    do() {
        for (const component of this.components) {
            component.do();
        }
    }

    // TODO remove - this goes against the UI | Logic pattern
    /**
     *
     * @param {HTMLInputElement} button
     */
    setToggleButton(button) {
        this.toggleButton = button;
        button.addEventListener('click', this.onToggleButton.bind(this));
    }

    onToggleButton() {
        this.setEnabled(this.toggleButton.checked);
    }

    setEnabled(value) {
        this.toggleButton.checked = value;
        if (value) {
            if (!gameData.currentModules.hasOwnProperty(this.name)) {
                gameData.currentModules[this.name] = this;
            }
        } else {
            if (gameData.currentModules.hasOwnProperty(this.name)) {
                delete gameData.currentModules [this.name];
            }
        }

        for (const component of this.components) {
            component.setEnabled(value);
        }
    }

    toggleEnabled() {
        this.setEnabled(!this.toggleButton.checked);
    }

    init() {
        this.propagateMaxLevel();
        this.setEnabled(gameData.currentModules.hasOwnProperty(this.name));
    }

    getLevel() {
        return this.components.reduce((levelSum, component) => levelSum + component.getOperationLevels(), 0);
    }

    propagateMaxLevel() {
        for (const component of this.components) {
            for (const operation of component.operations) {
                operation.maxLevel = this.maxLevel;
            }
        }
    }

    updateMaxLevel() {
        const currentLevel = this.getLevel();
        if (currentLevel > this.maxLevel) {
            this.maxLevel = currentLevel;
        }
        this.propagateMaxLevel();
    }

    getGridLoad() {
        return this.components.reduce(
            (gridLoadSum, component) => gridLoadSum + component.currentOperation.getGridLoad(),
            0);
    }
}

class ModuleComponent extends Entity {

    /**
     * @param {{
     *     title: string,
     *     description?: string,
     *     operations: ModuleOperation[]
     * }} baseData
     */
    constructor(baseData) {
        super(baseData.title, baseData.description);

        this.operations = baseData.operations;
        this.currentOperation = this.operations[0];
    }

    /**
     * @param {EmptySavedValues} savedValues
     */
    loadData(savedValues){
        validateParameter(savedValues, {}, this);
    }

    /**
     * @return {EmptySavedValues}
     */
    static newSavedValues() {
        return {};
    }

    do() {
        if (this.currentOperation instanceof ModuleOperation) {
            this.currentOperation.do();
        }
    }

    setEnabled(value) {
        if (value) {
            if (this.currentOperation !== null) {
                this.currentOperation.setEnabled(value);
            }
        } else {
            for (const operation of this.operations) {
                operation.setEnabled(false);
            }
        }

    }

    setActiveOperation(newOperation) {
        if (this.currentOperation === newOperation) return;

        for (const operation of this.operations) {
            if (operation === newOperation) {
                this.currentOperation = operation;
            }
            operation.setEnabled(operation === newOperation);
        }
    }

    getOperationLevels() {
        let levels = 0;
        for (const operation of this.operations) {
            levels += operation.level;
        }
        return levels;
    }
}

class ModuleOperation extends Task {
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
    }

    collectEffects() {
        super.collectEffects();
        this.xpMultipliers.push(attributes.industry.getValue);
    }

    setEnabled(value) {
        if (value) {
            if (!gameData.currentOperations.hasOwnProperty(this.name)) {
                gameData.currentOperations[this.name] = this;
            }
        } else {
            if (gameData.currentOperations.hasOwnProperty(this.name)) {
                delete gameData.currentOperations[this.name];
            }
        }
    }

    toggleEnabled() {
        this.setEnabled(!this.enabled);
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
        return this.baseData.gridLoad === undefined ? 0 : this.baseData.gridLoad;
    }
}

class Sector extends Entity {
    /**
     * @param {{
     *     title: string,
     *     description?: string,
     *     color: string,
     *     pointsOfInterest: PointOfInterest[]
     * }} baseData
     */
    constructor(baseData) {
        super(baseData.title, baseData.description);

        this.baseData = baseData;
        this.color = baseData.color;
        this.pointsOfInterest = baseData.pointsOfInterest;
    }

    /**
     * @param {EmptySavedValues} savedValues
     */
    loadData(savedValues){
        validateParameter(savedValues, {}, this);
    }

    /**
     * @return {EmptySavedValues}
     */
    static newSavedValues() {
        return {};
    }
}

/**
 * @implements EffectsHolder
 */
class PointOfInterest extends Entity {
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

        this.baseData = baseData;
        this.modifiers = baseData.modifiers;
    }

    /**
     * @param {EmptySavedValues} savedValues
     */
    loadData(savedValues){
        validateParameter(savedValues, {}, this);
    }

    /**
     * @return {EmptySavedValues}
     */
    static newSavedValues() {
        return {};
    }

    /**
     * @return {boolean}
     */
    isActive() {
        return gameData.currentPointOfInterest === this;
    }

    collectEffects() {
        //this.expenseMultipliers.push(getBoundTaskEffect('Bargaining'));
        //this.expenseMultipliers.push(getBoundTaskEffect('Intimidation'));
    }

    /**
     * @returns {EffectDefinition[]}
     */
    getEffects() {
        return this.baseData.effects;
    }

    /**
     * @param {EffectType} effectType
     * @returns {number}
     */
    getEffect(effectType) {
        return Effect.getValue(this, effectType, this.baseData.effects, 1);
    }

    /**
     * @return {string}
     */
    getEffectDescription() {
        // Danger is displayed in a separate column
        return Effect.getDescriptionExcept(this, this.baseData.effects, 1, EffectType.Danger);
    }
}

class Requirement {
    constructor(type, elements, requirements) {
        this.type = type;
        this.elements = elements;
        this.requirements = requirements;
        this.completed = false;
    }

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

    getCondition(requirement) {
        throw new TypeError('getCondition not implemented.');
    }
}

class TaskRequirement extends Requirement {
    constructor(elements, requirements) {
        super('TaskRequirement', elements, requirements);
    }

    getCondition(requirement) {
        return gameData.taskData[requirement.task].level >= requirement.requirement;
    }
}

class AgeRequirement extends Requirement {
    constructor(elements, requirements) {
        super('AgeRequirement', elements, requirements);
    }

    getCondition(requirement) {
        return daysToYears(gameData.days) >= requirement.requirement;
    }
}

class AttributeRequirement extends Requirement {
    /**
     *
     * @param {HTMLElement[]} elements
     * @param {{attribute: AttributeDefinition, requirement: number}[]} requirements
     */
    constructor(elements, requirements) {
        super('AttributeRequirement', elements, requirements);
    }

    /**
     * @param {{attribute: AttributeDefinition, requirement: number}} requirement
     */
    getCondition(requirement) {
        return requirement.attribute.getValue() >= requirement.requirement;
    }
}
