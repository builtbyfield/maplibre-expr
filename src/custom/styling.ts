import type { ExpressionSpecification, ColorSpecification } from "@maplibre/maplibre-gl-style-spec"

import { get } from "../core/lookup"
import { literal } from "../core/types/assertion"
import { interpolate, step } from "../core/interpolation"
import { multiply, add, subtract, divide } from "../core/math/arithmetic"
import { sin, cos } from "../core/math/trigonometry"
import { pi } from "../core/math/constants"
import { match } from "../core/decision/control-flow"
import { zoom } from "../core/zoom"
import { heatmapDensity } from "../core/heatmap"

interface OpacityThreshold {
  value: number
  opacity: number
}

interface IconCondition {
  test: ExpressionSpecification
  icon: string
}

interface ColorStop {
  value: number
  color: ColorSpecification
}

/**
 * Scale a value smoothly based on zoom level
 *
 * @param baseValue - Base value at minZoom
 * @param minZoom - Minimum zoom level
 * @param maxZoom - Maximum zoom level
 * @param maxValue - Maximum value at maxZoom (optional)
 * @returns Expression that returns scaled value
 *
 * @example
 * // Scale icon size with zoom
 * styling.scaleByZoom(1, 10, 16, 3)
 */
export function scaleByZoom(
  baseValue: number,
  minZoom: number,
  maxZoom: number,
  maxValue?: number
): ExpressionSpecification {
  const finalMaxValue = maxValue || baseValue * 2
  
  return interpolate(
    { type: "exponential", base: 2 },
    zoom(),
    { input: minZoom, output: baseValue },
    { input: maxZoom, output: finalMaxValue }
  )
}

/**
 * Create a pulsing animation effect
 *
 * @param frequency - Pulse frequency (cycles per unit)
 * @param amplitude - Pulse amplitude (0-1)
 * @param offset - Phase offset
 * @returns Expression that returns animated value
 *
 * @example
 * // Pulsing circle radius
 * styling.pulseAnimation(0.5, 0.3, 0)
 */
export function pulseAnimation(
  frequency: number,
  amplitude: number,
  offset: number = 0
): ExpressionSpecification {
  // Use a time-based or data-based value for animation
  // Since we can't access actual time, use a data field
  const animationField = get("animationTime") // Assumed field
  
  // Create sine wave: amplitude * sin(2π * frequency * time + offset) + 1
  const phase = add(
    multiply(multiply(2, pi()), multiply(frequency, animationField)),
    offset
  )
  
  return add(
    1,
    multiply(amplitude, sin(phase))
  )
}

/**
 * Generate heatmap-style color based on density
 *
 * @param densityField - Field containing density values
 * @param colors - Color stops for the heatmap
 * @returns Expression that returns interpolated color
 *
 * @example
 * // Crime heatmap colors
 * styling.heatmapColor('crimeCount', [
 *   { value: 0, color: '#00ff00' },
 *   { value: 50, color: '#ffff00' },
 *   { value: 100, color: '#ff0000' }
 * ])
 */
export function heatmapColor(
  densityField: string | ExpressionSpecification,
  colors: ColorStop[]
): ExpressionSpecification {
  const density = typeof densityField === 'string' ? get(densityField) : densityField
  
  if (colors.length === 0) {
    return literal('#000000')
  }
  
  const stops = colors.map(stop => ({
    input: stop.value,
    output: stop.color
  }))
  
  return interpolate(
    { type: "linear" },
    density,
    ...stops
  )
}

/**
 * Adjust opacity based on thresholds
 *
 * @param field - Field to evaluate
 * @param thresholds - Array of value-opacity pairs
 * @returns Expression that returns opacity
 *
 * @example
 * // Fade out low-importance features
 * styling.adaptiveOpacity('importance', [
 *   { value: 0, opacity: 0.2 },
 *   { value: 50, opacity: 0.6 },
 *   { value: 100, opacity: 1.0 }
 * ])
 */
export function adaptiveOpacity(
  field: string,
  thresholds: OpacityThreshold[]
): ExpressionSpecification {
  if (thresholds.length === 0) {
    return literal(1)
  }
  
  const value = get(field)
  const stops = thresholds.map(t => ({
    input: t.value,
    output: t.opacity
  }))
  
  return interpolate(
    { type: "linear" },
    value,
    ...stops
  )
}

/**
 * Select icon based on conditions
 *
 * @param conditions - Array of condition-icon pairs
 * @param defaultIcon - Default icon name
 * @returns Expression that returns icon name
 *
 * @example
 * // Dynamic POI icons
 * styling.dynamicIcon([
 *   { test: ['==', ['get', 'type'], 'restaurant'], icon: 'restaurant-15' },
 *   { test: ['==', ['get', 'type'], 'cafe'], icon: 'cafe-15' },
 *   { test: ['==', ['get', 'type'], 'bar'], icon: 'bar-15' }
 * ], 'marker-15')
 */
