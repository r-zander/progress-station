'use strict';

function applyMultipliers(value, multipliers) {
    const finalMultiplier = multipliers.reduce((final, multiplierFn) => final * multiplierFn(), 1);

    return Math.round(value * finalMultiplier);
}

function applySpeed(value) {
    return value * getGameSpeed() / targetTicksPerSecond;
}

function calculateHeat() {
    const rawHeat = Effect.getTotalValue([EffectType.Heat]);
    const totalHeat = gameData.heat + rawHeat;
    return Math.max(SPACE_BASE_HEAT, totalHeat);
}

function updateHeat() {
    const danger = attributes.danger.getValue();
    const military = attributes.military.getValue();
    const targetHeat = Math.max(danger - military, 0);

    if (nearlyEquals(gameData.heat, targetHeat)) {
        gameData.heat = targetHeat;
        gameData.heatVelocity = 0;
        return;
    }

    if (targetHeat > gameData.heat) {
        // In case the heat target changed direction (was low and is now high), we want to reset the velocity
        gameData.heatVelocity = Math.max(0, gameData.heatVelocity);
        gameData.heatVelocity += applySpeed(heatAcceleration / targetTicksPerSecond);
        if (gameData.heat + gameData.heatVelocity >= targetHeat) {
            gameData.heat = targetHeat;
            gameData.heatVelocity = 0;
        } else {
            gameData.heat += gameData.heatVelocity;
        }
    } else { // targetHeat is smaller than gameData.heat
        // In case the heat target changed direction (was high and is now low), we want to reset the velocity
        gameData.heatVelocity = Math.min(0, gameData.heatVelocity);
        gameData.heatVelocity -= applySpeed(heatAcceleration/ targetTicksPerSecond);
        if (gameData.heat + gameData.heatVelocity <= targetHeat) {
            gameData.heat = targetHeat;
            gameData.heatVelocity = 0;
        } else {
            gameData.heat += gameData.heatVelocity;
        }
    }
}

/**
 * This is what the population delta will settle to if the current growth and heat is maintained.
 * NOTE: this needs to be synced with the {@link updatePopulation} if the formula ever changes.
 *
 * @return {number} the target population delta (without inertia)
 */
function populationDelta() {
    const growth = attributes.growth.getValue();
    const heat = attributes.heat.getValue();
    const population = attributes.population.getValue();
    return (0.1 * growth) - (0.01 * population * heat);
}

function updatePopulation() {
    if (!gameData.state.areAttributesUpdated) return;

    const growth = attributes.growth.getValue();
    const population = attributes.population.getValue();
    const heat = attributes.heat.getValue();

    // Split population delta into two components:
    // 1. Growth component (with inertia)
    const rawGrowthDelta = 0.1 * growth;
    // TODO inertia is not scaled with game speed
    const smoothedGrowthDelta = populationDeltaInertia * gameData.lastPopulationDelta + (1 - populationDeltaInertia) * rawGrowthDelta;
    gameData.lastPopulationDelta = smoothedGrowthDelta;

    // 2. Heat damage component (no inertia, applied directly)
    const heatDamage = 0.01 * population * heat;

    // Combine both components
    const totalDelta = smoothedGrowthDelta - heatDamage;
    gameData.population = Math.max(gameData.population + applySpeed(totalDelta), 1);

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
        summonBoss();
    }
}

function summonBoss(){
    gameData.bossBattleAvailable = true;
    gameData.bossAppearedCycle = gameData.cycles;
    gameData.transitionState(gameStates.TUTORIAL_PAUSED);
    GameEvents.BossAppearance.trigger(undefined);
    bossBarAcceleratedProgress = 0;
}

function updateBossDistance() {
    if (gameData.state !== gameStates.PLAYING) return;
    if (!isBossBattleAvailable()) return;

    // How much time has past since the boss' arrival?
    const overtime = gameData.cycles - gameData.bossAppearedCycle;
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
    setPreviousStationName(gameData.stationName);
    setStationName(new SuffixGenerator(gameData.stationName).getNewName());
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

function getTimeUntilBossAppears() {
    const timeLeft = getBossAppearanceCycle() - gameData.cycles;
    return Math.max(0, timeLeft);
}
