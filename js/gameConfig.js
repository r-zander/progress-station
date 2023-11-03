'use strict';

// TODO replace with requestAnimationFrame for smoothest experience
const updateSpeed = 20;

const baseLifespan = 365 * 70;
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

/**
 * @type {Object.<string, AttributeDefinition>}
 */
// TODO render those into #attributesDisplay
const attributes = {
    danger: {title: 'Danger', color: 'rgb(200, 0, 0)', icon: 'img/icons/danger.svg',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Danger])},
    gridLoad: {title: 'Grid Load', color: '#2CCBFF', icon: 'img/icons/energy.svg',
        getValue: function () { return calculateGridLoad(); }},
    gridStrength: {title: 'Grid Strength', color: '#0C65AD', icon: 'img/icons/energy.svg',
        getValue: function () { return 1 + gridStrength.getGridStrength(); }},
    growth: {title: 'Growth', color: 'green', icon: 'img/icons/growth.svg',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Growth])},
    heat: {title: 'Heat', color: 'rgb(245, 166, 35)', icon: 'img/icons/heat.svg',
        getValue: function () { return calculateHeat(); }},
    industry: {title: 'Industry', color: 'rgb(97, 173, 50)', icon: 'img/icons/industry.svg',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Industry])},
    military: {title: 'Military', color: '#b3b3b3', icon: 'img/icons/military.svg',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Military])},
    population: {title: 'Population', color: 'rgb(46, 148, 231)', icon: 'img/icons/population.svg',
        getValue: function () { return gameData.population; }},
    research: {title: 'Research', color: '#cc4ee2', icon: 'img/icons/research.svg',
        getValue: Effect.getTotalValue.bind(this, [EffectType.Research, EffectType.ResearchFactor])},
};
assignNames(attributes);

/**
 *
 * @param {function(AttributeDefinition): string} createAttributeInlineHTML
 */
function createAttributeDescriptions(createAttributeInlineHTML) {
    attributes.danger.description = 'Increases ' + createAttributeInlineHTML(attributes.heat) + '.';
    attributes.gridLoad.description = 'Amount of ' + createAttributeInlineHTML(attributes.gridStrength) + ' currently assigned.';
    attributes.gridStrength.description = 'Limits the number of concurrently active operations.';
    attributes.growth.description = 'Increases ' + createAttributeInlineHTML(attributes.population) + '.';
    attributes.heat.description = 'Reduces ' + createAttributeInlineHTML(attributes.population) + '.';
    attributes.industry.description = 'Speeds up operations progress.';
    attributes.military.description = 'Counteracts ' + createAttributeInlineHTML(attributes.danger) + '.';
    attributes.population.description = 'Affects all work speed.';
    attributes.research.description = 'Unlocks new knowledge.';
}

const gridStrength = new GridStrength({name:'GridStrength', title: 'Grid Strength', maxXp: 100});

const battleBaseData = {
    Destroyer: {title: 'The Destroyer', maxXp: 500, maxLayers: 5, progressBarId: 'battleProgressBar', layerLabel: 'Tentacles layer'},
};

