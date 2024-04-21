// noinspection JSUnusedGlobalSymbols

/**
 * @param {string} title
 * @return {string}
 */
function prepareTitle(title) {
    return title.replaceAll('\xa0', ' ');
}

/**
 * @param {string} [localeOverride]
 */
function getLocale(localeOverride = undefined) {
    if (isString(localeOverride)) {
        return localeOverride;
    }

    return navigator.language;
}

/**
 * @param {number} value
 * @param {string} locale
 * @return {string}
 */
function formatNumber(value, locale) {
    // noinspection JSCheckFunctionSignatures
    return value.toLocaleString(locale, {
        // useGrouping: false,
        trailingZeroDisplay: 'stripIfInteger',
    });
}

/**
 * @param {EffectType} effectType
 * @return {string}
 */
function reverseLookupEffectTypeName(effectType) {
    for (const [name, type] of Object.entries(EffectType)) {
        if (type === effectType) {
            return name;
        }
    }

    return 'Unresolved ' + JSON.stringify(effectType);
}

/**
 * @param {EffectDefinition[]} effects
 * @param {string} locale
 * @return []
 */
function prepareEffectsForTSV(effects, locale) {
    if (effects.length > 2) {
        console.warn('There are ' + effects.length + ' effects, but only 2 will be put out.');
    }
    const result = [];
    if (effects.length >= 1) {
        result[0] = reverseLookupEffectTypeName(effects[0].effectType);
        result[1] = formatNumber(effects[0].baseValue, locale);
    }
    if (effects.length >= 2) {
        result[2] = reverseLookupEffectTypeName(effects[1].effectType);
        result[3] = formatNumber(effects[1].baseValue, locale);
    } else {
        result[2] = null;
        result[3] = null;
    }
    return result;
}

/**
 *
 * @param {Requirement[]} requirements
 * @param {string} locale
 * @return []
 */
function prepareRequirementsForTSV(requirements, locale) {
    if (!Array.isArray(requirements)) {
        return [];
    }
    if (requirements.length > 2) {
        console.warn('There are ' + requirements.length + ' requirements, but only 1 will be put out.');
    }

    const result = [];
    if (requirements.length >= 1) {
        result[0] = requirements[0].type;
        result[1] = requirements[0].scope;
        // noinspection IfStatementWithTooManyBranchesJS
        if (requirements[0] instanceof AttributeRequirement) {
            result[2] = requirements[0].requirements[0].attribute.name;
            result[3] = formatNumber(requirements[0].requirements[0].requirement, locale);
        } else if (requirements[0] instanceof OperationLevelRequirement) {
            result[2] = requirements[0].requirements[0].operation.name;
            result[3] = formatNumber(requirements[0].requirements[0].requirement, locale);
        } else if (requirements[0] instanceof AgeRequirement) {
            result[2] = null;
            result[3] = formatNumber(requirements[0].requirements[0].requirement, locale);
        } else if (requirements[0] instanceof GalacticSecretRequirement) {
            result[2] = requirements[0].requirements[0].galacticSecret.name;
            result[3] = null;
        } else if (requirements[0] instanceof FactionLevelsDefeatedRequirement) {
            result[2] = requirements[0].requirements[0].faction.name;
            result[3] = formatNumber(requirements[0].requirements[0].requirement, locale);
        } else {
            result[2] = 'Unsupported Requirement type';
            result[3] = null;
        }
    }
    return result;
}

