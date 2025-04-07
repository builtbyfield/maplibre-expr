import { core } from "./core";

/**
 * Core expressions for MapLibre Style Specification and custom helper functions
 * designed to solve common use cases when working with MapLibre GL.
 *
 * Direct access to all expressions is available via the `expr` object
 * (e.g. `expr.round(1.5)`); however, you can also access expressions via
 * sub-objects for each category (e.g. `expr.math.round(1.5)`) or sub-category
 * (e.g. `expr.math.rounding.round(1.5)`) if applicable.
 *
 * @see [MapLibre Style Specification - Expressions](https://maplibre.org/maplibre-style-spec/expressions/)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * // Direct access
 * expr.round(1.5); // ["round", 1.5]
 * // Access via math
 * expr.math.round(1.5); // ["round", 1.5]
 * // Access via math.rounding
 * expr.math.rounding.round(1.5); // ["round", 1.5]
 * ```
 */
export const expr = {
  ...core,
};

export default expr;
