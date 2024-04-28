'use strict';

/**
 * @type {Object<AttributeDefinition>}
 */
const attributes = {
    danger: {
        title: 'Danger',
        icon: 'img/icons/danger.svg',
        textClass: 'text-danger',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Danger, EffectType.DangerFactor]),
    },
    essenceOfUnknown: {
        title: 'Essence of Unknown',
        icon: 'img/icons/essence-of-unknown.svg',
        textClass: 'text-essence-of-unknown',
        getValue: () => gameData.essenceOfUnknown,
    },
    gridLoad: {
        title: 'Grid Load',
        icon: 'img/icons/grid.svg',
        textClass: 'text-grid-load',
        getValue: () => calculateGridLoad(),
    },
    gridStrength: {
        title: 'Grid Strength',
        icon: 'img/icons/grid.svg',
        textClass: 'text-grid-strength',
        getValue: () => gridStrength.getGridStrength(),
    },
    growth: {
        title: 'Growth',
        icon: 'img/icons/growth.svg',
        textClass: 'text-growth',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Growth, EffectType.GrowthFactor]),
    },
    heat: {
        title: 'Heat',
        icon: 'img/icons/heat.svg',
        textClass: 'text-heat',
        getValue: () => calculateHeat(),
    },
    industry: {
        title: 'Industry',
        icon: 'img/icons/industry.svg',
        textClass: 'text-industry',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Industry, EffectType.IndustryFactor]),
    },
    military: {
        title: 'Military',
        icon: 'img/icons/military.svg',
        textClass: 'text-military',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Military, EffectType.MilitaryFactor]),
    },
    population: {
        title: 'Population',
        icon: 'img/icons/population.svg',
        textClass: 'text-population',
        getValue: () => gameData.population,
    },
    research: {
        title: 'Research',
        icon: 'img/icons/research.svg',
        textClass: 'text-research',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Research, EffectType.ResearchFactor]),
    },
};

/**
 * [0; 1)
 * @type {number}
 */
const populationDeltaInertia = 0.98; // 98% inertia ≙ 10sec speed delay at updateSpeed 20 and baseGameSpeed 4

/**
 * @param {function(AttributeDefinition): string} printAttribute renders the provided attribute nicely.
 */
function createAttributeDescriptions(printAttribute) {
    attributes.danger.description = 'More ' + printAttribute(attributes.danger) + ' than ' + printAttribute(attributes.military) + ' increases ' + printAttribute(attributes.heat) + '.';
    attributes.gridLoad.description = 'Amount of ' + printAttribute(attributes.gridStrength) + ' currently assigned.';
    attributes.gridStrength.description = 'Limits the number of concurrently active operations.';
    attributes.growth.description = 'Increases ' + printAttribute(attributes.population) + '.';
    attributes.heat.description = 'Reduces ' + printAttribute(attributes.population) + '.';
    attributes.industry.description = 'Speeds up operations progress.';
    attributes.military.description = 'Counteracts ' + printAttribute(attributes.danger) + ' and increases damage in Battles.';
    attributes.population.description = 'Affects all progress speed.';
    attributes.research.description = 'Unlocks new knowledge.';
    attributes.essenceOfUnknown.description = 'Invest to learn Galactic Secrets.';
}

/**
 * @param {function(AttributeDefinition): string} printAttribute renders the provided attribute nicely.
 *
 * @return {string}
 */
function createGridStrengthAndLoadDescription(printAttribute) {
    return `Each active module needs ${printAttribute(attributes.gridLoad)} but you can't use more than your 
    ${printAttribute(attributes.gridStrength)}. Try deactivating modules to free up the energy grid!`;
}

const gridStrength = new GridStrength({name:'GridStrength', title: 'Grid Strength', maxXp: 500});
