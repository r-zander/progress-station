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
        title: 'GrowthLocationLow',

        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 4},
            {effectType: EffectType.IndustryFactor, baseValue: -0.3},
            {effectType: EffectType.Danger, baseValue: 25}],
        modifiers: [],
    }),

    IndustryLocationMedium: new PointOfInterest({
        title: 'IndustryLocationMedium',

        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 0},
            {effectType: EffectType.IndustryFactor, baseValue: 9},
            {effectType: EffectType.ResearchFactor, baseValue: -0.2},
            {effectType: EffectType.Danger, baseValue: 50}],
        modifiers: [],
    }),
    ResearchLocationMedium: new PointOfInterest({
        title: 'ResearchLocationMedium',

        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 0.2},
            {effectType: EffectType.IndustryFactor, baseValue: -0.2},
            {effectType: EffectType.ResearchFactor, baseValue: 9},
            {effectType: EffectType.Danger, baseValue: 250}],
        modifiers: [],
    }),
    GrowthLocationMedium: new PointOfInterest({
        title: 'GrowthLocationMedium',

        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 9},
            {effectType: EffectType.IndustryFactor, baseValue: -0.2},
            {effectType: EffectType.Danger, baseValue: 500}],
        modifiers: [],
    }),

    IndustryLocationHigh: new PointOfInterest({
        title: 'IndustryLocationHigh',

        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 0},
            {effectType: EffectType.IndustryFactor, baseValue: 19},
            {effectType: EffectType.ResearchFactor, baseValue: -0.2},
            {effectType: EffectType.Danger, baseValue: 1000}],
        modifiers: [],
    }),
    ResearchLocationHigh: new PointOfInterest({
        title: 'ResearchLocationHigh',

        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 0.2},
            {effectType: EffectType.IndustryFactor, baseValue: -0.2},
            {effectType: EffectType.ResearchFactor, baseValue: 19},
            {effectType: EffectType.Danger, baseValue: 3000}],
        modifiers: [],
    }),
    GrowthLocationHigh: new PointOfInterest({
        title: 'GrowthLocationHigh',

        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 19},
            {effectType: EffectType.IndustryFactor, baseValue: -0.2},
            {effectType: EffectType.Danger, baseValue: 5000}],
        modifiers: [],
    }),

    IndustryLocationExtreme: new PointOfInterest({
        title: 'IndustryLocationExtreme',

        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 0},
            {effectType: EffectType.IndustryFactor, baseValue: 49},
            {effectType: EffectType.ResearchFactor, baseValue: -0.2},
            {effectType: EffectType.Danger, baseValue: 10000}],
        modifiers: [],
    }),
    ResearchLocationExtreme: new PointOfInterest({
        title: 'ResearchLocationExtreme',

        effects: [
            {effectType: EffectType.GrowthFactor, baseValue: 0.2},
            {effectType: EffectType.IndustryFactor, baseValue: -0.2},
            {effectType: EffectType.ResearchFactor, baseValue: 49},
            {effectType: EffectType.Danger, baseValue: 30000}],
        modifiers: [],
    }),
    GrowthLocationExtreme: new PointOfInterest({
        title: 'GrowthLocationExtreme',

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
