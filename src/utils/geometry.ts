import type {
  Feature,
  ICanonicalTileID,
  Point2D,
} from "@maplibre/maplibre-gl-style-spec"

const EXTENT = 8192

function mercatorXfromLng(lng: number): number {
  return (180 + lng) / 360
}

function mercatorYfromLat(lat: number): number {
  return (
    (180
      - (180 / Math.PI)
      * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)))
    / 360
  )
}

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

function convertPoint(
  coord: GeoJSON.Position,
  canonical: ICanonicalTileID,
): Point2D[] {
  return [getPoint(coord, canonical)]
}

function convertPoints(
  coords: GeoJSON.Position[],
  canonical: ICanonicalTileID,
): Point2D[][] {
  return coords.map(c => convertPoint(c, canonical))
}

function convertLine(
  line: GeoJSON.Position[],
  canonical: ICanonicalTileID,
): Point2D[] {
  return line.map(c => getPoint(c, canonical))
}

function convertLines(
  lines: GeoJSON.Position[][],
  canonical: ICanonicalTileID,
): Point2D[][] {
  return lines.map(ln => convertLine(ln, canonical))
}

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
}

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
): void {
  if (!geometry.coordinates) {
    return
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
}
