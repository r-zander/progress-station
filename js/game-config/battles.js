'use strict';

/**
 * @type {number}
 */
const BATTLE_BASE_XP_GAIN = BASE_XP_GAIN;

/**
 * @type {Object<FactionDefinition>}
 */
const factions = {
    NovaFlies: {
        title: 'Nova Flies', maxXp: 50,
        description: 'Similar to earth\'s long lost fireflies, these bugs are glowing on their own. Experiencing their gigantic numbers and blinding brightness quickly explains the name.',
    },
    Astrogoblins: {
        title: 'Astrogoblins', maxXp: 200,
        description: 'Mischievous beings that can be found in every corner of the galaxy, Astrogoblins zip around in makeshift spacecrafts, armed with primitive weapons and a liking for interstellar chaos.'
    },
    CometCrawlers: {
        title: 'Comet Crawlers', maxXp: 400,
        description: 'These beagle-sized beetles travel on the surface of comets as they are attracted by metal alloys that are unfortunately also commonly found in space stations. They will attack in large numbers if they sense one of their own being harmed.'
    },
    Scavengers: {
        title: 'Scavengers', maxXp: 2_500,
        description: 'Outcasts from civilizations across the galaxy, Scavengers form nomadic crews, dressed in distinctive leather attire. Masters of illicit trade and makeshift tech, they roam, seeking quick profits through heists and elusive alliances.'
    },
    MeteorMaws: {
        title: 'Meteor Maws', maxXp: 7_500,
        description: 'Gigantic, worm-like beings that burrow through meteors and small moons, leaving characteristic holes. They are attracted to the vibrations of engines and can engulf smaller vessels whole.'
    },
    SpacePirates: {
        title: 'Space Pirates', maxXp: 20_000,
        description: 'Buccaneers sailing the astral seas, Space Pirates are notorious for their flashy ships, over-the-top personalities, and the relentless pursuit of rare space booty.'
    },
    StarMantas: {
        title: 'Star Mantas', maxXp: 50_000,
        description: 'Majestic creatures that glide through the vacuum of space, their vast wingspans absorb cosmic radiation. Often mistaken for celestial phenomena, they can be fiercely territorial.'
    },
    VoidVikings: {
        title: 'Void Vikings', maxXp: 200_000,
        description: 'Clad in dark matter armor, Void Vikings raid across the galaxy in search of glory and cosmic runes. Their battle cries resonate through the vacuum, freezing the hearts of their foes.'
    },
    ThunderDragon: {
        title: 'Thunder Dragon', maxXp: 500_000,
        description: 'Roaming the storm nebula, Thunder Dragons are colossal beings of electric energy. Lightning crackles across their scales as they soar through the interstellar space.'
    },
    AstralSharks: {
        title: 'Astral Sharks', maxXp: 1_500_000,
        description: 'Legends of the cosmic deep, Astral Sharks glide through space with celestial fins and stardust-infused teeth. They\'re the titans of the galactic oceans.'
    },

    Boss: {
        title: 'Boss', maxXp: 3_000_000_000,
        description: 'An immense, dark mass of writhing tentacles, teeth and a thousand eyes. The vacuum of space around the station suppresses all noise, ' +
            'but you can feel the hatred of the alien beast and see its determination to destroy everything you have built up.'
    },
};

/**
 * @type {EffectDefinition}
 */
const standardBattleMilitaryReward = {effectType: EffectType.MilitaryFactor, baseValue: 0.05};

/**
 * @type {Object<Battle>}
 */