const moduleOperations = {
    Garbage: new ModuleOperation({title: 'Garbage', effects: [{effectType: EffectType.Industry, baseValue: 5}, {effectType: EffectType.Energy, baseValue: 5}], maxXp: 400, gridLoad: 1}),
    Diesel: new ModuleOperation({title: 'Diesel', effects: [{effectType: EffectType.Growth, baseValue: 5}, {effectType: EffectType.Energy, baseValue: 5}], maxXp: 50, gridLoad: 1}),
    Plastics: new ModuleOperation({title: 'Plastics', effects: [{effectType: EffectType.Industry, baseValue: 5}, {effectType: EffectType.Energy, baseValue: 5}], maxXp: 100, gridLoad: 1}),
    Steel: new ModuleOperation({title: 'Steel', effects: [{effectType: EffectType.Growth, baseValue: 5}, {effectType: EffectType.EnergyFactor, baseValue: 5}], maxXp: 200, gridLoad: 1}),
    //Population
    QuantumReplicator: new ModuleOperation({title: 'Quantum Replicator', effects: [{effectType: EffectType.Growth, baseValue: 5}], maxXp: 400, gridLoad: 1}),
    BioGenesisChamber: new ModuleOperation({title: 'Bio-Genesis Chamber', effects: [{effectType: EffectType.Growth, baseValue: 5}], maxXp: 400, gridLoad: 1}),
    NanoFertilityDrones: new ModuleOperation({title: 'Nano-Fertility Drones', effects: [{effectType: EffectType.Growth, baseValue: 5}], maxXp: 400, gridLoad: 1}),
    HoloCommunityHub: new ModuleOperation({title: 'Holo-Community Hub', effects: [{effectType: EffectType.Growth, baseValue: 5}], maxXp: 400, gridLoad: 1}),
    TemporalBreedingPods: new ModuleOperation({title: 'Temporal Breeding Pods', effects: [{effectType: EffectType.Growth, baseValue: 5}], maxXp: 400, gridLoad: 1}),
    //Military
    BallisticTurrets: new ModuleOperation({title: 'Ballistic Turrets', effects: [{effectType: EffectType.Military, baseValue: 2}], maxXp: 100, gridLoad: 1}),
    LaserTurrets: new ModuleOperation({title: 'Laser Turrets', effects: [{effectType: EffectType.Military, baseValue: 5}], maxXp: 400, gridLoad: 1}),
    FighterSquadron: new ModuleOperation({title: 'Fighter Squadron', effects: [{effectType: EffectType.Military, baseValue: 3}], maxXp: 150, gridLoad: 1}),
    EliteForce: new ModuleOperation({title: 'Elite Force', effects: [{effectType: EffectType.Military, baseValue: 10}], maxXp: 1000, gridLoad: 1}),
};

const moduleComponents = {
    Fuel: new ModuleComponent({title: 'Fuel', operations: [moduleOperations.Garbage, moduleOperations.Diesel]}),
    Products: new ModuleComponent({title: 'Products', operations: [moduleOperations.Plastics, moduleOperations.Steel]}),
    Replication: new ModuleComponent({title: 'Replication', operations: [moduleOperations.QuantumReplicator, moduleOperations.BioGenesisChamber, moduleOperations.NanoFertilityDrones]}),
    Living: new ModuleComponent({title: 'Living', operations: [moduleOperations.HoloCommunityHub, moduleOperations.TemporalBreedingPods]}),
    Turrets: new ModuleComponent({title: 'Turrets', operations: [moduleOperations.BallisticTurrets, moduleOperations.LaserTurrets]}),
    Squads: new ModuleComponent({title: 'Squads', operations: [moduleOperations.FighterSquadron, moduleOperations.EliteForce]}),
};

const modules = {
    Furnace: new Module({title: 'Furnace', components: [moduleComponents.Fuel, moduleComponents.Products]}),
    Hive: new Module({title: 'Hive', components: [moduleComponents.Replication, moduleComponents.Living]}),
    WeaponBay: new Module({title: 'Weapon Bay', components: [moduleComponents.Turrets, moduleComponents.Squads]}),
};

const defaultModules = [
    modules.Furnace
];

/*
const moduleCategories = {
    Fundamentals: new ModuleCategory ({name: 'Fundamentals', headerRowColor: '#55A630', modules: [modules.Furnace]})
}*/

const moduleCategories = {
    Fundamentals: [modules.Furnace],
    Population: [modules.Hive],
    Military: [modules.WeaponBay],
};

