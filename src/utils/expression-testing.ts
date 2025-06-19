import type {
  ExpressionSpecification,
  Feature,
  GlobalProperties,
  Point2D,
  StylePropertySpecification,
  ValidationError,
} from "@maplibre/maplibre-gl-style-spec"

import { createExpression, featureFilter } from "@maplibre/maplibre-gl-style-spec"

import { getGeometry } from "./geometry"
import { mockCanonical } from "./test-utils"
import { validateExpression } from "./validate-expression"

// Add performance API type for Node.js environments
declare const performance: {
  now: () => number
}

/**
 * Comprehensive test result for expression validation and execution.
 */
export interface ExpressionTestResult {
  /** Whether the expression passed syntax validation */
  isValid: boolean
  /** Whether the expression executed successfully */
  executes: boolean
  /** Whether the expression returned the expected result */
  matchesExpected: boolean
  /** Validation errors from syntax checking */
  validationErrors: ValidationError[]
  /** Runtime execution errors */
  executionError?: Error
  /** Actual result from expression execution */
  actualResult?: unknown
  /** Expected result for comparison */
  expectedResult?: unknown
  /** Summary of the test */
  summary: string
}

/**
 * Options for testing expressions with different contexts and constraints.
 */
export interface ExpressionTestOptions {
  /** The expression to test */
  expression: ExpressionSpecification
  /** The feature to test against (for data retrieval expressions) */
  feature?: GeoJSON.Feature
  /** Expected result of the expression */
  expectedResult?: unknown
  /** Global properties like zoom level */
  globalProperties?: GlobalProperties
  /** Validation context (property, filter, cluster, etc.) */
  validationContext?: "property" | "filter" | "cluster" | "cluster-initial"
  /** Property key for validation (e.g., "fill-color") */
  propertyKey?: string
  /** Property type for validation (e.g., "paint", "layout") */
  propertyType?: string
  /** Style property specification for type validation */
  valueSpec?: StylePropertySpecification
  /** Test identifier for error reporting */
  testKey?: string
}

/**
 * Tests a MapLibre expression comprehensively, including both validation and execution.
 *
 * This function combines syntax validation with runtime testing to ensure expressions
 * are both well-formed and work as expected with actual data.
 *
 * @param options - Test configuration including expression, feature, and expected result
 * @returns Comprehensive test result with validation and execution status
 *
 * @example
 * ```typescript
 * // Test a filter expression
 * const result = testExpressionComprehensive({
 *   expression: ["==", ["get", "type"], "restaurant"],
 *   feature: {
 *     type: "Feature",
 *     geometry: { type: "Point", coordinates: [0, 0] },
 *     properties: { type: "restaurant" }
 *   },
 *   expectedResult: true,
 *   validationContext: "filter",
 *   testKey: "restaurant-filter"
 * });
 *
 * console.log(result.summary);
 * // "✅ Valid syntax, executes successfully, matches expected result"
 * ```
 *
 * @example
 * ```typescript
 * // Test a paint property expression
 * const result = testExpressionComprehensive({
 *   expression: ["get", "population"],
 *   feature: {
 *     type: "Feature",
 *     geometry: { type: "Point", coordinates: [0, 0] },
 *     properties: { population: 1000000 }
 *   },
 *   expectedResult: 1000000,
 *   validationContext: "property",
 *   propertyKey: "circle-radius",
 *   propertyType: "paint",
 *   valueSpec: { type: "number", default: 5 },
 *   testKey: "population-radius"
 * });
 * ```
 */
export function testExpressionComprehensive(options: ExpressionTestOptions): ExpressionTestResult {
  const {
    expression,
    feature,
    expectedResult,
    globalProperties = { zoom: 0 },
    validationContext,
    propertyKey,
    propertyType,
    valueSpec,
    testKey = "expression-test",
  } = options

  const result: ExpressionTestResult = {
    isValid: false,
    executes: false,
    matchesExpected: false,
    validationErrors: [],
    summary: "",
    expectedResult,
  }

  // Step 1: Validate expression syntax and context
  const validationOptions: any = {
    value: expression,
    key: testKey,
  }

  if (validationContext) {
    validationOptions.expressionContext = validationContext
  }
  if (propertyKey) {
    validationOptions.propertyKey = propertyKey
  }
  if (propertyType) {
    validationOptions.propertyType = propertyType
  }
  if (valueSpec) {
    validationOptions.valueSpec = valueSpec
  }

  result.validationErrors = validateExpression(validationOptions)
  result.isValid = result.validationErrors.length === 0

  // Step 2: Test expression execution (if we have a feature)
  if (feature && result.isValid) {
    try {
      const parsed = createExpression(expression)
      if (parsed.result === "error") {
        result.executionError = new Error(`Expression parsing failed: ${parsed.value.map(e => e.message).join(", ")}`)
      }
      else {
        const actualResult = parsed.value.evaluate(globalProperties, feature as any)
        result.actualResult = actualResult
        result.executes = true

        // Step 3: Compare with expected result if provided
        if (expectedResult !== undefined) {
          result.matchesExpected = actualResult === expectedResult
        }
      }
    }
    catch (error) {
      result.executionError = error instanceof Error ? error : new Error(String(error))
    }
  }

  // Step 4: Generate summary
  result.summary = generateTestSummary(result)

  return result
}

