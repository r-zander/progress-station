'use strict';

// TODO replace with requestAnimationFrame for smoothest experience
const updateSpeed = 20;

const baseCycle = 100000;
const bossAppearanceCycle = 25_000;
const dangerColors = [
    new Color([0, 128, 0], 'RGB'),    // 0% color: dark green
    new Color([255, 255, 0], 'RGB'),  // 50% color: yellow
    new Color([219, 92, 92], 'RGB'),    // 100% color: red
];

const emptyStationName = 'Unknown Station';

// Not const to allow easy game speed increase
// TODO change before release
let baseGameSpeed = 4;

const magnitudes = ['', 'k', 'M', 'B', 'T', 'q', 'Q', 'Sx', 'Sp', 'Oc'];
const metricPrefixes = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'R'];
const units = {
    energy: 'W',
    storedEnergy: 'Wh'
};

const colorPalette = {
    EasyGreen: '#55A630',
    HappyBlue: '#219EBC',
    TomatoRed: '#E63946',
    DangerRed: 'rgb(200, 0, 0)',
    DepressionPurple: '#4A4E69',
    // 'Fundamentals': '#4A4E69',
    // 'Combat': '#FF704D',
    // 'Magic': '#875F9A',
    // 'Dark magic': '#73000F',
    // 'Misc': '#B56576',
    White: '#FFFFFF',
};

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

const gridStrength = new GridStrength({name:'GridStrength', title: 'Grid Strength', maxXp: 100});

/*
 * HOW TO Big Numbers
 *
 *           100_000
 *         1_000_000
 *         7_500_000
 *        40_000_000
 *       150_000_000
 * 1_000_000_000_000
 */

/**
 * @type {Object<FactionDefinition>}
 */
const factions = {
    NovaFlies: {
        title: 'Nova Flies', maxXp: 20,
        description: 'Similar to earth\'s long lost fireflies these bugs are glowing on their own. Experiencing their gigantic numbers and blinding brightness quickly explains the name.',
    },
    Astrogoblins: {
        title: 'Astrogoblins', maxXp: 50,
        description: 'Mischievous beings that can be found in every corner of the galaxy, Astrogoblins zip around in makeshift spacecrafts, armed with primitive weapons and a liking for interstellar chaos.'
    },
    CometCrawlers: {
        title: 'Comet Crawlers', maxXp: 100,
        description: 'These beagle-sized beetles travel on the surface of comets as they are attracted by metal alloys that are unfortunately also commonly found in space stations. They will attack in large numbers if they sense one of their own being harmed.'
    },
    Scavengers: {
        title: 'Scavengers', maxXp: 500,
        description: 'Outcasts from civilizations across the galaxy, Scavengers form nomadic crews, dressed in distinctive leather attire. Masters of illicit trade and makeshift tech, they roam, seeking quick profits through heists and elusive alliances.'
    },
    SpacePirates: {
        title: 'Space Pirates', maxXp: 1_000,
        description: 'Buccaneers sailing the astral seas, Space Pirates are notorious for their flashy ships, over-the-top personalities, and the relentless pursuit of rare space booty.'
    },
    ThunderDragon: {
        title: 'Thunder Dragon', maxXp: 100_000,
        description: 'Roaming the cosmic storm clouds, Thunder Dragons are colossal beings of electric energy. Lightning crackles across their scales as they soar through the galactic skies.'
    },
    AstralSharks: {
        title: 'Astral Sharks', maxXp: 750_000,
        description: 'Legends of the cosmic deep, Astral Sharks glide through space with celestial fins and stardust-infused teeth. They\'re the titans of the galactic oceans.'
    },

    Destroyer: {
        title: 'Destroyer', maxXp: 150_000_000,
        description: 'An immense, dark mass of writhing tentacles, teeth and a thousand eyes. The vacuum of space around the station suppresses all noise, ' +
            'but you can feel the hatred of the alien beast and see it\'s determination to destroy everything you have built up.'
    },
};

/**
 * @type {Object<Battle>}
 */
