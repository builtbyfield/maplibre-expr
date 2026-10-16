/**
 * Evaluate and validate expressions with MapLibre's own expression engine,
 * outside a map. Intended for unit tests, and for checking generated
 * expressions before shipping them in a style.
 *
 * @example
 * import { evaluate } from "@builtbyfield/maplibre-expr/testing"
 *
 * evaluate(add(get("a"), 1), { properties: { a: 2 } }) // 3
 *
 * @module
 */
import type {
  Feature,
  GlobalProperties,
  ICanonicalTileID,
  StyleExpression,
  StylePropertySpecification,
  StyleSpecification,
} from "@maplibre/maplibre-gl-style-spec"

import type { Geometry, Position } from "geojson"

import type { Color as ColorValue, ExprLike, Formatted as FormattedValue, Input, Projection as ProjectionValue, ResolvedImage as ResolvedImageValue } from "./expr"

import type { StylePropertyName } from "./style-properties"

import { Color, ColorArray, createExpression, createPropertyExpression, Formatted, latest, NumberArray, Padding, ProjectionDefinition, ResolvedImage, validateStyleMin } from "@maplibre/maplibre-gl-style-spec"

/** The value type MapLibre should parse the expression as. */
export type ExpectedType
  = | "number"
    | "string"
    | "boolean"
    | "color"
    | "colorArray"
    | "numberArray"
    | "formatted"
    | "resolvedImage"
    | "padding"
    | "projectionDefinition"
    | "array"

/** The feature and map state to evaluate against. All fields are optional. */
export interface EvaluateOptions {
  /** The feature's properties, read by `get`/`has`/`properties`. */
  properties?: object
  /** The feature's id, read by `id`. */
  id?: string | number
  /**
   * The feature's geometry (GeoJSON, lng/lat). Read by `geometry-type`,
   * `within` and `distance`. Defaults to `Point [0, 0]`.
   */
  geometry?: Geometry
  /** Current zoom level. Default `0`. */
  zoom?: number
  /** The feature's state, read by `feature-state`. */
  featureState?: object
  /** The style's global state, read by `global-state`. */
  globalState?: object
  /** Value of `heatmap-density`. */
  heatmapDensity?: number
  /** Value of `line-progress`. */
  lineProgress?: number
  /** Value of `elevation`. */
  elevation?: number
  /** Value of `accumulated`. */
  accumulated?: unknown
  /** Image names to treat as present in the sprite (for `image`). Default: none. */
  availableImages?: string[]
  /**
   * Parse the expression as producing this type, the way a style property
   * of that type would. Needed when the type is ambiguous, e.g. `"#f00"` is
   * a string unless parsed as a `"color"`. If omitted and the expression
   * fails to parse, `"color"`, `"projectionDefinition"` and `"colorArray"`
   * are tried in turn before giving up, since ramps of those are the common
   * ambiguous cases.
   */
  type?: ExpectedType
}

/** Text section of an evaluated `format` expression. */
export interface EvaluatedSection {
  text: string
  image: string | null
  scale: number | null
  fontStack: string | null
  textColor: string | null
  verticalAlign: "bottom" | "center" | "top" | null
}

/** An evaluated projection: a blend between two projections. */
export interface EvaluatedProjection {
  from: string
  to: string
  /** 0 is fully `from`, 1 is fully `to`. */
  transition: number
}

/**
 * What an expression producing `T` evaluates to in JavaScript. Colors become
 * `"rgba(r,g,b,a)"` strings, images their names, formatted text a list of
 * sections, projections `{ from, to, transition }`.
 */
export type Evaluated<T>
  = T extends ColorValue ? string
    : T extends ProjectionValue ? EvaluatedProjection
      : T extends ResolvedImageValue ? string
        : T extends FormattedValue ? EvaluatedSection[]
          : T extends readonly (infer U)[] ? Evaluated<U>[]
            : T

