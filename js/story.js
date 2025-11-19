'use strict';

function initIntro() {
    const modal = new bootstrap.Modal(document.getElementById('storyIntroModal'));

    const rerollNameButton = Dom.get().byId('rerollName');
    rerollNameButton.addEventListener('click', function (event) {
        event.preventDefault();
        rerollStationName();
    });

    GameEvents.GameStateChanged.subscribe( (payload) => {
        if (payload.newState !== gameStates.NEW.name) return;

        modal.show();
    });

    withCheats(cheats => {
        cheats.Story['Intro'] = {
            trigger: () => {
                modal.show();
            }
        };
    });

    window.finishIntro = function () {
        modal.hide();
        gameData.transitionState(gameStates.PLAYING);
    };
}

function initBossAppearance() {
    const modal = new bootstrap.Modal(document.getElementById('bossAppearanceModal'));
    GameEvents.BossAppearance.subscribe(function () {
        modal.show();
    });

    GameEvents.GameStateChanged.subscribe( (payload) => {
        // TODO gameStates.TUTORIAL_PAUSED is a bad idea, as its generic but we need to show the correct "tutorial"
        //  currently there is only one - but this doesn't scale
        if (payload.newState !== gameStates.TUTORIAL_PAUSED.name) return;
        if (payload.previousState !== gameStates.NEW.name) return;

        modal.show();
    });

    withCheats(cheats => {
        cheats.Story['BossAppearance'] = {
            trigger: () => {
                GameEvents.BossAppearance.trigger(undefined);
            }
        };
    });

    window.acknowledgeBossBattle = function () {
        modal.hide();
        setTab('battles');
        Dom.get().byId(bossBattle.domId).scrollIntoView(false);
        gameData.transitionState(gameStates.PLAYING);
    };
}

function initBossFightIntro() {
    const modal = new bootstrap.Modal(document.getElementById('bossFightIntroModal'));
    GameEvents.GameStateChanged.subscribe(function (payload) {
        if (payload.newState !== gameStates.BOSS_FIGHT_INTRO.name) return;

        Dom.get().allBySelector('#bossFightIntroModal .bossName').forEach((nameElement) => {
            nameElement.textContent = deprepareTitle(bossBattle.title);
        });
        Dom.get().allBySelector('#bossFightIntroModal .bossTargetLevel').forEach((targetLevelElement) => {
            formatValue(targetLevelElement, bossBattle.targetLevel, {keepNumber: true, forceInteger: true});
        });
        Dom.get().byId('delayBossBattleButton').classList.toggle('hidden', bossBattle.distance === 0);
        modal.show();
    });

    withCheats(cheats => {
        cheats.Story['BossFightIntro'] = {
            trigger: () => {
                gameData.transitionState(gameStates.BOSS_FIGHT_INTRO);
            }
        };
    });

    window.delayBossBattle = function () {
        modal.hide();
        gameData.transitionState(gameStates.PLAYING);
    };

    window.startBossBattle = function () {
        modal.hide();
        setTab('battles');
        gameData.transitionState(gameStates.BOSS_FIGHT);
        bossBattle.start();
    };
}

function populateLastRunStats() {
    const tableBody = Dom.get().byId('lastRunModulesTable');
    console.assert(tableBody !== null, 'Missing #lastRunModulesTable');
    tableBody.innerHTML = '';

   for (const categoryKey in moduleCategories) {
        const category = moduleCategories[categoryKey];
        for (const module of category.modules) {
            const newLevel = Math.max(module.getLevel(), module.maxLevel);
            const prevMaxLevel = module.maxLevel;
            const isNewRecord = module.getLevel() > module.maxLevel;
            if (newLevel === 0 && prevMaxLevel === 0) {
                continue;
            }

            const row = document.createElement('tr');

            // Module Name
            const nameCell = document.createElement('td');
            nameCell.textContent = module.title;
            row.appendChild(nameCell);

            // Module Level
            const levelCell = document.createElement('td');
            levelCell.classList.add('stat-cell');

            const levelSpan = document.createElement('span');
            levelSpan.className = 'stat-value';
            levelCell.appendChild(levelSpan);

            if (isNewRecord) {
                const arrow = document.createElement('img');
                arrow.src = 'img/icons/arrow-up.svg';
                arrow.alt = 'New record';
                arrow.className = 'stat-arrow';
                arrow.classList.add('hidden');
                levelCell.appendChild(arrow);
            }

            row.appendChild(levelCell);
            runningAnimations.push(animateStatValue(levelSpan, prevMaxLevel, newLevel, 6000));

            // New Operation Speed Bonus
            const speedCell = document.createElement('td');
            const speedSpan = document.createElement('span');
            speedSpan.className = 'stat-value';
            speedCell.appendChild(speedSpan);
            row.appendChild(speedCell);

            const newOpSpeed = (1 + Math.max(module.getLevel(), module.maxLevel) / 100);
            const prevOpSpeed = (1 + module.maxLevel / 100);
            runningAnimations.push(animateStatValue(speedSpan, prevOpSpeed, newOpSpeed, 6000, value => {
                return `x ${value.toFixed(2)}`;
            }));

            tableBody.appendChild(row);
        }
    }

    setStatValue('statBossLevels', bossBattle.level, bossBattle.maxLevel);
    setStatValue('statBattlesFinished', getNumberOfFinishedBattles(), gameData.stats.battlesFinished.max);
    setStatValue('statWavesDefeated', getNumberOfDefeatedWaves(), gameData.stats.wavesDefeated.max);
    setAttributeStatValue('statMaxPopulation', attributes.population, gameData.stats.maxPopulation.current, gameData.stats.maxPopulation.max);
    setAttributeStatValue('statMaxIndustry', attributes.industry, gameData.stats.maxIndustry.current, gameData.stats.maxIndustry.max);
    setAttributeStatValue('statMaxGrowth', attributes.growth, gameData.stats.maxGrowth.current, gameData.stats.maxGrowth.max);
    setAttributeStatValue('statMaxMilitary', attributes.military, gameData.stats.maxMilitary.current, gameData.stats.maxMilitary.max);
    setAttributeStatValue('statMaxDanger', attributes.danger, gameData.stats.maxDanger.current, gameData.stats.maxDanger.max);
    setAttributeStatValue('statGridStrength', attributes.gridStrength, gameData.stats.gridStrength.current, gameData.stats.gridStrength.max);
}

