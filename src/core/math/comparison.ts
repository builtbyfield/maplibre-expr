import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

import type { NumericExpression } from "../../types"

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
export function min(values: [NumericExpression, ...NumericExpression[]]): ["min", ...NumericExpression[]] {
  return ["min", ...values] satisfies ExpressionSpecification
}

/**
 * Returns the maximum value of the inputs.
 *
 * @param values - The values to compare.
 * @returns An expression that returns the maximum value of the inputs.
 *
 * @see [MapLibre Style Specification - max](https://maplibre.org/maplibre-style-spec/expressions/#max)
 *
 * @example
 * ```ts
 * expr.max([1, 2, 3]); // ["max", 1, 2, 3] -> 3
 * expr.max([1, 2, 3, 4]); // ["max", 1, 2, 3, 4] -> 4
 * expr.max([1, 2, 3, 4, 5]); // ["max", 1, 2, 3, 4, 5] -> 5
 * ```
 */
export function max(values: [NumericExpression, ...NumericExpression[]]): ["max", ...NumericExpression[]] {
  return ["max", ...values] satisfies ExpressionSpecification
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
