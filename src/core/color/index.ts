import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"
import type { NumericExpression } from "../../types"

/**
 * Creates a color value from red, green, and blue components, which must range
 * between 0 and 255, and an alpha component of 1. If any component is out of
 * range, the expression is an error.
 *
 * @param red - The red component (0-255)
 * @param green - The green component (0-255)
 * @param blue - The blue component (0-255)
 * @returns An expression that returns an RGB color
 *
 * @see [MapLibre Style Specification - rgb](https://maplibre.org/maplibre-style-spec/expressions/#rgb)
 *
 * @example
 * ```ts
 * expr.color.rgb(255, 0, 0); // ["rgb", 255, 0, 0] -> red color
 * ```
 */
export function rgb(
  red: NumericExpression,
  green: NumericExpression,
  blue: NumericExpression,
): ["rgb", NumericExpression, NumericExpression, NumericExpression] {
  return ["rgb", red, green, blue] satisfies ExpressionSpecification
}

/**
 * Creates a color value from red, green, blue, and alpha components, which must
 * range between 0 and 255, and an alpha component between 0 and 1. If any
 * component is out of range, the expression is an error.
 *
 * @param red - The red component (0-255)
 * @param green - The green component (0-255)
 * @param blue - The blue component (0-255)
 * @param alpha - The alpha component (0-1)
 * @returns An expression that returns an RGBA color
 *
 * @see [MapLibre Style Specification - rgba](https://maplibre.org/maplibre-style-spec/expressions/#rgba)
 *
 * @example
 * ```ts
 * expr.color.rgba(255, 0, 0, 0.5); // ["rgba", 255, 0, 0, 0.5] -> semi-transparent red
 * ```
 */
export function rgba(
  red: NumericExpression,
  green: NumericExpression,
  blue: NumericExpression,
  alpha: NumericExpression,
): ["rgba", NumericExpression, NumericExpression, NumericExpression, NumericExpression] {
  return ["rgba", red, green, blue, alpha] satisfies ExpressionSpecification
}

/**
 * Color expressions for MapLibre Style Specification.
 *
 * @see [MapLibre Style Specification - Color](https://maplibre.org/maplibre-style-spec/expressions/#color)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * // Create an RGB color
 * expr.color.rgb(255, 0, 0); // ["rgb", 255, 0, 0]
 *
 * // Create an RGBA color with transparency
 * expr.color.rgba(255, 0, 0, 0.5); // ["rgba", 255, 0, 0, 0.5]
 * ```
 */
export const color = {
  rgb,
  rgba,
} as const
