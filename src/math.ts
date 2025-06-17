import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

type NumericExpression = number | ExpressionSpecification

/**
 * Returns mathematical constant ln(2).
 *
 * @returns An expression that returns ln(2).
 *
 * @example
 * expr.ln2(); // ["ln2"] -> 0.6931471805599453
 */
export function ln2() {
  return ["ln2"] satisfies ExpressionSpecification
}

/**
 * Returns mathematical constant pi.
 *
 * @returns An expression that returns pi.
 *
 * @example
 * expr.pi(); // ["pi"] -> 3.141592653589793
 */
export function pi() {
  return ["pi"] satisfies ExpressionSpecification
}

/**
 * Returns mathematical constant e.
 *
 * @returns An expression that returns e.
 *
 * @example
 * expr.e(); // ["e"] -> 2.718281828459045
 */
export function e() {
  // TODO: Figure out why 'e' is not included in the types
  // @ts-expect-error: e isn't included in MapLibre GL Style Spec types for some reason
  return ["e"] satisfies ExpressionSpecification
}

/**
 * Add two or more numbers or expressions to return their sum.
 *
 * @param numbers - The numbers or expressions to add.
 * @returns An expression that returns the sum of the numbers or expressions.
 *
 * @example
 * expr.sum(1, 2, 3); // ["+", 1, 2, 3] -> 6
 * expr.sum(expr.get("a"), expr.get("b")); // ["+", ["get", "a"], ["get", "b"]]
 */
export function sum(...numbers: Array<NumericExpression>) {
  if (numbers.length < 1) {
    throw new Error("sum (+) operation requires at least one argument")
  }
  return ["+", ...numbers] satisfies ExpressionSpecification
}

/**
 * Multiply two or more numbers or expressions to return their product.
 *
 * @param numbers - The numbers or expressions to multiply.
 * @returns An expression that returns the product of the numbers or expressions.
 *
 * @example
 * expr.multiply(2, 3); // ["*", 2, 3] -> 6
 * expr.multiply(expr.get("a"), expr.get("b")); // ["*", ["get", "a"], ["get", "b"]]
 */
export function multiply(...numbers: Array<NumericExpression>) {
  if (numbers.length < 2) {
    throw new Error("multiply requires at least two arguments")
  }
  const first = numbers[0]
  const second = numbers[1]
  const rest = numbers.slice(2)
  return ["*", first, second, ...rest] satisfies ExpressionSpecification
}

/**
 * For two inputs, returns the result of subtracting the second input from the
 * first. For a single input, returns the result of subtracting it from 0.
 *
 * @param a - The first number or expression.
 * @param b - The second number or expression.
 * @returns An expression that returns the difference between the two numbers or expressions.
 *
 * @example
 * expr.subtract(5); // ["-", 5] -> -5
 * expr.subtract(5, 3); // ["-", 5, 3] -> 2
 * expr.subtract(expr.get("a"), expr.get("b")); // ["-", ["get", "a"], ["get", "b"]]
 */
export function subtract(a: NumericExpression, b?: NumericExpression) {
  if (b === undefined) {
    return ["-", a] satisfies ExpressionSpecification
  }
  return ["-", a, b] satisfies ExpressionSpecification
}

/**
 * Divide two numbers or expressions.
 *
 * @param numerator - The numerator number or expression.
 * @param denominator - The denominator number or expression.
 * @returns An expression that returns the quotient of the two numbers or expressions.
 *
 * @example
 * expr.divide(6, 3); // ["/", 6, 3] -> 2
 * expr.divide(expr.get("a"), expr.get("b")); // ["/", ["get", "a"], ["get", "b"]]
 */
export function divide(
  numerator: NumericExpression,
  denominator: NumericExpression,
) {
  return ["/", numerator, denominator] satisfies ExpressionSpecification
}

/**
 * Returns the remainder after integer division of the first input by the second.
 *
 * @param a - The dividend number or expression.
 * @param b - The divisor number or expression.
 * @returns An expression that returns the remainder.
 *
 * @example
 * expr.mod(10, 3); // ["%", 10, 3] -> 1
 * expr.mod(expr.get("a"), expr.get("b")); // ["%", ["get", "a"], ["get", "b"]]
 */
