import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"
import type { CollatorExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

import type { StringExpression } from "../../utils/types"

/**
 * Returns `true` if the input string is expected to render legibly. Returns
 * `false` if the input string contains sections that cannot be rendered without
 * potential loss of meaning (e.g. Indic scripts that require complex text
 * shaping, or right-to-left scripts if the `mapbox-gl-rtl-text` plugin is not
 * in use in MapLibre GL JS).
 *
 * @param value - The string to check if it is supported.
 * @returns An expression that returns `true` if the string is supported, `false` otherwise.
 *
 * @see [MapLibre Style Specification - is-supported-script](https://maplibre.org/maplibre-style-spec/expressions/#is-supported-script)
 *
 * @example
 * ```ts
 * expr.isSupportedScript("दिल्ली"); // ["is-supported-script", "दिल्ली"]
 * ```
 */
export function isSupportedScript(value: StringExpression) {
  return ["is-supported-script", value] satisfies ExpressionSpecification
}

/**
 * Returns the input string converted to uppercase. Follows the Unicode Default
 * Case Conversion algorithm and the locale-insensitive case mappings in the
 * Unicode Character Database.
 *
 * @param value - The string to convert to uppercase.
 * @returns An expression that returns the uppercase string.
 *
 * @see [MapLibre Style Specification - upcase](https://maplibre.org/maplibre-style-spec/expressions/#upcase)
 *
 * @example
 * ```ts
 * expr.upcase("Mixed Case"); // ["upcase", "Mixed Case"] -> "MIXED CASE"
 * ```
 */
export function upcase(value: StringExpression) {
  return ["upcase", value] satisfies ExpressionSpecification
}

/**
 * Returns the input string converted to lowercase. Follows the Unicode Default
 * Case Conversion algorithm and the locale-insensitive case mappings in the
 * Unicode Character Database.
 *
 * @param value - The string to convert to lowercase.
 * @returns An expression that returns the lowercase string.
 *
 * @see [MapLibre Style Specification - downcase](https://maplibre.org/maplibre-style-spec/expressions/#downcase)
 *
 * @example
 * ```ts
 * expr.downcase("Mixed Case"); // ["downcase", "Mixed Case"] -> "mixed case"
 * ```
 */
export function downcase(value: StringExpression) {
  return ["downcase", value] satisfies ExpressionSpecification
}

/**
 * Returns a string consisting of the concatenation of the inputs. Each input
 * is converted to a string as if by to-string.
 *
 * @param values - The strings to concatenate.
 * @returns An expression that returns the concatenated string.
 *
 * @see [MapLibre Style Specification - concat](https://maplibre.org/maplibre-style-spec/expressions/#concat)
 *
 * @example
 * ```ts
 * expr.concat("Hello", " ", "World"); // ["concat", "Hello", " ", "World"] -> "Hello World"
 * ```
 */
export function concat(...values: StringExpression[]) {
  return ["concat", ...values] satisfies ExpressionSpecification
}

/**
 * Returns the IETF language tag of the locale being used by the provided
 * collator. This can be used to determine the default system locale, or to
 * determine if a requested locale was successfully loaded.
 *
 * @param collator - The collator to get the locale from.
 * @returns An expression that returns the IETF language tag.
 *
 * @see [MapLibre Style Specification - resolved-locale](https://maplibre.org/maplibre-style-spec/expressions/#resolved-locale)
 *
 * @example
 * ```ts
 * expr.resolvedLocale(["collator", { "case-sensitive": true, "locale": "de" }]);
 * // ["resolved-locale", ["collator", { "case-sensitive": true, "locale": "de" }]] -> "de"
 * ```
 */
export function resolvedLocale(collator: CollatorExpressionSpecification) {
  return ["resolved-locale", collator] satisfies ExpressionSpecification
}

/**
 * String expressions for MapLibre Style Specification.
 *
 * @see [MapLibre Style Specification - String](https://maplibre.org/maplibre-style-spec/expressions/#string)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * // Direct access
 * expr.isSupportedScript("दिल्ली"); // ["is-supported-script", "दिल्ली"]
 * // Access via strings sub-object
 * expr.strings.isSupportedScript("दिल्ली"); // ["is-supported-script", "दिल्ली"]
 * ```
 */
export const strings = {
  isSupportedScript,
  upcase,
  downcase,
  concat,
  resolvedLocale,
} as const
