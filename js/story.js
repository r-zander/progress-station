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

function initBossAppearance() {
    const modal = new bootstrap.Modal(document.getElementById('bossAppearanceModal'));
    GameEvents.BossAppearance.subscribe(function () {
        modal.show();
    });

    window.startBossBattle = function () {
        modal.hide();
        // TODO once there is a full specification for boss battle
        // tabButtons.battles.classList.remove('hidden');
        // resetBattle('Destroyer');
        // startBattle('Destroyer');
        setTab('battles');
        unpause();
    };
}

function initGameOver() {
    let modalElement = document.getElementById('gameOverModal');
    const modal = new bootstrap.Modal(modalElement);
    GameEvents.GameOver.subscribe( (payload) => {
        modal.show();

        modalElement.classList.toggle('win', payload.bossDefeated);
        modalElement.classList.toggle('loss', !payload.bossDefeated);
    });

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
    initGameOver();
}

initStory();
