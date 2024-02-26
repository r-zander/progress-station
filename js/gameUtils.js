'use strict';

/**
 * Prepares configured titles to be displayed in the UI.
 * @param {string} title
 * @return {string}
 */
function prepareTitle(title) {
    // Replace regular spaces with non-breaking spaces, ensuring that one title stays on the same line.
    return title.replaceAll(' ', '\u00A0' /* non-breaking space */);
}

function withCheats(func) {
    if (typeof cheats === JsTypes.Object) {
        func(cheats);
    }
    // else: no-op
}
