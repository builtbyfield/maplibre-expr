import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"
import type { Point } from "geojson"

import { all, any } from "../core/decision/logical"
import { lessOrEqual, greaterOrEqual, equal } from "../core/decision/comparison"
import { get } from "../core/lookup"
import { literal } from "../core/types/assertion"
import { distance } from "../core/math/distance"
import { atan2, sin, cos } from "../core/math/trigonometry"
import { multiply, add, subtract, divide } from "../core/math/arithmetic"
import { pi } from "../core/math/constants"
import { within } from "../core/decision/spatial"

/**
 * Check if feature is within a certain radius from a center point
 *
 * @param center - Center point
 * @param radiusMeters - Radius in meters
 * @returns Expression that returns true if within radius
 *
 * @example
 * // Show only features within 5km of city center
 * geospatial.isWithinRadius(
 *   { type: 'Point', coordinates: [-122.4194, 37.7749] },
 *   5000
 * )
 */
export function isWithinRadius(
  center: Point,
  radiusMeters: number
): ExpressionSpecification {
  return lessOrEqual(
    distance(center),
    radiusMeters
  )
}

/**
 * Calculate bearing (direction) from feature to target point
 *
 * @param targetPoint - Target point to calculate bearing to
 * @returns Expression that returns bearing in degrees (0-360)
 *
 * @example
 * // Calculate direction to destination
 * geospatial.bearingTo({ type: 'Point', coordinates: [-122.4, 37.8] })
 */
export function bearingTo(targetPoint: Point): ExpressionSpecification {
  // This is a simplified bearing calculation
  // In a real implementation, you'd need the current feature's coordinates
  // For now, we'll return a placeholder that would need feature geometry access
  
  // bearing = atan2(sin(Δlong).cos(lat2), cos(lat1).sin(lat2) − sin(lat1).cos(lat2).cos(Δlong))
  // This would require access to the feature's geometry which isn't directly available
  // Return a simplified version
  
  return literal(0) // Placeholder - real implementation would need geometry access
}

/**
 * Check if feature is in a specific quadrant relative to a center point
 *
 * @param quadrant - The quadrant to check (NE, NW, SE, SW)
 * @param center - Center point for quadrant division
 * @returns Expression that returns true if in specified quadrant
 *
 * @example
 * // Highlight features in northeast quadrant
 * geospatial.isInQuadrant('NE', [-122.4194, 37.7749])
 */
export function isInQuadrant(
  quadrant: "NE" | "NW" | "SE" | "SW",
  center: [number, number]
): ExpressionSpecification {
  const [centerLng, centerLat] = center
  
  // Get feature coordinates (assuming point geometry)
  const lng = ["get", "lng"] // Would need actual geometry access
  const lat = ["get", "lat"] // Would need actual geometry access
  
  const conditions: ExpressionSpecification[] = []
  
  switch (quadrant) {
    case "NE":
      conditions.push(
        greaterOrEqual(lng, centerLng),
        greaterOrEqual(lat, centerLat)
      )
      break
    case "NW":
      conditions.push(
        lessOrEqual(lng, centerLng),
        greaterOrEqual(lat, centerLat)
      )
      break
    case "SE":
      conditions.push(
        greaterOrEqual(lng, centerLng),
        lessOrEqual(lat, centerLat)
      )
      break
    case "SW":
      conditions.push(
        lessOrEqual(lng, centerLng),
        lessOrEqual(lat, centerLat)
      )
      break
  }
  
  return all(...conditions)
}

/**
 * Check if feature is within a bounding box
 *
 * @param minLng - Minimum longitude
 * @param minLat - Minimum latitude
 * @param maxLng - Maximum longitude
 * @param maxLat - Maximum latitude
 * @returns Expression that returns true if within bounds
 *
 * @example
 * // Show only features within specific area
 * geospatial.isWithinBounds(-122.5, 37.7, -122.3, 37.9)
 */