const pointsOfInterest = {
    FunkySector: new PointOfInterest({
        title: 'Funky Sector',
        effects: [{effectType: EffectType.Industry, baseValue: 5}, {effectType: EffectType.Danger, baseValue: 10}],
        modifiers: [{modifies: [moduleOperations.QuantumReplicator, moduleOperations.Diesel], from: EffectType.Growth, to: EffectType.Research}]
    }),
    VideoGameLand: new PointOfInterest({
        title: 'Video Game Land',
        effects: [{effectType: EffectType.Military, baseValue: 5}, {effectType: EffectType.Danger, baseValue: 25}],
        modifiers: [{modifies: [moduleOperations.BallisticTurrets, moduleOperations.LaserTurrets], from: EffectType.Military, to: EffectType.Energy}]
    }),
    Gurkenland: new PointOfInterest({
        title: 'Gurkenland',
        effects: [{effectType: EffectType.Growth, baseValue: 5}, {effectType: EffectType.Danger, baseValue: 50}],
        modifiers: [{modifies: [moduleOperations.Plastics], from: EffectType.Industry, to: EffectType.Growth}, {modifies: [moduleOperations.Steel], from: EffectType.Growth, to: EffectType.Industry}]
    }),
};

const sectors = {
    DanceSector: { title: "Dance Sector", content: [pointsOfInterest.FunkySector] },
    NerdSector: { title: "Nerd Sector", content: [pointsOfInterest.VideoGameLand, pointsOfInterest.Gurkenland] },
};

const defaultPointOfInterest = pointsOfInterest.FunkySector;

//Initialize names
for (const [key, module] of Object.entries(moduleOperations)) {
    module.name = key;
    module.baseData.name = key;
}

function assignNames(data) {
    for (const [key, val] of Object.entries(data)) {
        val.name = key;
        val.id = 'row_' + key;
    }
}

assignNames(moduleComponents);
assignNames(modules);
assignNames(moduleCategories);
assignNames(battleBaseData);
assignNames(pointsOfInterest);

const permanentUnlocks = ['Scheduling', 'Shop', 'Automation', 'Quick task display'];

const headerRowColors = {
    'Common generators': '#55A630',
    'Military grade': '#E63946',
    'Fundamentals': '#4A4E69',
    'Combat': '#FF704D',
    'Magic': '#875F9A',
    'Dark magic': '#73000F',
    'Misc': '#B56576',

    DanceSector: '#C71585',
    NerdSector: '#219EBC',
};

