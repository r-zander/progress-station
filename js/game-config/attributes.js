'use strict';

/**
 * @type {Object<AttributeDefinition>}
 */
const attributes = {
    danger: {
        title: 'Danger',
        icon: 'img/icons/danger.svg',
        textClass: 'text-danger',
        relevantForMusicContext: false,
        getValue: () => Effect.getTotalValue( [EffectType.Danger, EffectType.DangerFactor]),
    },
    energy: {
        title: 'Energy',
        icon: 'img/icons/energy.svg',
        textClass: 'text-energy',
        relevantForMusicContext: false,
        getValue: () => Effect.getTotalValue( [EffectType.Energy, EffectType.EnergyFactor]),
    },
    essenceOfUnknown: {
        title: 'Essence of Unknown',
        icon: 'img/icons/essence-of-unknown.svg',
        textClass: 'text-essence-of-unknown',
        relevantForMusicContext: false,
        getValue: () => gameData.essenceOfUnknown,
    },
    gridLoad: {
        title: 'Grid Load',
        icon: 'img/icons/grid.svg',
        textClass: 'text-grid-load',
        relevantForMusicContext: false,
        getValue: () => calculateGridLoad(),
    },
    gridStrength: {
        title: 'Grid Strength',
        icon: 'img/icons/grid.svg',
        textClass: 'text-grid-strength',
        relevantForMusicContext: false,
        getValue: () => gridStrength.getGridStrength(),
    },
    growth: {
        title: 'Growth',
        icon: 'img/icons/growth.svg',
        textClass: 'text-growth',
        relevantForMusicContext: true,
        getValue: () => Effect.getTotalValue([EffectType.Growth, EffectType.GrowthFactor]),
    },
    heat: {
        title: 'Heat',
        icon: 'img/icons/heat.svg',
        textClass: 'text-heat',
        relevantForMusicContext: false,
        getValue: () => calculateHeat(),
    },
    industry: {
        title: 'Industry',
        icon: 'img/icons/industry.svg',
        textClass: 'text-industry',
        relevantForMusicContext: true,
        getValue: () => Effect.getTotalValue([EffectType.Industry, EffectType.IndustryFactor]),
    },
    military: {
        title: 'Military',
        icon: 'img/icons/military.svg',
        textClass: 'text-military',
        relevantForMusicContext: true,
        getValue: () => Effect.getTotalValue([EffectType.Military, EffectType.MilitaryFactor]),
    },
    population: {
        title: 'Population',
        icon: 'img/icons/population.svg',
        textClass: 'text-population',
        relevantForMusicContext: false,
        getValue: () => gameData.population,
    },
    research: {
        title: 'Research',
        icon: 'img/icons/research.svg',
        textClass: 'text-research',
        relevantForMusicContext: true,
        getValue: () => Effect.getTotalValue([EffectType.Research, EffectType.ResearchFactor]),
    },
};

/**
 * @type {number}
 */
const heatAcceleration = 3; // in heat / sec²

/**
 * [0; 1)
 * @type {number}
 */
const populationDeltaInertia = 0.98; // 98% inertia ≙ 10sec speed delay at targetTicksPerSecond 20 and baseGameSpeed 4

/**
 * Define the descriptions of attributes, referencing each other.
 */
function createAttributeDescriptions() {
    attributes.danger.description = 'More ' + attributes.danger.inlineHtml + ' than ' + attributes.military.inlineHtml + ' increases ' + attributes.heat.inlineHtml + '.';
    attributes.gridLoad.description = 'Amount of ' + attributes.gridStrength.inlineHtml + ' currently assigned.';
    attributes.gridStrength.description = 'Limits the number of concurrently active operations.';
    attributes.growth.description = 'Increases ' + attributes.population.inlineHtml + '.';
    attributes.heat.description = 'Reduces ' + attributes.population.inlineHtml + '.';
    attributes.industry.description = 'Speeds up operations progress.';
    attributes.military.description = 'Counteracts ' + attributes.danger.inlineHtml + ' and increases damage in Battles.';
    attributes.population.description = 'Affects all progress speed.';
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
