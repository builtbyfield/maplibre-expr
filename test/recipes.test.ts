import { describe, expect, it } from "vitest"

import {
  byZoom,
  byZoomMatch,
  classify,
  colorOr,
  contrastText,
  geometryType,
  get,
  getOr,
  gt,
  ifFeatureState,
  interpolate,
  isNoneOf,
  isOneOf,
  linear,
  match,
  metersToPixels,
  typedFeatureState,
  typedGlobalState,
  typedProperties,
  withAlpha,
  zoom,
} from "../src"
import { evaluate, validate } from "../src/testing"

describe("typed accessors", () => {
  interface Place { name: string, rank: number }
  const place = typedProperties<Place>()

  it("emit plain get/has/feature-state/global-state arrays", () => {
    expect(place.get("rank")).toEqual(["get", "rank"])
    expect(place.has("name")).toEqual(["has", "name"])
    expect(typedFeatureState<{ hover: boolean }>().get("hover")).toEqual(["feature-state", "hover"])
    expect(typedGlobalState<{ now: number }>().get("now")).toEqual(["global-state", "now"])
  })

  it("evaluate like their untyped counterparts", () => {
    expect(evaluate(gt(place.get("rank"), 2), { properties: { rank: 3 } })).toBe(true)
    expect(evaluate(place.getOr("rank", 0), { properties: { rank: "high" } })).toBe(0)
    expect(evaluate(gt(get("ends"), typedGlobalState<{ now: number }>().get("now")), { properties: { ends: 200 }, globalState: { now: 100 } })).toBe(true)
  })
})

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

  it("rejects lists MapLibre would reject", () => {
    expect(() => isOneOf(get("x"), [])).toThrow(RangeError)
    expect(() => isOneOf(get("n"), [1.5, 2])).toThrow(/integers/)
  })
})

describe("color recipes", () => {
  it("withAlpha replaces the alpha channel", () => {
    expect(evaluate(withAlpha("#ff0000", 0.25))).toBe("rgba(255,0,0,0.25)")
    expect(evaluate(withAlpha(get("c"), 0.5), { properties: { c: "rgba(0,0,255,1)" } })).toBe("rgba(0,0,255,0.5)")
  })
})

describe("byZoom defaults", () => {
  it("fades colors linearly, and sizes exponentially", () => {
    expect(byZoom([[10, "#000"], [18, "#fff"]])[1]).toEqual(["linear"])
    expect(evaluate(byZoom([[10, "#000000"], [18, "#ffffff"]]), { zoom: 14 })).toBe("rgba(128,128,128,1)")
    expect(byZoom([[10, 1], [18, get("w")]])[1]).toEqual(["exponential", 1.5])
  })
})

describe("byZoomMatch", () => {
  const roads = byZoomMatch(get("class"), [
    [["motorway", "trunk"], [[5, 1], [18, 20]]],
    ["primary", [[8, 0.5], [12, 3], [18, 12]]],
  ], [[10, 0.5], [18, 4]])
  const ramps: Record<string, unknown> = {
    motorway: interpolate(["exponential", 1.5], zoom(), [[5, 1], [18, 20]]),
    primary: interpolate(["exponential", 1.5], zoom(), [[8, 0.5], [12, 3], [18, 12]]),
    minor: interpolate(["exponential", 1.5], zoom(), [[10, 0.5], [18, 4]]),
  }

  it("is valid where a match of zoom ramps isn't", () => {
    expect(validate(roads, { property: "line-width" })).toEqual({ valid: true, errors: [] })
    expect(validate(match(get("class"), [["motorway", ramps.motorway as never]], ramps.minor as never), { property: "line-width" }).valid).toBe(false)
  })

  it("gives each class exactly its own ramp", () => {
    for (const [cls, ramp] of Object.entries(ramps)) {
      for (let z = 0; z <= 22; z += 0.25) {
        const expected = evaluate(ramp as never, { zoom: z }) as number
        expect(evaluate(roads, { zoom: z, properties: { class: cls } })).toBeCloseTo(expected, 9)
      }
    }
    expect(evaluate(roads, { zoom: 18, properties: { class: "trunk" } })).toBe(20)
  })

  it("supports linear ramps and collapses stops where every class agrees", () => {
    const widths = byZoomMatch(get("c"), [["a", [[0, 1], [10, 5]]]], [[0, 1], [10, 2]], linear())
    expect(widths).toEqual(["interpolate", ["linear"], ["zoom"], 0, 1, 10, ["match", ["get", "c"], "a", 5, 2]])
    expect(evaluate(widths, { zoom: 5, properties: { c: "a" } })).toBe(3)
  })

  it("rejects what it can't merge exactly", () => {
    expect(() => byZoomMatch(get("c"), [["a", [[0, 1], [10, 5]]]], [[0, 1]], ["cubic-bezier", 0, 0, 1, 1])).toThrow(/cubic-bezier/)
    expect(() => byZoomMatch(get("c"), [["a", [[10, 1], [5, 5]]]], [[0, 1]])).toThrow(/ascending/)
    expect(() => byZoomMatch(get("c"), [["a", [[0, get("w") as never]]]], [[0, 1]])).toThrow(TypeError)
    expect(() => byZoomMatch(get("c"), [["a", [[0, 1]]], ["a", [[0, 2]]]], [[0, 1]])).toThrow(/more than once/)
  })
})

