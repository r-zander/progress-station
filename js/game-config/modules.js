'use strict';

/**
 * @type {Object<ModuleOperation>}
 */
const moduleOperations = {};
moduleOperations.StandbyGenerator = new ModuleOperation({
    title: 'Standby Generator', maxXp: 20, gridLoad: 0, xpGain: 10,
    description: 'The ole reliable of power sources. It may grumble and spew smoke, but it\'ll keep the lights on when all else fails.',
    effects: [{effectType: EffectType.Energy, baseValue: 0.5}],
});
moduleOperations.FourDPrinter = new ModuleOperation({
    title: '4D Printer', maxXp: 35, gridLoad: 1, xpGain: 10,
    description: 'Prints anything from spare parts to midnight snacks. Adds a dimension of convenience to survival.',
    effects: [{effectType: EffectType.Industry, baseValue: 0.05}],
});

moduleOperations.PocketLaboratory = new ModuleOperation({
    title: 'Pocket Laboratory', maxXp: 70, gridLoad: 1, xpGain: 10,
    description: 'Studying is for dweebs, but shiny new tech is cool.',
    effects: [{effectType: EffectType.Research, baseValue: 0.50}],
});
moduleOperations.MicroCyborgAutomat = new ModuleOperation({
    title: 'Micro Cyborg Automat', maxXp: 140, gridLoad: 1, xpGain: 10,
    description: 'A handy box that produces little helpers at the press of a button.',
    effects: [{effectType: EffectType.Growth, baseValue: 0.10}], // Not a factor as the player doesn't have military yet
});
// TODO rename according to title + write migration
moduleOperations.KungFuManual = new ModuleOperation({
    title: 'Core Blade', maxXp: 200, gridLoad: 1, xpGain: 10,
    description: 'The weapon of choice for the true captain. When you wield it, the station\'s armaments move as if mirroring your every action.',
    effects: [{effectType: EffectType.Military, baseValue: 0.10}], // Not a factor as the player doesn't have military yet
});

// Mining
moduleOperations.SpaceRocks = new ModuleOperation({
    title: 'Space Rocks', maxXp: 100, gridLoad: 1,
    description: 'Space seems to be filled with either nothingness or those rocks.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.01}]
});
moduleOperations.HeavyGlitz = new ModuleOperation({
    title: 'Heavy Glitz', maxXp: 2_000, gridLoad: 2,
    description: 'It\'s shiny, it conducts sparks, it\'s surprisingly heavy and hard.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.02}],
});
/** Galactic Secret */
moduleOperations.Radiance = new ModuleOperation({
    title: 'Radiance', maxXp: 20_000, gridLoad: 4,
    description: 'Tingles in your hand but glows in the dark. Even heavier than the regular glitz.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.05}, {effectType: EffectType.ResearchFactor, baseValue: 0.05}],
});

moduleOperations.BigSpinny = new ModuleOperation({
    title: 'The Big Spinny', maxXp: 200, gridLoad: 1,
    description: 'Simple yet effective. Once it starts spinning space rocks and enemies alike fear for their well-being.',
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.01}],
});
moduleOperations.AsteroidChomper = new ModuleOperation({
    title: 'Asteroid Chomper', maxXp: 4_000, gridLoad: 2,
    description: 'A significant upgrade in mining tech, this beast chews through smaller asteroids with ease, turning rocks into progress and enemies into tomato mist.',
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.02}],
});
/** Galactic Secret */
moduleOperations.TenDrills = new ModuleOperation({
    title: 'TenDrills', maxXp: 40_000, gridLoad: 4,
    description: 'Mechanical or organic? Are those 10 drills or actually tentacles?!',
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.06}, {effectType: EffectType.IndustryFactor, baseValue: 0.05}],
});

