'use strict';

const galacticSecretUnlockDuration = 2500; // milliseconds

/**
 * @type {Object.<string, GalacticSecret>}
 */
const galacticSecrets = {
    Radiance: new GalacticSecret({
        unlocks: moduleOperations.Radiance,
    }),
    TenDrills: new GalacticSecret({
        unlocks: moduleOperations.TenDrills,
    }),
    BossFertilizer: new GalacticSecret({
        unlocks: moduleOperations.BossFertilizer,
    }),
    PlasmidSequencer: new GalacticSecret({
        unlocks: moduleOperations.PlasmidSequencer,
    }),
    Quasarite: new GalacticSecret({
        unlocks: moduleOperations.Quasarite,
    }),
    MicroalloyGlass: new GalacticSecret({
        unlocks: moduleOperations.MicroalloyGlass,
    }),
    BulletSponge: new GalacticSecret({
        unlocks: moduleOperations.BulletSponge,
    }),
    AntiMaterialSwarm: new GalacticSecret({
        unlocks: moduleOperations.AntiMaterialSwarm,
    }),
    ReplicationChambers: new GalacticSecret({
        unlocks: moduleOperations.ReplicationChambers,
    }),
    GloryToTheGreatHeroes: new GalacticSecret({
        unlocks: moduleOperations.GloryToTheGreatHeroes,
    }),
};
