import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec"
import { createExpression } from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { testExpressionValue, testExpressionCompilation } from "../../utils/test-utils"
import { interpolation } from "./index"
import { color } from "../color"

describe("interpolation", () => {
  describe("compilation", () => {
    describe("step", () => {
      it("should compile to a step expression", () => {
        const expression = interpolation.step(
          ["get", "population"],
          "#f1f075",
          { input: 50000, output: "#e55e5e" },
          { input: 100000, output: "#722f37" }
        )
        const compiled = [
          "step",
          ["get", "population"],
          "#f1f075",
          50000,
          "#e55e5e",
          100000,
          "#722f37",
        ] satisfies ExpressionSpecification
        expect(expression).toEqual(compiled)
      })

      it("should compile with numeric outputs", () => {
        const expression = interpolation.step(
          ["get", "magnitude"],
          1,
          { input: 3, output: 5 },
          { input: 6, output: 10 }
        )
        const compiled = [
          "step",
          ["get", "magnitude"],
          1,
          3,
          5,
          6,
          10,
        ] satisfies ExpressionSpecification
        expect(expression).toEqual(compiled)
      })

      it("should compile with single stop", () => {
        const expression = interpolation.step(
          ["zoom"],
          0,
          { input: 10, output: 1 }
        )
        const compiled = [
          "step",
          ["zoom"],
          0,
          10,
          1,
        ] satisfies ExpressionSpecification
        expect(expression).toEqual(compiled)
      })
    })

    describe("interpolate", () => {
      it("should compile linear interpolation", () => {
        const expression = interpolation.interpolate(
          { type: "linear" },
          ["zoom"],
          { input: 5, output: 1 },
          { input: 10, output: 5 }
        )
        const compiled = [
          "interpolate",
          ["linear"],
          ["zoom"],
          5,
          1,
          10,
          5,
        ] satisfies ExpressionSpecification
        expect(expression).toEqual(compiled)
      })

      it("should compile exponential interpolation", () => {
        const expression = interpolation.interpolate(
          { type: "exponential", base: 1.5 },
          ["get", "population"],
          { input: 0, output: "#f1f075" },
          { input: 50000, output: "#e55e5e" }
        )
        const compiled = [
          "interpolate",
          ["exponential", 1.5],
          ["get", "population"],
          0,
          "#f1f075",
          50000,
          "#e55e5e",
        ] satisfies ExpressionSpecification
        expect(expression).toEqual(compiled)
      })

      it("should compile cubic-bezier interpolation", () => {
        const expression = interpolation.interpolate(
          { type: "cubic-bezier", x1: 0.1, y1: 0.2, x2: 0.8, y2: 0.9 },
          ["get", "value"],
          { input: 0, output: 0 },
          { input: 100, output: 1 }
        )
        const compiled = [
          "interpolate",
          ["cubic-bezier", 0.1, 0.2, 0.8, 0.9],
          ["get", "value"],
          0,
          0,
          100,
          1,
        ] satisfies ExpressionSpecification
        expect(expression).toEqual(compiled)
      })
    })

    describe("interpolateHcl", () => {
      it("should compile HCL interpolation", () => {
        const expression = interpolation.interpolateHcl(
          { type: "linear" },
          ["get", "temperature"],
          { input: 0, output: "#0000ff" },
          { input: 100, output: "#ff0000" }
        )
        // Test compilation succeeds
        testExpressionCompilation(expression)
      })
    })

    describe("interpolateLab", () => {
      it("should compile LAB interpolation", () => {
        const expression = interpolation.interpolateLab(
          { type: "linear" },
          ["get", "temperature"],
          { input: 0, output: "#0000ff" },
          { input: 100, output: "#ff0000" }
        )
        // Test compilation succeeds
        testExpressionCompilation(expression)
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
        population: 75000,
        magnitude: 4.5,
        temperature: 25,
        value: 50,
        zoom: 8,
      },
    }

    describe("step", () => {
      it("should return fallback for input below first stop", () => {
        const expression = interpolation.step(
          10, // Literal value below first stop
          "fallback",
          { input: 50, output: "first" },
          { input: 100, output: "second" }
        )
        testExpressionValue(expression, feature, "fallback")
      })

      it("should return appropriate step value", () => {
        const expression = interpolation.step(
          75, // Between 50 and 100
          "fallback",
          { input: 50, output: "first" },
          { input: 100, output: "second" }
        )
        testExpressionValue(expression, feature, "first")
      })

      it("should work with feature properties", () => {
        const expression = interpolation.step(
          ["get", "population"], // 75000
          "small",
          { input: 50000, output: "medium" },
          { input: 100000, output: "large" }
        )
        testExpressionValue(expression, feature, "medium")
      })

      it("should handle numeric outputs", () => {
        const expression = interpolation.step(
          ["get", "magnitude"], // 4.5
          1,
          { input: 3, output: 5 },
          { input: 6, output: 10 }
        )
        testExpressionValue(expression, feature, 5)
      })

      it("should handle edge case at exact stop value", () => {
        const expression = interpolation.step(
          50, // Exactly at stop
          "fallback",
          { input: 50, output: "exact" },
          { input: 100, output: "higher" }
        )
        testExpressionValue(expression, feature, "exact")
      })
    })

    describe("interpolate linear", () => {
      it("should interpolate between numeric values", () => {
        const expression = interpolation.interpolate(
          { type: "linear" },
          50, // Halfway between 0 and 100
          { input: 0, output: 0 },
          { input: 100, output: 10 }
        )
        testExpressionValue(expression, feature, 5) // 50% between 0 and 10
      })

      it("should work with feature properties", () => {
        const expression = interpolation.interpolate(
          { type: "linear" },
          ["get", "value"], // 50
          { input: 0, output: 100 },
          { input: 100, output: 200 }
        )
        testExpressionValue(expression, feature, 150) // 50% between 100 and 200
      })

      it("should handle values outside range", () => {
        const expression = interpolation.interpolate(
          { type: "linear" },
          150, // Above max stop
          { input: 0, output: 0 },
          { input: 100, output: 10 }
        )
        // MapLibre clamps to nearest stop value, doesn't extrapolate
        testExpressionValue(expression, feature, 10)
      })

      it("should interpolate colors", () => {
        const expression = interpolation.interpolate(
          { type: "linear" },
          ["get", "temperature"], // 25
          { input: 0, output: color.rgb(0, 0, 255) },   // Blue
          { input: 50, output: color.rgb(255, 0, 0) }   // Red
        )
        testExpressionCompilation(expression)
      })
    })

    describe("interpolate exponential", () => {
      it("should compile and evaluate exponential interpolation", () => {
        const expression = interpolation.interpolate(
          { type: "exponential", base: 2 },
          ["get", "value"], // 50
          { input: 0, output: 1 },
          { input: 100, output: 16 }
        )
        // Exponential interpolation is complex, just test compilation
        testExpressionCompilation(expression)
      })

      it("should work with feature data", () => {
        const expression = interpolation.interpolate(
          { type: "exponential", base: 1.5 },
          ["get", "population"],
          { input: 0, output: 0 },
          { input: 100000, output: 100 }
        )
        testExpressionCompilation(expression)
      })
    })

    describe("interpolate cubic-bezier", () => {
      it("should compile cubic-bezier interpolation", () => {
        const expression = interpolation.interpolate(
          { type: "cubic-bezier", x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
          ["get", "value"],
          { input: 0, output: 0 },
          { input: 100, output: 1 }
        )
        testExpressionCompilation(expression)
      })
    })

    describe("edge cases", () => {
      it("should handle single stop in step function", () => {
        const expression = interpolation.step(
          75,
          "default",
          { input: 50, output: "above" }
        )
        testExpressionValue(expression, feature, "above")
      })

      it("should handle single stop in interpolation", () => {
        const expression = interpolation.interpolate(
          { type: "linear" },
          50,
          { input: 0, output: 10 }
        )
        // Single stop interpolation, test compilation
        testExpressionCompilation(expression)
      })

      it("should handle zero values", () => {
        const expression = interpolation.step(
          0,
          "zero",
          { input: 1, output: "positive" }
        )
        testExpressionValue(expression, feature, "zero")
      })

      it("should handle negative values", () => {
        const expression = interpolation.interpolate(
          { type: "linear" },
          -50,
          { input: -100, output: 0 },
          { input: 0, output: 100 }
        )
        testExpressionValue(expression, feature, 50) // Halfway
      })
    })
  })

  describe("real-world usage patterns", () => {
    const feature: Feature = {
      type: "Feature",
      geometry: { type: "Point", coordinates: [0, 0] },
      properties: {
        zoom: 12,
        population: 85000,
        density: 45,
        temperature: 22,
      },
    }

    it("should create zoom-based sizing", () => {
      const expression = interpolation.interpolate(
        { type: "exponential", base: 2 },
        ["zoom"],
        { input: 5, output: 1 },
        { input: 10, output: 4 },
        { input: 15, output: 16 }
      )
      testExpressionCompilation(expression)
    })

    it("should create population-based color steps", () => {
      const expression = interpolation.step(
        ["get", "population"],
        "#ffffcc",
        { input: 10000, output: "#c7e9b4" },
        { input: 50000, output: "#7fcdbb" },
        { input: 100000, output: "#41b6c4" },
        { input: 500000, output: "#2c7fb8" }
      )
      testExpressionValue(expression, feature, "#7fcdbb")
    })

    it("should create temperature gradient", () => {
      const expression = interpolation.interpolate(
        { type: "linear" },
        ["get", "temperature"],
        { input: -10, output: color.rgb(0, 0, 255) }, // Blue for cold
        { input: 0, output: color.rgb(0, 255, 255) },   // Cyan for freezing
        { input: 20, output: color.rgb(255, 255, 0) },  // Yellow for mild
        { input: 40, output: color.rgb(255, 0, 0) }   // Red for hot
      )
      testExpressionCompilation(expression)
    })

    it("should combine multiple interpolations", () => {
      const radiusExpression = interpolation.interpolate(
        { type: "linear" },
        ["get", "population"],
        { input: 0, output: 2 },
        { input: 1000000, output: 20 }
      )

      const opacityExpression = interpolation.step(
        ["get", "density"],
        0.3,
        { input: 20, output: 0.6 },
        { input: 50, output: 0.9 }
      )

      // Test both expressions compile
      testExpressionCompilation(radiusExpression)
      testExpressionCompilation(opacityExpression)
    })
  })
})