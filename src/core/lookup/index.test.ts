import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec"
import { featureFilter } from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { core } from "../index"
import { lookup } from "./index"

describe("lookup", () => {
  describe("compilation", () => {
    it("at", () => {
      const expression = [
        "at",
        1,
        ["literal", ["a", "b", "c"]],
      ] satisfies ExpressionSpecification
      expect(lookup.at(1, ["literal", ["a", "b", "c"]])).toEqual(expression)
    })

    it("in", () => {
      const expression = [
        "in",
        "Point",
        "$type",
      ] satisfies ExpressionSpecification
      expect(lookup.in("Point", "$type")).toEqual(expression)
    })

    it("indexOf", () => {
      const expression = [
        "index-of",
        "foo",
        ["literal", ["bar", "foo", "baz"]],
      ] satisfies ExpressionSpecification
      expect(lookup.indexOf("foo", ["literal", ["bar", "foo", "baz"]])).toEqual(
        expression,
      )
    })

    it("slice with two arguments", () => {
      const expression = [
        "slice",
        ["get", "name"],
        0,
      ] satisfies ExpressionSpecification
      expect(lookup.slice(["get", "name"], 0)).toEqual(expression)
    })

    it("slice with three arguments", () => {
      const expression = [
        "slice",
        ["get", "name"],
        0,
        3,
      ] satisfies ExpressionSpecification
      expect(lookup.slice(["get", "name"], 0, 3)).toEqual(expression)
    })

    it("get with one argument", () => {
      const expression = ["get", "name"] satisfies ExpressionSpecification
      expect(lookup.get("name")).toEqual(expression)
    })

    it("get with two arguments", () => {
      const expression = [
        "get",
        "population",
        ["properties"],
      ] satisfies ExpressionSpecification
      expect(lookup.get("population", ["properties"])).toEqual(expression)
    })

    it("has with one argument", () => {
      const expression = ["has", "name"] satisfies ExpressionSpecification
      expect(lookup.has("name")).toEqual(expression)
    })

    it("has with two arguments", () => {
      const expression = [
        "has",
        "population",
        ["properties"],
      ] satisfies ExpressionSpecification
      expect(lookup.has("population", ["properties"])).toEqual(expression)
    })

    it("length", () => {
      const expression = [
        "length",
        ["get", "coordinates"],
      ] satisfies ExpressionSpecification
      expect(lookup.length(["get", "coordinates"])).toEqual(expression)
    })
  })

  describe("evaluation", () => {
    const mockFeature: Feature = {
      type: "Unknown",
      properties: {
        items: ["a", "b", "c"],
        text: "hello",
        numbers: [1, 2, 3],
        nested: {
          value: 42,
        },
      },
    }

    it("at evaluates array index correctly", () => {
      const expression = lookup.at(1, ["get", "items"])
      const result = featureFilter(core.equal(expression, "b")).filter(
        { zoom: 0 },
        mockFeature,
      )
      expect(result).toBe(true)
    })

    it("at handles last valid index", () => {
      const expression = lookup.at(2, ["get", "items"])
      const result = featureFilter(core.equal(expression, "c")).filter(
        { zoom: 0 },
        mockFeature,
      )
      expect(result).toBe(true)
    })

    it("in evaluates array membership correctly", () => {
      const expression = lookup.in("b", ["get", "items"])
      const result = featureFilter(expression).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(true)
    })

    it("in evaluates string containment correctly", () => {
      const expression = lookup.in("ell", ["get", "text"])
      const result = featureFilter(expression).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(true)
    })

    it("in handles non-existent value in array", () => {
      const expression = lookup.in("nonexistent", ["get", "items"])
      const result = featureFilter(expression).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(false)
    })

    it("in handles non-existent substring", () => {
      const expression = lookup.in("xyz", ["get", "text"])
      const result = featureFilter(expression).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(false)
    })

    it("indexOf finds array element correctly", () => {
      const expression = lookup.indexOf("b", ["get", "items"])
      const result = featureFilter(core.equal(expression, 1)).filter(
        { zoom: 0 },
        mockFeature,
      )
      expect(result).toBe(true)
    })

    it("indexOf finds substring correctly", () => {
      const expression = lookup.indexOf("ell", ["get", "text"])
      const result = featureFilter(core.equal(expression, 1)).filter(
        { zoom: 0 },
        mockFeature,
      )
      expect(result).toBe(true)
    })

    it("indexOf returns -1 for non-existent element", () => {
      const expression = lookup.indexOf("nonexistent", ["get", "items"])
      const result = featureFilter(core.equal(expression, -1)).filter(
        { zoom: 0 },
        mockFeature,
      )
      expect(result).toBe(true)
    })

    it("slice with array works correctly", () => {
      const expression = lookup.slice(["get", "items"], 1, 2)
      const result = featureFilter(
        core.equal(lookup.at(0, expression), "b"),
      ).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(true)
    })

    it("slice with string works correctly", () => {
      const expression = lookup.slice(["get", "text"], 1, 4)
      const result = featureFilter(core.equal(expression, "ell")).filter(
        { zoom: 0 },
        mockFeature,
      )
      expect(result).toBe(true)
    })

    it("slice handles negative start index", () => {
      const expression = lookup.slice(["get", "items"], -2)
      const result = featureFilter(
        core.equal(lookup.at(0, expression), "b"),
      ).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(true)
    })

    it("slice handles negative end index", () => {
      const expression = lookup.slice(["get", "items"], 0, -1)
      const result = featureFilter(
        core.equal(lookup.length(expression), 2),
      ).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(true)
    })

    it("get retrieves property correctly", () => {
      const expression = lookup.get("text")
      const result = featureFilter(core.equal(expression, "hello")).filter(
        { zoom: 0 },
        mockFeature,
      )
      expect(result).toBe(true)
    })

    it("get retrieves nested property correctly", () => {
      const expression = lookup.get("value", ["get", "nested"])
      const result = featureFilter(core.equal(expression, 42)).filter(
        { zoom: 0 },
        mockFeature,
      )
      expect(result).toBe(true)
    })

    it("has detects existing property correctly", () => {
      const expression = lookup.has("text")
      const result = featureFilter(expression).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(true)
    })

    it("has detects missing property correctly", () => {
      const expression = lookup.has("missing")
      const result = featureFilter(expression).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(false)
    })

    it("has detects nested property correctly", () => {
      const expression = lookup.has("value", ["get", "nested"])
      const result = featureFilter(expression).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(true)
    })

    it("length gets array length correctly", () => {
      const expression = lookup.length(["get", "items"])
      const result = featureFilter(core.equal(expression, 3)).filter(
        { zoom: 0 },
        mockFeature,
      )
      expect(result).toBe(true)
    })

    it("length gets string length correctly", () => {
      const expression = lookup.length(["get", "text"])
      const result = featureFilter(core.equal(expression, 5)).filter(
        { zoom: 0 },
        mockFeature,
      )
      expect(result).toBe(true)
    })

    it("length handles empty array", () => {
      const mockEmptyFeature: Feature = {
        type: "Unknown",
        properties: {
          emptyArray: [],
        },
      }
      const expression = lookup.length(["get", "emptyArray"])
      const result = featureFilter(core.equal(expression, 0)).filter(
        { zoom: 0 },
        mockEmptyFeature,
      )
      expect(result).toBe(true)
    })

    it("length handles empty string", () => {
      const mockEmptyFeature: Feature = {
        type: "Unknown",
        properties: {
          emptyString: "",
        },
      }
      const expression = lookup.length(["get", "emptyString"])
      const result = featureFilter(core.equal(expression, 0)).filter(
        { zoom: 0 },
        mockEmptyFeature,
      )
      expect(result).toBe(true)
    })
  })
})
