'use strict';

// TODO replace with requestAnimationFrame for smoothest experience
const updateSpeed = 20;

const baseDate = 100000;
const startingDays = 0;
const baseLifespan = 25 * 365;
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
 * @type {Object.<string, AttributeDefinition>}
 */
const attributes = {
    danger: { title: 'Danger', color: colorPalette.DangerRed, icon: 'img/icons/danger.svg',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Danger])},
    gridLoad: { title: 'Grid Load', color: '#2CCBFF', icon: 'img/icons/grid.svg',
        getValue: () => calculateGridLoad() },
    gridStrength: { title: 'Grid Strength', color: '#0C65AD', icon: 'img/icons/grid.svg',
        getValue: () => gridStrength.getGridStrength() },
    growth: { title: 'Growth', color: '#008000', icon: 'img/icons/growth.svg',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Growth])},
    heat: { title: 'Heat', color: 'rgb(245, 166, 35)', icon: 'img/icons/heat.svg',
        getValue: () => calculateHeat() },
    industry: { title: 'Industry', color: 'rgb(97, 173, 50)', icon: 'img/icons/industry.svg',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Industry])},
    military: { title: 'Military', color: '#b3b3b3', icon: 'img/icons/military.svg',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Military, EffectType.MilitaryFactor])},
    population: { title: 'Population', color: 'rgb(46, 148, 231)', icon: 'img/icons/population.svg',
        getValue: () => gameData.population },
    research: { title: 'Research', color: '#cc4ee2', icon: 'img/icons/research.svg',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Research, EffectType.ResearchFactor])},
};

/**
 *
 * @param {function(AttributeDefinition): string} printAttribute renders the provided attribute nicely.
 */
function createAttributeDescriptions(printAttribute) {
    attributes.danger.description = 'Increases ' + printAttribute(attributes.heat) + '.';
    attributes.gridLoad.description = 'Amount of ' + printAttribute(attributes.gridStrength) + ' currently assigned.';
    attributes.gridStrength.description = 'Limits the number of concurrently active operations.';
    attributes.growth.description = 'Increases ' + printAttribute(attributes.population) + '.';
    attributes.heat.description = 'Reduces ' + printAttribute(attributes.population) + '.';
    attributes.industry.description = 'Speeds up operations progress.';
    attributes.military.description = 'Counteracts ' + printAttribute(attributes.danger) + ' and increases damage in Battles.';
    attributes.population.description = 'Affects all progress speed.';
    attributes.research.description = 'Unlocks new knowledge.';
}

const gridStrength = new GridStrength({name:'GridStrength', title: 'Grid Strength', maxXp: 100});

/**
 * @type {Object.<string, ModuleOperation>}
 */
