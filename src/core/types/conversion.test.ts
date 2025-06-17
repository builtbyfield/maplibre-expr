import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { testExpression, testExpressionValue } from "../../utils/test-utils"
import { conversion } from "./conversion"

describe("types", () => {
  describe("conversion", () => {
    describe("compilation", () => {
      describe("toString", () => {
        it("should compile to a toString expression", () => {
          const expression = conversion.toString(["get", "population"])
          const compiled = [
            "to-string",
            ["get", "population"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("toNumber", () => {
        it("should compile to a toNumber expression", () => {
          const expression = conversion.toNumber(["get", "stringNumber"])
          const compiled = [
            "to-number",
            ["get", "stringNumber"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })

        it("should compile with fallback", () => {
          const expression = conversion.toNumber(["get", "stringNumber"], 0)
          const compiled = [
            "to-number",
            ["get", "stringNumber"],
            0,
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("toBoolean", () => {
        it("should compile to a toBoolean expression", () => {
          const expression = conversion.toBoolean(["get", "stringBoolean"])
          const compiled = [
            "to-boolean",
            ["get", "stringBoolean"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("toColor", () => {
        it("should compile to a toColor expression", () => {
          const expression = conversion.toColor(["get", "colorString"])
          const compiled = [
            "to-color",
            ["get", "colorString"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })

        it("should compile with fallback", () => {
          const expression = conversion.toColor(
            ["get", "colorString"],
            "#000000",
          )
          const compiled = [
            "to-color",
            ["get", "colorString"],
            "#000000",
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })
    })

    describe("evaluation", () => {
      const feature: Feature = {
        type: "Unknown",
        properties: {
          population: 1000,
          stringNumber: "123",
          stringBoolean: "true",
          colorString: "#ff0000",
        },
      }

      describe("toString", () => {
        it("should convert number to string", () => {
          const expression = conversion.toString(["get", "population"])
          const equals = [
            "==",
            expression,
            "1000",
          ] satisfies ExpressionSpecification
          testExpression(equals, feature, true)
        })
      })

      describe("toNumber", () => {
        it("should convert string to number", () => {
          const expression = conversion.toNumber(["get", "stringNumber"])
          const equals = [
            "==",
            expression,
            123,
          ] satisfies ExpressionSpecification
          testExpression(equals, feature, true)
        })

        it("should use fallback for invalid number", () => {
          const expression = conversion.toNumber(["get", "colorString"], 0)
          const equals = [
            "==",
            expression,
            0,
          ] satisfies ExpressionSpecification
          testExpression(equals, feature, true)
        })
      })

      describe("toBoolean", () => {
        it("should convert string to boolean", () => {
          const expression = conversion.toBoolean(["get", "stringBoolean"])
          const equals = [
            "==",
            expression,
            true,
          ] satisfies ExpressionSpecification
          testExpression(equals, feature, true)
        })
      })

      describe("toColor", () => {
        it("should convert string to color", () => {
          const expression = conversion.toColor(["get", "colorString"])
          // Color expressions return Color objects with r,g,b,a properties (0-1 range)
          testExpressionValue(expression, feature, { r: 1, g: 0, b: 0, a: 1 })
        })

        it("should use fallback for invalid color", () => {
          const expression = conversion.toColor(
            ["get", "stringNumber"],
            "#000000",
          )
          // Test fallback to black color (Color object with 0-1 range)
          testExpressionValue(expression, feature, { r: 0, g: 0, b: 0, a: 1 })
        })
      })
    })
  })
})
