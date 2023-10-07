'use strict';

function initIntro() {
    const modal = new bootstrap.Modal( document.getElementById('storyIntro'));

    const rerollNameButton = Dom.get().byId('rerollName');
    rerollNameButton.addEventListener('click', function (event) {
        event.preventDefault();
        rerollStationName();
    });

    GameEvents.NewGameStarted.subscribe(function () {
        modal.show();
    });

    window.finishIntro = function () {
        modal.hide();
        unpause();
    };
}

function initDeath() {
    const modal = new bootstrap.Modal(document.getElementById('deathModal'));
    GameEvents.Death.subscribe(function () {
        modal.show();
    });

    window.startBossBattle = function () {
        modal.hide();
        tabButtons.battle.classList.remove('hidden');
        setTab(tabButtons.battle, 'battleTab');
        resetBattle('Destroyer');
        startBattle('Destroyer');
        unpause();
    };
}

function initGameOver() {
    let modalElement = document.getElementById('gameOverModal');
    const modal = new bootstrap.Modal(modalElement);
    GameEvents.GameOver.subscribe(function (payload) {
        modal.show();

        modalElement.classList.toggle('win', payload.bossDefeated);
        modalElement.classList.toggle('loss', !payload.bossDefeated);
    });

    window.resetAfterGameOver = function () {
        // TODO thing about what actually to do. This is just a fail-safe
        if (confirm('This is going to delete all your progress. Continue?')) {
            resetGameData();
        }
    };

    window.restartAfterGameOver = function () {
        modal.hide();
        rebirthOne();
    };
}

function initStory() {
    initIntro();
    initDeath();
    initGameOver();
}

initStory();