export function mod(dividend: NumericExpression, divisor: NumericExpression) {
  return ["%", dividend, divisor] satisfies ExpressionSpecification
}

/**
 * Raise a number or expression to a power.
 *
 * @param base - The base number or expression.
 * @param exp - The exponent number or expression.
 * @returns An expression that returns the base raised to the power of the exponent.
 *
 * @example
 * expr.pow(2, 3); // ["^", 2, 3] -> 8
 * expr.pow(expr.get("a"), expr.get("b")); // ["^", ["get", "a"], ["get", "b"]]
 */
export function pow(base: NumericExpression, exp: NumericExpression) {
  return ["^", base, exp] satisfies ExpressionSpecification
}

/**
 * Returns the square root of the input.
 *
 * @param value - The number or expression.
 * @returns An expression that returns the square root.
 *
 * @example
 * expr.sqrt(9); // ["sqrt", 9] -> 3
 * expr.sqrt(expr.get("a")); // ["sqrt", ["get", "a"]]
 */
export function sqrt(value: NumericExpression) {
  return ["sqrt", value] satisfies ExpressionSpecification
}

/**
 * Returns the base-ten logarithm of the input.
 *
 * @param value - The number or expression.
 * @returns An expression that returns the base-ten logarithm.
 *
 * @example
 * expr.log10(100); // ["log10", 100] -> 2
 */
export function log10(value: NumericExpression) {
  return ["log10", value] satisfies ExpressionSpecification
}

/**
 * Returns the natural logarithm of the input.
 *
 * @param value - The number or expression.
 * @returns An expression that returns the natural logarithm.
 *
 * @example
 * expr.ln(Math.E); // ["ln", 2.718281828459045] -> 1
 */
export function ln(value: NumericExpression) {
  return ["ln", value] satisfies ExpressionSpecification
}

/**
 * Returns the base-two logarithm of the input.
 *
 * @param value - The number or expression.
 * @returns An expression that returns the base-two logarithm.
 *
 * @example
 * expr.log2(8); // ["log2", 8] -> 3
 */
export function log2(value: NumericExpression) {
  return ["log2", value] satisfies ExpressionSpecification
}

/**
 * Returns the sine of the input.
 *
 * @param value - The number or expression in radians.
 * @returns An expression that returns the sine.
 *
 * @example
 * expr.sin(Math.PI / 2); // ["sin", 1.5707963267948966] -> 1
 */
export function sin(value: NumericExpression) {
  return ["sin", value] satisfies ExpressionSpecification
}

/**
 * Returns the cosine of the input.
 *
 * @param value - The number or expression in radians.
 * @returns An expression that returns the cosine.
 *
 * @example
 * expr.cos(0); // ["cos", 0] -> 1
 */
export function cos(value: NumericExpression) {
  return ["cos", value] satisfies ExpressionSpecification
}

/**
 * Returns the tangent of the input.
 *
 * @param value - The number or expression in radians.
 * @returns An expression that returns the tangent.
 *
 * @example
 * expr.tan(Math.PI / 4); // ["tan", 0.7853981633974483] -> 1
 */
export function tan(value: NumericExpression) {
  return ["tan", value] satisfies ExpressionSpecification
}

/**
 * Returns the arcsine of the input.
 *
 * @param value - The number or expression.
 * @returns An expression that returns the arcsine in radians.
 *
 * @example
 * expr.asin(1); // ["asin", 1] -> 1.5707963267948966 (π/2)
 */
export function asin(value: NumericExpression) {
  return ["asin", value] satisfies ExpressionSpecification
}

/**
 * Returns the arccosine of the input.
 *
 * @param value - The number or expression.
 * @returns An expression that returns the arccosine in radians.
 *
 * @example
 * expr.acos(1); // ["acos", 1] -> 0
 */
export function acos(value: NumericExpression) {
  return ["acos", value] satisfies ExpressionSpecification
}

/**
 * Returns the arctangent of the input.
 *
 * @param value - The number or expression.
 * @returns An expression that returns the arctangent in radians.
 *
 * @example
 * expr.atan(1); // ["atan", 1] -> 0.7853981633974483 (π/4)
 */
