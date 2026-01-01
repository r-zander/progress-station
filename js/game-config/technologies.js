'use strict';

const technologiesUnlockDuration = 600; // milliseconds

/**
 * @type {Object<Technology>}
 */
const technologies = {};

// ============================================================================
// TECHNOLOGIES in unlock order
//
// The order here is the order in the Technologies tab!
// ============================================================================

// I.S.A.S.M does not require a Technology
// FourDPrinter does not require a Technology

// Command Center does not require a Technology
// PocketLaboratory does not require a Technology

technologies.MicroCyborgAutomat = new Technology({
    unlocks: moduleOperations.MicroCyborgAutomat,
    baseCost: 3,
    // No requirements - player just need to collect enough Data
    requirements: [],
});
sharedRequirements.MicroCyborgAutomat = technologies.MicroCyborgAutomat.technologyRequirement;

technologies.KungFuManual = new Technology({
    unlocks: moduleOperations.KungFuManual,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.MicroCyborgAutomat,
        requirement: 10,
    })],
});

technologies.battleTabButton = new Technology({
    unlocks: {
        type: 'HtmlElement',
        title: 'Battle Tab',
        name: 'battleTabButton',
        getEffectDescription: () => 'Fight battles to gain passive rewards.'
    },
    baseCost: 3,
    requirements: [sharedRequirements.CoreBladeLvl10],
});
sharedRequirements.battleTabButton = new TechnologyRequirement({technology: technologies.battleTabButton});

technologies.locationTabButton = new Technology({
    unlocks: {
        type: 'HtmlElement',
        title: 'Location Tab',
        name: 'locationTabButton',
        getEffectDescription: () => 'Visit places of interest to modify the stations effect specialization.'
    },
    baseCost: 3,
    requirements: [sharedRequirements.NovaFliesLvl20],
});

technologies.BattleCoordinationI = new Technology({
    unlocks: {
        type: 'BattleSlot',
        title: 'Battle Coordination I',
        name: 'BattleCoordinationI',
        getEffectDescription: () => 'Engage up to 2 battles at once.'
    },
    baseCost: 5,
    // FIXME for BattleSlots and HtmlElement, the pre-requisites need to be passed down manually (see next assignment)
    // prerequisites: [new FactionLevelsDefeatedRequirement('playthrough', {
    //     faction: factions.NovaFlies,
    //     requirement: 10 + 20 + 30 + 50,
    // })],
    requirements: [
        sharedRequirements.battleTabButton,
        new FactionLevelsDefeatedRequirement('playthrough', {
            faction: factions.NovaFlies,
            requirement: 10 + 20 + 30 + 50 + 75,
        }),
    ],
});
sharedRequirements.BattleCoordinationI = new TechnologyRequirement(
    {technology: technologies.BattleCoordinationI},
    [new FactionLevelsDefeatedRequirement('playthrough', {
        faction: factions.NovaFlies,
        requirement: 10 + 20 + 30 + 50,
    })],
);

technologies.BattleCoordinationII = new Technology({
    unlocks: {
        type: 'BattleSlot',
        title: 'Battle Coordination II',
        name: 'BattleCoordinationII',
        getEffectDescription: () => 'Engage up to 3 battles at once.'
    },
    baseCost: 10,
    requirements: [sharedRequirements.BattleCoordinationI],
});

technologies.BattleCoordinationIII = new Technology({
    unlocks: {
        type: 'BattleSlot',
        title: 'Battle Coordination III',
        name: 'BattleCoordinationIII',
        getEffectDescription: () => 'Engage up to 4 battles at once.'
    },
    baseCost: 15,
    requirements: [new TechnologyRequirement({technology: technologies.BattleCoordinationII})],
});

technologies.BattleCoordinationIV = new Technology({
    unlocks: {
        type: 'BattleSlot',
        title: 'Battle Coordination IV',
        name: 'BattleCoordinationIV',
        getEffectDescription: () => 'Engage up to 5 battles at once.'
    },
    baseCost: 20,
    requirements: [new TechnologyRequirement({technology: technologies.BattleCoordinationIII})],
});

technologies.BattleCoordinationV = new Technology({
    unlocks: {
        type: 'BattleSlot',
        title: 'Battle Coordination V',
        name: 'BattleCoordinationV',
        getEffectDescription: () => 'Engage up to 6 battles at once.'
    },
    baseCost: 25,
    requirements: [new TechnologyRequirement({technology: technologies.BattleCoordinationIV})],
});
sharedRequirements.BattleCoordinationV = new TechnologyRequirement({technology: technologies.BattleCoordinationV});

