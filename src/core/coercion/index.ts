import type {
  ExpressionInputType,
  ExpressionSpecification,
} from "@maplibre/maplibre-gl-style-spec"

import type { UnknownExpression } from "../../types"

type ExpressionValue = ExpressionInputType | ExpressionSpecification

/**
 * Converts the input value to a string.
 *
 * @remarks
 * If the input is:
 *
 * - `null`, the result is `""`.
 * - a _boolean_, the result is `"true"` or `"false"`.
 * - a _number_, it is converted to a string as specified by the ["NumberToString"](https://tc39.github.io/ecma262/#sec-tostring-applied-to-the-number-type) algorithm of the ECMAScript Language Specification (e.g. `123` -> `"123"`)
 * - a _color_, it is converted to a string of the form `"rgba(r,g,b,a)"`, where `r`, `g`, and `b` are numerals ranging from 0 to 255, and `a` ranges from 0 to 1.
 *
 * Otherwise, the input is converted to a string in the format specified by the
 * [`JSON.stringify`](https://tc39.github.io/ecma262/#sec-json.stringify)
 * function of the ECMAScript Language Specification.
 *
 * This function abstracts the following syntax:
 *
 * ```ts
 * ["to-string", value]: string
 * ```
 *
 * @see {@link https://maplibre.org/maplibre-style-spec/expressions/#to-string|MapLibre Style Spec - to-string} for more details.
 *
 * @param value - The value to convert
 * @returns An expression that returns the string representation
 *
 * @example Number to string
 * ```ts
 * // Suppose there is a feature with a property "population" with value 123
 * expr.toString(["get", "population"]); // ["to-string", ["get", "population"]] -> "123"
 * ```
 *
 * @example Boolean to string
 * ```ts
 * // Suppose there is a feature with a property "isActive" with boolean value
 * expr.toString(false); // ["to-string", false] -> "false"
 * expr.toString(true); // ["to-string", true] -> "true"
 * ```
 *
 * @example Null to string
 * ```ts
 * // Suppose there is a feature with a property "name" with null value
 * expr.toString(["get", "name"]); // ["to-string", ["get", "name"]] -> ""
 * ```
 *
 * @example Color to string
 * ```ts
 * // Suppose there is a feature with a property "color" with color value
 * expr.toString(["get", "color"]); // ["to-string", ["get", "color"]] -> "rgba(255, 0, 0, 1)"
 * ```
 *
 * @example Object to string
 * ```ts
 * // Suppose there is a feature with a property "address" with object value
 * expr.toString(["get", "address"]); // ["to-string", ["get", "address"]] -> "{\"street\":\"123 Main St\",\"city\":\"Anytown\",\"state\":\"CA\",\"zip\":\"12345\"}"
 * ```
 */
export function toString(value: ExpressionValue): ["to-string", UnknownExpression] {
  return ["to-string", value] satisfies ExpressionSpecification
}

/**
 * Converts the input value to a number, if possible.
 *
 * @remarks
 * If the input is:
 *
 * - `null` or `false`, the result is `0`.
 * - `true`, the result is `1`.
 * - a _string_, it is converted to a number as specified by the
 *   ["ToNumber Applied to the String Type"](https://tc39.github.io/ecma262/#sec-tonumber-applied-to-the-string-type)
 *   algorithm of the ECMAScript Language Specification.
 *
 * If multiple values are provided, each one is evaluated in order until the
 * first successful conversion is obtained.
 *
 * If none of the inputs can be converted, the expression is an error.
 *
 * This function abstracts the following syntax:
 *
 * ```ts
 * ["to-number", value_1, ..., value_n]: number
 * ```
 *
 * @see {@link https://maplibre.org/maplibre-style-spec/expressions/#to-number|MapLibre Style Spec - to-number} for more details.
 *
 * @param values - The values to convert
 * @returns An expression that returns the numeric value
 *
 * @example String to number
 * ```ts
 * toNumber("123"); // ["to-number", "123"] -> 123
 * ```
 *
 * @example Boolean to number
 * ```ts
 * toNumber(false); // ["to-number", false] -> 0
 * toNumber(true); // ["to-number", true] -> 1
 * ```
 *
 * @example Fallback values
 * ```ts
 * toNumber("123", "456"); // ["to-number", "123", "456"] -> 123
 * toNumber("123", "abc"); // ["to-number", "123", "abc"] -> 123
 * toNumber("abc", "123"); // ["to-number", "abc", "123"] -> 123
 * toNumber("abc", "def"); // ["to-number", "abc", "def"] -> error
 * ```
 */
