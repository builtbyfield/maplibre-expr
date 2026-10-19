import type { AnyInput, Color, ColorInput, Expr, Input, NumberInput, Projection, ProjectionInput, StringInput } from "./expr"
import type { MatchLabel } from "./operators/decision"
import type { Interpolation, Stops } from "./operators/ramps"

import { assertMatchLabels, op } from "./internal"
import { rgba, toRgba } from "./operators/color"
import { all, case_, eq, gte, lte } from "./operators/decision"
import { featureState, zoom } from "./operators/feature"
import { at, get } from "./operators/lookup"
import { add, cos, divide, max, min, multiply, pi, pow } from "./operators/math"
import { exponential, interpolate, linear } from "./operators/ramps"
import { concat } from "./operators/string"
import { boolean, typeof_ } from "./operators/types"
import { let_ } from "./operators/variables"

/**
 * A value that changes with zoom: shorthand for
 * `interpolate(curve, zoom(), stops)`. The default curve is
 * `exponential(1.5)` for numbers, which makes widths and sizes feel even
 * across zooms, and `linear()` when a stop is a color or projection string.
 * Pass `linear()` for opacity, as most styles do.
 *
 * MapLibre only allows zoom at the top level of a property, so
 * `multiply(get("lanes"), byZoom(...))` is rejected. To scale by data, put
 * the data in the stops: `byZoom([[10, multiply(get("lanes"), 0.5)], [18, multiply(get("lanes"), 4)]])`.
 * For a different ramp per category, see {@link byZoomMatch}.
 *
 * @example
 * // "line-width": 1px at z10, 8px at z18
 * byZoom([[10, 1], [18, 8]])
 * @example
 * byZoom([[5, "#ccc"], [12, "#333"]], linear())
 * @example
 * // projection.type: globe when zoomed out, flat from zoom 12
 * byZoom([[10, "vertical-perspective"], [12, "mercator"]], linear())
 */
export function byZoom(stops: Stops<NumberInput>, curve?: Interpolation): Expr<number>
export function byZoom(stops: Stops<ProjectionInput>, curve?: Interpolation): Expr<Projection>
export function byZoom(stops: Stops<ColorInput>, curve?: Interpolation): Expr<Color>
export function byZoom(stops: Stops<NumberInput> | Stops<ProjectionInput> | Stops<ColorInput>, curve?: Interpolation): Expr<number | Projection | Color> {
  // Color and projection stops are strings; an exponential color fade stays near the start color for most of the ramp
  const strings = stops.some(([, output]) => typeof output === "string")
  return interpolate(curve ?? (strings ? linear() : exponential(1.5)), zoom(), stops as Stops<NumberInput>)
}

/** Meters per pixel at zoom 0 at the equator, for MapLibre's 512px tiles. */
const METERS_PER_PIXEL_Z0 = 40_075_016.686 / 512

/**
 * A size in pixels that matches a real-world distance in meters at every
 * zoom, e.g. for `circle-radius` showing a 500 m buffer. Uses an
 * exponential (base 2) zoom ramp, so it must be the whole property value.
 *
 * @param meters - Distance in meters. May be data-driven.
 * @param latitude - Latitude the size is accurate at (Web Mercator stretches
 *   with latitude). May be data-driven, e.g. a property holding the
 *   feature's latitude; expressions can't read a feature's coordinates. For
 *   a city-scale map, the map's center latitude from global state is close
 *   enough.
 *
 * Accurate to zoom 24, maplibre-gl's maximum; it stops growing beyond that.
 * @example "circle-radius": metersToPixels(get("radius_m"), 52.52)
 */
export function metersToPixels(meters: NumberInput, latitude: NumberInput): Expr<number> {
  const atZoom0 = divide(meters, multiply(METERS_PER_PIXEL_Z0, cos(divide(multiply(latitude, pi()), 180))))
  return interpolate(exponential(2), zoom(), [
    [0, atZoom0],
    [24, multiply(atZoom0, 2 ** 24)],
  ])
}

