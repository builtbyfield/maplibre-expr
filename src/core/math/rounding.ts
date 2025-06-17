import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

import type { NumericExpression } from "../../utils/types"

/**
 * Rounds the input to the nearest integer. Halfway values are rounded away from zero.
 *
 * @param value - The value to round.
 * @returns An expression that rounds the input to the nearest integer.
 *
 * @see [MapLibre Style Specification - round](https://maplibre.org/maplibre-style-spec/expressions/#round)
 *
 * @example
 * ```ts
 * // Simple rounding
 * expr.round(1.5); // ["round", 1.5] -> 2
 * expr.round(-1.5); // ["round", -1.5] -> -2
 *
 * // Rounding with a decimal
 * expr.round(0.2); // ["round", 0.2] -> 0
 * expr.round(0.5); // ["round", 0.5] -> 1
 * expr.round(-0.5); // ["round", -0.5] -> -1
 * ```
 */
export function round<T extends NumericExpression>(value: T) {
  return ["round", value] satisfies ExpressionSpecification
}

/**
 * Returns the smallest integer that is greater than or equal to the input.
 *
 * @param value - The value to round.
 * @returns An expression that rounds the input to the nearest integer.
 *
 * @see [MapLibre Style Specification - ceil](https://maplibre.org/maplibre-style-spec/expressions/#ceil)
 *
 * @example
 * ```ts
 * // Simple rounding
 * expr.ceil(1.5); // ["ceil", 1.5] -> 2
 * expr.ceil(-1.5); // ["ceil", -1.5] -> -1
 *
 * // Rounding with a decimal
 * expr.ceil(0.2); // ["ceil", 0.2] -> 1
 * expr.ceil(0.5); // ["ceil", 0.5] -> 1
 * expr.ceil(-0.5); // ["ceil", -0.5] -> 0
 * ```
 */
export function ceil<T extends NumericExpression>(value: T) {
  return ["ceil", value] satisfies ExpressionSpecification
}

/**
 * Returns the largest integer that is less than or equal to the input.
 *
 * @param value - The value to round.
 * @returns An expression that rounds the input to the nearest integer.
 *
 * @see [MapLibre Style Specification - floor](https://maplibre.org/maplibre-style-spec/expressions/#floor)
 *
 * @example
 * ```ts
 * // Simple rounding
 * expr.floor(1.5); // ["floor", 1.5] -> 1
 * expr.floor(-1.5); // ["floor", -1.5] -> -2
 *
 * // Rounding with a decimal
 * expr.floor(0.2); // ["floor", 0.2] -> 0
 * expr.floor(0.5); // ["floor", 0.5] -> 0
 * expr.floor(-0.5); // ["floor", -0.5] -> -1
 * ```
 */
export function floor<T extends NumericExpression>(value: T) {
  return ["floor", value] satisfies ExpressionSpecification
}

/**
 * Creates rounding expressions for MapLibre styles
 *
 * @see [MapLibre Style Specification - Math](https://maplibre.org/maplibre-style-spec/expressions/#math)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * expr.round(1.5) // ["round", 1.5] -> 2
 * expr.ceil(1.5) // ["ceil", 1.5] -> 2
 * expr.floor(1.5) // ["floor", 1.5] -> 1
 *
 * expr.round(0.2) // ["round", 0.2] -> 0
 * expr.ceil(0.2) // ["ceil", 0.2] -> 1
 * expr.floor(0.2) // ["floor", 0.2] -> 0
 * ```
 */
export const rounding = {
  round,
  ceil,
  floor,
} as const
