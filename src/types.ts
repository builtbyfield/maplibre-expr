import type {
  CollatorExpressionSpecification,
  ColorSpecification,
  ExpressionInputType,
  ExpressionSpecification,
} from "@maplibre/maplibre-gl-style-spec";

interface NumberFormatOptions {
  locale?: string;
  currency?: string;
  "min-fraction-digits"?: number;
  "max-fraction-digits"?: number;
}

type ExpressionValue = ExpressionInputType | ExpressionSpecification;

/**
 * Provides a literal array or object value.
 *
 * @param value - The array or object to be used as a literal value
 * @returns An expression that returns the literal value
 *
 * @example
 * expr.literal(["DIN Offc Pro Italic", "Arial Unicode MS Regular"]);
 * // ["literal", ["DIN Offc Pro Italic", "Arial Unicode MS Regular"]]
 */
export function literal(
  value: unknown | Array<unknown> | Record<string, unknown>,
) {
  return ["literal", value] satisfies ExpressionSpecification;
}

/**
 * Creates an array expression that asserts or checks array types in a MapLibre style expression.
 *
 * @param itemType - The type specification for array items or an expression that evaluates to a type
 * @param N - Optional length constraint for the array or an expression that evaluates to a number
 * @param fallback - Optional fallback value to use if the input is invalid
 * @returns An array expression specification
 *
 * @example
 * // Assert an array of strings
 * expr.array("string");
 * // ["array", "string"]
 *
 * @example
 * // Assert an array of strings with exact length of 2
 * expr.array("string", 2);
 * // ["array", "string", 2]
 *
 * @example
 * // Assert an array of numbers with fallback
 * expr.array("number", 3, [0, 0, 0]);
 * // ["array", "number", 3, [0, 0, 0]]
 *
 * @example
 * // Using expressions for type checking
 * expr.array(["typeof", ["get", "value"]], ["length", ["get", "items"]]);
 * // ["array", ["typeof", ["get", "value"]], ["length", ["get", "items"]]]
 */
export function array(
  itemType: ExpressionInputType | ExpressionSpecification,
  N?: number | ExpressionSpecification,
  fallback?: unknown | ExpressionSpecification,
) {
  if (N !== undefined) {
    return fallback !== undefined
      ? (["array", itemType, N, fallback] satisfies ExpressionSpecification)
      : (["array", itemType, N] satisfies ExpressionSpecification);
  }
  return ["array", itemType] satisfies ExpressionSpecification;
}

/**
 * Returns a string describing the type of the given value.
 *
 * @param value - The value to get the type of
 * @returns An expression that returns the type as a string
 *
 * @example
 * expr.typeof(["get", "name"]); // ["typeof", ["get", "name"]]
 */
export function typeof_(value: ExpressionSpecification | ExpressionInputType) {
  // @ts-expect-error: MapLibre types are incomplete for typeof
  return ["typeof", value] satisfies ExpressionSpecification;
}

/**
 * Asserts that the input value is a string.
 *
 * @param value - The value to check
 * @param fallbacks - Optional fallback values to try
 * @returns An expression that asserts the input is a string
 *
 * @example
 * expr.string(["get", "name"]); // ["string", ["get", "name"]]
 */
export function string(
  value: ExpressionValue,
  ...fallbacks: Array<ExpressionValue>
) {
  return ["string", value, ...fallbacks] satisfies ExpressionSpecification;
}

/**
 * Asserts that the input value is a number.
 *
 * @param value - The value to check
 * @param fallbacks - Optional fallback values to try
 * @returns An expression that asserts the input is a number
 *
 * @example
 * expr.number(["get", "population"]); // ["number", ["get", "population"]]
 */
export function number(
  value: ExpressionValue,
  ...fallbacks: Array<ExpressionValue>
) {
  return ["number", value, ...fallbacks] satisfies ExpressionSpecification;
}

/**
 * Asserts that the input value is a boolean.
 *
 * @param value - The value to check
 * @param fallbacks - Optional fallback values to try
 * @returns An expression that asserts the input is a boolean
 *
 * @example
 * expr.boolean(["feature-state", "hover"], false);
 * // ["boolean", ["feature-state", "hover"], false]
 */
export function boolean(
  value: ExpressionSpecification | ExpressionInputType,
  fallback?: ExpressionSpecification | ExpressionInputType,
) {
  return fallback !== undefined
    ? (["boolean", value, fallback] satisfies ExpressionSpecification)
    : (["boolean", value] satisfies ExpressionSpecification);
}