technologies.MiningBay = new Technology({
    unlocks: modules.MiningBay,
    baseCost: 5,
    requirements: [
        sharedRequirements.GridStrengtLvl2,
        sharedRequirements.StarlightEnclaveVisited,
    ],
});

// Mining Bay - Mined Resource
technologies.HeavyGlitz = new Technology({
    unlocks: moduleOperations.HeavyGlitz,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.SpaceRocks,
        requirement: 100,
    })],
});


// Mining Bay - Drill
technologies.AsteroidChomper = new Technology({
    unlocks: moduleOperations.AsteroidChomper,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.BigSpinny,
        requirement: 100,
    })],
});

technologies.BiotechDome = new Technology({
    unlocks: modules.BiotechDome,
    baseCost: 5,
    requirements: [
        sharedRequirements.GridStrengtLvl2,
        sharedRequirements.StarlightEnclaveVisited,
    ],
});

// Module 4 - Growth
technologies.Greenhouse = new Technology({
    unlocks: moduleOperations.Greenhouse,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.AlgaePod,
        requirement: 100,
    })],
});

// Module 4 - Research
technologies.ArtificialEcosystem = new Technology({
    unlocks: moduleOperations.ArtificialEcosystem,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.FermentationTank,
        requirement: 100,
    })],
});

technologies.GrowthLocationLow = new Technology({
    unlocks: pointsOfInterest.GrowthLocationLow,
    baseCost: 2,
    requirements: [new FactionLevelsDefeatedRequirement('playthrough', {
        faction: factions.NovaFlies,
        requirement: 250,
    })],
});

technologies.Furnace = new Technology({
    unlocks: modules.Furnace,
    baseCost: 5,
    requirements: [
        new AttributeRequirement('playthrough', {
            attribute: attributes.gridStrength,
            requirement: 4,
        }),
        new PointOfInterestVisitedRequirement('playthrough', {
            pointOfInterest: pointsOfInterest.GrowthLocationLow,
        }),
    ],
});

// Furnace - Fuel
technologies.Diesel = new Technology({
    unlocks: moduleOperations.Diesel,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.Garbage,
        requirement: 100,
    })],
});

technologies.SmellyJelly = new Technology({
    unlocks: moduleOperations.SmellyJelly,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.Diesel,
        requirement: 200,
    })],
});

// Furnace - Products
technologies.Steel = new Technology({
    unlocks: moduleOperations.Steel,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.Plastics,
        requirement: 100,
    })],
});

technologies.Bouncium = new Technology({
    unlocks: moduleOperations.Bouncium,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.Steel,
        requirement: 200,
    })],
});

technologies.BetaSector = new Technology({
    unlocks: sectors.BetaSector,
    baseCost: 3,
    requirements: [
        new FactionLevelsDefeatedRequirement('playthrough', {
            faction: factions.Astrogoblins,
            requirement: 250,
        }),
    ],
});

technologies.ResearchLocationMedium = new Technology({
    unlocks: pointsOfInterest.ResearchLocationMedium,
    baseCost: 2,
    requirements: [new FactionLevelsDefeatedRequirement('playthrough', {
        faction: factions.Scavengers,
        requirement: 50,
    })],
});

technologies.GrowthLocationMedium = new Technology({
    unlocks: pointsOfInterest.GrowthLocationMedium,
    baseCost: 2,
    requirements: [new FactionLevelsDefeatedRequirement('playthrough', {
        faction: factions.MeteorMaws,
        requirement: 20,
    })],
});

technologies.Defensive = new Technology({
    unlocks: modules.Defensive,
    baseCost: 5,
    requirements: [
        new AttributeRequirement('playthrough', {
            attribute: attributes.gridStrength,
            requirement: 6,
        }),
        new PointOfInterestVisitedRequirement('playthrough', {
            pointOfInterest: pointsOfInterest.ResearchLocationMedium,
        }),
    ],
});

// Defensive Module - Protection
technologies.NanoHardener = new Technology({
    unlocks: moduleOperations.NanoHardener,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.GlitzPlating,
        requirement: 100,
    })],
});
technologies.PulseShield = new Technology({
    unlocks: moduleOperations.PulseShield,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.NanoHardener,
        requirement: 200,
    })],
});

// Defensive Module - Turrets
technologies.LaserTurrets = new Technology({
    unlocks: moduleOperations.LaserTurrets,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.RapidRumbleTower,
        requirement: 100,
    })],
});

