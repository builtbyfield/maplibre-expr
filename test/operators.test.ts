import { describe, expect, it } from "vitest"

import {
  abs,
  accumulated,
  acos,
  add,
  all,
  any,
  array,
  asin,
  at,
  atan,
  boolean,
  case_,
  ceil,
  coalesce,
  collator,
  concat,
  cos,
  cubicBezier,
  distance,
  divide,
  downcase,
  e,
  elevation,
  eq,
  exponential,
  featureState,
  floor,
  format,
  geometryType,
  get,
  globalState,
  gt,
  gte,
  has,
  heatmapDensity,
  id,
  image,
  in_,
  indexOf,
  interpolate,
  interpolateHcl,
  interpolateLab,
  isSupportedScript,
  join,
  length,
  let_,
  linear,
  lineProgress,
  literal,
  ln,
  ln2,
  log2,
  log10,
  lt,
  lte,
  match,
  max,
  min,
  mod,
  multiply,
  neq,
  not,
  number,
  numberFormat,
  object,
  pi,
  pow,
  properties,
  resolvedLocale,
  rgb,
  rgba,
  round,
  semiliteral,
  sin,
  slice,
  split,
  sqrt,
  step,
  string,
  subtract,
  tan,
  toBoolean,
  toColor,
  toNumber,
  toRgba,
  toString,
  typeof_,
  upcase,
  var_,
  within,
  zoom,
} from "../src"
import { evaluate, ExpressionError } from "../src/testing"

describe("math", () => {
  it("arithmetic", () => {
    expect(evaluate(add(get("a"), 2, 3), { properties: { a: 1 } })).toBe(6)
    expect(evaluate(multiply(2, 3, 4))).toBe(24)
    expect(evaluate(subtract(10, 4))).toBe(6)
    expect(evaluate(subtract(get("a")), { properties: { a: 5 } })).toBe(-5)
    expect(evaluate(divide(9, 2))).toBe(4.5)
    expect(evaluate(mod(10, 3))).toBe(1)
    expect(evaluate(pow(2, 10))).toBe(1024)
  })

  it("omits the optional second operand of subtract", () => {
    expect(subtract(1)).toEqual(["-", 1])
  })

  it("functions", () => {
    expect(evaluate(sqrt(16))).toBe(4)
    expect(evaluate(log10(1000))).toBeCloseTo(3)
    expect(evaluate(ln(e()))).toBe(1)
    expect(evaluate(log2(8))).toBe(3)
    expect(evaluate(abs(-3))).toBe(3)
    expect(evaluate(ceil(1.2))).toBe(2)
    expect(evaluate(floor(1.8))).toBe(1)
    expect(evaluate(round(2.5))).toBe(3)
    expect(evaluate(round(-1.5))).toBe(-2)
    expect(evaluate(min(3, get("x"), 7), { properties: { x: 1 } })).toBe(1)
    expect(evaluate(max(3, 9, 7))).toBe(9)
  })

  it("trigonometry", () => {
    expect(evaluate(sin(divide(pi(), 2)))).toBeCloseTo(1)
    expect(evaluate(cos(0))).toBe(1)
    expect(evaluate(tan(0))).toBe(0)
    expect(evaluate(asin(1))).toBeCloseTo(Math.PI / 2)
    expect(evaluate(acos(1))).toBe(0)
    expect(evaluate(atan(1))).toBeCloseTo(Math.PI / 4)
  })

  it("constants", () => {
    expect(evaluate(pi())).toBeCloseTo(Math.PI)
    expect(evaluate(e())).toBeCloseTo(Math.E)
    expect(evaluate(ln2())).toBeCloseTo(Math.LN2)
  })

  it("distance in meters", () => {
    // 0.01 degrees of latitude at the equator, on the WGS84 ellipsoid
    const meters = evaluate(distance({ type: "Point", coordinates: [0, 0] }), {
      geometry: { type: "Point", coordinates: [0, 0.01] },
    })
    expect(meters).toBeCloseTo(1105.74, 0)
  })
})

