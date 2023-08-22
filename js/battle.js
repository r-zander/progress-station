class LayerData {
    constructor(color) {
        this.color = color;
    }
}

class LayeredTask extends Task {
    #done = false;

    init(){
        this.maxLayers = this.baseData.maxLayers;
        this.taskProgressBar = document.getElementById(this.baseData.progressBarId);
        this.taskProgressBarFill = this.taskProgressBar.getElementsByClassName('progressFill')[0];

        this.adjustLayerColorsByLevel();
    }

    levelUp() {
        super.levelUp();
        this.adjustLayerColorsByLevel();
    }

    adjustLayerColorsByLevel() {
        if (this.#done || this.level >= this.maxLayers) {
            this.onDone();
            return;
        }

        this.taskProgressBarFill.style.backgroundColor = layerData[this.level].color;

        let newBackgroundColor;
        if (this.level < this.maxLayers - 1 && this.level < layerData.length - 1) {
            newBackgroundColor = layerData[this.level + 1].color;
        } else {
            newBackgroundColor = lastLayerData.color;
        }
        this.taskProgressBar.style.backgroundColor = newBackgroundColor;
    }

    onDone() {
        this.taskProgressBar.style.backgroundColor = lastLayerData.color;
        this.taskProgressBarFill.style.width = '0%';
        this.taskProgressBar.getElementsByClassName('name')[0].textContent = 'Defeated';
        this.#done = true;
    }

    isDone(){
        return this.#done;
    }
}

class Battle extends LayeredTask {
    onDone() {
        super.onDone();
        Events.GameOver.trigger({
            bossDefeated: this.isDone(),
        });
    }
}