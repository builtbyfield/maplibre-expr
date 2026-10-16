import type { StyleSpecification } from "maplibre-gl"

import type { Palette } from "./palette"

import { byZoom, linear } from "@builtbyfield/maplibre-expr"

import { basemapLayers } from "./layers/basemap"
import { quakeLayers } from "./layers/quakes"
import { GLYPHS, sources } from "./sources"

/** The whole style, built from a palette. `now` is the initial moment shown. */
export function buildStyle(palette: Palette, quakesUrl: string, now: number): StyleSpecification {
  return {
    version: 8,
    glyphs: GLYPHS,
    sources: sources(quakesUrl),
    // Declares the global state the quake layer reads, with a default.
    state: { now: { default: now } },
    // A globe when zoomed out, flattening to a regular map from zoom 6.
    projection: { type: byZoom([[4, "vertical-perspective"], [6, "mercator"]], linear()) },
    layers: [...basemapLayers(palette), ...quakeLayers(palette)],
  }
}
