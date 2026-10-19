import type { LayerSpecification } from "@maplibre/maplibre-gl-style-spec"

import { describe, expect, it } from "vitest"

import { add, byZoom, byZoomMatch, case_, classify, compactNumber, contrastText, eq, get, globalState, ifFeatureState, interpolate, isNoneOf, isOneOf, linear, localizedName, toColorOr, zoom } from "../src"
import { evaluate, lintStyle } from "../src/testing"

function style(...layers: unknown[]): object {
  return {
    version: 8,
    sources: { s: { type: "geojson", data: { type: "FeatureCollection", features: [] } } },
    layers,
  }
}
const circle = (id: string, rest: object): LayerSpecification => ({ id, type: "circle", source: "s", ...rest }) as LayerSpecification

describe("lintStyle", () => {
  it("returns nothing for a clean style", () => {
    expect(lintStyle(style(
      circle("a", { filter: isOneOf(get("class"), ["park"]), paint: { "circle-radius": byZoom([[0, 1], [10, add(get("r"), 1)]]) } }),
      circle("legacy", { filter: ["==", "class", "park"], paint: { "circle-color": { stops: [[0, "#fff"], [10, "#000"]] } } }),
    ))).toEqual([])
  })

  it("reports the style validator's errors by layer id and property", () => {
    expect(lintStyle({
      version: 8,
      sources: { s: { type: "geojson" } },
      layers: [
        { id: "no-source", type: "circle" },
        circle("bad-paint", { paint: { "circle-color": ["+", 1, ["upcase", "x"]] }, layout: { visibility: "nope" } }),
        circle("bad-filter", { filter: ["==", ["get", "a"]] }),
      ],
    })).toEqual([
      { rule: "spec", message: "sources.s: missing required property \"data\"" },
      { rule: "spec", layer: "no-source", message: "missing required property \"source\"" },
      { rule: "spec", layer: "bad-paint", property: "circle-color", message: "[2]: Expected number but found string instead." },
      { rule: "spec", layer: "bad-paint", property: "visibility", message: "expected one of [visible, none], \"nope\" found" },
      { rule: "spec", layer: "bad-filter", property: "filter", message: "Expected two or three arguments." },
    ])
  })

  it("reports filters that aren't booleans, which maplibre-gl throws for", () => {
    expect(lintStyle(style(
      circle("sum", { filter: add(1, 2) }),
      circle("nested", { filter: ["all", ["has", "a"], ["get", "b"]] }),
      circle("value", { filter: get("visible") }),
    ))).toEqual([
      { rule: "filter-type", layer: "sum", property: "filter", message: "Expected boolean but found number instead." },
    ])
  })

  it("reports comparisons of two literals in paint and layout properties", () => {
    expect(lintStyle(style(
      circle("a", {
        paint: { "circle-radius": ["case", ["==", "class", "park"], 5, 1] },
        layout: { "circle-sort-key": ["case", ["!=", "$type", "Point"], 1, 0] },
      }),
    ))).toEqual([
      { rule: "constant-comparison", layer: "a", property: "circle-radius", message: "[1]: [\"==\",\"class\",\"park\"] compares two literals, so it's constant. If \"class\" is meant to be read from the feature, use [\"get\",\"class\"]." },
      { rule: "constant-comparison", layer: "a", property: "circle-sort-key", message: "[1]: [\"!=\",\"$type\",\"Point\"] compares two literals, so it's constant. If \"$type\" is meant to be read from the feature, use [\"geometry-type\"]." },
    ])
    // It really is constant
    expect(evaluate(["case", ["==", "class", "park"], 5, 1], { properties: { class: "park" } })).toBe(1)
  })

  it("leaves comparisons alone where they aren't constant or aren't expressions", () => {
    expect(lintStyle(style(
      circle("a", {
        paint: {
          "circle-radius": case_([[eq(get("class"), "park"), 5], [eq("park", get("class")), 4]], 1),
          "circle-color": ["match", ["get", "op"], ["==", "<"], "#f00", "#000"],
          "circle-stroke-width": ["length", ["literal", ["==", "class", "park"]]],
        },
      }),
    ))).toEqual([])
  })

  it("reports fades to a transparent color that blend the color too", () => {
    expect(lintStyle(style(
      circle("a", {
        paint: {
          "circle-color": interpolate(linear(), zoom(), [[0, "#ffffff"], [10, "transparent"]]),
          "circle-stroke-color": { stops: [[0, "transparent"], [10, "hsl(0, 100%, 50%)"]] },
        },
      }),
    ))).toEqual([
      { rule: "transparent-fade", layer: "a", property: "circle-color", message: "[6]: fades \"#ffffff\" to \"transparent\", which is transparent black, so the color darkens on the way. Fade to \"rgba(255,255,255,0)\" instead." },
      { rule: "transparent-fade", layer: "a", property: "circle-stroke-color", message: ".stops[0][1]: fades \"hsl(0, 100%, 50%)\" to \"transparent\", which is transparent black, so the color darkens on the way. Fade to \"rgba(255,0,0,0)\" instead." },
    ])
  })

  it("finds fades inside other expressions", () => {
    const fade = interpolate(linear(), get("t"), [[0, "#f00"], [1, "transparent"]])
    expect(lintStyle(style(circle("a", { paint: { "circle-color": case_([[eq(get("x"), 1), fade]], "#000") } })))[0]?.message).toMatch(/^\[2\]\[6\]: fades "#f00"/)
  })

  it("reports heatmaps that start from transparent black", () => {
    const issues = lintStyle(style({
      id: "heat",
      type: "heatmap",
      source: "s",
      paint: { "heatmap-color": ["interpolate", ["linear"], ["heatmap-density"], 0, "rgba(0,0,0,0)", 1, "rgb(49,54,149)"] },
    }))
    expect(issues.map(issue => issue.message)).toEqual(["[4]: fades \"rgb(49,54,149)\" to \"rgba(0,0,0,0)\", which is transparent black, so the color darkens on the way. Fade to \"rgba(49,54,149,0)\" instead."])
    expect(evaluate(["interpolate", ["linear"], ["heatmap-density"], 0, "rgba(0,0,0,0)", 1, "rgb(49,54,149)"] as never, { heatmapDensity: 0.5, type: "color" })).toBe("rgba(25,27,75,0.5)")
  })

  it("leaves colored transparent stops alone, which blend hues on purpose", () => {
    // Mapbox's heatmap example
    expect(lintStyle(style({
      id: "heat",
      type: "heatmap",
      source: "s",
      paint: { "heatmap-color": ["interpolate", ["linear"], ["heatmap-density"], 0, "rgba(33,102,172,0)", 0.2, "rgb(103,169,207)", 1, "rgb(178,24,43)"] },
    }))).toEqual([])
  })

  it("leaves fades alone that keep the color, start from black, or don't blend", () => {
    expect(lintStyle(style(
      circle("a", {
        paint: {
          "circle-color": interpolate(linear(), zoom(), [[0, "#ffffff"], [10, "rgba(255,255,255,0)"]]),
          "circle-stroke-color": interpolate(linear(), zoom(), [[0, "#000"], [10, "transparent"]]),
        },
      }),
      circle("b", {
        paint: {
          "circle-color": ["step", ["zoom"], "#fff", 10, "transparent"],
          "circle-stroke-color": { type: "interval", stops: [[0, "#fff"], [10, "transparent"]] },
        },
      }),
    ))).toEqual([])
  })

  it("is right that fading to \"transparent\" passes through grey", () => {
    const halfway = (to: string): unknown => evaluate(interpolate(linear(), zoom(), [[0, "#ffffff"], [10, to]]), { zoom: 5 })
    expect(halfway("transparent")).toBe("rgba(128,128,128,0.5)")
    expect(halfway("rgba(255,255,255,0)")).toBe("rgba(255,255,255,0.5)")
  })

  it("doesn't trip over layers that aren't objects", () => {
    // MapLibre's validator throws on these; lintStyle reports them and checks the other layers
    expect(lintStyle(style(null, circle("bad", { paint: { "circle-radius": "big" } }), 5))).toEqual([
      { rule: "spec", message: "layer must be an object, got null" },
      { rule: "spec", layer: "bad", property: "circle-radius", message: "number expected, string found" },
      { rule: "spec", message: "layer must be an object, got number" },
    ])
  })

  it("handles odd shapes: no layers, array layers, a whole-property comparison, malformed legacy stops", () => {
    expect(lintStyle({ version: 8, sources: {} })).toEqual([{ rule: "spec", message: "missing required property \"layers\"" }])
    expect(lintStyle(style([]))).toEqual([{ rule: "spec", message: "layer must be an object, got an array" }])
    const issues = lintStyle(style({ id: "f", type: "fill", source: "s", paint: { "fill-antialias": ["==", "a", "b"], "fill-color": { stops: [[0, "#fff"], "x"] } } }))
    expect(issues.filter(issue => issue.rule !== "spec")).toEqual([
      { rule: "constant-comparison", layer: "f", property: "fill-antialias", message: "[\"==\",\"a\",\"b\"] compares two literals, so it's constant. If \"a\" is meant to be read from the feature, use [\"get\",\"a\"]." },
    ])
  })

  it("suggests id() for a constant comparison on $id", () => {
    const [issue] = lintStyle(style(circle("a", { paint: { "circle-radius": ["case", ["==", "$id", "home"], 2, 1] } })))
    expect(issue?.message).toMatch(/use \["id"\]\.$/)
  })

  it("lists problems in layer order", () => {
    const issues = lintStyle(style(
      circle("first", { paint: { "circle-color": ["case", ["==", "a", "b"], "#fff", "#000"] } }),
      circle("second", { paint: { "circle-radius": "big" } }),
    ))
    expect(issues.map(issue => issue.layer)).toEqual(["first", "second"])
  })

  it("passes every recipe", () => {
    expect(lintStyle(style(
      { id: "roads", type: "line", source: "s", filter: isNoneOf(get("class"), ["path"]), paint: {
        "line-width": byZoomMatch(get("class"), [["motorway", [[5, 1], [18, 20]]]], [[10, 0.5], [18, 4]]),
        "line-color": toColorOr(get("color"), "#888", { hashlessHex: true }),
        "line-opacity": ifFeatureState([["selected", 1], ["hover", 0.8]], 0.6),
      } },
      { id: "areas", type: "fill", source: "s", paint: { "fill-color": classify(get("density"), [10, 50], ["#fee", "#f86", "#c21"], "#ccc"), "fill-opacity": byZoom([[4, 0.4], [12, 0.8]], linear()) } },
      { id: "labels", type: "symbol", source: "s", layout: { "text-field": localizedName([globalState("lang"), "en"], { secondLine: "name" }) }, paint: { "text-color": contrastText(get("bg")) } },
      { id: "counts", type: "symbol", source: "s", layout: { "text-field": compactNumber(get("point_count"), { locale: "de" }) } },
    ))).toEqual([])
  })
})
