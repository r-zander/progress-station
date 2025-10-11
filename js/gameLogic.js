'use strict';

function applyMultipliers(value, multipliers) {
    const finalMultiplier = multipliers.reduce((final, multiplierFn) => final * multiplierFn(), 1);

    return Math.round(value * finalMultiplier);
}

function applySpeed(value) {
    return value * getGameSpeed() / targetTicksPerSecond;
}

function calculateHeat() {
    const danger = attributes.danger.getValue();
    const military = attributes.military.getValue();
    const rawHeat = Effect.getTotalValue([EffectType.Heat]);
    const calculatedHeat = Math.max(danger - military, 0) + rawHeat;

    return Math.max(SPACE_BASE_HEAT, calculatedHeat);
}

function populationDelta() {
    const growth = attributes.growth.getValue();
    const heat = attributes.heat.getValue();
    const population = attributes.population.getValue();
    return (0.1 * growth) - (0.01 * population * heat);
}

function updatePopulation() {
    if (!gameData.state.areAttributesUpdated) return;

    const rawDelta = populationDelta();
    // TODO inertia is not scaled with game speed
    const inertDelta = populationDeltaInertia * gameData.lastPopulationDelta + (1 - populationDeltaInertia) * rawDelta;
    gameData.population = Math.max(gameData.population + applySpeed(inertDelta), 1);
    gameData.lastPopulationDelta = inertDelta;

    if (gameData.state === gameStates.BOSS_FIGHT && Math.round(gameData.population) === 1) {
        gameData.transitionState(gameStates.DEAD);
    }
}

function getPopulationProgressSpeedMultiplier() {
    // Random ass formula ᕕ( ᐛ )ᕗ
    // Pop 1 = x1
    // Pop 10 ~= x3.4
    // Pop 100 ~= x12
    // Pop 1000 ~= x40
    // Pop 10000 ~= x138
    // Pop 40000 ~= x290
    return Math.max(1, Math.pow(Math.round(gameData.population), 1 / 1.869));
}

function getGameSpeed() {
    return baseGameSpeed;
}

function calculateGridLoad() {
    let gridLoad = 0;

    for (const key of gameData.activeEntities.operations) {
        const operation = moduleOperations[key];
        if (!operation.isActive('parent')) continue;

        gridLoad += operation.getGridLoad();
    }

    return gridLoad;
}

function calculateGalacticSecretCost() {
    const unlockedGalacticSecrets = Object.values(galacticSecrets)
        .filter(galacticSecret => galacticSecret.isUnlocked)
        .length;
    return Math.pow(3, unlockedGalacticSecrets);
}

function increaseCycle() {
    if (!gameData.state.isTimeProgressing) return;

    const increase = applySpeed(cycleDurationInSeconds);
    gameData.cycles += increase;
    gameData.totalCycles += increase;

    if (!isBossBattleAvailable() && gameData.cycles >= getBossAppearanceCycle()) {
        gameData.bossBattleAvailable = true;
        gameData.transitionState(gameStates.TUTORIAL_PAUSED);
        GameEvents.BossAppearance.trigger(undefined);
    }
}

function updateBossDistance() {
    if (gameData.state !== gameStates.PLAYING) return;
    if (!isBossBattleAvailable()) return;

    // How much time has past since the boss' arrival?
    const overtime = gameData.cycles - getBossAppearanceCycle();
    // Translate the elapsed time into distance according to config
    bossBattle.coveredDistance = Math.floor(overtime / bossBattleApproachInterval);
}

// noinspection JSUnusedGlobalSymbols -- used in HTML
function togglePause() {
    switch (gameData.state) {
        case gameStates.PLAYING:
            gameData.transitionState(gameStates.PAUSED);
            break;
        case gameStates.PAUSED:
            gameData.transitionState(gameStates.PLAYING);
            break;
        case gameStates.BOSS_FIGHT:
            gameData.transitionState(gameStates.BOSS_FIGHT_PAUSED);
            break;
        case gameStates.BOSS_FIGHT_PAUSED:
            gameData.transitionState(gameStates.BOSS_FIGHT);
            break;
        // Any other state is ignored
    }

    updateUiIfNecessary();
}

