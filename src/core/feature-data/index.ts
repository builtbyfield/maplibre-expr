import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

/**
 * Gets the feature properties object. Note that in some cases, it may be more
 * efficient to use ["get", "property_name"] directly.
 *
 * @returns An expression that gets the properties object
 *
 * @see [MapLibre Style Specification - properties](https://maplibre.org/maplibre-style-spec/expressions/#properties)
 *
 * @example
 * ```ts
 * expr.featureData.properties() // ['properties']
 * ```
 */
export function properties() {
  return ["properties"] satisfies ExpressionSpecification
}

/**
 * Retrieves a property value from the current feature's state. Returns null if
 * the requested property is not present on the feature's state. A feature's
 * state is not part of the GeoJSON or vector tile data, and must be set
 * programmatically on each feature. When `source.promoteId` is not provided,
 * features are identified by their `id` attribute, which must be an integer or
 * a string that can be cast to an integer. When `source.promoteId` is provided,
 * features are identified by their `promoteId` property, which may be a number,
 * string, or any primitive data type. Note that ["feature-state"] can only be
 * used with paint properties that support data-driven styling.
 */
export function featureState(property: string) {
  return ["feature-state", property] satisfies ExpressionSpecification
}

/**
 * Returns the feature's simple geometry type: `Point`, `LineString`, or
 * `Polygon`. `MultiPoint`, `MultiLineString`, and `MultiPolygon` are returned
 * as `Point`, `LineString`, and `Polygon`, respectively.
 *
 * @returns An expression that gets the geometry type
 *
 * @see [MapLibre Style Specification - geometry-type](https://maplibre.org/maplibre-style-spec/expressions/#geometry-type)
 *
 * @example
 * ```ts
 * expr.featureData.geometryType() // ['geometry-type']
 * ```
 */
export function geometryType() {
  return ["geometry-type"] satisfies ExpressionSpecification
}

/**
 * Gets the feature's id, if it has one.
 *
 * @returns An expression that gets the feature id
 *
 * @see [MapLibre Style Specification - id](https://maplibre.org/maplibre-style-spec/expressions/#id)
 *
 * @example
 * ```ts
 * expr.featureData.id() // ['id']
 * ```
 */
export function id() {
  return ["id"] satisfies ExpressionSpecification
}

/**
 * Gets the progress along a gradient line. Can only be used in the
 * `line-gradient` property.
 *
 * @returns An expression that gets the line progress
 *
 * @see [MapLibre Style Specification - line-progress](https://maplibre.org/maplibre-style-spec/expressions/#line-progress)
 */
export function lineProgress() {
  return ["line-progress"] satisfies ExpressionSpecification
}

/**
 * Gets the value of a cluster property accumulated so far. Can only be used in
 * the `clusterProperties` option of a clustered GeoJSON source.
 *
 * @returns An expression that gets the accumulated value
 *
 * @see [MapLibre Style Specification - accumulated](https://maplibre.org/maplibre-style-spec/expressions/#accumulated)
 */
export function accumulated() {
  return ["accumulated"] satisfies ExpressionSpecification
}

/**
 * Feature data expressions for MapLibre Style Specification.
 *
 * @see [MapLibre Style Specification - Feature Data](https://maplibre.org/maplibre-style-spec/expressions/#feature-data)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * // Get a property value
 * expr.featureData.get('name') // ['get', 'name']
 *
 * // Check if property exists
 * expr.featureData.has('population') // ['has', 'population']
 *
 * // Get feature id
 * expr.featureData.id() // ['id']
 * ```
 */
export const featureData = {
  properties,
  featureState,
  geometryType,
  id,
  accumulated,
  lineProgress,
} as const