/**
 * Tests multiple expressions against multiple features to verify data retrieval patterns.
 *
 * Useful for testing expressions that should work across different feature types
 * or for verifying that expressions handle missing properties gracefully.
 *
 * @param expression - The expression to test
 * @param testCases - Array of test cases with features and expected results
 * @param options - Additional test options
 * @returns Array of test results for each test case
 *
 * @example
 * ```typescript
 * const results = testExpressionWithMultipleFeatures(
 *   ["get", "population"],
 *   [
 *     {
 *       feature: { type: "Feature", geometry: point, properties: { population: 1000000 } },
 *       expectedResult: 1000000,
 *       description: "Feature with population"
 *     },
 *     {
 *       feature: { type: "Feature", geometry: point, properties: {} },
 *       expectedResult: undefined,
 *       description: "Feature without population"
 *     }
 *   ],
 *   { validationContext: "property", propertyKey: "circle-radius" }
 * );
 * ```
 */
export function testExpressionWithMultipleFeatures(
  expression: ExpressionSpecification,
  testCases: Array<{
    feature: GeoJSON.Feature
    expectedResult?: unknown
    description: string
  }>,
  options: Omit<ExpressionTestOptions, "expression" | "feature" | "expectedResult"> = {},
): ExpressionTestResult[] {
  return testCases.map((testCase, index) =>
    testExpressionComprehensive({
      expression,
      feature: testCase.feature,
      expectedResult: testCase.expectedResult,
      testKey: `${options.testKey || "multi-test"}-${index}-${testCase.description}`,
      ...options,
    }),
  )
}

/**
 * Tests filter expressions specifically, using MapLibre's featureFilter for accurate filtering behavior.
 *
 * @param filterExpression - The filter expression to test
 * @param testCases - Array of test cases with features and expected filter results
 * @param globalProperties - Global properties for the filter context
 * @returns Array of test results for each test case
 *
 * @example
 * ```typescript
 * const results = testFilterExpression(
 *   ["==", ["get", "type"], "restaurant"],
 *   [
 *     {
 *       feature: { type: "Feature", geometry: point, properties: { type: "restaurant" } },
 *       shouldPass: true,
 *       description: "Restaurant feature"
 *     },
 *     {
 *       feature: { type: "Feature", geometry: point, properties: { type: "building" } },
 *       shouldPass: false,
 *       description: "Building feature"
 *     }
 *   ]
 * );
 * ```
 */
export function testFilterExpression(
  filterExpression: ExpressionSpecification,
  testCases: Array<{
    feature: GeoJSON.Feature
    shouldPass: boolean
    description: string
  }>,
  globalProperties: GlobalProperties = { zoom: 0 },
): ExpressionTestResult[] {
  // First validate the filter expression
  const validationResult = testExpressionComprehensive({
    expression: filterExpression,
    validationContext: "filter",
    testKey: "filter-validation",
  })

  if (!validationResult.isValid) {
    return [validationResult]
  }

  // Then test each feature
  return testCases.map((testCase, _index) => {
    try {
      const filter = featureFilter(filterExpression)
      const actualResult = filter.filter(globalProperties, testCase.feature as any, mockCanonical)

      return {
        isValid: true,
        executes: true,
        matchesExpected: actualResult === testCase.shouldPass,
        validationErrors: [],
        actualResult,
        expectedResult: testCase.shouldPass,
        summary: actualResult === testCase.shouldPass
          ? `✅ Filter ${actualResult ? "includes" : "excludes"} feature as expected`
          : `❌ Filter ${actualResult ? "includes" : "excludes"} feature, expected ${testCase.shouldPass ? "include" : "exclude"}`,
      }
    }
    catch (error) {
      return {
        isValid: true,
        executes: false,
        matchesExpected: false,
        validationErrors: [],
        executionError: error instanceof Error ? error : new Error(String(error)),
        summary: `❌ Filter execution failed: ${error}`,
      }
    }
  })
}

/**
 * Tests expression performance by executing it multiple times and measuring execution time.
 *
 * @param expression - The expression to test
 * @param feature - The feature to test against
 * @param iterations - Number of iterations to run (default: 1000)
 * @param globalProperties - Global properties for the test
 * @returns Performance test results
 *
 * @example
 * ```typescript
 * const perfResult = testExpressionPerformance(
 *   ["case", [">", ["get", "population"], 1000000], "red", "blue"],
 *   { type: "Feature", geometry: point, properties: { population: 500000 } },
 *   10000
 * );
 * console.log(`Average execution time: ${perfResult.averageTime}ms`);
 * ```
 */
