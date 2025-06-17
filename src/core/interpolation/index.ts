import type { ColorSpecification, ExpressionInputType, ExpressionSpecification, InterpolationSpecification, ProjectionDefinitionSpecification } from "@maplibre/maplibre-gl-style-spec"
import type { NumericExpression } from "../../types"

type InterpolationType
  = | {
    type: "linear"
  }
  | {
    type: "exponential"
    base: NumericExpression
  }
  | {
    type: "cubic-bezier"
    x1: NumericExpression
    y1: NumericExpression
    x2: NumericExpression
    y2: NumericExpression
  }

interface Stop {
  input: number
  output: ExpressionInputType | ExpressionSpecification
}

/**
 * Produces discrete, stepped results by evaluating a piecewise-constant
 * function defined by pairs of input and output values ("stops"). The `input`
 * may be any numeric expression (e.g., `["get", "population"]`). Stop inputs
 * must be numeric literals in strictly ascending order.
 *
 * Returns the output value of the stop just less than the input, or the first
 * output if the input is less than the first stop.
 *
 * @param input - The input expression
 * @param fallback - The fallback value for inputs that are less than the first stop
 * @param stops - Array of { input, output } pairs
 * @returns An expression that produces stepped output
 *
 * @see [MapLibre Style Specification - step](https://maplibre.org/maplibre-style-spec/expressions/#step)
 *
 * @example
 * ```ts
 * // Step function for circle color based on population
 * expr.interpolation.step(
 *   ["get", "population"],
 *   "#f1f075", // fallback color
 *   { input: 50000, output: "#e55e5e" },
 *   { input: 100000, output: "#722f37" }
 * ); // ["step", ["get", "population"], "#f1f075", 50000, "#e55e5e", 100000, "#722f37"]
 * ```
 */
export function step(
  input: NumericExpression,
  fallback: ExpressionInputType | ExpressionSpecification,
  ...stops: Stop[]
): ExpressionSpecification {
  return [
    "step",
    input,
    fallback,
    ...stops.flatMap(stop => [stop.input, stop.output]),
  ] satisfies ExpressionSpecification
}

/**
 * Produces continuous, smooth results by interpolating between pairs of input
 * and output values ("stops"). The `input` may be any numeric expression
 * (e.g., `["get", "population"]`). Stop inputs must be numeric literals in
 * strictly ascending order. The output type must be `number`, `array<number>`,
 * `color`, `array<color>`, or `projection`.
 *
 * Interpolation types:
 *
 * - `["linear"]`, or an expression returning one of those types: Interpolates
 *   linearly between the pair of stops just less than and just greater than the
 *   input.
 * - `["exponential", base]`: Interpolates exponentially between the stops just
 *   less than and just greater than the input. base controls the rate at which
 *   the output increases: higher values make the output increase more towards
 *   the high end of the range. With values close to 1 the output increases
 *   linearly.
 * - `["cubic-bezier", x1, y1, x2, y2]`: Interpolates using the cubic bezier
 *   curve defined by the given control points.
 *
 * Syntax:
 *
 * ```
 * ["interpolate", interpolation_type, input, stop_1_input, stop_1_output, ..., stop_n_input, stop_n_output]: number | array<number> | color | array<color> | projection
 * ```
 *
 * - `interpolation_type`: _["linear"]_ | _["exponential", base]_ | _["cubic-bezier", x1, y1, x2, y2]_ — The interpolation type.
 * - `input`: _number_ — Any numeric expression.
 * - `stop_i_input`: _number literal_ — The value of the i-th stop against which the input is compared.
 * - `stop_i_output`: _number_ | _array<number>_ | _color_ | _array<color>_ | _projection_ — The output value corresponding to the i-th stop.
 *
 * @param interpolationType - The interpolation type: linear, exponential, or cubic-bezier
 * @param input - The input expression (usually numeric)
 * @param stops - Array of [input, output] pairs
 * @returns An expression that interpolates between the stops
 *
 * @see [MapLibre Style Specification - interpolate](https://maplibre.org/maplibre-style-spec/expressions/#interpolate)
 *
 * @example
 * ```ts
 * // Linear interpolation for circle radius based on zoom
 * expr.interpolation.interpolate(
 *   ["linear"],
 *   ["zoom"],
 *   [5, 1],
 *   [10, 5]
 * ); // ["interpolate", ["linear"], ["zoom"], 5, 1, 10, 5]
 *
 * // Exponential interpolation
 * expr.interpolation.interpolate(
 *   ["exponential", 1.5],
 *   ["get", "population"],
 *   [0, "#f1f075"],
 *   [50000, "#e55e5e"]
 * );
 * ```
 */
