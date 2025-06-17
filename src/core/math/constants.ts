import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

/**
 * Returns mathematical constant ln(2) (natural logarithm of 2).
 *
 * @returns An expression that returns ln(2) (~0.6931471805599453).
 *
 * @see [MapLibre Style Specification - ln2](https://maplibre.org/maplibre-style-spec/expressions/#ln2)
 *
 * @example
 * ```ts
 * expr.ln2(); // ["ln2"] -> ~0.6931471805599453
 * ```
 */
export function ln2() {
  return ["ln2"] satisfies ExpressionSpecification
}

/**
 * Returns mathematical constant pi (π).
 *
 * @returns An expression that returns pi (~3.141592653589793).
 *
 * @see [MapLibre Style Specification - pi](https://maplibre.org/maplibre-style-spec/expressions/#pi)
 *
 * @example
 * ```ts
 * expr.pi(); // ["pi"] -> ~3.141592653589793
 * ```
 */
export function pi() {
  return ["pi"] satisfies ExpressionSpecification
}

/**
 * Returns mathematical constant e (Euler's number).
 *
 * @returns An expression that returns e (~2.718281828459045).
 *
 * @see [MapLibre Style Specification - e](https://maplibre.org/maplibre-style-spec/expressions/#e)
 *
 * @example
 * ```ts
 * expr.e(); // ["e"] -> ~2.718281828459045
 * ```
 */
export function e(): ExpressionSpecification {
  // TODO: Figure out why 'e' is not included in the types
  // @ts-expect-error: e isn't included in MapLibre GL Style Spec types for some reason
  return ["e"] satisfies ExpressionSpecification
}

/**
 * Creates mathematical constant expressions for MapLibre styles
 *
 * @see [MapLibre Style Specification - Math](https://maplibre.org/maplibre-style-spec/expressions/#math)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * expr.ln2() // ["ln2"] -> ~0.6931471805599453
 * expr.pi() // ["pi"] -> ~3.141592653589793
 * expr.e() // ["e"] -> ~2.718281828459045
 * ```
 */
export const constants = {
  ln2,
  pi,
  e,
} as const
