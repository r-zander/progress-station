'use strict';

/**
 * @type {Object<Technology>}
 */
const technologies = {};

// ============================================================================
// OPERATION TECHNOLOGIES (3 Data each)
// ============================================================================

// I.S.A.S.M / Rescue Capsule
technologies.FourDPrinter = new Technology({
    unlocks: moduleOperations.FourDPrinter,
    baseCost: 3,
    requirements: [sharedRequirements.attributeGridStrength1],
});

// Captain's Quarter
technologies.MicroCyborgAutomat = new Technology({
    unlocks: moduleOperations.MicroCyborgAutomat,
    baseCost: 3,
    requirements: [sharedRequirements.FourDPrinterLvl10],
});

technologies.KungFuManual = new Technology({
    unlocks: moduleOperations.KungFuManual,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.MicroCyborgAutomat,
        requirement: 10,
    })],
});

technologies.PocketLaboratory = new Technology({
    unlocks: moduleOperations.PocketLaboratory,
    baseCost: 3,
    requirements: [sharedRequirements.NovaFliesLvl20],
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

technologies.Radiance = new Technology({
    unlocks: moduleOperations.Radiance,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.HeavyGlitz,
        requirement: 500,
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

technologies.TenDrills = new Technology({
    unlocks: moduleOperations.TenDrills,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.AsteroidChomper,
        requirement: 500,
    })],
});

// Module 4 - Growth
technologies.Module4GrowthOperationT2 = new Technology({
    unlocks: moduleOperations.Module4GrowthOperationT2,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.Module4GrowthOperationT1,
        requirement: 100,
    })],
});

technologies.Module4GrowthOperationT3 = new Technology({
    unlocks: moduleOperations.Module4GrowthOperationT3,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.Module4GrowthOperationT2,
        requirement: 500,
    })],
});

// Module 4 - Research
technologies.Module4ResearchOperationT2 = new Technology({
    unlocks: moduleOperations.Module4ResearchOperationT2,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.Module4ResearchOperationT1,
        requirement: 100,
    })],
});

technologies.Module4ResearchOperationT3 = new Technology({
    unlocks: moduleOperations.Module4ResearchOperationT3,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.Module4ResearchOperationT2,
        requirement: 500,
    })],
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

technologies.Quasarite = new Technology({
    unlocks: moduleOperations.Quasarite,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.SmellyJelly,
        requirement: 500,
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

technologies.MicroalloyGlass = new Technology({
    unlocks: moduleOperations.MicroalloyGlass,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.Bouncium,
        requirement: 500,
    })],
});

// Defensive Module - Protection
technologies.PulseShield = new Technology({
    unlocks: moduleOperations.PulseShield,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.GlitzPlating,
        requirement: 100,
    })],
});

technologies.BulletSponge = new Technology({
    unlocks: moduleOperations.BulletSponge,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.PulseShield,
        requirement: 500,
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

technologies.AntiMissileSwarm = new Technology({
    unlocks: moduleOperations.AntiMissileSwarm,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.LaserTurrets,
        requirement: 500,
    })],
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

technologies.SmoochSanctuary = new Technology({
    unlocks: moduleOperations.SmoochSanctuary,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.Recruitment,
        requirement: 200,
    })],
});

technologies.MechanoMaker = new Technology({
    unlocks: moduleOperations.MechanoMaker,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.SmoochSanctuary,
        requirement: 500,
    })],
});

technologies.ReplicationChambers = new Technology({
    unlocks: moduleOperations.ReplicationChambers,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.MechanoMaker,
        requirement: 1000,
    })],
});

// Quarters Module - Doctrine
technologies.UnitedForVictory = new Technology({
    unlocks: moduleOperations.UnitedForVictory,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.EveryoneMatters,
        requirement: 100,
    })],
});

technologies.GuileIsStrength = new Technology({
    unlocks: moduleOperations.GuileIsStrength,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.UnitedForVictory,
        requirement: 200,
    })],
});

technologies.GloryToTheGreatHeroes = new Technology({
    unlocks: moduleOperations.GloryToTheGreatHeroes,
    baseCost: 3,
    requirements: [new OperationLevelRequirement('playthrough', {
        operation: moduleOperations.GuileIsStrength,
        requirement: 500,
    })],
});

// ============================================================================
// MODULE TECHNOLOGIES (5 Data each)
// ============================================================================

technologies.CaptainsQuarter = new Technology({
    unlocks: modules.CaptainsQuarter,
    baseCost: 5,
    requirements: [sharedRequirements.FourDPrinterLvl10],
});

technologies.MiningBay = new Technology({
    unlocks: modules.MiningBay,
    baseCost: 5,
    requirements: [
        sharedRequirements.PocketLaboratoryLvl10,
        sharedRequirements.GridStrengtLvl2,
        sharedRequirements.StarlightEnclaveVisited,
    ],
});

