'use strict';

/**
 * Loadout icons - the set of possible loadouts, keyed by attribute name.
 * Each loadout is represented only by its icon in the UI.
 * Two rows: normal icons and inverted (color-rotated) icons.
 */
const LOADOUT_ICONS_ROW1 = ['energy', 'industry', 'research', 'population', 'military'];
const LOADOUT_ICONS_ROW2 = ['energy_alt', 'industry_alt', 'research_alt', 'population_alt', 'military_alt'];

/**
 * Snapshots the current module/operation activation state into a loadout object.
 * @returns {{modules: string[], operations: string[], pointOfInterest: string}}
 */
function snapshotCurrentConfig() {
    return {
        modules: [...gameData.activeEntities.modules].sort(),
        operations: [...gameData.activeEntities.operations].sort(),
        pointOfInterest: gameData.activeEntities.pointOfInterest,
    };
}

/**
 * Saves the current configuration to the specified icon's loadout slot.
 * @param {string} iconKey - The icon key (e.g. 'population', 'industry')
 */
function snapshotCurrentConfigToIcon(iconKey) {
    gameData.loadoutsByIcon[iconKey] = snapshotCurrentConfig();
}

/**
 * Applies a loadout from the specified icon slot.
 * Order: disable all modules → activate operations → enable modules (respecting power limits).
 * @param {string} iconKey - The icon key to apply
 * @returns {boolean} True if the loadout was applied, false if blocked
 */
function applyIconLoadout(iconKey) {
    // Check if we can change activation
    if (!gameData.state.canChangeActivation) {
        VFX.shakePlayButton();
        return false;
    }

    const loadout = gameData.loadoutsByIcon[iconKey];
    if (!loadout) {
        // No loadout exists for this icon - this shouldn't happen if called via switchToIconLoadout
        console.warn('No loadout found for icon:', iconKey);
        return false;
    }

    const targetModules = new Set(loadout.modules);
    const targetOperations = new Set(loadout.operations);

    // Step 1: Disable all modules
    for (const moduleName in modules) {
        const module = modules[moduleName];
        if (module.isActive()) {
            module.setActive(false);
        }
    }

    // Step 2: Activate operations from the loadout
    // We need to set the active operation for each component based on the loadout
    for (const operationName of targetOperations) {
        const operation = moduleOperations[operationName];
        if (!operation) {
            // Operation no longer exists (game update), skip it
            continue;
        }

        const component = operation.component;
        if (!component) {
            continue;
        }

        // Check if this operation is unlocked (has no unfulfilled requirements)
        if (Requirement.hasUnfulfilledRequirements(operation)) {
            continue;
        }

        // Set this operation as active in its component
        // We need to handle the case where no operation is currently active
        if (component.activeOperation) {
            component.activeOperation.setActive(false);
        }
        component.activeOperation = operation;
        operation.setActive(true);
    }

    // Step 3: Enable modules from the loadout (respecting power limits)
    for (const moduleName of targetModules) {
        const module = modules[moduleName];
        if (!module) {
            // Module no longer exists (game update), skip it
            continue;
        }

        // Check if this module is unlocked (has no unfulfilled requirements)
        if (Requirement.hasUnfulfilledRequirements(module)) {
            continue;
        }

        // Check grid constraints before enabling
        const gridLoadAfterActivation = attributes.gridLoad.getValue() + module.getGridLoad();
        if (gridLoadAfterActivation > attributes.gridStrength.getValue()) {
            // Not enough grid strength, skip this module
            continue;
        }

        module.setActive(true);
    }

    // Step 4: Set location if available (check both POI and its sector)
    if (loadout.pointOfInterest) {
        const poi = pointsOfInterest[loadout.pointOfInterest];
        if (poi && poi.sector
            && !Requirement.hasUnfulfilledRequirements(poi.sector)
            && !Requirement.hasUnfulfilledRequirements(poi)) {
            setPointOfInterest(loadout.pointOfInterest);
        }
    }

    // Update UI
    updateUiIfNecessary();

    return true;
}

/**
 * Switches to a different loadout icon.
 * Saves the current config to the previous icon, then applies the target icon's loadout.
 * If the target icon has no loadout yet, creates one from the current state.
 * @param {string} iconKey - The icon key to switch to
 */
