import type {
  ExpressionInputType,
  ExpressionSpecification,
} from "@maplibre/maplibre-gl-style-spec"

type ExpressionValue = ExpressionInputType | ExpressionSpecification

/**
 * Provides a literal array or object value.
 *
 * @param value - The array or object to be used as a literal value
 * @returns An expression that returns the literal value
 *
 * @see [MapLibre Style Specification - literal](https://maplibre.org/maplibre-style-spec/expressions/#literal)
 *
 * @example
 * ```ts
 * expr.literal(["DIN Offc Pro Italic", "Arial Unicode MS Regular"]);
 * // ["literal", ["DIN Offc Pro Italic", "Arial Unicode MS Regular"]]
 * ```
 */
export function literal(
  value: unknown | Array<unknown> | Record<string, unknown>,
) {
  return ["literal", value] satisfies ExpressionSpecification
}

/**
 * Creates an array expression that asserts or checks array types in a MapLibre style expression.
 *
 * @param itemType - The type specification for array items or an expression that evaluates to a type
 * @param N - Optional length constraint for the array or an expression that evaluates to a number
 * @param fallback - Optional fallback value to use if the input is invalid
 * @returns An array expression specification
 *
 * @see [MapLibre Style Specification - array](https://maplibre.org/maplibre-style-spec/expressions/#array)
 *
 * @example
 * ```ts
 * // Assert an array of strings
 * expr.array("string");
 * // ["array", "string"]
 *
 * // Assert an array of strings with exact length of 2
 * expr.array("string", 2);
 * // ["array", "string", 2]
 *
 * // Assert an array of numbers with fallback
 * expr.array("number", 3, [0, 0, 0]);
 * // ["array", "number", 3, [0, 0, 0]]
 *
 * // Using expressions for type checking
 * expr.array(["typeof", ["get", "value"]], ["length", ["get", "items"]]);
 * // ["array", ["typeof", ["get", "value"]], ["length", ["get", "items"]]]
 * ```
 */
export function array(
  itemType: ExpressionInputType | ExpressionSpecification,
  N?: number | ExpressionSpecification,
  fallback?: unknown | ExpressionSpecification,
) {
  if (N !== undefined) {
    return fallback !== undefined
      ? (["array", itemType, N, fallback] satisfies ExpressionSpecification)
      : (["array", itemType, N] satisfies ExpressionSpecification)
  }
  return ["array", itemType] satisfies ExpressionSpecification
}

/**
 * Returns a string describing the type of the given value.
 *
 * @param value - The value to get the type of
 * @returns An expression that returns the type as a string
 *
 * @see [MapLibre Style Specification - typeof](https://maplibre.org/maplibre-style-spec/expressions/#typeof)
 *
 * @example
 * ```ts
 * expr.typeof(["get", "name"]); // ["typeof", ["get", "name"]]
 * ```
 */
export function typeof_(value: ExpressionSpecification | ExpressionInputType) {
  // @ts-expect-error: MapLibre types are incomplete for typeof
  return ["typeof", value] satisfies ExpressionSpecification
}

/**
 * Asserts that the input value is a string.
 *
 * @param value - The value to check
 * @param fallbacks - Optional fallback values to try
 * @returns An expression that asserts the input is a string
 *
 * @see [MapLibre Style Specification - string](https://maplibre.org/maplibre-style-spec/expressions/#string)
 *
 * @example
 * ```ts
 * expr.string(["get", "name"]); // ["string", ["get", "name"]]
 * ```
 */
export function string(
  value: ExpressionValue,
  ...fallbacks: Array<ExpressionValue>
) {
  return ["string", value, ...fallbacks] satisfies ExpressionSpecification
}

/**
 * Asserts that the input value is a number.
 *
 * @param value - The value to check
 * @param fallbacks - Optional fallback values to try
 * @returns An expression that asserts the input is a number
 *
 * @see [MapLibre Style Specification - number](https://maplibre.org/maplibre-style-spec/expressions/#number)
 *
 * @example
 * ```ts
 * expr.number(["get", "population"]); // ["number", ["get", "population"]]
 * ```
 */
export function number(
  value: ExpressionValue,
  ...fallbacks: Array<ExpressionValue>
) {
  return ["number", value, ...fallbacks] satisfies ExpressionSpecification
}

/**
 * Asserts that the input value is a boolean.
 *
 * @param value - The value to check
 * @param fallbacks - Optional fallback values to try
 * @returns An expression that asserts the input is a boolean
 *
 * @see [MapLibre Style Specification - boolean](https://maplibre.org/maplibre-style-spec/expressions/#boolean)
 *
 * @example
 * ```ts
 * expr.boolean(["feature-state", "hover"], false); // ["boolean", ["feature-state", "hover"], false]
 * ```
 */
export function boolean(
  value: ExpressionSpecification | ExpressionInputType,
  fallback?: ExpressionSpecification | ExpressionInputType,
) {
  return fallback !== undefined
    ? (["boolean", value, fallback] satisfies ExpressionSpecification)
    : (["boolean", value] satisfies ExpressionSpecification)
}

/**
 * Asserts that the input value is an object.
 *
 * @param value - The value to check
 * @param fallbacks - Optional fallback values to try
 * @returns An expression that asserts the input is an object
 *
 * @see [MapLibre Style Specification - object](https://maplibre.org/maplibre-style-spec/expressions/#object)
 *
 * @example
 * ```ts
 * expr.object(["get", "metadata"]); // ["object", ["get", "metadata"]]
 * ```
 */
export function object(
  value: ExpressionValue,
  ...fallbacks: Array<ExpressionValue | Record<string, ExpressionValue>>
) {
  return ["object", value, ...fallbacks] satisfies ExpressionSpecification
}

/**
 * Creates assertion expressions for MapLibre styles
 *
 * @see [MapLibre Style Specification - Types](https://maplibre.org/maplibre-style-spec/expressions/#types)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * expr.literal(["DIN Offc Pro Italic", "Arial Unicode MS Regular"]);
 * ```
 */
export const assertion = {
  literal,
  array,
  typeof: typeof_,
  string,
  number,
  boolean,
  object,
} as const
