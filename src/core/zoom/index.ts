import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec";

/**
 * Gets the current zoom level. Note that in style layout and paint properties,
 * ["zoom"] may only appear as the input to a top-level "step" or "interpolate"
 * expression.
 *
 * @returns An expression that returns the current zoom level
 *
 * @see [MapLibre Style Specification - zoom](https://maplibre.org/maplibre-style-spec/expressions/#zoom_1)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * expr.zoom(); // ["zoom"]
 * ```
 */
export function zoom() {
  return ["zoom"] satisfies ExpressionSpecification;
}
