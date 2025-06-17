import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { testExpression } from "../../utils/test-utils"
import { trigonometry } from "./trigonometry"

describe("math", () => {
  describe("trigonometry", () => {
    describe("compilation", () => {
      describe("sin", () => {
        it("with number", () => {
          const expression = trigonometry.sin(1.5)
          const compiled = ["sin", 1.5] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = trigonometry.sin(["+", 1, 1])
          const compiled = [
            "sin",
            ["+", 1, 1],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("cos", () => {
        it("with number", () => {
          const expression = trigonometry.cos(1.5)
          const compiled = ["cos", 1.5] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = trigonometry.cos(["+", 1, 1])
          const compiled = [
            "cos",
            ["+", 1, 1],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("tan", () => {
        it("with number", () => {
          const expression = trigonometry.tan(1.5)
          const compiled = ["tan", 1.5] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = trigonometry.tan(["+", 1, 1])
          const compiled = [
            "tan",
            ["+", 1, 1],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("asin", () => {
        it("with number", () => {
          const expression = trigonometry.asin(0.5)
          const compiled = ["asin", 0.5] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = trigonometry.asin(["+", 1, 1])
          const compiled = [
            "asin",
            ["+", 1, 1],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("acos", () => {
        it("with number", () => {
          const expression = trigonometry.acos(0.5)
          const compiled = ["acos", 0.5] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = trigonometry.acos(["+", 1, 1])
          const compiled = [
            "acos",
            ["+", 1, 1],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("atan", () => {
        it("with number", () => {
          const expression = trigonometry.atan(1)
          const compiled = ["atan", 1] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = trigonometry.atan(["+", 1, 1])
          const compiled = [
            "atan",
            ["+", 1, 1],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })
    })

    describe("evaluation", () => {
      const feature: Feature = {
        type: "Unknown",
        properties: {
          angle: Math.PI / 2,
          ratio: 0.5,
        },
      }

      describe("sin", () => {
        it("should return ~0.9974949866 for sin(1.5)", () => {
          const epsilon = 0.0000001 // Small tolerance for floating point comparison
          const expectedValue = 0.9974949866
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.sin(1.5), expectedValue - epsilon],
            ["<", trigonometry.sin(1.5), expectedValue + epsilon],
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })

        it("should return 0 for sin(0)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.sin(0), -epsilon],
            ["<", trigonometry.sin(0), epsilon],
          ]
          testExpression(expression, feature, true)
        })

        it("should return -1 for sin(3π/2)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.sin((3 * Math.PI) / 2), -1 - epsilon],
            ["<", trigonometry.sin((3 * Math.PI) / 2), -1 + epsilon],
          ]
          testExpression(expression, feature, true)
        })

        it("should return 0 for sin(2π)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.sin(2 * Math.PI), -epsilon],
            ["<", trigonometry.sin(2 * Math.PI), epsilon],
          ]
          testExpression(expression, feature, true)
        })
      })

      describe("cos", () => {
        it("should return ~0.0707372017 for cos(1.5)", () => {
          const epsilon = 0.0000001 // Small tolerance for floating point comparison
          const expectedValue = 0.0707372017
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.cos(1.5), expectedValue - epsilon],
            ["<", trigonometry.cos(1.5), expectedValue + epsilon],
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })

        it("should return 1 for cos(0)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.cos(0), 1 - epsilon],
            ["<", trigonometry.cos(0), 1 + epsilon],
          ]
          testExpression(expression, feature, true)
        })

        it("should return -1 for cos(π)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.cos(Math.PI), -1 - epsilon],
            ["<", trigonometry.cos(Math.PI), -1 + epsilon],
          ]
          testExpression(expression, feature, true)
        })

        it("should return 1 for cos(2π)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.cos(2 * Math.PI), 1 - epsilon],
            ["<", trigonometry.cos(2 * Math.PI), 1 + epsilon],
          ]
          testExpression(expression, feature, true)
        })
      })

      describe("tan", () => {
        it("should return ~14.1014199472 for tan(1.5)", () => {
          const epsilon = 0.0000001 // Small tolerance for floating point comparison
          const expectedValue = 14.1014199472
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.tan(1.5), expectedValue - epsilon],
            ["<", trigonometry.tan(1.5), expectedValue + epsilon],
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })

        it("should return 0 for tan(0)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.tan(0), -epsilon],
            ["<", trigonometry.tan(0), epsilon],
          ]
          testExpression(expression, feature, true)
        })

        it("should return 1 for tan(π/4)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.tan(Math.PI / 4), 1 - epsilon],
            ["<", trigonometry.tan(Math.PI / 4), 1 + epsilon],
          ]
          testExpression(expression, feature, true)
        })

        it("should return 0 for tan(π)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.tan(Math.PI), -epsilon],
            ["<", trigonometry.tan(Math.PI), epsilon],
          ]
          testExpression(expression, feature, true)
        })
      })

      describe("asin", () => {
        it("should return ~0.5235987756 for asin(0.5)", () => {
          const epsilon = 0.0000001 // Small tolerance for floating point comparison
          const expectedValue = 0.5235987756
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.asin(0.5), expectedValue - epsilon],
            ["<", trigonometry.asin(0.5), expectedValue + epsilon],
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })

        it("should return π/2 for asin(1)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.asin(1), Math.PI / 2 - epsilon],
            ["<", trigonometry.asin(1), Math.PI / 2 + epsilon],
          ]
          testExpression(expression, feature, true)
        })

        it("should return -π/2 for asin(-1)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.asin(-1), -Math.PI / 2 - epsilon],
            ["<", trigonometry.asin(-1), -Math.PI / 2 + epsilon],
          ]
          testExpression(expression, feature, true)
        })

        it("should return 0 for asin(0)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.asin(0), -epsilon],
            ["<", trigonometry.asin(0), epsilon],
          ]
          testExpression(expression, feature, true)
        })
      })

      describe("acos", () => {
        it("should return ~1.0471975512 for acos(0.5)", () => {
          const epsilon = 0.0000001 // Small tolerance for floating point comparison
          const expectedValue = 1.0471975512
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.acos(0.5), expectedValue - epsilon],
            ["<", trigonometry.acos(0.5), expectedValue + epsilon],
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })

        it("should return 0 for acos(1)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.acos(1), -epsilon],
            ["<", trigonometry.acos(1), epsilon],
          ]
          testExpression(expression, feature, true)
        })

        it("should return π for acos(-1)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.acos(-1), Math.PI - epsilon],
            ["<", trigonometry.acos(-1), Math.PI + epsilon],
          ]
          testExpression(expression, feature, true)
        })

        it("should return π/2 for acos(0)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.acos(0), Math.PI / 2 - epsilon],
            ["<", trigonometry.acos(0), Math.PI / 2 + epsilon],
          ]
          testExpression(expression, feature, true)
        })
      })

      describe("atan", () => {
        it("should return ~0.7853981634 for atan(1)", () => {
          const epsilon = 0.0000001 // Small tolerance for floating point comparison
          const expectedValue = 0.7853981634
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.atan(1), expectedValue - epsilon],
            ["<", trigonometry.atan(1), expectedValue + epsilon],
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })

        it("should return 0 for atan(0)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.atan(0), -epsilon],
            ["<", trigonometry.atan(0), epsilon],
          ]
          testExpression(expression, feature, true)
        })

        it("should return π/4 for atan(1)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.atan(1), Math.PI / 4 - epsilon],
            ["<", trigonometry.atan(1), Math.PI / 4 + epsilon],
          ]
          testExpression(expression, feature, true)
        })

        it("should return -π/4 for atan(-1)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.atan(-1), -Math.PI / 4 - epsilon],
            ["<", trigonometry.atan(-1), -Math.PI / 4 + epsilon],
          ]
          testExpression(expression, feature, true)
        })
      })

      // Special angles tests
      describe("special angles", () => {
        it("should return 1 for sin(PI/2)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.sin(Math.PI / 2), 1 - epsilon],
            ["<", trigonometry.sin(Math.PI / 2), 1 + epsilon],
          ]
          testExpression(expression, feature, true)
        })

        it("should return 0 for cos(PI/2)", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.cos(Math.PI / 2), -epsilon],
            ["<", trigonometry.cos(Math.PI / 2), epsilon],
          ]
          testExpression(expression, feature, true)
        })
      })

      // Tests with feature properties
      describe("feature property expressions", () => {
        it("should evaluate sin with property value", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.sin(["get", "angle"]), 1 - epsilon],
            ["<", trigonometry.sin(["get", "angle"]), 1 + epsilon],
          ]
          testExpression(expression, feature, true)
        })

        it("should evaluate asin with property value", () => {
          const epsilon = 0.0000001
          const expectedValue = 0.5235987756
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.asin(["get", "ratio"]), expectedValue - epsilon],
            ["<", trigonometry.asin(["get", "ratio"]), expectedValue + epsilon],
          ]
          testExpression(expression, feature, true)
        })
      })

      // Edge cases
      describe("edge cases", () => {
        it("should handle asin at boundary values", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.asin(1), Math.PI / 2 - epsilon],
            ["<", trigonometry.asin(1), Math.PI / 2 + epsilon],
          ]
          testExpression(expression, feature, true)
        })

        it("should handle acos at boundary values", () => {
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.acos(1), -epsilon],
            ["<", trigonometry.acos(1), epsilon],
          ]
          testExpression(expression, feature, true)
        })
      })

      // Composite expressions
      describe("composite expressions", () => {
        it("should evaluate sin(asin(x)) ≈ x", () => {
          const x = 0.5
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.sin(trigonometry.asin(x)), x - epsilon],
            ["<", trigonometry.sin(trigonometry.asin(x)), x + epsilon],
          ]
          testExpression(expression, feature, true)
        })

        it("should evaluate cos(acos(x)) ≈ x", () => {
          const x = 0.5
          const epsilon = 0.0000001
          const expression: ExpressionSpecification = [
            "all",
            [">", trigonometry.cos(trigonometry.acos(x)), x - epsilon],
            ["<", trigonometry.cos(trigonometry.acos(x)), x + epsilon],
          ]
          testExpression(expression, feature, true)
        })
      })
    })
  })
})