/** Thrown when an expression fails to parse or to evaluate. */
export class ExpressionError extends Error {
  /** One message per problem, each prefixed with the path into the expression. */
  readonly errors: readonly string[]

  constructor(message: string, errors: readonly string[]) {
    super(`${message}:\n${errors.map(e => `  - ${e}`).join("\n")}`)
    this.name = "ExpressionError"
    this.errors = errors
  }
}

/** Result of {@link validate}. */
export type ValidationResult = { valid: true, errors: [] } | { valid: false, errors: string[] }

const GEOMETRY_TYPES: Record<Geometry["type"], 1 | 2 | 3> = {
  Point: 1,
  MultiPoint: 1,
  LineString: 2,
  MultiLineString: 2,
  Polygon: 3,
  MultiPolygon: 3,
  GeometryCollection: 1,
}

// `within` and `distance` round to integer tile units; z20 keeps that precise.
const EXTENT = 8192
const CANONICAL_ZOOM = 20
const WORLD_SIZE = EXTENT * 2 ** CANONICAL_ZOOM
const CANONICAL = { z: CANONICAL_ZOOM, x: 0, y: 0, key: "canonical" } as ICanonicalTileID

export type { StylePropertyName } from "./style-properties"

/** Options of {@link validate}. */
export interface ValidateOptions {
  /**
   * Check the expression as the value of this layer property (or as a layer
   * `filter`), with MapLibre's style validator. This is the most complete
   * check: it also catches data expressions in properties that don't support
   * them, `zoom` outside a top-level ramp, and `feature-state` in filters
   * and layout properties.
   */
  property?: StylePropertyName | "filter"
  /** Check the expression as producing this type. Ignored if `property` is given. */
  type?: ExpectedType
}

/**
 * Checks that an expression parses, without evaluating it. Pass `property`
 * to check it where it will be used; without it, rules that depend on the
 * property (where `zoom` and `feature-state` may appear, whether feature data
 * is allowed) aren't checked.
 *
 * @example validate(["+", ["get", "a"], "x"]) // { valid: false, errors: ["[2]: Expected number but found string instead."] }
 * @example validate(get("weight"), { property: "heatmap-intensity" }) // { valid: false, errors: ["heatmap-intensity: data expressions not supported"] }
 */
export function validate(expression: Input<unknown>, options: ValidateOptions = {}): ValidationResult {
  if (options.property !== undefined)
    return validateAsProperty(expression, options.property)
  if (options.type !== undefined) {
    const result = createPropertyExpression(expression, "expression", propertySpec(options.type))
    return result.result === "success" ? { valid: true, errors: [] } : { valid: false, errors: result.value.map(formatError) }
  }
  const parsed = parse(expression, undefined)
  return parsed.ok ? { valid: true, errors: [] } : { valid: false, errors: parsed.errors }
}

/**
 * Evaluates an expression with MapLibre's expression engine.
 *
 * Unlike MapLibre at render time, which logs a warning and falls back to the
 * property's default, this throws an {@link ExpressionError} if the
 * expression is invalid or fails at runtime, e.g. a type assertion on a
 * missing property.
 *
 * @example
 * evaluate(get("name"), { properties: { name: "Oslo" } }) // "Oslo"
 * evaluate(interpolate(linear(), zoom(), [[0, "#000"], [10, "#fff"]]), { zoom: 5 }) // "rgba(128,128,128,1)"
 * evaluate(eq(geometryType(), "Polygon"), { geometry: { type: "MultiPolygon", coordinates: [] } }) // true
 */
export function evaluate<T>(expression: ExprLike<T>, options?: EvaluateOptions): Evaluated<T>
export function evaluate<T extends string | number | boolean | null>(value: T, options?: EvaluateOptions): T
export function evaluate<T>(expression: Input<T>, options?: EvaluateOptions): Evaluated<T>
export function evaluate(expression: unknown, options: EvaluateOptions = {}): unknown {
  return evaluateParsed(parseOrThrow(expression, options.type), options)
}

