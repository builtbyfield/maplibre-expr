import type {
  ExpressionInputType,
  ExpressionSpecification,
} from "@maplibre/maplibre-gl-style-spec"

type ExpressionValue = ExpressionInputType | ExpressionSpecification

/**
 * Converts the input value to a string.
 *
 * @param value - The value to convert
 * @returns An expression that returns the string representation
 *
 * @see [MapLibre Style Specification - to-string](https://maplibre.org/maplibre-style-spec/expressions/#to-string)
 *
 * @example
 * ```ts
 * expr.toString(["get", "population"]); // ["to-string", ["get", "population"]]
 * ```
 */
export function toString(value: ExpressionValue) {
  return ["to-string", value] satisfies ExpressionSpecification
}

/**
 * Converts the input value to a number.
 *
 * @param value - The value to convert
 * @param fallbacks - Optional fallback values to try
 * @returns An expression that returns the numeric value
 *
 * @see [MapLibre Style Specification - to-number](https://maplibre.org/maplibre-style-spec/expressions/#to-number)
 *
 * @example
 * ```ts
 * expr.toNumber("123"); // ["to-number", "123"]
 * ```
 */
export function toNumber(
  value: ExpressionValue,
  ...fallbacks: Array<ExpressionValue>
) {
  return ["to-number", value, ...fallbacks] satisfies ExpressionSpecification
}

/**
 * Converts the input value to a boolean.
 *
 * @param value - The value to convert
 * @returns An expression that returns the boolean value
 *
 * @see [MapLibre Style Specification - to-boolean](https://maplibre.org/maplibre-style-spec/expressions/#to-boolean)
 *
 * @example
 * expr.toBoolean(""); // ["to-boolean", ""] -> false
 */
export function toBoolean(value: ExpressionValue) {
  return ["to-boolean", value] satisfies ExpressionSpecification
}

/**
 * Converts the input value to a color.
 *
 * @param value - The value to convert
 * @param fallbacks - Optional fallback values to try
 * @returns An expression that returns the color value
 *
 * @see [MapLibre Style Specification - to-color](https://maplibre.org/maplibre-style-spec/expressions/#to-color)
 *
 * @example
 * ```ts
 * expr.toColor("#ff0000"); // ["to-color", "#ff0000"]
 * ```
 */
export function toColor(
  value: ExpressionValue,
  ...fallbacks: Array<ExpressionValue>
) {
  return ["to-color", value, ...fallbacks] satisfies ExpressionSpecification
}

/**
 * Creates conversion expressions for MapLibre styles
 *
 * @see [MapLibre Style Specification - Types](https://maplibre.org/maplibre-style-spec/expressions/#types)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * expr.toString(["get", "population"]);
 * ```
 */
export const conversion = {
  toString,
  toNumber,
  toBoolean,
  toColor,
} as const
