import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { testExpression } from "../../utils/test-utils"
import { advanced } from "./advanced"

describe("math", () => {
  describe("advanced", () => {
    describe("compilation", () => {
      describe("abs", () => {
        it("with number", () => {
          const expression = advanced.abs(-1.5)
          const compiled = ["abs", -1.5] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = advanced.abs(["get", "value"])
          const compiled = [
            "abs",
            ["get", "value"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("sqrt", () => {
        it("with number", () => {
          const expression = advanced.sqrt(9)
          const compiled = ["sqrt", 9] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = advanced.sqrt(["get", "value"])
          const compiled = [
            "sqrt",
            ["get", "value"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("log2", () => {
        it("with number", () => {
          const expression = advanced.log2(8)
          const compiled = ["log2", 8] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = advanced.log2(["get", "value"])
          const compiled = [
            "log2",
            ["get", "value"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("ln", () => {
        it("with number", () => {
          const expression = advanced.ln(Math.E)
          const compiled = ["ln", Math.E] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = advanced.ln(["get", "value"])
          const compiled = [
            "ln",
            ["get", "value"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("log10", () => {
        it("with number", () => {
          const expression = advanced.log10(100)
          const compiled = ["log10", 100] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = advanced.log10(["get", "value"])
          const compiled = [
            "log10",
            ["get", "value"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })
    })

    describe("evaluation", () => {
      const feature: Feature = {
        type: "Unknown",
        properties: {
          value: 100,
          negative: -1.5,
        },
      }

      describe("abs", () => {
        it("should return 1.5 for abs(-1.5)", () => {
          const epsilon = 0.0000001
          const expectedValue = 1.5
          const expression: ExpressionSpecification = [
            "all",
            [">", advanced.abs(-1.5), expectedValue - epsilon],
            ["<", advanced.abs(-1.5), expectedValue + epsilon],
          ]
          testExpression(expression, feature, true)
        })

        it("should handle property values", () => {
          const epsilon = 0.0000001
          const expectedValue = 1.5
          const expression: ExpressionSpecification = [
            "all",
            [">", advanced.abs(["get", "negative"]), expectedValue - epsilon],
            ["<", advanced.abs(["get", "negative"]), expectedValue + epsilon],
          ]
          testExpression(expression, feature, true)
        })
      })

      describe("sqrt", () => {
        it("should return 10 for sqrt(100)", () => {
          const epsilon = 0.0000001
          const expectedValue = 10
          const expression: ExpressionSpecification = [
            "all",
            [">", advanced.sqrt(100), expectedValue - epsilon],
            ["<", advanced.sqrt(100), expectedValue + epsilon],
          ]
          testExpression(expression, feature, true)
        })

        it("should handle property values", () => {
          const epsilon = 0.0000001
          const expectedValue = 10
          const expression: ExpressionSpecification = [
            "all",
            [">", advanced.sqrt(["get", "value"]), expectedValue - epsilon],
            ["<", advanced.sqrt(["get", "value"]), expectedValue + epsilon],
          ]
          testExpression(expression, feature, true)
        })
      })

      describe("log2", () => {
        it("should return 3 for log2(8)", () => {
          const epsilon = 0.0000001
          const expectedValue = 3
          const expression: ExpressionSpecification = [
            "all",
            [">", advanced.log2(8), expectedValue - epsilon],
            ["<", advanced.log2(8), expectedValue + epsilon],
          ]
          testExpression(expression, feature, true)
        })
      })

      describe("ln", () => {
        it("should return 1 for ln(e)", () => {
          const epsilon = 0.0000001
          const expectedValue = 1
          const expression: ExpressionSpecification = [
            "all",
            [">", advanced.ln(Math.E), expectedValue - epsilon],
            ["<", advanced.ln(Math.E), expectedValue + epsilon],
          ]
          testExpression(expression, feature, true)
        })
      })

      describe("log10", () => {
        it("should return 2 for log10(100)", () => {
          const epsilon = 0.0000001
          const expectedValue = 2
          const expression: ExpressionSpecification = [
            "all",
            [">", advanced.log10(100), expectedValue - epsilon],
            ["<", advanced.log10(100), expectedValue + epsilon],
          ]
          testExpression(expression, feature, true)
        })

        it("should handle property values", () => {
          const epsilon = 0.0000001
          const expectedValue = 2
          const expression: ExpressionSpecification = [
            "all",
            [">", advanced.log10(["get", "value"]), expectedValue - epsilon],
            ["<", advanced.log10(["get", "value"]), expectedValue + epsilon],
          ]
          testExpression(expression, feature, true)
        })
      })
    })
  })
})