export function interpolate(
  interpolationType: InterpolationType,
  input: NumericExpression,
  ...stops: {
    input: number
    output: number | Array<number> | ColorSpecification | ExpressionSpecification | ProjectionDefinitionSpecification
  }[]
): ExpressionSpecification {
  const flatStops = stops.flatMap(stop => [stop.input, stop.output])

  switch (interpolationType.type) {
    case "linear":
      return [
        "interpolate",
        [
          "linear",
        ] satisfies InterpolationSpecification,
        input,
        ...flatStops,
      ] satisfies ExpressionSpecification
    case "exponential":
      return [
        "interpolate",
        [
          "exponential",
          interpolationType.base,
        ] satisfies InterpolationSpecification,
        input,
        ...flatStops,
      ] satisfies ExpressionSpecification
    case "cubic-bezier":
      return [
        "interpolate",
        [
          "cubic-bezier",
          interpolationType.x1,
          interpolationType.y1,
          interpolationType.x2,
          interpolationType.y2,
        ] satisfies InterpolationSpecification,
        input,
        ...flatStops,
      ] satisfies ExpressionSpecification
    default:
      // @ts-expect-error - This should never happen, but we need to satisfy the type checker
      throw new Error(`Invalid interpolation type: ${interpolationType.type}`)
  }
}

/**
 * Produces continuous, smooth results by interpolating between pairs of input
 * and output values ("stops"). Works like `interpolate`, but the output type
 * must be `color` or `array<color>`, and the interpolation is performed in the
 * Hue-Chroma-Luminance color space.
 *
 * @param interpolationType - The interpolation type: linear, exponential, or cubic-bezier
 * @param input - The input expression (usually numeric)
 * @param stops - Array of [input, output] pairs
 * @returns An expression that interpolates between the stops
 *
 * @see [MapLibre Style Specification - interpolate-hcl](https://maplibre.org/maplibre-style-spec/expressions/#interpolate-hcl)
 *
 * @example
 * ```ts
 * // Linear interpolation for circle color based on population
 * expr.interpolation.interpolateHcl(
 *   ["linear"],
 *   ["get", "population"],
 *   [0, "#f1f075"],
 *   [50000, "#e55e5e"]
 * ); // ["interpolate-hcl", ["linear"], ["get", "population"], 0, "#f1f075", 50000, "#e55e5e"]
 * ```
 */
export function interpolateHcl(
  interpolationType: InterpolationType,
  input: NumericExpression,
  ...stops: {
    input: number
    output: ColorSpecification | Array<ColorSpecification>
  }[]
): ExpressionSpecification {
  const flatStops = stops.flatMap(stop => [stop.input, stop.output])

  switch (interpolationType.type) {
    case "linear":
      return [
        "interpolate-hcl",
        [
          "linear",
        ] satisfies InterpolationSpecification,
        input,
        ...flatStops,
      ] as ExpressionSpecification // We use `as` here because Array<ColorSpecification> doesn't satisfy the ExpressionSpecification type for some reason
    case "exponential":
      return [
        "interpolate-hcl",
        [
          "exponential",
          interpolationType.base,
        ] satisfies InterpolationSpecification,
        input,
        ...flatStops,
      ] as ExpressionSpecification // We use `as` here because Array<ColorSpecification> doesn't satisfy the ExpressionSpecification type for some reason
    case "cubic-bezier":
      return [
        "interpolate-hcl",
        [
          "cubic-bezier",
          interpolationType.x1,
          interpolationType.y1,
          interpolationType.x2,
          interpolationType.y2,
        ] satisfies InterpolationSpecification,
        input,
        ...flatStops,
      ] as ExpressionSpecification // We use `as` here because Array<ColorSpecification> doesn't satisfy the ExpressionSpecification type for some reason
    default:
      // @ts-expect-error - This should never happen, but we need to satisfy the type checker
      throw new Error(`Invalid interpolation-hcl type: ${interpolationType.type}`)
  }
}