export function testExpressionPerformance(
  expression: ExpressionSpecification,
  feature: GeoJSON.Feature,
  iterations: number = 1000,
  globalProperties: GlobalProperties = { zoom: 0 },
): {
    averageTime: number
    totalTime: number
    iterations: number
    expression: ExpressionSpecification
  } {
  const parsed = createExpression(expression)
  if (parsed.result === "error") {
    throw new Error(`Expression parsing failed: ${parsed.value.map(e => e.message).join(", ")}`)
  }

  const startTime = performance.now()

  for (let i = 0; i < iterations; i++) {
    parsed.value.evaluate(globalProperties, feature as any)
  }

  const endTime = performance.now()
  const totalTime = endTime - startTime

  return {
    averageTime: totalTime / iterations,
    totalTime,
    iterations,
    expression,
  }
}

/**
 * Generates a human-readable summary of test results.
 */
function generateTestSummary(result: ExpressionTestResult): string {
  const parts: string[] = []

  if (result.isValid) {
    parts.push("✅ Valid syntax")
  }
  else {
    parts.push(`❌ Invalid syntax (${result.validationErrors.length} errors)`)
  }

  if (result.executes) {
    parts.push("executes successfully")
  }
  else if (result.executionError) {
    parts.push(`execution failed: ${result.executionError.message}`)
  }
  else {
    parts.push("no execution test")
  }

  if (result.expectedResult !== undefined) {
    if (result.matchesExpected) {
      parts.push("matches expected result")
    }
    else {
      parts.push(`result mismatch: got ${JSON.stringify(result.actualResult)}, expected ${JSON.stringify(result.expectedResult)}`)
    }
  }

  return parts.join(", ")
}

/**
 * Utility function to create a simple test feature with given properties.
 *
 * @param properties - Feature properties
 * @param geometry - Optional geometry (defaults to a point at [0, 0])
 * @returns A GeoJSON Feature object
 *
 * @example
 * ```typescript
 * const feature = createTestFeature({
 *   population: 1000000,
 *   type: "city"
 * });
 * ```
 */
export function createTestFeature(
  properties: Record<string, unknown>,
  geometry:
    | GeoJSON.MultiLineString
    | GeoJSON.LineString
    | GeoJSON.Point
    | GeoJSON.MultiPoint
    | GeoJSON.Polygon
    | GeoJSON.MultiPolygon = { type: "Point", coordinates: [0, 0] },
): GeoJSON.Feature {
  return {
    type: "Feature",
    geometry,
    properties,
  }
}

export const SCENARIO_FEATURES = {
  "population-variety": [
    createTestFeature({ population: 1000, type: "village" }),
    createTestFeature({ population: 10000, type: "town" }),
    createTestFeature({ population: 100000, type: "city" }),
    createTestFeature({ population: 1000000, type: "metropolis" }),
    createTestFeature({ type: "park" }),
  ],
  "type-variety": [
    createTestFeature({ type: "restaurant", cuisine: "italian" }),
    createTestFeature({ type: "restaurant", cuisine: "chinese" }),
    createTestFeature({ type: "building", height: 50 }),
    createTestFeature({ type: "park", area: 1000 }),
    createTestFeature({ type: "road", lanes: 4 }),
  ],
  "numeric-properties": [
    createTestFeature({ value: 0, category: "low" }),
    createTestFeature({ value: 50, category: "medium" }),
    createTestFeature({ value: 100, category: "high" }),
    createTestFeature({ value: -10, category: "negative" }),
  ],
  "missing-or-null": [
    createTestFeature({ value: null }),
    createTestFeature({}),
    createTestFeature({ value: undefined }),
    createTestFeature({ value: 42 }),
  ],
  "boolean-properties": [
    createTestFeature({ active: true }),
    createTestFeature({ active: false }),
    createTestFeature({}),
  ],
  "mixed-types": [
    createTestFeature({ value: 42 }),
    createTestFeature({ value: "42" }),
    createTestFeature({ value: true }),
    createTestFeature({ value: null }),
    createTestFeature({}),
  ],
  "nested-properties": [
    createTestFeature({ stats: { count: 10, avg: 5 } }),
    createTestFeature({ stats: { count: 0 } }),
    createTestFeature({}),
  ],
  "array-properties": [
    createTestFeature({ tags: ["a", "b", "c"] }),
    createTestFeature({ tags: [] }),
    createTestFeature({}),
  ],
  "edge-numeric": [
    createTestFeature({ value: 0 }),
    createTestFeature({ value: -1 }),
    createTestFeature({ value: Number.MAX_SAFE_INTEGER }),
    createTestFeature({ value: Number.MIN_SAFE_INTEGER }),
    createTestFeature({}),
  ],
  "geometry-variety": [
    createTestFeature({ type: "point" }, { type: "Point", coordinates: [0, 0] }),
    createTestFeature({ type: "line" }, { type: "LineString", coordinates: [[0, 0], [1, 1]] }),
    createTestFeature({ type: "polygon" }, { type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] }),
  ],
} as const

export type ScenarioName = keyof typeof SCENARIO_FEATURES

export function createScenarioFeatures(scenario: ScenarioName): GeoJSON.Feature[] {
  if (scenario in SCENARIO_FEATURES) {
    return SCENARIO_FEATURES[scenario].slice()
  }
  return [createTestFeature({})]
}
