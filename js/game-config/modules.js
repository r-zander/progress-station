'use strict';

/**
 * @type {Object<ModuleOperation>}
 */
const moduleOperations = {};
moduleOperations.StandbyGenerator = new ModuleOperation({
    title: 'Standby Generator', maxXp: 50, gridLoad: 0,
    description: 'The ole reliable of power sources. It may grumble and spew smoke, but it\'ll keep the lights on when all else fails.',
    effects: [{effectType: EffectType.Energy, baseValue: 0.5}],
});
moduleOperations.FourDPrinter = new ModuleOperation({
    title: '4D Printer', maxXp: 50, gridLoad: 1,
    description: 'Prints anything from spare parts to midnight snacks. Adds a dimension of convenience to survival.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.01}],
});
moduleOperations.MicroCyborgAutomat = new ModuleOperation({
    title: 'Micro Cyborg Automat', maxXp: 100, gridLoad: 1,
    description: 'A handy box that produces little helpers at the press of a button.',
    effects: [{effectType: EffectType.Growth, baseValue: 0.10}], // Not a factor as the player doesn't have military yet
});
moduleOperations.KungFuManual = new ModuleOperation({
    title: 'Kung Fu Manual', maxXp: 200, gridLoad: 1,
    description: 'Martial arts made easy for the space traveler that does not shy away from space encounters.',
    effects: [{effectType: EffectType.Military, baseValue: 0.10}], // Not a factor as the player doesn't have military yet
});
moduleOperations.PocketLaboratory = new ModuleOperation({
    title: 'Pocket Laboratory', maxXp: 400, gridLoad: 1,
    description: 'A lab that fits in your pocket, for when you need to science the heck out of something on the go.',
    effects: [{effectType: EffectType.ResearchFactor, baseValue: 0.01}],
});

// Mining
moduleOperations.SpaceRocks = new ModuleOperation({
    title: 'Space Rocks', maxXp: 100, gridLoad: 1,
    description: 'Space seems to be filled with either nothingness or those rocks.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.01}]
});
moduleOperations.HeavyGlitz = new ModuleOperation({
    title: 'Heavy Glitz', maxXp: 500, gridLoad: 2,
    description: 'It\'s shiny, it conducts sparks, it\'s surprisingly heavy and hard.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.02}],
});
/** Galactic Secret */
moduleOperations.Radiance = new ModuleOperation({
    title: 'Radiance', maxXp: 5_000, gridLoad: 4,
    description: 'Tingles in your hand but glows in the dark. Even heavier than the regular glitz.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.03}, {effectType: EffectType.ResearchFactor, baseValue: 0.02}],
});

moduleOperations.BigSpinny = new ModuleOperation({
    title: 'The Big Spinny', maxXp: 200, gridLoad: 1,
    description: 'Primitive yet effective, this drill spins into action with relentless determination, making short work of the most stubborn space rocks.',
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.01}],
});
moduleOperations.AsteroidChomper = new ModuleOperation({
    title: 'Asteroid Chomper', maxXp: 1_000, gridLoad: 2,
    description: 'A significant upgrade in mining tech, this beast chews through smaller planetoids with ease, turning mountains into molehills and rocks into progress.',
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.02}],
});
/** Galactic Secret */
moduleOperations.TenDrills = new ModuleOperation({
    title: 'TenDrills', maxXp: 10_000, gridLoad: 4,
    description: 'Alien tentacles, able to consume celestial bodies, turning them into perfectly refined resources.',
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.03}, {effectType: EffectType.IndustryFactor, baseValue: 0.02}],
});

// Furnace
moduleOperations.Garbage = new ModuleOperation({
    title: 'Garbage', maxXp: 500, gridLoad: 1,
    description: 'It\'s not about efficiency, it\'s about sustainability. Or just getting rid of all that trash lying around the station.',
    effects: [{effectType: EffectType.Energy, baseValue: 1}],
});
moduleOperations.Diesel = new ModuleOperation({
    title: 'Diesel', maxXp: 1_000, gridLoad: 2,
    description: 'From the depths of fossilized relics to the pulse of synthesized organics, it\'s the timeless heart that beats in the mechanical chest of progress.',
    effects: [{effectType: EffectType.Energy, baseValue: 2}],
});
moduleOperations.FuelT3 = new ModuleOperation({
    title: 'Smelly Jelly', maxXp: 2_000, gridLoad: 4,
    description: 'Super-concentrated jet fuel, thanks to Neptunium\'s kick. Beware: its potent aroma is adored by some, stomach-churning for most.',
    effects: [{effectType: EffectType.Energy, baseValue: 4}],
});
/** Galactic Secret */
moduleOperations.Quasarite = new ModuleOperation({
    title: 'Quasarite', maxXp: 20_000, gridLoad: 8,
    description: 'Harnessed from the remnants of distant quasar explosions it pulses with mind-boggling energy. ' +
        'Its otherworldly properties enhance resource production but require careful containment to avoid unpredictable reactions.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.05}, {effectType: EffectType.Energy, baseValue: 8}],
});

