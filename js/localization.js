'use strict';

/**
 * The preference needs to be known at boot, long before the save game is loaded - so it lives
 * in its own storage key next to the one in gameData.settings.
 */
const LOCALIZATION_STORAGE_KEY = 'ps_localization_language';

const LOCALIZATION_DEFAULT_LANGUAGE = 'en';

/**
 * Languages the game can be played in. English is always available and never loaded - it is the
 * inline source in the config files and index.html. lang/en.json exists only to be handed to
 * translators.
 *
 * @type {Record<string, {locale: string, autonym: string}>}
 */
const LocalizationLanguages = {
    en: {locale: 'en-US', autonym: 'English'},
    de: {locale: 'de-DE', autonym: 'Deutsch'},
};

/**
 * Mirrors initConfigNames() - every registry holding entities whose text the player sees.
 * `prepare` is false where the titles never went through prepareTitle() to begin with, `descriptions`
 * where they are derived from somewhere else rather than authored per entity.
 *
 * @type {{
 *     type: string,
 *     registry: () => Record<string, {title: string, description?: string}>,
 *     prepare?: boolean,
 *     descriptions?: boolean
 * }[]}
 */
const LocalizedRegistries = [
    {type: 'Attribute', registry: () => attributes, prepare: false},
    {type: 'ModuleCategory', registry: () => moduleCategories},
    {type: 'Module', registry: () => modules},
    {type: 'ModuleComponent', registry: () => moduleComponents},
    {type: 'ModuleOperation', registry: () => moduleOperations},
    {type: 'Faction', registry: () => factions, prepare: false},
    {type: 'Battle', registry: () => battles, descriptions: false},
    {type: 'PointOfInterest', registry: () => pointsOfInterest},
    {type: 'Sector', registry: () => sectors},
];

/**
 * Entities that are not part of any registry - they carry their own type.
 *
 * @type {{name: string, entity: () => {type: string, title: string, description?: string}}[]}
 */
const LocalizedSingletons = [
    {name: 'gridStrength', entity: () => gridStrength},
    {name: 'analysisCore', entity: () => analysisCore},
];

/**
 * @typedef {'integer'|'fraction2'|'precision3'} NumberStyle
 */

/** @type {Record<NumberStyle, Intl.NumberFormatOptions>} */
const LocalizationNumberStyles = {
    integer: {maximumFractionDigits: 0},
    fraction2: {minimumFractionDigits: 2, maximumFractionDigits: 2},
    precision3: {maximumSignificantDigits: 3},
};

class Localization {
    /** @type {Map<string, string|string[]>} the active translation, empty for English */
    static #catalog = new Map();

    /** @type {Map<string, string|string[]>} the inline English, harvested from code and markup */
    static #defaults = new Map();

    /** @type {Map<string, string|string[]>} a plain string means the message has no placeholders */
    static #compiled = new Map();

    /** @type {Record<string, string>} */
    static #globals = {};

    /** @type {Set<string>} */
    static #missingKeys = new Set();

    /** @type {string} */
    static #language = LOCALIZATION_DEFAULT_LANGUAGE;

    /** @type {string} */
    static #locale = LocalizationLanguages[LOCALIZATION_DEFAULT_LANGUAGE].locale;

    /** @type {Intl.PluralRules|undefined} */
    static #pluralRules = undefined;

    /** @type {Map<NumberStyle, Intl.NumberFormat>} */
    static #numberFormats = new Map();

    // Declared last - the loader touches every field above
    /** @type {Promise<void>} */
    static #ready = Localization.#load();

    /** @return {string} */
    static get language() {
        return Localization.#language;
    }

    /** @return {string} BCP 47, feeds getLocale() */
    static get locale() {
        return Localization.#locale;
    }

    /** @return {Promise<void>} resolves once the catalog settled, never rejects */
    static get ready() {
        return Localization.#ready;
    }

    /** @return {Map<string, string|string[]>} for the en.json exporter */
    static get defaults() {
        return Localization.#defaults;
    }

    /** @return {Set<string>} keys reached at runtime that nothing could resolve */
    static get missingKeys() {
        return Localization.#missingKeys;
    }

