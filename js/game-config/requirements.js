'use strict';

/**
 * @type {Object<Requirement>}
 */
const sharedRequirements = {};
sharedRequirements.attributeGridStrengthUnlocked = new AttributeRequirement('playthrough', {
    attribute: attributes.gridStrength,
    requirement: 0.01,
});
sharedRequirements.attributeGridStrength1 = new AttributeRequirement('playthrough', {
    attribute: attributes.gridStrength,
    requirement: 1,
});

sharedRequirements.attributeResearchUnlocked = new AttributeRequirement('playthrough', {
    attribute: attributes.research,
    requirement: 0.01,
});
sharedRequirements.attributeResearch10 = battleRequirements[1];

sharedRequirements.FourDPrinterLvl20 = new OperationLevelRequirement('playthrough', {
    operation: moduleOperations.FourDPrinter,
    requirement: 20,
});
sharedRequirements.KungFuManualLvl20 = new OperationLevelRequirement('playthrough', {
    operation: moduleOperations.KungFuManual,
    requirement: 20,
});
sharedRequirements.NovaFliesLvl10 = new FactionLevelsDefeatedRequirement('playthrough', {
    faction: factions.NovaFlies,
    requirement: battles.NovaFlies10.targetLevel,
});
sharedRequirements.NovaFliesLvl20 = new FactionLevelsDefeatedRequirement(
    'playthrough',
    {
        faction: factions.NovaFlies,
        requirement: 20,
    },
    [sharedRequirements.KungFuManualLvl20],
);
sharedRequirements.PocketLaboratoryLvl10 = new OperationLevelRequirement(
    'playthrough',
    {
        operation: moduleOperations.PocketLaboratory,
        requirement: 10,
    },
    [sharedRequirements.NovaFliesLvl20],
);
sharedRequirements.AstrogoblinsLvl75 = new FactionLevelsDefeatedRequirement('playthrough', {
    faction: factions.Astrogoblins,
    requirement: 10 + 20 + 30 + 50 + 75, // All battles before Lvl 100
});

/**
 * @type {Object<Requirement>}
 */
const moduleOperationRequirements = {
    // I.S.A.S.M
    // Rescue Capsule
    FourDPrinter: moduleOperations.FourDPrinter.registerRequirement(
        sharedRequirements.attributeGridStrength1,
    ),

    // Captain's Quarter
    MicroCyborgAutomat: moduleOperations.MicroCyborgAutomat.registerRequirement(
        sharedRequirements.FourDPrinterLvl20,
    ),
    KungFuManual: moduleOperations.KungFuManual.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.MicroCyborgAutomat,
            requirement: 20,
        }),
    ),
    PocketLaboratory: moduleOperations.PocketLaboratory.registerRequirement(
        sharedRequirements.NovaFliesLvl20,
    ),

    // MINING BAY
    // Mined Resource
    HeavyGlitz: moduleOperations.HeavyGlitz.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.SpaceRocks,
            requirement: 100,
        }),
    ),
    Radiance: moduleOperations.Radiance.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.HeavyGlitz,
            requirement: 500,
        }),
    ),

    // Drill
    AsteroidChomper: moduleOperations.AsteroidChomper.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.BigSpinny,
            requirement: 100,
        }),
    ),
    TenDrills: moduleOperations.TenDrills.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.AsteroidChomper,
            requirement: 500,
        }),
    ),

    // FURNACE
    // Fuel
    Diesel: moduleOperations.Diesel.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.Garbage,
            requirement: 100,
        }),
    ),
    SmellyJelly: moduleOperations.SmellyJelly.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.Diesel,
            requirement: 200,
        }),
    ),
    Quasarite: moduleOperations.Quasarite.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.SmellyJelly,
            requirement: 500,
        }),
    ),

    // Products
    Steel: moduleOperations.Steel.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.Plastics,
            requirement: 100,
        }),
    ),
    Bouncium: moduleOperations.Bouncium.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.Steel,
            requirement: 200,
        }),
    ),
    MicroalloyGlass: moduleOperations.MicroalloyGlass.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.Bouncium,
            requirement: 500,
        }),
    ),

    // DEFENSIVE MODULE
    // Protection
    PulseShield: moduleOperations.PulseShield.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.GlitzPlating,
            requirement: 100,
        }),
    ),
    BulletSponge: moduleOperations.BulletSponge.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.PulseShield,
            requirement: 500,
        }),
    ),

    // Turrets
    LaserTurrets: moduleOperations.LaserTurrets.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.RapidRumbleTower,
            requirement: 100,
        }),
    ),
    AntiMissileSwarm: moduleOperations.AntiMissileSwarm.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.LaserTurrets,
            requirement: 500,
        }),
    ),

    // QUARTERS MODULE
    // Crew Expansion
    Recruitment: moduleOperations.Recruitment.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.Survivors,
            requirement: 100,
        }),
    ),
    SmoochSanctuary: moduleOperations.SmoochSanctuary.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.Recruitment,
            requirement: 200,
        }),
    ),
    MechanoMaker: moduleOperations.MechanoMaker.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.SmoochSanctuary,
            requirement: 500,
        }),
    ),
    ReplicationChambers: moduleOperations.ReplicationChambers.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.MechanoMaker,
            requirement: 1000,
        }),
    ),

    // Doctrine
    UnitedForVictory: moduleOperations.UnitedForVictory.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.EveryoneMatters,
            requirement: 100,
        }),
    ),
    GuileIsStrength: moduleOperations.GuileIsStrength.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.UnitedForVictory,
            requirement: 200,
        }),
    ),
    GloryToTheGreatHeroes: moduleOperations.GloryToTheGreatHeroes.registerRequirement(
        new OperationLevelRequirement('playthrough', {
            operation: moduleOperations.GuileIsStrength,
            requirement: 500,
        }),
    ),


};

