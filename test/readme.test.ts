import type { LayerSpecification } from "@maplibre/maplibre-gl-style-spec"

import { describe, expect, it } from "vitest"

import {
  add,
  byZoom,
  case_,
  compactNumber,
  divide,
  eq,
  featureState,
  get,
  gt,
  interpolate,
  isOneOf,
  let_,
  linear,
  match,
  numberFormat,
  upcase,
  zoom,
} from "../src"
import { evaluate, validate } from "../src/testing"

describe("rEADME examples", () => {
  it("intro", () => {
    expect(interpolate(linear(), zoom(), [[10, 1], [16, add(get("lanes"), 2)]]))
      .toEqual(["interpolate", ["linear"], ["zoom"], 10, 1, 16, ["+", ["get", "lanes"], 2]])
    // @ts-expect-error the README's compile error
    add(upcase(get("name")), 1)
  })

  it("usage: layers type-check and validate", () => {
    const layers: LayerSpecification[] = [
      {
        id: "parks",
        type: "fill",
        source: "landuse",
        filter: isOneOf(get("class"), ["park", "garden"]),
        paint: {
          "fill-color": case_([
            [eq(featureState("hover"), true), "#2a9d8f"],
            [gt(get("area"), 10_000), "#52b788"],
          ], "#95d5b2"),
          "fill-opacity": byZoom([[8, 0.2], [14, 0.8]]),
        },
      },
      {
        id: "labels",
        type: "symbol",
        source: "places",
        layout: {
          "text-field": match(get("kind"), [
            ["shop", get("name")],
            [["cafe", "bar"], numberFormat(get("rating"), { "max-fraction-digits": 1 })],
          ], ""),
        },
      },
    ]
    const [parks, labels] = layers
    expect(parks?.type === "fill" && validate(parks.paint!["fill-color"] as never, { type: "color" })).toEqual({ valid: true, errors: [] })
    expect(labels?.type === "symbol" && validate(labels.layout!["text-field"] as never, { type: "formatted" })).toEqual({ valid: true, errors: [] })
  })

  it("let_ example", () => {
    const fill = let_({ density: divide(get("pop"), get("area")) }, ({ density }) =>
      interpolate(linear(), density, [[0, "#fff"], [1000, "#f00"]]))
    expect(evaluate(fill, { properties: { pop: 500, area: 1 } })).toBe("rgba(255,128,128,1)")
  })

  it("testing section", () => {
    expect(evaluate(compactNumber(get("count")), { properties: { count: 5_600_000 } })).toBe("5.6M")
    expect(evaluate(interpolate(linear(), zoom(), [[0, "#000"], [10, "#fff"]]), { zoom: 5 })).toBe("rgba(128,128,128,1)")
    expect(() => evaluate(["number", ["get", "missing"]])).toThrow("Expected value to be of type number, but found null instead.")
    expect(validate(["+", 1, ["upcase", "x"]])).toEqual({ valid: false, errors: ["[2]: Expected number but found string instead."] })
  })
})