/**
 * Asserts that the input value is an object.
 *
 * @param value - The value to check
 * @param fallbacks - Optional fallback values to try
 * @returns An expression that asserts the input is an object
 *
 * @example
 * expr.object(["get", "metadata"]); // ["object", ["get", "metadata"]]
 */
export function object(
  value: ExpressionValue,
  ...fallbacks: Array<ExpressionValue>
) {
  return ["object", value, ...fallbacks] satisfies ExpressionSpecification;
}

/**
 * Returns a collator for locale-dependent string comparisons.
 *
 * @param options - Collator options for case sensitivity, diacritic sensitivity, and locale
 * @returns An expression that returns a collator
 *
 * @example
 * expr.collator({
 *   "case-sensitive": true,
 *   "diacritic-sensitive": true,
 *   "locale": "fr"
 * });
 */
export function collator(options: {
  "case-sensitive"?: boolean | ExpressionSpecification;
  "diacritic-sensitive"?: boolean | ExpressionSpecification;
  locale?: string | ExpressionSpecification;
}) {
  return ["collator", options] satisfies CollatorExpressionSpecification;
}

/**
 * Returns a formatted string for displaying mixed-format text.
 *
 * @param sections - Array of text sections and their formatting options
 * @returns An expression that returns formatted text
 *
 * @example
 * expr.format(
 *   ["upcase", ["get", "FacilityName"]],
 *   {"font-scale": 0.8},
 *   "\n\n",
 *   {},
 *   ["downcase", ["get", "Comments"]],
 *   {"font-scale": 0.6}
 * );
 */
export function format(
  ...sections: (
    | string
    | ["image", ExpressionSpecification]
    | ExpressionSpecification
    | {
        "font-scale"?: number | ExpressionSpecification;
        "text-font"?: string[] | ExpressionSpecification;
        "text-color"?: ColorSpecification | ExpressionSpecification;
      }
  )[]
) {
  return ["format", ...sections] satisfies ExpressionSpecification;
}

/**
 * Returns an image type for use in icon-image and pattern properties.
 *
 * @param value - The image name or expression
 * @returns An expression that returns an image
 *
 * @example
 * expr.image("marker_15"); // ["image", "marker_15"]
 */
export function image(value: string | ExpressionSpecification) {
  return ["image", value] satisfies ExpressionSpecification;
}

/**
 * Formats a number according to the specified locale and options.
 *
 * @param number - The number to format
 * @param options - Formatting options including locale, currency, and fraction digits
 * @returns An expression that returns the formatted number string
 *
 * @example
 * expr.numberFormat(["get", "price"], {
 *   "locale": "de-DE",
 *   "currency": "EUR",
 *   "min-fraction-digits": 2
 * });
 */
export function numberFormat(
  number: number | ExpressionSpecification,
  options: NumberFormatOptions,
) {
  return ["number-format", number, options] satisfies ExpressionSpecification;
}

/**
 * Converts the input value to a string.
 *
 * @param value - The value to convert
 * @returns An expression that returns the string representation
 *
 * @example
 * expr.toString(["get", "population"]); // ["to-string", ["get", "population"]]
 */
export function toString(value: ExpressionValue) {
  return ["to-string", value] satisfies ExpressionSpecification;
}

/**
 * Converts the input value to a number.
 *
 * @param value - The value to convert
 * @param fallbacks - Optional fallback values to try
 * @returns An expression that returns the numeric value
 *
 * @example
 * expr.toNumber("123"); // ["to-number", "123"]
 */
export function toNumber(
  value: ExpressionValue,
  ...fallbacks: Array<ExpressionValue>
) {
  return ["to-number", value, ...fallbacks] satisfies ExpressionSpecification;
}

/**
 * Converts the input value to a boolean.
 *
 * @param value - The value to convert
 * @returns An expression that returns the boolean value
 *
 * @example
 * expr.toBoolean(""); // ["to-boolean", ""] -> false
 */
export function toBoolean(value: ExpressionValue) {
  return ["to-boolean", value] satisfies ExpressionSpecification;
}

/**
 * Converts the input value to a color.
 *
 * @param value - The value to convert
 * @param fallbacks - Optional fallback values to try
 * @returns An expression that returns the color value
 *
 * @example
 * expr.toColor("#ff0000"); // ["to-color", "#ff0000"]
 */
export function toColor(
  value: ExpressionValue,
  ...fallbacks: Array<ExpressionValue>
) {
  return ["to-color", value, ...fallbacks] satisfies ExpressionSpecification;
}

export const types = {
  literal,
  array,
  typeof: typeof_,
  string,
  number,
  boolean,
  object,
  collator,
  format,
  image,
  numberFormat,
  toString,
  toNumber,
  toBoolean,
  toColor,
};
