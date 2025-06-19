import type {
  Feature,
  ICanonicalTileID,
  Point2D,
} from "@maplibre/maplibre-gl-style-spec"

/**
 * The extent (size) of a tile in pixels.
 * This is the standard tile size used in Web Mercator tiling schemes.
 */
const EXTENT = 8192

/**
 * Converts a longitude value to Web Mercator X coordinate.
 *
 * This function transforms geographic longitude (in degrees) to the X coordinate
 * in the Web Mercator projection, normalized to the range [0, 1].
 *
 * @param lng - Longitude in degrees, typically in the range [-180, 180]
 * @returns X coordinate in Web Mercator projection, normalized to [0, 1]
 *
 * @example
 * ```typescript
 * const x = mercatorXfromLng(-122.4194); // San Francisco longitude
 * console.log(x); // ~0.1599
 * ```
 */
function mercatorXfromLng(lng: number): number {
  return (180 + lng) / 360
}

/**
 * Converts a latitude value to Web Mercator Y coordinate.
 *
 * This function transforms geographic latitude (in degrees) to the Y coordinate
 * in the Web Mercator projection, normalized to the range [0, 1].
 * The transformation uses the standard Web Mercator formula.
 *
 * @param lat - Latitude in degrees, typically in the range [-85.051129, 85.051129]
 * @returns Y coordinate in Web Mercator projection, normalized to [0, 1]
 *
 * @example
 * ```typescript
 * const y = mercatorYfromLat(37.7749); // San Francisco latitude
 * console.log(y); // ~0.4567
 * ```
 */
function mercatorYfromLat(lat: number): number {
  return (
    (180
      - (180 / Math.PI)
      * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)))
    / 360
  )
}

/**
 * Converts geographic coordinates to tile pixel coordinates.
 *
 * This function transforms a geographic position (longitude, latitude) to
 * pixel coordinates within a specific tile at a given zoom level.
 *
 * @param p - Geographic position as [longitude, latitude]
 * @param canonical - The canonical tile identifier containing zoom level and tile coordinates
 * @returns Pixel coordinates [x, y] within the tile
 *
 * @example
 * ```typescript
 * const tileCoords = getTileCoordinates(
 *   [-122.4194, 37.7749], // San Francisco
 *   { z: 10, x: 512, y: 256, ... } as ICanonicalTileID
 * );
 * console.log(tileCoords); // [x, y] pixel coordinates within the tile
 * ```
 */
function getTileCoordinates(
  p: GeoJSON.Position,
  canonical: ICanonicalTileID,
): [number, number] {
  const x = mercatorXfromLng(p[0])
  const y = mercatorYfromLat(p[1])
  const tilesAtZoom = 2 ** canonical.z
  return [
    Math.round(x * tilesAtZoom * EXTENT),
    Math.round(y * tilesAtZoom * EXTENT),
  ]
}

/**
 * Converts a geographic coordinate to a Point2D relative to the tile.
 *
 * This function transforms a geographic position to pixel coordinates
 * that are relative to the tile's origin, accounting for the tile's
 * position in the overall tiling scheme.
 *
 * @param coord - Geographic position as [longitude, latitude]
 * @param canonical - The canonical tile identifier
 * @returns Point2D with x, y coordinates relative to the tile
 *
 * @example
 * ```typescript
 * const point = getPoint(
 *   [-122.4194, 37.7749],
 *   { z: 10, x: 512, y: 256, ... } as ICanonicalTileID
 * );
 * console.log(point); // { x: 1234, y: 5678 }
 * ```
 */
function getPoint(
  coord: GeoJSON.Position,
  canonical: ICanonicalTileID,
): Point2D {
  const tileCoords = getTileCoordinates(coord, canonical)
  // shift to place the point relative to the tile
  const shifts = [canonical.x * EXTENT, canonical.y * EXTENT]
  const x = tileCoords[0] - shifts[0]
  const y = tileCoords[1] - shifts[1]
  return { x, y }
}

/**
 * Converts a single geographic coordinate to an array of Point2D objects.
 *
 * This is a wrapper function that converts a single coordinate to the
 * format expected by the geometry processing pipeline.
 *
 * @param coord - Geographic position as [longitude, latitude]
 * @param canonical - The canonical tile identifier
 * @returns Array containing a single Point2D object
 *
 * @example
 * ```typescript
 * const points = convertPoint([-122.4194, 37.7749], canonical);
 * console.log(points); // [{ x: 1234, y: 5678 }]
 * ```
 */
function convertPoint(
  coord: GeoJSON.Position,
  canonical: ICanonicalTileID,
): Point2D[] {
  return [getPoint(coord, canonical)]
}

/**
 * Converts multiple geographic coordinates to arrays of Point2D objects.
 *
 * This function processes an array of geographic coordinates, converting
 * each one to a Point2D and wrapping it in an array for the geometry pipeline.
 *
 * @param coords - Array of geographic positions as [longitude, latitude]
 * @param canonical - The canonical tile identifier
 * @returns Array of Point2D arrays, one for each input coordinate
 *
 * @example
 * ```typescript
 * const points = convertPoints([
 *   [-122.4194, 37.7749], // San Francisco
 *   [-74.0060, 40.7128],  // New York
 * ], canonical);
 * console.log(points); // [[{x: 1234, y: 5678}], [{x: 2345, y: 6789}]]
 * ```
 */
function convertPoints(
  coords: GeoJSON.Position[],
  canonical: ICanonicalTileID,
): Point2D[][] {
  return coords.map(c => convertPoint(c, canonical))
}