const battles = {
    Astrogoblins10: new Battle({
        title: 'Wimpy',
        targetLevel: 10,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 0}],
        rewards: [{effectType: EffectType.Military, baseValue: 1}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Astrogoblins15: new Battle({
        title: 'Curious',
        targetLevel: 15,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 10}],
        rewards: [{effectType: EffectType.Research, baseValue: 2}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    CometCrawlers10: new Battle({
        title: 'Handful of',
        targetLevel: 10,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 20}],
        rewards: [{effectType: EffectType.Growth, baseValue: 2}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Astrogoblins20: new Battle({
        title: 'Courageous',
        targetLevel: 20,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 40}],
        rewards: [{effectType: EffectType.Military, baseValue: 2}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Scavengers10: new Battle({
        title: 'Lost',
        targetLevel: 10,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 75}],
        rewards: [{effectType: EffectType.Research, baseValue: 4}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    CometCrawlers20: new Battle({
        title: 'Small swarm of',
        targetLevel: 20,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 40}],
        rewards: [{effectType: EffectType.Growth, baseValue: 2}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    SpacePirates10: new Battle({
        title: 'Roaming',
        targetLevel: 10,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 100}],
        rewards: [{effectType: EffectType.Military, baseValue: 5}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Astrogoblins30: new Battle({
        title: 'Trained',
        targetLevel: 30,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 80}],
        rewards: [{effectType: EffectType.Military, baseValue: 2}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Scavengers20: new Battle({
        title: 'Violent',
        targetLevel: 20,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 150}],
        rewards: [{effectType: EffectType.Research, baseValue: 7}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    CometCrawlers30: new Battle({
        title: 'Aggressive',
        targetLevel: 30,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 90}],
        rewards: [{effectType: EffectType.Growth, baseValue: 2}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    ThunderDragon10: new Battle({
        title: 'Decrepit',
        targetLevel: 10,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 200}],
        rewards: [{effectType: EffectType.Research, baseValue: 1}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    SpacePirates20: new Battle({
        title: 'Organized',
        targetLevel: 20,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 300}],
        rewards: [{effectType: EffectType.Military, baseValue: 5}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    NovaFlies50: new Battle({
        title: 'Harmless',
        targetLevel: 50,
        faction: factions.NovaFlies,
        effects: [{effectType: EffectType.Danger, baseValue: 50}],
        rewards: [{effectType: EffectType.Growth, baseValue: 4}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    AstralSharks10: new Battle({
        title: 'Lone',
        targetLevel: 10,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 500}],
        rewards: [{effectType: EffectType.ResearchFactor, baseValue: 1.5}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    CometCrawlers50: new Battle({
        title: 'Swarming',
        targetLevel: 50,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 300}],
        rewards: [{effectType: EffectType.Growth, baseValue: 15}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Scavengers30: new Battle({
        title: 'Insane',
        targetLevel: 30,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 500}],
        rewards: [{effectType: EffectType.Research, baseValue: 10}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Astrogoblins50: new Battle({
        title: 'Fearless',
        targetLevel: 50,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 100}],
        rewards: [{effectType: EffectType.Military, baseValue: 10}, { effectType: EffectType.MilitaryFactor, baseValue: 0.1}],
    }),
    Scavengers50: new Battle({
        title: 'Reckless',
        targetLevel: 50,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 1000}],
        rewards: [{effectType: EffectType.Research, baseValue: 15}, { effectType: EffectType.MilitaryFactor, baseValue: 0.1}],
    }),
    SpacePirates50: new Battle({
        title: 'Dominating',
        targetLevel: 50,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 1500}],
        rewards: [{effectType: EffectType.Military, baseValue: 25}, { effectType: EffectType.MilitaryFactor, baseValue: 0.1}],
    }),
    NovaFlies100: new Battle({
        title: 'Numerous',
        targetLevel: 100,
        faction: factions.NovaFlies,
        effects: [{effectType: EffectType.Danger, baseValue: 1000}],
        rewards: [{effectType: EffectType.Growth, baseValue: 35}, { effectType: EffectType.MilitaryFactor, baseValue: 0.1}],
    }),
    AstralSharks20: new Battle({
        title: 'Pack of',
        targetLevel: 20,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 2000}],
        rewards: [{effectType: EffectType.ResearchFactor, baseValue: 2}, { effectType: EffectType.MilitaryFactor, baseValue: 0.1}],
    }),
    CometCrawlers200: new Battle({
        title: 'Endless',
        targetLevel: 200,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 1500}],
        rewards: [{effectType: EffectType.Growth, baseValue: 40}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}],
    }),
    ThunderDragon20: new Battle({
        title: 'Venerable',
        targetLevel: 20,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 2000}],
        rewards: [{effectType: EffectType.Research, baseValue: 5}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}],
    }),
    Astrogoblins75: new Battle({
        title: 'Bold',
        targetLevel: 75,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 5000}],
        rewards: [{effectType: EffectType.Military, baseValue: 100}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}],
    }),
    NovaFlies200: new Battle({
        title: 'Countless',
        targetLevel: 200,
        faction: factions.NovaFlies,
        effects: [{effectType: EffectType.Danger, baseValue: 750}],
        rewards: [{effectType: EffectType.Growth, baseValue: 20}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Scavengers75: new Battle({
        title: 'Insatiable',
        targetLevel: 75,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 2000}],
        rewards: [{effectType: EffectType.Research, baseValue: 25}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    SpacePirates75: new Battle({
        title: 'Overwhelming',
        targetLevel: 75,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 2500}],
        rewards: [{effectType: EffectType.Military, baseValue: 40}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    ThunderDragon30: new Battle({
        title: 'Ancient',
        targetLevel: 30,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 3000}],
        rewards: [{effectType: EffectType.Research, baseValue: 10}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    AstralSharks30: new Battle({
        title: 'Hunting',
        targetLevel: 30,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 4000}],
        rewards: [{effectType: EffectType.ResearchFactor, baseValue: 3}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Scavengers100: new Battle({
        title: 'Ruthless',
        targetLevel: 100,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 5000}],
        rewards: [{effectType: EffectType.Research, baseValue: 35}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    SpacePirates100: new Battle({
        title: 'Indomitable',
        targetLevel: 100,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 6000}],
        rewards: [{effectType: EffectType.Military, baseValue: 60}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    ThunderDragon50: new Battle({
        title: 'Majestic',
        targetLevel: 50,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 7000}],
        rewards: [{effectType: EffectType.Research, baseValue: 15}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    AstralSharks50: new Battle({
        title: 'Murderous',
        targetLevel: 50,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 8000}],
        rewards: [{effectType: EffectType.ResearchFactor, baseValue: 4}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Scavengers200: new Battle({
        title: 'Unbeatable',
        targetLevel: 200,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 10000}],
        rewards: [{effectType: EffectType.Research, baseValue: 50}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    SpacePirates200: new Battle({
        title: 'King of all',
        targetLevel: 200,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 12000}],
        rewards: [{effectType: EffectType.Military, baseValue: 100}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    AstralSharks500: new Battle({
        title: 'The Last',
        targetLevel: 500,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 40000}],
        rewards: [{effectType: EffectType.ResearchFactor, baseValue: 40}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    ThunderDragon500: new Battle({
        title: 'Hyper',
        targetLevel: 500,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 70000}],
        rewards: [{effectType: EffectType.Research, baseValue: 15}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),

    Destroyer: new BossBattle({
        title: 'The',
        targetLevel: 20,
        faction: factions.Destroyer,
        effects: [{effectType: EffectType.Heat, baseValue: 5}, {effectType: EffectType.GrowthFactor, baseValue: -1.00}],
        rewards: [],
        progressBarId: 'battleProgressBar',
        layerLabel: 'Tentacles layer',
    }),
};

/**
 * How many battles lie between the boss appearance and the boss battle.
 * @type {number}
 */
const bossBattleDefaultDistance = 4;
const bossBattleApproachInterval = 200; // Cycles
const bossBattle = battles.Destroyer;

const battleRequirements = [
    new AttributeRequirement('playthrough', [{attribute: attributes.research, requirement: 10}]),
    new AttributeRequirement('playthrough', [{attribute: attributes.research, requirement: 20}]),
    new AttributeRequirement('playthrough', [{attribute: attributes.research, requirement: 50}]),
    new AttributeRequirement('playthrough', [{attribute: attributes.research, requirement: 100}]),
];

/**
 *
 * @return {{limit: number, requirement: AttributeRequirement|null}}
 */
function maximumAvailableBattles() {
    const research = attributes.research.getValue();
    if (research >= 100) return {limit: 5, requirement: null};
    if (research >= 50) return {limit: 4, requirement: battleRequirements[3]};
    if (research >= 20) return {limit: 3, requirement: battleRequirements[2]};
    if (research >= 10) return {limit: 2, requirement: battleRequirements[1]};
    return {limit: 1, requirement: battleRequirements[0]};
}

/**
 * @type {Object<ModuleOperation>}
 */
const moduleOperations = {};
moduleOperations.StandbyGenerator = new ModuleOperation({
    title: 'Standby Generator', maxXp: 500, gridLoad: 0,
    effects: [{effectType: EffectType.Energy, baseValue: 0.5}],
});
moduleOperations.FourDPrinter = new ModuleOperation({
    title: '4D Printer', maxXp: 500, gridLoad: 1,
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.01}],
    requirements: [new AttributeRequirement('playthrough', [{attribute: attributes.gridStrength, requirement: 1}])],
});
moduleOperations.MicroCyborgAutomat = new ModuleOperation({
    title: 'Micro Cyborg Automat', maxXp: 200, gridLoad: 1,
    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.01}],
    requirements: [new OperationLevelRequirement('playthrough', [{operation: moduleOperations.FourDPrinter, requirement: 10}])],
});
moduleOperations.KungFuManual = new ModuleOperation({
    title: 'Kung Fu Manual', maxXp: 300, gridLoad: 1,
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.01}],
    requirements: [new OperationLevelRequirement('playthrough', [{operation: moduleOperations.MicroCyborgAutomat, requirement: 10}])],
});
moduleOperations.PocketLaboratory = new ModuleOperation({
    title: 'Pocket Laboratory', maxXp: 400, gridLoad: 1,
    effects: [{effectType: EffectType.ResearchFactor, baseValue: 0.01}],
    requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{
                faction: factions.Astrogoblins,
                requirement: battles.Astrogoblins10.targetLevel + battles.Astrogoblins15.targetLevel,
            }])],
});

// Mining
moduleOperations.SpaceRocks = new ModuleOperation({
    title: 'Space Rocks', maxXp: 100, gridLoad: 1,
    description: 'Space seems to be filled with either nothingness or those rocks.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.01}]
});
moduleOperations.HeavyGlitz = new ModuleOperation({
    title: 'Heavy Glitz', maxXp: 100, gridLoad: 2,
    description: 'It\'s shiny, it conducts sparks, it\'s surprisingly heavy and hard.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.02}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.SpaceRocks,
        requirement: 10,
    }])],
});
/** Galactic Secret */
moduleOperations.Radiance = new ModuleOperation({
    title: 'Radiance', maxXp: 100, gridLoad: 4,
    description: 'Tingles in your hand but glows in the dark. Even heavier than the regular glitz.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.03}, {effectType: EffectType.ResearchFactor, baseValue: 0.02}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.HeavyGlitz,
        requirement: 100,
    }])],
});