const battles = {
    NovaFlies10: new Battle({
        title: 'Harmless',
        targetLevel: 10,
        difficulty: 1,
        faction: factions.NovaFlies,
        effects: [{effectType: EffectType.Danger, baseValue: 0}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 1},
        ],
    }),
    NovaFlies20: new Battle({
        title: 'Stray',
        targetLevel: 20,
        difficulty: 1,
        faction: factions.NovaFlies,
        effects: [{effectType: EffectType.Danger, baseValue: 1}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 1},
            standardBattleMilitaryReward,
        ],
    }),
    Astrogoblins10: new Battle({
        title: 'Wimpy',
        targetLevel: 10,
        difficulty: 2,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 2}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 2},
            standardBattleMilitaryReward,
        ],
    }),
    NovaFlies30: new Battle({
        title: 'Glowing',
        targetLevel: 30,
        difficulty: 1,
        faction: factions.NovaFlies,
        effects: [{effectType: EffectType.Danger, baseValue: 4}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 2},
            standardBattleMilitaryReward,
        ],
    }),
    Astrogoblins20: new Battle({
        title: 'Courageous',
        targetLevel: 20,
        difficulty: 1.5,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 6}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 3},
            standardBattleMilitaryReward,
        ],
    }),
    NovaFlies50: new Battle({
        title: 'Dazzling',
        targetLevel: 50,
        difficulty: 1,
        faction: factions.NovaFlies,
        effects: [{effectType: EffectType.Danger, baseValue: 7}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 3},
            standardBattleMilitaryReward,
        ],
    }),
    Astrogoblins30: new Battle({
        title: 'Trained',
        targetLevel: 30,
        difficulty: 1,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 10}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 4},
            standardBattleMilitaryReward,
        ],
    }),
    CometCrawlers10: new Battle({
        title: 'Handful of',
        targetLevel: 10,
        difficulty: 3,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 15}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 3},
            standardBattleMilitaryReward,
        ],
    }),
    NovaFlies75: new Battle({
        title: 'Numerous',
        targetLevel: 75,
        difficulty: 1,
        faction: factions.NovaFlies,
        effects: [{effectType: EffectType.Danger, baseValue: 25}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 4},
            standardBattleMilitaryReward,
        ],
    }),
    NovaFlies100: new Battle({
        title: 'Blinding',
        targetLevel: 100,
        difficulty: 1,
        faction: factions.NovaFlies,
        effects: [{effectType: EffectType.Danger, baseValue: 40}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 6},
            standardBattleMilitaryReward,
        ],
    }),
    Astrogoblins50: new Battle({
        title: 'Fearless',
        targetLevel: 50,
        difficulty: 1.2,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 50}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 6},
            standardBattleMilitaryReward,
        ],
    }),
    CometCrawlers20: new Battle({
        title: 'Small swarm of',
        targetLevel: 20,
        difficulty: 2.5,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 60}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 4},
            standardBattleMilitaryReward,
        ],
    }),
    NovaFlies150: new Battle({
        title: 'Magnificent',
        targetLevel: 150,
        difficulty: 1,
        faction: factions.NovaFlies,
        effects: [{effectType: EffectType.Danger, baseValue: 80}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 9},
            standardBattleMilitaryReward,
        ],
    }),
    Astrogoblins75: new Battle({
        title: 'Bold',
        targetLevel: 75,
        difficulty: 1,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 100}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 5},
            standardBattleMilitaryReward,
        ],
    }),
    CometCrawlers30: new Battle({
        title: 'Starving',
        targetLevel: 30,
        difficulty: 8,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 120}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 6},
            standardBattleMilitaryReward,
        ],
    }),
    Scavengers10: new Battle({
        title: 'Lost',
        targetLevel: 10,
        difficulty: 25,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 150}],
        rewards: [
            {effectType: EffectType.ResearchFactor, baseValue: 0.01},
            standardBattleMilitaryReward,
        ],
    }),
    NovaFlies200: new Battle({
        title: 'Countless',
        targetLevel: 200,
        difficulty: 1,
        faction: factions.NovaFlies,
        effects: [{effectType: EffectType.Danger, baseValue: 200}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 14},
            standardBattleMilitaryReward,
        ],
    }),
    Astrogoblins100: new Battle({
        title: 'Feral',
        targetLevel: 100,
        difficulty: 4,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 250}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 13},
            standardBattleMilitaryReward,
        ],
    }),
    NovaFlies300: new Battle({
        title: 'Second Sun',
        targetLevel: 300,
        difficulty: 1,
        faction: factions.NovaFlies,
        effects: [{effectType: EffectType.Danger, baseValue: 300}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 20},
            standardBattleMilitaryReward,
        ],
    }),
    Astrogoblins150: new Battle({
        title: 'Rogue',
        targetLevel: 150,
        difficulty: 3,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 400}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 19},
            standardBattleMilitaryReward,
        ],
    }),
    CometCrawlers50: new Battle({
        title: 'Aggressive',
        targetLevel: 50,
        difficulty: 10,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 500}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 9},
            standardBattleMilitaryReward,
        ],
    }),
    Scavengers20: new Battle({
        title: 'Violent',
        targetLevel: 20,
        difficulty: 50,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 700}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 6},
            standardBattleMilitaryReward,
        ],
    }),
    Astrogoblins200: new Battle({
        title: 'Savage',
        targetLevel: 200,
        difficulty: 1,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 900}],
        rewards: [
            {effectType: EffectType.ResearchFactor, baseValue: 0.01},
            standardBattleMilitaryReward,
        ],
    }),
    CometCrawlers75: new Battle({
        title: 'Swarming',
        targetLevel: 75,
        difficulty: 40,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 1_000}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 13},
            standardBattleMilitaryReward,
        ],
    }),
    NovaFlies500: new Battle({
        title: 'Super',
        targetLevel: 500,
        difficulty: 1,
        faction: factions.NovaFlies,
        effects: [{effectType: EffectType.Danger, baseValue: 1_500}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 29},
            standardBattleMilitaryReward,
        ],
    }),
    MeteorMaws10: new Battle({
        title: 'Two',
        targetLevel: 10,
        difficulty: 500,
        faction: factions.MeteorMaws,
        effects: [{effectType: EffectType.Danger, baseValue: 2_000}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 5},
            standardBattleMilitaryReward,
        ],
    }),
    Scavengers30: new Battle({
        title: 'Lunatic',
        targetLevel: 30,
        difficulty: 20,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 2_500}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 8},
            standardBattleMilitaryReward,
        ],
    }),
    Astrogoblins300: new Battle({
        title: 'Merciless',
        targetLevel: 300,
        difficulty: 1,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 3_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 39},
            standardBattleMilitaryReward,
        ],
    }),
    CometCrawlers100: new Battle({
        title: 'Nozzling',
        targetLevel: 100,
        difficulty: 40,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 3_500}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 19},
            standardBattleMilitaryReward,
        ],
    }),
    NovaFlies750: new Battle({
        title: 'Mega',
        targetLevel: 750,
        difficulty: 0.2,
        faction: factions.NovaFlies,
        effects: [{effectType: EffectType.Danger, baseValue: 8_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 41},
            standardBattleMilitaryReward,
        ],
    }),
    CometCrawlers150: new Battle({
        title: 'Glitz eating',
        targetLevel: 150,
        difficulty: 30,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 4_500}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 28},
            standardBattleMilitaryReward,
        ],
    }),
    Scavengers50: new Battle({
        title: 'Reckless',
        targetLevel: 50,
        difficulty: 150,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 5_000}],
        rewards: [
            {effectType: EffectType.ResearchFactor, baseValue: 0.01},
            standardBattleMilitaryReward,
        ],
    }),
    NovaFlies1000: new Battle({
        title: 'Ultra',
        targetLevel: 1000,
        difficulty: 0.75,
        faction: factions.NovaFlies,
        effects: [{effectType: EffectType.Danger, baseValue: 5_500}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 60},
            standardBattleMilitaryReward,
        ],
    }),
    Astrogoblins500: new Battle({
        title: 'Horde of',
        targetLevel: 500,
        difficulty: 50,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 6_000}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 57},
            standardBattleMilitaryReward,
        ],
    }),
    MeteorMaws20: new Battle({
        title: 'Hungry',
        targetLevel: 20,
        difficulty: 20000,
        faction: factions.MeteorMaws,
        effects: [{effectType: EffectType.Danger, baseValue: 7_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 7},
            standardBattleMilitaryReward,
        ],
    }),
    CometCrawlers200: new Battle({
        title: 'Endless',
        targetLevel: 200,
        difficulty: 800,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 8_000}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 41},
            standardBattleMilitaryReward,
        ],
    }),
    Scavengers75: new Battle({
        title: 'Insatiable',
        targetLevel: 75,
        difficulty: 5000,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 9_000}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 18},
            standardBattleMilitaryReward,
        ],
    }),
    Astrogoblins750: new Battle({
        title: 'Legendary',
        targetLevel: 750,
        difficulty: 10,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 10_000}],
        rewards: [
            {effectType: EffectType.ResearchFactor, baseValue: 0.01},
            standardBattleMilitaryReward,
        ],
    }),
    MeteorMaws30: new Battle({
        title: 'Gobbling',
        targetLevel: 30,
        difficulty: 200_000,
        faction: factions.MeteorMaws,
        effects: [{effectType: EffectType.Danger, baseValue: 15_000}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 11},
            standardBattleMilitaryReward,
        ],
    }),
    SpacePirates10: new Battle({
        title: 'Roaming',
        targetLevel: 10,
        difficulty: 100_000,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 25_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 6},
            standardBattleMilitaryReward,
        ],
    }),
    CometCrawlers300: new Battle({
        title: 'Infestation of',
        targetLevel: 300,
        difficulty: 400,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 50_000}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 59},
            standardBattleMilitaryReward,
        ],
    }),
    Scavengers100: new Battle({
        title: 'Ruthless',
        targetLevel: 100,
        difficulty: 25_000,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 75_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 26},
            standardBattleMilitaryReward,
        ],
    }),
    Astrogoblins1000: new Battle({
        title: 'Apocalyptic',
        targetLevel: 1000,
        difficulty: 1,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 100_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 120},
            standardBattleMilitaryReward,
        ],
    }),
    MeteorMaws50: new Battle({
        title: 'Clew of',
        targetLevel: 50,
        difficulty: 50_000,
        faction: factions.MeteorMaws,
        effects: [{effectType: EffectType.Danger, baseValue: 150_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 15},
            standardBattleMilitaryReward,
        ],
    }),
    Scavengers150: new Battle({
        title: 'Marauding',
        targetLevel: 150,
        difficulty: 50_000,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 200_000}],
        rewards: [
            {effectType: EffectType.ResearchFactor, baseValue: 0.01},
            standardBattleMilitaryReward,
        ],
    }),
    CometCrawlers500: new Battle({
        title: 'Ravaging',
        targetLevel: 500,
        difficulty: 50,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 225_000}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 86},
            standardBattleMilitaryReward,
        ],
    }),
    SpacePirates20: new Battle({
        title: 'Organized',
        targetLevel: 20,
        difficulty: 200_000,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 250_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 9},
            standardBattleMilitaryReward,
        ],
    }),
    Scavengers200: new Battle({
        title: 'Void-Bound',
        targetLevel: 200,
        difficulty: 5_000,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 275_000}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 54},
            standardBattleMilitaryReward,
        ],
    }),
    MeteorMaws75: new Battle({
        title: 'Devouring',
        targetLevel: 75,
        difficulty: 50_000,
        faction: factions.MeteorMaws,
        effects: [{effectType: EffectType.Danger, baseValue: 300_000}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 22},
            standardBattleMilitaryReward,
        ],
    }),
    CometCrawlers750: new Battle({
        title: 'All-munching',
        targetLevel: 750,
        difficulty: 50,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 325_000}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 124},
            standardBattleMilitaryReward,
        ],
    }),
    SpacePirates30: new Battle({
        title: 'Cruising',
        targetLevel: 30,
        difficulty: 500_000,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 350_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 13},
            standardBattleMilitaryReward,
        ],
    }),
    MeteorMaws100: new Battle({
        title: 'Radiant',
        targetLevel: 100,
        difficulty: 100_000,
        faction: factions.MeteorMaws,
        effects: [{effectType: EffectType.Danger, baseValue: 375_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 32},
            standardBattleMilitaryReward,
        ],
    }),
    StarMantas10: new Battle({
        title: 'Peaceful',
        targetLevel: 10,
        difficulty: 10_000_000,
        faction: factions.StarMantas,
        effects: [{effectType: EffectType.Danger, baseValue: 400_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 7},
            standardBattleMilitaryReward,
        ],
    }),
    Scavengers300: new Battle({
        title: 'Army of',
        targetLevel: 300,
        difficulty: 10_000,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 425_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 79},
            standardBattleMilitaryReward,
        ],
    }),
    CometCrawlers1000: new Battle({
        title: 'Eclipsing',
        targetLevel: 1000,
        difficulty: 50,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 450_000}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 180},
            standardBattleMilitaryReward,
        ],
    }),
    MeteorMaws150: new Battle({
        title: 'Glitz hardened',
        targetLevel: 150,
        difficulty: 100_000,
        faction: factions.MeteorMaws,
        effects: [{effectType: EffectType.Danger, baseValue:500_000}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 47},
            standardBattleMilitaryReward,
        ],
    }),
    SpacePirates50: new Battle({
        title: 'Dominating',
        targetLevel: 50,
        difficulty: 1_000_000,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 550_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 18},
            standardBattleMilitaryReward,
        ],
    }),
    Scavengers500: new Battle({
        title: 'Unbeatable',
        targetLevel: 500,
        difficulty: 1_000,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 600_000}],
        rewards: [
            {effectType: EffectType.ResearchFactor, baseValue: 0.01},
            standardBattleMilitaryReward,
        ],
    }),
    MeteorMaws200: new Battle({
        title: 'Way too many',
        targetLevel: 200,
        difficulty: 10_000,
        faction: factions.MeteorMaws,
        effects: [{effectType: EffectType.Danger, baseValue: 700_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 68},
            standardBattleMilitaryReward,
        ],
    }),
    StarMantas20: new Battle({
        title: 'Curious',
        targetLevel: 20,
        difficulty: 5_000_000,
        faction: factions.StarMantas,
        effects: [{effectType: EffectType.Danger, baseValue: 800_000}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 10},
            standardBattleMilitaryReward,
        ],
    }),
    SpacePirates75: new Battle({
        title: 'Overwhelming',
        targetLevel: 75,
        difficulty: 500_000,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 900_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 27},
            standardBattleMilitaryReward,
        ],
    }),
    Scavengers750: new Battle({
        title: 'Eternally Cursed',
        targetLevel: 750,
        difficulty: 10,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 1_000_000}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 165},
            standardBattleMilitaryReward,
        ],
    }),
    MeteorMaws300: new Battle({
        title: 'Space swallowing',
        targetLevel: 300,
        difficulty: 10_000,
        faction: factions.MeteorMaws,
        effects: [{effectType: EffectType.Danger, baseValue: 1_100_000}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 98},
            standardBattleMilitaryReward,
        ],
    }),
    StarMantas30: new Battle({
        title: 'Gliding',
        targetLevel: 30,
        difficulty: 500_000,
        faction: factions.StarMantas,
        effects: [{effectType: EffectType.Danger, baseValue: 1_200_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 15},
            standardBattleMilitaryReward,
        ],
    }),
    VoidVikings10: new Battle({
        title: 'Scouting',
        targetLevel: 10,
        difficulty: 4_000_000,
        faction: factions.VoidVikings,
        effects: [{effectType: EffectType.Danger, baseValue: 1_300_000}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 8},
            standardBattleMilitaryReward,
        ],
    }),
    SpacePirates100: new Battle({
        title: 'Indomitable',
        targetLevel: 100,
        difficulty: 100_000,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 1_400_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 39},
            standardBattleMilitaryReward,
        ],
    }),
    Scavengers1000: new Battle({
        title: 'Dark Galaxy',
        targetLevel: 1000,
        difficulty: 5,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 1_500_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 240},
            standardBattleMilitaryReward,
        ],
    }),
    SpacePirates150: new Battle({
        title: 'Star-Stealing',
        targetLevel: 150,
        difficulty: 100_000,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 1_600_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 56},
            standardBattleMilitaryReward,
        ],
    }),
    MeteorMaws500: new Battle({
        title: 'A Million',
        targetLevel: 500,
        difficulty: 1_000,
        faction: factions.MeteorMaws,
        effects: [{effectType: EffectType.Danger, baseValue: 1_700_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 143},
            standardBattleMilitaryReward,
        ],
    }),
    StarMantas50: new Battle({
        title: 'Soaring',
        targetLevel: 50,
        difficulty: 600_000,
        faction: factions.StarMantas,
        effects: [{effectType: EffectType.Danger, baseValue: 1_800_000}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 21},
            standardBattleMilitaryReward,
        ],
    }),
    VoidVikings20: new Battle({
        title: 'Looting',
        targetLevel: 20,
        difficulty: 2_500_000,
        faction: factions.VoidVikings,
        effects: [{effectType: EffectType.Danger, baseValue: 1_900_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 12},
            standardBattleMilitaryReward,
        ],
    }),
    SpacePirates200: new Battle({
        title: 'Cosmos\' Dread',
        targetLevel: 200,
        difficulty: 100_000,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 2_000_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 81},
            standardBattleMilitaryReward,
        ],
    }),
    MeteorMaws750: new Battle({
        title: 'Two more',
        targetLevel: 750,
        difficulty: 75,
        faction: factions.MeteorMaws,
        effects: [{effectType: EffectType.Danger, baseValue: 3_000_000}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 207},
            standardBattleMilitaryReward,
        ],
    }),
    StarMantas75: new Battle({
        title: 'Traced',
        targetLevel: 75,
        difficulty: 500_000,
        faction: factions.StarMantas,
        effects: [{effectType: EffectType.Danger, baseValue: 4_000_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 31},
            standardBattleMilitaryReward,
        ],
    }),
    ThunderDragon10: new Battle({
        title: 'Decrepit',
        targetLevel: 10,
        difficulty: 15_000_000,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 5_000_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 9},
            standardBattleMilitaryReward,
        ],
    }),
    VoidVikings30: new Battle({
        title: 'Reveling',
        targetLevel: 30,
        difficulty: 2_800_000,
        faction: factions.VoidVikings,
        effects: [{effectType: EffectType.Danger, baseValue: 7_00_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 17},
            standardBattleMilitaryReward,
        ],
    }),
    SpacePirates300: new Battle({
        title: 'King of all',
        targetLevel: 300,
        difficulty: 100_000,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 9_000_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 118},
            standardBattleMilitaryReward,
        ],
    }),
    MeteorMaws1000: new Battle({
        title: 'Overlord of',
        targetLevel: 1000,
        difficulty: 8,
        faction: factions.MeteorMaws,
        effects: [{effectType: EffectType.Danger, baseValue: 10_000_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 300},
            standardBattleMilitaryReward,
        ],
    }),
    StarMantas100: new Battle({
        title: 'Straitened',
        targetLevel: 100,
        difficulty: 5_000_000,
        faction: factions.StarMantas,
        effects: [{effectType: EffectType.Danger, baseValue: 12_500_000}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 45},
            standardBattleMilitaryReward,
        ],
    }),
    StarMantas150: new Battle({
        title: 'Neon Red',
        targetLevel: 150,
        difficulty: 300_000,
        faction: factions.StarMantas,
        effects: [{effectType: EffectType.Danger, baseValue: 15_000_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 65},
            standardBattleMilitaryReward,
        ],
    }),
    VoidVikings50: new Battle({
        title: 'Raiding',
        targetLevel: 50,
        difficulty: 2_000_000,
        faction: factions.VoidVikings,
        effects: [{effectType: EffectType.Danger, baseValue: 17_500_000}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 24},
            standardBattleMilitaryReward,
        ],
    }),
    SpacePirates500: new Battle({
        title: 'Cosmic\'s Edge',
        targetLevel: 500,
        difficulty: 5_000,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 20_000_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 171},
            standardBattleMilitaryReward,
        ],
    }),
    ThunderDragon20: new Battle({
        title: 'Venerable',
        targetLevel: 20,
        difficulty: 16_000_000,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 21_000_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 13},
            standardBattleMilitaryReward,
        ],
    }),
    StarMantas200: new Battle({
        title: 'Furious',
        targetLevel: 200,
        difficulty: 200_000,
        faction: factions.StarMantas,
        effects: [{effectType: EffectType.Danger, baseValue: 22_000_000}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 95},
            standardBattleMilitaryReward,
        ],
    }),
    AstralSharks10: new Battle({
        title: 'Lone',
        targetLevel: 10,
        difficulty: 25_000_000,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 23_000_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 10},
            standardBattleMilitaryReward,
        ],
    }),
    VoidVikings75: new Battle({
        title: 'Rampaging',
        targetLevel: 75,
        difficulty: 4_000_000,
        faction: factions.VoidVikings,
        effects: [{effectType: EffectType.Danger, baseValue: 24_000_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 35},
            standardBattleMilitaryReward,
        ],
    }),
    SpacePirates750: new Battle({
        title: 'Twilight Sailing',
        targetLevel: 750,
        difficulty: 100,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 25_000_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 248},
            standardBattleMilitaryReward,
        ],
    }),
    ThunderDragon30: new Battle({
        title: 'Ancient',
        targetLevel: 30,
        difficulty: 20_000_000,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 26_000_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 19},
            standardBattleMilitaryReward,
        ],
    }),
    StarMantas300: new Battle({
        title: 'Vengeful',
        targetLevel: 300,
        difficulty: 100_000,
        faction: factions.StarMantas,
        effects: [{effectType: EffectType.Danger, baseValue: 27_000_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 138},
            standardBattleMilitaryReward,
        ],
    }),
    VoidVikings100: new Battle({
        title: 'Space-Borne',
        targetLevel: 100,
        difficulty: 2_500_000,
        faction: factions.VoidVikings,
        effects: [{effectType: EffectType.Danger, baseValue: 28_000_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 51},
            standardBattleMilitaryReward,
        ],
    }),
    SpacePirates1000: new Battle({
        title: 'Black Hole',
        targetLevel: 1000,
        difficulty: 100,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 29_000_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 360},
            standardBattleMilitaryReward,
        ],
    }),
    ThunderDragon50: new Battle({
        title: 'Majestic',
        targetLevel: 50,
        difficulty: 10_000_000,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 30_000_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 27},
            standardBattleMilitaryReward,
        ],
    }),
    AstralSharks20: new Battle({
        title: 'Pack of',
        targetLevel: 20,
        difficulty: 25_000_000,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 31_000_000}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 15},
            standardBattleMilitaryReward,
        ],
    }),
    VoidVikings150: new Battle({
        title: 'Super',
        targetLevel: 150,
        difficulty: 1_000_000,
        faction: factions.VoidVikings,
        effects: [{effectType: EffectType.Danger, baseValue: 32_000_000}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 75},
            standardBattleMilitaryReward,
        ],
    }),
    StarMantas500: new Battle({
        title: 'Squadron of',
        targetLevel: 500,
        difficulty: 5_000,
        faction: factions.StarMantas,
        effects: [{effectType: EffectType.Danger, baseValue: 33_000_000}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 200},
            standardBattleMilitaryReward,
        ],
    }),
    VoidVikings200: new Battle({
        title: 'Duper',
        targetLevel: 200,
        difficulty: 1_000_000,
        faction: factions.VoidVikings,
        effects: [{effectType: EffectType.Danger, baseValue: 34_000_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 108},
            standardBattleMilitaryReward,
        ],
    }),
    ThunderDragon75: new Battle({
        title: 'Sublime',
        targetLevel: 75,
        difficulty: 12_000_000,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 35_000_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 40},
            standardBattleMilitaryReward,
        ],
    }),
    AstralSharks30: new Battle({
        title: 'Hunting',
        targetLevel: 30,
        difficulty: 26_000_000,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 36_000_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 21},
            standardBattleMilitaryReward,
        ],
    }),
    StarMantas750: new Battle({
        title: 'Transcended',
        targetLevel: 750,
        difficulty: 300,
        faction: factions.StarMantas,
        effects: [{effectType: EffectType.Danger, baseValue: 37_000_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 290},
            standardBattleMilitaryReward,
        ],
    }),
    ThunderDragon100: new Battle({
        title: 'Maelstrom',
        targetLevel: 100,
        difficulty: 3_000_000,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 38_000_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 58},
            standardBattleMilitaryReward,
        ],
    }),
    VoidVikings300: new Battle({
        title: 'War waging',
        targetLevel: 300,
        difficulty: 100_000,
        faction: factions.VoidVikings,
        effects: [{effectType: EffectType.Danger, baseValue: 39_000_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 157},
            standardBattleMilitaryReward,
        ],
    }),
    StarMantas1000: new Battle({
        title: 'Ethereal',
        targetLevel: 1000,
        difficulty: 100,
        faction: factions.StarMantas,
        effects: [{effectType: EffectType.Danger, baseValue: 40_000_000}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 420},
            standardBattleMilitaryReward,
        ],
    }),
    AstralSharks50: new Battle({
        title: 'Star-Prowling',
        targetLevel: 50,
        difficulty: 26_000_000,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 42_500_000}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 31},
            standardBattleMilitaryReward,
        ],
    }),
    ThunderDragon150: new Battle({
        title: 'Gigawatt',
        targetLevel: 150,
        difficulty: 1_000_000,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 45_000_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 84},
            standardBattleMilitaryReward,
        ],
    }),
    VoidVikings500: new Battle({
        title: 'Ultra heavy',
        targetLevel: 500,
        difficulty: 2_000,
        faction: factions.VoidVikings,
        effects: [{effectType: EffectType.Danger, baseValue: 47_500_000}],
        rewards: [
            {effectType: EffectType.Industry, baseValue: 228},
            standardBattleMilitaryReward,
        ],
    }),
    AstralSharks75: new Battle({
        title: 'Murderous',
        targetLevel: 75,
        difficulty: 2_000_000,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 50_000_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 44},
            standardBattleMilitaryReward,
        ],
    }),
    ThunderDragon200: new Battle({
        title: 'Celestial',
        targetLevel: 200,
        difficulty: 100_000,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 52_500_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 122},
            standardBattleMilitaryReward,
        ],
    }),
    AstralSharks100: new Battle({
        title: 'Invisible',
        targetLevel: 100,
        difficulty: 8_000_000,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 55_000_000}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 64},
            standardBattleMilitaryReward,
        ],
    }),
    VoidVikings750: new Battle({
        title: 'Universe-Raiding',
        targetLevel: 750,
        difficulty: 100,
        faction: factions.VoidVikings,
        effects: [{effectType: EffectType.Danger, baseValue: 57_500_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 331},
            standardBattleMilitaryReward,
        ],
    }),
    ThunderDragon300: new Battle({
        title: 'Nuclear',
        targetLevel: 300,
        difficulty: 10_000,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 60_000_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 177},
            standardBattleMilitaryReward,
        ],
    }),
    VoidVikings1000: new Battle({
        title: 'Ragnarök bringing',
        targetLevel: 1000,
        difficulty: 1_000,
        faction: factions.VoidVikings,
        effects: [{effectType: EffectType.Danger, baseValue: 65_000_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 480},
            standardBattleMilitaryReward,
        ],
    }),
    AstralSharks150: new Battle({
        title: 'Diamond Scaled',
        targetLevel: 150,
        difficulty: 800_000,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 70_000_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 93},
            standardBattleMilitaryReward,
        ],
    }),
    ThunderDragon500: new Battle({
        title: 'Hyper',
        targetLevel: 500,
        difficulty: 100_000,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 75_000_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 257},
            standardBattleMilitaryReward,
        ],
    }),
    AstralSharks200: new Battle({
        title: 'Kamikaze',
        targetLevel: 200,
        difficulty: 100_000,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 80_000_000}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 135},
            standardBattleMilitaryReward,
        ],
    }),
    ThunderDragon750: new Battle({
        title: 'Fusion Powered',
        targetLevel: 750,
        difficulty: 10_000,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 85_000_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 372},
            standardBattleMilitaryReward,
        ],
    }),
    AstralSharks300: new Battle({
        title: 'Faster than Light',
        targetLevel: 300,
        difficulty: 200_000,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 90_000_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 196},
            standardBattleMilitaryReward,
        ],
    }),
    ThunderDragon1000: new Battle({
        title: 'Anti-Matter',
        targetLevel: 1000,
        difficulty: 100_000,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 100_000_000}],
        rewards: [
            {effectType: EffectType.Energy, baseValue: 540},
            standardBattleMilitaryReward,
        ],
    }),
    AstralSharks500: new Battle({
        title: 'The Last',
        targetLevel: 500,
        difficulty: 200_000,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 105_000_000}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 285},
            standardBattleMilitaryReward,
        ],
    }),
    AstralSharks750: new Battle({
        title: 'Apex',
        targetLevel: 750,
        difficulty: 1_000_000,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 110_000_000}],
        rewards: [
            {effectType: EffectType.Military, baseValue: 414},
            standardBattleMilitaryReward,
        ],
    }),
    AstralSharks1000: new Battle({
        title: 'End of Times',
        targetLevel: 1000,
        difficulty: 30_000_000,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 120_000_000}],
        rewards: [
            {effectType: EffectType.Growth, baseValue: 600},
            standardBattleMilitaryReward,
        ],
    }),

    Boss10: new BossBattle({
        titleGenerator: new NameGenerator()
            .add([
                'Glorgomax',
                'Munchulor',
                'Snorgolan',
                'Tentakulon',
                'Snafflogon',
                'Gobblethrox',
                'Snorplaxion',
                'Chompulor',
            ])
            .skipSeparator()
            .add(', ' + Symbols.SOFT_BREAK)
            .skipSeparator()
            .add(['the', 'Eternal'])
            .add([
                'Destroyer',
                `Shadow ${Symbols.SOFT_BREAK}of Cosmos`,
                'Essence Harvester',
                'Decimator',
                'Devourer',
                `Jester ${Symbols.SOFT_BREAK}of Annihilation`
            ]),
        targetLevel: 10,
        difficulty: 1,
        faction: factions.Boss,
        effects: [
            new DynamicEffectDefinition(EffectType.Danger, () => {
                // 10% of current population used as damage against population
                return Math.max(1000.0, attributes.population.getValue() * 0.10);
            }),
            {effectType: EffectType.GrowthFactor, baseValue: -1.00}
        ],
        rewards: [],
    }),
};