export function atan(value: NumericExpression) {
  return ["atan", value] satisfies ExpressionSpecification
}

/**
 * Returns the minimum value of the inputs.
 *
 * @param firstNumber - The first number or expression to compare.
 * @param numbers - The numbers or expressions to compare.
 * @returns An expression that returns the minimum value.
 *
 * @example
 * expr.min(1, 2, 3); // ["min", 1, 2, 3] -> 1
 */
export function min(...numbers: Array<NumericExpression>) {
  if (numbers.length < 1) {
    throw new Error("min requires at least one argument")
  }
  const first = numbers[0]
  const rest = numbers.slice(1)
  return ["min", first, ...rest] satisfies ExpressionSpecification
}

/**
 * Returns the maximum value of the inputs.
 *
 * @param numbers - The numbers or expressions to compare.
 * @returns An expression that returns the maximum value.
 *
 * @example
 * expr.max(1, 2, 3); // ["max", 1, 2, 3] -> 3
 */
export function max(...numbers: Array<NumericExpression>) {
  if (numbers.length < 1) {
    throw new Error("max requires at least one argument")
  }
  const first = numbers[0]
  const rest = numbers.slice(1)
  return ["max", first, ...rest] satisfies ExpressionSpecification
}

/**
 * Rounds the input to the nearest integer.
 *
 * @param value - The number or expression to round.
 * @returns An expression that returns the rounded value.
 *
 * @example
 * expr.round(1.5); // ["round", 1.5] -> 2
 */
export function round(value: NumericExpression) {
  return ["round", value] satisfies ExpressionSpecification
}

/**
 * Returns the absolute value of the input.
 *
 * @param value - The number or expression.
 * @returns An expression that returns the absolute value.
 *
 * @example
 * expr.abs(-1.5); // ["abs", -1.5] -> 1.5
 */
export function abs(value: NumericExpression) {
  return ["abs", value] satisfies ExpressionSpecification
}

/**
 * Returns the smallest integer greater than or equal to the input.
 *
 * @param value - The number or expression.
 * @returns An expression that returns the ceiling value.
 *
 * @example
 * expr.ceil(1.5); // ["ceil", 1.5] -> 2
 */
export function ceil(value: NumericExpression) {
  return ["ceil", value] satisfies ExpressionSpecification
}

/**
 * Returns the largest integer less than or equal to the input.
 *
 * @param value - The number or expression.
 * @returns An expression that returns the floor value.
 *
 * @example
 * expr.floor(1.5); // ["floor", 1.5] -> 1
 */
export function floor(value: NumericExpression) {
  return ["floor", value] satisfies ExpressionSpecification
}

/**
 * Returns the shortest distance in meters between the evaluated feature and the
 * input geometry. The input value can be a valid GeoJSON of type `Point`,
 * `MultiPoint`, `LineString`, `MultiLineString`, `Polygon`, `MultiPolygon`,
 * `Feature`, or `FeatureCollection`.
 *
 * Distance values returned may vary in precision due to loss in precision from
 * encoding geometries, particularly below zoom level 13.
 *
 * @param geometry - The GeoJSON geometry to calculate distance to.
 * @returns An expression that returns the distance in meters.
 *
 * @example
 * expr.distance({ type: "Point", coordinates: [0, 0] }); // ["distance", {"type": "Point", "coordinates": [0, 0]}]
 */
export function distance(
  geometry:
    | GeoJSON.Point
    | GeoJSON.MultiPoint
    | GeoJSON.LineString
    | GeoJSON.MultiLineString
    | GeoJSON.Polygon
    | GeoJSON.MultiPolygon
    | GeoJSON.Feature
    | GeoJSON.FeatureCollection
    | ExpressionSpecification,
) {
  return [
    "distance",
    geometry as Record<string, unknown> | ExpressionSpecification,
  ] satisfies ExpressionSpecification
}

export const math = {
  ln2,
  pi,
  e,
  sum,
  multiply,
  subtract,
  divide,
  mod,
  pow,
  sqrt,
  log10,
  ln,
  log2,
  sin,
  cos,
  tan,
  asin,
  acos,
  atan,
  min,
  max,
  round,
  abs,
  ceil,
  floor,
  distance,
}
