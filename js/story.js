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
            nameElement.textContent = bossBattle.title;
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
            nameElement.textContent = bossBattle.title;
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