const tooltips = {
    Diesel: 'Diesel text.',
    Plastics: 'Plastics text.',
    Steel: 'Steel text',
    Garbage: 'Garbage text',

    'Concentration': 'Improve your learning speed through practising intense concentration activities.',
    'Productivity': 'Learn to procrastinate less at work and receive more job experience per day.',

    'FunkySector': 'Sleep on the uncomfortable, filthy streets while almost freezing to death every night. It cannot get any worse than this.',


    'VideoGameLand': 'A place to write down all your thoughts and discoveries, allowing you to learn a lot more quickly.',

    "Quantum Replicator": "Introducing the 'Quantum Replicator'—the ultimate solution for population growth! This futuristic device uses quantum technology to duplicate individuals, allowing you to rapidly expand your population. With each activation, watch as your society flourishes and thrives. Just remember to keep track of the originals, or you might end up with an army of duplicates!",
    "Bio-Genesis Chamber": "Step into the 'Bio-Genesis Chamber,' where life finds a new beginning! This advanced technology can create life forms from scratch, jump-starting your population growth. Simply input the genetic code and environmental parameters, and within moments, you'll have a thriving population ready to build a bright future. Handle with care; creating life is a profound responsibility!",
    "Neural Uplink Pods": "Elevate your society with 'Neural Uplink Pods'! These cutting-edge pods directly interface with the human brain, allowing individuals to share knowledge and experiences. As your population connects their minds, watch as they collectively become smarter, more creative, and better equipped to solve complex problems. Beware of information overload!",
    "Nano-Fertility Drones": "Meet the 'Nano-Fertility Drones'—tiny, intelligent machines on a mission to boost your population! These nanobots are programmed to enhance fertility rates, making reproduction more efficient than ever before. Whether you're on a distant planet or in a post-apocalyptic world, these drones ensure your population will grow and thrive against all odds.",
    "Holo-Community Hub": "Create a sense of unity with the 'Holo-Community Hub'! This holographic hub provides a virtual meeting space for your population, regardless of physical distance. As individuals gather in the virtual world, they form stronger bonds, leading to increased cooperation, higher birth rates, and a sense of belonging. Just be prepared for some quirky virtual avatars!",
    "Temporal Breeding Pods": "Venture into the temporal realm with 'Temporal Breeding Pods'! These extraordinary chambers manipulate time itself to accelerate the aging process. Individuals placed inside age rapidly, allowing for generations to be born and raised in a fraction of the time. Witness your population skyrocket as you harness the mysteries of time travel!",
    "Eco-Habitat Domes": "Provide a sustainable future with 'Eco-Habitat Domes'! These domes create self-contained ecosystems, perfect for expanding your population on harsh or barren planets. With carefully balanced environments, your people can thrive in these habitats, leading to rapid population growth. Just remember to recycle and maintain the delicate balance of nature!",
    "Viral Growth Serum": "Embrace the 'Viral Growth Serum' and watch your population multiply like never before! This serum, when administered, triggers rapid cell division and reproduction. Within hours, your population will experience exponential growth. Be cautious, though—this viral boost might come with some unexpected side effects!",

    "Time-Warping Goggles": "Slip on these wacky-looking goggles, and you'll be living life in the fast lane! With the power to bend space and time through forbidden techniques, these goggles accelerate your perception of reality. Suddenly, you'll be able to read a whole library in a blink, or cook a week's worth of meals in mere seconds. Just remember, time waits for no one, so use these goggles wisely, or you might find yourself aging at warp speed!",
    "Demon's Discount Card": "Embrace your inner demon with the 'Demon's Discount Card'! This wacky tech allows you to emit a devilish aura that terrifies even the stingiest merchants. They'll be so scared, they'll practically give you their goods for free! Whether you're buying a fancy sapphire charm or a small palace, this card will have merchants begging to give you heavy discounts. Just be careful not to scare away all your friends!",
    "Mega-Productivity Procrastinator": "Tired of procrastinating at work? Enter the 'Mega-Productivity Procrastinator'! This wacky invention will help you conquer your lazy habits and maximize your job experience per day. With a zap of its lasers and a whir of its gears, it keeps you on track, ensuring you complete tasks faster than ever before. Say goodbye to missed deadlines and hello to a more productive you!",
    "Mana-Boosting Muffler": "Wrap yourself in the 'Mana-Boosting Muffler' for a magical experience like no other! This whimsical accessory strengthens your mana channels, turning you into a powerhouse of magical might. With every spell you cast, you'll feel the rush of energy like never before. Who needs to wait years to become a master wizard when you can become a mage sensation overnight?",
    "Super Immortality Serum": "Seeking true immortality? Look no further than the 'Super Immortality Serum'! This bizarre elixir, brewed from ancient, forbidden techniques, will make your lifespan stretch beyond your wildest dreams. With just a drop a day, you'll watch empires rise and fall while you remain ageless. Just remember, with great immortality comes great responsibility – and a ton of birthday candles!",
    "Dark Matter Coin Forge": "Turn your mundane coins into a dark treasure with the 'Dark Matter Coin Forge'! This eerie contraption uses dark magic to multiply the raw matter of the coins you receive from your job. Every coin that passes through it becomes a relic of pure, malevolent wealth. Watch your wealth grow as you trade in your normal coins for their eerie, otherworldly counterparts!",
    "Wacky Thought Translator": "Unleash the power of your thoughts with the 'Wacky Thought Translator'! This peculiar device lets you jot down your wildest ideas, theories, and discoveries at the speed of thought. Say goodbye to writer's block and hello to a world of rapid learning. Whether you're a mage mastering spells or a chairman delving into immortality, this translator will keep up with your wackiest musings!",
    "Homeless-to-Palace Portal": "Tired of freezing on the streets? Step through the 'Homeless-to-Palace Portal' and experience the ultimate upgrade! This fantastical portal instantly transports you from the lowest of lows to the grandest of palaces. It's the perfect solution for those looking to escape the misery of homelessness and bask in the lap of luxury. Just don't forget to invite your fellow beggars for a tour of your new digs!"
};

