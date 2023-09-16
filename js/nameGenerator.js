const prefixes = [
    'Ancestral',
    'Arcane',
    'Astral',
    'Celestial',
    'Cosmic',
    'Crystal',
    'Dark',
    'Doomed',
    'Ethereal',
    'Haunted',
    'Immortal',
    'Lunar',
    'Mystic',
    'Orbital',
    'Interplanetary'
];
const core_words = ['Arcane', 'Tempest', 'Fate', 'Chaos', 'Terror', 'Doom', 'Twilight', 'Death'];
const more_suffices = ['of Chaos'];

const abstractStation = ['Throne', 'Plate', 'Phalanx', 'Dome'];
const relevantObject = ['Rock'];

const shortStationType = ['Base', 'Forge', 'Spire', 'Port'];
const shortSpaceRef = ['Star', 'Space', 'Moon', 'Cloud', 'Sky'];
const longSpaceRef = ['Nebula', 'Planet', 'Orbit', 'Asteroid', 'Supernova', 'Deep Space'];
const spaceRef = [...shortSpaceRef, ...longSpaceRef];

const place = ['Town', 'City', 'Metropolis', 'Megalopolis', 'Fortress', 'Outpost', 'Haven', 'Port', 'Citadel', 'Sanctum'];
const longStationType = ['Citadel', 'Sanctum', 'Nexus', 'Fortress', 'Station', 'Outpost', 'Spire', 'Haven', 'Port', 'Keep', 'Pharos', 'Lighthouse'];
const stationType = [...shortStationType, ...longStationType];
const color = ['Black', 'Red', 'Dark', 'Blue'];
const longColor = ['Purple', 'Violett'];
const commonObjects = ['Stone', 'Stream', 'Steel', 'Laser'];
const uncommonObjects = ['Rock', 'Orb', 'Portal'];

// https://dundaxiancodex.fandom.com/wiki/Notable_Locations


mythicalReferences = ['Fenris', 'Elysium', 'Tartarus', 'Empyrean'];
// dark galactic skies
// dark wings of steel
// Home of Laser and Steel
// Darkstorm Galaxy --> andere Worte können zusammengesetzt werden um "eigenname" zu bilden
// Galaxy Destruction Force
// The Last Defense
// The First Strike
// Unescapable Prison

// PREFIX?
// Astral Storm
// Warpfire
// Thunderblade
// Galactic Prism
// Necrovoid
// Aetherian
// Eldritch
// Infernoth

// CORE WORDS?
// Observatory
// Warforge
// Warpkeep
// Arcanium
// Vortexarium
// Shadowgate

// SUFFIX?
// Haven
// Watch
// Conflux
// Bastion
// Resonance
// Crucible
// Nexus
// Sanctum
// Pinnacle
// Asylum

/*
* Patterns
*
* ✅ |Station Type|
*   Examples
*       Starbase
*       Phalanx
*
* ✅ |1 syllable Space Reference||1 syllable Station Type|
*   Examples
*       Starbase
*       Mooncitadel --> nope
*       Spacesanctum --> nope
*       Starstation --> maybe
*       Starforge
*       Spaceport
*
* ✅ |Space Reference| |Settlement| --> questionable quality
*   Examples
*       Cloud City
*       Space Town
*       Space Colony
*
* |Station Type| |Point of Interest|
*   Examples
*       Port Maw
*       Port Wander
*       Port Sanctus
*   TODO: needs sector names
*
* [Prefix] |Point of Interest| |Station Type|
*   Examples
*       Death Star
* ✅       Blackstone Fortress
*
* ✅ [Prefix] |Core| |Number|
*   |Number| = (Zero...One...Twelve) | (roman number) | (A...Z)(-_|)(0 < 2n+1 < 12) | (Latin Ordinal Numbers: Primus, secundus, Tertius, quartus,quintus, sextus, septimus, octavus, nonus,decimus) | (2+)0(Primzahl oder 11n)
*   Examples
*       Deep Space Nine
*       Starbase 1
*       Space Station K-7
* */

