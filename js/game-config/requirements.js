'use strict';

/**
 * @type {Object<Requirement>}
 */
const moduleOperationRequirements = {
    FourDPrinter: moduleOperations.FourDPrinter.registerRequirement(
        new AttributeRequirement('playthrough', [{
            attribute: attributes.gridStrength,
            requirement: 1
        }])
    ),
    MicroCyborgAutomat: moduleOperations.MicroCyborgAutomat.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.FourDPrinter,
            requirement: 10
        }])
    ),
    KungFuManual: moduleOperations.KungFuManual.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.MicroCyborgAutomat,
            requirement: 10
        }])
    ),
    PocketLaboratory: moduleOperations.PocketLaboratory.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.Astrogoblins,
            requirement: battles.Astrogoblins10.targetLevel + battles.Astrogoblins20.targetLevel,
        }])
    ),
    HeavyGlitz: moduleOperations.HeavyGlitz.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.SpaceRocks,
            requirement: 10,
        }])
    ),
    Radiance: moduleOperations.Radiance.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.HeavyGlitz,
            requirement: 100,
        }])
    ),
    AsteroidChomper: moduleOperations.AsteroidChomper.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.BigSpinny,
            requirement: 10,
        }])
    ),
    TenDrills: moduleOperations.TenDrills.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.AsteroidChomper,
            requirement: 100,
        }])
    ),
    Diesel: moduleOperations.Diesel.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.Garbage,
            requirement: 10,
        }])
    ),
    FuelT3: moduleOperations.FuelT3.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.Diesel,
            requirement: 10,
        }])
    ),
    Quasarite: moduleOperations.Quasarite.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.FuelT3,
            requirement: 100,
        }])
    ),
    Steel: moduleOperations.Steel.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.Plastics,
            requirement: 10,
        }])
    ),
    ProductsT3: moduleOperations.ProductsT3.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.Steel,
            requirement: 10,
        }])
    ),
    MicroalloyGlass: moduleOperations.MicroalloyGlass.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.ProductsT3,
            requirement: 100,
        }])
    ),
    Recruitment: moduleOperations.Recruitment.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.Survivors,
            requirement: 10,
        }])
    ),
    SmoochSanctuary: moduleOperations.SmoochSanctuary.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.Recruitment,
            requirement: 10,
        }])
    ),
    MechanoMaker: moduleOperations.MechanoMaker.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.SmoochSanctuary,
            requirement: 10,
        }])
    ),
    ReplicationChambers: moduleOperations.ReplicationChambers.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.MechanoMaker,
            requirement: 100,
        }])
    ),
    IndividualRooms: moduleOperations.IndividualRooms.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.ToughLife,
            requirement: 10,
        }])
    ),
    WayOfLifeT3: moduleOperations.WayOfLifeT3.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.IndividualRooms,
            requirement: 10,
        }])
    ),
    SecretWayOfLife: moduleOperations.SecretWayOfLife.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.WayOfLifeT3,
            requirement: 100,
        }])
    ),
    PulseShield: moduleOperations.PulseShield.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.GlitzPlating,
            requirement: 10,
        }])
    ),
    BulletSponge: moduleOperations.BulletSponge.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.PulseShield,
            requirement: 10,
        }])
    ),
    LaserTurrets: moduleOperations.LaserTurrets.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.RapidRumbleTower,
            requirement: 10,
        }])
    ),
    AntiMissileSwarm: moduleOperations.AntiMissileSwarm.registerRequirement(
        new OperationLevelRequirement('playthrough', [{
            operation: moduleOperations.LaserTurrets,
            requirement: 10,
        }])
    ),
};

/**
 * @type {Object<Requirement>}
 */
const modulesRequirements = {
    CaptainsQuarter: modules.CaptainsQuarter.registerRequirement(
        new AttributeRequirement('playthrough', [{
            attribute: attributes.gridStrength,
            requirement: 1
        }])
    ),
    MiningBay: modules.MiningBay.registerRequirement(
        new AttributeRequirement('playthrough', [{
            attribute: attributes.gridStrength,
            requirement: 2
        }])
    ),
    Furnace1: modules.Furnace.registerRequirement(
        new AttributeRequirement('playthrough', [{
            attribute: attributes.gridStrength,
            requirement: 4
        }])
    ),
    Furnace2: modules.Furnace.registerRequirement(
        new PointOfInterestVisitedRequirement('playthrough', [{
            pointOfInterest: pointsOfInterest.StarlightEnclave
        }])
    ),
    Defensive: modules.Defensive.registerRequirement(
        new AttributeRequirement('playthrough', [{
            attribute: attributes.gridStrength,
            requirement: 6
        }])
    ),
    Quarters: modules.Quarters.registerRequirement(
        new AttributeRequirement('playthrough', [{
            attribute: attributes.gridStrength,
            requirement: 8
        }])
    ),
};

