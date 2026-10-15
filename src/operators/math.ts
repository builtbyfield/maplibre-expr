import type { GeoJSON } from "geojson"
import type { Expr, NumberInput } from "../expr"

import { op } from "../internal"

/**
 * Sum of the inputs. MapLibre `+`.
 *
 * @example add(get("a"), get("b"), 1) // ["+", ["get", "a"], ["get", "b"], 1]
 * @see https://maplibre.org/maplibre-style-spec/expressions/#_8
 */
export function add(...inputs: [NumberInput, NumberInput, ...NumberInput[]]): Expr<number> {
  return op("+", ...inputs)
}

/**
 * Product of the inputs. MapLibre `*`.
 *
 * @example multiply(get("height"), 2) // ["*", ["get", "height"], 2]
 * @see https://maplibre.org/maplibre-style-spec/expressions/#_9
 */
export function multiply(...inputs: [NumberInput, NumberInput, ...NumberInput[]]): Expr<number> {
  return op("*", ...inputs)
}

/**
 * `a - b`, or `-a` when called with one argument. MapLibre `-`.
 *
 * @example subtract(get("max"), get("min")) // ["-", ["get", "max"], ["get", "min"]]
 * @example subtract(get("depth")) // ["-", ["get", "depth"]] (negation)
 * @see https://maplibre.org/maplibre-style-spec/expressions/#-
 */
export function subtract(a: NumberInput, b?: NumberInput): Expr<number> {
  return op("-", a, b)
}

/**
 * `a / b`. MapLibre `/`.
 *
 * @example divide(get("population"), get("area")) // ["/", ["get", "population"], ["get", "area"]]
 * @see https://maplibre.org/maplibre-style-spec/expressions/#_10
 */
export function divide(a: NumberInput, b: NumberInput): Expr<number> {
  return op("/", a, b)
}

/**
 * Remainder of `a / b`. MapLibre `%`.
 *
 * @example mod(get("id"), 2) // ["%", ["get", "id"], 2]
 * @see https://maplibre.org/maplibre-style-spec/expressions/#_11
 */
export function mod(a: NumberInput, b: NumberInput): Expr<number> {
  return op("%", a, b)
}

/**
 * `base` raised to `exponent`. MapLibre `^`.
 *
 * @example pow(2, zoom()) // ["^", 2, ["zoom"]]
 * @see https://maplibre.org/maplibre-style-spec/expressions/#_12
 */
export function pow(base: NumberInput, exponent: NumberInput): Expr<number> {
  return op("^", base, exponent)
}

/**
 * Square root. MapLibre `sqrt`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#sqrt
 */
export function sqrt(input: NumberInput): Expr<number> {
  return op("sqrt", input)
}

/**
 * Base-10 logarithm. MapLibre `log10`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#log10
 */
export function log10(input: NumberInput): Expr<number> {
  return op("log10", input)
}

/**
 * Natural logarithm. MapLibre `ln`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#ln
 */
export function ln(input: NumberInput): Expr<number> {
  return op("ln", input)
}

/**
 * Base-2 logarithm. MapLibre `log2`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#log2
 */
export function log2(input: NumberInput): Expr<number> {
  return op("log2", input)
}

/**
 * Sine of an angle in radians. MapLibre `sin`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#sin
 */
export function sin(radians: NumberInput): Expr<number> {
  return op("sin", radians)
}

/**
 * Cosine of an angle in radians. MapLibre `cos`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#cos
 */
export function cos(radians: NumberInput): Expr<number> {
  return op("cos", radians)
}

/**
 * Tangent of an angle in radians. MapLibre `tan`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#tan
 */
export function tan(radians: NumberInput): Expr<number> {
  return op("tan", radians)
}

/**
 * Arcsine, in radians. MapLibre `asin`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#asin
 */
export function asin(input: NumberInput): Expr<number> {
  return op("asin", input)
}

/**
 * Arccosine, in radians. MapLibre `acos`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#acos
 */
export function acos(input: NumberInput): Expr<number> {
  return op("acos", input)
}

/**
 * Arctangent, in radians. MapLibre `atan`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#atan
 */
export function atan(input: NumberInput): Expr<number> {
  return op("atan", input)
}

/**
 * Smallest of the inputs. MapLibre `min`.
 *
 * @example min(get("value"), 100) // ["min", ["get", "value"], 100]
 * @see https://maplibre.org/maplibre-style-spec/expressions/#min
 */
export function min(...inputs: [NumberInput, ...NumberInput[]]): Expr<number> {
  return op("min", ...inputs)
}

/**
 * Largest of the inputs. MapLibre `max`.
 *
 * @example max(get("value"), 0) // ["max", ["get", "value"], 0]
 * @see https://maplibre.org/maplibre-style-spec/expressions/#max
 */
export function max(...inputs: [NumberInput, ...NumberInput[]]): Expr<number> {
  return op("max", ...inputs)
}

/**
 * Rounds to the nearest integer; halfway values round away from zero
 * (`-1.5` becomes `-2`). MapLibre `round`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#round
 */
export function round(input: NumberInput): Expr<number> {
  return op("round", input)
}

/**
 * Absolute value. MapLibre `abs`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#abs
 */
export function abs(input: NumberInput): Expr<number> {
  return op("abs", input)
}

/**
 * Smallest integer greater than or equal to the input. MapLibre `ceil`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#ceil
 */
export function ceil(input: NumberInput): Expr<number> {
  return op("ceil", input)
}

/**
 * Largest integer less than or equal to the input. MapLibre `floor`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#floor
 */
export function floor(input: NumberInput): Expr<number> {
  return op("floor", input)
}

/**
 * Shortest distance in meters between the evaluated feature and the given
 * geometry. Supports Point, MultiPoint, LineString, MultiLineString, Polygon
 * and MultiPolygon (and Features / FeatureCollections of them).
 * MapLibre `distance`.
 *
 * @example lt(distance({ type: "Point", coordinates: [-73.98, 40.75] }), 1000)
 * @see https://maplibre.org/maplibre-style-spec/expressions/#distance
 */
export function distance(geojson: GeoJSON): Expr<number> {
  return op("distance", geojson)
}

/**
 * The mathematical constant ln(2). MapLibre `ln2`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#ln2
 */
export function ln2(): Expr<number> {
  return op("ln2")
}

/**
 * The mathematical constant pi. MapLibre `pi`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#pi
 */
export function pi(): Expr<number> {
  return op("pi")
}

/**
 * The mathematical constant e. MapLibre `e`.
 * @see https://maplibre.org/maplibre-style-spec/expressions/#e
 */
export function e(): Expr<number> {
  return op("e")
}
