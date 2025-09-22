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
    effects: [{effectType: EffectType.Industry, baseValue: 0.05}],
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
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.05}, {effectType: EffectType.ResearchFactor, baseValue: 0.05}],
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
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.06}, {effectType: EffectType.IndustryFactor, baseValue: 0.05}],
});

// Furnace
moduleOperations.Garbage = new ModuleOperation({
    title: 'Garbage', maxXp: 500, gridLoad: 1,
    description: 'Lets get rid of all that trash lying around the station. It\'s neither efficient nor sustainable, but it smells even worse.',
    effects: [{effectType: EffectType.Energy, baseValue: 1}],
});
moduleOperations.Diesel = new ModuleOperation({
    title: 'Diesel', maxXp: 1_000, gridLoad: 2,
    description: 'From the depths of fossilized relics to the pulse of synthesized organics, it\'s the timeless heart that beats in the mechanical chest of progress.',
    effects: [{effectType: EffectType.Energy, baseValue: 3}],
});
moduleOperations.FuelT3 = new ModuleOperation({
    title: 'Smelly Jelly', maxXp: 2_000, gridLoad: 4,
    description: 'Super-concentrated jet fuel, thanks to Neptunium\'s kick. Beware: its potent aroma is adored by some, stomach-churning for most.',
    effects: [{effectType: EffectType.Energy, baseValue: 9}],
});
/** Galactic Secret */
moduleOperations.Quasarite = new ModuleOperation({
    title: 'Quasarite', maxXp: 20_000, gridLoad: 8,
    description: 'Harnessed from the remnants of distant quasar explosions it pulses with mind-boggling energy. ' +
        'Its otherworldly properties enhance resource production but require careful containment to avoid unpredictable reactions.',
    effects: [{effectType: EffectType.Energy, baseValue: 20}, {effectType: EffectType.IndustryFactor, baseValue: 0.05}, ],
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
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.04}],
});
/** Galactic Secret */
moduleOperations.MicroalloyGlass = new ModuleOperation({
    title: 'Microalloy Glass', maxXp: 40_000, gridLoad: 10,
    description: 'Fifteen times harder than steel and so clear that objects made out of pure microalloy glass can be considered invisible.',
    effects: [{effectType: EffectType.IndustryFactor, baseValue: 0.08}, {effectType: EffectType.Research, baseValue: 0.50}],
});

//Military
moduleOperations.GlitzPlating = new ModuleOperation({
    title: 'Glitz Plating', maxXp: 2_000, gridLoad: 1,
    description: 'Tougher than a Comet Crawler\'s shell, this armor resists most of galaxy\'s temper.',
    effects: [{effectType: EffectType.EnergyFactor, baseValue: 0.01}],
});
moduleOperations.PulseShield = new ModuleOperation({
    title: 'Pulse Shield', maxXp: 4_000, gridLoad: 2,
    description: 'A shimmering barrier that not only guards against oncoming threats but sends projectiles back from whence they came.',
    effects: [{effectType: EffectType.EnergyFactor, baseValue: 0.03}],
});
moduleOperations.BulletSponge = new ModuleOperation({
    title: 'Bullet Sponge', maxXp: 8_000, gridLoad: 4,
    description:'This enchantment laughs in the face of danger, soaking up damage like a thirsty traveler in a desert.',
    effects: [{effectType: EffectType.EnergyFactor, baseValue: 0.09}],
});

moduleOperations.RapidRumbleTower = new ModuleOperation({
    title: 'Rapid Rumble Tower', maxXp: 4_000, gridLoad: 3,
    description: 'A relentless hail of bullets from these mini-guns ensures fiends think twice before nearing your station.',
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.01}],
});
moduleOperations.LaserTurrets = new ModuleOperation({
    title: 'Laser Turrets', maxXp: 8_000, gridLoad: 6,
    description: 'With precision and burning intensity, these beams do to enemies what a hot knife does to butter.',
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.03}],
});
moduleOperations.AntiMissileSwarm = new ModuleOperation({
    title: 'Anti-Missile Swarm', maxXp: 16_000, gridLoad: 10,
    description: 'A cloud of alien defenders that swarm incoming missiles, dismantling them with the ferocity of piranhas.',
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.10}],
});

//Population
moduleOperations.Survivors = new ModuleOperation({
    title: 'Pick up survivors', maxXp: 4_000, gridLoad: 1,
    description: 'Space is vast, but you’re not leaving anyone behind. Rescue survivors to add their skills and stories to your crew.',
    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.01}],
});
moduleOperations.Recruitment = new ModuleOperation({
    title: 'Recruitment', maxXp: 8_000, gridLoad: 2,
    description: 'Broadcasting an open call across the stars. Join for adventure, stay for the camaraderie (and the occasional space burrito night).',
    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.03}],
});
moduleOperations.SmoochSanctuary = new ModuleOperation({
    title: 'Smooch Sanctuary', maxXp: 16_000, gridLoad: 4,
    description: 'Where relationships bloom amid the stars. Encourages crew bonding and, well, let’s just say the stork visits more often.',
    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.08}],
});
moduleOperations.MechanoMaker = new ModuleOperation({
    title: 'Mechano Maker', maxXp: 32_000, gridLoad: 8,
    description: 'Why wait for nature when you have technology? Assemble new crew members who are part metal, part moxie.',
    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.20}],
});
/** Galactic Secret */
moduleOperations.ReplicationChambers = new ModuleOperation({
    title: 'Replication Chambers', maxXp: 320_000, gridLoad: 12,
    description: 'Input DNA and watch as new life forms materialize, ready to contribute to your cosmic odyssey. Handle with care; creating life is a profound responsibility!',
    effects: [{effectType: EffectType.GrowthFactor, baseValue: 0.30}, {effectType: EffectType.Industry, baseValue: 0.50}],
});

