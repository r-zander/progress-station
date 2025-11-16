'use strict';

function isDefined(variable) {
    return !isUndefined(variable);
}

function isUndefined(variable) {
    return typeof variable === 'undefined';
}

function isFunction(variable) {
    return typeof variable === 'function';
}

function isNumber(variable) {
    return typeof variable === 'number';
}

function isString(variable) {
    return typeof variable === 'string';
}

function isBoolean(variable) {
    return typeof variable === 'boolean';
}

/**
 * @return {boolean} whether or not the element was found and removed.
 */
function removeElement(array, element) {
    let indexOf = array.indexOf(element);
    if (indexOf < 0) {
        return false;
    }
    array.splice(indexOf, 1);
    return true;
}

/**
 * @param {string} msg
 */
function warnWithStacktrace(msg) {
    console.warn(msg);
    console.trace();
}

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

function gaussianRandom(min = 0, max = 1, skew = 1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    z = z / 10.0 + 0.5; // Translate to 0 -> 1
    if (z > 1 || z < 0) {
        z = gaussianRandom(min, max, skew); // resample between 0 and 1 if out of range}
    } else {
        z = Math.pow(z, skew); // Skew
        z *= max - min; // Stretch to fill range
        z += min; // offset to min
    }
    return z;
}

function gaussianRandomInt(min = 0, max = 1, skew = 1) {
    return Math.round(gaussianRandom(min, max, skew));
}

/**
 * Calculates a number between two numbers at a specific increment. The `amt`
 * parameter is the amount to interpolate between the two numbers. 0.0 is
 * equal to the first number, 0.1 is very near the first number, 0.5 is
 * half-way in between, and 1.0 is equal to the second number. The `lerp()`
 * function is convenient for creating motion along a straight path and for
 * drawing dotted lines.
 *
 * If the value of `amt` is less than 0 or more than 1, `lerp()` will return a
 * number outside of the original interval. For example, calling
 * `lerp(0, 10, 1.5)` will return 15.
 *
 * @method lerp
 * @param  {Number} start first value.
 * @param  {Number} stop  second value.
 * @param  {Number} amt   number.
 * @return {Number}       lerped value.
 * @example
 * <div>
 * <code>
 * let a = 20;
 * let b = 80;
 * let c = lerp(a, b, 0.2);
 * let d = lerp(a, b, 0.5);
 * let e = lerp(a, b, 0.8);
 *
 * let y = 50;
 *
 * strokeWeight(5);
 *
 * // Draw the original points in black.
 * stroke(0);
 * point(a, y);
 * point(b, y);
 *
 * // Draw the lerped points in gray.
 * stroke(100);
 * point(c, y);
 * point(d, y);
 * point(e, y);
 *
 * describe('Five points in a horizontal line. The outer points are black and the inner points are gray.');
 * </code>
 * </div>
 */
function lerp(start, stop, amt) {
    return amt * (stop - start) + start;
}

/**
 * @param {number} a
 * @param {number} b
 * @param {number} epsilon
 */
function approximatelyEquals(a, b, epsilon = 128 * Number.EPSILON) {
    return Math.abs(a - b) <= epsilon;
}

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}

/**
 * Alias for approximatelyEquals
 * @type {function(number, number, number=): boolean}
 */
const nearlyEquals = approximatelyEquals;

const Symbols = {
    NON_BREAKING_SPACE: '\u00A0',

    /**
     * Zero-width space. Allows strings to have linebreaks, even between words or non-breaking spaces.
     */
    SOFT_BREAK: '\u200B',

    /**
     * Thinner than a thin space.
     * @see {@link https://en.wikipedia.org/wiki/Whitespace_character#Hair_spaces_around_dashes}
     */
    HAIR_SPACE: '\u200A',

    /**
     * Shows: ⮞
     */
    RIGHT_ARROW: '\u2B9E',
};

