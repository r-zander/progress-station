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
sharedRequirements.PocketLaboratoryLvl1 = new OperationLevelRequirement(
    'playthrough',
    {
        operation: moduleOperations.PocketLaboratory,
        requirement: 1,
    },
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
sharedRequirements.essenceOfUnknowFound = new AttributeRequirement('permanent', {
    attribute: attributes.essenceOfUnknown,
    requirement: 1,
});
// A bit weird, there but creating a new Requirement type just for this case feels worse
sharedRequirements.bossDefeated = new FactionLevelsDefeatedRequirement('permanent', {
    faction: factions.Boss,
    requirement: bossBattle.targetLevel,
});
sharedRequirements.bossDefeated.toHtmlInternal = () => {
    return `defeat <span class="name">${bossBattle.title}</span>`;
};