/**
 * Produces continuous, smooth results by interpolating between pairs of input
 * and output values ("stops"). Works like `interpolate`, but the output type
 * must be `color` or `array<color>`, and the interpolation is performed in the
 * CIELAB color space.
 *
 * @param interpolationType - The interpolation type: linear, exponential, or cubic-bezier
 * @param input - The input expression (usually numeric)
 * @param stops - Array of [input, output] pairs
 * @returns An expression that interpolates between the stops
 *
 * @see [MapLibre Style Specification - interpolate-lab](https://maplibre.org/maplibre-style-spec/expressions/#interpolate-lab)
 *
 * @example
 * ```ts
 * // Linear interpolation for circle color based on population
 * expr.interpolation.interpolateLab(
 *   ["linear"],
 *   ["get", "population"],
 *   [0, "#f1f075"],
 *   [50000, "#e55e5e"]
 * ); // ["interpolate-lab", ["linear"], ["get", "population"], 0, "#f1f075", 50000, "#e55e5e"]
 * ```
 */
export function interpolateLab(
  interpolationType: InterpolationType,
  input: NumericExpression,
  ...stops: {
    input: number
    output: ColorSpecification | Array<ColorSpecification>
  }[]
): ExpressionSpecification {
  const flatStops = stops.flatMap(stop => [stop.input, stop.output])

  switch (interpolationType.type) {
    case "linear":
      return [
        "interpolate-lab",
        [
          "linear",
        ] satisfies InterpolationSpecification,
        input,
        ...flatStops,
      ] as ExpressionSpecification // We use `as` here because Array<ColorSpecification> doesn't satisfy the ExpressionSpecification type for some reason
    case "exponential":
      return [
        "interpolate-lab",
        [
          "exponential",
          interpolationType.base,
        ] satisfies InterpolationSpecification,
        input,
        ...flatStops,
      ] as ExpressionSpecification // We use `as` here because Array<ColorSpecification> doesn't satisfy the ExpressionSpecification type for some reason
    case "cubic-bezier":
      return [
        "interpolate-lab",
        [
          "cubic-bezier",
          interpolationType.x1,
          interpolationType.y1,
          interpolationType.x2,
          interpolationType.y2,
        ] satisfies InterpolationSpecification,
        input,
        ...flatStops,
      ] as ExpressionSpecification // We use `as` here because Array<ColorSpecification> doesn't satisfy the ExpressionSpecification type for some reason
    default:
      // @ts-expect-error - This should never happen, but we need to satisfy the type checker
      throw new Error(`Invalid interpolation-lab type: ${interpolationType.type}`)
  }
}

/**
 * Interpolation (ramps, scales, and curves) expressions for MapLibre Style Specification.
 *
 * @see [MapLibre Style Specification - Ramps, scales, and curves](https://maplibre.org/maplibre-style-spec/expressions/#ramps-scales-curves)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * // Linear interpolation for circle radius
 * expr.interpolation.interpolate(
 *   ["linear"],
 *   ["zoom"],
 *   [5, 1],
 *   [10, 5]
 * ); // ["interpolate", ["linear"], ["zoom"], 5, 1, 10, 5]
 *
 * // Step function for discrete values
 * expr.interpolation.step(
 *   ["get", "population"],
 *   "#f1f075",
 *   [50000, "#e55e5e"],
 *   [100000, "#722f37"]
 * ); // ["step", ["get", "population"], "#f1f075", 50000, "#e55e5e", 100000, "#722f37"]
 * ```
 */
export const interpolation = {
  step,
  interpolate,
  interpolateHcl,
  interpolateLab,
} as const