const moduleOperations = {
    StandbyGenerator: new ModuleOperation({
        title: 'Standby Generator', maxXp: 100, gridLoad: 0,
        effects: [{effectType: EffectType.Energy, baseValue: 0.5}],
    }),
    MicroCyborgAutomat: new ModuleOperation({
        title: 'Micro Cyborg Automat', maxXp: 100, gridLoad: 1,
        effects: [{effectType: EffectType.Growth, baseValue: 0.1}],
        requirements: [new AttributeRequirement('playthrough', [{attribute: attributes.gridStrength, requirement: 1}])],
    }),
    KungFuManual: new ModuleOperation({
        title: 'Kung Fu manual', maxXp: 100, gridLoad: 1,
        effects: [{effectType: EffectType.Military, baseValue: 0.1}],
        requirements: [new AttributeRequirement('playthrough', [{attribute: attributes.gridStrength, requirement: 1}])],
    }),
    PocketLaboratory: new ModuleOperation({
        title: 'Pocket Laboratory', maxXp: 100, gridLoad: 1,
        effects: [{effectType: EffectType.Research, baseValue: 0.1}],
        requirements: [new AttributeRequirement('playthrough', [{attribute: attributes.gridStrength, requirement: 1}])],
    }),
    FourDPrinter: new ModuleOperation({
        title: '4D Printer', maxXp: 100, gridLoad: 1,
        effects: [{effectType: EffectType.Industry, baseValue: 0.1}],
        requirements: [new AttributeRequirement('playthrough', [{attribute: attributes.gridStrength, requirement: 1}])],
    }),

    Garbage: new ModuleOperation({
        title: 'Garbage', maxXp: 400, gridLoad: 1,
        description: 'Garbage text.',
        effects: [{effectType: EffectType.Industry, baseValue: 1}, {effectType: EffectType.Energy, baseValue: 1}],
    }),
    Diesel: new ModuleOperation({
        title: 'Diesel', maxXp: 50, gridLoad: 1,
        description: 'Diesel text.',
        effects: [{effectType: EffectType.Growth, baseValue: 1}, {effectType: EffectType.Energy, baseValue: 1}],
    }),
    Plastics: new ModuleOperation({
        title: 'Plastics', maxXp: 100, gridLoad: 1,
        description: 'Plastics text.',
        effects: [{effectType: EffectType.Industry, baseValue: 1}, {effectType: EffectType.Energy, baseValue: 1}],
    }),
    Steel: new ModuleOperation({
        title: 'Steel', maxXp: 200, gridLoad: 1,
        description: 'Steel text.',
        effects: [{effectType: EffectType.Growth, baseValue: 1}, {effectType: EffectType.EnergyFactor, baseValue: 1}],
    }),

    //Population
    QuantumReplicator: new ModuleOperation({
        title: 'Quantum Replicator', maxXp: 400, gridLoad: 1,
        description: 'Introducing the \'Quantum Replicator\'—the ultimate solution for population growth! This futuristic device uses quantum technology to duplicate individuals, allowing you to rapidly expand your population. With each activation, watch as your society flourishes and thrives. Just remember to keep track of the originals, or you might end up with an army of duplicates!',
        effects: [{effectType: EffectType.Growth, baseValue: 1}],
    }),
    BioGenesisChamber: new ModuleOperation({
        title: 'Bio-Genesis Chamber', maxXp: 400, gridLoad: 1,
        description: "Step into the 'Bio-Genesis Chamber,' where life finds a new beginning! This advanced technology can create life forms from scratch, jump-starting your population growth. Simply input the genetic code and environmental parameters, and within moments, you'll have a thriving population ready to build a bright future. Handle with care; creating life is a profound responsibility!",
        effects: [{effectType: EffectType.Growth, baseValue: 1}],
    }),
    NanoFertilityDrones: new ModuleOperation({
        title: 'Nano-Fertility Drones', maxXp: 400, gridLoad: 1,
        description: "Meet the 'Nano-Fertility Drones'—tiny, intelligent machines on a mission to boost your population! These nanobots are programmed to enhance fertility rates, making reproduction more efficient than ever before. Whether you're on a distant planet or in a post-apocalyptic world, these drones ensure your population will grow and thrive against all odds.",
        effects: [{effectType: EffectType.Growth, baseValue: 1}],
    }),
    HoloCommunityHub: new ModuleOperation({
        title: 'Holo-Community Hub', maxXp: 400, gridLoad: 1,
        description: "Create a sense of unity with the 'Holo-Community Hub'! This holographic hub provides a virtual meeting space for your population, regardless of physical distance. As individuals gather in the virtual world, they form stronger bonds, leading to increased cooperation, higher birth rates, and a sense of belonging. Just be prepared for some quirky virtual avatars!",
        effects: [{effectType: EffectType.Growth, baseValue: 1}],
    }),
    TemporalBreedingPods: new ModuleOperation({
        title: 'Temporal Breeding Pods', maxXp: 400, gridLoad: 1,
        description: "Venture into the temporal realm with 'Temporal Breeding Pods'! These extraordinary chambers manipulate time itself to accelerate the aging process. Individuals placed inside age rapidly, allowing for generations to be born and raised in a fraction of the time. Witness your population skyrocket as you harness the mysteries of time travel!",
        effects: [{effectType: EffectType.Growth, baseValue: 1}],
    }),

    //Military
    BallisticTurrets: new ModuleOperation({
        title: 'Ballistic Turrets', maxXp: 100, gridLoad: 1,
        effects: [{effectType: EffectType.Military, baseValue: 2}],
    }),
    LaserTurrets: new ModuleOperation({
        title: 'Laser Turrets', maxXp: 400, gridLoad: 1,
        effects: [{effectType: EffectType.Military, baseValue: 1}],
    }),
    FighterSquadron: new ModuleOperation({
        title: 'Fighter Squadron', maxXp: 150, gridLoad: 1,
        effects: [{effectType: EffectType.Military, baseValue: 3}],
    }),
    EliteForce: new ModuleOperation({
        title: 'Elite Force', maxXp: 1000, gridLoad: 1,
        effects: [{effectType: EffectType.Military, baseValue: 10}],
    }),
};

/**
 * @type {Object.<string, ModuleComponent>}
 */