moduleOperations.EveryoneMatters = new ModuleOperation({
    title: 'Everyone Matters', maxXp: 8_000, gridLoad: 2,
    description: 'A teaching that every crew member, no matter their role, is invaluable. Together, even the smallest can achieve greatness.',
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.01}],
});
moduleOperations.UnitedForVictory = new ModuleOperation({
    title: 'United For Victory', maxXp: 16_000, gridLoad: 4,
    description: 'Strength in unity, victory in collaboration. This doctrine binds the crew as one, turning collective will into unstoppable force.',
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.03}],
});
moduleOperations.GuileIsStrength = new ModuleOperation({
    title: 'Guile is Strength', maxXp: 32_000, gridLoad: 6,
    description: 'Embraces cunning over brute force, teaching that the sharpest weapon is the mind. Stealth and strategy pave the way to triumph.',
    effects: [{effectType: EffectType.MilitaryFactor, baseValue: 0.10}],
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
    RescueCapsule: new ModuleComponent({
        title: 'Rescue Capsule',
        description: 'A small pod, big enough to house a single person. Ideal to escape from the station as a last resort.',
        operations: [moduleOperations.StandbyGenerator, moduleOperations.FourDPrinter],
    }),
    TinyToolbox: new ModuleComponent({
        title: 'Tiny Toolbox',
        description: 'This compact kit contains everything a captain needs to get the station up and running.',
        operations: [moduleOperations.MicroCyborgAutomat, moduleOperations.KungFuManual, moduleOperations.PocketLaboratory],
    }),
    MinedResource: new ModuleComponent({
        title: 'Mined Resource',
        description: 'The foundation of station expansion. From common rocks to exotic minerals, each resource fuels progress and prosperity.',
        operations: [moduleOperations.SpaceRocks, moduleOperations.HeavyGlitz, moduleOperations.Radiance]
    }),
    Drill: new ModuleComponent({
        title: 'Drill',
        description: 'The might of the Mining Bay, turning lifeless asteroids into vaults of valuable materials. Each drill is a key to unlocking the galaxy\'s riches.',
        operations: [moduleOperations.BigSpinny, moduleOperations.AsteroidChomper, moduleOperations.TenDrills]
    }),
    Fuel: new ModuleComponent({
        title: 'Fuel',
        description: 'The heart\'s fire of the station, what will you use to power the furnace?',
        operations: [moduleOperations.Garbage, moduleOperations.Diesel, moduleOperations.FuelT3, moduleOperations.Quasarite],
    }),
    Products: new ModuleComponent({
        title: 'Products',
        description: 'Transmuting raw materials into vital resources. Whether it\'s for construction or commerce, the furnace forges the foundation of expansion.',
        operations: [moduleOperations.Plastics, moduleOperations.Steel, moduleOperations.ProductsT3, moduleOperations.MicroalloyGlass],
    }),
    Protection: new ModuleComponent({
        title: 'Protection',
        description: 'A shield against the void\'s dangers. Become a fortress among the stars!',
        operations: [moduleOperations.GlitzPlating, moduleOperations.PulseShield, moduleOperations.BulletSponge],
    }),
    Turrets: new ModuleComponent({
        title: 'Turrets',
        description: 'The station\'s fangs and claws. Arm your station with an array of turrets, ready to repel invaders and protect your domain.',
        operations: [moduleOperations.RapidRumbleTower, moduleOperations.LaserTurrets, moduleOperations.AntiMissileSwarm],
    }),
    CrewExpansion: new ModuleComponent({
        title: 'Crew Expansion',
        description: 'Growth is the lifeblood of progress. Expand, evolve, and empower your crew.',
        operations: [moduleOperations.Survivors, moduleOperations.Recruitment, moduleOperations.SmoochSanctuary,
            moduleOperations.MechanoMaker, moduleOperations.ReplicationChambers],
    }),
    Doctrine: new ModuleComponent({
        title: 'Doctrine',
        description: 'The core of your station\'s ethos, shaping the spirit and strategy of your crew.',
        operations: [moduleOperations.EveryoneMatters, moduleOperations.UnitedForVictory, moduleOperations.GuileIsStrength, moduleOperations.GloryToTheGreatHeroes],
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
        description: 'The command center of your station. Where decisions are made, destinies shaped, and the occasional cosmic burrito ordered.',
        components: [moduleComponents.TinyToolbox],
    }),
    MiningBay: new Module({
        title: 'Mining Bay',
        description: 'For some, space is vast and empty. For others, its the greatest treasure trove there is.',
        components: [moduleComponents.MinedResource, moduleComponents.Drill],
    }),
    Furnace: new Module({
        title: 'Furnace Module',
        description: 'The beating heart of industry, transforming raw into refined, ordinary into extraordinary. The forge of future tech.',
        components: [moduleComponents.Fuel, moduleComponents.Products],
    }),
    Defensive: new Module({
        title: 'Defensive Module',
        description: 'The station\'s shield and sword. Whether repelling invaders or standing guard, peace is made by those prepared for war.',
        components: [moduleComponents.Protection, moduleComponents.Turrets],
        requirements: [new AttributeRequirement('playthrough', [{attribute: attributes.gridStrength, requirement: 6}])],
    }),
    Quarters: new Module({
        title: 'Quarters Module',
        description: 'A home among the stars. From the hum of daily life to the legends of immortal warriors, every soul contributes to the journey.',
        components: [moduleComponents.CrewExpansion, moduleComponents.Doctrine],
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
        modules: [
            modules.ISASM,
            modules.CaptainsQuarter,
            modules.MiningBay,
            modules.Furnace,
            modules.Defensive,
            modules.Quarters
        ],
    }),
};
