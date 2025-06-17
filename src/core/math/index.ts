import * as advanced from "./advanced"
import * as arithmetic from "./arithmetic"
import * as constants from "./constants"
import * as distance from "./distance"
import * as rounding from "./rounding"
import * as trigonometry from "./trigonometry"

export * from "./advanced"
export * from "./arithmetic"
export * from "./constants"
export * from "./distance"
export * from "./rounding"
export * from "./trigonometry"

/**
 * Math expressions for MapLibre Style Specification.
 *
 * @see [MapLibre Style Specification - Math](https://maplibre.org/maplibre-style-spec/expressions/#math)
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
export const math = {
  ...advanced,
  ...arithmetic,
  ...constants,
  ...distance,
  ...rounding,
  ...trigonometry,
} as const
