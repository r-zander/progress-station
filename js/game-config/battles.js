'use strict';

/**
 * @type {Object<FactionDefinition>}
 */
const factions = {
    NovaFlies: {
        title: 'Nova Flies', maxXp: 50,
        description: 'Similar to earth\'s long lost fireflies, these bugs are glowing on their own. Experiencing their gigantic numbers and blinding brightness quickly explains the name.',
    },
    Astrogoblins: {
        title: 'Astrogoblins', maxXp: 100,
        description: 'Mischievous beings that can be found in every corner of the galaxy, Astrogoblins zip around in makeshift spacecrafts, armed with primitive weapons and a liking for interstellar chaos.'
    },
    CometCrawlers: {
        title: 'Comet Crawlers', maxXp: 500,
        description: 'These beagle-sized beetles travel on the surface of comets as they are attracted by metal alloys that are unfortunately also commonly found in space stations. They will attack in large numbers if they sense one of their own being harmed.'
    },
    Scavengers: {
        title: 'Scavengers', maxXp: 2_500,
        description: 'Outcasts from civilizations across the galaxy, Scavengers form nomadic crews, dressed in distinctive leather attire. Masters of illicit trade and makeshift tech, they roam, seeking quick profits through heists and elusive alliances.'
    },
    MeteorMaws: {
        title: 'Meteor Maws', maxXp: 10_000,
        description: 'Gigantic, worm-like beings that burrow through meteors and small moons, leaving characteristic holes. They are attracted to the vibrations of engines and can engulf smaller vessels whole.'
    },
    SpacePirates: {
        title: 'Space Pirates', maxXp: 12_500,
        description: 'Buccaneers sailing the astral seas, Space Pirates are notorious for their flashy ships, over-the-top personalities, and the relentless pursuit of rare space booty.'
    },
    StarMantas: {
        title: 'Star Mantas', maxXp: 35_000,
        description: 'Majestic creatures that glide through the vacuum of space, their vast wingspans absorb cosmic radiation. Often mistaken for celestial phenomena, they can be fiercely territorial.'
    },
    VoidVikings: {
        title: 'Void Vikings', maxXp: 50_000,
        description: 'Clad in dark matter armor, Void Vikings raid across the galaxy in search of glory and cosmic runes. Their battle cries resonate through the vacuum, freezing the hearts of their foes.'
    },
    ThunderDragon: {
        title: 'Thunder Dragon', maxXp: 100_000,
        description: 'Roaming the storm nebula, Thunder Dragons are colossal beings of electric energy. Lightning crackles across their scales as they soar through the interstellar space.'
    },
    AstralSharks: {
        title: 'Astral Sharks', maxXp: 500_000,
        description: 'Legends of the cosmic deep, Astral Sharks glide through space with celestial fins and stardust-infused teeth. They\'re the titans of the galactic oceans.'
    },

    Destroyer: {
        title: 'Destroyer', maxXp: 5_000_000,
        description: 'An immense, dark mass of writhing tentacles, teeth and a thousand eyes. The vacuum of space around the station suppresses all noise, ' +
            'but you can feel the hatred of the alien beast and see it\'s determination to destroy everything you have built up.'
    },
};

/**
 * @type {Object<Battle>}
 */
