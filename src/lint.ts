import type { StylePropertySpecification, StyleSpecification } from "@maplibre/maplibre-gl-style-spec"

import { Color, createExpression, expression as expressionApi, validateStyleMin } from "@maplibre/maplibre-gl-style-spec"

import { legacyComparisonFix } from "./internal"

/** Which check found a {@link LintIssue}. */
export type LintRule
  /** MapLibre's style validator, the same one maplibre-gl runs when it loads a style. */
  = | "spec"
  /** An expression filter that isn't a boolean, which maplibre-gl throws for and the validator misses. */
    | "filter-type"
  /** A comparison of two literals outside a filter, which is constant. */
    | "constant-comparison"
  /** A color ramp that fades to transparent black instead of the same color at alpha 0. */
    | "transparent-fade"

/** A problem found by {@link lintStyle}. */
export interface LintIssue {
  rule: LintRule
  /** Id of the layer the problem is in; absent for problems outside layers (sources, the root). */
  layer?: string
  /** The paint or layout property, `"filter"`, or another layer key such as `"source"`. Absent for problems with the layer as a whole. */
  property?: string
  /** What's wrong, prefixed with the path into the value when there is one, like `"[2]: Expected number..."`. */
  message: string
}

/**
 * Checks a whole style: runs MapLibre's style validator (the one maplibre-gl
 * runs when it loads a style), plus checks for mistakes it lets through:
 *
 * - `"filter-type"`: an expression filter that isn't a boolean, like
 *   `["get", "visible"]` is fine but `["+", 1, 2]` passes the validator and
 *   then makes maplibre-gl throw.
 * - `"constant-comparison"`: `["==", "class", "park"]` in a paint or layout
 *   property compares two strings, so it's always `false`. (In a filter it's
 *   valid legacy syntax.)
 * - `"transparent-fade"`: a color ramp from `"#fff"` to `"transparent"` is
 *   grey halfway, because `"transparent"` is transparent black and MapLibre
 *   blends the color channels too. Fade to `"rgba(255,255,255,0)"` instead.
 *   Colored transparent stops (`"rgba(33,102,172,0)"`) aren't reported.
 *
 * Returns the problems in layer order, or `[]` for a clean style.
 *
 * @example
 * // In a test: expect(lintStyle(style)).toEqual([])
 * lintStyle({ version: 8, sources: {}, layers: [{ id: "bg", type: "background", paint: { "background-color": ["case", ["==", "dark", "on"], "#000", "#fff"] } }] })
 * // [{ rule: "constant-comparison", layer: "bg", property: "background-color", message: '[1]: ["==","dark","on"] compares two literals, so it's constant. ...' }]
 */
