import type { LayerSpecification } from "@maplibre/maplibre-gl-style-spec"

import type { Expr, GlobalStateMap, NumberInput, Stops } from "../src"

import { describe, expect, it } from "vitest"

import {
  all,
  byZoom,
  case_,
  coalesce,
  compactNumber,
  divide,
  eq,
  featureState,
  get,
  globalState,
  gt,
  image,
  interpolate,
  isOneOf,
  let_,
  linear,
  localizedName,
  lte,
  match,
  numberFormat,
  syncGlobalState,
  typedGlobalState,
  typedProperties,
  zoom,
} from "../src"
import { evaluate, validate } from "../src/testing"

describe("rEADME examples", () => {
  it("intro", () => {
    const road = typedProperties<{ class: "motorway" | "trunk" | "primary" | "minor" }>()
    const isMajor = isOneOf(road.get("class"), ["motorway", "trunk", "primary"])
    expect(isMajor).toEqual(["match", ["get", "class"], ["motorway", "trunk", "primary"], true, false])
    // @ts-expect-error the README's compile error
    isOneOf(road.get("class"), ["motorway", "primray"])
    expect(evaluate(isMajor, { properties: { class: "minor" } })).toBe(false)
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

  it("typed feature data", () => {
    interface Place { name: string, rank: number, kind: "park" | "lake" }
    const place = typedProperties<Place>()
    const app = typedGlobalState<{ now: number }>()
    expect(gt(place.get("rank"), 3)).toEqual([">", ["get", "rank"], 3])
    // @ts-expect-error not "park" | "lake"
    eq(place.get("kind"), "lak")
    // @ts-expect-error no such property
    place.get("rnak")
    expect(evaluate(place.getOr("rank", 0))).toBe(0)
    // @ts-expect-error no such global state
    gt(get("ends_at"), app.get("nwo"))
  })

  it("global state", () => {
    const filter = gt(get("ends_at"), globalState("now"))
    expect(evaluate(filter, { properties: { ends_at: 200 }, globalState: { now: 100 } })).toBe(true)
    const map: GlobalStateMap = { getGlobalState: () => ({}), setGlobalStateProperty: () => {}, on: () => {}, off: () => {} }
    expect(typeof syncGlobalState(map, "now", Date.now())).toBe("function")
  })

  it("writing your own helpers", () => {
    function isOpenAt(time: NumberInput): Expr<boolean> {
      return all(lte(get("opens"), time), gt(get("closes"), time))
    }
    function widthRamp(stops: Stops<NumberInput>): Expr<number> {
      return byZoom(stops, linear())
    }
    expect(evaluate(isOpenAt(12), { properties: { opens: 9, closes: 17 } })).toBe(true)
    expect(evaluate(widthRamp([[10, 1], [20, 3]]), { zoom: 15 })).toBe(2)
  })

  it("labels in the reader's language", () => {
    const layout = { "text-field": localizedName([globalState("lang"), "en"], { secondLine: "name" }) }
    expect(evaluate(layout["text-field"], { properties: { "name": "München", "name:en": "Munich" }, globalState: { lang: "de-x" } })).toBe("Munich\nMünchen")
  })

  it("compact numbers in any locale", () => {
    const at = (n: number, options?: Parameters<typeof compactNumber>[1]): unknown => evaluate(compactNumber(get("n"), options), { properties: { n } })
    expect([at(1234), at(56_789)]).toEqual(["1.2K", "57K"])
    expect(at(1_234_567, { locale: "de" })).toBe("1,2\u00A0Mio.")
    expect(at(1_234_567, { locale: "en-IN", currency: "INR" })).toBe("₹12L")
    expect(at(9876, { minimum: 10_000 })).toBe("9,876")
    expect(at(1536, { scales: [[1024, " KB"], [1024 ** 2, " MB"]] })).toBe("1.5 KB")
  })

  it("gotcha: icons missing from the sprite", () => {
    const icon = coalesce(image(get("subclass")), image(get("class")))
    const properties = { subclass: "furniture", class: "shop" }
    expect(evaluate(icon, { properties, availableImages: ["shop"] })).toBe("shop")
    expect(evaluate(icon, { properties, availableImages: ["shop", "furniture"] })).toBe("furniture")
    expect(evaluate(icon, { properties, availableImages: [] })).toBe("furniture")
  })
})
