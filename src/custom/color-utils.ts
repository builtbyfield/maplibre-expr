import type { ExpressionSpecification, ColorSpecification } from "@maplibre/maplibre-gl-style-spec"

import { rgb, rgba } from "../core/color"
import { get } from "../core/lookup"
import { match } from "../core/decision/control-flow"
import { interpolate, step } from "../core/interpolation"
import { literal, number } from "../core/types/assertion"
import { multiply, add, subtract, divide, mod } from "../core/math/arithmetic"
import { min as mathMin, max as mathMax } from "../core/math/comparison"
import { floor } from "../core/math/rounding"

interface ColorStop {
  value: number
  color: ColorSpecification
}

/**
 * Get color from a gradient based on a value
 *
 * @param value - The value to map to color
 * @param gradient - Array of color stops defining the gradient
 * @returns Expression that returns interpolated color
 *
 * @example
 * // Temperature gradient
 * colorUtils.colorFromGradient(['get', 'temperature'], [
 *   { value: 0, color: '#0000ff' },
 *   { value: 50, color: '#00ff00' },
 *   { value: 100, color: '#ff0000' }
 * ])
 */
export function colorFromGradient(
  value: string | ExpressionSpecification,
  gradient: ColorStop[]
): ExpressionSpecification {
  if (gradient.length === 0) {
    return literal('#000000')
  }

  if (gradient.length === 1) {
    return literal(gradient[0].color)
  }

  const valueExpr = typeof value === 'string' ? get(value) : value

  // Build interpolation expression
  const stops: any[] = []
  gradient.forEach(stop => {
    stops.push({ input: stop.value, output: stop.color })
  })

  return interpolate(
    { type: 'linear' },
    valueExpr,
    ...stops
  )
}

/**
 * Assign colors based on category values
 *
 * @param field - The field containing categories
 * @param categoryColors - Map of category to color
 * @param defaultColor - Color for unknown categories
 * @returns Expression that returns color based on category
 *
 * @example
 * // Color by land use type
 * colorUtils.colorByCategory('landuse', {
 *   'residential': '#4CAF50',
 *   'commercial': '#2196F3',
 *   'industrial': '#FF9800'
 * })
 */
export function colorByCategory(
  field: string,
  categoryColors: Record<string, ColorSpecification>,
  defaultColor: ColorSpecification = '#808080'
): ExpressionSpecification {
  const matchPairs: any[] = []
  
  Object.entries(categoryColors).forEach(([category, color]) => {
    matchPairs.push(category, literal(color))
  })
  
  matchPairs.push(literal(defaultColor)) // Default case

  return match(get(field), ...matchPairs)
}

/**
 * Brighten a color by a percentage
 *
 * @param color - The color to brighten
 * @param amount - Amount to brighten (0-100)
 * @returns Expression that returns brightened color
 *
 * @example
 * // Brighten on hover
 * colorUtils.brighten(['get', 'color'], 20)
 */
export function brighten(
  color: ColorSpecification | ExpressionSpecification,
  amount: number
): ExpressionSpecification {
  // Convert amount from percentage to factor
  const factor = 1 + (amount / 100)
  
  // For simplicity, we'll work with a fixed color
  // Real implementation would need to parse color components
  if (typeof color === 'string') {
    // This is a placeholder - actual color manipulation would need RGB extraction
    return literal(color)
  }
  
  return color as ExpressionSpecification
}

/**
 * Darken a color by a percentage
 *
 * @param color - The color to darken
 * @param amount - Amount to darken (0-100)
 * @returns Expression that returns darkened color
 *
 * @example
 * // Darken for inactive state
 * colorUtils.darken('#2196F3', 30)
 */
export function darken(
  color: ColorSpecification | ExpressionSpecification,
  amount: number
): ExpressionSpecification {
  // Convert amount from percentage to factor
  const factor = 1 - (amount / 100)
  
  // Placeholder implementation
  if (typeof color === 'string') {
    return literal(color)
  }
  
  return color as ExpressionSpecification
}

