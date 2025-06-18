import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

import { get } from "../core/lookup"
import { literal } from "../core/types/assertion"
import { match } from "../core/decision/control-flow"
import { greaterOrEqual, lessOrEqual, less } from "../core/decision/comparison"
import { divide, multiply, subtract, add } from "../core/math/arithmetic"
import { floor, round } from "../core/math/rounding"
import { min as mathMin, max as mathMax } from "../core/math/comparison"

interface Bucket {
  max: number
  output: any
}

interface Category {
  test: ExpressionSpecification
  output: any
}

/**
 * Group numeric values into buckets
 *
 * @param field - Field to bucket
 * @param buckets - Array of bucket definitions
 * @returns Expression that returns bucket value
 *
 * @example
 * // Age groups
 * transform.bucket('age', [
 *   { max: 18, output: 'youth' },
 *   { max: 35, output: 'young-adult' },
 *   { max: 65, output: 'adult' },
 *   { max: Infinity, output: 'senior' }
 * ])
 */
export function bucket(
  field: string,
  buckets: Bucket[]
): ExpressionSpecification {
  if (buckets.length === 0) {
    return literal(null)
  }

  const value = get(field)
  
  // Sort buckets by max value
  const sortedBuckets = [...buckets].sort((a, b) => a.max - b.max)
  
  // Build case expression
  const cases: any[] = []
  sortedBuckets.forEach(bucket => {
    if (bucket.max !== Infinity) {
      cases.push(
        less(value, bucket.max),
        literal(bucket.output)
      )
    }
  })
  
  // Add default for last bucket (or Infinity bucket)
  const lastBucket = sortedBuckets[sortedBuckets.length - 1]
  cases.push(literal(lastBucket.output))
  
  return ["case", ...cases] as ExpressionSpecification
}

/**
 * Calculate percentile rank of a value
 *
 * @param field - Field to rank
 * @param min - Minimum value in dataset
 * @param max - Maximum value in dataset
 * @returns Expression that returns percentile (0-100)
 *
 * @example
 * // Percentile rank of score
 * transform.percentileRank('score', 0, 100)
 */
export function percentileRank(
  field: string,
  min: number,
  max: number
): ExpressionSpecification {
  const value = get(field)
  const range = max - min
  
  if (range === 0) {
    return literal(50) // All values are equal
  }
  
  // Calculate percentile
  const normalized = divide(subtract(value, min), range)
  return multiply(normalized, 100)
}

/**
 * Calculate percentage of a value relative to total
 *
 * @param field - Value field
 * @param totalField - Total field
 * @returns Expression that returns percentage (0-100)
 *
 * @example
 * // Market share percentage
 * transform.percentageOf('companyRevenue', 'totalMarketRevenue')
 */
export function percentageOf(
  field: string,
  totalField: string
): ExpressionSpecification {
  return multiply(
    divide(get(field), get(totalField)),
    100
  )
}

/**
 * Categorize values based on conditions
 *
 * @param categories - Array of category definitions
 * @returns Expression that returns category
 *
 * @example
 * // Risk categorization
 * transform.categorize([
 *   { test: ['<', ['get', 'score'], 30], output: 'high-risk' },
 *   { test: ['<', ['get', 'score'], 70], output: 'medium-risk' },
 *   { test: ['>=', ['get', 'score'], 70], output: 'low-risk' }
 * ])
 */
export function categorize(categories: Category[]): ExpressionSpecification {
  if (categories.length === 0) {
    return literal(null)
  }

  // Build case expression
  const cases: any[] = []
  categories.forEach(category => {
    cases.push(category.test, literal(category.output))
  })
  cases.push(literal(null)) // Default
  
  return ["case", ...cases] as ExpressionSpecification
}

/**
 * Round values to specific intervals
 *
 * @param field - Field to round
 * @param interval - Rounding interval
 * @returns Expression that returns rounded value
 *
 * @example
 * // Round prices to nearest 5
 * transform.roundToInterval('price', 5)
 */
