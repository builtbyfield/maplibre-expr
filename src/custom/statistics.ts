import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

import { add, divide, multiply, subtract, pow } from "../core/math/arithmetic"
import { max as mathMax, min as mathMin } from "../core/math/comparison"
import { sqrt, abs } from "../core/math/advanced"
import { get } from "../core/lookup"
import { literal } from "../core/types/assertion"

/**
 * Calculate the average of multiple fields
 *
 * @param fields - Array of field names to average
 * @returns Expression that calculates the average
 *
 * @example
 * // Average temperature from multiple sensors
 * statistics.average('temp1', 'temp2', 'temp3')
 */
export function average(...fields: string[]): ExpressionSpecification {
  if (fields.length === 0) {
    return literal(0)
  }

  if (fields.length === 1) {
    return get(fields[0])
  }

  // Sum all fields
  let sumExpr: ExpressionSpecification = get(fields[0])
  for (let i = 1; i < fields.length; i++) {
    sumExpr = add(sumExpr, get(fields[i]))
  }

  // Divide by count
  return divide(sumExpr, fields.length)
}

/**
 * Calculate the sum of multiple fields
 *
 * @param fields - Array of field names to sum
 * @returns Expression that calculates the sum
 *
 * @example
 * // Total sales from different categories
 * statistics.sum('salesA', 'salesB', 'salesC')
 */
export function sum(...fields: string[]): ExpressionSpecification {
  if (fields.length === 0) {
    return literal(0)
  }

  if (fields.length === 1) {
    return get(fields[0])
  }

  let sumExpr: ExpressionSpecification = get(fields[0])
  for (let i = 1; i < fields.length; i++) {
    sumExpr = add(sumExpr, get(fields[i]))
  }

  return sumExpr
}

/**
 * Normalize a value to 0-1 range
 *
 * @param field - The field to normalize
 * @param min - Minimum value in the data
 * @param max - Maximum value in the data
 * @returns Expression that returns normalized value (0-1)
 *
 * @example
 * // Normalize population for consistent sizing
 * statistics.normalize(['get', 'population'], 0, 1000000)
 */
export function normalize(
  field: string | ExpressionSpecification,
  min: number,
  max: number
): ExpressionSpecification {
  const fieldExpr = typeof field === 'string' ? get(field) : field
  const range = max - min

  if (range === 0) {
    return literal(0)
  }

  // (value - min) / (max - min)
  return divide(
    subtract(fieldExpr, min),
    range
  )
}

/**
 * Calculate z-score (standard deviations from mean)
 *
 * @param field - The field to calculate z-score for
 * @param mean - Population mean
 * @param stdDev - Population standard deviation
 * @returns Expression that returns z-score
 *
 * @example
 * // Find outliers based on z-score
 * statistics.zScore('value', 50, 10)
 */
export function zScore(
  field: string,
  mean: number,
  stdDev: number
): ExpressionSpecification {
  if (stdDev === 0) {
    return literal(0)
  }

  // (value - mean) / stdDev
  return divide(
    subtract(get(field), mean),
    stdDev
  )
}

/**
 * Calculate the range (max - min) of multiple fields
 *
 * @param fields - Array of field names
 * @returns Expression that returns the range
 *
 * @example
 * // Temperature range throughout the day
 * statistics.range('morningTemp', 'noonTemp', 'eveningTemp')
 */
export function range(...fields: string[]): ExpressionSpecification {
  if (fields.length === 0) {
    return literal(0)
  }

  if (fields.length === 1) {
    return literal(0)
  }

  // Find max and min
  let maxExpr: ExpressionSpecification = get(fields[0])
  let minExpr: ExpressionSpecification = get(fields[0])

  for (let i = 1; i < fields.length; i++) {
    maxExpr = mathMax(maxExpr, get(fields[i]))
    minExpr = mathMin(minExpr, get(fields[i]))
  }

  return subtract(maxExpr, minExpr)
}

/**
 * Clamp a value between min and max
 *
 * @param field - The field to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Expression that returns clamped value
 *
 * @example
 * // Ensure opacity stays between 0 and 1
 * statistics.clamp('opacity', 0, 1)
 */
export function clamp(
  field: string,
  min: number,
  max: number
): ExpressionSpecification {
  return mathMax(min, mathMin(max, get(field)))
}

/**
 * Calculate percentage of a value relative to total
 *
 * @param field - The value field
 * @param totalField - The total field
 * @returns Expression that returns percentage (0-100)
 *
 * @example
 * // Show market share percentage
 * statistics.percentageOf('sales', 'totalMarket')
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
 * Calculate coefficient of variation (relative variability)
 *
 * @param stdDevField - Standard deviation field
 * @param meanField - Mean field
 * @returns Expression that returns coefficient of variation
 *
 * @example
 * // Measure relative variability
 * statistics.coefficientOfVariation('priceStdDev', 'priceMean')
 */
export function coefficientOfVariation(
  stdDevField: string,
  meanField: string
): ExpressionSpecification {
  return divide(get(stdDevField), get(meanField))
}

export const statistics = {
  average,
  sum,
  normalize,
  zScore,
  range,
  clamp,
  percentageOf,
  coefficientOfVariation,
} as const