const JsTypes = {
    Undefined: 'undefined',
    Boolean: 'boolean',
    Number: 'number',
    String: 'string',
    Function: 'function',
    Object: 'object',
    Array: 'array',
};

function validateParameter(parameter, definition, context, ) {
    let valid = false;
    if (typeof definition === JsTypes.Undefined) {
        valid = typeof parameter === JsTypes.Undefined;
    }
    if (typeof definition === JsTypes.String) {
        if (definition === JsTypes.Array) {
            valid = Array.isArray(parameter);
        } else {
            valid = typeof parameter === definition;
        }
    } else if (typeof definition === JsTypes.Object) {
        if (parameter === null) {
            valid = false;
        } else {
            valid = Object.keys(definition).every((key) => {
                if (!parameter.hasOwnProperty(key)) {
                    return false;
                }

                if (!definition.hasOwnProperty(key)) {
                    return false;
                }

                if (definition[key] === JsTypes.Array) {
                    return Array.isArray(parameter[key]);
                }

                return typeof parameter[key] === definition[key];
            });
        }
    }

    if (!valid) {
        console.log('Context, Payload, PayloadDefinition', context, parameter, definition);
        throw new TypeError('Provided parameter does not match the parameter definition of ' + context.constructor.name + '.');
    }
}


/**
 * @param {string} [localeOverride]
 */
function getLocale(localeOverride = undefined) {
    if (isString(localeOverride)) {
        return localeOverride;
    }

    // return navigator.language;
    return 'en-US';
}

/**
 * @param {number} value
 * @param {string} locale
 * @return {string}
 */
function formatNumber(value, locale = undefined) {
    locale = getLocale(locale);

    // noinspection JSCheckFunctionSignatures
    return value.toLocaleString(locale, {
        // useGrouping: false,
        trailingZeroDisplay: 'stripIfInteger',
    });
}

class DomGetter {
    /**
     *
     * @private {Document|Node}
     */
    #parent;

    constructor(parent) {
        this.#parent = parent;
    }

    /**
     * @param {string} id dom id of the searched element
     * @return {HTMLElement|null}
     */
    byId(id) {
        return this.#parent.querySelector('#' + id);
    }

    /**
     * @param {string} className css class of the searched element
     * @return {HTMLElement|null}
     */
    byClass(className) {
        return this.allByClass(className).item(0);
    }

    /**
     *
     * @param className css class of the searched elements
     * @return {HTMLCollectionOf<Element>}
     */
    allByClass(className) {
        return this.#parent.getElementsByClassName(className);
    }

    /**
     *
     * @param {string} selector
     * @returns {HTMLElement|null}
     */
    bySelector(selector) {
        return this.#parent.querySelector(selector);
    }

    /**
     * @param {string} selector
     * @returns {NodeListOf<HTMLElement>}
     */
    allBySelector(selector) {
        return this.#parent.querySelectorAll(selector);
    }
}

class LazyHtmlElement {

    /** @var {HTMLElement|null|undefined} */
    #element = undefined;

    /** @var {function(): HTMLElement|null} */
    #getFn;

    /**
     *
     * @param {function(): HTMLElement|null} getFn
     */
    constructor(getFn) {
        this.#getFn = getFn;
    }

    #findLazy() {
        if (this.#element === undefined) {
            this.#element = this.#getFn();
        }

        return this.#element;
    }

    /**
     * @return {boolean}
     */
    found(){
        return this.#findLazy() !== null;
    }

    get() {
        return this.#findLazy();
    }
}

class LazyHtmlElementCollection {
    /** @var {HTMLElement[]|undefined} */
    #elements = undefined;

    /** @var {function(): Iterable<HTMLElement>} */
    #getFn;

    /**
     *
     * @param {function(): Iterable<HTMLElement>} getFn
     */
    constructor(getFn) {
        this.#getFn = getFn;
    }

    #findLazy() {
        if (this.#elements === undefined) {
            this.#elements =[...this.#getFn()];
        }

