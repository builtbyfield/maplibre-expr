import type {
  ExpressionSpecification,
  Feature,
  GlobalProperties,
  ICanonicalTileID,
} from "@maplibre/maplibre-gl-style-spec";
import { featureFilter } from "@maplibre/maplibre-gl-style-spec";
import { expect } from "vitest";

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
} satisfies ICanonicalTileID;

/**
 * Tests a MapLibre expression against a feature to verify the expected filtering result.
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
  globalProperties: GlobalProperties = { zoom: 0 }
) {
  const filteredResult = featureFilter(expression).filter(
    globalProperties,
    feature,
    mockCanonical
  );
  expect(filteredResult).toBe(expected);
}
