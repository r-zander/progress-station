'use strict';

/**
 * @typedef {Object} AutoplayAction
 * @property {'operation'|'location'|'battle'} type
 * @property {HTMLElement} element
 * @property {number} score
 * @property {string} name
 * @property {PointOfInterest} [location]
 * @property {ModuleOperation} [operation]
 * @property {Battle} [battle]
 * @property {boolean} isActive
 */

/**
 * Progress Station Autoplay System
 *
 * A self-contained autoplay implementation using a **Greedy Hill Climber algorithm**
 * with prioritized queue for automated gameplay.
 *
 * Features:
 * - Efficiency-based action scoring (progress%/cycle)
 * - Growth action prioritization with population threshold
 * - Safety constraints (Danger <= Military)
 * - Modal dialog handling
 * - Game over detection
 */
class AutoplaySystem {
    constructor() {
        this.enabled = this.loadEnabledState();
        this.evaluationTimer = null;
        // this.currentActions = {
        //     operation: null,
        //     battle: null,
        //     location: null
        // };
        /**
         * @type {{
         *  operation: AutoplayAction[],
         *  battle: AutoplayAction[],
         *  location: AutoplayAction[]
         * }}
         */
        this.priorityQueues = {
            operation: [],
            battle: [],
            location: []
        };
        this.lastActionTime = 0;
        this.config = {
            populationThreshold: 0.95, // 95% of theoretical max
            evaluationInterval: 1000,  // 1 second
            actionCooldown: 100,       // Minimum time between actions
            debug: true,
            modalOverrides: {
                // Add specific modal overrides here if needed
                // 'modalId': 'selectorToClick'
            },
            // Autoplay won't act when any of these are the current game state
            stateBlacklist: [
                gameStates.PAUSED,
                gameStates.BOSS_FIGHT_PAUSED
            ],
        };

        this.actionHistory = [];

        // Initialize the system
        this.init();
    }

    init() {
        this.createAutoplayToggle();
        this.setupModalHandler();
        // this.setupPlayerActionHandler();
        this.log('Autoplay system initialized');
    }

    /**
     * Creates the autoplay toggle UI underneath the Play button
     */
    createAutoplayToggle() {
        const pauseButton = document.getElementById('pauseButton');
        if (!pauseButton) {
            console.error('Could not find pause button to add autoplay toggle');
            return;
        }

        const actionsDiv = pauseButton.parentElement;
        actionsDiv.classList.add('panel');
        actionsDiv.style.borderRadius = '16px';

        // Create autoplay toggle container
        const autoplayContainer = document.createElement('div');
        autoplayContainer.className = 'd-flex align-items-center justify-content-center mt-2';
        autoplayContainer.id = 'autoplayContainer';

        // Create toggle switch
        const toggleDiv = document.createElement('div');
        toggleDiv.className = 'form-check form-switch';

        const toggleInput = document.createElement('input');
        toggleInput.className = 'form-check-input';
        toggleInput.type = 'checkbox';
        toggleInput.role = 'switch';
        toggleInput.id = 'autoplaySwitch';
        toggleInput.checked = this.enabled;

        const toggleLabel = document.createElement('label');
        toggleLabel.className = 'form-check-label';
        toggleLabel.htmlFor = 'autoplaySwitch';
        toggleLabel.textContent = 'Autoplay';

        toggleDiv.appendChild(toggleInput);
        toggleDiv.appendChild(toggleLabel);
        autoplayContainer.appendChild(toggleDiv);

        // Insert after the pause button
        actionsDiv.appendChild(autoplayContainer);

        // Add event listener
        toggleInput.addEventListener('change', (event) => {
            this.toggle(event.target.checked);
        });

        this.toggleElement = toggleInput;
    }

