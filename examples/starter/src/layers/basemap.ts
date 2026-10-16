import type { Expr, NumberInput, Stops } from "@builtbyfield/maplibre-expr"
import type { LayerSpecification } from "maplibre-gl"

import type { Palette } from "../palette"

import { all, byZoom, coalesce, eq, exponential, isOneOf, neq, step } from "@builtbyfield/maplibre-expr"

import { boundary, building, FONT, landcover, OPENMAPTILES, place, transportation, water } from "../sources"

/** Line width that grows with zoom: slowly when zoomed out, quickly when close. */
export function widthRamp(stops: Stops<NumberInput>): Expr<number> {
  return byZoom(stops, exponential(1.4))
}

const notTunnel = neq(transportation.get("brunnel"), "tunnel")

/** Roads drawn as two groups: everyday streets, and motorways/trunks on top. */
export const MINOR_ROADS = ["primary", "secondary", "tertiary", "minor", "service"] as const
export const MAJOR_ROADS = ["motorway", "trunk"] as const

export function basemapLayers(palette: Palette): LayerSpecification[] {
  return [
    { id: "land", type: "background", paint: { "background-color": palette.land } },
    {
      "id": "landcover",
      "type": "fill",
      "source": OPENMAPTILES,
      "source-layer": "landcover",
      "filter": isOneOf(landcover.get("class"), ["wood", "grass", "wetland"]),
      "paint": { "fill-color": palette.landcover, "fill-opacity": byZoom([[4, 0.4], [12, 0.8]]) },
    },
    {
      "id": "water",
      "type": "fill",
      "source": OPENMAPTILES,
      "source-layer": "water",
      "filter": neq(water.get("class"), "swimming_pool"),
      "paint": { "fill-color": palette.water },
    },
    {
      "id": "boundaries",
      "type": "line",
      "source": OPENMAPTILES,
      "source-layer": "boundary",
      // Country borders on land only: admin level 2, not at sea.
      "filter": all(eq(boundary.get("admin_level"), 2), eq(boundary.get("maritime"), 0)),
      "paint": {
        "line-color": palette.boundary,
        "line-width": widthRamp([[2, 0.6], [10, 2]]),
        "line-dasharray": [3, 2],
      },
    },
    {
      "id": "roads-minor",
      "type": "line",
      "source": OPENMAPTILES,
      "source-layer": "transportation",
      "minzoom": 10,
      "filter": all(isOneOf(transportation.get("class"), MINOR_ROADS), notTunnel),
      "layout": { "line-cap": "round", "line-join": "round" },
      "paint": { "line-color": palette.road, "line-width": widthRamp([[10, 0.3], [14, 2], [18, 12]]) },
    },
    {
      "id": "roads-major",
      "type": "line",
      "source": OPENMAPTILES,
      "source-layer": "transportation",
      "minzoom": 5,
      "filter": all(isOneOf(transportation.get("class"), MAJOR_ROADS), notTunnel),
      "layout": { "line-cap": "round", "line-join": "round" },
      "paint": { "line-color": palette.motorway, "line-width": widthRamp([[5, 0.4], [10, 1.5], [18, 18]]) },
    },
    {
      "id": "buildings",
      "type": "fill",
      "source": OPENMAPTILES,
      "source-layer": "building",
      "minzoom": 14,
      "paint": {
        "fill-color": palette.building,
        // Taller buildings a little more opaque, so dense downtowns read as such.
        "fill-opacity": step(coalesce(building.get("render_height"), 0), 0.6, [[20, 0.75], [60, 0.9]]),
      },
    },
    {
      "id": "place-labels",
      "type": "symbol",
      "source": OPENMAPTILES,
      "source-layer": "place",
      // Countries and the bigger settlements; rank 1 is the most important.
      "filter": isOneOf(place.get("class"), ["country", "city", "town"]),
      "layout": {
        "text-field": coalesce(place.get("name_en"), place.get("name")),
        "text-font": FONT,
        "text-size": step(place.getOr("rank", 10), 15, [[3, 13], [6, 11]]),
        "symbol-sort-key": place.getOr("rank", 99),
      },
      "paint": { "text-color": palette.label, "text-halo-color": palette.labelHalo, "text-halo-width": 1.2 },
    },
  ]
}
