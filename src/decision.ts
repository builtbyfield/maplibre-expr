import type {
  CollatorExpressionSpecification,
  ExpressionInputType,
  ExpressionSpecification,
} from "@maplibre/maplibre-gl-style-spec";

type ExpressionValue = ExpressionInputType | ExpressionSpecification;

export type CasePair = readonly [
  condition: boolean | ExpressionSpecification,
  result: ExpressionValue,
];
export type CaseConditionsAndResults = [
  firstPair: CasePair,
  ...restPairs: [...CasePair[]],
];

/**
 * Selects the first output whose corresponding test condition evaluates to true,
 * or the fallback value otherwise.
 *
 * @param conditionsAndResults - An array of condition and result pairs
 * @param fallback - The fallback value if no conditions are met
 * @returns An expression that returns the matched output or fallback value
 *
 * @example
 * expr.case(
 *   [
 *     ["boolean", ["feature-state", "hover"], false], 1,
 *     ["==", ["get", "type"], "home"], 2,
 *     [">=", ["get", "height"], 100], 3,
 *   ],
 *   0.5
 * ); // ["case", ["boolean", ["feature-state", "hover"], false], 1, ["==", ["get", "type"], "home"], 2, [">=", ["get", "height"], 100], 3, 0.5]
 */
export function case_(
  conditionsAndResults: CaseConditionsAndResults,
  fallback: ExpressionValue,
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
  output: ExpressionValue,
];
type MatchPairs = [firstPair: MatchPair, ...restPairs: [...MatchPair[]]];

/**
 * Selects the output whose label value matches the input value, or the fallback value if no match is found.
 *
 * @param input - The input value to match against
 * @param matches - Array of alternating label and output pairs
 * @param fallback - The fallback value if no matches are found
 * @returns An expression that returns the matched output or fallback value
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
  fallback: ExpressionValue,
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
 * @example
 * expr.coalesce(
 *   ["image", ["concat", ["get", "icon"], "_15"]],
 *   ["image", "marker_15"]
 * ); // ["coalesce", ["image", ["concat", ["get", "icon"], "_15"]], ["image", "marker_15"]]
 */
export function coalesce(...args: Array<ExpressionSpecification>) {
  return ["coalesce", ...args] satisfies ExpressionSpecification;
}

type ComparisonOperator = "==" | "!=" | ">" | "<" | ">=" | "<=";

function createComparisonExpression(
  operator: ComparisonOperator,
  a: ExpressionValue,
  b: ExpressionValue,
  collator?: CollatorExpressionSpecification,
) {
  return collator
    ? ([operator, a, b, collator] satisfies ExpressionSpecification)
    : ([operator, a, b] satisfies ExpressionSpecification);
}

const OPERATORS = {
  EQUAL: "==" as const,
  NOT_EQUAL: "!=" as const,
  GREATER: ">" as const,
  LESS: "<" as const,
  GREATER_OR_EQUAL: ">=" as const,
  LESS_OR_EQUAL: "<=" as const,
} as const;

/**
 * Returns true if the input values are equal, false otherwise.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @param collator - Optional collator for string comparison
 * @returns An expression that returns true if values are equal
 *
 * @example
 * expr.equal("$type", "Polygon"); // ["==", "$type", "Polygon"]
 */
export function equal(
  a: ExpressionValue,
  b: ExpressionValue,
  collator?: CollatorExpressionSpecification,
) {
  return createComparisonExpression(
    OPERATORS.EQUAL,
    a,
    b,
    collator,
  ) satisfies ExpressionSpecification;
}

/**
 * An alias for {@link equal}.
 *
 * @example
 * expr.eq("$type", "Polygon"); // ["==", "$type", "Polygon"]
 */
export const eq = equal;

/**
 * Returns true if the input values are not equal, false otherwise.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @param collator - Optional collator for string comparison
 * @returns An expression that returns true if values are not equal
 *
 * @example
 * expr.notEqual("cluster", true); // ["!=", "cluster", true]
 */
export function notEqual(
  a: ExpressionValue,
  b: ExpressionValue,
  collator?: CollatorExpressionSpecification,
) {
  return createComparisonExpression(
    OPERATORS.NOT_EQUAL,
    a,
    b,
    collator,
  ) satisfies ExpressionSpecification;
}

/**
 * An alias for {@link notEqual}.
 *
 * @example
 * expr.neq("cluster", true); // ["!=", "cluster", true]
 */
export const neq = notEqual;

/**
 * Returns true if the first input is strictly greater than the second.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @param collator - Optional collator for string comparison
 * @returns An expression that returns true if a > b
 *
 * @example
 * expr.greater(["get", "mag"], 2); // [">", ["get", "mag"], 2]
 */
export function greater(
  a: ExpressionValue,
  b: ExpressionValue,
  collator?: CollatorExpressionSpecification,
) {
  return createComparisonExpression(
    OPERATORS.GREATER,
    a,
    b,
    collator,
  ) satisfies ExpressionSpecification;
}

/**
 * An alias for {@link greater}.
 *
 * @example
 * expr.gt(["get", "mag"], 2); // [">", ["get", "mag"], 2]
 */
export const gt = greater;

/**
 * Returns true if the first input is strictly less than the second.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @param collator - Optional collator for string comparison
 * @returns An expression that returns true if a < b
 *
 * @example
 * expr.less(["get", "mag"], 2); // ["<", ["get", "mag"], 2]
 */
