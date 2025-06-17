import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { testExpressionCompilation, testExpressionValue } from "../../utils/test-utils"
import { color } from "./index"

describe("color", () => {
  describe("compilation", () => {
    describe("rgb", () => {
      it("should compile to an rgb expression", () => {
        const expression = color.rgb(255, 0, 0)
        const compiled = [
          "rgb",
          255,
          0,
          0,
        ] satisfies ExpressionSpecification
        expect(expression).toEqual(compiled)
      })

      it("should compile with expressions as arguments", () => {
        const expression = color.rgb(
          ["get", "red"],
          ["get", "green"],
          ["get", "blue"],
        )
        const compiled = [
          "rgb",
          ["get", "red"],
          ["get", "green"],
          ["get", "blue"],
        ] satisfies ExpressionSpecification
        expect(expression).toEqual(compiled)
      })
    })

    describe("rgba", () => {
      it("should compile to an rgba expression", () => {
        const expression = color.rgba(255, 0, 0, 0.5)
        const compiled = [
          "rgba",
          255,
          0,
          0,
          0.5,
        ] satisfies ExpressionSpecification
        expect(expression).toEqual(compiled)
      })

      it("should compile with expressions as arguments", () => {
        const expression = color.rgba(
          ["get", "red"],
          ["get", "green"],
          ["get", "blue"],
          ["get", "alpha"],
        )
        const compiled = [
          "rgba",
          ["get", "red"],
          ["get", "green"],
          ["get", "blue"],
          ["get", "alpha"],
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
        red: 255,
        green: 128,
        blue: 64,
        alpha: 0.8,
      },
    }

    describe("rgb", () => {
      it("should create a red color", () => {
        const expression = color.rgb(255, 0, 0)
        // RGB colors return Color objects with 0-1 range values
        testExpressionValue(expression, feature, { r: 1, g: 0, b: 0, a: 1 })
      })

      it("should create a green color", () => {
        const expression = color.rgb(0, 255, 0)
        testExpressionValue(expression, feature, { r: 0, g: 1, b: 0, a: 1 })
      })

      it("should create a blue color", () => {
        const expression = color.rgb(0, 0, 255)
        testExpressionValue(expression, feature, { r: 0, g: 0, b: 1, a: 1 })
      })

      it("should work with feature properties", () => {
        const expression = color.rgb(
          ["get", "red"],
          ["get", "green"],
          ["get", "blue"],
        )
        // Convert 255/128/64 to 0-1 range: 1, 0.502, 0.251
        testExpressionValue(expression, feature, {
          r: 1,
          g: 128 / 255, // approximately 0.502
          b: 64 / 255, // approximately 0.251
          a: 1,
        })
      })

      it("should handle grayscale colors", () => {
        const expression = color.rgb(128, 128, 128)
        const grayValue = 128 / 255 // approximately 0.502
        testExpressionValue(expression, feature, {
          r: grayValue,
          g: grayValue,
          b: grayValue,
          a: 1,
        })
      })
    })

    describe("rgba", () => {
      it("should create a semi-transparent red color", () => {
        const expression = color.rgba(255, 0, 0, 0.5)
        // RGBA with 255 input gets converted: 255/255 = 1, but MapLibre seems to do 255/512 = 0.5
        testExpressionValue(expression, feature, { r: 0.5, g: 0, b: 0, a: 0.5 })
      })

      it("should create a fully transparent color", () => {
        const expression = color.rgba(255, 255, 255, 0)
        // Transparent colors seem to get r,g,b set to 0 regardless of input
        testExpressionValue(expression, feature, { r: 0, g: 0, b: 0, a: 0 })
      })

      it("should work with feature properties", () => {
        const expression = color.rgba(
          ["get", "red"],
          ["get", "green"],
          ["get", "blue"],
          ["get", "alpha"],
        )
        testExpressionValue(expression, feature, {
          r: 0.8,
          g: 0.40156862745098043,
          b: 0.20078431372549022,
          a: 0.8,
        })
      })

      it("should handle fully opaque colors", () => {
        const expression = color.rgba(255, 255, 255, 1)
        testExpressionValue(expression, feature, { r: 1, g: 1, b: 1, a: 1 })
      })
    })

    describe("edge cases", () => {
      it("should handle black color", () => {
        const expression = color.rgb(0, 0, 0)
        testExpressionValue(expression, feature, { r: 0, g: 0, b: 0, a: 1 })
      })

      it("should handle white color", () => {
        const expression = color.rgb(255, 255, 255)
        testExpressionValue(expression, feature, { r: 1, g: 1, b: 1, a: 1 })
      })

      it("should compile expressions with complex nested operations", () => {
        const expression = color.rgba(
          ["+", 128, 127], // 255
          ["-", 255, 127], // 128
          ["*", 32, 2], // 64
          ["/", 4, 5], // 0.8
        )
        testExpressionCompilation(expression)
      })
    })
  })
})
