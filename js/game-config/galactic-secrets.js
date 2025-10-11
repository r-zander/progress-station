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
    Quasarite: new GalacticSecret({
        unlocks: moduleOperations.Quasarite,
    }),
    MicroalloyGlass: new GalacticSecret({
        unlocks: moduleOperations.MicroalloyGlass,
    }),
    BulletSponge: new GalacticSecret({
        unlocks: moduleOperations.BulletSponge,
    }),
    AntiMissileSwarm: new GalacticSecret({
        unlocks: moduleOperations.AntiMissileSwarm,
    }),
    ReplicationChambers: new GalacticSecret({
        unlocks: moduleOperations.ReplicationChambers,
    }),
    GloryToTheGreatHeroes: new GalacticSecret({
        unlocks: moduleOperations.GloryToTheGreatHeroes,
    }),
};