// Growth
moduleOperations.AlgaePod = new ModuleOperation({
    title: 'Algae Pod', maxXp: 400, gridLoad: 1,
    description: 'Feed your crew with lab grown algae, keeping them alive but not necessarily happy.',
    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.01}],
});
moduleOperations.Greenhouse = new ModuleOperation({
    title: 'Greenhouse', maxXp: 4_000, gridLoad: 2,
    description: 'Simulating good old Terra, a place for plants and crops to thrive.',
    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.02}],
});
/** Galactic Secret */
moduleOperations.BossFertilizer = new ModuleOperation({
    title: 'Boss Fertilizer', maxXp: 40_000, gridLoad: 4,
    description: 'Let\'s face it, it\'s alien poop.',
    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.04}],
});
// Research
moduleOperations.FermentationTank = new ModuleOperation({
    title: 'Fermentation Tank', maxXp: 800, gridLoad: 1,
    description: 'Observing fermentation leads to grand discoveries. And much more importantly: fizzy drinks.',
    effects: [{effectType: EffectType.ResearchFactor, baseValue: 0.01}],
});
moduleOperations.ArtificialEcosystem = new ModuleOperation({
    title: 'Artificial Ecosystem', maxXp: 8_000, gridLoad: 2,
    description: 'Don\'t wait for evolution, make it happen!.',
    effects: [{effectType: EffectType.ResearchFactor, baseValue: 0.03}],
});
/** Galactic Secret */
moduleOperations.PlasmidSequencer = new ModuleOperation({
    title: 'Plasmid Sequencer', maxXp: 80_000, gridLoad: 4,
    description: 'Bend life to your will and discover what lies behind the curtain.',
    effects: [{effectType: EffectType.ResearchFactor, baseValue: 0.08}],
});

// Furnace
moduleOperations.Garbage = new ModuleOperation({
    title: 'Garbage', maxXp: 500, gridLoad: 1,
    description: 'Just garbage, crawling with vent rats and station roaches. It\'s neither efficient nor sustainable, but it smells even worse.',
    effects: [{effectType: EffectType.Energy, baseValue: 1}],
});
moduleOperations.Diesel = new ModuleOperation({
    title: 'Diesel', maxXp: 2_000, gridLoad: 2,
    description: 'An ancient fuel, so you can feel like an honest space trucker.',
    effects: [{effectType: EffectType.Energy, baseValue: 3}],
});
moduleOperations.SmellyJelly = new ModuleOperation({
    title: 'Smelly Jelly', maxXp: 20_000, gridLoad: 4,
    description: 'People often argue about the scent of this highly concentrated jet fuel. Its potent aroma is adored by some, stomach-churning for most.',
    effects: [{effectType: EffectType.Energy, baseValue: 9}],
});
/** Galactic Secret */
moduleOperations.Quasarite = new ModuleOperation({
    title: 'Quasarite', maxXp: 80_000, gridLoad: 8,
    description: 'Remnants of a distant quasar explosion. Otherworldly amounts of energy, please handle with care.',
    effects: [{effectType: EffectType.Energy, baseValue: 20}, {effectType: EffectType.IndustryFactor, baseValue: 0.05}, ],
});

moduleOperations.Plastics = new ModuleOperation({
    title: 'Plastics', maxXp: 1_000, gridLoad: 2,
    description: 'Plastics can be anything and are everywhere, even inside your body.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.01}],
});
moduleOperations.Steel = new ModuleOperation({
    title: 'Steel', maxXp: 4_000, gridLoad: 4,
    description: 'Whether you need to outfit your troops with armor or want to build new living quarters, you can rely on steel.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.02}],
});
moduleOperations.Bouncium = new ModuleOperation({
    title: 'Bouncium', maxXp: 20_000, gridLoad: 6,
    description: 'Want a metal that possesses the properties of highly flexible rubber? Bouncium is where it\'s at.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.04}],
});
/** Galactic Secret */
moduleOperations.MicroalloyGlass = new ModuleOperation({
    title: 'Microalloy Glass', maxXp: 80_000, gridLoad: 10,
    description: 'One thousand times as hard as steel, but so clear that you could call it invisible.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.08}, {effectType: EffectType.Research, baseValue: 0.50}],
});

//Military
moduleOperations.GlitzPlating = new ModuleOperation({
    title: 'Glitz Plating', maxXp: 2_000, gridLoad: 1,
    description: 'Tougher than a Comet Crawler\'s shell, this armor resists most of galaxy\'s temper.',
    effects: [{effectType: EffectType.EnergyFactor, baseValue: 0.01}],
});
moduleOperations.NanoHardener = new ModuleOperation({
    title: 'Nano Hardener', maxXp: 8_000, gridLoad: 2,
    description: 'Active Nano Robots that make the armor layer one of the hardest materials in the galaxy.',
    effects: [{effectType: EffectType.EnergyFactor, baseValue: 0.03}],
});
moduleOperations.PulseShield = new ModuleOperation({
    title: 'Pulse Shield', maxXp: 32_000, gridLoad: 4,
    description: 'A shimmering barrier that guards against incoming threats and sends projectiles back from where they came.',
    effects: [{effectType: EffectType.EnergyFactor, baseValue: 0.08}],
});
/** Galactic Secret */
moduleOperations.BulletSponge = new ModuleOperation({
    title: 'Bullet Sponge', maxXp: 80_000, gridLoad: 10,
    description:'Alien tissue named appropriately for it\'s ability to absorb even the toughest hits',
    effects: [{effectType: EffectType.EnergyFactor, baseValue: 0.16}],
});