moduleOperations.BigSpinny = new ModuleOperation({
    title: 'The Big Spinny', maxXp: 100, gridLoad: 1,
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.01}],
});
moduleOperations.AsteroidChomper = new ModuleOperation({
    title: 'Asteroid Chomper', maxXp: 100, gridLoad: 2,
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.02}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.BigSpinny,
        requirement: 10,
    }])],
});
/** Galactic Secret */
moduleOperations.TenDrills = new ModuleOperation({
    title: 'TenDrills', maxXp: 100, gridLoad: 4,
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.03}, {effectType: EffectType.IndustryFactor, baseValue: 0.02}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.AsteroidChomper,
        requirement: 100,
    }])],
});

// Furnace
moduleOperations.Garbage = new ModuleOperation({
    title: 'Garbage', maxXp: 400, gridLoad: 1,
    description: 'It\'s not about efficiency, it\'s about sustainability. Or just getting rid of all that trash lying around the station.',
    effects: [{effectType: EffectType.Energy, baseValue: 1}],
});
moduleOperations.Diesel = new ModuleOperation({
    title: 'Diesel', maxXp: 50, gridLoad: 2,
    description: 'From the depths of fossilized relics to the pulse of synthesized organics, it\'s the timeless heart that beats in the mechanical chest of progress.',
    effects: [{effectType: EffectType.Energy, baseValue: 1.5}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.Garbage,
        requirement: 10,
    }])],
});
moduleOperations.FuelT3 = new ModuleOperation({
    title: 'FUEL TIER III', maxXp: 50, gridLoad: 4,

    effects: [{effectType: EffectType.Energy, baseValue: 2}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.Diesel,
        requirement: 10,
    }])],
});
/** Galactic Secret */
moduleOperations.Quasarite = new ModuleOperation({
    title: 'Quasarite', maxXp: 1_000_000, gridLoad: 8,
    description: 'Harnessed from the remnants of distant quasar explosions it pulses with mind-boggling energy. ' +
        'Its otherworldly properties enhance resource production but require careful containment to avoid unpredictable reactions.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.05}, {effectType: EffectType.Energy, baseValue: 3}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.FuelT3,
        requirement: 100,
    }])],
});

