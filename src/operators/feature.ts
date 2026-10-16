import type { Expr, StringInput } from "../expr"

import { op } from "../internal"

/**
 * The feature's properties object. Prefer {@link get} for single properties.
 * MapLibre `properties`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#properties
 */
export function properties(): Expr<Record<string, unknown>> {
  return op("properties")
}

/**
 * A value from the feature's state, set at runtime with
 * `map.setFeatureState(feature, { hover: true })`. Evaluates to `null` if
 * unset. Only allowed in paint properties (not layout or filters).
 * MapLibre `feature-state`.
 *
 * Untyped by default, like {@link get}; pin the type with
 * `featureState<boolean>("hover")`.
 *
 * The style spec lists it as not yet supported in MapLibre Native; see
 * https://github.com/maplibre/maplibre-native/issues/1698.
 *
 * @example case_([[boolean(featureState("hover"), false), "#f00"]], "#888")
 * @see https://maplibre.org/maplibre-style-spec/expressions/#feature-state
 */
export function featureState<T = any>(property: StringInput): Expr<NoInfer<T>> {
  return op("feature-state", property)
}

/**
 * The feature's geometry type: `"Point"`, `"LineString"` or `"Polygon"`
 * (`Multi*` geometries report their single counterpart).
 * MapLibre `geometry-type`.
 *
 * @example eq(geometryType(), "Polygon")
 * @see https://maplibre.org/maplibre-style-spec/expressions/#geometry-type
 */
export function geometryType(): Expr<"Point" | "LineString" | "Polygon"> {
  return op("geometry-type")
}

/**
 * The feature's id, or `null`. MapLibre `id`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#id
 */
export function id(): Expr<string | number | null> {
  return op("id")
}

/**
 * Progress (0-1) along a line. Only allowed in `line-gradient`, on a GeoJSON
 * source with `lineMetrics: true`. MapLibre `line-progress`.
 *
 * @example interpolate(linear(), lineProgress(), [[0, "blue"], [1, "red"]])
 * @see https://maplibre.org/maplibre-style-spec/expressions/#line-progress
 */
export function lineProgress(): Expr<number> {
  return op("line-progress")
}

/**
 * The value accumulated so far in a cluster property. Only allowed in a
 * GeoJSON source's `clusterProperties` reduce expression.
 * MapLibre `accumulated`.
 *
 * @example clusterProperties: { sum: [add(accumulated(), get("sum")), get("value")] }
 * @see https://maplibre.org/maplibre-style-spec/expressions/#accumulated
 */
export function accumulated<T = any>(): Expr<NoInfer<T>> {
  return op("accumulated")
}

/**
 * The current zoom level. In layout and paint properties it may only appear
 * as the input of a top-level {@link interpolate} or {@link step}.
 * MapLibre `zoom`.
 *
 * @example interpolate(linear(), zoom(), [[10, 1], [16, 6]])
 * @see https://maplibre.org/maplibre-style-spec/expressions/#zoom_1
 */
export function zoom(): Expr<number> {
  return op("zoom")
}

/**
 * Heatmap density (0-1) at the current pixel. Only allowed in
 * `heatmap-color`. MapLibre `heatmap-density`.
 *
 * @example interpolate(linear(), heatmapDensity(), [[0, "rgba(0,0,255,0)"], [1, "red"]])
 * @see https://maplibre.org/maplibre-style-spec/expressions/#heatmap-density
 */
export function heatmapDensity(): Expr<number> {
  return op("heatmap-density")
}

/**
 * Terrain elevation in meters at the current pixel. Only allowed in
 * `color-relief-color`. MapLibre `elevation`.
 *
 * Requires MapLibre GL JS 5.6+.
 *
 * @example interpolate(linear(), elevation(), [[0, "#0a0"], [3000, "#fff"]])
 * @see https://maplibre.org/maplibre-style-spec/expressions/#elevation
 */
export function elevation(): Expr<number> {
  return op("elevation")
}
