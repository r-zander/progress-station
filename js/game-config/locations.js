'use strict';

/**
 * @type {Object<PointOfInterest>}
 */
const pointsOfInterest = {
    SafeZone: new PointOfInterest({
        title: 'Safe Zone',
        description: 'Let\'s take a breather and regroup.',
        effects: [
            /*
             * Not IndustryFactor as the player doesn't have any industry
             * yet, so multiplying it would yield still 0 industry
             */
            {effectType: EffectType.Industry, baseValue: 1},
            {effectType: EffectType.Danger, baseValue: 0}],
        modifiers: [],
    }),
    StarlightEnclave: new PointOfInterest({
        title: 'Starlight Enclave',
        description: 'A cosmic ballet of stars creates a breathtaking celestial display. The radiant starlight powers the station. ' +
            'Additionally, this point of interest is known for advanced stargazing technology, attracting astronomers and enthusiasts from across the galaxy.',
        effects: [
            {effectType: EffectType.Energy, baseValue: 10},
            {effectType: EffectType.GrowthFactor, baseValue: 0},
            {effectType: EffectType.ResearchFactor, baseValue: 0.5},
            {effectType: EffectType.Danger, baseValue: 5}],
        modifiers: [],
    }),
    GrowthLocationLow: new PointOfInterest({
        title: 'Fizzy Nebula',
        description: 'A cloud of space gas that literally bubbles. Perfect for cool selfies and fizzy drinks.',
        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 4},
            {effectType: EffectType.IndustryFactor, baseValue: -0.3},
            {effectType: EffectType.Danger, baseValue: 25}],
        modifiers: [],
    }),
    // TODO replace research with Energy
    ResearchLocationLow: new PointOfInterest({
        title: 'The Mirror Vortex',
        description: 'A collection of mini wormholes that show reflections of alternate realities.',
        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 0.3},
            {effectType: EffectType.IndustryFactor, baseValue: -0.1},
            {effectType: EffectType.EnergyFactor, baseValue: 3},
            {effectType: EffectType.Danger, baseValue: 25}],
        modifiers: [],
    }),

    IndustryLocationMedium: new PointOfInterest({
        title: 'The Sneezy Supernova',
        description: 'A star about to go boom, but it\'s taking its sweet time. Stellar resources available, with a risk.',
        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 0},
            {effectType: EffectType.IndustryFactor, baseValue: 9},
            {effectType: EffectType.EnergyFactor, baseValue: -0.2},
            {effectType: EffectType.Danger, baseValue: 50}],
        modifiers: [],
    }),
    ResearchLocationMedium: new PointOfInterest({
        title: 'Whispering Moons',
        description: 'Twin moons that supposedly whisper space secrets. Good for intel, if you can decipher the murmurs.',
        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 0.2},
            {effectType: EffectType.IndustryFactor, baseValue: -0.2},
            {effectType: EffectType.EnergyFactor, baseValue: 9},
            {effectType: EffectType.Danger, baseValue: 250}],
        modifiers: [],
    }),
    GrowthLocationMedium: new PointOfInterest({
        title: 'Crystal Gardens',
        description: 'Fields of glowing, crystal flora. Harvestable as a powerful snack, but they\'re a bit... temperamental.',
        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 9},
            {effectType: EffectType.IndustryFactor, baseValue: -0.2},
            {effectType: EffectType.Danger, baseValue: 500}],
        modifiers: [],
    }),

    IndustryLocationHigh: new PointOfInterest({
        title: 'The Shadow Bazaar',
        description: 'A market run by actual shadows. Trade at your own risk, they\'re known for tricky deals.',
        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 0},
            {effectType: EffectType.IndustryFactor, baseValue: 19},
            {effectType: EffectType.EnergyFactor, baseValue: -0.2},
            {effectType: EffectType.Danger, baseValue: 1000}],
        modifiers: [],
    }),
    ResearchLocationHigh: new PointOfInterest({
        title: 'Sonic Quasar',
        description: 'Emits deadly sound waves. Great for advanced tech parts if you can withstand the noise.',
        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 0.2},
            {effectType: EffectType.IndustryFactor, baseValue: -0.2},
            {effectType: EffectType.EnergyFactor, baseValue: 19},
            {effectType: EffectType.Danger, baseValue: 3000}],
        modifiers: [],
    }),
    GrowthLocationHigh: new PointOfInterest({
        title: 'Orbiting Oasis',
        description: 'A rare paradise with vital resources. Also a popular hangout for not-so-friendly giant space beasts.',
        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 19},
            {effectType: EffectType.IndustryFactor, baseValue: -0.2},
            {effectType: EffectType.Danger, baseValue: 5000}],
        modifiers: [],
    }),

    IndustryLocationExtreme: new PointOfInterest({
        title: 'Nebula of Forgotten Ships',
        description: 'A graveyard of ancient spacecrafts, rumored to be haunted. Treasure trove of tech and secrets, but eerily guarded.',
        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 0},
            {effectType: EffectType.IndustryFactor, baseValue: 49},
            {effectType: EffectType.EnergyFactor, baseValue: -0.2},
            {effectType: EffectType.Danger, baseValue: 10000}],
        modifiers: [],
    }),
    ResearchLocationExtreme: new PointOfInterest({
        title: 'The Singing Black Hole',
        description: 'It doesn\'t just destroy; it serenades you into oblivion. Unique insights if you dare to listen.',
        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 0.2},
            {effectType: EffectType.IndustryFactor, baseValue: -0.2},
            {effectType: EffectType.EnergyFactor, baseValue: 49},
            {effectType: EffectType.Danger, baseValue: 30000}],
        modifiers: [],
    }),
    GrowthLocationExtreme: new PointOfInterest({
        title: 'Void\'s Edge',
        description: 'The edge of known space. Navigation is tricky, and reality behaves oddly here.',
        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 49},
            {effectType: EffectType.IndustryFactor, baseValue: -0.2},
            {effectType: EffectType.Danger, baseValue: 50000}],
        modifiers: [],
    }),
};

const defaultPointOfInterest =  pointsOfInterest.SafeZone;

/**
 * @type {Object<Sector>}
 */
const sectors = {
    // Twilight
    AlphaSector: new Sector({
        title: 'Alpha Sector',
        color: '#ECA545',
        pointsOfInterest: [pointsOfInterest.SafeZone, pointsOfInterest.StarlightEnclave, pointsOfInterest.GrowthLocationLow],
    }),
    BetaSector: new Sector({
        title: 'Beta Sector',
        color: '#56BA5A',
        pointsOfInterest: [pointsOfInterest.IndustryLocationMedium, pointsOfInterest.ResearchLocationMedium, pointsOfInterest.GrowthLocationMedium],
    }),
    GammaSector: new Sector({
        title: 'Gamma Sector',
        color: '#1C92D0',
        pointsOfInterest: [pointsOfInterest.IndustryLocationHigh, pointsOfInterest.ResearchLocationHigh, pointsOfInterest.GrowthLocationHigh],
    }),
    DeltaSector: new Sector({
        title: 'Delta Sector',
        color: '#E64E4D',
        pointsOfInterest: [pointsOfInterest.IndustryLocationExtreme, pointsOfInterest.ResearchLocationExtreme, pointsOfInterest.GrowthLocationExtreme],
    }),
};
