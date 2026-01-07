'use strict';

/**
 * Prepares configured titles to be displayed in the UI.
 * @param {string} title
 * @return {string}
 */
function prepareTitle(title) {
    // Replace regular spaces with non-breaking spaces, ensuring that one title stays on the same line.
    return title.replaceAll(/(?<=\w) (?=\w)/g, Symbols.NON_BREAKING_SPACE);
}

/**
 * @param {string} title
 * @return {string}
 */
function deprepareTitle(title) {
    return title.replaceAll(Symbols.NON_BREAKING_SPACE, ' ');
}

function withCheats(func) {
    if (typeof cheats === JsTypes.Object) {
        func(cheats);
    }
    // else: no-op
}

/**
 *
 * @param {HTMLDataElement} dataElement
 * @param {number} value
 * @param {{
 *     prefixes?: string[],
 *     unit?: string,
 *     forceSign?: boolean,
 *     keepNumber?: boolean,
 *     forceInteger?: boolean,
 *     toStringFn?: function(number): string,
 * }} config
 */
function formatValue(dataElement, value, config = {}) {
    // TODO render full number + unit into dataElement.title
    dataElement.value = String(value);

    const defaultConfig = {
        prefixes: magnitudes,
        unit: '',
        forceSign: false,
        // TODO does not support thousand separator
        keepNumber: false,
        forceInteger: false,
        toStringFn: undefined,
    };
    config = Object.assign({}, defaultConfig, config);

    const toString = (value) => {
        if (isFunction(config.toStringFn)) {
            return config.toStringFn(value);
        } else if (Number.isInteger(value)) {
            return value.toFixed(0);
        } else if (Math.abs(value) < 1) {
            return value.toFixed(2);
        } else {
            return value.toPrecision(3);
        }
    };

    if (config.forceInteger) {
        value = Math.round(value);
    }

    // what tier? (determines SI symbol)
    const tier = Math.max(0, Math.log10(Math.abs(value)) / 3 | 0);

    let prefix = '';
    if (config.forceSign) {
        if (Math.abs(value) <= 0.001) {
            prefix = '±';
            value = Math.abs(value);
        } else if (value > 0) {
            prefix = '+';
        }
    }

    if (config.keepNumber) {
        dataElement.textContent = prefix + value;
        delete dataElement.dataset.unit;
        return;
    }

    // get suffix and determine scale
    let suffix = config.prefixes[tier];
    if (typeof config.unit === 'string' && config.unit.length > 0) {
        dataElement.dataset.unit = suffix + config.unit;
    } else if (suffix.length > 0) {
        dataElement.dataset.unit = suffix;
    } else {
        delete dataElement.dataset.unit;
    }

    if (tier === 0) {
        dataElement.textContent = prefix + toString(value);
        return;
    }
    const scale = Math.pow(10, tier * 3);

    // scale the number
    const scaled = value / scale;

    // format number and add suffix
    dataElement.textContent = prefix + toString(scaled);
}

/**
 *
 * @param {HTMLDataElement} dataElement
 * @param {number} amount
 * @param {{prefixes?: string[], unit?: string, forceSign?: boolean}} formatConfig
 */
function formatEnergyValue(dataElement, amount, formatConfig = {}) {
    formatValue(dataElement, amount, Object.assign({
        unit: units.energy,
        prefixes: metricPrefixes,
    }, formatConfig));
}

function formatLevelValue(dataElement, level) {
    // TODO adjust formatValue and use that
    dataElement.textContent = formatNumber(level);
    dataElement.value = String(level);
}
