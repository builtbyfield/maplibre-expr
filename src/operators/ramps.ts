import type { Color, ColorInput, Expr, ExprLike, Input, NumberInput } from "../expr"

import { op } from "../internal"

/** How {@link interpolate} blends between stops. Build with {@link linear}, {@link exponential} or {@link cubicBezier}. */
export type Interpolation
  = | readonly ["linear"]
    | readonly ["exponential", number]
    | readonly ["cubic-bezier", number, number, number, number]

/** A `[input, output]` stop of a ramp. `input` must be a number literal. */
export type Stop<T> = readonly [input: number, output: T]

/** One or more stops, with inputs in strictly ascending order. */
export type Stops<T> = readonly [Stop<T>, ...Stop<T>[]]

/**
 * Linear interpolation between stops.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#interpolate
 */
export function linear(): Interpolation {
  return ["linear"]
}

/**
 * Exponential interpolation: `base` controls how fast the output grows
 * (`1` is linear; values above 1 put more change at the high end). A common
 * choice for zoom-based sizes is `1.5`-`2`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#interpolate
 */
export function exponential(base: number): Interpolation {
  return ["exponential", base]
}

/**
 * Interpolation along a cubic Bezier curve through `(0,0)`, `(x1,y1)`,
 * `(x2,y2)`, `(1,1)`, like CSS `cubic-bezier()`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#interpolate
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): Interpolation {
  return ["cubic-bezier", x1, y1, x2, y2]
}

/**
 * Smoothly interpolates between stops. Outputs may be numbers, colors, or
 * arrays of either. MapLibre `interpolate`.
 *
 * Throws if stop inputs aren't in strictly ascending order.
 *
 * @example
 * // Line width that grows with zoom
 * interpolate(exponential(1.5), zoom(), [[10, 1], [18, 12]])
 * @example
 * // Color by population density
 * interpolate(linear(), get("density"), [[0, "#ffffcc"], [500, "#fd8d3c"], [2000, "#800026"]])
 * @see https://maplibre.org/maplibre-style-spec/expressions/#interpolate
 */
export function interpolate(type: Interpolation, input: NumberInput, stops: Stops<NumberInput>): Expr<number>
export function interpolate(type: Interpolation, input: NumberInput, stops: Stops<ColorInput>): Expr<Color>
export function interpolate(type: Interpolation, input: NumberInput, stops: Stops<ExprLike<readonly number[]>>): Expr<readonly number[]>
export function interpolate(type: Interpolation, input: NumberInput, stops: Stops<ExprLike<readonly Color[]>>): Expr<readonly Color[]>
export function interpolate(type: Interpolation, input: NumberInput, stops: Stops<unknown>): Expr<unknown> {
  return op("interpolate", type, input, ...flattenStops("interpolate", stops))
}

/**
 * Like {@link interpolate} for colors, but blends in the HCL color space,
 * which avoids muddy midpoints between saturated hues.
 * MapLibre `interpolate-hcl`.
 *
 * @example interpolateHcl(linear(), get("temp"), [[-10, "blue"], [35, "red"]])
 * @see https://maplibre.org/maplibre-style-spec/expressions/#interpolate-hcl
 */
export function interpolateHcl(type: Interpolation, input: NumberInput, stops: Stops<ColorInput>): Expr<Color> {
  return op("interpolate-hcl", type, input, ...flattenStops("interpolateHcl", stops))
}

/**
 * Like {@link interpolate} for colors, but blends in the CIELAB color
 * space, which keeps perceived lightness changes even.
 * MapLibre `interpolate-lab`.
 *
 * @example interpolateLab(linear(), get("score"), [[0, "#fff"], [100, "#08306b"]])
 * @see https://maplibre.org/maplibre-style-spec/expressions/#interpolate-lab
 */
export function interpolateLab(type: Interpolation, input: NumberInput, stops: Stops<ColorInput>): Expr<Color> {
  return op("interpolate-lab", type, input, ...flattenStops("interpolateLab", stops))
}

/**
 * Discrete steps: returns `base` below the first stop, then each stop's
 * output from its input upward. Works for any output type.
 * MapLibre `step`.
 *
 * Throws if stop inputs aren't in strictly ascending order.
 *
 * @example
 * // Circle radius by point count: 10 below 100, 20 from 100, 30 from 750
 * step(get("point_count"), 10, [[100, 20], [750, 30]])
 * @see https://maplibre.org/maplibre-style-spec/expressions/#step
 */
export function step<T>(input: NumberInput, base: Input<T>, stops: Stops<Input<NoInfer<T>>>): Expr<T> {
  return op("step", input, base, ...flattenStops("step", stops))
}

function flattenStops(fn: string, stops: Stops<unknown>): unknown[] {
  const out: unknown[] = []
  let previous = -Infinity
  for (const [input, output] of stops) {
    if (!(input > previous))
      throw new RangeError(`${fn}: stop inputs must be strictly ascending, got ${input} after ${previous}`)
    previous = input
    out.push(input, output)
  }
  return out
}
