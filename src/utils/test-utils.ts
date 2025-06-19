import type {
  ExpressionSpecification,
  Feature,
  GlobalProperties,
  ICanonicalTileID,
} from "@maplibre/maplibre-gl-style-spec"

import { createExpression, featureFilter } from "@maplibre/maplibre-gl-style-spec"
import { expect } from "vitest"

/**
 * Mock canonical tile ID object implementing the ICanonicalTileID interface.
 * Used for testing MapLibre expressions with default/dummy tile values.
 */
export const mockCanonical = {
  z: 0,
  x: 0,
  y: 0,
  key: "0/0/0",
  url: () => "",
  isChildOf: () => false,
  getTilePoint: () => ({ x: 0, y: 0 }),
  equals: () => false,
  toString: () => "0/0/0",
} satisfies ICanonicalTileID

/**
 * Tests a MapLibre expression against a feature to verify the expected filtering result.
 * Only works with expressions that return boolean values (filters).
 *
 * @param expression - The MapLibre expression specification to test
 * @param feature - The geographic feature to test against the expression
 * @param expected - The expected boolean result of applying the expression to the feature
 *
 * @example
 * ```ts
 * testExpression(
 *   ["==", ["get", "type"], "Point"],
 *   { type: "Feature", geometry: point, properties: { type: "Point" } },
 *   true
 * );
 * ```
 */
export function testExpression(
  expression: ExpressionSpecification,
  feature: Feature,
  expected: boolean,
  globalProperties: GlobalProperties = { zoom: 0 },
): void {
  const filteredResult = featureFilter(expression).filter(
    globalProperties,
    feature,
    mockCanonical,
  )
  expect(filteredResult).toBe(expected)
}

/**
 * Tests a MapLibre expression that returns any value type (not just boolean).
 * Uses createExpression to evaluate the expression and compare the result.
 *
 * @param expression - The MapLibre expression specification to test
 * @param feature - The geographic feature to test against the expression
 * @param expected - The expected result of evaluating the expression
 *
 * @example
 * ```ts
 * testExpressionValue(
 *   ["get", "name"],
 *   { type: "Feature", geometry: point, properties: { name: "Test" } },
 *   "Test"
 * );
 * ```
 */
export function testExpressionValue<T>(
  expression: ExpressionSpecification,
  feature: Feature,
  expected: T,
  globalProperties: GlobalProperties = { zoom: 0 },
): void {
  const parsed = createExpression(expression)
  if (parsed.result === "error") {
    throw new Error(`Expression parsing failed: ${parsed.value.map(e => e.message).join(", ")}`)
  }

  const result = parsed.value.evaluate(globalProperties, feature)
  expect(result).toEqual(expected)
}

/**
 * Tests that a MapLibre expression compiles successfully without errors.
 * Useful for testing expression structure without evaluating against features.
 *
 * @param expression - The MapLibre expression specification to test
 *
 * @example
 * ```ts
 * testExpressionCompilation(["literal", ["a", "b"]]);
 * ```
 */
export function testExpressionCompilation(
  expression: ExpressionSpecification,
): void {
  const parsed = createExpression(expression)
  expect(parsed.result).toBe("success")
}