describe("decision", () => {
  it("comparison", () => {
    const props = { properties: { n: 5, s: "b" } }
    expect(evaluate(eq(get("n"), 5), props)).toBe(true)
    expect(evaluate(neq(get("n"), 5), props)).toBe(false)
    expect(evaluate(lt(get("n"), 6), props)).toBe(true)
    expect(evaluate(lte(get("n"), 5), props)).toBe(true)
    expect(evaluate(gt(get("s"), "a"), props)).toBe(true)
    expect(evaluate(gte(get("s"), "c"), props)).toBe(false)
  })

  it("compares against null", () => {
    expect(evaluate(eq(get("missing"), null))).toBe(true)
  })

  it("compares strings with a collator", () => {
    const props = { properties: { city: "Z\u00FCrich", s: "a" } }
    expect(evaluate(eq(get("city"), "zurich", collator({ "case-sensitive": false, "diacritic-sensitive": false })), props)).toBe(true)
    expect(evaluate(lt(get("s"), "B", collator({ "case-sensitive": false })), props)).toBe(true)
  })

  it("logic", () => {
    expect(evaluate(not(true))).toBe(false)
    expect(evaluate(all(true, gt(2, 1)))).toBe(true)
    expect(evaluate(all())).toBe(true)
    expect(evaluate(any(false, eq(1, 2)))).toBe(false)
    expect(evaluate(any())).toBe(false)
  })

  it("case_", () => {
    const expr = case_([[gt(get("n"), 10), "big"], [gt(get("n"), 5), "medium"]], "small")
    expect(expr).toEqual(["case", [">", ["get", "n"], 10], "big", [">", ["get", "n"], 5], "medium", "small"])
    expect(evaluate(expr, { properties: { n: 7 } })).toBe("medium")
    expect(evaluate(expr, { properties: { n: 1 } })).toBe("small")
  })

  it("match with single and grouped labels", () => {
    const expr = match(get("type"), [["park", 1], [["lake", "river"], 2]], 0)
    expect(expr).toEqual(["match", ["get", "type"], "park", 1, ["lake", "river"], 2, 0])
    expect(evaluate(expr, { properties: { type: "river" } })).toBe(2)
    expect(evaluate(expr, { properties: { type: "road" } })).toBe(0)
  })

  it("match rejects labels MapLibre would reject", () => {
    expect(() => match(get("t"), [["a", 1], [["b", "a"], 2]], 0)).toThrow(/"a" appears more than once/)
    expect(() => match(get("n"), [[1.5, "a"]], "b")).toThrow(/integers/)
    expect(() => match(get("t"), [[[] as unknown as [string], 1]], 0)).toThrow(/must not be empty/)
  })

  it("match is strict: a string doesn't match a numeric label", () => {
    expect(evaluate(match(get("n"), [[1, "one"]], "other"), { properties: { n: "1" } })).toBe("other")
  })

  it("rejects comparing a string literal to a literal (legacy-filter trap)", () => {
    expect(() => eq("class", "park")).toThrow(/Use get\("class"\) instead/)
    // Legacy filters' special keys point to their expression equivalents
    expect(() => eq("$type", "Polygon")).toThrow(/Use geometryType\(\) instead/)
    expect(() => eq("$id", "5")).toThrow(/Use id\(\) instead/)
    expect(() => in_("$type", literal(["Point"]))).not.toThrow()
    expect(() => neq("class", "road")).toThrow(RangeError)
    expect(() => lt("a", "b")).toThrow(RangeError)
    expect(() => gte("a", "b")).toThrow(RangeError)
    expect(() => in_("Main", "Main Street")).toThrow(RangeError)
    // A property or expression on either side is fine, as are numeric literals
    expect(eq(get("class"), "park")).toEqual(["==", ["get", "class"], "park"])
    expect(eq("park", get("class"))).toEqual(["==", "park", ["get", "class"]])
    expect(evaluate(eq(1, 1))).toBe(true)
  })

  it("coalesce", () => {
    expect(evaluate(coalesce(get("a"), get("b"), "none"), { properties: { b: "B" } })).toBe("B")
    expect(evaluate(coalesce(image("missing"), image("ok")), { availableImages: ["ok"] })).toBe("ok")
  })

  it("within", () => {
    const area = { type: "Polygon" as const, coordinates: [[[0, 0], [0, 0.001], [0.001, 0.001], [0.001, 0], [0, 0]]] }
    expect(evaluate(within(area), { geometry: { type: "Point", coordinates: [0.0005, 0.0005] } })).toBe(true)
    expect(evaluate(within(area), { geometry: { type: "Point", coordinates: [0.0015, 0.0005] } })).toBe(false)
  })
})