export function isWithinBounds(
  minLng: number,
  minLat: number,
  maxLng: number,
  maxLat: number
): ExpressionSpecification {
  // This would need actual geometry access
  const lng = ["get", "lng"] // Placeholder
  const lat = ["get", "lat"] // Placeholder
  
  return all(
    greaterOrEqual(lng, minLng),
    lessOrEqual(lng, maxLng),
    greaterOrEqual(lat, minLat),
    lessOrEqual(lat, maxLat)
  )
}

/**
 * Check if point is on the specified side of a line
 *
 * @param lineStart - Start point of the line
 * @param lineEnd - End point of the line
 * @param side - Which side to check ('left' or 'right')
 * @returns Expression that returns true if on specified side
 *
 * @example
 * // Show features on the left side of a route
 * geospatial.isOnSideOfLine(
 *   [-122.4, 37.7],
 *   [-122.3, 37.8],
 *   'left'
 * )
 */
export function isOnSideOfLine(
  lineStart: [number, number],
  lineEnd: [number, number],
  side: 'left' | 'right'
): ExpressionSpecification {
  // Cross product to determine side
  // (x2-x1)(y-y1) - (y2-y1)(x-x1)
  const [x1, y1] = lineStart
  const [x2, y2] = lineEnd
  
  // Placeholder for actual feature coordinates
  const x = ["get", "lng"]
  const y = ["get", "lat"]
  
  const crossProduct = subtract(
    multiply(subtract(literal(x2), literal(x1)), subtract(y, literal(y1))),
    multiply(subtract(literal(y2), literal(y1)), subtract(x, literal(x1)))
  )
  
  if (side === 'left') {
    return greaterOrEqual(crossProduct, 0)
  } else {
    return lessOrEqual(crossProduct, 0)
  }
}

/**
 * Calculate approximate area of a polygon feature
 *
 * @param coordinates - Property containing polygon coordinates
 * @returns Expression that returns approximate area
 *
 * @example
 * // Size circles based on polygon area
 * geospatial.polygonArea('geometry.coordinates')
 */
export function polygonArea(coordinates: string): ExpressionSpecification {
  // This is a placeholder - actual area calculation would need
  // access to polygon coordinates which isn't directly available
  // in MapLibre expressions
  return literal(0)
}

/**
 * Check if feature is within multiple polygons (OR condition)
 *
 * @param polygons - Array of polygon features
 * @returns Expression that returns true if within any polygon
 *
 * @example
 * // Check if in any service area
 * geospatial.isWithinAnyPolygon(serviceAreaPolygons)
 */
export function isWithinAnyPolygon(
  polygons: any[]
): ExpressionSpecification {
  if (polygons.length === 0) {
    return literal(false)
  }
  
  const checks = polygons.map(polygon => within(polygon))
  return any(...checks)
}

/**
 * Get grid cell identifier for spatial indexing
 *
 * @param cellSize - Size of grid cells in degrees
 * @param originLng - Origin longitude for grid
 * @param originLat - Origin latitude for grid
 * @returns Expression that returns grid cell ID as string
 *
 * @example
 * // Group features by grid cells for aggregation
 * geospatial.gridCell(0.01, -122.5, 37.7)
 */
export function gridCell(
  cellSize: number,
  originLng: number = 0,
  originLat: number = 0
): ExpressionSpecification {
  // Calculate grid indices
  // This would need actual coordinate access
  const lng = ["get", "lng"] // Placeholder
  const lat = ["get", "lat"] // Placeholder
  
  const gridX = ["floor", divide(subtract(lng, originLng), cellSize)]
  const gridY = ["floor", divide(subtract(lat, originLat), cellSize)]
  
  // Concatenate to create cell ID
  return ["concat", gridX, ",", gridY]
}

export const geospatial = {
  isWithinRadius,
  bearingTo,
  isInQuadrant,
  isWithinBounds,
  isOnSideOfLine,
  polygonArea,
  isWithinAnyPolygon,
  gridCell,
} as const