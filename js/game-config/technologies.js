'use strict';

const technologiesUnlockDuration = 1000; // milliseconds

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

// Captain's Quarter does not require a Technology
// PocketLaboratory does not require a Technology

technologies.MicroCyborgAutomat = new Technology({
    unlocks: moduleOperations.MicroCyborgAutomat,
    baseCost: 3,
    // No requirements - player just need to collect enough Data
    requirements: [],
});

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
    },
    baseCost: 1,
    requirements: [sharedRequirements.CoreBladeLvl10],
});

technologies.locationTabButton = new Technology({
    unlocks: {
        type: 'HtmlElement',
        title: 'Location Tab',
        name: 'locationTabButton',
    },
    baseCost: 1,
    requirements: [sharedRequirements.NovaFliesLvl20],
});

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

technologies.Module4 = new Technology({
    unlocks: modules.Module4,
    baseCost: 5,
    requirements: [
        sharedRequirements.GridStrengtLvl2,
        sharedRequirements.StarlightEnclaveVisited,
    ],
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

technologies.BetaSector = new Technology({
    unlocks: sectors.BetaSector,
    baseCost: 3,
    requirements: [
        new FactionLevelsDefeatedRequirement('playthrough', {
            faction: factions.Astrogoblins,
            requirement: 250,
        }, [sharedRequirements.AstrogoblinsLvl75]),
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
