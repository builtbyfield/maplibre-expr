import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { testExpression } from "../../utils/test-utils"
import { rounding } from "./rounding"

describe("math", () => {
  describe("rounding", () => {
    describe("compilation", () => {
      describe("round", () => {
        it("with number", () => {
          const expression = rounding.round(1.5)
          const compiled = ["round", 1.5] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = rounding.round(["+", 1, 1])
          const compiled = [
            "round",
            ["+", 1, 1],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("ceil", () => {
        it("with number", () => {
          const expression = rounding.ceil(1.5)
          const compiled = ["ceil", 1.5] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = rounding.ceil(["+", 1, 1])
          const compiled = [
            "ceil",
            ["+", 1, 1],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("floor", () => {
        it("with number", () => {
          const expression = rounding.floor(1.5)
          const compiled = ["floor", 1.5] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = rounding.floor(["+", 1, 1])
          const compiled = [
            "floor",
            ["+", 1, 1],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })
    })

    describe("evaluation", () => {
      const feature: Feature = {
        type: "Unknown",
        properties: {},
      }

      describe("round", () => {
        it("should round 1.5 to 2", () => {
          const expression: ExpressionSpecification = [
            "==",
            rounding.round(1.5),
            2,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })

        it("should round -1.5 to -2", () => {
          const expression: ExpressionSpecification = [
            "==",
            rounding.round(-1.5),
            -2,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })

        it("should round 0.2 to 0", () => {
          const expression: ExpressionSpecification = [
            "==",
            rounding.round(0.2),
            0,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })

        it("should round 0.5 to 1", () => {
          const expression: ExpressionSpecification = [
            "==",
            rounding.round(0.5),
            1,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })

        it("should round -0.5 to -1", () => {
          const expression: ExpressionSpecification = [
            "==",
            rounding.round(-0.5),
            -1,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
      })

      describe("ceil", () => {
        it("should ceil 1.5 to 2", () => {
          const expression: ExpressionSpecification = [
            "==",
            rounding.ceil(1.5),
            2,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })

        it("should ceil -1.5 to -1", () => {
          const expression: ExpressionSpecification = [
            "==",
            rounding.ceil(-1.5),
            -1,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })

        it("should ceil 0.2 to 1", () => {
          const expression: ExpressionSpecification = [
            "==",
            rounding.ceil(0.2),
            1,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })

        it("should ceil 0.5 to 1", () => {
          const expression: ExpressionSpecification = [
            "==",
            rounding.ceil(0.5),
            1,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })

        it("should ceil -0.5 to 0", () => {
          const expression: ExpressionSpecification = [
            "==",
            rounding.ceil(-0.5),
            0,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
      })

      describe("floor", () => {
        it("should floor 1.5 to 1", () => {
          const expression: ExpressionSpecification = [
            "==",
            rounding.floor(1.5),
            1,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })

        it("should floor -1.5 to -2", () => {
          const expression: ExpressionSpecification = [
            "==",
            rounding.floor(-1.5),
            -2,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })

        it("should floor 0.2 to 0", () => {
          const expression: ExpressionSpecification = [
            "==",
            rounding.floor(0.2),
            0,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })

        it("should floor -0.5 to -1", () => {
          const expression: ExpressionSpecification = [
            "==",
            rounding.floor(-0.5),
            -1,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })

        it("should floor 0.5 to 0", () => {
          const expression: ExpressionSpecification = [
            "==",
            rounding.floor(0.5),
            0,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
      })
    })
  })
})