moduleOperations.Plastics = new ModuleOperation({
    title: 'Plastics', maxXp: 100, gridLoad: 2,

    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.01}],
});
moduleOperations.Steel = new ModuleOperation({
    title: 'Steel', maxXp: 200, gridLoad: 4,

    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.02}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.Plastics,
        requirement: 10,
    }])],
});
moduleOperations.ProductsT3 = new ModuleOperation({
    title: 'PRODUCTS TIER III', maxXp: 200, gridLoad: 6,

    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.03}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.Steel,
        requirement: 10,
    }])],
});
/** Galactic Secret */
moduleOperations.MicroalloyGlass = new ModuleOperation({
    title: 'Microalloy Glass', maxXp: 2_500_000, gridLoad: 10,
    description: 'Fifteen times harder than steel and so clear that objects made out of pure microalloy glass can be considered invisible.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.05}, {effectType: EffectType.Research, baseValue: 3}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.ProductsT3,
        requirement: 100,
    }])],
});

//Population
moduleOperations.Survivors = new ModuleOperation({
    title: 'Pick up survivors', maxXp: 400, gridLoad: 1,

    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.01}],
});
moduleOperations.Recruitment = new ModuleOperation({
    title: 'Recruitment', maxXp: 400, gridLoad: 2,

    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.02}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.Survivors,
        requirement: 10,
    }])],
});
moduleOperations.SmoochSanctuary = new ModuleOperation({
    title: 'Smooch Sanctuary', maxXp: 400, gridLoad: 4,

    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.03}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.Recruitment,
        requirement: 10,
    }])],
});
moduleOperations.MechanoMaker = new ModuleOperation({
    title: 'Mechano Maker', maxXp: 400, gridLoad: 8,
    description: 'Unless you dig deeply into it, you won\'t be able to distinguish those androids from organic humanoids.',
    effects: [{effectType: EffectType.Growth, baseValue: 0.04}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.MechanoMaker,
        requirement: 10,
    }])],
});
/** Galactic Secret */
moduleOperations.ReplicationChambers = new ModuleOperation({
    title: 'Replication Chambers', maxXp: 400, gridLoad: 12,
    description: 'Where life finds a new beginning! This advanced technology can create life forms from scratch, jump-starting your population growth. Simply input the genetic code and environmental parameters, and within moments, you\'ll have a thriving population ready to build a bright future. Handle with care; creating life is a profound responsibility!',
    // description: 'Introducing the \'Quantum Replicator\'—the ultimate solution for population growth! This futuristic device uses quantum technology to duplicate individuals, allowing you to rapidly expand your population. With each activation, watch as your society flourishes and thrives. Just remember to keep track of the originals, or you might end up with an army of duplicates!',
    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.05}, {effectType: EffectType.ResearchFactor, baseValue: 0.03}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.MechanoMaker,
        requirement: 100,
    }])],
});