const numberWord = [
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

const unevenNumber = [1, 3, 5, 7, 9, 11].map(number => String(number));

/**
 * Prime numbers and 11*n
 * @type {number[]}
 */
const interestingNumber = [
    11,
    13,
    17,
    19,
    23,
    29,
    31,
    37,
    41,
    43,
    47,
    53,
    59,
    61,
    67,
    71,
    73,
    79,
    83,
    89,
    97,

    22,
    33,
    44,
    55,
    66,
    77,
    88,
    99
];

const yearNumber = interestingNumber.map(number => String((2 + randomInt(7)) * 1000 + number));

const latinOrdinalNumber = [
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

const romanMatrix = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I']
];
const thousands = [3, 5, 7, 9].map(number => String(1000 * number));

function convertToRoman(num) {
    if (num === 0) {
        return '';
    }
    for (let i = 0; i < romanMatrix.length; i++) {
        if (num >= romanMatrix[i][0]) {
            return romanMatrix[i][1] + convertToRoman(num - romanMatrix[i][0]);
        }
    }
}

const romanNumber = [
    1, 2, 3, 4, 5, 6, 7,/* 8, */ 9, 10,
    11, 12/*,13*/, 14, 15, 16/*,17,18*/, 19
].map(convertToRoman);

class NameGenerator {
    #maxLength = 20;
    #separator = ' ';
    #parts = [];
    #skipNextSeparator = false;
    #lowercasePartIndex = [];

    /**
     * @param {number} maxLength
     * @return {NameGenerator} this
     */
    maxLength(maxLength) {
        this.#maxLength = maxLength;
        return this;
    }

    /**
     * @param {string} separator
     * @return {NameGenerator} this
     */
    separator(separator) {
        this.#separator = separator;
        return this;
    }

    /**
     *
     * @param {string|any[]|function(): any} namePart
     * @return {NameGenerator} this
     */
    add(namePart) {
        if (this.#parts.length > 0) {
            if (!this.#skipNextSeparator) {
                this.#parts.push(this.#separator);
            } else {
                this.#skipNextSeparator = false;
            }
        }
        this.#parts.push(namePart);
        return this;
    }

    /**
     * @return {NameGenerator} this
     */
    skipSeparator() {
        this.#skipNextSeparator = true;
        return this;
    }

    /**
     * @return {NameGenerator} this
     */
    lowercaseNextLetter() {
        this.#lowercasePartIndex.push(this.#parts.length);
        return this;
    }

    /**
     * @return {string} a built name
     */
    generate() {
        return this.#parts.map(this.#generatePart.bind(this)).join('');
    }

    /**
     * @param {string|any[]|function(): any} namePart
     * @param index original index of the part
     */
    #generatePart(namePart, index) {
        if (!namePart) {
            return '';
        }

        // Strings are just used - they are the exit condition for the recursive loop
        if (typeof namePart === 'string') {
            if (this.#lowercasePartIndex.includes(index)) {
                return namePart.substr(0, 1).toLowerCase() + namePart.substr(1);
            }
            return namePart;
        }

        // Functions are resolved and then handled recursively
        if (typeof namePart === 'function') {
            return this.#generatePart(namePart(), index);
        }

        // Array has to be checked before object, as all arrays are objects as well
        // A random element inside the array is picked and then handled recursively
        if (Array.isArray(namePart)) {
            return this.#generatePart(namePart[randomInt(namePart.length)], index);
        }

        // All values of an object are joined into an array which in turn is handled recursively
        // e.g. { a: ['1', '2'], b: ['3', '4'] } --> [['1','2'], ['3','4']] --> (randomly) ['3','4'] --> randomly '4'
        if (typeof namePart === 'object') {
            return this.#generatePart(Object.values(namePart), index);
        }
    }

    bound() {
        return this.generate.bind(this);
    }
}

const hairSpace = '\u200A';

const numberGenerator = new NameGenerator()
    .add([
        numberWord,
        romanNumber,
        unevenNumber,
        thousands,
        yearNumber,
        latinOrdinalNumber
    ])
    .bound();
const letterPlusNumberGenerator = new NameGenerator()
    .add('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''))
    .skipSeparator()
    .add(['-', '_', hairSpace + '|' + hairSpace, '/', ':'])
    .skipSeparator()
    .add([
        unevenNumber,
        thousands,
    ])
    .bound();

const romanNumberGenerator = new NameGenerator()
    .add('ABCDEGHJKLMNOPQRSTUW'.split(''))
    .skipSeparator()
    .add(['-', ':', hairSpace + '|' + hairSpace, '|'])
    .skipSeparator()
    .add(romanNumber)
    .bound();

const optionalNumbering = ['', numberGenerator, letterPlusNumberGenerator, romanNumberGenerator];
const superNameGenerator = new NameGenerator()
    .add([
        new NameGenerator()
            .add(shortSpaceRef)
            .skipSeparator()
            .lowercaseNextLetter()
            .add(shortStationType)
            .add(optionalNumbering)
            .bound(),
        new NameGenerator()
            .add(prefixes)
            .add(shortSpaceRef)
            .skipSeparator()
            .lowercaseNextLetter()
            .add(shortStationType)
            .add(optionalNumbering)
            .bound(),
        new NameGenerator()
            .add([shortSpaceRef, longSpaceRef])
            .add(place)
            .add(optionalNumbering)
            .bound(),
        new NameGenerator()
            .add(color)
            .skipSeparator()
            .lowercaseNextLetter()
            .add(commonObjects)
            .add(stationType)
            .add(optionalNumbering)
            .bound(),
        new NameGenerator()
            .add(prefixes)
            .add(longStationType)
            .add(optionalNumbering)
            .bound(),
        new NameGenerator()
            .add(core_words)
            .add([spaceRef, stationType])
            .add(optionalNumbering)
            .bound()
    ]);

// TODO allow for "optionalAdd"?
// TODO Have "prefix" OR "suffix" but at least one of those
// TODO allow for tracing of name generation --> which "decisions" have been made by the generator