describe("geometry", () => {
  // A ~1.1 km square near the equator (counterclockwise, as RFC 7946 prescribes)
  const square = { type: "Polygon" as const, coordinates: [[[0, 0], [0.01, 0], [0.01, 0.01], [0, 0.01], [0, 0]]] }
  const squareWithHole = {
    type: "Polygon" as const,
    coordinates: [
      [[0, 0], [0.01, 0], [0.01, 0.01], [0, 0.01], [0, 0]],
      [[0.004, 0.004], [0.004, 0.006], [0.006, 0.006], [0.006, 0.004], [0.004, 0.004]],
    ],
  }

  it("within: lines must lie entirely inside", () => {
    const inside = { type: "LineString" as const, coordinates: [[0.002, 0.002], [0.008, 0.008]] }
    const crossing = { type: "LineString" as const, coordinates: [[0.002, 0.002], [0.02, 0.008]] }
    expect(evaluate(within(square), { geometry: inside })).toBe(true)
    expect(evaluate(within(square), { geometry: crossing })).toBe(false)
    expect(evaluate(within(square), { geometry: { type: "MultiLineString", coordinates: [inside.coordinates, crossing.coordinates] } })).toBe(false)
  })

  it("within: every point of a MultiPoint must be inside", () => {
    expect(evaluate(within(square), { geometry: { type: "MultiPoint", coordinates: [[0.002, 0.002], [0.008, 0.008]] } })).toBe(true)
    expect(evaluate(within(square), { geometry: { type: "MultiPoint", coordinates: [[0.002, 0.002], [0.02, 0.008]] } })).toBe(false)
  })

  it("within: the boundary and holes count as outside", () => {
    expect(evaluate(within(square), { geometry: { type: "Point", coordinates: [0, 0.005] } })).toBe(false)
    expect(evaluate(within(squareWithHole), { geometry: { type: "Point", coordinates: [0.005, 0.005] } })).toBe(false)
    expect(evaluate(within(squareWithHole), { geometry: { type: "Point", coordinates: [0.002, 0.002] } })).toBe(true)
  })

  it("within: polygon features aren't evaluated", () => {
    const small = { type: "Polygon" as const, coordinates: [[[0.002, 0.002], [0.003, 0.002], [0.003, 0.003], [0.002, 0.003], [0.002, 0.002]]] }
    expect(evaluate(within(square), { geometry: small })).toBe(false)
  })

  it("distance from line and polygon features", () => {
    const target = distance({ type: "Point", coordinates: [0.01, 0.005] })
    // 0.01 degrees of longitude at the equator is ~1113 m
    expect(evaluate(target, { geometry: { type: "LineString", coordinates: [[0, 0], [0, 0.01]] } })).toBeCloseTo(1113, -1)
    expect(evaluate(target, { geometry: { type: "MultiLineString", coordinates: [[[0, 0], [0, 0.004]], [[0, 0.006], [0, 0.01]]] } })).toBeCloseTo(1113.4, -1)
    // A point inside a polygon feature is at distance 0
    expect(evaluate(distance({ type: "Point", coordinates: [0.005, 0.005] }), { geometry: square })).toBe(0)
    expect(evaluate(distance({ type: "Point", coordinates: [0.005, 0.005] }), { geometry: { type: "MultiPolygon", coordinates: [square.coordinates] } })).toBe(0)
  })

  it("upstream quirk: MultiLineString features are measured as one connected line", () => {
    // MapLibre flattens the parts, adding a segment from the end of one part to
    // the start of the next. Here that segment passes through the target.
    const parts = { type: "MultiLineString" as const, coordinates: [[[0, 0], [0, 0.01]], [[0.02, 0], [0.02, 0.01]]] }
    expect(evaluate(distance({ type: "Point", coordinates: [0.01, 0.005] }), { geometry: parts })).toBeLessThan(1)
  })

  it("geometryType for each geometry", () => {
    expect(evaluate(geometryType(), { geometry: { type: "MultiPoint", coordinates: [[0, 0], [1, 1]] } })).toBe("Point")
    expect(evaluate(geometryType(), { geometry: { type: "LineString", coordinates: [[0, 0], [1, 1]] } })).toBe("LineString")
    expect(evaluate(geometryType(), { geometry: square })).toBe("Polygon")
  })

  it("rejects GeometryCollection features", () => {
    expect(() => evaluate(geometryType(), { geometry: { type: "GeometryCollection", geometries: [] } })).toThrow(TypeError)
  })
})