moduleOperations.ToughLife = new ModuleOperation({
    title: 'Tough Life', maxXp: 400, gridLoad: 2,

    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.01}],
});
moduleOperations.IndividualRooms = new ModuleOperation({
    title: 'Individual Rooms', maxXp: 400, gridLoad: 4,

    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.02}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.ToughLife,
        requirement: 10,
    }])],
});
moduleOperations.WayOfLifeT3 = new ModuleOperation({
    title: 'WAY OF LIFE TIER III', maxXp: 400, gridLoad: 6,

    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.03}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.IndividualRooms,
        requirement: 10,
    }])],
});
moduleOperations.SecretWayOfLife = new ModuleOperation({
    title: 'SECRET WAY OF LIFE TIER', maxXp: 400, gridLoad: 10,

    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.05}, {effectType: EffectType.GrowthFactor, baseValue: 0.03}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.WayOfLifeT3,
        requirement: 100,
    }])],
});

//Military
moduleOperations.GlitzPlating = new ModuleOperation({
    title: 'Glitz Plating', maxXp: 150, gridLoad: 1,

    effects: [{effectType: EffectType.EnergyFactor, baseValue: 0.01}],
});
moduleOperations.PulseShield = new ModuleOperation({
    title: 'Pulse Shield', maxXp: 1000, gridLoad: 2,

    effects: [{effectType: EffectType.EnergyFactor, baseValue: 0.02}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.GlitzPlating,
        requirement: 10,
    }])],
});
moduleOperations.BulletSponge = new ModuleOperation({
    title: 'Bullet Sponge', maxXp: 1000, gridLoad: 4,

    effects: [{effectType: EffectType.EnergyFactor, baseValue: 0.03}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.PulseShield,
        requirement: 10,
    }])],
});

moduleOperations.RapidRumbleTower = new ModuleOperation({
    title: 'Rapid Rumble Tower', maxXp: 100, gridLoad: 3,

    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.01}],
});
moduleOperations.LaserTurrets = new ModuleOperation({
    title: 'Laser Turrets', maxXp: 400, gridLoad: 6,

    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.02}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.RapidRumbleTower,
        requirement: 10,
    }])],
});
moduleOperations.AntiMissileSwarm = new ModuleOperation({
    title: 'Anti-Missile Swarm', maxXp: 400, gridLoad: 10,

    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.03}],
    requirements: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.LaserTurrets,
        requirement: 10,
    }])],
});


/**
 * @type {Object<ModuleComponent>}
 */
const moduleComponents = {
    RescueCapsule: new ModuleComponent({
        title: 'Rescue Capsule',
        description: 'A small pod, big enough to house a single person. Ideal to escape from the station as a last resort.',
        operations: [moduleOperations.StandbyGenerator],
    }),
    TinyToolbox: new ModuleComponent({
        title: 'Tiny Toolbox',

        operations: [moduleOperations.FourDPrinter, moduleOperations.MicroCyborgAutomat, moduleOperations.KungFuManual, moduleOperations.PocketLaboratory],
    }),
    MinedResource: new ModuleComponent({
        title: 'Mined Resource',

        operations: [moduleOperations.SpaceRocks, moduleOperations.HeavyGlitz, moduleOperations.Radiance]
    }),
    Drill: new ModuleComponent({
        title: 'Drill',

        operations: [moduleOperations.BigSpinny, moduleOperations.AsteroidChomper, moduleOperations.TenDrills]
    }),
    Fuel: new ModuleComponent({
        title: 'Fuel',

        operations: [moduleOperations.Garbage, moduleOperations.Diesel, moduleOperations.FuelT3, moduleOperations.Quasarite],
    }),
    Products: new ModuleComponent({
        title: 'Products',

        operations: [moduleOperations.Plastics, moduleOperations.Steel, moduleOperations.ProductsT3, moduleOperations.MicroalloyGlass],
    }),
    CrewExpansion: new ModuleComponent({
        title: 'Crew Expansion',

        operations: [moduleOperations.Survivors, moduleOperations.Recruitment, moduleOperations.SmoochSanctuary,
            moduleOperations.MechanoMaker, moduleOperations.ReplicationChambers],
    }),
    WayOfLife: new ModuleComponent({
        title: 'Way of Life',

        operations: [moduleOperations.ToughLife, moduleOperations.IndividualRooms, moduleOperations.WayOfLifeT3, moduleOperations.SecretWayOfLife],
    }),
    Turrets: new ModuleComponent({
        title: 'Turrets',

        operations: [moduleOperations.RapidRumbleTower, moduleOperations.LaserTurrets, moduleOperations.AntiMissileSwarm],
    }),
    Protection: new ModuleComponent({
        title: 'Protection',

        operations: [moduleOperations.GlitzPlating, moduleOperations.PulseShield, moduleOperations.BulletSponge],
    }),
};