function getBossProgressForeshadowingText(progress) {
    if (progress >= 100) return 'The silence breaks.';
    if (progress >= 90) return 'It’s almost here.';
    if (progress >= 75) return 'The void grows restless.';
    if (progress >= 50) return 'Something ancient stirs beyond the stars.';
    if (progress >= 25) return 'Sensors detect faint anomalies...';
    return 'All systems nominal.';
}

/**
 * How many battles lie between the boss appearance and the boss battle.
 * @type {number}
 */
const bossBattleDefaultDistance = 4;
const bossBattleApproachInterval = 200; // Cycles
const bossDefenseMode = {
    /**
     * If a wave takes less time, xp gain will be capped to enforce this
     * duration and defense mode triggered.
     *
     * Seconds value based on Game Speed 1.
     *
     * @type {number}
     */
    minWaveDurationInSeconds: 3 * baseGameSpeed,
    /**
     * How much Danger does the boss produce while in defense mode?
     *
     * @type {number}
     */
    danger: 0,
};

/** @type {BossBattle} */
const bossBattle = battles.Boss10;

const battleRequirements = [
    new AttributeRequirement('playthrough', {attribute: attributes.research, requirement: 1.5}),
    new AttributeRequirement('playthrough', {attribute: attributes.research, requirement: 10}),
    new AttributeRequirement('playthrough', {attribute: attributes.research, requirement: 20}),
    new AttributeRequirement('playthrough', {attribute: attributes.research, requirement: 50}),
    new AttributeRequirement('playthrough', {attribute: attributes.research, requirement: 100}),
];

const battlesShowDangerWarning = false;

/**
 * @param {number} research Current research value
 * @return {{limit: number, requirement: AttributeRequirement|string}}
 */
function maximumAvailableBattles(research) {
    // Special case 1: Research is maxed, but there would be more battles to display
    if (research >= 100) return {limit: 6, requirement: 'Win any open battle'};
    if (research >= 50) return {limit: 5, requirement: battleRequirements[4]};
    if (research >= 20) return {limit: 4, requirement: battleRequirements[3]};
    if (research >= 10) return {limit: 3, requirement: battleRequirements[2]};
    if (research >= 1.5) return {limit: 2, requirement: battleRequirements[1]};
    if (research >= 0.01) return {limit: 1, requirement: battleRequirements[0]};
    // Special case 2: Research is not yet discovered
    return {limit: 1, requirement: 'Win open battle'};
}

/** @type {number} */
const numberOfLayers = 10;
