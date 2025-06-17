import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

import { expr } from "../index"

/**
 * Check if a time is within a range defined by two time properties. Both
 * properties must exist on the feature for this expression to return true.
 * Be sure to use timestamps in milliseconds for the `timeToCheck`,
 * `startTime`, and `endTime` parameters.
 *
 * @param timeToCheck - The time to check (e.g. `new Date().getTime()`)
 * @param startTime - The start time property. Must be a timestamp in
 *   milliseconds.
 * @param endTime - The end time property. Must be a timestamp in milliseconds.
 * @returns An expression that returns true if the time is within the range
 *
 * @example
 * expr.isWithinTimeRange(1719878400000, "startTime", "endTime")
 */
export function isWithinTimeRange(
  timeToCheck: number | string | ExpressionSpecification,
  startTime: number | string | ExpressionSpecification,
  endTime: number | string | ExpressionSpecification,
) {
  // Convert inputs to expressions if they're property names (strings) or timestamps (numbers)
  const dateExpr
    = typeof timeToCheck === "string"
      ? expr.get(timeToCheck)
      : typeof timeToCheck === "number"
        ? expr.literal(timeToCheck)
        : timeToCheck

  const startExpr
    = typeof startTime === "string"
      ? expr.get(startTime)
      : typeof startTime === "number"
        ? expr.literal(startTime)
        : startTime

  const endExpr
    = typeof endTime === "string"
      ? expr.get(endTime)
      : typeof endTime === "number"
        ? expr.literal(endTime)
        : endTime

  // Build conditions array
  const conditions: ExpressionSpecification[] = []

  // Add property existence checks if needed
  if (typeof startTime === "string") {
    conditions.push(expr.has(startTime))
  }
  if (typeof endTime === "string") {
    conditions.push(expr.has(endTime))
  }

  // Add range check
  const rangeCheck = expr.and(
    expr.greaterOrEqual(dateExpr, startExpr),
    expr.lessOrEqual(dateExpr, endExpr),
  )

  // If we have property checks, combine them with the range check
  const finalCondition = conditions.length
    ? expr.and(...conditions, rangeCheck)
    : rangeCheck

  return [
    "case",
    finalCondition,
    true,
    false,
  ] satisfies ExpressionSpecification
}

/**
 * Check if a timestamp is today.
 *
 * @param timeToCheck - The date to check (e.g. `new Date().getTime()` or a
 *   data-driven property name)
 * @returns An expression that returns `true` if the date is today
 *
 * @example
 * expr.isToday(1719878400000)
 * expr.isToday(expr.get("dateProp"))
 */
export function isToday(
  timeToCheck: number | string | ExpressionSpecification,
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return expr.isWithinTimeRange(
    timeToCheck,
    expr.literal(today.getTime()),
    expr.literal(tomorrow.getTime()),
  ) satisfies ExpressionSpecification
}

/**
 * Check if a timestamp is within the next duration of time
 *
 * @param timeToCheck - The time to check (e.g. `new Date().getTime()` or a
 *   data-driven property name)
 * @param duration - The duration in milliseconds to check within
 * @returns An expression that returns `true` if the time is within the next duration
 *
 * @example
 * // Check if within next 7 days
 * expr.isWithinNextDuration(1719878400000, 7 * 24 * 60 * 60 * 1000)
 * // Check if within next hour
 * expr.isWithinNextDuration(expr.get("timeProp"), 60 * 60 * 1000)
 */
export function isWithinNextDuration(
  timeToCheck: number | string | ExpressionSpecification,
  duration: number,
) {
  const now = new Date()
  const future = new Date(now.getTime() + duration)

  return expr.isWithinTimeRange(
    timeToCheck,
    expr.literal(now.getTime()),
    expr.literal(future.getTime()),
  ) satisfies ExpressionSpecification
}

/**
 * Check if a time is within the past duration
 *
 * @param timeToCheck - The time to check (e.g. `new Date().getTime()` or a
 *   data-driven property name)
 * @param duration - The duration in milliseconds to check within
 * @returns An expression that returns `true` if the time is within the past duration
 *
 * @example
 * // Check if within past 7 days
 * expr.isWithinPastDuration(expr.get("timeToCheck"), 7 * 24 * 60 * 60 * 1000)
 * // Check if within past hour
 * expr.isWithinPastDuration(1719878400000, 60 * 60 * 1000)
 */
export function isWithinPastDuration(
  timeToCheck: string | number | ExpressionSpecification,
  duration: number,
) {
  const now = new Date()
  const past = new Date(now.getTime() - duration)

  return expr.isWithinTimeRange(
    timeToCheck,
    expr.literal(past.getTime()),
    expr.literal(now.getTime()),
  ) satisfies ExpressionSpecification
}

/**
 * Check if two times are on the same day
 *
 * @param time1 - First time to compare (timestamp or property name)
 * @param time2 - Second time to compare (timestamp or property name)
 * @returns Expression that returns true if both times are on the same day
 *
 * @example
 * expr.isSameDay(1710374400000, 1710417600000) // Same day
 * expr.isSameDay(expr.get("startTime"), expr.get("endTime"))
 */
export function isSameDay(
  time1: number | string | ExpressionSpecification,
  time2: number | string | ExpressionSpecification,
) {
  // Convert inputs to expressions if they're property names (strings) or timestamps (numbers)
  const time1Expr
    = typeof time1 === "string"
      ? expr.get(time1)
      : typeof time1 === "number"
        ? expr.literal(time1)
        : time1

  const time2Expr
    = typeof time2 === "string"
      ? expr.get(time2)
      : typeof time2 === "number"
        ? expr.literal(time2)
        : time2

  // First check if both times exist
  const conditions: ExpressionSpecification[] = []
  if (typeof time1 === "string") {
    conditions.push(expr.has(time1))
  }
  if (typeof time2 === "string") {
    conditions.push(expr.has(time2))
  }

  // Convert to days since epoch by dividing by milliseconds in a day
  const msPerDay = 24 * 60 * 60 * 1000
  const day1 = expr.floor(expr.divide(time1Expr, msPerDay))
  const day2 = expr.floor(expr.divide(time2Expr, msPerDay))

  // Compare the days
  const comparison = expr.eq(day1, day2)

  // If we have property checks, combine them with the comparison
  const finalCondition = conditions.length
    ? expr.and(...conditions, comparison)
    : comparison

  return [
    "case",
    finalCondition,
    true,
    false,
  ] satisfies ExpressionSpecification
}

export const datetime = {
  isWithinTimeRange,
  isToday,
  isWithinNextDuration,
  isWithinPastDuration,
  isSameDay,
}
