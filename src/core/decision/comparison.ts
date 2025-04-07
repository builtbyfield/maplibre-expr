import type {
  CollatorExpressionSpecification,
  ExpressionInputType,
  ExpressionSpecification,
} from "@maplibre/maplibre-gl-style-spec";

type ExpressionValue = ExpressionInputType | ExpressionSpecification;

const OPERATORS = {
  EQUAL: "==" as const,
  NOT_EQUAL: "!=" as const,
  GREATER: ">" as const,
  LESS: "<" as const,
  GREATER_OR_EQUAL: ">=" as const,
  LESS_OR_EQUAL: "<=" as const,
} as const;

type ComparisonOperator = (typeof OPERATORS)[keyof typeof OPERATORS];

function createComparisonExpression(
  operator: ComparisonOperator,
  a: ExpressionValue,
  b: ExpressionValue,
  collator?: CollatorExpressionSpecification
) {
  return collator
    ? ([operator, a, b, collator] satisfies ExpressionSpecification)
    : ([operator, a, b] satisfies ExpressionSpecification);
}

/**
 * Returns true if the input values are equal, false otherwise.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @param collator - Optional collator for string comparison
 * @returns An expression that returns true if values are equal
 *
 * @see [MapLibre Style Specification - equal (==)](https://maplibre.org/maplibre-style-spec/expressions/#_1)
 *
 * @example
 * ```ts
 * expr.equal("$type", "Polygon"); // ["==", "$type", "Polygon"]
 * ```
 */
export function equal(
  a: ExpressionValue,
  b: ExpressionValue,
  collator?: CollatorExpressionSpecification
) {
  return createComparisonExpression(
    OPERATORS.EQUAL,
    a,
    b,
    collator
  ) satisfies ExpressionSpecification;
}

/**
 * An alias for {@link equal}.
 *
 * @example
 * ```ts
 * expr.eq("$type", "Polygon"); // ["==", "$type", "Polygon"]
 * ```
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
 * @see [MapLibre Style Specification - not equal (!=)](https://maplibre.org/maplibre-style-spec/expressions/#_2)
 *
 * @example
 * ```ts
 * expr.notEqual("cluster", true); // ["!=", "cluster", true]
 * ```
 */
export function notEqual(
  a: ExpressionValue,
  b: ExpressionValue,
  collator?: CollatorExpressionSpecification
) {
  return createComparisonExpression(
    OPERATORS.NOT_EQUAL,
    a,
    b,
    collator
  ) satisfies ExpressionSpecification;
}

/**
 * An alias for {@link notEqual}.
 *
 * @example
 * ```ts
 * expr.neq("cluster", true); // ["!=", "cluster", true]
 * ```
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
 * @see [MapLibre Style Specification - greater (>)](https://maplibre.org/maplibre-style-spec/expressions/#_3)
 *
 * @example
 * ```ts
 * expr.greater(["get", "mag"], 2); // [">", ["get", "mag"], 2]
 * ```
 */
export function greater(
  a: ExpressionValue,
  b: ExpressionValue,
  collator?: CollatorExpressionSpecification
) {
  return createComparisonExpression(
    OPERATORS.GREATER,
    a,
    b,
    collator
  ) satisfies ExpressionSpecification;
}

/**
 * An alias for {@link greater}.
 *
 * @example
 * ```ts
 * expr.gt(["get", "mag"], 2); // [">", ["get", "mag"], 2]
 * ```
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
 * @see [MapLibre Style Specification - less (<)](https://maplibre.org/maplibre-style-spec/expressions/#_4)
 *
 * @example
 * ```ts
 * expr.less(["get", "mag"], 2); // ["<", ["get", "mag"], 2]
 * ```
 */
export function less(
  a: ExpressionValue,
  b: ExpressionValue,
  collator?: CollatorExpressionSpecification
) {
  return createComparisonExpression(
    OPERATORS.LESS,
    a,
    b,
    collator
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
 * @see [MapLibre Style Specification - greater or equal (>=)](https://maplibre.org/maplibre-style-spec/expressions/#_5)
 *
 * @example
 * ```ts
 * expr.greaterOrEqual(["get", "mag"], 6); // [">=", ["get", "mag"], 6]
 * ```
 */
export function greaterOrEqual(
  a: ExpressionValue,
  b: ExpressionValue,
  collator?: CollatorExpressionSpecification
) {
  return createComparisonExpression(
    OPERATORS.GREATER_OR_EQUAL,
    a,
    b,
    collator
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
 * @see [MapLibre Style Specification - less or equal (<=)](https://maplibre.org/maplibre-style-spec/expressions/#_6)
 *
 * @example
 * ```ts
 * expr.lessOrEqual(["get", "mag"], 6); // ["<=", ["get", "mag"], 6]
 * ```
 */
export function lessOrEqual(
  a: ExpressionValue,
  b: ExpressionValue,
  collator?: CollatorExpressionSpecification
) {
  return createComparisonExpression(
    OPERATORS.LESS_OR_EQUAL,
    a,
    b,
    collator
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
 * Creates comparison expressions for MapLibre styles
 *
 * @see [MapLibre Style Specification - Decision](https://maplibre.org/maplibre-style-spec/expressions/#decision)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * expr.equal("$type", "Polygon"); // ["==", "$type", "Polygon"]
 * ```
 */
export const comparison = {
  equal,
  eq,
  notEqual,
  neq,
  greater,
  gt,
  less,
  lt,
  greaterOrEqual,
  gte,
  lessOrEqual,
  lte,
} as const;