describe("lookup", () => {
  it("get and has, on the feature and on objects", () => {
    const props = { properties: { name: "Oslo", address: { city: "Bergen" } } }
    expect(evaluate(get("name"), props)).toBe("Oslo")
    expect(evaluate(get("city", object(get("address"))), props)).toBe("Bergen")
    expect(evaluate(has("name"), props)).toBe(true)
    expect(evaluate(has("zip", object(get("address"))), props)).toBe(false)
    expect(evaluate(get("missing"))).toBe(null)
  })

  it("omits the optional object argument", () => {
    expect(get("a")).toEqual(["get", "a"])
    expect(has("a")).toEqual(["has", "a"])
  })

  it("arrays", () => {
    const list = literal(["a", "b", "c"])
    expect(evaluate(at(1, list))).toBe("b")
    expect(evaluate(in_("b", list))).toBe(true)
    expect(evaluate(indexOf("c", list))).toBe(2)
    expect(evaluate(indexOf("a", list, 1))).toBe(-1)
    expect(evaluate(slice(list, 1))).toEqual(["b", "c"])
    expect(evaluate(length(list))).toBe(3)
  })

  it("numbers in arrays", () => {
    expect(evaluate(in_(get("n"), literal([1, 2, 3])), { properties: { n: 2 } })).toBe(true)
    expect(evaluate(indexOf(3, literal([1, 2, 3])))).toBe(2)
  })

  it("strings", () => {
    expect(evaluate(in_("ell", get("word")), { properties: { word: "hello" } })).toBe(true)
    expect(evaluate(indexOf("l", "hello", 3))).toBe(3)
    expect(evaluate(slice("hello", 1, 3))).toBe("el")
    expect(evaluate(slice("hello", -2))).toBe("lo")
    expect(evaluate(length("hello"))).toBe(5)
  })

  it("globalState", () => {
    expect(evaluate(gt(get("p"), globalState("min")), { properties: { p: 5 }, globalState: { min: 3 } })).toBe(true)
    expect(evaluate(globalState("unset"))).toBe(null)
  })
})

describe("feature data and camera", () => {
  it("properties, id, featureState", () => {
    expect(evaluate(properties(), { properties: { a: 1 } })).toEqual({ a: 1 })
    expect(evaluate(id(), { id: 42 })).toBe(42)
    expect(evaluate(featureState("hover"), { featureState: { hover: true } })).toBe(true)
  })

  it("geometryType reports Multi* geometries as their single type", () => {
    expect(evaluate(geometryType())).toBe("Point")
    expect(evaluate(geometryType(), { geometry: { type: "MultiLineString", coordinates: [] } })).toBe("LineString")
    expect(evaluate(geometryType(), { geometry: { type: "MultiPolygon", coordinates: [] } })).toBe("Polygon")
  })

  it("context-only values", () => {
    expect(evaluate(zoom(), { zoom: 12 })).toBe(12)
    expect(evaluate(heatmapDensity(), { heatmapDensity: 0.4 })).toBe(0.4)
    expect(evaluate(lineProgress(), { lineProgress: 0.25 })).toBe(0.25)
    expect(evaluate(elevation(), { elevation: 1200 })).toBe(1200)
    expect(evaluate(add(accumulated(), get("n")), { accumulated: 3, properties: { n: 4 } })).toBe(7)
  })
})

