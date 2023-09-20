const prefixes = [
    'Ancestral',
    'Arcane',
    'Ascended',
    'Astral',
    'Celestial',
    'Chosen',
    'Cosmic',
    'Crystal',
    'Dark',
    'Doomed',
    'Eldritch',
    'Eternal',
    'Ethereal',
    'First',
    'Galactic',
    'Haunted',
    'Immortal',
    'Impenetrable',
    'Interplanetary',
    'Last',
    'Lunar',
    'Mystic',
    'Orbital',
    'Unescapable',
];
const shortAbstractWords = [
    'Doom',
    'Fate',
    'Light',
    'Null',
    'Shadow',
    'Storm',
    'Void',
    'War',
];
let longAbstractWords = [
    'Chaos',
    'Death',
    'Destruction',
    'Force',
    'Immortality',
    'Inferno',
    'Tempest',
    'Terror',
    'Twilight',
    'Vengeance',
];

const shortSpaceReferences = [
    'Cloud',
    'Moon',
    'Sky',
    'Space',
    'Star',
    'Thunder',
    'Warp',
];
const longSpaceReferences = [
    'Asteroid',
    'Deep Space',
    'Galaxy',
    'Nebula',
    'Orbit',
    'Outer Space',
    'Planet',
    'Supernova',
];

const places = [
    'Bastion',
    'Castle',
    'Citadel',
    'City',
    'Colony',
    'Fortress',
    'Haven',
    'Home',
    'Megalopolis',
    'Metropolis',
    'Outpost',
    'Palace',
    'Port',
    'Sanctum',
    'Stronghold',
    'Town',
    'Watch',
];
const shortStationTypes = [
    'Base',
    'Forge',
    'Gate',
    'Keep',
    'Port',
    'Spire',
];
const longStationTypes = [
    'Asylum',
    'Citadel',
    'Commando Base',
    'Crucible',
    'Fortress',
    'Haven',
    'Lighthouse',
    'Nexus',
    'Observatory',
    'Outpost',
    'Pharos',
    'Pinnacle',
    'Sanctum',
    'Spire',
    'Station',
];
/**
 * Actually space references that could also indicate a giant space station.
 */
const oversizedStationTypes = [
    'Asteroid',
    'Earth',
    'Moon',
    'Orb',
    'Portal',
    'Rock',
    'Star',
];

const abstractStations = [
    'Conflux',
    'Defense',
    'Destroyer',
    'Dome',
    'Machine',
    'Phalanx',
    'Plate',
    'Prism',
    'Prison',
    'Throne',
    'War Machine',
];
const colorWords = [
    'Black',
    'Blue',
    'Dark',
    'Neon',
    'Red',
];

const elementWords = [
    'Fire',
    'Laser',
    'Light',
    'Steel',
    'Stone',
    'Storm',
    'Stream',
];

// TODO unused words, could be integrated later on
// const uncategorized = [
//     'neutreon power',
// ];
// const longColor = [
//     'Purple',
//     'Violett',
// ];
// const mythicalReferences = [
//     'Fenris',
//     'Elysium',
//     'Tartarus',
//     'Empyrean'
// ];
// const moreSuffices = [
//     'Reborn',
//     'United',
//     'in the sky',
//     'of Chaos',
// ];
// end of unused words

const numberWords = [
    'Zero',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve'
];

const unevenNumbers = [1, 3, 5, 7, 9, 11, 13].map(number => String(number));
const thousands = [3, 5, 7, 9].map(number => String(1000 * number));

/**
 * Prime numbers and 11*n
 */
const interestingNumbers = [
    11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97,
    22, 33, 44, 55, 66, 77, 88, 99
];

const yearNumbers = interestingNumbers
    .map(number => _.random(2, 9) * 1000 + number)
    .map(number => String(number));

const latinOrdinalNumbers = [
    'Primus',
    'Secundus',
    'Tertius',
    'Quartus',
    'Quintus',
    'Sextus',
    'Septimus',
    'Octavus',
    'Nonus',
    'Decimus'
];

const romanNumbers = [ // Excluded numbers are too long/unaesthetic
    1, 2, 3, 4, 5, 6, 7,/* 8, */ 9, 10,
    11, 12/*,13*/, 14, 15, 16/*,17,18*/, 19
].map(convertToRoman);

const hairSpace = '\u200A';

const numbering = () => [
    new NameGenerator('Any Number Display')
        .add([
            numberWords,
            romanNumbers,
            unevenNumbers,
            thousands,
            yearNumbers,
            latinOrdinalNumbers
        ])
        .bound(),
    new NameGenerator('Letter Separator Number')
        .add('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''))
        .skipSeparator()
        .add(['-', '_', hairSpace + '|' + hairSpace, '/', ':'])
        .skipSeparator()
        .add([
            unevenNumbers,
            thousands,
        ])
        .bound(),
    new NameGenerator('Letter Separator Roman number')
        .add('ABCDEGHJKLMNOPQRSTUW'.split(''))
        .skipSeparator()
        .add(['-', hairSpace + '|' + hairSpace, ':'])
        .skipSeparator()
        .add(romanNumbers)
        .bound()
];
