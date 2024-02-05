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
    ReplicationChambers: new GalacticSecret({
        unlocks: moduleOperations.ReplicationChambers,
    }),
    SecretWayOfLife: new GalacticSecret({
        unlocks: moduleOperations.SecretWayOfLife,
    }),
    AntiMissileSwarm: new GalacticSecret({
        unlocks: moduleOperations.AntiMissileSwarm,
    }),
};