/**
 * @type {Object<Requirement>}
 */
const pointsOfInterestRequirements = {
    StarlightEnclave: pointsOfInterest.StarlightEnclave.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.Astrogoblins,
            requirement: 5
        }])
    ),
    GrowthLocationLow: pointsOfInterest.GrowthLocationLow.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.CometCrawlers,
            requirement: 10
        }])
    ),
    IndustryLocationMedium: pointsOfInterest.IndustryLocationMedium.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.Scavengers,
            requirement: 10
        }])
    ),
    ResearchLocationMedium: pointsOfInterest.ResearchLocationMedium.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.SpacePirates,
            requirement: 10
        }])
    ),
    GrowthLocationMedium: pointsOfInterest.GrowthLocationMedium.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.Astrogoblins,
            requirement: 50
        }])
    ),
    IndustryLocationHigh: pointsOfInterest.IndustryLocationHigh.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.NovaFlies,
            requirement: 50
        }])
    ),
    ResearchLocationHigh: pointsOfInterest.ResearchLocationHigh.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.AstralSharks,
            requirement: 10
        }])
    ),
    GrowthLocationHigh: pointsOfInterest.GrowthLocationHigh.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.ThunderDragon,
            requirement: 10
        }])
    ),
    IndustryLocationExtreme: pointsOfInterest.IndustryLocationExtreme.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.SpacePirates,
            requirement: 300
        }])
    ),
    ResearchLocationExtreme: pointsOfInterest.ResearchLocationExtreme.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.AstralSharks,
            requirement: 50
        }])
    ),
    GrowthLocationExtreme: pointsOfInterest.GrowthLocationExtreme.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.ThunderDragon,
            requirement: 50
        }])
    ),
};

/**
 * @type {Object<Requirement>}
 */
const sectorsRequirements = {
    GrowthLocationExtreme: sectors.BetaSector.registerRequirement(
        new FactionLevelsDefeatedRequirement('playthrough', [{
            faction: factions.Astrogoblins,
            requirement: 30
        }])
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
                [{operation: moduleOperations.StandbyGenerator, requirement: 1}]),
            ],
        }),
    gridStrengthElements: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().byId('gridLabel'),
                Dom.get().byId('gridStrength'),
            ],
            requirements: [new AttributeRequirement('playthrough',
                [{attribute: attributes.gridStrength, requirement: 1}]),
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
            requirements: [new OperationLevelRequirement('playthrough', [{
                operation: moduleOperations.KungFuManual,
                requirement: 10,
            }])],
            elementsToShowRequirements: [Dom.get().byId('battleTabButtonRequirements')],
            prerequirements: [moduleOperationRequirements.KungFuManual],
        }),
    dangerDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().bySelector('#attributesDisplay > [data-attribute="danger"]'),
                Dom.get().bySelector('#attributesDisplay > [data-attribute="heat"]'),
                Dom.lazy().allBySelector('#battles .level3 .danger, #battles .level4 .danger'),
            ],
            requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{
                faction: factions.Astrogoblins,
                requirement: battles.Astrogoblins10.targetLevel,
            }])],
        }),
    researchDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().bySelector('#attributesDisplay > [data-attribute="research"]'),
            ],
            requirements: [new FactionLevelsDefeatedRequirement('playthrough', [{
                faction: factions.Astrogoblins,
                requirement: battles.Astrogoblins10.targetLevel + battles.Astrogoblins20.targetLevel,
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
            prerequirements: [moduleOperationRequirements.PocketLaboratory],
        }),
    attributesTabButton: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().byId('attributesTabButton')],
            requirements: [new AttributeRequirement('playthrough', [{
                attribute: attributes.research,
                requirement: 10,
            }])],
            elementsToShowRequirements: [Dom.get().byId('attributesTabButtonRequirements')],
            // Same as for LocationTabButton
            prerequirements: [new OperationLevelRequirement('playthrough', [{
                operation: moduleOperations.PocketLaboratory,
                requirement: 10,
            }])],
        }),
    galacticSecretsTabButton: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().byId('galacticSecretsTabButton')],
            requirements: [new AttributeRequirement('playthrough', [{
                attribute: attributes.essenceOfUnknown,
                requirement: 1,
            }])],
            elementsToShowRequirements: []
        }),
    essenceOfUnknownLabel: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().bySelector('#galacticSecretsTabButton > .primary-stat')],
            requirements: [new AttributeRequirement('update', [{
                attribute: attributes.essenceOfUnknown,
                requirement: 1,
            }])],
            elementsToShowRequirements: []
        }),
};
