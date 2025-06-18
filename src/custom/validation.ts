import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

import {
  all,
  any,
  equal,
  get,
  greater,
  greaterOrEqual,
  has,
  indexOf,
  length,
  lessOrEqual,
  literal,
  match,
  notEqual,
} from "../core"

/**
 * Check if all required fields exist and are non-null
 *
 * @param fields - Array of field names to check
 * @returns Expression that returns true if all fields exist
 *
 * @example
 * // Show only complete records
 * validation.hasRequiredFields(['name', 'email', 'phone'])
 */
export function hasRequiredFields(fields: string[]): ExpressionSpecification {
  if (fields.length === 0) {
    return literal(true)
  }

  const checks = fields.map(field => has(field))
  return all(...checks)
}

/**
 * Check if a field contains a valid email address pattern
 *
 * @param field - The field to validate
 * @returns Expression that returns true if field contains valid email
 *
 * @example
 * // Filter features with valid emails
 * validation.isValidEmail('contactEmail')
 */
export function isValidEmail(field: string): ExpressionSpecification {
  // Check if field exists and matches basic email pattern
  // Note: This is a simplified check - full email validation is complex
  return all(
    has(field),
    // Check for @ symbol
    notEqual(
      indexOf("@", get(field)),
      -1,
    ),
    // Check for . after @
    greater(
      indexOf(
        ".",
        literal([
          get(field),
          indexOf("@", get(field)),
        ]),
      ),
      indexOf("@", get(field)),
    ),
  )
}

/**
 * Check if a field contains a valid phone number
 *
 * @param field - The field to validate
 * @param countryCode - Optional country code to validate format
 * @returns Expression that returns true if valid phone number
 *
 * @example
 * // Filter features with valid US phone numbers
 * validation.isValidPhoneNumber('phone', 'US')
 */
export function isValidPhoneNumber(
  field: string,
  countryCode?: string,
): ExpressionSpecification {
  const baseChecks = [
    has(field),
    // Check minimum length (accounting for various formats)
    greaterOrEqual(length(get(field)), 10),
  ]

  if (countryCode === "US") {
    // For US, check if it's 10 or 11 digits (with or without country code)
    return all(
      ...baseChecks,
      any(
        equal(length(get(field)), 10),
        equal(length(get(field)), 11),
      ),
    )
  }

  // Default: just check basic length
  return all(...baseChecks)
}

/**
 * Check if a numeric field is within specified bounds
 *
 * @param field - The field to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Expression that returns true if within bounds
 *
 * @example
 * // Show only features with valid percentages
 * validation.isWithinBounds('percentage', 0, 100)
 */
export function isWithinBounds(
  field: string,
  min: number,
  max: number,
): ExpressionSpecification {
  return all(
    has(field),
    greaterOrEqual(get(field), min),
    lessOrEqual(get(field), max),
  )
}

/**
 * Check if a string field has minimum length
 *
 * @param field - The field to check
 * @param minLength - Minimum required length
 * @returns Expression that returns true if meets minimum length
 *
 * @example
 * // Show only features with substantial descriptions
 * validation.hasMinimumLength('description', 10)
 */
export function hasMinimumLength(
  field: string,
  minLength: number,
): ExpressionSpecification {
  return all(
    has(field),
    greaterOrEqual(length(get(field)), minLength),
  )
}

/**
 * Check if a field matches one of the allowed values
 *
 * @param field - The field to check
 * @param allowedValues - Array of allowed values
 * @returns Expression that returns true if matches allowed values
 *
 * @example
 * // Show only features with valid status
 * validation.matchesPattern('status', ['active', 'pending', 'completed'])
 */
export function matchesPattern(
  field: string,
  allowedValues: (string | number | boolean)[],
): ExpressionSpecification {
  // If no allowed values are provided, return early with `false`
  if (allowedValues.length === 0) {
    return literal(false)
  }

  // Create match expression with all allowed values
  const matchPairs: [string | number | boolean, boolean][] = []
  allowedValues.forEach((value) => {
    matchPairs.push([value, true])
  })
  // matchPairs.push([false, true]) // Default case

  // If there is only one allowed value, we can use a simpler expression
  if (matchPairs.length === 1) {
    return all(
      has(field),
      match(
        get(field),
        [matchPairs[0]],
        false,
      ),
    )
  }

  // If there are multiple allowed values, we can use a match expression
  return all(
    has(field),
    match(
      get(field),
      [matchPairs[0], ...matchPairs.slice(1)],
      false,
    ),
  )
}

export const validation = {
  hasRequiredFields,
  isValidEmail,
  isValidPhoneNumber,
  isWithinBounds,
  hasMinimumLength,
  matchesPattern,
} as const