const layerData = [
    new LayerData('#ffe119'),
    new LayerData('#f58231'),
    new LayerData('#e6194B'),
    new LayerData('#911eb4'),
    new LayerData('#4363d8'),
    new LayerData('#47ff00'),
];

const lastLayerData = new LayerData('#000000');

function createRequirements(getElementsByClass, getTaskElement, getItemElement) {
    return {
        /*
        //Other
        'Arcane energy': new TaskRequirement(getElementsByClass('Arcane energy'), [{task: 'Concentration', requirement: 200}, {task: 'Meditation', requirement: 200}]),
        'Dark magic': new EvilRequirement(getElementsByClass('Dark magic'), [{requirement: 1}]),
        'Shop': new StoredEnergyRequirement([Dom.get().byId('locationTabButton')], [{requirement: gameData.itemData['Tent'].getGridLoad() * 50}]),
        'Rebirth tab': new AgeRequirement([Dom.get().byId('rebirthTabButton')], [{requirement: 25}]),
        'Rebirth note 1': new AgeRequirement([Dom.get().byId('rebirthNote1')], [{requirement: 45}]),
        'Rebirth note 2': new AgeRequirement([Dom.get().byId('rebirthNote2')], [{requirement: 65}]),
        'Rebirth note 3': new AgeRequirement([Dom.get().byId('rebirthNote3')], [{requirement: 200}]),
        'Evil info': new EvilRequirement([Dom.get().byId('evilInfo')], [{requirement: 1}]),
        'Time warping info': new TaskRequirement(getElementsByClass('timeWarping'), [{task: 'Mage', requirement: 10}]),
        'Automation': new AgeRequirement([Dom.get().byId('automation')], [{requirement: 20}]),
        'Quick task display': new AgeRequirement(getElementsByClass('quickTaskDisplay'), [{requirement: 20}]),
        */

        //Common generators
        //'Beggar': new TaskRequirement([getTaskElement('Beggar')], []),
        //'Farmer': new TaskRequirement([getTaskElement('Farmer')], [{task: 'Beggar', requirement: 10}]),
        /*
        'Fisherman': new TaskRequirement([getTaskElement('Fisherman')], [{task: 'Farmer', requirement: 10}]),
        'Miner': new TaskRequirement([getTaskElement('Miner')], [{task: 'Strength', requirement: 10}, {task: 'Fisherman', requirement: 10}]),
        'Blacksmith': new TaskRequirement([getTaskElement('Blacksmith')], [{task: 'Strength', requirement: 30}, {task: 'Miner', requirement: 10}]),
        'Merchant': new TaskRequirement([getTaskElement('Merchant')], [{task: 'Bargaining', requirement: 50}, {task: 'Blacksmith', requirement: 10}]),
*/
        //Military
        /*
        'Squire': new TaskRequirement([getTaskElement('Squire')], [{task: 'Strength', requirement: 5}]),
        'Footman': new TaskRequirement([getTaskElement('Footman')], [{task: 'Strength', requirement: 20}, {task: 'Squire', requirement: 10}]),
        'Veteran footman': new TaskRequirement([getTaskElement('Veteran footman')], [{task: 'Battle tactics', requirement: 40}, {task: 'Footman', requirement: 10}]),
        'Knight': new TaskRequirement([getTaskElement('Knight')], [{task: 'Strength', requirement: 100}, {task: 'Veteran footman', requirement: 10}]),
        'Veteran knight': new TaskRequirement([getTaskElement('Veteran knight')], [{task: 'Battle tactics', requirement: 150}, {task: 'Knight', requirement: 10}]),
        'Elite knight': new TaskRequirement([getTaskElement('Elite knight')], [{task: 'Strength', requirement: 300}, {task: 'Veteran knight', requirement: 10}]),
        'Holy knight': new TaskRequirement([getTaskElement('Holy knight')], [{task: 'Mana control', requirement: 500}, {task: 'Elite knight', requirement: 10}]),
        'Legendary knight': new TaskRequirement([getTaskElement('Legendary knight')], [{task: 'Mana control', requirement: 1000}, {task: 'Battle tactics', requirement: 1000}, {task: 'Holy knight', requirement: 10}]),
/*
        //The Arcane Association
        'Student': new TaskRequirement([getTaskElement('Student')], [{task: 'Concentration', requirement: 200}, {task: 'Meditation', requirement: 200}]),
        'Apprentice mage': new TaskRequirement([getTaskElement('Apprentice mage')], [{task: 'Mana control', requirement: 400}, {task: 'Student', requirement: 10}]),
        'Mage': new TaskRequirement([getTaskElement('Mage')], [{task: 'Mana control', requirement: 700}, {task: 'Apprentice mage', requirement: 10}]),
        'Wizard': new TaskRequirement([getTaskElement('Wizard')], [{task: 'Mana control', requirement: 1000}, {task: 'Mage', requirement: 10}]),
        'Master wizard': new TaskRequirement([getTaskElement('Master wizard')], [{task: 'Mana control', requirement: 1500}, {task: 'Wizard', requirement: 10}]),
        'Chairman': new TaskRequirement([getTaskElement('Chairman')], [{task: 'Mana control', requirement: 2000}, {task: 'Master wizard', requirement: 10}]),
*/
        //Fundamentals
        //'Bargaining': new TaskRequirement([getTaskElement('Bargaining')], [{task: 'Concentration', requirement: 20}]),
        /*
        'Meditation': new TaskRequirement([getTaskElement('Meditation')], [{task: 'Concentration', requirement: 30}, {task: 'Productivity', requirement: 20}]),

        //Combat
        'Strength': new TaskRequirement([getTaskElement('Strength')], []),
        'Battle tactics': new TaskRequirement([getTaskElement('Battle tactics')], [{task: 'Concentration', requirement: 20}]),
        'Muscle memory': new TaskRequirement([getTaskElement('Muscle memory')], [{task: 'Concentration', requirement: 30}, {task: 'Strength', requirement: 30}]),

        //Magic
        'Mana control': new TaskRequirement([getTaskElement('Mana control')], [{task: 'Concentration', requirement: 200}, {task: 'Meditation', requirement: 200}]),
        'Immortality': new TaskRequirement([getTaskElement('Immortality')], [{task: 'Apprentice mage', requirement: 10}]),
        'Time warping': new TaskRequirement([getTaskElement('Time warping')], [{task: 'Mage', requirement: 10}]),
        'Super immortality': new TaskRequirement([getTaskElement('Super immortality')], [{task: 'Chairman', requirement: 1000}]),

        //Dark magic
        'Dark influence': new EvilRequirement([getTaskElement('Dark influence')], [{requirement: 1}]),
        'Evil control': new EvilRequirement([getTaskElement('Evil control')], [{requirement: 1}]),
        'Intimidation': new EvilRequirement([getTaskElement('Intimidation')], [{requirement: 1}]),
        'Demon training': new EvilRequirement([getTaskElement('Demon training')], [{requirement: 25}]),
        'Blood meditation': new EvilRequirement([getTaskElement('Blood meditation')], [{requirement: 75}]),
        'Demon\'s wealth': new EvilRequirement([getTaskElement('Demon\'s wealth')], [{requirement: 500}]),
*/
        //Properties
        FunkySector: new GridStrengthRequirement([getItemElement('FunkySector')], [{requirement: 0}]),
        /*
        'Tent': new StoredEnergyRequirement([getPointOfInterestElement('Tent')], [{requirement: 0}]),
        'Wooden hut': new StoredEnergyRequirement([getPointOfInterestElement('Wooden hut')], [{requirement: gameData.itemData['Wooden hut'].getGridLoad() * 100}]),
        'Cottage': new StoredEnergyRequirement([getPointOfInterestElement('Cottage')], [{requirement: gameData.itemData['Cottage'].getGridLoad() * 100}]),
        'House': new StoredEnergyRequirement([getPointOfInterestElement('House')], [{requirement: gameData.itemData['House'].getGridLoad() * 100}]),
        'Large house': new StoredEnergyRequirement([getPointOfInterestElement('Large house')], [{requirement: gameData.itemData['Large house'].getGridLoad() * 100}]),
        'Small palace': new StoredEnergyRequirement([getPointOfInterestElement('Small palace')], [{requirement: gameData.itemData['Small palace'].getGridLoad() * 100}]),
        'Grand palace': new StoredEnergyRequirement([getPointOfInterestElement('Grand palace')], [{requirement: gameData.itemData['Grand palace'].getGridLoad() * 100}]),
*/
        //Misc
        VideoGameLand: new GridStrengthRequirement([getItemElement('VideoGameLand')], [{requirement: 0}]),
        Gurkenland: new GridStrengthRequirement([getItemElement('Gurkenland')], [{requirement: 0}]),
        /*
        'Dumbbells': new StoredEnergyRequirement([getPointOfInterestElement('Dumbbells')], [{requirement: gameData.itemData['Dumbbells'].getGridLoad() * 100}]),
        'Personal squire': new StoredEnergyRequirement([getPointOfInterestElement('Personal squire')], [{requirement: gameData.itemData['Personal squire'].getGridLoad() * 100}]),
        'Steel longsword': new StoredEnergyRequirement([getPointOfInterestElement('Steel longsword')], [{requirement: gameData.itemData['Steel longsword'].getGridLoad() * 100}]),
        'Butler': new StoredEnergyRequirement([getPointOfInterestElement('Butler')], [{requirement: gameData.itemData['Butler'].getGridLoad() * 100}]),
        'Sapphire charm': new StoredEnergyRequirement([getPointOfInterestElement('Sapphire charm')], [{requirement: gameData.itemData['Sapphire charm'].getGridLoad() * 100}]),
        'Study desk': new StoredEnergyRequirement([getPointOfInterestElement('Study desk')], [{requirement: gameData.itemData['Study desk'].getGridLoad() * 100}]),
        'Library': new StoredEnergyRequirement([getPointOfInterestElement('Library')], [{requirement: gameData.itemData['Library'].getGridLoad() * 100}]),
   */
    };
}