moduleOperations.Plastics = new ModuleOperation({
    title: 'Plastics', maxXp: 1_000, gridLoad: 2,
    description: 'It can be like, molded into anything. Stretchy, sturdy - this stuff does it all!',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.01}],
});
moduleOperations.Steel = new ModuleOperation({
    title: 'Steel', maxXp: 2_000, gridLoad: 4,
    description: 'Super tough stuff, dude! Like, armor for your space castle or sword for cosmic dragon slaying.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.02}],
});
moduleOperations.ProductsT3 = new ModuleOperation({
    title: 'Bouncium', maxXp: 4_000, gridLoad: 6,
    description: 'The rubbery metal that laughs at gravity. Perfect for when you need your gear to bounce back, literally.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.03}],
});
/** Galactic Secret */
moduleOperations.MicroalloyGlass = new ModuleOperation({
    title: 'Microalloy Glass', maxXp: 40_000, gridLoad: 10,
    description: 'Fifteen times harder than steel and so clear that objects made out of pure microalloy glass can be considered invisible.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.05}, {effectType: EffectType.Research, baseValue: 3}],
});

//Military
moduleOperations.GlitzPlating = new ModuleOperation({
    title: 'Glitz Plating', maxXp: 2_000, gridLoad: 1,

    effects: [{effectType: EffectType.EnergyFactor, baseValue: 0.01}],
});
moduleOperations.PulseShield = new ModuleOperation({
    title: 'Pulse Shield', maxXp: 4_000, gridLoad: 2,

    effects: [{effectType: EffectType.EnergyFactor, baseValue: 0.02}],
});
moduleOperations.BulletSponge = new ModuleOperation({
    title: 'Bullet Sponge', maxXp: 8_000, gridLoad: 4,

    effects: [{effectType: EffectType.EnergyFactor, baseValue: 0.03}],
});

moduleOperations.RapidRumbleTower = new ModuleOperation({
    title: 'Rapid Rumble Tower', maxXp: 4_000, gridLoad: 3,

    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.01}],
});
moduleOperations.LaserTurrets = new ModuleOperation({
    title: 'Laser Turrets', maxXp: 8_000, gridLoad: 6,

    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.02}],
});
moduleOperations.AntiMissileSwarm = new ModuleOperation({
    title: 'Anti-Missile Swarm', maxXp: 16_000, gridLoad: 10,

    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.03}],
});

//Population
moduleOperations.Survivors = new ModuleOperation({
    title: 'Pick up survivors', maxXp: 4_000, gridLoad: 1,

    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.01}],
});
moduleOperations.Recruitment = new ModuleOperation({
    title: 'Recruitment', maxXp: 8_000, gridLoad: 2,

    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.02}],
});
moduleOperations.SmoochSanctuary = new ModuleOperation({
    title: 'Smooch Sanctuary', maxXp: 16_000, gridLoad: 4,

    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.03}],
});
moduleOperations.MechanoMaker = new ModuleOperation({
    title: 'Mechano Maker', maxXp: 32_000, gridLoad: 8,
    description: 'Unless you dig deeply into it, you won\'t be able to distinguish those androids from organic humanoids.',
    effects: [{effectType: EffectType.Growth, baseValue: 0.04}],
});
/** Galactic Secret */
moduleOperations.ReplicationChambers = new ModuleOperation({
    title: 'Replication Chambers', maxXp: 320_000, gridLoad: 12,
    description: 'Where life finds a new beginning! This advanced technology can create life forms from scratch, jump-starting your population growth. Simply input the genetic code and environmental parameters, and within moments, you\'ll have a thriving population ready to build a bright future. Handle with care; creating life is a profound responsibility!',
    // description: 'Introducing the \'Quantum Replicator\'—the ultimate solution for population growth! This futuristic device uses quantum technology to duplicate individuals, allowing you to rapidly expand your population. With each activation, watch as your society flourishes and thrives. Just remember to keep track of the originals, or you might end up with an army of duplicates!',
    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.05}, {effectType: EffectType.ResearchFactor, baseValue: 0.03}],
});

moduleOperations.ToughLife = new ModuleOperation({
    title: 'Tough Life', maxXp: 8_000, gridLoad: 2,

    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.01}],
});
moduleOperations.IndividualRooms = new ModuleOperation({
    title: 'Individual Rooms', maxXp: 16_000, gridLoad: 4,

    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.02}],
});
moduleOperations.WayOfLifeT3 = new ModuleOperation({
    title: 'WAY OF LIFE TIER III', maxXp: 32_000, gridLoad: 6,

    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.03}],
});
/** Galactic Secret */
moduleOperations.SecretWayOfLife = new ModuleOperation({
    title: 'SECRET WAY OF LIFE TIER', maxXp: 320_000, gridLoad: 10,

    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.05}, {effectType: EffectType.GrowthFactor, baseValue: 0.03}],
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
        description: 'This compact kit contains everything a captain needs to get the station up and running.',
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
    Protection: new ModuleComponent({
        title: 'Protection',

        operations: [moduleOperations.GlitzPlating, moduleOperations.PulseShield, moduleOperations.BulletSponge],
    }),
    Turrets: new ModuleComponent({
        title: 'Turrets',

        operations: [moduleOperations.RapidRumbleTower, moduleOperations.LaserTurrets, moduleOperations.AntiMissileSwarm],
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
    }),
    MiningBay: new Module({
        title: 'Mining Bay',

        components: [moduleComponents.MinedResource, moduleComponents.Drill],
    }),
    Furnace: new Module({
        title: 'Furnace Module',
        description: '',
        components: [moduleComponents.Fuel, moduleComponents.Products],
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
