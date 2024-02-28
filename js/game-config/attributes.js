'use strict';

/**
 * @type {Object<AttributeDefinition>}
 */
const attributes = {
    danger: { title: 'Danger', color: colorPalette.DangerRed, icon: 'img/icons/danger.svg',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Danger, EffectType.DangerFactor])},
    gridLoad: { title: 'Grid Load', color: '#2CCBFF', icon: 'img/icons/grid.svg',
        getValue: () => calculateGridLoad() },
    gridStrength: { title: 'Grid Strength', color: '#0C65AD', icon: 'img/icons/grid.svg',
        getValue: () => gridStrength.getGridStrength() },
    growth: { title: 'Growth', color: '#008000', icon: 'img/icons/growth.svg',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Growth, EffectType.GrowthFactor])},
    heat: { title: 'Heat', color: 'rgb(245, 166, 35)', icon: 'img/icons/heat.svg',
        getValue: () => calculateHeat() },
    industry: { title: 'Industry', color: 'rgb(97, 173, 50)', icon: 'img/icons/industry.svg',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Industry, EffectType.IndustryFactor])},
    military: { title: 'Military', color: '#b3b3b3', icon: 'img/icons/military.svg',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Military, EffectType.MilitaryFactor])},
    population: { title: 'Population', color: 'rgb(46, 148, 231)', icon: 'img/icons/population.svg',
        getValue: () => gameData.population },
    research: { title: 'Research', color: '#cc4ee2', icon: 'img/icons/research.svg',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Research, EffectType.ResearchFactor])},
    essenceOfUnknown: { title: 'Essence of Unknown', color: '#AB016E', icon: 'img/icons/essence-of-unknown.svg',
        getValue: () => gameData.essenceOfUnknown },
};

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