export function less(
  a: ExpressionValue,
  b: ExpressionValue,
  collator?: CollatorExpressionSpecification,
) {
  return createComparisonExpression(
    OPERATORS.LESS,
    a,
    b,
    collator,
  ) satisfies ExpressionSpecification;
}

/**
 * An alias for {@link less}.
 *
 * @example
 * expr.lt(["get", "mag"], 2); // ["<", ["get", "mag"], 2]
 */
export const lt = less;

/**
 * Returns true if the first input is greater than or equal to the second.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @param collator - Optional collator for string comparison
 * @returns An expression that returns true if a >= b
 *
 * @example
 * expr.greaterOrEqual(["get", "mag"], 6); // [">=", ["get", "mag"], 6]
 */
export function greaterOrEqual(
  a: ExpressionValue,
  b: ExpressionValue,
  collator?: CollatorExpressionSpecification,
) {
  return createComparisonExpression(
    OPERATORS.GREATER_OR_EQUAL,
    a,
    b,
    collator,
  ) satisfies ExpressionSpecification;
}

/**
 * An alias for {@link greaterOrEqual}.
 *
 * @example
 * expr.gte(["get", "mag"], 6); // [">=", ["get", "mag"], 6]
 */
export const gte = greaterOrEqual;

/**
 * Returns true if the first input is less than or equal to the second.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @param collator - Optional collator for string comparison
 * @returns An expression that returns true if a <= b
 *
 * @example
 * expr.lessOrEqual(["get", "mag"], 6); // ["<=", ["get", "mag"], 6]
 */
export function lessOrEqual(
  a: ExpressionValue,
  b: ExpressionValue,
  collator?: CollatorExpressionSpecification,
) {
  return createComparisonExpression(
    OPERATORS.LESS_OR_EQUAL,
    a,
    b,
    collator,
  ) satisfies ExpressionSpecification;
}

/**
 * An alias for {@link lessOrEqual}.
 *
 * @example
 * expr.lte(["get", "mag"], 6); // ["<=", ["get", "mag"], 6]
 */
export const lte = lessOrEqual;

/**
 * Returns true if all the inputs are true.
 *
 * @param conditions - The boolean conditions to evaluate
 * @returns An expression that returns true if all conditions are true
 *
 * @example
 * expr.all(
 *   [">=", ["get", "mag"], 4],
 *   ["<", ["get", "mag"], 5]
 * ); // ["all", [">=", ["get", "mag"], 4], ["<", ["get", "mag"], 5]]
 */
export function all(...conditions: Array<ExpressionSpecification>) {
  return ["all", ...conditions] satisfies ExpressionSpecification;
}

/**
 * An alias for {@link all}. We've aliased this as sometimes it's easier to
 * think in terms of "and" rather than "all" when considering control flow.
 *
 * @example
 * expr.and(
 *   [">=", ["get", "mag"], 4],
 *   ["<", ["get", "mag"], 5]
 * ); // ["all", [">=", ["get", "mag"], 4], ["<", ["get", "mag"], 5]]
 */
export const and = all;

/**
 * Returns true if any of the inputs are true.
 *
 * @param conditions - The boolean conditions to evaluate
 * @returns An expression that returns true if any condition is true
 *
 * @example
 * expr.any(
 *   [">=", ["get", "mag"], 4],
 *   ["<", ["get", "mag"], 5]
 * ); // ["any", [">=", ["get", "mag"], 4], ["<", ["get", "mag"], 5]]
 */
export function any(...conditions: Array<ExpressionSpecification>) {
  return ["any", ...conditions] satisfies ExpressionSpecification;
}

/**
 * An alias for {@link any}. We've aliased this as sometimes it's easier to
 * think in terms of "or" rather than "any" when considering control flow.
 *
 * @example
 * expr.or(
 *   [">=", ["get", "mag"], 4],
 *   ["<", ["get", "mag"], 5]
 * ); // ["any", [">=", ["get", "mag"], 4], ["<", ["get", "mag"], 5]]
 */
export const or = any;

/**
 * Logical negation. Returns true if the input is false.
 *
 * @param value - The value to negate
 * @returns An expression that returns the logical negation
 *
 * @example
 * expr.not(["has", "point_count"]); // ["!", ["has", "point_count"]]
 */
export function not(value: ExpressionSpecification) {
  return ["!", value] satisfies ExpressionSpecification;
}

/**
 * Returns true if the evaluated feature is fully contained inside the input geometry.
 *
 * @param geometry - The GeoJSON geometry to test against
 * @returns An expression that returns true if the feature is within the geometry
 *
 * @example
 * expr.within({
 *   type: "Polygon",
 *   coordinates: [[[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]]]
 * }); // ["within", {"type": "Polygon", "coordinates": [[[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]]]}]
 */
export function within(
  geometry:
    | GeoJSON.Polygon
    | GeoJSON.MultiPolygon
    | GeoJSON.Feature
    | GeoJSON.FeatureCollection
    | ExpressionSpecification,
) {
  return ["within", geometry] satisfies ExpressionSpecification;
}

export const decision = {
  case: case_,
  match: match,
  coalesce: coalesce,
  equal: equal,
  eq: eq,
  notEqual: notEqual,
  neq: neq,
  greater: greater,
  gt: gt,
  less: less,
  lt: lt,
  greaterOrEqual: greaterOrEqual,
  gte: gte,
  lessOrEqual: lessOrEqual,
  lte: lte,
  all: all,
  and: and,
  any: any,
  or: or,
  not: not,
  within: within,
};
