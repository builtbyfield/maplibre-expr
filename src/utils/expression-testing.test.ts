import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

import { describe, expect, it } from "vitest"

import {
  createScenarioFeatures,
  createTestFeature,
  testExpressionComprehensive,
  testExpressionPerformance,
  testExpressionWithMultipleFeatures,
  testFilterExpression,
} from "./expression-testing"

describe("expression-testing", () => {
  describe("testExpressionComprehensive", () => {
    it("should validate and execute a simple property expression", () => {
      const feature = createTestFeature({ population: 1000000 })
      const result = testExpressionComprehensive({
        expression: ["get", "population"] as ExpressionSpecification,
        feature,
        expectedResult: 1000000,
        validationContext: "property",
        propertyKey: "circle-radius",
        propertyType: "paint",
        valueSpec: {
          "type": "number",
          "property-type": "data-driven",
          "transition": false,
          "default": 5,
        },
        testKey: "population-test",
      })

      expect(result.isValid).toBe(true)
      expect(result.executes).toBe(true)
      expect(result.matchesExpected).toBe(true)
      expect(result.validationErrors).toHaveLength(0)
      expect(result.actualResult).toBe(1000000)
      expect(result.summary).toContain("✅ Valid syntax")
      expect(result.summary).toContain("executes successfully")
      expect(result.summary).toContain("matches expected result")
    })

    it("should handle invalid expressions", () => {
      const result = testExpressionComprehensive({
        expression: ["invalid-operator", "value"] as any,
        validationContext: "property",
        propertyKey: "circle-radius",
        testKey: "invalid-test",
      })

      expect(result.isValid).toBe(false)
      expect(result.executes).toBe(false)
      expect(result.validationErrors.length).toBeGreaterThan(0)
      expect(result.summary).toContain("❌ Invalid syntax")
    })

    it("should handle filter expressions", () => {
      const feature = createTestFeature({ type: "restaurant" })
      const result = testExpressionComprehensive({
        expression: ["==", ["get", "type"], "restaurant"] as ExpressionSpecification,
        feature,
        expectedResult: true,
        validationContext: "filter",
        testKey: "filter-test",
      })

      expect(result.isValid).toBe(true)
      expect(result.executes).toBe(true)
      expect(result.matchesExpected).toBe(true)
    })

    it("should handle expressions without features", () => {
      const result = testExpressionComprehensive({
        expression: ["literal", "test"] as ExpressionSpecification,
        expectedResult: "test",
        testKey: "literal-test",
      })

      expect(result.isValid).toBe(true)
      expect(result.executes).toBe(false) // No feature provided
      expect(result.summary).toContain("no execution test")
    })

    it("should handle execution errors", () => {
      const feature = createTestFeature({})
      const result = testExpressionComprehensive({
        expression: ["get", "nonexistent"] as ExpressionSpecification,
        feature,
        expectedResult: null, // MapLibre returns null for missing properties
        testKey: "missing-property-test",
      })

      expect(result.isValid).toBe(true)
      expect(result.executes).toBe(true)
      expect(result.actualResult).toBeNull()
      expect(result.matchesExpected).toBe(true)
    })

    it("should handle result mismatches", () => {
      const feature = createTestFeature({ population: 1000000 })
      const result = testExpressionComprehensive({
        expression: ["get", "population"] as ExpressionSpecification,
        feature,
        expectedResult: 500000, // Wrong expected value
        testKey: "mismatch-test",
      })

      expect(result.isValid).toBe(true)
      expect(result.executes).toBe(true)
      expect(result.matchesExpected).toBe(false)
      expect(result.summary).toContain("result mismatch")
    })
  })

  describe("testExpressionWithMultipleFeatures", () => {
    it("should test expression against multiple features", () => {
      const expression: ExpressionSpecification = ["get", "population"]
      const testCases = [
        {
          feature: createTestFeature({ population: 1000000 }),
          expectedResult: 1000000,
          description: "large-city",
        },
        {
          feature: createTestFeature({ population: 50000 }),
          expectedResult: 50000,
          description: "small-city",
        },
        {
          feature: createTestFeature({}),
          expectedResult: null, // MapLibre returns null for missing properties
          description: "no-population",
        },
      ]

      const results = testExpressionWithMultipleFeatures(
        expression,
        testCases,
        {
          validationContext: "property",
          propertyKey: "circle-radius",
          propertyType: "paint",
          valueSpec: {
            "type": "number",
            "property-type": "data-driven",
            "transition": false,
            "default": 5,
          },
        },
      )

      expect(results).toHaveLength(3)
      expect(results[0].isValid).toBe(true)
      expect(results[0].matchesExpected).toBe(true)
      expect(results[1].isValid).toBe(true)
      expect(results[1].matchesExpected).toBe(true)
      expect(results[2].isValid).toBe(true)
      expect(results[2].matchesExpected).toBe(true)
    })

    it("should handle validation errors across all test cases", () => {
      const invalidExpression = ["invalid-operator"] as any
      const testCases = [
        {
          feature: createTestFeature({}),
          expectedResult: undefined,
          description: "test",
        },
      ]

      const results = testExpressionWithMultipleFeatures(
        invalidExpression,
        testCases,
      )

      expect(results[0].isValid).toBe(false)
      expect(results[0].validationErrors.length).toBeGreaterThan(0)
    })
  })

  describe("testFilterExpression", () => {
    it("should test filter expressions correctly", () => {
      const filterExpression: ExpressionSpecification = ["==", ["get", "type"], "restaurant"]
      const testCases = [
        {
          feature: createTestFeature({ type: "restaurant" }),
          shouldPass: true,
          description: "restaurant-feature",
        },
        {
          feature: createTestFeature({ type: "building" }),
          shouldPass: false,
          description: "building-feature",
        },
        {
          feature: createTestFeature({}),
          shouldPass: false,
          description: "no-type",
        },
      ]

      const results = testFilterExpression(filterExpression, testCases)

      expect(results).toHaveLength(3)
      expect(results[0].isValid).toBe(true)
      expect(results[0].matchesExpected).toBe(true)
      expect(results[1].isValid).toBe(true)
      expect(results[1].matchesExpected).toBe(true)
      expect(results[2].isValid).toBe(true)
      expect(results[2].matchesExpected).toBe(true)
    })

    it("should handle invalid filter expressions", () => {
      const invalidFilter = ["invalid-operator"] as any
      const testCases = [
        {
          feature: createTestFeature({}),
          shouldPass: false,
          description: "test",
        },
      ]

      const results = testFilterExpression(invalidFilter, testCases)

      expect(results).toHaveLength(1)
      expect(results[0].isValid).toBe(false)
    })

    it("should handle complex filter expressions", () => {
      const complexFilter: ExpressionSpecification = [
        "all",
        ["==", ["get", "type"], "restaurant"],
        [">", ["get", "rating"], 4],
      ]
      const testCases = [
        {
          feature: createTestFeature({ type: "restaurant", rating: 4.5 }),
          shouldPass: true,
          description: "high-rated-restaurant",
        },
        {
          feature: createTestFeature({ type: "restaurant", rating: 3.5 }),
          shouldPass: false,
          description: "low-rated-restaurant",
        },
        {
          feature: createTestFeature({ type: "building", rating: 5 }),
          shouldPass: false,
          description: "high-rated-building",
        },
      ]

      const results = testFilterExpression(complexFilter, testCases)

      expect(results).toHaveLength(3)
      results.forEach((result) => {
        expect(result.isValid).toBe(true)
        expect(result.matchesExpected).toBe(true)
      })
    })
  })

  describe("testExpressionPerformance", () => {
    it("should measure expression performance", () => {
      const expression: ExpressionSpecification = ["get", "population"]
      const feature = createTestFeature({ population: 1000000 })

      const result = testExpressionPerformance(expression, feature, 100)

      expect(result.averageTime).toBeGreaterThan(0)
      expect(result.totalTime).toBeGreaterThan(0)
      expect(result.iterations).toBe(100)
      expect(result.expression).toEqual(expression)
    })

    it("should handle complex expressions", () => {
      const complexExpression: ExpressionSpecification = [
        "case",
        [">", ["get", "population"], 1000000],
        "red",
        [">", ["get", "population"], 100000],
        "orange",
        "blue",
      ]
      const feature = createTestFeature({ population: 500000 })

      const result = testExpressionPerformance(complexExpression, feature, 50)

      expect(result.averageTime).toBeGreaterThan(0)
      expect(result.totalTime).toBeGreaterThan(0)
      expect(result.iterations).toBe(50)
    })

    it("should throw error for invalid expressions", () => {
      const invalidExpression = ["invalid-operator"] as any
      const feature = createTestFeature({})

      expect(() => {
        testExpressionPerformance(invalidExpression, feature, 10)
      }).toThrow("Expression parsing failed")
    })
  })

  describe("createTestFeature", () => {
    it("should create a feature with default geometry", () => {
      const feature = createTestFeature({ population: 1000000 })

      expect(feature).toEqual({
        type: "Feature",
        geometry: { type: "Point", coordinates: [0, 0] },
        properties: { population: 1000000 },
      })
    })

    it("should create a feature with custom geometry", () => {
      const customGeometry = { type: "LineString" as const, coordinates: [[0, 0], [1, 1]] }
      const feature = createTestFeature({ type: "road" }, customGeometry)

      expect(feature.geometry).toEqual(customGeometry)
      expect(feature.properties).toEqual({ type: "road" })
    })

    it("should handle empty properties", () => {
      const feature = createTestFeature({})

      expect(feature.properties).toEqual({})
      expect(feature.type).toBe("Feature")
    })
  })

  describe("createScenarioFeatures", () => {
    it("should create population variety features", () => {
      const features = createScenarioFeatures("population-variety")

      expect(features).toHaveLength(5)
      expect(features[0].properties).toEqual({ population: 1000, type: "village" })
      expect(features[1].properties).toEqual({ population: 10000, type: "town" })
      expect(features[2].properties).toEqual({ population: 100000, type: "city" })
      expect(features[3].properties).toEqual({ population: 1000000, type: "metropolis" })
      expect(features[4].properties).toEqual({ type: "park" })
    })

    it("should create type variety features", () => {
      const features = createScenarioFeatures("type-variety")

      expect(features).toHaveLength(5)
      expect(features[0].properties).toEqual({ type: "restaurant", cuisine: "italian" })
      expect(features[1].properties).toEqual({ type: "restaurant", cuisine: "chinese" })
      expect(features[2].properties).toEqual({ type: "building", height: 50 })
      expect(features[3].properties).toEqual({ type: "park", area: 1000 })
      expect(features[4].properties).toEqual({ type: "road", lanes: 4 })
    })

    it("should create numeric properties features", () => {
      const features = createScenarioFeatures("numeric-properties")

      expect(features).toHaveLength(4)
      expect(features[0].properties).toEqual({ value: 0, category: "low" })
      expect(features[1].properties).toEqual({ value: 50, category: "medium" })
      expect(features[2].properties).toEqual({ value: 100, category: "high" })
      expect(features[3].properties).toEqual({ value: -10, category: "negative" })
    })

    it("should return default feature for unknown scenario", () => {
      const features = createScenarioFeatures("unknown-scenario" as any)

      expect(features).toHaveLength(1)
      expect(features[0].properties).toEqual({})
    })
  })

  describe("integration tests", () => {
    it("should work with real-world expressions", () => {
      const features = createScenarioFeatures("population-variety")
      const expression: ExpressionSpecification = [
        "case",
        [">=", ["get", "population"], 1000000],
        "#ff0000",
        [">=", ["get", "population"], 100000],
        "#ff8800",
        [">=", ["get", "population"], 10000],
        "#ffff00",
        "#00ff00",
      ]

      const results = testExpressionWithMultipleFeatures(
        expression,
        features.map((feature, index) => ({
          feature,
          expectedResult: index === 3 ? "#ff0000" : index === 2 ? "#ff8800" : index === 1 ? "#ffff00" : "#00ff00",
          description: `feature-${index}`,
        })),
        {
          validationContext: "property",
          propertyKey: "circle-color",
          propertyType: "paint",
          valueSpec: {
            "type": "color",
            "property-type": "data-driven",
            "transition": false,
            "default": "#000000",
            "overridable": false,
          },
        },
      )

      expect(results).toHaveLength(5)
      // Based on population values: 1000, 10000, 100000, 1000000, undefined
      // Case expression should return: #00ff00, #ffff00, #ff8800, #ff0000, null
      results.forEach((result, index) => {
        expect(result.isValid).toBe(true)
        if (index === 4) {
          // Park feature has no population, so it returns null
          expect(result.actualResult).toBeNull()
        }
        else {
          // Check the actual result matches what we expect from the case expression
          const expectedColor = index === 3 ? "#ff0000" : index === 2 ? "#ff8800" : index === 1 ? "#ffff00" : "#00ff00"
          expect(result.actualResult).toBe(expectedColor)
        }
      })
    })

    it("should handle zoom-based expressions", () => {
      const feature = createTestFeature({ population: 1000000 })
      const expression: ExpressionSpecification = [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        5,
        10,
        20,
      ]

      const result = testExpressionComprehensive({
        expression,
        feature,
        expectedResult: 5, // At zoom level 0
        globalProperties: { zoom: 0 },
        // Don't use property context for zoom expressions - they're not always supported
        testKey: "zoom-interpolation",
      })

      expect(result.isValid).toBe(true)
      expect(result.executes).toBe(true)
      expect(result.matchesExpected).toBe(true)
    })
  })
})