/**
 * @type {Object<Module>}
 */
const modules = {
    ISASM: new Module({
        title: 'I.S.A.S.M',
        description: 'Indestructible Space Adventurer Survival Module',
        components: [moduleComponents.RescueCapsule],
    }),
    CaptainsQuarter: new Module({
        title: 'Captain\'s Quarter', // Bridge?

        components: [moduleComponents.TinyToolbox],
        requirements: [new AttributeRequirement('playthrough', [{attribute: attributes.gridStrength, requirement: 1}])],
    }),
    MiningBay: new Module({
        title: 'Mining Bay',

        components: [moduleComponents.MinedResource, moduleComponents.Drill],
        requirements: [new AttributeRequirement('playthrough', [{attribute: attributes.gridStrength, requirement: 2}])],
    }),
    Furnace: new Module({
        title: 'Furnace Module',
        description: '',
        components: [moduleComponents.Fuel, moduleComponents.Products],
        requirements: [new AttributeRequirement('playthrough', [{attribute: attributes.gridStrength, requirement: 4}])],
    }),
    Defensive: new Module({
        title: 'Defensive Module',
        description: '',
        components: [moduleComponents.Protection, moduleComponents.Turrets],
        requirements: [new AttributeRequirement('playthrough', [{attribute: attributes.gridStrength, requirement: 6}])],
    }),
    Quarters: new Module({
        title: 'Quarters Module',
        description: '',
        components: [moduleComponents.CrewExpansion, moduleComponents.WayOfLife],
        requirements: [new AttributeRequirement('playthrough', [{attribute: attributes.gridStrength, requirement: 8}])],
    }),
};

const defaultModules = [
    modules.ISASM
];

/**
 * @type {Object<ModuleCategory>}
 */
const moduleCategories = {
    StationCore: new ModuleCategory({
        title: 'Station Core',
        color: colorPalette.DepressionPurple,
        modules: [modules.ISASM, modules.CaptainsQuarter, modules.MiningBay, modules.Furnace, modules.Defensive, modules.Quarters],
    }),
};

/**
 * @type {Object<PointOfInterest>}
 */
