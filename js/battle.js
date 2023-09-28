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

    do(){
        if (this.isDone()) return;
        super.do();
    }

    isDone(){
        return this.level >= this.maxLayers;
    }
}

class Battle extends LayeredTask {
    getXpGain() {
        return applySpeed(applyMultipliers(10, this.xpMultipliers), true);
    }

    // TODO never triggered
    onDone() {
        super.onDone();
        GameEvents.GameOver.trigger({
            bossDefeated: this.isDone(),
        });
    }
}