const moduleComponents = {
    RescueCapsule: new ModuleComponent({
        title: 'Rescue Capsule',
        description: 'A small pod, big enough to house a single person. Ideal to escape from the station as a last resort.',
        operations: [moduleOperations.StandbyGenerator, moduleOperations.MicroCyborgAutomat, moduleOperations.KungFuManual, moduleOperations.PocketLaboratory, moduleOperations.FourDPrinter],
    }),
    Fuel: new ModuleComponent({
        title: 'Fuel',
        operations: [moduleOperations.Garbage, moduleOperations.Diesel],
    }),
    Products: new ModuleComponent({
        title: 'Products',
        operations: [moduleOperations.Plastics, moduleOperations.Steel],
    }),
    Replication: new ModuleComponent({
        title: 'Replication',
        operations: [moduleOperations.QuantumReplicator, moduleOperations.BioGenesisChamber, moduleOperations.NanoFertilityDrones],
    }),
    Living: new ModuleComponent({
        title: 'Living',
        operations: [moduleOperations.HoloCommunityHub, moduleOperations.TemporalBreedingPods],
    }),
    Turrets: new ModuleComponent({
        title: 'Turrets',
        operations: [moduleOperations.BallisticTurrets, moduleOperations.LaserTurrets],
    }),
    Squads: new ModuleComponent({
        title: 'Squads',
        operations: [moduleOperations.FighterSquadron, moduleOperations.EliteForce],
    }),
};

/**
 * @type {Object.<string, Module>}
 */
const modules = {
    ISASM: new Module({
        title: 'I.S.A.S.M',
        description: 'Indestructible Space Adventurer Survival Module',
        components: [moduleComponents.RescueCapsule]}
    ),
    Furnace: new Module({
        title: 'Furnace Module',
        description: '',
        components: [moduleComponents.Fuel, moduleComponents.Products],
    }),
    Hive: new Module({
        title: 'Hive Module',
        description: '',
        components: [moduleComponents.Replication, moduleComponents.Living],
    }),
    WeaponBay: new Module({
        title: 'Weapon Bay',
        description: '',
        components: [moduleComponents.Turrets, moduleComponents.Squads],
    }),
};

const defaultModules = [
    modules.ISASM
];

/**
 * @type {Object.<string, ModuleCategory>}
 */
const moduleCategories = {
    EmergencySupplies: new ModuleCategory({
        title: 'Emergency Quarters',
        color: colorPalette.DepressionPurple,
        modules: [modules.ISASM],
    }),
    Fundamentals: new ModuleCategory({
        title: 'Fundamentals',
        color: colorPalette.EasyGreen,
        modules: [modules.Furnace],
        requirements: [new AttributeRequirement('playthrough', [{attribute: attributes.gridStrength, requirement: 2}])],
    }),
    Population: new ModuleCategory({
        title: 'Population',
        color: colorPalette.HappyBlue,
        modules: [modules.Hive],
        requirements: [new AttributeRequirement('playthrough', [{attribute: attributes.gridStrength, requirement: 3}])],
    }),
    Military: new ModuleCategory({
        title: 'Military',
        color: colorPalette.TomatoRed,
        modules: [modules.WeaponBay],
        requirements: [new AttributeRequirement('playthrough', [
            {attribute: attributes.military, requirement: 10},
            {attribute: attributes.gridStrength, requirement: 3}
        ])],
    }),
};

/*
 *           100_000
 *         1_000_000
 *         7_500_000
 *        40_000_000
 *       150_000_000
 * 1_000_000_000_000
 */

/**
 * @type {Object.<string, FactionDefinition>}
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
    PseudoBoss: {
        title: 'Boss', maxXp: 5_000_000,
        description: 'You thought this game had a boss, huh? Well, not yet. In the meantime you can try to fight this bad boy. Over 9000 Danger. Is this a lot? Maybe!'
    },

    Destroyer: {
        title: 'Destroyer', maxXp: 150_000_000,
        description: 'An immense, dark mass of writhing tentacles, teeth and a thousand eyes. The vacuum of space around the station suppresses all noise, ' +
            'but you can feel the hatred of the alien beast and see it\'s determination to destroy everything you have built up.'
    },
};

const bossBattle = new BossBattle({
    title: 'The',
    targetLevel: 20,
    faction: factions.Destroyer,
    effects: [{effectType: EffectType.Danger, baseValue: 10}],
    rewards: [],
    progressBarId: 'battleProgressBar',
    layerLabel: 'Tentacles layer',
});

/**
 * How many battles lie between the boss appearance and the boss battle.
 * @type {number}
 */
const bossBattleDefaultDistance = 4;
const bossBattleApproachInterval = 200; // Cycles

/**
 * @type {Object.<string, Battle>}
 */