moduleOperations.RapidRumbleTower = new ModuleOperation({
    title: 'Rapid Rumble Tower', maxXp: 4_000, gridLoad: 3,
    description: 'These turrets will quickly fill the vacuum of space with lead and your enemies with holes.',
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.01}],
});
moduleOperations.LaserTurrets = new ModuleOperation({
    title: 'Laser Turrets', maxXp: 20_000, gridLoad: 6,
    description: 'Highly precise and devastatingly destructive. Even space ants fear the final form of the magnifying glass.',
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.03}],
});
moduleOperations.AntiMaterialSwarm = new ModuleOperation({
    title: 'Anti-Material Swarm', maxXp: 80_000, gridLoad: 10,
    description: 'A cloud of alien defenders swarming around the station, tearing through incoming missiles and ripping hulls to shreds.',
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.10}],
});

// Population
moduleOperations.Survivors = new ModuleOperation({
    title: 'Pick up survivors', maxXp: 4_000, gridLoad: 1,
    description: 'Space is vast, but you’re not leaving anyone behind. Rescue survivors to add their skills and stories to your crew.',
    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.01}],
});
moduleOperations.Recruitment = new ModuleOperation({
    title: 'Recruitment', maxXp: 16_000, gridLoad: 2,
    description: 'Broadcast a message across the stars and recruit willing and capable crewmates.',
    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.03}],
});
moduleOperations.MechanoMaker = new ModuleOperation({
    title: 'Mechano Maker', maxXp: 64_000, gridLoad: 8,
    description: 'Why wait for nature, when you can assemble new, mechanical crewmates all by yourself.',
    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.20}],
});
/** Galactic Secret */
moduleOperations.ReplicationChambers = new ModuleOperation({
    title: 'Replication Chambers', maxXp: 500_000, gridLoad: 12,
    description: 'Cloning crewmates is pretty easy. You found the secret to having them survive for more than an hour.',
    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.30}, {effectType: EffectType.Industry, baseValue: 0.50}],
});

moduleOperations.UnitedbyPurpose = new ModuleOperation({
    title: 'United by Purpose', maxXp: 8_000, gridLoad: 2,
    description: 'Organics and Mechanics can agree: When the stations dies, everyone dies.',
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.01}],
});
moduleOperations.UnitedForVictory = new ModuleOperation({
    title: 'United For Victory', maxXp: 32_000, gridLoad: 4,
    description: 'Strength in unity, victory through collaboration. This doctrine binds the crew as one, turning collective will into unstoppable force.',
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.03}],
});
/** Galactic Secret */
moduleOperations.GloryToTheGreatHeroes = new ModuleOperation({
    title: 'Glory to the Great Heroes', maxXp: 320_000, gridLoad: 10,
    description: 'Heroes inspire, their legends propel us forward. This principle celebrates extraordinary feats, encouraging all to reach beyond the stars.',
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.20}, {effectType: EffectType.Growth, baseValue: 0.50}],
});


/**
 * @type {Object<ModuleComponent>}
 */
