'use strict';

function mergeWordLists(...lists) {
    return _.union(_.flatten(lists));
}

const abstractWords = mergeWordLists(shortAbstractWords, longAbstractWords);
const spaceReferences = mergeWordLists(shortSpaceReferences, longSpaceReferences);
const stationTypes = mergeWordLists(shortStationTypes, longStationTypes);




class NameGenerator {
    #name = '';
    #maxLength = 20;
    #separator = ' ';
    #parts = [];
    #skipNextSeparator = false;
    #lowercasePartIndex = [];

    constructor(name = '') {
        this.#name = name;
    }

    getName() {
        return this.#name;
    }

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
     *
     * @param {string|any[]|function(): any} namePart
     * @return {NameGenerator} this
     */
    addOptional(namePart) {
        return this.add(['', namePart]);
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
        return this.#parts.map(this.#generatePart.bind(this)).join('').trim();
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
                return _.lowerFirst(namePart);
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


const stationNameGenerator = new NameGenerator()
    .add([
        /**
         * Examples:
         *  Astral Starbase
         *  Eternal Spaceport K-7
         *  Ancestral Shadowbase G-IV
         *  Eldrith Thunderforge
         *  Last Stormport
         */
        new NameGenerator('[Prefix] (Abstract|Space)Station [Number]')
            .add(prefixes)
            .add([shortAbstractWords, shortSpaceReferences])
            .skipSeparator()
            .lowercaseNextLetter()
            .add(shortStationTypes)
            .addOptional(numbering)
            .bound(),

        /**
         * Examples:
         *  Cloud City
         *  Space Town II
         *  Space Colony 2088
         */
        new NameGenerator('Space Place [Number]')
            .add(spaceReferences)
            .add(places)
            .addOptional(numbering)
            .bound(),

        /**
         * Examples
         *  The Galaxy Spire
         *  The Deep Space Outpost
         *  The Star Crucible
         */
        new NameGenerator('The Space Station')
            .add('The')
            .add(spaceReferences)
            .add(longStationTypes)
            .bound(),
        /**
         * Examples
         *  Space Station K-7
         *  Moon Spire 9044
         *  Sky Citadel V:1
         *  Asteroid Nexus 7000
         */
        new NameGenerator('Space Station Number')
            .add(spaceReferences)
            .add(longStationTypes)
            .add(numbering)
            .bound(),

        /**
         * Examples
         *  Blacksteel Haven T:3000
         *  Blackstone Fortress
         *  Neonstorm Outpost U/7000
         *  Darkfire Observatory
         */
        new NameGenerator('ColorElement Station [Number]')
            .add(colorWords)
            .skipSeparator()
            .lowercaseNextLetter()
            .add(elementWords)
            .add(stationTypes)
            .addOptional(numbering)
            .bound(),

        /**
         * Examples:
         *  Immortal Citadel
         *  Unescapable Nexus
         *  Astral Outpost D:IX
         *  Arcane Sanctum XV
         */
        new NameGenerator('Prefix Station [Number]')
            .add(prefixes)
            .add(longStationTypes)
            .addOptional(numbering)
            .bound(),

        /**
         * Examples:
         *  Death Star
         *  Neon Moon
         *  Void Asylum 13
         *  Shadow Earth S|7000
         */
        new NameGenerator('(Abstract|Color)(Star|Station) [Number]')
            .add([abstractWords, colorWords])
            .add([oversizedStationTypes, stationTypes])
            .addOptional(numbering)
            .bound(),

        /**
         * Examples:
         *  The Moon Defense
         *  The Chaos Phalanx
         *  The Death Throne
         *  The Supernova Prison
         */
        new NameGenerator('The (Abstract|Color)(Star|Station)')
            .add('The')
            .add([abstractWords, spaceReferences])
            .add(abstractStations)
            .bound(),
        /**
         * Examples:
         *  Outer Space Defense Primus
         *  Warp Destroyer D:X
         *  Tempest Prison 2055
         *  Star Machine V-9000
         */
        new NameGenerator('(Abstract|Color)(Star|Station) [Number]')
            .add([abstractWords, spaceReferences])
            .add(abstractStations)
            .add(numbering)
            .bound(),

        /**
         * Examples
         *  Starfire Base V
         *  Warpstorm Observatory
         *  Thunderstorm Keep XII
         *  Spacelight Asylum H-11
         */
        new NameGenerator('SpaceElement Station [Number]')
            .add(shortSpaceReferences)
            .skipSeparator()
            .lowercaseNextLetter()
            .add(elementWords)
            .add(stationTypes)
            .addOptional(numbering)
            .bound()

        /**
         * TODO Sector based names
         * Examples
         *  Port Maw
         *  Port Wander
         *  Neptune Haven
         */
    ]);

// TODO Have "prefix" OR "suffix" but at least one of those
// TODO allow for tracing of name generation --> which "decisions" have been made by the generator