const battles = {
    Astrogoblins10: new Battle({
        title: 'Wimpy',
        targetLevel: 10,
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
    SpacePirates10: new Battle({
        title: 'Roaming',
        targetLevel: 10,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 100}],
        rewards: [{effectType: EffectType.Military, baseValue: 5}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Scavengers20: new Battle({
        title: 'Violent',
        targetLevel: 20,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 150}],
        rewards: [{effectType: EffectType.Research, baseValue: 7}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
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
    NovaFlies200: new Battle({
        title: 'Countless',
        targetLevel: 200,
        faction: factions.NovaFlies,
        effects: [{effectType: EffectType.Danger, baseValue: 750}],
        rewards: [{effectType: EffectType.Growth, baseValue: 20}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),

    // PseudoBoss10: new Battle({
    //     title: 'Pseudo',
    //     targetLevel: 10,
    //     faction: factions.PseudoBoss,
    //     effects: [{effectType: EffectType.Danger, baseValue: 9010}],
    //     rewards: [
    //         {effectType: EffectType.Research, baseValue: 100},
    //         {effectType: EffectType.Growth, baseValue: 100},
    //         {effectType: EffectType.Industry, baseValue: 100},
    //         {effectType: EffectType.Military, baseValue: 100},
    //         {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    // }),

    Destroyer: bossBattle,
};

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
 * @type {Object.<string, PointOfInterest>}
 */
const pointsOfInterest = {
    SafeZone: new PointOfInterest({
        title: 'Safe Zone',
        description: 'Let\'s take a breather and regroup.',
        effects: [
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
            {effectType: EffectType.Growth, baseValue: 1},
            {effectType: EffectType.ResearchFactor, baseValue: 1.5},
            {effectType: EffectType.Danger, baseValue: 5}],
        modifiers: [],
        requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{faction: factions.Astrogoblins, requirement: 5}])],
    }),
    VideoGameLand: new PointOfInterest({
        title: 'Video Game Land',
        description: '',
        effects: [{effectType: EffectType.Military, baseValue: 1}, {effectType: EffectType.Danger, baseValue: 25}],
        modifiers: [{modifies: [moduleOperations.BallisticTurrets, moduleOperations.LaserTurrets], from: EffectType.Military, to: EffectType.Energy}],
    }),
    Gurkenland: new PointOfInterest({
        title: 'Gurkenland',
        description: '',
        effects: [{effectType: EffectType.Growth, baseValue: 1}, {effectType: EffectType.Danger, baseValue: 10}],
        modifiers: [{modifies: [moduleOperations.Plastics], from: EffectType.Industry, to: EffectType.Growth}, {modifies: [moduleOperations.Steel], from: EffectType.Growth, to: EffectType.Industry}],
        requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{faction: factions.AstralSharks, requirement: 10}])],
    }),
};

/**
 * @type {Object.<string, Sector>}
 */
const sectors = {
    // Twilight
    AlphaSector: new Sector({
        title: 'Alpha Sector',
        color: '#ECA545',
        pointsOfInterest: [pointsOfInterest.SafeZone, pointsOfInterest.StarlightEnclave],
    }),
    BetaSector: new Sector({
        title: 'Beta Sector',
        color: '#56BA5A',
        pointsOfInterest: [pointsOfInterest.VideoGameLand, pointsOfInterest.Gurkenland],
        requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{faction: factions.Astrogoblins, requirement: 30}])],
    }),
    GammaSector: new Sector({
        title: 'Gamma Sector',
        color: '#1C92D0',
        pointsOfInterest: [],
    }),
    DeltaSector: new Sector({
        title: 'Delta Sector',
        color: '#E64E4D',
        pointsOfInterest: [],
    }),
};

const defaultPointOfInterest = 'SafeZone';

const permanentUnlocks = ['Scheduling', 'Shop', 'Automation', 'Quick task display'];

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
 * @type {HtmlElementWithRequirement[]}
 */
const elementRequirements = [
    new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().byId('battleTabButton')],
            requirements: [new AttributeRequirement('playthrough', [{
                attribute: attributes.military,
                requirement: 1,
            }])],
            elementsToShowRequirements: []
        }),
    new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().byId('attributesTabButton')],
            requirements: [new AttributeRequirement('playthrough', [{
                attribute: attributes.research,
                requirement: 10,
            }])],
            elementsToShowRequirements: []
        }),
    new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().byId('gridLabel'),
                Dom.get().byId('gridStrength')
            ],
            requirements: [new AttributeRequirement('playthrough',
                [{attribute: attributes.gridStrength, requirement: 1}]),
            ],
            elementsToShowRequirements: []
        }),
];

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