function addMultipliers() {
    for (let taskName in gameData.taskData) {
        const task = gameData.taskData[taskName];

        task.xpMultipliers = [];
        if (task instanceof Job) {
            task.energyGenerationMultipliers = [];
        }

        task.collectEffects();
    }

    for (let itemName in gameData.itemData) {
        const item = gameData.itemData[itemName];
        item.expenseMultipliers = [];
        item.collectEffects();
    }
}

function setCustomEffects() {
    const bargaining = gameData.taskData['Bargaining'];
    bargaining.getEffect = function () {
        let multiplier = 1 - getBaseLog(7, bargaining.level + 1) / 10;
        if (multiplier < 0.1) {
            multiplier = 0.1;
        }
        return multiplier;
    };

    const intimidation = gameData.taskData['Intimidation'];
    intimidation.getEffect = function () {
        let multiplier = 1 - getBaseLog(7, intimidation.level + 1) / 10;
        if (multiplier < 0.1) {
            multiplier = 0.1;
        }
        return multiplier;
    };

    const timeWarping = gameData.taskData['Time warping'];
    timeWarping.getEffect = function () {
        return 1 + getBaseLog(13, timeWarping.level + 1);
    };

    const immortality = gameData.taskData['Immortality'];
    immortality.getEffect = function () {
        return 1 + getBaseLog(33, immortality.level + 1);
    };
}
