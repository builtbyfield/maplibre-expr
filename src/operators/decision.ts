import type { GeoJSON } from "geojson"
import type { BooleanInput, Collator, Color, ColorInput, Expr, ExprLike, Input, NumberInput, StringInput } from "../expr"

import { assertMatchLabels, assertNotLegacyComparison, op } from "../internal"

/**
 * Logical negation. MapLibre `!`.
 *
 * @example not(has("name")) // ["!", ["has", "name"]]
 * @see https://maplibre.org/maplibre-style-spec/expressions/#_7
 */
export function not(input: BooleanInput): Expr<boolean> {
  return op("!", input)
}

/**
 * `true` if the inputs are equal. Both sides must have the same type (a
 * number can't be compared to a string), but either side may be `null`.
 * There's no coercion: a property holding `"1"` doesn't equal `1`.
 * MapLibre `==`.
 *
 * Throws if `a` is a string literal and `b` isn't an expression: in a filter
 * MapLibre would read `eq("class", "park")` as "property `class` is `park`",
 * elsewhere as a constant. Write `eq(get("class"), "park")`.
 *
 * @param a - First value.
 * @param b - Second value; must have the same type as `a`.
 * @param collator - Optional locale-aware comparison for strings, see {@link collator}.
 * @example eq(get("type"), "park") // ["==", ["get", "type"], "park"]
 * @example eq(geometryType(), "Polygon") // misspelled geometry types are a type error
 * @see https://maplibre.org/maplibre-style-spec/expressions/#_1
 */
export function eq<T>(a: Input<T> | null, b: Input<NoInfer<T>> | null, collator?: ExprLike<Collator>): Expr<boolean> {
  assertNotLegacyComparison("eq", a, b)
  return op("==", a, b, collator)
}

/**
 * `true` if the inputs are not equal. The counterpart of {@link eq}.
 * MapLibre `!=`.
 *
 * @example neq(get("status"), "closed") // ["!=", ["get", "status"], "closed"]
 * @see https://maplibre.org/maplibre-style-spec/expressions/#_2
 */
export function neq<T>(a: Input<T> | null, b: Input<NoInfer<T>> | null, collator?: ExprLike<Collator>): Expr<boolean> {
  assertNotLegacyComparison("neq", a, b)
  return op("!=", a, b, collator)
}

/**
 * `a < b`. Compares two numbers or two strings. MapLibre `<`.
 *
 * @example lt(get("population"), 1000) // ["<", ["get", "population"], 1000]
 * @see https://maplibre.org/maplibre-style-spec/expressions/#_4
 */
export function lt(a: NumberInput, b: NumberInput): Expr<boolean>
export function lt(a: StringInput, b: StringInput, collator?: ExprLike<Collator>): Expr<boolean>
export function lt(a: unknown, b: unknown, collator?: unknown): Expr<boolean> {
  assertNotLegacyComparison("lt", a, b)
  return op("<", a, b, collator)
}

/**
 * `a <= b`. Compares two numbers or two strings. MapLibre `<=`.
 *
 * @example lte(zoom(), 10)
 * @see https://maplibre.org/maplibre-style-spec/expressions/#_6
 */
export function lte(a: NumberInput, b: NumberInput): Expr<boolean>
export function lte(a: StringInput, b: StringInput, collator?: ExprLike<Collator>): Expr<boolean>
export function lte(a: unknown, b: unknown, collator?: unknown): Expr<boolean> {
  assertNotLegacyComparison("lte", a, b)
  return op("<=", a, b, collator)
}

/**
 * `a > b`. Compares two numbers or two strings. MapLibre `>`.
 *
 * @example gt(get("population"), 1000) // [">", ["get", "population"], 1000]
 * @see https://maplibre.org/maplibre-style-spec/expressions/#_3
 */
export function gt(a: NumberInput, b: NumberInput): Expr<boolean>
export function gt(a: StringInput, b: StringInput, collator?: ExprLike<Collator>): Expr<boolean>
export function gt(a: unknown, b: unknown, collator?: unknown): Expr<boolean> {
  assertNotLegacyComparison("gt", a, b)
  return op(">", a, b, collator)
}

/**
 * `a >= b`. Compares two numbers or two strings. MapLibre `>=`.
 *
 * @example gte(get("rank"), 3)
 * @see https://maplibre.org/maplibre-style-spec/expressions/#_5
 */
export function gte(a: NumberInput, b: NumberInput): Expr<boolean>
export function gte(a: StringInput, b: StringInput, collator?: ExprLike<Collator>): Expr<boolean>
export function gte(a: unknown, b: unknown, collator?: unknown): Expr<boolean> {
  assertNotLegacyComparison("gte", a, b)
  return op(">=", a, b, collator)
}

/**
 * `true` if every input is true. Short-circuits; `all()` with no inputs is
 * `true`. MapLibre `all`.
 *
 * @example all(has("name"), gt(get("rank"), 2))
 * @see https://maplibre.org/maplibre-style-spec/expressions/#all
 */