/**
 * @type {Object<Requirement>}
 */
const modulesRequirements = {
    CaptainsQuarter: modules.CaptainsQuarter.registerRequirement(
        sharedRequirements.FourDPrinterLvl20,
    ),
    MiningBay1: modules.MiningBay.registerRequirement(
        sharedRequirements.PocketLaboratoryLvl10,
    ),
    MiningBay2: modules.MiningBay.registerRequirement(
        new AttributeRequirement('playthrough', {
            attribute: attributes.gridStrength,
            requirement: 2,
        }),
    ),
    MiningBay3: modules.MiningBay.registerRequirement(
        new PointOfInterestVisitedRequirement('playthrough', {
            pointOfInterest: pointsOfInterest.StarlightEnclave,
        }),
    ),
    Furnace1: modules.Furnace.registerRequirement(
        new AttributeRequirement('playthrough', {
            attribute: attributes.gridStrength,
            requirement: 4,
        }),
    ),
    Furnace2: modules.Furnace.registerRequirement(
        new PointOfInterestVisitedRequirement('playthrough', {
            pointOfInterest: pointsOfInterest.GrowthLocationLow,
        }),
    ),
    Defensive1: modules.Defensive.registerRequirement(
        new AttributeRequirement('playthrough', {
            attribute: attributes.gridStrength,
            requirement: 6,
        }),
    ),
    Defensive2: modules.Defensive.registerRequirement(
        new PointOfInterestVisitedRequirement('playthrough', {
            pointOfInterest: pointsOfInterest.GrowthLocationMedium,
        }),
    ),
    Quarters1: modules.Quarters.registerRequirement(
        new AttributeRequirement('playthrough', {
            attribute: attributes.gridStrength,
            requirement: 8,
        }),
    ),
    Quarters2: modules.Quarters.registerRequirement(
        new PointOfInterestVisitedRequirement('playthrough', {
            pointOfInterest: pointsOfInterest.IndustryLocationHigh,
        }),
    ),
};

/**
 * @type {Object<Requirement>}
 */
const pointsOfInterestRequirements = {
    StarlightEnclave: pointsOfInterest.StarlightEnclave.registerRequirement(
        sharedRequirements.PocketLaboratoryLvl10,
    ),
    GrowthLocationLow: pointsOfInterest.GrowthLocationLow.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', {
            faction: factions.NovaFlies,
            requirement: 250, // Target: 100
            // equals Battle #10
        }),
    ),

    ResearchLocationMedium: pointsOfInterest.ResearchLocationMedium.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', {
            faction: factions.Scavengers,
            requirement: 50, // Target: 30
            // equals Battle #27
        }),
    ),
    GrowthLocationMedium: pointsOfInterest.GrowthLocationMedium.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', {
            faction: factions.MeteorMaws,
            requirement: 20, // Target: 20
            // equals Battle #36
        }),
    ),

    ResearchLocationHigh: pointsOfInterest.ResearchLocationHigh.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', {
            faction: factions.VoidVikings,
            requirement: 5, // Target: 10
            // equals Battle #65
        }),
    ),
    GrowthLocationHigh: pointsOfInterest.GrowthLocationHigh.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', {
            faction: factions.MeteorMaws,
            requirement: 1800, // Target: 750
            // equals Battle #73
        }),
    ),

    ResearchLocationExtreme: pointsOfInterest.ResearchLocationExtreme.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', {
            faction: factions.StarMantas,
            requirement: 1200, // Target: 500
            // equals Battle #95
        }),
    ),
    GrowthLocationExtreme: pointsOfInterest.GrowthLocationExtreme.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', {
            faction: factions.ThunderDragon,
            requirement: 200, // Target: 100
            // equals Battle #101
        }),
    ),
};