/**
 * Picks a value by a boolean feature state, treating an unset state as
 * `false`. The usual hover/selected pattern. (A raw `feature-state` in a
 * `case` fails while the state is unset, and MapLibre falls back to the
 * property's default, e.g. black.)
 *
 * Pass a list of `[state, value]` pairs to check several states in order of
 * priority: the first one that's set wins.
 *
 * Uses `feature-state`, which the style spec lists as not yet supported in
 * MapLibre Native; see https://github.com/maplibre/maplibre-native/issues/1698.
 *
 * @example "fill-color": ifFeatureState("hover", "#f80", "#888")
 * @example "line-width": ifFeatureState("selected", 4, 1)
 * @example "fill-color": ifFeatureState([["selected", "#e63"], ["hover", "#f80"]], "#888") // selected beats hover
 */
export function ifFeatureState<T>(state: string, whenTrue: Input<T>, whenFalse: Input<NoInfer<T>>): Expr<T>
export function ifFeatureState<T>(states: readonly [readonly [string, Input<T>], ...(readonly [string, Input<NoInfer<T>>])[]], fallback: Input<NoInfer<T>>): Expr<T>
export function ifFeatureState(states: string | readonly (readonly [string, unknown])[], ...rest: unknown[]): Expr<unknown> {
  const [pairs, fallback] = typeof states === "string" ? [[[states, rest[0]]] as const, rest[1]] : [states, rest[0]]
  if (pairs.length === 0)
    throw new RangeError("ifFeatureState: pass at least one state")
  return op("case", ...pairs.flatMap(([state, value]) => [boolean(featureState(state), false), value]), fallback)
}

/**
 * A feature property, or `fallback` if it's missing or isn't the same type
 * as `fallback`. Safer than `coalesce(get(p), fallback)`, which passes
 * wrongly-typed values through. Values aren't converted: with a number
 * fallback, the string `"12"` gives the fallback (use `toNumber` for
 * numbers stored as strings, but note `toNumber` turns a missing value and
 * `""` into `0`).
 *
 * @example getOr("name", "Unnamed") // ["string", ["get", "name"], "Unnamed"]
 * @example getOr("height", 0) // ["number", ["get", "height"], 0]
 */
export function getOr(property: StringInput, fallback: string): Expr<string>
export function getOr(property: StringInput, fallback: number): Expr<number>
export function getOr(property: StringInput, fallback: boolean): Expr<boolean>
export function getOr(property: StringInput, fallback: string | number | boolean): Expr<string | number | boolean> {
  return op(typeof fallback, get(property), fallback)
}

/**
 * `true` if `input` equals one of the literal `values`. Compiles to a
 * `match`, the fastest form for filters, and avoids the classic mistake of
 * passing a bare array to `in` without `literal`.
 *
 * Throws if `values` is empty or has non-integer numbers (MapLibre rejects
 * both as `match` labels).
 *
 * @example filter: isOneOf(get("class"), ["primary", "secondary"])
 * // ["match", ["get", "class"], ["primary", "secondary"], true, false]
 */
export function isOneOf<L extends string | number>(input: Input<L>, values: readonly NoInfer<L>[]): Expr<boolean> {
  const unique = [...new Set(values)]
  assertMatchLabels("isOneOf", [unique])
  return op("match", input, unique, true, false)
}

/**
 * `true` if `input` equals none of the literal `values`, including when it's
 * missing. The negation of {@link isOneOf}, and what legacy `!in` filters
 * mean.
 *
 * @example filter: isNoneOf(get("class"), ["service", "track"])
 * // ["match", ["get", "class"], ["service", "track"], false, true]
 */
export function isNoneOf<L extends string | number>(input: Input<L>, values: readonly NoInfer<L>[]): Expr<boolean> {
  const unique = [...new Set(values)]
  assertMatchLabels("isNoneOf", [unique])
  return op("match", input, unique, false, true)
}

/** Options of {@link colorOr}. */
export interface ColorOrOptions {
  /**
   * Also read hex colors written without `#`, like GTFS `route_color`
   * (`"FF0000"`). Off by default, because it turns some words into colors:
   * `"bad"` would become `#bad`.
   */
  hashlessHex?: boolean
}

/**
 * A color from feature data, or `fallback` if the value is missing, empty or
 * not a color. `coalesce(get("color"), fallback)` only covers missing
 * values: for `""`, `"FF0000"` or `"nope"` it fails, and MapLibre draws the
 * property's default, usually black.
 *
 * @example "line-color": colorOr(get("route_color"), "#3388ff", { hashlessHex: true }) // GTFS colors
 * @example "fill-color": colorOr(get("color"), "#ccc")
 */