function parseOrThrow(expression: unknown, type: ExpectedType | undefined): StyleExpression {
  const parsed = parse(expression, type)
  if (!parsed.ok)
    throw new ExpressionError("Invalid expression", parsed.errors)
  return parsed.expression
}

function evaluateParsed(expression: StyleExpression, options: EvaluateOptions): unknown {
  const globals = {
    zoom: options.zoom ?? 0,
    heatmapDensity: options.heatmapDensity,
    lineProgress: options.lineProgress,
    elevation: options.elevation,
    accumulated: options.accumulated,
    globalState: options.globalState,
  } as GlobalProperties
  const geometry = options.geometry ?? { type: "Point", coordinates: [0, 0] }
  const feature: Feature = {
    type: GEOMETRY_TYPES[geometry.type] as 1 | 2 | 3,
    properties: options.properties ?? {},
    geometry: toTileGeometry(geometry),
    ...(options.id !== undefined && { id: options.id }),
  }

  let value: unknown
  try {
    value = expression.evaluateWithoutErrorHandling(globals, feature, options.featureState ?? {}, CANONICAL, options.availableImages ?? [])
  }
  catch (error) {
    throw new ExpressionError("Expression failed to evaluate", [error instanceof Error ? error.message : String(error)])
  }
  return toPlain(value)
}

type Parsed = { ok: true, expression: StyleExpression } | { ok: false, errors: string[] }

function parse(expression: unknown, type: ExpectedType | undefined): Parsed {
  const result = createExpression(expression, "expression", type && propertySpec(type))
  if (result.result === "success")
    return { ok: true, expression: result.value }
  if (type === undefined) {
    for (const fallback of ["color", "projectionDefinition", "colorArray"] as const) {
      const retried = createExpression(expression, "expression", propertySpec(fallback))
      if (retried.result === "success")
        return { ok: true, expression: retried.value }
    }
  }
  return { ok: false, errors: result.value.map(formatError) }
}

function validateAsProperty(expression: unknown, property: StylePropertyName | "filter"): ValidationResult {
  let layer: Record<string, unknown>
  if (property === "filter") {
    layer = { id: "layer", type: "circle", source: "source", filter: expression }
  }
  else {
    const group = Object.keys(latest).find(key => /^(?:paint|layout)_/.test(key) && property in (latest as unknown as Record<string, object>)[key]!)
    if (group === undefined)
      throw new TypeError(`validate: unknown style property ${JSON.stringify(property)}`)
    const [kind, type] = group.split(/_(.*)/) as [string, string]
    layer = { id: "layer", type, ...(type !== "background" && { source: "source" }), [kind]: { [property]: expression } }
  }
  const style = { version: 8, sources: { source: sourceFor(layer.type as string) }, layers: [layer] } as unknown as StyleSpecification
  const errors = validateStyleMin(style).map(error => error.message.replace(/^layers\[0\](?:\.(?:paint|layout)\.|: )?/, ""))
  return errors.length === 0 ? { valid: true, errors: [] } : { valid: false, errors }
}

function sourceFor(layerType: string): object {
  const tiles = ["https://example.com/{z}/{x}/{y}.png"]
  if (layerType === "raster")
    return { type: "raster", tiles }
  if (layerType === "hillshade" || layerType === "color-relief")
    return { type: "raster-dem", tiles }
  // lineMetrics is required by line-gradient
  return { type: "geojson", data: { type: "FeatureCollection", features: [] }, lineMetrics: true }
}

function formatError(error: { key: string, message: string }): string {
  return `${error.key ? `${error.key}: ` : ""}${error.message}`
}

function propertySpec(type: ExpectedType): StylePropertySpecification {
  return {
    "type": type,
    "property-type": "data-driven",
    "expression": { interpolated: true, parameters: ["zoom", "feature", "feature-state"] },
    ...(type === "array" && { value: "number" }),
  } as StylePropertySpecification
}

