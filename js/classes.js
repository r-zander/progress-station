'use strict';

class EffectType {
    constructor(application, description) {
        this.operator = application;
        this.description = description;
    }

    static Population = new EffectType('x', 'Population');
    static Energy = new EffectType('+', 'Energy');
}

class Task {
    constructor(baseData) {
        this.type = this.constructor.name.toLowerCase();
        this.name = baseData.name;
        this.baseData = baseData;
        this.title = baseData.title;
        this.level = 0;
        this.maxLevel = 0;
        this.xp = 0;
        this.xpMultipliers = [];
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

    collectEffects() {
        this.xpMultipliers.push(this.getMaxLevelMultiplier.bind(this));

        //this.populationEffectMethods.push(getBoundTaskEffect('Dark influence'));
        //this.xpMultipliers.push(getBoundTaskEffect('Demon training'));
    }

    getMaxLevelMultiplier() {
        return 1 + this.maxLevel / 10;
    }

    getXpGain() {
        return applyMultipliers(10, this.xpMultipliers);
    }

    calculateEffectValue(effect) {
        return (effect.effectType.operator === 'x' ? 1 : 0) + effect.baseValue * this.level;
    }

    getEffect(effectType) {
        for (const id in this.baseData.effects) {
            const effect = this.baseData.effects[id];
            if (effectType === effect.effectType) {
                return this.calculateEffectValue(effect);
            }
        }
        return effectType.operator === 'x' ? 1 : 0;
    }

    getEffectDescription() {
        let output = '';
        for (let i = 0; i < this.baseData.effects.length; i++) {
            let effect = this.baseData.effects[i];
            output += `${effect.effectType.operator}${this.calculateEffectValue(effect).toFixed(2)}`;
            output += ` ${effect.effectType.description}`;
            if (i < this.baseData.effects.length - 1) {
                output += ', ';
            }
        }

        return output;
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

    getEnergyGeneration() {
        return applyMultipliers(this.getEffect(EffectType.Energy), this.energyGenerationMultipliers);
    }

    getEnergyUsage() {
        return this.baseData.energyConsumption === undefined ? 0 : this.baseData.energyConsumption;
    }
}

class Skill extends Task {
    constructor(baseData) {
        super(baseData);
    }

    collectEffects() {
        super.collectEffects();
        //this.xpMultipliers.push(getBoundTaskEffect('Concentration'));
        //this.xpMultipliers.push(getBoundItemEffect('Book'));
        //this.xpMultipliers.push(getBoundItemEffect('Study desk'));
        //this.xpMultipliers.push(getBoundItemEffect('Library'));
    }
}

class Item {
    constructor(baseData) {
        this.baseData = baseData;
        this.name = this.baseData.name;
        this.expenseMultipliers = [];
    }

    collectEffects() {
        //this.expenseMultipliers.push(getBoundTaskEffect('Bargaining'));
        //this.expenseMultipliers.push(getBoundTaskEffect('Intimidation'));
    }

    getEffect() {
        if (gameData.currentProperty !== this && !gameData.currentMisc.includes(this)) return 1;
        return this.baseData.effects;
    }

    getEffectDescription() {
        return 'not implemented';
        //let description = this.baseData.description;
        //if (itemCategories['Properties'].includes(this.name)) {
        //    description = 'Population';
        //}
        //return 'x' + this.baseData.effects.toFixed(1) + ' ' + description;
    }

    getEnergyUsage() {
        return applyMultipliers(this.baseData.expense, this.expenseMultipliers);
    }
}

class Module {
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
            for (const mode of component.operations) {
                mode.maxLevel = this.maxLevel;
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
     * @param {{title: string, operations: object[]}} baseData
     */
    constructor(baseData) {
        this.title = baseData.title;
        this.operations = baseData.operations;
        this.currentMode = this.operations[0];
    }

    do() {
        if (this.currentMode !== null && this.currentMode !== undefined) {
            this.currentMode.do();
        }
    }

    setEnabled(value) {
        if (!value) {
            for (const mode of this.operations) {
                mode.setEnabled(false);
            }
        } else {
            if (this.currentMode !== null) {
                this.currentMode.setEnabled(value);
            }
        }

    }

    //Support only one active mode
    //Introduce default mode?
    setActiveMode(modeId) {
        if (this.currentMode === modeId) return;

        for (const mode of this.operations) {
            if (mode === modeId) {
                this.currentMode = mode;
            }
            mode.setEnabled(mode === modeId);
        }
    }

    getOperationLevels() {
        let levels = 0;
        for (const mode of this.operations) {
            levels += mode.level;
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

class StoredEnergyRequirement extends Requirement {
    constructor(elements, requirements) {
        super('storedEnergy', elements, requirements);
    }

    getCondition(requirement) {
        return gameData.storedEnergy >= requirement.requirement;
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
