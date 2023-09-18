'use strict';

function initStory() {
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

initStory();
