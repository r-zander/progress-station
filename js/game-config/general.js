'use strict';

const targetTicksPerSecond = 20;

const cycleDurationInSeconds = 1; /* At gameSpeed of 1. It gets divided by the actual game speed. */
const startCycle = 100_000;
const bossAppearanceCycle = 15_000;

const emptyStationName = 'Unknown Station';

// Not const to allow easy game speed increase
let baseGameSpeed = 3.0;

const magnitudes = ['', 'k', 'M', 'B', 'T', 'q', 'Q', 'Sx', 'Sp', 'Oc'];
const metricPrefixes = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'R'];
const units = {
    energy: 'W',
    storedEnergy: 'Wh'
};

/**
 * Applies to all tasks, including Grid Strength, Module Operations and Battles - unless defined otherwise.
 * @type {number}
 */
const BASE_XP_GAIN = 10;