    /**
     * @param {string} key
     * @param {Record<string, string|number>} [params] a numeric `count` additionally selects the plural form
     * @param {string} [fallback] for one-off and development use - shipping code declares its English in a table
     * @return {string}
     */
    static t(key, params = undefined, fallback = undefined) {
        if (isString(fallback) && !Localization.#defaults.has(key)) {
            Localization.registerDefault(key, fallback);
        }

        const lookupKey = isDefined(params) && isNumber(params.count)
            ? Localization.#pluralKey(key, params.count)
            : key;

        const compiled = Localization.#compile(lookupKey);
        if (isString(compiled)) {
            return compiled;
        }

        // Odd indices hold the placeholder names, even ones the literals around them
        let result = compiled[0];
        for (let i = 1; i < compiled.length; i += 2) {
            result += Localization.#resolveValue(compiled[i], params);
            result += compiled[i + 1];
        }

        return result;
    }

    /**
     * @param {number} value
     * @param {NumberStyle} [style]
     * @return {string}
     */
    static number(value, style = 'integer') {
        let format = Localization.#numberFormats.get(style);
        if (!isDefined(format)) {
            format = new Intl.NumberFormat(Localization.#locale, LocalizationNumberStyles[style]);
            Localization.#numberFormats.set(style, format);
        }

        return format.format(value);
    }

    /**
     * @param {string} key
     * @return {boolean}
     */
    static has(key) {
        return Localization.#catalog.has(key) || Localization.#defaults.has(key);
    }

    /**
     * @param {string} key
     * @param {string|string[]} english
     */
    static registerDefault(key, english) {
        Localization.#defaults.set(key, english);
    }

    /**
     * @param {Record<string, string>} record
     */
    static registerDefaults(record) {
        for (const [key, english] of Object.entries(record)) {
            Localization.#defaults.set(key, english);
        }
    }

    /**
     * Values every message can use without them being passed per call, e.g. attribute markup.
     *
     * @param {Record<string, string>} record
     */
    static setGlobals(record) {
        Object.assign(Localization.#globals, record);
    }

    /**
     * @param {string} languageCode
     */
    static persistPreference(languageCode) {
        localStorage.setItem(LOCALIZATION_STORAGE_KEY, languageCode);
    }

    /**
     * Translates a subtree in place. Runs once at boot over the document and over every
     * <template>.content - clones taken later inherit the translation for free.
     *
     * @param {Document|DocumentFragment|HTMLElement} root
     */
    static applyToDom(root) {
        for (const element of /** @type {NodeListOf<HTMLElement>} */ (root.querySelectorAll('[data-i18n]'))) {
            Localization.#applyToElement(element, element.dataset.i18n, false);
        }

        for (const element of /** @type {NodeListOf<HTMLElement>} */ (root.querySelectorAll('[data-i18n-html]'))) {
            Localization.#applyToElement(element, element.dataset.i18nHtml, true);
        }

        // querySelectorAll does not descend into template content
        for (const template of root.querySelectorAll('template')) {
            Localization.applyToDom(template.content);
        }
    }

    /**
     * @param {HTMLElement} element
     * @param {string} spec `key`, or `[attribute]key` pairs separated by `;`
     * @param {boolean} asHtml
     */
    static #applyToElement(element, spec, asHtml) {
        for (const segment of spec.split(';')) {
            const attributeMatch = segment.match(/^\[(.+?)](.+)$/);
            if (attributeMatch === null) {
                const key = segment.trim();
                // Source indentation is not content - the browser collapses it, so the catalog should too
                const source = asHtml ? element.innerHTML : element.textContent;
                const translated = Localization.#harvestThenTranslate(key, source.replace(/\s+/g, ' ').trim());
                if (asHtml) {
                    element.innerHTML = translated;
                } else {
                    element.textContent = translated;
                }
                continue;
            }

            const attribute = attributeMatch[1];
            element.setAttribute(attribute, Localization.#harvestThenTranslate(
                attributeMatch[2].trim(),
                element.getAttribute(attribute),
            ));
        }
    }

    /**
     * The markup is the English source - take it before overwriting it.
     *
     * @param {string} key
     * @param {string|null} english
     * @return {string}
     */
    static #harvestThenTranslate(key, english) {
        if (isString(english) && !Localization.#defaults.has(key)) {
            Localization.registerDefault(key, english);
        }

