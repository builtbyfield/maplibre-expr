import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { testExpressionValue, testExpressionCompilation } from "../../utils/test-utils"
import { valueComparison } from "./comparison"

describe("math", () => {
  describe("comparison", () => {
    describe("compilation", () => {
      describe("min", () => {
        it("should compile to a min expression", () => {
          const expression = valueComparison.min([1, 2, 3])
          const compiled = [
            "min",
            1,
            2,
            3,
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })

        it("should compile with expressions as arguments", () => {
          const expression = valueComparison.min([
            ["get", "a"],
            ["get", "b"],
          ])
          const compiled = [
            "min",
            ["get", "a"],
            ["get", "b"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })

        it("should compile with mixed literals and expressions", () => {
          const expression = valueComparison.min([
            10,
            ["get", "value"],
            ["*", 2, 5],
          ])
          const compiled = [
            "min",
            10,
            ["get", "value"],
            ["*", 2, 5],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("max", () => {
        it("should compile to a max expression", () => {
          const expression = valueComparison.max([1, 2, 3])
          const compiled = [
            "max",
            1,
            2,
            3,
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })

        it("should compile with expressions as arguments", () => {
          const expression = valueComparison.max([
            ["get", "x"],
            ["get", "y"],
            ["get", "z"],
          ])
          const compiled = [
            "max",
            ["get", "x"],
            ["get", "y"],
            ["get", "z"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })
    })

    describe("evaluation", () => {
      const feature: Feature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0],
        },
        properties: {
          a: 10,
          b: 25,
          c: 5,
          x: -3,
          y: 0,
          z: 7,
          temperature: 22,
          humidity: 65,
          pressure: 1013,
        },
      }

      describe("min", () => {
        it("should return minimum of two numbers", () => {
          const expression = valueComparison.min([5, 10])
          testExpressionValue(expression, feature, 5)
        })

        it("should return minimum of multiple numbers", () => {
          const expression = valueComparison.min([15, 3, 8, 12, 1])
          testExpressionValue(expression, feature, 1)
        })

        it("should work with feature properties", () => {
          const expression = valueComparison.min([
            ["get", "a"],
            ["get", "b"],
            ["get", "c"],
          ])
          // min(10, 25, 5) = 5
          testExpressionValue(expression, feature, 5)
        })

        it("should work with negative numbers", () => {
          const expression = valueComparison.min([
            ["get", "x"],
            ["get", "y"],
            ["get", "z"],
          ])
          // min(-3, 0, 7) = -3
          testExpressionValue(expression, feature, -3)
        })

        it("should work with expressions", () => {
          const expression = valueComparison.min([
            ["*", 2, 3],        // 6
            ["+", 4, 1],        // 5
            ["-", 10, 2],       // 8
          ])
          // min(6, 5, 8) = 5
          testExpressionValue(expression, feature, 5)
        })

        it("should handle single value", () => {
          const expression = valueComparison.min([42])
          testExpressionValue(expression, feature, 42)
        })

        it("should work with mixed literals and expressions", () => {
          const expression = valueComparison.min([
            100,
            ["get", "temperature"],
            ["*", 5, 3],
          ])
          // min(100, 22, 15) = 15
          testExpressionValue(expression, feature, 15)
        })
      })

      describe("max", () => {
        it("should return maximum of two numbers", () => {
          const expression = valueComparison.max([5, 10])
          testExpressionValue(expression, feature, 10)
        })

        it("should return maximum of multiple numbers", () => {
          const expression = valueComparison.max([15, 3, 8, 12, 1])
          testExpressionValue(expression, feature, 15)
        })

        it("should work with feature properties", () => {
          const expression = valueComparison.max([
            ["get", "a"],
            ["get", "b"],
            ["get", "c"],
          ])
          // max(10, 25, 5) = 25
          testExpressionValue(expression, feature, 25)
        })

        it("should work with negative numbers", () => {
          const expression = valueComparison.max([
            ["get", "x"],
            ["get", "y"],
            ["get", "z"],
          ])
          // max(-3, 0, 7) = 7
          testExpressionValue(expression, feature, 7)
        })

        it("should work with expressions", () => {
          const expression = valueComparison.max([
            ["*", 2, 3],        // 6
            ["+", 4, 1],        // 5
            ["-", 10, 2],       // 8
          ])
          // max(6, 5, 8) = 8
          testExpressionValue(expression, feature, 8)
        })

        it("should handle single value", () => {
          const expression = valueComparison.max([42])
          testExpressionValue(expression, feature, 42)
        })

        it("should work with mixed literals and expressions", () => {
          const expression = valueComparison.max([
            1,
            ["get", "temperature"],
            ["*", 2, 3],
          ])
          // max(1, 22, 6) = 22
          testExpressionValue(expression, feature, 22)
        })
      })

      describe("edge cases", () => {
        it("should handle zero values in min", () => {
          const expression = valueComparison.min([0, 5, -2])
          testExpressionValue(expression, feature, -2)
        })

        it("should handle zero values in max", () => {
          const expression = valueComparison.max([0, -5, 2])
          testExpressionValue(expression, feature, 2)
        })

        it("should handle all equal values in min", () => {
          const expression = valueComparison.min([7, 7, 7])
          testExpressionValue(expression, feature, 7)
        })

        it("should handle all equal values in max", () => {
          const expression = valueComparison.max([9, 9, 9])
          testExpressionValue(expression, feature, 9)
        })

        it("should handle floating point numbers", () => {
          const minExpr = valueComparison.min([3.14, 2.71, 1.41])
          const maxExpr = valueComparison.max([3.14, 2.71, 1.41])
          
          testExpressionValue(minExpr, feature, 1.41)
          testExpressionValue(maxExpr, feature, 3.14)
        })
      })
    })

    describe("real-world usage patterns", () => {
      const feature: Feature = {
        type: "Feature",
        geometry: { type: "Point", coordinates: [0, 0] },
        properties: {
          temperature: 25,
          humidity: 80,
          windSpeed: 15,
          minTemp: 18,
          maxTemp: 32,
          threshold: 20,
        },
      }

      it("should clamp values within range", () => {
        // Clamp temperature between minTemp and maxTemp
        const expression = valueComparison.min([
          valueComparison.max([
            ["get", "temperature"],
            ["get", "minTemp"],
          ]),
          ["get", "maxTemp"],
        ])
        // max(25, 18) = 25, then min(25, 32) = 25
        testExpressionValue(expression, feature, 25)
      })

      it("should find the most extreme weather condition", () => {
        const expression = valueComparison.max([
          ["/", ["get", "temperature"], 40],     // Temperature factor (25/40 = 0.625)
          ["/", ["get", "humidity"], 100],       // Humidity factor (80/100 = 0.8)
          ["/", ["get", "windSpeed"], 50],       // Wind factor (15/50 = 0.3)
        ])
        // max(0.625, 0.8, 0.3) = 0.8
        testExpressionValue(expression, feature, 0.8)
      })

      it("should calculate comfort index with bounds", () => {
        const expression = valueComparison.max([
          0,
          valueComparison.min([
            100,
            [
              "*",
              ["*", 
                ["-", 100, ["get", "humidity"]], // Inverse humidity weight
                ["/", ["get", "temperature"], 30]  // Temperature factor
              ],
              2
            ]
          ])
        ])
        // (100 - 80) * (25/30) * 2 = 20 * 0.833 * 2 ≈ 33.33
        // max(0, min(100, 33.33)) = 33.33
        testExpressionValue(expression, feature, 33.333333333333336)
      })

      it("should work in conditional styling", () => {
        const expression = [
          "case",
          [">", valueComparison.max([
            ["get", "temperature"],
            ["get", "threshold"],
          ]), 30],
          "hot",
          "normal"
        ] satisfies ExpressionSpecification
        
        // max(25, 20) = 25, 25 > 30 is false
        testExpressionValue(expression, feature, "normal")
      })

      it("should normalize multiple sensors", () => {
        const expression = valueComparison.min([
          ["/", ["get", "temperature"], 50],  // Normalize to 0-1
          ["/", ["get", "humidity"], 100],    // Normalize to 0-1  
          1.0  // Maximum allowed value
        ])
        // min(25/50, 80/100, 1.0) = min(0.5, 0.8, 1.0) = 0.5
        testExpressionValue(expression, feature, 0.5)
      })
    })
  })
})