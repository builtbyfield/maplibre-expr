import type { LineString, Point } from "geojson"

import type { Expr } from "../src"

import { describe, expect, it } from "vitest"

import {
  all,
  any,
  byZoom,
  case_,
  distance,
  eq,
  exponential,
  featureState,
  get,
  globalState,
  gt,
  gte,
  ifFeatureState,
  isOneOf,
  linear,
  lt,
  lte,
  not,
  numberFormat,
  sqrt,
} from "../src"
import { assertEquivalent, checkEquivalent } from "../src/testing"

describe("checkEquivalent", () => {
  it("accepts rewrites that behave the same", () => {
    expect(checkEquivalent(gt(get("n"), 5), not(lte(get("n"), 5)))).toEqual({ equivalent: true, cases: 500 })
    expect(checkEquivalent(
      isOneOf(get("class"), ["a", "b"]),
      any(eq(get("class"), "a"), eq(get("class"), "b")),
    ).equivalent).toBe(true)
  })

  it("finds a boundary bug (gt vs gte)", () => {
    const result = checkEquivalent(gt(get("n"), 5), gte(get("n"), 5))
    expect(result.equivalent).toBe(false)
    if (!result.equivalent) {
      // Only what the expressions read: no zoom, geometry or empty state.
      expect(result.counterexample).toEqual({ properties: { n: 5 } })
      expect([result.a, result.b]).toEqual([false, true])
    }
  })

  it("finds a dropped match label even when the expression embeds geometry", () => {
    const line: LineString = { type: "LineString", coordinates: Array.from({ length: 45 }, (_, i) => [-114.05 + i * 0.01, 51.04 + (i % 3) * 0.001]) }
    const nearby: Point = { type: "Point", coordinates: [-113.9, 51.04] }
    const classes = ["motorway", "trunk", "primary", "secondary", "tertiary", "minor", "service", "track", "path", "busway", "raceway", "rail"]
    const roads = (list: string[]): Expr<boolean> => all(
      isOneOf(get("class"), list),
      not(eq(get("brunnel"), "tunnel")),
      lt(distance(line), 2000),
    )
    const result = checkEquivalent(roads(classes), roads(classes.filter(c => c !== "trunk")), { geometries: [nearby] })
    expect(result.equivalent).toBe(false)
    if (!result.equivalent) {
      // Shrunk to the properties that matter; coordinates and property names are never used as values.
      expect(result.counterexample.properties).toEqual({ class: "trunk" })
      expect(result.counterexample.geometry).toEqual(nearby)
      expect(result.counterexample).not.toHaveProperty("zoom")
    }
  })

  it("tries every value in a match label, including the first", () => {
    expect(checkEquivalent(isOneOf(get("c"), ["a", "b"]), isOneOf(get("c"), ["b"])).equivalent).toBe(false)
  })

  it("still finds a difference behind many \"none of these\" branches", () => {
    const flags = Array.from({ length: 12 }, (_, i) => eq(get(`flag${i}`), "on"))
    expect(checkEquivalent(any(...flags, gt(get("n"), 5)), any(...flags, gte(get("n"), 5))).equivalent).toBe(false)
  })

  it("shrinks a counterexample to the properties that matter", () => {
    // Twelve flags are read, but every branch gives the same answer, so only `n` matters.
    const branches = (test: Expr<boolean>): Expr<boolean> => {
      const [first, ...rest] = Array.from({ length: 12 }, (_, i) => [eq(get(`flag${i}`), "on"), test] as const)
      return case_([first!, ...rest], test)
    }
    const result = checkEquivalent(branches(gt(get("n"), 5)), branches(gte(get("n"), 5)))
    expect(result.equivalent).toBe(false)
    if (!result.equivalent)
      expect(result.counterexample).toEqual({ properties: { n: 5 } })
  })

  it("finds a ramp difference between stops", () => {
    expect(checkEquivalent(byZoom([[10, 1], [16, 4]], linear()), byZoom([[10, 1], [16, 4]], exponential(1))).equivalent).toBe(true)
    expect(checkEquivalent(byZoom([[10, 1], [16, 4]], linear()), byZoom([[10, 1], [16, 4]], exponential(2))).equivalent).toBe(false)
  })

  it("varies feature state and global state", () => {
    expect(checkEquivalent(
      ifFeatureState("hover", 1, 0),
      case_([[eq(featureState("hover"), true), 1]], 0),
    ).equivalent).toBe(true)
    const result = checkEquivalent(gt(get("ends"), globalState("now")), gte(get("ends"), globalState("now")))
    expect(result.equivalent).toBe(false)
  })

  it("treats errors, null and NaN as the same outcome (MapLibre's default)", () => {
    // NaN (sqrt of a negative) and a missing property (null) both mean "use the default"
    const alwaysNull = ["get", "x", ["literal", {}]] as never
    expect(checkEquivalent(sqrt(-1), alwaysNull).equivalent).toBe(true)
  })

  it("reads literals inside option objects", () => {
    const usd = numberFormat(get("price"), { "locale": "en-US", "max-fraction-digits": 1 })
    const de = numberFormat(get("price"), { "locale": "de-DE", "max-fraction-digits": 1 })
    expect(checkEquivalent(usd, usd).equivalent).toBe(true)
    expect(checkEquivalent(usd, de).equivalent).toBe(false)
  })

  it("rejects invalid expressions instead of comparing them", () => {
    expect(() => checkEquivalent(["+", "a", 1] as never, gt(get("n"), 1))).toThrow(/Invalid expression/)
  })

  it("is deterministic for a seed", () => {
    const run = (): unknown => checkEquivalent(gt(get("n"), 5), gte(get("n"), 5), { seed: 7 })
    expect(run()).toEqual(run())
  })
})

describe("assertEquivalent", () => {
  it("passes silently when equivalent", () => {
    expect(() => assertEquivalent(gt(get("n"), 5), not(lte(get("n"), 5)))).not.toThrow()
  })

  it("throws with the counterexample when not", () => {
    expect(() => assertEquivalent(gt(get("n"), 5), gte(get("n"), 5))).toThrow(/Expressions differ[\s\S]*"n":5[\s\S]*first: {2}false[\s\S]*second: true/)
  })
})
