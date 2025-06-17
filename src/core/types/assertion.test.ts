import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { testExpression, testExpressionValue, testExpressionCompilation } from "../../utils/test-utils"
import { assertion } from "./assertion"

describe("types", () => {
  describe("assertion", () => {
    describe("compilation", () => {
      describe("literal", () => {
        it("should compile to a literal expression", () => {
          const expression = assertion.literal(["value1", "value2"])
          const compiled = [
            "literal",
            ["value1", "value2"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("array", () => {
        it("should compile to a basic array expression", () => {
          const expression = assertion.array("string")
          const compiled = [
            "array",
            "string",
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })

        it("should compile with length constraint", () => {
          const expression = assertion.array("string", 2)
          const compiled = [
            "array",
            "string",
            2,
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })

        it("should compile with fallback", () => {
          const expression = assertion.array("number", 3, [0, 0, 0])
          const compiled = [
            "array",
            "number",
            3,
            [0, 0, 0],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("typeof", () => {
        it("should compile to a typeof expression", () => {
          const expression = assertion.typeof(["get", "value"])
          const compiled = [
            // @ts-expect-error: typeof is not included in the types from @maplibre/maplibre-gl-style-spec despite being in the spec
            "typeof",
            ["get", "value"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("string", () => {
        it("should compile to a string expression", () => {
          const expression = assertion.string(["get", "name"])
          const compiled = [
            "string",
            ["get", "name"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })

        it("should compile with fallback", () => {
          const expression = assertion.string(["get", "name"], "default")
          const compiled = [
            "string",
            ["get", "name"],
            "default",
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("number", () => {
        it("should compile to a number expression", () => {
          const expression = assertion.number(["get", "population"])
          const compiled = [
            "number",
            ["get", "population"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })

        it("should compile with fallback", () => {
          const expression = assertion.number(["get", "population"], 0)
          const compiled = [
            "number",
            ["get", "population"],
            0,
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("boolean", () => {
        it("should compile to a boolean expression", () => {
          const expression = assertion.boolean(["get", "active"])
          const compiled = [
            "boolean",
            ["get", "active"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })

        it("should compile with fallback", () => {
          const expression = assertion.boolean(["get", "active"], false)
          const compiled = [
            "boolean",
            ["get", "active"],
            false,
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("object", () => {
        it("should compile to an object expression", () => {
          const expression = assertion.object(["get", "metadata"])
          const compiled = [
            "object",
            ["get", "metadata"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })

        it("should compile with fallback", () => {
          const defaultValue = { defaultKey: "default" }
          const expression = assertion.object(
            ["get", "metadata"],
            defaultValue,
          )
          const compiled = [
            "object",
            ["get", "metadata"],
            defaultValue,
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })
    })

    describe("evaluation", () => {
      const feature: Feature = {
        type: "Unknown",
        properties: {
          name: "Test Location",
          population: 1000,
          active: true,
          metadata: { key: "point" },
          tags: ["tag1", "tag2"],
          nullValue: null,
        },
      }

      describe("literal", () => {
        it("should evaluate literal array", () => {
          const expression = assertion.literal(["a", "b"])
          testExpressionValue(expression, feature, ["a", "b"])
        })
      })

      describe("array", () => {
        it("should evaluate array type assertion", () => {
          const expression = assertion.array("string", 2, assertion.literal(["a", "b"]))
          testExpressionValue(expression, feature, ["a", "b"])
        })
      })

      describe("typeof", () => {
        it("should evaluate typeof number", () => {
          const expression = assertion.typeof(["get", "population"])
          const equals = [
            "==",
            expression,
            "number",
          ] satisfies ExpressionSpecification
          testExpression(equals, feature, true)
        })
        it("should evaluate typeof string", () => {
          const expression = assertion.typeof(["get", "name"])
          const equals = [
            "==",
            expression,
            "string",
          ] satisfies ExpressionSpecification
          testExpression(equals, feature, true)
        })
        it("should evaluate typeof boolean", () => {
          const expression = assertion.typeof(["get", "active"])
          const equals = [
            "==",
            expression,
            "boolean",
          ] satisfies ExpressionSpecification
          testExpression(equals, feature, true)
        })
        it("should evaluate typeof object", () => {
          const expression = assertion.typeof(["get", "metadata"])
          const equals = [
            "==",
            expression,
            "object",
          ] satisfies ExpressionSpecification
          testExpression(equals, feature, true)
        })
        it("should evaluate typeof array", { todo: true }, () => {
          const expression = assertion.typeof(["get", "tags"])
          const equals = [
            "==",
            expression,
            "array",
          ] satisfies ExpressionSpecification
          testExpression(equals, feature, true)
        })
        it("should evaluate typeof null", () => {
          const expression = assertion.typeof(["get", "nullValue"])
          const equals = [
            "==",
            expression,
            "null",
          ] satisfies ExpressionSpecification
          testExpression(equals, feature, true)
        })
        it("should evaluate typeof undefined", () => {
          const expression = assertion.typeof(["get", "nonexistentValue"])
          // Note: MapLibre returns "null" for missing properties, not "undefined"
          testExpressionValue(expression, feature, "null")
        })
      })

      describe("string", () => {
        it("should evaluate string assertion", () => {
          const expression = assertion.string(["get", "name"])
          const equals = [
            "==",
            expression,
            "Test Location",
          ] satisfies ExpressionSpecification
          testExpression(equals, feature, true)
        })
      })

      describe("number", () => {
        it("should evaluate number assertion", () => {
          const expression = assertion.number(["get", "population"])
          const equals = [
            "==",
            expression,
            1000,
          ] satisfies ExpressionSpecification
          testExpression(equals, feature, true)
        })
      })

      describe("boolean", () => {
        it("should evaluate boolean assertion", () => {
          const expression = assertion.boolean(["get", "active"])
          const equals = [
            "==",
            expression,
            true,
          ] satisfies ExpressionSpecification
          testExpression(equals, feature, true)
        })
      })

      describe("object", () => {
        it("should evaluate object assertion", () => {
          const expression = assertion.object(["get", "metadata"])
          testExpressionValue(expression, feature, { key: "point" })
        })
      })
    })
  })
})
