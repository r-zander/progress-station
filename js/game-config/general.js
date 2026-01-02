'use strict';

const targetTicksPerSecond = 20;

const cycleDurationInSeconds = 1; /* At gameSpeed of 1. It gets divided by the actual game speed. */
const startCycle = 100_000;
const bossAppearanceCycle = 15_000;

const emptyStationName = 'Unknown Station';

// Not const to allow easy game speed increase
let baseGameSpeed = 4.0;

const magnitudes = [
    '', 'k', 'M', 'B', 'T', 'q', 'Q', 'Sx', 'Sp', 'Oc',
    'No', 'Dc', 'UDc', 'DDc', 'TDc', 'qDc', 'QDc', 'SDc', 'SpDc', 'ODc'
];
const metricPrefixes = [
    '', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'R', 'Q',
    'X', 'W', 'V', 'U'
];
const units = {
    energy: 'W',
    storedEnergy: 'Wh',
    experience: 'XP'
};

/**
 * Applies to all tasks, including Grid Strength, Module Operations and Battles - unless defined otherwise.
 * @type {number}
 */
const BASE_XP_GAIN = 10;

function getPopulationProgressSpeedMultiplier() {
    // +------------+----------------+
    // | Population | Progress Speed |
    // +------------+----------------+
    // |          1 |           1    |
    // |          2 |           1.25 |
    // |          3 |           1.44 |
    // |          5 |           1.70 |
    // |         10 |           2.15 |
    // |         20 |           2.71 |
    // |         50 |           3.68 |
    // |         75 |           4.21 |
    // |        100 |           4.64 |
    // |        200 |           5.84 |
    // |        500 |           7.93 |
    // |        750 |           9.08 |
    // |       1000 |           9.99 |
    // |       2000 |          12.5  |
    // |       5000 |          17.0  |
    // |       7500 |          19.5  |
    // |        10k |          21.5  |
    // |        20k |          27.1  |
    // |         1M |         100    |
    // |         2M |         125    |
    // |        20B |        2714    |
    // |       100B |       46415    |
    // |     196.5T |       58137    |
    // +------------+----------------+
    return Math.max(1, Math.pow(Math.round(gameData.population), 1 / 3.00));
}
