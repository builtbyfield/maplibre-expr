import type { Color, ColorInput, Expr, NumberInput } from "../expr"

import { op } from "../internal"

/**
 * A color from red, green and blue components (0-255). MapLibre `rgb`.
 *
 * @example rgb(255, multiply(get("score"), 2.55), 0)
 * @see https://maplibre.org/maplibre-style-spec/expressions/#rgb
 */
export function rgb(red: NumberInput, green: NumberInput, blue: NumberInput): Expr<Color> {
  return op("rgb", red, green, blue)
}

/**
 * A color from red, green, blue (0-255) and alpha (0-1) components.
 * MapLibre `rgba`.
 *
 * @example rgba(0, 0, 0, 0.5)
 * @see https://maplibre.org/maplibre-style-spec/expressions/#rgba
 */
export function rgba(red: NumberInput, green: NumberInput, blue: NumberInput, alpha: NumberInput): Expr<Color> {
  return op("rgba", red, green, blue, alpha)
}

/**
 * The `[r, g, b, a]` components of a color: r, g, b in 0-255, a in 0-1.
 * MapLibre `to-rgba`.
 *
 * @example at(3, toRgba(get("color"))) // the alpha channel
 * @see https://maplibre.org/maplibre-style-spec/expressions/#to-rgba
 */
export function toRgba(color: ColorInput): Expr<readonly [number, number, number, number]> {
  return op("to-rgba", color)
}
