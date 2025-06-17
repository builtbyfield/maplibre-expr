import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { testExpression } from "../../utils/test-utils"
import { arithmetic } from "./arithmetic"

describe("math", () => {
  describe("arithmetic", () => {
    describe("compilation", () => {
      describe("add", () => {
        it("with number", () => {
          const expression = arithmetic.add(1, 2)
          const compiled = ["+", 1, 2] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = arithmetic.add(["get", "a"], ["get", "b"])
          const compiled = [
            "+",
            ["get", "a"],
            ["get", "b"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("subtract", () => {
        it("with number", () => {
          const expression = arithmetic.subtract(1, 2)
          const compiled = ["-", 1, 2] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = arithmetic.subtract(["get", "a"], ["get", "b"])
          const compiled = [
            "-",
            ["get", "a"],
            ["get", "b"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("multiply", () => {
        it("with number", () => {
          const expression = arithmetic.multiply(1, 2)
          const compiled = ["*", 1, 2] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = arithmetic.multiply(["get", "a"], ["get", "b"])
          const compiled = [
            "*",
            ["get", "a"],
            ["get", "b"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("divide", () => {
        it("with number", () => {
          const expression = arithmetic.divide(1, 2)
          const compiled = ["/", 1, 2] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = arithmetic.divide(["get", "a"], ["get", "b"])
          const compiled = [
            "/",
            ["get", "a"],
            ["get", "b"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("mod", () => {
        it("with number", () => {
          const expression = arithmetic.mod(1, 2)
          const compiled = ["%", 1, 2] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = arithmetic.mod(["get", "a"], ["get", "b"])
          const compiled = [
            "%",
            ["get", "a"],
            ["get", "b"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("pow", () => {
        it("with number", () => {
          const expression = arithmetic.pow(1, 2)
          const compiled = ["^", 1, 2] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
        it("with expression", () => {
          const expression = arithmetic.pow(["get", "a"], ["get", "b"])
          const compiled = [
            "^",
            ["get", "a"],
            ["get", "b"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })
    })

    describe("evaluation", () => {
      const feature: Feature = {
        type: "Unknown",
        properties: {
          a: 1,
          b: 2,
          c: 3,
          d: 4,
        },
      }

      describe("add", () => {
        it("should handle simple numbers", () => {
          const expression: ExpressionSpecification = [
            "==",
            arithmetic.add(1, 2),
            3,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
        it("should handle properties", () => {
          const expression: ExpressionSpecification = [
            "==",
            arithmetic.add(["get", "a"], ["get", "b"]),
            3,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
        it("should handle expressions", () => {
          const expression: ExpressionSpecification = [
            "==",
            arithmetic.add(arithmetic.add(1, 2), arithmetic.add(3, 4)),
            10,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
      })

      describe("subtract", () => {
        it("should handle simple numbers", () => {
          const expression: ExpressionSpecification = [
            "==",
            arithmetic.subtract(1, 2),
            -1,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
        it("should handle properties", () => {
          const expression: ExpressionSpecification = [
            "==",
            arithmetic.subtract(["get", "a"], ["get", "b"]),
            -1,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
        it("should handle expressions", () => {
          const expression: ExpressionSpecification = [
            "==",
            arithmetic.subtract(
              arithmetic.subtract(1, 2), // -1
              arithmetic.subtract(3, 4), // -1
            ), // -1 - (-1)
            0,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
      })

      describe("multiply", () => {
        it("should handle simple numbers", () => {
          const expression: ExpressionSpecification = [
            "==",
            arithmetic.multiply(1, 2),
            2,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
        it("should handle properties", () => {
          const expression: ExpressionSpecification = [
            "==",
            arithmetic.multiply(["get", "a"], ["get", "b"]),
            2,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
        it("should handle expressions", () => {
          const expression: ExpressionSpecification = [
            "==",
            arithmetic.multiply(
              arithmetic.multiply(1, 2),
              arithmetic.multiply(3, 4),
            ),
            24,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
      })

      describe("divide", () => {
        it("should handle simple numbers", () => {
          const expression: ExpressionSpecification = [
            "==",
            arithmetic.divide(1, 2),
            0.5,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
        it("should handle properties", () => {
          const expression: ExpressionSpecification = [
            "==",
            arithmetic.divide(["get", "a"], ["get", "b"]),
            0.5,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
        it("should handle expressions", () => {
          const expression: ExpressionSpecification = [
            "==",
            arithmetic.divide(
              arithmetic.divide(12, 2),
              arithmetic.divide(6, 2),
            ),
            2,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
      })

      describe("mod", () => {
        it("should handle simple numbers", () => {
          const expression: ExpressionSpecification = [
            "==",
            arithmetic.mod(1, 2),
            1,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
        it("should handle properties", () => {
          const expression: ExpressionSpecification = [
            "==",
            arithmetic.mod(["get", "a"], ["get", "b"]),
            1,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
        it("should handle expressions", () => {
          const expression: ExpressionSpecification = [
            "==",
            arithmetic.mod(
              arithmetic.mod(13, 5), // 13 % 5 = 3
              arithmetic.mod(8, 3), // 8 % 3 = 2
            ), // 3 % 2 = 1
            1,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
      })

      describe("pow", () => {
        it("should handle simple numbers", () => {
          const expression: ExpressionSpecification = [
            "==",
            arithmetic.pow(2, 3),
            8,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
        it("should handle properties", () => {
          const expression: ExpressionSpecification = [
            "==",
            arithmetic.pow(["get", "a"], ["get", "b"]),
            1, // 1^2 = 1 (using values from feature object where a=1, b=2)
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
        it("should handle expressions", () => {
          const expression: ExpressionSpecification = [
            "==",
            arithmetic.pow(
              arithmetic.pow(2, 2), // 4
              arithmetic.pow(1, 2), // 1
            ), // 4^1 = 4
            4,
          ]
          const expected = true
          testExpression(expression, feature, expected)
        })
      })
    })
  })
})
