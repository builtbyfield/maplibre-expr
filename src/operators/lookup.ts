import type { ArrayInput, Expr, Input, NumberInput, ObjectInput, StringInput } from "../expr"

import { assertNotLegacyComparison, op } from "../internal"

/**
 * A feature property, or a property of `object` if given. Evaluates to
 * `null` if missing, and most operators fail on `null`, which makes MapLibre
 * silently use the property's default; see `getOr` and {@link coalesce}.
 * Names aren't paths: `get("a.b")` reads a property named `"a.b"`; use
 * `get("b", object(get("a")))` for nested values.
 *
 * Untyped by default, so it's accepted anywhere: like MapLibre, which checks
 * the value's type at runtime. Pass a type argument to have the compiler
 * check how it's used: `get<string>("name")`. MapLibre `get`.
 *
 * @example get("population") // ["get", "population"]
 * @example get("city", get("address")) // ["get", "city", ["get", "address"]]
 * @see https://maplibre.org/maplibre-style-spec/expressions/#get
 */
export function get<T = any>(property: StringInput, object?: ObjectInput): Expr<NoInfer<T>> {
  return op("get", property, object)
}

/**
 * `true` if the feature (or `object`, if given) has the property. A property
 * explicitly set to `null` still counts as present. MapLibre `has`.
 *
 * @example has("name") // ["has", "name"]
 * @see https://maplibre.org/maplibre-style-spec/expressions/#has
 */
export function has(property: StringInput, object?: ObjectInput): Expr<boolean> {
  return op("has", property, object)
}

/**
 * The item at `index` (0-based) of an array. Out-of-range indexes make
 * evaluation fail. MapLibre `at`.
 *
 * @example at(0, get("coords"))
 * @see https://maplibre.org/maplibre-style-spec/expressions/#at
 */
export function at<T>(index: NumberInput, array: ArrayInput<T>): Expr<T> {
  return op("at", index, array)
}

/**
 * `true` if `needle` is an item of `haystack` (an array), or a substring of
 * it (a string). MapLibre `in`.
 *
 * Named `in_` because `in` is a reserved word. Throws for two literals, as
 * {@link eq} does.
 *
 * @example in_(get("type"), literal(["park", "forest"]))
 * @example in_("Main", get("street"))
 * @see https://maplibre.org/maplibre-style-spec/expressions/#in
 */
export function in_(needle: Input<string | number | boolean> | null, haystack: ArrayInput | StringInput): Expr<boolean> {
  assertNotLegacyComparison("in_", needle, haystack)
  return op("in", needle, haystack)
}

/**
 * Position of `needle` in `haystack` (an array or a string), or `-1`.
 * Searches from `fromIndex` if given. MapLibre `index-of`.
 *
 * @example indexOf(",", get("name"))
 * @see https://maplibre.org/maplibre-style-spec/expressions/#index-of
 */
export function indexOf(needle: Input<string | number | boolean> | null, haystack: ArrayInput | StringInput, fromIndex?: NumberInput): Expr<number> {
  return op("index-of", needle, haystack, fromIndex)
}

/**
 * A section of a string or array from `start` up to (not including) `end`.
 * Negative indexes count from the end. MapLibre `slice`.
 *
 * @example slice(get("name"), 0, 1) // first character
 * @see https://maplibre.org/maplibre-style-spec/expressions/#slice
 */
export function slice(input: StringInput, start: NumberInput, end?: NumberInput): Expr<string>
export function slice<T>(input: ArrayInput<T>, start: NumberInput, end?: NumberInput): Expr<readonly T[]>
export function slice(input: unknown, start: NumberInput, end?: NumberInput): Expr<unknown> {
  return op("slice", input, start, end)
}

/**
 * Length of a string or array. MapLibre `length`.
 *
 * @example gt(length(get("name")), 20)
 * @see https://maplibre.org/maplibre-style-spec/expressions/#length
 */
export function length(input: StringInput | ArrayInput): Expr<number> {
  return op("length", input)
}

/**
 * A value from the style's global state, set at runtime with
 * `map.setGlobalStateProperty(name, value)` and defaulted in the style's
 * `state` section. Unset keys evaluate to `null`. MapLibre `global-state`.
 *
 * Untyped by default, like {@link get}; pin the type with
 * `globalState<number>("threshold")`.
 *
 * Requires MapLibre GL JS 5.6+. The style spec lists it as not yet supported
 * in MapLibre Native; see
 * https://github.com/maplibre/maplibre-native/issues/3302.
 *
 * @example gt(get("population"), globalState("minPopulation"))
 * @see https://maplibre.org/maplibre-style-spec/expressions/#global-state
 */
export function globalState<T = any>(name: string): Expr<NoInfer<T>> {
  return op("global-state", name)
}