        return this.#elements;
    }

    /**
     * @return {boolean}
     */
    found(){
        return this.#findLazy() !== null && this.#findLazy().length > 0;
    }

    /**
     * @return {HTMLElement[]}
     */
    get() {
        return this.#findLazy();
    }
}

class LazyDomGetter {
    /** @var {DomGetter} */
    #domGetter;

    /**
     *
     * @param {Document|Node|DomGetter} parent
     */
    constructor(parent) {
        if (parent instanceof Node || parent instanceof Document) {
            this.#domGetter = new DomGetter(parent);
        } else if (parent instanceof DomGetter) {
            this.#domGetter = parent;
        }
    }

    /**
     * @param {string} id dom id of the searched element
     * @return {LazyHtmlElement}
     */
    byId(id) {
        return new LazyHtmlElement(() => this.#domGetter.byId(id));
    }

    /**
     * @param {string} className css class of the searched element
     * @return {LazyHtmlElement}
     */
    byClass(className) {
        return new LazyHtmlElement(() => this.#domGetter.byClass(className));
    }

    /**
     *
     * @param className css class of the searched elements
     * @return {LazyHtmlElementCollection}
     */
    allByClass(className) {
        return new LazyHtmlElementCollection(() => this.#domGetter.allByClass(className));
    }

    /**
     *
     * @param {string} selector
     * @returns {LazyHtmlElement}
     */
    bySelector(selector) {
        return new LazyHtmlElement(() => this.#domGetter.bySelector(selector));
    }

    /**
     * @param {string} selector
     * @returns {LazyHtmlElementCollection}
     */
    allBySelector(selector) {
        return new LazyHtmlElementCollection(() => this.#domGetter.allBySelector(selector));
    }
}

const documentDomGetter = new DomGetter(document);
documentDomGetter.byId = function (id) {
    return document.getElementById(id);
};

const documentLazyDomGetter = new LazyDomGetter(documentDomGetter);

const Dom = {
    /**
     * @param {Document|Node} parent
     * @return {DomGetter}
     */
    get: function (parent = undefined) {
        if (parent === undefined) {
            return documentDomGetter;
        }

        return new DomGetter(parent);
    },

    /**
     * @param {Document|Node} parent
     * @return {LazyDomGetter}
     */
    lazy: function (parent = undefined) {
        if (parent === undefined) {
            return documentLazyDomGetter;
        }

        return new LazyDomGetter(parent);
    },
    new: {
        /**
         *
         * @param {string} templateId
         * @return {HTMLElement}
         */
        fromTemplate: function (templateId) {
            return document.getElementById(templateId).content.firstElementChild.cloneNode(true);
        },

        /**
         * Note: This method is very expensive and should not be called during updates.
         *
         * @param {String} html representing a single element
         * @return {HTMLElement}
         */
        fromHtml: function (html) {
            let template = document.createElement('template');
            html = html.trim(); // Never return a text node of whitespace as the result
            template.innerHTML = html;
            // noinspection JSValidateTypes
            return template.content.firstChild;
        },
    },

    outerHeight: function (element) {
        const styles = window.getComputedStyle(element);
        const margin = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
        return Math.ceil(element.offsetHeight + margin);
    },

    /**
     * Note: `visibility: hidden` is considered visible for this function as it's still part of the dom & layout.
     * Note 2: This method is very expensive and should not be called during updates.
     *
     * @param {HTMLElement} element
     * @return {boolean}
     *
     */
    isVisible: function (element) {
        // Glorious stolen jQuery logic
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    },

    /**
     * Note: `visibility: hidden` is considered visible for this function as its still part of the dom & layout.
     * Note 2: This method is very expensive and should not be called during updates.
     *
     * @param {HTMLElement} element
     * @return {boolean}
     */
    isHidden: function (element) {
        return !this.isVisible(element);
    },
};

/**
 * Responsive class system that applies breakpoint-specific classes using Bootstrap 5 breakpoints
 * and Window.matchMedia API for consistent behavior with CSS media queries.
 */
const BreakpointCssClasses = (() => {
    // Bootstrap 5 breakpoints - exact pixel values
    // Note: xs is implicit (max-width: 575.98px) and handled separately
    const BREAKPOINTS = {
        sm: '(min-width: 576px)',
        md: '(min-width: 768px)',
        lg: '(min-width: 992px)',
        xl: '(min-width: 1200px)',
        xxl: '(min-width: 1400px)'
    };

    // All supported breakpoints including xs
    const ALL_BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

    // Internal state
    let initialized = false;
    let debugEnabled = false;
    const mediaQueries = new Map(); // breakpoint name -> MediaQueryList
    const trackedElements = new Map(); // element -> { baseClasses: string[], breakpointClasses: Map(breakpoint -> string[]) }

    /**
     * Initialize the breakpoint manager system
     * Scans the DOM for elements with class-[breakpoint] attributes and sets up listeners
     */
    function init() {
        if (initialized) {
            console.warn('BreakpointCssClasses is already initialized');
            return;
        }

        // Create MediaQueryList objects for each breakpoint
        for (const [name, query] of Object.entries(BREAKPOINTS)) {
            const mql = window.matchMedia(query);
            mediaQueries.set(name, mql);

            // Add change listener for this breakpoint
            mql.addEventListener('change', () => updateElementClasses());
        }

        // Add resize listener for debug display updates
        window.addEventListener('resize', () => {
            if (debugEnabled) {
                updateDebugDisplay();
            }
        });

        // Scan DOM for elements with breakpoint attributes
        scanDomForBreakpointElements();

        // Apply initial classes based on current breakpoints
        updateElementClasses(true);

        initialized = true;
    }

    /**
     * Cleanup the breakpoint manager (removes listeners and clears state)
     */
    function destroy() {
        if (!initialized) {
            return;
        }

        // Remove all MediaQueryList listeners
        for (const [name, mql] of mediaQueries) {
            mql.removeEventListener('change', updateElementClasses);
        }

        // Clear all tracked data
        mediaQueries.clear();
        trackedElements.clear();
        initialized = false;
    }

    /**
     * Scan the DOM for elements with class-[breakpoint] attributes
     */
    function scanDomForBreakpointElements() {
        // Find all elements with any breakpoint class attribute (including xs)
        const selector = ALL_BREAKPOINTS.map(bp => `[class-${bp}]`).join(',');

        const elements = document.querySelectorAll(selector);

        for (const element of elements) {
            trackElement(element);
        }
    }

    /**
     * Track an element for breakpoint class management
     * @param {HTMLElement} element - Element to track
     */
    function trackElement(element) {
        const elementData = {
            baseClasses: parseClasses(element.getAttribute('class') || ''),
            breakpointClasses: new Map()
        };

        // Parse all breakpoint class attributes (including xs)
        for (const breakpointName of ALL_BREAKPOINTS) {
            const attrName = `class-${breakpointName}`;
            const classValue = element.getAttribute(attrName);

            if (classValue) {
                elementData.breakpointClasses.set(breakpointName, parseClasses(classValue));
            }
        }

        trackedElements.set(element, elementData);
    }

    /**
     * Parse a class string into an array of individual class names
     * @param {string} classString - Space-separated class names
     * @returns {string[]} Array of class names
     */
    function parseClasses(classString) {
        return classString.trim().split(/\s+/).filter(cls => cls.length > 0);
    }

    /**
     * Update classes for all tracked elements based on current breakpoint matches
     */
    function updateElementClasses(force = false) {
        if (!force && !initialized) {
            return;
        }

        // Get currently matching breakpoint
        const activeBreakpoint = getActiveBreakpoint();

        // Update each tracked element
        for (const [element, elementData] of trackedElements) {
            const newClasses = buildClassList(elementData, activeBreakpoint);
            element.className = newClasses.join(' ');
        }

        // Update debug display if enabled
        updateDebugDisplay();
    }

    /**
     * Enable or disable debug mode
     * @param {boolean} enabled - Whether to enable debug mode
     */
    function setDebugEnabled(enabled) {
        debugEnabled = enabled;

        if (enabled) {
            updateDebugDisplay();
        } else {
            hideDebugDisplay();
        }
    }

    /**
     * Update the debug display with current breakpoint info
     */
    function updateDebugDisplay() {
        if (!debugEnabled) {
            return;
        }

        const debugDiv = document.getElementById('breakpointCssClassesDebug');
        if (!debugDiv) {
            return;
        }

        // Remove hidden attribute and update content
        debugDiv.classList.remove('hidden');
        debugDiv.innerHTML = `
            <p><strong>Status:</strong> ${initialized ? 'Initialized' : 'Not initialized'}</p>
            <p><strong>Tracked Elements:</strong> ${trackedElements.size}</p>
            <p><strong>Active Breakpoint:</strong> ${initialized ? getActiveBreakpoint() : 'none'}</p>
            <p><strong>Screen Width:</strong> ${window.innerWidth}px</p>
        `;
    }

    /**
     * Hide the debug display
     */
    function hideDebugDisplay() {
        const debugDiv = document.getElementById('breakpointCssClassesDebug');
        if (debugDiv) {
            debugDiv.classList.add('hidden');
        }
    }

    /**
     * Get the widest matching breakpoint name for exclusive application
     * @returns {string} The widest matching breakpoint name, including 'xs' for small screens
     */
    function getActiveBreakpoint() {
        // Check breakpoints from widest to narrowest
        const breakpointOrder = ['xxl', 'xl', 'lg', 'md', 'sm'];

        for (const breakpointName of breakpointOrder) {
            const mql = mediaQueries.get(breakpointName);
            if (mql && mql.matches) {
                return breakpointName;
            }
        }

        return 'xs'; // Screen is smaller than sm, so it's xs
    }

    /**
     * Get the widest breakpoint that has classes defined for an element
     * @param {Object} elementData - Element's stored class data
     * @param {string} activeBreakpoint - Currently matching breakpoint name
     * @returns {string|null} The widest breakpoint with defined classes, or null
     */
    function getWidestDefinedBreakpoint(elementData, activeBreakpoint) {
        // Check from the active breakpoint down to narrower ones (including xs)
        const breakpointOrder = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];
        const activeIndex = breakpointOrder.indexOf(activeBreakpoint);

        // Check from active breakpoint down to narrower breakpoints
        for (let i = activeIndex; i < breakpointOrder.length; i++) {
            const breakpointName = breakpointOrder[i];
            if (elementData.breakpointClasses.has(breakpointName)) {
                return breakpointName;
            }
        }

        return null;
    }

    /**
     * Build the complete class list for an element based on the widest matching breakpoint
     * @param {Object} elementData - Element's stored class data
     * @param {string|null} activeBreakpoint - Currently matching breakpoint name
     * @returns {string[]} Complete array of class names to apply
     */
    function buildClassList(elementData, activeBreakpoint) {
        const classes = [...elementData.baseClasses]; // Start with base classes

        // Find the widest breakpoint with defined classes
        const targetBreakpoint = getWidestDefinedBreakpoint(elementData, activeBreakpoint);

        if (targetBreakpoint) {
            const breakpointClasses = elementData.breakpointClasses.get(targetBreakpoint);
            if (breakpointClasses) {
                classes.push(...breakpointClasses);
            }
        }

        return classes;
    }

    // Public API
    return {
        init,
        destroy,
        setDebugEnabled,

        // Expose for debugging/testing
        get initialized() { return initialized; },
        get trackedElementsCount() { return trackedElements.size; },
        get activeBreakpoint() { return initialized ? getActiveBreakpoint() : null; },
        get debugEnabled() { return debugEnabled; }
    };
})();
