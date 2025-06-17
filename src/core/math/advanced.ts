import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

import type { NumericExpression } from "../../utils/types"

/**
 * Returns the absolute value of the input.
 *
 * @param value - The value to get the absolute value of.
 * @returns An expression that returns the absolute value.
 *
 * @see [MapLibre Style Specification - abs](https://maplibre.org/maplibre-style-spec/expressions/#abs)
 *
 * @example
 * ```ts
 * expr.abs(-1.5); // ["abs", -1.5] -> 1.5
 * ```
 */
export function abs(value: NumericExpression) {
  return ["abs", value] satisfies ExpressionSpecification
}

/**
 * Returns the square root of the input.
 *
 * @param value - The value to get the square root of.
 * @returns An expression that returns the square root.
 *
 * @see [MapLibre Style Specification - sqrt](https://maplibre.org/maplibre-style-spec/expressions/#sqrt)
 *
 * @example
 * ```ts
 * expr.sqrt(9); // ["sqrt", 9] -> 3
 * ```
 */
export function sqrt(value: NumericExpression) {
  return ["sqrt", value] satisfies ExpressionSpecification
}

/**
 * Returns the base-two logarithm of the input.
 *
 * @param value - The value to get the base-two logarithm of.
 * @returns An expression that returns the base-two logarithm.
 *
 * @see [MapLibre Style Specification - log2](https://maplibre.org/maplibre-style-spec/expressions/#log2)
 *
 * @example
 * ```ts
 * expr.log2(8); // ["log2", 8] -> 3
 * ```
 */
export function log2(value: NumericExpression) {
  return ["log2", value] satisfies ExpressionSpecification
}

/**
 * Returns the natural logarithm of the input.
 *
 * @param value - The value to get the natural logarithm of.
 * @returns An expression that returns the natural logarithm.
 *
 * @see [MapLibre Style Specification - ln](https://maplibre.org/maplibre-style-spec/expressions/#ln)
 *
 * @example
 * ```ts
 * expr.ln(Math.E); // ["ln", Math.E] -> 1
 * ```
 */
export function ln(value: NumericExpression) {
  return ["ln", value] satisfies ExpressionSpecification
}

/**
 * Returns the base-ten logarithm of the input.
 *
 * @param value - The value to get the base-ten logarithm of.
 * @returns An expression that returns the base-ten logarithm.
 *
 * @see [MapLibre Style Specification - log10](https://maplibre.org/maplibre-style-spec/expressions/#log10)
 *
 * @example
 * ```ts
 * expr.log10(100); // ["log10", 100] -> 2
 * ```
 */
export function log10(value: NumericExpression) {
  return ["log10", value] satisfies ExpressionSpecification
}

/**
 * Creates advanced math expressions for MapLibre styles
 *
 * @see [MapLibre Style Specification - Math](https://maplibre.org/maplibre-style-spec/expressions/#math)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * expr.abs(1.5) // ["abs", 1.5] -> 1.5
 * ```
 */
export const advanced = {
  abs,
  sqrt,
  log2,
  ln,
  log10,
} as const