describe("ramps", () => {
  it("interpolate numbers", () => {
    const expr = interpolate(linear(), zoom(), [[10, 1], [20, 11]])
    expect(expr).toEqual(["interpolate", ["linear"], ["zoom"], 10, 1, 20, 11])
    expect(evaluate(expr, { zoom: 15 })).toBe(6)
    expect(evaluate(expr, { zoom: 0 })).toBe(1)
  })

  it("interpolate colors", () => {
    expect(evaluate(interpolate(linear(), get("t"), [[0, "#000000"], [1, rgb(255, 255, 255)]]), { properties: { t: 0.5 } }))
      .toBe("rgba(128,128,128,1)")
  })

  it("exponential and cubic-bezier curves", () => {
    expect(evaluate(interpolate(exponential(2), zoom(), [[0, 0], [2, 3]]), { zoom: 1 })).toBe(1)
    expect(cubicBezier(0.4, 0, 0.2, 1)).toEqual(["cubic-bezier", 0.4, 0, 0.2, 1])
    expect(evaluate(interpolate(cubicBezier(0, 0, 1, 1), zoom(), [[0, 0], [10, 10]]), { zoom: 5 })).toBeCloseTo(5)
  })

  it("interpolate number arrays", () => {
    expect(evaluate(interpolate(linear(), zoom(), [[0, literal([0, 0])], [10, literal([10, 20])]]), { zoom: 5 })).toEqual([5, 10])
  })

  it("interpolate projections", () => {
    const projection = interpolate(linear(), zoom(), [[10, "vertical-perspective"], [12, "mercator"]])
    expect(evaluate(projection, { zoom: 11 })).toEqual({ from: "vertical-perspective", to: "mercator", transition: 0.5 })
    expect(evaluate(projection, { zoom: 11, type: "projectionDefinition" })).toEqual({ from: "vertical-perspective", to: "mercator", transition: 0.5 })
  })

  it("interpolate color arrays", () => {
    const colors = interpolate(linear(), zoom(), [[0, literal(["#000000", "#ff0000"])], [10, literal(["#ffffff", "#0000ff"])]])
    expect(evaluate(colors, { zoom: 5 })).toEqual(["rgba(128,128,128,1)", "rgba(128,0,128,1)"])
    expect(evaluate(interpolateHcl(linear(), zoom(), [[0, literal(["#ff0000"])], [10, literal(["#0000ff"])]]), { zoom: 5, type: "colorArray" })).toHaveLength(1)
  })

  it("hcl and lab color spaces", () => {
    const stops = [[0, "#ff0000"], [1, "#0000ff"]] as const
    expect(evaluate(interpolateHcl(linear(), 0.5, stops))).toMatch(/^rgba\(/)
    expect(evaluate(interpolateLab(linear(), 0.5, stops))).toMatch(/^rgba\(/)
    expect(evaluate(interpolateHcl(linear(), 0.5, stops))).not.toBe(evaluate(interpolate(linear(), 0.5, stops)))
  })

  it("step", () => {
    const expr = step(get("count"), 10, [[100, 20], [750, 30]])
    expect(expr).toEqual(["step", ["get", "count"], 10, 100, 20, 750, 30])
    expect(evaluate(expr, { properties: { count: 50 } })).toBe(10)
    expect(evaluate(expr, { properties: { count: 100 } })).toBe(20)
    expect(evaluate(expr, { properties: { count: 5000 } })).toBe(30)
  })

  it("rejects stops that aren't strictly ascending", () => {
    expect(() => interpolate(linear(), zoom(), [[10, 1], [5, 2]])).toThrow(/strictly ascending/)
    expect(() => step(zoom(), 0, [[5, 1], [5, 2]])).toThrow(/strictly ascending/)
  })
})

describe("types", () => {
  it("literal and semiliteral", () => {
    expect(evaluate(literal({ a: [1, 2] }))).toEqual({ a: [1, 2] })
    expect(evaluate(semiliteral([get("x"), 2]), { properties: { x: 1 } })).toEqual([1, 2])
  })

  it("array assertions in all three forms", () => {
    const props = { properties: { tags: ["a", "b"], offset: [1, 2] } }
    expect(array(get("tags"))).toEqual(["array", ["get", "tags"]])
    expect(evaluate(array(get("tags")), props)).toEqual(["a", "b"])
    expect(evaluate(array("string", get("tags")), props)).toEqual(["a", "b"])
    expect(evaluate(array("number", 2, get("offset")), props)).toEqual([1, 2])
    expect(() => evaluate(array("number", 3, get("offset")), props)).toThrow(ExpressionError)
  })

  it("assertions with fallbacks", () => {
    expect(evaluate(string(get("n"), "fallback"), { properties: { n: 1 } })).toBe("fallback")
    expect(evaluate(number(get("n"), 0), { properties: { n: 7 } })).toBe(7)
    expect(evaluate(boolean(get("missing"), false))).toBe(false)
    expect(evaluate(object(get("o")), { properties: { o: { a: 1 } } })).toEqual({ a: 1 })
    expect(() => evaluate(number(get("missing")))).toThrow(/Expected value to be of type number/)
  })

  it("typeof_", () => {
    expect(evaluate(typeof_(get("n")), { properties: { n: 1 } })).toBe("number")
    expect(evaluate(typeof_(get("missing")))).toBe("null")
    expect(evaluate(typeof_(get("a")), { properties: { a: [1, 2] } })).toBe("array<number, 2>")
    expect(evaluate(typeof_(rgb(1, 2, 3)))).toBe("color")
    expect(evaluate(typeof_(image("x")))).toBe("resolvedImage")
  })

  it("conversions", () => {
    expect(evaluate(toString(get("n")), { properties: { n: 42 } })).toBe("42")
    expect(evaluate(toString(rgb(255, 0, 0)))).toBe("rgba(255,0,0,1)")
    expect(evaluate(toNumber(get("s"), 0), { properties: { s: "3.5" } })).toBe(3.5)
    expect(evaluate(toNumber(get("s"), 0), { properties: { s: "abc" } })).toBe(0)
    expect(evaluate(toBoolean(""))).toBe(false)
    expect(evaluate(toBoolean("x"))).toBe(true)
    expect(evaluate(toColor(get("c"), "#000"), { properties: { c: "not a color" } })).toBe("rgba(0,0,0,1)")
    expect(evaluate(toColor(literal([255, 0, 0])))).toBe("rgba(255,0,0,1)")
    expect(evaluate(toColor(literal([0, 128, 0, 1])))).toBe("rgba(0,128,0,1)")
  })

  it("upstream quirk: toColor reads [r, g, b, a] arrays as premultiplied", () => {
    expect(evaluate(toColor(literal([255, 0, 0, 0.5])))).toBe("rgba(510,0,0,0.5)")
    expect(evaluate(toColor(literal([127.5, 0, 0, 0.5])))).toBe("rgba(255,0,0,0.5)")
  })

  it("numberFormat with currency and unit", () => {
    expect(evaluate(numberFormat(1234.5, { locale: "en-US", currency: "USD" }))).toBe("$1,234.50")
    expect(evaluate(numberFormat(12.34, { "locale": "en-US", "unit": "kilometer", "max-fraction-digits": 1 }))).toBe("12.3 km")
    expect(evaluate(numberFormat(5, { "locale": "en-US", "min-fraction-digits": 2 }))).toBe("5.00")
  })

  it("numberFormat honors a fraction-digit setting of 0 (works around MapLibre ignoring it)", () => {
    const rounded = numberFormat(999.4, { "locale": "en-US", "max-fraction-digits": 0 })
    expect(rounded).toEqual(["number-format", 999.4, { "locale": "en-US", "max-fraction-digits": ["literal", 0] }])
    expect(evaluate(rounded)).toBe("999")
    expect(evaluate(numberFormat(1.5, { "locale": "en-US", "min-fraction-digits": 0, "max-fraction-digits": 2 }))).toBe("1.5")
  })

  it("conversion edge cases", () => {
    expect(evaluate(toNumber(""))).toBe(0)
    expect(evaluate(toBoolean("false"))).toBe(true)
    expect(evaluate(divide(1, 0))).toBe(Infinity)
    expect(evaluate(divide(0, 0))).toBeNaN()
    expect(evaluate(sqrt(-1))).toBeNaN()
    expect(evaluate(get("a.b"), { properties: { a: { b: 1 } } })).toBe(null)
  })

  it("format with overrides, wrapping plain font stacks in literal", () => {
    const expr = format([get("name"), { "font-scale": 1.2, "text-font": ["Open Sans Bold"] }], "\n", ["sub", { "text-color": "#f00", "vertical-align": "center" }])
    expect(expr).toEqual([
      "format",
      ["get", "name"],
      { "font-scale": 1.2, "text-font": ["literal", ["Open Sans Bold"]] },
      "\n",
      "sub",
      { "text-color": "#f00", "vertical-align": "center" },
    ])
    const sections = evaluate(expr, { properties: { name: "Oslo" } })
    expect(sections.map(s => s.text)).toEqual(["Oslo", "\n", "sub"])
    expect(sections[0]).toMatchObject({ scale: 1.2, fontStack: "Open Sans Bold" })
    expect(sections[2]).toMatchObject({ textColor: "rgba(255,0,0,1)", verticalAlign: "center" })
  })

  it("format leaves expression font stacks and raw expression sections alone", () => {
    expect(format(["a", { "text-font": ["literal", ["X"]] }], ["get", "b"])).toEqual(["format", "a", { "text-font": ["literal", ["X"]] }, ["get", "b"]])
  })

  it("format with images", () => {
    expect(evaluate(format(image("star"), " 5"), { availableImages: ["star"] }).map(s => s.image)).toEqual(["star", null])
  })
})

describe("color", () => {
  it("rejects literal components out of range", () => {
    expect(() => rgb(300, 0, 0)).toThrow(/red must be between 0 and 255/)
    expect(() => rgba(0, 0, 0, 2)).toThrow(/alpha must be between 0 and 1/)
    expect(() => rgb(-1, 0, 0)).toThrow(RangeError)
    expect(rgb(get("r"), 0, 0)).toEqual(["rgb", ["get", "r"], 0, 0])
  })

  it("rgb, rgba, toRgba", () => {
    expect(evaluate(rgb(255, 0, 0))).toBe("rgba(255,0,0,1)")
    expect(evaluate(rgba(0, 0, 255, 0.5))).toBe("rgba(0,0,255,0.5)")
    expect(evaluate(toRgba("#00ff0080"))).toEqual([0, 255, 0, expect.closeTo(0.5, 2)])
  })
})

describe("string", () => {
  it("case and concat", () => {
    expect(evaluate(upcase("abc"))).toBe("ABC")
    expect(evaluate(downcase("ABC"))).toBe("abc")
    expect(evaluate(concat(get("name"), " (", get("n"), ")"), { properties: { name: "A", n: 1 } })).toBe("A (1)")
  })

  it("split and join", () => {
    expect(evaluate(split("a,b,c", ","))).toEqual(["a", "b", "c"])
    expect(evaluate(join(split("a b c", " "), "-"))).toBe("a-b-c")
  })

  it("isSupportedScript and resolvedLocale", () => {
    expect(evaluate(isSupportedScript("abc"))).toBe(true)
    expect(evaluate(resolvedLocale(collator({ locale: "en" })))).toBe("en")
  })
})

describe("variables", () => {
  it("let_ binds typed var references", () => {
    const expr = let_({ density: divide(get("pop"), get("area")) }, ({ density }) => multiply(density, 2))
    expect(expr).toEqual(["let", "density", ["/", ["get", "pop"], ["get", "area"]], ["*", ["var", "density"], 2]])
    expect(evaluate(expr, { properties: { pop: 100, area: 10 } })).toBe(20)
  })

  it("let_ binds several variables", () => {
    expect(evaluate(let_({ a: 1, b: 2 }, ({ a, b }) => add(a, b)))).toBe(3)
  })

  it("let_ rejects an empty binding", () => {
    expect(() => let_({}, () => add(1, 1))).toThrow(RangeError)
  })

  it("var_ can be used inside a hand-written let", () => {
    expect(evaluate(["let", "x", 5, add(var_("x"), 1)] as never)).toBe(6)
  })
})