const moduleComponents = {
    JumpStarter: new ModuleComponent({
        title: 'Jump Starter',
        description: 'It zaps stuff back to life!',
        operations: [moduleOperations.StandbyGenerator, moduleOperations.FourDPrinter],
    }),
    CaptainsFocus: new ModuleComponent({
        title: 'Captain\'s Focus',
        description: 'We are in far far future, but you still only have two hands.',
        operations: [moduleOperations.PocketLaboratory, moduleOperations.MicroCyborgAutomat, moduleOperations.KungFuManual],
    }),

    MinedResource: new ModuleComponent({
        title: 'Mined Resource',
        description: 'The foundation for station expansion. From common rocks to exotic minerals, each resource fuels progress and prosperity.',
        operations: [moduleOperations.SpaceRocks, moduleOperations.HeavyGlitz, moduleOperations.Radiance]
    }),
    Drill: new ModuleComponent({
        title: 'Drill',
        description: 'It\'s big. It spins. It can be used against enemies in a pinch.',
        operations: [moduleOperations.BigSpinny, moduleOperations.AsteroidChomper, moduleOperations.TenDrills]
    }),

    Agriculture: new ModuleComponent({
        title: 'Agriculture',
        description: 'Farming is honest work. Even more so in space.',
        operations: [moduleOperations.AlgaePod, moduleOperations.Greenhouse, moduleOperations.BossFertilizer]
    }),
    TheLab: new ModuleComponent({
        title: 'The Lab',
        description: 'Entry forbidden for people under 120 IQ. Sorry Sir, no exceptions.',
        operations: [moduleOperations.FermentationTank, moduleOperations.ArtificialEcosystem, moduleOperations.PlasmidSequencer]
    }),

    Fuel: new ModuleComponent({
        title: 'Fuel',
        description: 'The lifeblood of the station allows all systems to run, machinery to hum and keeps the lights on.',
        operations: [moduleOperations.Garbage, moduleOperations.Diesel, moduleOperations.SmellyJelly, moduleOperations.Quasarite],
    }),
    Products: new ModuleComponent({
        title: 'Products',
        description: 'Transmuting raw resources into vital materials. Whether it\'s for construction or commerce, the furnace forges the foundation of expansion.',
        operations: [moduleOperations.Plastics, moduleOperations.Steel, moduleOperations.Bouncium, moduleOperations.MicroalloyGlass],
    }),

    Protection: new ModuleComponent({
        title: 'Protection',
        description: 'The defense against all the dangers out there. Become a fortress among the stars!',
        operations: [moduleOperations.GlitzPlating, moduleOperations.NanoHardener, moduleOperations.PulseShield, moduleOperations.BulletSponge],
    }),
    Turrets: new ModuleComponent({
        title: 'Turrets',
        description: 'Turrets deliver superior firepower, allowing you to go on the offensive to destroy all foes and repel aggressive invaders.',
        operations: [moduleOperations.RapidRumbleTower, moduleOperations.LaserTurrets, moduleOperations.AntiMaterialSwarm],
    }),

    CrewExpansion: new ModuleComponent({
        title: 'Crew Expansion',
        description: 'If you\'re not growing, you are dying.\n',
        operations: [moduleOperations.Survivors, moduleOperations.Recruitment, moduleOperations.MechanoMaker, moduleOperations.ReplicationChambers],
    }),
    Doctrine: new ModuleComponent({
        title: 'Doctrine',
        description: 'Educate your crew, form their ethos and shape their spirit to prepare them for the battlefield.',
        operations: [moduleOperations.UnitedbyPurpose, moduleOperations.UnitedForVictory, moduleOperations.GloryToTheGreatHeroes],
    }),
};

/**
 * @type {Object<Module>}
 */
const modules = {
    RescueCapsule: new Module({
        title: 'Rescue Capsule',
        description: 'A tiny escape pod, just big enough to house a single person, allowing you to flee the station as a last resort.',
        components: [moduleComponents.JumpStarter],
    }),
    CommandCenter: new Module({
        title: 'Command Center', // Bridge?
        description: 'A place where impactful decisions are made, destinies shaped and large amounts of vaporized caffeine consumed.',
        components: [moduleComponents.CaptainsFocus],
    }),
    MiningBay: new Module({
        title: 'Mining Bay',
        description: 'For some, space is vast and empty. For others, its the greatest treasure trove there is.',
        components: [moduleComponents.MinedResource, moduleComponents.Drill],
    }),
    BiotechDome: new Module({
        title: 'Biotech Dome',
        description: 'A controlled ecosystem where life is cultivated and knowledge grows.',
        components: [moduleComponents.Agriculture, moduleComponents.TheLab],
    }),
    Furnace: new Module({
        title: 'Furnace Module',
        description: 'The beating heart of industry, transforming raw into refined and ordinary into extraordinary. The forge of future tech.',
        components: [moduleComponents.Fuel, moduleComponents.Products],
    }),
    Defensive: new Module({
        title: 'Defensive Module',
        description: 'The station\'s sword and shield. Whether repelling invaders or standing guard, peace is made by those prepared for war.',
        components: [moduleComponents.Protection, moduleComponents.Turrets],
    }),
    Quarters: new Module({
        title: 'Quarters Module',
        description: 'A home among the stars. From the hum of daily life to the legends of immortal warriors, every soul contributes to the journey.',
        components: [moduleComponents.CrewExpansion, moduleComponents.Doctrine],
    }),
};

const defaultModules = [
    modules.RescueCapsule
];

/**
 * @type {Object<ModuleCategory>}
 */
const moduleCategories = {
    StationCore: new ModuleCategory({
        title: 'Station Core',
        modules: [
            modules.RescueCapsule,
            modules.CommandCenter,
            modules.MiningBay,
            modules.BiotechDome,
            modules.Furnace,
            modules.Defensive,
            modules.Quarters
        ],
    }),
};