        return Localization.t(key);
    }

    /**
     * Overlays the catalog onto the already constructed config entities. Has to run after
     * initConfigNames() - the assigned names are the keys - and before createAttributesHTML(),
     * which freezes the attribute titles into markup that ends up inside other descriptions.
     */
    static applyToConfig() {
        for (const {type, registry, prepare = true, descriptions = true} of LocalizedRegistries) {
            for (const [name, entity] of Object.entries(registry())) {
                Localization.#overlayEntity(type, name, entity, prepare, descriptions);
            }
        }

        for (const {name, entity} of LocalizedSingletons) {
            const singleton = entity();
            Localization.#overlayEntity(singleton.type, name, singleton, true, true);
        }

        Localization.#rederiveTitles();
        Localization.#applyFormats();
    }

    /**
     * Number formatting that is language rather than locale specific: the magnitude ladder is
     * short scale in English but long scale in e.g. German, and XP is an English abbreviation.
     */
    static #applyFormats() {
        Localization.registerDefault('format.magnitude', magnitudes);
        const translatedMagnitudes = Localization.#catalog.get('format.magnitude');
        if (Array.isArray(translatedMagnitudes)) {
            magnitudes = translatedMagnitudes;
        }

        Localization.registerDefault('format.unit.experience', units.experience);
        const translatedExperience = Localization.#catalog.get('format.unit.experience');
        if (isString(translatedExperience)) {
            units.experience = translatedExperience;
        }
    }

    /**
     * Harvests the inline English before overwriting it - that is what keeps the en.json export
     * correct no matter which language is currently running. A key the catalog does not have
     * leaves the English untouched instead of blanking it.
     *
     * @param {string} type
     * @param {string} name
     * @param {{title: string, description?: string}} entity
     * @param {boolean} prepare
     * @param {boolean} descriptions
     */
    static #overlayEntity(type, name, entity, prepare, descriptions) {
        const titleKey = `entity.${type}.${name}.title`;
        Localization.registerDefault(titleKey, deprepareTitle(entity.title));
        const translatedTitle = Localization.#catalog.get(titleKey);
        if (isString(translatedTitle)) {
            entity.title = prepare ? prepareTitle(translatedTitle) : translatedTitle;
        }

        if (!descriptions || !isString(entity.description)) return;

        const descriptionKey = `entity.${type}.${name}.description`;
        Localization.registerDefault(descriptionKey, entity.description);
        const translatedDescription = Localization.#catalog.get(descriptionKey);
        if (isString(translatedDescription)) {
            entity.description = translatedDescription;
        }
    }

    /**
     * Titles that were composed at script parse time and would otherwise still hold the English
     * pieces they were built from.
     */
    static #rederiveTitles() {
        // A battle's description is its faction's - per battle they would duplicate each
        // faction paragraph a dozen times over
        for (const battle of Object.values(battles)) {
            battle.description = battle.faction.description;
        }

        for (const [name, technology] of Object.entries(technologies)) {
            if (!(technology.unlocks instanceof Entity)) {
                Localization.#overlayUnlockTitle(name, technology);
            }
            technology.refreshDerivedTitle();
        }

        for (const galacticSecret of Object.values(galacticSecrets)) {
            galacticSecret.refreshDerivedTitle();
        }
    }

    /**
     * The handful of technologies that unlock a bare object instead of an Entity own their title -
     * there is nothing else to derive it from.
     *
     * @param {string} name
     * @param {Technology} technology
     */
    static #overlayUnlockTitle(name, technology) {
        if (technology instanceof EssenceOfUnknownGainTechnology) {
            // All of them share one title - a key per technology would be dozens of identical entries
            technology.unlocks.title = Localization.t('technology.extraCurrency', {
                attribute: attributes.essenceOfUnknown.title,
            });
            return;
        }

        const titleKey = `entity.Technology.${name}.title`;
        Localization.registerDefault(titleKey, technology.unlocks.title);
        const translated = Localization.#catalog.get(titleKey);
        if (isString(translated)) {
            technology.unlocks.title = translated;
        }
    }

    /**
     * @return {Promise<void>}
     */
    static #load() {
        const preference = Localization.#readPreference();
        if (preference === LOCALIZATION_DEFAULT_LANGUAGE) {
            Localization.#applyLanguage(preference, {});
            return Promise.resolve();
        }

        return fetch(`lang/${preference}.json`)
            .then((response) => {
                if (!response.ok) {
                    return Promise.reject(new Error('HTTP ' + response.status));
                }

                return response.json();
            })
            .then((catalog) => {
                Localization.#applyLanguage(preference, catalog);
            })
            .catch((reason) => {
                // Blocked on file:// - the game stays fully playable in English, same as the audio
                console.warn(`Localization: could not load "lang/${preference}.json", staying English.`, reason);
                Localization.#applyLanguage(LOCALIZATION_DEFAULT_LANGUAGE, {});
            });
    }

    /**
     * @return {string}
     */
    static #readPreference() {
        const stored = localStorage.getItem(LOCALIZATION_STORAGE_KEY);
        if (isString(stored) && Object.hasOwn(LocalizationLanguages, stored)) {
            return stored;
        }

        const detected = navigator.language.split('-')[0];
        if (Object.hasOwn(LocalizationLanguages, detected)) {
            return detected;
        }

        return LOCALIZATION_DEFAULT_LANGUAGE;
    }

    /**
     * @param {string} languageCode
     * @param {Record<string, string>} catalog
     */
    static #applyLanguage(languageCode, catalog) {
        Localization.#catalog = new Map(Object.entries(catalog));
        Localization.#language = languageCode;
        // A catalog may pin a more specific locale than the language default, e.g. de-AT
        Localization.#locale = isString(catalog['@locale'])
            ? catalog['@locale']
            : LocalizationLanguages[languageCode].locale;

        Localization.#compiled.clear();
        Localization.#numberFormats.clear();
        Localization.#pluralRules = undefined;

        document.documentElement.lang = languageCode;
    }

    /**
     * @param {string} key
     * @param {number} count
     * @return {string}
     */
    static #pluralKey(key, count) {
        if (!isDefined(Localization.#pluralRules)) {
            Localization.#pluralRules = new Intl.PluralRules(Localization.#locale);
        }

        const categoryKey = key + '_' + Localization.#pluralRules.select(count);
        if (Localization.has(categoryKey)) {
            return categoryKey;
        }

        const otherKey = key + '_other';
        return Localization.has(otherKey) ? otherKey : key;
    }

    /**
     * @param {string} key
     * @return {string|string[]} a plain string has nothing to interpolate
     */
    static #compile(key) {
        const cached = Localization.#compiled.get(key);
        if (isDefined(cached)) {
            return cached;
        }

        const source = Localization.#lookup(key);
        const parts = source.split(/\{\{(.*?)}}/);
        // A single part means there are no placeholders - cache the string itself
        const compiled = parts.length === 1 ? source : parts;
        Localization.#compiled.set(key, compiled);

        return compiled;
    }

    /**
     * @param {string} key
     * @return {string}
     */
    static #lookup(key) {
        const translated = Localization.#catalog.get(key);
        if (isString(translated)) {
            return translated;
        }

        const fallback = Localization.#defaults.get(key);
        if (isString(fallback)) {
            return fallback;
        }

        Localization.#missingKeys.add(key);
        return key;
    }

    /**
     * @param {string} name
     * @param {Record<string, string|number>} [params]
     * @return {string}
     */
    static #resolveValue(name, params) {
        if (isDefined(params) && Object.hasOwn(params, name)) {
            const value = params[name];
            return isNumber(value) ? Localization.number(value) : value;
        }

        if (Object.hasOwn(Localization.#globals, name)) {
            return Localization.#globals[name];
        }

        // Leave the placeholder visible - a silently blank message is far harder to spot
        return '{{' + name + '}}';
    }
}

/*
 * Formats that compose a title out of other titles. Registered here rather than harvested, because
 * the config files already use them while they construct their entities.
 */
Localization.registerDefaults({
    'entity.GalacticSecret.titleFormat': '{{component}}: {{operation}}',
    'technology.extraCurrency': 'Extra {{attribute}}',
});