export function colorOr(value: AnyInput, fallback: ColorInput, options: ColorOrOptions = {}): Expr<Color> {
  return let_({ value }, ({ value }) => case_([
    [eq(typeof_(value), "string"), op<Color>("to-color", value, ...(options.hashlessHex ? [concat("#", value)] : []), fallback)],
  ], fallback))
}

/**
 * The same color with a different alpha (0-1). If `color` isn't a valid
 * color, evaluation fails and MapLibre uses the property's default.
 *
 * @example "fill-color": withAlpha(get("color"), 0.5)
 */
export function withAlpha(color: ColorInput, alpha: NumberInput): Expr<Color> {
  return let_({ c: toRgba(color) }, ({ c }) => rgba(at(0, c), at(1, c), at(2, c), alpha))
}

/**
 * A different zoom ramp for each category, e.g. road widths by class. Writing
 * it the obvious way, a `match` of zoom ramps, is rejected by MapLibre (only
 * one zoom ramp is allowed per property). This builds the form it accepts:
 * one zoom ramp whose stops `match` on the category, with every category's
 * ramp evaluated at every stop, so each category gets exactly the ramp you
 * gave it.
 *
 * Stop outputs must be literal numbers. Throws for `cubicBezier` curves
 * (which can't be resampled exactly), unsorted stops, and the `match` label
 * mistakes {@link match} throws for.
 *
 * @example
 * "line-width": byZoomMatch(get("class"), [
 *   [["motorway", "trunk"], [[5, 1], [18, 20]]],
 *   ["primary", [[8, 0.5], [18, 12]]],
 * ], [[10, 0.5], [18, 4]])
 */
export function byZoomMatch<L extends string | number>(
  input: Input<L>,
  branches: readonly [readonly [MatchLabel<NoInfer<L>>, Stops<number>], ...(readonly [MatchLabel<NoInfer<L>>, Stops<number>])[]],
  fallback: Stops<number>,
  curve: Interpolation = exponential(1.5),
): Expr<number> {
  assertMatchLabels("byZoomMatch", branches.map(([label]) => label))
  if (curve[0] === "cubic-bezier")
    throw new RangeError("byZoomMatch: cubic-bezier ramps can't be merged exactly; use linear() or exponential()")
  const base = curve[0] === "exponential" ? curve[1] : 1
  for (const stops of [...branches.map(([, stops]) => stops), fallback]) {
    stops.forEach(([zoom, output], i) => {
      if (typeof zoom !== "number" || typeof output !== "number")
        throw new TypeError("byZoomMatch: stop zooms and outputs must be literal numbers")
      if (i > 0 && !(zoom > stops[i - 1]![0]))
        throw new RangeError(`byZoomMatch: stop zooms must be strictly ascending, got ${zoom} after ${stops[i - 1]![0]}`)
    })
  }
  const zooms = [...new Set([...branches.flatMap(([, stops]) => stops), ...fallback].map(([zoom]) => zoom))].sort((a, b) => a - b)
  return interpolate(curve, zoom(), zooms.map((z) => {
    const outputs = branches.map(([, stops]) => rampAt(stops, z, base))
    const otherwise = rampAt(fallback, z, base)
    return [z, outputs.every(output => output === otherwise) ? otherwise : op<number>("match", input, ...branches.flatMap(([label], i) => [label, outputs[i]]), otherwise)]
  }) as unknown as Stops<NumberInput>)
}

/** A numeric zoom ramp's value at `z`, as MapLibre interpolates it. */
function rampAt(stops: Stops<number>, z: number, base: number): number {
  const upper = stops.findIndex(([zoom]) => zoom >= z)
  if (upper === -1)
    return stops[stops.length - 1]![1]
  if (upper === 0 || stops[upper]![0] === z)
    return stops[upper]![1]
  const [z0, v0] = stops[upper - 1]!
  const [z1, v1] = stops[upper]!
  const t = base === 1 ? (z - z0) / (z1 - z0) : (base ** (z - z0) - 1) / (base ** (z1 - z0) - 1)
  return v0 + (v1 - v0) * t
}