/**
 * Converts a line of geographic coordinates to Point2D objects.
 *
 * This function processes a LineString's coordinates, converting each
 * geographic position to a Point2D object.
 *
 * @param line - Array of geographic positions forming a line
 * @param canonical - The canonical tile identifier
 * @returns Array of Point2D objects representing the line
 *
 * @example
 * ```typescript
 * const line = convertLine([
 *   [-122.4194, 37.7749], // Start point
 *   [-122.4000, 37.7800], // End point
 * ], canonical);
 * console.log(line); // [{x: 1234, y: 5678}, {x: 2345, y: 6789}]
 * ```
 */
function convertLine(
  line: GeoJSON.Position[],
  canonical: ICanonicalTileID,
): Point2D[] {
  return line.map(c => getPoint(c, canonical))
}

/**
 * Converts multiple lines of geographic coordinates to Point2D objects.
 *
 * This function processes a MultiLineString's coordinates, converting each
 * line to an array of Point2D objects.
 *
 * @param lines - Array of coordinate arrays, each representing a line
 * @param canonical - The canonical tile identifier
 * @returns Array of Point2D arrays, one for each line
 *
 * @example
 * ```typescript
 * const lines = convertLines([
 *   [[-122.4194, 37.7749], [-122.4000, 37.7800]], // First line
 *   [[-74.0060, 40.7128], [-74.0000, 40.7100]],   // Second line
 * ], canonical);
 * console.log(lines); // [[{x: 1234, y: 5678}, {x: 2345, y: 6789}], ...]
 * ```
 */
function convertLines(
  lines: GeoJSON.Position[][],
  canonical: ICanonicalTileID,
): Point2D[][] {
  return lines.map(ln => convertLine(ln, canonical))
}

/**
 * Utility type that makes all properties of T mutable (removes readonly).
 *
 * This type is used to allow modification of Feature properties that
 * would otherwise be readonly.
 */
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
}

/**
 * Converts GeoJSON geometry to MapLibre's internal geometry format.
 *
 * This function transforms various GeoJSON geometry types into MapLibre's
 * internal Point2D format, which is optimized for rendering. The function
 * modifies the provided feature object in-place, setting its type and
 * geometry properties.
 *
 * The function supports all major GeoJSON geometry types:
 * - Point: Single point geometry
 * - MultiPoint: Multiple points (converted to Point type)
 * - LineString: Line geometry
 * - MultiLineString: Multiple lines (converted to LineString type)
 * - Polygon: Polygon geometry with optional holes
 * - MultiPolygon: Multiple polygons (converted to Polygon type)
 *
 * @param feature - The feature object to modify (must be mutable)
 * @param geometry - The GeoJSON geometry to convert
 * @param canonical - The canonical tile identifier for coordinate transformation
 *
 * @example
 * ```typescript
 * const feature: any = {};
 * const geometry: GeoJSON.Point = {
 *   type: "Point",
 *   coordinates: [-122.4194, 37.7749] // San Francisco
 * };
 * const canonical = { z: 10, x: 512, y: 256, ... } as ICanonicalTileID;
 *
 * getGeometry(feature, geometry, canonical);
 * console.log(feature.type); // "Point"
 * console.log(feature.geometry); // [[{ x: 1234, y: 5678 }]]
 * ```
 *
 * @example
 * ```typescript
 * // Converting a LineString
 * const feature: any = {};
 * const geometry: GeoJSON.LineString = {
 *   type: "LineString",
 *   coordinates: [
 *     [-122.4194, 37.7749],
 *     [-122.4000, 37.7800],
 *     [-122.3800, 37.7900]
 *   ]
 * };
 *
 * getGeometry(feature, geometry, canonical);
 * console.log(feature.type); // "LineString"
 * console.log(feature.geometry); // [[{ x: 1234, y: 5678 }, { x: 2345, y: 6789 }, ...]]
 * ```
 *
 * @example
 * ```typescript
 * // Converting a Polygon with holes
 * const feature: any = {};
 * const geometry: GeoJSON.Polygon = {
 *   type: "Polygon",
 *   coordinates: [
 *     [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]], // Outer ring
 *     [[2, 2], [8, 2], [8, 8], [2, 8], [2, 2]]      // Inner ring (hole)
 *   ]
 * };
 *
 * getGeometry(feature, geometry, canonical);
 * console.log(feature.type); // "Polygon"
 * console.log(feature.geometry.length); // 2 (outer ring + hole)
 * ```
 */
export function getGeometry(
  feature: Mutable<Feature>,
  geometry:
    | GeoJSON.MultiLineString
    | GeoJSON.LineString
    | GeoJSON.Point
    | GeoJSON.MultiPoint
    | GeoJSON.Polygon
    | GeoJSON.MultiPolygon,
  canonical: ICanonicalTileID,
): Mutable<Feature> {
  if (!geometry.coordinates) {
    return feature
  }
  feature.type = geometry.type
  feature.geometry = []
  switch (geometry.type) {
    case "Point":
      feature.geometry.push(convertPoint(geometry.coordinates, canonical))
      break
    case "MultiPoint":
      feature.type = "Point"
      feature.geometry.push(...convertPoints(geometry.coordinates, canonical))
      break
    case "LineString":
      feature.geometry.push(convertLine(geometry.coordinates, canonical))
      break
    case "MultiLineString":
      feature.type = "LineString"
      feature.geometry.push(...convertLines(geometry.coordinates, canonical))
      break
    case "Polygon":
      feature.geometry.push(...convertLines(geometry.coordinates, canonical))
      break
    case "MultiPolygon":
      feature.type = "Polygon"
      for (let i = 0; i < geometry.coordinates.length; i++) {
        const polygon: Point2D[][] = []
        polygon.push(...convertLines(geometry.coordinates[i], canonical))
        feature.geometry.push(...polygon)
      }
  }

  return feature
}