technologies.Module4 = new Technology({
    unlocks: modules.Module4,
    baseCost: 5,
    requirements: [
        sharedRequirements.PocketLaboratoryLvl10,
        sharedRequirements.GridStrengtLvl2,
        sharedRequirements.StarlightEnclaveVisited,
    ],
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

// ============================================================================
// POINT OF INTEREST TECHNOLOGIES (2 Data each)
// ============================================================================

technologies.StarlightEnclave = new Technology({
    unlocks: pointsOfInterest.StarlightEnclave,
    baseCost: 2,
    requirements: [sharedRequirements.PocketLaboratoryLvl10],
});

technologies.GrowthLocationLow = new Technology({
    unlocks: pointsOfInterest.GrowthLocationLow,
    baseCost: 2,
    requirements: [new FactionLevelsDefeatedRequirement('playthrough', {
        faction: factions.NovaFlies,
        requirement: 250,
    })],
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
// SECTOR TECHNOLOGIES (3 Data each)
// ============================================================================

technologies.BetaSector = new Technology({
    unlocks: sectors.BetaSector,
    baseCost: 3,
    requirements: [
        sharedRequirements.AstrogoblinsLvl75,
        new FactionLevelsDefeatedRequirement('playthrough', {
            faction: factions.Astrogoblins,
            requirement: 250,
        }, [sharedRequirements.AstrogoblinsLvl75]),
    ],
});

technologies.GammaSector = new Technology({
    unlocks: sectors.GammaSector,
    baseCost: 3,
    requirements: [new FactionLevelsDefeatedRequirement('playthrough', {
        faction: factions.SpacePirates,
        requirement: 20,
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

// ============================================================================
// HTML ELEMENT TECHNOLOGIES (1 Data each)
// ============================================================================

// technologies.energyGridDisplay = new Technology({
//     unlocks: {
//         type: 'HtmlElement',
//         title: 'Energy Grid Display',
//         name: 'energyGridDisplay',
//     },
//     baseCost: 1,
//     requirements: [new OperationLevelRequirement('playthrough', {
//         operation: moduleOperations.StandbyGenerator,
//         requirement: 1,
//     })],
// });

// technologies.gridStrengthElements = new Technology({
//     unlocks: {
//         type: 'HtmlElement',
//         title: 'Grid Strength Display',
//         name: 'gridStrengthElements',
//     },
//     baseCost: 1,
//     requirements: [sharedRequirements.attributeGridStrength1],
// });

// technologies.industryDisplay = new Technology({
//     unlocks: {
//         type: 'HtmlElement',
//         title: 'Industry Display',
//         name: 'industryDisplay',
//     },
//     baseCost: 1,
//     requirements: [new OperationLevelRequirement('playthrough', {
//         operation: moduleOperations.FourDPrinter,
//         requirement: 1,
//     })],
// });

// technologies.growthDisplay = new Technology({
//     unlocks: {
//         type: 'HtmlElement',
//         title: 'Growth Display',
//         name: 'growthDisplay',
//     },
//     baseCost: 1,
//     requirements: [new OperationLevelRequirement('playthrough', {
//         operation: moduleOperations.MicroCyborgAutomat,
//         requirement: 1,
//     })],
// });
//
// technologies.militaryDisplay = new Technology({
//     unlocks: {
//         type: 'HtmlElement',
//         title: 'Military Display',
//         name: 'militaryDisplay',
//     },
//     baseCost: 1,
//     requirements: [new OperationLevelRequirement('playthrough', {
//         operation: moduleOperations.KungFuManual,
//         requirement: 1,
//     })],
// });

technologies.battleTabButton = new Technology({
    unlocks: {
        type: 'HtmlElement',
        title: 'Battle Tab',
        name: 'battleTabButton',
    },
    baseCost: 1,
    requirements: [sharedRequirements.CoreBladeLvl10],
});

// technologies.dangerDisplay = new Technology({
//     unlocks: {
//         type: 'HtmlElement',
//         title: 'Danger Display',
//         name: 'dangerDisplay',
//     },
//     baseCost: 1,
//     requirements: [sharedRequirements.NovaFliesLvl10],
// });
//
// technologies.completedBattles = new Technology({
//     unlocks: {
//         type: 'HtmlElement',
//         title: 'Completed Battles Display',
//         name: 'completedBattles',
//     },
//     baseCost: 1,
//     requirements: [sharedRequirements.NovaFliesLvl10],
// });
//
// technologies.researchDisplay = new Technology({
//     unlocks: {
//         type: 'HtmlElement',
//         title: 'Research Display',
//         name: 'researchDisplay',
//     },
//     baseCost: 1,
//     requirements: [sharedRequirements.attributeResearchUnlocked],
// });

technologies.locationTabButton = new Technology({
    unlocks: {
        type: 'HtmlElement',
        title: 'Location Tab',
        name: 'locationTabButton',
    },
    baseCost: 1,
    requirements: [sharedRequirements.PocketLaboratoryLvl10],
});

// technologies.battleMultiEngageHelp = new Technology({
//     unlocks: {
//         type: 'HtmlElement',
//         title: 'Multi-Battle Help',
//         name: 'battleMultiEngageHelp',
//     },
//     baseCost: 1,
//     requirements: [battleRequirements[0]],
// });
//
// technologies.galacticSecretsTabButton = new Technology({
//     unlocks: {
//         type: 'HtmlElement',
//         title: 'Galactic Secrets Tab',
//         name: 'galacticSecretsTabButton',
//     },
//     baseCost: 1,
//     requirements: [new AttributeRequirement('playthrough', {
//         attribute: attributes.essenceOfUnknown,
//         requirement: 1,
//     })],
// });
//
// technologies.essenceOfUnknownLabel = new Technology({
//     unlocks: {
//         type: 'HtmlElement',
//         title: 'Essence Label',
//         name: 'essenceOfUnknownLabel',
//     },
//     baseCost: 1,
//     requirements: [new AttributeRequirement('update', {
//         attribute: attributes.essenceOfUnknown,
//         requirement: 1,
//     })],
// });
//
// technologies.essenceOfUnknownHistory = new Technology({
//     unlocks: {
//         type: 'HtmlElement',
//         title: 'Essence History',
//         name: 'essenceOfUnknownHistory',
//     },
//     baseCost: 1,
//     requirements: [new AttributeRequirement('permanent', {
//         attribute: attributes.essenceOfUnknown,
//         requirement: 1,
//     })],
// });
