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
 * @implements EffectsHolder
 */
class Task {
    constructor(baseData) {
        this.type = this.constructor.name;
        this.name = baseData.name;
        this.baseData = baseData;
        this.title = baseData.title;
        this.level = 0;
        this.maxLevel = 0;
        this.xp = 0;
        this.xpMultipliers = [];
    }

    assignSaveData(saveData) {
        this.level = saveData.level;
        this.maxLevel = saveData.maxLevel;
        this.xp = saveData.xp;
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
                name: this.baseData.name,
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

class Job extends Task {
    constructor(baseData) {
        super(baseData);
        this.energyGenerationMultipliers = [];
    }

    collectEffects() {
        super.collectEffects();
        this.energyGenerationMultipliers.push(this.getLevelMultiplier.bind(this));
        //this.energyGenerationMultipliers.push(getBoundTaskEffect('Demon\'s wealth'));
        //this.xpMultipliers.push(getBoundTaskEffect('Productivity'));
        //this.xpMultipliers.push(getBoundItemEffect('Personal squire'));
    }

    do() {
        super.do();
    }

    getLevelMultiplier() {
        return 1 + Math.log10(this.level + 1);
    }

    getEnergyMultiplier() {
        return this.getEffect(EffectType.EnergyFactor);
    }

    getEnergyGeneration() {
        return applyMultipliers(this.getEffect(EffectType.Energy), this.energyGenerationMultipliers);
    }

    getGridLoad() {
        return this.baseData.gridLoad === undefined ? 0 : this.baseData.gridLoad;
    }
}

class Skill extends Task {
    constructor(baseData) {
        super(baseData);
    }

    /**
     * @return {boolean}
     */
    isActive() {
        return gameData.currentSkill === this;
    }

    collectEffects() {
        super.collectEffects();
    }
}

/**
 * @implements EffectsHolder
 */
class PointOfInterest {
    constructor(baseData) {
        this.baseData = baseData;
        this.name = this.baseData.name;
        this.title = this.baseData.title;
        this.expenseMultipliers = [];
        /** @var {ModifierDefinition[]} */
        this.modifiers = this.baseData.modifiers;
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
        return Effect.getDescription(this, this.baseData.effects, 1);
    }

    /**
     * @param effectTypeException
     * @return {string}
     */
    getEffectDescriptionExcept(effectTypeException) {
        return Effect.getDescriptionExcept(this, this.baseData.effects, 1, effectTypeException);
    }

    getGridLoad() {
        return applyMultipliers(this.baseData.expense, this.expenseMultipliers);
    }
}

class Module {
    /**
     * @var {string}
     */
    name;

    constructor(baseData) {
        this.data = baseData;
        this.title = baseData.title;
        this.components = baseData.components;
        this.maxLevel = 0;
    }

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

    getNextOperationForAutoPromote() {
        //TODO
        return null;
    }

    init() {
        this.propagateMaxLevel();
        this.setEnabled(gameData.currentModules.hasOwnProperty(this.name));
    }

    getLevel() {
        return this.components.reduce(function (levelSum, component) {
            return levelSum + component.getOperationLevels();
        }, 0);
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
}

class ModuleComponent {
    /**
     * @param {{title: string, operations: ModuleOperation[]}} baseData
     */
    constructor(baseData) {
        this.title = baseData.title;
        this.operations = baseData.operations;
        this.currentOperation = this.operations[0];
    }

    do() {
        if (this.currentOperation instanceof ModuleOperation) {
            this.currentOperation.do();
        }
    }

    setEnabled(value) {
        if (!value) {
            for (const operation of this.operations) {
                operation.setEnabled(false);
            }
        } else {
            if (this.currentOperation !== null) {
                this.currentOperation.setEnabled(value);
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

class ModuleOperation extends Job {
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

    getMaxLevelMultiplier() {
        return 1 + this.maxLevel / 100;
    }
}

class GridStrength extends Task {
    constructor(baseData) {
        super(baseData);
    }

    collectEffects() {
    }

    getXpGain() {
        return applyMultipliers(getEnergyGeneration(), this.xpMultipliers);
    }

    getGridStrength() {
        return this.level;
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
        super('task', elements, requirements);
    }

    getCondition(requirement) {
        return gameData.taskData[requirement.task].level >= requirement.requirement;
    }
}

class GridStrengthRequirement extends Requirement {
    constructor(elements, requirements) {
        super('gridStrength', elements, requirements);
    }

    getCondition(requirement) {
        return gridStrength.getGridStrength() >= requirement.requirement;
    }
}

class AgeRequirement extends Requirement {
    constructor(elements, requirements) {
        super('age', elements, requirements);
    }

    getCondition(requirement) {
        return daysToYears(gameData.days) >= requirement.requirement;
    }
}

class EvilRequirement extends Requirement {
    constructor(elements, requirements) {
        super('evil', elements, requirements);
    }

    getCondition(requirement) {
        return gameData.evil >= requirement.requirement;
    }
}

class ResearchRequirement extends Requirement {
    constructor(elements, requirements) {
        super('research', elements, requirements);
    }

    getCondition(requirement) {
        return attributes.research.getValue() >= requirement.requirement;
    }
}
