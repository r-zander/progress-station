class LayerData {
    constructor(color) {
        this.color = color;
    }
}

class LayeredTask extends Task {
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
        if (this.isDone()) {
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
    }

    isDone(){
        return this.level >= this.maxLayers;
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