export function toNumber(
  ...values: [ExpressionValue, ...ExpressionValue[]]
): ["to-number", UnknownExpression, ...UnknownExpression[]] {
  return ["to-number", ...values] satisfies ExpressionSpecification
}

/**
 * Converts the input value to a boolean.
 *
 * @remarks
 * The result is `false` when the input is an empty _string_, `0`, `false`,
 * `null`, or `NaN`; otherwise it is `true`.
 *
 * This function abstracts the following syntax:
 *
 * ```ts
 * ["to-boolean", value]: boolean
 * ```
 *
 * @see {@link https://maplibre.org/maplibre-style-spec/expressions/#to-boolean|MapLibre Style Spec - to-boolean} for more details.
 *
 * @param value - The value to convert
 * @returns An expression that returns the boolean value
 *
 * @example Empty string to boolean
 * ```ts
 * toBoolean(""); // ["to-boolean", ""] -> false
 * ```
 *
 * @example Number to boolean
 * ```ts
 * toBoolean(0); // ["to-boolean", 0] -> false
 * ```
 *
 * @example Boolean to boolean
 * ```ts
 * toBoolean(true); // ["to-boolean", true] -> true
 * toBoolean(false); // ["to-boolean", false] -> false
 * ```
 *
 * @example Null to boolean
 * ```ts
 * toBoolean(null); // ["to-boolean", null] -> false
 * ```
 *
 * @example NaN to boolean
 * ```ts
 * toBoolean(NaN); // ["to-boolean", NaN] -> false
 * ```
 */
export function toBoolean(value: ExpressionValue): ["to-boolean", UnknownExpression] {
  return ["to-boolean", value] satisfies ExpressionSpecification
}

/**
 * Converts the input value to a color.
 *
 * @remarks
 * If multiple values are provided, each one is evaluated in order until the
 * first successful conversion is obtained.
 *
 * If none of the inputs can be converted, the expression is an error.
 *
 * This function abstracts the following syntax:
 *
 * ```ts
 * ["to-color", value_1, ..., value_n]: color
 * ```
 *
 * @see {@link https://maplibre.org/maplibre-style-spec/expressions/#to-color|MapLibre Style Spec - to-color} for more details.
 *
 * @param values - The values to convert
 * @returns An expression that returns the color value
 *
 * @example String to color
 * ```ts
 * toColor("#ff0000"); // ["to-color", "#ff0000"] -> "rgba(255, 0, 0, 1)"
 * ```
 *
 * @example Number to color
 * ```ts
 * toColor(123); // ["to-color", 123] -> "rgba(123, 123, 123, 1)"
 * ```
 *
 * @example Boolean to color
 * ```ts
 * toColor(true); // ["to-color", true] -> "rgba(255, 255, 255, 1)"
 * toColor(false); // ["to-color", false] -> "rgba(0, 0, 0, 0)"
 * ```
 *
 * @example Null to color
 * ```ts
 * toColor(null); // ["to-color", null] -> "rgba(0, 0, 0, 0)"
 * ```
 *
 * @example Fallback values
 * ```ts
 * toColor("#ff0000", "#000000"); // ["to-color", "#ff0000", "#000000"] -> "rgba(255, 0, 0, 1)"
 * toColor("#ff0000", "#000000", "#ffffff"); // ["to-color", "#ff0000", "#000000", "#ffffff"] -> "rgba(255, 0, 0, 1)"
 * toColor(null, 123, "#ffffff"); // ["to-color", null, 123, "#ffffff"] -> "rgba(123, 123, 123, 1)"
 * ```
 */
export function toColor(
  ...values: [ExpressionValue, ...ExpressionValue[]]
): ["to-color", UnknownExpression, ...UnknownExpression[]] {
  return ["to-color", ...values] satisfies ExpressionSpecification
}

/**
 * Creates coercion expressions for MapLibre styles
 *
 * @see {@link https://maplibre.org/maplibre-style-spec/expressions/#types|MapLibre Style Specification - Types} for more details.
 */
export const coercion = {
  toString,
  toNumber,
  toBoolean,
  toColor,
} as const
