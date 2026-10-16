import type { FeatureCollection, Point } from "geojson"

import type { Quake } from "../src/sources"

import { readFileSync } from "node:fs"

import { evaluate } from "@builtbyfield/maplibre-expr/testing"
import { describe, expect, it } from "vitest"

import { depthColor, happenedBy, radius, recency } from "../src/layers/quakes"
import { LIGHT } from "../src/palette"

const quakes = JSON.parse(readFileSync(new URL("../public/quakes.geojson", import.meta.url), "utf8")) as FeatureCollection<Point, Quake>
const DAY = 24 * 60 * 60 * 1000

describe("time filter", () => {
  it("shows exactly the quakes that happened by `now`, across the whole dataset", () => {
    const now = quakes.features[Math.floor(quakes.features.length / 2)]!.properties.time
    const shown = quakes.features.filter(f => evaluate(happenedBy(now), { properties: f.properties, geometry: f.geometry }))
    expect(shown.length).toBe(quakes.features.filter(f => f.properties.time <= now).length)
    expect(shown.length).toBeGreaterThan(0)
  })

  it("includes a quake at the exact moment it happens", () => {
    expect(evaluate(happenedBy(1000), { properties: { time: 1000 } })).toBe(true)
    expect(evaluate(happenedBy(999), { properties: { time: 1000 } })).toBe(false)
  })
})

describe("recency", () => {
  const at = (ageInDays: number): number => evaluate(recency(10 * DAY), { properties: { time: 10 * DAY - ageInDays * DAY } })

  it("fades from opaque to faint over a week, then stays faint", () => {
    expect(at(0)).toBe(1)
    expect(at(3.5)).toBeCloseTo(0.625)
    expect(at(7)).toBe(0.25)
    expect(at(30)).toBe(0.25)
  })
})

describe("radius", () => {
  const size = (mag: number | undefined, zoom = 1): number => evaluate(radius(), { properties: mag === undefined ? {} : { mag }, zoom })

  it("grows with magnitude, faster for big quakes", () => {
    expect(size(2.5)).toBe(2)
    expect(size(5)).toBeGreaterThan(size(4))
    expect(size(7) - size(6)).toBeGreaterThan(size(4) - size(3))
  })

  it("scales up when zoomed in", () => {
    expect(size(6, 8)).toBeCloseTo(size(6, 1) * 2.5)
  })

  it("draws a quake without a magnitude at the smallest size instead of failing", () => {
    expect(size(undefined)).toBe(2)
  })
})

describe("depth color", () => {
  it("runs from the shallow color to the deep color", () => {
    expect(evaluate(depthColor(LIGHT), { properties: { depth: 0 } })).toBe("rgba(255,183,3,1)")
    expect(evaluate(depthColor(LIGHT), { properties: { depth: 600 } })).toBe("rgba(106,4,15,1)")
  })
})
