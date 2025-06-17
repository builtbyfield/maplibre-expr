import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

/**
 * Gets the kernel density estimation of a pixel in a heatmap layer, which is a
 * relative measure of how many data points are crowded around a particular
 * pixel. Can only be used in the heatmap-color property.
 *
 * @returns An expression that returns the heatmap-density value
 *
 * @see [MapLibre Style Specification - heatmap-density](https://maplibre.org/maplibre-style-spec/expressions/#heatmap-density)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * expr.heatmapDensity(); // ["heatmap-density"]
 * ```
 */
export function heatmapDensity() {
  return ["heatmap-density"] satisfies ExpressionSpecification
}

/**
 * Heatmap expressions for MapLibre Style Specification.
 *
 * @see [MapLibre Style Specification - Heatmap](https://maplibre.org/maplibre-style-spec/expressions/#heatmap)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * // Directly access the heatmap-density function
 * expr.heatmapDensity(); // ["heatmap-density"]
 *
 * // Access the heatmap-density function through the heatmap object
 * expr.heatmap.heatmapDensity(); // ["heatmap-density"]
 * ```
 */
export const heatmap = {
  heatmapDensity,
} as const
