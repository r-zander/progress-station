'use strict';

const prefixes = [
    'Algebraic', // Adventure Time
    'Alphanumeric', // Adventure Time
    'Astronomical',
    'Blissful',
    'Bouncy',
    'Celestial',
    'Cheerful',
    'Comical',
    'Cosmic',
    'Crystal',
    'Dreamy', // Red Dwarf
    'Eccentric',
    'Ecstatic',
    'Enchanted', // Adventure Time
    'Energetic',
    'Enthusiastic',
    'Eternal',
    'Ethereal',
    'Euphoric',
    'Extra',
    'Fanciful',
    'Far-Out',
    'Forever',
    'Funky', // Adventure Time
    'Galactic',
    'Greasy', // Adventure Time
    'Groovy', // Adventure Time
    'Hopeful',
    'Interstellar',
    'Jolly',
    'Jubilant',
    'Lower',
    'Ludicrous', // Spaceballs
    'Lunar',
    'Magical', // Adventure Time
    'Mathematical', // Adventure Time
    'Mega',
    'Mirthful',
    'Mystic',
    'New New', // Futurama
    'New', // Futurama
    'Optimistic',
    'Orbital',
    'Outlandish',
    'Pantless',
    'Playful',
    'Quirky',
    'Radiant',
    'Radical', // Adventure Time
    'Rhombus', // Adventure Time
    'Snacky', // Adventure Time
    'Spiral',
    'Starry',
    'Sunny',
    'Super',
    'Surreal',
    'Ultra',
    'Upper',
    'Wacky', // Adventure Time
    'Wandering',
    'Whimsical', // Adventure Time
    'Whimsy', // Adventure Time
    'Wholesome',
    'Yogaballs', // Adventure Time
    'Zany', // Adventure Time
];
const shortAbstractWords = [
    'Babel', // The Hitchhiker's Guide to the Galaxy
    'Beach',
    'Bow', // Adventure Time
    'Dream', // Adventure Time
    'Fun', // Adventure Time
    'Glee',
    'Hope',
    // 'Joy', // Adventure Time -- REMOVED seems adult, unless correctly combined
    'Light',
    'Love',
    'Play',
    'Quest', // Galaxy Quest
    'Quirk',
    'Rain', // Adventure Time
    'Schmutz',
    // 'Toy', -- REMOVED seems adult
];
let longAbstractWords = [
    'Adventure', // Adventure Time
    'Babbling', // The Hitchhiker's Guide to the Galaxy
    'Biscuit',
    'Bliss',
    'Cats',
    // 'Ecstasy',  -- REMOVED seems adult, unless correctly combined
    'Eternity',
    'Euphoria',
    'Euphorium',
    'Express', // Futurama
    'Fantasy', // Adventure Time
    'Felicity',
    'Folly',
    'Grease',
    'Harmony',
    'Imagination', // Adventure Time
    'Junk',
    'Laughter', // Adventure Time
    'Magic',
    'Melon heart',
    'Nuts',
    'Odyssey',
    'Pants',
    'Paradise',
    'Peeps',
    'Quirks',
    'Radiance',
    'Rhombus',
    'Serenity',
    'Serenium',
    'Smiles',
    'Spiral',
    'Sunshine',
    'Twilight',
    'Unity',
    'Uplift',
    'Utopia',
    'Utopium',
    'Wonder', // Adventure Time
    'Yogaballs',
];

const shortSpaceReferences = [
    'Cloud',
    'Jet',
    'Moon',
    'Nova',
    'Sky',
    'Space',
    'Star',
    'Sun',
];
const longSpaceReferences = [
    'Asteroid',
    'Exoplanet',
    'Galaxy',
    'Jetstream',
    'Nebula',
    'Orbit',
    'Outer Space',
    'Planet',
    'Planetoid',
    'Quasar',
    'Supernova',
    'Universe',
];

const places = [
    'Bastion',
    'Burg',
    'Castle',
    'Citadel',
    'City',
    'Cove',
    'Dungeon',
    'Forest', // Adventure Time
    'Haven',
    'Hills',
    'Home',
    'House', // Adventure Time
    'Hut',
    'Kingdom', // Adventure Time
    'Knowhere', // Guardians of the Galaxy
    'Land', // Adventure Time
    'Oasis',
    'Outpost',
    'Palace',
    'Port',
    'Restaurant', // The Hitchhiker's Guide to the Galaxy
    'Ridge',
    'Sanctum',
    'Springs',
    'Town',
    'Tree', // Adventure Time
    'Vaultopolis',
    'Ville',
    'Watch',
    'York', // Futurama
];
const shortStationTypes = [
    'Base',
    'Core',
    'Gate',
    'Hub',
    'Icon',
    'Keep',
    'Plex',
    'Port',
    'Ship',
    'Tex',
    'Topia',
    'Tron',
];
const longStationTypes = [
    'Citadel',
    'Engine',
    'Explorer',
    'Haven',
    'Lighthouse',
    'Navigator',
    'Observatory',
    'Outpost',
    'Pinnacle',
    'Station',
    'UFO', // actually short, but an abbreviation
];
/**
 * Actually space references that could also indicate a giant space station.
 */
const oversizedStationTypes = [
    'Antiplanet',
    'Asteroid',
    'Earth',
    'Moon',
    'Orb',
    'Portal',
    'Protoplanet',
    'Rock',
    'Star',
    'World',
];

const abstractStations = [
    'Ball', // Spaceballs
    // 'Bug', // Red Dwarf -- REMOVED as it seems to weird
    'Corps', // Guardians of the Galaxy
    'Donut', // Futurama
    'Dreamer',
    'Eden',
    'Funhouse', // Adventure Time
    'Guardian',
    'Playground', // Adventure Time
    'Point',
    'Prism',
    'Protector', // Galaxy Quest
    'Throne',
    'Vault',
    'Wanderer',
];
const colorWords = [
    'Bliss',
    'Blue',
    'Joy',
    'Lemon', // Adventure Time
    'Neon',
    'Pink',
    'Rose',
];

const elementWords = [
    'Candy', // Adventure Time
    'Dust',
    'Fire',
    'Hopium',
    'Ice', // Adventure Time
    'Laser',
    'Light',
    'Plasma',
    'Spark',
    'Stream',
];

// TODO unused words, could be integrated later on
const moreWords = [
    'End of the Universe', // The Hitchhiker's Guide to the Galaxy
    '42', // The Hitchhiker's Guide to the Galaxy
];
// end of unused words

const numberWords = [
    'One',
    'Two',
    'Three',
    'Seven',
    'Eleven',
];

const unevenNumbers = [2, 3, 7, 13].map(number => String(number));
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

const romanNumbers = [
    1, 2, 3, 5, 10,
].map(convertToRoman);

const numbering = () => [
    new NameGenerator('Any Number Display')
        .add([
            numberWords,
            romanNumbers,
            unevenNumbers,
            thousands,
            yearNumbers,
        ])
        .bound(),
];
