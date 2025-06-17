import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec"
import { featureFilter } from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { expressions as expr } from "./index"

describe("math", () => {
  describe("compilation", () => {
    describe("constants", () => {
      it("should return ln(2)", () => {
        const expression = expr.ln2()
        expect(expression).toEqual(["ln2"] satisfies ExpressionSpecification)
      })

      it("should return pi", () => {
        const expression = expr.pi()
        expect(expression).toEqual(["pi"] satisfies ExpressionSpecification)
      })

      it("should return e", () => {
        const expression = expr.e()
        expect(expression).toEqual(
          // TODO: Figure out why 'e' is not included in the types
          // @ts-expect-error: e isn't included in MapLibre GL Style Spec types for some reason
          ["e"] satisfies ExpressionSpecification,
        )
      })
    })

    describe("basic Arithmetic", () => {
      describe("sum", () => {
        it("should add two numbers", () => {
          const expression = expr.sum(5, 3)
          expect(expression).toEqual([
            "+",
            5,
            3,
          ] satisfies ExpressionSpecification)
        })

        it("should add multiple numbers", () => {
          const expression = expr.sum(1, 2, 3, 4)
          expect(expression).toEqual([
            "+",
            1,
            2,
            3,
            4,
          ] satisfies ExpressionSpecification)
        })

        it("should handle expressions", () => {
          const expression = expr.sum(["get", "value"], 5)
          expect(expression).toEqual([
            "+",
            ["get", "value"],
            5,
          ] satisfies ExpressionSpecification)
        })
      })

      describe("multiply", () => {
        it("should multiply two numbers", () => {
          const expression = expr.multiply(4, 2)
          expect(expression).toEqual([
            "*",
            4,
            2,
          ] satisfies ExpressionSpecification)
        })

        it("should multiply multiple numbers", () => {
          const expression = expr.multiply(2, 3, 4)
          expect(expression).toEqual([
            "*",
            2,
            3,
            4,
          ] satisfies ExpressionSpecification)
        })

        it("should throw error with less than two arguments", () => {
          expect(() => expr.multiply(5)).toThrow()
        })
      })

      describe("subtract", () => {
        it("should subtract two numbers", () => {
          const expression = expr.subtract(5, 3)
          expect(expression).toEqual([
            "-",
            5,
            3,
          ] satisfies ExpressionSpecification)
        })

        it("should negate a single number", () => {
          const expression = expr.subtract(5)
          expect(expression).toEqual([
            "-",
            5,
          ] satisfies ExpressionSpecification)
        })
      })

      describe("divide", () => {
        it("should divide two numbers", () => {
          const expression = expr.divide(6, 2)
          expect(expression).toEqual([
            "/",
            6,
            2,
          ] satisfies ExpressionSpecification)
        })

        it("should handle expressions", () => {
          const expression = expr.divide(["get", "total"], ["get", "count"])
          expect(expression).toEqual([
            "/",
            ["get", "total"],
            ["get", "count"],
          ] satisfies ExpressionSpecification)
        })
      })
    })

    describe("advanced Math", () => {
      describe("pow", () => {
        it("should calculate power", () => {
          const expression = expr.pow(2, 3)
          expect(expression).toEqual([
            "^",
            2,
            3,
          ] satisfies ExpressionSpecification)
        })

        it("should handle expressions", () => {
          const expression = expr.pow(["get", "base"], 2)
          expect(expression).toEqual([
            "^",
            ["get", "base"],
            2,
          ] satisfies ExpressionSpecification)
        })
      })

      describe("sqrt", () => {
        it("should calculate square root", () => {
          const expression = expr.sqrt(9)
          expect(expression).toEqual([
            "sqrt",
            9,
          ] satisfies ExpressionSpecification)
        })
      })

      describe("log functions", () => {
        it("should calculate log10", () => {
          const expression = expr.log10(100)
          expect(expression).toEqual([
            "log10",
            100,
          ] satisfies ExpressionSpecification)
        })

        it("should calculate ln", () => {
          const expression = expr.ln(Math.E)
          expect(expression).toEqual([
            "ln",
            Math.E,
          ] satisfies ExpressionSpecification)
        })

        it("should calculate log2", () => {
          const expression = expr.log2(8)
          expect(expression).toEqual([
            "log2",
            8,
          ] satisfies ExpressionSpecification)
        })
      })
    })

    describe("trigonometric Functions", () => {
      describe("basic Trig", () => {
        it("should calculate sin", () => {
          const expression = expr.sin(Math.PI / 2)
          expect(expression).toEqual([
            "sin",
            Math.PI / 2,
          ] satisfies ExpressionSpecification)
        })

        it("should calculate cos", () => {
          const expression = expr.cos(0)
          expect(expression).toEqual([
            "cos",
            0,
          ] satisfies ExpressionSpecification)
        })

        it("should calculate tan", () => {
          const expression = expr.tan(Math.PI / 4)
          expect(expression).toEqual([
            "tan",
            Math.PI / 4,
          ] satisfies ExpressionSpecification)
        })
      })

      describe("inverse Trig", () => {
        it("should calculate asin", () => {
          const expression = expr.asin(1)
          expect(expression).toEqual([
            "asin",
            1,
          ] satisfies ExpressionSpecification)
        })

        it("should calculate acos", () => {
          const expression = expr.acos(1)
          expect(expression).toEqual([
            "acos",
            1,
          ] satisfies ExpressionSpecification)
        })

        it("should calculate atan", () => {
          const expression = expr.atan(1)
          expect(expression).toEqual([
            "atan",
            1,
          ] satisfies ExpressionSpecification)
        })
      })
    })

    describe("min/Max Operations", () => {
      describe("min", () => {
        it("should find minimum of two numbers", () => {
          const expression = expr.min(5, 3)
          expect(expression).toEqual([
            "min",
            5,
            3,
          ] satisfies ExpressionSpecification)
        })

        it("should find minimum of multiple numbers", () => {
          const expression = expr.min(1, 2, 3, 4)
          expect(expression).toEqual([
            "min",
            1,
            2,
            3,
            4,
          ] satisfies ExpressionSpecification)
        })

        it("should throw error with no arguments", () => {
          expect(() => expr.min()).toThrow()
        })
      })

      describe("max", () => {
        it("should find maximum of two numbers", () => {
          const expression = expr.max(5, 3)
          expect(expression).toEqual([
            "max",
            5,
            3,
          ] satisfies ExpressionSpecification)
        })

        it("should find maximum of multiple numbers", () => {
          const expression = expr.max(1, 2, 3, 4)
          expect(expression).toEqual([
            "max",
            1,
            2,
            3,
            4,
          ] satisfies ExpressionSpecification)
        })

        it("should throw error with no arguments", () => {
          expect(() => expr.max()).toThrow()
        })
      })
    })

    describe("rounding Operations", () => {
      describe("round", () => {
        it("should round number", () => {
          const expression = expr.round(1.5)
          expect(expression).toEqual([
            "round",
            1.5,
          ] satisfies ExpressionSpecification)
        })
      })

      describe("ceil", () => {
        it("should ceil number", () => {
          const expression = expr.ceil(1.5)
          expect(expression).toEqual([
            "ceil",
            1.5,
          ] satisfies ExpressionSpecification)
        })
      })

      describe("floor", () => {
        it("should floor number", () => {
          const expression = expr.floor(1.5)
          expect(expression).toEqual([
            "floor",
            1.5,
          ] satisfies ExpressionSpecification)
        })
      })
    })

    describe("other Operations", () => {
      describe("abs", () => {
        it("should calculate absolute value", () => {
          const expression = expr.abs(-1.5)
          expect(expression).toEqual([
            "abs",
            -1.5,
          ] satisfies ExpressionSpecification)
        })
      })

      describe("mod", () => {
        it("should calculate modulo", () => {
          const expression = expr.mod(5, 2)
          expect(expression).toEqual([
            "%",
            5,
            2,
          ] satisfies ExpressionSpecification)
        })
      })
    })

    describe("distance Calculation", () => {
      it("should calculate distance to point", () => {
        const expression = expr.distance({
          type: "Point",
          coordinates: [0, 0],
        })
        expect(expression).toEqual([
          "distance",
          { type: "Point", coordinates: [0, 0] },
        ] satisfies ExpressionSpecification)
      })

      it("should calculate distance to line string", () => {
        const expression = expr.distance({
          type: "LineString",
          coordinates: [
            [0, 0],
            [1, 1],
          ],
        })
        expect(expression).toEqual([
          "distance",
          {
            type: "LineString",
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
        ] satisfies ExpressionSpecification)
      })
    })
  })

  describe("evaluation", () => {
    describe("basic Arithmetic", () => {
      it("should evaluate sum correctly", () => {
        const expression = expr.equal(expr.sum(5, ["get", "value"]), 15)
        const feature: Feature = {
          type: "Unknown",
          properties: { value: 10 },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should evaluate multiply correctly", () => {
        const expression = expr.equal(expr.multiply(["get", "value"], 2), 10)
        const feature: Feature = {
          type: "Unknown",
          properties: { value: 5 },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should evaluate subtract correctly", () => {
        const expression = expr.equal(expr.subtract(["get", "value"], 3), 2)
        const feature: Feature = {
          type: "Unknown",
          properties: { value: 5 },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should evaluate divide correctly", () => {
        const expression = expr.equal(expr.divide(["get", "value"], 2), 5)
        const feature: Feature = {
          type: "Unknown",
          properties: { value: 10 },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })
    })

    describe("advanced Math", () => {
      it("should evaluate power correctly", () => {
        const expression = expr.equal(expr.pow(["get", "base"], 2), 16)
        const feature: Feature = {
          type: "Unknown",
          properties: { base: 4 },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should evaluate square root correctly", () => {
        const expression = expr.equal(expr.sqrt(["get", "value"]), 3)
        const feature: Feature = {
          type: "Unknown",
          properties: { value: 9 },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should evaluate logarithms correctly", () => {
        const expression = expr.equal(expr.log10(["get", "value"]), 2)
        const feature: Feature = {
          type: "Unknown",
          properties: { value: 100 },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })
    })

    describe("trigonometric Functions", () => {
      it("should evaluate sine correctly", () => {
        const expression = expr.equal(expr.sin(["get", "angle"]), 1)
        const feature: Feature = {
          type: "Unknown",
          properties: { angle: Math.PI / 2 },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should evaluate cosine correctly", () => {
        const expression = expr.equal(expr.cos(["get", "angle"]), 1)
        const feature: Feature = {
          type: "Unknown",
          properties: { angle: 0 },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })
    })

    describe("min/Max Operations", () => {
      it("should evaluate min correctly", () => {
        const expression = expr.equal(
          expr.min(["get", "value1"], ["get", "value2"]),
          5,
        )
        const feature: Feature = {
          type: "Unknown",
          properties: { value1: 5, value2: 10 },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should evaluate max correctly", () => {
        const expression = expr.equal(
          expr.max(["get", "value1"], ["get", "value2"]),
          10,
        )
        const feature: Feature = {
          type: "Unknown",
          properties: { value1: 5, value2: 10 },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })
    })

    describe("rounding Operations", () => {
      it("should evaluate round correctly", () => {
        const expression = expr.equal(expr.round(["get", "value"]), 2)
        const feature: Feature = {
          type: "Unknown",
          properties: { value: 1.6 },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should evaluate ceil correctly", () => {
        const expression = expr.equal(expr.ceil(["get", "value"]), 2)
        const feature: Feature = {
          type: "Unknown",
          properties: { value: 1.1 },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should evaluate floor correctly", () => {
        const expression = expr.equal(expr.floor(["get", "value"]), 1)
        const feature: Feature = {
          type: "Unknown",
          properties: { value: 1.9 },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })
    })

    describe("edge Cases", () => {
      it("should handle missing properties", () => {
        const expression = expr.equal(expr.sum(["get", "missing"], 5), 5)
        const feature: Feature = {
          type: "Unknown",
          properties: {},
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(false)
      })

      it("should handle division by zero", () => {
        const expression = expr.divide(["get", "value"], 0)
        const feature: Feature = {
          type: "Unknown",
          properties: { value: 10 },
        }
        expect(() =>
          featureFilter(expression).filter({ zoom: 0 }, feature),
        ).toThrow()
      })

      it("should handle invalid logarithm input", () => {
        const expression = expr.log10(["get", "value"])
        const feature: Feature = {
          type: "Unknown",
          properties: { value: -1 },
        }
        expect(() =>
          featureFilter(expression).filter({ zoom: 0 }, feature),
        ).toThrow()
      })
    })
  })
})
