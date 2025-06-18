import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

import {
  concat,
  divide,
  floor,
  get,
  greaterOrEqual,
  literal,
  multiply,
  numberFormat,
  round,
} from "../core"

type DistanceUnit = "meters" | "kilometers" | "feet" | "miles" | "yards"
type TemperatureUnit = "celsius" | "fahrenheit" | "kelvin"
type SpeedUnit = "mps" | "kph" | "mph" | "knots"

/**
 * Convert between distance units
 *
 * @param field - Field containing the value
 * @param from - Source unit
 * @param to - Target unit
 * @returns Expression that returns converted value
 *
 * @example
 * // Convert meters to miles
 * units.convertDistance('distanceMeters', 'meters', 'miles')
 */
export function convertDistance(
  field: string,
  from: DistanceUnit,
  to: DistanceUnit,
): ExpressionSpecification {
  const value = get(field)

  // Conversion factors to meters
  const toMeters: Record<DistanceUnit, number> = {
    meters: 1,
    kilometers: 1000,
    feet: 0.3048,
    miles: 1609.344,
    yards: 0.9144,
  }

  // Convert to meters first, then to target unit
  const inMeters = multiply(value, toMeters[from])
  return divide(inMeters, toMeters[to])
}

/**
 * Format distance with appropriate unit
 *
 * @param meters - Distance in meters
 * @param imperial - Use imperial units (default: false)
 * @returns Expression that returns formatted string
 *
 * @example
 * // Format distance for display
 * units.formatDistance(['get', 'distance'], true) // "2.5 mi"
 */
export function formatDistance(
  meters: number | ExpressionSpecification,
  imperial: boolean = false,
): ExpressionSpecification {
  const distance = typeof meters === "number" ? literal(meters) : meters

  if (imperial) {
    // Convert to miles or feet
    const miles = divide(distance, 1609.344)

    return concat(
      numberFormat(
        round(miles),
        {
          "min-fraction-digits": 1,
          "max-fraction-digits": 1,
        },
      ),
      literal(" mi"),
    )
  }
  else {
    // Use kilometers or meters
    return [
      "case",

      greaterOrEqual(distance, 1000),
      concat(
        numberFormat(
          divide(distance, 1000),
          {
            "min-fraction-digits": 1,
            "max-fraction-digits": 1,
          },
        ),
        literal(" km"),
      ),
      concat(
        numberFormat(round(distance), {}),
        literal(" m"),
      ),
    ] as ExpressionSpecification
  }
}

/**
 * Format duration in human-readable format
 *
 * @param milliseconds - Duration in milliseconds
 * @param format - Format style ('short' | 'long')
 * @returns Expression that returns formatted string
 *
 * @example
 * // Format time duration
 * units.formatDuration(['get', 'elapsed'], 'short') // "2h 30m"
 */
export function formatDuration(
  milliseconds: number | ExpressionSpecification,
  format: "short" | "long" = "short",
): ExpressionSpecification {
  const ms = typeof milliseconds === "number" ? literal(milliseconds) : milliseconds

  // Convert to seconds
  const totalSeconds = divide(ms, 1000)
  const days = floor(divide(totalSeconds, 86400))
  const hours = floor(divide(totalSeconds, 3600))
  const minutes = floor(divide(totalSeconds, 60))

  if (format === "short") {
    // Simple format: show largest unit
    return [
      "case",

      greaterOrEqual(days, 1),
      concat(numberFormat(days, {}), literal("d")),
      greaterOrEqual(hours, 1),
      concat(numberFormat(hours, {}), literal("h")),
      greaterOrEqual(minutes, 1),
      concat(numberFormat(minutes, {}), literal("m")),
      concat(numberFormat(round(totalSeconds), {}), literal("s")),
    ] as ExpressionSpecification
  }
  else {
    // Long format
    return [
      "case",

      greaterOrEqual(days, 1),
      concat(numberFormat(days, {}), literal(" days")),
      greaterOrEqual(hours, 1),
      concat(numberFormat(hours, {}), literal(" hours")),
      greaterOrEqual(minutes, 1),
      concat(numberFormat(minutes, {}), literal(" minutes")),
      concat(numberFormat(round(totalSeconds), {}), literal(" seconds")),
    ] as ExpressionSpecification
  }
}

/**
 * Format file size in human-readable format
 *
 * @param bytes - Size in bytes
 * @returns Expression that returns formatted string
 *
 * @example
 * // Format file sizes
 * units.formatFileSize(['get', 'fileSize']) // "2.5 MB"
 */
export function formatFileSize(
  bytes: number | ExpressionSpecification,
): ExpressionSpecification {
  const size = typeof bytes === "number" ? literal(bytes) : bytes

  const kb = divide(size, 1024)
  const mb = divide(kb, 1024)
  const gb = divide(mb, 1024)

  return [
    "case",

    greaterOrEqual(gb, 1),
    concat(
      numberFormat(
        gb,
        {
          "min-fraction-digits": 1,
          "max-fraction-digits": 1,
        },
      ),
      literal(" GB"),
    ),
    greaterOrEqual(mb, 1),
    concat(
      numberFormat(
        mb,
        {
          "min-fraction-digits": 1,
          "max-fraction-digits": 1,
        },
      ),
      literal(" MB"),
    ),
    greaterOrEqual(kb, 1),
    concat(
      numberFormat(
        kb,
        {
          "min-fraction-digits": 0,
          "max-fraction-digits": 0,
        },
      ),
      literal(" KB"),
    ),
    concat(
      numberFormat(size, {}),
      literal(" B"),
    ),
  ] as ExpressionSpecification
}

