import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

import type { NumericExpression } from "../../types"

/**
 * Returns the sine of the input.
 *
 * @param value - The value to round.
 * @returns An expression that returns the sine of the input.
 *
 * @see [MapLibre Style Specification - sin](https://maplibre.org/maplibre-style-spec/expressions/#sin)
 *
 * @example
 * ```ts
 * // Simple sine
 * expr.sin(1.5) // ["sin", 1.5] -> ~0.9974949866
 * ```
 */
export function sin(value: NumericExpression): ["sin", NumericExpression] {
  return ["sin", value] satisfies ExpressionSpecification
}

/**
 * Returns the cosine of the input.
 *
 * @param value - The value to round.
 * @returns An expression that returns the cosine of the input.
 *
 * @see [MapLibre Style Specification - cos](https://maplibre.org/maplibre-style-spec/expressions/#cos)
 *
 * @example
 * ```ts
 * // Simple cosine
 * expr.cos(1.5) // ["cos", 1.5] -> ~0.0707372017
 * ```
 */
export function cos(value: NumericExpression): ["cos", NumericExpression] {
  return ["cos", value] satisfies ExpressionSpecification
}

/**
 * Returns the tangent of the input.
 *
 * @param value - The value to round.
 * @returns An expression that returns the tangent of the input.
 *
 * @see [MapLibre Style Specification - tan](https://maplibre.org/maplibre-style-spec/expressions/#tan)
 *
 * @example
 * ```ts
 * // Simple tangent
 * expr.tan(1.5) // ["tan", 1.5] -> ~14.1014199472
 * ```
 */
export function tan(value: NumericExpression): ["tan", NumericExpression] {
  return ["tan", value] satisfies ExpressionSpecification
}

/**
 * Returns the arcsine of the input.
 *
 * @param value - The value to round.
 * @returns An expression that returns the arcsine of the input.
 *
 * @see [MapLibre Style Specification - asin](https://maplibre.org/maplibre-style-spec/expressions/#asin)
 *
 * @example
 * ```ts
 * // Simple arcsine
 * expr.asin(0.5) // ["asin", 0.5] -> ~0.5235987756
 * ```
 */
export function asin(value: NumericExpression): ["asin", NumericExpression] {
  return ["asin", value] satisfies ExpressionSpecification
}

/**
 * Returns the arccosine of the input.
 *
 * @param value - The value to round.
 * @returns An expression that returns the arccosine of the input.
 *
 * @example
 * ```ts
 * // Simple arccosine
 * expr.acos(0.5) // ["acos", 0.5] -> ~1.0471975512
 * ```
 */
export function acos(value: NumericExpression): ["acos", NumericExpression] {
  return ["acos", value] satisfies ExpressionSpecification
}

/**
 * Returns the arctangent of the input.
 *
 * @param value - The value to round.
 * @returns An expression that returns the arctangent of the input.
 *
 * @see [MapLibre Style Specification - atan](https://maplibre.org/maplibre-style-spec/expressions/#atan)
 *
 * @example
 * ```ts
 * // Simple arctangent
 * expr.atan(1) // ["atan", 1] -> ~0.7853981634
 * ```
 */
export function atan(value: NumericExpression): ["atan", NumericExpression] {
  return ["atan", value] satisfies ExpressionSpecification
}

/**
 * Creates trigonometry expressions for MapLibre styles
 *
 * @see [MapLibre Style Specification - Math](https://maplibre.org/maplibre-style-spec/expressions/#math)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * expr.sin(1.5) // ["sin", 1.5] -> ~0.9974949866
 * expr.cos(1.5) // ["cos", 1.5] -> ~0.0707372017
 * expr.tan(1.5) // ["tan", 1.5] -> ~14.1014199472
 * expr.asin(0.5) // ["asin", 0.5] -> ~0.5235987756
 * expr.acos(0.5) // ["acos", 0.5] -> ~1.0471975512
 * expr.atan(1) // ["atan", 1] -> ~0.7853981634
 * ```
 */
export const trigonometry = {
  sin,
  cos,
  tan,
  asin,
  acos,
  atan,
} as const