export function roundToInterval(
  field: string,
  interval: number
): ExpressionSpecification {
  const value = get(field)
  
  // Round to nearest interval
  return multiply(
    round(divide(value, interval)),
    interval
  )
}

/**
 * Scale values to a new range
 *
 * @param field - Field to scale
 * @param oldMin - Original minimum
 * @param oldMax - Original maximum
 * @param newMin - New minimum
 * @param newMax - New maximum
 * @returns Expression that returns scaled value
 *
 * @example
 * // Scale temperature from Celsius to 0-100 range
 * transform.scaleRange('temperature', -20, 40, 0, 100)
 */
export function scaleRange(
  field: string,
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number
): ExpressionSpecification {
  const value = get(field)
  const oldRange = oldMax - oldMin
  const newRange = newMax - newMin
  
  if (oldRange === 0) {
    return literal(newMin)
  }
  
  // Scale formula: (value - oldMin) / oldRange * newRange + newMin
  return add(
    multiply(
      divide(subtract(value, oldMin), oldRange),
      newRange
    ),
    newMin
  )
}

/**
 * Create binned histogram data
 *
 * @param field - Field to bin
 * @param binCount - Number of bins
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Expression that returns bin index
 *
 * @example
 * // Create 10 bins for age distribution
 * transform.bin('age', 10, 0, 100)
 */
export function bin(
  field: string,
  binCount: number,
  min: number,
  max: number
): ExpressionSpecification {
  const value = get(field)
  const range = max - min
  const binSize = range / binCount
  
  // Calculate bin index
  const normalized = divide(subtract(value, min), binSize)
  const binIndex = floor(normalized)
  
  // Clamp to valid bin range
  return mathMax(0, mathMin(subtract(binCount, 1), binIndex))
}

/**
 * Apply logarithmic transformation
 *
 * @param field - Field to transform
 * @param base - Logarithm base (default: 10)
 * @returns Expression that returns log-transformed value
 *
 * @example
 * // Log transform for better visualization of large ranges
 * transform.logTransform('population', 10)
 */
export function logTransform(
  field: string,
  base: number = 10
): ExpressionSpecification {
  const value = get(field)
  
  // log_base(x) = ln(x) / ln(base)
  // MapLibre has ln() function
  return divide(
    ["ln", mathMax(0.0001, value)], // Avoid ln(0)
    ["ln", base]
  )
}

/**
 * Quantize values to discrete levels
 *
 * @param field - Field to quantize
 * @param levels - Number of discrete levels
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Expression that returns quantized value
 *
 * @example
 * // Quantize continuous values to 5 levels
 * transform.quantize('intensity', 5, 0, 1)
 */
export function quantize(
  field: string,
  levels: number,
  min: number,
  max: number
): ExpressionSpecification {
  const value = get(field)
  const range = max - min
  
  // Normalize to 0-1
  const normalized = divide(subtract(value, min), range)
  
  // Quantize
  const quantized = floor(multiply(normalized, levels))
  
  // Scale back to original range
  return add(
    multiply(divide(quantized, levels), range),
    min
  )
}

/**
 * Smooth values using exponential smoothing
 *
 * @param currentField - Current value field
 * @param previousField - Previous smoothed value field
 * @param alpha - Smoothing factor (0-1)
 * @returns Expression that returns smoothed value
 *
 * @example
 * // Smooth sensor readings
 * transform.exponentialSmooth('reading', 'prevSmoothed', 0.3)
 */
export function exponentialSmooth(
  currentField: string,
  previousField: string,
  alpha: number
): ExpressionSpecification {
  const current = get(currentField)
  const previous = get(previousField)
  
  // Smoothed = alpha * current + (1 - alpha) * previous
  return add(
    multiply(alpha, current),
    multiply(subtract(1, alpha), previous)
  )
}

export const transform = {
  bucket,
  percentileRank,
  percentageOf,
  categorize,
  roundToInterval,
  scaleRange,
  bin,
  logTransform,
  quantize,
  exponentialSmooth,
} as const