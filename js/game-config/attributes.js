'use strict';

/**
 * @type {Object<AttributeDefinition>}
 */
const attributes = {
    danger: {
        title: 'Danger',
        icon: 'img/icons/danger.svg',
        textClass: 'text-danger',
        getValue: () => Effect.getTotalValue( [EffectType.Danger, EffectType.DangerFactor]),
    },
    energy: {
        title: 'Energy',
        icon: 'img/icons/energy.svg',
        textClass: 'text-energy',
        getValue: () => Effect.getTotalValue( [EffectType.Energy, EffectType.EnergyFactor]),
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
        getValue: () => Effect.getTotalValue([EffectType.Growth, EffectType.GrowthFactor]),
    },
    industry: {
        title: 'Industry',
        icon: 'img/icons/industry.svg',
        textClass: 'text-industry',
        getValue: () => Effect.getTotalValue([EffectType.Industry, EffectType.IndustryFactor]),
    },
    military: {
        title: 'Military',
        icon: 'img/icons/military.svg',
        textClass: 'text-military',
        getValue: () => Effect.getTotalValue([EffectType.Military, EffectType.MilitaryFactor]),
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
        getValue: () => Effect.getTotalValue([EffectType.Research, EffectType.ResearchFactor]),
    },
};

/**
 * Define the descriptions of attributes, referencing each other.
 */
function createAttributeDescriptions() {
    attributes.danger.description = 'Drains ' +  attributes.population.inlineHtml + ' by that amount each cycle.';
    attributes.gridLoad.description = 'Amount of ' + attributes.gridStrength.inlineHtml + ' currently assigned.';
    attributes.gridStrength.description = 'Limits the number of concurrently active Module Operations.';
    attributes.growth.description = 'Increases ' + attributes.population.inlineHtml + ' per cycle. Impact is enhanced while no Battle is engaged.';
    attributes.industry.description = 'Speeds up Module Operations progress.';
    attributes.military.description = 'Increases damage in Battles.';
    // TODO add analysis core in here, once done
    attributes.population.description = 'Speeds up Module Operations progress and increases damage in Battles.';
    attributes.research.description = 'Unlocks new knowledge. <i>Not useful in the Beta version.</i>';
    attributes.essenceOfUnknown.description = 'Invest to learn Galactic Secrets.';
}

/**
 *
 * @return {string}
 */
function createGridStrengthAndLoadDescription() {
    return `Each active module needs ${attributes.gridLoad.inlineHtmlWithIcon} but you can't use more than your 
    ${attributes.gridStrength.inlineHtmlWithIcon}. Try deactivating modules to free up the energy grid!`;
}

const gridStrength = new GridStrength({name:'GridStrength', title: 'Grid Strength', maxXp: 500});
