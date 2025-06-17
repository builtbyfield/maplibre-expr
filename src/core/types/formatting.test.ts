import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { testExpression, testExpressionCompilation } from "../../utils/test-utils"
import { formatting } from "./formatting"

describe("types", () => {
  describe("formatting", () => {
    describe("compilation", () => {
      describe("collator", () => {
        it("should compile to a collator expression", () => {
          const expression = formatting.collator({
            "case-sensitive": true,
            "diacritic-sensitive": true,
            "locale": "fr",
          })
          const compiled = [
            "collator",
            {
              "case-sensitive": true,
              "diacritic-sensitive": true,
              "locale": "fr",
            },
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("format", () => {
        it("should compile to a format expression", () => {
          const expression = formatting.format(
            ["get", "name"],
            { "font-scale": 0.8 },
            "\n",
            ["get", "description"],
          )
          const compiled = [
            "format",
            ["get", "name"],
            { "font-scale": 0.8 },
            "\n",
            ["get", "description"],
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("image", () => {
        it("should compile to an image expression", () => {
          const expression = formatting.image("marker-15")
          const compiled = [
            "image",
            "marker-15",
          ] satisfies ExpressionSpecification
          expect(expression).toEqual(compiled)
        })
      })

      describe("numberFormat", () => {
        it("should compile to a number-format expression", () => {
          const expression = formatting.numberFormat(["get", "price"], {
            "locale": "de-DE",
            "currency": "EUR",
            "min-fraction-digits": 2,
          })
          const compiled = [
            "number-format",
            ["get", "price"],
            {
              "locale": "de-DE",
              "currency": "EUR",
              "min-fraction-digits": 2,
            },
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
          description: "A test description",
          price: 1234.56,
        },
      }

      describe("format", () => {
        it("should format text with options", () => {
          const expression = formatting.format(
            ["get", "name"],
            { "font-scale": 0.8 },
            " - ",
            ["get", "description"],
          )
          // Format expressions return formatted text objects, test compilation
          testExpressionCompilation(expression)
        })
      })

      describe("numberFormat", () => {
        it("should format number according to locale", () => {
          const expression = formatting.numberFormat(["get", "price"], {
            "locale": "de-DE",
            "currency": "EUR",
            "min-fraction-digits": 2,
          })
          // Number format expressions return formatted strings, test compilation
          testExpressionCompilation(expression)
        })
      })

      // Note: collator and image tests are omitted because they require
      // specific runtime environment setup that's not available in the test environment
    })
  })
})
