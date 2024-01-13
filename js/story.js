'use strict';

function initIntro() {
    const modal = new bootstrap.Modal(document.getElementById('storyIntro'));

    const rerollNameButton = Dom.get().byId('rerollName');
    rerollNameButton.addEventListener('click', function (event) {
        event.preventDefault();
        rerollStationName();
    });

    GameEvents.NewGameStarted.subscribe( () => {
        modal.show();
    });

    if (_.isObject(cheats)) {
        cheats.Story['Intro'] = {
            trigger: () => {
                GameEvents.NewGameStarted.trigger(undefined);
            }
        };
    }

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

    if (_.isObject(cheats)) {
        cheats.Story['BossAppearance'] = {
            trigger: () => {
                GameEvents.BossAppearance.trigger(undefined);
            }
        };
    }

    window.acknowledgeBossBattle = function () {
        modal.hide();
        setTab('battles');
        gameData.transitionState(gameStates.PLAYING);
    };
}

function initBossFightIntro() {
    const modal = new bootstrap.Modal(document.getElementById('bossFightIntroModal'));
    GameEvents.GameStateChanged.subscribe(function (payload) {
        if (payload.newState !== gameStates.BOSS_FIGHT_INTRO.name) return;

        Dom.get().byId('delayBossBattleButton').classList.toggle('hidden', bossBattle.distance === 0);
        modal.show();
    });

    if (_.isObject(cheats)) {
        cheats.Story['BossFightIntro'] = {
            trigger: () => {
                gameData.transitionState(gameStates.BOSS_FIGHT_INTRO);
            }
        };
    }

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

        modal.show();

        modalElement.classList.toggle('win', bossDefeated);
        modalElement.classList.toggle('loss', !bossDefeated);
    });

    if (_.isObject(cheats)) {
        cheats.Story['GameOver'] = {
            trigger: (win) => {
                if (win){
                    gameData.transitionState(gameStates.BOSS_DEFEATED);
                } else {
                    gameData.transitionState(gameStates.DEAD);
                }
            }
        };
    }

    window.continueAfterWin = () => {
        modal.hide();
        gameData.transitionState(gameStates.PLAYING);
    };

    window.resetAfterWin = () => {
        gameData.reset();
    };

    window.restartAfterDead = () => {
        modal.hide();
        rebirthOne();
    };
}

function initStory() {
    initIntro();
    initBossAppearance();
    initBossFightIntro();
    initGameOver();
}

initStory();
