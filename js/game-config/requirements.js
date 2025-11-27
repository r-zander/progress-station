'use strict';



/**
 * @type {Object<Requirement>}
 * NOTE: Operation requirements are now handled by the Technology system (see technologies.js)
 * Technology objects automatically register TechnologyRequirements on operations when created
 */
const moduleOperationRequirements = {
    // I.S.A.S.M
    // Rescue Capsule
    FourDPrinter: moduleOperations.FourDPrinter.registerRequirement(
        sharedRequirements.attributeGridStrength1,
    ),

    // CAPTAIN'S QUARTER
    // TinyToolbox
    PocketLaboratory: moduleOperations.PocketLaboratory.registerRequirement(
        sharedRequirements.FourDPrinterLvl10,
    ),
};

/**
 * @type {Object<Requirement>}
 * NOTE: Module requirements are now handled by the Technology system (see technologies.js)
 * Technology objects automatically register TechnologyRequirements on modules when created
 */
const modulesRequirements = {
    CaptainsQuarter: modules.CaptainsQuarter.registerRequirement(
        sharedRequirements.FourDPrinterLvl10,
    ),
};

/**
 * @type {Object<Requirement>}
 * NOTE: Point of Interest requirements are now handled by the Technology system (see technologies.js)
 * Technology objects automatically register TechnologyRequirements on POIs when created
 */
const pointsOfInterestRequirements = {
    StarlightEnclave: pointsOfInterest.StarlightEnclave.registerRequirement(
        sharedRequirements.NovaFliesLvl20,
    ),
};

/**
 * @type {Object<Requirement>}
 * NOTE: Sector requirements are now handled by the Technology system (see technologies.js)
 * Technology objects automatically register TechnologyRequirements on sectors when created
 */
const sectorsRequirements = {};

/**
 * Requirements of arbitrary {@link HTMLElement}s in the layout.
 * NOTE: These now check if the corresponding Technology is unlocked (see technologies.js)
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
    researchDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().bySelector('#attributesDisplay > [data-attribute="research"]'),
            ],
            requirements: [sharedRequirements.PocketLaboratoryLvl1],
        }),
    galacticSecretsTabButton: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().byId('galacticSecretsTabButton')],
            requirements: [sharedRequirements.PocketLaboratoryLvl1],
            elementsToShowRequirements: [Dom.get().byId('galacticSecretsTabButtonRequirements')],
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
            requirements: [new TechnologyRequirement({technology: technologies.battleTabButton})],
            elementsToShowRequirements: [Dom.get().byId('battleTabButtonRequirements')],
        }),
    dangerDisplay: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                Dom.get().bySelector('#attributesDisplay > [data-attribute="danger"]'),
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
    locationTabButton: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().byId('locationTabButton')],
            requirements: [new TechnologyRequirement({technology: technologies.locationTabButton})],
            elementsToShowRequirements: [Dom.get().byId('locationTabButtonRequirements')],
        }),
    battleMultiEngageHelp: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [
                ...Dom.get().allByClass('multiple-battles'),
            ],
            requirements: [battleRequirements[0]],
        }),
    // TODO figure out essence of unknown integration with Technology
    essenceOfUnknownLabel: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.get().bySelector('#galacticSecretsTabButton > .primary-stat[data-attribute="essenceOfUnknown"]')],
            requirements: [new AttributeRequirement('update', {
                attribute: attributes.essenceOfUnknown,
                requirement: 1,
            })],
            elementsToShowRequirements: [],
        }),
    galacticSecretsSection: new HtmlElementWithRequirement({
        elementsWithRequirements: [Dom.get().byId('galacticSecretsSection')],
        requirements: [sharedRequirements.essenceOfUnknowFound],
        elementsToShowRequirements: [],
    }),
    essenceOfUnknownHistory: new HtmlElementWithRequirement(
        {
            elementsWithRequirements: [Dom.lazy().bySelector('#attributeRows > tr.essenceOfUnknown')],
            requirements: [sharedRequirements.essenceOfUnknowFound],
            elementsToShowRequirements: [],
        }),
};