const pointsOfInterest = {
    SafeZone: new PointOfInterest({
        title: 'Safe Zone',
        description: 'Let\'s take a breather and regroup.',
        effects: [
            /*
             * Not IndustryFactor as the player doesn't have any industry
             * yet, so multiplying it would yield still 0 industry
             */
            {effectType: EffectType.Industry, baseValue: 1},
            {effectType: EffectType.Danger, baseValue: 0}],
        modifiers: [],
    }),
    StarlightEnclave: new PointOfInterest({
        title: 'Starlight Enclave',
        description: 'A cosmic ballet of stars creates a breathtaking celestial display. The radiant starlight powers the station. ' +
            'Additionally, this point of interest is known for advanced stargazing technology, attracting astronomers and enthusiasts from across the galaxy.',
        effects: [
            {effectType: EffectType.Energy, baseValue: 10},
            {effectType: EffectType.GrowthFactor, baseValue: 0},
            {effectType: EffectType.ResearchFactor, baseValue: 0.5},
            {effectType: EffectType.Danger, baseValue: 5}],
        modifiers: [],
        requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{faction: factions.Astrogoblins, requirement: 5}])],
    }),
    GrowthLocationLow: new PointOfInterest({
        title: 'GrowthLocationLow',

        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 4},
            {effectType: EffectType.IndustryFactor, baseValue: -0.3},
            {effectType: EffectType.Danger, baseValue: 25}],
        modifiers: [],
        requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{faction: factions.CometCrawlers, requirement: 10}])],
    }),

    IndustryLocationMedium: new PointOfInterest({
        title: 'IndustryLocationMedium',

        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 0},
            {effectType: EffectType.IndustryFactor, baseValue: 9},
            {effectType: EffectType.ResearchFactor, baseValue: -0.2},
            {effectType: EffectType.Danger, baseValue: 50}],
        modifiers: [],
        requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{faction: factions.Scavengers, requirement: 10}])],
    }),
    ResearchLocationMedium: new PointOfInterest({
        title: 'ResearchLocationMedium',

        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 0.2},
            {effectType: EffectType.IndustryFactor, baseValue: -0.2},
            {effectType: EffectType.ResearchFactor, baseValue: 9},
            {effectType: EffectType.Danger, baseValue: 250}],
        modifiers: [],
        requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{faction: factions.SpacePirates, requirement: 10}])],
    }),
    GrowthLocationMedium: new PointOfInterest({
        title: 'GrowthLocationMedium',

        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 9},
            {effectType: EffectType.IndustryFactor, baseValue: -0.2},
            {effectType: EffectType.Danger, baseValue: 500}],
        modifiers: [],
        requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{faction: factions.Astrogoblins, requirement: 50}])],
    }),

    IndustryLocationHigh: new PointOfInterest({
        title: 'IndustryLocationHigh',

        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 0},
            {effectType: EffectType.IndustryFactor, baseValue: 19},
            {effectType: EffectType.ResearchFactor, baseValue: -0.2},
            {effectType: EffectType.Danger, baseValue: 1000}],
        modifiers: [],
        requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{faction: factions.NovaFlies, requirement: 50}])],
    }),
    ResearchLocationHigh: new PointOfInterest({
        title: 'ResearchLocationHigh',

        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 0.2},
            {effectType: EffectType.IndustryFactor, baseValue: -0.2},
            {effectType: EffectType.ResearchFactor, baseValue: 19},
            {effectType: EffectType.Danger, baseValue: 3000}],
        modifiers: [],
        requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{faction: factions.AstralSharks, requirement: 10}])],
    }),
    GrowthLocationHigh: new PointOfInterest({
        title: 'GrowthLocationHigh',

        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 19},
            {effectType: EffectType.IndustryFactor, baseValue: -0.2},
            {effectType: EffectType.Danger, baseValue: 5000}],
        modifiers: [],
        requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{faction: factions.ThunderDragon, requirement: 10}])],
    }),

    IndustryLocationExtreme: new PointOfInterest({
        title: 'IndustryLocationExtreme',

        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 0},
            {effectType: EffectType.IndustryFactor, baseValue: 49},
            {effectType: EffectType.ResearchFactor, baseValue: -0.2},
            {effectType: EffectType.Danger, baseValue: 10000}],
        modifiers: [],
        requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{faction: factions.SpacePirates, requirement: 300}])],
    }),
    ResearchLocationExtreme: new PointOfInterest({
        title: 'ResearchLocationExtreme',

        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 0.2},
            {effectType: EffectType.IndustryFactor, baseValue: -0.2},
            {effectType: EffectType.ResearchFactor, baseValue: 49},
            {effectType: EffectType.Danger, baseValue: 30000}],
        modifiers: [],
        requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{faction: factions.AstralSharks, requirement: 50}])],
    }),
    GrowthLocationExtreme: new PointOfInterest({
        title: 'GrowthLocationExtreme',

        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 49},
            {effectType: EffectType.IndustryFactor, baseValue: -0.2},
            {effectType: EffectType.Danger, baseValue: 50000}],
        modifiers: [],
        requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{faction: factions.ThunderDragon, requirement: 50}])],
    }),
};

const defaultPointOfInterest =  pointsOfInterest.SafeZone;

/**
 * @type {Object<Sector>}
 */
const sectors = {
    // Twilight
    AlphaSector: new Sector({
        title: 'Alpha Sector',
        color: '#ECA545',
        pointsOfInterest: [pointsOfInterest.SafeZone, pointsOfInterest.StarlightEnclave, pointsOfInterest.GrowthLocationLow],
    }),
    BetaSector: new Sector({
        title: 'Beta Sector',
        color: '#56BA5A',
        pointsOfInterest: [pointsOfInterest.IndustryLocationMedium, pointsOfInterest.ResearchLocationMedium, pointsOfInterest.GrowthLocationMedium],
        requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{faction: factions.Astrogoblins, requirement: 30}])],
    }),
    GammaSector: new Sector({
        title: 'Gamma Sector',
        color: '#1C92D0',
        pointsOfInterest: [pointsOfInterest.IndustryLocationHigh, pointsOfInterest.ResearchLocationHigh, pointsOfInterest.GrowthLocationHigh],
    }),
    DeltaSector: new Sector({
        title: 'Delta Sector',
        color: '#E64E4D',
        pointsOfInterest: [pointsOfInterest.IndustryLocationExtreme, pointsOfInterest.ResearchLocationExtreme, pointsOfInterest.GrowthLocationExtreme],
    }),
};

/**
 * @type {Object.<string, GalacticSecret>}
 */
const galacticSecrets = {
    Radiance: new GalacticSecret({
        unlocks: moduleOperations.Radiance,
    }),
    TenDrills: new GalacticSecret({
        unlocks: moduleOperations.TenDrills,
    }),
    Quasarite: new GalacticSecret({
        unlocks: moduleOperations.Quasarite,
    }),
    MicroalloyGlass: new GalacticSecret({
        unlocks: moduleOperations.MicroalloyGlass,
    }),
    ReplicationChambers: new GalacticSecret({
        unlocks: moduleOperations.ReplicationChambers,
    }),
    SecretWayOfLife: new GalacticSecret({
        unlocks: moduleOperations.SecretWayOfLife,
    }),
    AntiMissileSwarm: new GalacticSecret({
        unlocks: moduleOperations.AntiMissileSwarm,
    }),
};

