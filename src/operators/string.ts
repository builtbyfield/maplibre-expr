import type { AnyInput, ArrayInput, Collator, Expr, ExprLike, StringInput } from "../expr"

import { op } from "../internal"

/**
 * Joins the inputs into one string. Non-string inputs are converted as by
 * {@link toString}. MapLibre `concat`.
 *
 * @example concat(get("name"), " (", get("ref"), ")")
 * @see https://maplibre.org/maplibre-style-spec/expressions/#concat
 */
export function concat(...inputs: [AnyInput, ...AnyInput[]]): Expr<string> {
  return op("concat", ...inputs)
}

/**
 * Uppercase version of a string. MapLibre `upcase`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#upcase
 */
export function upcase(input: StringInput): Expr<string> {
  return op("upcase", input)
}

/**
 * Lowercase version of a string. MapLibre `downcase`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#downcase
 */
export function downcase(input: StringInput): Expr<string> {
  return op("downcase", input)
}

/**
 * `true` if the device can render the string's script (e.g. to hide labels
 * in unsupported writing systems). MapLibre `is-supported-script`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#is-supported-script
 */
export function isSupportedScript(input: StringInput): Expr<boolean> {
  return op("is-supported-script", input)
}

/**
 * The locale actually used by a collator (which may differ from the one
 * requested). MapLibre `resolved-locale`.
 *
 * @example resolvedLocale(collator({ locale: "de" }))
 * @see https://maplibre.org/maplibre-style-spec/expressions/#resolved-locale
 */
export function resolvedLocale(collator: ExprLike<Collator>): Expr<string> {
  return op("resolved-locale", collator)
}

/**
 * Splits a string into an array of strings. MapLibre `split`
 * (style-spec v24.6+).
 *
 * @example at(0, split(get("name"), " ")) // first word
 * @see https://maplibre.org/maplibre-style-spec/expressions/#split
 */
export function split(input: StringInput, separator: StringInput): Expr<readonly string[]> {
  return op("split", input, separator)
}

/**
 * Joins an array into a string. MapLibre `join` (style-spec v24.6+).
 *
 * @example join(get("tags"), ", ")
 * @see https://maplibre.org/maplibre-style-spec/expressions/#join
 */
export function join(input: ArrayInput, separator: StringInput): Expr<string> {
  return op("join", input, separator)
}
