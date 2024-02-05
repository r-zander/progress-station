'use strict';

// TODO replace with requestAnimationFrame for smoothest experience
const updateSpeed = 20;

const startCycle = 100000;
const bossAppearanceCycle = 15_000;

const dangerColors = [
    new Color([0, 128, 0], 'RGB'),    // 0% color: dark green
    new Color([255, 255, 0], 'RGB'),  // 50% color: yellow
    new Color([219, 92, 92], 'RGB'),    // 100% color: red
];

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

const colorPalette = {
    EasyGreen: '#55A630',
    HappyBlue: '#219EBC',
    TomatoRed: '#E63946',
    DangerRed: 'rgb(200, 0, 0)',
    DepressionPurple: '#4A4E69',
    // 'Fundamentals': '#4A4E69',
    // 'Combat': '#FF704D',
    // 'Magic': '#875F9A',
    // 'Dark magic': '#73000F',
    // 'Misc': '#B56576',
    White: '#FFFFFF',
};

/*
 * HOW TO Big Numbers
 *
 *           100_000
 *         1_000_000
 *         7_500_000
 *        40_000_000
 *       150_000_000
 * 1_000_000_000_000
 */
