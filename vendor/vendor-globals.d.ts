/**
 * Wires the vendored libraries into the global scope.
 *
 * Only libs defining modules, no typed globals, need to be bridged here.
 */

/**
 * Uses `export =`, so the type has to be pulled in explicitly
 */
declare const XFastdom: typeof import('./fastdom-1.0.11/extensions/fastdom-promised');

/**
 * Re-definition of actually used function.
 */
declare const romans: {
    romanize(decimal: number): string;
    deromanize(romanStr: string): number;
};
