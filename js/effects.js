/**
 * @typedef {Object} EffectDefinition
 * @property {EffectType} effectType
 * @property {number} baseValue
 */

/**
 * @typedef {Object} EffectsHolder
 * @property {string} title
 * @property {function(): EffectDefinition[]} getEffects
 * @property {function(EffectType): number} getEffect
 */

class EffectType {
    static Growth = new EffectType('x', 'Growth');
    static Energy = new EffectType('+', 'Energy');
    static EnergyFactor = new EffectType('x', 'Energy');
    static Industry = new EffectType('x', 'Industry');
    static Military = new EffectType('x', 'Military');
    static Danger = new EffectType('x', 'Danger');
    static Research = new EffectType('+', 'Research');
    static ResearchFactor = new EffectType('x', 'Research');

    /**
     * @param {'+'|'x'} operator
     * @param {string} description
     */
    constructor(operator, description) {
        this.operator = operator;
        this.description = description;
    }

    getDefaultValue() {
        return this.operator === 'x' ? 1 : 0;
    }

    combine(a, b) {
        if (this.operator === 'x') {
            return a * b;
        } else {
            return a + b;
        }
    }
}

class Effect {
    /**
     * Considers all active effect holders in the game, queries them for the requested effect type and combines their
     * values appropriately.
     *
     * @param {EffectType} effectType
     */
    static getSingleTotalValue(effectType) {
        let result = effectType.getDefaultValue();
        const tasks = gameData.currentOperations;
        for (const taskName in tasks) {
            const task = tasks[taskName];
            if (task != null) {
                result = effectType.combine(result, task.getEffect(effectType));
            }
        }

        result = effectType.combine(result, gameData.currentPointOfInterest.getEffect(effectType));

        return result;
    }

    /**
     *
     * @param {EffectType[]} effectTypes
     */
    static getTotalValue(effectTypes) {
        const additiveTypes = [];
        const factorTypes = [];
        for (const effectType of effectTypes) {
            if (effectType.operator === '+') {
                additiveTypes.push(effectType);
            } else {
                factorTypes.push(effectType);
            }
        }

        const base = additiveTypes
            .map(Effect.getSingleTotalValue)
            .reduce(function (prev, cur) {
                return prev + cur;
            }, 0);

        const factor = factorTypes
            .map(Effect.getSingleTotalValue)
            .reduce(function (prev, cur) {
                return prev * cur;
            }, 1);

        if (additiveTypes.length === 0) {
            // No base/additives --> directly return the factor to prevent faulty multiplication with 0.
            return factor;
        }

        return base * factor;
    }

    /**
     *
     * @param {EffectType} effectType
     * @param {EffectDefinition[]} effects
     * @param {number} level
     * @returns {number}
     */
    static getValue(effectType, effects, level) {
        for (const effect of effects) {
            if (effectType === effect.effectType) {
                return Effect.#calculateEffectValue(effect, level);
            }
        }
        return effectType.getDefaultValue();
    }

    /**
     *
     * @param {EffectDefinition[]} effects
     * @param {number} level
     * @return {string}
     */
    static getDescription(effects, level) {
        return effects.map(function (effect) {
            return effect.effectType.operator +
                Effect.#calculateEffectValue(effect, level).toFixed(2) +
                ' ' + effect.effectType.description;
        }, this).join(', ');
    }

    /**
     *
     * @param {EffectDefinition[]} effects
     * @param {number} level
     * @param {EffectType} effectException
     * @return {string}
     */
    static getDescriptionExcept(effects, level, effectException) {
        return Effect.getDescription(effects.filter(function (effect) {
            return effect.effectType !== effectException;
        }), level);
    }
    /**
     *
     * @param {EffectDefinition} effect
     * @param {number} level
     * @return {number}
     */
    static #calculateEffectValue(effect, level) {
        return effect.effectType.getDefaultValue() + effect.baseValue * level;
    }
}








