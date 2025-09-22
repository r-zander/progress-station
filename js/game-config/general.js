'use strict';

// TODO replace with requestAnimationFrame for smoothest experience
const updateSpeed = 20;

const startCycle = 100000;
const bossAppearanceCycle = 15_000;

const emptyStationName = 'Unknown Station';

// Not const to allow easy game speed increase
// TODO change before release
let baseGameSpeed = 4;

const magnitudes = ['', 'k', 'M', 'B', 'T', 'q', 'Q', 'Sx', 'Sp', 'Oc'];
const metricPrefixes = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'R'];
const units = {
    energy: 'W',
    storedEnergy: 'Wh'
};

/**
 * Base heat that is always present.
 *
 * @type {number}
 * @since 1.1.2 Reduced base heat from 0.1 to 0.0
 */
const SPACE_BASE_HEAT = 0.0;
