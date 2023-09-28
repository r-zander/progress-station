'use strict';

function initIntro() {
    const introModalElement = document.getElementById('storyIntro');
    const introModal = new bootstrap.Modal(introModalElement);

    const rerollNameButton = Dom.get().byId('rerollName');
    rerollNameButton.addEventListener('click', function (event) {
        event.preventDefault();
        rerollStationName();
    });

    GameEvents.NewGameStarted.subscribe(function () {
        introModal.show();
    });

    introModalElement.addEventListener('hidden.bs.modal', function () {
        unpause();
    });
}

function initDeath() {
    const deathModal = new bootstrap.Modal(document.getElementById('deathModal'));
    GameEvents.Death.subscribe(function () {
        deathModal.show();
    });

    window.startBossBattle = function () {
        deathModal.hide();
        tabButtons.battle.classList.remove('hidden');
        setTab(tabButtons.battle, 'battleTab');
        resetBattle('Destroyer')
        startBattle('Destroyer');
        unpause();
    };
}

function initStory() {
    initIntro();
    initDeath();
}

initStory();
