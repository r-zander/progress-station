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

const romanMatrix = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I']
];

function convertToRoman(num) {
    if (num === 0) {
        return '';
    }
    for (let i = 0; i < romanMatrix.length; i++) {
        if (num >= romanMatrix[i][0]) {
            return romanMatrix[i][1] + convertToRoman(num - romanMatrix[i][0]);
        }
    }
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

// noinspection JSValidateJSDoc
/**
 * Blends two colors to find a third color between them. The `amount` parameter
 * specifies the amount to interpolate between the two values. 0 is equal to
 * the first color, 0.1 is very near the first color, 0.5 is halfway between
 * the two colors, and so on. Negative numbers are set to 0. Numbers greater
 * than 1 are set to 1. This differs from the behavior of
 * <a href="#/lerp">lerp</a>. It's necessary because numbers outside of the
 * interval [0, 1] will produce strange and unexpected colors.
 *
 * The way that colors are interpolated depends on the current
 * <a href="#/colorMode">colorMode()</a>.
 *
 * @method lerpColor
 * @param  {Color} color1  interpolate from this color.
 * @param  {Color} color2  interpolate to this color.
 * @param  {Number}       amount number between 0 and 1.
 * @param {'RGB'|'HSL'|'HSB'} mode
 * @return {Color}     interpolated color.
 *
 * @example
 * <div>
 * <code>
 * colorMode(RGB);
 * stroke(255);
 * background(51);
 * const from = color(218, 165, 32);
 * const to = color(72, 61, 139);
 * colorMode(RGB);
 * const interA = lerpColor(from, to, 0.33);
 * const interB = lerpColor(from, to, 0.66);
 * fill(from);
 * rect(10, 20, 20, 60);
 * fill(interA);
 * rect(30, 20, 20, 60);
 * fill(interB);
 * rect(50, 20, 20, 60);
 * fill(to);
 * rect(70, 20, 20, 60);
 * describe(
 *   'Four rectangles with white edges. From left to right, the rectangles are tan, brown, brownish purple, and purple.'
 * );
 * </code>
 * </div>
 */
function lerpColor(color1, color2, amount, mode) {
    const maxes = _colorMaxes;
    let l0, l1, l2, l3;
    let fromArray, toArray;

    if (mode === 'RGB') {
        fromArray = color1.levels.map(level => level / 255);
        toArray = color2.levels.map(level => level / 255);
    } else if (mode === 'HSB') {
        color1._getBrightness(); // Cache hsba so it definitely exists.
        color2._getBrightness();
        fromArray = color1.hsba;
        toArray = color2.hsba;
    } else if (mode === 'HSL') {
        color1._getLightness(); // Cache hsla so it definitely exists.
        color2._getLightness();
        fromArray = color1.hsla;
        toArray = color2.hsla;
    } else {
        throw new Error(`${mode}cannot be used for interpolation.`);
    }

    // Prevent extrapolation.
    amount = Math.max(Math.min(amount, 1), 0);

    // Perform interpolation.
    l0 = lerp(fromArray[0], toArray[0], amount);
    l1 = lerp(fromArray[1], toArray[1], amount);
    l2 = lerp(fromArray[2], toArray[2], amount);
    l3 = lerp(fromArray[3], toArray[3], amount);

    // Scale components.
    l0 *= maxes[mode][0];
    l1 *= maxes[mode][1];
    l2 *= maxes[mode][2];
    l3 *= maxes[mode][3];

    return new Color([l0, l1, l2, l3], mode);
}


/**
 * @param {number} a
 * @param {number} b
 * @param {number} epsilon
 */
function approximatelyEquals(a, b, epsilon = 128 * Number.EPSILON) {
    return Math.abs(a - b) <= epsilon;
}

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