function animateStatValue(element, start, end, duration = 1500, formatFn) {
    const startTime = performance.now();
    let lastFirework = 0;
    let newRecordHighlightSet = false;
    let stopped = false;
    const fireworkIntervals = [];

    function cleanup() {
        stopped = true;
        fireworkIntervals.forEach(intervalId => clearInterval(intervalId));
        fireworkIntervals.length = 0;
        element.classList.remove('stat-sparkle');
        const arrow = element.parentElement?.querySelector('.stat-arrow');
        if (arrow) arrow.classList.add('hidden');
    }

    function update(now) {
        if (stopped) return;

        const progress = Math.min((now - startTime) / duration, 1);
        const value = end * progress;
        element.textContent = formatFn ? formatFn(value) : Math.round(value).toLocaleString();

        if (end > start && value > start && Math.round(value) > 0) {
            if (!newRecordHighlightSet) {
                newRecordHighlightSet = true;
                element.classList.add('stat-sparkle');
                const arrow = element.parentElement?.querySelector('.stat-arrow');
                if (arrow) arrow.classList.remove('hidden');

                const interval = setInterval(() => {
                    if (stopped || !document.body.contains(element)) {
                        clearInterval(interval);
                        return;
                    }
                    if (Math.random() < 0.3) {
                        spawnFireworkNearElement(element, 3 + Math.floor(Math.random() * 5));
                    }
                }, 400 + Math.random() * 400);
                fireworkIntervals.push(interval);
            }

            if (progress < 1 && now - lastFirework > 400 + Math.random() * 400 && Math.random() < 0.5) {
                spawnFireworkNearElement(element, 5 + Math.floor(Math.random() * 5));
                lastFirework = now;
            }
        }

        if (!stopped && progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);

    return {
        stop: cleanup
    };
}

const runningAnimations = [];

/**
 *
 * @param {string} id
 * @param {number} currentValue
 * @param {number} recordValue
 */
function setStatValue(id, currentValue, recordValue) {
    const element = document.getElementById(id);
    console.assert(element !== null, 'Missing #' + id);

    if (currentValue === 0)
    {
        element.textContent = '0';
        return;
    }
    if (isUndefined(recordValue)) {
        recordValue = currentValue;
    }
    runningAnimations.push(animateStatValue(element, recordValue, currentValue, 6000));
}

function setAttributeStatValue(id, attribute, currentValue, recordValue) {
    const element = document.getElementById(id);
    console.assert(element !== null, 'Missing #' + id);

    const labelElement = document.getElementById(`${attribute.name}StatLabel`);
    if (labelElement !== null) {
        labelElement.classList.add(attribute.textClass);
        labelElement.textContent = attribute.title;
    }

    if (currentValue === 0)
    {
        element.textContent = '0';
        return;
    }
    if (isUndefined(recordValue)) {
        recordValue = currentValue;
    }
    runningAnimations.push(animateStatValue(element, recordValue, currentValue, 6000));
}

function showLastRunStats() {
    populateLastRunStats();
    const modal = new bootstrap.Modal(document.getElementById('lastRunStatsModal'));
    modal.show();
}

function closeLastRunStats() {
    const modalElement = document.getElementById('lastRunStatsModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
    runningAnimations.forEach(ctrl => ctrl.stop());
    runningAnimations.length = 0;
    startNewPlaythrough();
}

function initGameOver() {
    let modalElement = document.getElementById('gameOverModal');
    const modal = new bootstrap.Modal(modalElement);
    GameEvents.GameStateChanged.subscribe((payload) => {
        let bossDefeated;
        if (payload.newState === gameStates.BOSS_DEFEATED.name) {
            bossDefeated = true;
        } else if (payload.newState === gameStates.DEAD.name) {
            bossDefeated = false;
        } else {
            return;
        }

        Dom.get().allBySelector('#gameOverModal .bossName').forEach((nameElement) => {
            nameElement.textContent = deprepareTitle(bossBattle.title);
        });
        modal.show();

        modalElement.classList.toggle('win', bossDefeated);
        modalElement.classList.toggle('loss', !bossDefeated);
    });

    withCheats(cheats => {
        cheats.Story['GameOver'] = {
            trigger: (win) => {
                if (win){
                    gameData.transitionState(gameStates.BOSS_DEFEATED);
                } else {
                    gameData.transitionState(gameStates.DEAD);
                }
            }
        };
    });

    window.continueAfterWin = () => {
        modal.hide();
        gameData.transitionState(gameStates.PLAYING);
    };

    window.resetAfterWin = () => {
        gameData.reset();
    };

    window.showStatsAfterRun = () => {
        modal.hide();
        showLastRunStats();
    };

    window.restartAfterDead = () => {
        modal.hide();
        startNewPlaythrough();
    };
}

function initStory() {
    initIntro();
    initBossAppearance();
    initBossFightIntro();
    initGameOver();
}

initStory();
