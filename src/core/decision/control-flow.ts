import type {
  ExpressionInputType,
  ExpressionSpecification,
} from "@maplibre/maplibre-gl-style-spec";

type ExpressionValue = ExpressionInputType | ExpressionSpecification;

export type CasePair = readonly [
  condition: boolean | ExpressionSpecification,
  result: ExpressionValue
];
export type CaseConditionsAndResults = [
  firstPair: CasePair,
  ...restPairs: [...CasePair[]]
];

/**
 * Selects the first output whose corresponding test condition evaluates to true,
 * or the fallback value otherwise.
 *
 * @param conditionsAndResults - An array of condition and result pairs
 * @param fallback - The fallback value if no conditions are met
 * @returns An expression that returns the matched output or fallback value
 *
 * @see [MapLibre Style Specification - case](https://maplibre.org/maplibre-style-spec/expressions/#case)
 *
 * @example
 * expr.case(
 *   [
 *     [["boolean", ["feature-state", "hover"], false], 1],
 *     [["==", ["get", "type"], "home"], 2],
 *     [[">=", ["get", "height"], 100], 3],
 *   ],
 *   0.5
 * ); // ["case", ["boolean", ["feature-state", "hover"], false], 1, ["==", ["get", "type"], "home"], 2, [">=", ["get", "height"], 100], 3, 0.5]
 */
export function case_(
  conditionsAndResults: CaseConditionsAndResults,
  fallback: ExpressionValue
) {
  const [firstPair, ...restPairs] = conditionsAndResults;

  return [
    "case",
    firstPair[0],
    firstPair[1],
    ...restPairs.flat(),
    fallback,
  ] satisfies ExpressionSpecification;
}

type MatchPair = readonly [
  label: ExpressionInputType | ExpressionInputType[],
  output: ExpressionValue
];
type MatchPairs = [firstPair: MatchPair, ...restPairs: [...MatchPair[]]];

/**
 * Selects the output whose label value matches the input value, or the fallback
 * value if no match is found.
 *
 * @param input - The input value to match against
 * @param matches - Array of alternating label and output pairs
 * @param fallback - The fallback value if no matches are found
 * @returns An expression that returns the matched output or fallback value
 *
 * @see [MapLibre Style Specification - match](https://maplibre.org/maplibre-style-spec/expressions/#match)
 *
 * @example
 * expr.match(
 *   ["get", "building_type"],
 *   "residential", "#f00",
 *   "commercial", "#0f0",
 *   "#000"
 * ); // ["match", ["get", "building_type"], "residential", "#f00", "commercial", "#0f0", "#000"]
 */
export function match(
  input: ExpressionValue,
  pairs: MatchPairs,
  fallback: ExpressionValue
) {
  if (pairs.length === 0) {
    throw new Error("match requires at least one pair of values");
  }

  const [firstPair, ...restPairs] = pairs;
  return [
    "match",
    input,
    firstPair[0],
    firstPair[1],
    ...restPairs.flat(),
    fallback,
  ] satisfies ExpressionSpecification;
}

/**
 * Evaluates each expression in turn until the first non-null value is obtained.
 *
 * @param args - The expressions to evaluate
 * @returns An expression that returns the first non-null value
 *
 * @see [MapLibre Style Specification - coalesce](https://maplibre.org/maplibre-style-spec/expressions/#coalesce)
 *
 * @example
 * expr.coalesce(
 *   ["image", ["concat", ["get", "icon"], "_15"]],
 *   ["image", "marker_15"]
 * ); // ["coalesce", ["image", ["concat", ["get", "icon"], "_15"]], ["image", "marker_15"]]
 */
export function coalesce(...args: Array<ExpressionSpecification>) {
  return ["coalesce", ...args] satisfies ExpressionSpecification;
}

/**
 * Creates control flow expressions for MapLibre styles
 *
 * @see [MapLibre Style Specification - Decision](https://maplibre.org/maplibre-style-spec/expressions/#decision)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * expr.decision.case(
 *   [
 *     [["boolean", ["feature-state", "hover"], false], 1],
 *     [["==", ["get", "type"], "home"], 2],
 *     [[">=", ["get", "height"], 100], 3],
 *   ],
 *   0.5
 * ); // ["case", ["boolean", ["feature-state", "hover"], false], 1, ["==", ["get", "type"], "home"], 2, [">=", ["get", "height"], 100], 3, 0.5]
 * ```
 */
export const controlFlow = {
  case: case_,
  match,
  coalesce,
} as const;
