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
        // TODO once there is a full specification for boss battle
        // tabButtons.battles.classList.remove('hidden');
        // resetBattle('Destroyer');
        // startBattle('Destroyer');
        setTab('battles');
        gameData.transitionState(gameStates.PLAYING);
    };
}

function initBossFightIntro() {
    const modal = new bootstrap.Modal(document.getElementById('bossFightIntroModal'));
    GameEvents.GameStateChanged.subscribe(function (payload) {
        if (payload.newState !== gameStates.BOSS_FIGHT_INTRO) return;

        modal.show();
    });

    if (_.isObject(cheats)) {
        cheats.Story['BossFightIntro'] = {
            trigger: () => {
                gameData.transitionState(gameStates.BOSS_FIGHT_INTRO);
            }
        };
    }

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
        if (payload.newState === gameStates.BOSS_DEFEATED) {
            bossDefeated = true;
        } else if (payload.newState === gameStates.DEAD) {
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

    // TODO thing about what actually to do. This is just a "that's the other option"
    window.resetAfterGameOver = () => {
        gameData.reset();
    };

    window.restartAfterGameOver = () => {
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