function switchToIconLoadout(iconKey) {
    // Check if we can change activation
    if (!gameData.state.canChangeActivation) {
        VFX.shakePlayButton();
        return;
    }

    // If there's a currently active icon, save the current config to it
    if (gameData.currentLoadoutIcon !== null) {
        snapshotCurrentConfigToIcon(gameData.currentLoadoutIcon);
    }

    // If the target icon has no loadout yet, create one from current state
    if (!gameData.loadoutsByIcon[iconKey]) {
        snapshotCurrentConfigToIcon(iconKey);
    }

    // Apply the target loadout
    if (applyIconLoadout(iconKey)) {
        // Update the current loadout icon
        gameData.currentLoadoutIcon = iconKey;
        
        // Update the UI to reflect the active icon
        updateLoadoutIconsUI();
        
        // Save the game
        gameData.save();
    }
}

/**
 * Switches to a different loadout icon WITHOUT loading its config.
 * Saves current state to previous icon, then just changes the active icon.
 * Current modules/operations stay as they are.
 * @param {string} iconKey - The icon key to switch to
 */
function switchToIconLoadoutWithoutLoading(iconKey) {
    // If there's a currently active icon, save the current config to it
    if (gameData.currentLoadoutIcon !== null) {
        snapshotCurrentConfigToIcon(gameData.currentLoadoutIcon);
    }

    // Update the current loadout icon (don't load/apply the target's config)
    gameData.currentLoadoutIcon = iconKey;

    // Update the UI to reflect the active icon
    updateLoadoutIconsUI();

    // Save the game
    gameData.save();
}

/**
 * Updates the loadout icons UI to reflect the currently active icon.
 */
function updateLoadoutIconsUI() {
    const container = document.getElementById('loadoutIconsContainer');
    if (!container) return;

    const icons = container.querySelectorAll('.loadout-icon');
    icons.forEach(icon => {
        const iconKey = icon.dataset.loadoutIcon;
        icon.classList.toggle('active', iconKey === gameData.currentLoadoutIcon);
    });
}

/**
 * Creates a single loadout icon button.
 * @param {string} iconKey - The loadout key (e.g. 'population' or 'population_alt')
 * @param {boolean} isAlt - Whether this is an alternate (color-rotated) icon
 * @returns {HTMLButtonElement}
 */
function createLoadoutIconButton(iconKey, isAlt) {
    // Get the base attribute name (strip '_alt' suffix if present)
    const baseKey = iconKey.replace('_alt', '');
    const attr = attributes[baseKey];
    if (!attr) return null;

    const iconButton = document.createElement('button');
    iconButton.className = 'loadout-icon btn btn-sm p-1';
    if (isAlt) {
        iconButton.classList.add('loadout-icon-alt');
    }
    iconButton.dataset.loadoutIcon = iconKey;
    iconButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering the parent's click (setTab)
        switchToIconLoadout(iconKey);
    });

    // Right-click: switch to target without loading its config
    iconButton.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        switchToIconLoadoutWithoutLoading(iconKey);
    });

    const iconImg = document.createElement('img');
    iconImg.src = attr.icon;
    iconImg.alt = '';
    iconImg.className = 'icon';

    iconButton.appendChild(iconImg);
    return iconButton;
}

/**
 * Creates the loadout icons UI and appends it inside #attributesDisplay.
 */
function createLoadoutIconsUI() {
    const attributesDisplay = document.getElementById('attributesDisplay');
    if (!attributesDisplay) {
        console.warn('Could not find #attributesDisplay to attach loadout icons');
        return;
    }

    // Create container for loadout icons (2x6 grid)
    const container = document.createElement('div');
    container.id = 'loadoutIconsContainer';
    // Push to the right; layout is controlled via CSS grid on the id selector
    container.className = 'ms-auto';
    // Prevent clicks from bubbling to attributesDisplay
    container.addEventListener('click', (e) => e.stopPropagation());

    // Row 1: Normal icons
    const row1 = document.createElement('div');
    // Row layout is controlled via CSS (display: contents) to feed the grid
    row1.className = 'loadout-row';
    for (const iconKey of LOADOUT_ICONS_ROW1) {
        const btn = createLoadoutIconButton(iconKey, false);
        if (btn) row1.appendChild(btn);
    }
    container.appendChild(row1);

    // Row 2: Alternate (color-rotated) icons
    const row2 = document.createElement('div');
    // Row layout is controlled via CSS (display: contents) to feed the grid
    row2.className = 'loadout-row';
    for (const iconKey of LOADOUT_ICONS_ROW2) {
        const btn = createLoadoutIconButton(iconKey, true);
        if (btn) row2.appendChild(btn);
    }
    container.appendChild(row2);

    // Insert the container inside #attributesDisplay (at the end)
    attributesDisplay.appendChild(container);

    // Initial UI update
    updateLoadoutIconsUI();
}

/**
 * Initialize the loadout system.
 * Should be called after the DOM is ready and game data is loaded.
 */
function initLoadouts() {
    createLoadoutIconsUI();
}

