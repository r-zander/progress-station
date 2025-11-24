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

sharedRequirements.FourDPrinterLvl10 = new OperationLevelRequirement('playthrough', {
    operation: moduleOperations.FourDPrinter,
    requirement: 10,
});
sharedRequirements.CoreBladeLvl10 = new OperationLevelRequirement('playthrough', {
    operation: moduleOperations.KungFuManual,
    requirement: 10,
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
    [sharedRequirements.CoreBladeLvl10],
);
sharedRequirements.PocketLaboratoryLvl10 = new OperationLevelRequirement(
    'playthrough',
    {
        operation: moduleOperations.PocketLaboratory,
        requirement: 10,
    },
    [sharedRequirements.NovaFliesLvl20],
);
sharedRequirements.GridStrengtLvl2 = new AttributeRequirement('playthrough', {
    attribute: attributes.gridStrength,
    requirement: 2,
});
sharedRequirements.StarlightEnclaveVisited = new PointOfInterestVisitedRequirement('playthrough', {
    pointOfInterest: pointsOfInterest.StarlightEnclave,
});
sharedRequirements.AstrogoblinsLvl75 = new FactionLevelsDefeatedRequirement('playthrough', {
    faction: factions.Astrogoblins,
    requirement: 10 + 20 + 30 + 50 + 75, // All battles before Lvl 100
});