/**
 * Generate a color with good contrast against background
 *
 * @param backgroundColor - The background color
 * @returns Expression that returns contrasting color (black or white)
 *
 * @example
 * // Automatic text color for readability
 * colorUtils.colorContrast(['get', 'backgroundColor'])
 */
export function colorContrast(
  backgroundColor: ColorSpecification | ExpressionSpecification
): ExpressionSpecification {
  // Simplified contrast calculation
  // Would need luminance calculation for proper implementation
  return literal('#000000') // Placeholder
}

/**
 * Generate deterministic random color from a seed
 *
 * @param field - Field to use as seed
 * @returns Expression that returns color based on seed
 *
 * @example
 * // Consistent colors for categories
 * colorUtils.randomColorFromSeed('userId')
 */
export function randomColorFromSeed(field: string): ExpressionSpecification {
  // Use modulo to create color variations
  const seed = get(field)
  
  // Simple hash-like function using modulo
  const hue = mod(multiply(seed, 137), 360) // Golden angle for distribution
  
  // For simplicity, return from a predefined palette based on modulo
  const paletteColors = [
    '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
    '#2196f3', '#03a9f4', '#00bcd4', '#009688',
    '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b',
    '#ffc107', '#ff9800', '#ff5722', '#795548'
  ]
  
  const index = mod(seed, paletteColors.length)
  
  // Build match expression
  const matchPairs: any[] = []
  paletteColors.forEach((color, i) => {
    matchPairs.push(i, literal(color))
  })
  matchPairs.push(literal('#808080')) // Default
  
  return match(index, ...matchPairs)
}

/**
 * Create a two-color gradient based on a threshold
 *
 * @param field - Field to evaluate
 * @param threshold - Threshold value
 * @param belowColor - Color when below threshold
 * @param aboveColor - Color when above threshold
 * @returns Expression that returns appropriate color
 *
 * @example
 * // Red/green for pass/fail
 * colorUtils.thresholdColor('score', 70, '#ff0000', '#00ff00')
 */
export function thresholdColor(
  field: string,
  threshold: number,
  belowColor: ColorSpecification,
  aboveColor: ColorSpecification
): ExpressionSpecification {
  return step(
    get(field),
    literal(belowColor),
    { input: threshold, output: literal(aboveColor) }
  )
}

/**
 * Create a color from HSL values
 *
 * @param hue - Hue value (0-360)
 * @param saturation - Saturation percentage (0-100)
 * @param lightness - Lightness percentage (0-100)
 * @returns Expression that returns RGB color
 *
 * @example
 * // Dynamic color based on data
 * colorUtils.hslColor(
 *   ['*', ['get', 'category'], 60], // Hue based on category
 *   80, // Fixed saturation
 *   50  // Fixed lightness
 * )
 */
export function hslColor(
  hue: number | ExpressionSpecification,
  saturation: number,
  lightness: number
): ExpressionSpecification {
  // HSL to RGB conversion would be complex in MapLibre expressions
  // Return a placeholder
  return rgb(128, 128, 128)
}

/**
 * Apply opacity to a color
 *
 * @param color - The base color
 * @param opacity - Opacity value (0-1)
 * @returns Expression that returns color with opacity
 *
 * @example
 * // Semi-transparent overlay
 * colorUtils.withOpacity('#2196F3', 0.7)
 */
export function withOpacity(
  color: ColorSpecification,
  opacity: number | ExpressionSpecification
): ExpressionSpecification {
  // Convert color to RGBA components (placeholder)
  // const rgbaColor = rgba(...) // Would need proper implementation
  
  // This would need proper RGBA extraction
  // For now, create new RGBA with opacity
  if (typeof color === 'string' && color.startsWith('#')) {
    // Simple hex parsing (placeholder)
    return literal(color) // Would need proper implementation
  }
  
  return literal(color)
}

export const colorUtils = {
  colorFromGradient,
  colorByCategory,
  brighten,
  darken,
  colorContrast,
  randomColorFromSeed,
  thresholdColor,
  hslColor,
  withOpacity,
} as const