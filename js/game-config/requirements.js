'use strict';

const prerequisites = {
    attributeUnlocked: {
        // This is "registered" to the attributes tab currently
        research: [new AttributeRequirement('playthrough', [{
            attribute: attributes.research,
            requirement: 0.01,
        }])],
        gridStrength: [gridStrength.registerRequirement(new AttributeRequirement('playthrough', [{
            attribute: attributes.gridStrength,
            requirement: 0.01,
        }]))],
    },
    KungFuManualLvl10: [new OperationLevelRequirement('playthrough', [{
        operation: moduleOperations.KungFuManual,
        requirement: 10,
    }])],
    AstrogoblinsLvl75:   new FactionLevelsDefeatedRequirement('playthrough', [{
        faction: factions.Astrogoblins,
        requirement: 10 + 20 + 30 + 50 + 75, // All battles before Lvl 100
    }]),
};

/**
 * @type {Object<Requirement>}
 */
const moduleOperationRequirements = {
    FourDPrinter: moduleOperations.FourDPrinter.registerRequirement(
        new AttributeRequirement('playthrough', [{
            attribute: attributes.gridStrength,
            requirement: 1,
        }]),
    ),
    MicroCyborgAutomat: moduleOperations.MicroCyborgAutomat.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.FourDPrinter,
            requirement: 10,
        }]),
    ),
    KungFuManual: moduleOperations.KungFuManual.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.MicroCyborgAutomat,
            requirement: 10,
        }]),
    ),
    PocketLaboratory: moduleOperations.PocketLaboratory.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.NovaFlies,
            requirement: 20,
        }], prerequisites.KungFuManualLvl10),
    ),
    HeavyGlitz: moduleOperations.HeavyGlitz.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.SpaceRocks,
            requirement: 10,
        }]),
    ),
    Radiance: moduleOperations.Radiance.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.HeavyGlitz,
            requirement: 500,
        }]),
    ),
    AsteroidChomper: moduleOperations.AsteroidChomper.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.BigSpinny,
            requirement: 10,
        }]),
    ),
    TenDrills: moduleOperations.TenDrills.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.AsteroidChomper,
            requirement: 500,
        }]),
    ),
    Diesel: moduleOperations.Diesel.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.Garbage,
            requirement: 10,
        }]),
    ),
    SmellyJelly: moduleOperations.SmellyJelly.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.Diesel,
            requirement: 10,
        }]),
    ),
    Quasarite: moduleOperations.Quasarite.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.SmellyJelly,
            requirement: 500,
        }]),
    ),
    Steel: moduleOperations.Steel.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.Plastics,
            requirement: 10,
        }]),
    ),
    ProductsT3: moduleOperations.ProductsT3.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.Steel,
            requirement: 10,
        }]),
    ),
    MicroalloyGlass: moduleOperations.MicroalloyGlass.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.ProductsT3,
            requirement: 500,
        }]),
    ),
    Recruitment: moduleOperations.Recruitment.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.Survivors,
            requirement: 10,
        }]),
    ),
    SmoochSanctuary: moduleOperations.SmoochSanctuary.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.Recruitment,
            requirement: 10,
        }]),
    ),
    MechanoMaker: moduleOperations.MechanoMaker.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.SmoochSanctuary,
            requirement: 10,
        }]),
    ),
    ReplicationChambers: moduleOperations.ReplicationChambers.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.MechanoMaker,
            requirement: 500,
        }]),
    ),
    IndividualRooms: moduleOperations.UnitedForVictory.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.EveryoneMatters,
            requirement: 10,
        }]),
    ),
    WayOfLifeT3: moduleOperations.GuileIsStrength.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.UnitedForVictory,
            requirement: 10,
        }]),
    ),
    SecretWayOfLife: moduleOperations.GloryToTheGreatHeroes.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.GuileIsStrength,
            requirement: 500,
        }]),
    ),
    PulseShield: moduleOperations.PulseShield.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.GlitzPlating,
            requirement: 10,
        }]),
    ),
    BulletSponge: moduleOperations.BulletSponge.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.PulseShield,
            requirement: 10,
        }]),
    ),
    LaserTurrets: moduleOperations.LaserTurrets.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.RapidRumbleTower,
            requirement: 10,
        }]),
    ),
    AntiMissileSwarm: moduleOperations.AntiMissileSwarm.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.LaserTurrets,
            requirement: 10,
        }]),
    ),
};

