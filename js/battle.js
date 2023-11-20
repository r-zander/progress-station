'use strict';

class LayerData {
    constructor(color) {
        this.color = color;
    }
}

class LayeredTask extends Task {
    /**
     * @param {{
     *     title: string,
     *     description?: string,
     *     maxXp: number,
     *     effects: EffectDefinition[],
     *     maxLevel: number,
     * }} baseData
     */
    constructor(baseData) {
        super(baseData);
    }

    do() {
        if (this.isDone()) return;

        super.do();
        if (this.isDone()) {
            this.onDone();
        }
    }

    isDone() {
        return this.level >= this.maxLevel;
    }

    onDone() {
        // Default no-op
    }

    /**
     * @return {number}
     */
    getDisplayedLevel() {
        return this.maxLevel - this.level;
    }
}

class Battle extends LayeredTask {
    /**
     *
     * @param {{
     *     title: string,
     *     maxLevel: number,
     *     faction: FactionDefinition,
     *     effects: EffectDefinition[],
     *     rewards: EffectDefinition[],
     * }} baseData
     */
    constructor(baseData) {
        super({
            title: baseData.title + ' ' + baseData.faction.title,
            description: baseData.faction.description,
            maxXp: baseData.faction.maxXp,
            effects: baseData.effects,
            // TODO maxLevel needs to go into savedValues
            maxLevel: baseData.maxLevel,
        });

        this.faction = baseData.faction;
        this.rewards = baseData.rewards;
    }

    collectEffects() {
        super.collectEffects();
        this.xpMultipliers.push(attributes.military.getValue);
    }

    getMaxLevelMultiplier() {
        return 1;
    }

    isActive(){
        return gameData.currentBattles.hasOwnProperty(this.name);
    }

    toggle(){
        if (this.isActive()) {
            this.stop();
        } else {
            this.start();
        }
    }

    start(){
        if (this.isDone()) {
            // Can't activate completed battles
            return;
        }

        gameData.currentBattles[this.name] = this;
    }

    stop(){
        delete gameData.currentBattles[this.name];
    }

    /**
     * @param {EffectType} effectType
     * @returns {number}
     */
    getReward(effectType) {
        return Effect.getValue(this, effectType, this.rewards, 1);
    }

    /**
     * @param {EffectType} effectType
     * @returns {number}
     */
    getEffect(effectType) {
        return Effect.getValue(this, effectType, this.baseData.effects, 1);
    }

    getRewardsDescription(){
        return Effect.getDescription(this, this.rewards, 1);
    }
}

class BossBattle extends Battle {
    increaseXp(ignoreDeath = true) {
        super.increaseXp(ignoreDeath);
    }

    onDone() {
        super.onDone();
        GameEvents.GameOver.trigger({
            bossDefeated: true,
        });
    }

    getRewardsDescription(){
        return 'Essence of Unknown';
    }
}

class FactionLevelsDefeatedRequirement extends Requirement {
    constructor(elements, requirements) {
        super('FactionLevelsDefeatedRequirement', elements, requirements);
    }

    getCondition(requirement) {
        return Object.values(battles)
            .filter((battle) => battle.faction === requirement.faction)
            .map((battle) => battle.level)
            .reduce((prev, cur) => prev + cur, 0) >= requirement.requirement;
    }
}
