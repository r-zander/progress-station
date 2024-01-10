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
     *     targetLevel: number,
     * }} baseData
     */
    constructor(baseData) {
        super(baseData);
        this.targetLevel = baseData.targetLevel;
    }

    do() {
        if (this.isDone()) return;

        super.do();
        if (this.isDone()) {
            this.onDone();
        }
    }

    isDone() {
        return this.level >= this.targetLevel;
    }

    onDone() {
        // Default no-op
    }

    /**
     * @return {number}
     */
    getDisplayedLevel() {
        return this.targetLevel - this.level;
    }
}

class Battle extends LayeredTask {
    /**
     *
     * @param {{
     *     title: string,
     *     targetLevel: number,
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
            targetLevel: baseData.targetLevel,
            requirements: undefined,
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
        return gameData.activeEntities.battles.has(this.name);
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

        gameData.activeEntities.battles.add(this.name);
    }

    stop(){
        gameData.activeEntities.battles.delete(this.name);
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
        return Effect.getValue(this, effectType, this.effects, 1);
    }

    getRewardsDescription(){
        return Effect.getDescription(this, this.rewards, 1);
    }
}

class BossBattle extends Battle {
    /**
     *
     * @param {{
     *     title: string,
     *     targetLevel: number,
     *     faction: FactionDefinition,
     *     effects: EffectDefinition[],
     *     rewards: EffectDefinition[],
     *     progressBarId: string,
     *     layerLabel: string,
     * }} baseData
     */
    constructor(baseData) {
        super(baseData);
        this.progressBarId = baseData.progressBarId;
        this.layerLabel = baseData.layerLabel;
    }

    /**
     * @return {boolean}
     */
    isProgressing(){
        return gameData.state.isBossBattleProgressing;
    }

    onDone() {
        super.onDone();
        gameData.transitionState(gameStates.BOSS_DEFEATED);
    }

    getRewardsDescription(){
        return 'Essence of Unknown';
    }
}

class FactionLevelsDefeatedRequirement extends Requirement {
    /**
     * @param {'permanent'|'playthrough'|'update'} scope
     * @param {{
     *     faction: FactionDefinition,
     *     requirement: number
     * }[]} requirements
     */
    constructor(scope, requirements) {
        super('FactionLevelsDefeatedRequirement', scope, requirements);
    }

    /**
     * @param {{
     *     faction: FactionDefinition,
     *     requirement: number
     * }} requirement
     * @param requirement
     * @return {boolean}
     */
    getCondition(requirement) {
        return this.#getDefeatedLevels(requirement.faction) >= requirement.requirement;
    }

    /**
     * @param {FactionDefinition} faction
     * @return {number}
     */
    #getDefeatedLevels(faction) {
        return Object.values(battles)
            .filter((battle) => battle.faction === faction)
            .map((battle) => battle.level)
            .reduce((prev, cur) => prev + cur, 0);
    }

    /**
     * @param {{
     *     faction: FactionDefinition,
     *     requirement: number
     * }} requirement
     * @return {string}
     */
    toHtmlInternal(requirement) {
        const defeatedLevels = this.#getDefeatedLevels(requirement.faction);
        return `Defeated
<span class="name">${requirement.faction.title}</span>
level 
<data value="${defeatedLevels}">${defeatedLevels}</data> /
<data value="${requirement.requirement}">${requirement.requirement}</data>
`;
    }
}