/**
 * Sorts a number into classes, e.g. a choropleth's colors: `outputs[0]`
 * below `breaks[0]`, `outputs[i]` from `breaks[i - 1]` up to (not
 * including) `breaks[i]`, and the last output from the last break up. A
 * value equal to a break goes in the class above it.
 *
 * Values that aren't numbers (missing, `null`, strings, `NaN`) get
 * `noData`. A plain `step` puts them nowhere: it fails, and MapLibre falls
 * back to the property's default, e.g. black. Numbers stored as strings
 * need `toNumber` first.
 *
 * For a diverging scale, give the neutral band its own class.
 *
 * Throws if `breaks` is empty or not strictly ascending, or if there isn't
 * exactly one more output than breaks.
 *
 * @example
 * "fill-color": classify(get("density"), [10, 50, 100], ["#fee", "#fb9", "#f64", "#c21"], "#ccc")
 * @example
 * // change around 0, with a neutral band from -0.01 to 0.1
 * "fill-color": classify(get("change"), [-1, -0.01, 0.1, 1], ["#b2182b", "#ef8a62", "#fff", "#67a9cf", "#2166ac"], "#ccc")
 */
export function classify<T>(input: NumberInput, breaks: readonly number[], outputs: readonly [Input<T>, ...Input<NoInfer<T>>[]], noData: Input<NoInfer<T>>): Expr<T>
export function classify(input: NumberInput, breaks: readonly number[], outputs: readonly [ColorInput, ...ColorInput[]], noData: ColorInput): Expr<Color>
export function classify(input: NumberInput, breaks: readonly number[], outputs: readonly unknown[], noData: unknown): Expr<unknown> {
  if (breaks.length === 0)
    throw new RangeError("classify: pass at least one break")
  if (outputs.length !== breaks.length + 1)
    throw new RangeError(`classify: ${breaks.length} break(s) need ${breaks.length + 1} outputs, got ${outputs.length}`)
  breaks.forEach((value, i) => {
    if (i > 0 && !(value > breaks[i - 1]!))
      throw new RangeError(`classify: breaks must be strictly ascending, got ${value} after ${breaks[i - 1]}`)
  })
  return let_({ value: input }, ({ value }) => case_([
    [all(eq(typeof_(value), "number"), eq(value, value)), op("step", value, outputs[0], ...breaks.flatMap((at, i) => [at, outputs[i + 1]]))],
  ], noData as Input<unknown>))
}

/** Options of {@link contrastText}. */
export interface ContrastTextOptions {
  /** Color to use on dark backgrounds. Default `"#fff"`. */
  light?: ColorInput
  /** Color to use on light backgrounds. Default `"#000"`. */
  dark?: ColorInput
}

/**
 * `light` or `dark`, whichever has more contrast with `background` by the
 * WCAG 2 contrast ratio. For text on data-colored shapes, e.g. labels on
 * category-colored badges or cluster bubbles. The background's alpha is
 * ignored.
 *
 * @example "text-color": contrastText(get("route_color"))
 * @example "text-color": contrastText(match(get("kind"), [["a", "#ffd400"]], "#1a4f8b"), { dark: "#222" })
 */
export function contrastText(background: ColorInput, options: ContrastTextOptions = {}): Expr<Color> {
  const { light = "#fff", dark = "#000" } = options
  return let_({ bg: luminance(background), l: luminance(light), d: luminance(dark) }, ({ bg, l, d }) => {
    const ratio = (a: NumberInput, b: NumberInput): Expr<number> => divide(add(max(a, b), 0.05), add(min(a, b), 0.05))
    return case_([[gte(ratio(bg, d), ratio(bg, l)), dark]], light) as Expr<Color>
  })
}

/** WCAG 2 relative luminance (0 for black, 1 for white). */
function luminance(color: ColorInput): Expr<number> {
  return let_({ rgba: toRgba(color) }, ({ rgba }) => {
    const channel = (i: number): Expr<number> => let_({ c: divide(at(i, rgba), 255) }, ({ c }) =>
      case_([[lte(c, 0.04045), divide(c, 12.92)]], pow(divide(add(c, 0.055), 1.055), 2.4)))
    return add(multiply(0.2126, channel(0)), multiply(0.7152, channel(1)), multiply(0.0722, channel(2)))
  })
}