/**
 * @type {Object<Requirement>}
 */
const modulesRequirements = {
    CaptainsQuarter: modules.CaptainsQuarter.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.FourDPrinter,
            requirement: 10,
        }]),
    ),
    MiningBay1: modules.MiningBay.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.PocketLaboratory,
            requirement: 10,
        }]),
    ),
    MiningBay2: modules.MiningBay.registerRequirement(
        new AttributeRequirement('playthrough', [{
            attribute: attributes.gridStrength,
            requirement: 2,
        }]),
    ),
    MiningBay3: modules.MiningBay.registerRequirement(
        new PointOfInterestVisitedRequirement('playthrough', [{
            pointOfInterest: pointsOfInterest.StarlightEnclave,
        }]),
    ),
    Furnace1: modules.Furnace.registerRequirement(
        new AttributeRequirement('playthrough', [{
            attribute: attributes.gridStrength,
            requirement: 4,
        }]),
    ),
    Furnace2: modules.Furnace.registerRequirement(
        new PointOfInterestVisitedRequirement('playthrough', [{
            pointOfInterest: pointsOfInterest.GrowthLocationLow,
        }]),
    ),
    Defensive1: modules.Defensive.registerRequirement(
        new AttributeRequirement('playthrough', [{
            attribute: attributes.gridStrength,
            requirement: 6,
        }]),
    ),
    Defensive2: modules.Defensive.registerRequirement(
        new PointOfInterestVisitedRequirement('playthrough', [{
            pointOfInterest: pointsOfInterest.GrowthLocationMedium,
        }]),
    ),
    Quarters1: modules.Quarters.registerRequirement(
        new AttributeRequirement('playthrough', [{
            attribute: attributes.gridStrength,
            requirement: 8,
        }]),
    ),
    Quarters2: modules.Quarters.registerRequirement(
        new PointOfInterestVisitedRequirement('playthrough', [{
            pointOfInterest: pointsOfInterest.IndustryLocationHigh,
        }]),
    ),
};

/**
 * @type {Object<Requirement>}
 */
const pointsOfInterestRequirements = {
    StarlightEnclave: pointsOfInterest.StarlightEnclave.registerRequirement(
        //Same as Locations tab
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.PocketLaboratory,
            requirement: 10,
        }]),
    ),
    GrowthLocationLow: pointsOfInterest.GrowthLocationLow.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.NovaFlies,
            requirement: 250, // Target: 100
            // equals Battle #10
        }]),
    ),

    ResearchLocationMedium: pointsOfInterest.ResearchLocationMedium.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.Scavengers,
            requirement: 50, // Target: 30
            // equals Battle #27
        }]),
    ),
    GrowthLocationMedium: pointsOfInterest.GrowthLocationMedium.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.MeteorMaws,
            requirement: 20, // Target: 20
            // equals Battle #36
        }]),
    ),

    ResearchLocationHigh: pointsOfInterest.ResearchLocationHigh.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.VoidVikings,
            requirement: 5, // Target: 10
            // equals Battle #65
        }]),
    ),
    GrowthLocationHigh: pointsOfInterest.GrowthLocationHigh.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.MeteorMaws,
            requirement: 1800, // Target: 750
            // equals Battle #73
        }]),
    ),

    ResearchLocationExtreme: pointsOfInterest.ResearchLocationExtreme.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.StarMantas,
            requirement: 1200, // Target: 500
            // equals Battle #95
        }]),
    ),
    GrowthLocationExtreme: pointsOfInterest.GrowthLocationExtreme.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.ThunderDragon,
            requirement: 200, // Target: 100
            // equals Battle #101
        }]),
    ),
};

/**
 * @type {Object<Requirement>}
 */
