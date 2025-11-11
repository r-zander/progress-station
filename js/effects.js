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
    static Danger = new EffectType('+', attributes.danger);
    static DangerFactor = new EffectType('x', attributes.danger);
    static Heat = new EffectType('+', attributes.heat);
    static Energy = new EffectType('+', attributes.energy);
    static EnergyFactor = new EffectType('x', attributes.energy);
    static Growth = new EffectType('+', attributes.growth);
    static GrowthFactor = new EffectType('x', attributes.growth);
    static Industry = new EffectType('+', attributes.industry);
    static IndustryFactor = new EffectType('x', attributes.industry);
    static Military = new EffectType('+', attributes.military);
    static MilitaryFactor = new EffectType('x', attributes.military);
    static Research = new EffectType('+', attributes.research);
    static ResearchFactor = new EffectType('x', attributes.research);

    /**
     * @param {'+'|'x'} operator
     * @param {AttributeDefinition} attribute
     */
    constructor(operator, attribute) {
        this.operator = operator;
        this.attribute = attribute;
    }

    /**
     * @return {number}
     */
    getDefaultValue() {
        return this.operator === 'x' ? 1 : 0;
    }

    /**
     * Accumulates to effect values according to this effect type's behavior.
     *
     * @param a first value
     * @param b second value
     * @return {number}
     */
    combine(a, b) {
        if (this.operator === 'x') {
            return a * b;
        } else {
            return a + b;
        }
    }

    toString() {
        return this.operator + this.attribute.title;
    }
}

class Modifier {
    /**
     * @return {ModifierDefinition[]}
     */
    static getActiveModifiers() {
        return pointsOfInterest[gameData.activeEntities.pointOfInterest].modifiers;
    }

    /**
     * @param {ModifierDefinition} modifier
     *
     * @return {string}
     */
    static getDescription(modifier) {
        return modifier.modifies
                .map((effectHolder) => effectHolder.title)
                .join(', ') + '\n'
            + modifier.from.attribute.title + ' ' + Symbols.LEFT_ARROW + ' ' + modifier.to.attribute.title;
    }
}

class Effect {

    /**
     * Considers all active effect holders in the game, queries them for the requested effect type and combines their
     * values appropriately.
     *
     * @param {EffectType} effectType
     *
     * @return {number}
     */
    static #getSingleTotalValue(effectType) {
        let result = effectType.getDefaultValue();
        for (const key of gameData.activeEntities.operations) {
            const operation = moduleOperations[key];
            if (!operation.isActive('parent')) continue;

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

        result = effectType.combine(result, pointsOfInterest[gameData.activeEntities.pointOfInterest].getEffect(effectType));

        withCheats(cheats => {
            result = effectType.combine(
                result,
                Effect.getValue(undefined, effectType, cheats.Attributes.additionalEffects, 1),
            );
        });

        return result;
    }

    /**
     * @param {EffectType[]} effectTypes
     *
     * @return {number}
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
     *
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

    /**
     * @param {EffectsHolder} holder
     * @param {EffectDefinition} effect
     * @param {ModifierDefinition[]} modifiers
     *
     * @return {EffectType}
     */
    static #getActualEffectType(holder, effect, modifiers) {
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
     * @param {EffectsHolder} holder
     * @param {EffectDefinition[]} effects
     * @param {number} level
     *
     * @return {string} HTML
     */
    static getDescription(holder, effects, level) {
        const modifiers = Modifier.getActiveModifiers();

        return effects.map((effect) => {
            const actualEffectType = Effect.#getActualEffectType(holder, effect, modifiers);
            const effectValue = Effect.#calculateEffectValue(actualEffectType, effect.baseValue, level);
            return '<data value="' + effectValue + '" class="effect-value">'
                + actualEffectType.operator
                + effectValue.toFixed(2)
                + '</data> '
                + actualEffectType.attribute.inlineHtmlWithIcon;
        }, this).join('\n');
    }

    /**
     * @param {EffectsHolder} holder
     * @param {EffectDefinition[]} effects
     * @param {number} level
     * @param {EffectType} effectException
     *
     * @return {string} HTML
     */
    static getDescriptionExcept(holder, effects, level, effectException) {
        return Effect.getDescription(
            holder,
            effects.filter((effect) => effect.effectType !== effectException),
            level
        );
    }

    /**
     * @param {EffectsHolder} holder
     * @param {EffectDefinition[]} effects
     * @param {number} level
     *
     * @return {string[]} plain text
     */
    static getFormattedValues(holder, effects, level){
        const modifiers = Modifier.getActiveModifiers();

        return effects.map((effect) => {
            const actualEffectType = Effect.#getActualEffectType(holder, effect, modifiers);
            const effectValue = Effect.#calculateEffectValue(actualEffectType, effect.baseValue, level);
            return actualEffectType.operator + effectValue.toFixed(2);
        }, this);
    }

    /**
     * @param {EffectsHolder} holder
     * @param {EffectDefinition[]} effects
     * @param {number} level
     * @param {EffectType} effectException
     *
     * @return {string[]} plain text
     */
    static getFormattedValuesExcept(holder, effects, level, effectException){
        return Effect.getFormattedValues(
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
     *
     * @return {number}
     */
    static #calculateEffectValue(effectType, baseValue, level) {
        return effectType.getDefaultValue() + baseValue * level;
    }
}

class DynamicEffectDefinition {
    /**
     * @type {EffectType}
     */
    #effectType;

    /**
     * @type {function(): number}
     */
    #valueFn;

    /**
     *
     * @param {EffectType} effectType
     * @param {function(): number} valueFn
     */
    constructor(effectType, valueFn) {
        this.#effectType = effectType;
        this.#valueFn = valueFn;
    }

    get effectType() {
        return this.#effectType;
    }

    get baseValue() {
        return this.#valueFn();
    }

}