describe("classify", () => {
  const fill = classify(get("density"), [10, 50, 100], ["#fee", "#fb9", "#f64", "#c21"], "#ccc")
  const at = (density: unknown): unknown => evaluate(fill, { properties: density === undefined ? {} : { density }, type: "color" })

  it("puts values in classes, with breaks in the class above", () => {
    expect(at(-5)).toBe("rgba(255,238,238,1)")
    expect(at(9.99)).toBe("rgba(255,238,238,1)")
    expect(at(10)).toBe("rgba(255,187,153,1)")
    expect(at(100)).toBe("rgba(204,34,17,1)")
    expect(at(1e9)).toBe("rgba(204,34,17,1)")
  })

  it("gives values that aren't numbers noData, where a plain step fails", () => {
    for (const value of [undefined, null, "15", "", true])
      expect(at(value), JSON.stringify(value)).toBe("rgba(204,204,204,1)")
    expect(at(Number.NaN)).toBe("rgba(204,204,204,1)")
    expect(() => evaluate(["step", ["get", "density"], 1, 10, 2], { properties: {} })).toThrow()
  })

  it("is valid as a fill-color", () => {
    expect(validate(fill, { property: "fill-color" })).toEqual({ valid: true, errors: [] })
  })

  it("rejects breaks and outputs that don't fit", () => {
    expect(() => classify(get("x"), [], [1], 0)).toThrow(RangeError)
    expect(() => classify(get("x"), [1, 2], [1, 2], 0)).toThrow(/need 3 outputs/)
    expect(() => classify(get("x"), [2, 1], [1, 2, 3], 0)).toThrow(/ascending/)
  })
})

describe("contrastText", () => {
  const on = (background: string, options?: Parameters<typeof contrastText>[1]): unknown => evaluate(contrastText(get("bg"), options), { properties: { bg: background }, type: "color" })

  it("picks the color with more contrast by WCAG 2", () => {
    expect(on("#ffd400")).toBe("rgba(0,0,0,1)")
    expect(on("#1a4f8b")).toBe("rgba(255,255,255,1)")
    expect(on("#ff0000")).toBe("rgba(0,0,0,1)")
    // Luminance either side of where black and white tie (about 0.179)
    expect(on("#777777")).toBe("rgba(0,0,0,1)")
    expect(on("#008080")).toBe("rgba(255,255,255,1)")
  })

  it("takes other light and dark colors", () => {
    expect(on("#ffd400", { dark: "#222" })).toBe("rgba(34,34,34,1)")
    expect(on("#1a4f8b", { light: "#ffe" })).toBe("rgba(255,255,238,1)")
  })

  it("is valid as a text-color", () => {
    expect(validate(contrastText(get("bg")), { property: "text-color" })).toEqual({ valid: true, errors: [] })
  })
})

describe("ifFeatureState with priorities", () => {
  const fill = ifFeatureState([["selected", "#e63"], ["hover", "#f80"]], "#888")
  const color = (featureState: object): unknown => evaluate(fill, { featureState, type: "color" })

  it("uses the first state that's set", () => {
    expect(color({ selected: true, hover: true })).toBe("rgba(238,102,51,1)")
    expect(color({ hover: true })).toBe("rgba(255,136,0,1)")
    expect(color({ selected: false })).toBe("rgba(136,136,136,1)")
    expect(color({})).toBe("rgba(136,136,136,1)")
  })
})

describe("isNoneOf", () => {
  it("is true unless the value is listed, including when it's missing", () => {
    const filter = isNoneOf(get("class"), ["service", "track"])
    expect(filter).toEqual(["match", ["get", "class"], ["service", "track"], false, true])
    expect(evaluate(filter, { properties: { class: "track" } })).toBe(false)
    expect(evaluate(filter, { properties: { class: "primary" } })).toBe(true)
    expect(evaluate(filter, { properties: {} })).toBe(true)
    expect(() => isNoneOf(get("x"), [])).toThrow(RangeError)
  })
})

describe("colorOr", () => {
  const color = (c: unknown, hashlessHex?: boolean): unknown =>
    evaluate(colorOr(get("c"), "#3388ff", hashlessHex ? { hashlessHex } : {}), { properties: c === undefined ? {} : { c }, type: "color" })
  const fallback = "rgba(51,136,255,1)"

  it("falls back for values coalesce passes through, which MapLibre draws black", () => {
    for (const c of [undefined, "", "nope", "FF0000", 123, true])
      expect(color(c), JSON.stringify(c)).toBe(fallback)
    expect(() => evaluate(["coalesce", ["get", "c"], "#3388ff"], { properties: { c: "nope" }, type: "color" })).toThrow()
    expect(color("#f00")).toBe("rgba(255,0,0,1)")
    expect(color("teal")).toBe("rgba(0,128,128,1)")
    expect(color("rgb(0, 128, 0)")).toBe("rgba(0,128,0,1)")
  })

  it("reads hex without # when asked", () => {
    expect(color("FF0000", true)).toBe("rgba(255,0,0,1)")
    expect(color("f00", true)).toBe("rgba(255,0,0,1)")
    expect(color("nope", true)).toBe(fallback)
    expect(color(123, true)).toBe(fallback)
    // Why it's opt-in: some words are hex
    expect(color("bad", true)).toBe("rgba(187,170,221,1)")
  })

  it("is valid as a line-color", () => {
    expect(validate(colorOr(get("route_color"), "#38f", { hashlessHex: true }), { property: "line-color" })).toEqual({ valid: true, errors: [] })
  })
})
