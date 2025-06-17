import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

type DistanceGeometry = GeoJSON.Point | GeoJSON.MultiPoint | GeoJSON.LineString | GeoJSON.MultiLineString | GeoJSON.Polygon | GeoJSON.MultiPolygon | GeoJSON.Feature | GeoJSON.FeatureCollection

/**
 * Returns the shortest distance in meters between the evaluated feature and the
 * input geometry. The input value can be a valid GeoJSON of type `Point`,
 * `MultiPoint`, `LineString`, `MultiLineString`, `Polygon`, `MultiPolygon`,
 * `Feature`, or `FeatureCollection`.
 *
 * Distance values returned may vary in precision due to loss in precision from
 * encoding geometries, particularly below zoom level 13.
 *
 * @param geometry - The GeoJSON geometry to calculate distance to.
 * @returns An expression that returns the distance in meters.
 *
 * @see [MapLibre Style Specification - distance](https://maplibre.org/maplibre-style-spec/expressions/#distance)
 *
 * @example
 * ```ts
 * expr.distance({ type: "Point", coordinates: [0, 0] }); // ["distance", {"type": "Point", "coordinates": [0, 0]}]
 * ```
 */
export function distance(
  geometry: DistanceGeometry,
): ["distance", DistanceGeometry] {
  return ["distance", geometry] satisfies ExpressionSpecification
}
