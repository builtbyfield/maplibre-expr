import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

import {
  add,
  and,
  divide,
  equal,
  floor,
  get,
  greaterOrEqual,
  has,
  less,
  lessOrEqual,
  literal,
  mod,
  multiply,
  number,
  or,
  subtract,
} from "../core/"

interface DiscountRule {
  condition: ExpressionSpecification
  discount: number
}

interface PriorityFactor {
  field: string
  weight: number
  normalize?: { min: number, max: number }
}

/**
 * Check if current time is within business hours
 *
 * @param timeField - Field containing time in milliseconds
 * @param openHour - Opening hour (0-23), default 9
 * @param closeHour - Closing hour (0-23), default 17
 * @param timezone - Timezone offset in hours from UTC
 * @returns Expression that returns true if within business hours
 *
 * @example
 * // Check if store is open (9 AM - 5 PM)
 * business.isBusinessHours('currentTime', 9, 17)
 */
export function isBusinessHours(
  timeField: string,
  openHour: number = 9,
  closeHour: number = 17,
  timezone: number = 0,
): ExpressionSpecification {
  // Convert milliseconds to hours of day
  const msPerHour = 60 * 60 * 1000
  const time = get(timeField)

  // Adjust for timezone and get hour of day
  const adjustedTime = [
    "number",
    ["+", time, multiply(timezone, msPerHour)],
  ] satisfies ExpressionSpecification

  const hourOfDay = number(mod(floor(divide(adjustedTime, msPerHour)), 24))

  return and(
    greaterOrEqual(hourOfDay, openHour),
    less(hourOfDay, closeHour),
  )
}

/**
 * Calculate discount based on rules
 *
 * @param priceField - Field containing the base price
 * @param rules - Array of discount rules
 * @returns Expression that returns discounted price
 *
 * @example
 * // Apply discounts based on conditions
 * business.calculateDiscount('price', [
 *   { condition: ['>', ['get', 'quantity'], 10], discount: 0.1 },
 *   { condition: ['==', ['get', 'memberType'], 'gold'], discount: 0.2 }
 * ])
 */
export function calculateDiscount(
  priceField: string,
  rules: DiscountRule[],
): ExpressionSpecification {
  if (rules.length === 0) {
    return get(priceField)
  }

  const basePrice = get(priceField)

  // Build nested conditions for discounts
  const cases: any[] = []
  rules.forEach((rule) => {
    cases.push(
      rule.condition,
      multiply(basePrice, subtract(1, rule.discount)),
    )
  })
  cases.push(basePrice) // Default: no discount

  return ["case", ...cases] as ExpressionSpecification
}

/**
 * Calculate priority score based on multiple factors
 *
 * @param factors - Array of factors with weights
 * @returns Expression that returns priority score (0-100)
 *
 * @example
 * // Calculate customer priority
 * business.priorityScore([
 *   { field: 'revenue', weight: 0.4, normalize: { min: 0, max: 100000 } },
 *   { field: 'loyalty', weight: 0.3, normalize: { min: 0, max: 10 } },
 *   { field: 'urgency', weight: 0.3, normalize: { min: 0, max: 5 } }
 * ])
 */
export function priorityScore(factors: PriorityFactor[]): ExpressionSpecification {
  if (factors.length === 0) {
    return literal(0)
  }

  // Calculate weighted sum
  let weightedSum: ExpressionSpecification = literal(0)

  factors.forEach((factor) => {
    let value = get(factor.field)

    // Normalize if needed
    if (factor.normalize) {
      const range = factor.normalize.max - factor.normalize.min
      value = divide(
        subtract(value, factor.normalize.min),
        range,
      )
    }

    // Add weighted value
    const weightedValue = multiply(value, factor.weight)
    weightedSum = ["number", ["+", weightedSum, weightedValue]]
  })

  // Scale to 0-100
  return multiply(weightedSum, 100)
}

/**
 * Check if date is a holiday (simplified US holidays)
 *
 * @param dateField - Field containing date in milliseconds
 * @returns Expression that returns true if holiday
 *
 * @example
 * // Check if date is a holiday
 * business.isHoliday('eventDate')
 */
