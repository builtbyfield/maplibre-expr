import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { testExpressionValue } from "../../utils/test-utils"
import { variables } from "./index"

describe("variables", () => {
  describe("compilation", () => {
    describe("var", () => {
      it("should compile to a var expression", () => {
        const expression = variables.var("myVariable")
        const compiled = [
          "var",
          "myVariable",
        ] satisfies ExpressionSpecification
        expect(expression).toEqual(compiled)
      })
    })

    describe("let", () => {
      it("should compile with single variable binding", () => {
        const expression = variables.let(
          [{ name: "x", value: 10 }],
          variables.var("x"),
        )
        const compiled = [
          "let",
          "x",
          10,
          ["var", "x"],
        ] satisfies ExpressionSpecification
        expect(expression).toEqual(compiled)
      })

      it("should compile with multiple variable bindings", () => {
        const expression = variables.let(
          [
            { name: "x", value: 10 },
            { name: "y", value: 20 },
          ],
          ["+", variables.var("x"), variables.var("y")],
        )
        const compiled = [
          "let",
          "x",
          10,
          "y",
          20,
          ["+", ["var", "x"], ["var", "y"]],
        ] satisfies ExpressionSpecification
        expect(expression).toEqual(compiled)
      })

      it("should compile with expression values", () => {
        const expression = variables.let(
          [{ name: "population", value: ["get", "pop"] }],
          ["/", variables.var("population"), 1000],
        )
        const compiled = [
          "let",
          "population",
          ["get", "pop"],
          ["/", ["var", "population"], 1000],
        ] satisfies ExpressionSpecification
        expect(expression).toEqual(compiled)
      })

      it("should compile nested let expressions", () => {
        const expression = variables.let(
          [{ name: "x", value: 5 }],
          variables.let(
            [{ name: "y", value: variables.var("x") }],
            ["*", variables.var("x"), variables.var("y")],
          ),
        )
        const compiled = [
          "let",
          "x",
          5,
          [
            "let",
            "y",
            ["var", "x"],
            ["*", ["var", "x"], ["var", "y"]],
          ],
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
        population: 50000,
        area: 1000,
        temperature: 25,
      },
    }

    describe("simple variable binding", () => {
      it("should bind and return a literal value", () => {
        const expression = variables.let(
          [{ name: "answer", value: 42 }],
          variables.var("answer"),
        )
        testExpressionValue(expression, feature, 42)
      })

      it("should bind and return a string value", () => {
        const expression = variables.let(
          [{ name: "greeting", value: "Hello" }],
          variables.var("greeting"),
        )
        testExpressionValue(expression, feature, "Hello")
      })
    })

    describe("arithmetic with variables", () => {
      it("should perform addition with variables", () => {
        const expression = variables.let(
          [
            { name: "a", value: 10 },
            { name: "b", value: 20 },
          ],
          ["+", variables.var("a"), variables.var("b")],
        )
        testExpressionValue(expression, feature, 30)
      })

      it("should perform multiplication with variables", () => {
        const expression = variables.let(
          [
            { name: "base", value: 5 },
            { name: "multiplier", value: 4 },
          ],
          ["*", variables.var("base"), variables.var("multiplier")],
        )
        testExpressionValue(expression, feature, 20)
      })

      it("should handle complex arithmetic chains", () => {
        const expression = variables.let(
          [
            { name: "x", value: 2 },
            { name: "y", value: 3 },
            { name: "z", value: 4 },
          ],
          ["+", ["*", variables.var("x"), variables.var("y")], variables.var("z")],
        )
        // (2 * 3) + 4 = 10
        testExpressionValue(expression, feature, 10)
      })
    })

    describe("feature data integration", () => {
      it("should bind feature properties to variables", () => {
        const expression = variables.let(
          [{ name: "pop", value: ["get", "population"] }],
          variables.var("pop"),
        )
        testExpressionValue(expression, feature, 50000)
      })

      it("should calculate density using variables", () => {
        const expression = variables.let(
          [
            { name: "pop", value: ["get", "population"] },
            { name: "area", value: ["get", "area"] },
          ],
          ["/", variables.var("pop"), variables.var("area")],
        )
        // 50000 / 1000 = 50
        testExpressionValue(expression, feature, 50)
      })

      it("should use variables in conditional logic", () => {
        const expression = variables.let(
          [{ name: "temp", value: ["get", "temperature"] }],
          [
            "case",
            [">", variables.var("temp"), 30],
            "hot",
            [">", variables.var("temp"), 15],
            "warm",
            "cool",
          ],
        )
        testExpressionValue(expression, feature, "warm")
      })
    })

    describe("variable reuse and dependency", () => {
      it("should allow variable reuse in calculation", () => {
        const expression = variables.let(
          [{ name: "value", value: 6 }],
          ["*", variables.var("value"), variables.var("value")],
        )
        // 6 * 6 = 36
        testExpressionValue(expression, feature, 36)
      })

      it("should handle dependent variables with nested let", () => {
        const expression = variables.let(
          [{ name: "base", value: ["get", "population"] }],
          variables.let(
            [{ name: "scaled", value: ["/", variables.var("base"), 1000] }],
            variables.var("scaled"),
          ),
        )
        // 50000 / 1000 = 50
        testExpressionValue(expression, feature, 50)
      })

      it("should handle multiple dependent calculations with nested lets", () => {
        const expression = variables.let(
          [
            { name: "pop", value: ["get", "population"] },
            { name: "area", value: ["get", "area"] },
          ],
          variables.let(
            [{ name: "density", value: ["/", variables.var("pop"), variables.var("area")] }],
            variables.let(
              [{ name: "category", value: [
                "case",
                [">", variables.var("density"), 100],
                "dense",
                [">", variables.var("density"), 50],
                "medium",
                "sparse",
              ] }],
              variables.var("category"),
            ),
          ),
        )
        testExpressionValue(expression, feature, "sparse")
      })
    })

    describe("nested let expressions", () => {
      it("should handle nested variable scoping", () => {
        const expression = variables.let(
          [{ name: "outer", value: 10 }],
          variables.let(
            [{ name: "inner", value: 5 }],
            ["+", variables.var("outer"), variables.var("inner")],
          ),
        )
        testExpressionValue(expression, feature, 15)
      })

      it("should allow inner variables to reference outer variables", () => {
        const expression = variables.let(
          [{ name: "base", value: 100 }],
          variables.let(
            [{ name: "doubled", value: ["*", variables.var("base"), 2] }],
            variables.var("doubled"),
          ),
        )
        testExpressionValue(expression, feature, 200)
      })
    })

    describe("edge cases", () => {
      it("should handle zero values", () => {
        const expression = variables.let(
          [{ name: "zero", value: 0 }],
          variables.var("zero"),
        )
        testExpressionValue(expression, feature, 0)
      })

      it("should handle negative values", () => {
        const expression = variables.let(
          [{ name: "negative", value: -42 }],
          variables.var("negative"),
        )
        testExpressionValue(expression, feature, -42)
      })

      it("should handle boolean values", () => {
        const expression = variables.let(
          [{ name: "flag", value: true }],
          variables.var("flag"),
        )
        testExpressionValue(expression, feature, true)
      })
    })
  })

  describe("real-world usage patterns", () => {
    const feature: Feature = {
      type: "Feature",
      geometry: { type: "Point", coordinates: [0, 0] },
      properties: {
        revenue: 100000,
        expenses: 75000,
        employees: 50,
      },
    }

    it("should calculate profit margin", () => {
      const expression = variables.let(
        [
          { name: "revenue", value: ["get", "revenue"] },
          { name: "expenses", value: ["get", "expenses"] },
        ],
        variables.let(
          [{ name: "profit", value: ["-", variables.var("revenue"), variables.var("expenses")] }],
          variables.let(
            [{ name: "margin", value: ["/", variables.var("profit"), variables.var("revenue")] }],
            ["*", variables.var("margin"), 100], // Convert to percentage
          ),
        ),
      )
      // (100000 - 75000) / 100000 * 100 = 25
      testExpressionValue(expression, feature, 25)
    })

    it("should categorize companies by size and efficiency", () => {
      const expression = variables.let(
        [
          { name: "employees", value: ["get", "employees"] },
          { name: "revenue", value: ["get", "revenue"] },
        ],
        variables.let(
          [{ name: "revenuePerEmployee", value: ["/", variables.var("revenue"), variables.var("employees")] }],
          variables.let(
            [
              { name: "size", value: [
                "case",
                [">", variables.var("employees"), 100],
                "large",
                [">", variables.var("employees"), 20],
                "medium",
                "small",
              ] },
              { name: "efficiency", value: [
                "case",
                [">", variables.var("revenuePerEmployee"), 5000],
                "high",
                [">", variables.var("revenuePerEmployee"), 2000],
                "medium",
                "low",
              ] },
            ],
            ["concat", variables.var("size"), "-", variables.var("efficiency")],
          ),
        ),
      )
      // 100000 / 50 = 2000, which is NOT > 2000 (so "low" efficiency), 50 employees (medium size)
      testExpressionValue(expression, feature, "medium-low")
    })
  })
})
