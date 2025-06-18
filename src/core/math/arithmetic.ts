import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

import type { NumericExpression } from "../../types"

/**
 * Add two or more numbers or expressions
 *
 * @param values - The numbers or expressions to add.
 * @returns An expression that adds numbers or expressions.
 *
 * @see [MapLibre Style Specification - add (+)](https://maplibre.org/maplibre-style-spec/expressions/#_8)
 *
 * @example
 * ```ts
 * // Simple addition
 * expr.add(1, 2) // ["+", 1, 2] -> 3
 *
 * // Complex calculation
 * expr.add(
 *   expr.multiply(2, ["get", "value"]),
 *   expr.divide(10, 2)
 * ) // ["+", ["*", 2, ["get", "value"]], ["/", 10, 2]]
 * ```
 */
export function add(...values: NumericExpression[]): ["+", ...NumericExpression[]] {
  if (values.length < 1) {
    throw new Error("add operation requires at least one argument")
  }
  return ["+", ...values] satisfies ExpressionSpecification
}

/**
 * Alias for add
 */
export const sum = add

/**
 * Subtract two numbers or negate a single number.
 *
 * @param a - The first number.
 * @param b - The second number.
 * @returns An expression that subtracts the numbers or negates the single number.
 *
 * @see [MapLibre Style Specification - subtract (-)](https://maplibre.org/maplibre-style-spec/expressions/#-)
 *
 * @example
 * ```ts
 * // Subtract two numbers
 * expr.subtract(5, 3); // ["-", 5, 3] -> 2
 *
 * // Negate a single number
 * expr.subtract(5); // ["-", 5] -> -5
 *
 * // Subtract two expressions
 * expr.subtract(expr.get("a"), expr.get("b")); // ["-", ["get", "a"], ["get", "b"]]
 * ```
 */
export function subtract(a: NumericExpression, b?: NumericExpression): ["-", NumericExpression, NumericExpression?] {
  if (b === undefined) {
    return ["-", a] satisfies ExpressionSpecification
  }
  return ["-", a, b] satisfies ExpressionSpecification
}

/**
 * Multiply two or more numbers or expressions.
 *
 * @param values - The numbers or expressions to multiply.
 * @returns An expression that multiplies numbers or expressions.
 *
 * @see [MapLibre Style Specification - multiply (*)](https://maplibre.org/maplibre-style-spec/expressions/#_9)
 *
 * @example
 * ```ts
 * // Simple multiplication
 * expr.multiply(2, 3); // ["*", 2, 3] -> 6
 *
 * // Complex calculation
 * expr.multiply(expr.get("a"), expr.get("b")); // ["*", ["get", "a"], ["get", "b"]]
 *
 * // Multiple arguments
 * expr.multiply(1, 2, 3, 4); // ["*", 1, 2, 3, 4] -> 24
 * ```
 */
export function multiply(...values: [NumericExpression, NumericExpression, ...NumericExpression[]]): ["*", NumericExpression, NumericExpression, ...NumericExpression[]] {
  return ["*", ...values] satisfies ExpressionSpecification
}

/**
 * Divide two numbers or expressions.
 *
 * @param numerator - The numerator number or expression.
 * @param denominator - The denominator number or expression.
 * @returns An expression that divides the numbers or expressions.
 *
 * @see [MapLibre Style Specification - divide (/)](https://maplibre.org/maplibre-style-spec/expressions/#_10)
 *
 * @example
 * ```ts
 * // Simple division
 * expr.divide(6, 2); // ["/", 6, 2] -> 3
 *
 * // Divide two expressions
 * expr.divide(expr.get("a"), expr.get("b")); // ["/", ["get", "a"], ["get", "b"]]
 * ```
 */
export function divide(
  numerator: NumericExpression,
  denominator: NumericExpression,
): ["/", NumericExpression, NumericExpression] {
  return ["/", numerator, denominator]
}

/**
 * Returns the remainder after integer division of the first input by the second.
 *
 * @param a - The dividend number or expression.
 * @param b - The divisor number or expression.
 * @returns An expression that returns the remainder after integer division.
 *
 * @see [MapLibre Style Specification - modulo (%)](https://maplibre.org/maplibre-style-spec/expressions/#_11)
 *
 * @example
 * ```ts
 * // Simple modulo
 * expr.mod(10, 3); // ["%", 10, 3] -> 1
 *
 * // Modulo two expressions
 * expr.mod(expr.get("a"), expr.get("b")); // ["%", ["get", "a"], ["get", "b"]]
 * ```
 */
export function mod(a: NumericExpression, b: NumericExpression): ["%", NumericExpression, NumericExpression] {
  return ["%", a, b]
}

/**
 * Raise a number or expression to a power.
 *
 * @param base - The base number or expression.
 * @param exp - The exponent number or expression.
 * @returns An expression that returns the base raised to the power of the exponent.
 *
 * @see [MapLibre Style Specification - power (^)](https://maplibre.org/maplibre-style-spec/expressions/#_12)
 *
 * @example
 * ```ts
 * // Simple power
 * expr.pow(2, 3); // ["^", 2, 3] -> 8
 *
 * // Power two expressions
 * expr.pow(expr.get("a"), expr.get("b")); // ["^", ["get", "a"], ["get", "b"]]
 * ```
 */
export function pow(base: NumericExpression, exp: NumericExpression): ["^", NumericExpression, NumericExpression] {
  return ["^", base, exp]
}

/**
 * Creates arithmetic expressions for MapLibre styles
 *
 * @see [MapLibre Style Specification - Math](https://maplibre.org/maplibre-style-spec/expressions/#math)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * // Simple addition
 * expr.add(1, 2) // ["+", 1, 2]
 *
 * // Complex calculation
 * expr.add(
 *   expr.multiply(2, ["get", "value"]),
 *   expr.divide(10, 2)
 * ) // ["+", ["*", 2, ["get", "value"]], ["/", 10, 2]]
 * ```
 */
export const arithmetic = {
  add,
  subtract,
  multiply,
  divide,
  mod,
  pow,
} as const