const galacticSecretUnlockDuration = 2500; // milliseconds

const layerData = [
    new LayerData('#ffe119'),
    new LayerData('#f58231'),
    new LayerData('#e6194B'),
    new LayerData('#911eb4'),
    new LayerData('#4363d8'),
    new LayerData('#47ff00'),
];

const lastLayerData = new LayerData('#000000');

/**
 * Requirements of arbitrary {@link HTMLElement}s in the layout.
 * @type {Object<HtmlElementWithRequirement>}
 */
const htmlElementRequirements = {
    energyGridDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().byId('energyGridDisplay'),
            ],
            requirements: [new OperationLevelRequirement('playthrough',
                [{operation: moduleOperations.StandbyGenerator, requirement: 1}]),
            ],
            elementsToShowRequirements: []
        }),
    gridStrengthElements: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().byId('gridLabel'),
                Dom.get().byId('gridStrength'),
            ],
            requirements: [new AttributeRequirement('playthrough',
                [{attribute: attributes.gridStrength, requirement: 1}]),
            ],
            elementsToShowRequirements: []
        }),
    industryDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().bySelector('#attributesDisplay > [data-attribute="industry"]'),
            ],
            requirements: [new OperationLevelRequirement('playthrough',
                [{operation: moduleOperations.FourDPrinter, requirement: 1}]),
            ],
            elementsToShowRequirements: []
        }),
    growthDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().bySelector('#attributesDisplay > [data-attribute="growth"]'),
            ],
            requirements: [new OperationLevelRequirement('playthrough',
                [{operation: moduleOperations.MicroCyborgAutomat, requirement: 1}]),
            ],
            elementsToShowRequirements: []
        }),
    militaryDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().bySelector('#attributesDisplay > [data-attribute="military"]'),
            ],
            requirements: [new OperationLevelRequirement('playthrough',
                [{operation: moduleOperations.KungFuManual, requirement: 1}]),
            ],
            elementsToShowRequirements: []
        }),
    battleTabButton: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().byId('battleTabButton')],
            requirements: [new OperationLevelRequirement('playthrough', [{
                operation: moduleOperations.KungFuManual,
                requirement: 10,
            }])],
            elementsToShowRequirements: []
        }),
    dangerDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().bySelector('#attributesDisplay > [data-attribute="danger"]'),
                Dom.get().bySelector('#attributesDisplay > [data-attribute="heat"]'),
                Dom.lazy().allBySelector('#battles .level3 .danger, #battles .level4 .danger'),
            ],
            requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{
                faction: factions.Astrogoblins,
                requirement: battles.Astrogoblins10.targetLevel,
            }])],
            elementsToShowRequirements: []
        }),
    researchDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().bySelector('#attributesDisplay > [data-attribute="research"]'),
            ],
            requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{
                faction: factions.Astrogoblins,
                requirement: battles.Astrogoblins10.targetLevel + battles.Astrogoblins15.targetLevel,
            }])],
            elementsToShowRequirements: []
        }),
    locationTabButton: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().byId('locationTabButton')],
            requirements: [new OperationLevelRequirement('playthrough', [{
                operation: moduleOperations.PocketLaboratory,
                requirement: 10,
            }])],
            elementsToShowRequirements: []
        }),
    attributesTabButton: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().byId('attributesTabButton')],
            requirements: [new AttributeRequirement('playthrough', [{
                attribute: attributes.research,
                requirement: 10,
            }])],
            elementsToShowRequirements: []
        }),
    galacticSecretsTabButton: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().byId('galacticSecretsTabButton')],
            requirements: [new AttributeRequirement('playthrough', [{
                attribute: attributes.essenceOfUnknown,
                requirement: 1,
            }])],
            elementsToShowRequirements: []
        }),
    essenceOfUnknownLabel: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().bySelector('#galacticSecretsTabButton > .primary-stat')],
            requirements: [new AttributeRequirement('update', [{
                attribute: attributes.essenceOfUnknown,
                requirement: 1,
            }])],
            elementsToShowRequirements: []
        }),
};

function setCustomEffects() {
    // const bargaining = gameData.taskData['Bargaining'];
    // bargaining.getEffect = function () {
    //     let multiplier = 1 - getBaseLog(7, bargaining.level + 1) / 10;
    //     if (multiplier < 0.1) {
    //         multiplier = 0.1;
    //     }
    //     return multiplier;
    // };
    //
    // const intimidation = gameData.taskData['Intimidation'];
    // intimidation.getEffect = function () {
    //     let multiplier = 1 - getBaseLog(7, intimidation.level + 1) / 10;
    //     if (multiplier < 0.1) {
    //         multiplier = 0.1;
    //     }
    //     return multiplier;
    // };
    //
    // const immortality = gameData.taskData['Immortality'];
    // immortality.getEffect = function () {
    //     return 1 + getBaseLog(33, immortality.level + 1);
    // };
}
