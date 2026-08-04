/**
 * Hand-maintained type definitions for the lodash functions this project actually uses.
 *
 * The official @types/lodash package is 705 files / 1.9 MB - far too much for the handful of
 * helpers used here. This file covers only what is in use.
 *
 * Adding a lodash call that is not listed below? The type checker will reject it. Look the
 * function up at https://lodash.com/docs/4.17.15 and add its signature here - that keeps the
 * typing honest and the file small.
 */

interface LoDashStatic {
    /** https://lodash.com/docs/4.17.15#random */
    random(lower?: number, upper?: number, floating?: boolean): number;

    /** https://lodash.com/docs/4.17.15#union */
    union<T>(...arrays: Array<ArrayLike<T> | null | undefined>): T[];

    /** https://lodash.com/docs/4.17.15#merge */
    merge<TObject, TSource>(object: TObject, source: TSource): TObject & TSource;

    /** https://lodash.com/docs/4.17.15#lowerFirst */
    lowerFirst(string?: string): string;

    /** https://lodash.com/docs/4.17.15#isObject */
    isObject(value?: any): value is object;

    /** https://lodash.com/docs/4.17.15#isObjectLike */
    isObjectLike(value?: any): boolean;

    /** https://lodash.com/docs/4.17.15#has */
    has(object: any, path: PropertyKey | PropertyKey[]): boolean;

    /** https://lodash.com/docs/4.17.15#flatten */
    flatten<T>(array: ArrayLike<ArrayLike<T> | T> | null | undefined): T[];

    /** https://lodash.com/docs/4.17.15#defaultTo */
    defaultTo<T>(value: T | null | undefined, defaultValue: T): T;
}

declare const _: LoDashStatic;
