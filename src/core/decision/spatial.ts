import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"
import type * as GeoJSON from "geojson"

/**
 * Returns true if the evaluated feature is fully contained inside the input
 * geometry.
 *
 * @param geometry - The GeoJSON geometry to test against. Can be a `Polygon`,
 * `MultiPolygon`, `Feature`, `FeatureCollection`, or an expression.
 * @returns An expression that returns true if the feature is within the geometry
 *
 * @see [MapLibre Style Specification - within](https://maplibre.org/maplibre-style-spec/expressions/#within)
 *
 * @example
 * ```ts
 * expr.within({
 *   type: "Polygon",
 *   coordinates: [[[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]]]
 * }); // ["within", {"type": "Polygon", "coordinates": [[[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]]]}]
 * ```
 */
export function within(
  geometry:
    | GeoJSON.Polygon
    | GeoJSON.MultiPolygon
    | GeoJSON.Feature
    | GeoJSON.FeatureCollection
    | ExpressionSpecification,
) {
  return ["within", geometry] satisfies ExpressionSpecification
}

/**
 * Creates spatial expressions for MapLibre styles
 *
 * @see [MapLibre Style Specification - Decision](https://maplibre.org/maplibre-style-spec/expressions/#decision)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * expr.within({
 *   type: "Polygon",
 *   coordinates: [[[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]]]
 * }); // ["within", {"type": "Polygon", "coordinates": [[[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]]]}]
 * ```
 */
export const spatial = {
  within,
} as const
