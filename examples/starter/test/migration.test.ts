import type { LayerSpecification } from "maplibre-gl"

import { assertEquivalent, checkEquivalent } from "@builtbyfield/maplibre-expr/testing"
import { describe, expect, it } from "vitest"

import { basemapLayers } from "../src/layers/basemap"
import { LIGHT } from "../src/palette"

/**
 * Migrating an existing style: these are hand-written JSON expressions in the
 * style of a typical OpenMapTiles style, the "before". The test proves the
 * typed rewrite in `src/layers/basemap.ts` behaves the same, even where the
 * JSON is shaped differently.
 */
const legacy = {
  "roads-major": {
    filter: ["all", ["in", ["get", "class"], ["literal", ["motorway", "trunk"]]], ["!=", ["get", "brunnel"], "tunnel"]],
    width: ["interpolate", ["exponential", 1.4], ["zoom"], 5, 0.4, 10, 1.5, 18, 18],
  },
  "roads-minor": {
    filter: [
      "all",
      ["match", ["get", "class"], ["primary", "secondary", "tertiary", "minor", "service"], true, false],
      ["!", ["==", ["get", "brunnel"], "tunnel"]],
    ],
  },
  "place-labels": {
    textField: ["case", ["has", "name_en"], ["get", "name_en"], ["get", "name"]],
    textSize: ["case", [">=", ["get", "rank"], 6], 11, [">=", ["get", "rank"], 3], 13, 15],
  },
} as const

/** A layer's parts, loosely typed: the test only reads expressions out of them. */
interface Parts { filter?: unknown, paint?: Record<string, unknown>, layout?: Record<string, unknown> }
const layers = new Map(basemapLayers(LIGHT).map(layer => [layer.id, layer as LayerSpecification & Parts]))
const layer = (id: string): Parts => layers.get(id)!
const paint = (id: string): Record<string, unknown> => layer(id).paint ?? {}
const layout = (id: string): Record<string, unknown> => layer(id).layout ?? {}
const filter = (id: string): unknown => layer(id).filter

describe("migration from the legacy JSON", () => {
  it("roads: same filters and widths", () => {
    assertEquivalent(legacy["roads-major"].filter, filter("roads-major"))
    assertEquivalent(legacy["roads-major"].width, paint("roads-major")["line-width"])
    assertEquivalent(legacy["roads-minor"].filter, filter("roads-minor"))
  })

  it("labels: same text", () => {
    assertEquivalent(legacy["place-labels"].textField, layout("place-labels")["text-field"])
  })

  it("labels: the rewrite deliberately handles a missing or non-numeric rank, where the legacy expression failed", () => {
    // checkEquivalent finds where the two differ: a place whose rank is missing
    // or isn't a number. The legacy \`>=\` fails there, so MapLibre fell back to
    // the default text size; the rewrite reads getOr("rank", 10), so such a
    // place is sized like a minor one (11).
    const result = checkEquivalent(legacy["place-labels"].textSize, layout("place-labels")["text-size"])
    expect(result.equivalent).toBe(false)
    if (!result.equivalent) {
      expect(typeof (result.counterexample.properties as { rank?: unknown }).rank).not.toBe("number")
      expect([result.a, result.b]).toEqual(["(default)", 11])
    }
  })
})
