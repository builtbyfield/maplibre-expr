import type { Color, ColorInput, Expr, Input, NumberInput, StringInput } from "./expr"
import type { Interpolation, Stops } from "./operators/ramps"

import { op } from "./internal"
import { rgba, toRgba } from "./operators/color"
import { all, case_, gte, lte } from "./operators/decision"
import { featureState, zoom } from "./operators/feature"
import { at, get } from "./operators/lookup"
import { abs, cos, divide, multiply, pi } from "./operators/math"
import { exponential, interpolate, interpolateHcl, interpolateLab, linear } from "./operators/ramps"
import { concat } from "./operators/string"
import { boolean, numberFormat } from "./operators/types"
import { let_ } from "./operators/variables"

/**
 * A value that changes with zoom: shorthand for
 * `interpolate(curve, zoom(), stops)`. The default curve is
 * `exponential(1.5)`, which makes widths and sizes feel even across zooms.
 *
 * Remember that MapLibre only allows zoom at the top level of a property.
 *
 * @example
 * // "line-width": 1px at z10, 8px at z18
 * byZoom([[10, 1], [18, 8]])
 * @example
 * byZoom([[5, "#ccc"], [12, "#333"]], linear())
 */
export function byZoom(stops: Stops<NumberInput>, curve?: Interpolation): Expr<number>
export function byZoom(stops: Stops<ColorInput>, curve?: Interpolation): Expr<Color>
export function byZoom(stops: Stops<NumberInput> | Stops<ColorInput>, curve: Interpolation = exponential(1.5)): Expr<number | Color> {
  return interpolate(curve, zoom(), stops as Stops<NumberInput>)
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
 *   feature's latitude.
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
 * `false`. The usual hover/selected pattern.
 *
 * @example "fill-color": ifFeatureState("hover", "#f80", "#888")
 * @example "line-width": ifFeatureState("selected", 4, 1)
 */
export function ifFeatureState<T>(state: string, whenTrue: Input<T>, whenFalse: Input<NoInfer<T>>): Expr<T> {
  return case_([[boolean(featureState(state), false), whenTrue]], whenFalse)
}

/**
 * A feature property, or `fallback` if it's missing or isn't the same type
 * as `fallback`. Safer than `coalesce(get(p), fallback)`, which passes
 * wrongly-typed values through.
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
 * Throws if `values` is empty.
 *
 * @example filter: isOneOf(get("class"), ["primary", "secondary"])
 * // ["match", ["get", "class"], ["primary", "secondary"], true, false]
 */
export function isOneOf<L extends string | number>(input: Input<L>, values: readonly NoInfer<L>[]): Expr<boolean> {
  if (values.length === 0)
    throw new RangeError("isOneOf: values must not be empty")
  return op("match", input, [...new Set(values)], true, false)
}

/**
 * `true` if `min <= input <= max`.
 *
 * @example filter: between(get("year"), 1900, 1999)
 */
export function between(input: NumberInput, min: NumberInput, max: NumberInput): Expr<boolean> {
  return let_({ value: input }, ({ value }) => all(gte(value, min), lte(value, max)))
}

/**
 * {@link match} from a plain object: each key is a label, each value its
 * output. Handy for category-to-color palettes. Keys are strings, so
 * `input` must evaluate to a string.
 *
 * Throws if `record` is empty.
 *
 * @example
 * "fill-color": matchRecord(get("landuse"), { park: "#9c6", water: "#7bd", residential: "#eee" }, "#ccc")
 */
export function matchRecord<T>(input: StringInput, record: Readonly<Record<string, Input<T>>>, fallback: Input<NoInfer<T>>): Expr<T> {
  const entries = Object.entries(record)
  if (entries.length === 0)
    throw new RangeError("matchRecord: record must not be empty")
  return op("match", input, ...entries.flat(), fallback)
}

/** Options of {@link compactNumber}. */
export interface CompactNumberOptions {
  /** BCP 47 language tag for digit grouping and decimal separator. */
  locale?: string
  /** Fraction digits shown on abbreviated values. Default `1`. */
  maxFractionDigits?: number
}

/**
 * Formats a number compactly, e.g. `1234` becomes `"1.2k"`.
 * Useful for cluster counts. (MapLibre's `number-format` has no compact
 * notation.)
 *
 * @example "text-field": compactNumber(get("point_count"))
 */
export function compactNumber(input: NumberInput, options: CompactNumberOptions = {}): Expr<string> {
  const { locale, maxFractionDigits = 1 } = options
  const fmt = (value: NumberInput, digits: number): Expr<string> =>
    numberFormat(value, { "max-fraction-digits": digits, ...(locale !== undefined && { locale }) })
  return let_({ n: input }, ({ n }) => case_([
    [gte(abs(n), 1e9), concat(fmt(divide(n, 1e9), maxFractionDigits), "B")],
    [gte(abs(n), 1e6), concat(fmt(divide(n, 1e6), maxFractionDigits), "M")],
    [gte(abs(n), 1e3), concat(fmt(divide(n, 1e3), maxFractionDigits), "k")],
  ], fmt(n, 0)))
}

/**
 * The same color with a different alpha (0-1).
 *
 * @example "fill-color": withAlpha(get("color"), 0.5)
 */
export function withAlpha(color: ColorInput, alpha: NumberInput): Expr<Color> {
  return let_({ c: toRgba(color) }, ({ c }) => rgba(at(0, c), at(1, c), at(2, c), alpha))
}

/**
 * Blends two colors: `ratio` 0 gives `from`, 1 gives `to`. Blends in RGB by
 * default; `"hcl"` or `"lab"` give perceptually smoother mixes.
 *
 * @example mixColors("#fff", get("color"), 0.25) // a tint of the feature's color
 */
export function mixColors(from: ColorInput, to: ColorInput, ratio: NumberInput, space: "rgb" | "hcl" | "lab" = "rgb"): Expr<Color> {
  const blend = { rgb: interpolate, hcl: interpolateHcl, lab: interpolateLab }[space] as typeof interpolateLab
  return blend(linear(), ratio, [[0, from], [1, to]])
}
