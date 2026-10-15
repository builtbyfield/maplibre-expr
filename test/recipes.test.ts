import { describe, expect, it } from "vitest"

import {
  between,
  byZoom,
  compactNumber,
  geometryType,
  get,
  getOr,
  ifFeatureState,
  isOneOf,
  linear,
  matchRecord,
  metersToPixels,
  mixColors,
  withAlpha,
} from "../src"
import { evaluate, validate } from "../src/testing"

describe("byZoom", () => {
  it("interpolates numbers exponentially by default", () => {
    const width = byZoom([[10, 1], [18, 8]])
    expect(width).toEqual(["interpolate", ["exponential", 1.5], ["zoom"], 10, 1, 18, 8])
    expect(evaluate(width, { zoom: 10 })).toBe(1)
    expect(evaluate(width, { zoom: 14 })).toBeLessThan(4.5) // exponential: below the linear midpoint
  })

  it("interpolates colors with a chosen curve", () => {
    expect(evaluate(byZoom([[0, "#000000"], [10, "#ffffff"]], linear()), { zoom: 5 })).toBe("rgba(128,128,128,1)")
  })
})

describe("metersToPixels", () => {
  // MapLibre: 512px tiles, so meters/pixel at zoom z = 40075016.686 * cos(lat) / (512 * 2^z)
  const expected = (meters: number, lat: number, z: number): number =>
    meters / (40_075_016.686 * Math.cos((lat * Math.PI) / 180) / (512 * 2 ** z))

  it.each([[0, 0], [52.5, 12], [-33.9, 16.5]])("matches the ground resolution at lat %d, zoom %d", (lat, z) => {
    expect(evaluate(metersToPixels(500, lat), { zoom: z })).toBeCloseTo(expected(500, lat, z), 6)
  })

  it("accepts data-driven meters and latitude", () => {
    const radius = metersToPixels(get("radius"), get("lat"))
    expect(evaluate(radius, { zoom: 14, properties: { radius: 250, lat: 40 } })).toBeCloseTo(expected(250, 40, 14), 6)
  })
})

describe("ifFeatureState", () => {
  const color = ifFeatureState("hover", "#f80", "#888")

  it("treats an unset state as false", () => {
    expect(evaluate(color, { type: "color" })).toBe("rgba(136,136,136,1)")
  })

  it("switches on the state", () => {
    expect(evaluate(color, { type: "color", featureState: { hover: true } })).toBe("rgba(255,136,0,1)")
  })
})

describe("getOr", () => {
  it("falls back when missing or of the wrong type", () => {
    expect(evaluate(getOr("name", "Unnamed"), { properties: { name: "Oslo" } })).toBe("Oslo")
    expect(evaluate(getOr("name", "Unnamed"))).toBe("Unnamed")
    expect(evaluate(getOr("name", "Unnamed"), { properties: { name: 42 } })).toBe("Unnamed")
    expect(evaluate(getOr("height", 0), { properties: { height: "tall" } })).toBe(0)
    expect(evaluate(getOr("open", false), { properties: { open: true } })).toBe(true)
  })
})

describe("isOneOf", () => {
  it("compiles to a match and dedupes values", () => {
    expect(isOneOf(get("class"), ["a", "b", "a"])).toEqual(["match", ["get", "class"], ["a", "b"], true, false])
  })

  it("evaluates membership", () => {
    const filter = isOneOf(get("class"), ["primary", "secondary"])
    expect(evaluate(filter, { properties: { class: "secondary" } })).toBe(true)
    expect(evaluate(filter, { properties: { class: "service" } })).toBe(false)
    expect(evaluate(isOneOf(geometryType(), ["LineString", "Polygon"]))).toBe(false)
  })

  it("rejects an empty list", () => {
    expect(() => isOneOf(get("x"), [])).toThrow(RangeError)
  })
})

describe("between", () => {
  it("is inclusive", () => {
    const decade = between(get("year"), 1990, 1999)
    expect(evaluate(decade, { properties: { year: 1990 } })).toBe(true)
    expect(evaluate(decade, { properties: { year: 1999 } })).toBe(true)
    expect(evaluate(decade, { properties: { year: 2000 } })).toBe(false)
  })
})

describe("matchRecord", () => {
  it("maps keys to outputs", () => {
    const fill = matchRecord(get("landuse"), { park: "#9c6", water: "#7bd" }, "#ccc")
    expect(fill).toEqual(["match", ["get", "landuse"], "park", "#9c6", "water", "#7bd", "#ccc"])
    expect(evaluate(fill, { properties: { landuse: "water" }, type: "color" })).toBe("rgba(119,187,221,1)")
  })

  it("rejects an empty record", () => {
    expect(() => matchRecord(get("x"), {}, 0)).toThrow(RangeError)
  })
})

describe("compactNumber", () => {
  it.each([
    [0, "0"],
    [999, "999"],
    [1234, "1.2k"],
    [56_789, "56.8k"],
    [5_600_000, "5.6M"],
    [2_100_000_000, "2.1B"],
    [-1500, "-1.5k"],
  ])("formats %d as %s", (n, text) => {
    expect(evaluate(compactNumber(get("n"), { locale: "en-US" }), { properties: { n } })).toBe(text)
  })

  it("respects fraction digits and locale", () => {
    expect(evaluate(compactNumber(1234, { locale: "de-DE", maxFractionDigits: 2 }))).toBe("1,23k")
  })
})

describe("color recipes", () => {
  it("withAlpha replaces the alpha channel", () => {
    expect(evaluate(withAlpha("#ff0000", 0.25))).toBe("rgba(255,0,0,0.25)")
    expect(evaluate(withAlpha(get("c"), 0.5), { properties: { c: "rgba(0,0,255,1)" } })).toBe("rgba(0,0,255,0.5)")
  })

  it("mixColors blends between two colors", () => {
    expect(evaluate(mixColors("#000000", "#ffffff", 0.5))).toBe("rgba(128,128,128,1)")
    expect(evaluate(mixColors("#000000", "#ffffff", 0))).toBe("rgba(0,0,0,1)")
    for (const space of ["hcl", "lab"] as const)
      expect(validate(mixColors("#f00", "#00f", get("t"), space))).toEqual({ valid: true, errors: [] })
  })
})