technologies.GammaSector = new Technology({
    unlocks: sectors.GammaSector,
    baseCost: 3,
    requirements: [new FactionLevelsDefeatedRequirement('playthrough', {
        faction: factions.SpacePirates,
        requirement: 20,
    })],
});

technologies.ResearchLocationHigh = new Technology({
    unlocks: pointsOfInterest.ResearchLocationHigh,
    baseCost: 2,
    requirements: [new FactionLevelsDefeatedRequirement('playthrough', {
        faction: factions.VoidVikings,
        requirement: 5,
    })],
});

technologies.GrowthLocationHigh = new Technology({
    unlocks: pointsOfInterest.GrowthLocationHigh,
    baseCost: 2,
    requirements: [new FactionLevelsDefeatedRequirement('playthrough', {
        faction: factions.MeteorMaws,
        requirement: 1800,
    })],
});

technologies.Quarters = new Technology({
    unlocks: modules.Quarters,
    baseCost: 5,
    requirements: [
        new AttributeRequirement('playthrough', {
            attribute: attributes.gridStrength,
            requirement: 8,
        }),
        new PointOfInterestVisitedRequirement('playthrough', {
            pointOfInterest: pointsOfInterest.GrowthLocationMedium,
        }),
    ],
});

// Quarters Module - Crew Expansion
technologies.Recruitment = new Technology({
    unlocks: moduleOperations.Recruitment,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.Survivors,
        requirement: 100,
    })],
});

technologies.MechanoMaker = new Technology({
    unlocks: moduleOperations.MechanoMaker,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.Recruitment,
        requirement: 200,
    })],
});

// Quarters Module - Doctrine
technologies.UnitedForVictory = new Technology({
    unlocks: moduleOperations.UnitedForVictory,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.UnitedbyPurpose,
        requirement: 100,
    })],
});

technologies.DeltaSector = new Technology({
    unlocks: sectors.DeltaSector,
    baseCost: 3,
    requirements: [new FactionLevelsDefeatedRequirement('playthrough', {
        faction: factions.AstralSharks,
        requirement: 5,
    })],
});

technologies.ResearchLocationExtreme = new Technology({
    unlocks: pointsOfInterest.ResearchLocationExtreme,
    baseCost: 2,
    requirements: [new FactionLevelsDefeatedRequirement('playthrough', {
        faction: factions.StarMantas,
        requirement: 1200,
    })],
});

technologies.GrowthLocationExtreme = new Technology({
    unlocks: pointsOfInterest.GrowthLocationExtreme,
    baseCost: 2,
    requirements: [new FactionLevelsDefeatedRequirement('playthrough', {
        faction: factions.ThunderDragon,
        requirement: 200,
    })],
});

// ============================================================================
// EXTRA ESSENCE OF UNKNOWN TECHNOLOGIES
// ============================================================================
// 11 boss waves give min. 2,047 Essence of Unknown
// 10 galactic secrets require 29,524 Essence of Unknown total
// --> 28 technologies provide up to 28,000 extra Essence of Unknown
//
// They form a chain: Technology 2 requires Technology 1, Technology 3 requires Technology 2, etc.
// ============================================================================

let previousTechnology = null;

for (let techNumber = 1; techNumber <= 28; techNumber++) {
    // Build the technology name: ExtraEssenceOfUnknown001, ExtraEssenceOfUnknown002, etc.
    const techName = 'ExtraEssenceOfUnknown' + String(techNumber).padStart(3, "0");

    // Start with the base configuration (same for all technologies)
    const techConfig = {
        amount: 1000,
        baseCost: 10,
        getDescription: () => `+<data value="1000" class="effect-value">${formatNumber(1000)}</data> ${attributes.essenceOfUnknown.inlineHtmlWithIcon}`,
    };

    // Set requirements based on whether this is the first technology or not
    if (previousTechnology === null) {
        // First technology: Only requires boss defeated
        techConfig.requirements = [sharedRequirements.bossDefeated];
        techConfig.prerequisites = [new FactionLevelsDefeatedRequirement('permanent', {
            faction: factions.Boss,
            requirement: 1,
        })];
    } else {
        // All other technologies: Require boss defeated AND the previous technology in the chain
        techConfig.requirements = [sharedRequirements.bossDefeated, previousTechnology.technologyRequirement];
        techConfig.prerequisites = [previousTechnology.technologyRequirement];
    }

    // Create the technology and add it to the technologies list
    const newTechnology = new EssenceOfUnknownGainTechnology(techConfig);
    technologies[techName] = newTechnology;

    // Remember this technology so the next one can require it
    previousTechnology = newTechnology;
}