/**
 * @type {Object<Requirement>}
 */
const sectorsRequirements = {
    BetaSector1: sectors.BetaSector.registerRequirement(
        sharedRequirements.AstrogoblinsLvl75,
    ),
    BetaSector2: sectors.BetaSector.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', {
            faction: factions.Astrogoblins,
            requirement: 250, // Target: 100
            // equals Battle #18
        }, [sharedRequirements.AstrogoblinsLvl75]),
    ),
    GammaSector: sectors.GammaSector.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', {
            faction: factions.SpacePirates,
            requirement: 20, // Target: 20
            // equals Battle #47
        }),
    ),
    DeltaSector: sectors.DeltaSector.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', {
            faction: factions.AstralSharks,
            requirement: 5, // Target: 10
            // equals Battle #85
        }),
    ),
};

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
            requirements: [new OperationLevelRequirement('playthrough', {
                operation: moduleOperations.StandbyGenerator,
                requirement: 1,
            })],
        }),
    gridStrengthElements: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().byId('gridLabel'),
                Dom.get().byId('gridStrength'),
            ],
            requirements: [sharedRequirements.attributeGridStrength1],
        }),
    industryDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().bySelector('#attributesDisplay > [data-attribute="industry"]'),
            ],
            requirements: [new OperationLevelRequirement('playthrough', {
                operation: moduleOperations.FourDPrinter,
                requirement: 1,
            })],
        }),
    growthDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().bySelector('#attributesDisplay > [data-attribute="growth"]'),
            ],
            requirements: [new OperationLevelRequirement('playthrough', {
                operation: moduleOperations.MicroCyborgAutomat,
                requirement: 1,
            })],
        }),
    militaryDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().bySelector('#attributesDisplay > [data-attribute="military"]'),
            ],
            requirements: [new OperationLevelRequirement('playthrough', {
                operation: moduleOperations.KungFuManual,
                requirement: 1,
            })],
        }),
    battleTabButton: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().byId('battleTabButton')],
            requirements: [sharedRequirements.KungFuManualLvl20],
            elementsToShowRequirements: [Dom.get().byId('battleTabButtonRequirements')],
        }),
    dangerDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().bySelector('#attributesDisplay > [data-attribute="danger"]'),
                Dom.get().bySelector('#attributesDisplay > [data-attribute="heat"]'),
                Dom.lazy().allBySelector('#unfinishedBattles .level3 .danger, #unfinishedBattles .level4 .danger'),
                ...Dom.get().allByClass('battles-pose-danger'),
            ],
            requirements: [sharedRequirements.NovaFliesLvl10],
        }),
    completedBattles: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.lazy().byId('finishedBattles'),
            ],
            requirements: [sharedRequirements.NovaFliesLvl10],
        }),
    researchDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().bySelector('#attributesDisplay > [data-attribute="research"]'),
            ],
            requirements: [sharedRequirements.attributeResearchUnlocked],
        }),
    locationTabButton: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().byId('locationTabButton')],
            requirements: [sharedRequirements.PocketLaboratoryLvl10],
            elementsToShowRequirements: [Dom.get().byId('locationTabButtonRequirements')],
        }),
    battleMultiEngageHelp: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                ...Dom.get().allByClass('multiple-battles'),
            ],
            requirements: [battleRequirements[0]],
        }),
    galacticSecretsTabButton: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().byId('galacticSecretsTabButton')],
            requirements: [new AttributeRequirement('playthrough', {
                attribute: attributes.essenceOfUnknown,
                requirement: 1,
            })],
            elementsToShowRequirements: [],
        }),
    essenceOfUnknownLabel: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().bySelector('#galacticSecretsTabButton > .primary-stat')],
            requirements: [new AttributeRequirement('update', {
                attribute: attributes.essenceOfUnknown,
                requirement: 1,
            })],
            elementsToShowRequirements: [],
        }),
};
