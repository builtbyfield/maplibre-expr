import { describe, expect, it } from "vitest"

import {
  any,
  byZoom,
  case_,
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
      expect(result.counterexample.properties).toEqual({ n: 5 })
      expect([result.a, result.b]).toEqual([false, true])
    }
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
