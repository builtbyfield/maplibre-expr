import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

/**
 * Returns true if all the inputs are true.
 *
 * @param conditions - The boolean conditions to evaluate
 * @returns An expression that returns true if all conditions are true
 *
 * @see [MapLibre Style Specification - all](https://maplibre.org/maplibre-style-spec/expressions/#all)
 *
 * @example
 * ```ts
 * expr.all(
 *   [">=", ["get", "mag"], 4],
 *   ["<", ["get", "mag"], 5]
 * ); // ["all", [">=", ["get", "mag"], 4], ["<", ["get", "mag"], 5]]
 * ```
 */
export function all(...conditions: Array<ExpressionSpecification>) {
  return ["all", ...conditions] satisfies ExpressionSpecification
}

/**
 * An alias for {@link all}. We've aliased this as sometimes it's easier to
 * think in terms of "and" rather than "all" when considering control flow.
 *
 * @see [MapLibre Style Specification - all](https://maplibre.org/maplibre-style-spec/expressions/#all)
 *
 * @example
 * ```ts
 * expr.and(
 *   [">=", ["get", "mag"], 4],
 *   ["<", ["get", "mag"], 5]
 * ); // ["all", [">=", ["get", "mag"], 4], ["<", ["get", "mag"], 5]]
 * ```
 */
export const and = all

/**
 * Returns true if any of the inputs are true.
 *
 * @param conditions - The boolean conditions to evaluate
 * @returns An expression that returns true if any condition is true
 *
 * @see [MapLibre Style Specification - any](https://maplibre.org/maplibre-style-spec/expressions/#any)
 *
 * @example
 * ```ts
 * expr.any(
 *   [">=", ["get", "mag"], 4],
 *   ["<", ["get", "mag"], 5]
 * ); // ["any", [">=", ["get", "mag"], 4], ["<", ["get", "mag"], 5]]
 * ```
 */
export function any(...conditions: Array<ExpressionSpecification>) {
  return ["any", ...conditions] satisfies ExpressionSpecification
}

/**
 * An alias for {@link any}. We've aliased this as sometimes it's easier to
 * think in terms of "or" rather than "any" when considering control flow.
 *
 * @see [MapLibre Style Specification - any](https://maplibre.org/maplibre-style-spec/expressions/#any)
 *
 * @example
 * ```ts
 * expr.or(
 *   [">=", ["get", "mag"], 4],
 *   ["<", ["get", "mag"], 5]
 * ); // ["any", [">=", ["get", "mag"], 4], ["<", ["get", "mag"], 5]]
 * ```
 */
export const or = any

/**
 * Logical negation. Returns true if the input is false.
 *
 * @param value - The value to negate
 * @returns An expression that returns the logical negation
 *
 * @see [MapLibre Style Specification - not (!)](https://maplibre.org/maplibre-style-spec/expressions/#_7)
 *
 * @example
 * ```ts
 * expr.not(["has", "point_count"]); // ["!", ["has", "point_count"]]
 * ```
 */
export function not(value: ExpressionSpecification) {
  return ["!", value] satisfies ExpressionSpecification
}

/**
 * Creates logical expressions for MapLibre styles
 *
 * @see [MapLibre Style Specification - Decision](https://maplibre.org/maplibre-style-spec/expressions/#decision)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * expr.not(["has", "point_count"]); // ["!", ["has", "point_count"]]
 * ```
 */
export const logical = {
  all,
  and,
  any,
  or,
  not,
} as const
