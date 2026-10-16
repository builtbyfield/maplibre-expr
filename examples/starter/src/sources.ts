import type { SourceSpecification } from "maplibre-gl"

import { typedProperties } from "@builtbyfield/maplibre-expr"

/**
 * Typed property accessors for every tile layer the style reads, so a
 * misspelled property name or value is a compile error instead of a layer that
 * silently draws nothing. Only the fields the style uses are declared.
 *
 * The basemap tiles follow the OpenMapTiles schema, served by OpenFreeMap.
 */

export type RoadClass
  = | "motorway" | "trunk" | "primary" | "secondary" | "tertiary" | "minor" | "service" | "track"
    | "path" | "raceway" | "busway" | "bus_guideway" | "ferry" | "rail" | "transit" | "pier" | "bridge"
    | `${string}_construction`

export type PlaceClass
  = | "continent" | "country" | "state" | "province" | "city" | "town" | "village" | "hamlet"
    | "suburb" | "quarter" | "neighbourhood" | "isolated_dwelling" | "island" | "borough"

export const water = typedProperties<{ class: "ocean" | "lake" | "river" | "pond" | "dock" | "swimming_pool" }>()
export const landcover = typedProperties<{ class: "farmland" | "ice" | "wood" | "rock" | "grass" | "wetland" | "sand" }>()
export const boundary = typedProperties<{ admin_level: number, maritime: 0 | 1, disputed: 0 | 1 }>()
export const transportation = typedProperties<{ class: RoadClass, brunnel: "bridge" | "tunnel" | "ford" }>()
export const building = typedProperties<{ render_height: number }>()
export const place = typedProperties<{ class: PlaceClass, name: string, name_en: string, rank: number }>()

/** One earthquake, as stored in `public/quakes.geojson` (a USGS snapshot). */
export interface Quake {
  /** Magnitude. */
  mag: number
  /** Depth below the surface, in km. */
  depth: number
  /** When it happened, in ms since the epoch. */
  time: number
  /** USGS description, e.g. "12 km SW of Ojai, CA". */
  place: string
}

export const quake = typedProperties<Quake>()

export const OPENMAPTILES = "openmaptiles"
export const QUAKES = "quakes"

export function sources(quakesUrl: string): Record<string, SourceSpecification> {
  return {
    [OPENMAPTILES]: { type: "vector", url: "https://tiles.openfreemap.org/planet" },
    // generateId gives each quake an id, which feature state (hover) needs.
    [QUAKES]: { type: "geojson", data: quakesUrl, generateId: true },
  }
}

export const GLYPHS = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf"
export const FONT = ["Noto Sans Regular"]
