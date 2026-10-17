import type { ExpressionSpecification, StyleSpecification } from "@maplibre/maplibre-gl-style-spec"

import { featureFilter, validateStyleMin } from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { add, all, byZoom, elevation, eq, featureState, get, has, image, interpolate, linear, lineProgress, literal, match, toSpec, upcase, zoom } from "../src"
import { evaluate, ExpressionError, validate } from "../src/testing"

describe("validate", () => {
  it("accepts valid expressions", () => {
    expect(validate(add(get("a"), 1))).toEqual({ valid: true, errors: [] })
  })

  it("reports parse errors with their path", () => {
    const bad: ExpressionSpecification = ["+", ["get", "a"], ["upcase", "x"]]
    expect(validate(bad)).toEqual({ valid: false, errors: ["[2]: Expected number but found string instead."] })
  })

  it("checks against an expected type", () => {
    expect(validate(add(1, 2), { type: "number" }).valid).toBe(true)
    expect(validate(add(1, 2), { type: "color" }).valid).toBe(false)
  })

  it("checks against a real layer property, with MapLibre's style validator", () => {
    expect(validate(get("r"), { property: "circle-radius" })).toEqual({ valid: true, errors: [] })
    expect(validate(get("w"), { property: "heatmap-intensity" })).toEqual({ valid: false, errors: ["heatmap-intensity: data expressions not supported"] })
    expect(validate(add(zoom(), 1), { property: "circle-radius" }).errors[0]).toMatch(/"zoom" expression may only be used/)
    expect(validate(featureState("s"), { property: "text-size" }).errors[0]).toMatch(/not supported with layout properties/)
    expect(validate(eq(featureState("x"), true), { property: "filter" }).errors[0]).toMatch(/not supported with filters/)
    expect(validate(add(1, 2), { property: "circle-color" }).errors[0]).toMatch(/Expected color but found number/)
    // Sources are set up for every layer type
    expect(validate(byZoom([[0, 0], [10, 1]]), { property: "raster-opacity" }).valid).toBe(true)
    expect(validate(interpolate(linear(), elevation(), [[0, "#000"], [100, "#fff"]]), { property: "color-relief-color" }).valid).toBe(true)
    expect(validate(byZoom([[0, "#000"], [10, "#fff"]]), { property: "background-color" }).valid).toBe(true)
  })

  it("sets up the source each property needs (line-gradient needs lineMetrics)", () => {
    expect(validate(interpolate(linear(), lineProgress(), [[0, "#000"], [1, "#fff"]]), { property: "line-gradient" })).toEqual({ valid: true, errors: [] })
    expect(validate(get("name"), { property: "text-field" }).valid).toBe(true)
    expect(validate(image("pin"), { property: "icon-image" }).valid).toBe(true)
  })

  it("rejects unknown properties", () => {
    expect(() => validate(get("x"), { property: "nope" as never })).toThrow(TypeError)
  })

  it("rejects filters that aren't booleans, like maplibre-gl does", () => {
    expect(validate(add(1, 2), { property: "filter" })).toEqual({ valid: false, errors: ["filter: Expected boolean but found number instead."] })
    expect(validate(upcase("x"), { property: "filter" })).toEqual({ valid: false, errors: ["filter: Expected boolean but found string instead."] })
    // Checked at runtime, as in maplibre-gl
    expect(validate(get("visible"), { property: "filter" }).valid).toBe(true)
    expect(validate(all(eq(get("a"), 1), has("b")), { property: "filter" }).valid).toBe(true)
    // Legacy filters are left to the style validator
    expect(validate(["==", "class", "park"] as never, { property: "filter" }).valid).toBe(true)
    expect(validate(["in", "class", "park", "garden"] as never, { property: "filter" }).valid).toBe(true)
  })

  it("accepts exactly the filters maplibre-gl's featureFilter accepts", () => {
    const filters: unknown[] = [
      true,
      add(1, 2),
      upcase("x"),
      get("visible"),
      ["to-string", ["get", "x"]],
      ["case", ["has", "a"], 1, 0],
      ["coalesce", ["get", "a"], false],
      eq(get("a"), 1),
      ["==", "class", "park"],
      ["in", "class", "park", "garden"],
    ]
    for (const filter of filters) {
      let accepted = true
      try {
        featureFilter(filter as never, "filter")
      }
      catch {
        accepted = false
      }
      expect(validate(filter as never, { property: "filter" }).valid, JSON.stringify(filter)).toBe(accepted)
    }
  })

  it("reports filter errors under \"filter\"", () => {
    expect(validate(eq(featureState("x"), true), { property: "filter" }).errors).toEqual(["filter: \"feature-state\" data expressions are not supported with filters."])
  })

  it("upstream quirk: the style validator accepts a filter that isn't a boolean, which maplibre-gl then rejects", () => {
    const style = (filter: unknown): StyleSpecification => ({
      version: 8,
      sources: { s: { type: "geojson", data: { type: "FeatureCollection", features: [] } } },
      layers: [{ id: "l", type: "circle", source: "s", filter: filter as never }],
    })
    expect(validateStyleMin(style(["+", 1, 2]))).toEqual([])
    expect(() => featureFilter(["+", 1, 2] as never, "filter")).toThrow(/Expected boolean but found number/)
  })

  it("enforces property-level rules when a type is given", () => {
    const nestedZoom = interpolate(linear(), add(zoom(), 1), [[0, 1], [10, 2]])
    expect(validate(nestedZoom).valid).toBe(true)
    expect(validate(nestedZoom, { type: "number" })).toEqual({
      valid: false,
      errors: ["\"zoom\" expression may only be used as input to a top-level \"step\" or \"interpolate\" expression."],
    })
  })
})