export function all(...inputs: BooleanInput[]): Expr<boolean> {
  return op("all", ...inputs)
}

/**
 * `true` if any input is true. Short-circuits; `any()` with no inputs is
 * `false`. MapLibre `any`.
 *
 * @example any(eq(get("type"), "park"), eq(get("type"), "forest"))
 * @see https://maplibre.org/maplibre-style-spec/expressions/#any
 */
export function any(...inputs: BooleanInput[]): Expr<boolean> {
  return op("any", ...inputs)
}

/** A `[condition, output]` branch of {@link case_}. */
export type CaseBranch<T> = readonly [condition: BooleanInput, output: Input<T>]

/**
 * Returns the output of the first branch whose condition is true, or
 * `fallback`. All outputs must have the type of the first one (as in
 * MapLibre), except that CSS color strings and color expressions mix
 * freely. MapLibre `case`.
 *
 * Named `case_` because `case` is a reserved word.
 *
 * @example
 * case_([
 *   [eq(featureState("hover"), true), "#f00"],
 *   [gt(get("rank"), 5), "#fa0"],
 * ], "#888")
 * // ["case", ["==", ["feature-state", "hover"], true], "#f00", [">", ["get", "rank"], 5], "#fa0", "#888"]
 * @see https://maplibre.org/maplibre-style-spec/expressions/#case
 */
export function case_<T>(branches: readonly [CaseBranch<T>, ...CaseBranch<NoInfer<T>>[]], fallback: Input<NoInfer<T>>): Expr<T>
export function case_(branches: readonly [readonly [BooleanInput, ColorInput], ...(readonly [BooleanInput, ColorInput])[]], fallback: ColorInput): Expr<Color>
export function case_(branches: readonly (readonly [unknown, unknown])[], fallback: unknown): Expr<unknown> {
  return op("case", ...branches.flat(), fallback)
}

/** A label of {@link match}: one literal value, or a non-empty array of values that share an output. */
export type MatchLabel<L> = L | readonly L[]

/**
 * Compares `input` to each branch's label(s) and returns the output of the
 * first match, or `fallback`. Labels must be literal strings or numbers (not
 * expressions), and each value may appear only once across all labels.
 * Outputs must have the type of the first one. MapLibre `match`.
 *
 * Throws if a label value appears more than once, a numeric label isn't an
 * integer, or a label group is empty (MapLibre rejects all three). Matching
 * is strict: the string `"1"` doesn't match the label `1`.
 *
 * @example
 * match(get("type"), [
 *   ["park", "#0a0"],
 *   [["lake", "river"], "#00f"],
 * ], "#ccc")
 * // ["match", ["get", "type"], "park", "#0a0", ["lake", "river"], "#00f", "#ccc"]
 * @see https://maplibre.org/maplibre-style-spec/expressions/#match
 */
export function match<L extends string | number, T>(
  input: Input<L>,
  branches: readonly [readonly [MatchLabel<NoInfer<L>>, Input<T>], ...(readonly [MatchLabel<NoInfer<L>>, Input<NoInfer<T>>])[]],
  fallback: Input<NoInfer<T>>,
): Expr<T>
export function match<L extends string | number>(
  input: Input<L>,
  branches: readonly [readonly [MatchLabel<NoInfer<L>>, ColorInput], ...(readonly [MatchLabel<NoInfer<L>>, ColorInput])[]],
  fallback: ColorInput,
): Expr<Color>
export function match(input: unknown, branches: readonly (readonly [unknown, unknown])[], fallback: unknown): Expr<unknown> {
  assertMatchLabels("match", branches.map(([label]) => label))
  return op("match", input, ...branches.flat(), fallback)
}

/**
 * Returns the first input that is not `null`. Useful for fallbacks on
 * missing properties and missing images. MapLibre `coalesce`.
 *
 * @example coalesce(get("name_en"), get("name"), "Unnamed")
 * @see https://maplibre.org/maplibre-style-spec/expressions/#coalesce
 */
export function coalesce<T>(...inputs: [Input<T> | null, ...(Input<NoInfer<T>> | null)[]]): Expr<T>
export function coalesce(...inputs: [ColorInput | null, ...(ColorInput | null)[]]): Expr<Color>
export function coalesce(...inputs: unknown[]): Expr<unknown> {
  return op("coalesce", ...inputs)
}

/**
 * `true` if the evaluated feature lies entirely inside the given Polygon or
 * MultiPolygon (or a Feature/FeatureCollection of them). Only Point and
 * LineString features (and their Multi* forms) are evaluated; touching the
 * boundary counts as outside. MapLibre `within`.
 *
 * @example within({ type: "Polygon", coordinates: [[[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]]] })
 * @see https://maplibre.org/maplibre-style-spec/expressions/#within
 */
export function within(geojson: GeoJSON): Expr<boolean> {
  return op("within", geojson)
}
