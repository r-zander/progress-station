const cheats = {
    GameSpeed: {},
    Game: {
    },
    Age: {
        set: (age) => {
            gameData.days = age;
        },
        add: (age) => {
            gameData.days += age;
        },
        setToBossTime: () => {
            gameData.days = getLifespan() - 1;
        }
    },
    Battles: {},
    Requirements: {},
    NameGenerator: {},
    Story: {},
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
    },
};
