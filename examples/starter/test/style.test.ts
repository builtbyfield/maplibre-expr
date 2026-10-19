import type { StylePropertyName } from "@builtbyfield/maplibre-expr/testing"
import type { LayerSpecification } from "maplibre-gl"

import { lintStyle, validate } from "@builtbyfield/maplibre-expr/testing"
import { describe, expect, it } from "vitest"

import { DARK, LIGHT } from "../src/palette"
import { buildStyle } from "../src/style"

/** Every expression in a layer, with the property it's used in. */
function expressions(layer: LayerSpecification): [StylePropertyName | "filter", unknown][] {
  const entries: [string, unknown][] = [
    ...Object.entries("layout" in layer ? layer.layout ?? {} : {}),
    ...Object.entries("paint" in layer ? layer.paint ?? {} : {}),
    ...("filter" in layer && layer.filter ? [["filter", layer.filter] as [string, unknown]] : []),
  ]
  return entries.filter(([, value]) => Array.isArray(value) && typeof value[0] === "string") as [StylePropertyName | "filter", unknown][]
}

describe.each([["light", LIGHT], ["dark", DARK]] as const)("%s style", (_, palette) => {
  const style = buildStyle(palette, "quakes.geojson", 0)

  it("passes lintStyle: MapLibre's style validator plus the checks it misses", () => {
    expect(lintStyle(style)).toEqual([])
  })

  it.each(style.layers.flatMap(layer => expressions(layer).map(([property, value]) => [`${layer.id} ${property}`, property, value] as const)))(
    "%s is valid where it's used",
    (_, property, value) => {
      expect(validate(value, { property })).toEqual({ valid: true, errors: [] })
    },
  )
})