function toPlain(value: unknown): unknown {
  if (value instanceof Color)
    return value.toString()
  if (value instanceof ResolvedImage)
    return value.name
  if (value instanceof Padding || value instanceof NumberArray)
    return value.values
  if (value instanceof ColorArray)
    return value.values.map(color => color.toString())
  if (value instanceof ProjectionDefinition)
    return { from: value.from, to: value.to, transition: value.transition }
  if (value instanceof Formatted) {
    return value.sections.map(section => ({
      text: section.text,
      image: section.image?.name ?? null,
      scale: section.scale,
      fontStack: section.fontStack,
      textColor: section.textColor?.toString() ?? null,
      verticalAlign: section.verticalAlign,
    }))
  }
  if (Array.isArray(value))
    return value.map(toPlain)
  return value
}

function project([lng = 0, lat = 0]: Position): { x: number, y: number } {
  const x = (180 + lng) / 360
  const y = (180 - (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))) / 360
  return { x: x * WORLD_SIZE, y: y * WORLD_SIZE }
}

function toTileGeometry(geometry: Geometry): { x: number, y: number }[][] {
  switch (geometry.type) {
    case "GeometryCollection": throw new TypeError("evaluate: GeometryCollection features aren't supported by MapLibre expressions")
    case "Point": return [[project(geometry.coordinates)]]
    case "MultiPoint": return geometry.coordinates.map(p => [project(p)])
    case "LineString": return [geometry.coordinates.map(project)]
    case "MultiLineString": return geometry.coordinates.map(line => line.map(project))
    case "Polygon": return geometry.coordinates.map(ring => ring.map(project))
    case "MultiPolygon": return geometry.coordinates.flatMap(polygon => polygon.map(ring => ring.map(project)))
  }
}

/** Options of {@link checkEquivalent} and {@link assertEquivalent}. */
export interface EquivalenceOptions {
  /** How many random cases to try. Default `500`. */
  samples?: number
  /** Seed for the case generator, so a failure reproduces. Default `1`. */
  seed?: number
  /**
   * Values to try for every property and state, in addition to the literals
   * found in the two expressions (and numbers just either side of them).
   */
  values?: readonly unknown[]
  /** Zoom levels to try. Default: 0, 24, and every number in the expressions (and just either side) within that range. */
  zooms?: readonly number[]
  /** Geometries to try. Default: a point. */
  geometries?: readonly Geometry[]
  /** Parse both expressions as this type, as in {@link evaluate}. */
  type?: ExpectedType
}

/** One evaluation case, as passed to {@link evaluate}. */
export type EquivalenceCase = Pick<EvaluateOptions, "properties" | "featureState" | "globalState" | "zoom" | "geometry">

/** Result of {@link checkEquivalent}. */
export type EquivalenceResult
  = | { equivalent: true, cases: number }
    | { equivalent: false, cases: number, counterexample: EquivalenceCase, a: unknown, b: unknown }

/**
 * Checks that two expressions behave the same, by evaluating both on many
 * generated cases: every property, feature-state and global-state name they
 * read is set to one of the literals they compare against, a number just
 * either side of one, a few generic edge values (`-1`, `0.5`, `1234.5`, `""`,
 * booleans), or left missing. Useful when refactoring or
 * migrating a style: the JSON can change while the behavior stays the same.
 *
 * Errors, `null` and `NaN` count as the same outcome, since MapLibre falls
 * back to the property's default for all three. Throws an
 * {@link ExpressionError} if either expression is invalid.
 *
 * @example checkEquivalent(gt(get("n"), 5), not(lte(get("n"), 5))) // { equivalent: true, cases: 500 }
 */
