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
            maxXp: baseData.faction.maxXp * baseData.targetLevel,
            effects: baseData.effects,
            targetLevel: baseData.targetLevel,
            requirements: undefined,
        });

        this.faction = baseData.faction;
        this.rewards = baseData.rewards;

        this.xpMultipliers.push(attributes.military.getValue);
    }

    getMaxLevelMultiplier() {
        return 1;
    }

    isActive() {
        return gameData.activeEntities.battles.has(this.name);
    }

    toggle() {
        if (this.isActive()) {
            this.stop();
        } else {
            this.start();
        }
    }

    start() {
        if (this.isDone()) {
            // Can't activate completed battles
            return;
        }

        gameData.activeEntities.battles.add(this.name);
    }

    stop() {
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

    getRewardsDescription() {
        return Effect.getDescription(this, this.rewards, 1);
    }
}

/**
 * @typedef {TaskSavedValues} BossBattleSavedValues
 * @property {number} distance
 * @property {number} coveredDistance
 */

class BossBattle extends Battle {
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
        super(baseData);
    }

    /**
     * @param {BossBattleSavedValues} savedValues
     */
    loadValues(savedValues) {
        validateParameter(savedValues, {
            level: JsTypes.Number,
            maxLevel: JsTypes.Number,
            xp: JsTypes.Number,
            requirementCompleted: JsTypes.Array,
            distance: JsTypes.Number,
            coveredDistance: JsTypes.Number,
        }, this);
        this.savedValues = savedValues;
    }

    /**
     *
     * @return {BossBattleSavedValues}
     */
    static newSavedValues() {
        return {
            level: 0,
            maxLevel: 0,
            xp: 0,
            requirementCompleted: [],
            distance: bossBattleDefaultDistance,
            coveredDistance: 0,
        };
    }

    /**
     * @return {BossBattleSavedValues}
     */
    getSavedValues() {
        return this.savedValues;
    }

    get distance() {
        return this.savedValues.distance - this.coveredDistance;
    }

    get coveredDistance() {
        return this.savedValues.coveredDistance;
    }

    /**
     * @param {number} coveredDistance
     */
    set coveredDistance(coveredDistance) {
        this.savedValues.coveredDistance = coveredDistance;
        if (this.distance <= 0) {
            gameData.transitionState(gameStates.BOSS_FIGHT_INTRO);
        }
    }

    decrementDistance() {
        if (this.distance <= 0) return;

        this.savedValues.distance = (this.savedValues.distance - 1);
        if (this.distance <= 0) {
            gameData.transitionState(gameStates.BOSS_FIGHT_INTRO);
        }
    }

    /**
     * @param {MaxLevelBehavior} maxLevelBehavior
     */
    reset(maxLevelBehavior) {
        super.reset(maxLevelBehavior);

        this.savedValues.distance = bossBattleDefaultDistance;
        this.savedValues.coveredDistance = 0;
    }

    /**
     * @return {boolean}
     */
    isProgressing() {
        return gameData.state.isBossBattleProgressing;
    }

    onLevelUp(previousLevel, newLevel) {
        super.onLevelUp(previousLevel, newLevel);

        for(let level = previousLevel; level < newLevel; level++) {
            gameData.essenceOfUnknown += Math.pow(2, level);
        }
    }

    stop() {
        // Undefeated boss battle can not be stopped
        if (!this.isDone()) return;

        super.stop();
    }

    onDone() {
        super.onDone();
        gameData.transitionState(gameStates.BOSS_DEFEATED);
    }

    // noinspection JSCheckFunctionSignatures
    getEffectDescription() {
        return super.getEffectDescription(1);
    }

    getRewardsDescription() {
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