    /**
     * Toggles autoplay on/off
     */
    toggle(enabled) {
        this.enabled = enabled;
        this.saveEnabledState();

        if (this.enabled) {
            this.start();
        } else {
            this.stop();
        }

        this.log(`Autoplay ${this.enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Starts the autoplay system
     */
    start() {
        if (this.evaluationTimer) {
            clearInterval(this.evaluationTimer);
        }

        this.evaluationTimer = setInterval(() => {
            this.evaluateAndAct();
        }, this.config.evaluationInterval);

        this.log('Autoplay started');
    }

    /**
     * Stops the autoplay system
     */
    stop() {
        if (this.evaluationTimer) {
            clearInterval(this.evaluationTimer);
            this.evaluationTimer = null;
        }

        // this.currentActions = {
        //     operation: null,
        //     battle: null,
        //     location: null
        // };
        this.priorityQueues = {
            operation: [],
            battle: [],
            location: []
        };
        this.log('Autoplay stopped');
    }

    /**
     * Main evaluation and action execution method
     */
    evaluateAndAct() {
        try {
            // Check if game is in a state where we can act
            if (!this.canAct()) {
                return;
            }

            // Check if game over
            if (this.isGameWon()) {
                this.log('Game over detected, stopping autoplay');
                this.toggle(false);
                if (this.toggleElement) {
                    this.toggleElement.checked = false;
                }
                return;
            }

            // Handle any open modals first
            if (this.handleModalDialogs()) {
                return; // Skip action evaluation if we handled a modal
            }

            // Clear all queues
            this.priorityQueues.operation = [];
            this.priorityQueues.battle = [];
            this.priorityQueues.location = [];

            // Evaluate each action type into its own queue
            this.evaluateOperations();
            this.evaluateBattles();
            this.evaluateLocations();

            Object.keys(this.priorityQueues).forEach(type => {
                if (this.priorityQueues[type].length === 0) return;

                // Sort by highest first
                this.priorityQueues[type].sort((a, b) => b.score - a.score);
                const bestAction = this.priorityQueues[type][0];
                this.executeAction(bestAction);
            });
        } catch (error) {
            console.error('Autoplay error:', error);
        }
    }

    /**
     * Checks if autoplay can perform actions
     */
    canAct() {
        // Check if game is loaded
        if (gameData === null || !gameData.state) {
            return false;
        }

        // Check if game state allows changes
        if (!gameData.state.canChangeActivation) {
            return false;
        }

        if (this.config.stateBlacklist.includes(gameData.state)) {
            return false;
        }

        // Check action cooldown
        const now = Date.now();
        if (now - this.lastActionTime < this.config.actionCooldown) {
            return false;
        }

        return true;
    }

    /**
     * Checks if the game is over (win condition)
     */
    isGameWon() {
        return gameData.state === gameStates.BOSS_DEFEATED;
    }

    /**
     * Handles modal dialogs by clicking appropriate buttons
     */
    handleModalDialogs() {
        const modals = document.querySelectorAll('.modal');
        for (const modal of modals) {
            if (!modal.classList.contains('show')) return;

            this.log('Seeing modal #' + modal.id);

            const modalId = modal.id;

            // Check for specific override
            if (this.config.modalOverrides[modalId]) {
                const selector = this.config.modalOverrides[modalId];
                const button = modal.querySelector(selector);
                if (button) {
                    this.log(`Clicking modal override: ${selector} in ${modalId}`);
                    button.click();
                    return true;
                }
            }

            // Default: click primary button
            const primaryButton = modal.querySelector('.btn-primary');
            if (primaryButton) {
                this.log(`Clicking .btn-primary in modal: ${modalId}`);
                primaryButton.click();
                return true;
            }
        }
        return false;
    }

    /**
     * Sets up global modal handler for future modals
     */
    setupModalHandler() {
        // Monitor for new modals using mutation observer
        const observer = new MutationObserver((mutations) => {
            if (!this.enabled) return;

            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.classList.contains('modal') &&
                        target.style.display !== 'none' &&
                        !target.classList.contains('hidden')) {
                        // Small delay to let modal fully show
                        setTimeout(() => {
                            if (this.enabled) {
                                this.handleModalDialogs();
                            }
                        }, 100);
                    }
                }
            });
        });

        // Observe all modals
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            observer.observe(modal, { attributes: true, attributeFilter: ['style', 'class'] });
        });
    }

    // setupPlayerActionHandler() {
    //     GameEvents.TaskActivityChanged.subscribe((taskInfo) => {
    //         if (taskInfo.newActivityState !== true) return;
    //
    //         // Drop our current action to re-evaluate next tick
    //         this.currentActions[taskInfo.type] = null;
    //     });
    // }

    /**
     * Evaluates all available module operations
     */
    evaluateOperations() {
        for (const operationName in moduleOperations) {
            const operation = moduleOperations[operationName];
            const element = document.getElementById(operation.domId);

            if (!element || element.classList.contains('hidden') || !this.isOperationAvailable(operation)) {
                continue;
            }

            /** @var {HTMLElement} */
            const progressBar = element.querySelector('.progressBar');
            if (!progressBar) continue;

            const score = this.calculateOperationScore(operation);
            if (score > 0) {
                this.priorityQueues.operation.push({
                    type: 'operation',
                    element: progressBar,
                    operation: operation,
                    score: score,
                    name: `${operation.component.title}: ${operation.title}`,
                    isActive: operation.isActive('self'),
                });
            }
        }
    }

    /**
     * Evaluates all available battles
     */
    evaluateBattles() {
        for (const battleName in battles) {
            const battle = battles[battleName];
            const element = document.getElementById(battle.domId);

            if (!element || element.classList.contains('hidden') || battle.isDone()) {
                continue;
            }

            /** @var {HTMLElement} */
            const progressBar = element.querySelector('.progressBar');
            if (!progressBar) continue;

            const score = this.calculateBattleScore(battle);
            if (score > 0) {
                this.priorityQueues.battle.push({
                    type: 'battle',
                    element: progressBar,
                    battle: battle,
                    score: score,
                    name: `Battle: ${battle.title}`,
                    isActive: battle.isActive('self'),
                });
            }
        }
    }

    /**
     * Evaluates all available locations (points of interest)
     */
    evaluateLocations() {
        for (const poiName in pointsOfInterest) {
            const poi = pointsOfInterest[poiName];

            const sector = poi.sector;
            if (sector === null) {
                continue;
            }

            const sectorElement = document.getElementById(sector.domId);
            if (!sectorElement || sectorElement.classList.contains('hidden')) {
                continue;
            }

            const element = document.getElementById(poi.domId);

            if (!element || element.classList.contains('hidden')) {
                continue;
            }

            /** @var {HTMLElement} */
            const button = element.querySelector('.point-of-interest');
            if (!button) continue;

            const score = this.calculateLocationScore(poi);
            if (score > 0) {
                this.priorityQueues.location.push({
                    type: 'location',
                    element: button,
                    location: poi,
                    score: score,
                    name: `Location: ${poi.title}`,
                    isActive: poi.isActive(),
                });
            }
        }
    }

    /**
     * Calculates efficiency score for an operation
     */
    calculateOperationScore(operation) {
        try {
            // Check if operation is available
            if (!this.isOperationAvailable(operation)) {
                return 0;
            }

            // Check grid load constraints
            if (this.wouldExceedGridLoad(operation)) {
                return 0;
            }

            // Get base efficiency (progress per cycle)
            let efficiency = 0;
            if (operation.getMaxXp && operation.getXpGain) {
                const maxXp = operation.getMaxXp();
                const xpGain = operation.getXpGain();
                if (maxXp > 0 && xpGain > 0) {
                    efficiency = xpGain / maxXp; // fraction of progress per cycle
                }
            }

            // Apply Growth priority boost
            if (this.hasGrowthEffect(operation) && this.shouldPrioritizeGrowth()) {
                efficiency *= 2.0; // 2x boost for Growth
            }

            return efficiency;

        } catch (error) {
            this.log(`Error calculating operation score for ${operation.title}: ${error.message}`);
            return 0;
        }
    }

    /**
     * Checks if activating an operation would exceed grid load capacity
     */
    wouldExceedGridLoad(operation) {
        try {
            if (!operation.getGridLoad) {
                return false;
            }

            const currentGridLoad = attributes.gridLoad.getValue();
            const gridStrength = attributes.gridStrength.getValue();
            const operationGridLoad = operation.getGridLoad();

            // Check if the current component has an active operation
            const component = operation.component;
            if (component && component.getActiveOperation) {
                const activeOp = component.getActiveOperation();
                if (activeOp && activeOp !== operation) {
                    // We would replace the active operation, so subtract its grid load
                    const activeOpGridLoad = activeOp.getGridLoad ? activeOp.getGridLoad() : 0;
                    const newGridLoad = currentGridLoad - activeOpGridLoad + operationGridLoad;
                    return newGridLoad > gridStrength;
                }
            }

            // Simple case: adding new operation
            return (currentGridLoad + operationGridLoad) > gridStrength;
        } catch {
            return true; // Safe default: assume it would exceed
        }
    }

    /**
     * Calculates score for a battle
     */
    calculateBattleScore(battle) {
        try {
            // Check safety constraint first
            if (!this.isBattleSafe(battle)) {
                return 0;
            }

            // If battle is active, no need to click
            if (battle.isActive()) {
                return 0;
            }

            // Calculate efficiency
            let efficiency = 0;
            if (battle.getMaxXp && battle.getXpGain) {
                const maxXp = battle.getMaxXp();
                const xpGain = battle.getXpGain();
                if (maxXp > 0 && xpGain > 0) {
                    efficiency = xpGain / maxXp;
                }
            }

            // Apply Growth priority boost if battle rewards include Growth
            if (this.hasGrowthEffect(battle) && this.shouldPrioritizeGrowth()) {
                efficiency *= 2.0;
            }

            return efficiency;

        } catch (error) {
            this.log(`Error calculating battle score for ${battle.title}: ${error.message}`);
            return 0;
        }
    }

    /**
     * Calculates score for a location change
     */
    calculateLocationScore(location) {
        try {
            // Basic scoring based on effects
            let score = 0;

            if (location.getEffects) {
                const effects = location.getEffects();
                effects.forEach(effect => {
                    // Give points for any positive effect
                    if (effect.baseValue > 0) {
                        score += effect.baseValue * 0.1; // Scale down for location changes
                    }
                });
            }

            // Apply Growth priority boost
            if (this.hasGrowthEffect(location) && this.shouldPrioritizeGrowth()) {
                score *= 2.0;
            }

            return score;

        } catch (error) {
            this.log(`Error calculating location score for ${location.title}: ${error.message}`);
            return 0;
        }
    }

    /**
     * Checks if an operation is available (not blocked by requirements)
     */
    isOperationAvailable(operation) {
        try {
            // Check if operation has unfulfilled requirements
            const requirements = operation.getUnfulfilledRequirements ?
                operation.getUnfulfilledRequirements() : null;

            // Check if the operation's component and module are available
            const component = operation.component;
            const module = component ? component.module : null;

            if (component && component.getUnfulfilledRequirements) {
                const componentReqs = component.getUnfulfilledRequirements();
                if (componentReqs !== null) return false;
            }

            if (module && module.getUnfulfilledRequirements) {
                const moduleReqs = module.getUnfulfilledRequirements();
                if (moduleReqs !== null) return false;
            }

            // Check if module is active
            if (module && module.isActive && !module.isActive()) {
                return false;
            }

            return requirements === null;
        } catch (error) {
            this.log(`Error checking operation availability: ${error.message}`);
            return false;
        }
    }

    /**
     * Checks if a battle is safe (Danger <= Military constraint)
     */
    isBattleSafe(battle) {
        try {
            if (!battle.getEffect) {
                return false;
            }

            const currentDanger = attributes.danger.getValue();
            const currentMilitary = attributes.military.getValue();
            const battleDanger = battle.getEffect(EffectType.Danger) || 0;

            const totalDanger = currentDanger + battleDanger;

            return totalDanger <= currentMilitary;
        } catch {
            return false;
        }
    }

    /**
     * Checks if an action provides Growth effects
     */
    hasGrowthEffect(actionObject) {
        try {
            if (!actionObject.getEffects && !actionObject.effects) {
                return false;
            }

            const effects = actionObject.getEffects ? actionObject.getEffects() : actionObject.effects;
            if (!effects) return false;

            return effects.some(effect =>
                effect.effectType === EffectType.Growth ||
                effect.effectType === EffectType.GrowthFactor
            );
        } catch {
            return false;
        }
    }

    /**
     * Determines if Growth should be prioritized based on population threshold
     */
    shouldPrioritizeGrowth() {
        try {
            const currentPopulation = attributes.population.getValue();
            const growth = attributes.growth.getValue();

            // Calculate theoretical maximum population based on current Growth
            // Using the formula from the game: population approaches growth/heat in steady state
            const currentHeat = attributes.heat.getValue() / 100; // Convert percentage to decimal
            const theoreticalMax = growth / (0.01 * currentHeat); // From the population delta formula

            const populationRatio = currentPopulation / theoreticalMax;

            return populationRatio < this.config.populationThreshold;

        } catch (error) {
            this.log(`Error checking Growth priority: ${error.message}`);
            return true; // Default to prioritizing Growth on error
        }
    }

    /**
     * Executes the chosen action
     *
     * @param {AutoplayAction} action
     */
    executeAction(action) {
        try {
            // Check if we're already doing this action
            if (action.isActive) return;

            this.log(`Executing action: ${action.name} (score: ${action.score.toFixed(3)})`);

            // Record action in history
            this.actionHistory.push({
                action: action.name,
                score: action.score,
                timestamp: Date.now(),
                type: action.type
            });

            // Keep history limited
            if (this.actionHistory.length > 50) {
                this.actionHistory = this.actionHistory.slice(-25);
            }

            // Click the element
            action.element.click();
            this.lastActionTime = Date.now();

            // // Update current action for this type
            // this.currentActions[action.type] = action;

        } catch (error) {
            console.error(`Error executing action ${action.name}:`, error);
        }
    }

    /**
     * Logging utility
     */
    log(message) {
        if (!this.config.debug) return;

        console.log(consolePrefix + ' ' + message);
    }

    /**
     * Get current autoplay status for debugging
     */
    getStatus() {
        return {
            enabled: this.enabled,
            queueLengths: {
                operation: this.priorityQueues.operation.length,
                battle: this.priorityQueues.battle.length,
                location: this.priorityQueues.location.length
            },
            // currentActions: {
            //     operation: this.currentActions.operation?.name || null,
            //     battle: this.currentActions.battle?.name || null,
            //     location: this.currentActions.location?.name || null
            // },
            actionHistory: this.actionHistory.slice(-5), // Last 5 actions
            config: this.config
        };
    }

    /**
     * Enable debug logging
     */
    enableDebug(enable = true) {
        this.config.debug = enable;
        this.log(`Debug logging ${enable ? 'enabled' : 'disabled'}`);
    }

    /**
     * Loads the enabled state from localStorage
     */
    loadEnabledState() {
        const stored = localStorage.getItem(storageKey);
        return stored === 'true';
    }

    /**
     * Saves the enabled state to localStorage
     */
    saveEnabledState() {
        localStorage.setItem(storageKey, this.enabled.toString());
    }
}

// Global autoplay instance
let autoplay = null;

const consolePrefix = '[🤖 Autoplay] ';
const storageKey = 'ps_autoplayEnabled';

// Initialize when DOM is ready
function initAutoplay() {
    if (autoplay) return; // Already initialized

    try {
        autoplay = new AutoplaySystem();
        window.autoplay = autoplay;
        console.log(consolePrefix + 'System initialized successfully');
        if (autoplay.enabled) {
            autoplay.start();
        }
    } catch (error) {
        console.error(consolePrefix + 'Initialization failed:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoplay);
} else {
    // If DOM is already ready, wait for game to initialize
    if (typeof gameData !== 'undefined') {
        initAutoplay();
    } else {
        // Poll for game initialization
        const initChecker = setInterval(() => {
            if (typeof gameData !== 'undefined') {
                clearInterval(initChecker);
                initAutoplay();
            }
        }, 100);

        // Safety timeout
        setTimeout(() => {
            clearInterval(initChecker);
            if (!autoplay) {
                console.warn(consolePrefix + 'Game data not found, initializing anyway');
                initAutoplay();
            }
        }, 5000);
    }
}

// Debugging utilities
// noinspection JSUnusedGlobalSymbols
window.autoplayDebug = {
    enable: () => autoplay?.enableDebug(true),
    disable: () => autoplay?.enableDebug(false),
    status: () => autoplay?.getStatus(),
    queues: () => autoplay?.priorityQueues,
    history: () => autoplay?.actionHistory,
    config: () => autoplay?.config,
    toggle: (enabled) => autoplay?.toggle(enabled),

    // Test individual components
    testOperations: () => {
        if (!autoplay) return 'Autoplay not initialized';
        autoplay.priorityQueues.operation = [];
        autoplay.evaluateOperations();
        return autoplay.priorityQueues.operation;
    },

    testBattles: () => {
        if (!autoplay) return 'Autoplay not initialized';
        autoplay.priorityQueues.battle = [];
        autoplay.evaluateBattles();
        return autoplay.priorityQueues.battle;
    },

    testLocations: () => {
        if (!autoplay) return 'Autoplay not initialized';
        autoplay.priorityQueues.location = [];
        autoplay.evaluateLocations();
        return autoplay.priorityQueues.location;
    }
};