function forcePause() {
    switch (gameData.state) {
        case gameStates.PLAYING:
            gameData.transitionState(gameStates.PAUSED);
            break;
        case gameStates.BOSS_FIGHT:
            gameData.transitionState(gameStates.BOSS_FIGHT_PAUSED);
            break;
    }
    // Any other state is ignored
}

function doTasks() {
    for (const key of gameData.activeEntities.operations) {
        const operation = moduleOperations[key];
        if (!operation.isActive('parent')) continue;
        operation.do();
    }

    for (const battleName of gameData.activeEntities.battles) {
        const battle = battles[battleName];
        if (battle.isDone()) {
            if (gameData.selectedTab === 'battles') {
                // Quality of life - a battle is done and the player is already on the battles tab
                // or visited it first after the battle was completed --> deactivate battle
                battle.stop();
                // TODO VFX should not be called, but triggered via Event
                if (isBoolean(gameData.settings.vfx.flashOnLevelUp) && gameData.settings.vfx.flashOnLevelUp) {
                    VFX.flash(Dom.get().bySelector('#row_done_' + battle.name + ' .progressBar'));
                }
            }

            continue;
        }

        battle.do();
        if (gameData.state === gameStates.PLAYING &&
            isBossBattleAvailable() &&
            battle.isDone()
        ) {
            bossBattle.decrementDistance();
        }
    }

    gridStrength.do();
}

function resetBattle(name) {
    const battle = battles[name];
    battle.level = 0;
    battle.xp = 0;
}

function startNewPlaythrough() {
    gameData.bossEncounterCount += 1;

    // grant Essence Of Unknown
    for (let level = 0; level < bossBattle.level; level++) {
        gameData.essenceOfUnknown += Math.pow(2, level);
    }

    playthroughReset('UPDATE_MAX_LEVEL');
}

/**
 * @param {MaxLevelBehavior} maxLevelBehavior
 */
function playthroughReset(maxLevelBehavior) {
    gameData.initValues();
    gameData.resetCurrentValues();

    for (const key in moduleCategories) {
        const category = moduleCategories[key];
        category.reset(maxLevelBehavior);
    }

    for (const key in modules) {
        const module = modules[key];
        module.reset(maxLevelBehavior);
    }

    for (const key in moduleComponents) {
        const component = moduleComponents[key];
        component.reset(maxLevelBehavior);
    }

    for (const key in moduleOperations) {
        const operation = moduleOperations[key];
        operation.reset(maxLevelBehavior);
    }

    gridStrength.reset(maxLevelBehavior);

    for (const key in battles) {
        const battle = battles[key];
        battle.reset(maxLevelBehavior);
    }

    for (const key in moduleCategories) {
        const category = moduleCategories[key];
        category.reset(maxLevelBehavior);
    }

    for (const key in sectors) {
        const sector = sectors[key];
        sector.reset(maxLevelBehavior);
    }

    for (const key in pointsOfInterest) {
        const pointOfInterest = pointsOfInterest[key];
        pointOfInterest.reset(maxLevelBehavior);
    }

    for (const key in htmlElementRequirements) {
        const elementRequirement = htmlElementRequirements[key];
        elementRequirement.reset();
    }

    for (const key in requirementRegistry) {
        const requirement = requirementRegistry[key];
        requirement.reset();
    }

    setTab('modules');
    if (gameData.state.gameLoopRunning === false && gameStates.NEW.gameLoopRunning === false) {
        // Both states don't have the gameLoopRunning --> explicitly run update()
        // once to ensure the UI matches the game state
        updateUI();
    }
    gameData.transitionState(gameStates.NEW);
}

function getBossAppearanceCycle() {
    return bossAppearanceCycle;
}

function isBossBattleAvailable() {
    return gameData.bossBattleAvailable;
}
