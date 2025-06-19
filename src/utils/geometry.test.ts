import type { ICanonicalTileID } from "@maplibre/maplibre-gl-style-spec"

import { describe, expect, it } from "vitest"

import { getGeometry } from "./geometry"

// Helper function to create a mock canonical tile ID
function createCanonicalTileID(z: number, x: number, y: number): ICanonicalTileID {
  return {
    z,
    x,
    y,
    key: `${z}/${x}/${y}`,
    equals: () => false,
    url: () => "",
    getTilePoint: () => ({ x: 0, y: 0 }),
    toString: () => `${z}/${x}/${y}`,
    isChildOf: () => false,
  }
}

describe("getGeometry", () => {
  const canonical = createCanonicalTileID(10, 512, 256) // Zoom 10, tile coordinates

  describe("point geometry", () => {
    it("should convert Point geometry correctly", () => {
      const feature: any = {}
      const geometry: GeoJSON.Point = {
        type: "Point",
        coordinates: [-122.4194, 37.7749], // San Francisco
      }

      getGeometry(feature, geometry, canonical)

      expect(feature.type).toBe("Point")
      expect(feature.geometry).toHaveLength(1)
      expect(feature.geometry[0]).toHaveLength(1)
      expect(feature.geometry[0][0]).toHaveProperty("x")
      expect(feature.geometry[0][0]).toHaveProperty("y")
      expect(typeof feature.geometry[0][0].x).toBe("number")
      expect(typeof feature.geometry[0][0].y).toBe("number")
    })

    it("should handle Point at origin", () => {
      const feature: any = {}
      const geometry: GeoJSON.Point = {
        type: "Point",
        coordinates: [0, 0],
      }

      getGeometry(feature, geometry, canonical)

      expect(feature.type).toBe("Point")
      expect(feature.geometry).toHaveLength(1)
      expect(feature.geometry[0]).toHaveLength(1)
    })
  })

  describe("multiPoint geometry", () => {
    it("should convert MultiPoint geometry correctly", () => {
      const feature: any = {}
      const geometry: GeoJSON.MultiPoint = {
        type: "MultiPoint",
        coordinates: [
          [-122.4194, 37.7749], // San Francisco
          [-74.0060, 40.7128], // New York
          [2.3522, 48.8566], // Paris
        ],
      }

      getGeometry(feature, geometry, canonical)

      expect(feature.type).toBe("Point") // MultiPoint gets converted to Point
      expect(feature.geometry).toHaveLength(3)
      feature.geometry.forEach((pointGroup: any) => {
        expect(pointGroup).toHaveLength(1)
        expect(pointGroup[0]).toHaveProperty("x")
        expect(pointGroup[0]).toHaveProperty("y")
      })
    })

    it("should handle empty MultiPoint", () => {
      const feature: any = {}
      const geometry: GeoJSON.MultiPoint = {
        type: "MultiPoint",
        coordinates: [],
      }

      getGeometry(feature, geometry, canonical)

      expect(feature.type).toBe("Point")
      expect(feature.geometry).toHaveLength(0)
    })
  })

  describe("lineString geometry", () => {
    it("should convert LineString geometry correctly", () => {
      const feature: any = {}
      const geometry: GeoJSON.LineString = {
        type: "LineString",
        coordinates: [
          [-122.4194, 37.7749], // San Francisco
          [-122.4000, 37.7800], // Nearby point
          [-122.3800, 37.7900], // Another point
        ],
      }

      getGeometry(feature, geometry, canonical)

      expect(feature.type).toBe("LineString")
      expect(feature.geometry).toHaveLength(1)
      expect(feature.geometry[0]).toHaveLength(3)
      feature.geometry[0].forEach((point: any) => {
        expect(point).toHaveProperty("x")
        expect(point).toHaveProperty("y")
      })
    })

    it("should handle LineString with two points", () => {
      const feature: any = {}
      const geometry: GeoJSON.LineString = {
        type: "LineString",
        coordinates: [
          [0, 0],
          [1, 1],
        ],
      }

      getGeometry(feature, geometry, canonical)

      expect(feature.type).toBe("LineString")
      expect(feature.geometry).toHaveLength(1)
      expect(feature.geometry[0]).toHaveLength(2)
    })
  })

  describe("multiLineString geometry", () => {
    it("should convert MultiLineString geometry correctly", () => {
      const feature: any = {}
      const geometry: GeoJSON.MultiLineString = {
        type: "MultiLineString",
        coordinates: [
          [
            [-122.4194, 37.7749],
            [-122.4000, 37.7800],
          ],
          [
            [-74.0060, 40.7128],
            [-74.0000, 40.7100],
          ],
        ],
      }

      getGeometry(feature, geometry, canonical)

      expect(feature.type).toBe("LineString") // MultiLineString gets converted to LineString
      expect(feature.geometry).toHaveLength(2)
      expect(feature.geometry[0]).toHaveLength(2)
      expect(feature.geometry[1]).toHaveLength(2)
    })

    it("should handle empty MultiLineString", () => {
      const feature: any = {}
      const geometry: GeoJSON.MultiLineString = {
        type: "MultiLineString",
        coordinates: [],
      }

      getGeometry(feature, geometry, canonical)

      expect(feature.type).toBe("LineString")
      expect(feature.geometry).toHaveLength(0)
    })
  })

  describe("polygon geometry", () => {
    it("should convert Polygon geometry correctly", () => {
      const feature: any = {}
      const geometry: GeoJSON.Polygon = {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0], // Closing point
          ],
        ],
      }

      getGeometry(feature, geometry, canonical)

      expect(feature.type).toBe("Polygon")
      expect(feature.geometry).toHaveLength(1)
      expect(feature.geometry[0]).toHaveLength(5)
    })

    it("should handle Polygon with holes", () => {
      const feature: any = {}
      const geometry: GeoJSON.Polygon = {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0],
          ],
          [
            [2, 2],
            [8, 2],
            [8, 8],
            [2, 8],
            [2, 2],
          ],
        ],
      }

      getGeometry(feature, geometry, canonical)

      expect(feature.type).toBe("Polygon")
      expect(feature.geometry).toHaveLength(2)
      expect(feature.geometry[0]).toHaveLength(5) // Outer ring
      expect(feature.geometry[1]).toHaveLength(5) // Inner ring (hole)
    })
  })

  describe("multiPolygon geometry", () => {
    it("should convert MultiPolygon geometry correctly", () => {
      const feature: any = {}
      const geometry: GeoJSON.MultiPolygon = {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
          [
            [
              [10, 10],
              [11, 10],
              [11, 11],
              [10, 11],
              [10, 10],
            ],
          ],
        ],
      }

      getGeometry(feature, geometry, canonical)

      expect(feature.type).toBe("Polygon") // MultiPolygon gets converted to Polygon
      expect(feature.geometry).toHaveLength(2)
      expect(feature.geometry[0]).toHaveLength(5) // First polygon
      expect(feature.geometry[1]).toHaveLength(5) // Second polygon
    })

    it("should handle MultiPolygon with holes", () => {
      const feature: any = {}
      const geometry: GeoJSON.MultiPolygon = {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [0, 0],
              [10, 0],
              [10, 10],
              [0, 10],
              [0, 0],
            ],
            [
              [2, 2],
              [8, 2],
              [8, 8],
              [2, 8],
              [2, 2],
            ],
          ],
        ],
      }

      getGeometry(feature, geometry, canonical)

      expect(feature.type).toBe("Polygon")
      expect(feature.geometry).toHaveLength(2)
      expect(feature.geometry[0]).toHaveLength(5) // Outer ring
      expect(feature.geometry[1]).toHaveLength(5) // Inner ring (hole)
    })
  })

  describe("edge cases", () => {
    it("should handle geometry without coordinates", () => {
      const feature: any = { type: "original", geometry: "original" }
      const geometry: any = {
        type: "Point",
        coordinates: null,
      }

      getGeometry(feature, geometry, canonical)

      // Should not modify the feature when coordinates are missing
      expect(feature.type).toBe("original")
      expect(feature.geometry).toBe("original")
    })

    it("should handle geometry with undefined coordinates", () => {
      const feature: any = { type: "original", geometry: "original" }
      const geometry: any = {
        type: "Point",
        coordinates: undefined,
      }

      getGeometry(feature, geometry, canonical)

      // Should not modify the feature when coordinates are undefined
      expect(feature.type).toBe("original")
      expect(feature.geometry).toBe("original")
    })

    it("should handle different zoom levels", () => {
      const feature: any = {}
      const geometry: GeoJSON.Point = {
        type: "Point",
        coordinates: [0, 0],
      }

      // Test with different zoom levels
      const canonicalZoom0 = createCanonicalTileID(0, 0, 0)
      const canonicalZoom15 = createCanonicalTileID(15, 16384, 8192)

      getGeometry(feature, geometry, canonicalZoom0)
      const resultZoom0 = feature.geometry[0][0]

      // Reset feature
      feature.type = undefined
      feature.geometry = []

      getGeometry(feature, geometry, canonicalZoom15)
      const resultZoom15 = feature.geometry[0][0]

      // Results should be different due to different zoom levels
      expect(resultZoom0.x).not.toBe(resultZoom15.x)
      expect(resultZoom0.y).not.toBe(resultZoom15.y)
    })

    it("should handle different tile coordinates", () => {
      const feature: any = {}
      const geometry: GeoJSON.Point = {
        type: "Point",
        coordinates: [0, 0],
      }

      // Test with different tile coordinates at same zoom
      const canonical1 = createCanonicalTileID(10, 512, 256)
      const canonical2 = createCanonicalTileID(10, 513, 257)

      getGeometry(feature, geometry, canonical1)
      const result1 = feature.geometry[0][0]

      // Reset feature
      feature.type = undefined
      feature.geometry = []

      getGeometry(feature, geometry, canonical2)
      const result2 = feature.geometry[0][0]

      // Results should be different due to different tile coordinates
      expect(result1.x).not.toBe(result2.x)
      expect(result1.y).not.toBe(result2.y)
    })
  })

  describe("coordinate transformation accuracy", () => {
    it("should transform coordinates consistently", () => {
      const feature: any = {}
      const geometry: GeoJSON.Point = {
        type: "Point",
        coordinates: [-122.4194, 37.7749], // San Francisco
      }

      getGeometry(feature, geometry, canonical)

      const point = feature.geometry[0][0]

      // Coordinates should be finite numbers
      expect(Number.isFinite(point.x)).toBe(true)
      expect(Number.isFinite(point.y)).toBe(true)

      // Coordinates should be reasonable values (not NaN, not infinite)
      expect(point.x).not.toBeNaN()
      expect(point.y).not.toBeNaN()
      expect(point.x).not.toBe(Infinity)
      expect(point.y).not.toBe(-Infinity)
    })

    it("should handle extreme coordinates", () => {
      const feature: any = {}
      const geometry: GeoJSON.Point = {
        type: "Point",
        coordinates: [180, 90], // Maximum longitude and latitude
      }

      getGeometry(feature, geometry, canonical)

      const point = feature.geometry[0][0]
      expect(Number.isFinite(point.x)).toBe(true)
      expect(Number.isFinite(point.y)).toBe(true)
    })
  })
})
