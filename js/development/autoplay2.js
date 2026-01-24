'use strict';

/**
 * Progress Station Autoplay System v2
 *
 * Configuration-based optimizer using Constraint Satisfaction Problem (CSP) approach.
 *
 * Instead of evaluating individual actions, this system:
 * 1. Generates all valid station configurations (module states, operations, location, battles)
 * 2. Scores each configuration based on expected progress
 * 3. Applies the best configuration
 *
 * Features:
 * - Full enumeration of valid configurations
 * - Look-ahead scoring simulation
 * - Hard constraints: Military ≥ Danger, Grid Load ≤ Grid Strength
 * - Dynamic attribute prioritization
 * - Modal dialog handling
 * - Game over detection
 */
class ConfigurationOptimizer {
    constructor() {
        this.enabled = this.loadEnabledState();
        this.evaluationTimer = null;
        this.currentConfiguration = null;
        this.lastActionTime = 0;
        this.visitedLocations = new Set(); // Track visited locations for exploration
        this.visitedLocations.add(pointsOfInterest.SafeZone.name); // start zone can always be considered "visited"
        this.config = {
            populationThreshold: 0.95, // 95% of theoretical max
            evaluationInterval: 1500,  // 1.5 seconds
            actionCooldown: 100,       // Minimum time between actions
            debug: true,
            traceNextTick: false,
            modalOverrides: {
                'gameOverModal': '.btn-primary.loss-only',
            },
            toastOverrides: {
                'enableAudioToast': '.btn-info',
            },
            stateBlacklist: [
                gameStates.PAUSED,
                gameStates.BOSS_FIGHT_PAUSED
            ],
            // Attribute weights
            weights: {
                factorToAdditor: 5,
                growth: {
                    high: 2.0,  // When population low
                    normal: 0.5
                },
                industry: 1.0,
                military: {
                    normal: 1.0,
                    nearDanger: 1.5
                },
                research: {
                    useful: 1.0,
                    softCap: 100,
                    diminishingFactor: 0.1
                },
                energy: {
                    gridConstrained: 0.2,  // High priority when grid-constrained
                    normal: 0.1
                }
            },
            // Operation-specific caps
            operationCaps: {
                'PocketLaboratory': { level: 20, weightAfter: 0.3 }
            },
            scoreMultiplier: Math.pow(10, 6), // Allows to scale scores into nicely readable values
        };

        this.performanceMetrics = {
            lastEnumerationTime: 0,
            lastScoringTime: 0,
            configurationsEvaluated: 0
        };

        // Initialize the system
        this.init();
    }

