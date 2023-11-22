'use strict';

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

/**
 * @typedef {Object} ModifierDefinition
 * @property {EffectsHolder[]} modifies
 * @property {EffectType} from
 * @property {EffectType} to
 */

class EffectType {
    static Danger = new EffectType('+', 'Danger');
    static Energy = new EffectType('+', 'Energy');
    static EnergyFactor = new EffectType('x', 'Energy');
    static Growth = new EffectType('+', 'Growth');
    static Industry = new EffectType('+', 'Industry');
    static Military = new EffectType('+', 'Military');
    static MilitaryFactor = new EffectType('x', 'Military');
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

class Modifier {
    /**
     *
     * @return {ModifierDefinition[]}
     */
    static getActiveModifiers() {
        return pointsOfInterest[gameData.currentPointOfInterest].modifiers;
    }

    /**
     *
     * @param {ModifierDefinition} modifier
     * @return {string}
     */
    static getDescription(modifier) {
        return modifier.modifies
                .map((effectHolder) => effectHolder.title)
                .join(', ') + '\n'
            + modifier.from.description + ' \u2B9E ' /* Shows: ⮞ */ + modifier.to.description;
    }
}

class Effect {

    /**
     * Considers all active effect holders in the game, queries them for the requested effect type and combines their
     * values appropriately.
     *
     * @param {EffectType} effectType
     */
    static #getSingleTotalValue(effectType) {
        let result = effectType.getDefaultValue();
        for (const key in gameData.currentOperations) {
            const operation = gameData.currentOperations[key];
            result = effectType.combine(result, operation.getEffect(effectType));
        }

        for (const key in battles) {
            /** @type {Battle} */
            const battle = battles[key];
            if (battle.isDone()) {
                result = effectType.combine(result, battle.getReward(effectType));
            } else if (battle.isActive()) {
                result = effectType.combine(result, battle.getEffect(effectType));
            }
        }

        result = effectType.combine(result, pointsOfInterest[gameData.currentPointOfInterest].getEffect(effectType));

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
            .map(Effect.#getSingleTotalValue)
            .reduce((prev, cur) => prev + cur, 0);

        const factor = factorTypes
            .map(Effect.#getSingleTotalValue)
            .reduce((prev, cur) => prev * cur, 1);

        if (additiveTypes.length === 0) {
            // No base/additives --> directly return the factor to prevent faulty multiplication with 0.
            return factor;
        }

        return base * factor;
    }

    /**
     * @param {EffectsHolder} holder
     * @param {EffectType} effectType
     * @param {EffectDefinition[]} effects
     * @param {number} level
     * @returns {number}
     */
    static getValue(holder, effectType, effects, level) {
        const modifiers = Modifier.getActiveModifiers();

        for (const effect of effects) {
            const actualEffectType = Effect.#getActualEffectType(holder, effect, modifiers);
            if (effectType === actualEffectType) {
                return Effect.#calculateEffectValue(actualEffectType, effect.baseValue, level);
            }
        }
        return effectType.getDefaultValue();
    }

    static #getActualEffectType(holder, effect, modifiers,) {
        let actualEffectType = effect.effectType;
        // Apply modifiers to find the actual effect type
        for (const modifier of modifiers) {
            if (modifier.from !== actualEffectType) {
                continue;
            }
            if (modifier.modifies.includes(holder)) {
                actualEffectType = modifier.to;
                // Edge case prevention: only the first matching modifier is applied
                break;
            }
        }
        return actualEffectType;
    }

    /**
     *
     * @param {EffectsHolder} holder
     * @param {EffectDefinition[]} effects
     * @param {number} level
     * @return {string}
     */
    static getDescription(holder, effects, level) {
        const modifiers = Modifier.getActiveModifiers();

        return effects.map((effect) => {
            const actualEffectType = Effect.#getActualEffectType(holder, effect, modifiers);
            return actualEffectType.operator +
                Effect.#calculateEffectValue(actualEffectType, effect.baseValue, level).toFixed(2) +
                ' ' + actualEffectType.description;
        }, this).join(', ');
    }

    /**
     *
     * @param {EffectsHolder} holder
     * @param {EffectDefinition[]} effects
     * @param {number} level
     * @param {EffectType} effectException
     * @return {string}
     */
    static getDescriptionExcept(holder, effects, level, effectException) {
        return Effect.getDescription(
            holder,
            effects.filter((effect) => effect.effectType !== effectException),
            level
        );
    }

    /**
     *
     * @param {EffectType} effectType
     * @param {number} baseValue
     * @param {number} level
     * @return {number}
     */
    static #calculateEffectValue(effectType, baseValue, level) {
        return effectType.getDefaultValue() + baseValue * level;
    }
}