describe("evaluate", () => {
  it("throws ExpressionError for invalid expressions", () => {
    expect(() => evaluate(["+", "a", 1] as never)).toThrow(ExpressionError)
  })

  it("throws ExpressionError for runtime failures instead of falling back", () => {
    try {
      evaluate(["number", ["get", "missing"]] as ExpressionSpecification)
      expect.unreachable()
    }
    catch (error) {
      expect(error).toBeInstanceOf(ExpressionError)
      expect((error as ExpressionError).errors).toEqual(["Expected value to be of type number, but found null instead."])
    }
  })

  it("retries as a color when the type is ambiguous", () => {
    expect(evaluate(interpolate(linear(), zoom(), [[0, "#000000"], [10, "#ffffff"]]), { zoom: 10 })).toBe("rgba(255,255,255,1)")
  })

  it("accepts plain values as well as expressions", () => {
    expect(evaluate(5)).toBe(5)
    expect(evaluate("#f00", { type: "color" })).toBe("rgba(255,0,0,1)")
    expect(validate(true, { property: "filter" })).toEqual({ valid: true, errors: [] })
  })

  it("doesn't retry other types when an explicit type fails", () => {
    expect(() => evaluate(add(1, 2), { type: "color" })).toThrow(ExpressionError)
  })

  it("parses as a number array with type \"array\"", () => {
    expect(evaluate(literal([1, 2]), { type: "array" })).toEqual([1, 2])
    expect(validate(literal([1, 2]), { type: "array" }).valid).toBe(true)
    expect(validate(literal(["a"]), { type: "array" }).valid).toBe(false)
  })

  it("converts padding and number arrays", () => {
    expect(evaluate(literal([1, 2]), { type: "padding" })).toEqual([1, 2, 1, 2])
    expect(evaluate(literal([3, 4]), { type: "numberArray" })).toEqual([3, 4])
  })

  it("parses as the requested type", () => {
    const fill = match(get("t"), [["a", "#f00"]], "#000")
    expect(evaluate(fill)).toBe("#000")
    expect(evaluate(fill, { type: "color" })).toBe("rgba(0,0,0,1)")
  })
})

describe("toSpec", () => {
  it("exposes the underlying array", () => {
    expect(toSpec(add(1, 2))[0]).toBe("+")
  })
})