    init() {
        this.createAutoplayToggle();
        this.log('Configuration Optimizer initialized');
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
        autoplayContainer.id = 'autoplayContainer2';

        // Create toggle switch
        const toggleDiv = document.createElement('div');
        toggleDiv.className = 'form-check form-switch';

        const toggleInput = document.createElement('input');
        toggleInput.className = 'form-check-input';
        toggleInput.type = 'checkbox';
        toggleInput.role = 'switch';
        toggleInput.id = 'autoplaySwitch2';
        toggleInput.checked = this.enabled;

        const toggleLabel = document.createElement('label');
        toggleLabel.className = 'form-check-label';
        toggleLabel.htmlFor = 'autoplaySwitch2';
        toggleLabel.textContent = 'Autoplay v2';

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
        if (isUndefined(enabled)) {
            this.enabled = !this.enabled;
        } else {
            this.enabled = enabled;
        }
        this.saveEnabledState();
        Dom.get().byId('autoplaySwitch2').checked = this.enabled;

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

        this.currentConfiguration = null;
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

            // Handle any open modals first
            if (this.handleModalDialogs()) {
                return; // Skip configuration evaluation if we handled a modal
            }
            this.handleToasts();

            // Check if game over
            if (this.isGameWon()) {
                this.log('Game over detected, stopping autoplay');
                this.toggle(false);
                if (this.toggleElement) {
                    this.toggleElement.checked = false;
                }
                return;
            }

            // Check if game state allows changes
            if (!gameData.state.canChangeActivation) {
                return false;
            }

            // Generate all valid configurations
            const startEnum = performance.now();
            const generationResult = this.generateAllConfigurations();
            const enumTime = performance.now() - startEnum;
            this.performanceMetrics.lastEnumerationTime = enumTime;

            const configurations = generationResult.configurations;
            const isGridConstrained = generationResult.isGridConstrained;

            if (configurations.length === 0) {
                this.log('No valid configurations found!');
                return;
            }

            // Score all configurations
            const startScore = performance.now();
            let bestConfig = null;
            let bestScore = -Infinity;
            let configScores = [];

            for (const config of configurations) {
                let score = -1;
                if (this.config.debug) {
                    let scoreBreakdown = [];
                    score = this.scoreConfiguration(config, isGridConstrained, scoreBreakdown);
                    configScores.push({
                        score: score,
                        config: config,
                        breakdown: scoreBreakdown,
                    });
                } else {
                    score = this.scoreConfiguration(config, isGridConstrained);
                }
                if (score > bestScore) {
                    bestScore = score;
                    bestConfig = config;
                }
            }
            const scoreTime = performance.now() - startScore;
            this.performanceMetrics.lastScoringTime = scoreTime;
            this.performanceMetrics.configurationsEvaluated = configurations.length;

            // Log performance and top configuration
            // if (this.config.debug) {
            if (this.config.traceNextTick) {
                this.log(`Evaluated ${configurations.length} configs in ${enumTime.toFixed(1)}ms + ${scoreTime.toFixed(1)}ms`);
                // this.logConfiguration(bestConfig, bestScore);
                for (const configScore of configScores) {
                    this.logConfiguration(configScore.config, configScore.score, configScore.breakdown);
                }
            }

            // Apply best configuration
            this.applyConfiguration(bestConfig);

            this.config.traceNextTick = false;
        } catch (error) {
            console.error('Autoplay error:', error);
        }
    }

    /**
     * Generates all valid station configurations
     * @returns {{configurations: Array<Configuration>, isGridConstrained: boolean}}
     */
    generateAllConfigurations() {
        const configurations = [];
        const availableModules = this.getAvailableModules();
        const gridStrength = attributes.gridStrength.getValue();
        let isGridConstrained = false;

        // Generate all module combinations (2^n)
        const moduleSubsets = this.generateModuleSubsets(availableModules);

        for (const moduleSet of moduleSubsets) {
            // For each module combination, generate operation assignments
            const opConfigResult = this.generateOperationAssignments(moduleSet, gridStrength);

            // Track if any configurations were rejected due to grid
            if (opConfigResult.hadGridConstraintViolations) {
                isGridConstrained = true;
            }

            for (const opConfig of opConfigResult.configs) {
                // For each operation config, try all locations
                for (const locationName in pointsOfInterest) {
                    const location = pointsOfInterest[locationName];

                    // Check if location is available
                    if (!this.isLocationAvailable(location)) {
                        continue;
                    }

                    // Calculate battles that can be engaged with this config
                    const battles = this.selectBattles(opConfig, location);

                    configurations.push({
                        modules: opConfig.modules,
                        operations: opConfig.operations,
                        location: locationName,
                        battles: battles,
                        gridLoad: opConfig.gridLoad
                    });
                }
            }
        }

        return {
            configurations,
            isGridConstrained
        };
    }

    /**
     * Gets all modules that are available (requirements met)
     */
    getAvailableModules() {
        const available = [];
        for (const moduleName in modules) {
            const module = modules[moduleName];
            if (!Dom.get().byId(module.domId).classList.contains('hidden')) {
                available.push(moduleName);
            }
        }
        return available;
    }

    /**
     * Generates all subsets of modules (power set)
     */
    generateModuleSubsets(moduleNames) {
        const subsets = [[]];

        for (const moduleName of moduleNames) {
            const currentLength = subsets.length;
            for (let i = 0; i < currentLength; i++) {
                subsets.push([...subsets[i], moduleName]);
            }
        }

        return subsets;
    }

    /**
     * For a given set of active modules, generate all valid operation assignments
     * that respect grid constraints
     * @returns {{configs: Array, hadGridConstraintViolations: boolean}}
     */
    generateOperationAssignments(activeModuleNames, gridStrength) {
        if (activeModuleNames.length === 0) {
            return {
                configs: [{modules: new Set(), operations: new Map(), gridLoad: 0}],
                hadGridConstraintViolations: false
            };
        }

        const configs = [];
        const violationTracker = { hadViolations: false };

        // Get all components from active modules
        const components = [];
        for (const moduleName of activeModuleNames) {
            const module = modules[moduleName];
            for (const component of module.components) {
                if (component.getUnfulfilledRequirements() === null) {
                    components.push({
                        moduleName,
                        component,
                        availableOps: component.operations.filter(op =>
                            op.getUnfulfilledRequirements() === null
                        )
                    });
                }
            }
        }

        // Generate all combinations of operation choices
        this.generateOperationCombinations(
            components,
            0,
            new Map(),
            0,
            gridStrength,
            activeModuleNames,
            configs,
            violationTracker
        );

        return {
            configs,
            hadGridConstraintViolations: violationTracker.hadViolations
        };
    }

    /**
     * Recursive helper to generate all operation combinations
     */
    generateOperationCombinations(components, index, currentOps, currentGrid, maxGrid, moduleNames, results, violationTracker) {
        // Base case: processed all components
        if (index === components.length) {
            if (currentGrid <= maxGrid) {
                results.push({
                    modules: new Set(moduleNames),
                    operations: new Map(currentOps),
                    gridLoad: currentGrid
                });
            }
            return;
        }

        const {component, availableOps, moduleName} = components[index];

        // Try each available operation for this component
        for (const operation of availableOps) {
            const opGrid = operation.getGridLoad();
            const newGrid = currentGrid + opGrid;

            // Prune: skip if this would exceed grid
            if (newGrid > maxGrid) {
                // Mark that we hit a grid constraint
                violationTracker.hadViolations = true;
                continue;
            }

            currentOps.set(component.name, operation.name);
            this.generateOperationCombinations(
                components,
                index + 1,
                currentOps,
                newGrid,
                maxGrid,
                moduleNames,
                results,
                violationTracker
            );
            currentOps.delete(component.name);
        }
    }

    /**
     * Checks if a location is available
     */
    isLocationAvailable(location) {
        if (location.getUnfulfilledRequirements() !== null) {
            return false;
        }

        const sector = location.sector;
        if (!sector || sector.getUnfulfilledRequirements() !== null) {
            return false;
        }

        return true;
    }

    /**
     * Selects which battles can be engaged given the current configuration
     * Hard constraint: Total Danger ≤ Military
     */
    selectBattles(opConfig, location) {
        const engagedBattles = new Set();

        // Check if battle tab is available - if not, don't engage any battles
        const battleTabButton = document.getElementById('battleTabButton');
        if (!battleTabButton || battleTabButton.classList.contains('hidden')) {
            return engagedBattles; // Return empty set if battles not available yet
        }

        // Calculate base danger from location
        let totalDanger = location.getEffect(EffectType.Danger) || 0;

        // Calculate military from operations (simulate this config)
        let totalMilitary = this.calculateMilitaryForConfig(opConfig);

        // Try to engage each available battle
        for (const battleName in battles) {
            const battle = battles[battleName];

            // Skip if done or not available
            if (battle.isDone() || !this.isBattleAvailable(battle)) {
                continue;
            }

            const battleDanger = battle.getEffect(EffectType.Danger) || 0;

            // Hard constraint: can only engage if Military >= total Danger
            if (totalMilitary >= totalDanger + battleDanger) {
                engagedBattles.add(battleName);
                totalDanger += battleDanger;
            }
        }

        return engagedBattles;
    }

    /**
     * Calculate military attribute for a given configuration
     */
    calculateMilitaryForConfig(opConfig) {
        let military = 0;

        // Add military from operations
        for (const [componentName, operationName] of opConfig.operations) {
            const operation = moduleOperations[operationName];
            military += operation.getEffect(EffectType.Military) || 0;
        }

        // Add military from battle rewards (for already completed battles)
        for (const battleName in battles) {
            const battle = battles[battleName];
            if (battle.isDone()) {
                military += battle.getReward(EffectType.Military) || 0;
            }
        }

        return military;
    }

    /**
     * Checks if a battle is available
     */
    isBattleAvailable(battle) {
        return !Dom.get().byId(battle.domId).classList.contains('hidden');
    }

    /**
     * Scores a configuration based on expected progress
     * @param {Configuration} config
     * @param {boolean} isGridConstrained - Whether any configs were rejected due to grid constraints
     * @param {{score: number, source: string}[]|null} scoreBreakdown out parameter
     * @returns {number} score
     */
    scoreConfiguration(config, isGridConstrained, scoreBreakdown = null) {
        let score = 0;

        // Simulate attributes for this configuration
        const simulatedAttributes = this.simulateAttributes(config);

        // Get dynamic weights
        const weights = this.getDynamicWeights(simulatedAttributes, config, isGridConstrained);

        // Score each active operation
        for (const [componentName, operationName] of config.operations) {
            const operation = moduleOperations[operationName];

            // Calculate progress per cycle with this config's attributes
            const xpGain = this.simulateOperationXpGain(operation, simulatedAttributes);
            const maxXp = operation.getMaxXp();
            const progressPerCycle = maxXp > 0 ? xpGain / maxXp : 0;

            // Score each effect
            for (const effect of operation.effects) {
                const weight = weights[effect.effectType] || 0;

                let additionalScore = progressPerCycle * effect.baseValue * weight;

                // Apply operation-specific diminishing returns
                const opCap = this.config.operationCaps[operation.name];
                if (opCap && operation.level > opCap.level) {
                    additionalScore *= opCap.weightAfter;
                }

                score += additionalScore;
                if (scoreBreakdown !== null) {
                    scoreBreakdown.push({
                        score: additionalScore,
                        source: operation.name + ' ' + effect.effectType + ' weight:' + weight,
                    });
                }
            }
        }

        // Score engaged battles
        for (const battleName of config.battles) {
            const battle = battles[battleName];

            const xpGain = this.simulateBattleXpGain(battle, simulatedAttributes);
            const maxXp = battle.getMaxXp();
            const progressPerCycle = maxXp > 0 ? xpGain / maxXp : 0;

            // Score rewards
            for (const reward of battle.rewards) {
                const weight = weights[reward.effectType] || 0;
                score += progressPerCycle * reward.baseValue * weight;

                if (scoreBreakdown !== null) {
                    scoreBreakdown.push({
                        score:  progressPerCycle * reward.baseValue * weight,
                        source: battleName + ' ' + reward.effectType,
                    });
                }
            }
        }

        // Bonus for unvisited locations (exploration requirement)
        if (!this.visitedLocations.has(config.location)) {
            const explorationBonus = 1000000; // Huge bonus to ensure unvisited locations get visited
            score += explorationBonus;

            if (scoreBreakdown !== null) {
                scoreBreakdown.push({
                    score: explorationBonus,
                    source: 'EXPLORATION BONUS for unvisited location: ' + config.location,
                });
            }
        }

        // Bonus for efficient grid utilization
        const gridStrength = attributes.gridStrength.getValue();
        if (gridStrength > 0) {
            const utilization = config.gridLoad / gridStrength;
            score *= (0.8 + 0.2 * utilization); // 80% to 100% multiplier

            if (scoreBreakdown !== null) {
                scoreBreakdown.push({
                    score: (0.8 + 0.2 * utilization),
                    isMultiplier: true,
                    source: 'multiplier for Grid Utilization ' + utilization.toFixed(0) + '%',
                });
            }
        }

         if (scoreBreakdown !== null) {
            scoreBreakdown.forEach((entry) => {
                if (entry.isMultiplier === true) return;
                entry.score *= this.config.scoreMultiplier;
            })
        }

        return score * this.config.scoreMultiplier;
    }

    /**
     * Simulates attribute values for a given configuration
     */
    simulateAttributes(config) {
        const attrs = {
            growth: 0,
            industry: 0,
            military: 0,
            research: 0,
            energy: 0,
            danger: 0,
            population: attributes.population.getValue()
        };

        // Add effects from location
        const location = pointsOfInterest[config.location];
        attrs.danger += location.getEffect(EffectType.Danger) || 0;
        attrs.growth += location.getEffect(EffectType.Growth) || 0;
        attrs.industry += location.getEffect(EffectType.Industry) || 0;
        attrs.research += location.getEffect(EffectType.Research) || 0;
        attrs.energy += location.getEffect(EffectType.Energy) || 0;

        // Add effects from operations
        for (const [componentName, operationName] of config.operations) {
            const operation = moduleOperations[operationName];
            attrs.military += operation.getEffect(EffectType.Military) || 0;
            attrs.growth += operation.getEffect(EffectType.Growth) || 0;
            attrs.industry += operation.getEffect(EffectType.Industry) || 0;
            attrs.research += operation.getEffect(EffectType.Research) || 0;
            attrs.energy += operation.getEffect(EffectType.Energy) || 0;
        }

        // Add effects from battles
        for (const battleName of config.battles) {
            const battle = battles[battleName];
            attrs.danger += battle.getEffect(EffectType.Danger) || 0;
        }

        // Add effects from completed battles (rewards)
        for (const battleName in battles) {
            const battle = battles[battleName];
            if (battle.isDone()) {
                attrs.military += battle.getReward(EffectType.Military) || 0;
                attrs.industry += battle.getReward(EffectType.Industry) || 0;
                attrs.research += battle.getReward(EffectType.Research) || 0;
            }
        }

        return attrs;
    }

    /**
     * Gets dynamic weights based on current game state
     */
    getDynamicWeights(simulatedAttrs, config, isGridConstrained) {
        const weights = {};

        // Growth weight based on population
        const currentPop = attributes.population.getValue();
        const currentGrowth = attributes.growth.getValue();
        const currentHeat = attributes.danger.getValue();
        const theoreticalMaxPop = currentGrowth / (0.01 * Math.max(currentHeat, 1));
        const popRatio = currentPop / theoreticalMaxPop;

        weights[EffectType.GrowthFactor] = popRatio < this.config.populationThreshold
            ? this.config.weights.growth.high
            : this.config.weights.growth.normal;
        weights[EffectType.Growth] = weights[EffectType.GrowthFactor] / this.config.weights.factorToAdditor;

        // Industry - always useful
        weights[EffectType.IndustryFactor] = this.config.weights.industry;
        weights[EffectType.Industry] = weights[EffectType.IndustryFactor]  / this.config.weights.factorToAdditor;

        // Military weight - higher when near danger
        const safetyMargin = simulatedAttrs.military - simulatedAttrs.danger;
        weights[EffectType.MilitaryFactor] = safetyMargin < 100
            ? this.config.weights.military.nearDanger
            : this.config.weights.military.normal;
        weights[EffectType.Military] = weights[EffectType.MilitaryFactor] / this.config.weights.factorToAdditor;

        // Research with diminishing returns after cap
        const currentResearch = attributes.research.getValue();
        const researchOverCap = Math.max(0, currentResearch - this.config.weights.research.softCap);
        weights[EffectType.ResearchFactor] = this.config.weights.research.useful /
            (1 + researchOverCap * this.config.weights.research.diminishingFactor);
        weights[EffectType.Research] = weights[EffectType.ResearchFactor] / this.config.weights.factorToAdditor;

        // Energy - high priority ONLY when grid-constrained
        // isGridConstrained = true means some valid configs were rejected due to insufficient grid
        weights[EffectType.EnergyFactor] = isGridConstrained
            ? this.config.weights.energy.gridConstrained
            : this.config.weights.energy.normal;
        weights[EffectType.Energy] = weights[EffectType.EnergyFactor] / this.config.weights.factorToAdditor;

        // Danger has no positive weight (we avoid it)
        // TODO maybe even negative
        weights[EffectType.DangerFactor] = 0;
        weights[EffectType.Danger] = 0;

        return weights;
    }

    // Removed hasUnactivatedOperations - replaced by isGridConstrained tracking during generation

    /**
     * Simulates XP gain for an operation with given attributes
     */
    simulateOperationXpGain(operation, attrs) {
        // Base XP gain
        let xpGain = 10;

        // Apply multipliers (simplified version of actual game logic)
        xpGain *= getMaxLevelMultiplier(operation.maxLevel); // Max level multiplier
        xpGain *= attrs.industry; // Industry multiplier
        xpGain *= this.getPopulationMultiplier(attrs.population); // Population multiplier

        return xpGain;
    }

    /**
     * Simulates XP gain for a battle with given attributes
     */
    simulateBattleXpGain(battle, attrs) {
        // Battle XP gain is based on military
        let xpGain = 10;
        xpGain *= attrs.military;
        xpGain *= this.getPopulationMultiplier(attrs.population);

        return xpGain;
    }

    /**
     * Gets population progress speed multiplier (from game logic)
     */
    getPopulationMultiplier(population) {
        return 1 + Math.log10(Math.max(1, population));
    }

    /**
     * Applies a configuration to the game state
     */
    applyConfiguration(config) {
        // Track if we made any changes
        let changed = false;
        const changes = []; // Track what changed for logging

        // 1. Apply operation selections
        for (const [componentName, operationName] of config.operations) {
            const component = moduleComponents[componentName];
            const operation = moduleOperations[operationName];

            if (!operation.isActive('self')) {
                // Find currently active operation for logging
                const currentOp = component.operations.find(op => op.isActive('self'));
                const currentOpName = currentOp ? currentOp.name : 'None';

                tryActivateOperation(component, operation);
                changes.push(`Operation ${componentName}: ${currentOpName} → ${operationName}`);
                changed = true;
                this.lastActionTime = Date.now();
            }
        }

        // 2. Apply module activation states
        for (const moduleName in modules) {
            const module = modules[moduleName];
            const shouldBeActive = config.modules.has(moduleName);
            const isActive = module.isActive();

            if (shouldBeActive !== isActive) {
                switchModuleActivation(module);
                changes.push(`Module ${moduleName}: ${isActive ? 'ON' : 'OFF'} → ${shouldBeActive ? 'ON' : 'OFF'}`);
                changed = true;
                this.lastActionTime = Date.now();
            }
        }

        // 3. Apply location
        if (gameData.activeEntities.pointOfInterest !== config.location) {
            const currentLocation = gameData.activeEntities.pointOfInterest || 'None';
            setPointOfInterest(config.location);
            this.visitedLocations.add(config.location); // Mark as visited
            changes.push(`Location: ${currentLocation} → ${config.location}`);
            changed = true;
            this.lastActionTime = Date.now();
        }

        // 4. Apply battle engagements
        for (const battleName in battles) {
            const battle = battles[battleName];
            if (battle.isDone()) continue;

            const shouldEngage = config.battles.has(battleName);
            const isEngaged = battle.isActive();

            if (shouldEngage !== isEngaged) {
                battle.toggle();
                changes.push(`Battle ${battleName}: ${isEngaged ? 'Engaged' : 'Disengaged'} → ${shouldEngage ? 'Engaged' : 'Disengaged'}`);
                changed = true;
                this.lastActionTime = Date.now();
            }
        }

        // Log decisions if any changes were made
        if (changed && changes.length > 0) {
            this.log('🔄 DECISION - Station configuration changed:', changes);
            this.currentConfiguration = config;
        }
    }

    /**
     * Logs configuration details
     */
    logConfiguration(config, score, scoreBreakdown = null) {
        const details = {
            score: score.toFixed(0),
            modules: Array.from(config.modules),
            operations: Array.from(config.operations.entries()).map(([c, o]) => `${c}:${o}`),
            location: config.location,
            battles: Array.from(config.battles),
            gridLoad: `${config.gridLoad}/${attributes.gridStrength.getValue()}`
        };
        if (scoreBreakdown !== null) {
            details['scoreBreakdown'] = scoreBreakdown;
        }

        this.log('Scored config:', details);
    }

    /**
     * Checks if autoplay can perform actions
     */
    canAct() {
        // Check if game is loaded
        if (gameData === null || !gameData.state) {
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
        const modals = document.querySelectorAll('.modal.show');
        for (const modal of modals) {
            const modalId = modal.id;

            this.log('Seeing modal #' + modalId);

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
     * Handles toasts by clicking appropriate buttons
     */
    handleToasts() {
        const toasts = document.querySelectorAll('.toast.show');
        for (const toast of toasts) {
            const toastId = toast.id;

            this.log('Seeing toast #' + toastId);

            // Check for specific override
            if (this.config.toastOverrides[toastId]) {
                const selector = this.config.toastOverrides[toastId];
                const button = toast.querySelector(selector);
                if (button) {
                    this.log(`Clicking toast override: ${selector} in #${toastId}`);
                    button.click();
                    return true;
                }
            }

            // Default: click primary button
            const primaryButton = toast.querySelector('.btn-primary');
            if (primaryButton) {
                this.log(`Clicking .btn-primary in toast: #${toastId}`);
                primaryButton.click();
                return true;
            }
        }
        return false;
    }

    /**
     * Logging utility
     */
    log(message, data = null) {
        if (!this.config.debug) return;

        if (data) {
            console.log(consolePrefix + ' ' + message, data);
        } else {
            console.log(consolePrefix + ' ' + message);
        }
    }

    /**
     * Get current autoplay status for debugging
     */
    getStatus() {
        return {
            enabled: this.enabled,
            currentConfiguration: this.currentConfiguration,
            performanceMetrics: this.performanceMetrics,
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
/**
 *
 * @type {ConfigurationOptimizer}
 */
let autoplay2 = null;

const consolePrefix = '[🤖 AutoplayV2]';
const storageKey = 'ps_autoplayEnabled';

// Initialize when DOM is ready
function initAutoplay2() {
    if (autoplay2) return; // Already initialized

    try {
        autoplay2 = new ConfigurationOptimizer();
        window.autoplay2 = autoplay2;
        console.log(consolePrefix + ' System initialized successfully');
        if (autoplay2.enabled) {
            autoplay2.start();
        }
    } catch (error) {
        console.error(consolePrefix + ' Initialization failed:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoplay2);
} else {
    // If DOM is already ready, wait for game to initialize
    if (typeof gameData !== 'undefined') {
        initAutoplay2();
    } else {
        // Poll for game initialization
        const initChecker = setInterval(() => {
            if (typeof gameData !== 'undefined') {
                clearInterval(initChecker);
                initAutoplay2();
            }
        }, 100);

        // Safety timeout
        setTimeout(() => {
            clearInterval(initChecker);
            if (!autoplay2) {
                console.warn(consolePrefix + ' Game data not found, initializing anyway');
                initAutoplay2();
            }
        }, 5000);
    }
}

// Debugging utilities
window.autoplay2Debug = {
    enable: () => autoplay2?.enableDebug(true),
    disable: () => autoplay2?.enableDebug(false),
    status: () => autoplay2?.getStatus(),
    config: () => autoplay2?.config,
    toggle: (enabled) => autoplay2?.toggle(enabled),
    forceEvaluate: () => autoplay2?.evaluateAndAct(),
    traceNextTick: () => autoplay2.config.traceNextTick = true,

    // Performance testing
    testGeneration: () => {
        if (!autoplay2) return 'Autoplay not initialized';
        const start = performance.now();
        const configs = autoplay2.generateAllConfigurations();
        const time = performance.now() - start;
        return {
            count: configs.length,
            time: time.toFixed(2) + 'ms',
            configs: configs.slice(0, 3)
        };
    }
};

// TODO s
// Battles are not disengaged when there is heat
// #Believability: Switch to tabs to actually click something
