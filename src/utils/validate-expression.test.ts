import type {
  ExpressionSpecification,
  StylePropertySpecification,
} from "@maplibre/maplibre-gl-style-spec"

import { ValidationError } from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { validateExpression } from "./validate-expression"

describe("validate-expression", () => {
  // Mock StylePropertySpecification for testing
  const mockValueSpec: StylePropertySpecification = {
    "type": "string",
    "property-type": "data-driven",
    "transition": false,
    "default": "default value",
  }

  // Mock StylePropertySpecification for array types (like text-font)
  const mockArrayValueSpec: StylePropertySpecification = {
    "type": "array",
    "value": "string",
    "property-type": "data-driven",
    "transition": false,
    "default": ["Arial", "sans-serif"],
  }

  // Mock StylePropertySpecification for color types
  const mockColorValueSpec: StylePropertySpecification = {
    "type": "color",
    "property-type": "data-driven",
    "transition": false,
    "default": "#000000",
    "overridable": false,
  }

  describe("basic validation", () => {
    it("should return empty array for valid expression", () => {
      const options = {
        expressionContext: "property" as const,
        value: ["get", "name"],
        valueSpec: mockValueSpec,
        key: "test-key",
      }

      const result = validateExpression(options)
      expect(result).toEqual([])
    })

    it("should return errors for invalid expression", () => {
      const options = {
        expressionContext: "property" as const,
        value: ["invalid-expression"],
        valueSpec: mockValueSpec,
        key: "test-key",
      }

      const result = validateExpression(options)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toBeInstanceOf(ValidationError)
      expect(result[0].message).toContain("invalid-expression")
    })

    it("should work without expressionContext", () => {
      const options = {
        value: ["get", "name"],
        key: "test-key",
      }

      const result = validateExpression(options)
      expect(result).toEqual([])
    })
  })

  describe("property context validation", () => {
    it("should validate property expressions with valueSpec", () => {
      const options = {
        expressionContext: "property" as const,
        value: ["get", "population"],
        valueSpec: mockValueSpec,
        key: "paint.fill-color",
      }

      const result = validateExpression(options)
      expect(result).toEqual([])
    })

    it("should require valueSpec for property context", () => {
      const options = {
        expressionContext: "property" as const,
        value: ["get", "name"],
        key: "test-key",
        // Missing valueSpec - this should cause a type error
      }

      // TypeScript should catch this, but we can test the runtime behavior
      expect(() => validateExpression(options as any)).toThrow()
    })
  })

  describe("text-font validation", () => {
    it("should validate text-font with literal output", () => {
      const options = {
        expressionContext: "property" as const,
        value: ["literal", ["Arial", "sans-serif"]],
        valueSpec: mockArrayValueSpec,
        key: "layout.text-font",
        propertyKey: "text-font",
      }

      const result = validateExpression(options)
      expect(result).toEqual([])
    })

    it("should error for text-font without literal output", () => {
      const options = {
        expressionContext: "property" as const,
        value: ["get", "font"],
        valueSpec: mockArrayValueSpec,
        key: "layout.text-font",
        propertyKey: "text-font",
      }

      const result = validateExpression(options)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].message).toContain("Output values must be contained as literals")
    })
  })

  describe("layout property validation", () => {
    it("should allow state-constant expressions for layout properties", () => {
      const options = {
        expressionContext: "property" as const,
        value: ["get", "name"],
        valueSpec: mockValueSpec,
        key: "layout.visibility",
        propertyType: "layout",
      }

      const result = validateExpression(options)
      expect(result).toEqual([])
    })

    it("should error for feature-state expressions in layout properties", () => {
      const options = {
        expressionContext: "property" as const,
        value: ["feature-state", "hover"],
        valueSpec: mockValueSpec,
        key: "layout.visibility",
        propertyType: "layout",
      }

      const result = validateExpression(options)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].message).toContain("feature-state")
      expect(result[0].message).toContain("layout properties")
    })
  })

  describe("filter validation", () => {
    it("should allow state-constant expressions for filters", () => {
      const options = {
        expressionContext: "filter" as const,
        value: ["==", ["get", "type"], "building"],
        key: "filter",
      }

      const result = validateExpression(options)
      expect(result).toEqual([])
    })

    it("should error for feature-state expressions in filters", () => {
      const options = {
        expressionContext: "filter" as const,
        value: ["==", ["feature-state", "hover"], true],
        key: "filter",
      }

      const result = validateExpression(options)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].message).toContain("feature-state")
      expect(result[0].message).toContain("filters")
    })
  })

  describe("cluster validation", () => {
    it("should allow global-constant expressions for cluster properties", () => {
      const options = {
        expressionContext: "cluster" as const,
        value: ["get", "point_count"],
        key: "cluster",
      }

      const result = validateExpression(options)
      expect(result).toEqual([])
    })

    it("should error for zoom expressions in cluster properties", () => {
      const options = {
        expressionContext: "cluster" as const,
        value: ["zoom"],
        key: "cluster",
      }

      const result = validateExpression(options)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].message).toContain("zoom")
      expect(result[0].message).toContain("cluster properties")
    })

    it("should error for feature-state expressions in cluster properties", () => {
      const options = {
        expressionContext: "cluster" as const,
        value: ["feature-state", "hover"],
        key: "cluster",
      }

      const result = validateExpression(options)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].message).toContain("feature-state")
      expect(result[0].message).toContain("cluster properties")
    })
  })

  describe("cluster-initial validation", () => {
    it("should allow feature-constant expressions for cluster-initial", () => {
      const options = {
        expressionContext: "cluster-initial" as const,
        value: ["literal", 0], // Use literal instead of get for feature-constant
        key: "cluster-initial",
      }

      const result = validateExpression(options)
      expect(result).toEqual([])
    })

    it("should error for non-feature-constant expressions in cluster-initial", () => {
      const options = {
        expressionContext: "cluster-initial" as const,
        value: ["+", ["get", "point_count"], 1],
        key: "cluster-initial",
      }

      const result = validateExpression(options)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].message).toContain("Feature data expressions are not supported")
    })
  })

  describe("error handling", () => {
    it("should handle parsing errors", () => {
      const options = {
        expressionContext: "property" as const,
        value: ["invalid", "expression", "format"],
        valueSpec: mockValueSpec,
        key: "test-key",
      }

      const result = validateExpression(options)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toBeInstanceOf(ValidationError)
    })

    it("should preserve error context in error messages", () => {
      const options = {
        expressionContext: "property" as const,
        value: ["invalid"],
        valueSpec: mockValueSpec,
        key: "paint.fill-color",
      }

      const result = validateExpression(options)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].message).toContain("paint.fill-color")
    })
  })

  describe("deepUnbundle functionality", () => {
    it("should handle bundled values", () => {
      const bundledValue = String("test")
      const options = {
        expressionContext: "property" as const,
        value: ["get", bundledValue],
        valueSpec: mockValueSpec,
        key: "test-key",
      }

      const result = validateExpression(options)
      expect(result).toEqual([])
    })

    it("should handle nested bundled values", () => {
      const bundledString = String("name")
      const options = {
        expressionContext: "property" as const,
        value: ["get", bundledString, ["properties"]],
        valueSpec: mockValueSpec,
        key: "test-key",
      }

      const result = validateExpression(options)
      expect(result).toEqual([])
    })

    it("should handle Number objects", () => {
      const bundledNumber = Number(42)
      const options = {
        expressionContext: "property" as const,
        value: ["get", bundledNumber],
        valueSpec: mockValueSpec,
        key: "test-key",
      }

      const result = validateExpression(options)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toBeInstanceOf(ValidationError)
    })

    it("should handle Boolean objects", () => {
      const bundledBoolean = Boolean(true)
      const options = {
        expressionContext: "property" as const,
        value: ["get", bundledBoolean],
        valueSpec: mockValueSpec,
        key: "test-key",
      }

      const result = validateExpression(options)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toBeInstanceOf(ValidationError)
    })

    it("should handle nested object structures", () => {
      const nestedObject = {
        level1: {
          level2: {
            level3: ["get", "property"],
          },
        },
      }
      const options = {
        expressionContext: "property" as const,
        value: nestedObject,
        valueSpec: mockValueSpec,
        key: "test-key",
      }

      const result = validateExpression(options)
      // This should fail validation since it's not a valid expression format
      expect(result.length).toBeGreaterThan(0)
    })

    it("should handle objects with bundled values in properties", () => {
      const objectWithBundledValues = {
        stringProp: String("test"),
        numberProp: Number(123),
        booleanProp: Boolean(false),
        arrayProp: [String("get"), String("property")],
      }
      const options = {
        expressionContext: "property" as const,
        value: objectWithBundledValues,
        valueSpec: mockValueSpec,
        key: "test-key",
      }

      const result = validateExpression(options)
      // This should fail validation since it's not a valid expression format
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe("complex expressions", () => {
    it("should validate complex conditional expressions", () => {
      const options = {
        expressionContext: "property" as const,
        value: [
          "case",
          [">", ["get", "population"], 1000000],
          "#ff0000",
          [">", ["get", "population"], 100000],
          "#ff9900",
          "#0099ff",
        ] as ExpressionSpecification,
        valueSpec: mockColorValueSpec,
        key: "paint.fill-color",
      }

      const result = validateExpression(options)
      expect(result).toEqual([])
    })

    it("should validate interpolation expressions", () => {
      const options = {
        expressionContext: "property" as const,
        value: [
          "interpolate",
          ["linear"],
          ["get", "population"],
          0,
          "#ffffff",
          1000000,
          "#ff0000",
        ] as ExpressionSpecification,
        valueSpec: mockColorValueSpec,
        key: "paint.fill-color",
      }

      const result = validateExpression(options)
      expect(result).toEqual([])
    })
  })

  describe("edge cases", () => {
    it("should handle null values", () => {
      const options = {
        expressionContext: "property" as const,
        value: null,
        valueSpec: mockValueSpec,
        key: "test-key",
      }

      const result = validateExpression(options)
      expect(result.length).toBeGreaterThan(0)
    })

    it("should handle undefined values", () => {
      const options = {
        expressionContext: "property" as const,
        value: undefined,
        valueSpec: mockValueSpec,
        key: "test-key",
      }

      const result = validateExpression(options)
      expect(result.length).toBeGreaterThan(0)
    })

    it("should handle empty arrays", () => {
      const options = {
        expressionContext: "property" as const,
        value: [],
        valueSpec: mockValueSpec,
        key: "test-key",
      }

      const result = validateExpression(options)
      expect(result.length).toBeGreaterThan(0)
    })

    it("should handle non-array expressions", () => {
      const options = {
        expressionContext: "property" as const,
        value: "not an expression",
        valueSpec: mockValueSpec,
        key: "test-key",
      }

      const result = validateExpression(options)
      // The validation function handles non-array expressions by treating them as literals
      // This is actually valid behavior, so we expect no errors
      expect(result).toEqual([])
    })
  })
})
