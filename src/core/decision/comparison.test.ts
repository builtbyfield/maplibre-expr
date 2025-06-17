import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { testExpression } from "../../utils/test-utils"
import { comparison } from "./comparison"

describe("decision", () => {
  describe("comparison", () => {
    describe("compilation", () => {
      describe("equal", () => {
        it("should compile to an equal expression", () => {
          const expression = comparison.equal(
            ["get", "building_type"],
            "residential",
          )
          const compiled = [
            "==",
            ["get", "building_type"],
            "residential",
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("notEqual", () => {
        it("should compile to a not equal expression", () => {
          const expression = comparison.notEqual(
            ["get", "building_type"],
            "residential",
          )
          const compiled = [
            "!=",
            ["get", "building_type"],
            "residential",
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("greater", () => {
        it("should compile to a greater expression", () => {
          const expression = comparison.greater(["get", "mag"], 4)
          const compiled = [
            ">",
            ["get", "mag"],
            4,
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("less", () => {
        it("should compile to a less expression", () => {
          const expression = comparison.less(["get", "mag"], 4)
          const compiled = [
            "<",
            ["get", "mag"],
            4,
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("greaterOrEqual", () => {
        it("should compile to a greater or equal expression", () => {
          const expression = comparison.greaterOrEqual(["get", "mag"], 4)
          const compiled = [
            ">=",
            ["get", "mag"],
            4,
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("lessOrEqual", () => {
        it("should compile to a less or equal expression", () => {
          const expression = comparison.lessOrEqual(["get", "mag"], 4)
          const compiled = [
            "<=",
            ["get", "mag"],
            4,
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })
    })

    describe("evaluation", () => {
      const feature: Feature = {
        type: "Unknown",
        properties: {
          // Basic types
          number: 42,
          string: "hello",
          boolean: true,
          null_value: null,
          zero: 0,
          empty_string: "",
          float: 3.14,
          // Domain specific
          building_type: "residential",
          mag: 4.5,
          cluster: false,
          icon: "marker",
          status: "active",
        },
      }

      describe("equal", () => {
        it("should compare numbers", () => {
          const expression = comparison.equal(["get", "number"], 42)
          testExpression(expression, feature, true)
        })

        it("should compare strings", () => {
          const expression = comparison.equal(["get", "string"], "hello")
          testExpression(expression, feature, true)
        })

        it("should compare booleans", () => {
          const expression = comparison.equal(["get", "boolean"], true)
          testExpression(expression, feature, true)
        })

        it("should compare null values", () => {
          const expression = comparison.equal(
            ["get", "null_value"],
            ["literal", null],
          )
          testExpression(expression, feature, true)
        })

        it("should compare zero", () => {
          const expression = comparison.equal(["get", "zero"], 0)
          testExpression(expression, feature, true)
        })

        it("should compare empty strings", () => {
          const expression = comparison.equal(["get", "empty_string"], "")
          testExpression(expression, feature, true)
        })
      })

      describe("notEqual", () => {
        it("should compare different values", () => {
          const expression = comparison.notEqual(["get", "number"], 43)
          testExpression(expression, feature, true)
        })

        it("should compare same values", () => {
          const expression = comparison.notEqual(["get", "number"], 42)
          testExpression(expression, feature, false)
        })

        it("should handle null comparison", () => {
          const expression = comparison.notEqual(
            ["get", "null_value"],
            ["literal", null],
          )
          testExpression(expression, feature, false)
        })

        it("should handle type differences", () => {
          const expression = comparison.notEqual(["get", "number"], "42")
          testExpression(expression, feature, true)
        })
      })

      describe("greater", () => {
        it("should compare numbers", () => {
          const expression = comparison.greater(["get", "number"], 41)
          testExpression(expression, feature, true)
        })

        it("should handle equal values", () => {
          const expression = comparison.greater(["get", "number"], 42)
          testExpression(expression, feature, false)
        })

        it("should handle smaller values", () => {
          const expression = comparison.greater(["get", "number"], 43)
          testExpression(expression, feature, false)
        })

        it("should handle float comparison", () => {
          const expression = comparison.greater(["get", "float"], 3.13)
          testExpression(expression, feature, true)
        })
      })

      describe("less", () => {
        it("should compare numbers", () => {
          const expression = comparison.less(["get", "number"], 43)
          testExpression(expression, feature, true)
        })

        it("should handle equal values", () => {
          const expression = comparison.less(["get", "number"], 42)
          testExpression(expression, feature, false)
        })

        it("should handle larger values", () => {
          const expression = comparison.less(["get", "number"], 41)
          testExpression(expression, feature, false)
        })

        it("should handle float comparison", () => {
          const expression = comparison.less(["get", "float"], 3.15)
          testExpression(expression, feature, true)
        })
      })

      describe("greaterOrEqual", () => {
        it("should handle greater than", () => {
          const expression = comparison.greaterOrEqual(["get", "number"], 41)
          testExpression(expression, feature, true)
        })

        it("should handle equal values", () => {
          const expression = comparison.greaterOrEqual(["get", "number"], 42)
          testExpression(expression, feature, true)
        })

        it("should handle smaller values", () => {
          const expression = comparison.greaterOrEqual(["get", "number"], 43)
          testExpression(expression, feature, false)
        })

        it("should handle float comparison", () => {
          const expression = comparison.greaterOrEqual(["get", "float"], 3.14)
          testExpression(expression, feature, true)
        })
      })

      describe("lessOrEqual", () => {
        it("should handle less than", () => {
          const expression = comparison.lessOrEqual(["get", "number"], 43)
          testExpression(expression, feature, true)
        })

        it("should handle equal values", () => {
          const expression = comparison.lessOrEqual(["get", "number"], 42)
          testExpression(expression, feature, true)
        })

        it("should handle larger values", () => {
          const expression = comparison.lessOrEqual(["get", "number"], 41)
          testExpression(expression, feature, false)
        })

        it("should handle float comparison", () => {
          const expression = comparison.lessOrEqual(["get", "float"], 3.14)
          testExpression(expression, feature, true)
        })
      })

      describe("edge cases", () => {
        it("should handle float comparison with precision", () => {
          const expression = comparison.equal(["get", "float"], 3.14)
          testExpression(expression, feature, true)
        })

        it("should handle type coercion cases", () => {
          const expression = comparison.equal(["get", "number"], "42")
          testExpression(expression, feature, false)
        })

        it("should handle undefined property", () => {
          const expression = comparison.equal(
            ["get", "non_existent"],
            ["literal", null],
          )
          testExpression(expression, feature, true)
        })

        it("should handle NaN comparison", () => {
          const expression = comparison.equal(
            ["to-number", ["get", "string"]],
            ["literal", Number.NaN],
          )
          testExpression(expression, feature, false)
        })

        it("should handle infinity comparison", () => {
          const expression = comparison.less(
            ["get", "number"],
            ["literal", Infinity],
          )
          testExpression(expression, feature, true)
        })

        it("should handle negative infinity comparison", () => {
          const expression = comparison.greater(
            ["get", "number"],
            ["literal", -Infinity],
          )
          testExpression(expression, feature, true)
        })
      })

      describe("string collation", () => {
        it("should support case-insensitive comparison", () => {
          const collator = [
            "collator",
            {
              "case-sensitive": false,
            },
          ] as ["collator", { "case-sensitive": boolean }]

          const expression = comparison.equal(
            ["get", "string"],
            "HELLO",
            collator,
          )
          testExpression(expression, feature, true)
        })

        it("should support case-sensitive comparison", () => {
          const collator = [
            "collator",
            {
              "case-sensitive": true,
            },
          ] as ["collator", { "case-sensitive": boolean }]

          const expression = comparison.equal(
            ["get", "string"],
            "HELLO",
            collator,
          )
          testExpression(expression, feature, false)
        })
      })

      describe("complex comparisons", () => {
        it("should handle numeric ranges with greater/less", () => {
          const expression = [
            "all",
            comparison.greater(["get", "number"], 40),
            comparison.less(["get", "number"], 44),
          ] as ExpressionSpecification
          testExpression(expression, feature, true)
        })

        it("should handle inclusive ranges with greaterOrEqual/lessOrEqual", () => {
          const expression = [
            "all",
            comparison.greaterOrEqual(["get", "number"], 42),
            comparison.lessOrEqual(["get", "number"], 42),
          ] as ExpressionSpecification
          testExpression(expression, feature, true)
        })
      })
    })
  })
})