export function lintStyle(style: object): LintIssue[] {
  const layers: unknown[] = Array.isArray((style as { layers?: unknown }).layers) ? (style as { layers: unknown[] }).layers : []
  const issues: { index: number, issue: LintIssue }[] = []
  const add = (index: number, rule: LintRule, property: string | undefined, message: string): void => {
    const id = (layers[index] as { id?: unknown } | undefined)?.id
    issues.push({ index, issue: { rule, ...(typeof id === "string" && { layer: id }), ...(property !== undefined && { property }), message } })
  }

  // The validator crashes on a layer that isn't an object, so report those here and validate the rest
  const objects = layers.map((layer, index) => ({ layer, index })).filter(({ layer }) => typeof layer === "object" && layer !== null && !Array.isArray(layer))
  layers.forEach((layer, index) => {
    if (!objects.some(entry => entry.index === index))
      add(index, "spec", undefined, `layer must be an object, got ${layer === null ? "null" : Array.isArray(layer) ? "an array" : typeof layer}`)
  })
  const validated = objects.length === layers.length ? style : { ...style, layers: objects.map(({ layer }) => layer) }

  const invalidFilters = new Set<number>()
  for (const { message } of validateStyleMin(validated as StyleSpecification)) {
    const match = /^layers\[(\d+)\](?:\.(?:paint|layout))?(?:\.([\w-]+))?((?:[.[][^:]*)?): ([\s\S]*)$/.exec(message)
    if (match === null) {
      issues.push({ index: -1, issue: { rule: "spec", message } })
      continue
    }
    const [, position, property, path, text] = match as unknown as [string, string, string | undefined, string, string]
    const index = objects[Number(position)]!.index
    if (property === "filter")
      invalidFilters.add(index)
    add(index, "spec", property, path ? `${path}: ${text}` : text)
  }

  layers.forEach((layer, index) => {
    if (typeof layer !== "object" || layer === null)
      return
    const { filter, paint, layout } = layer as { filter?: unknown, paint?: unknown, layout?: unknown }
    if (filter !== undefined && !invalidFilters.has(index)) {
      for (const message of filterTypeErrors(filter))
        add(index, "filter-type", "filter", message)
    }
    for (const group of [paint, layout]) {
      if (typeof group !== "object" || group === null)
        continue
      for (const [property, value] of Object.entries(group)) {
        for (const message of constantComparisons(value, ""))
          add(index, "constant-comparison", property, message)
        for (const message of transparentFades(value))
          add(index, "transparent-fade", property, message)
      }
    }
  })

  return issues.sort((a, b) => a.index - b.index).map(({ issue }) => issue)
}

// The spec maplibre-gl compiles layer filters with (`featureFilter`).
const FILTER_SPEC = {
  "type": "boolean",
  "default": false,
  "transition": false,
  "property-type": "data-driven",
  "expression": { interpolated: false, parameters: ["zoom", "feature"] },
} as StylePropertySpecification

/**
 * MapLibre's style validator doesn't check that an expression filter is a
 * boolean (it passes `{ value: "boolean" }` where it means `{ type: ... }`),
 * but maplibre-gl does when it creates the layer, and throws. Compile the
 * filter the way maplibre-gl does to catch that. Legacy filters are fully
 * checked by the validator. Messages are prefixed with the path into the
 * filter, like `"[1]: ..."`, or have no prefix for the filter as a whole.
 */
export function filterTypeErrors(filter: unknown): string[] {
  if (!expressionApi.isExpressionFilter(filter))
    return []
  const result = createExpression(filter, "filter", FILTER_SPEC)
  return result.result === "success" ? [] : result.value.map(error => error.key ? `${error.key}: ${error.message}` : error.message)
}

const COMPARISONS = new Set(["==", "!=", "<", "<=", ">", ">=", "in"])

/** Comparisons of two literals in an expression, like `["==", "class", "park"]`, with their paths. */
function constantComparisons(value: unknown, path: string): string[] {
  if (!Array.isArray(value) || typeof value[0] !== "string" || value[0] === "literal")
    return []
  const [name, a, b] = value as [string, unknown, unknown]
  const found: string[] = []
  if (COMPARISONS.has(name) && value.length <= 4 && typeof a === "string" && !Array.isArray(b))
    found.push(`${path ? `${path}: ` : ""}${JSON.stringify(value)} compares two literals, so it's constant. ${legacyComparisonFix(a)}`)
  value.forEach((argument, i) => {
    // `match` labels are literals, not expressions
    const isLabel = name === "match" && i >= 2 && i < value.length - 1 && i % 2 === 0
    if (i > 0 && !isLabel)
      found.push(...constantComparisons(argument, `${path}[${i}]`))
  })
  return found
}

/** Ramps that interpolate between a color and transparent black. */
function transparentFades(value: unknown): string[] {
  const ramps: { path: string, outputs: unknown[] }[] = []
  // Legacy function: { stops: [[input, output], ...] }, interpolated unless "interval" or "categorical"
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const { stops, type } = value as { stops?: unknown, type?: unknown }
    if (Array.isArray(stops) && type !== "interval" && type !== "categorical")
      ramps.push({ path: ".stops", outputs: stops.map(stop => (Array.isArray(stop) ? stop[1] : undefined)) })
  }
  const visit = (node: unknown, path: string): void => {
    if (!Array.isArray(node) || typeof node[0] !== "string" || node[0] === "literal")
      return
    if (node[0] === "interpolate")
      ramps.push({ path, outputs: node.slice(3).filter((_, i) => i % 2 === 1) })
    node.forEach((argument, i) => i > 0 && visit(argument, `${path}[${i}]`))
  }
  visit(value, "")

  const found: string[] = []
  for (const { path, outputs } of ramps) {
    const colors = outputs.map(output => (typeof output === "string" ? Color.parse(output) : undefined))
    colors.forEach((color, i) => {
      // Only transparent *black* ("transparent", rgba(0,0,0,0)) is a mistake; a colored transparent stop,
      // like a heatmap starting at rgba(33,102,172,0), blends hues on purpose
      if (color === undefined || color.a !== 0 || color.rgb.slice(0, 3).some(channel => channel > 0))
        return
      const neighbor = [i - 1, i + 1].find(j => colors[j] !== undefined && colors[j]!.a > 0 && !sameRgb(colors[j]!, color))
      if (neighbor === undefined)
        return
      const [r, g, b] = colors[neighbor]!.rgb.map(channel => Math.round(channel * 255))
      const fix = `rgba(${r},${g},${b},0)`
      const where = path.startsWith(".") ? `${path}[${i}][1]` : `${path}[${4 + 2 * i}]`
      found.push(`${where}: fades ${JSON.stringify(outputs[neighbor])} to ${JSON.stringify(outputs[i])}, which is transparent black, so the color darkens on the way. Fade to ${JSON.stringify(fix)} instead.`)
    })
  }
  return found
}

function sameRgb(a: Color, b: Color): boolean {
  return a.rgb.slice(0, 3).every((channel, i) => Math.abs(channel - b.rgb[i]!) < 1 / 255)
}