const battles = {
    Astrogoblins10: new Battle({
        title: 'Wimpy',
        targetLevel: 10,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 0}],
        rewards: [{effectType: EffectType.Industry, baseValue: 1}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Astrogoblins15: new Battle({
        title: 'Curious',
        targetLevel: 15,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 10}],
        rewards: [{effectType: EffectType.Research, baseValue: 2}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    CometCrawlers10: new Battle({
        title: 'Handful of',
        targetLevel: 10,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 20}],
        rewards: [{effectType: EffectType.Military, baseValue: 1}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Astrogoblins20: new Battle({
        title: 'Courageous',
        targetLevel: 20,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 40}],
        rewards: [{effectType: EffectType.Military, baseValue: 2}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Scavengers10: new Battle({
        title: 'Lost',
        targetLevel: 10,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 75}],
        rewards: [{effectType: EffectType.Research, baseValue: 4}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    MeteorMaws10: new Battle({
        title: 'Two',
        targetLevel: 10,
        faction: factions.MeteorMaws,
        effects: [{effectType: EffectType.Danger, baseValue: 80}],
        rewards: [{effectType: EffectType.Growth, baseValue: 4}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    CometCrawlers20: new Battle({
        title: 'Small swarm of',
        targetLevel: 20,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 40}],
        rewards: [{effectType: EffectType.Growth, baseValue: 2}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    SpacePirates10: new Battle({
        title: 'Roaming',
        targetLevel: 10,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 100}],
        rewards: [{effectType: EffectType.Military, baseValue: 5}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Astrogoblins30: new Battle({
        title: 'Trained',
        targetLevel: 30,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 80}],
        rewards: [{effectType: EffectType.Military, baseValue: 2}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Scavengers20: new Battle({
        title: 'Violent',
        targetLevel: 20,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 150}],
        rewards: [{effectType: EffectType.Industry, baseValue: 3}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    VoidVikings10: new Battle({
        title: 'Scouting',
        targetLevel: 10,
        faction: factions.VoidVikings,
        effects: [{effectType: EffectType.Danger, baseValue: 120}],
        rewards: [{effectType: EffectType.Energy, baseValue: 3}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    CometCrawlers30: new Battle({
        title: 'Aggressive',
        targetLevel: 30,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 90}],
        rewards: [{effectType: EffectType.Growth, baseValue: 2}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    MeteorMaws20: new Battle({
        title: 'Hungry',
        targetLevel: 20,
        faction: factions.MeteorMaws,
        effects: [{effectType: EffectType.Danger, baseValue: 160}],
        rewards: [{effectType: EffectType.Growth, baseValue: 5}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    ThunderDragon10: new Battle({
        title: 'Decrepit',
        targetLevel: 10,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 200}],
        rewards: [{effectType: EffectType.Research, baseValue: 10}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    SpacePirates20: new Battle({
        title: 'Organized',
        targetLevel: 20,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 300}],
        rewards: [{effectType: EffectType.Military, baseValue: 5}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    NovaFlies50: new Battle({
        title: 'Harmless',
        targetLevel: 50,
        faction: factions.NovaFlies,
        effects: [{effectType: EffectType.Danger, baseValue: 50}],
        rewards: [{effectType: EffectType.Growth, baseValue: 4}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    AstralSharks10: new Battle({
        title: 'Lone',
        targetLevel: 10,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 500}],
        rewards: [{effectType: EffectType.Research, baseValue: 20}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    VoidVikings20: new Battle({
        title: 'Looting',
        targetLevel: 20,
        faction: factions.VoidVikings,
        effects: [{effectType: EffectType.Danger, baseValue: 360}],
        rewards: [{effectType: EffectType.Energy, baseValue: 10}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    CometCrawlers50: new Battle({
        title: 'Swarming',
        targetLevel: 50,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 300}],
        rewards: [{effectType: EffectType.Growth, baseValue: 15}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Scavengers30: new Battle({
        title: 'Insane',
        targetLevel: 30,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 500}],
        rewards: [{effectType: EffectType.Research, baseValue: 10}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Astrogoblins50: new Battle({
        title: 'Fearless',
        targetLevel: 50,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 100}],
        rewards: [{effectType: EffectType.Military, baseValue: 10}, { effectType: EffectType.MilitaryFactor, baseValue: 0.1}],
    }),
    MeteorMaws50: new Battle({
        title: 'Clew of',
        targetLevel: 50,
        faction: factions.MeteorMaws,
        effects: [{effectType: EffectType.Danger, baseValue: 320}],
        rewards: [{effectType: EffectType.Growth, baseValue: 8}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Scavengers50: new Battle({
        title: 'Reckless',
        targetLevel: 50,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 1000}],
        rewards: [{effectType: EffectType.Research, baseValue: 15}, { effectType: EffectType.MilitaryFactor, baseValue: 0.1}],
    }),
    SpacePirates50: new Battle({
        title: 'Dominating',
        targetLevel: 50,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 1500}],
        rewards: [{effectType: EffectType.Military, baseValue: 25}, { effectType: EffectType.MilitaryFactor, baseValue: 0.1}],
    }),
    NovaFlies100: new Battle({
        title: 'Numerous',
        targetLevel: 100,
        faction: factions.NovaFlies,
        effects: [{effectType: EffectType.Danger, baseValue: 1000}],
        rewards: [{effectType: EffectType.Growth, baseValue: 35}, { effectType: EffectType.MilitaryFactor, baseValue: 0.1}],
    }),
    AstralSharks20: new Battle({
        title: 'Pack of',
        targetLevel: 20,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 2000}],
        rewards: [{effectType: EffectType.ResearchFactor, baseValue: 2}, { effectType: EffectType.MilitaryFactor, baseValue: 0.1}],
    }),
    StarMantas20: new Battle({
        title: 'Peaceful',
        targetLevel: 20,
        faction: factions.StarMantas,
        effects: [{effectType: EffectType.Danger, baseValue: 300}],
        rewards: [{effectType: EffectType.Research, baseValue: 10}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    CometCrawlers200: new Battle({
        title: 'Endless',
        targetLevel: 200,
        faction: factions.CometCrawlers,
        effects: [{effectType: EffectType.Danger, baseValue: 1500}],
        rewards: [{effectType: EffectType.Growth, baseValue: 40}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}],
    }),
    VoidVikings50: new Battle({
        title: 'Raiding',
        targetLevel: 50,
        faction: factions.VoidVikings,
        effects: [{effectType: EffectType.Danger, baseValue: 2400}],
        rewards: [{effectType: EffectType.Energy, baseValue: 30}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    ThunderDragon20: new Battle({
        title: 'Venerable',
        targetLevel: 20,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 2000}],
        rewards: [{effectType: EffectType.Research, baseValue: 5}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}],
    }),
    MeteorMaws100: new Battle({
        title: 'Radiant',
        targetLevel: 100,
        faction: factions.MeteorMaws,
        effects: [{effectType: EffectType.Danger, baseValue: 3000}],
        rewards: [{effectType: EffectType.Growth, baseValue: 12}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Astrogoblins75: new Battle({
        title: 'Bold',
        targetLevel: 75,
        faction: factions.Astrogoblins,
        effects: [{effectType: EffectType.Danger, baseValue: 5000}],
        rewards: [{effectType: EffectType.Military, baseValue: 100}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}],
    }),
    NovaFlies200: new Battle({
        title: 'Countless',
        targetLevel: 200,
        faction: factions.NovaFlies,
        effects: [{effectType: EffectType.Danger, baseValue: 750}],
        rewards: [{effectType: EffectType.Growth, baseValue: 20}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Scavengers75: new Battle({
        title: 'Insatiable',
        targetLevel: 75,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 2000}],
        rewards: [{effectType: EffectType.Research, baseValue: 25}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    SpacePirates75: new Battle({
        title: 'Overwhelming',
        targetLevel: 75,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 2500}],
        rewards: [{effectType: EffectType.Military, baseValue: 40}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    ThunderDragon30: new Battle({
        title: 'Ancient',
        targetLevel: 30,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 3000}],
        rewards: [{effectType: EffectType.Research, baseValue: 10}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    AstralSharks30: new Battle({
        title: 'Hunting',
        targetLevel: 30,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 4000}],
        rewards: [{effectType: EffectType.ResearchFactor, baseValue: 3}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Scavengers100: new Battle({
        title: 'Ruthless',
        targetLevel: 100,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 5000}],
        rewards: [{effectType: EffectType.Research, baseValue: 35}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    VoidVikings200: new Battle({
        title: 'Rampaging',
        targetLevel: 200,
        faction: factions.VoidVikings,
        effects: [{effectType: EffectType.Danger, baseValue: 6000}],
        rewards: [{effectType: EffectType.Energy, baseValue: 80}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    SpacePirates100: new Battle({
        title: 'Indomitable',
        targetLevel: 100,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 6000}],
        rewards: [{effectType: EffectType.Military, baseValue: 60}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    ThunderDragon50: new Battle({
        title: 'Majestic',
        targetLevel: 50,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 7000}],
        rewards: [{effectType: EffectType.Research, baseValue: 15}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    AstralSharks50: new Battle({
        title: 'Murderous',
        targetLevel: 50,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 8000}],
        rewards: [{effectType: EffectType.ResearchFactor, baseValue: 4}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    Scavengers200: new Battle({
        title: 'Unbeatable',
        targetLevel: 200,
        faction: factions.Scavengers,
        effects: [{effectType: EffectType.Danger, baseValue: 10000}],
        rewards: [{effectType: EffectType.Research, baseValue: 50}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    SpacePirates200: new Battle({
        title: 'King of all',
        targetLevel: 200,
        faction: factions.SpacePirates,
        effects: [{effectType: EffectType.Danger, baseValue: 12000}],
        rewards: [{effectType: EffectType.Military, baseValue: 100}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    StarMantas100: new Battle({
        title: 'Furious',
        targetLevel: 200,
        faction: factions.StarMantas,
        effects: [{effectType: EffectType.Danger, baseValue: 30000}],
        rewards: [{effectType: EffectType.Research, baseValue: 80}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    AstralSharks500: new Battle({
        title: 'The Last',
        targetLevel: 500,
        faction: factions.AstralSharks,
        effects: [{effectType: EffectType.Danger, baseValue: 40000}],
        rewards: [{effectType: EffectType.ResearchFactor, baseValue: 40}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),
    ThunderDragon500: new Battle({
        title: 'Hyper',
        targetLevel: 500,
        faction: factions.ThunderDragon,
        effects: [{effectType: EffectType.Danger, baseValue: 70000}],
        rewards: [{effectType: EffectType.Research, baseValue: 15}, {effectType: EffectType.MilitaryFactor, baseValue: 0.1}]
    }),

    Destroyer: new BossBattle({
        title: 'The',
        targetLevel: 10,
        faction: factions.Destroyer,
        effects: [{effectType: EffectType.Heat, baseValue: 5}, {effectType: EffectType.GrowthFactor, baseValue: -1.00}],
        rewards: [],
    }),
};

/**
 * How many battles lie between the boss appearance and the boss battle.
 * @type {number}
 */
const bossBattleDefaultDistance = 4;
const bossBattleApproachInterval = 200; // Cycles
/** @type {BossBattle} */
const bossBattle = battles.Destroyer;

const battleRequirements = [
    new AttributeRequirement('playthrough', [{attribute: attributes.research, requirement: 10}]),
    new AttributeRequirement('playthrough', [{attribute: attributes.research, requirement: 20}]),
    new AttributeRequirement('playthrough', [{attribute: attributes.research, requirement: 50}]),
    new AttributeRequirement('playthrough', [{attribute: attributes.research, requirement: 100}]),
];

/**
 *
 * @return {{limit: number, requirement: AttributeRequirement|null}}
 */
function maximumAvailableBattles() {
    const research = attributes.research.getValue();
    if (research >= 100) return {limit: 5, requirement: null};
    if (research >= 50) return {limit: 4, requirement: battleRequirements[3]};
    if (research >= 20) return {limit: 3, requirement: battleRequirements[2]};
    if (research >= 10) return {limit: 2, requirement: battleRequirements[1]};
    return {limit: 1, requirement: battleRequirements[0]};
}

const layerData = [
    new LayerData('#ffe119'),
    new LayerData('#f58231'),
    new LayerData('#e6194B'),
    new LayerData('#911eb4'),
    new LayerData('#4363d8'),
    new LayerData('#47ff00'),
];

const lastLayerData = new LayerData('#000000');
