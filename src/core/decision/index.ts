import * as comparison from "./comparison"
import * as controlFlow from "./control-flow"
import * as logical from "./logical"
import * as spatial from "./spatial"

export * from "./comparison"
export * from "./control-flow"
export * from "./logical"
export * from "./spatial"

/**
 * Decision expressions for MapLibre Style Specification.
 *
 * @see [MapLibre Style Specification - Decision](https://maplibre.org/maplibre-style-spec/expressions/#decision)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * // Comparison expression
 * expr.equal("$type", "Polygon"); // ["==", "$type", "Polygon"]
 *
 * // Case expression
 * expr.case(
 *   [
 *     [["boolean", ["feature-state", "hover"], false], 1],
 *     [["==", ["get", "type"], "home"], 2],
 *     [[">=", ["get", "height"], 100], 3],
 *   ],
 *   0.5
 * ); // ["case", ["boolean", ["feature-state", "hover"], false], 1, ["==", ["get", "type"], "home"], 2, [">=", ["get", "height"], 100], 3, 0.5]
 * ```
 */
export const decision = {
  ...comparison,
  ...controlFlow,
  ...logical,
  ...spatial,
} as const
