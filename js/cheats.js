const cheats = {
    GameSpeed: {},
    Game: {
        letBossAppear: () => {
            gameData.bossBattleAvailable = false;
            cheats.Age.setToBossTime();
            Object.assign(bossBattle.savedValues, BossBattle.newSavedValues());
            // Paused game stays paused, otherwise --> switch to regular playing mode
            if (gameData.state !== gameStates.PAUSED) {
                gameData.stateName = gameStates.PLAYING.name;
            }
        },
        Config: {
            printStats: () => {
                console.log('Module Categories', Object.values(moduleCategories).length);
                console.log('Modules', Object.values(modules).length);
                console.log('Components', Object.values(moduleComponents).length);
                console.log('Operations', Object.values(moduleOperations).length);

                console.log('Factions', Object.values(factions).length);
                console.log('Faction Battles', Object.values(battles).length - 1 /* the boss battle */);

                console.log('Sectors', Object.values(sectors).length);
                console.log('Points of Interest', Object.values(pointsOfInterest).length);

                console.log('Total',
                    Object.values(moduleOperations).length +
                    (Object.values(battles).length - 1 ) +
                    Object.values(pointsOfInterest).length
                )
            }
        }
    },
    Age: {
        set: (age) => {
            gameData.cycles = age;
            gameData.totalCycles = age;
        },
        add: (age) => {
            gameData.cycles += age;
            gameData.totalCycles += age;
        },
        setToBossTime: () => {
            const diff =  (getBossAppearanceCycle() - 1) - gameData.cycles;
            cheats.Age.add(diff);
        }
    },
    Battles: {},
    Requirements: {},
    NameGenerator: {},
    Story: {
        // Is filled in story.js
    },
    Attributes: {
        additionalEffects: [],
        increaseAllBy: (value) => {
            cheats.Attributes.additionalEffects = [
                {effectType: EffectType.Industry, baseValue: value},
                {effectType: EffectType.Research, baseValue: value},
                {effectType: EffectType.Growth, baseValue: value},
                {effectType: EffectType.Military, baseValue: value},
            ];
        },
        increaseAllBy200: () => {
            cheats.Attributes.increaseAllBy(200);
        },
        increaseAllBy500: () => {
            cheats.Attributes.increaseAllBy(500);
        },
        increaseAllBy1000: () => {
            cheats.Attributes.increaseAllBy(1000);
        },
        essenceOfUnknown: {
            add: (amount) => {
                gameData.essenceOfUnknown += amount;
            }
        }
    },
};

// Debugging output
GameEvents.GameStateChanged.subscribe((payload) => {
    console.log('Transition game state from ' + payload.previousState + ' to ' + payload.newState);
})