export function isHoliday(dateField: string): ExpressionSpecification {
  // This is a simplified check for major US holidays
  // Real implementation would need a comprehensive holiday calendar

  const date = get(dateField)
  const msPerDay = 24 * 60 * 60 * 1000

  // Get day of year (simplified)
  const dayOfYear = floor(divide(date, msPerDay))
  const yearDay = ["number", ["%", dayOfYear, 365]]

  // Check for fixed holidays (very simplified)
  // New Year's Day (1), Independence Day (185), Christmas (359)
  return or(
    equal(yearDay, 1), // Jan 1
    equal(yearDay, 185), // Jul 4 (approximate)
    equal(yearDay, 359), // Dec 25 (approximate)
  )
}

/**
 * Calculate days since an event
 *
 * @param eventDateField - Field containing event date in milliseconds
 * @param currentTime - Current time in milliseconds (default: now)
 * @returns Expression that returns number of days
 *
 * @example
 * // Days since last purchase
 * business.daysSinceEvent('lastPurchaseDate')
 */
export function daysSinceEvent(
  eventDateField: string,
  currentTime: number = Date.now(),
): ExpressionSpecification {
  const eventDate = get(eventDateField)
  const msPerDay = 24 * 60 * 60 * 1000

  return floor(
    divide(
      subtract(currentTime, eventDate),
      msPerDay,
    ),
  )
}

/**
 * Check if something has expired
 *
 * @param expiryField - Field containing expiry date in milliseconds
 * @param currentTime - Current time in milliseconds (default: now)
 * @returns Expression that returns true if expired
 *
 * @example
 * // Check if membership has expired
 * business.isExpired('membershipExpiry')
 */
export function isExpired(
  expiryField: string,
  currentTime: number = Date.now(),
): ExpressionSpecification {
  return and(
    has(expiryField),
    less(get(expiryField), currentTime),
  )
}

/**
 * Calculate business days between dates (simplified)
 *
 * @param startField - Start date field in milliseconds
 * @param endField - End date field in milliseconds
 * @returns Expression that returns approximate business days
 *
 * @example
 * // Calculate processing time in business days
 * business.businessDaysBetween('orderDate', 'shipDate')
 */
export function businessDaysBetween(
  startField: string,
  endField: string,
): ExpressionSpecification {
  const start = get(startField)
  const end = get(endField)
  const msPerDay = 24 * 60 * 60 * 1000

  // Total days
  const totalDays = floor(divide(subtract(end, start), msPerDay))

  // Approximate business days (5/7 of total days)
  return floor(multiply(totalDays, divide(5, 7)))
}

/**
 * Determine tier based on value thresholds
 *
 * @param valueField - Field containing the value to tier
 * @param thresholds - Array of threshold values for tiers
 * @returns Expression that returns tier name
 *
 * @example
 * // Customer tier based on spending
 * business.getTier('totalSpending', [
 *   { threshold: 1000, tier: 'silver' },
 *   { threshold: 5000, tier: 'gold' },
 *   { threshold: 10000, tier: 'platinum' }
 * ])
 */
export function getTier(
  valueField: string,
  thresholds: Array<{ threshold: number, tier: string }>,
): ExpressionSpecification {
  const value = get(valueField)

  // Sort thresholds in ascending order
  const sortedThresholds = [...thresholds].sort((a, b) => a.threshold - b.threshold)

  // Build case expression
  const cases: any[] = []
  sortedThresholds.reverse().forEach(({ threshold, tier }) => {
    cases.push(
      greaterOrEqual(value, threshold),
      literal(tier),
    )
  })
  cases.push(literal("basic")) // Default tier

  return ["case", ...cases] as ExpressionSpecification
}

/**
 * Check if within service level agreement (SLA) time
 *
 * @param startField - Start time field in milliseconds
 * @param slaHours - SLA time limit in hours
 * @param currentTime - Current time in milliseconds
 * @returns Expression that returns true if within SLA
 *
 * @example
 * // Check if ticket is within 24-hour SLA
 * business.isWithinSLA('ticketCreatedAt', 24)
 */
export function isWithinSLA(
  startField: string,
  slaHours: number,
  currentTime: number = Date.now(),
): ExpressionSpecification {
  const start = get(startField)
  const msPerHour = 60 * 60 * 1000
  const slaMs = multiply(slaHours, msPerHour)

  return lessOrEqual(
    subtract(currentTime, start),
    slaMs,
  )
}

export const business = {
  isBusinessHours,
  calculateDiscount,
  priorityScore,
  isHoliday,
  daysSinceEvent,
  isExpired,
  businessDaysBetween,
  getTier,
  isWithinSLA,
} as const