/**
 * Format currency with proper symbol and decimals
 *
 * @param amount - The amount to format
 * @param currency - Currency code (USD, EUR, GBP, etc.)
 * @returns Expression that returns formatted currency
 *
 * @example
 * // Format prices
 * units.formatCurrency(['get', 'price'], 'USD') // "$1,234.56"
 */
export function formatCurrency(
  amount: number | ExpressionSpecification,
  currency: string,
): ExpressionSpecification {
  const value = typeof amount === "number" ? literal(amount) : amount

  return numberFormat(value, {
    "currency": currency,
    "min-fraction-digits": 2,
    "max-fraction-digits": 2,
  })
}

/**
 * Convert temperature between units
 *
 * @param field - Field containing temperature
 * @param from - Source unit
 * @param to - Target unit
 * @returns Expression that returns converted temperature
 *
 * @example
 * // Convert Celsius to Fahrenheit
 * units.convertTemperature('temp', 'celsius', 'fahrenheit')
 */
export function convertTemperature(
  field: string,
  from: TemperatureUnit,
  to: TemperatureUnit,
): ExpressionSpecification {
  const value = get(field)

  // Convert to Celsius first
  let celsius: ExpressionSpecification
  switch (from) {
    case "celsius":
      celsius = value
      break
    case "fahrenheit":
      celsius = divide(["number", ["-", value, 32]], 1.8)
      break
    case "kelvin":
      celsius = ["number", ["-", value, 273.15]]
      break
  }

  // Convert from Celsius to target
  switch (to) {
    case "celsius":
      return celsius
    case "fahrenheit":
      return ["number", ["+", multiply(celsius, 1.8), 32]]
    case "kelvin":
      return ["number", ["+", celsius, 273.15]]
  }
}

/**
 * Convert speed between units
 *
 * @param field - Field containing speed
 * @param from - Source unit
 * @param to - Target unit
 * @returns Expression that returns converted speed
 *
 * @example
 * // Convert m/s to mph
 * units.convertSpeed('windSpeed', 'mps', 'mph')
 */
export function convertSpeed(
  field: string,
  from: SpeedUnit,
  to: SpeedUnit,
): ExpressionSpecification {
  const value = get(field)

  // Conversion factors to m/s
  const toMps: Record<SpeedUnit, number> = {
    mps: 1,
    kph: 1 / 3.6,
    mph: 0.44704,
    knots: 0.514444,
  }

  // Convert to m/s first, then to target unit
  const inMps = multiply(value, toMps[from])
  return divide(inMps, toMps[to])
}

/**
 * Format percentage with proper decimals
 *
 * @param value - Value between 0 and 1
 * @param decimals - Number of decimal places
 * @returns Expression that returns formatted percentage
 *
 * @example
 * // Format completion percentage
 * units.formatPercentage(['get', 'completion'], 1) // "75.5%"
 */
export function formatPercentage(
  value: number | ExpressionSpecification,
  decimals: number = 0,
): ExpressionSpecification {
  const val = typeof value === "number" ? literal(value) : value
  const percentage = multiply(val, 100)

  return concat(
    numberFormat(percentage, {
      "min-fraction-digits": decimals,
      "max-fraction-digits": decimals,
    }),
    literal("%"),
  )
}

/**
 * Format coordinates in degrees, minutes, seconds
 *
 * @param degrees - Decimal degrees
 * @param isLatitude - True for latitude, false for longitude
 * @returns Expression that returns formatted coordinates
 *
 * @example
 * // Format GPS coordinates
 * units.formatCoordinates(['get', 'lat'], true) // "37°46'30"N"
 */
export function formatCoordinates(
  degrees: number | ExpressionSpecification,
  isLatitude: boolean,
): ExpressionSpecification {
  const deg = typeof degrees === "number" ? literal(degrees) : degrees

  // This is a simplified version
  // Full DMS conversion would be more complex
  const direction = isLatitude
    ? [
        "case",
        greaterOrEqual(deg, 0),
        literal("N"),
        literal("S"),
      ] as ExpressionSpecification
    : [
        "case",
        greaterOrEqual(deg, 0),
        literal("E"),
        literal("W"),
      ] as ExpressionSpecification

  return concat(
    numberFormat(
      deg,
      {
        "min-fraction-digits": 4,
        "max-fraction-digits": 4,
      },
    ),
    literal("°"),
    direction,
  )
}

export const units = {
  convertDistance,
  formatDistance,
  formatDuration,
  formatFileSize,
  formatCurrency,
  convertTemperature,
  convertSpeed,
  formatPercentage,
  formatCoordinates,
} as const
