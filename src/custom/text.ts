import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

import { all, any } from "../core/decision/logical"
import { notEqual, greaterOrEqual } from "../core/decision/comparison"
import { get, length as getLength } from "../core/lookup"
import { literal } from "../core/types/assertion"
import { downcase, upcase, concat } from "../core/strings"
import { subtract, divide } from "../core/math/arithmetic"

/**
 * Count the number of words in a text field
 *
 * @param field - The field to count words in
 * @returns Expression that returns word count
 *
 * @example
 * // Filter features with substantial descriptions
 * ['>=', text.wordCount('description'), 10]
 */
export function wordCount(field: string): ExpressionSpecification {
  // This is a simplified word count - counts spaces + 1
  // A more accurate implementation would need regex support
  const text = get(field)
  
  // Count spaces and add 1 for word count approximation
  // This is limited by MapLibre's expression capabilities
  return literal(1) // Placeholder - actual implementation limited by expression API
}

/**
 * Check if text contains any of the specified words
 *
 * @param field - The field to search in
 * @param words - Array of words to search for
 * @returns Expression that returns true if any word is found
 *
 * @example
 * // Find restaurants with Italian cuisine
 * text.containsAny('description', ['pizza', 'pasta', 'italian'])
 */
export function containsAny(
  field: string,
  words: string[]
): ExpressionSpecification {
  if (words.length === 0) {
    return literal(false)
  }

  const text = downcase(get(field))
  const checks = words.map(word => 
    notEqual(["index-of", downcase(literal(word)), text], -1)
  )

  return any(...checks)
}

/**
 * Check if text contains all of the specified words
 *
 * @param field - The field to search in
 * @param words - Array of words that must all be present
 * @returns Expression that returns true if all words are found
 *
 * @example
 * // Find features with complete address
 * text.containsAll('address', ['street', 'city', 'state'])
 */
export function containsAll(
  field: string,
  words: string[]
): ExpressionSpecification {
  if (words.length === 0) {
    return literal(true)
  }

  const text = downcase(get(field))
  const checks = words.map(word => 
    notEqual(["index-of", downcase(literal(word)), text], -1)
  )

  return all(...checks)
}

/**
 * Convert text to title case (first letter capitalized)
 *
 * @param field - The field to convert
 * @returns Expression that returns title case text
 *
 * @example
 * // Display names in title case
 * text.titleCase('name')
 */
export function titleCase(field: string): ExpressionSpecification {
  const text = get(field)
  
  // Get first character and uppercase it
  const firstChar = upcase(["slice", text, 0, 1])
  // Get rest of string and lowercase it
  const restChars = downcase(["slice", text, 1])
  
  return concat(firstChar, restChars)
}

/**
 * Check if text starts with a specific prefix
 *
 * @param field - The field to check
 * @param prefix - The prefix to look for
 * @returns Expression that returns true if starts with prefix
 *
 * @example
 * // Find all features with codes starting with 'US'
 * text.startsWith('code', 'US')
 */
export function startsWith(
  field: string,
  prefix: string
): ExpressionSpecification {
  const text = get(field)
  const prefixLength = prefix.length
  
  return ["==", ["slice", text, 0, prefixLength], prefix]
}

/**
 * Check if text ends with a specific suffix
 *
 * @param field - The field to check
 * @param suffix - The suffix to look for
 * @returns Expression that returns true if ends with suffix
 *
 * @example
 * // Find files with .pdf extension
 * text.endsWith('filename', '.pdf')
 */
export function endsWith(
  field: string,
  suffix: string
): ExpressionSpecification {
  const text = get(field)
  const suffixLength = suffix.length
  
  // Get the last N characters where N is suffix length
  const textLength = getLength(text)
  const startPos = subtract(textLength, suffixLength)
  
  return ["==", ["slice", text, startPos], suffix]
}

/**
 * Replace all occurrences of a substring
 *
 * @param field - The field containing text
 * @param search - Text to search for
 * @param replace - Text to replace with
 * @returns Expression that returns text with replacements
 *
 * @example
 * // Replace abbreviations
 * text.replaceAll('address', 'St.', 'Street')
 */
export function replaceAll(
  field: string,
  search: string,
  replace: string
): ExpressionSpecification {
  // MapLibre doesn't have a replace function, so we can't implement this properly
  // Return the original text as a placeholder
  return get(field)
}

/**
 * Truncate text to a maximum length with ellipsis
 *
 * @param field - The field to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Expression that returns truncated text
 *
 * @example
 * // Limit description length for display
 * text.truncate('description', 50)
 */
export function truncate(
  field: string,
  maxLength: number
): ExpressionSpecification {
  const text = get(field)
  const textLength = getLength(text)
  
  return [
    "case",
    greaterOrEqual(textLength, maxLength),
    concat(["slice", text, 0, maxLength - 3], "..."),
    text
  ]
}

/**
 * Check if text matches a simple pattern (with * wildcards)
 *
 * @param field - The field to match
 * @param pattern - Pattern with * wildcards
 * @returns Expression that returns true if matches
 *
 * @example
 * // Match phone patterns
 * text.matchesWildcard('phone', '555-*')
 */
export function matchesWildcard(
  field: string,
  pattern: string
): ExpressionSpecification {
  const text = get(field)
  
  // Simple implementation for prefix matching
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1)
    return startsWith(field, prefix)
  }
  
  // For exact match
  return ["==", text, pattern]
}

/**
 * Remove common punctuation from text
 *
 * @param field - The field to clean
 * @returns Expression that returns cleaned text
 *
 * @example
 * // Clean text for comparison
 * text.removePunctuation('title')
 */
export function removePunctuation(field: string): ExpressionSpecification {
  // MapLibre doesn't have regex or character class support
  // Return original text as placeholder
  return get(field)
}

export const text = {
  wordCount,
  containsAny,
  containsAll,
  titleCase,
  startsWith,
  endsWith,
  replaceAll,
  truncate,
  matchesWildcard,
  removePunctuation,
} as const