const sectorsRequirements = {
    // Register onto BetaSector as well, otherwise this won't work as prerequisit
    BetaSector1: sectors.BetaSector.registerRequirement(
        prerequisites.AstrogoblinsLvl75
    ),
    BetaSector2: sectors.BetaSector.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.Astrogoblins,
            requirement: 250, // Target: 100
            // equals Battle #18
        }], [prerequisites.AstrogoblinsLvl75]),
    ),
    GammaSector: sectors.GammaSector.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.SpacePirates,
            requirement: 20, // Target: 20
            // equals Battle #47
        }]),
    ),
    DeltaSector: sectors.DeltaSector.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.AstralSharks,
            requirement: 5, // Target: 10
            // equals Battle #85
        }]),
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
            requirements: [new OperationLevelRequirement('playthrough',
                [{
                    operation: moduleOperations.StandbyGenerator,
                    requirement: 1
                }]),
            ],
        }),
    gridStrengthElements: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().byId('gridLabel'),
                Dom.get().byId('gridStrength'),
            ],
            requirements: [new AttributeRequirement('playthrough',
                [{
                    attribute: attributes.gridStrength,
                    requirement: 1
                }]),
            ],
        }),
    industryDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().bySelector('#attributesDisplay > [data-attribute="industry"]'),
            ],
            requirements: [new OperationLevelRequirement('playthrough',
                [{operation: moduleOperations.FourDPrinter, requirement: 1}]),
            ],
        }),
    growthDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().bySelector('#attributesDisplay > [data-attribute="growth"]'),
            ],
            requirements: [new OperationLevelRequirement('playthrough',
                [{operation: moduleOperations.MicroCyborgAutomat, requirement: 1}]),
            ],
        }),
    militaryDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().bySelector('#attributesDisplay > [data-attribute="military"]'),
            ],
            requirements: [new OperationLevelRequirement('playthrough',
                [{operation: moduleOperations.KungFuManual, requirement: 1}]),
            ],
        }),
    battleTabButton: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().byId('battleTabButton')],
            requirements: prerequisites.KungFuManualLvl10,
            elementsToShowRequirements: [Dom.get().byId('battleTabButtonRequirements')],
            prerequisites: [moduleOperationRequirements.KungFuManual],
        }),
    dangerDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().bySelector('#attributesDisplay > [data-attribute="danger"]'),
                Dom.get().bySelector('#attributesDisplay > [data-attribute="heat"]'),
                Dom.lazy().allBySelector('#unfinishedBattles .level3 .danger, #unfinishedBattles .level4 .danger'),
                ...Dom.get().allByClass('battles-pose-danger'),
            ],
            requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{
                faction: factions.NovaFlies,
                requirement: battles.NovaFlies10.targetLevel,
            }])],
        }),
    completedBattles: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.lazy().byId('finishedBattles'),
            ],
            requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{
                faction: factions.NovaFlies,
                requirement: battles.NovaFlies10.targetLevel,
            }])],
        }),
    researchDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().bySelector('#attributesDisplay > [data-attribute="research"]'),
            ],
            requirements: [new AttributeRequirement('playthrough', [{
                attribute: attributes.research,
                requirement: 0.01,
            }])],
        }),
    locationTabButton: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().byId('locationTabButton')],
            requirements: [new OperationLevelRequirement('playthrough', [{
                operation: moduleOperations.PocketLaboratory,
                requirement: 10,
            }])],
            elementsToShowRequirements: [Dom.get().byId('locationTabButtonRequirements')],
            prerequisites: [moduleOperationRequirements.PocketLaboratory],
        }),
    attributesTabButton: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().byId('attributesTabButton')],
            requirements: [new AttributeRequirement(
                'playthrough',
                [{
                    attribute: attributes.research,
                    requirement: 10,
                }],
                prerequisites.attributeUnlocked.research,
            )],
            elementsToShowRequirements: [Dom.get().byId('attributesTabButtonRequirements')],
            // Same as for LocationTabButton
            prerequisites: [new OperationLevelRequirement('playthrough', [{
                operation: moduleOperations.PocketLaboratory,
                requirement: 10,
            }])],
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
            requirements: [new AttributeRequirement('playthrough', [{
                attribute: attributes.essenceOfUnknown,
                requirement: 1,
            }])],
            elementsToShowRequirements: [],
        }),
    essenceOfUnknownLabel: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().bySelector('#galacticSecretsTabButton > .primary-stat')],
            requirements: [new AttributeRequirement('update', [{
                attribute: attributes.essenceOfUnknown,
                requirement: 1,
            }])],
            elementsToShowRequirements: [],
        }),
};