export function dynamicIcon(
  conditions: IconCondition[],
  defaultIcon: string = 'marker-15'
): ExpressionSpecification {
  if (conditions.length === 0) {
    return literal(defaultIcon)
  }
  
  const cases: any[] = []
  conditions.forEach(condition => {
    cases.push(condition.test, literal(condition.icon))
  })
  cases.push(literal(defaultIcon))
  
  return ["case", ...cases] as ExpressionSpecification
}

/**
 * Create fade-in effect based on zoom
 *
 * @param fadeInStart - Zoom level to start fading in
 * @param fadeInEnd - Zoom level for full opacity
 * @returns Expression that returns opacity
 *
 * @example
 * // Fade in labels from zoom 12 to 14
 * styling.fadeInByZoom(12, 14)
 */
export function fadeInByZoom(
  fadeInStart: number,
  fadeInEnd: number
): ExpressionSpecification {
  return interpolate(
    { type: "linear" },
    zoom(),
    { input: fadeInStart, output: 0 },
    { input: fadeInEnd, output: 1 }
  )
}

/**
 * Create size based on feature density
 *
 * @param baseSize - Base size for single features
 * @param maxSize - Maximum size for dense areas
 * @param densityField - Field containing density or count
 * @returns Expression that returns size
 *
 * @example
 * // Larger circles in dense areas
 * styling.densitySize(5, 20, 'featureCount')
 */
export function densitySize(
  baseSize: number,
  maxSize: number,
  densityField: string
): ExpressionSpecification {
  const density = get(densityField)
  
  return interpolate(
    { type: "exponential", base: 2 },
    density,
    { input: 1, output: baseSize },
    { input: 10, output: multiply(baseSize, 1.5) },
    { input: 50, output: multiply(baseSize, 2) },
    { input: 100, output: maxSize }
  )
}

/**
 * Create stroke width that scales inversely with zoom
 *
 * @param baseWidth - Base width at reference zoom
 * @param referenceZoom - Reference zoom level
 * @returns Expression that returns stroke width
 *
 * @example
 * // Consistent visual stroke width across zooms
 * styling.constantStrokeWidth(2, 12)
 */
export function constantStrokeWidth(
  baseWidth: number,
  referenceZoom: number
): ExpressionSpecification {
  // Width should scale inversely with zoom to maintain visual consistency
  // width = baseWidth * 2^(referenceZoom - currentZoom)
  return multiply(
    baseWidth,
    ["^", 2, subtract(referenceZoom, zoom())]
  )
}

/**
 * Create outline effect with contrasting color
 *
 * @param fillColor - Fill color expression or value
 * @param outlineWidth - Width of outline
 * @returns Object with fill and outline paint properties
 *
 * @example
 * // Text with outline for readability
 * styling.outlineEffect('#ffffff', 2)
 */
export function outlineEffect(
  fillColor: ColorSpecification | ExpressionSpecification,
  outlineWidth: number
): { fillColor: ExpressionSpecification; outlineColor: ExpressionSpecification; outlineWidth: number } {
  const fill = typeof fillColor === 'string' ? literal(fillColor) : fillColor
  
  // Simple contrast - black outline for light colors, white for dark
  // This is simplified - real implementation would calculate luminance
  const outlineColor = literal('#000000') // Placeholder
  
  return {
    fillColor: fill,
    outlineColor,
    outlineWidth
  }
}

/**
 * Create pattern density based on value
 *
 * @param field - Field to base pattern on
 * @param minSpacing - Minimum pattern spacing
 * @param maxSpacing - Maximum pattern spacing
 * @returns Expression that returns pattern spacing
 *
 * @example
 * // Denser patterns for higher values
 * styling.patternDensity('pollution', 5, 20)
 */
export function patternDensity(
  field: string,
  minSpacing: number,
  maxSpacing: number
): ExpressionSpecification {
  const value = get(field)
  
  // Inverse relationship - higher values get smaller spacing (denser pattern)
  return interpolate(
    { type: "linear" },
    value,
    { input: 0, output: maxSpacing },
    { input: 100, output: minSpacing }
  )
}

export const styling = {
  scaleByZoom,
  pulseAnimation,
  heatmapColor,
  adaptiveOpacity,
  dynamicIcon,
  fadeInByZoom,
  densitySize,
  constantStrokeWidth,
  outlineEffect,
  patternDensity,
} as const