export function checkEquivalent(a: Input<unknown>, b: Input<unknown>, options: EquivalenceOptions = {}): EquivalenceResult {
  const { samples = 500, seed = 1, type } = options
  const parsedA = parseOrThrow(a, type)
  const parsedB = parseOrThrow(b, type)
  const found = { properties: new Set<string>(), featureState: new Set<string>(), globalState: new Set<string>(), strings: new Set<string>(), numbers: new Set<number>() }
  collect(a, found)
  collect(b, found)

  const near = [...found.numbers].flatMap(n => [n, n - 1, n + 1, n - 0.001, n + 0.001])
  // Generic edge values too: negative, fractional and large numbers, and the empty string.
  const values = [...new Set<unknown>([...found.strings, ...near, true, false, 0, 1, -1, 0.5, 1234.5, "", ...(options.values ?? [])])]
  const zooms = options.zooms ?? [...new Set([0, 24, ...near.filter(n => n >= 0 && n <= 24)])]
  const geometries = options.geometries ?? [{ type: "Point", coordinates: [0, 0] } as Geometry]
  const random = mulberry32(seed)
  const pick = <T>(list: readonly T[]): T => list[Math.floor(random() * list.length)]!
  const fill = (names: Set<string>): Record<string, unknown> => {
    const object: Record<string, unknown> = {}
    for (const name of names) {
      // About one in five is left missing.
      if (random() >= 0.2)
        object[name] = pick(values)
    }
    return object
  }

  for (let i = 0; i < samples; i++) {
    const testCase: EquivalenceCase = i === 0
      ? { properties: {}, featureState: {}, globalState: {}, zoom: pick(zooms), geometry: geometries[0]! }
      : { properties: fill(found.properties), featureState: fill(found.featureState), globalState: fill(found.globalState), zoom: pick(zooms), geometry: pick(geometries) }
    const resultA = outcome(parsedA, testCase)
    const resultB = outcome(parsedB, testCase)
    if (JSON.stringify(resultA) !== JSON.stringify(resultB))
      return { equivalent: false, cases: i + 1, counterexample: testCase, a: resultA, b: resultB }
  }
  return { equivalent: true, cases: samples }
}

/**
 * Throws if two expressions behave differently on any generated case; see
 * {@link checkEquivalent}. Works with any test runner.
 *
 * @example assertEquivalent(eq(get("kind"), "park"), isOneOf(get("kind"), ["park"]), { samples: 2000 })
 */
export function assertEquivalent(a: Input<unknown>, b: Input<unknown>, options?: EquivalenceOptions): void {
  const result = checkEquivalent(a, b, options)
  if (!result.equivalent) {
    throw new Error(
      `Expressions differ after ${result.cases} case(s).\n`
      + `  case:   ${JSON.stringify(result.counterexample)}\n`
      + `  first:  ${JSON.stringify(result.a)}\n`
      + `  second: ${JSON.stringify(result.b)}`,
    )
  }
}

/** What MapLibre would make of an evaluation: a value, or "the property's default". */
function outcome(expression: StyleExpression, options: EvaluateOptions): unknown {
  try {
    const value = evaluateParsed(expression, options)
    return value === null || (typeof value === "number" && Number.isNaN(value)) ? "(default)" : value
  }
  catch {
    return "(default)"
  }
}

interface Found {
  properties: Set<string>
  featureState: Set<string>
  globalState: Set<string>
  strings: Set<string>
  numbers: Set<number>
}

function collect(value: unknown, found: Found): void {
  if (Array.isArray(value)) {
    const [head, name] = value
    if (typeof name === "string") {
      if ((head === "get" || head === "has") && value.length === 2)
        found.properties.add(name)
      else if (head === "feature-state")
        found.featureState.add(name)
      else if (head === "global-state")
        found.globalState.add(name)
    }
    value.forEach((item, i) => {
      if (i > 0 || typeof item !== "string")
        collect(item, found)
    })
  }
  else if (typeof value === "string") {
    found.strings.add(value)
  }
  else if (typeof value === "number" && Number.isFinite(value)) {
    found.numbers.add(value)
  }
  else if (value !== null && typeof value === "object") {
    for (const item of Object.values(value)) collect(item, found)
  }
}

/** A small seeded PRNG, so generated cases are reproducible. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6D2B79F5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