const cheats = {
    GameSpeed: {
        /**
         * @param {number} [factor=2]
         */
        increase: (factor = 2) => {
            baseGameSpeed *= factor;
        },
        /**
         * @param {number} [factor=2]
         */
        decrease: (factor = 2) => {
            baseGameSpeed /= factor;
            if (baseGameSpeed < 1.00) {
                // noinspection JSUndeclaredVariable
                baseGameSpeed = 1;
            }
        },
        /**
         * @param {number} [newSpeed]
         */
        set: (newSpeed) => {
            console.assert(isNumber(newSpeed), 'New speed needs to be a number.');
            if (isNumber(newSpeed)) {
                baseGameSpeed = newSpeed;
            }
        },
        setNormal: () => {
            baseGameSpeed = 4;
        },
        setSlow: () => {
            baseGameSpeed = 1;
        },
        setFast: () => {
            baseGameSpeed = 32;
        },
        setExtreme: () => {
            baseGameSpeed = 256;
        },
        setLudicrous: () => {
            baseGameSpeed = 1024;
        },
    },
    Game: {
        letBossAppear: () => {
            gameData.bossBattleAvailable = false;
            cheats.Age.setToBossTime(false);
            Object.assign(bossBattle.savedValues, BossBattle.newSavedValues());
            // Paused game stays paused, otherwise --> switch to regular playing mode
            if (gameData.state !== gameStates.PAUSED) {
                gameData.stateName = gameStates.PLAYING.name;
            }
        },
        reset: () => {
            gameData.reset();
        },
        /**
         * Useful to manipulate the DOM.
         */
        disableUpdates: () => {
            clearInterval(updateIntervalID);
        },
        /**
         * Inverse of disableUpdates to continue the normal game.
         */
        enableUpdates: () => {
            updateIntervalID = setInterval(update, 1000 / updateSpeed);
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
                (Object.values(battles).length - 1) +
                Object.values(pointsOfInterest).length,
            );
        },
        /**
         * Use case: Wrap up all (not yet, but intended) strings in the game to give them into contextual review.
         */
        exportStrings: () => {
            return JSON.stringify({
                modules: Object.values(modules).reduce((transformedModules, module) => {
                    transformedModules[prepareTitle(module.title)] = {
                        description: module.description,
                        components: Object.values(module.components).reduce((transformedComponents, component) => {
                            transformedComponents[prepareTitle(component.title)] = {
                                description: component.description,
                                operations: Object.values(component.operations).reduce((transformedOperations, operation) => {
                                    transformedOperations[prepareTitle(operation.title)] = {
                                        description: operation.description,
                                    };
                                    return transformedOperations;
                                }, {}),
                            };
                            return transformedComponents;
                        }, {}),
                    };
                    return transformedModules;
                }, {}),
            }, null, 2);
        },
        ModuleOperations: {
            toTsv: (localeOverride = undefined) => {
                const locale = getLocale(localeOverride);
                return Object.values(moduleOperations).map(/** @param {ModuleOperation} operation */operation => {
                    return [
                        operation.component.name,
                        operation.name,
                        prepareTitle(operation.title),
                        operation.description,
                        formatNumber(operation.maxXp, locale),
                        operation.gridLoad,
                        ...prepareEffectsForTSV(operation.effects, locale),
                        ...prepareRequirementsForTSV(operation.requirements, locale),
                    ].join('\t');
                }).join('\n');
            },
        },
        ModuleComponents: {
            toTsv: () => {
                return Object.values(moduleComponents).map(/** @param {ModuleComponent} component */component => {
                    return [
                        component.module.name,
                        component.name,
                        prepareTitle(component.title),
                        component.description,
                    ].join('\t');
                }).join('\n');
            },
        },
        Modules: {
            toTsv: (localeOverride = undefined) => {
                const locale = getLocale(localeOverride);
                return Object.values(modules).map(/** @param {Module} module */module => {
                    /** @var {ModuleCategory[]} */
                    const parentCandidates = Object.values(moduleCategories)
                        .filter(/** @param {ModuleCategory} category */category => category.modules.includes(module));
                    let parent = null;
                    if (parentCandidates.length === 0) {
                        console.warn('No parent Category found for Module "' + module.title + '".');
                    } else if (parentCandidates.length >= 2) {
                        console.warn(parentCandidates.length + ' parent Categories found for Module "' + module.title + '".');
                        parent = parentCandidates[0].name;
                    } else {
                        parent = parentCandidates[0].name;
                    }
                    return [
                        parent,
                        module.name,
                        prepareTitle(module.title),
                        module.description,
                        ...prepareRequirementsForTSV(module.requirements, locale),
                    ].join('\t');
                }).join('\n');
            },
        },
        ModuleCategories: {
            toTsv: (localeOverride = undefined) => {
                const locale = getLocale(localeOverride);
                return Object.values(moduleCategories).map(/** @param {ModuleCategory} category */category => {
                    return [
                        category.name,
                        prepareTitle(category.title),
                        category.description,
                        category.color,
                        ...prepareRequirementsForTSV(category.requirements, locale),
                    ].join('\t');
                }).join('\n');
            },
        },
        Factions: {
            toTsv: (localeOverride = undefined) => {
                const locale = getLocale(localeOverride);
                return Object.values(factions).map(/** @param {FactionDefinition} faction */faction => {
                    return [
                        faction.name,
                        prepareTitle(faction.title),
                        faction.description,
                        formatNumber(faction.maxXp, locale),
                    ].join('\t');
                }).join('\n');
            },
        },
        Battles: {
            toTsv: (localeOverride = undefined) => {
                const locale = getLocale(localeOverride);
                return Object.values(battles).map(/** @param {Battle} battle */battle => {
                    return [
                        battle.name,
                        prepareTitle(battle.title).replace(battle.faction.title, '').trim(),
                        battle.description,
                        battle.faction.name,
                        formatNumber(battle.targetLevel, locale),
                        ...prepareEffectsForTSV(battle.effects, locale),
                        ...prepareEffectsForTSV(battle.rewards, locale),
                    ].join('\t');
                }).join('\n');
            },
        },
        PointsOfInterest: {
            toTsv: (localeOverride = undefined) => {
                const locale = getLocale(localeOverride);
                return Object.values(pointsOfInterest).map(/** @param {PointOfInterest} pointOfInterest */pointOfInterest => {
                    /** @var {Sector[]} */
                    const parentCandidates = Object.values(sectors)
                        .filter(/** @param {Sector} sector */sector => sector.pointsOfInterest.includes(pointOfInterest));
                    let parent = null;
                    if (parentCandidates.length === 0) {
                        console.warn('No parent Sector found for PointOfInterest "' + pointOfInterest.title + '".');
                    } else if (parentCandidates.length >= 2) {
                        console.warn(parentCandidates.length + ' parent Sectors found for PointOfInterest "' + pointOfInterest.title + '".');
                        parent = parentCandidates[0].name;
                    } else {
                        parent = parentCandidates[0].name;
                    }
                    return [
                        parent,
                        pointOfInterest.name,
                        prepareTitle(pointOfInterest.title),
                        pointOfInterest.description,
                        ...prepareEffectsForTSV(pointOfInterest.effects.slice(0, 2), locale),
                        ...prepareEffectsForTSV(pointOfInterest.effects.slice(2), locale),
                        // TODO modifiers
                        ...prepareRequirementsForTSV(pointOfInterest.requirements, locale),
                    ].join('\t');
                }).join('\n');
            },
        },
        Sectors: {
            toTsv: (localeOverride = undefined) => {
                const locale = getLocale(localeOverride);
                return Object.values(sectors).map(/** @param {ModuleCategory} category */category => {
                    return [
                        category.name,
                        prepareTitle(category.title),
                        category.description,
                        category.color,
                        ...prepareRequirementsForTSV(category.requirements, locale),
                    ].join('\t');
                }).join('\n');
            },
        },
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
        setToBossTime: (forceBossAppearance = false) => {
            if (forceBossAppearance) {
                cheats.Game.letBossAppear();
            } else {
                cheats.Age.set(getBossAppearanceCycle() - 1);
            }
        },
    },
    Battles: {},
    Requirements: {},
    NameGenerator: {
        generate: (amount = 1) => {
            for (let i = 0; i < amount; i++) {
                console.log(stationNameGenerator.generate());
            }
        },
        generateArray: (amount = 1) => {
            return Array.from(Array(amount), () => stationNameGenerator.generate());
        },
    },
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
            },
        },
        show: () => {
            Object.entries(attributes).forEach(([name, attribute]) => {
                console.log(name, attribute.getValue());
            });
        },
    },
};

// Debugging output
GameEvents.GameStateChanged.subscribe((payload) => {
    console.log('Transition game state from ' + payload.previousState + ' to ' + payload.newState);
});
