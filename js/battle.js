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
     *     xpGain?: number,
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

    /**
     * @return {boolean} if at least one level was reached.
     */
    hasLevels() {
        return this.level > 0;
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

/**
 * Shows a reusable danger confirmation modal with callbacks for user decision.
 * @param {function()} onConfirm - Callback executed when user clicks proceed button
 * @param {function()} onCancel - Callback executed when user closes modal without proceeding
 * @return {void}
 */
function showDangerModal(onConfirm, onCancel) {
    const modalElement = document.getElementById('dangerModal');

    // Safety check: if modal is already visible, call onCancel immediately
    if (modalElement.classList.contains('show')) {
        if (isFunction(onCancel)) onCancel();
        return;
    }

    // Get existing modal instance or create new one
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

    const proceedBtn = document.getElementById('confirmDangerBtn');
    let callbackHandled = false;

    // Cleanup function to remove all event handlers
    const cleanup = () => {
        proceedBtn.removeEventListener('click', handleProceed);
        modalElement.removeEventListener('hidden.bs.modal', handleCancel);
    };

    // Handler for proceed button
    const handleProceed = () => {
        if (callbackHandled) return;
        callbackHandled = true;
        cleanup();
        modal.hide();
        if (isFunction(onConfirm)) onConfirm();
    };

    // Handler for modal close/cancel
    const handleCancel = () => {
        if (callbackHandled) return;
        callbackHandled = true;
        cleanup();
        if (isFunction(onCancel)) onCancel();
    };

    // Add event listeners
    proceedBtn.addEventListener('click', handleProceed);
    modalElement.addEventListener('hidden.bs.modal', handleCancel, { once: true });

    modal.show();
}

/**
 * @typedef {TaskSavedValues} BattleSavedValues
 * @property {number} progressSpeedMultiplierFloor
 */

class Battle extends LayeredTask {
    /**
     *
     * @param {{
     *     title: string,
     *     targetLevel: number,
     *     difficulty: number,
     *     faction: FactionDefinition,
     *     effects: EffectDefinition[],
     *     rewards: EffectDefinition[],
     * }} baseData
     */
    constructor(baseData) {
        console.assert(_.isObject(baseData.faction), 'Faction must be a config object.');
        console.assert(isNumber(baseData.faction.maxXp), 'Faction.maxXp must be a number.');
        console.assert(isNumber(baseData.targetLevel), 'targetLevel must be a number.');
        console.assert(isNumber(baseData.difficulty), 'difficulty must be a number.');

        super({
            title: baseData.title + ' ' + baseData.faction.title,
            description: baseData.faction.description,
            xpGain: BATTLE_BASE_XP_GAIN,
            maxXp: baseData.faction.maxXp * baseData.targetLevel * baseData.difficulty,
            effects: baseData.effects,
            targetLevel: baseData.targetLevel,
            requirements: undefined,
        });

        this.faction = baseData.faction;
        this.rewards = baseData.rewards;

        // A bit dirty - drop all the regular xpMultipliers as battles don't use them
        this.xpMultipliers = [
            attributes.military.getValue,
            this.getFlooredPopulationProgressSpeedMultiplier.bind(this),
        ];
    }

    /**
     * To prevent battles from (necessarily) becoming slower over time, they "pin" (or floor) the
     * PopulationProgressSpeedMultiplier when they are started. Should this multiplier increase
     * while the battle is active, the battle also speeds up. But it won't slow down below that pinned value.
     *
     * @return {number}
     */
    getFlooredPopulationProgressSpeedMultiplier(){
        return Math.max(getPopulationProgressSpeedMultiplier(), this.progressSpeedMultiplierFloor);
    }

    /**
     * @param {BattleSavedValues} savedValues
     */
    loadValues(savedValues) {
        // Set default value for older saved values
        if (!savedValues.hasOwnProperty('progressSpeedMultiplierFloor')) {
            savedValues.progressSpeedMultiplierFloor = 0;
        }

        validateParameter(savedValues, {
            level: JsTypes.Number,
            maxLevel: JsTypes.Number,
            xp: JsTypes.Number,
            requirementCompleted: JsTypes.Array,

            progressSpeedMultiplierFloor: JsTypes.Number,
        }, this);

        this.savedValues = savedValues;
    }

    /**
     *
     * @return {BattleSavedValues}
     */
    static newSavedValues() {
        return {
            level: 0,
            maxLevel: 0,
            xp: 0,
            requirementCompleted: [],

            progressSpeedMultiplierFloor: 0,
        };
    }

    /**
     * @return {BattleSavedValues}
     */
    getSavedValues() {
        return this.savedValues;
    }

    /**
     * @return {number}
     */
    get progressSpeedMultiplierFloor(){
        return this.savedValues.progressSpeedMultiplierFloor;
    }

    /**
     * @param {number} value
     */
    set progressSpeedMultiplierFloor(value) {
        this.savedValues.progressSpeedMultiplierFloor = value;
    }

    getMaxLevelMultiplier() {
        return 1;
    }

    getMaxXp() {
        return Math.round(this.maxXp * (this.level + 1) * Math.pow(1.0095, this.level));
    }

    isActive() {
        return gameData.activeEntities.battles.has(this.name);
    }

    toggle() {
        if (this.isActive()) {
            this.stop();
        } else {
            if (battlesShowDangerWarning && !this.isSafeToEngage()) {
                showDangerModal(
                    () => this.start(),   // onConfirm
                    () => {}              // onCancel (do nothing)
                );
            } else {
                this.start();
            }
        }
    }

    start() {
        if (this.isDone()) {
            // Can't activate completed battles
            return;
        }

        this.progressSpeedMultiplierFloor = getPopulationProgressSpeedMultiplier();

        gameData.activeEntities.battles.add(this.name);
        GameEvents.TaskActivityChanged.trigger({
            type: this.type,
            name: this.name,
            newActivityState: true,
        });

        updateUiIfNecessary();
    }

    stop() {
        this.progressSpeedMultiplierFloor = 0;

        gameData.activeEntities.battles.delete(this.name);
        GameEvents.TaskActivityChanged.trigger({
            type: this.type,
            name: this.name,
            newActivityState: false,
        });
    }

    /**
     * @param {EffectType} effectType
     * @returns {number}
     */
    getReward(effectType) {
        return Effect.getValue(this, effectType, this.rewards, this.level / this.targetLevel);
    }

    /**
     * @param {EffectType} effectType
     * @returns {number}
     */
    getEffect(effectType) {
        return Effect.getValue(this, effectType, this.effects, 1);
    }

    getRewardsPerLevelDescription() {
        return Effect.getDescription(this, this.rewards, 1 / this.targetLevel, true);
    }

    getRewardsDescription() {
        return Effect.getDescription(this, this.rewards, 1);
    }

    isSafeToEngage() {
        const currentDanger = attributes.danger.getValue();
        const currentMilitary = attributes.military.getValue();
        const battleDanger = this.getEffect(EffectType.Danger);

        return currentDanger + battleDanger <= currentMilitary;
    }
}

/**
 * @typedef {TaskSavedValues} BossBattleSavedValues
 * @property {string} title
 * @property {number} distance
 * @property {number} coveredDistance
 */

class BossBattle extends Battle {
    /**
     *
     * @param {{
     *     titleGenerator: NameGenerator,
     *     targetLevel: number,
     *     difficulty: number,
     *     faction: FactionDefinition,
     *     effects: EffectDefinition[],
     *     rewards: EffectDefinition[],
     * }} baseData
     */
    constructor(baseData) {
        super({
            title: '',
            targetLevel: baseData.targetLevel,
            difficulty: baseData.difficulty,
            faction: baseData.faction,
            effects: baseData.effects,
            rewards: baseData.rewards,
        });

        this.titleGenerator = baseData.titleGenerator;
    }

    getFlooredPopulationProgressSpeedMultiplier(){
        // There is no floor for boss battles
        return getPopulationProgressSpeedMultiplier();
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

            title: JsTypes.String,
            distance: JsTypes.Number,
            coveredDistance: JsTypes.Number,
        }, this);

        if (savedValues.title === '') {
            savedValues.title = prepareTitle(this.titleGenerator.generate());
        }

        this.savedValues = savedValues;
        this.title = savedValues.title;
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
            title: '',
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

    stop() {
        // Undefeated boss battle can not be stopped
        if (!this.isDone()) return;

        super.stop();
    }

    onDone() {
        super.onDone();
        gameData.transitionState(gameStates.BOSS_DEFEATED);
    }

    getMaxXp() {
        return Math.round(this.maxXp * (this.level + 1) * Math.pow(10, this.level));
    }
    // noinspection JSCheckFunctionSignatures
    getEffectDescription() {
        return super.getEffectDescription(1);
    }

    getRewardsDescription() {
        return attributes.essenceOfUnknown.inlineHtmlWithIcon + ' per defeated wave';
    }
}

class FactionLevelsDefeatedRequirement extends Requirement {
    /**
     * @param {'permanent'|'playthrough'|'update'} scope
     * @param {{
     *     faction: FactionDefinition,
     *     requirement: number
     * }} baseData
     * @param {Requirement[]} [prerequisites]
     */
    constructor(scope, baseData, prerequisites) {
        super('FactionLevelsDefeatedRequirement', scope, baseData, prerequisites);
    }

    generateName() {
        return `FactionLevelsDefeated_${this.scope}_${this.baseData.faction.name}_${this.baseData.requirement}`;
    }

    /**
     * @param {{
     *     faction: FactionDefinition,
     *     requirement: number
     * }} baseData
     * @return {boolean}
     */
    getCondition(baseData) {
        return this.#getDefeatedLevels(baseData.faction) >= baseData.requirement;
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
     * }} baseData
     * @return {string}
     */
    toHtmlInternal(baseData) {
        const defeatedLevels = this.#getDefeatedLevels(baseData.faction);
        return `Defeated
<span class="name">${baseData.faction.title}</span>
waves
<data value="${defeatedLevels}">${defeatedLevels}</data> /
<data value="${baseData.requirement}">${baseData.requirement}</data>
`;
    }
}