import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

import { describe, expect, it } from "vitest"

import { add, get, interpolate, linear, match, toSpec, zoom } from "../src"
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
