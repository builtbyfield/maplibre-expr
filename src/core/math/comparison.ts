import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

import type { NumericExpression } from "../../utils/types"

/**
 * Returns the minimum value of the inputs.
 *
 * @param values - The values to compare.
 * @returns An expression that returns the minimum value of the inputs.
 *
 * @see [MapLibre Style Specification - min](https://maplibre.org/maplibre-style-spec/expressions/#min)
 *
 * @example
 * ```ts
 * expr.min([1, 2, 3]); // ["min", 1, 2, 3] -> 1
 * expr.min([1, 2, 3, 4]); // ["min", 1, 2, 3, 4] -> 1
 * expr.min([1, 2, 3, 4, 5]); // ["min", 1, 2, 3, 4, 5] -> 1
 * ```
 */
export function min(values: NumericExpression[]) {
  if (values.length < 1) {
    throw new Error("min requires at least one argument")
  }

  const [first, ...rest] = values
  return ["min", first, ...rest] satisfies ExpressionSpecification
}

/**
 * Returns the maximum value of the inputs.
 *
 * @param values - The values to compare.
 * @returns An expression that returns the maximum value of the inputs.
 *
 * @see [MapLibre Style Specification - max](https://maplibre.org/maplibre-style-spec/expressions/#max)
 */
export function max(values: NumericExpression[]) {
  if (values.length < 1) {
    throw new Error("max requires at least one argument")
  }

  const [first, ...rest] = values
  return ["max", first, ...rest] satisfies ExpressionSpecification
}

/**
 * Creates value comparison expressions for MapLibre styles
 *
 * @see [MapLibre Style Specification - Math](https://maplibre.org/maplibre-style-spec/expressions/#math)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * expr.min([1, 2, 3]) // ["min", 1, 2, 3] -> 1
 * expr.max([1, 2, 3]) // ["max", 1, 2, 3] -> 3
 * ```
 */
export const valueComparison = {
  min,
  max,
}
