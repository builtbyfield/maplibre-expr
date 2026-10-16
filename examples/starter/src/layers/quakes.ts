import type { Color, Expr, NumberInput } from "@builtbyfield/maplibre-expr"
import type { LayerSpecification } from "maplibre-gl"

import type { Palette } from "../palette"

import {
  divide,
  exponential,
  ifFeatureState,
  interpolate,
  interpolateHcl,
  linear,
  lte,
  multiply,
  subtract,
  typedGlobalState,
  zoom,
} from "@builtbyfield/maplibre-expr"

import { quake, QUAKES } from "../sources"

/** The app's global state: the moment the map is showing. Set it with `syncGlobalState`. */
export const app = typedGlobalState<{ now: number }>()

const DAY = 24 * 60 * 60 * 1000

// Each piece takes `now` as a parameter: the layer passes the global state,
// tests pass a fixed timestamp.

/** Quakes that have happened by `now`. */
export function happenedBy(now: NumberInput): Expr<boolean> {
  return lte(quake.get("time"), now)
}

/** Fully opaque when a quake happens, fading to faint over a week. */
export function recency(now: NumberInput): Expr<number> {
  const ageInDays = divide(subtract(now, quake.get("time")), DAY)
  return interpolate(linear(), ageInDays, [[0, 1], [7, 0.25]])
}

/**
 * Circle radius in pixels. A quake's energy grows about 32x per magnitude
 * step, so the radius grows exponentially too; zooming in scales it up.
 */
export function radius(): Expr<number> {
  const byMagnitude = interpolate(exponential(1.8), quake.getOr("mag", 0), [[2.5, 2], [5, 6], [7, 18], [8, 28]])
  return interpolate(linear(), zoom(), [[1, byMagnitude], [8, multiply(byMagnitude, 2.5)]])
}

/** Shallow quakes (usually the damaging ones) are bright; deep ones darker. */
export function depthColor(palette: Palette): Expr<Color> {
  return interpolateHcl(linear(), quake.getOr("depth", 0), [[0, palette.quakeShallow], [70, palette.quakeMid], [300, palette.quakeDeep]])
}

export function quakeLayers(palette: Palette): LayerSpecification[] {
  const now = app.get("now")
  return [
    {
      id: "quakes",
      type: "circle",
      source: QUAKES,
      filter: happenedBy(now),
      // Draw big quakes on top of small ones.
      layout: { "circle-sort-key": quake.getOr("mag", 0) },
      paint: {
        "circle-radius": radius(),
        "circle-color": depthColor(palette),
        "circle-opacity": recency(now),
        "circle-stroke-color": palette.quakeOutline,
        "circle-stroke-width": ifFeatureState("hover", 2, 0.5),
        "circle-stroke-opacity": recency(now),
      },
    },
  ]
}
