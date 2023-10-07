class LayerData {
    constructor(color) {
        this.color = color;
    }
}

class LayeredTask extends Task {
    constructor(baseData) {
        super(baseData);
        this.maxLayers = this.baseData.maxLayers;
    }

    do() {
        if (this.isDone()) return;

        super.do();
        if (this.isDone()) {
            this.onDone();
        }
    }

    isDone() {
        return this.level >= this.maxLayers;
    }

    onDone() {
        // Default no-op
    }
}

class Battle extends LayeredTask {
    increaseXp(ignoreDeath = true) {
        super.increaseXp(ignoreDeath);
    }

    onDone() {
        super.onDone();
        GameEvents.GameOver.trigger({
            bossDefeated: true,
        });
    }
}
